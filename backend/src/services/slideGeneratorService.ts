import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '../db';
import { presentations, slides, type NewPresentation, type NewSlide, type PresentationWithSlides } from '../schemas/presentations';
import { eq } from 'drizzle-orm';

interface TopicContent {
  title: string;
  content: string;
  bulletPoints: string[];
  keyTakeaway?: string;
  imageIdea?: string;
}

interface ChapterContent {
  title: string;
  topics: TopicContent[];
}


interface SlideContent {
  title: string;
  bulletPoints: string[];
  keyTakeaway?: string;
  imageIdea?: string;
}

export class SlideGeneratorService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async generateSlidesFromTranscription(transcription: string, userId: string, presentationTitle?: string): Promise<PresentationWithSlides> {
    try {
      const prompt = this.createPrompt(transcription);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const generatedSlides = this.parseGeminiResponse(text);
      
      const finalTitle = presentationTitle || generatedSlides.title || 'Generated Presentation';
      
      const savedPresentation = await this.savePresentationToDatabase(
        transcription,
        userId,
        finalTitle,
        generatedSlides.slides
      );
      
      return savedPresentation;
    } catch (error) {
      console.error('Error generating slides:', error);
      throw new Error('Failed to generate slides from transcription');
    }
  }

  private createPrompt(transcription: string): string {
    return `
You are an expert content summarizer and presentation designer. Your task is to take the following transcription and create a detailed, comprehensive set of notes or slides.

GUIDELINES:
1. First, divide the transcription into **chapters or phases** based on natural topic or theme changes.
2. Each chapter can have multiple **topics**. Each topic may include:
   - Paragraph text
   - Key points
   - Examples, analogies, definitions, calculations, or data mentioned
3. Ensure **no information is lost**: all facts, examples, calculations, and points in the transcription must be captured.
4. Summarize the content effectively while keeping all essential details. 
5. For each topic/slide include:
   - "title": A concise, descriptive title (max 8 words)
   - "content": Main text or explanation (can be multi-sentence)
   - "bulletPoints": Key points or summary (if applicable)
   - "keyTakeaway": One to two sentences highlighting the main message
   - "imageIdea": Suggestion for a visual, chart, or diagram (optional)
6. Chapters, topics, and slides can be of any length or number depending on transcription length.
7. Tone should be clear, professional, and audience-friendly.
8. Output **must be valid JSON only** — no extra commentary or explanations.

OUTPUT FORMAT (JSON object):
{
  "title": "Main Presentation/Notes Title",
  "chapters": [
    {
      "title": "Chapter Title",
      "topics": [
        {
          "title": "Topic Title",
          "content": "Detailed explanation or text here",
          "bulletPoints": [
            "Point 1",
            "Point 2"
          ],
          "keyTakeaway": "Summary sentence here",
          "imageIdea": "Visual suggestion here"
        }
      ]
    }
  ]
}

Transcript:
"""
${transcription}
"""
`.trim();
  }

  private parseGeminiResponse(response: string): { title: string; slides: SlideContent[] } {
    try {
      // Clean the response to extract JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const jsonStr = jsonMatch[0];
      const parsed = JSON.parse(jsonStr);
      
      // Check for new chapter-based structure
      if (parsed.title && Array.isArray(parsed.chapters)) {
        // New format: flatten chapters and topics into slides
        const slides: SlideContent[] = [];
        
        for (const chapter of parsed.chapters) {
          if (chapter.topics && Array.isArray(chapter.topics)) {
            for (const topic of chapter.topics) {
              if (topic.title) {
                // Create bullet points from content and existing bulletPoints
                let bulletPoints: string[] = [];
                
                if (topic.content) {
                  // Split content into sentences or use as single point
                  const contentLines = topic.content.split(/[.!?]+/).filter((line: string) => line.trim());
                  bulletPoints = contentLines.length > 1 ? contentLines.map((line: string) => line.trim()) : [topic.content];
                }
                
                if (topic.bulletPoints && Array.isArray(topic.bulletPoints)) {
                  bulletPoints = bulletPoints.concat(topic.bulletPoints);
                }
                
                // Ensure we have at least some content
                if (bulletPoints.length === 0) {
                  bulletPoints = ['Content from transcription'];
                }
                
                slides.push({
                  title: topic.title,
                  bulletPoints: bulletPoints,
                  keyTakeaway: topic.keyTakeaway || null,
                  imageIdea: topic.imageIdea || null
                });
              }
            }
          }
        }
        
        if (slides.length > 0) {
          return {
            title: parsed.title,
            slides: slides
          };
        }
      }
      
      // Check for old slides-based structure (backward compatibility)
      if (parsed.title && Array.isArray(parsed.slides)) {
        const validSlides = parsed.slides.filter((slide: any) => 
          slide.title && (Array.isArray(slide.bulletPoints) || slide.content)
        ).map((slide: any) => ({
          title: slide.title,
          bulletPoints: slide.bulletPoints || (slide.content ? [slide.content] : []),
          keyTakeaway: slide.keyTakeaway || null,
          imageIdea: slide.imageIdea || null
        }));
        
        if (validSlides.length > 0) {
          return {
            title: parsed.title,
            slides: validSlides
          };
        }
      }
      
      throw new Error('Invalid response structure - no valid slides or chapters found');
      
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      console.error('Raw response:', response);
      
      // Fallback: create a simple slide structure
      return {
        title: 'Generated Presentation',
        slides: [
          {
            title: 'Summary',
            bulletPoints: [
              'Content extracted from transcription',
              'Please review and edit as needed',
              'Additional slides can be added manually'
            ]
          }
        ]
      };
    }
  }

  private async savePresentationToDatabase(
    transcription: string,
    userId: string,
    title: string,
    slideContents: SlideContent[]
  ): Promise<PresentationWithSlides> {
    // Create presentation
    const newPresentation: NewPresentation = {
      title,
      transcription,
      userId
    };
    
    const [presentation] = await (db as any).insert(presentations).values(newPresentation).returning();
    
    // Create slides
    const slidePromises = slideContents.map(async (slideContent, index) => {
      const newSlide: NewSlide = {
        presentationId: presentation.id,
        title: slideContent.title,
        bulletPoints: JSON.stringify(slideContent.bulletPoints),
        keyTakeaway: slideContent.keyTakeaway || null,
        imageIdea: slideContent.imageIdea || null,
        slideOrder: index
      };
      
      return (db as any).insert(slides).values(newSlide).returning();
    });
    
    const slideResults = await Promise.all(slidePromises);
    const createdSlides = slideResults.map((result: any) => result[0]);
    
    return {
      ...presentation,
      slides: createdSlides
    };
  }

  async getPresentationWithSlides(presentationId: string, userId: string): Promise<PresentationWithSlides | null> {
    try {
      const presentation = await (db as any)
        .select()
        .from(presentations)
        .where(eq(presentations.id, presentationId))
        .limit(1);
      
      if (presentation.length === 0 || presentation[0].userId !== userId) {
        return null;
      }
      
      const presentationSlides = await (db as any)
        .select()
        .from(slides)
        .where(eq(slides.presentationId, presentationId))
        .orderBy(slides.slideOrder);
      
      return {
        ...presentation[0],
        slides: presentationSlides
      };
    } catch (error) {
      console.error('Error fetching presentation:', error);
      throw new Error('Failed to fetch presentation');
    }
  }

  async getUserPresentations(userId: string) {
    try {
      return await (db as any)
        .select()
        .from(presentations)
        .where(eq(presentations.userId, userId))
        .orderBy(presentations.createdAt);
    } catch (error) {
      console.error('Error fetching user presentations:', error);
      throw new Error('Failed to fetch presentations');
    }
  }

  async deletePresentation(presentationId: string, userId: string): Promise<boolean> {
    try {
      // Verify ownership
      const presentation = await (db as any)
        .select()
        .from(presentations)
        .where(eq(presentations.id, presentationId))
        .limit(1);
      
      if (presentation.length === 0 || presentation[0].userId !== userId) {
        return false;
      }
      
      // Delete slides first (due to foreign key constraint)
      await (db as any).delete(slides).where(eq(slides.presentationId, presentationId));
      
      // Delete presentation
      await (db as any).delete(presentations).where(eq(presentations.id, presentationId));
      
      return true;
    } catch (error) {
      console.error('Error deleting presentation:', error);
      throw new Error('Failed to delete presentation');
    }
  }
}