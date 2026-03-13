/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { uuid } from '@/common/utils';
import SendBox from '@/renderer/components/sendbox';
import { useAddOrUpdateMessage } from '@/renderer/messages/hooks';
import { Message } from '@arco-design/web-react';
import React, { useCallback, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { TMessage } from '@/common/chatLib';
import { ipcBridge } from '@/common';

const N8nSendBox: React.FC<{
  conversation_id: string;
}> = ({ conversation_id }) => {
  const { t } = useTranslation();
  const addOrUpdateMessage = useAddOrUpdateMessage();
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState('');

  // Listen to n8n response stream
  useEffect(() => {
    return ipcBridge.conversation.responseStream.on((message) => {
      if (conversation_id !== message.conversation_id) {
        return;
      }

      if (message.type === 'message') {
        // Update assistant message with n8n response
        addOrUpdateMessage({
          id: message.msg_id,
          msg_id: message.msg_id,
          type: 'text',
          position: 'left',
          conversation_id,
          content: {
            content: message.data,
          },
          createdAt: Date.now(),
        } as TMessage);
      } else if (message.type === 'error') {
        // Update with error message
        addOrUpdateMessage({
          id: message.msg_id,
          msg_id: message.msg_id,
          type: 'text',
          position: 'left',
          conversation_id,
          content: {
            content: message.data,
          },
          createdAt: Date.now(),
        } as TMessage);
      } else if (message.type === 'finish') {
        // Stop loading state
        setSending(false);
      }
    });
  }, [conversation_id, addOrUpdateMessage]);

  const handleSend = useCallback(
    async (content: string) => {
      if (!content.trim() || sending) return;

      setSending(true);

      const msg_id = uuid();

      // Add assistant message placeholder for immediate UI feedback
      addOrUpdateMessage({
        id: msg_id,
        msg_id,
        type: 'text',
        position: 'left',
        conversation_id,
        content: {
          content: '⏳ Exécution du workflow n8n...\n\n*Cela peut prendre plusieurs minutes pour les tâches complexes.*',
        },
        createdAt: Date.now(),
      } as TMessage, true);

      try {
        // Send message via IPC bridge (this will save to database via N8nAgentManager)
        await ipcBridge.conversation.sendMessage.invoke({
          conversation_id,
          input: content,
          msg_id,
          files: [],
        });
      } catch (error) {
        // Handle error
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';

        let troubleshooting = '';
        if (errorMessage.includes('timeout')) {
          troubleshooting = `\n\n**Solutions:**\n1. Augmentez le timeout du backend (10 minutes par défaut)\n2. Simplifiez votre requête\n3. Vérifiez les logs du workflow n8n`;
        } else if (errorMessage.includes('Network') || errorMessage.includes('Failed to fetch')) {
          troubleshooting = `\n\n**Vérifications:**\n1. Le serveur n8n backend est-il démarré sur http://localhost:3458 ?\n2. Le workflow n8n est-il actif ?\n3. L'endpoint n8n est-il accessible ?`;
        }

        addOrUpdateMessage({
          id: msg_id,
          msg_id,
          type: 'text',
          position: 'left',
          conversation_id,
          content: {
            content: `❌ Erreur: ${errorMessage}${troubleshooting}\n\nAssurez-vous que:\n1. Le serveur n8n backend est démarré sur http://localhost:3458\n2. Le workflow n8n est actif et accessible\n3. L'endpoint n8n répond correctement`,
          },
          createdAt: Date.now(),
        } as TMessage);

        Message.error(t('Failed to execute n8n workflow'));
        setSending(false);
      }
    },
    [conversation_id, addOrUpdateMessage, sending, t]
  );

  return <SendBox value={input} onChange={setInput} onSend={handleSend} disabled={sending} placeholder="Entrez votre requête pour le workflow n8n (ex: Génère un programme de travail pour l'inventaire de caisse)" />;
};

export default N8nSendBox;
