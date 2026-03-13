# Exemples de Code Complets

## Exemple 1: Script d'amélioration de tables

Script qui détecte les tables avec une colonne "Flowise" et les envoie à un endpoint N8N.

```javascript
(function() {
  'use strict';
  
  const CONFIG = {
    N8N_ENDPOINT: 'https://example.com/webhook/processor',
    PROCESSED_CLASS: 'flowise-processed'
  };
  
  /**
   * Find all tables in Shadow DOM
   */
  function findAllChatTables() {
    const tables = [];
    document.querySelectorAll('.markdown-shadow').forEach(host => {
      if (host.shadowRoot) {
        tables.push(...host.shadowRoot.querySelectorAll('table'));
      }
    });
    return tables;
  }
  
  /**
   * Check if table has Flowise column
   */
  function hasFlowiseColumn(table) {
    const headers = Array.from(table.querySelectorAll('th'));
    return headers.some(th => 
      th.textContent.trim().toLowerCase() === 'flowise'
    );
  }
  
  /**
   * Process a table
   */
  async function processTable(table) {
    // Skip if already processed
    if (table.classList.contains(CONFIG.PROCESSED_CLASS)) {
      return;
    }
    
    // Check for Flowise column
    if (!hasFlowiseColumn(table)) {
      return;
    }
    
    // Mark as processed
    table.classList.add(CONFIG.PROCESSED_CLASS);
    
    // Extract data
    const data = extractTableData(table);
    
    // Send to N8N
    try {
      const response = await fetch(CONFIG.N8N_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableData: data })
      });
      
      if (response.ok) {
        console.log('✅ Table processed successfully');
      }
    } catch (error) {
      console.error('❌ Failed to process table:', error);
    }
  }
  
  /**
   * Extract table data
   */
  function extractTableData(table) {
    const data = [];
    const headers = Array.from(table.querySelectorAll('th'))
      .map(th => th.textContent.trim());
    data.push(headers);
    
    table.querySelectorAll('tbody tr').forEach(row => {
      const cells = Array.from(row.querySelectorAll('td'))
        .map(td => td.textContent.trim());
      data.push(cells);
    });
    
    return data;
  }
  
  /**
   * Scan and process all tables
   */
  function scanAndProcess() {
    const tables = findAllChatTables();
    tables.forEach(processTable);
  }
  
  /**
   * Watch for new tables
   */
  function startWatching() {
    const observer = new MutationObserver(() => {
      setTimeout(scanAndProcess, 150);
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // Initialize
  console.log('🚀 Table enhancer initialized');
  scanAndProcess();
  startWatching();
})();
```

## Exemple 2: Menu contextuel pour tables

```javascript
(function() {
  'use strict';
  
  class TableContextMenu {
    constructor() {
      this.menuElement = null;
      this.targetTable = null;
      this.init();
    }
    
    init() {
      this.createMenu();
      this.attachEventListeners();
    }
    
    createMenu() {
      this.menuElement = document.createElement('div');
      this.menuElement.id = 'table-context-menu';
      this.menuElement.style.cssText = `
        position: fixed;
        background: white;
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: 8px 0;
        display: none;
        z-index: 10000;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      `;
      
      const menuItems = [
        { text: 'Edit cells', action: () => this.enableEditing() },
        { text: 'Export CSV', action: () => this.exportCSV() },
        { text: 'Copy table', action: () => this.copyTable() }
      ];
      
      menuItems.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.textContent = item.text;
        menuItem.style.cssText = `
          padding: 8px 16px;
          cursor: pointer;
        `;
        menuItem.addEventListener('mouseenter', () => {
          menuItem.style.background = '#f0f0f0';
        });
        menuItem.addEventListener('mouseleave', () => {
          menuItem.style.background = 'white';
        });
        menuItem.addEventListener('click', () => {
          item.action();
          this.hideMenu();
        });
        this.menuElement.appendChild(menuItem);
      });
      
      document.body.appendChild(this.menuElement);
    }
    
    attachEventListeners() {
      // Listen for clicks on tables
      document.addEventListener('click', (e) => {
        const path = e.composedPath();
        const table = path.find(el => el.tagName === 'TABLE');
        
        if (table && this.isTableInChat(table)) {
          // Ctrl+Click to open menu
          if (e.ctrlKey) {
            e.preventDefault();
            this.showMenu(e.clientX, e.clientY, table);
          }
        } else {
          this.hideMenu();
        }
      });
      
      // Hide menu on outside click
      document.addEventListener('click', (e) => {
        if (!this.menuElement.contains(e.target)) {
          this.hideMenu();
        }
      });
    }
    
    isTableInChat(table) {
      let element = table;
      while (element) {
        if (element.classList?.contains('message-item')) {
          return true;
        }
        element = element.parentElement || element.parentNode?.host;
      }
      return false;
    }
    
    showMenu(x, y, table) {
      this.targetTable = table;
      this.menuElement.style.left = `${x}px`;
      this.menuElement.style.top = `${y}px`;
      this.menuElement.style.display = 'block';
    }
    
    hideMenu() {
      this.menuElement.style.display = 'none';
    }
    
    enableEditing() {
      if (!this.targetTable) return;
      
      this.targetTable.querySelectorAll('td').forEach(cell => {
        cell.contentEditable = 'true';
        cell.style.cursor = 'text';
      });
      
      console.log('✅ Editing enabled');
    }
    
    exportCSV() {
      if (!this.targetTable) return;
      
      const data = this.extractTableData(this.targetTable);
      const csv = data.map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'table.csv';
      link.click();
      URL.revokeObjectURL(url);
      
      console.log('✅ CSV exported');
    }
    
    async copyTable() {
      if (!this.targetTable) return;
      
      const data = this.extractTableData(this.targetTable);
      const text = data.map(row => row.join('\t')).join('\n');
      
      try {
        await navigator.clipboard.writeText(text);
        console.log('✅ Table copied');
      } catch (err) {
        console.error('❌ Copy failed:', err);
      }
    }
    
    extractTableData(table) {
      const data = [];
      
      // Headers
      const headers = Array.from(table.querySelectorAll('th'))
        .map(th => th.textContent.trim());
      if (headers.length) data.push(headers);
      
      // Rows
      table.querySelectorAll('tbody tr').forEach(row => {
        const cells = Array.from(row.querySelectorAll('td'))
          .map(td => td.textContent.trim());
        data.push(cells);
      });
      
      return data;
    }
  }
  
  // Initialize
  new TableContextMenu();
  console.log('🎯 Context menu initialized');
})();
```

