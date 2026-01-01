# Reinstall Hardhat dependencies with correct versions
Write-Host "🔧 Reinstalling Hardhat dependencies..." -ForegroundColor Green
Write-Host ""

# Remove old dependencies
Write-Host "📦 Removing old dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force node_modules
}
if (Test-Path "package-lock.json") {
    Remove-Item -Force package-lock.json
}
Write-Host "✅ Old dependencies removed" -ForegroundColor Green
Write-Host ""

# Install new dependencies
Write-Host "📦 Installing Hardhat 2.x (stable version)..." -ForegroundColor Cyan
npm install
Write-Host ""

Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Run: npx hardhat node" -ForegroundColor White
Write-Host "   2. In a new terminal: npx hardhat run deploy.js --network localhost" -ForegroundColor White
Write-Host ""

