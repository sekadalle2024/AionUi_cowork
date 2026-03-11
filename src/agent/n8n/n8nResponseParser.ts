/**
 * n8n Response Parser
 * Converts n8n responses to markdown format
 * Extracted logic from claraApiService.ts
 */

/**
 * Detect table type based on content
 */
function detectTableType(tableKey: string, tableData: any): 'header' | 'data_array' | 'download' | 'unknown' {
  const lowerKey = tableKey.toLowerCase();

  // Type 1: Header (small object with 2-5 simple properties)
  if (typeof tableData === 'object' && !Array.isArray(tableData)) {
    const keys = Object.keys(tableData);
    const hasSimpleValues = keys.every((k) => typeof tableData[k] !== 'object');

    const headerKeywords = ['etape', 'reference', 'ref', 'titre', 'title', 'date', 'version'];
    const hasHeaderKeywords = keys.some((k) => headerKeywords.some((kw) => k.toLowerCase().includes(kw)));

    if (keys.length <= 5 && hasSimpleValues && hasHeaderKeywords) {
      return 'header';
    }

    // Type 3: Download (contains URLs or "download" keyword)
    const hasDownloadKeywords = lowerKey.includes('telecharger') || lowerKey.includes('download') || keys.some((k) => k.toLowerCase().includes('telecharger'));
    const hasUrls = keys.some((k) => typeof tableData[k] === 'string' && (tableData[k].startsWith('http://') || tableData[k].startsWith('https://')));

    if (hasDownloadKeywords || hasUrls) {
      return 'download';
    }
  }

  // Type 2: Data array
  if (Array.isArray(tableData) && tableData.length > 0) {
    return 'data_array';
  }

  return 'unknown';
}

/**
 * Generate appropriate table title
 */
function generateTableTitle(tableKey: string, tableData: any[], includeTitle: boolean = false): string {
  if (!includeTitle) {
    return '';
  }

  const lowerKey = tableKey.toLowerCase();

  if (tableData.length > 0) {
    const firstItem = tableData[0];
    const columns = Object.keys(firstItem);

    // Audit controls detection
    const auditKeywords = ['controle', 'audit', 'risque', 'point', 'objectif'];
    const hasAuditColumns = columns.some((col) => auditKeywords.some((kw) => col.toLowerCase().includes(kw)));

    if (hasAuditColumns) {
      return '📑 Programme de Travail - Contrôles Audit';
    }

    // Process/Operations detection
    const processKeywords = ['operation', 'acteur', 'principale', 'processus', 'tache'];
    const hasProcessColumns = columns.some((col) => processKeywords.some((kw) => col.toLowerCase().includes(kw)));

    if (hasProcessColumns) {
      return '📊 Principales Opérations';
    }

    // Recommendations detection
    if (lowerKey.includes('reco') || lowerKey.includes('recommandation')) {
      return '💡 Recommandations';
    }

    // Template detection
    if (lowerKey.includes('template') || lowerKey.includes('modele')) {
      return '📋 Modèle';
    }
  }

  // Fallback: clean up key name
  return (
    '📄 ' +
    tableKey
      .replace(/_/g, ' ')
      .replace(/table\s*/gi, '')
      .trim()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  );
}

/**
 * Convert header table to markdown
 */
function convertHeaderTableToMarkdown(data: any): string {
  let md = '| Rubrique | Description |\n';
  md += '|----------|-------------|\n';

  Object.entries(data).forEach(([key, value]) => {
    const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
    md += `| **${formattedKey}** | ${value} |\n`;
  });

  return md + '\n\n';
}

/**
 * Convert array table to markdown
 */
