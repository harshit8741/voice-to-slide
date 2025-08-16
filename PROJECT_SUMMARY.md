# OnEd - AI-Powered Audio Transcription & Presentation Platform

## Project Overview
OnEd is a cutting-edge full-stack TypeScript application that transforms audio content into professional PowerPoint presentations using modern microservice architecture. Built with OpenAI's Whisper FastAPI microservice and Google Gemini AI for intelligent slide generation.

## Core Architecture

### **Frontend (Next.js 15)**
- **Framework**: Next.js 15 with App Router and TypeScript
- **Styling**: Tailwind CSS v4 with custom design system
- **Key Features**:
  - Real-time audio recording with visualization
  - File upload for audio transcription  
  - JWT-based authentication with React Context
  - Modern glassmorphism UI design
  - Responsive dashboard with analytics

### **Backend (Express + TypeScript)**
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT tokens + bcrypt hashing + Google OAuth 2.0
- **File Processing**: Multer for audio uploads (50MB limit)
- **AI Integration**: HTTP communication with Whisper microservice + Google Gemini

### **Whisper Microservice (FastAPI + Docker)**
- **Framework**: FastAPI with Python
- **Engine**: OpenAI Whisper (base model) pre-loaded
- **API**: RESTful HTTP endpoints for transcription and health checks
- **Containerization**: Docker with pre-downloaded model for fast startup
- **Communication**: HTTP requests from Node.js backend to FastAPI service
- **Supported Formats**: MP3, WAV, WebM, M4A, OGG, FLAC
- **Processing**: Isolated microservice execution for security and scalability

## Technical Flow

### 1. **User Authentication Flow**
- Registration/Login with Zod validation
- JWT token storage in localStorage
- Protected routes with middleware validation
- Automatic token refresh handling

### 2. **Audio Transcription Flow (Microservice Architecture)**
```
User uploads/records audio → Express API receives file → 
Multer stores temporarily → HTTP request to Whisper microservice → 
FastAPI processes with Whisper model → JSON response → 
Backend cleans up files → Frontend displays results
```

### 3. **Slide Generation Flow**
```
User submits transcription → Google Gemini AI analyzes content → 
AI generates structured slides → Backend stores in database → 
Frontend displays slides → User can export to PowerPoint
```

### 4. **Development Workflow**
- `./run-all.sh` - Automated setup and concurrent server startup
- Frontend: http://localhost:3000 (Next.js with Turbopack)
- Backend: http://localhost:5000 (Express with tsx watch)
- Whisper Service: http://localhost:8000 (FastAPI microservice)
- Docker Compose orchestrates Whisper microservice automatically

## Key Components

### **Frontend Components**
- `AudioRecorder` - Main transcription interface with waveform visualization
- `ProtectedRoute` - Authentication wrapper
- `AppLayout` - Consistent navigation and layout
- `AuthForm` - Login/signup forms with validation

### **Backend Services**
- `AuthService` - User authentication and JWT management
- `UserService` - User CRUD operations
- `SlideGeneratorService` - AI-powered slide generation
- `PptxExportService` - PowerPoint export with themes
- `transcribe.ts` - HTTP communication with Whisper microservice
- Database schemas with automatic UUID generation

### **Whisper Microservice Components**
- `main.py` - FastAPI application with transcription endpoints
- `/transcribe` - Audio processing endpoint
- `/health` - Service health monitoring
- Pre-loaded Whisper model for fast processing

### **Infrastructure**
- FastAPI microservice architecture with HTTP communication
- Docker Compose orchestration for local development
- Comprehensive error handling and logging across services
- CORS configuration for cross-origin requests
- Security headers via Helmet

