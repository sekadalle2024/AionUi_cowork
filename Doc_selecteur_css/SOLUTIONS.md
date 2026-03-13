# Solutions pour Manipuler les Tables AIONUI

## Solution 1: Trouver toutes les tables du chat

### Approche recommandée

```javascript
/**
 * Find all tables in chat messages, including those inside Shadow DOM
 * @returns {HTMLTableElement[]} Array of table elements
 */
function findAllChatTables() {
  const tables = [];
  
  // Find all Shadow DOM hosts
  const shadowHosts = document.querySelectorAll('.markdown-shadow');
  
  shadowHosts.forEach(host => {
    if (host.shadowRoot) {
      // Query tables inside Shadow DOM
      const shadowTables = host.shadowRoot.querySelectorAll('table');
      tables.push(...Array.from(shadowTables));
    }
  });
  
  // Fallback: check for tables outside Shadow DOM
  const regularTables = document.querySelectorAll('.message-item table');
  tables.push(...Array.from(regularTables));
  
  return tables;
}

// Usage
const allTables = findAllChatTables();
console.log(`Found ${allTables.length} tables`);
```

### Avec filtre

```javascript
/**
 * Find tables matching a filter function
 * @param {Function} filterFn - Function to filter tables
 * @returns {HTMLTableElement[]} Filtered tables
 */
function findTablesWhere(filterFn) {
  return findAllChatTables().filter(filterFn);
}

// Example: Find tables with "Flowise" header
const flowiseTables = findTablesWhere(table => {
  const headers = Array.from(table.querySelectorAll('th'));
  return headers.some(th => th.textContent.trim().toLowerCase() === 'flowise');
});
```

---

## Solution 2: Trouver les tables dans un message spécifique

```javascript
/**
 * Find tables within a specific message
 * @param {string} messageId - Message UUID
 * @returns {HTMLTableElement[]} Tables in that message
 */
function findTablesInMessage(messageId) {
  const message = document.querySelector(`[data-message-id="${messageId}"]`);
  if (!message) {
    console.warn(`Message ${messageId} not found`);
    return [];
  }
  
  return findTablesInContainer(message);
}

/**
 * Find tables within a container element
 * @param {HTMLElement} container - Container element
 * @returns {HTMLTableElement[]} Tables in container
 */
function findTablesInContainer(container) {
  const tables = [];
  
  // Check for Shadow DOM hosts within container
  const shadowHosts = container.querySelectorAll('.markdown-shadow');
  
  shadowHosts.forEach(host => {
    if (host.shadowRoot) {
      const shadowTables = host.shadowRoot.querySelectorAll('table');
      tables.push(...Array.from(shadowTables));
    }
  });
  
  // Also check for regular tables (fallback)
  const regularTables = container.querySelectorAll('table');
  tables.push(...Array.from(regularTables));
  
  return tables;
}

// Usage
const tables = findTablesInMessage('550e8400-e29b-41d4-a716-446655440000');
```

---

## Solution 3: Vérifier si une table est dans le chat

```javascript
/**
 * Check if a table element is inside a chat message
 * @param {HTMLTableElement} table - Table element
 * @returns {boolean} True if table is in chat
 */
function isTableInChat(table) {
  let element = table;
  
  while (element) {
    // Check if current element matches chat selectors
    if (element.classList) {
      if (element.classList.contains('markdown-shadow-body') ||
          element.classList.contains('message-item') ||
          element.hasAttribute('data-message-id')) {
        return true;
      }
    }
    
    // Move to parent, handling Shadow DOM boundaries
    if (element.parentElement) {
      element = element.parentElement;
    } else if (element.parentNode instanceof ShadowRoot) {
      // Cross Shadow DOM boundary to host element
      element = element.parentNode.host;
    } else {
      break;
    }
  }
  
  return false;
}

// Usage
document.addEventListener('click', (e) => {
  const path = e.composedPath();
  const table = path.find(el => el.tagName === 'TABLE');
  
  if (table && isTableInChat(table)) {
    console.log('Clicked on a chat table');
  }
});
```

---

## Solution 4: Trouver le message parent d'une table

```javascript
/**
 * Find the message container for a given table
 * @param {HTMLTableElement} table - Table element
 * @returns {HTMLElement|null} Message container or null
 */
function getMessageFromTable(table) {
  let element = table;
  
  while (element) {
    // Check if we reached the message container
    if (element.classList?.contains('message-item')) {
      return element;
    }
    
    // Move up the tree
    if (element.parentElement) {
      element = element.parentElement;
    } else if (element.parentNode instanceof ShadowRoot) {
      element = element.parentNode.host;
    } else {
      break;
    }
  }
  
  return null;
}

/**
 * Get message ID from a table
 * @param {HTMLTableElement} table - Table element
 * @returns {string|null} Message UUID or null
 */
function getMessageIdFromTable(table) {
  const message = getMessageFromTable(table);
  return message?.getAttribute('data-message-id') || null;
}

// Usage
const messageId = getMessageIdFromTable(table);
console.log('Table belongs to message:', messageId);
```

