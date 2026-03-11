/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import type { TChatConversation } from '@/common/storage';
import { ipcBridge } from '@/common';
import { executeN8nWorkflow } from '../services/n8nService';
import { parseN8nResponse } from '@/agent/n8n/n8nResponseParser';

export class N8nAgentManager {
  public readonly type = 'n8n';
  public readonly id: string;
  private conversation: TChatConversation;

  constructor(conversation: TChatConversation) {
    this.id = conversation.id;
    this.conversation = conversation;
  }

  /**
   * Execute n8n workflow with user message
   */
  async execute(userMessage: string, msgId: string): Promise<void> {
    try {
      // Call n8n service
      const result = await executeN8nWorkflow({ userMessage });

      if (result.success && result.data) {
        // Parse n8n response to markdown
        const markdown = parseN8nResponse(result.data);

        // Emit response as streaming message
        ipcBridge.conversation.responseStream.emit({
          type: 'message',
          conversation_id: this.id,
          msg_id: msgId,
          data: markdown,
          status: 'finished',
        });
      } else {
        // Emit error message
        const errorMessage = `❌ n8n workflow execution failed:\n\n${result.error || 'Unknown error'}`;
        ipcBridge.conversation.responseStream.emit({
          type: 'error',
          conversation_id: this.id,
          msg_id: msgId,
          data: errorMessage,
          status: 'finished',
        });
      }
    } catch (error) {
      const errorMessage = `❌ n8n execution error:\n\n${error instanceof Error ? error.message : 'Unknown error'}`;
      ipcBridge.conversation.responseStream.emit({
        type: 'error',
        conversation_id: this.id,
        msg_id: msgId,
        data: errorMessage,
        status: 'finished',
      });
    }
  }

  /**
   * Stop execution (n8n doesn't support cancellation)
   */
  stop(): void {
    console.log('[n8n] Stop requested (not supported)');
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    console.log('[n8n] Agent manager destroyed');
  }

  /**
   * Kill task (alias for destroy)
   */
  kill(): void {
    this.destroy();
  }
}
