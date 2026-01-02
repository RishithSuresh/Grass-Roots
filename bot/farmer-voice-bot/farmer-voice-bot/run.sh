#!/bin/bash

# Comprehensive startup script for Farmer Voice Call-Bot POC
# This script sets up and starts all services

set -e

PROJECT_DIR="/Users/nishanishmitha/Desktop/MP/farmer-voice-bot"
cd "$PROJECT_DIR"

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     🌾 FARMER VOICE CALL-BOT POC - STARTUP SCRIPT 🚜         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}[Step 1/4] Checking prerequisites...${NC}"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found${NC}"
    exit 1
fi
NODE_VERSION=$(node --version)
echo -e "${GREEN}✅ Node.js ${NODE_VERSION}${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi
NPM_VERSION=$(npm --version)
echo -e "${GREEN}✅ npm ${NPM_VERSION}${NC}"

echo ""
echo -e "${BLUE}[Step 2/4] Installing backend dependencies...${NC}"
cd "$PROJECT_DIR/backend"
if [ ! -d "node_modules" ]; then
    echo "Installing npm packages..."
    npm install --silent
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Backend already has node_modules${NC}"
fi

echo ""
echo -e "${BLUE}[Step 3/4] Creating environment files...${NC}"

# Create backend .env
if [ ! -f "$PROJECT_DIR/backend/.env" ]; then
    cat > "$PROJECT_DIR/backend/.env" << 'EOF'
PORT=3000
GANACHE_RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
PRIVATE_KEY=0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d
IPFS_API_URL=http://127.0.0.1:5001
EOF
    echo -e "${GREEN}✅ Created backend/.env${NC}"
else
    echo -e "${YELLOW}⚠️  backend/.env already exists${NC}"
fi

echo ""
echo -e "${BLUE}[Step 4/4] Starting backend server...${NC}"
echo ""
echo -e "${YELLOW}🎤 Backend starting on http://localhost:3000${NC}"
echo ""
echo "📝 Frontend will be served at: http://localhost:3000"
echo "📋 API endpoints:"
echo "   - POST /api/start-session"
echo "   - POST /api/upload-audio"
echo "   - POST /api/confirm-store"
echo ""
echo -e "${YELLOW}Note: IPFS and Ganache should be running separately${NC}"
echo ""
echo "Terminal Commands:"
echo "  Terminal 1: ${BLUE}ipfs daemon${NC}"
echo "  Terminal 2: ${BLUE}ganache-cli --deterministic${NC}"
echo "  Terminal 3: ${BLUE}cd blockchain && npx hardhat run scripts/deploy.js --network ganache${NC}"
echo ""
echo -e "${GREEN}Starting backend...${NC}"
echo ""

cd "$PROJECT_DIR/backend"
npm start
