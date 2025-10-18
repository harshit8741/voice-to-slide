import fs from "fs";
import path from "path";
import ytdl from "ytdl-core";

export class YouTubeService {
  static async downloadAudio(youtubeUrl: string): Promise<string> {
    process.env.YTDL_NO_UPDATE = "1"; // disable version check at runtime

    try {
      console.log("Downloading YouTube audio:", youtubeUrl);
      const info = await ytdl.getInfo(youtubeUrl);

      const title = info.videoDetails.title
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .replace(/\s+/g, "_")
        .substring(0, 50);

      const tempDir = path.join(process.cwd(), "temp");
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

      const filePath = path.join(tempDir, `youtube_${title}_${Date.now()}.m4a`);

      // Itag 140 = stable M4A audio-only
      const audioOptions = {
        quality: "highestaudio",
        filter: "audioonly" as const,
        requestOptions: {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
          },
        },
      };

      return await new Promise((resolve, reject) => {
        const writeStream = fs.createWriteStream(filePath);
        const audioStream = ytdl(youtubeUrl, audioOptions);

        audioStream.pipe(writeStream);

        audioStream.on("error", (err) => {
          console.error("Stream error:", err);

          // Retry once if YouTube returns 410 Gone
          if (err.message.includes("410")) {
            console.warn("Retrying download with fallback format...");
            const fallbackStream = ytdl(youtubeUrl, { quality: 140 });
            fallbackStream.pipe(writeStream);
            fallbackStream.on("end", () => resolve(filePath));
            fallbackStream.on("error", reject);
            return;
          }

          reject(new Error(`Audio download failed: ${err.message}`));
        });

        writeStream.on("finish", () => {
          console.log("✅ Audio downloaded successfully:", filePath);
          resolve(filePath);
        });

        writeStream.on("error", (err) => {
          reject(new Error(`Failed to save audio: ${err.message}`));
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
