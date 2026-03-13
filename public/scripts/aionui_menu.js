/**
 * AIONUI Context Menu for Tables - Adapted from Claraverse V9.3
 * @version 1.0.0
 * @description Context menu system for table operations in AIONUI chat interface
 */
(function () {
  "use strict";

  console.log("🎯 Initializing AIONUI Context Menu V1.0");

  class AIONUIContextMenuManager {
    constructor() {
      this.menuElement = null;
      this.isMenuVisible = false;
      this.targetTable = null;
      this.activeCellPosition = { row: -1, col: -1 };
      this.activeCell = null;
      this.initialized = false;
      this.hoverTimeout = null;
      this.hideTimeout = null;
      this.isHoveringTable = false;
      this.isHoveringMenu = false;
      this.expandedSections = new Set();
      this.eventListeners = [];
      this.config = {
        hoverDelay: 300,
        hideDelay: 500,
        maxFileSize: 10 * 1024 * 1024,
        supportedFormats: [".xlsx", ".xls", ".csv"],
      };
    }

    init() {
      if (this.initialized) return;
      console.log("🎯 Initializing AIONUI Context Menu...");
      this.createMenuElement();
      this.attachEventListeners();
      this.observeNewTables();
      this.processExistingTables();
      this.initialized = true;
      console.log("✅ AIONUI Context Menu initialized successfully");
    }

    getMenuSections() {
      return [
        {
          id: "edition", title: "Cell Editing", icon: "✏️",
          items: [
            { text: "Enable editing", action: () => this.enableCellEditing(), shortcut: "Ctrl+E" },
            { text: "Disable editing", action: () => this.disableCellEditing() }
          ]
        },
        {
          id: "rows", title: "Rows", icon: "📋",
          items: [
            { text: "Insert row", action: () => this.insertRowBelow(), shortcut: "Ctrl+Shift+↓" },
            { text: "Duplicate row", action: () => this.duplicateSelectedRow(), shortcut: "Ctrl+D" },
            { text: "Delete row", action: () => this.deleteSelectedRow() },
            { text: "Clear all rows content", action: () => this.clearAllRowsContent() },
            { text: "📋 Paste from Excel", action: () => this.pasteFromExcel(), shortcut: "Ctrl+V" }
          ]
        },
        {
          id: "columns", title: "Columns", icon: "📊",
          items: [
            { text: "Insert column", action: () => this.insertColumnRight(), shortcut: "Ctrl+Shift+→" },
            { text: "Duplicate column", action: () => this.duplicateSelectedColumn() },
            { text: "Clear column content", action: () => this.clearColumnContent() },
            { text: "Delete column", action: () => this.deleteSelectedColumn() }
          ]
        },
        {
          id: "tables", title: "Tables", icon: "🗃️",
          items: [
            { text: "📋 Copy table", action: () => this.copyTableToMemory(), shortcut: "Ctrl+C" },
            { text: "📄 Paste table", action: () => this.pasteTableFromMemory(), shortcut: "Ctrl+Shift+P" },
            { text: "Insert table below", action: () => this.insertTableBelow() },
            { text: "Delete table", action: () => this.deleteTable() }
          ]
        },
        {
          id: "export", title: "Export", icon: "📁",
          items: [
            { text: "Export to Excel", action: () => this.exportExcel() },
            { text: "Export to CSV", action: () => this.exportCSV() },
            { text: "Copy as HTML", action: () => this.copyAsHTML() }
          ]
        }
      ];
    }

    createMenuElement() {
      this.menuElement = document.createElement("div");
      this.menuElement.id = "aionui-context-menu";
      this.menuElement.className = "aionui-context-menu";
      this.menuElement.style.cssText = `
        position: fixed;
        background: var(--color-bg-1);
        border: 1px solid var(--color-border-2);
        border-radius: 8px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        padding: 0;
        z-index: 15000;
        display: none;
        min-width: 240px;
        max-width: 280px;
        font-family: var(--font-family);
        font-size: 14px;
        opacity: 0;
        transform: translateY(-10px) scale(0.95);
        transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        overflow: hidden;
      `;

      const header = document.createElement("div");
      header.className = "menu-header";
      header.style.cssText = `
        background: var(--color-primary-6);
        padding: 12px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--color-border-2);
        border-radius: 7px 7px 0 0;
      `;
      header.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 14px;">🗃️</span>
          <span style="color: white; font-weight: 600; font-size: 14px;">Table Menu</span>
        </div>
        <button class="menu-close-btn" style="background: none; border: none; color: white; font-size: 18px; cursor: pointer; padding: 0; line-height: 1; opacity: 0.8;">×</button>
      `;
      this.menuElement.appendChild(header);

      const sectionsContainer = document.createElement("div");
      sectionsContainer.className = "menu-sections-container";
      sectionsContainer.style.cssText = `
        max-height: 400px; 
        overflow-y: auto; 
        padding: 4px 0; 
        background: var(--color-bg-1);
      `;

      this.getMenuSections().forEach(section => {
        sectionsContainer.appendChild(this.createAccordionSection(section));
      });

      this.menuElement.appendChild(sectionsContainer);
      this.setupMenuEventHandlers();
      document.body.appendChild(this.menuElement);
    }
    createAccordionSection(section) {
      const wrapper = document.createElement("div");
      wrapper.className = "accordion-section";
      wrapper.dataset.sectionId = section.id;

      const header = document.createElement("div");
      header.className = "accordion-header";
      header.style.cssText = `
        display: flex; 
        justify-content: space-between; 
        align-items: center; 
        padding: 10px 16px; 
        cursor: pointer; 
        transition: all 0.2s ease; 
        border-left: 3px solid transparent; 
        margin: 1px 4px; 
        border-radius: 6px;
        background: var(--color-bg-1);
      `;
      header.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 14px; opacity: 0.9;">${section.icon}</span>
          <span style="color: var(--color-text-1); font-weight: 500; font-size: 13px;">${section.title}</span>
        </div>
        <span class="accordion-arrow" style="color: var(--color-text-3); font-size: 12px; transition: transform 0.3s ease;">›</span>
      `;

      header.addEventListener("mouseenter", () => {
        if (!this.expandedSections.has(section.id)) {
          header.style.background = "var(--color-fill-2)";
          header.style.borderLeftColor = "var(--color-primary-6)";
        }
      });
      header.addEventListener("mouseleave", () => {
        if (!this.expandedSections.has(section.id)) {
          header.style.background = "var(--color-bg-1)";
          header.style.borderLeftColor = "transparent";
        }
      });

      const content = document.createElement("div");
      content.className = "accordion-content";
      content.style.cssText = `
        max-height: 0; 
        overflow: hidden; 
        transition: max-height 0.3s ease-out; 
        background: var(--color-fill-1); 
        margin: 0 4px; 
        border-radius: 0 0 6px 6px;
      `;

      section.items.forEach(item => content.appendChild(this.createMenuItem(item)));

      header.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggleSection(section.id, header, content);
      });

      wrapper.appendChild(header);
      wrapper.appendChild(content);
      return wrapper;
    }

    createMenuItem(item) {
      const menuItem = document.createElement("div");
      menuItem.className = "accordion-item";
      menuItem.style.cssText = `
        display: flex; 
        justify-content: space-between; 
        align-items: center; 
        padding: 8px 16px 8px 36px; 
        cursor: pointer; 
        transition: all 0.2s ease; 
        color: var(--color-text-2); 
        font-size: 12px;
      `;
      menuItem.innerHTML = `
        <span>${item.text}</span>
        ${item.shortcut ? `<span style="font-size: 10px; color: var(--color-text-3); background: var(--color-fill-2); padding: 2px 6px; border-radius: 3px;">${item.shortcut}</span>` : ''}
      `;

      menuItem.addEventListener("mouseenter", () => {
        menuItem.style.background = "var(--color-fill-3)";
        menuItem.style.color = "var(--color-text-1)";
      });
      menuItem.addEventListener("mouseleave", () => {
        menuItem.style.background = "transparent";
        menuItem.style.color = "var(--color-text-2)";
      });
      menuItem.addEventListener("click", (e) => {
        e.stopPropagation();
        if (item.action) {
          try {
            item.action();
          } catch (err) {
            this.showAlert(`❌ Error: ${err.message}`);
          }
        }
        this.hideMenu();
      });
      return menuItem;
    }

    toggleSection(sectionId, header, content) {
      const arrow = header.querySelector(".accordion-arrow");
      if (this.expandedSections.has(sectionId)) {
        this.expandedSections.delete(sectionId);
        content.style.maxHeight = "0";
        arrow.style.transform = "rotate(0deg)";
        header.style.background = "var(--color-bg-1)";
        header.style.borderLeftColor = "transparent";
      } else {
        this.expandedSections.add(sectionId);
        content.style.maxHeight = content.scrollHeight + "px";
        arrow.style.transform = "rotate(90deg)";
        header.style.background = "var(--color-fill-2)";
        header.style.borderLeftColor = "var(--color-primary-6)";
      }
    }

    setupMenuEventHandlers() {
      const closeBtn = this.menuElement.querySelector(".menu-close-btn");
      if (closeBtn) {
        closeBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.hideMenu();
        });
      }
      this.addEventListenerWithCleanup(this.menuElement, "mouseenter", () => {
        this.isHoveringMenu = true;
        this.clearHideTimeout();
      });
      this.addEventListenerWithCleanup(this.menuElement, "mouseleave", () => {
        this.isHoveringMenu = false;
        this.scheduleHideMenu();
      });
    }

    addEventListenerWithCleanup(element, event, handler) {
      element.addEventListener(event, handler);
      this.eventListeners.push({ element, event, handler });
    }

    attachEventListeners() {
      // Right-click context menu
      this.addEventListenerWithCleanup(document, "contextmenu", (e) => {
        const table = e.target.closest("table");
        if (table && this.isTableInChat(table)) {
          e.preventDefault();
          this.clearHoverTimeout();
          this.showMenu(e.pageX, e.pageY, table);
        }
      });

      // Cell click selection
      this.addEventListenerWithCleanup(document, "click", (e) => {
        const cell = e.target.closest("td, th");
        const table = e.target.closest("table");
        if (cell && table && this.isTableInChat(table)) {
          this.handleCellClick(e, cell, table);
        } else if (this.isMenuVisible && !this.menuElement.contains(e.target)) {
          this.hideMenu();
        }
      });

      // Keyboard shortcuts
      this.addEventListenerWithCleanup(document, "keydown", (e) => {
        if (e.key === "Escape" && this.isMenuVisible) {
          this.hideMenu();
        }
        if (e.ctrlKey && e.key === "e" && this.targetTable) {
          e.preventDefault();
          this.enableCellEditing();
        }
        if (e.ctrlKey && e.shiftKey && this.targetTable) {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            this.insertRowBelow();
          }
          if (e.key === "ArrowRight") {
            e.preventDefault();
            this.insertColumnRight();
          }
        }
        if (e.ctrlKey && e.key === "c" && this.targetTable) {
          e.preventDefault();
          this.copyTableToMemory();
        }
        if (e.ctrlKey && e.shiftKey && e.key === "P" && this.targetTable) {
          e.preventDefault();
          this.pasteTableFromMemory();
        }
      });
    }
    handleCellClick(e, cell, table) {
      if (this.activeCell) {
        this.activeCell.classList.remove("aionui-active-cell");
      }
      this.activeCell = cell;
      this.targetTable = table;
      cell.classList.add("aionui-active-cell");
      this.injectActiveStyles();
      this.calculateCellPosition(cell, table);
    }

    injectActiveStyles() {
      if (!document.getElementById("aionui-context-menu-styles")) {
        const style = document.createElement("style");
        style.id = "aionui-context-menu-styles";
        style.textContent = `
          .aionui-active-cell {
            background: var(--color-primary-light-1) !important;
            outline: 2px solid var(--color-primary-6) !important;
            outline-offset: -2px !important;
          }
          .menu-sections-container::-webkit-scrollbar {
            width: 6px;
          }
          .menu-sections-container::-webkit-scrollbar-track {
            background: var(--color-fill-1);
          }
          .menu-sections-container::-webkit-scrollbar-thumb {
            background: var(--color-border-3);
            border-radius: 3px;
          }
          .menu-sections-container::-webkit-scrollbar-thumb:hover {
            background: var(--color-border-4);
          }
        `;
        document.head.appendChild(style);
      }
    }

    calculateCellPosition(cell, table) {
      const row = cell.parentNode;
      const rows = Array.from(table.querySelectorAll("tr"));
      const cells = Array.from(row.querySelectorAll("td, th"));
      this.activeCellPosition = {
        row: rows.indexOf(row),
        col: cells.indexOf(cell)
      };
    }

    validateActiveCell() {
      if (!this.targetTable || this.activeCellPosition.row === -1) {
        this.showAlert("⚠️ No cell selected. Click on a cell first.");
        return false;
      }
      return true;
    }

    // === TABLE DETECTION ===
    isTableInChat(table) {
      // AIONUI renders tables inside Shadow DOM - need to traverse shadow boundaries
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
      
      // Fallback: check for additional chat context selectors
      const chatSelectors = [
        '[class*="chat"]',
        '[class*="message"]',
        '[class*="conversation"]',
        '[id*="chat"]',
        ".prose",
        ".markdown-body",
        '[class*="assistant"]'
      ];
      
      return chatSelectors.some(selector => table.closest(selector));
    }

    // === MENU DISPLAY ===
    showMenu(x, y, table) {
      this.clearHideTimeout();
      this.targetTable = table;
      this.expandedSections.clear();

      // Position menu
      this.menuElement.style.left = `${Math.min(x, window.innerWidth - 300)}px`;
      this.menuElement.style.top = `${Math.min(y, window.innerHeight - 400)}px`;
      this.menuElement.style.display = "block";

      // Animate in
      requestAnimationFrame(() => {
        this.menuElement.style.opacity = "1";
        this.menuElement.style.transform = "translateY(0) scale(1)";
      });

      this.isMenuVisible = true;
    }

    hideMenu() {
      if (!this.isMenuVisible) return;
      
      this.menuElement.style.opacity = "0";
      this.menuElement.style.transform = "translateY(-10px) scale(0.95)";
      
      setTimeout(() => {
        this.menuElement.style.display = "none";
        this.isMenuVisible = false;
      }, 200);
    }

    scheduleHideMenu() {
      this.hideTimeout = setTimeout(() => {
        if (!this.isHoveringTable && !this.isHoveringMenu) {
          this.hideMenu();
        }
      }, this.config.hideDelay);
    }

    clearHoverTimeout() {
      if (this.hoverTimeout) {
        clearTimeout(this.hoverTimeout);
        this.hoverTimeout = null;
      }
    }

    clearHideTimeout() {
      if (this.hideTimeout) {
        clearTimeout(this.hideTimeout);
        this.hideTimeout = null;
      }
      this.clearHoverTimeout();
    }

    // === TABLE OPERATIONS ===
    insertRowBelow() {
      if (!this.validateActiveCell()) return;
      
      const rows = this.targetTable.querySelectorAll("tr");
      const targetRow = rows[this.activeCellPosition.row];
      if (!targetRow) return;
      
      const numCols = targetRow.querySelectorAll("td, th").length;
      const newRow = document.createElement("tr");
      
      for (let i = 0; i < numCols; i++) {
        const td = document.createElement("td");
        td.style.cssText = `
          border: 1px solid var(--bg-3);
          padding: 8px;
          min-width: 120px;
        `;
        this.makeCellEditable(td);
        newRow.appendChild(td);
      }
      
      targetRow.parentNode.insertBefore(newRow, targetRow.nextSibling);
      this.showQuickNotification("✅ Row added");
    }

    deleteSelectedRow() {
      if (!this.validateActiveCell()) return;
      
      const rows = this.targetTable.querySelectorAll("tr");
      if (rows.length <= 1) {
        this.showAlert("⚠️ Table must have at least one row.");
        return;
      }
      
      if (confirm("Delete this row?")) {
        rows[this.activeCellPosition.row].remove();
        this.activeCell = null;
        this.activeCellPosition = { row: -1, col: -1 };
        this.showQuickNotification("✅ Row deleted");
      }
    }

    duplicateSelectedRow() {
      if (!this.validateActiveCell()) return;
      
      const rows = this.targetTable.querySelectorAll("tr");
      const targetRow = rows[this.activeCellPosition.row];
      if (!targetRow) return;
      
      const clonedRow = targetRow.cloneNode(true);
      clonedRow.querySelectorAll("td").forEach(cell => this.makeCellEditable(cell));
      targetRow.parentNode.insertBefore(clonedRow, targetRow.nextSibling);
      this.showQuickNotification("✅ Row duplicated");
    }

    insertColumnRight() {
      if (!this.validateActiveCell()) return;
      
      const rows = this.targetTable.querySelectorAll("tr");
      const colIndex = this.activeCellPosition.col;
      
      rows.forEach(row => {
        const cells = row.querySelectorAll("td, th");
        const newCell = document.createElement(row.querySelector("th") ? "th" : "td");
        newCell.style.cssText = `
          border: 1px solid var(--bg-3);
          padding: 8px;
          min-width: 120px;
        `;
        
        if (newCell.tagName === "TD") {
          this.makeCellEditable(newCell);
        }
        
        if (colIndex + 1 < cells.length) {
          row.insertBefore(newCell, cells[colIndex + 1]);
        } else {
          row.appendChild(newCell);
        }
      });
      
      this.showQuickNotification("✅ Column added");
    }

    deleteSelectedColumn() {
      if (!this.validateActiveCell()) return;
      
      const rows = this.targetTable.querySelectorAll("tr");
      const colIndex = this.activeCellPosition.col;
      
      // Check if table would have at least one column left
      const firstRow = rows[0];
      if (firstRow && firstRow.querySelectorAll("td, th").length <= 1) {
        this.showAlert("⚠️ Table must have at least one column.");
        return;
      }
      
      if (confirm("Delete this column?")) {
        rows.forEach(row => {
          const cells = row.querySelectorAll("td, th");
          if (cells[colIndex]) {
            cells[colIndex].remove();
          }
        });
        this.activeCell = null;
        this.activeCellPosition = { row: -1, col: -1 };
        this.showQuickNotification("✅ Column deleted");
      }
    }
    // === CELL EDITING ===
    enableCellEditing() {
      if (!this.targetTable) {
        this.showAlert("⚠️ No table selected.");
        return;
      }
      
      const cells = this.targetTable.querySelectorAll("td");
      cells.forEach(cell => this.makeCellEditable(cell));
      this.showQuickNotification("✅ Cell editing enabled");
    }

    disableCellEditing() {
      if (!this.targetTable) {
        this.showAlert("⚠️ No table selected.");
        return;
      }
      
      const cells = this.targetTable.querySelectorAll("td");
      cells.forEach(cell => {
        cell.contentEditable = false;
        cell.style.cursor = "default";
      });
      this.showQuickNotification("✅ Cell editing disabled");
    }

    makeCellEditable(cell) {
      cell.contentEditable = true;
      cell.style.cursor = "text";
      cell.addEventListener("focus", () => {
        cell.style.background = "var(--color-primary-light-1)";
      });
      cell.addEventListener("blur", () => {
        cell.style.background = "";
      });
    }

    // === CLIPBOARD OPERATIONS ===
    async pasteFromExcel() {
      if (!this.targetTable) {
        this.showQuickNotification("⚠️ No table selected");
        return;
      }

      try {
        if (!navigator.clipboard || !navigator.clipboard.readText) {
          this.showQuickNotification("❌ Clipboard not accessible");
          return;
        }

        const clipboardText = await navigator.clipboard.readText();
        if (!clipboardText || clipboardText.trim() === "") {
          this.showQuickNotification("⚠️ Clipboard is empty");
          return;
        }

        const parsedData = this.parseClipboardData(clipboardText);
        if (parsedData.length === 0) {
          this.showQuickNotification("⚠️ No tabular data detected");
          return;
        }

        let startRow = this.activeCellPosition.row >= 0 ? this.activeCellPosition.row : 1;
        let startCol = this.activeCellPosition.col >= 0 ? this.activeCellPosition.col : 0;

        if (startRow === 0) startRow = 1; // Skip header

        const result = this.insertClipboardDataIntoTable(parsedData, startRow, startCol);
        if (result.success) {
          this.showQuickNotification(`✅ ${result.cellsUpdated} cell(s) pasted, ${result.rowsInserted} row(s) added`);
        }

      } catch (error) {
        console.error("❌ Paste error:", error);
        this.showQuickNotification(`❌ Error: ${error.message}`);
      }
    }

    parseClipboardData(text) {
      if (!text) return [];
      
      const normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      const lines = normalizedText.split('\n');
      const data = [];

      for (const line of lines) {
        if (line.trim() === '' && data.length > 0) continue;
        const cells = line.split('\t').map(cell => cell.trim());
        if (cells.some(cell => cell !== '')) {
          data.push(cells);
        }
      }

      return data;
    }

    insertClipboardDataIntoTable(data, startRow, startCol) {
      if (!this.targetTable || !data || data.length === 0) {
        return { success: false, rowsInserted: 0, cellsUpdated: 0 };
      }

      let rowsInserted = 0;
      let cellsUpdated = 0;

      let tbody = this.targetTable.querySelector('tbody');
      if (!tbody) {
        tbody = document.createElement('tbody');
        this.targetTable.appendChild(tbody);
      }

      const allRows = Array.from(this.targetTable.querySelectorAll('tr'));
      const headerRow = this.targetTable.querySelector('thead tr') || allRows[0];
      const numCols = headerRow ? headerRow.querySelectorAll('th, td').length : data[0].length;

      data.forEach((rowData, dataRowIndex) => {
        const targetRowIndex = startRow + dataRowIndex;
        let targetRow = allRows[targetRowIndex];

        if (!targetRow) {
          targetRow = document.createElement('tr');
          for (let i = 0; i < numCols; i++) {
            const td = document.createElement('td');
            td.style.cssText = `
              border: 1px solid var(--bg-3);
              padding: 8px;
              min-width: 120px;
            `;
            this.makeCellEditable(td);
            targetRow.appendChild(td);
          }
          tbody.appendChild(targetRow);
          allRows.push(targetRow);
          rowsInserted++;
        }

        const targetCells = targetRow.querySelectorAll('td');
        rowData.forEach((cellValue, dataColIndex) => {
          const targetColIndex = startCol + dataColIndex;
          if (targetColIndex < targetCells.length) {
            targetCells[targetColIndex].textContent = cellValue;
            cellsUpdated++;
          }
        });
      });

      return { success: true, rowsInserted, cellsUpdated };
    }

    copyTableToMemory() {
      if (!this.targetTable) {
        this.showAlert("⚠️ No table selected.");
        return;
      }

      try {
        const tableHTML = this.targetTable.outerHTML;
        navigator.clipboard.writeText(tableHTML).then(() => {
          this.showQuickNotification("✅ Table copied to clipboard");
        }).catch(() => {
          this.showQuickNotification("❌ Failed to copy table");
        });
      } catch (error) {
        this.showQuickNotification("❌ Copy failed");
      }
    }

    // === EXPORT FUNCTIONS ===
    exportExcel() {
      this.showQuickNotification("📊 Excel export feature coming soon");
    }

    exportCSV() {
      if (!this.targetTable) {
        this.showAlert("⚠️ No table selected.");
        return;
      }

      try {
        const rows = this.targetTable.querySelectorAll('tr');
        const csvContent = Array.from(rows).map(row => {
          const cells = row.querySelectorAll('td, th');
          return Array.from(cells).map(cell => {
            const text = cell.textContent.trim();
            return text.includes(',') ? `"${text}"` : text;
          }).join(',');
        }).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'table-export.csv';
        a.click();
        URL.revokeObjectURL(url);

        this.showQuickNotification("✅ CSV exported");
      } catch (error) {
        this.showQuickNotification("❌ Export failed");
      }
    }

    copyAsHTML() {
      if (!this.targetTable) {
        this.showAlert("⚠️ No table selected.");
        return;
      }

      try {
        const tableHTML = this.targetTable.outerHTML;
        navigator.clipboard.writeText(tableHTML).then(() => {
          this.showQuickNotification("✅ HTML copied to clipboard");
        }).catch(() => {
          this.showQuickNotification("❌ Failed to copy HTML");
        });
      } catch (error) {
        this.showQuickNotification("❌ Copy failed");
      }
    }

    // === UTILITY FUNCTIONS ===
    showAlert(message) {
      alert(message);
    }

    showQuickNotification(message) {
      console.log(message);
      
      // Create toast notification
      const toast = document.createElement('div');
      toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--color-bg-2);
        color: var(--color-text-1);
        padding: 12px 16px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 16000;
        font-size: 14px;
        border: 1px solid var(--color-border-2);
      `;
      toast.textContent = message;
      document.body.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
          if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
        }, 300);
      }, 3000);
    }

    // === INITIALIZATION ===
    observeNewTables() {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.tagName === "TABLE" && this.isTableInChat(node)) {
                console.log("📊 New table detected");
              }
              if (node.querySelectorAll) {
                node.querySelectorAll("table").forEach(table => {
                  if (this.isTableInChat(table)) {
                    console.log("📊 Sub-table detected");
                  }
                });
              }
            }
          });
        });
      });

      observer.observe(document.body, { childList: true, subtree: true });
    }

    processExistingTables() {
      let count = 0;
      document.querySelectorAll("table").forEach(table => {
        if (this.isTableInChat(table)) {
          count++;
        }
      });
      console.log(`📊 ${count} table(s) ready for context menu`);
    }

    // === CLEANUP ===
    destroy() {
      this.eventListeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
      });
      this.eventListeners = [];
      
      if (this.menuElement && this.menuElement.parentNode) {
        this.menuElement.parentNode.removeChild(this.menuElement);
      }
      
      this.clearHoverTimeout();
      this.clearHideTimeout();
      this.initialized = false;
    }
  }

  // Initialize the context menu manager
  const contextMenuManager = new AIONUIContextMenuManager();
  
  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(() => contextMenuManager.init(), 1000);
    });
  } else {
    setTimeout(() => contextMenuManager.init(), 1000);
  }

  // Export to global scope for debugging
  window.aionui_menu = contextMenuManager;

  console.log("🎉 AIONUI Context Menu V1.0 loaded successfully!");

})();