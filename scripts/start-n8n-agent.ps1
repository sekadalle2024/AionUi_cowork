#!/usr/bin/env pwsh
# n8n Backend Server Startup Script
# Port: 3458
# Endpoint: https://fetanif511.app.n8n.cloud/webhook/integration

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  n8n Backend Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Port: 3458" -ForegroundColor Gray
Write-Host "  Endpoint: http://localhost:5678/webhook/template" -ForegroundColor Gray
Write-Host "  Timeout: 10 minutes" -ForegroundColor Gray
Write-Host ""
Write-Host "Endpoints:" -ForegroundColor Yellow
Write-Host "  GET  http://localhost:3458/health" -ForegroundColor Gray
Write-Host "  POST http://localhost:3458/api/n8n/execute" -ForegroundColor Gray
Write-Host ""
Write-Host "Starting server..." -ForegroundColor Green
Write-Host ""

# Start the server
npx ts-node --transpile-only src/agent/n8n/n8n-server.ts