## Database Schema
```typescript
Users {
  id: UUID (primary key)
  email: string (unique)
  password: string (hashed)
  firstName: string
  lastName: string  
  createdAt: timestamp
  updatedAt: timestamp
}
```

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /me` - Get current user (protected)
- `POST /logout` - User logout (protected)

### Users (`/api/users`)
- `GET /` - Get all users (protected)
- `GET /stats` - Get user statistics (protected)
- `GET /:id` - Get user by ID (protected)
- `PUT /profile` - Update user profile (protected)
- `DELETE /account` - Delete user account (protected)

### Transcription (`/api/transcribe`)
- `POST /` - Transcribe audio file via Whisper microservice (protected)
- `GET /health` - Check Whisper microservice health (protected)

### Audio-to-Slides (`/api/audio-to-slides`)
- `POST /` - Upload audio, transcribe, and generate slides in one workflow (protected)

### Whisper Microservice (`http://localhost:8000`)
- `POST /transcribe` - Direct transcription endpoint (multipart/form-data)
- `GET /health` - Service health check
- `GET /docs` - FastAPI automatic documentation
- `GET /` - Service information

## File Structure
```
on-ed/
├── frontend/                    # Next.js frontend application
│   ├── src/
│   │   ├── app/                # App Router pages
│   │   │   ├── dashboard/      # Dashboard page
│   │   │   ├── login/          # Login page
│   │   │   └── signup/         # Registration page
│   │   ├── components/         # React components
│   │   │   ├── auth/           # Authentication components
│   │   │   ├── layout/         # Layout components
│   │   │   └── ui/             # UI components (AudioRecorder, etc.)
│   │   ├── lib/                # Utilities and configurations
│   │   │   ├── api.ts          # API client
│   │   │   ├── auth.tsx        # Auth context
│   │   │   └── validations.ts  # Zod schemas
│   │   └── types/              # TypeScript type definitions
│   └── package.json
├── backend/                    # Express backend application
│   ├── src/
│   │   ├── routes/             # API route handlers
│   │   │   ├── auth.ts         # Authentication routes
│   │   │   ├── users.ts        # User routes
│   │   │   └── transcribe.ts   # Transcription routes
│   │   ├── services/           # Business logic
│   │   │   ├── AuthService.ts  # Authentication service
│   │   │   └── UserService.ts  # User service
│   │   ├── middleware/         # Express middleware
│   │   │   ├── auth.ts         # JWT authentication
│   │   │   ├── validation.ts   # Request validation
│   │   │   └── errorHandler.ts # Error handling
│   │   ├── schemas/            # Database schemas
│   │   │   └── users.ts        # User schema (Drizzle ORM)
│   │   ├── db/                 # Database configuration
│   │   │   └── index.ts        # Database connection
│   │   └── index.ts            # Main server file
│   └── uploads/                # Temporary file storage
│   └── package.json
├── whisper/                    # FastAPI microservice for transcription
│   ├── main.py                 # FastAPI application
│   ├── requirements.txt        # Python dependencies
│   ├── Dockerfile              # Microservice container
│   ├── docker-compose.yml      # Service orchestration
│   └── README.md               # Microservice documentation
├── run-all.sh                  # Development startup script
├── stop-all.sh                 # Development shutdown script
├── PROJECT_SUMMARY.md          # Comprehensive project overview
└── CLAUDE.md                   # Development instructions
```

## Development Setup

### Prerequisites
- Node.js (v18+)
- Docker and Docker Compose
- PostgreSQL (optional, SQLite fallback available)

### Quick Start
```bash
# Clone repository
git clone <repository-url>
cd on-ed

# Run automated setup
./run-all.sh
```

### Manual Setup
```bash
# Backend setup
cd backend
npm install
npm run dev

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev

# Build and start Whisper microservice
cd whisper
docker compose up --build
```

### Environment Variables

