# AIONUI Chat UI Improvements - Table Enhancement System

## Overview

This document describes the implementation of the Table Enhancement System adapted from Claraverse for AIONUI. The system automatically detects and processes tables in chat conversations, sending them to N8N workflows for enhanced processing and display.

## Implementation Summary

### Files Created/Modified

1. **`public/scripts/aionui-table-enhancer.js`** - Main enhancement script adapted from Claraverse
2. **`src/renderer/index.html`** - Modified to load the enhancement script asynchronously
3. **`src/renderer/hooks/useTableEnhancer.ts`** - React hook for TypeScript integration
4. **`src/renderer/components/TableEnhancerDebug.tsx`** - Development debug component
5. **`docs/table-enhancement.md`** - Comprehensive documentation
6. **`tests/unit/table-enhancer.test.ts`** - Unit tests for core functionality

### Key Adaptations from Claraverse

#### Selector Updates
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

#### Styling Updates
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

## Features

### 🔍 Automatic Table Detection
- Scans chat messages for tables with "Flowise" column headers
- Detects tables with "Rubrique" and "Description" columns
- Uses MutationObserver for real-time detection of new messages

### 🎯 Dynamic Keyword Extraction
- Extracts keywords from "Flowise" column cells
- Generates variations (case-insensitive, word splits)
- Uses keywords to collect related tables across chat history

### 📡 N8N Integration
- Sends consolidated table HTML to configured N8N endpoint
- Handles multiple response formats (Array, Object, direct output)
- Includes user message context for better processing

### 🎨 AIONUI Styling
- Uses AIONUI's CSS variables for consistent theming
- Responsive table design with horizontal scroll
- Proper integration with existing chat layout

### 🚀 Performance Optimizations
- Intelligent caching system (24-hour duration, 50 entry limit)
- Asynchronous script loading after React initialization
- Debounced DOM scanning to prevent excessive processing

### 🛠️ Development Tools
- Debug component with connection testing
- Console logging for troubleshooting
- Cache management utilities
- TypeScript integration with proper types

## Usage

### Automatic Operation
The system works automatically once AIONUI is loaded:

1. **Table Detection**: Monitors chat for new tables with "Flowise" headers
2. **Keyword Extraction**: Gets keyword from first data cell in "Flowise" column
3. **Data Collection**: Gathers all related tables matching the keyword
4. **N8N Processing**: Sends consolidated HTML to N8N endpoint
5. **Result Display**: Shows enhanced tables in chat with AIONUI styling

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
  
  // Clear cache
  const clearCache = () => {
    enhancer.clearCache();
  };
  
  return (
    <div>
      <button onClick={testConnection}>Test N8N</button>
      <button onClick={scanTables}>Scan Tables</button>
      <button onClick={clearCache}>Clear Cache</button>
    </div>
  );
};
```

### Debug Interface
In development mode, the `TableEnhancerDebug` component provides:
- N8N connection testing
- Manual table scanning
- Cache information and management
- HTML logging controls

## Configuration

### N8N Endpoint
```javascript
const CONFIG = {
  N8N_ENDPOINT_URL: "https://barow52161.app.n8n.cloud/webhook/htlm_processor",
  DEBUG_LOG_HTML: true,
  // ... other settings
};
```

### Cache Settings
```javascript
PERSISTENCE: {
  STORAGE_KEY: "aionui_n8n_data_v1",
  CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours
  MAX_CACHE_SIZE: 50,
}
```

## Integration Process

### 1. Script Loading
The script is loaded asynchronously after React app initialization:
```html
<script>
  function loadTableEnhancer() {
    const root = document.getElementById('root');
    if (root && root.children.length > 0) {
      // React app is mounted, load the enhancer
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

### 2. React Hook Integration
```typescript
export const useTableEnhancer = () => {
  const isInitialized = useRef(false);
  
  useEffect(() => {
    const checkEnhancer = () => {
      if (window.AionuiTableEnhancer) {
        isInitialized.current = true;
        return true;
      }
      return false;
    };
    
    if (!checkEnhancer()) {
      const interval = setInterval(() => {
        if (checkEnhancer()) clearInterval(interval);
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, []);
  
  return {
    scanAndProcess: () => window.AionuiTableEnhancer?.scanAndProcess(),
    testConnection: () => window.AionuiTableEnhancer?.testN8nConnection(),
    // ... other methods
  };
};
```

### 3. TypeScript Definitions
```typescript
declare global {
  interface Window {
    AionuiTableEnhancer?: {
      scanAndProcess: () => void;
      testN8nConnection: () => Promise<{success: boolean; data?: any; error?: string}>;
      clearAllCache: () => void;
      getCacheInfo: () => any;
      enableHTMLLog: () => void;
      disableHTMLLog: () => void;
      version: string;
      CONFIG: { /* ... */ };
    };
  }
}
```

## Testing

### Unit Tests
```bash
# Run all tests
bun run test

# Run table enhancer tests specifically
bun run test tests/unit/table-enhancer.test.ts

# Run with coverage
bun run test:coverage
```

### Manual Testing
1. Create a table with "Flowise", "Rubrique", and "Description" columns
2. Add a keyword in the "Flowise" column cell
3. Send the message in chat
4. Verify the table is processed and enhanced results appear
5. Check browser console for detailed logs

### Debug Tools
```javascript
// Available in browser console
window.AionuiTableEnhancer.testN8nConnection()
window.AionuiTableEnhancer.scanAndProcess()
window.AionuiTableEnhancer.getCacheInfo()
window.AionuiTableEnhancer.clearAllCache()
```

## Troubleshooting

### Common Issues

1. **Script not loading**
   - Check browser console for loading errors
   - Verify script path is correct
   - Ensure React app is fully initialized

2. **Tables not detected**
   - Verify table has "Flowise" column header
   - Check table is within `.message-item` container
   - Ensure "Rubrique" and "Description" headers exist

3. **N8N connection fails**
   - Test endpoint URL manually
   - Check CORS configuration
   - Verify N8N workflow is active

4. **Styling issues**
   - Check CSS variables are available
   - Verify no conflicting styles
   - Inspect table wrapper structure

### Debug Steps
1. Open browser DevTools
2. Check console for initialization messages
3. Use debug component or console commands
4. Enable HTML logging for detailed output
5. Test N8N connection independently

## Performance Considerations

### Optimizations Implemented
- **Lazy Loading**: Script loads after React initialization
- **Efficient DOM Scanning**: Uses specific selectors and caching
- **Debounced Processing**: Prevents excessive API calls
- **Memory Management**: Automatic cache cleanup and size limits

### Monitoring
- Console logs provide performance metrics
- Cache statistics available via debug tools
- Processing time logged for each operation

## Security

### Content Security
- Safe HTML insertion methods
- URL validation and sanitization
- Proper CORS handling for N8N requests

### Data Privacy
- Only table HTML content is cached locally
- No sensitive user data stored
- Configurable endpoints per environment

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

## Conclusion

The AIONUI Table Enhancement System successfully adapts Claraverse's table processing capabilities to AIONUI's React-based architecture. It provides:

- ✅ **Seamless Integration**: Works automatically with existing chat interface
- ✅ **Performance**: Optimized loading and processing
- ✅ **Maintainability**: Clean TypeScript integration and comprehensive tests
- ✅ **Debugging**: Rich development tools and logging
- ✅ **Compatibility**: Maintains compatibility with existing N8N workflows

The system is ready for production use and provides a solid foundation for future enhancements to AIONUI's chat interface.