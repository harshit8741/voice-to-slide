#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Paths
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
WHISPER_DIR="$PROJECT_ROOT/backend/whisper"

# PID tracking
BACKEND_PID=""
FRONTEND_PID=""

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down services...${NC}"
    
    if [ ! -z "$BACKEND_PID" ]; then
        echo -e "${CYAN}Stopping Backend (PID: $BACKEND_PID)${NC}"
        kill $BACKEND_PID 2>/dev/null
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        echo -e "${CYAN}Stopping Frontend (PID: $FRONTEND_PID)${NC}"
        kill $FRONTEND_PID 2>/dev/null
    fi
    
    # Kill any remaining Node processes
    pkill -f "tsx watch" 2>/dev/null
    pkill -f "next dev" 2>/dev/null
    
    echo -e "${GREEN}✅ All services stopped${NC}"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}🚀 Starting Audio Transcription App${NC}"
echo -e "${BLUE}===============================================${NC}"

# Check prerequisites
echo -e "\n${CYAN}🔍 Checking prerequisites...${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

# Check if Docker is installed and running
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker is not running${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# 1. Build Whisper Docker Image (if needed)
echo -e "\n${CYAN}🐳 Checking Whisper Docker Image...${NC}"
cd "$WHISPER_DIR" || {
    echo -e "${RED}❌ Failed to navigate to whisper directory${NC}"
    exit 1
}

if [[ "$(docker images -q whisper-local 2> /dev/null)" == "" ]]; then
    echo -e "${YELLOW}📦 Building Whisper Docker image with pre-downloaded model (this may take 10-15 minutes)...${NC}"
    echo -e "${CYAN}    This includes downloading PyTorch, Whisper, and the base model (~2.4GB total)${NC}"
    if docker build -t whisper-local . > build.log 2>&1; then
        echo -e "${GREEN}✅ Docker image built successfully with model included${NC}"
    else
        echo -e "${RED}❌ Failed to build Docker image. Check build.log for details${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Whisper Docker image already exists${NC}"
    # Check if the image needs to be rebuilt (if it doesn't have the pre-downloaded model)
    echo -e "${CYAN}🔍 Verifying image includes pre-downloaded model...${NC}"
fi

# 2. Setup and start Backend
echo -e "\n${CYAN}🟢 Setting up Backend Server...${NC}"
cd "$BACKEND_DIR" || {
    echo -e "${RED}❌ Failed to navigate to backend directory${NC}"
    exit 1
}

# Install backend dependencies
echo -e "${CYAN}📦 Installing backend dependencies...${NC}"
if npm install --silent; then
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install backend dependencies${NC}"
    exit 1
fi

# Setup environment file
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${YELLOW}⚠️  Created .env from .env.example - please update with your settings${NC}"
    else
        cat > .env << EOF
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
EOF
        echo -e "${YELLOW}⚠️  Created default .env file - please update with your settings${NC}"
    fi
fi

# Start backend server
echo -e "${CYAN}🚀 Starting backend server...${NC}"
npm run dev > backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to start
echo -e "${CYAN}⏳ Waiting for backend to start...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:5000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend server is running on http://localhost:5000${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Backend failed to start. Check backend.log for details${NC}"
        cleanup
        exit 1
    fi
    sleep 1
done

# 3. Setup and start Frontend
echo -e "\n${CYAN}🌐 Setting up Frontend App...${NC}"
cd "$FRONTEND_DIR" || {
    echo -e "${RED}❌ Failed to navigate to frontend directory${NC}"
    cleanup
    exit 1
}

# Install frontend dependencies
echo -e "${CYAN}📦 Installing frontend dependencies...${NC}"
if npm install --silent; then
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
    cleanup
    exit 1
fi

# Setup frontend environment
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local

# Start frontend server
echo -e "${CYAN}🚀 Starting frontend server...${NC}"
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait for frontend to start
echo -e "${CYAN}⏳ Waiting for frontend to start...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend server is running on http://localhost:3000${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Frontend failed to start. Check frontend.log for details${NC}"
        cleanup
        exit 1
    fi
    sleep 1
done

# 4. Final summary
echo -e "\n${BLUE}===============================================${NC}"
echo -e "${GREEN}🎉 All services are running successfully!${NC}"
echo -e "${BLUE}===============================================${NC}"
echo -e "${CYAN}🌐 Frontend:       http://localhost:3000${NC}"
echo -e "${CYAN}🔧 Backend API:    http://localhost:5000${NC}"
echo -e "${CYAN}❤️  Health Check:  http://localhost:5000/health${NC}"
echo -e "${CYAN}🐳 Docker Image:   whisper-local${NC}"
echo -e "${BLUE}===============================================${NC}"
echo -e "${YELLOW}📝 Features Available:${NC}"
echo -e "${CYAN}   • User registration and authentication${NC}"
echo -e "${CYAN}   • Audio file upload transcription${NC}"
echo -e "${CYAN}   • Microphone recording transcription${NC}"
echo -e "${CYAN}   • Real-time audio visualization${NC}"
echo -e "${BLUE}===============================================${NC}"
echo -e "${YELLOW}🔍 Log Files:${NC}"
echo -e "${CYAN}   • Backend: $BACKEND_DIR/backend.log${NC}"
echo -e "${CYAN}   • Frontend: $FRONTEND_DIR/frontend.log${NC}"
echo -e "${CYAN}   • Docker Build: $WHISPER_DIR/build.log${NC}"
echo -e "${BLUE}===============================================${NC}"
echo -e "${RED}Press Ctrl+C to stop all services${NC}"

# Keep script running and handle signals
echo -e "\n${CYAN}📊 Monitoring services... (Press Ctrl+C to stop)${NC}"
while true; do
    # Check if processes are still running
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        echo -e "${RED}❌ Backend process died${NC}"
        cleanup
        exit 1
    fi
    
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        echo -e "${RED}❌ Frontend process died${NC}"
        cleanup
        exit 1
    fi
    
    sleep 5
done
