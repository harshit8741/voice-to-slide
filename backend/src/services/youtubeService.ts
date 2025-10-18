import fs from 'fs';
import path from 'path';
import { Innertube } from 'youtubei.js';
import { Readable } from 'stream';

export class YouTubeService {
  private static client: Innertube;

  private static async initClient() {
    if (!this.client) {
      this.client = await Innertube.create();
    }
  }

  static async downloadAudio(youtubeUrl: string) {
    console.log('Downloading YouTube audio using youtubei.js:', youtubeUrl);
    await this.initClient();

    try {
      const videoId = this.extractVideoId(youtubeUrl);
      const video = await this.client.getInfo(videoId);

      const title = (video.basic_info?.title || 'untitled')
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 50);

      const tempDir = path.join(process.cwd(), 'temp');
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

      const filePath = path.join(tempDir, `youtube_${title}_${Date.now()}.mp3`);
      console.log('Downloading to:', filePath);
      return filePath

      // // Request the best audio stream (returns a Web ReadableStream)
      // const stream = await video.download({
      //   quality: 'best',
      //   type: 'audio',
      // });

      // // Convert Web ReadableStream → Node.js Readable
      // const nodeStream = Readable.fromWeb(stream as any);

      // // Pipe to file
      // const writeStream = fs.createWriteStream(filePath);

      // return new Promise((resolve, reject) => {
      //   nodeStream.pipe(writeStream);

      //   nodeStream.on('error', (err) => {
      //     console.error('Stream error:', err);
      //     reject(new Error('Audio download failed'));
      //   });

      //   writeStream.on('finish', () => {
      //     console.log('Audio downloaded successfully:', filePath);
      //     resolve(filePath);
      //   });

      //   writeStream.on('error', (err) => {
      //     console.error('Write stream error:', err);
      //     reject(new Error('Failed to save audio file'));
      //   });
      // });
    } catch (error) {
      console.error('YouTube download error:', error);
      throw new Error(
        `Failed to download audio: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  private static extractVideoId(url: string): string {
    const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (!match) throw new Error('Invalid YouTube URL');
    return match[1]!;
  }
}
