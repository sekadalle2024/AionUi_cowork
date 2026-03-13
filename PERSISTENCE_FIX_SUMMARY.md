# Table Persistence Fix - Summary

## Problem
Table modifications via context menu were not persisting after page refresh because `data-message-id` attribute was not found in the DOM hierarchy.

## Root Cause
The `data-message-id` attribute was added to the wrong DOM level - it was inside `MessageText` component instead of on the parent `.message-item` wrapper.

## Solution
Moved `data-message-id` and `data-msg-id` attributes from `MessageText` to the `MessageItem` wrapper in `MessageList.tsx`.

## Files Modified

1. **src/renderer/messages/MessageList.tsx** - Added data attributes to wrapper
2. **src/renderer/messages/MessagetText.tsx** - Removed data attributes (now in parent)
3. **src/renderer/components/TableContextMenu.tsx** - Fixed floating promise error
4. **src/renderer/hooks/useTablePersistence.ts** - Removed unused function

## Testing
1. Start app: `npm run start`
2. Create conversation with markdown table
3. Right-click table → Enable Editing
4. Modify a cell and click outside
5. Check DevTools console for success logs
6. Refresh page (F5) to verify persistence

## Expected Logs
```
[TableContextMenu] 🔄 syncTable called
[TablePersistence] ✅ Found message ID: [id]
[TablePersistence] ✅ Table modifications synced to database
```

See `Doc_menu_contextuel/RESOLUTION_PERSISTANCE.md` for detailed documentation.
