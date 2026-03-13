/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Message } from '@arco-design/web-react';
import { useTablePersistence } from '@renderer/hooks/useTablePersistence';

type MenuPosition = { x: number; y: number };

export const TableContextMenu: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<MenuPosition>({ x: 0, y: 0 });
  const [targetTable, setTargetTable] = useState<HTMLTableElement | null>(null);
  const [activeCell, setActiveCell] = useState<HTMLTableCellElement | null>(null);
  const [showFloatingButton, setShowFloatingButton] = useState(false);

  const { syncTableToDatabase } = useTablePersistence();

  // Component mounted - ready to handle table interactions

  const isTableInChat = useCallback((table: HTMLTableElement): boolean => {
    const chatSelectors = ['.markdown-shadow-body', '.message-item', '[class*="chat"]', '[class*="message"]', '[class*="conversation"]', '.prose', '.markdown-body', '.arco-typography', '[class*="markdown"]', '[class*="content"]'];

    // Check if table is in chat area
    const inChat = chatSelectors.some((selector) => table.closest(selector));

    return inChat;
  }, []);

  const showMenu = useCallback((x: number, y: number) => {
    setPosition({
      x: Math.min(x, window.innerWidth - 220),
      y: Math.min(y, window.innerHeight - 400),
    });
    setIsVisible(true);
  }, []);

  const hideMenu = useCallback(() => {
    setIsVisible(false);
  }, []);

  const showNotification = useCallback((message: string) => {
    Message.info(message);
  }, []);

  // Sync table modifications to database
  const syncTable = useCallback(() => {
    console.log('[TableContextMenu] 🔄 syncTable called');
    console.log('[TableContextMenu] 📊 targetTable:', targetTable);

    if (!targetTable) {
      console.warn('[TableContextMenu] ⚠️ Cannot sync - missing targetTable');
      return;
    }

    // Extract conversationId from URL directly (don't rely on state)
    const url = window.location.href;
    console.log('[TableContextMenu] 🔍 Current URL:', url);

    let extractedConvId: string | null = null;

    // Try multiple patterns
    let match = url.match(/\/conversation\/([^/?#]+)/);
    if (!match) match = url.match(/\/(?:chat|c)\/([^/?#]+)/);
    if (!match) {
      const urlObj = new URL(url);
      const convId = urlObj.searchParams.get('conversation_id') || urlObj.searchParams.get('id');
      if (convId) extractedConvId = convId;
    } else {
      extractedConvId = match[1];
    }

    console.log('[TableContextMenu] 🆔 Extracted conversationId:', extractedConvId);

    if (!extractedConvId) {
      console.warn('[TableContextMenu] ⚠️ Cannot sync - could not extract conversationId from URL');
      return;
    }

    void syncTableToDatabase(targetTable, extractedConvId);
  }, [targetTable, syncTableToDatabase]);

  // Table operations
  const enableCellEditing = useCallback(() => {
    if (!targetTable) return;
    const cells = targetTable.querySelectorAll('td');
    cells.forEach((cell) => {
      (cell as HTMLElement).contentEditable = 'true';
      (cell as HTMLElement).style.cursor = 'text';

      // Add blur event to sync when user finishes editing a cell
      cell.addEventListener('blur', () => {
        syncTable();
      });
    });
    showNotification('✅ Cell editing enabled');
    hideMenu();
  }, [targetTable, showNotification, syncTable, hideMenu]);

  const insertRowBelow = useCallback(() => {
    if (!targetTable) return;
    const rows = targetTable.querySelectorAll('tr');
    const lastRow = rows[rows.length - 1];
    const numCols = lastRow.querySelectorAll('td, th').length;

    const newRow = document.createElement('tr');
    for (let i = 0; i < numCols; i++) {
      const td = document.createElement('td');
      td.textContent = 'New cell';
      td.style.border = '1px solid var(--color-border-2)';
      td.style.padding = '8px';
      newRow.appendChild(td);
    }

    const tbody = targetTable.querySelector('tbody');
    if (tbody) {
      tbody.appendChild(newRow);
    } else {
      targetTable.appendChild(newRow);
    }
    showNotification('✅ Row added');
    syncTable(); // Sync after adding row
    hideMenu();
  }, [targetTable, showNotification, syncTable, hideMenu]);

  const insertColumnRight = useCallback(() => {
    if (!targetTable) return;
    const rows = targetTable.querySelectorAll('tr');
    rows.forEach((row) => {
      const isHeader = row.querySelector('th');
      const newCell = document.createElement(isHeader ? 'th' : 'td');
      newCell.textContent = 'New';
      newCell.style.border = '1px solid var(--color-border-2)';
      newCell.style.padding = '8px';
      row.appendChild(newCell);
    });
    showNotification('✅ Column added');
    syncTable(); // Sync after adding column
    hideMenu();
  }, [targetTable, showNotification, syncTable, hideMenu]);

  const deleteSelectedRow = useCallback(() => {
    if (!activeCell) {
      showNotification('⚠️ Click on a cell first');
      return;
    }
    const row = activeCell.closest('tr');
    if (row && window.confirm('Delete this row?')) {
      row.remove();
      showNotification('✅ Row deleted');
      syncTable(); // Sync after deleting row
    }
    hideMenu();
  }, [activeCell, showNotification, syncTable, hideMenu]);

  const deleteSelectedColumn = useCallback(() => {
    if (!activeCell || !targetTable) {
      showNotification('⚠️ Click on a cell first');
      return;
    }
    const row = activeCell.closest('tr');
    if (!row) return;

    const cells = Array.from(row.querySelectorAll('td, th'));
    const colIndex = cells.indexOf(activeCell);

    if (colIndex >= 0 && window.confirm('Delete this column?')) {
      const rows = targetTable.querySelectorAll('tr');
      rows.forEach((r) => {
        const c = r.querySelectorAll('td, th')[colIndex];
        if (c) c.remove();
      });
      showNotification('✅ Column deleted');
      syncTable(); // Sync after deleting column
    }
    hideMenu();
  }, [activeCell, targetTable, showNotification, syncTable, hideMenu]);

  const copyTable = useCallback(() => {
    if (!targetTable) return;
    const html = targetTable.outerHTML;
    navigator.clipboard
      .writeText(html)
      .then(() => showNotification('✅ Table copied'))
      .catch(() => showNotification('❌ Copy failed'));
    hideMenu();
  }, [targetTable, showNotification, hideMenu]);

  const exportCSV = useCallback(() => {
    if (!targetTable) return;
    const rows = targetTable.querySelectorAll('tr');
    const csv = Array.from(rows)
      .map((row) => {
        const cells = row.querySelectorAll('td, th');
        return Array.from(cells)
          .map((cell) => cell.textContent?.trim() || '')
          .join(',');
      })
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'table-export.csv';
    a.click();
    URL.revokeObjectURL(url);

    showNotification('✅ CSV exported');
    hideMenu();
  }, [targetTable, showNotification, hideMenu]);

  // Event listeners with MutationObserver and contextmenu (right-click)
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Try multiple methods to find the table
      let table = target.closest('table') as HTMLTableElement | null;

      if (!table) {
        const cell = target.closest('td, th');
        if (cell) {
          table = cell.closest('table') as HTMLTableElement | null;
        }
      }

      // If still not found, manually traverse up the DOM
      if (!table) {
        let element: HTMLElement | null = target;
        let depth = 0;
        while (element && depth < 20) {
          if (element.tagName === 'TABLE') {
            table = element as HTMLTableElement;
            break;
          }
          element = element.parentElement;
          depth++;
        }
      }

      if (table) {
        const inChat = isTableInChat(table);

        if (inChat) {
          // Prevent default context menu
          e.preventDefault();
          e.stopPropagation();

          setTargetTable(table);
          setActiveCell(target.closest('td, th') as HTMLTableCellElement | null);
          showMenu(e.pageX, e.pageY);
          return false;
        }
      }
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Close menu if clicking outside
      if (!target.closest('.table-context-menu') && !target.closest('table')) {
        hideMenu();
        setShowFloatingButton(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        hideMenu();
      }
    };

    // Attach contextmenu event to document
    document.addEventListener('contextmenu', handleContextMenu as EventListener, true);
    document.addEventListener('click', handleClick, true);
    document.addEventListener('keydown', handleKeyDown);

    // Also try to attach directly to tables (including Shadow DOM)
    const attachToTables = () => {
      const tables: HTMLTableElement[] = [];

      // Regular tables
      document.querySelectorAll('table').forEach((t) => tables.push(t as HTMLTableElement));

      // Tables in Shadow DOM
      document.querySelectorAll('.markdown-shadow-body').forEach((host) => {
        if (host.shadowRoot) {
          host.shadowRoot.querySelectorAll('table').forEach((t) => tables.push(t as HTMLTableElement));
        }
      });

      // Also check other potential shadow hosts
      document.querySelectorAll('[class*="markdown"], [class*="message"]').forEach((host) => {
        if ((host as any).shadowRoot) {
          (host as any).shadowRoot.querySelectorAll('table').forEach((t: HTMLTableElement) => tables.push(t));
        }
      });

      tables.forEach((table) => {
        table.addEventListener('contextmenu', handleContextMenu as EventListener, true);
      });
    };

    // Initial attachment
    attachToTables();

    // Watch for new tables
    const observer = new MutationObserver(() => {
      attachToTables();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu as EventListener, true);
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('keydown', handleKeyDown);
      observer.disconnect();

      // Remove handlers from tables
      const tables = document.querySelectorAll('table');
      tables.forEach((table) => {
        table.removeEventListener('contextmenu', handleContextMenu as EventListener, true);
      });
    };
  }, [isTableInChat, showMenu, hideMenu, showNotification]);

  const menuItems = [
    { icon: '✏️', text: 'Enable Editing', action: enableCellEditing },
    { icon: '➕', text: 'Insert Row', action: insertRowBelow },
    { icon: '➕', text: 'Insert Column', action: insertColumnRight },
    { icon: '🗑️', text: 'Delete Row', action: deleteSelectedRow },
    { icon: '🗑️', text: 'Delete Column', action: deleteSelectedColumn },
    { icon: '📋', text: 'Copy Table', action: copyTable },
    { icon: '📄', text: 'Export CSV', action: exportCSV },
    { icon: '❌', text: 'Close Menu', action: hideMenu },
  ];

  return (
    <>
      {/* Context Menu */}
      {isVisible && (
        <div
          className='table-context-menu'
          style={{
            position: 'fixed',
            left: `${position.x}px`,
            top: `${position.y}px`,
            background: 'var(--color-bg-1)',
            border: '2px solid var(--color-primary-6)',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
            padding: '8px',
            zIndex: 15000,
            minWidth: '200px',
            fontSize: '14px',
          }}
        >
          {menuItems.map((item, index) => (
            <div
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                item.action();
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-fill-2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                borderRadius: '4px',
                transition: 'background 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Floating Button */}
      {showFloatingButton && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (targetTable) {
              const rect = e.currentTarget.getBoundingClientRect();
              showMenu(rect.left - 200, rect.top);
            } else {
              showNotification('⚠️ Click on a table first!');
            }
          }}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: 'var(--color-primary-6)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            zIndex: 14000,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
          }}
        >
          🗃️ Table Menu
        </button>
      )}
    </>
  );
};
