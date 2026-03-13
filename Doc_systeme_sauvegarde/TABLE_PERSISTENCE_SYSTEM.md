# Système de Persistance des Tables - Documentation Technique

## Introduction

Ce document décrit le système de persistance des modifications de tables dans AIONUI, en complément du système général de sauvegarde des conversations. Il couvre spécifiquement les aspects techniques liés aux tables markdown modifiables via le menu contextuel.

## Intégration avec le Système de Sauvegarde Global

### Architecture Générale

```
┌──────────────────────────────────────────────────────────────┐
│                  SYSTÈME DE SAUVEGARDE GLOBAL                │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  ConversationManageWithDB                              │ │
│  │  - Queue de modifications                              │ │
│  │  - Batch updates (timer 2s)                            │ │
│  │  - Migration file → database                           │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                  │
│                           ▼                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  DATABASE LAYER                                        │ │
│  │  - SQLite operations                                   │ │
│  │  - Transaction management                              │ │
│  │  - Data validation                                     │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│           SYSTÈME DE PERSISTANCE DES TABLES                  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  TableContextMenu + useTablePersistence                │ │
│  │  - Détection des modifications                         │ │
│  │  - Conversion HTML → Markdown                          │ │
│  │  - Appel IPC direct                                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                  │
│                           ▼                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  IPC: database.updateMessageContent                    │ │
│  │  - Bypass de la queue                                  │ │
│  │  - Mise à jour immédiate                               │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### Différences avec le Système Standard

| Aspect | Système Standard | Système Tables |
|--------|------------------|----------------|
| **Déclencheur** | Envoi de message, création conversation | Modification de cellule (blur event) |
| **Fréquence** | Batch (toutes les 2s) | Immédiat (à chaque modification) |
| **Route IPC** | `conversation.update` | `database.updateMessageContent` |
| **Données** | Conversation complète | Contenu de message uniquement |
| **Queue** | Oui (ConversationManageWithDB) | Non (direct) |
| **Validation** | Schéma conversation | Markdown valide |

## Flux de Données Détaillé

### 1. Modification Utilisateur

```typescript
// User edits cell in table
<td contenteditable="true">
  Original Value
</td>

// User types new value
<td contenteditable="true">
  New Value
</td>

