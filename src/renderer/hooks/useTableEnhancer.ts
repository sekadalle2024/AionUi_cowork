/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';

/**
 * Hook to manage AIONUI Table Enhancer integration
 * Provides TypeScript interface for the table enhancement functionality
 */
export const useTableEnhancer = () => {
  const isInitialized = useRef(false);

  useEffect(() => {
    // Prevent multiple initializations
    if (isInitialized.current) return;

    // Check if the table enhancer is available
    const checkEnhancer = () => {
      if (window.aionui_flowise) {
        isInitialized.current = true;
        console.log('🔗 Table Enhancer hook connected to global instance');
        return true;
      }
      return false;
    };

    // If not immediately available, wait for it to load
    if (!checkEnhancer()) {
      const interval = setInterval(() => {
        if (checkEnhancer()) {
          clearInterval(interval);
        }
      }, 100);

      // Cleanup interval after 10 seconds if enhancer never loads
      setTimeout(() => {
        clearInterval(interval);
        if (!isInitialized.current) {
          console.warn('⚠️ Table Enhancer not loaded after 10 seconds');
        }
      }, 10000);

      return () => clearInterval(interval);
    }
  }, []);

  // Return API methods with proper TypeScript typing
  return {
    scanAndProcess: () => {
      window.aionui_flowise?.scanAndProcess();
    },
    testConnection: async () => {
      return await window.aionui_flowise?.testN8nConnection();
    },
    clearCache: () => {
      window.aionui_flowise?.clearAllCache();
    },
    getCacheInfo: () => {
      return window.aionui_flowise?.getCacheInfo();
    },
    enableHTMLLog: () => {
      window.aionui_flowise?.enableHTMLLog();
    },
    disableHTMLLog: () => {
      window.aionui_flowise?.disableHTMLLog();
    },
    isAvailable: () => {
      return !!window.aionui_flowise && isInitialized.current;
    },
  };
};

// Type definitions for the global table enhancer
declare global {
  interface Window {
    aionui_flowise?: {
      scanAndProcess: () => void;
      testN8nConnection: () => Promise<{ success: boolean; data?: any; error?: string }>;
      clearAllCache: () => void;
      getCacheInfo: () => any;
      enableHTMLLog: () => void;
      disableHTMLLog: () => void;
      version: string;
      CONFIG: {
        N8N_ENDPOINT_URL: string;
        DEBUG_LOG_HTML: boolean;
        SELECTORS: {
          CHAT_TABLES: string;
          MESSAGE_CONTAINER: string;
          MARKDOWN_BODY: string;
          TABLE_WRAPPER: string;
        };
        PROCESSED_CLASS: string;
      };
    };
  }
}
