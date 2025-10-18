import fs from "fs";
import path from "path";
import axios from "axios";
import mime from "mime-types";

export const transcribeAudio = async (audioFilePath: string) => {
  try {
    // Verify the file exists
    if (!fs.existsSync(audioFilePath)) {
      throw new Error("Audio file not found at given path");
    }

    // Read audio as binary
    const audioBuffer = fs.readFileSync(audioFilePath);

    // Detect MIME type automatically (fallback to audio/wav)
    const contentType =
      mime.lookup(path.extname(audioFilePath)) || "audio/wav";

    // Call Deepgram API
    const response = await axios.post(
      "https://api.deepgram.com/v1/listen?model=nova-3&smart_format=true",
      audioBuffer,
      {
        headers: {
          Authorization: `Token 3b6b8dc9e2918f8149d524ff985513af5bc91c98`,
          "Content-Type": contentType,
        },
      }
    );

    const transcript =
      response.data.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";

    return transcript;
  } catch (error: any) {
    console.error("Deepgram transcription error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.error || "Failed to transcribe audio with Deepgram"
    );
  }
};
