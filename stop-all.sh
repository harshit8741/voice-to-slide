#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🛑 Stopping Audio Transcription App Services...${NC}"

# Stop Node.js processes
echo -e "${CYAN}🔄 Stopping Node.js processes...${NC}"
pkill -f "tsx watch" 2>/dev/null && echo -e "${GREEN}✅ Backend stopped${NC}"
pkill -f "next dev" 2>/dev/null && echo -e "${GREEN}✅ Frontend stopped${NC}"

# Stop any remaining Node processes on ports 3000 and 5000
echo -e "${CYAN}🔄 Checking for processes on ports 3000 and 5000...${NC}"
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:5000 | xargs kill -9 2>/dev/null

# Clean up Docker containers (if any are running)
echo -e "${CYAN}🐳 Cleaning up Docker containers...${NC}"
docker ps -q --filter ancestor=whisper-local | xargs -r docker stop
docker ps -aq --filter ancestor=whisper-local | xargs -r docker rm

echo -e "${GREEN}🎉 All services stopped successfully!${NC}"
echo -e "${CYAN}To start again, run: ./run-all.sh${NC}"