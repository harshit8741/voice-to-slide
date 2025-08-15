import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { SlideGeneratorService } from '../services/slideGeneratorService';
import { PptxExportService } from '../services/pptxExportService';
import { ExportTransformer } from '../utils/exportTransformer';
import { THEMES, ThemeName } from '../types/export';
import { z } from 'zod';

const router = express.Router();
const slideGeneratorService = new SlideGeneratorService();

// Validation schemas
const generateSlidesSchema = z.object({
  transcription: z.string().min(10, 'Transcription must be at least 10 characters'),
  title: z.string().optional()
});

const presentationIdSchema = z.object({
  id: z.string().uuid('Invalid presentation ID')
});

const exportSchema = z.object({
  theme: z.enum(['professional', 'modern', 'academic']).optional().default('professional'),
  author: z.string().optional()
});

// Generate slides from transcription
router.post('/generate', authenticateToken, validateBody(generateSlidesSchema), async (req, res) => {
  try {
    const { transcription, title } = req.body;
    const userId = req.authenticatedUser?.userId;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const presentation = await slideGeneratorService.generateSlidesFromTranscription(
      transcription,
      userId,
      title
    );

    res.status(201).json({
      message: 'Slides generated successfully',
      presentation
    });
  } catch (error) {
    console.error('Error generating slides:', error);
    res.status(500).json({ error: 'Failed to generate slides' });
  }
});

// Get available themes (must be before /:id route)
router.get('/themes', authenticateToken, async (req, res) => {
  try {
    const themes = ExportTransformer.getAvailableThemes();
    res.json({ themes });
  } catch (error) {
    console.error('Error fetching themes:', error);
    res.status(500).json({ error: 'Failed to fetch themes' });
  }
});

// Get presentation with slides
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { error, data } = presentationIdSchema.safeParse({ id: req.params.id });
    
    if (error) {
      res.status(400).json({ error: 'Invalid presentation ID' });
      return;
    }

    const userId = req.authenticatedUser?.userId;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const presentation = await slideGeneratorService.getPresentationWithSlides(data.id, userId);

    if (!presentation) {
      res.status(404).json({ error: 'Presentation not found' });
      return;
    }

    // Parse bullet points from JSON strings
    const presentationWithParsedSlides = {
      ...presentation,
      slides: presentation.slides.map(slide => ({
        ...slide,
        bulletPoints: JSON.parse(slide.bulletPoints)
      }))
    };

    res.json(presentationWithParsedSlides);
  } catch (error) {
    console.error('Error fetching presentation:', error);
    res.status(500).json({ error: 'Failed to fetch presentation' });
  }
});

// Get all user presentations
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.authenticatedUser?.userId;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const presentations = await slideGeneratorService.getUserPresentations(userId);
    res.json(presentations);
  } catch (error) {
    console.error('Error fetching presentations:', error);
    res.status(500).json({ error: 'Failed to fetch presentations' });
  }
});

// Delete presentation
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { error, data } = presentationIdSchema.safeParse({ id: req.params.id });
    
    if (error) {
      res.status(400).json({ error: 'Invalid presentation ID' });
      return;
    }

    const userId = req.authenticatedUser?.userId;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const deleted = await slideGeneratorService.deletePresentation(data.id, userId);

    if (!deleted) {
      res.status(404).json({ error: 'Presentation not found' });
      return;
    }

    res.json({ message: 'Presentation deleted successfully' });
  } catch (error) {
    console.error('Error deleting presentation:', error);
    res.status(500).json({ error: 'Failed to delete presentation' });
  }
});

// Export presentation as PPTX
router.post('/:id/export', authenticateToken, validateBody(exportSchema), async (req, res) => {
  console.log('Export request received for presentation:', req.params.id);
  try {
    const { error, data } = presentationIdSchema.safeParse({ id: req.params.id });
    
    if (error) {
      console.log('Invalid presentation ID:', error);
      res.status(400).json({ error: 'Invalid presentation ID' });
      return;
    }

    const userId = req.authenticatedUser?.userId;
    if (!userId) {
      console.log('User not authenticated');
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { theme, author } = req.body;
    console.log('Export options:', { theme, author });

    // Get presentation with slides
    console.log('Fetching presentation...');
    const presentation = await slideGeneratorService.getPresentationWithSlides(data.id, userId);
    console.log('Presentation fetched:', presentation ? 'found' : 'not found');

    if (!presentation) {
      res.status(404).json({ error: 'Presentation not found' });
      return;
    }

    // Parse bullet points from JSON strings for transformation
    console.log('Parsing slide bullet points...');
    const presentationWithParsedSlides = {
      ...presentation,
      slides: presentation.slides.map(slide => ({
        ...slide,
        bulletPoints: JSON.parse(slide.bulletPoints)
      }))
    };
    console.log('Slides parsed, count:', presentationWithParsedSlides.slides.length);

    // Transform to export format
    console.log('Transforming to export format...');
    const exportData = ExportTransformer.transformToExportFormat(
      presentationWithParsedSlides,
      theme as ThemeName,
      author || 'OnEd User'
    );
    console.log('Transform complete, slide count:', exportData.slides.length);

    // Generate PPTX buffer
    console.log('Generating PPTX buffer...');
    const pptxBuffer = await PptxExportService.generatePptxBuffer(exportData);
    console.log('PPTX buffer generated, size:', pptxBuffer.length);

    // Generate filename
    const filename = PptxExportService.generateFilename(presentation.title);

    // Set response headers for file download
    res.setHeader('Content-Type', PptxExportService.getPptxMimeType());
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pptxBuffer.length.toString());

    // Send the file
    res.send(pptxBuffer);

  } catch (error) {
    console.error('Error exporting presentation:', error);
    const errorMessage = (error as Error).message || 'Unknown error occurred';
    res.status(500).json({ 
      error: 'Failed to export presentation',
      details: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;