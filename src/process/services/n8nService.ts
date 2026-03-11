/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * n8n Microservice API
 * Direct HTTP proxy to n8n backend without agent involvement
 */

const N8N_BACKEND_URL = 'http://localhost:3458/api/n8n/execute';

export type N8nExecuteRequest = {
  userMessage: string;
  attachments?: any[];
};

export type N8nExecuteResponse = {
  success: boolean;
  data?: any;
  error?: string;
  errorType?: string;
};

/**
 * Execute n8n workflow via backend microservice
 */
export async function executeN8nWorkflow(request: N8nExecuteRequest): Promise<N8nExecuteResponse> {
  try {
    console.log('[n8nService] Executing workflow:', { message: request.userMessage.substring(0, 100) });

    const response = await fetch(N8N_BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('[n8nService] Workflow executed successfully');

    return result;
  } catch (error) {
    console.error('[n8nService] Workflow execution failed:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: errorMessage,
      errorType: 'network',
    };
  }
}

/**
 * Check n8n backend health
 */
export async function checkN8nHealth(): Promise<{ status: string; available: boolean }> {
  try {
    const response = await fetch('http://localhost:3458/health', {
      method: 'GET',
    });

    if (!response.ok) {
      return { status: 'error', available: false };
    }

    const result = await response.json();
    return { status: result.status || 'ok', available: true };
  } catch (error) {
    console.error('[n8nService] Health check failed:', error);
    return { status: 'unavailable', available: false };
  }
}