## Exemple 3: Composant React

```typescript
import React, { useEffect, useState, useCallback } from 'react';

export const TableManager: React.FC = () => {
  const [tables, setTables] = useState<HTMLTableElement[]>([]);
  
  const findAllTables = useCallback(() => {
    const foundTables: HTMLTableElement[] = [];
    
    document.querySelectorAll('.markdown-shadow').forEach(host => {
      const shadowHost = host as HTMLElement;
      if (shadowHost.shadowRoot) {
        const shadowTables = shadowHost.shadowRoot.querySelectorAll('table');
        foundTables.push(...Array.from(shadowTables));
      }
    });
    
    return foundTables;
  }, []);
  
  const isTableInChat = useCallback((table: HTMLTableElement): boolean => {
    let element: HTMLElement | ShadowRoot | null = table.parentElement;
    
    while (element) {
      if (element instanceof ShadowRoot) {
        const host = element.host as HTMLElement;
        if (host?.classList.contains('markdown-shadow')) {
          return true;
        }
        element = host.parentElement;
        continue;
      }
      
      if ((element as HTMLElement).classList?.contains('message-item')) {
        return true;
      }
      
      element = (element as HTMLElement).parentElement;
    }
    
    return false;
  }, []);
  
  useEffect(() => {
    // Initial scan
    setTables(findAllTables());
    
    // Watch for new tables
    const observer = new MutationObserver(() => {
      setTimeout(() => {
        setTables(findAllTables());
      }, 100);
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    return () => observer.disconnect();
  }, [findAllTables]);
  
  return (
    <div>
      <h3>Tables detected: {tables.length}</h3>
      {tables.map((table, index) => (
        <div key={index}>
          Table {index + 1}: {table.rows.length} rows
        </div>
      ))}
    </div>
  );
};
```

## Exemple 4: Système de persistance

```javascript
class TablePersistence {
  constructor() {
    this.db = null;
    this.init();
  }
  
  async init() {
    // Initialize IndexedDB
    const request = indexedDB.open('AIONUITables', 1);
    
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('tables')) {
        db.createObjectStore('tables', { keyPath: 'id' });
      }
    };
    
    request.onsuccess = (e) => {
      this.db = e.target.result;
      console.log('✅ Database initialized');
    };
  }
  
  async saveTable(table) {
    if (!this.db) return;
    
    const messageId = this.getMessageIdFromTable(table);
    if (!messageId) return;
    
    const data = {
      id: messageId,
      timestamp: Date.now(),
      content: this.extractTableData(table)
    };
    
    const transaction = this.db.transaction(['tables'], 'readwrite');
    const store = transaction.objectStore('tables');
    store.put(data);
    
    console.log('✅ Table saved:', messageId);
  }
  
  async loadTable(messageId) {
    if (!this.db) return null;
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['tables'], 'readonly');
      const store = transaction.objectStore('tables');
      const request = store.get(messageId);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  getMessageIdFromTable(table) {
    let element = table;
    while (element) {
      if (element.classList?.contains('message-item')) {
        return element.getAttribute('data-message-id');
      }
      element = element.parentElement || element.parentNode?.host;
    }
    return null;
  }
  
  extractTableData(table) {
    const data = [];
    table.querySelectorAll('tr').forEach(row => {
      const cells = Array.from(row.querySelectorAll('th, td'))
        .map(cell => cell.textContent.trim());
      data.push(cells);
    });
    return data;
  }
}

// Usage
const persistence = new TablePersistence();

// Save table when edited
table.addEventListener('blur', () => {
  persistence.saveTable(table);
}, true);
```

Voir [SOLUTIONS.md](./SOLUTIONS.md) pour plus de détails.
