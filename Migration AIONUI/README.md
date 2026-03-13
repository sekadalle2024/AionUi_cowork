# Migration AIONUI - Table Enhancement System

## Overview

This directory contains all files related to the migration and adaptation of Claraverse's table enhancement system to AIONUI. The system automatically detects tables with "Flowise" columns in chat conversations, processes them through N8N workflows, and displays enhanced results.

## Directory Structure

```
Migration AIONUI/
├── README.md                           # This file - main documentation
├── source-claraverse/                  # Original Claraverse scripts
│   ├── Flowise.js                     # Original Claraverse V17.1 script
│   ├── Data.js                        # Data processing utilities
│   └── menu.js                        # Menu handling scripts
├── scripts/                           # Migration-specific scripts
│   └── migration-utils.js             # Utility functions for migration
├── documentation/                     # Complete documentation
│   ├── CHAT_UI_IMPROVEMENTS.md        # Implementation guide
│   └── table-enhancement.md           # Technical documentation
└── examples/                          # Usage examples and templates
    └── table-examples.md              # Sample table formats
```

## Files in AIONUI Project

### Public Scripts (Required at Runtime)
- `public/scripts/aionui-table-enhancer.js` - Main enhancement script (adapted from Claraverse)

### React Components & Hooks
- `src/renderer/hooks/useTableEnhancer.ts` - TypeScript hook for React integration
- `src/renderer/components/TableEnhancerDebug.tsx` - Development debug component

### Tests
- `tests/unit/table-enhancer-utils.test.ts` - Unit tests (18 tests covering core functionality)

### Modified Files
- `src/renderer/index.html` - Added asynchronous script loading

## Key Adaptations from Claraverse

### 1. Selector Updates
```javascript
// Claraverse (Tailwind-based)
SELECTORS: {
  CHAT_TABLES: "div.prose.prose-base.dark\\:prose-invert.max-w-none table.min-w-full.border.border-gray-200.dark\\:border-gray-700.rounded-lg",
  PARENT_DIV: "div.prose.prose-base.dark\\:prose-invert.max-w-none",
  OVERFLOW_CONTAINER: "div.overflow-x-auto.my-4",
}

// AIONUI (React/CSS Variables)
SELECTORS: {
  CHAT_TABLES: ".markdown-shadow-body table, .message-item table",
  MESSAGE_CONTAINER: ".message-item",
  MARKDOWN_BODY: ".markdown-shadow-body",
  TABLE_WRAPPER: "div[style*='overflowX']",
}
```

### 2. Styling Migration
```css
/* Claraverse (Tailwind classes) */
.min-w-full.border.border-gray-200.dark:border-gray-700.rounded-lg

/* AIONUI (CSS Variables) */
table {
  border-collapse: collapse;
  border: 1px solid var(--bg-3);
  min-width: 100%;
  margin-bottom: 1.5rem;
}
```

### 3. Integration Method
```html
<!-- Claraverse (Direct script inclusion) -->
<script src="./Flowise.js"></script>

<!-- AIONUI (Asynchronous loading after React) -->
<script>
  function loadTableEnhancer() {
    const root = document.getElementById('root');
    if (root && root.children.length > 0) {
      const script = document.createElement('script');
      script.src = '../scripts/aionui-table-enhancer.js';
      script.async = true;
      document.head.appendChild(script);
    } else {
      setTimeout(loadTableEnhancer, 100);
    }
  }
  setTimeout(loadTableEnhancer, 500);
</script>
```

## Features Implemented

### ✅ Core Functionality
- **Automatic Table Detection**: Scans for tables with "Flowise" column headers
- **Dynamic Keyword Extraction**: Gets keywords from "Flowise" column cells
- **Smart Table Collection**: Gathers related tables based on extracted keywords
- **N8N Integration**: Sends consolidated HTML to configured endpoint
- **Enhanced Display**: Shows processed results with AIONUI styling

### ✅ Performance & Reliability
- **Intelligent Caching**: 24-hour cache with 50-entry limit
- **Asynchronous Loading**: Script loads after React app initialization
- **Error Handling**: Comprehensive error management and logging
- **Memory Management**: Automatic cleanup and resource management

### ✅ Development Tools
- **Debug Interface**: Development-only component for testing
- **Console Logging**: Detailed logging for troubleshooting
- **TypeScript Integration**: Full type safety with React hooks
- **Unit Tests**: 18 tests covering all major functionality

### ✅ AIONUI Integration
- **React Hooks**: `useTableEnhancer()` for component integration
- **CSS Variables**: Uses AIONUI's design system variables
- **Responsive Design**: Proper table overflow handling
- **Theme Compatibility**: Works with light/dark themes

## Configuration

### N8N Endpoint
```javascript
const CONFIG = {
  N8N_ENDPOINT_URL: "https://barow52161.app.n8n.cloud/webhook/htlm_processor",
  DEBUG_LOG_HTML: true,
  SELECTORS: { /* AIONUI-specific selectors */ },
  PROCESSED_CLASS: "aionui-n8n-processed",
  PERSISTENCE: {
    STORAGE_KEY: "aionui_n8n_data_v1",
    CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours
    MAX_CACHE_SIZE: 50,
  },
};
```

