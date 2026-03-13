/**
 * AIONUI Alternative Menu System - Works Without Context Menu Events
 * @version 1.0.0
 * @description Alternative approach using click events with modifier keys
 */
(function () {
  "use strict";

  console.log("🎯 AIONUI Alternative Menu System Starting...");

  class AIONUIAlternativeMenu {
    constructor() {
      this.menuElement = null;
      this.isMenuVisible = false;
      this.targetTable = null;
      this.activeCell = null;
      this.initialized = false;
    }

    init() {
      if (this.initialized) return;
      console.log("🎯 Initializing Alternative Menu System...");
      
      this.createMenuElement();
      this.attachEventListeners();
      this.createFloatingButton();
      this.observeNewTables();
      
      this.initialized = true;
      console.log("✅ Alternative Menu System initialized");
    }

    createMenuElement() {
      this.menuElement = document.createElement("div");
      this.menuElement.id = "aionui-alt-menu";
      this.menuElement.style.cssText = `
        position: fixed;
        background: var(--color-bg-1, #fff);
        border: 2px solid var(--color-primary-6, #007bff);
        border-radius: 8px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        padding: 8px;
        z-index: 15000;
        display: none;
        min-width: 200px;
        font-family: Arial, sans-serif;
        font-size: 14px;
      `;

      const menuItems = [
        { icon: "✏️", text: "Enable Editing", action: () => this.enableCellEditing() },
        { icon: "➕", text: "Insert Row", action: () => this.insertRowBelow() },
        { icon: "➕", text: "Insert Column", action: () => this.insertColumnRight() },
        { icon: "🗑️", text: "Delete Row", action: () => this.deleteSelectedRow() },
        { icon: "🗑️", text: "Delete Column", action: () => this.deleteSelectedColumn() },
        { icon: "📋", text: "Copy Table", action: () => this.copyTable() },
        { icon: "📄", text: "Export CSV", action: () => this.exportCSV() },
        { icon: "❌", text: "Close Menu", action: () => this.hideMenu() },
      ];

      menuItems.forEach(item => {
        const menuItem = document.createElement("div");
        menuItem.style.cssText = `
          padding: 8px 12px;
          cursor: pointer;
          border-radius: 4px;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        `;
        menuItem.innerHTML = `<span>${item.icon}</span><span>${item.text}</span>`;
        
        menuItem.addEventListener("mouseenter", () => {
          menuItem.style.background = "var(--color-fill-2, #f0f0f0)";
        });
        menuItem.addEventListener("mouseleave", () => {
          menuItem.style.background = "transparent";
        });
        menuItem.addEventListener("click", (e) => {
          e.stopPropagation();
          item.action();
        });
        
        this.menuElement.appendChild(menuItem);
      });

      document.body.appendChild(this.menuElement);
    }

    createFloatingButton() {
      const button = document.createElement("button");
      button.id = "aionui-menu-trigger";
      button.innerHTML = "🗃️ Table Menu";
      button.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--color-primary-6, #007bff);
        color: white;
        border: none;
        border-radius: 8px;
        padding: 12px 20px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        z-index: 14000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        transition: all 0.3s;
        display: none;
      `;

      button.addEventListener("mouseenter", () => {
        button.style.transform = "scale(1.05)";
        button.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.3)";
      });
      button.addEventListener("mouseleave", () => {
        button.style.transform = "scale(1)";
        button.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.2)";
      });
      button.addEventListener("click", (e) => {
        e.stopPropagation();
        if (this.targetTable) {
          const rect = button.getBoundingClientRect();
          this.showMenu(rect.left - 200, rect.top);
        } else {
          this.showNotification("⚠️ Click on a table first!");
        }
      });

      document.body.appendChild(button);
      this.floatingButton = button;
    }

    attachEventListeners() {
      // Use Ctrl+Click or Alt+Click as alternative to right-click
      document.addEventListener("click", (e) => {
        const table = e.target.closest("table");
        
        if (table && this.isTableInChat(table)) {
          // Ctrl+Click or Alt+Click opens menu
          if (e.ctrlKey || e.altKey) {
            e.preventDefault();
            e.stopPropagation();
            this.targetTable = table;
            this.showMenu(e.pageX, e.pageY);
            this.showNotification("✅ Menu opened with Ctrl+Click");
            return;
          }
          
          // Regular click selects table and shows button
          this.targetTable = table;
          this.activeCell = e.target.closest("td, th");
          this.showFloatingButton();
        } else if (!this.menuElement.contains(e.target)) {
          this.hideMenu();
        }
      });

      // Close menu on Escape
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          this.hideMenu();
        }
      });

      // Hide button when clicking outside tables
      document.addEventListener("click", (e) => {
        if (!e.target.closest("table") && !e.target.closest("#aionui-menu-trigger")) {
          this.hideFloatingButton();
        }
      });
    }

    isTableInChat(table) {
      const chatSelectors = [
        ".markdown-shadow-body",
        ".message-item",
        '[class*="chat"]',
        '[class*="message"]',
        '[class*="conversation"]',
        ".prose",
        ".markdown-body",
      ];
      return chatSelectors.some(selector => table.closest(selector));
    }

    showMenu(x, y) {
      this.menuElement.style.left = `${Math.min(x, window.innerWidth - 220)}px`;
      this.menuElement.style.top = `${Math.min(y, window.innerHeight - 400)}px`;
      this.menuElement.style.display = "block";
      this.isMenuVisible = true;
    }

    hideMenu() {
      this.menuElement.style.display = "none";
      this.isMenuVisible = false;
    }

    showFloatingButton() {
      if (this.floatingButton) {
        this.floatingButton.style.display = "block";
      }
    }

    hideFloatingButton() {
      if (this.floatingButton) {
        this.floatingButton.style.display = "none";
      }
    }

    showNotification(message) {
      const toast = document.createElement("div");
      toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--color-bg-2, #333);
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 16000;
        font-size: 14px;
        animation: slideIn 0.3s ease;
      `;
      toast.textContent = message;
      document.body.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transition = "opacity 0.3s";
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }

    // Table operations
    enableCellEditing() {
      if (!this.targetTable) return;
      const cells = this.targetTable.querySelectorAll("td");
      cells.forEach(cell => {
        cell.contentEditable = "true";
        cell.style.cursor = "text";
      });
      this.showNotification("✅ Cell editing enabled");
      this.hideMenu();
    }

    insertRowBelow() {
      if (!this.targetTable) return;
      const rows = this.targetTable.querySelectorAll("tr");
      const lastRow = rows[rows.length - 1];
      const numCols = lastRow.querySelectorAll("td, th").length;
      
      const newRow = document.createElement("tr");
      for (let i = 0; i < numCols; i++) {
        const td = document.createElement("td");
        td.textContent = "New cell";
        td.style.border = "1px solid #ddd";
        td.style.padding = "8px";
        newRow.appendChild(td);
      }
      
      this.targetTable.querySelector("tbody")?.appendChild(newRow) || this.targetTable.appendChild(newRow);
      this.showNotification("✅ Row added");
      this.hideMenu();
    }

    insertColumnRight() {
      if (!this.targetTable) return;
      const rows = this.targetTable.querySelectorAll("tr");
      rows.forEach(row => {
        const newCell = document.createElement(row.querySelector("th") ? "th" : "td");
        newCell.textContent = "New";
        newCell.style.border = "1px solid #ddd";
        newCell.style.padding = "8px";
        row.appendChild(newCell);
      });
      this.showNotification("✅ Column added");
      this.hideMenu();
    }

    deleteSelectedRow() {
      if (!this.activeCell) {
        this.showNotification("⚠️ Click on a cell first");
        return;
      }
      const row = this.activeCell.closest("tr");
      if (row && confirm("Delete this row?")) {
        row.remove();
        this.showNotification("✅ Row deleted");
      }
      this.hideMenu();
    }

    deleteSelectedColumn() {
      if (!this.activeCell) {
        this.showNotification("⚠️ Click on a cell first");
        return;
      }
      const row = this.activeCell.closest("tr");
      const cells = Array.from(row.querySelectorAll("td, th"));
      const colIndex = cells.indexOf(this.activeCell);
      
      if (colIndex >= 0 && confirm("Delete this column?")) {
        const rows = this.targetTable.querySelectorAll("tr");
        rows.forEach(r => {
          const c = r.querySelectorAll("td, th")[colIndex];
          if (c) c.remove();
        });
        this.showNotification("✅ Column deleted");
      }
      this.hideMenu();
    }

    copyTable() {
      if (!this.targetTable) return;
      const html = this.targetTable.outerHTML;
      navigator.clipboard.writeText(html).then(() => {
        this.showNotification("✅ Table copied");
      }).catch(() => {
        this.showNotification("❌ Copy failed");
      });
      this.hideMenu();
    }

    exportCSV() {
      if (!this.targetTable) return;
      const rows = this.targetTable.querySelectorAll("tr");
      const csv = Array.from(rows).map(row => {
        const cells = row.querySelectorAll("td, th");
        return Array.from(cells).map(cell => cell.textContent.trim()).join(",");
      }).join("\n");
      
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "table-export.csv";
      a.click();
      URL.revokeObjectURL(url);
      
      this.showNotification("✅ CSV exported");
      this.hideMenu();
    }

    observeNewTables() {
      const observer = new MutationObserver(() => {
        const tables = document.querySelectorAll("table");
        tables.forEach(table => {
          if (this.isTableInChat(table) && !table.dataset.aionuiMenu) {
            table.dataset.aionuiMenu = "true";
            console.log("📊 New table detected and marked");
          }
        });
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  // Initialize
  const altMenu = new AIONUIAlternativeMenu();
  
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(() => altMenu.init(), 1000);
    });
  } else {
    setTimeout(() => altMenu.init(), 1000);
  }

  // Export to global
  window.aionui_alt_menu = altMenu;

  console.log("🎉 Alternative Menu System loaded!");
  console.log("💡 Usage:");
  console.log("   - Click on a table to select it");
  console.log("   - Ctrl+Click or Alt+Click on table to open menu");
  console.log("   - Or use the floating button that appears");

})();