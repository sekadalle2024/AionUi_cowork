/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Message } from '@arco-design/web-react';

/**
 * Simple test component to verify TableContextMenu is loaded
 * Shows a test table and logs to console
 */
export const TableContextMenuTest: React.FC = () => {
  useEffect(() => {
    console.log('🧪 TableContextMenuTest component mounted');
    console.log('🎯 Instructions:');
    console.log('   1. Ctrl+Click on the test table below');
    console.log('   2. Or click the table, then click the floating button');

    Message.info({
      content: '🧪 Table Menu Test: Ctrl+Click on the table below',
      duration: 5000,
    });
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: '80px',
        right: '20px',
        zIndex: 10000,
        background: 'var(--color-bg-2)',
        border: '2px solid var(--color-primary-6)',
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      }}
    >
      <div style={{ marginBottom: '8px', fontWeight: 600, color: 'var(--color-text-1)' }}>🧪 Test Table Menu</div>
      <div style={{ fontSize: '12px', color: 'var(--color-text-3)', marginBottom: '12px' }}>Ctrl+Click on table below</div>
      <div className='markdown-shadow-body'>
        <table
          style={{
            border: '1px solid var(--color-border-2)',
            borderCollapse: 'collapse',
          }}
        >
          <thead>
            <tr>
              <th style={{ border: '1px solid var(--color-border-2)', padding: '8px', background: 'var(--color-fill-2)' }}>Name</th>
              <th style={{ border: '1px solid var(--color-border-2)', padding: '8px', background: 'var(--color-fill-2)' }}>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid var(--color-border-2)', padding: '8px' }}>Test 1</td>
              <td style={{ border: '1px solid var(--color-border-2)', padding: '8px' }}>Data 1</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid var(--color-border-2)', padding: '8px' }}>Test 2</td>
              <td style={{ border: '1px solid var(--color-border-2)', padding: '8px' }}>Data 2</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
