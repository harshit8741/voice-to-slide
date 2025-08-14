import ytdl from '@distube/ytdl-core';
import fs from 'fs';
import path from 'path';

export class YouTubeService {
  static async downloadAudio(youtubeUrl: string): Promise<string> {
    console.log('Starting YouTube audio download for URL:', youtubeUrl);
    
    try {
      // Validate YouTube URL
      if (!ytdl.validateURL(youtubeUrl)) {
        throw new Error('Invalid YouTube URL format');
      }

      console.log('URL validation passed, getting video info...');
      
      // Get video info with retry logic
      let info;
      try {
        info = await ytdl.getInfo(youtubeUrl);
      } catch (infoError) {
        console.error('Error getting video info:', infoError);
        throw new Error(`Could not retrieve video information: ${infoError instanceof Error ? infoError.message : 'Unknown error'}`);
      }
      
      const title = info.videoDetails.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').substring(0, 50);
      console.log('Video title:', info.videoDetails.title, '-> cleaned:', title);
      
      // Create temp directory if it doesn't exist
      const tempDir = path.join(process.cwd(), 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Generate file path
      const fileName = `youtube_${title}_${Date.now()}.webm`;
      const filePath = path.join(tempDir, fileName);
      console.log('Downloading to:', filePath);

      // Check if audio formats are available
      const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
      if (audioFormats.length === 0) {
        throw new Error('No audio formats available for this video');
      }

      console.log('Available audio formats:', audioFormats.length);

      // Download audio
      return new Promise((resolve, reject) => {
        const stream = ytdl(youtubeUrl, {
          filter: 'audioonly',
          quality: 'highestaudio',
        });

        const writeStream = fs.createWriteStream(filePath);
        
        let downloadStarted = false;
        
        stream.on('progress', (chunkLength, downloaded, total) => {
          if (!downloadStarted) {
            console.log('Download started, total size:', total);
            downloadStarted = true;
          }
        });

        stream.pipe(writeStream);

        writeStream.on('finish', () => {
          console.log('Download completed successfully');
          resolve(filePath);
        });

        writeStream.on('error', (error) => {
          console.error('Write stream error:', error);
          reject(new Error(`File write error: ${error.message}`));
        });

        stream.on('error', (error) => {
          console.error('Download stream error:', error);
          reject(new Error(`Download error: ${error.message}`));
        });

        // Timeout after 10 minutes
        setTimeout(() => {
          stream.destroy();
          writeStream.destroy();
          reject(new Error('Download timeout - video may be too long'));
        }, 600000);
      });
    } catch (error) {
      console.error('YouTube download error:', error);
      throw new Error(`Failed to download audio from YouTube: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getVideoInfo(youtubeUrl: string) {
    console.log('Getting video info for URL:', youtubeUrl);
    
    try {
      if (!ytdl.validateURL(youtubeUrl)) {
        throw new Error('Invalid YouTube URL format');
      }

      console.log('URL validation passed, fetching video info...');
      
      const info = await ytdl.getInfo(youtubeUrl);
      
      const videoInfo = {
        title: info.videoDetails.title,
        duration: info.videoDetails.lengthSeconds,
        thumbnail: info.videoDetails.thumbnails[0]?.url,
        author: info.videoDetails.author.name,
      };
      
      console.log('Video info retrieved successfully:', { 
        title: videoInfo.title, 
        duration: videoInfo.duration,
        author: videoInfo.author 
      });
      
      return videoInfo;
    } catch (error) {
      console.error('Error getting video info:', error);
      throw new Error(`Failed to get video info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}