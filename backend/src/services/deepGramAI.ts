import fs from "fs";
import axios from "axios";
const audioFilePath = "youraudio.wav";

export const  transcribeAudio = async (audioFilePath: any) => {
  try {
    const audio = fs.readFileSync(audioFilePath);

    const response = await axios.post(
      "https://api.deepgram.com/v1/listen?model=nova-3&smart_format=true",
      audio,
      {
        headers: {
          Authorization: `Token 3b6b8dc9e2918f8149d524ff985513af5bc91c98`,
          "Content-Type": "audio/wav",
        },
      }
    );

    console.log("Transcription:", response.data);
    return response.data.results.channels[0].transcript
  } catch (error: any) {
    console.error("Error:", error.response?.data || error.message);
  }
};