// User clicks outside (blur event)
cell.addEventListener('blur', () => {
  syncTable(); // ← Déclencheur
});
```

### 2. Extraction des Identifiants

```typescript
// TableContextMenu.tsx
const syncTable = useCallback(() => {
  // Extract conversationId from URL
  const url = window.location.href;
  // Pattern: /conversation/[id]
  const match = url.match(/\/conversation\/([^/?#]+)/);
  const conversationId = match ? match[1] : null;

  if (!conversationId || !targetTable) {
    console.error('[TableContextMenu] Missing data');
    return;
  }

  // Call persistence hook
  void syncTableToDatabase(targetTable, conversationId);
}, [targetTable, syncTableToDatabase]);
```

### 3. Traversée Shadow DOM

```typescript
// useTablePersistence.ts
const syncTableToDatabase = useCallback(
  async (table: HTMLTableElement, conversationId: string) => {
    // Start from table element
    let currentElement: Element | null = table;
    let messageContainer: Element | null = null;

    // Traverse up the DOM tree
    while (currentElement) {
      // Check for data-message-id
      if (currentElement.hasAttribute('data-message-id')) {
        messageContainer = currentElement;
        break;
      }

      const parent = currentElement.parentElement;

      // Check for Shadow DOM boundary
      if (!parent && currentElement.parentNode) {
        const parentNode = currentElement.parentNode;
        
        if (parentNode.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
          // Cross Shadow DOM boundary
          const shadowRoot = parentNode as ShadowRoot;
          if (shadowRoot.host) {
            currentElement = shadowRoot.host;
            continue;
          }
        }
      }

      currentElement = parent;
    }

    if (!messageContainer) {
      console.error('[TablePersistence] Message container not found');
      return;
    }

    const messageId = messageContainer.getAttribute('data-message-id');
    // ... continue with persistence
  },
  []
);
```

### 4. Conversion HTML → Markdown

```typescript
function tableToMarkdown(table: HTMLTableElement): string {
  const rows: string[] = [];

  // Extract header
  const thead = table.querySelector('thead');
  if (thead) {
    const headerRow = thead.querySelector('tr');
    if (headerRow) {
      const headers = Array.from(headerRow.querySelectorAll('th, td'))
        .map((cell) => cell.textContent?.trim() || '')
        .join(' | ');
      rows.push(`| ${headers} |`);

      // Add separator (CRITICAL for markdown tables)
      const separator = Array.from(headerRow.querySelectorAll('th, td'))
        .map(() => '---')
        .join(' | ');
      rows.push(`| ${separator} |`);
    }
  }

  // Extract body rows
  const tbody = table.querySelector('tbody');
  const bodyRows = tbody ? tbody.querySelectorAll('tr') : table.querySelectorAll('tr');
  
  bodyRows.forEach((row) => {
    const cells = Array.from(row.querySelectorAll('td, th'))
      .map((cell) => cell.textContent?.trim() || '')
      .join(' | ');
    rows.push(`| ${cells} |`);
  });

  return '\n' + rows.join('\n') + '\n';
}
```

### 5. Appel IPC

```typescript
// Renderer Process
await ipcBridge.database.updateMessageContent.invoke({
  messageId: 'msg-abc123',
  conversationId: 'conv-xyz789',
  content: '| Col1 | Col2 |\n|------|------|\n| A | B |'
});
```

### 6. Traitement Main Process

```typescript
// databaseBridge.ts
ipcBridge.database.updateMessageContent.provider(
  ({ messageId, conversationId, content }) => {
    try {
      const db = getDatabase();
      
      // Get existing message
      const messages = db.getConversationMessages(conversationId, 0, 10000);
      const existingMessage = messages.data?.find((msg) => msg.id === messageId);
      
      if (!existingMessage) {
        return Promise.resolve({ 
          success: false, 
          error: 'Message not found' 
        });
      }

      // Update message content
      const updatedMessage = {
        ...existingMessage,
        content: {
          ...existingMessage.content,
          content, // New markdown content
        },
      };

      // Write to database
      const result = db.updateMessage(messageId, updatedMessage);
      
      return Promise.resolve({ 
        success: result.success, 
        error: result.error 
      });
    } catch (error) {
      return Promise.resolve({ 
        success: false, 
        error: String(error) 
      });
    }
  }
);
```

### 7. Mise à Jour SQLite

```sql
UPDATE messages 
SET 
  content = '{"content":"| Col1 | Col2 |\\n|------|------|\\n| A | B |","type":"text"}',
  updated_at = 1710345678000
WHERE 
  id = 'msg-abc123' 
  AND conversation_id = 'conv-xyz789';
```

## Gestion des Erreurs

### Stratégie de Retry

Contrairement au système standard qui utilise une queue avec retry automatique, le système de persistance des tables ne fait PAS de retry automatique. Raisons :

1. **Feedback immédiat** : L'utilisateur doit savoir immédiatement si la modification a échoué
2. **Éviter les conflits** : Plusieurs modifications rapides pourraient créer des conflits
3. **Simplicité** : Pas de gestion d'état complexe

### Gestion des Échecs

```typescript
try {
  await ipcBridge.database.updateMessageContent.invoke({
    messageId,
    conversationId,
    content: markdownContent,
  });
  
  console.log('[TablePersistence] ✅ Success');
  // Optionnel : afficher une notification
  Message.success('Table saved');
  
} catch (error) {
  console.error('[TablePersistence] ❌ Failed:', error);
  
  // Afficher une erreur à l'utilisateur
  Message.error('Failed to save table. Please try again.');
  
  // Optionnel : stocker en local storage pour retry manuel
  localStorage.setItem('pending-table-update', JSON.stringify({
    messageId,
    conversationId,
    content: markdownContent,
    timestamp: Date.now()
  }));
}
```

### Récupération après Échec

```typescript
// Au chargement de l'application
useEffect(() => {
  const pendingUpdate = localStorage.getItem('pending-table-update');
  
  if (pendingUpdate) {
    try {
      const data = JSON.parse(pendingUpdate);
      
      // Vérifier que ce n'est pas trop vieux (ex: 1 heure)
      if (Date.now() - data.timestamp < 3600000) {
        // Proposer à l'utilisateur de réessayer
        Modal.confirm({
          title: 'Pending table modification',
          content: 'A table modification was not saved. Retry now?',
          onOk: async () => {
            await ipcBridge.database.updateMessageContent.invoke(data);
            localStorage.removeItem('pending-table-update');
          },
          onCancel: () => {
            localStorage.removeItem('pending-table-update');
          }
        });
      } else {
        // Trop vieux, supprimer
        localStorage.removeItem('pending-table-update');
      }
    } catch (error) {
      console.error('[TablePersistence] Recovery failed:', error);
      localStorage.removeItem('pending-table-update');
    }
  }
}, []);
```

## Optimisations

### 1. Debouncing des Modifications

Pour éviter trop d'appels IPC lors de modifications rapides :

```typescript
import { debounce } from 'lodash';

const debouncedSync = useMemo(
  () => debounce((table: HTMLTableElement, conversationId: string) => {
    syncTableToDatabase(table, conversationId);
  }, 500), // 500ms de délai
  [syncTableToDatabase]
);

// Utilisation
cell.addEventListener('blur', () => {
  debouncedSync(targetTable, conversationId);
});
```

### 2. Cache des Conversions

Pour éviter de reconvertir le même tableau plusieurs fois :

```typescript
const conversionCache = new Map<string, string>();

function tableToMarkdownCached(table: HTMLTableElement): string {
  const tableHTML = table.outerHTML;
  
  if (conversionCache.has(tableHTML)) {
    console.log('[TablePersistence] Using cached conversion');
    return conversionCache.get(tableHTML)!;
  }
  
  const markdown = tableToMarkdown(table);
  conversionCache.set(tableHTML, markdown);
  
  // Limiter la taille du cache
  if (conversionCache.size > 100) {
    const firstKey = conversionCache.keys().next().value;
    conversionCache.delete(firstKey);
  }
  
  return markdown;
}
```

### 3. Validation Avant Envoi

Pour éviter des appels IPC inutiles :

```typescript
function hasTableChanged(table: HTMLTableElement, originalMarkdown: string): boolean {
  const currentMarkdown = tableToMarkdown(table);
  return currentMarkdown !== originalMarkdown;
}

// Utilisation
if (hasTableChanged(targetTable, originalContent)) {
  await syncTableToDatabase(targetTable, conversationId);
} else {
  console.log('[TablePersistence] No changes detected, skipping sync');
}
```

## Monitoring et Métriques

### Logs Structurés

```typescript
interface TablePersistenceLog {
  timestamp: number;
  action: 'sync_start' | 'sync_success' | 'sync_error';
  messageId?: string;
  conversationId?: string;
  duration?: number;
  error?: string;
}

const logs: TablePersistenceLog[] = [];

function logTablePersistence(log: TablePersistenceLog) {
  logs.push(log);
  console.log('[TablePersistence]', JSON.stringify(log));
  
  // Envoyer à un service de monitoring (optionnel)
  if (window.analytics) {
    window.analytics.track('table_persistence', log);
  }
}

// Utilisation
const startTime = Date.now();
logTablePersistence({ timestamp: startTime, action: 'sync_start' });

try {
  await syncTableToDatabase(table, conversationId);
  logTablePersistence({
    timestamp: Date.now(),
    action: 'sync_success',
    messageId,
    conversationId,
    duration: Date.now() - startTime
  });
} catch (error) {
  logTablePersistence({
    timestamp: Date.now(),
    action: 'sync_error',
    messageId,
    conversationId,
    duration: Date.now() - startTime,
    error: String(error)
  });
}
```

### Métriques Clés

- **Taux de succès** : Nombre de syncs réussis / Total de syncs
- **Temps de réponse** : Durée moyenne d'un sync
- **Erreurs fréquentes** : Types d'erreurs les plus courants
- **Utilisation** : Nombre de modifications par utilisateur/session

## Compatibilité avec le Système N8N

Le système de persistance des tables est compatible avec le système de sauvegarde N8N décrit dans `N8N_PERSISTENCE_ISSUE.md`. Les deux systèmes coexistent sans conflit car :

1. **Routes IPC différentes** :
   - N8N : `conversation.update`
   - Tables : `database.updateMessageContent`

2. **Données différentes** :
   - N8N : Métadonnées de conversation (extra.n8nData)
   - Tables : Contenu de message (content.content)

3. **Timing différent** :
   - N8N : Après réponse du workflow
   - Tables : Après modification utilisateur

### Exemple de Coexistence

```typescript
// Conversation avec N8N et table modifiable
{
  id: 'conv-123',
  title: 'N8N Workflow Results',
  extra: {
    n8nData: {
      workflowId: 'wf-456',
      executionId: 'exec-789'
    }
  },
  messages: [
    {
      id: 'msg-1',
      type: 'text',
      content: {
        content: 'Workflow results:\n\n| Name | Status |\n|------|--------|\n| Task1 | Done |'
      }
    }
  ]
}

// User modifies table → Only message content is updated
// N8N metadata (extra.n8nData) remains unchanged
```

## Tests et Validation

### Tests Unitaires

```typescript
// tests/unit/table-persistence.test.ts
describe('Table Persistence', () => {
  describe('tableToMarkdown', () => {
    it('should convert simple table', () => {
      const table = document.createElement('table');
      // ... setup table
      const markdown = tableToMarkdown(table);
      expect(markdown).toMatch(/\| .* \|/);
    });

    it('should handle empty cells', () => {
      // ...
    });

    it('should escape special characters', () => {
      // ...
    });
  });

  describe('Shadow DOM traversal', () => {
    it('should find data-message-id across shadow boundary', () => {
      // ...
    });

    it('should return null if not found', () => {
      // ...
    });
  });
});
```

### Tests d'Intégration

```typescript
// tests/integration/table-persistence.integration.test.ts
describe('Table Persistence Integration', () => {
  it('should persist table modification end-to-end', async () => {
    // 1. Create conversation with table
    const conversation = await createTestConversation();
    
    // 2. Modify table
    const table = findTableInMessage(conversation.messages[0].id);
    modifyTableCell(table, 0, 0, 'New Value');
    
    // 3. Trigger sync
    await syncTableToDatabase(table, conversation.id);
    
    // 4. Verify in database
    const updatedMessage = await db.getMessage(conversation.messages[0].id);
    expect(updatedMessage.content.content).toContain('New Value');
  });
});
```

### Tests E2E

```typescript
// tests/e2e/table-persistence.e2e.ts
describe('Table Persistence E2E', () => {
  it('should persist modifications across page refresh', async () => {
    // 1. Open conversation
    await page.goto('/conversation/test-123');
    
    // 2. Right-click table
    await page.click('table', { button: 'right' });
    
    // 3. Enable editing
    await page.click('text=Enable Editing');
    
    // 4. Modify cell
    await page.click('table td:first-child');
    await page.keyboard.type('Modified Value');
    await page.click('body'); // Blur
    
    // 5. Wait for sync
    await page.waitForTimeout(1000);
    
    // 6. Refresh page
    await page.reload();
    
    // 7. Verify modification persisted
    const cellText = await page.textContent('table td:first-child');
    expect(cellText).toBe('Modified Value');
  });
});
```

## Conclusion

Le système de persistance des tables s'intègre harmonieusement avec le système de sauvegarde global d'AIONUI tout en ayant ses propres spécificités :

- **Immédiat** plutôt que batché
- **Direct** plutôt que via queue
- **Ciblé** (contenu de message) plutôt que global (conversation)

Cette approche garantit une expérience utilisateur fluide avec un feedback immédiat tout en maintenant la cohérence des données dans la base SQLite.
