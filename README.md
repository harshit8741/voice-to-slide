# OnEd - AI-Powered Audio Transcription & Presentation Platform

## Overview

OnEd is a comprehensive full-stack TypeScript application that transforms audio content into professional presentations. The platform combines advanced AI-powered audio transcription with intelligent slide generation and PowerPoint export capabilities.

## 🚀 Key Features

### Audio Processing
- **Real-time Audio Recording** with waveform visualization
- **Multi-format File Upload** (MP3, WAV, WebM, M4A, OGG, FLAC)
- **AI Transcription** using OpenAI Whisper model in Docker containers
- **Intelligent Content Processing** with Google Gemini AI

### Presentation Generation
- **Automatic Slide Creation** from transcriptions
- **Smart Content Structuring** with titles and bullet points
- **Professional Layouts** with 5-8 optimized slides per presentation
- **User-friendly Editing** interface for customization

### PowerPoint Export (NEW)
- **Professional PPTX Export** with PptxGenJS integration
- **Multiple Themes** (Professional Blue, Modern Dark, Warm Academic)
- **Clean Data Structure** with metadata preservation
- **Download Ready** files with proper formatting

### Authentication & Security
- **JWT-based Authentication** with secure token handling
- **Protected Routes** and API endpoints
- **User Profile Management** with account controls
- **Secure File Processing** in isolated Docker containers

## 🏗️ Architecture

### Frontend (Next.js 15)
- **Framework**: Next.js 15 with App Router and TypeScript
- **Styling**: Tailwind CSS v4 with glassmorphism design
- **State Management**: React Context for authentication
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios with centralized API configuration

### Backend (Express + TypeScript)
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL/SQLite with Drizzle ORM
- **Authentication**: JWT tokens with bcrypt hashing
- **File Processing**: Multer for uploads (50MB limit)
- **AI Integration**: Google Gemini for slide generation

### AI Services
- **Transcription**: OpenAI Whisper (base model) in Docker
- **Content Generation**: Google Gemini AI for intelligent slide creation
- **Export Processing**: PptxGenJS for PowerPoint generation

## ⚡ Quick Start

### Prerequisites
- Node.js (v18+)
- Docker and Docker Compose
- PostgreSQL (optional, SQLite fallback available)

### Development Setup
```bash
# Clone repository
git clone <repository-url>
cd on-ed

# Automated setup and startup
./dev-start.sh
```

**Access Points:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

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

## 📋 Environment Configuration

### Backend (.env)
```env
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
GEMINI_API_KEY=your-google-gemini-api-key
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 🎯 PowerPoint Export Feature

### Overview
The PPTX export feature transforms generated presentations into professional PowerPoint files with customizable themes and metadata.

### Key Capabilities
- **Theme Selection**: Choose from 3 professional themes
- **Metadata Preservation**: Includes title, author, creation date
- **Clean Formatting**: Professional layouts with consistent styling
- **Download Ready**: Proper MIME types and filename generation

### Available Themes

#### 1. Professional Blue
- Primary colors: Navy blue headers, dark text
- Font: Calibri for professional appearance
- Background: Clean white with blue accents
- Best for: Business presentations, corporate content

#### 2. Modern Dark
- Primary colors: White text on dark backgrounds
- Font: Segoe UI for modern look
- Background: Dark theme with orange accents
- Best for: Tech presentations, creative content

#### 3. Warm Academic
- Primary colors: Warm brown headers, traditional text
- Font: Times New Roman for academic feel
- Background: Cream with green accents
- Best for: Educational content, academic presentations

### Usage Examples

#### Quick Export (Default Theme)
```typescript
// Frontend usage
const handleQuickExport = async () => {
  const blob = await slidesApi.exportToPptx(presentationId, { 
    theme: 'professional' 
  });
  // File downloads automatically
};
```

#### Custom Export with Options
```typescript
// Frontend usage with custom options
const handleCustomExport = async () => {
  const exportOptions = {
    theme: 'modern',
    author: 'Dr. Jane Smith'
  };
  
  const blob = await slidesApi.exportToPptx(presentationId, exportOptions);
};
```

### API Integration

#### Export Endpoint
```http
POST /api/slides/:id/export
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "theme": "professional|modern|academic",
  "author": "Optional Author Name"
}
```

#### Response
```http
Content-Type: application/vnd.openxmlformats-officedocument.presentationml.presentation
Content-Disposition: attachment; filename="presentation_title_2024-01-15.pptx"

[Binary PPTX file data]
```

#### Get Available Themes
```http
GET /api/slides/themes
Authorization: Bearer <jwt-token>

Response:
{
  "themes": [
    {
      "name": "professional",
      "displayName": "Professional Blue",
      "description": "Clean, professional styling perfect for business presentations"
    },
    // ... other themes
  ]
}
```

## 🔧 Development Commands

### Frontend Commands
```bash
cd frontend
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Backend Commands
```bash
cd backend
npm run dev          # Start development server with auto-reload
npm run build        # Compile TypeScript
npm run start        # Start production server
npm run db:generate  # Generate database migrations
npm run db:migrate   # Apply pending migrations
npm run db:studio    # Open Drizzle Studio
```

