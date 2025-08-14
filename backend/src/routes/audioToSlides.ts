import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { authenticateToken } from '../middleware/auth';
import { SlideGeneratorService } from '../services/slideGeneratorService';
import { YouTubeService } from '../services/youtubeService';

const router = express.Router();
const slideGeneratorService = new SlideGeneratorService();

// Configure multer for file uploads (same as transcribe route)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
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
    if (file.mimetype.startsWith('audio/') || 
        file.originalname.match(/\.(mp3|wav|webm|m4a|ogg|flac)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Please upload a valid audio file'));
    }
  }
});

// Helper function to process audio file (either uploaded or from YouTube)
const processAudioFile = async (audioFilePath: string, userId: string, title?: string) => {
  const audioFileName = path.basename(audioFilePath);
  const containerAudioPath = `/app/audio/${audioFileName}`;

  // Transcribe audio using Whisper
  const dockerCommand = `docker run --rm -v "${path.dirname(audioFilePath)}:/app/audio" whisper-local "${containerAudioPath}"`;

  const transcriptionPromise = new Promise<string>((resolve, reject) => {
    exec(dockerCommand, { timeout: 600000, maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      // Clean up audio file
      if (fs.existsSync(audioFilePath)) {
        fs.unlinkSync(audioFilePath);
      }

      if (error) {
        console.error('Docker execution error:', error);
        reject(new Error('Transcription failed: ' + error.message));
        return;
      }

      if (stderr) {
        console.log('Docker stderr (may include model download progress):', stderr);
        
        const stderrLines = stderr.trim().split('\n');
        const lastLine = stderrLines[stderrLines.length - 1];
        
        if (lastLine) {
          try {
            const errorResponse = JSON.parse(lastLine);
            if (errorResponse.error && errorResponse.success === false) {
              reject(new Error('Transcription failed: ' + errorResponse.error));
              return;
            }
          } catch (parseError) {
            // Continue if it's not JSON error
          }
        }
      }

      try {
        const transcriptionResult = JSON.parse(stdout.trim());
        
        if (transcriptionResult.success) {
          resolve(transcriptionResult.transcription);
        } else {
          reject(new Error('Transcription failed: ' + (transcriptionResult.error || 'Unknown error')));
        }
      } catch (parseError) {
        console.error('Failed to parse transcription result:', parseError);
        reject(new Error('Invalid transcription response'));
      }
    });
  });

  const transcription = await transcriptionPromise;

  if (!transcription || transcription.trim().length < 10) {
    throw new Error('Transcription too short or empty. Please provide a longer audio recording.');
  }

  // Generate slides from transcription
  const presentation = await slideGeneratorService.generateSlidesFromTranscription(
    transcription,
    userId,
    title
  );

  return { presentation, transcription };
};

// POST /api/audio-to-slides - Convert audio directly to slides (file upload or YouTube URL)
router.post('/', authenticateToken, upload.single('audio'), async (req, res): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { title, youtubeUrl } = req.body;

    // Handle YouTube URL
    if (youtubeUrl) {
      try {
        // Get video info for title if not provided
        const videoInfo = await YouTubeService.getVideoInfo(youtubeUrl);
        const finalTitle = title || videoInfo.title;

        // Download audio from YouTube
        const audioFilePath = await YouTubeService.downloadAudio(youtubeUrl);
        
        // Process the downloaded audio
        const { presentation, transcription } = await processAudioFile(audioFilePath, userId, finalTitle);

        res.status(201).json({
          message: 'Slides generated successfully from YouTube video',
          presentation,
          transcription,
          videoInfo
        });
        return;
      } catch (error: any) {
        console.error('YouTube processing error:', error);
        res.status(500).json({ 
          error: error.message || 'Failed to process YouTube video'
        });
        return;
      }
    }

    // Handle file upload
    if (!req.file) {
      res.status(400).json({ error: 'No audio file or YouTube URL provided' });
      return;
    }

    const audioFilePath = req.file.path;

    try {
      // Process the uploaded audio file
      const { presentation, transcription } = await processAudioFile(audioFilePath, userId, title);

      res.status(201).json({
        message: 'Slides generated successfully from audio',
        presentation,
        transcription
      });
    } catch (error: any) {
      console.error('Audio to slides error:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to process audio'
      });
    }

  } catch (error) {
    console.error('Audio to slides API error:', error);
    
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;