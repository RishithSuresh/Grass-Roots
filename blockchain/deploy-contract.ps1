# GrassRoots Smart Contract Deployment Script
# Run this AFTER starting the blockchain with start-blockchain.ps1

Write-Host "📜 GrassRoots Contract Deployment" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# Check if Hardhat node is running
Write-Host "🔍 Checking if blockchain is running..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8545" -Method POST -ContentType "application/json" -Body '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' -ErrorAction Stop
    Write-Host "✅ Blockchain is running!" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Blockchain is not running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please start the blockchain first:" -ForegroundColor Yellow
    Write-Host "   1. Open a new terminal" -ForegroundColor White
    Write-Host "   2. cd blockchain" -ForegroundColor White
    Write-Host "   3. .\start-blockchain.ps1" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "🚀 Deploying Payment contract..." -ForegroundColor Cyan
Write-Host ""

# Deploy contract
npx hardhat run deploy.js --network localhost

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Copy the contract address from above" -ForegroundColor White
Write-Host "   2. Open frontend/blockchain-payment.html" -ForegroundColor White
Write-Host "   3. Find line ~273: const CONTRACT_ADDRESS = ..." -ForegroundColor White
Write-Host "   4. Replace with your contract address" -ForegroundColor White
Write-Host "   5. Save the file" -ForegroundColor White
Write-Host ""
Write-Host "🦊 MetaMask Setup:" -ForegroundColor Cyan
Write-Host "   Network: Localhost 8545" -ForegroundColor White
Write-Host "   RPC URL: http://127.0.0.1:8545" -ForegroundColor White
Write-Host "   Chain ID: 31337" -ForegroundColor White
Write-Host "   Test Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" -ForegroundColor White
Write-Host ""

