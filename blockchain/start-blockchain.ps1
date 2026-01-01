# GrassRoots Blockchain Quick Start Script
# This script starts the local Hardhat blockchain node

Write-Host "🔗 GrassRoots Blockchain Setup" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

Write-Host "🚀 Starting Hardhat node..." -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANT: Keep this window open!" -ForegroundColor Yellow
Write-Host "   The blockchain will stop if you close this window." -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 Next steps (in a NEW terminal):" -ForegroundColor Cyan
Write-Host "   1. cd blockchain" -ForegroundColor White
Write-Host "   2. npx hardhat run deploy.js --network localhost" -ForegroundColor White
Write-Host "   3. Copy the contract address" -ForegroundColor White
Write-Host "   4. Update frontend/blockchain-payment.html" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the blockchain" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# Start Hardhat node
npx hardhat node

