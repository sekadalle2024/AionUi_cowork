/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback } from 'react';
import { ipcBridge } from '@/common';

/**
 * Hook to persist table modifications to the database
 * Syncs DOM changes with the message persistence system via IPC
 */
export const useTablePersistence = () => {
  /**
   * Update the message content in the database after table modification
   * @param table - The modified table element
   * @param conversationId - The conversation ID
   */
  const syncTableToDatabase = useCallback(async (table: HTMLTableElement, conversationId: string) => {
    console.log('[TablePersistence] 🔍 Starting sync for conversation:', conversationId);
    console.log('[TablePersistence] 📊 Table element:', table);

    // Debug: Log parent chain
    let parent = table.parentElement;
    let depth = 0;
    console.log('[TablePersistence] 🔍 Parent chain:');
    while (parent && depth < 10) {
      console.log(`  ${depth}: ${parent.tagName}.${parent.className} [data-message-id=${parent.getAttribute('data-message-id')}]`);
      parent = parent.parentElement;
      depth++;
    }

    // Find the message container with data-message-id
    // Need to traverse Shadow DOM boundary manually since closest() doesn't cross shadow boundaries
    let messageContainer: Element | null = null;
    let currentElement: Element | null = table;

    console.log('[TablePersistence] 🔍 Starting Shadow DOM traversal');

    while (currentElement && !messageContainer) {
      console.log('[TablePersistence] 🔍 Checking element:', currentElement.tagName, currentElement.className);

      if (currentElement.hasAttribute('data-message-id')) {
        messageContainer = currentElement;
        console.log('[TablePersistence] ✅ Found data-message-id on:', currentElement.tagName);
        break;
      }

      // Try normal parent traversal first
      const parent = currentElement.parentElement;

      if (!parent && currentElement.parentNode) {
        // We might be at a shadow root boundary
        const parentNode = currentElement.parentNode;
        if (parentNode.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
          // This is a shadow root
          const shadowRoot = parentNode as ShadowRoot;
          if (shadowRoot.host) {
            console.log('[TablePersistence] 🔍 Crossing Shadow DOM boundary from', currentElement.tagName, 'to host', shadowRoot.host.tagName);
            currentElement = shadowRoot.host;
            continue;
          }
        }
      }

      if (!parent) {
        console.log('[TablePersistence] 🔍 Reached top of DOM tree');
        break;
      }

      currentElement = parent;
    }

    if (!messageContainer) {
      console.error('[TablePersistence] ❌ Could not find message container after Shadow DOM traversal');
      return;
    }

    const messageId = messageContainer.getAttribute('data-message-id');
    if (!messageId) {
      console.error('[TablePersistence] ❌ Message container missing data-message-id');
      return;
    }

    console.log('[TablePersistence] ✅ Found message ID:', messageId);

    // Convert the table to markdown
    const markdownContent = tableToMarkdown(table);
    console.log('[TablePersistence] 📝 Converted markdown:', markdownContent.substring(0, 200));

    // Use IPC to update the message in the database
    try {
      await ipcBridge.database.updateMessageContent.invoke({
        messageId,
        conversationId,
        content: markdownContent,
      });
      console.log('[TablePersistence] ✅ Table modifications synced to database');
    } catch (error) {
      console.error('[TablePersistence] ❌ Failed to sync:', error);
    }
  }, []);

  return { syncTableToDatabase };
};

/**
 * Convert HTML table to Markdown table format
 */
function tableToMarkdown(table: HTMLTableElement): string {
  const rows: string[] = [];

  // Process header
  const thead = table.querySelector('thead');
  if (thead) {
    const headerRow = thead.querySelector('tr');
    if (headerRow) {
      const headers = Array.from(headerRow.querySelectorAll('th, td'))
        .map((cell) => cell.textContent?.trim() || '')
        .join(' | ');
      rows.push(`| ${headers} |`);

      // Add separator
      const separator = Array.from(headerRow.querySelectorAll('th, td'))
        .map(() => '---')
        .join(' | ');
      rows.push(`| ${separator} |`);
    }
  }

  // Process body
  const tbody = table.querySelector('tbody');
  const bodyRows = tbody ? tbody.querySelectorAll('tr') : table.querySelectorAll('tr');

  bodyRows.forEach((row, index) => {
    // Skip first row if no thead (it's the header)
    if (!thead && index === 0) {
      const headers = Array.from(row.querySelectorAll('th, td'))
        .map((cell) => cell.textContent?.trim() || '')
        .join(' | ');
      rows.push(`| ${headers} |`);

      const separator = Array.from(row.querySelectorAll('th, td'))
        .map(() => '---')
        .join(' | ');
      rows.push(`| ${separator} |`);
      return;
    }

    const cells = Array.from(row.querySelectorAll('td, th'))
      .map((cell) => cell.textContent?.trim() || '')
      .join(' | ');
    rows.push(`| ${cells} |`);
  });

  return '\n' + rows.join('\n') + '\n';
}
