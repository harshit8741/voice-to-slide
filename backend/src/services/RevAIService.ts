import WebSocket from 'ws';
import fs from 'fs';
import path from 'path';

interface RevAIResponse {
  type: 'partial' | 'final';
  ts: number;
  end_ts: number;
  elements: Array<{
    type: 'text' | 'punct';
    value: string;
    ts?: number;
    end_ts?: number;
  }>;
}

interface TranscriptionResult {
  transcription: string;
  language?: string;
  success: boolean;
  filename: string;
}

export class RevAIService {
  private apiKey: string;
  private wsUrl: string = 'wss://api.rev.ai/speechtotext/v1/stream';

  constructor(apiKey: string = process.env.REV_AI_API_KEY || '') {
    if (!apiKey) {
      throw new Error('Rev AI API key is required');
    }
    this.apiKey = apiKey;
  }

  /**
   * Transcribe an audio file using Rev AI streaming API
   * @param audioFilePath Path to the audio file
   * @returns Promise with transcription result
   */
  async transcribeAudio(audioFilePath: string): Promise<TranscriptionResult> {
    return new Promise((resolve, reject) => {
      try {
        // Check if file exists
        if (!fs.existsSync(audioFilePath)) {
          reject(new Error(`Audio file not found: ${audioFilePath}`));
          return;
        }

        const filename = path.basename(audioFilePath);
        let fullTranscription = '';
        let hasError = false;

        // Determine audio format from file extension
        const ext = path.extname(audioFilePath).toLowerCase();
        let contentType: string;
        
        switch (ext) {
          case '.wav':
            contentType = 'audio/x-wav';
            break;
          case '.flac':
            contentType = 'audio/x-flac';
            break;
          case '.mp3':
            contentType = 'audio/mpeg';
            break;
          case '.m4a':
            contentType = 'audio/mp4';
            break;
          case '.ogg':
            contentType = 'audio/ogg';
            break;
          case '.webm':
            contentType = 'audio/webm';
            break;
          default:
            contentType = 'audio/x-wav'; // Default fallback
        }

        // Build WebSocket URL with parameters
        const wsUrl = new URL(this.wsUrl);
        wsUrl.searchParams.set('access_token', this.apiKey);
        wsUrl.searchParams.set('content_type', contentType);
        wsUrl.searchParams.set('language', 'en');

        console.log(`Connecting to Rev AI with content type: ${contentType}`);

        const ws = new WebSocket(wsUrl.toString());

        ws.on('open', () => {
          console.log('Rev AI WebSocket connection opened');
          
          // Read and stream the audio file
          const audioStream = fs.createReadStream(audioFilePath);
          
          audioStream.on('data', (chunk: Buffer | string) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(chunk);
            }
          });

          audioStream.on('end', () => {
            console.log('Audio file streaming completed');
            // Close the WebSocket connection to signal end of audio
            if (ws.readyState === WebSocket.OPEN) {
              ws.close();
            }
          });

          audioStream.on('error', (error) => {
            console.error('Audio stream error:', error);
            hasError = true;
            ws.close();
            reject(new Error(`Audio streaming failed: ${error.message}`));
          });
        });

        ws.on('message', (data: WebSocket.Data) => {
          try {
            const response: RevAIResponse = JSON.parse(data.toString());
            
            // Only process final results for complete transcription
            if (response.type === 'final' && response.elements) {
              const text = response.elements
                .filter(element => element.type === 'text')
                .map(element => element.value)
                .join('');
              
              if (text.trim()) {
                fullTranscription += text + ' ';
              }
            }
          } catch (error) {
            console.error('Error parsing Rev AI response:', error);
          }
        });

        ws.on('close', (code: number, reason: Buffer) => {
          console.log(`Rev AI WebSocket closed: ${code} - ${reason.toString()}`);
          
          if (!hasError) {
            resolve({
              transcription: fullTranscription.trim(),
              language: 'en',
              success: true,
              filename
            });
          }
        });

        ws.on('error', (error) => {
          console.error('Rev AI WebSocket error:', error);
          hasError = true;
          reject(new Error(`Rev AI connection failed: ${error.message}`));
        });

        // Set a timeout to prevent hanging connections
        setTimeout(() => {
          if (ws.readyState === WebSocket.OPEN) {
            hasError = true;
            ws.close();
            reject(new Error('Transcription timeout - process took too long'));
          }
        }, 300000); // 5 minutes timeout

      } catch (error) {
        reject(new Error(`Failed to transcribe audio: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    });
  }

  /**
   * Check if Rev AI service is accessible
   * @returns Promise with health status
   */
  async checkHealth(): Promise<{ healthy: boolean; details?: any }> {
    try {
      // Test connection by creating a WebSocket connection
      const wsUrl = new URL(this.wsUrl);
      wsUrl.searchParams.set('access_token', this.apiKey);
      wsUrl.searchParams.set('content_type', 'audio/x-wav');

      return new Promise((resolve) => {
        const ws = new WebSocket(wsUrl.toString());
        
        const timeout = setTimeout(() => {
          ws.close();
          resolve({
            healthy: false,
            details: 'Connection timeout'
          });
        }, 10000);

        ws.on('open', () => {
          clearTimeout(timeout);
          ws.close();
          resolve({
            healthy: true,
            details: 'Rev AI service is accessible'
          });
        });

        ws.on('error', (error) => {
          clearTimeout(timeout);
          resolve({
            healthy: false,
            details: error.message
          });
        });
      });
    } catch (error) {
      return {
        healthy: false,
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}