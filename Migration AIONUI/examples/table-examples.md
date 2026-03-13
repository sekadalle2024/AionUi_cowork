# Table Examples for AIONUI Enhancement System

## Overview

This document provides examples of table formats that work with the AIONUI Table Enhancement System. The system detects tables with specific column headers and processes them through N8N workflows.

## Required Table Format

### Basic Structure
Tables must have the following columns to be processed:
- **Flowise**: Contains the keyword that triggers processing
- **Rubrique**: Category or section identifier
- **Description**: Detailed description of the item

### Example 1: Basic Flowise Table

| Rubrique | Description | Flowise |
|----------|-------------|---------|
| Configuration | Setup initial parameters | TestKeyword |
| Processing | Handle data transformation | TestKeyword |
| Output | Generate final results | TestKeyword |

### Example 2: Extended Table with Additional Columns

| Rubrique | Description | Status | Priority | Flowise |
|----------|-------------|--------|----------|---------|
| Database Setup | Configure database connection | Active | High | DatabaseConfig |
| API Integration | Setup REST API endpoints | Pending | Medium | DatabaseConfig |
| Testing | Run integration tests | Not Started | Low | DatabaseConfig |

### Example 3: Multi-Keyword Table

| Rubrique | Description | Category | Flowise |
|----------|-------------|----------|---------|
| User Authentication | Login and registration system | Security | AuthSystem |
| Password Reset | Password recovery functionality | Security | AuthSystem |
| Session Management | Handle user sessions | Security | AuthSystem |
| Data Validation | Input validation rules | Processing | DataProcessor |
| Error Handling | Exception management | Processing | DataProcessor |

## Table Processing Flow

### 1. Detection Phase
The system scans chat messages for tables containing:
- A "Flowise" column header (case-insensitive)
- "Rubrique" and "Description" columns
- Located within `.message-item` or `.markdown-shadow-body` containers

### 2. Keyword Extraction
From the first table detected:
- Extracts the keyword from the first data cell in the "Flowise" column
- Generates variations: lowercase, uppercase, capitalized, word splits
- Example: "TestKeyword" → ["TestKeyword", "testkeyword", "TESTKEYWORD", "Testkeyword"]

### 3. Collection Phase
Searches all chat messages for tables matching the keyword:
- Looks for the keyword in any cell of tables with required headers
- Collects all matching tables across the conversation
- Includes the original trigger table

### 4. Processing
- Consolidates all collected tables into HTML
- Adds user message context if available
- Sends to N8N endpoint for processing
- Receives enhanced results

### 5. Display
- Parses N8N response (HTML or Markdown)
- Creates styled tables using AIONUI CSS variables
- Integrates into chat with proper overflow handling
- Removes original trigger table

## Advanced Examples

### Example 4: Workflow Definition Table

| Rubrique | Description | Type | Dependencies | Flowise |
|----------|-------------|------|--------------|---------|
| Data Collection | Gather input data from sources | Input | None | WorkflowA |
| Data Validation | Validate input data format | Process | Data Collection | WorkflowA |
| Data Transformation | Transform data to target format | Process | Data Validation | WorkflowA |
| Data Storage | Store processed data | Output | Data Transformation | WorkflowA |

### Example 5: Configuration Parameters Table

| Rubrique | Description | Default Value | Required | Flowise |
|----------|-------------|---------------|----------|---------|
| API_URL | Base URL for API calls | https://api.example.com | Yes | ConfigSet1 |
| TIMEOUT | Request timeout in seconds | 30 | No | ConfigSet1 |
| RETRY_COUNT | Number of retry attempts | 3 | No | ConfigSet1 |
| DEBUG_MODE | Enable debug logging | false | No | ConfigSet1 |

### Example 6: Test Cases Table

| Rubrique | Description | Expected Result | Test Data | Flowise |
|----------|-------------|-----------------|-----------|---------|
| Valid Input | Test with valid data | Success | {"name": "John", "age": 25} | TestSuite1 |
| Invalid Input | Test with invalid data | Error | {"name": "", "age": -1} | TestSuite1 |
| Edge Case | Test boundary conditions | Success | {"name": "A", "age": 0} | TestSuite1 |
| Performance | Test with large dataset | < 1s response | 10000 records | TestSuite1 |

## User Message Context

