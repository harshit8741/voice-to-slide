import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken } from '../middleware/auth';
import { RevAIService } from '../services/RevAIService';

const router = Router();

// Initialize Rev AI service
const revAIService = new RevAIService();

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
      // Use Rev AI service to transcribe audio via streaming
      const transcriptionResult = await revAIService.transcribeAudio(audioFilePath);

      // Return successful transcription
      res.json({
        success: true,
        transcription: transcriptionResult.transcription,
        language: transcriptionResult.language || undefined,
        filename: transcriptionResult.filename
      });

    } catch (transcriptionError) {
      console.error('Transcription error:', transcriptionError);
      res.status(500).json({
        error: 'Transcription failed',
        details: process.env.NODE_ENV === 'development' ? 
          (transcriptionError instanceof Error ? transcriptionError.message : 'Unknown error') : 
          undefined
      });
    } finally {
      // Clean up uploaded file
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

// GET /api/transcribe/health - Test Rev AI service
router.get('/health', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const healthStatus = await revAIService.checkHealth();
    
    if (healthStatus.healthy) {
      res.json({
        message: 'Rev AI service is healthy',
        healthy: true,
        service: 'rev-ai-streaming',
        details: healthStatus.details
      });
    } else {
      res.status(500).json({
        error: 'Rev AI service health check failed',
        healthy: false,
        details: process.env.NODE_ENV === 'development' ? healthStatus.details : undefined
      });
    }
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      error: 'Health check failed', 
      healthy: false,
      details: process.env.NODE_ENV === 'development' ? 
        (error instanceof Error ? error.message : 'Unknown error') : 
        undefined
    });
  }
});

export default router;