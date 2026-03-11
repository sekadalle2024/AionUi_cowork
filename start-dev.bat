@echo off
REM AionUi Development Startup Script with Memory Configuration
REM This script sets Node.js memory limit to 8GB before starting the app

echo Starting AionUi with 8GB memory allocation...

REM Set Node.js memory options
set NODE_OPTIONS=--max-old-space-size=8192

REM Start the application
npm start
