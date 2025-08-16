#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🧪 Testing OnEd Services${NC}"
echo -e "${CYAN}========================${NC}"

# Test backend (without Whisper)
echo -e "\n${YELLOW}1. Testing Backend Server (without Whisper dependencies)...${NC}"
cd backend

# Install backend dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${CYAN}Installing backend dependencies...${NC}"
    npm install
fi

# Start backend in background
echo -e "${CYAN}Starting backend server...${NC}"
npm run dev > ../backend-test.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to start
echo -e "${CYAN}Waiting for backend to start...${NC}"
for i in {1..20}; do
    if curl -s http://localhost:5000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is running on http://localhost:5000${NC}"
        break
    fi
    if [ $i -eq 20 ]; then
        echo -e "${RED}❌ Backend failed to start${NC}"
        kill $BACKEND_PID 2>/dev/null
        exit 1
    fi
    sleep 1
done

# Test frontend
echo -e "\n${YELLOW}2. Testing Frontend Server...${NC}"
cd ../frontend

# Install frontend dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${CYAN}Installing frontend dependencies...${NC}"
    npm install
fi

# Start frontend in background
echo -e "${CYAN}Starting frontend server...${NC}"
npm run dev > ../frontend-test.log 2>&1 &
FRONTEND_PID=$!

# Wait for frontend to start
echo -e "${CYAN}Waiting for frontend to start...${NC}"
for i in {1..20}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend is running on http://localhost:3000${NC}"
        break
    fi
    if [ $i -eq 20 ]; then
        echo -e "${RED}❌ Frontend failed to start${NC}"
        kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
        exit 1
    fi
    sleep 1
done

# Test Whisper service (if Docker is ready)
echo -e "\n${YELLOW}3. Testing Whisper Microservice...${NC}"
cd ../whisper

# Check if Docker image is still building
if docker compose ps | grep -q "whisper-service"; then
    echo -e "${GREEN}✅ Whisper service is already running${NC}"
elif docker images | grep -q "whisper-service"; then
    echo -e "${CYAN}Starting existing Whisper service...${NC}"
    docker compose up -d
    sleep 5
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Whisper service is running on http://localhost:8000${NC}"
    else
        echo -e "${YELLOW}⚠️ Whisper service may still be starting...${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ Whisper service Docker image not ready yet${NC}"
    echo -e "${CYAN}You can check build progress with: docker compose logs -f whisper-service${NC}"
fi

# Summary
echo -e "\n${CYAN}====================${NC}"
echo -e "${GREEN}🎉 Test Results Summary${NC}"
echo -e "${CYAN}====================${NC}"
echo -e "${GREEN}✅ Backend API: http://localhost:5000${NC}"
echo -e "${GREEN}✅ Frontend: http://localhost:3000${NC}"
echo -e "${CYAN}🎯 Backend Health: http://localhost:5000/health${NC}"

if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Whisper Service: http://localhost:8000${NC}"
    echo -e "${CYAN}📚 Whisper API Docs: http://localhost:8000/docs${NC}"
else
    echo -e "${YELLOW}⏳ Whisper Service: Still building (check docker compose logs)${NC}"
fi

echo -e "\n${YELLOW}📝 Log Files:${NC}"
echo -e "${CYAN}   • Backend: backend-test.log${NC}"
echo -e "${CYAN}   • Frontend: frontend-test.log${NC}"

echo -e "\n${RED}Press Ctrl+C to stop all services${NC}"

# Keep services running
trap "echo -e '\n${YELLOW}Stopping services...${NC}'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; docker compose down 2>/dev/null; echo -e '${GREEN}All services stopped${NC}'; exit 0" SIGINT

echo -e "\n${CYAN}📊 Services are running... Press Ctrl+C to stop${NC}"
while true; do
    sleep 5
done