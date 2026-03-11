# AionUi Development Startup Script with Memory Configuration
# This script sets Node.js memory limit to 8GB before starting the app

Write-Host "Starting AionUi with 8GB memory allocation..." -ForegroundColor Green

# Set Node.js memory options
$env:NODE_OPTIONS = "--max-old-space-size=8192"

# Start the application
npm start