## Usage

### Automatic Operation
The system works automatically once AIONUI is loaded:
1. Monitors chat for new tables with "Flowise" headers
2. Extracts keywords from "Flowise" column cells
3. Collects all related tables matching the keyword
4. Sends consolidated HTML to N8N endpoint
5. Displays enhanced results in chat

### Manual Control (Development)
```typescript
import { useTableEnhancer } from '@/renderer/hooks/useTableEnhancer';

const MyComponent = () => {
  const enhancer = useTableEnhancer();
  
  // Test N8N connection
  const testConnection = async () => {
    const result = await enhancer.testConnection();
    console.log('Connection result:', result);
  };
  
  // Manually scan for tables
  const scanTables = () => {
    enhancer.scanAndProcess();
  };
  
  return (
    <div>
      <button onClick={testConnection}>Test N8N</button>
      <button onClick={scanTables}>Scan Tables</button>
    </div>
  );
};
```

### Debug Commands (Browser Console)
```javascript
// Test N8N connection
await window.AionuiTableEnhancer.testN8nConnection();

// Manually scan for tables
window.AionuiTableEnhancer.scanAndProcess();

// Get cache information
window.AionuiTableEnhancer.getCacheInfo();

// Clear cache
window.AionuiTableEnhancer.clearAllCache();

// Enable/disable HTML logging
window.AionuiTableEnhancer.enableHTMLLog();
window.AionuiTableEnhancer.disableHTMLLog();
```

## Testing

### Unit Tests
```bash
# Run table enhancer tests
npm run test tests/unit/table-enhancer-utils.test.ts

# All tests pass ✅
✓ Table Enhancer Utilities (18 tests) 37ms
  ✓ Keyword Variations Generation (2)
  ✓ N8N Response Normalization (3)
  ✓ URL Detection (2)
  ✓ Cache Key Generation (2)
  ✓ Markdown Table Parsing (3)
  ✓ Error Handling (3)
  ✓ Configuration Validation (3)
```

### Manual Testing
1. Create a table with "Flowise", "Rubrique", and "Description" columns
2. Add a keyword in the "Flowise" column cell
3. Send the message in chat
4. Verify the table is processed and enhanced results appear
5. Check browser console for detailed processing logs

## Troubleshooting

### Common Issues

1. **Script not loading**
   - Check browser console for loading errors
   - Verify script path: `public/scripts/aionui-table-enhancer.js`
   - Ensure React app is fully initialized

2. **Tables not detected**
   - Verify table has "Flowise" column header (case-insensitive)
   - Check table is within `.message-item` container
   - Ensure "Rubrique" and "Description" headers exist

3. **N8N connection fails**
   - Test endpoint URL: `https://barow52161.app.n8n.cloud/webhook/htlm_processor`
   - Check CORS configuration
   - Verify N8N workflow is active and responding

4. **Styling issues**
   - Check CSS variables are available (`var(--bg-3)`, `var(--color-fill-2)`)
   - Verify no conflicting styles
   - Inspect table wrapper structure

### Debug Steps
1. Open browser DevTools (F12)
2. Check console for initialization messages
3. Use debug component: `<TableEnhancerDebug />`
4. Test N8N connection: `window.AionuiTableEnhancer.testN8nConnection()`
5. Enable HTML logging: `window.AionuiTableEnhancer.enableHTMLLog()`

## Migration History

### Version 1.0.0 - Initial Migration
- ✅ Adapted Claraverse V17.1 script for AIONUI
- ✅ Updated all CSS selectors for React structure
- ✅ Implemented asynchronous loading
- ✅ Added TypeScript integration
- ✅ Created debug tools and tests
- ✅ Full documentation and examples

### Compatibility
- **Source**: Claraverse V17.1 (Fix réponse n8n)
- **Target**: AIONUI React 19 + TypeScript 5.8
- **N8N Workflow**: Compatible with existing Claraverse workflows
- **Data Format**: Same HTML payload structure maintained

## Future Enhancements

### Planned Features
1. **Custom Styling**: User-configurable table themes
2. **Multiple Endpoints**: Support for different N8N workflows
3. **Advanced Caching**: Smarter cache invalidation strategies
4. **Performance Metrics**: Built-in performance monitoring
5. **Error Recovery**: Automatic retry mechanisms

### Extension Points
- Plugin system for custom processors
- Configurable selectors for different chat layouts
- Custom response formatters
- Integration with other workflow systems

## Support

For issues or questions related to the table enhancement system:

1. Check the troubleshooting section above
2. Review the detailed documentation in `documentation/`
3. Run the unit tests to verify functionality
4. Use the debug component for real-time testing
5. Check browser console for detailed error messages

## License

This migration maintains compatibility with the original Claraverse project while adapting to AIONUI's architecture and design system.