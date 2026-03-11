/**
 * n8n Microservice Backend
 * Port: 3458
 * Architecture: Direct endpoint call with response parsing
 */

import express from 'express';
import cors from 'cors';
// Utiliser fetch natif Node.js 18+ au lieu de node-fetch
// import fetch from 'node-fetch'; // Supprimé - fetch est global

const app = express();
const PORT = 3458;

// n8n endpoint URL - Local n8n instance
const N8N_ENDPOINT = 'http://localhost:5678/webhook/template';
const N8N_TIMEOUT = 10 * 60 * 1000; // 10 minutes

app.use(cors());
app.use(express.json());

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'n8n-backend', port: PORT, endpoint: N8N_ENDPOINT });
});

/**
 * Execute n8n workflow
 * POST /api/n8n/execute
 * Body: { userMessage: string, attachments?: any[] }
 */
app.post('/api/n8n/execute', async (req, res) => {
  try {
    const { userMessage, attachments } = req.body;

    if (!userMessage || typeof userMessage !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'userMessage is required and must be a string',
      });
    }

    console.log('📥 Received request:', { userMessage: userMessage.substring(0, 100), attachments: attachments?.length || 0 });
    console.log('🔄 Calling n8n endpoint:', N8N_ENDPOINT);

    // Build request body
    let requestBody: any;
    if (attachments && attachments.length > 0) {
      requestBody = { data: { question: userMessage, attachments } };
    } else {
      requestBody = { question: userMessage };
    }

    // Call n8n endpoint with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), N8N_TIMEOUT);

    const startTime = Date.now();
    const response = await fetch(N8N_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal as any,
    });

    clearTimeout(timeoutId);

    const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`📡 Response status: ${response.status} (${elapsedTime}s)`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`n8n API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ n8n response received');

    // Normalize response
    const normalized = normalizeN8nResponse(result);

    res.json({
      success: true,
      data: normalized,
    });
  } catch (error: any) {
    console.error('❌ n8n execution error:', error.message);

    let errorMessage = error.message;
    let errorType = 'unknown';

    if (error.name === 'AbortError') {
      errorMessage = `Request timeout (>${N8N_TIMEOUT / 1000}s)`;
      errorType = 'timeout';
    } else if (error.message.includes('Failed to fetch')) {
      errorMessage = 'Network error: Unable to connect to n8n endpoint';
      errorType = 'network';
    }

    res.status(500).json({
      success: false,
      error: errorMessage,
      errorType,
    });
  }
});

/**
 * Normalize n8n response to a consistent format
 * Extracted from claraApiService.ts
 */
function normalizeN8nResponse(result: any): any {
  console.log('🔍 Normalizing n8n response...');

  if (!result) {
    return {
      type: 'error',
      content: '',
      error: 'Empty response from n8n',
    };
  }

  // FORMAT 4: New "Programme de travail" format with "data" structure
  if (Array.isArray(result) && result.length > 0) {
    const firstItem = result[0];

    if (firstItem && typeof firstItem === 'object' && 'data' in firstItem) {
      console.log('✅ FORMAT 4: Programme de travail with data structure');
      return {
        type: 'structured_data',
        data: firstItem.data,
        metadata: {
          format: 'programme_travail_data',
          timestamp: new Date().toISOString(),
          totalItems: result.length,
        },
      };
    }

    // FORMAT 1: Array with object containing 'output'
    if (firstItem && typeof firstItem === 'object' && 'output' in firstItem) {
      console.log('✅ FORMAT 1: Array with output');
      return {
        type: 'text',
        content: String(firstItem.output || ''),
        metadata: {
          stats: firstItem.stats || {},
          format: 'array_output',
        },
      };
    }
  }

  // FORMAT 2: Object with 'tables' array
  if (result && typeof result === 'object' && !Array.isArray(result) && result.tables && Array.isArray(result.tables)) {
    console.log('✅ FORMAT 2: Object with tables');
    return {
      type: 'tables',
      tables: result.tables,
      metadata: {
        status: result.status,
        tables_found: result.tables_found || result.tables.length,
        format: 'tables_array',
      },
    };
  }

  // FORMAT 3: Direct output
  if (result && typeof result === 'object' && !Array.isArray(result) && result.output && typeof result.output === 'string') {
    console.log('✅ FORMAT 3: Direct output');
    return {
      type: 'text',
      content: result.output,
      metadata: {
        format: 'direct_output',
      },
    };
  }

  // Unknown format
  console.warn('⚠️ Unknown format, returning raw');
  return {
    type: 'unknown',
    raw: result,
    metadata: {
      format: 'unknown_fallback',
    },
  };
}

app.listen(PORT, () => {
  console.log('🚀 n8n Backend Server');
  console.log('='.repeat(60));
  console.log(`📡 Listening on http://localhost:${PORT}`);
  console.log(`🔗 n8n Endpoint: ${N8N_ENDPOINT}`);
  console.log(`⏱️  Timeout: ${N8N_TIMEOUT / 1000}s`);
  console.log('📋 Endpoints:');
  console.log(`   GET  /health - Health check`);
  console.log(`   POST /api/n8n/execute - Execute workflow`);
  console.log('='.repeat(60));
});
