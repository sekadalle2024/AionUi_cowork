/**
 * AIONUI Right-Click Test Script
 * @version 1.0.0
 * @description Simple test to verify right-click functionality
 */
(function () {
  "use strict";

  console.log("🖱️ AIONUI Right-Click Test Starting...");

  // Test 1: Basic right-click event capture
  function testBasicRightClick() {
    console.log("🧪 Test 1: Basic right-click event capture");
    
    document.addEventListener('contextmenu', function(e) {
      console.log("✅ contextmenu event captured on:", e.target.tagName);
      console.log("📍 Event details:", {
        target: e.target,
        clientX: e.clientX,
        clientY: e.clientY,
        button: e.button,
        buttons: e.buttons
      });
      
      // Don't prevent default for now - let's see if Windows menu appears
      // e.preventDefault();
    });
  }

  // Test 2: Create a test table and monitor right-clicks
  function createTestTable() {
    console.log("🧪 Test 2: Creating test table");
    
    const testTable = document.createElement('table');
    testTable.id = 'aionui-rightclick-test-table';
    testTable.style.cssText = `
      position: fixed;
      top: 50px;
      right: 20px;
      border: 3px solid #ff6b6b;
      background: #fff;
      z-index: 15000;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      font-family: Arial, sans-serif;
      font-size: 14px;
    `;
    
    testTable.innerHTML = `
      <thead>
        <tr style="background: #f8f9fa;">
          <th style="padding: 8px; border: 1px solid #ddd;">Test</th>
          <th style="padding: 8px; border: 1px solid #ddd;">Right-Click</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">Cell 1</td>
          <td style="padding: 8px; border: 1px solid #ddd;">Cell 2</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">Try</td>
          <td style="padding: 8px; border: 1px solid #ddd;">Right-Click</td>
        </tr>
      </tbody>
    `;

    // Add specific right-click handler for the table
    testTable.addEventListener('contextmenu', function(e) {
      console.log("🎯 RIGHT-CLICK ON TEST TABLE!");
      console.log("📊 Table element:", e.target);
      console.log("📍 Position:", e.clientX, e.clientY);
      
      // Test if we can prevent default and show custom menu
      e.preventDefault();
      
      // Create a simple custom menu
      showSimpleMenu(e.clientX, e.clientY);
    });

    document.body.appendChild(testTable);
    console.log("✅ Test table created - try right-clicking on it!");

    // Auto-remove after 30 seconds
    setTimeout(() => {
      if (testTable.parentNode) {
        testTable.parentNode.removeChild(testTable);
        console.log("🗑️ Test table removed");
      }
    }, 30000);
  }

  // Test 3: Simple custom menu
  function showSimpleMenu(x, y) {
    console.log("🎨 Showing simple custom menu at:", x, y);
    
    // Remove existing menu
    const existingMenu = document.getElementById('aionui-simple-test-menu');
    if (existingMenu) {
      existingMenu.remove();
    }

    const menu = document.createElement('div');
    menu.id = 'aionui-simple-test-menu';
    menu.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      background: #fff;
      border: 2px solid #007bff;
      border-radius: 6px;
      padding: 10px;
      z-index: 16000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      font-family: Arial, sans-serif;
      font-size: 14px;
      min-width: 150px;
    `;

    menu.innerHTML = `
      <div style="font-weight: bold; color: #007bff; margin-bottom: 8px;">✅ Right-Click Works!</div>
      <div style="padding: 4px 0; cursor: pointer; border-radius: 3px;" onmouseover="this.style.background='#f0f0f0'" onmouseout="this.style.background='transparent'" onclick="console.log('Menu item clicked!')">📋 Test Action</div>
      <div style="padding: 4px 0; cursor: pointer; border-radius: 3px;" onmouseover="this.style.background='#f0f0f0'" onmouseout="this.style.background='transparent'" onclick="this.parentNode.remove()">❌ Close Menu</div>
    `;

    document.body.appendChild(menu);

    // Auto-hide menu on click outside
    setTimeout(() => {
      document.addEventListener('click', function hideMenu() {
        if (menu.parentNode) {
          menu.remove();
        }
        document.removeEventListener('click', hideMenu);
      });
    }, 100);
  }

  // Test 4: Check for existing AIONUI elements
  function checkAIONUIElements() {
    console.log("🧪 Test 4: Checking for AIONUI elements");
    
    const selectors = [
      'table',
      '.markdown-shadow-body',
      '.message-item',
      '[class*="chat"]',
      '[class*="message"]',
      '[class*="conversation"]',
      '.prose',
      '.markdown-body'
    ];

    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        console.log(`✅ Found ${elements.length} elements for: ${selector}`);
        
        // Add right-click listeners to existing tables
        if (selector === 'table') {
          elements.forEach((table, index) => {
            table.addEventListener('contextmenu', function(e) {
              console.log(`🎯 Right-click on existing table ${index + 1}`);
              e.preventDefault();
              showSimpleMenu(e.clientX, e.clientY);
            });
          });
        }
      } else {
        console.log(`❌ No elements found for: ${selector}`);
      }
    });
  }

  // Test 5: Check Electron context menu settings
  function checkElectronSettings() {
    console.log("🧪 Test 5: Checking Electron settings");
    
    console.log("🔍 User Agent:", navigator.userAgent);
    console.log("🔍 Platform:", navigator.platform);
    console.log("🔍 Is Electron:", !!(window.process && window.process.type));
    
    // Test if we can create context menu events
    try {
      const testEvent = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        button: 2,
        buttons: 2
      });
      console.log("✅ Can create contextmenu events");
    } catch (e) {
      console.log("❌ Cannot create contextmenu events:", e.message);
    }
  }

  // Initialize all tests
  function runAllTests() {
    console.log("🚀 Running all right-click tests...");
    
    testBasicRightClick();
    checkElectronSettings();
    checkAIONUIElements();
    
    // Wait a bit for DOM to be ready, then create test table
    setTimeout(() => {
      createTestTable();
    }, 1000);
  }

  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runAllTests);
  } else {
    runAllTests();
  }

  // Export to global scope for manual testing
  window.aionui_rightclick_test = {
    runAllTests,
    createTestTable,
    showSimpleMenu: (x, y) => showSimpleMenu(x || 100, y || 100),
    checkAIONUIElements
  };

  console.log("🎉 AIONUI Right-Click Test loaded!");
  console.log("💡 Manual commands:");
  console.log("   - window.aionui_rightclick_test.runAllTests()");
  console.log("   - window.aionui_rightclick_test.createTestTable()");
  console.log("   - window.aionui_rightclick_test.showSimpleMenu(100, 100)");

})();