# OnEd - Audio Transcription Education Platform

## Project Overview
OnEd is a full-stack TypeScript application that combines an educational platform with advanced AI-powered audio transcription capabilities and automatic PowerPoint presentation generation using OpenAI's Whisper model and Google Gemini AI via Docker containerization.

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
- **Database**: Flexible schema supporting both PostgreSQL and SQLite
- **ORM**: Drizzle ORM with automated migrations
- **Authentication**: JWT tokens with bcrypt password hashing
- **File Processing**: Multer for audio uploads (50MB limit)

### **AI Transcription System**
- **Engine**: OpenAI Whisper (base model) in Docker container
- **Containerization**: Custom Docker image with pre-downloaded model
- **Supported Formats**: MP3, WAV, WebM, M4A, OGG, FLAC
- **Processing**: Isolated Docker execution for security

## Technical Flow

### 1. **User Authentication Flow**
- Registration/Login with Zod validation
- JWT token storage in localStorage
- Protected routes with middleware validation
- Automatic token refresh handling

### 2. **Audio Transcription Flow**
```
User uploads/records audio → Express API receives file → 
Multer stores temporarily → Docker container processes → 
Whisper transcribes → JSON response → Frontend displays results
```

### 3. **Development Workflow**
- `./run-all.sh` - Automated setup and concurrent server startup
- Frontend: http://localhost:3000 (Next.js with Turbopack)
- Backend: http://localhost:5000 (Express with tsx watch)
- Docker builds Whisper container automatically

## Key Components

### **Frontend Components**
- `AudioRecorder` - Main transcription interface with waveform visualization
- `ProtectedRoute` - Authentication wrapper
- `AppLayout` - Consistent navigation and layout
- `AuthForm` - Login/signup forms with validation

### **Backend Services**
- `AuthService` - User authentication and JWT management
- `UserService` - User CRUD operations
- `transcribe.ts` - Audio processing and Docker integration
- Database schemas with automatic UUID generation

### **Infrastructure**
- Dockerized Whisper model with CPU optimization
- Comprehensive error handling and logging
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
- `POST /` - Transcribe audio file (protected)
- `GET /health` - Check Docker container health (protected)

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
│   ├── whisper/                # Docker transcription service
│   │   ├── Dockerfile          # Whisper container definition
│   │   └── transcribe.py       # Python transcription script
│   ├── uploads/                # Temporary file storage
│   └── package.json
├── run-all.sh                  # Development startup script
├── stop-all.sh                 # Development shutdown script
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

# Build Whisper Docker image
cd backend/whisper
docker build -t whisper-local .
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
- Docker container isolation for AI processing

## Performance Optimizations
- Next.js 15 with Turbopack for fast development
- Pre-downloaded Whisper model in Docker container
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

## Future Enhancements
- Real-time transcription streaming
- Multiple language support
- Advanced audio preprocessing
- Transcription history and management
- User analytics and insights
- Integration with learning management systems
- Additional export formats (PDF, Google Slides)
- Custom theme creation and management