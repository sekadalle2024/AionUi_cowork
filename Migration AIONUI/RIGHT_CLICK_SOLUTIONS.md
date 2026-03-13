# 🔧 AIONUI Right-Click Solutions

## 🎯 Common Causes & Solutions

### 1. Electron Context Menu Disabled

**Problem**: Electron apps often disable right-click by default

**Solution A**: Check main process settings
```javascript
// In main.js or similar
webPreferences: {
  contextIsolation: false,
  enableRemoteModule: true,
  webSecurity: false
}
```

**Solution B**: Enable context menu in renderer
```javascript
// Add to preload.js or main renderer
const { remote } = require('electron');
const { Menu } = remote;
```

### 2. CSS Pointer Events Disabled

**Problem**: CSS might be blocking pointer events

**Solution**: Check for CSS rules
```css
/* Look for these in CSS */
* { pointer-events: none; }
table { pointer-events: none; }
```

**Fix**: Add to CSS
```css
table { pointer-events: auto !important; }
```

### 3. Event Propagation Issues

**Problem**: Other event listeners preventing contextmenu

**Solution**: Use capture phase
```javascript
document.addEventListener('contextmenu', handler, true);
```

### 4. Z-Index Issues

**Problem**: Menu appears but behind other elements

**Solution**: Increase z-index
```css
.context-menu {
  z-index: 999999 !important;
}
```

### 5. Script Loading Order

**Problem**: Scripts load before DOM ready

**Solution**: Ensure proper timing
```javascript
// Wait for both DOM and React
window.addEventListener('load', () => {
  setTimeout(() => {
    // Load scripts here
  }, 2000);
});
```

## 🚀 Quick Fixes to Try

### Fix 1: Force Enable Right-Click
```javascript
// Run in console
document.addEventListener('contextmenu', function(e) {
  e.stopPropagation();
  console.log('Right-click on:', e.target);
  // Don't prevent default to see if Windows menu works
}, true);
```

### Fix 2: Override All Context Menu Blocks
```javascript
// Run in console
document.addEventListener('contextmenu', function(e) {
  e.stopImmediatePropagation();
  console.log('Forced right-click capture');
}, true);
```

### Fix 3: Test Without Prevention
```javascript
// Modify aionui_menu.js temporarily
// Comment out: e.preventDefault();
```

## 🔍 Debugging Commands

### Check Event Listeners
```javascript
// See all contextmenu listeners
getEventListeners(document);
```

### Test Event Creation
```javascript
// Create and dispatch test event
const event = new MouseEvent('contextmenu', {
  bubbles: true,
  cancelable: true,
  clientX: 100,
  clientY: 100
});
document.dispatchEvent(event);
```

### Check CSS Computed Styles
```javascript
// Check if pointer events are disabled
const table = document.querySelector('table');
if (table) {
  console.log(getComputedStyle(table).pointerEvents);
}
```