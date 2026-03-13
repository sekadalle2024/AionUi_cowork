# AIONUI Table Enhancement System

## Overview

The AIONUI Table Enhancement System is adapted from the Claraverse project to improve chat interface tables. It automatically detects tables with "Flowise" columns, processes them through an N8N workflow, and displays enhanced results in the chat.

## Features

- **Dynamic Keyword Detection**: Automatically extracts keywords from "Flowise" column cells
- **Table Collection**: Gathers related tables based on detected keywords
- **N8N Integration**: Sends consolidated table data to N8N endpoint for processing
- **Enhanced Display**: Shows processed results as formatted tables in chat
- **AIONUI Styling**: Uses AIONUI's CSS variables and design system
- **Caching**: Intelligent caching system to avoid redundant API calls
- **Debug Tools**: Development-only debug interface for testing

## How It Works

### 1. Table Detection
The system scans for tables in chat messages that contain:
- A "Flowise" column header
- "Rubrique" and "Description" columns
- Located within `.message-item` or `.markdown-shadow-body` containers

### 2. Keyword Extraction
When a Flowise table is detected:
- Extracts the keyword from the first data cell in the "Flowise" column
- Generates variations (lowercase, uppercase, capitalized, word splits)
- Uses these variations for flexible matching

### 3. Data Collection
- Searches all chat messages for tables matching the keyword
- Collects tables with "Rubrique" and "Description" headers
- Includes the trigger table and user message context
- Consolidates all HTML into a single payload

### 4. N8N Processing
- Sends consolidated HTML to configured N8N endpoint
- Handles multiple response formats (Array, Object, direct output)
- Normalizes response data for consistent processing

### 5. Result Display
- Extracts tables from N8N response (HTML or Markdown)
- Applies AIONUI styling using CSS variables
- Integrates tables into chat with proper overflow handling
- Removes the original trigger table

## Configuration

### N8N Endpoint
```javascript
const CONFIG = {
  N8N_ENDPOINT_URL: "https://barow52161.app.n8n.cloud/webhook/htlm_processor",
  // ... other config
};
```

### AIONUI Selectors
```javascript
SELECTORS: {
  CHAT_TABLES: ".markdown-shadow-body table, .message-item table",
  MESSAGE_CONTAINER: ".message-item",
  MARKDOWN_BODY: ".markdown-shadow-body",
  TABLE_WRAPPER: "div[style*='overflowX']",
}
```

## Usage

### Automatic Operation
The system works automatically once loaded:
1. Monitors DOM for new tables using MutationObserver
2. Processes any table with "Flowise" column header
3. Displays enhanced results in chat

### Manual Control (Development)
```javascript
// Test N8N connection
await window.AionuiTableEnhancer.testN8nConnection();

// Manually scan for tables
window.AionuiTableEnhancer.scanAndProcess();

// Clear cache
window.AionuiTableEnhancer.clearAllCache();

// Get cache information
window.AionuiTableEnhancer.getCacheInfo();

// Enable/disable HTML logging
window.AionuiTableEnhancer.enableHTMLLog();
window.AionuiTableEnhancer.disableHTMLLog();
```

### React Hook Integration
```typescript
import { useTableEnhancer } from '@/renderer/hooks/useTableEnhancer';

const MyComponent = () => {
  const tableEnhancer = useTableEnhancer();
  
  const handleTest = async () => {
    if (tableEnhancer.isAvailable()) {
      const result = await tableEnhancer.testConnection();
      console.log('Connection result:', result);
    }
  };
  
  return (
    <button onClick={handleTest}>
      Test N8N Connection
    </button>
  );
};
```

## Styling

### AIONUI Table Styles
Tables are styled using AIONUI's CSS variables:
```css
table {
  border-collapse: collapse;
  border: 1px solid var(--bg-3);
  min-width: 100%;
  margin-bottom: 1.5rem;
}

th {
  padding: 8px;
  border: 1px solid var(--bg-3);
  background-color: var(--color-fill-2);
  font-weight: 600;
  text-align: left;
}

td {
  padding: 8px;
  border: 1px solid var(--bg-3);
  min-width: 120px;
  overflow-wrap: break-word;
  white-space: pre-wrap;
}
```

### URL Enhancement
URLs in table cells are automatically converted to clickable links:
```css
a {
  color: var(--color-primary-6);
  text-decoration: none;
  word-break: break-all;
}

a:hover {
  text-decoration: underline;
}
```

## Development

### Debug Component
In development mode, use the `TableEnhancerDebug` component:
```typescript
import { TableEnhancerDebug } from '@/renderer/components/TableEnhancerDebug';

// Add to your development layout
<TableEnhancerDebug />
```

### Console Logging
The system provides detailed console logging:
- HTML content sent to N8N (always enabled)
- Processing steps and statistics
- Error messages and stack traces
- Cache operations

### Testing
```bash
# Run tests
bun run test

# Test specific functionality
bun run test:integration
```

## Troubleshooting

### Common Issues

1. **Tables not detected**
   - Ensure table has "Flowise" column header
   - Check that table is within `.message-item` container
   - Verify table has "Rubrique" and "Description" headers

2. **N8N connection fails**
   - Check endpoint URL configuration
   - Verify N8N workflow is active
   - Test connection using debug tools

3. **Styling issues**
   - Ensure CSS variables are available
   - Check for conflicting styles
   - Verify table wrapper structure

### Debug Steps
1. Open browser console
2. Check for initialization messages
3. Use `window.AionuiTableEnhancer.testN8nConnection()`
4. Enable HTML logging for detailed output
5. Check cache information for stored data

## Migration from Claraverse

### Key Changes
- **Selectors**: Updated for AIONUI's React structure
- **Styling**: Uses CSS variables instead of Tailwind classes
- **Integration**: Loads asynchronously after React initialization
- **TypeScript**: Added proper type definitions
- **React Hooks**: Provides React-friendly API

### Compatibility
The core functionality remains compatible with Claraverse N8N workflows:
- Same data format sent to N8N
- Same response processing logic
- Same keyword detection mechanism
- Same caching system

## Performance

### Optimizations
- **Lazy Loading**: Script loads after React app initialization
- **Mutation Observer**: Efficient DOM change detection
- **Caching**: Prevents redundant N8N calls
- **Debouncing**: Prevents excessive processing during rapid DOM changes

### Memory Management
- **Cache Limits**: Maximum 50 cached entries
- **Automatic Cleanup**: Expired cache entries removed
- **Event Listeners**: Properly cleaned up on component unmount

## Security

### Content Security
- **URL Validation**: Proper URL detection and sanitization
- **XSS Prevention**: Safe HTML insertion methods
- **CORS Handling**: Proper cross-origin request configuration

### Data Privacy
- **Local Storage**: Cache stored locally only
- **No Sensitive Data**: Only table HTML content cached
- **Configurable Endpoints**: N8N endpoint can be changed per environment