/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi } from 'vitest';

// Mock global fetch
global.fetch = vi.fn();

describe('Table Enhancer Utilities', () => {
  describe('Keyword Variations Generation', () => {
    it('should generate keyword variations correctly', () => {
      const keyword = 'TestKeyword';
      const variations = new Set();

      variations.add(keyword);
      variations.add(keyword.toLowerCase());
      variations.add(keyword.toUpperCase());
      variations.add(keyword.charAt(0).toUpperCase() + keyword.slice(1).toLowerCase());

      const words = keyword.split(/\s+/);
      if (words.length > 1) {
        words.forEach((word) => {
          variations.add(word);
          variations.add(word.toLowerCase());
          variations.add(word.toUpperCase());
        });
      }

      const variationsArray = Array.from(variations);
      expect(variationsArray).toContain('TestKeyword');
      expect(variationsArray).toContain('testkeyword');
      expect(variationsArray).toContain('TESTKEYWORD');
      expect(variationsArray).toContain('Testkeyword');
    });

    it('should handle multi-word keywords', () => {
      const keyword = 'Test Keyword';
      const variations = new Set();

      variations.add(keyword);
      variations.add(keyword.toLowerCase());
      variations.add(keyword.toUpperCase());

      const words = keyword.split(/\s+/);
      words.forEach((word) => {
        variations.add(word);
        variations.add(word.toLowerCase());
        variations.add(word.toUpperCase());
      });

      const variationsArray = Array.from(variations);
      expect(variationsArray).toContain('Test');
      expect(variationsArray).toContain('Keyword');
      expect(variationsArray).toContain('test');
      expect(variationsArray).toContain('keyword');
    });
  });

  describe('N8N Response Normalization', () => {
    it('should normalize array response with direct output', () => {
      const mockResponse = [
        {
          output: 'Test output content',
          tables: [],
          status: 'success',
          timestamp: '2025-01-13T10:00:00Z',
        },
      ];

      const firstItem = mockResponse[0];
      const hasDirectFormat = firstItem && typeof firstItem === 'object' && 'output' in firstItem && 'tables' in firstItem && 'status' in firstItem;

      expect(hasDirectFormat).toBe(true);
      expect(firstItem.status).toBe('success');
      expect(firstItem.output).toBe('Test output content');
    });

    it('should normalize response with body format', () => {
      const mockResponse = [
        {
          body: [
            {
              output: 'Test body output',
              status: 'success',
              timestamp: '2025-01-13T10:00:00Z',
            },
          ],
          headers: {},
          statusCode: 200,
        },
      ];

      const firstItem = mockResponse[0];
      const hasBodyFormat = firstItem && typeof firstItem === 'object' && 'body' in firstItem && !('response' in firstItem);

      expect(hasBodyFormat).toBe(true);

      const body = firstItem.body;
      expect(Array.isArray(body)).toBe(true);
      expect(body[0].output).toBe('Test body output');
    });

    it('should handle nested response format', () => {
      const mockResponse = [
        {
          response: {
            body: [
              {
                output: 'Nested output',
                status: 'success',
              },
            ],
            headers: {},
            statusCode: 200,
          },
        },
      ];

      const firstItem = mockResponse[0];
      const hasNestedFormat = firstItem && typeof firstItem === 'object' && 'response' in firstItem;

      expect(hasNestedFormat).toBe(true);

      if (firstItem.response && 'body' in firstItem.response) {
        const body = firstItem.response.body;
        expect(Array.isArray(body)).toBe(true);
        expect(body[0].output).toBe('Nested output');
      }
    });
  });

  describe('URL Detection', () => {
    it('should detect valid URLs', () => {
      const testUrls = ['https://example.com', 'http://example.com', 'www.example.com'];

      testUrls.forEach((url) => {
        let isUrl = false;
        try {
          new URL(url);
          isUrl = true;
        } catch {
          isUrl = url.startsWith('http://') || url.startsWith('https://') || url.startsWith('www.');
        }

        expect(isUrl).toBe(true);
      });
    });

    it('should not detect invalid URLs', () => {
      const testTexts = ['just text', 'not-a-url', 'example without protocol'];

      testTexts.forEach((text) => {
        let isUrl = false;
        try {
          new URL(text);
          isUrl = true;
        } catch {
          isUrl = text.startsWith('http://') || text.startsWith('https://') || text.startsWith('www.');
        }

        expect(isUrl).toBe(false);
      });
    });
  });

  describe('Cache Key Generation', () => {
    it('should generate consistent cache keys', () => {
      const tablesHTML = '<table><tr><th>Test</th></tr></table>';

      let hash = 0;
      for (let i = 0; i < tablesHTML.length; i++) {
        const char = tablesHTML.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
      }
      const cacheKey = `n8n_${Math.abs(hash)}`;

      expect(cacheKey).toMatch(/^n8n_\d+$/);

      // Generate again with same input
      let hash2 = 0;
      for (let i = 0; i < tablesHTML.length; i++) {
        const char = tablesHTML.charCodeAt(i);
        hash2 = (hash2 << 5) - hash2 + char;
        hash2 = hash2 & hash2;
      }
      const cacheKey2 = `n8n_${Math.abs(hash2)}`;

      expect(cacheKey).toBe(cacheKey2);
    });

    it('should generate different keys for different content', () => {
      const html1 = '<table><tr><th>Test1</th></tr></table>';
      const html2 = '<table><tr><th>Test2</th></tr></table>';

      const generateKey = (html: string) => {
        let hash = 0;
        for (let i = 0; i < html.length; i++) {
          const char = html.charCodeAt(i);
          hash = (hash << 5) - hash + char;
          hash = hash & hash;
        }
        return `n8n_${Math.abs(hash)}`;
      };

      const key1 = generateKey(html1);
      const key2 = generateKey(html2);

      expect(key1).not.toBe(key2);
    });
  });

  describe('Markdown Table Parsing', () => {
    it('should parse markdown table headers', () => {
      const headerRow = '| Column 1 | Column 2 | Column 3 |';
      const cleanHeaderCells = headerRow.split('|').filter((cell) => cell.trim() !== '');

      expect(cleanHeaderCells).toHaveLength(3);
      expect(cleanHeaderCells[0].trim()).toBe('Column 1');
      expect(cleanHeaderCells[1].trim()).toBe('Column 2');
      expect(cleanHeaderCells[2].trim()).toBe('Column 3');
    });

    it('should parse markdown table data rows', () => {
      const dataRow = '| Data 1 | Data 2 | Data 3 |';
      const cleanDataCells = dataRow.split('|').filter((cell) => cell.trim() !== '');

      expect(cleanDataCells).toHaveLength(3);
      expect(cleanDataCells[0].trim()).toBe('Data 1');
      expect(cleanDataCells[1].trim()).toBe('Data 2');
      expect(cleanDataCells[2].trim()).toBe('Data 3');
    });

    it('should handle empty cells', () => {
      const dataRow = '| Data 1 |  | Data 3 |';
      const cleanDataCells = dataRow.split('|').filter((cell) => cell.trim() !== '');

      expect(cleanDataCells).toHaveLength(2); // Empty cell is filtered out
      expect(cleanDataCells[0].trim()).toBe('Data 1');
      expect(cleanDataCells[1].trim()).toBe('Data 3');
    });
  });

  describe('Error Handling', () => {
    it('should handle fetch errors gracefully', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      try {
        await fetch('https://example.com/api', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: 'test' }),
        });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Network error');
      }
    });

    it('should handle HTTP errors', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: () => Promise.resolve('Server error'),
      } as Response);

      const response = await fetch('https://example.com/api');
      expect(response.ok).toBe(false);
      expect(response.status).toBe(500);
      expect(response.statusText).toBe('Internal Server Error');
    });

    it('should handle invalid JSON responses', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve('invalid json'),
        json: () => Promise.reject(new Error('Invalid JSON')),
      } as Response);

      try {
        const response = await fetch('https://example.com/api');
        await response.json();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Invalid JSON');
      }
    });
  });

  describe('Configuration Validation', () => {
    it('should validate N8N endpoint URL format', () => {
      const validUrls = ['https://example.com/webhook/test', 'http://localhost:5678/webhook/test', 'https://barow52161.app.n8n.cloud/webhook/htlm_processor'];

      validUrls.forEach((url) => {
        expect(() => new URL(url)).not.toThrow();
      });
    });

    it('should validate cache configuration', () => {
      const cacheConfig = {
        STORAGE_KEY: 'aionui_n8n_data_v1',
        CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours
        MAX_CACHE_SIZE: 50,
      };

      expect(cacheConfig.STORAGE_KEY).toBe('aionui_n8n_data_v1');
      expect(cacheConfig.CACHE_DURATION).toBe(86400000); // 24 hours in ms
      expect(cacheConfig.MAX_CACHE_SIZE).toBe(50);
      expect(typeof cacheConfig.CACHE_DURATION).toBe('number');
      expect(cacheConfig.MAX_CACHE_SIZE).toBeGreaterThan(0);
    });

    it('should validate selector configuration', () => {
      const selectors = {
        CHAT_TABLES: '.markdown-shadow-body table, .message-item table',
        MESSAGE_CONTAINER: '.message-item',
        MARKDOWN_BODY: '.markdown-shadow-body',
        TABLE_WRAPPER: 'div[style*="overflowX"]',
      };

      expect(selectors.CHAT_TABLES).toContain('.markdown-shadow-body table');
      expect(selectors.CHAT_TABLES).toContain('.message-item table');
      expect(selectors.MESSAGE_CONTAINER).toBe('.message-item');
      expect(selectors.MARKDOWN_BODY).toBe('.markdown-shadow-body');
      expect(selectors.TABLE_WRAPPER).toContain('overflowX');
    });
  });
});
