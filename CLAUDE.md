# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Quick Start
- `./run-all.sh` - Automated setup and startup script for complete development environment
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Health check: http://localhost:5000/health

### Frontend (Next.js 15 with TypeScript)
```bash
cd frontend
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Backend (Express + TypeScript + Drizzle ORM)
```bash
cd backend
npm run dev          # Start development server with auto-reload (tsx watch)
npm run build        # Compile TypeScript to JavaScript
npm run start        # Start production server
npm run db:generate  # Generate database migrations from schema changes
npm run db:migrate   # Apply pending migrations to database
npm run db:studio    # Open Drizzle Studio for database management
```

### Rev AI Transcription Service
The application uses Rev AI streaming API for real-time audio transcription:
- Supports multiple audio formats: MP3, WAV, WebM, M4A, OGG, FLAC  
- Streaming transcription via WebSocket connection
- No additional setup required - integrated directly into backend

## Architecture Overview

This is an AI-powered audio transcription platform with presentation generation capabilities built as a full-stack TypeScript application.

### Frontend Architecture (`/frontend`)
- **Framework**: Next.js 15 with App Router and strict TypeScript
- **Styling**: Tailwind CSS v4 with custom design system
- **State Management**: React Context for authentication
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios with interceptors for JWT tokens
- **Key Components**: AudioRecorder, SlideViewer, ProtectedRoute

### Backend Architecture (`/backend`)
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT tokens with bcrypt password hashing + Google OAuth 2.0
- **File Processing**: Multer for audio uploads (50MB limit)
- **AI Integration**: Rev AI streaming transcription + Google Gemini for slide generation
- **Architecture Pattern**: Service layer with middleware-based validation

### AI Transcription System
- **Engine**: Rev AI streaming speech-to-text API
- **Architecture**: Real-time WebSocket-based transcription service
- **Supported Formats**: MP3, WAV, WebM, M4A, OGG, FLAC
- **Processing**: Direct integration with Rev AI streaming API for real-time transcription

## Key Directories
- `frontend/src/app/` - Next.js App Router pages (dashboard, audio-to-slides, presentations)
- `frontend/src/components/ui/` - UI components (AudioRecorder, SlideViewer, Button, Input)
- `frontend/src/lib/` - Utilities (API client with interceptors, auth context, validations)
- `backend/src/routes/` - API endpoints (auth, users, transcribe, slides, audioToSlides)
- `backend/src/services/` - Business logic (AuthService, UserService, RevAIService, slideGeneratorService)
- `backend/src/schemas/` - Drizzle ORM schemas for PostgreSQL

## Database Configuration

- **Database**: PostgreSQL (hosted on Neon)
- **ORM**: Drizzle ORM with PostgreSQL support
- **Schema**: UUID primary keys with proper constraints and indexing
- **Migrations**: Auto-generated from schema changes
- **Studio**: Access via `npm run db:studio` for database management

## Environment Setup

### Backend `.env`
```
DATABASE_URL=postgresql://neondb_owner:npg_3YtuWqFCUBd9@ep-lingering-sky-a1giau9s-pooler.ap-southeast-1.aws.neon.tech/on-ed?sslmode=require
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
GEMINI_API_KEY=your-gemini-api-key

# Rev AI Configuration
REV_AI_API_KEY=your-rev-ai-api-key

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

### Frontend `.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

## API Structure

Base URL: `http://localhost:5000/api`

### Auth Endpoints (`/api/auth`)
- `POST /register` - User registration with email/password
- `POST /login` - User login with email/password
- `GET /me` - Get current user (protected)
- `POST /logout` - User logout (protected)
- `GET /google` - Initiate Google OAuth flow
- `GET /google/callback` - Google OAuth callback handler

### User Endpoints (`/api/users`)
- `GET /` - Get all users (protected)
- `GET /stats` - Get user statistics (protected)
- `GET /:id` - Get user by ID (protected)
- `PUT /profile` - Update user profile (protected)
- `DELETE /account` - Delete user account (protected)

### Transcription Endpoints (`/api/transcribe`)
- `POST /` - Transcribe audio file using Docker Whisper (protected)
- `GET /health` - Check Docker container health (protected)

### Slides Endpoints (`/api/slides`)
- `POST /generate` - Generate slides from text using Gemini AI (protected)
- `GET /` - Get user presentations (protected)
- `GET /:id` - Get presentation with slides (protected)
- `DELETE /:id` - Delete presentation (protected)
- `POST /:id/export` - Export presentation to PowerPoint PPTX format (protected)
- `GET /themes` - Get available export themes for PowerPoint generation (protected)

### Audio-to-Slides (`/api/audio-to-slides`)
- `POST /` - Upload audio file OR YouTube URL, transcribe, and generate slides in one workflow (protected)
  - Supports both file uploads and YouTube video URLs
  - File formats: MP3, WAV, WebM, M4A, OGG, FLAC
  - YouTube: Extracts audio using ytdl-core