function convertArrayTableToMarkdown(tableName: string, data: any[]): string {
  if (!data || data.length === 0) {
    return `### ${tableName}\n\n*Aucune donnée disponible*\n\n`;
  }

  let md = `### ${tableName}\n\n`;

  const firstItem = data[0];
  const columns = Object.keys(firstItem);

  // Headers
  const headers = columns.map((col) => col.charAt(0).toUpperCase() + col.slice(1).replace(/_/g, ' '));

  md += '| ' + headers.join(' | ') + ' |\n';
  md += '|' + columns.map(() => '---').join('|') + '|\n';

  // Data rows
  data.forEach((row) => {
    const cells = columns.map((col) => {
      const value = row[col];
      if (value === null || value === undefined) {
        return '-';
      }
      let cleanValue = String(value).replace(/\|/g, '\\|').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

      if (cleanValue.length > 200) {
        cleanValue = cleanValue.substring(0, 197) + '...';
      }

      return cleanValue || '-';
    });

    md += '| ' + cells.join(' | ') + ' |\n';
  });

  return md + '\n';
}

/**
 * Convert download table to markdown
 */
function convertDownloadTableToMarkdown(data: any): string {
  let md = '## 📥 Ressources et Téléchargements\n\n';

  if (typeof data === 'object') {
    Object.entries(data).forEach(([key, value]) => {
      const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');

      if (typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://'))) {
        md += `🔗 **[${formattedKey}](${value})**\n\n`;
      } else {
        md += `**${formattedKey}**: ${value}\n\n`;
      }
    });
  } else {
    md += `${data}\n\n`;
  }

  return md;
}

/**
 * Generic structure to markdown conversion
 */
function convertGenericStructureToMarkdown(data: any, depth: number = 0): string {
  let md = '';
  const indent = '  '.repeat(depth);

  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      md += `${indent}- **Item ${index + 1}**:\n`;
      md += convertGenericStructureToMarkdown(item, depth + 1);
    });
  } else if (typeof data === 'object' && data !== null) {
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'object') {
        md += `${indent}**${key}**:\n`;
        md += convertGenericStructureToMarkdown(value, depth + 1);
      } else {
        md += `${indent}**${key}**: ${value}\n`;
      }
    });
  } else {
    md += `${indent}${data}\n`;
  }

  return md;
}

/**
 * Convert structured data to markdown
 * Main conversion function extracted from claraApiService.ts
 */
export function convertStructuredDataToMarkdown(data: any): string {
  let markdown = '';

  try {
    // Find main key (Etape mission - Programme or similar)
    const mainKey = Object.keys(data).find((key) => key.toLowerCase().includes('etape') || key.toLowerCase().includes('mission') || key.toLowerCase().includes('programme')) || Object.keys(data)[0];

    const mainData = data[mainKey];
    if (!Array.isArray(mainData)) {
      return convertGenericStructureToMarkdown(data);
    }

    // Process each table
    mainData.forEach((tableObj: any) => {
      const tableKey = Object.keys(tableObj)[0];
      const tableData = tableObj[tableKey];
      const tableType = detectTableType(tableKey, tableData);

      switch (tableType) {
        case 'header':
          markdown += convertHeaderTableToMarkdown(tableData);
          break;

        case 'data_array':
          const title = generateTableTitle(tableKey, tableData);
          markdown += convertArrayTableToMarkdown(title, tableData);
          break;

        case 'download':
          markdown += convertDownloadTableToMarkdown(tableData);
          break;

        default:
          markdown += convertGenericStructureToMarkdown({ [tableKey]: tableData });
      }
    });
  } catch (error) {
    console.error('❌ Error converting to markdown:', error);
    markdown = `**Erreur de conversion**\n\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``;
  }

  return markdown;
}

/**
 * Parse n8n response to markdown
 * Main entry point for frontend
 */
export function parseN8nResponse(data: any): string {
  if (!data) {
    return '❌ Erreur: Aucune donnée reçue';
  }

  // Handle different response types
  switch (data.type) {
    case 'structured_data':
      return convertStructuredDataToMarkdown(data.data);

    case 'text':
      return data.content || '';

    case 'tables':
      return data.tables
        .map((table: any) => table?.markdown || '')
        .filter((content: string) => content.trim() !== '')
        .join('\n\n---\n\n');

    case 'unknown':
      return `**Format non reconnu**\n\n\`\`\`json\n${JSON.stringify(data.raw, null, 2)}\n\`\`\``;

    case 'error':
      return `❌ ${data.error}`;

    default:
      return `**Format inattendu**\n\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``;
  }
}
