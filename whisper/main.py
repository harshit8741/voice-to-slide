#!/usr/bin/env python3

import os
import tempfile
import whisper
import warnings
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn
from typing import Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Suppress whisper warnings
warnings.filterwarnings("ignore")

# Initialize FastAPI app
app = FastAPI(
    title="Whisper Transcription Service", 
    description="AI-powered audio transcription microservice using OpenAI Whisper",
    version="1.0.0"
)

# Global model instance (loaded once on startup)
model = None

class TranscriptionResponse(BaseModel):
    transcription: str
    language: str
    success: bool
    error: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    version: str

@app.on_event("startup")
async def startup_event():
    """Load Whisper model on startup"""
    global model
    try:
        logger.info("Loading Whisper model...")
        model = whisper.load_model("base")
        logger.info("Whisper model loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load Whisper model: {e}")
        raise e

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        model_loaded=model is not None,
        version="1.0.0"
    )

@app.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(audio: UploadFile = File(...)):
    """
    Transcribe audio file using Whisper model
    
    Args:
        audio: Audio file (mp3, wav, m4a, etc.)
        
    Returns:
        TranscriptionResponse with transcription text and language
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Whisper model not loaded")
    
    # Validate file type
    allowed_types = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/x-m4a', 'audio/webm', 'audio/ogg', 'audio/flac']
    if audio.content_type not in allowed_types:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file type: {audio.content_type}. Supported types: {', '.join(allowed_types)}"
        )
    
    # Check file size (limit to 50MB)
    max_size = 50 * 1024 * 1024  # 50MB
    audio.file.seek(0, 2)  # Seek to end
    file_size = audio.file.tell()
    audio.file.seek(0)  # Reset to beginning
    
    if file_size > max_size:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 50MB")
    
    # Create temporary file
    temp_file = None
    try:
        # Create temporary file with appropriate extension
        file_extension = os.path.splitext(audio.filename or "audio.wav")[1] or ".wav"
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=file_extension)
        
        # Write uploaded file to temporary file
        content = await audio.read()
        temp_file.write(content)
        temp_file.close()
        
        logger.info(f"Processing audio file: {audio.filename} ({file_size} bytes)")
        
        # Transcribe audio
        result = model.transcribe(temp_file.name)
        
        # Extract transcription and language
        transcription = result["text"].strip()
        language = result.get("language", "unknown")
        
        logger.info(f"Transcription completed. Language: {language}, Length: {len(transcription)} chars")
        
        return TranscriptionResponse(
            transcription=transcription,
            language=language,
            success=True
        )
        
    except Exception as e:
        logger.error(f"Transcription error: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "transcription": "",
                "language": "unknown", 
                "success": False,
                "error": f"Transcription failed: {str(e)}"
            }
        )
    
    finally:
        # Clean up temporary file
        if temp_file and os.path.exists(temp_file.name):
            try:
                os.unlink(temp_file.name)
            except Exception as e:
                logger.warning(f"Failed to delete temporary file: {e}")

@app.get("/")
async def root():
    """Root endpoint with service info"""
    return {
        "message": "Whisper Transcription Service",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "transcribe": "/transcribe (POST with audio file)",
            "docs": "/docs"
        }
    }

if __name__ == "__main__":
    # Run with uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)