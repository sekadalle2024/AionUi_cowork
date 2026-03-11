/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { ipcMain } from 'electron';
import { executeN8nWorkflow, checkN8nHealth, type N8nExecuteRequest } from '@process/services/n8nService';

/**
 * Initialize n8n IPC bridge
 * Provides direct API access to n8n microservice without agent involvement
 */
export function initN8nBridge(): void {
  // Execute n8n workflow
  ipcMain.handle('n8n:execute', async (_event, request: N8nExecuteRequest) => {
    return executeN8nWorkflow(request);
  });

  // Check n8n backend health
  ipcMain.handle('n8n:health', async () => {
    return checkN8nHealth();
  });

  console.log('[n8nBridge] IPC handlers registered');
}
