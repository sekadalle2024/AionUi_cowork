/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { uuid } from '@/common/utils';
import SendBox from '@/renderer/components/sendbox';
import { useAddOrUpdateMessage } from '@/renderer/messages/hooks';
import { Message } from '@arco-design/web-react';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { parseN8nResponse } from '@/agent/n8n/n8nResponseParser';
import type { TMessage } from '@/common/chatLib';

const BACKEND_URL = 'http://localhost:3458/api/n8n/execute';

/**
 * Send request to n8n backend
 */
async function sendN8nRequest(userMessage: string, attachments?: any[]): Promise<any> {
  const response = await fetch(BACKEND_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userMessage,
      attachments,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Échec de l'exécution du workflow n8n");
  }

  return result.data;
}

const N8nSendBox: React.FC<{
  conversation_id: string;
}> = ({ conversation_id }) => {
  const { t } = useTranslation();
  const addOrUpdateMessage = useAddOrUpdateMessage();
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState('');

  const handleSend = useCallback(
    async (content: string) => {
      if (!content.trim() || sending) return;

      setSending(true);

      // Add user message
      const userMsgId = uuid();
      addOrUpdateMessage(
        {
          id: userMsgId,
          type: 'text',
          position: 'right',
          conversation_id,
          content: {
            content,
          },
          createdAt: Date.now(),
        } as TMessage,
        true
      );

      // Add assistant message placeholder
      const assistantMsgId = uuid();
      addOrUpdateMessage(
        {
          id: assistantMsgId,
          type: 'text',
          position: 'left',
          conversation_id,
          content: {
            content: '⏳ Exécution du workflow n8n...\n\n*Cela peut prendre plusieurs minutes pour les tâches complexes.*',
          },
          createdAt: Date.now(),
        } as TMessage,
        true
      );

      try {
        // Call backend
        const responseData = await sendN8nRequest(content);

        // Parse response to markdown
        const markdown = parseN8nResponse(responseData);

        // Update assistant message
        addOrUpdateMessage({
          id: assistantMsgId,
          type: 'text',
          position: 'left',
          conversation_id,
          content: {
            content: markdown,
          },
          createdAt: Date.now(),
        } as TMessage);
      } catch (error) {
        // Update with error message
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';

        let troubleshooting = '';
        if (errorMessage.includes('timeout')) {
          troubleshooting = `\n\n**Solutions:**\n1. Augmentez le timeout du backend (10 minutes par défaut)\n2. Simplifiez votre requête\n3. Vérifiez les logs du workflow n8n`;
        } else if (errorMessage.includes('Network') || errorMessage.includes('Failed to fetch')) {
          troubleshooting = `\n\n**Vérifications:**\n1. Le serveur n8n backend est-il démarré sur http://localhost:3458 ?\n2. Le workflow n8n est-il actif ?\n3. L'endpoint n8n est-il accessible ?`;
        }

        addOrUpdateMessage({
          id: assistantMsgId,
          type: 'text',
          position: 'left',
          conversation_id,
          content: {
            content: `❌ Erreur: ${errorMessage}${troubleshooting}\n\nAssurez-vous que:\n1. Le serveur n8n backend est démarré sur http://localhost:3458\n2. Le workflow n8n est actif et accessible\n3. L'endpoint n8n répond correctement`,
          },
          createdAt: Date.now(),
        } as TMessage);

        Message.error(t('Failed to execute n8n workflow'));
      } finally {
        setSending(false);
      }
    },
    [conversation_id, addOrUpdateMessage, sending, t]
  );

  return <SendBox value={input} onChange={setInput} onSend={handleSend} disabled={sending} placeholder="Entrez votre requête pour le workflow n8n (ex: Génère un programme de travail pour l'inventaire de caisse)" />;
};

export default N8nSendBox;
