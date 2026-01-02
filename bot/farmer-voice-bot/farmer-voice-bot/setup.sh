#!/bin/bash

# Setup script for Farmer Voice Call-Bot POC
# Usage: bash setup.sh

set -e

echo "🌾 Farmer Voice Call-Bot - Setup Script"
echo "======================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js v16+"
    exit 1
fi
echo "✅ Node.js $(node --version)"

# Check IPFS
if ! command -v ipfs &> /dev/null; then
    echo "❌ IPFS not found. Install with: go-ipfs or kubo"
    exit 1
fi
echo "✅ IPFS $(ipfs --version 2>&1 | head -1)"

# Check Ganache
if ! command -v ganache-cli &> /dev/null; then
    echo "⚠️  Ganache CLI not found. Install with: npm install -g ganache-cli"
fi

echo ""
echo "Installing dependencies..."
echo ""

# Install backend
cd backend
echo "Installing backend dependencies..."
npm install
cd ..

# Install blockchain
cd blockchain
echo "Installing blockchain dependencies..."
npm install
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo ""
echo "Terminal 1: Start IPFS"
echo "  ipfs daemon"
echo ""
echo "Terminal 2: Start Ganache"
echo "  ganache-cli --deterministic"
echo ""
echo "Terminal 3: Deploy smart contract"
echo "  cd blockchain"
echo "  echo 'PRIVATE_KEY=0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d' > .env"
echo "  echo 'GANACHE_RPC_URL=http://127.0.0.1:8545' >> .env"
echo "  npx hardhat run scripts/deploy.js --network ganache"
echo ""
echo "Terminal 4: Start backend"
echo "  cd backend"
echo "  (Copy CONTRACT_ADDRESS from deployment output)"
echo "  cat > .env << 'EOF'"
echo "PORT=3000"
echo "GANACHE_RPC_URL=http://127.0.0.1:8545"
echo "CONTRACT_ADDRESS=0x<PASTE_HERE>"
echo "PRIVATE_KEY=0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d"
echo "IPFS_API_URL=http://127.0.0.1:5001"
echo "EOF"
echo "  npm start"
echo ""
echo "Browser: Open http://localhost:3000"
echo ""
