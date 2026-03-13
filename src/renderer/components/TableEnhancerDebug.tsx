/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { Button, Card, Space, Typography, Message } from '@arco-design/web-react';
import { Refresh, Bug, TestTube } from '@icon-park/react';
import React, { useState } from 'react';
import { useTableEnhancer } from '../hooks/useTableEnhancer';
import { useContextMenu } from '../hooks/useContextMenu';

const { Text, Paragraph } = Typography;

/**
 * Debug component for Table Enhancer functionality
 * Only visible in development mode
 */
export const TableEnhancerDebug: React.FC = () => {
  const tableEnhancer = useTableEnhancer();
  const contextMenu = useContextMenu();
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState<string | null>(null);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const handleTestConnection = async () => {
    if (!tableEnhancer.isAvailable()) {
      Message.warning('Table Enhancer not available');
      return;
    }

    setIsTestingConnection(true);
    setConnectionResult(null);

    try {
      const result = await tableEnhancer.testConnection();
      if (result?.success) {
        setConnectionResult('✅ Connection successful!');
        Message.success('N8N connection test passed');
      } else {
        setConnectionResult(`❌ Connection failed: ${result?.error || 'Unknown error'}`);
        Message.error('N8N connection test failed');
      }
    } catch (error) {
      setConnectionResult(`❌ Error: ${error}`);
      Message.error('Connection test error');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleScanTables = () => {
    if (!tableEnhancer.isAvailable()) {
      Message.warning('Table Enhancer not available');
      return;
    }

    tableEnhancer.scanAndProcess();
    Message.info('Table scan initiated - check console for details');
  };

  const handleClearCache = () => {
    if (!tableEnhancer.isAvailable()) {
      Message.warning('Table Enhancer not available');
      return;
    }

    tableEnhancer.clearCache();
    Message.success('Cache cleared successfully');
  };

  const handleGetCacheInfo = () => {
    if (!tableEnhancer.isAvailable()) {
      Message.warning('Table Enhancer not available');
      return;
    }

    const info = tableEnhancer.getCacheInfo();
    console.log('📊 Cache Info:', info);
    Message.info('Cache info logged to console');
  };

  const handleToggleHTMLLog = (enable: boolean) => {
    if (!tableEnhancer.isAvailable()) {
      Message.warning('Table Enhancer not available');
      return;
    }

    if (enable) {
      tableEnhancer.enableHTMLLog();
      Message.success('HTML logging enabled');
    } else {
      tableEnhancer.disableHTMLLog();
      Message.success('HTML logging disabled');
    }
  };

  const handleTestContextMenu = () => {
    if (!contextMenu.isAvailable()) {
      Message.warning('Context Menu not available');
      return;
    }

    // Find a table in the DOM to test with
    const table = document.querySelector('table');
    if (table) {
      contextMenu.showMenu(100, 100, table as HTMLTableElement);
      Message.info('Context menu shown - check for menu display');
    } else {
      Message.warning('No table found to test context menu');
    }
  };

  const handleEnableCellEditing = () => {
    if (!contextMenu.isAvailable()) {
      Message.warning('Context Menu not available');
      return;
    }

    contextMenu.enableCellEditing();
    Message.success('Cell editing enabled for tables');
  };

  return (
    <Card
      title={
        <Space>
          <Bug size={16} />
          <span>Table Enhancer Debug</span>
          <Text type='secondary' style={{ fontSize: '12px' }}>
            (Development Only)
          </Text>
        </Space>
      }
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '320px',
        zIndex: 1000,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      }}
      size='small'
    >
      <Space direction='vertical' style={{ width: '100%' }}>
        <div>
          <Text style={{ fontWeight: 600 }}>Table Enhancer: </Text>
          <Text type={tableEnhancer.isAvailable() ? 'success' : 'error'}>{tableEnhancer.isAvailable() ? '✅ Available' : '❌ Not Available'}</Text>
        </div>

        <div>
          <Text style={{ fontWeight: 600 }}>Context Menu: </Text>
          <Text type={contextMenu.isAvailable() ? 'success' : 'error'}>{contextMenu.isAvailable() ? '✅ Available' : '❌ Not Available'}</Text>
        </div>

        <Space wrap>
          <Button size='mini' type='primary' icon={<TestTube />} loading={isTestingConnection} onClick={handleTestConnection} disabled={!tableEnhancer.isAvailable()}>
            Test N8N
          </Button>

          <Button size='mini' icon={<Refresh />} onClick={handleScanTables} disabled={!tableEnhancer.isAvailable()}>
            Scan Tables
          </Button>

          <Button size='mini' onClick={handleGetCacheInfo} disabled={!tableEnhancer.isAvailable()}>
            Cache Info
          </Button>
        </Space>

        <Space wrap>
          <Button size='mini' onClick={handleTestContextMenu} disabled={!contextMenu.isAvailable()}>
            Test Menu
          </Button>

          <Button size='mini' onClick={handleEnableCellEditing} disabled={!contextMenu.isAvailable()}>
            Enable Edit
          </Button>

          <Button size='mini' status='danger' onClick={handleClearCache} disabled={!tableEnhancer.isAvailable()}>
            Clear Cache
          </Button>
        </Space>

        <Space wrap>
          <Button size='mini' onClick={() => handleToggleHTMLLog(true)} disabled={!tableEnhancer.isAvailable()}>
            Enable Log
          </Button>

          <Button size='mini' onClick={() => handleToggleHTMLLog(false)} disabled={!tableEnhancer.isAvailable()}>
            Disable Log
          </Button>
        </Space>

        {connectionResult && (
          <div
            style={{
              padding: '8px',
              backgroundColor: 'var(--color-fill-2)',
              borderRadius: '4px',
              fontSize: '12px',
              fontFamily: 'monospace',
            }}
          >
            {connectionResult}
          </div>
        )}

        <Paragraph style={{ fontSize: '11px', margin: 0, color: 'var(--color-text-3)' }}>This component helps debug table enhancement features. Check browser console for detailed logs.</Paragraph>
      </Space>
    </Card>
  );
};
