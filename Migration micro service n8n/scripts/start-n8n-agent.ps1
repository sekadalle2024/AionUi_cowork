# Start n8n Backend Server
# Port: 3458

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  n8n Backend Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Node.js is not installed" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if npx is available
if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
    Write-Host "Error: npx is not available" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host "Starting n8n Backend..." -ForegroundColor Green
Write-Host "Port: 3458" -ForegroundColor White
Write-Host "Endpoint: https://fetanif511.app.n8n.cloud/webhook/integration" -ForegroundColor White
Write-Host ""

# Run the server with ts-node
npx ts-node src/agents/n8n/n8n-server.ts
