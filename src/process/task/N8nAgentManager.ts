/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import type { TChatConversation } from '@/common/storage';
import { ipcBridge } from '@/common';
import { executeN8nWorkflow } from '../services/n8nService';
import { parseN8nResponse } from '@/agent/n8n/n8nResponseParser';
import { addMessage } from '../message';
import type { TMessage } from '@/common/chatLib';
import { uuid } from '@/common/utils';

export class N8nAgentManager {
  public readonly type = 'n8n';
  public readonly id: string;
  public readonly workspace: string;
  public readonly status = 'idle';
  private conversation: TChatConversation;

  constructor(conversation: TChatConversation) {
    this.id = conversation.id;
    this.conversation = conversation;
    // Set workspace from conversation extra if available
    this.workspace = conversation.extra?.workspace || '';
  }

  /**
   * Send message to n8n workflow (unified interface)
   */
  async sendMessage({ content, msg_id }: { content: string; files?: string[]; msg_id: string }): Promise<void> {
    // Save user message to database
    const userMessage: TMessage = {
      id: uuid(),
      msg_id,
      type: 'text',
      position: 'right',
      conversation_id: this.id,
      content: {
        content,
      },
      createdAt: Date.now(),
    };
    addMessage(this.id, userMessage);

    await this.execute(content, msg_id);
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

        // Save assistant message to database
        const assistantMessage: TMessage = {
          id: uuid(),
          msg_id: msgId,
          type: 'text',
          position: 'left',
          conversation_id: this.id,
          content: {
            content: markdown,
          },
          createdAt: Date.now(),
        };
        addMessage(this.id, assistantMessage);

        // Emit response message for real-time UI update
        ipcBridge.conversation.responseStream.emit({
          type: 'message',
          conversation_id: this.id,
          msg_id: msgId,
          data: markdown,
        });

        // Emit finish signal
        ipcBridge.conversation.responseStream.emit({
          type: 'finish',
          conversation_id: this.id,
          msg_id: msgId,
          data: null,
        });
      } else {
        // Handle error case
        const errorMessage = `❌ n8n workflow execution failed:\n\n${result.error || 'Unknown error'}`;
        
        // Save error message to database
        const errorMsg: TMessage = {
          id: uuid(),
          msg_id: msgId,
          type: 'text',
          position: 'left',
          conversation_id: this.id,
          content: {
            content: errorMessage,
          },
          createdAt: Date.now(),
        };
        addMessage(this.id, errorMsg);

        // Emit error message for real-time UI update
        ipcBridge.conversation.responseStream.emit({
          type: 'error',
          conversation_id: this.id,
          msg_id: msgId,
          data: errorMessage,
        });
      }
    } catch (error) {
      const errorMessage = `❌ n8n execution error:\n\n${error instanceof Error ? error.message : 'Unknown error'}`;
      
      // Save error message to database
      const errorMsg: TMessage = {
        id: uuid(),
        msg_id: msgId,
        type: 'text',
        position: 'left',
        conversation_id: this.id,
        content: {
          content: errorMessage,
        },
        createdAt: Date.now(),
      };
      addMessage(this.id, errorMsg);

      // Emit error message for real-time UI update
      ipcBridge.conversation.responseStream.emit({
        type: 'error',
        conversation_id: this.id,
        msg_id: msgId,
        data: errorMessage,
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
   * Get confirmations (n8n doesn't use confirmations)
   */
  getConfirmations(): any[] {
    return [];
  }

  /**
   * Confirm action (n8n doesn't use confirmations)
   */
  confirm(_msgId: string, _callId: string, _data: any): void {
    console.log('[n8n] Confirm called (not supported)');
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
