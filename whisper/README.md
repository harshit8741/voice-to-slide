# Whisper Transcription Microservice

A FastAPI-based microservice for audio transcription using OpenAI Whisper.

## Features

- 🎵 **Audio Transcription**: Convert audio files to text using OpenAI Whisper
- 🚀 **FastAPI**: High-performance async API with automatic documentation
- 🐳 **Docker Ready**: Containerized for easy deployment
- 📁 **Multiple Formats**: Supports MP3, WAV, M4A, WebM, OGG, FLAC
- 🔍 **Health Checks**: Built-in health monitoring
- 📏 **File Size Limits**: 50MB maximum file size
- 🌐 **Language Detection**: Automatic language detection

## Quick Start

### Using Docker Compose (Recommended)

```bash
# Build and start the service
docker compose up --build

# Check health
curl http://localhost:8000/health

# Transcribe an audio file
curl -X POST "http://localhost:8000/transcribe" \
  -F "audio=@your-audio-file.mp3"
```

### Manual Docker Build

```bash
# Build the image
docker build -t whisper-service .

# Run the container
docker run -p 8000:8000 whisper-service

# Test the service
curl http://localhost:8000/health
```

### Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run the service
python main.py

# Service will be available at http://localhost:8000
```

## API Endpoints

### `GET /health`
Health check endpoint

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "version": "1.0.0"
}
```

### `POST /transcribe`
Transcribe an audio file

**Request:**
- Content-Type: `multipart/form-data`
- Body: audio file

**Response:**
```json
{
  "transcription": "Hello, this is a test transcription.",
  "language": "en",
  "success": true,
  "error": null
}
```

### `GET /docs`
Interactive API documentation (Swagger UI)

### `GET /`
Service information

## Supported Audio Formats

- MP3 (audio/mpeg)
- WAV (audio/wav)
- M4A (audio/mp4, audio/x-m4a)
- WebM (audio/webm)
- OGG (audio/ogg)
- FLAC (audio/flac)

## Configuration

### Environment Variables

- `PORT`: Server port (default: 8000)
- `PYTHONUNBUFFERED`: Python output buffering (default: 1)

### File Limits

- Maximum file size: 50MB
- Supported sample rates: All rates supported by Whisper
- Model: Whisper "base" model (pre-downloaded in Docker image)

## Integration with Node.js Backend

Replace Docker command calls with HTTP requests:

```javascript
// Old approach
const dockerCommand = `docker run --rm -v "${path.dirname(audioFilePath)}:/app/audio" whisper-local "${containerAudioPath}"`;

// New approach
const formData = new FormData();
formData.append('audio', fs.createReadStream(audioFilePath));

const response = await fetch('http://localhost:8000/transcribe', {
  method: 'POST',
  body: formData
});

const result = await response.json();
```

## Production Deployment

### Environment Variables for Production

```bash
PORT=8000
PYTHONUNBUFFERED=1
```

### Resource Requirements

- **CPU**: 2+ cores recommended
- **RAM**: 2GB+ recommended (model loading requires ~1GB)
- **Storage**: ~2GB for model and dependencies
- **Network**: HTTP/HTTPS access for API calls

### Scaling Considerations

- Each instance loads its own Whisper model (1GB RAM per instance)
- Consider using a load balancer for multiple instances
- Model loading takes ~30-60 seconds on startup
- Transcription time varies by audio length (typically real-time or faster)

## Error Handling

The service returns appropriate HTTP status codes:

- `200`: Success
- `400`: Bad request (unsupported file type, file too large)
- `500`: Internal server error (transcription failed)
- `503`: Service unavailable (model not loaded)

## Monitoring

Use the `/health` endpoint for:
- Load balancer health checks
- Container orchestration health checks
- Monitoring system integration