/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { n8n } from '@/common/ipcBridge';
import { Button, Card, Input, Message, Spin, Typography } from '@arco-design/web-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import { parseN8nResponse } from '@/agent/n8n/n8nResponseParser';

const { TextArea } = Input;
const { Title, Paragraph } = Typography;

const N8nWorkflowPage: React.FC = () => {
  const { t } = useTranslation();
  const [userMessage, setUserMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleExecute = async () => {
    if (!userMessage.trim()) {
      Message.warning('Please enter a message');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');

    try {
      const response = await n8n.execute.invoke({ userMessage });

      if (response.success && response.data) {
        const markdown = parseN8nResponse(response.data);
        setResult(markdown);
      } else {
        setError(response.error || 'Unknown error');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      Message.error('Failed to execute workflow');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='p-24px h-full overflow-auto'>
      <Card className='max-w-1200px mx-auto'>
        <Title heading={3}>🔄 n8n Workflow Executor</Title>
        <Paragraph>Execute n8n workflows directly without agent involvement. The microservice backend handles the communication with n8n.</Paragraph>

        <div className='mt-24px'>
          <TextArea placeholder='Enter your request for the n8n workflow (e.g., Generate a work program for cash inventory)' value={userMessage} onChange={setUserMessage} autoSize={{ minRows: 3, maxRows: 10 }} disabled={loading} />
        </div>

        <div className='mt-16px'>
          <Button type='primary' onClick={handleExecute} loading={loading} disabled={!userMessage.trim()}>
            {loading ? 'Executing...' : 'Execute Workflow'}
          </Button>
        </div>

        {loading && (
          <div className='mt-24px text-center'>
            <Spin />
            <Paragraph className='mt-8px text-gray-500'>Executing n8n workflow... This may take several minutes for complex tasks.</Paragraph>
          </div>
        )}

        {error && (
          <Card className='mt-24px bg-red-50'>
            <Title heading={5} className='text-red-600'>
              ❌ Error
            </Title>
            <Paragraph className='text-red-700'>{error}</Paragraph>
            <Paragraph className='text-sm text-gray-600 mt-8px'>
              Make sure:
              <br />
              1. The n8n backend server is running on http://localhost:3458
              <br />
              2. The n8n workflow is active and accessible
              <br />
              3. The endpoint responds correctly
            </Paragraph>
          </Card>
        )}

        {result && (
          <Card className='mt-24px'>
            <Title heading={5}>✅ Result</Title>
            <div className='prose max-w-none'>
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          </Card>
        )}
      </Card>
    </div>
  );
};

export default N8nWorkflowPage;
