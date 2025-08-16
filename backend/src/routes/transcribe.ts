import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { authenticateToken } from '../middleware/auth';

const router = Router();

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
    const audioFileName = path.basename(audioFilePath);
    const containerAudioPath = `/app/audio/${audioFileName}`;

    // Docker command to run Whisper transcription
    const dockerCommand = `docker run --rm -v "${path.dirname(audioFilePath)}:/app/audio" whisper-local "${containerAudioPath}"`;

    // Execute Docker container with longer timeout for first run (model download)
    exec(dockerCommand, { timeout: 600000, maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      // Clean up uploaded file
      if (fs.existsSync(audioFilePath)) {
        fs.unlinkSync(audioFilePath);
      }

      if (error) {
        console.error('Docker execution error:', error);
        res.status(500).json({ 
          error: 'Transcription failed',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
        return;
      }

      if (stderr) {
        console.log('Docker stderr (may include model download progress):', stderr);
        
        // Check if stderr contains actual error JSON or just download progress
        const stderrLines = stderr.trim().split('\n');
        const lastLine = stderrLines[stderrLines.length - 1];
        
        if (lastLine) {
          try {
            // Try to parse the last line as JSON error
            const errorResponse = JSON.parse(lastLine);
            if (errorResponse.error && errorResponse.success === false) {
              res.status(500).json(errorResponse);
              return;
            }
          } catch (parseError) {
            // If it's not JSON, it might be progress info, continue to check stdout
            console.log('Stderr appears to be progress information, not error');
          }
        }
      }

      try {
        // Parse JSON response from Docker container
        const transcriptionResult = JSON.parse(stdout.trim());
        
        if (transcriptionResult.success) {
          res.json({
            success: true,
            transcription: transcriptionResult.transcription,
            language: transcriptionResult.language || undefined
          });
        } else {
          res.status(500).json(transcriptionResult);
        }
      } catch (parseError) {
        console.error('Failed to parse transcription result:', parseError);
        res.status(500).json({ 
          error: 'Invalid transcription response',
          details: process.env.NODE_ENV === 'development' ? stdout : undefined
        });
      }
    });

  } catch (error) {
    console.error('Transcription API error:', error);
    
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/transcribe/health - Test Docker container
router.get('/health', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    // Test Docker container with a simple command
    const testCommand = `docker run --rm whisper-local --help`;
    
    exec(testCommand, { timeout: 30000 }, (error, stdout, stderr) => {
      if (error) {
        console.error('Docker health check failed:', error);
        res.status(500).json({ 
          error: 'Docker container health check failed',
          healthy: false,
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
        return;
      }
      
      res.json({ 
        message: 'Whisper Docker container is healthy',
        healthy: true,
        container: 'whisper-local'
      });
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ error: 'Health check failed', healthy: false });
  }
});

export default router;