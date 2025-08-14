import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
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

// POST /api/transcription/upload
router.post('/upload', authenticateToken, upload.single('audio'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No audio file provided' });
      return;
    }

    const audioFilePath = req.file.path;
    // Use mock script if whisper is not available, otherwise use real script
    const realScriptPath = path.join(__dirname, '../../transcribe.py');
    const mockScriptPath = path.join(__dirname, '../../transcribe_mock.py');
    const pythonScriptPath = fs.existsSync(realScriptPath) ? realScriptPath : mockScriptPath;

    // Check if Python script exists
    if (!fs.existsSync(pythonScriptPath)) {
      // Clean up uploaded file
      fs.unlinkSync(audioFilePath);
      res.status(500).json({ error: 'Transcription service unavailable' });
      return;
    }

    // Call Python transcription script
    const pythonProcess = spawn('python3', [pythonScriptPath, audioFilePath]);

    let transcriptionResult = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      transcriptionResult += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      // Clean up uploaded file
      fs.unlinkSync(audioFilePath);

      if (code !== 0) {
        console.error('Python script error:', errorOutput);
        res.status(500).json({ 
          error: 'Transcription failed',
          details: process.env.NODE_ENV === 'development' ? errorOutput : undefined
        });
        return;
      }

      // Return transcription result
      res.json({ 
        transcription: transcriptionResult.trim(),
        success: true 
      });
    });

    pythonProcess.on('error', (error) => {
      console.error('Failed to start Python process:', error);
      // Clean up uploaded file
      if (fs.existsSync(audioFilePath)) {
        fs.unlinkSync(audioFilePath);
      }
      res.status(500).json({ error: 'Transcription service error' });
    });

  } catch (error) {
    console.error('Transcription upload error:', error);
    
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;