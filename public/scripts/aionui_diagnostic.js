/**
 * AIONUI Diagnostic Script - Right-Click Issue Debug
 * @version 1.0.0
 * @description Diagnostic tool to identify right-click context menu issues
 */
(function () {
  "use strict";

  console.log("🔍 AIONUI Diagnostic Script Starting...");

  class AIONUIDiagnostic {
    constructor() {
      this.results = {
        scriptsLoaded: {},
        globalObjects: {},
        eventListeners: {},
        domElements: {},
        electronContext: {},
        errors: []
      };
    }

    runFullDiagnostic() {
      console.log("🔍 Running Full Diagnostic...");
      
      this.checkScriptsLoaded();
      this.checkGlobalObjects();
      this.checkEventListeners();
      this.checkDOMElements();
      this.checkElectronContext();
      this.testRightClickEvents();
      
      this.displayResults();
      return this.results;
    }

    checkScriptsLoaded() {
      console.log("📜 Checking Scripts Loaded...");
      
      // Check if scripts exist in DOM
      const scripts = document.querySelectorAll('script[src*="aionui_"]');
      this.results.scriptsLoaded.count = scripts.length;
      this.results.scriptsLoaded.scripts = [];
      
      scripts.forEach(script => {
        this.results.scriptsLoaded.scripts.push({
          src: script.src,
          loaded: script.readyState === 'complete' || !script.readyState
        });
      });

      // Check for inline script loading
      const inlineScripts = document.querySelectorAll('script:not([src])');
      let hasLoadingScript = false;
      inlineScripts.forEach(script => {
        if (script.textContent.includes('aionui_flowise') || script.textContent.includes('aionui_menu')) {
          hasLoadingScript = true;
        }
      });
      this.results.scriptsLoaded.hasLoadingScript = hasLoadingScript;
    }

    checkGlobalObjects() {
      console.log("🌐 Checking Global Objects...");
      
      this.results.globalObjects.aionui_flowise = {
        exists: !!window.aionui_flowise,
        type: typeof window.aionui_flowise,
        methods: window.aionui_flowise ? Object.keys(window.aionui_flowise) : []
      };

      this.results.globalObjects.aionui_menu = {
        exists: !!window.aionui_menu,
        type: typeof window.aionui_menu,
        methods: window.aionui_menu ? Object.getOwnPropertyNames(window.aionui_menu) : []
      };
    }

    checkEventListeners() {
      console.log("👂 Checking Event Listeners...");
      
      // Test if contextmenu events are being captured
      let contextMenuCaptured = false;
      let clickCaptured = false;

      const testContextMenu = (e) => {
        contextMenuCaptured = true;
        console.log("✅ contextmenu event captured:", e.target);
      };

      const testClick = (e) => {
        clickCaptured = true;
        console.log("✅ click event captured:", e.target);
      };

      document.addEventListener('contextmenu', testContextMenu, { once: true });
      document.addEventListener('click', testClick, { once: true });

      // Simulate events
      setTimeout(() => {
        const testEvent = new MouseEvent('contextmenu', {
          bubbles: true,
          cancelable: true,
          button: 2
        });
        document.body.dispatchEvent(testEvent);

        this.results.eventListeners.contextMenuWorks = contextMenuCaptured;
        this.results.eventListeners.clickWorks = clickCaptured;

        // Cleanup
        document.removeEventListener('contextmenu', testContextMenu);
        document.removeEventListener('click', testClick);
      }, 100);
    }

    checkDOMElements() {
      console.log("🏗️ Checking DOM Elements...");
      
      // Look for tables in common AIONUI locations
      const selectors = [
        'table',
        '.markdown-shadow-body table',
        '.message-item table',
        '[class*="chat"] table',
        '[class*="message"] table',
        '[class*="conversation"] table',
        '.prose table',
        '.markdown-body table'
      ];

      this.results.domElements.tables = {};
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        this.results.domElements.tables[selector] = elements.length;
      });

      this.results.domElements.totalTables = document.querySelectorAll('table').length;
    }

    checkElectronContext() {
      console.log("⚡ Checking Electron Context...");
      
      this.results.electronContext.isElectron = !!(window.process && window.process.type);
      this.results.electronContext.hasNodeIntegration = !!window.require;
      this.results.electronContext.userAgent = navigator.userAgent;
      this.results.electronContext.platform = navigator.platform;
      
      // Check if context menu is disabled by Electron
      this.results.electronContext.contextMenuEnabled = true;
      try {
        const testMenu = new MouseEvent('contextmenu', { bubbles: true });
        this.results.electronContext.canCreateContextMenu = true;
      } catch (e) {
        this.results.electronContext.canCreateContextMenu = false;
        this.results.electronContext.contextMenuError = e.message;
      }
    }

    testRightClickEvents() {
      console.log("🖱️ Testing Right-Click Events...");
      
      // Create a test table
      const testTable = document.createElement('table');
      testTable.id = 'aionui-diagnostic-table';
      testTable.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        border: 2px solid red;
        background: white;
        z-index: 10000;
        padding: 10px;
      `;
      testTable.innerHTML = `
        <tr><th>Test</th><th>Table</th></tr>
        <tr><td>Right-click</td><td>Me</td></tr>
      `;
      
      document.body.appendChild(testTable);

      // Test right-click on table
      let rightClickWorked = false;
      const testRightClick = (e) => {
        rightClickWorked = true;
        console.log("✅ Right-click on test table worked!");
        e.preventDefault();
      };

      testTable.addEventListener('contextmenu', testRightClick);

      // Auto-remove after 10 seconds
      setTimeout(() => {
        if (testTable.parentNode) {
          testTable.parentNode.removeChild(testTable);
        }
        this.results.eventListeners.testTableRightClick = rightClickWorked;
      }, 10000);

      this.results.domElements.testTableCreated = true;
    }

    displayResults() {
      console.log("📊 DIAGNOSTIC RESULTS:");
      console.log("=".repeat(50));
      
      // Scripts
      console.log("📜 SCRIPTS:");
      console.log(`  - Scripts found: ${this.results.scriptsLoaded.count}`);
      console.log(`  - Loading script present: ${this.results.scriptsLoaded.hasLoadingScript}`);
      this.results.scriptsLoaded.scripts.forEach(script => {
        console.log(`  - ${script.src}: ${script.loaded ? '✅' : '❌'}`);
      });

      // Global Objects
      console.log("\n🌐 GLOBAL OBJECTS:");
      console.log(`  - window.aionui_flowise: ${this.results.globalObjects.aionui_flowise.exists ? '✅' : '❌'}`);
      console.log(`  - window.aionui_menu: ${this.results.globalObjects.aionui_menu.exists ? '✅' : '❌'}`);

      // DOM Elements
      console.log("\n🏗️ DOM ELEMENTS:");
      console.log(`  - Total tables: ${this.results.domElements.totalTables}`);
      Object.entries(this.results.domElements.tables).forEach(([selector, count]) => {
        if (count > 0) {
          console.log(`  - ${selector}: ${count} tables`);
        }
      });

      // Electron Context
      console.log("\n⚡ ELECTRON CONTEXT:");
      console.log(`  - Is Electron: ${this.results.electronContext.isElectron ? '✅' : '❌'}`);
      console.log(`  - Context menu enabled: ${this.results.electronContext.contextMenuEnabled ? '✅' : '❌'}`);

      // Event Listeners
      console.log("\n👂 EVENT LISTENERS:");
      console.log(`  - Context menu events: ${this.results.eventListeners.contextMenuWorks ? '✅' : '❌'}`);
      console.log(`  - Click events: ${this.results.eventListeners.clickWorks ? '✅' : '❌'}`);

      console.log("\n" + "=".repeat(50));
      
      // Recommendations
      this.generateRecommendations();
    }

    generateRecommendations() {
      console.log("💡 RECOMMENDATIONS:");
      
      if (!this.results.globalObjects.aionui_menu.exists) {
        console.log("❌ aionui_menu not loaded - Check script loading in index.html");
      }
      
      if (this.results.domElements.totalTables === 0) {
        console.log("⚠️ No tables found - Create a table to test right-click");
      }
      
      if (!this.results.eventListeners.contextMenuWorks) {
        console.log("❌ Context menu events not working - Check Electron settings");
      }

      if (!this.results.scriptsLoaded.hasLoadingScript) {
        console.log("❌ Script loading mechanism not found in HTML");
      }

      console.log("\n🔧 MANUAL TESTS:");
      console.log("1. Open DevTools Console");
      console.log("2. Type: window.aionui_menu");
      console.log("3. Right-click on the red test table above");
      console.log("4. Check for any error messages");
    }
  }

  // Initialize diagnostic
  const diagnostic = new AIONUIDiagnostic();
  
  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(() => diagnostic.runFullDiagnostic(), 2000);
    });
  } else {
    setTimeout(() => diagnostic.runFullDiagnostic(), 2000);
  }

  // Export to global scope
  window.aionui_diagnostic = diagnostic;

  console.log("🎉 AIONUI Diagnostic Script loaded! Run window.aionui_diagnostic.runFullDiagnostic()");

})();