## 📊 Database Schema

### Users Table
```sql
users {
  id: UUID (primary key)
  email: VARCHAR (unique)
  password: VARCHAR (hashed)
  firstName: VARCHAR
  lastName: VARCHAR
  createdAt: TIMESTAMP
  updatedAt: TIMESTAMP
}
```

### Presentations Table
```sql
presentations {
  id: UUID (primary key)
  title: VARCHAR
  transcription: TEXT
  userId: UUID (foreign key)
  createdAt: TIMESTAMP
  updatedAt: TIMESTAMP
}
```

### Slides Table
```sql
slides {
  id: UUID (primary key)
  presentationId: UUID (foreign key)
  title: VARCHAR
  bulletPoints: JSON
  slideOrder: INTEGER
  createdAt: TIMESTAMP
  updatedAt: TIMESTAMP
}
```

## 🛡️ Security Features

- **JWT Authentication** with secure token handling
- **Password Hashing** with bcrypt (12 rounds)
- **Protected API Routes** with middleware validation
- **Input Validation** with Zod schemas
- **CORS Configuration** for cross-origin security
- **Helmet Security Headers** for HTTP security
- **File Upload Validation** with size limits
- **Docker Container Isolation** for AI processing

## 🚀 Performance Optimizations

- **Next.js 15 with Turbopack** for fast development builds
- **Pre-downloaded Whisper Model** in Docker containers
- **CPU-optimized PyTorch** installation
- **Efficient File Handling** with automatic cleanup
- **Database Connection Pooling**
- **Static Asset Optimization**
- **Lazy Loading** for components

## 📁 Project Structure

```
on-ed/
├── frontend/                    # Next.js application
│   ├── src/
│   │   ├── app/                # App Router pages
│   │   │   ├── dashboard/      # User dashboard
│   │   │   ├── presentations/  # Presentation management
│   │   │   └── page.tsx        # Home page with audio processing
│   │   ├── components/         # React components
│   │   │   ├── auth/           # Authentication components
│   │   │   ├── layout/         # Layout components
│   │   │   └── ui/             # UI components (AudioRecorder, ExportButton)
│   │   ├── lib/                # Utilities and configurations
│   │   │   ├── api.ts          # API client with interceptors
│   │   │   ├── auth.tsx        # Auth context
│   │   │   └── validations.ts  # Zod validation schemas
│   │   └── types/              # TypeScript definitions
├── backend/                    # Express application
│   ├── src/
│   │   ├── routes/             # API endpoints
│   │   │   ├── auth.ts         # Authentication routes
│   │   │   ├── users.ts        # User management
│   │   │   ├── slides.ts       # Presentation & export routes
│   │   │   └── transcribe.ts   # Audio transcription
│   │   ├── services/           # Business logic
│   │   │   ├── AuthService.ts      # Authentication service
│   │   │   ├── UserService.ts      # User management
│   │   │   ├── slideGeneratorService.ts  # AI slide generation
│   │   │   └── pptxExportService.ts      # PowerPoint export
│   │   ├── types/              # TypeScript definitions
│   │   │   └── export.ts       # Export-related types
│   │   ├── utils/              # Utility functions
│   │   │   └── exportTransformer.ts  # Data transformation
│   │   ├── middleware/         # Express middleware
│   │   ├── schemas/            # Database schemas (Drizzle ORM)
│   │   └── db/                 # Database configuration
│   ├── whisper/                # Docker transcription service
│   │   ├── Dockerfile          # Whisper container
│   │   └── transcribe.py       # Python transcription script
│   └── uploads/                # Temporary file storage
├── dev-start.sh                # Development startup script
└── CLAUDE.md                   # Development instructions
```

## 🔗 API Reference

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/logout` - User logout (protected)

### User Management
- `GET /api/users/` - Get all users (protected)
- `GET /api/users/stats` - Get user statistics (protected)
- `GET /api/users/:id` - Get user by ID (protected)
- `PUT /api/users/profile` - Update profile (protected)
- `DELETE /api/users/account` - Delete account (protected)

### Transcription Service
- `POST /api/transcribe/` - Transcribe audio file (protected)
- `GET /api/transcribe/health` - Check service health (protected)

### Presentation Management
- `POST /api/slides/generate` - Generate slides from transcription
- `GET /api/slides/` - Get all user presentations
- `GET /api/slides/:id` - Get specific presentation
- `DELETE /api/slides/:id` - Delete presentation
- `POST /api/slides/:id/export` - Export to PowerPoint (NEW)
- `GET /api/slides/themes` - Get available export themes (NEW)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in CLAUDE.md
- Review the API reference above

---

**Built with ❤️ using TypeScript, Next.js, Express, and AI**