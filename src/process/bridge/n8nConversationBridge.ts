/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { ipcBridge } from '../../common';

/**
 * n8n conversation bridge
 * Handles n8n workflow execution through conversation interface
 */
export function initN8nConversationBridge(): void {
  // n8n uses the unified conversation.sendMessage interface
  // No additional bridge methods needed - all handled by conversationBridge
  console.log('[n8n] Conversation bridge initialized');
}
