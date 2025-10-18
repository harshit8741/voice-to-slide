import fs from "fs";
import path from "path";
import ytdl from "ytdl-core";

export class YouTubeService {
  static async downloadAudio(youtubeUrl: string): Promise<string> {
    try {
      console.log("Downloading YouTube audio:", youtubeUrl);

      const info = await ytdl.getInfo(youtubeUrl);
      const title = info.videoDetails.title
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .replace(/\s+/g, "_")
        .substring(0, 50);

      const tempDir = path.join(process.cwd(), "temp");
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

      const filePath = path.join(tempDir, `youtube_${title}_${Date.now()}.mp3`);
      const writeStream = fs.createWriteStream(filePath);

      const audioStream = ytdl(youtubeUrl, {
        filter: "audioonly",
        quality: "highestaudio",
      });

      return new Promise((resolve, reject) => {
        audioStream.pipe(writeStream);

        audioStream.on("error", (err: any) => {
          console.error("Stream error:", err);
          reject(new Error("Audio download failed"));
        });

        writeStream.on("finish", () => {
          console.log("✅ Audio downloaded successfully:", filePath);
          resolve(filePath);
        });

        writeStream.on("error", (err) => {
          console.error("Write stream error:", err);
          reject(new Error("Failed to save audio file"));
        });
      });
    } catch (error) {
      console.error("YouTube download error:", error);
      throw new Error(
        `Failed to download audio: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