**Backend (.env)**
```env
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
GEMINI_API_KEY=your-google-gemini-api-key
WHISPER_SERVICE_URL=http://localhost:8000
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Security Features
- JWT-based authentication with secure token handling
- Password hashing with bcrypt
- Protected API routes with middleware
- Input validation with Zod schemas
- CORS configuration for cross-origin security
- Helmet security headers
- File upload size limits and type validation
- Microservice container isolation for AI processing

## Performance Optimizations
- Next.js 15 with Turbopack for fast development
- Pre-downloaded Whisper model in FastAPI microservice
- CPU-optimized PyTorch installation
- Efficient file handling with cleanup
- Database connection pooling
- Static asset optimization

## Development Notes
- TypeScript strict mode enabled across the stack
- Shared validation schemas between frontend and backend
- Custom UI components following consistent design system
- Error handling with user-friendly messages
- Auto-reload development setup
- Comprehensive logging and monitoring
- Mobile-responsive design with touch-friendly interfaces

### Presentations (`/api/slides`)
- `POST /generate` - Generate slides from transcription (protected)
- `GET /` - Get all user presentations (protected)
- `GET /:id` - Get presentation with slides (protected)
- `DELETE /:id` - Delete presentation (protected)
- `POST /:id/export` - Export presentation to PowerPoint PPTX (protected)
- `GET /themes` - Get available export themes (protected)

## PowerPoint Export System

### Core Features
OnEd now includes a comprehensive PowerPoint export system that transforms AI-generated presentations into professional PPTX files.

### Key Components
- **PptxExportService**: Core service using PptxGenJS for PowerPoint generation
- **Export Types**: Complete TypeScript definitions for export data structures
- **Export Transformer**: Utilities for converting database presentation data to export format
- **Theme System**: Three professional themes (Professional Blue, Modern Dark, Warm Academic)
- **Export Button Component**: Frontend interface with theme selection and author customization

### Export Process
1. User selects presentation and export options (theme, author name)
2. Frontend makes API call to `/api/slides/:id/export` with selected options
3. Backend retrieves presentation data and transforms to export format
4. PptxGenJS generates PPTX buffer with applied theme styling
5. File downloads automatically with proper MIME type and sanitized filename

### Available Themes
- **Professional Blue**: Navy blue headers, Calibri font, clean white background
- **Modern Dark**: White text on dark backgrounds, Segoe UI font, orange accents
- **Warm Academic**: Brown headers, Times New Roman font, cream background with green accents

### Technical Implementation
- **Type Safety**: Complete TypeScript definitions for all export-related data structures
- **Error Handling**: Comprehensive logging and error recovery throughout export pipeline
- **File Generation**: PptxGenJS integration with proper bullet point formatting and slide layouts
- **Data Transformation**: Clean separation between database models and export formats
- **Security**: Protected endpoints with JWT authentication and user ownership validation

## Microservice Architecture Benefits

### Scalability
- **Independent Scaling**: Each service can be scaled based on demand
- **Resource Optimization**: CPU-intensive transcription isolated from web services
- **Horizontal Scaling**: Multiple Whisper instances can be deployed behind a load balancer

### Maintainability
- **Separation of Concerns**: Clear boundaries between web app and AI processing
- **Technology Flexibility**: Python for AI, TypeScript for web development
- **Independent Deployment**: Services can be updated independently

### Reliability
- **Fault Isolation**: If Whisper service fails, main app continues to function
- **Health Monitoring**: Built-in health checks for all services
- **Graceful Degradation**: System can handle partial service failures

### Development Experience
- **Local Development**: Docker Compose orchestrates all services
- **Fast Iteration**: Hot reload for all services during development
- **Clear APIs**: Well-defined HTTP interfaces between services

## Deployment Architecture

### Production Deployment Options
- **Render.com**: Optimized configuration for Render platform
- **Docker Support**: Full containerization for any cloud provider
- **Environment Variables**: Cloud-native configuration management
- **Health Checks**: Built-in monitoring for orchestration platforms

### Service Communication
- **HTTP/REST**: Standard HTTP communication between services
- **JSON APIs**: Structured data exchange with proper error handling
- **File Upload**: Multipart form data for audio processing
- **Health Monitoring**: Regular health checks for service discovery

## Future Enhancements
- **Real-time Transcription**: WebSocket streaming for live audio processing
- **GPU Support**: GPU acceleration for faster Whisper processing
- **Multiple Language Support**: Enhanced language detection and processing
- **Advanced Audio Preprocessing**: Noise reduction and audio enhancement
- **Transcription History**: User transcription management and search
- **User Analytics**: Advanced insights and usage statistics
- **LMS Integration**: Integration with learning management systems
- **Additional Export Formats**: PDF, Google Slides, and custom formats
- **Custom Theme Creation**: User-defined PowerPoint themes
- **Kubernetes Deployment**: Production orchestration with Kubernetes
- **API Gateway**: Centralized API management and authentication