The system also captures user messages that precede the trigger table. These messages should contain keywords like:
- `/` (commands)
- `[command]`, `[processus]` (directives)
- `modele`, `directive`, `etape` (French keywords)
- `[`, `]`, `=` (formatting indicators)

### Example User Message
```
/process-workflow
[command] Execute the following workflow steps:
=== Configuration Phase ===
Please process the following table with the TestKeyword configuration.
```

## N8N Response Formats

The system handles multiple N8N response formats:

### Format 1: Direct Output Array
```json
[{
  "output": "Enhanced table content in markdown",
  "tables": [],
  "status": "success",
  "timestamp": "2025-01-13T10:00:00Z"
}]
```

### Format 2: Body Format
```json
[{
  "body": [{
    "output": "Enhanced table content",
    "status": "success",
    "timestamp": "2025-01-13T10:00:00Z"
  }],
  "headers": {},
  "statusCode": 200
}]
```

### Format 3: Nested Response
```json
[{
  "response": {
    "body": [{
      "output": "Enhanced table content",
      "status": "success"
    }],
    "headers": {},
    "statusCode": 200
  }
}]
```

## Styling Examples

### AIONUI Table Styling
Tables are automatically styled with AIONUI CSS variables:

```css
table {
  border-collapse: collapse;
  border: 1px solid var(--bg-3);
  min-width: 100%;
  margin-bottom: 1.5rem;
}

th {
  padding: 8px;
  border: 1px solid var(--bg-3);
  background-color: var(--color-fill-2);
  font-weight: 600;
  text-align: left;
}

td {
  padding: 8px;
  border: 1px solid var(--bg-3);
  min-width: 120px;
  overflow-wrap: break-word;
  white-space: pre-wrap;
}
```

### URL Enhancement
URLs in table cells are automatically converted to clickable links:

| Rubrique | Description | Link |
|----------|-------------|------|
| Documentation | API documentation | https://docs.example.com |
| Repository | Source code | https://github.com/example/repo |
| Demo | Live demo | https://demo.example.com |

## Testing Your Tables

### Manual Testing Steps
1. Create a table with the required columns (Rubrique, Description, Flowise)
2. Add a unique keyword in the Flowise column
3. Send the message in AIONUI chat
4. Check browser console for processing logs
5. Verify enhanced tables appear in chat

### Debug Commands
```javascript
// Test N8N connection
await window.AionuiTableEnhancer.testN8nConnection();

// Manually scan for tables
window.AionuiTableEnhancer.scanAndProcess();

// Check cache
window.AionuiTableEnhancer.getCacheInfo();

// Enable detailed logging
window.AionuiTableEnhancer.enableHTMLLog();
```

### Common Issues
1. **Table not detected**: Ensure "Flowise" column exists (case-insensitive)
2. **No processing**: Check that "Rubrique" and "Description" columns exist
3. **Styling issues**: Verify CSS variables are available in AIONUI theme
4. **N8N errors**: Test endpoint connectivity and workflow status

## Best Practices

### Table Design
- Keep table headers consistent across related tables
- Use descriptive keywords in Flowise column
- Ensure table fits within chat message width
- Use clear, concise descriptions

### Keyword Strategy
- Use unique keywords for different workflows
- Consider keyword variations for flexibility
- Group related tables with same keyword
- Avoid special characters in keywords

### Performance
- Limit table size for better processing
- Use caching for repeated operations
- Monitor N8N endpoint response times
- Clear cache periodically if needed

## Troubleshooting

### Debug Information
Enable debug logging to see detailed processing information:
```javascript
window.AionuiTableEnhancer.enableHTMLLog();
```

### Console Output Example
```
🚀 Initialisation AIONUI Table Enhancer V1.0
🔎 Scanner: Analyzing 3 table(s) in AIONUI DOM...
✅ Table 1: 'Flowise' column detected! Processing...
🎯 Dynamic keyword detected: "TestKeyword"
📊 Collection completed: 2 table(s) total
📡 Sending data to n8n...
✅ Data received from n8n endpoint! Status: 200 OK
🔧 Integrating 1 table(s) into AIONUI chat
🎉 === PROCESSING COMPLETED SUCCESSFULLY FOR "TestKeyword" ===
```

This comprehensive example guide should help users understand how to create tables that work effectively with the AIONUI Table Enhancement System.