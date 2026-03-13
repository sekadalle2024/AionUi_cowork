/**
 * AIONUI Table Enhancement Script - Adapted from Claraverse V17.1
 * @version 1.0.0
 * @description
 * - Adapts Claraverse table enhancement for AIONUI chat interface
 * - Detects tables with "Flowise" column in chat messages
 * - Extracts dynamic keywords and processes table data
 * - Sends consolidated HTML to n8n endpoint
 * - Displays enhanced tables in chat
 * - Uses AIONUI-specific selectors and styling
 */
(function () {
  "use strict";

  console.log("🚀 Initialisation AIONUI Table Enhancer V1.0");

  // --- CONFIGURATION FOR AIONUI ---
  const CONFIG = {
    N8N_ENDPOINT_URL: "https://barow52161.app.n8n.cloud/webhook/htlm_processor",
    DEBUG_LOG_HTML: true,
    SELECTORS: {
      // AIONUI-specific selectors
      CHAT_TABLES: ".markdown-shadow-body table, .message-item table",
      MESSAGE_CONTAINER: ".message-item",
      MARKDOWN_BODY: ".markdown-shadow-body",
      TABLE_WRAPPER: "div[style*='overflowX']", // ReactMarkdown table wrapper
    },
    PROCESSED_CLASS: "aionui-n8n-processed",
    PERSISTENCE: {
      STORAGE_KEY: "aionui_n8n_data_v1",
      CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours
      MAX_CACHE_SIZE: 50,
    },
  };

  /**
   * Extract dynamic keyword from Flowise table (adapted for AIONUI)
   * @param {HTMLElement} flowiseTable - Table with "Flowise" header
   * @returns {string|null} Extracted keyword or null
   */
  function extractDynamicKeyword(flowiseTable) {
    console.log("🔍 Extracting dynamic keyword from AIONUI table...");

    try {
      const headers = Array.from(flowiseTable.querySelectorAll("th")).map((th) =>
        th.textContent.trim()
      );

      console.log("📋 Table headers detected:", headers);

      const flowiseColumnIndex = headers.findIndex(h =>
        h.toLowerCase() === "flowise"
      );

      if (flowiseColumnIndex === -1) {
        console.warn("⚠️ 'Flowise' column not found");
        return null;
      }

      const firstDataRow = flowiseTable.querySelector("tbody tr");
      if (!firstDataRow) {
        console.warn("⚠️ No data rows in Flowise table");
        return null;
      }

      const cells = firstDataRow.querySelectorAll("td");
      if (flowiseColumnIndex >= cells.length) {
        console.warn(`⚠️ Invalid column index: ${flowiseColumnIndex}`);
        return null;
      }

      const keyword = cells[flowiseColumnIndex].textContent.trim();
      if (!keyword) {
        console.warn("⚠️ Empty keyword in Flowise column");
        return null;
      }

      console.log(`✅ Dynamic keyword extracted: "${keyword}"`);
      return keyword;
    } catch (error) {
      console.error("❌ Error extracting keyword:", error);
      return null;
    }
  }
  /**
   * Generate keyword variations for flexible search
   * @param {string} keyword - Base keyword
   * @returns {Array<string>} Array of variations
   */
  function generateKeywordVariations(keyword) {
    if (!keyword) return [];

    const variations = new Set();
    const normalized = keyword.trim();

    variations.add(normalized);
    variations.add(normalized.toLowerCase());
    variations.add(normalized.toUpperCase());
    variations.add(normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase());

    const words = normalized.split(/\s+/);
    if (words.length > 1) {
      words.forEach(word => {
        variations.add(word);
        variations.add(word.toLowerCase());
        variations.add(word.toUpperCase());
      });
    }

    console.log(`🔄 Generated variations for "${keyword}":`, Array.from(variations));
    return Array.from(variations);
  }

  /**
   * Find user message preceding the trigger table (AIONUI adaptation)
   * @param {HTMLElement} triggerTable - The trigger table
   * @returns {string|null} User message content or null
   */
  function findAndExtractUserMessage(triggerTable) {
    console.log("🔎 Searching for user message preceding trigger table...");

    const messageKeywords = ["/", "[command]", "[processus]", "modele", "directive", "etape", "[", "]", "="];

    try {
      // Find the message container for this table
      const messageContainer = triggerTable.closest(CONFIG.SELECTORS.MESSAGE_CONTAINER);
      if (!messageContainer) {
        console.warn("⚠️ Message container not found");
        return null;
      }

      // Get all message containers
      const allMessageContainers = Array.from(document.querySelectorAll(CONFIG.SELECTORS.MESSAGE_CONTAINER));
      const triggerIndex = allMessageContainers.findIndex(container => container === messageContainer);

      if (triggerIndex > 0) {
        const precedingContainer = allMessageContainers[triggerIndex - 1];
        const messageContent = precedingContainer.textContent.trim();
        const messageContentLower = messageContent.toLowerCase();

        const hasKeywords = messageKeywords.some(kw => messageContentLower.includes(kw));

        if (hasKeywords) {
          console.log("✅ User message found and validated:", messageContent.substring(0, 100) + "...");
          return messageContent;
        } else {
          console.log("ℹ️ Preceding message doesn't seem to contain expected user message");
        }
      } else {
        console.log("ℹ️ No preceding message container found");
      }
    } catch (error) {
      console.error("❌ Error searching for user message:", error);
    }

    return null;
  }

  /**
   * Create HTML table for user message (AIONUI styling)
   * @param {string} messageContent - User message content
   * @returns {string} HTML string of created table
   */
  function createUserMessageTableHTML(messageContent) {
    const table = document.createElement("table");
    // Use AIONUI table styling
    table.style.cssText = `
      border-collapse: collapse;
      border: 1px solid var(--bg-3);
      min-width: 100%;
      margin-bottom: 1.5rem;
    `;

    const thead = table.createTHead();
    const headerRow = thead.insertRow();
    const th = document.createElement("th");
    th.textContent = "user_message";
    th.style.cssText = `
      padding: 8px;
      border: 1px solid var(--bg-3);
      background-color: var(--color-fill-2);
      font-weight: 600;
      text-align: left;
    `;
    headerRow.appendChild(th);

    const tbody = table.createTBody();
    const bodyRow = tbody.insertRow();
    const td = bodyRow.insertCell();
    td.textContent = messageContent;
    td.style.cssText = `
      padding: 8px;
      border: 1px solid var(--bg-3);
      min-width: 120px;
      white-space: pre-wrap;
    `;

    console.log("✅ User message table created with AIONUI styling");
    return table.outerHTML;
  }
  /**
   * Collect criteria tables based on dynamic keyword (AIONUI adaptation)
   * @param {string} dynamicKeyword - Dynamically extracted keyword
   * @param {HTMLElement} triggerTable - The trigger table
   * @param {string} userMessageTableHTML - HTML of user message table
   * @returns {string} Consolidated HTML of all tables
   */
  function collectCriteriaTables(dynamicKeyword, triggerTable = null, userMessageTableHTML = '') {
    const allMessageContainers = document.querySelectorAll(CONFIG.SELECTORS.MESSAGE_CONTAINER);
    const collectedTablesHTML = [];
    const keywordVariations = generateKeywordVariations(dynamicKeyword);

    console.log(`🔍 Searching message containers for keyword "${dynamicKeyword}"...`);
    console.log(`📊 Total message containers to analyze: ${allMessageContainers.length}`);

    let containersAnalyzed = 0;
    let containersWithTables = 0;
    let containersWithRequiredHeaders = 0;
    let containersMatching = 0;

    allMessageContainers.forEach((container, containerIndex) => {
      containersAnalyzed++;

      const firstTable = container.querySelector(CONFIG.SELECTORS.CHAT_TABLES);
      if (!firstTable) {
        console.log(`⏭️ Container ${containerIndex + 1}: No table, skipped`);
        return;
      }

      containersWithTables++;

      const headers = Array.from(firstTable.querySelectorAll("th")).map((th) =>
        th.textContent.trim().toLowerCase()
      );

      console.log(`📋 Container ${containerIndex + 1} - Table headers:`, headers);

      const hasRequiredHeaders = headers.includes("rubrique") && headers.includes("description");
      if (!hasRequiredHeaders) {
        console.log(`⏭️ Container ${containerIndex + 1}: No 'Rubrique' and 'Description' headers, skipped`);
        return;
      }

      containersWithRequiredHeaders++;

      const cellsOfFirstTable = firstTable.querySelectorAll("td");
      const cellTexts = Array.from(cellsOfFirstTable).map(cell => cell.textContent.trim());

      console.log(`📊 Container ${containerIndex + 1} - Cell contents:`, cellTexts);

      const keywordFound = Array.from(cellsOfFirstTable).some((cell) => {
        const cellText = cell.textContent.trim();
        const found = keywordVariations.some((variation) =>
          cellText.toLowerCase().includes(variation.toLowerCase())
        );
        if (found) {
          console.log(`✅ Container ${containerIndex + 1} - Keyword found in cell: "${cellText}"`);
        }
        return found;
      });

      if (keywordFound) {
        containersMatching++;
        console.log(`✅ Container ${containerIndex + 1}: Match found for keyword "${dynamicKeyword}". Collecting tables...`);
        const allTablesInContainer = container.querySelectorAll(CONFIG.SELECTORS.CHAT_TABLES);
        console.log(`📋 Container ${containerIndex + 1}: ${allTablesInContainer.length} table(s) collected`);
        allTablesInContainer.forEach((table) => {
          collectedTablesHTML.push(table.outerHTML);
        });
      } else {
        console.log(`⏭️ Container ${containerIndex + 1}: No match with keyword "${dynamicKeyword}"`);
      }
    });

    console.log(`📊 Collection statistics:`);
    console.log(`   - Containers analyzed: ${containersAnalyzed}`);
    console.log(`   - Containers with tables: ${containersWithTables}`);
    console.log(`   - Containers with required headers: ${containersWithRequiredHeaders}`);
    console.log(`   - Matching containers: ${containersMatching}`);

    if (triggerTable) {
      console.log(`📋 Adding trigger table for keyword "${dynamicKeyword}"`);
      collectedTablesHTML.push(triggerTable.outerHTML);
    }

    if (userMessageTableHTML) {
      console.log("📋 Adding user_message table to collection");
      collectedTablesHTML.push(userMessageTableHTML);
    }

    const finalHTML = collectedTablesHTML.join("\n");
    const totalTableCount = (finalHTML.match(/<table/g) || []).length;
    console.log(`📊 Collection completed: ${totalTableCount} table(s) total`);

    return finalHTML;
  }
  /**
   * Normalize different n8n response formats (from Claraverse)
   * @param {any} response - Raw n8n response
   * @returns {Object} {output: string, metadata: Object}
   */
  function normalizeN8nResponse(response) {
    console.log("🔍 ========== N8N RESPONSE NORMALIZATION ==========");
    console.log("📦 Response type:", Array.isArray(response) ? "Array" : typeof response);
    console.log("📦 Full response (first 1000 chars):", JSON.stringify(response, null, 2).substring(0, 1000));

    // Array format with direct output + tables + status
    if (Array.isArray(response) && response.length > 0) {
      console.log("✅ Response is Array with", response.length, "element(s)");
      const firstItem = response[0];

      if (firstItem && typeof firstItem === 'object' &&
        'output' in firstItem &&
        'tables' in firstItem &&
        'status' in firstItem &&
        !('response' in firstItem) &&
        !('body' in firstItem)) {
        
        console.log("🔍 Detected htlm_processor format (direct output + tables + status)...");
        
        if (firstItem.status === 'success' && firstItem.output) {
          console.log("✅ ✅ ✅ FORMAT DETECTED: htlm_processor workflow");
          return {
            output: firstItem.output,
            metadata: {
              status: firstItem.status,
              timestamp: firstItem.timestamp,
              contentLength: firstItem.output?.length || 0,
              tables_found: firstItem.tables_found,
              tables: firstItem.tables
            }
          };
        }
      }

      // Format with body directly (without response wrapper)
      if (firstItem && typeof firstItem === 'object' && 'body' in firstItem && !('response' in firstItem)) {
        const body = firstItem.body;
        if (Array.isArray(body) && body.length > 0 && body[0].output) {
          console.log("✅ ✅ ✅ FORMAT DETECTED: Direct body format");
          return {
            output: body[0].output,
            metadata: {
              status: body[0].status,
              timestamp: body[0].timestamp,
              contentLength: body[0].output?.length || 0,
              headers: firstItem.headers,
              statusCode: firstItem.statusCode
            }
          };
        }
      }

      // Format with response.body[0].output
      if (firstItem && typeof firstItem === 'object' && 'response' in firstItem) {
        if (firstItem.response && typeof firstItem.response === 'object' && 'body' in firstItem.response) {
          const body = firstItem.response.body;
          if (Array.isArray(body) && body.length > 0 && body[0].output) {
            console.log("✅ ✅ ✅ FORMAT DETECTED: Webhook htlm_processor (response.body[0].output)");
            return {
              output: body[0].output,
              metadata: {
                status: body[0].status,
                timestamp: body[0].timestamp,
                contentLength: body[0].output?.length || 0,
                headers: firstItem.response.headers,
                statusCode: firstItem.response.statusCode
              }
            };
          }
        }
      }

      // Standard format with 'output' in array
      if (firstItem && typeof firstItem === 'object' && 'output' in firstItem) {
        console.log("✅ FORMAT DETECTED: Standard (output in array)");
        return {
          output: firstItem.output,
          metadata: firstItem
        };
      }
    }

    // Direct object format
    if (response && typeof response === 'object' && !Array.isArray(response)) {
      if ('output' in response) {
        console.log("✅ FORMAT DETECTED: Direct output");
        return {
          output: response.output,
          metadata: response
        };
      }
    }

    console.error("❌ Unrecognized response format:", response);
    return {
      output: null,
      metadata: { error: "Unknown format", rawResponse: response }
    };
  }
  /**
   * Query n8n endpoint with table data
   * @param {string} tablesHTML - Consolidated HTML tables
   * @param {string} targetKeyword - Target keyword
   * @returns {Promise<any>} n8n response
   */
  async function queryN8nEndpoint(tablesHTML, targetKeyword) {
    try {
      console.log("📡 Sending data to n8n...");
      console.log("🔗 Endpoint:", CONFIG.N8N_ENDPOINT_URL);
      console.log("📊 Data size:", tablesHTML.length, "characters");
      console.log("🎯 Target keyword:", targetKeyword);

      const payload = { question: tablesHTML };

      // Always log HTML content to console
      if (CONFIG.DEBUG_LOG_HTML) {
        logHTMLToConsole(tablesHTML, targetKeyword);
      }

      const response = await fetch(CONFIG.N8N_ENDPOINT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload),
      });

      console.log("📨 HTTP response received:");
      console.log("   - Status:", response.status);
      console.log("   - Status Text:", response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ HTTP Error:", errorText);
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log("✅ Data received from n8n endpoint! Status:", response.status, "OK");

      return responseData;
    } catch (error) {
      console.error("❌ Error calling n8n API:", error);
      throw error;
    }
  }

  /**
   * Log HTML content to console (systematic)
   * @param {string} tablesHTML - HTML content to display
   * @param {string} targetKeyword - Target keyword
   */
  function logHTMLToConsole(tablesHTML, targetKeyword) {
    console.log("\n");
    console.log("═══════════════════════════════════════════════════════════════════");
    console.log("🔍 HTML CONTENT SENT TO N8N");
    console.log("═══════════════════════════════════════════════════════════════════");
    console.log("");
    console.log("🎯 Keyword:", targetKeyword);
    console.log("📊 Total size:", tablesHTML.length, "characters");
    console.log("📡 Endpoint:", CONFIG.N8N_ENDPOINT_URL);
    console.log("⏰ Timestamp:", new Date().toISOString());
    console.log("");
    console.log("═══════════════════════════════════════════════════════════════════");
    console.log("📋 COMPLETE HTML CONTENT:");
    console.log("═══════════════════════════════════════════════════════════════════");
    console.log("");
    console.log(tablesHTML);
    console.log("");
    console.log("═══════════════════════════════════════════════════════════════════");
    console.log("💡 TIP: Right-click on HTML above → 'Copy string contents'");
    console.log("💡 Then test in n8n with curl or fetch");
    console.log("═══════════════════════════════════════════════════════════════════");
    console.log("\n");
  }
  /**
   * Extract tables from n8n response (AIONUI styling)
   * @param {string} responseText - Response text from n8n
   * @returns {Array<HTMLElement>} Array of table elements
   */
  function extractTablesFromResponse(responseText) {
    const tables = [];
    console.log("🔍 Analyzing n8n response:");

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = responseText;
    const existingTables = tempDiv.querySelectorAll("table");

    if (existingTables.length > 0) {
      console.log(`📋 ${existingTables.length} HTML table(s) found in response`);
      existingTables.forEach((table) => {
        // Apply AIONUI table styling
        table.style.cssText = `
          border-collapse: collapse;
          border: 1px solid var(--bg-3);
          min-width: 100%;
          margin-bottom: 1.5rem;
        `;
        cleanEmptyRows(table);
        enhanceTableUrls(table);
        tables.push(table.cloneNode(true));
      });
      return tables;
    }

    console.log("🔄 Converting markdown to HTML tables...");

    const regexPatterns = [
      /\|[^\n]*\|(?:\n\|[^\n]*\|)*/gm,
      /^\s*\|(.+)\|\s*\n\s*\|(\s*:?-+:?\s*\|)+\s*\n([\s\S]*?)(?=\n\s*\n|\n\s*[^|]|$)/gm,
    ];

    for (const regex of regexPatterns) {
      let match;
      regex.lastIndex = 0;

      while ((match = regex.exec(responseText)) !== null) {
        const tableContent = match[0].trim();
        const lines = tableContent.split('\n').map(line => line.trim()).filter(line => line.includes('|'));

        if (lines.length < 2) continue;

        const headerRow = lines[0];
        const dataRows = lines.slice(1).filter(line => !/^\|[\s:|-]+\|$/.test(line.trim()));

        if (!headerRow || dataRows.length === 0) continue;

        const table = createTableFromMarkdown(headerRow, dataRows);
        if (table) tables.push(table);
      }

      if (tables.length > 0) break;
    }

    if (tables.length === 0) {
      console.error("❌ No tables detected in response");
      console.log("📄 Analyzed content:", responseText.substring(0, 500));
    } else {
      console.log(`✅ ${tables.length} table(s) extracted from markdown`);
    }

    return tables;
  }

  /**
   * Create table from markdown (AIONUI styling)
   * @param {string} headerRow - Header row string
   * @param {Array<string>} dataRows - Data rows array
   * @returns {HTMLElement|null} Table element or null
   */
  function createTableFromMarkdown(headerRow, dataRows) {
    const table = document.createElement("table");
    // Apply AIONUI styling
    table.style.cssText = `
      border-collapse: collapse;
      border: 1px solid var(--bg-3);
      min-width: 100%;
      margin-bottom: 1.5rem;
    `;

    const thead = document.createElement("thead");
    const headerTr = document.createElement("tr");

    let cleanHeaderCells = headerRow.split("|").filter(cell => cell.trim() !== '');

    cleanHeaderCells.forEach((cellText, index) => {
      const th = document.createElement("th");
      th.style.cssText = `
        padding: 8px;
        border: 1px solid var(--bg-3);
        background-color: var(--color-fill-2);
        text-align: left;
        font-weight: 600;
      `;
      th.textContent = cellText.trim() || `Column ${index + 1}`;
      headerTr.appendChild(th);
    });

    thead.appendChild(headerTr);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    dataRows.forEach((rowText, rowIndex) => {
      const tr = document.createElement("tr");
      tr.style.backgroundColor = rowIndex % 2 === 0 ? 'transparent' : 'var(--color-fill-1)';

      let cells = rowText.split("|").filter(cell => cell.trim() !== '');

      cells.forEach((cellText) => {
        const td = document.createElement("td");
        td.style.cssText = `
          padding: 8px;
          border: 1px solid var(--bg-3);
          min-width: 120px;
          overflow-wrap: break-word;
          white-space: pre-wrap;
        `;

        const trimmedText = cellText.trim();

        if (trimmedText && isUrl(trimmedText)) {
          const link = document.createElement("a");
          link.href = trimmedText;
          link.textContent = trimmedText;
          link.style.cssText = `
            color: var(--color-primary-6);
            text-decoration: none;
            word-break: break-all;
          `;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.addEventListener('mouseover', () => {
            link.style.textDecoration = 'underline';
          });
          link.addEventListener('mouseout', () => {
            link.style.textDecoration = 'none';
          });
          td.appendChild(link);
        } else {
          td.textContent = trimmedText || "-";
        }

        tr.appendChild(td);
      });

      if (tr.children.length > 0) tbody.appendChild(tr);
    });

    if (tbody.children.length > 0) {
      table.appendChild(tbody);
      return table;
    }

    return null;
  }
  /**
   * Find target container for table integration (AIONUI adaptation)
   * @param {HTMLElement} triggerTable - The trigger table
   * @returns {HTMLElement|null} Target container or null
   */
  function findTargetContainer(triggerTable) {
    // First try to find the markdown body container
    const markdownBody = triggerTable.closest(CONFIG.SELECTORS.MARKDOWN_BODY);
    if (markdownBody) {
      console.log("🎯 Target container found (markdown-shadow-body)");
      return markdownBody;
    }

    // Fallback to message container
    const messageContainer = triggerTable.closest(CONFIG.SELECTORS.MESSAGE_CONTAINER);
    if (messageContainer) {
      console.log("🎯 Target container found (message-item)");
      return messageContainer;
    }

    console.warn("⚠️ Unable to find target container");
    return null;
  }

  /**
   * Integrate tables into AIONUI chat (adapted styling)
   * @param {Array<HTMLElement>} n8nTables - Tables from n8n response
   * @param {HTMLElement} targetContainer - Target container
   * @param {string} targetKeyword - Target keyword
   */
  function integrateTablesOnly(n8nTables, targetContainer, targetKeyword) {
    if (!n8nTables.length || !targetContainer) {
      console.warn("⚠️ No tables to integrate or invalid container");
      return;
    }

    console.log(`🔧 Integrating ${n8nTables.length} table(s) into AIONUI chat`);

    n8nTables.forEach((table, index) => {
      const tableWrapper = document.createElement("div");
      // Use AIONUI-style wrapper (similar to ReactMarkdown table wrapper)
      tableWrapper.style.cssText = `
        overflow-x: auto;
        max-width: 100%;
        margin-top: 1rem;
        margin-bottom: 1rem;
      `;
      tableWrapper.setAttribute('data-aionui-n8n-table', 'true');
      tableWrapper.setAttribute('data-aionui-keyword', targetKeyword);
      tableWrapper.setAttribute('data-container-id', `aionui-container-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

      const clonedTable = table.cloneNode(true);
      cleanEmptyRows(clonedTable);
      enhanceTableUrls(clonedTable);

      tableWrapper.appendChild(clonedTable);
      targetContainer.appendChild(tableWrapper);
    });

    console.log(`✅ ${n8nTables.length} table(s) integrated into AIONUI chat`);
  }

  /**
   * Process Flowise trigger table (main processing function)
   * @param {HTMLElement} triggerTable - The trigger table
   */
  async function processN8nTrigger(triggerTable) {
    console.log("🎬 === STARTING AIONUI FLOWISE TABLE PROCESSING ===");

    const messageContainer = triggerTable.closest(CONFIG.SELECTORS.MESSAGE_CONTAINER);
    if (!messageContainer || messageContainer.classList.contains(CONFIG.PROCESSED_CLASS)) {
      console.log("⏭️ Table already processed or invalid parent, skipped");
      return;
    }

    const dynamicKeyword = extractDynamicKeyword(triggerTable);
    if (!dynamicKeyword) {
      console.log("ℹ️ Flowise table without valid keyword, skipped");
      return;
    }

    console.log(`🎯 Dynamic keyword detected: "${dynamicKeyword}"`);
    messageContainer.classList.add(CONFIG.PROCESSED_CLASS);

    try {
      console.log("📝 Step 1: Extracting user message...");
      const userMessageContent = findAndExtractUserMessage(triggerTable);
      let userMessageTableHTML = "";

      if (userMessageContent) {
        console.log("✅ User message found:", userMessageContent.substring(0, 100) + "...");
        userMessageTableHTML = createUserMessageTableHTML(userMessageContent);
      } else {
        console.log("ℹ️ No user message found");
      }

      console.log("📊 Step 2: Collecting criteria tables...");
      const criteriaTablesHTML = collectCriteriaTables(dynamicKeyword, triggerTable, userMessageTableHTML);

      if (!criteriaTablesHTML) {
        throw new Error(`No criteria tables found for keyword: "${dynamicKeyword}"`);
      }

      console.log(`✅ Tables collected: ${criteriaTablesHTML.length} characters`);

      console.log("📡 Step 3: Sending to n8n endpoint...");
      const response = await queryN8nEndpoint(criteriaTablesHTML, dynamicKeyword);
      console.log("✅ Response received from n8n");

      console.log("🔄 Step 4: Normalizing n8n response...");
      const { output, metadata } = normalizeN8nResponse(response);

      if (!output || output.trim() === '') {
        console.error("❌ Empty or null output after normalization");
        throw new Error("Invalid or empty n8n response");
      }

      console.log("✅ Response normalized successfully");
      console.log("📊 Output size:", output.length, "characters");

      console.log("🔧 Step 5: Extracting tables from output...");
      const n8nTables = extractTablesFromResponse(output);

      if (!n8nTables.length) {
        console.warn("⚠️ No tables found in response");
        throw new Error("No tables found in n8n response");
      }

      console.log(`✅ ${n8nTables.length} table(s) extracted`);

      console.log("🎯 Step 6: Finding target container...");
      const targetContainer = findTargetContainer(triggerTable);

      if (!targetContainer) {
        throw new Error("Unable to find target container");
      }

      console.log("✅ Target container found");

      console.log("🔧 Step 7: Integrating tables into AIONUI DOM...");
      integrateTablesOnly(n8nTables, targetContainer, dynamicKeyword);

      console.log("🗑️ Step 8: Removing trigger table...");
      removeTriggerTable(triggerTable, dynamicKeyword);

      console.log(`🎉 === PROCESSING COMPLETED SUCCESSFULLY FOR "${dynamicKeyword}" ===`);

    } catch (error) {
      console.error(`❌ === ERROR DURING PROCESSING FOR "${dynamicKeyword}" ===`);
      console.error("📍 Error message:", error.message);
      console.error("📍 Stack trace:", error.stack);

      // Show error in chat
      const errorMessage = document.createElement("div");
      errorMessage.style.cssText = `
        margin: 1rem 0;
        padding: 1rem;
        background-color: var(--color-danger-light-1);
        border: 1px solid var(--color-danger-3);
        border-radius: 8px;
        color: var(--color-danger-6);
      `;
      errorMessage.innerHTML = `
        <div style="display: flex; align-items: start;">
          <span style="margin-right: 8px;">❌</span>
          <div style="flex: 1;">
            <div style="font-weight: 600; margin-bottom: 4px;">
              N8N Error
            </div>
            <div style="font-size: 14px;">
              ${error.message}
            </div>
          </div>
        </div>
      `;

      const targetContainer = findTargetContainer(triggerTable);
      if (targetContainer) {
        targetContainer.appendChild(errorMessage);
      }

      // Remove processed class to allow retry
      messageContainer.classList.remove(CONFIG.PROCESSED_CLASS);
    }
  }
  /**
   * Scan and process all tables in AIONUI chat
   */
  function scanAndProcess() {
    const allTables = document.querySelectorAll(CONFIG.SELECTORS.CHAT_TABLES);
    let processedCount = 0;
    let totalTablesScanned = 0;

    console.log(`🔎 Scanner: Analyzing ${allTables.length} table(s) in AIONUI DOM...`);

    allTables.forEach((table, index) => {
      totalTablesScanned++;

      const messageContainer = table.closest(CONFIG.SELECTORS.MESSAGE_CONTAINER);
      if (messageContainer && messageContainer.classList.contains(CONFIG.PROCESSED_CLASS)) {
        console.log(`⏭️ Table ${index + 1}: Already processed, skipped`);
        return;
      }

      const headers = Array.from(table.querySelectorAll("th")).map((th) =>
        th.textContent.trim().toLowerCase()
      );

      console.log(`📋 Table ${index + 1} - Headers:`, headers);

      if (headers.includes("flowise")) {
        console.log(`✅ Table ${index + 1}: 'Flowise' column detected! Processing...`);
        processN8nTrigger(table);
        processedCount++;
      } else {
        console.log(`⏭️ Table ${index + 1}: No 'Flowise' column, skipped`);
      }
    });

    console.log(`📊 Scanner completed: ${processedCount} Flowise table(s) processed out of ${totalTablesScanned} table(s) analyzed`);
  }

  /**
   * Remove trigger table with animation
   * @param {HTMLElement} triggerTable - Table to remove
   * @param {string} targetKeyword - Target keyword
   */
  function removeTriggerTable(triggerTable, targetKeyword) {
    try {
      const tableWrapper = triggerTable.closest('div[style*="overflowX"]');
      if (tableWrapper) {
        console.log(`🗑️ Removing trigger table for "${targetKeyword}"`);
        tableWrapper.style.transition = 'opacity 0.3s ease-out';
        tableWrapper.style.opacity = '0';
        setTimeout(() => {
          if (tableWrapper.parentNode) {
            tableWrapper.parentNode.removeChild(tableWrapper);
          }
        }, 300);
      } else if (triggerTable.parentNode) {
        triggerTable.parentNode.removeChild(triggerTable);
      }
    } catch (error) {
      console.error(`⚠️ Error removing table:`, error);
    }
  }

  /**
   * Clean empty rows from table
   * @param {HTMLElement} table - Table to clean
   */
  function cleanEmptyRows(table) {
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      const isEmpty = Array.from(cells).every(cell => {
        const text = cell.textContent.trim();
        return text === '' || text === '---';
      });
      if (isEmpty && cells.length > 0) {
        row.remove();
      }
    });
  }

  /**
   * Check if text is URL
   * @param {string} text - Text to check
   * @returns {boolean} True if URL
   */
  function isUrl(text) {
    try {
      new URL(text);
      return true;
    } catch {
      return text.startsWith('http://') || text.startsWith('https://') || text.startsWith('www.');
    }
  }

  /**
   * Enhance table URLs with proper styling
   * @param {HTMLElement} table - Table to enhance
   */
  function enhanceTableUrls(table) {
    const cells = table.querySelectorAll('td');
    cells.forEach(cell => {
      const text = cell.textContent.trim();
      if (isUrl(text) && !cell.querySelector('a')) {
        cell.innerHTML = '';
        const link = document.createElement('a');
        link.href = text;
        link.textContent = text;
        link.style.cssText = `
          color: var(--color-primary-6);
          text-decoration: none;
          word-break: break-all;
        `;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.addEventListener('mouseover', () => {
          link.style.textDecoration = 'underline';
        });
        link.addEventListener('mouseout', () => {
          link.style.textDecoration = 'none';
        });
        cell.appendChild(link);
      }
    });
  }
  /**
   * Initialize AIONUI Table Enhancer
   */
  function initialize() {
    console.log("🔧 Initializing AIONUI Table Enhancer V1.0...");

    // Initial scan after DOM is ready
    setTimeout(scanAndProcess, 800);

    // Set up mutation observer to detect new tables
    const observer = new MutationObserver((mutations) => {
      let shouldScan = false;

      mutations.forEach((mutation) => {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check if the added node is a table or contains tables
              if (node.matches && node.matches(CONFIG.SELECTORS.CHAT_TABLES)) {
                shouldScan = true;
              } else if (node.querySelector) {
                const tables = node.querySelectorAll(CONFIG.SELECTORS.CHAT_TABLES);
                if (tables.length > 0) {
                  shouldScan = true;
                }
              }
            }
          });
        }
      });

      if (shouldScan) {
        console.log("🔄 New tables detected in AIONUI, analyzing...");
        setTimeout(scanAndProcess, 150);
      }
    });

    // Start observing
    observer.observe(document.body, { childList: true, subtree: true });

    console.log("✅ AIONUI Table Enhancer V1.0 initialized - Dynamic keyword detection active");
    console.log("🌐 Endpoint configured:", CONFIG.N8N_ENDPOINT_URL);
  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }

  // Public API for debugging and testing
  window.aionui_flowise = {
    scanAndProcess,
    CONFIG,
    extractDynamicKeyword,
    generateKeywordVariations,
    normalizeN8nResponse,
    extractTablesFromResponse,
    integrateTablesOnly,
    clearAllCache: () => {
      localStorage.removeItem(CONFIG.PERSISTENCE.STORAGE_KEY);
      console.log('🗑️ Complete cache cleared');
    },
    getCacheInfo: () => {
      const data = JSON.parse(localStorage.getItem(CONFIG.PERSISTENCE.STORAGE_KEY) || '{}');
      console.log('📊 Cache information:', {
        entries: Object.keys(data).length,
        size: JSON.stringify(data).length + ' characters',
        data: data
      });
      return data;
    },
    enableHTMLLog: () => {
      CONFIG.DEBUG_LOG_HTML = true;
      console.log('✅ HTML logging enabled - HTML will be displayed in console');
    },
    disableHTMLLog: () => {
      CONFIG.DEBUG_LOG_HTML = false;
      console.log('✅ HTML logging disabled');
    },
    testN8nConnection: async () => {
      try {
        console.log("🧪 Testing n8n connection...");
        const response = await fetch(CONFIG.N8N_ENDPOINT_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ question: '<table><tr><th>Test</th></tr><tr><td>Connection</td></tr></table>' })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("✅ Connection successful!");
        console.log("📦 Response:", data);
        return { success: true, data: data };
      } catch (error) {
        console.error("❌ Connection error:", error);
        return { success: false, error: error.message };
      }
    },
    version: "1.0.0 - AIONUI Table Enhancement (adapted from Claraverse V17.1)",
  };

  console.log("🎉 AIONUI Table Enhancer V1.0 loaded successfully!");
  console.log("💡 Available commands:");
  console.log("   - window.aionui_flowise.testN8nConnection()");
  console.log("   - window.aionui_flowise.getCacheInfo()");
  console.log("   - window.aionui_flowise.clearAllCache()");
  console.log("   - window.aionui_flowise.scanAndProcess()");
  console.log("   - window.aionui_flowise.enableHTMLLog()");
  console.log("   - window.aionui_flowise.disableHTMLLog()");
  console.log("💡 HTML sent to n8n is ALWAYS logged in console (CONFIG.DEBUG_LOG_HTML = true)");

})();