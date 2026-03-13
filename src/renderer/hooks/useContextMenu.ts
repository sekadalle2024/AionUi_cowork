/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';

/**
 * Hook to manage AIONUI Context Menu integration
 * Provides TypeScript interface for the context menu functionality
 */
export const useContextMenu = () => {
  const isInitialized = useRef(false);

  useEffect(() => {
    // Prevent multiple initializations
    if (isInitialized.current) return;

    // Check if the context menu is available
    const checkContextMenu = () => {
      if (window.aionui_menu) {
        isInitialized.current = true;
        console.log('🔗 Context Menu hook connected to global instance');
        return true;
      }
      return false;
    };

    // If not immediately available, wait for it to load
    if (!checkContextMenu()) {
      const interval = setInterval(() => {
        if (checkContextMenu()) {
          clearInterval(interval);
        }
      }, 100);

      // Cleanup interval after 10 seconds if context menu never loads
      setTimeout(() => {
        clearInterval(interval);
        if (!isInitialized.current) {
          console.warn('⚠️ Context Menu not loaded after 10 seconds');
        }
      }, 10000);

      return () => clearInterval(interval);
    }
  }, []);

  // Return API methods with proper TypeScript typing
  return {
    showMenu: (x: number, y: number, table: HTMLTableElement) => {
      window.aionui_menu?.showMenu(x, y, table);
    },
    hideMenu: () => {
      window.aionui_menu?.hideMenu();
    },
    enableCellEditing: () => {
      window.aionui_menu?.enableCellEditing();
    },
    disableCellEditing: () => {
      window.aionui_menu?.disableCellEditing();
    },
    insertRowBelow: () => {
      window.aionui_menu?.insertRowBelow();
    },
    insertColumnRight: () => {
      window.aionui_menu?.insertColumnRight();
    },
    deleteSelectedRow: () => {
      window.aionui_menu?.deleteSelectedRow();
    },
    deleteSelectedColumn: () => {
      window.aionui_menu?.deleteSelectedColumn();
    },
    copyTableToMemory: () => {
      window.aionui_menu?.copyTableToMemory();
    },
    pasteFromExcel: () => {
      window.aionui_menu?.pasteFromExcel();
    },
    exportCSV: () => {
      window.aionui_menu?.exportCSV();
    },
    isAvailable: () => {
      return !!window.aionui_menu && isInitialized.current;
    },
  };
};

// Type definitions for the global context menu
declare global {
  interface Window {
    aionui_menu?: {
      showMenu: (x: number, y: number, table: HTMLTableElement) => void;
      hideMenu: () => void;
      enableCellEditing: () => void;
      disableCellEditing: () => void;
      insertRowBelow: () => void;
      insertColumnRight: () => void;
      deleteSelectedRow: () => void;
      deleteSelectedColumn: () => void;
      duplicateSelectedRow: () => void;
      duplicateSelectedColumn: () => void;
      clearAllRowsContent: () => void;
      clearColumnContent: () => void;
      copyTableToMemory: () => void;
      pasteTableFromMemory: () => void;
      pasteFromExcel: () => void;
      exportExcel: () => void;
      exportCSV: () => void;
      copyAsHTML: () => void;
      insertTableBelow: () => void;
      deleteTable: () => void;
      isTableInChat: (table: HTMLTableElement) => boolean;
      init: () => void;
      destroy: () => void;
    };
  }
}
