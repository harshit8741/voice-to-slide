# Use Python 3.10 slim image for smaller footprint
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    git \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip and install Python dependencies
RUN pip install --no-cache-dir --upgrade pip

# Install PyTorch CPU version (smaller and sufficient for most cases)
RUN pip install --no-cache-dir torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

# Install OpenAI Whisper
RUN pip install --no-cache-dir openai-whisper

# Copy the transcription script
COPY transcribe.py /app/transcribe.py

# Make the script executable
RUN chmod +x /app/transcribe.py

# Create directory for audio files
RUN mkdir -p /app/audio

# Pre-download the Whisper model to avoid first-run delays
RUN python3 -c "import whisper; whisper.load_model('base')"

# Set the entrypoint to run the transcription script
ENTRYPOINT ["python3", "/app/transcribe.py"]