---

## Solution 5: Détecter les nouvelles tables (MutationObserver)

```javascript
/**
 * Watch for new tables being added to the chat
 * @param {Function} callback - Called when new tables are detected
 * @returns {MutationObserver} Observer instance
 */
function watchForNewTables(callback) {
  const observer = new MutationObserver((mutations) => {
    let shouldCheck = false;
    
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if added node is a Shadow DOM host
            if (node.classList?.contains('markdown-shadow')) {
              shouldCheck = true;
            }
            // Check if added node is a message container
            else if (node.classList?.contains('message-item')) {
              shouldCheck = true;
            }
            // Check if node contains Shadow DOM hosts
            else if (node.querySelectorAll) {
              const shadowHosts = node.querySelectorAll('.markdown-shadow, .message-item');
              if (shadowHosts.length > 0) {
                shouldCheck = true;
              }
            }
          }
        });
      }
    });
    
    if (shouldCheck) {
      // Small delay to ensure Shadow DOM is fully initialized
      setTimeout(() => {
        const newTables = findAllChatTables();
        callback(newTables);
      }, 100);
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  return observer;
}

// Usage
const observer = watchForNewTables((tables) => {
  console.log(`Detected ${tables.length} tables`);
  tables.forEach(processTable);
});

// Stop watching
// observer.disconnect();
```

---

## Solution 6: Appliquer des styles aux tables

### Méthode 1: Injecter des styles dans chaque Shadow Root

```javascript
/**
 * Inject custom styles into all Shadow DOMs
 * @param {string} css - CSS rules to inject
 */
function injectStylesIntoShadowDOM(css) {
  document.querySelectorAll('.markdown-shadow').forEach(host => {
    if (host.shadowRoot) {
      // Check if style already injected
      if (host.shadowRoot.querySelector('style[data-custom-styles]')) {
        return;
      }
      
      const style = document.createElement('style');
      style.setAttribute('data-custom-styles', 'true');
      style.textContent = css;
      host.shadowRoot.appendChild(style);
    }
  });
}

// Usage
injectStylesIntoShadowDOM(`
  table {
    border: 2px solid var(--color-primary-6) !important;
  }
  
  td:hover {
    background-color: var(--color-fill-2);
  }
`);
```

### Méthode 2: Utiliser les variables CSS

```javascript
/**
 * Set CSS variables that will be inherited by Shadow DOM
 * @param {Object} variables - CSS variable key-value pairs
 */
function setTableCSSVariables(variables) {
  const root = document.documentElement;
  
  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

// Usage
setTableCSSVariables({
  '--custom-table-border': '2px solid #4080ff',
  '--custom-cell-padding': '12px',
  '--custom-hover-bg': 'rgba(64, 128, 255, 0.1)'
});

// Then use in Shadow DOM styles
injectStylesIntoShadowDOM(`
  table {
    border: var(--custom-table-border);
  }
  
  td {
    padding: var(--custom-cell-padding);
  }
  
  td:hover {
    background: var(--custom-hover-bg);
  }
`);
```

---

## Solution 7: Rendre les cellules éditables

```javascript
/**
 * Make all cells in a table editable
 * @param {HTMLTableElement} table - Table to make editable
 * @param {Function} onSave - Callback when cell is edited
 */
function makeTableEditable(table, onSave) {
  const cells = table.querySelectorAll('td');
  
  cells.forEach(cell => {
    cell.contentEditable = 'true';
    cell.style.cursor = 'text';
    cell.setAttribute('data-original-value', cell.textContent);
    
    // Save on blur
    cell.addEventListener('blur', () => {
      const newValue = cell.textContent;
      const oldValue = cell.getAttribute('data-original-value');
      
      if (newValue !== oldValue) {
        cell.setAttribute('data-original-value', newValue);
        if (onSave) {
          onSave(table, cell, oldValue, newValue);
        }
      }
    });
    
    // Save on Enter (optional)
    cell.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        cell.blur();
      }
    });
  });
}

// Usage
const table = findAllChatTables()[0];
makeTableEditable(table, (table, cell, oldValue, newValue) => {
  console.log(`Cell changed from "${oldValue}" to "${newValue}"`);
  saveTableToDatabase(table);
});
```

---

## Solution 8: Extraire les données d'une table

