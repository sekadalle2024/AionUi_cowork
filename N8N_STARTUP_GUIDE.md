# n8n Microservice - Unified Startup Guide

## Quick Start

Use the unified startup script to launch both the Electron app and n8n backend:

```bash
npm run start:all
```

This single command will:
1. Start the n8n backend server on port 3458 (background)
2. Start the AionUi Electron app with increased memory (foreground)
3. Automatically stop the n8n backend when you close the app

## Manual Startup (Alternative)

If you prefer to run them separately:

### Terminal 1 - n8n Backend
```bash
.\scripts\start-n8n-agent.ps1
```

### Terminal 2 - Electron App
```bash
npm run start:mem
```

## Configuration

- **n8n Backend Port**: 3458
- **n8n Workflow Endpoint**: `http://localhost:5678/webhook/template`
- **Electron Memory**: 8192 MB (8 GB)

## Architecture

```
User → N8nWorkflowPage (UI)
  ↓ IPC
Main Process → n8nService
  ↓ HTTP
n8n-server (port 3458)
  ↓ HTTP
n8n Workflow (localhost:5678)
```

## Troubleshooting

### n8n backend fails to start
- Check if port 3458 is already in use
- Verify n8n is running on `http://localhost:5678`
- Check logs in the PowerShell window

### Syntax errors during build
- Run `npm run lint:fix` to auto-fix formatting issues
- Run `bunx tsc --noEmit` to check for TypeScript errors

## Files Modified

- `src/common/ipcBridge.ts` - Fixed duplicate CDP config entries
- `scripts/start-all.ps1` - New unified startup script
- `package.json` - Added `start:all` command

## Next Steps

1. Test the unified startup: `npm run start:all`
2. Navigate to the n8n Workflow page in the app
3. Send a test message to verify the microservice integration