## Development Flow

### Audio Transcription Workflow
```
User uploads/records audio → Multer handles file → Rev AI WebSocket connection → 
Streaming transcription via Rev AI API → JSON response with transcription → Frontend displays results
```

### Slide Generation Workflow
```
Text input → Gemini AI processes → Structured slides generated → 
Stored in database → SlideViewer component displays
```

### Development Startup
1. `./run-all.sh` handles complete setup:
   - Installs dependencies for both frontend/backend
   - Sets up environment files with Rev AI configuration
   - Starts servers concurrently (frontend and backend)
   - Provides health checks and monitoring

## PowerPoint Export Feature

### Overview
The platform includes a comprehensive PowerPoint export system that transforms generated presentations into professional PPTX files using PptxGenJS.

### Key Components
- **Export Service** (`/backend/src/services/pptxExportService.ts`) - Core PowerPoint generation logic
- **Export Types** (`/backend/src/types/export.ts`) - TypeScript definitions for export data structures
- **Export Transformer** (`/backend/src/utils/exportTransformer.ts`) - Data transformation utilities
- **Export Button Component** (`/frontend/src/components/ui/ExportButton.tsx`) - Frontend interface

### Export Themes
Three professional themes available:
- **Professional Blue**: Navy blue headers, Calibri font, clean white background
- **Modern Dark**: White text on dark background, Segoe UI font, orange accents  
- **Warm Academic**: Brown headers, Times New Roman font, cream background

### Export Process
1. User selects presentation and export options (theme, author)
2. Frontend calls `/api/slides/:id/export` with options
3. Backend transforms presentation data to export format
4. PptxGenJS generates PPTX buffer with theme styling
5. File downloads with proper MIME type and filename

### Usage
```bash
# Export with default theme
POST /api/slides/:id/export
{ "theme": "professional" }

# Export with custom options  
POST /api/slides/:id/export
{ "theme": "modern", "author": "Dr. Jane Smith" }
```

## Google OAuth 2.0 Integration

### Overview
The platform supports both traditional email/password authentication and Google OAuth 2.0 for seamless user onboarding.

### Setup Instructions
1. **Google Cloud Console Setup**:
   - Create a new project or use existing one
   - Enable Google+ API and Google OAuth 2.0
   - Create OAuth 2.0 credentials (Web application)
   - Add authorized origins: `http://localhost:3000` (frontend)
   - Add authorized redirect URIs: `http://localhost:5000/api/auth/google/callback` (backend)

2. **Environment Configuration**:
   - Update `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in backend `.env`
   - Update `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in frontend `.env.local`

### Authentication Flow
```
User clicks "Sign in with Google" → Google OAuth consent → Backend callback → 
JWT token generation → Frontend callback → Auto-login → Dashboard redirect
```

### Key Components
- **Backend**: Passport.js with Google OAuth 2.0 strategy
- **Frontend**: GoogleAuthButton component with Google branding
- **Database**: Extended user schema supporting Google ID, profile pictures, auth provider
- **Security**: JWT tokens with Google user data, provider tracking

### User Data Handling
- **Google users**: No password stored, uses Google ID for identification
- **Email users**: Can link Google account later (automatic account linking)
- **Profile pictures**: Automatically imported from Google profile
- **Mixed authentication**: Users can switch between email and Google sign-in

## YouTube Audio Extraction

### Overview
The platform can extract audio from YouTube videos for transcription and slide generation using ytdl-core.

### Supported Formats
- YouTube video URLs (any format supported by ytdl-core)
- Automatic audio extraction to WebM format
- Integration with existing Whisper transcription pipeline

### Usage
1. User selects "YouTube Video" option on main page
2. Pastes YouTube URL
3. Backend validates URL and extracts audio
4. Audio is processed through normal transcription workflow
5. Generated slides include video metadata (title, author, thumbnail)

### Implementation
- **Backend**: YouTubeService with @distube/ytdl-core (more stable fork)
- **Frontend**: YouTube URL input with validation
- **Error Handling**: Comprehensive error messages for invalid URLs, geo-restrictions, etc.

## Development Notes

- TypeScript strict mode enabled across the stack
- Shared Zod validation schemas between client/server
- JWT tokens stored in localStorage with automatic refresh
- Error handling with comprehensive logging and user-friendly messages
- Docker container pre-downloads Whisper model to avoid first-run delays
- Multer file uploads with cleanup after processing
- CORS configured for cross-origin requests
- Security headers via Helmet middleware
- Graceful shutdown handling for production
- PowerPoint export with professional themes and metadata preservation
- Google OAuth 2.0 integration with account linking
- YouTube audio extraction with ytdl-core