```javascript
/**
 * Extract data from a table as a 2D array
 * @param {HTMLTableElement} table - Table element
 * @returns {Array<Array<string>>} Table data
 */
function extractTableData(table) {
  const data = [];
  
  // Extract headers
  const headers = Array.from(table.querySelectorAll('thead th')).map(th => 
    th.textContent.trim()
  );
  if (headers.length > 0) {
    data.push(headers);
  }
  
  // Extract rows
  const rows = table.querySelectorAll('tbody tr');
  rows.forEach(row => {
    const cells = Array.from(row.querySelectorAll('td')).map(td => 
      td.textContent.trim()
    );
    data.push(cells);
  });
  
  return data;
}

/**
 * Extract table data as objects
 * @param {HTMLTableElement} table - Table element
 * @returns {Array<Object>} Array of row objects
 */
function extractTableAsObjects(table) {
  const headers = Array.from(table.querySelectorAll('thead th')).map(th => 
    th.textContent.trim()
  );
  
  const rows = table.querySelectorAll('tbody tr');
  return Array.from(rows).map(row => {
    const obj = {};
    const cells = row.querySelectorAll('td');
    
    cells.forEach((cell, index) => {
      const header = headers[index] || `column_${index}`;
      obj[header] = cell.textContent.trim();
    });
    
    return obj;
  });
}

// Usage
const data = extractTableData(table);
console.log('Table data:', data);

const objects = extractTableAsObjects(table);
console.log('Table as objects:', objects);
```

---

## Solution 9: Exporter une table en CSV

```javascript
/**
 * Export table to CSV format
 * @param {HTMLTableElement} table - Table to export
 * @returns {string} CSV string
 */
function tableToCSV(table) {
  const data = extractTableData(table);
  
  return data.map(row => 
    row.map(cell => {
      // Escape quotes and wrap in quotes if contains comma/newline
      const escaped = cell.replace(/"/g, '""');
      return /[,\n"]/.test(cell) ? `"${escaped}"` : escaped;
    }).join(',')
  ).join('\n');
}

/**
 * Download table as CSV file
 * @param {HTMLTableElement} table - Table to download
 * @param {string} filename - Filename for download
 */
function downloadTableAsCSV(table, filename = 'table.csv') {
  const csv = tableToCSV(table);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  
  URL.revokeObjectURL(link.href);
}

// Usage
downloadTableAsCSV(table, 'chat-table.csv');
```

---

## Solution 10: Copier une table dans le presse-papiers

```javascript
/**
 * Copy table to clipboard as plain text
 * @param {HTMLTableElement} table - Table to copy
 * @returns {Promise<void>}
 */
async function copyTableToClipboard(table) {
  const data = extractTableData(table);
  const text = data.map(row => row.join('\t')).join('\n');
  
  try {
    await navigator.clipboard.writeText(text);
    console.log('Table copied to clipboard');
  } catch (err) {
    console.error('Failed to copy table:', err);
    // Fallback for older browsers
    fallbackCopyToClipboard(text);
  }
}

/**
 * Fallback copy method for older browsers
 * @param {string} text - Text to copy
 */
function fallbackCopyToClipboard(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  
  try {
    document.execCommand('copy');
    console.log('Table copied (fallback)');
  } catch (err) {
    console.error('Fallback copy failed:', err);
  }
  
  document.body.removeChild(textarea);
}

// Usage
copyTableToClipboard(table);
```

---

## Solution complète: Classe utilitaire

```javascript
/**
 * Utility class for working with AIONUI chat tables
 */
class AIONUITableManager {
  constructor() {
    this.tables = new Map();
    this.observer = null;
  }
  
  /**
   * Initialize the manager and start watching for tables
   */
  init() {
    this.scanExistingTables();
    this.startWatching();
  }
  
  /**
   * Scan for existing tables
   */
  scanExistingTables() {
    const tables = this.findAllTables();
    tables.forEach(table => {
      const id = this.getTableId(table);
      this.tables.set(id, table);
    });
    console.log(`Found ${this.tables.size} existing tables`);
  }
  
  /**
   * Start watching for new tables
   */
  startWatching() {
    this.observer = watchForNewTables((tables) => {
      tables.forEach(table => {
        const id = this.getTableId(table);
        if (!this.tables.has(id)) {
          this.tables.set(id, table);
          this.onNewTable(table);
        }
      });
    });
  }
  
  /**
   * Stop watching
   */
  stopWatching() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
  
  /**
   * Find all tables
   */
  findAllTables() {
    return findAllChatTables();
  }
  
  /**
   * Get unique ID for a table
   */
  getTableId(table) {
    if (!table.dataset.tableId) {
      table.dataset.tableId = `table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    return table.dataset.tableId;
  }
  
  /**
   * Called when a new table is detected
   */
  onNewTable(table) {
    console.log('New table detected:', this.getTableId(table));
    // Override this method to add custom behavior
  }
  
  /**
   * Get table by ID
   */
  getTable(id) {
    return this.tables.get(id);
  }
  
  /**
   * Get all tables
   */
  getAllTables() {
    return Array.from(this.tables.values());
  }
}

// Usage
const manager = new AIONUITableManager();
manager.onNewTable = (table) => {
  console.log('Processing new table...');
  // Your custom logic here
};
manager.init();
```

---

## Références

- [STRUCTURE_DOM.md](./STRUCTURE_DOM.md) - Structure du DOM
- [PROBLEMES_COURANTS.md](./PROBLEMES_COURANTS.md) - Problèmes et diagnostics
- [EXEMPLES_CODE.md](./EXEMPLES_CODE.md) - Exemples complets
- [SELECTEURS_RECOMMANDES.md](./SELECTEURS_RECOMMANDES.md) - Liste des sélecteurs
