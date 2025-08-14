// Transform presentation data for export

import { PresentationWithSlides } from '../db';
import { PresentationExport, ExportSlide, ThemeConfig, THEMES, ThemeName } from '../types/export';

export class ExportTransformer {
  /**
   * Transform database presentation to export format
   */
  static transformToExportFormat(
    presentation: PresentationWithSlides, 
    themeName: ThemeName = 'professional',
    author?: string
  ): PresentationExport {
    const theme = THEMES[themeName];
    
    return {
      metadata: {
        title: presentation.title,
        author: author || 'OnEd User',
        createdDate: presentation.createdAt.toString(),
        slideCount: presentation.slides.length + 1, // +1 for title slide
        originalTranscription: presentation.transcription
      },
      
      theme,
      
      slides: [
        // Title slide
        this.createTitleSlide(presentation.title),
        
        // Content slides
        ...this.createContentSlides(presentation.slides)
      ]
    };
  }

  /**
   * Create title slide
   */
  private static createTitleSlide(title: string): ExportSlide {
    return {
      slideNumber: 1,
      type: 'title',
      title: {
        text: title,
        fontSize: 36,
        fontWeight: 'bold',
        alignment: 'center'
      },
      content: { 
        bulletPoints: [],
        fontSize: 20,
        lineSpacing: 1.5
      },
      layout: {
        titleHeight: 60,
        contentMargin: 10
      }
    };
  }

  /**
   * Create content slides from database slides
   */
  private static createContentSlides(slides: any[]): ExportSlide[] {
    // Sort slides by order and transform
    return slides
      .sort((a, b) => a.slideOrder - b.slideOrder)
      .map((slide, index) => {
        // Parse bullet points from JSON string
        let bulletPoints: string[] = [];
        try {
          bulletPoints = typeof slide.bulletPoints === 'string' 
            ? JSON.parse(slide.bulletPoints)
            : slide.bulletPoints;
        } catch (error) {
          console.warn('Failed to parse bullet points for slide:', slide.id, error);
          bulletPoints = [];
        }

        return {
          slideNumber: index + 2, // +2 because title slide is #1
          type: 'content' as const,
          title: {
            text: slide.title,
            fontSize: 28,
            fontWeight: 'bold',
            alignment: 'left'
          },
          content: {
            bulletPoints: bulletPoints.map((point: string) => ({
              text: point,
              level: 0,
              bulletStyle: 'dot' as const
            })),
            fontSize: 18,
            lineSpacing: 1.3
          },
          layout: {
            titleHeight: 15,
            contentMargin: 8
          }
        };
      });
  }

  /**
   * Validate export data structure
   */
  static validateExportData(exportData: PresentationExport): boolean {
    try {
      if (!exportData.metadata || !exportData.slides) {
        return false;
      }

      if (!exportData.metadata.title || exportData.slides.length === 0) {
        return false;
      }

      // Validate each slide has required fields
      for (const slide of exportData.slides) {
        if (!slide.title || typeof slide.slideNumber !== 'number') {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Export validation error:', error);
      return false;
    }
  }

  /**
   * Get available themes
   */
  static getAvailableThemes(): Array<{ key: ThemeName; name: string; preview: ThemeConfig }> {
    return Object.entries(THEMES).map(([key, config]) => ({
      key: key as ThemeName,
      name: config.name,
      preview: config
    }));
  }
}