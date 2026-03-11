# Unified Startup Script for AionUi + n8n Backend
# This script starts both the Electron app and the n8n backend server

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AionUi + n8n Backend Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Start n8n backend in background
Write-Host "[1/2] Starting n8n backend server (port 3458)..." -ForegroundColor Yellow
$n8nJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    npx ts-node --transpile-only src/agent/n8n/n8n-server.ts
}

# Wait a moment for n8n to initialize
Start-Sleep -Seconds 2

# Check if n8n started successfully
if ($n8nJob.State -eq "Running") {
    Write-Host "  [OK] n8n backend started (Job ID: $($n8nJob.Id))" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] n8n backend failed to start" -ForegroundColor Red
    Stop-Job -Job $n8nJob
    Remove-Job -Job $n8nJob
    exit 1
}

Write-Host ""
Write-Host "[2/2] Starting Electron app..." -ForegroundColor Yellow
Write-Host ""

# Start Electron app (foreground)
npm run start:mem

# Cleanup: Stop n8n backend when Electron app exits
Write-Host ""
Write-Host "Stopping n8n backend..." -ForegroundColor Yellow
Stop-Job -Job $n8nJob
Remove-Job -Job $n8nJob
Write-Host "[OK] All processes stopped" -ForegroundColor Green
