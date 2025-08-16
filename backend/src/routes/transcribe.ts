import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import FormData from 'form-data';
import { authenticateToken } from '../middleware/auth';

// Type definitions for Whisper service responses
interface WhisperTranscriptionResponse {
  transcription: string;
  language?: string;
  success: boolean;
  error?: string;
}

interface WhisperHealthResponse {
  status: string;
  model_loaded?: boolean;
  version?: string;
}

const router = Router();

// Whisper service configuration
const WHISPER_SERVICE_URL = process.env.WHISPER_SERVICE_URL || 'http://localhost:8000';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../../uploads');
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    if (file.mimetype.startsWith('audio/') || 
        file.originalname.match(/\.(mp3|wav|webm|m4a|ogg|flac)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Please upload a valid audio file'));
    }
  }
});

// POST /api/transcribe
router.post('/', authenticateToken, upload.single('audio'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No audio file provided' });
      return;
    }

    const audioFilePath = req.file.path;
    
    try {
      // Create FormData for multipart/form-data request
      const formData = new FormData();
      formData.append('audio', fs.createReadStream(audioFilePath), {
        filename: req.file.originalname,
        contentType: req.file.mimetype
      });

      console.log(`Sending transcription request to ${WHISPER_SERVICE_URL}/transcribe`);
      
      // Make HTTP request to Whisper microservice
      const response = await fetch(`${WHISPER_SERVICE_URL}/transcribe`, {
        method: 'POST',
        body: formData,
        // Note: Don't set Content-Type header manually, let fetch set it with boundary
      });

      const transcriptionResult = await response.json() as WhisperTranscriptionResponse;

      if (response.ok && transcriptionResult.success) {
        res.json({
          success: true,
          transcription: transcriptionResult.transcription,
          language: transcriptionResult.language || undefined
        });
      } else {
        console.error('Whisper service error:', transcriptionResult);
        res.status(response.status || 500).json({
          error: transcriptionResult.error || 'Transcription failed',
          success: false
        });
      }

    } catch (httpError) {
      console.error('HTTP request to Whisper service failed:', httpError);
      res.status(503).json({ 
        error: 'Whisper transcription service unavailable',
        details: process.env.NODE_ENV === 'development' ? (httpError as Error).message : undefined
      });
    } finally {
      // Always clean up uploaded file
      if (fs.existsSync(audioFilePath)) {
        fs.unlinkSync(audioFilePath);
      }
    }

  } catch (error) {
    console.error('Transcription API error:', error);
    
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/transcribe/health - Test Whisper microservice
router.get('/health', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    console.log(`Checking Whisper service health at ${WHISPER_SERVICE_URL}/health`);
    
    // Test Whisper microservice health
    const response = await fetch(`${WHISPER_SERVICE_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    const healthData = await response.json() as WhisperHealthResponse;

    if (response.ok && healthData.status === 'healthy') {
      res.json({ 
        message: 'Whisper transcription service is healthy',
        healthy: true,
        service: 'whisper-microservice',
        serviceUrl: WHISPER_SERVICE_URL,
        serviceData: healthData
      });
    } else {
      res.status(response.status || 500).json({ 
        error: 'Whisper service health check failed',
        healthy: false,
        serviceUrl: WHISPER_SERVICE_URL,
        details: healthData
      });
    }
  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({ 
      error: 'Whisper transcription service unavailable',
      healthy: false,
      serviceUrl: WHISPER_SERVICE_URL,
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

export default router;