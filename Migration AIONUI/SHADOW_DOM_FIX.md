# Shadow DOM Fix - Table Detection

## Problem Identified

The scripts `aionui_menu.js` and `aionui_flowise.js` were unable to detect tables in AIONUI chat because:

1. **Tables are rendered inside Shadow DOM** (`.markdown-shadow` host with `.markdown-shadow-body` content)
2. **Standard DOM methods don't traverse Shadow DOM boundaries**:
   - `querySelector()` and `querySelectorAll()` stop at Shadow DOM boundaries
   - `.closest()` cannot traverse from inside Shadow DOM to outside

## Root Cause

```javascript
// ❌ DOESN'T WORK - Cannot find tables inside Shadow DOM
document.querySelectorAll('.markdown-shadow-body table')
table.closest('.markdown-shadow-body')
```

The Shadow DOM encapsulation prevents these selectors from working.

## Solution Implemented

### 1. Updated `aionui_menu.js`

**Modified `isTableInChat()` function** to manually traverse Shadow DOM boundaries:

```javascript
isTableInChat(table) {
  let element = table;
  
  while (element) {
    // Check current element
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
```

### 2. Updated `aionui_flowise.js`

**Added helper functions** to find tables inside Shadow DOM:

```javascript
/**
 * Find all tables in chat, including those inside Shadow DOM
 */
function findAllChatTables() {
  const tables = [];
  
  // Find all markdown-shadow containers
  const shadowHosts = document.querySelectorAll('.markdown-shadow');
  
  shadowHosts.forEach(host => {
    if (host.shadowRoot) {
      // Query tables inside Shadow DOM
      const shadowTables = host.shadowRoot.querySelectorAll('table');
      tables.push(...Array.from(shadowTables));
    }
  });
  
  // Also check for tables outside Shadow DOM (fallback)
  const regularTables = document.querySelectorAll('.message-item table');
  tables.push(...Array.from(regularTables));
  
  return tables;
}

/**
 * Find tables within a specific container, including Shadow DOM
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
  
  // Also check for regular tables
  const regularTables = container.querySelectorAll('table');
  tables.push(...Array.from(regularTables));
  
  return tables;
}
```

**Updated all table queries** to use these helper functions:
- `scanAndProcess()` → uses `findAllChatTables()`
- Container processing → uses `findTablesInContainer(container)`
- MutationObserver → watches for `.markdown-shadow` and `.message-item` elements

### 3. Updated `TableContextMenu.tsx`

**Modified `isTableInChat()` callback** to traverse Shadow DOM:

```typescript
const isTableInChat = useCallback((table: HTMLTableElement): boolean => {
  let parent: HTMLElement | ShadowRoot | null = table.parentElement;
  
  while (parent) {
    // Check if we're in a shadow root
    if (parent instanceof ShadowRoot) {
      const host = parent.host as HTMLElement;
      if (host?.classList.contains('markdown-shadow')) {
        return true;
      }
      parent = host.parentElement;
      continue;
    }
    
    // Check for markdown-shadow-body class
    if ((parent as HTMLElement).classList?.contains('markdown-shadow-body')) {
      return true;
    }
    
    // Check for message-item with data-message-id
    if ((parent as HTMLElement).hasAttribute?.('data-message-id')) {
      return true;
    }
    
    parent = (parent as HTMLElement).parentElement;
  }
  return false;
}, []);
```

## AIONUI Table Structure

```
.message-item [data-message-id="..."]
  └── .markdown-shadow (Shadow DOM host)
      └── #shadow-root
          └── .markdown-shadow-body
              └── <table>
                  ├── <thead>
                  │   └── <tr>
                  │       └── <th>
                  └── <tbody>
                      └── <tr>
                          └── <td>
```

## Key CSS Selectors

- `.markdown-shadow` - Shadow DOM host element
- `.markdown-shadow-body` - Content inside Shadow DOM
- `.message-item` - Message container
- `[data-message-id]` - Message identifier attribute

## Testing

To verify the fix works:

1. Start the application: `bun run start`
2. Send a message with a markdown table
3. Check browser console for:
   - `✅ AIONUI Menu loaded`
   - `✅ AIONUI Flowise loaded`
   - `📊 New table detected` (when table appears)
4. Try Ctrl+Click or Alt+Click on the table to open context menu
5. Verify table enhancement detects "Flowise" column if present

## Files Modified

- `public/scripts/aionui_menu.js` - Context menu table detection
- `public/scripts/aionui_flowise.js` - Table enhancement detection
- `src/renderer/components/TableContextMenu.tsx` - React component detection

## Status

✅ Shadow DOM traversal implemented
✅ Table detection fixed for both scripts
✅ React component updated
🔄 Ready for testing
