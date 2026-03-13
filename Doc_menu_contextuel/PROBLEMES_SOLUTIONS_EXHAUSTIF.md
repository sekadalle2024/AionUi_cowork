# Problèmes et Solutions - Guide Exhaustif

## Table des Matières

1. [Problèmes de Shadow DOM](#problèmes-de-shadow-dom)
2. [Problèmes d'Attributs DOM](#problèmes-dattributs-dom)
3. [Problèmes IPC](#problèmes-ipc)
4. [Problèmes de Base de Données](#problèmes-de-base-de-données)
5. [Problèmes d'Événements](#problèmes-dévénements)
6. [Problèmes de Conversion Markdown](#problèmes-de-conversion-markdown)
7. [Diagnostic et Débogage](#diagnostic-et-débogage)

---

## Problèmes de Shadow DOM

### Problème 1.1 : `closest()` ne trouve pas data-message-id

**Symptôme** :
```
[TablePersistence] ❌ Could not find message container
```

**Cause** :
Le Shadow DOM crée une barrière que `Element.closest()` ne peut pas traverser. La méthode `closest()` s'arrête à la frontière du Shadow Root.

**Structure DOM** :
```html
<div data-message-id="123">  ← Target
  <MarkdownView>
    #shadow-root              ← Barrière
      <div class="markdown-shadow-body">
        <table>               ← Point de départ
```

**Solution** :
Implémenter une traversée manuelle du Shadow DOM :

```typescript
let currentElement: Element | null = table;

while (currentElement) {
  // Check current element
  if (currentElement.hasAttribute('data-message-id')) {
    return currentElement;
  }

  const parent = currentElement.parentElement;

  // Check if we're at a shadow boundary
  if (!parent && currentElement.parentNode) {
    const parentNode = currentElement.parentNode;
    
    if (parentNode.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
      // Cross the Shadow DOM boundary
      const shadowRoot = parentNode as ShadowRoot;
      if (shadowRoot.host) {
        currentElement = shadowRoot.host;
        continue;
      }
    }
  }

  currentElement = parent;
}
```

**Fichier** : `src/renderer/hooks/useTablePersistence.ts`

**Logs de diagnostic** :
```
[TablePersistence] 🔍 Starting Shadow DOM traversal
[TablePersistence] 🔍 Checking element: TABLE
[TablePersistence] 🔍 Checking element: DIV markdown-shadow-body
[TablePersistence] 🔍 Crossing Shadow DOM boundary from DIV to host DIV
[TablePersistence] 🔍 Checking element: DIV message-item
[TablePersistence] ✅ Found data-message-id on: DIV
```

### Problème 1.2 : querySelector ne trouve pas les tables

**Symptôme** :
Le menu contextuel ne s'affiche pas sur les tables.

**Cause** :
`document.querySelector('table')` ne cherche pas dans les Shadow DOM.

**Solution** :
Traverser manuellement les Shadow Roots :

```typescript
function findTablesInShadowDOM(): HTMLTableElement[] {
  const tables: HTMLTableElement[] = [];
  
  function traverse(root: Document | ShadowRoot) {
    // Find tables in current root
    root.querySelectorAll('table').forEach(table => {
      tables.push(table as HTMLTableElement);
    });
    
    // Traverse into shadow roots
    root.querySelectorAll('*').forEach(element => {
      if (element.shadowRoot) {
        traverse(element.shadowRoot);
      }
    });
  }
  
  traverse(document);
  return tables;
}
```

**Fichier** : `src/renderer/components/TableContextMenu.tsx`

### Problème 1.3 : Styles CSS ne s'appliquent pas aux tables

**Symptôme** :
Les styles du menu contextuel ou des cellules éditables ne fonctionnent pas.

**Cause** :
Le Shadow DOM isole les styles. Les styles globaux ne pénètrent pas dans le Shadow DOM.

**Solution** :
Injecter les styles directement dans le Shadow Root ou utiliser des styles inline :

```typescript
// Option 1: Styles inline
cell.style.border = '2px solid blue';
cell.style.backgroundColor = '#f0f0f0';

// Option 2: Injecter CSS dans Shadow Root
const shadowRoot = element.shadowRoot;
if (shadowRoot) {
  const style = document.createElement('style');
  style.textContent = `
    table { border-collapse: collapse; }
    td { border: 1px solid #ccc; padding: 8px; }
  `;
  shadowRoot.appendChild(style);
}
```

---

## Problèmes d'Attributs DOM

### Problème 2.1 : data-message-id au mauvais niveau

**Symptôme** :
```
[TablePersistence] ❌ Could not find message container
```

**Cause** :
L'attribut `data-message-id` est placé à l'intérieur du Shadow DOM ou trop profond dans la hiérarchie.

**Mauvais placement** :
```tsx
// ❌ Dans MessageText (trop profond)
<MessageText>
  <div data-message-id={message.id}>
    <MarkdownView>
      #shadow-root
        <table>
```

**Bon placement** :
```tsx
// ✓ Dans MessageItem (wrapper externe)
<div class="message-item" data-message-id={message.id}>
  <MessageText>
    <MarkdownView>
      #shadow-root
        <table>
```

**Solution** :
Placer `data-message-id` sur le wrapper `.message-item` dans `MessageList.tsx` :

```tsx
const MessageItem: React.FC<{ message: TMessage }> = React.memo(
  HOC((props) => {
    const { message } = props as { message: TMessage };
    return (
      <div
        className="message-item"
        data-message-id={message.id}
        data-msg-id={message.msg_id}
      >
        {props.children}
      </div>
    );
  })
);
```

**Fichier** : `src/renderer/messages/MessageList.tsx` (lignes 52-56)

### Problème 2.2 : Attribut non rendu après modification

**Symptôme** :
Après avoir modifié le code pour ajouter `data-message-id`, l'attribut n'apparaît toujours pas dans le DOM.

**Cause** :
- L'application n'a pas été recompilée
- Le cache du navigateur
- Hot reload n'a pas fonctionné

**Solution** :
1. Arrêter l'application (Ctrl+C)
2. Supprimer le dossier `out/` :
   ```bash
   rm -rf out/
   ```
3. Relancer l'application :
   ```bash
   npm run start
   ```
4. Vérifier dans DevTools → Elements que l'attribut est présent

**Vérification** :
```javascript
// Dans la console DevTools
document.querySelector('.message-item').getAttribute('data-message-id')
// Devrait retourner l'ID du message
```

### Problème 2.3 : Attribut présent mais valeur undefined

**Symptôme** :
```typescript
messageContainer.getAttribute('data-message-id') // returns null
```

**Cause** :
- L'objet `message` n'a pas de propriété `id`
- La propriété est `undefined` au moment du rendu

**Solution** :
Ajouter des vérifications :

```tsx
<div
  className="message-item"
  data-message-id={message?.id || 'unknown'}
  data-msg-id={message?.msg_id || ''}
>
```

**Diagnostic** :
```typescript
console.log('Message object:', message);
console.log('Message ID:', message.id);
console.log('Message msg_id:', message.msg_id);
```

---

## Problèmes IPC

### Problème 3.1 : IPC route non définie

**Symptôme** :
```
TypeError: Cannot read properties of undefined (reading 'provider')
at initDatabaseBridge
```

**Cause** :
La route IPC `database.updateMessageContent` n'est pas définie dans `ipcBridge.ts`.

**Solution** :
Ajouter la définition dans `src/common/ipcBridge.ts` :

```typescript
export const database = {
  // ... autres routes
  updateMessageContent: bridge.buildProvider<
    { success: boolean; error?: string },
    { messageId: string; conversationId: string; content: string }
  >('database.update-message-content'),
};
```

**Vérification** :
```typescript
// Dans le renderer
console.log('IPC route exists:', !!ipcBridge.database.updateMessageContent);
```

### Problème 3.2 : IPC call timeout

**Symptôme** :
```
[TablePersistence] ❌ Failed to sync: Timeout waiting for response
```

**Cause** :
- Le Main Process ne répond pas
- Le provider n'est pas initialisé
- Erreur dans le handler côté Main

**Solution** :
1. Vérifier que `initDatabaseBridge()` est appelé dans `src/process/bridge/index.ts` :

```typescript
export function initAllBridges(): void {
  // ...
  initDatabaseBridge(); // ← Doit être présent
  // ...
}
```

2. Ajouter des logs dans le provider :

```typescript
ipcBridge.database.updateMessageContent.provider(({ messageId, conversationId, content }) => {
  console.log('[DatabaseBridge] Received IPC call:', { messageId, conversationId });
  
  try {
    // ... traitement
    console.log('[DatabaseBridge] Success');
    return Promise.resolve({ success: true });
  } catch (error) {
    console.error('[DatabaseBridge] Error:', error);
    return Promise.resolve({ success: false, error: String(error) });
  }
});
```

3. Vérifier les logs dans le terminal (Main Process) et dans DevTools (Renderer Process)

### Problème 3.3 : Données corrompues dans IPC

**Symptôme** :
```
[DatabaseBridge] Error: Invalid content format
```

**Cause** :
Le contenu markdown contient des caractères spéciaux non échappés ou est trop volumineux.

**Solution** :
Valider et nettoyer le contenu avant l'envoi :

```typescript
function sanitizeMarkdown(content: string): string {
  // Remove null bytes
  content = content.replace(/\0/g, '');
  
  // Trim excessive whitespace
  content = content.trim();
  
  // Ensure valid UTF-8
  content = content.normalize('NFC');
  
  return content;
}

const cleanContent = sanitizeMarkdown(markdownContent);
await ipcBridge.database.updateMessageContent.invoke({
  messageId,
  conversationId,
  content: cleanContent,
});
```

---

## Problèmes de Base de Données

### Problème 4.1 : Message non trouvé

**Symptôme** :
```
[DatabaseBridge] Error: Message not found
```

**Cause** :
- Le `messageId` est incorrect
- Le message a été supprimé
- Mauvaise conversation

**Solution** :
1. Vérifier que le `messageId` extrait est correct :

```typescript
console.log('[TablePersistence] Message ID:', messageId);
console.log('[TablePersistence] Conversation ID:', conversationId);
```

2. Vérifier dans la base de données :

```sql
SELECT id, conversation_id, content 
FROM messages 
WHERE id = 'msg-123';
```

3. Ajouter une vérification dans le provider :

```typescript
const messages = db.getConversationMessages(conversationId, 0, 10000);
console.log('[DatabaseBridge] Total messages:', messages.data?.length);
console.log('[DatabaseBridge] Looking for:', messageId);

const existingMessage = messages.data?.find((msg) => msg.id === messageId);
if (!existingMessage) {
  console.error('[DatabaseBridge] Message not found. Available IDs:', 
    messages.data?.map(m => m.id).join(', '));
  return Promise.resolve({ success: false, error: 'Message not found' });
}
```

### Problème 4.2 : Mise à jour échoue silencieusement

**Symptôme** :
Pas d'erreur dans les logs, mais les modifications ne sont pas persistées.

**Cause** :
- La transaction n'est pas committée
- Le cache n'est pas invalidé
- Conflit de version

**Solution** :
1. Vérifier le retour de `db.updateMessage()` :

```typescript
const result = db.updateMessage(messageId, updatedMessage);
console.log('[DatabaseBridge] Update result:', result);

if (!result.success) {
  console.error('[DatabaseBridge] Update failed:', result.error);
  return Promise.resolve({ success: false, error: result.error });
}
```

2. Forcer un commit si nécessaire :

```typescript
db.commit(); // Si la base utilise des transactions manuelles
```

3. Invalider le cache :

```typescript
// Si un système de cache est en place
cache.invalidate(`message:${messageId}`);
cache.invalidate(`conversation:${conversationId}`);
```

### Problème 4.3 : Corruption de données JSON

**Symptôme** :
```
[DatabaseBridge] Error: Unexpected token in JSON
```

**Cause** :
Le champ `content` dans SQLite contient du JSON mal formé.

**Solution** :
1. Valider le JSON avant l'insertion :

```typescript
const updatedMessage = {
  ...existingMessage,
  content: {
    ...existingMessage.content,
    content: markdownContent,
  },
};

// Validate JSON serialization
try {
  JSON.stringify(updatedMessage);
} catch (error) {
  console.error('[DatabaseBridge] Invalid JSON:', error);
  return Promise.resolve({ success: false, error: 'Invalid JSON' });
}
```

2. Réparer les données corrompues :

```sql
-- Trouver les messages avec JSON invalide
SELECT id, content 
FROM messages 
WHERE json_valid(content) = 0;

-- Réparer manuellement ou supprimer
DELETE FROM messages WHERE json_valid(content) = 0;
```

### Problème 4.4 : Lock de base de données

**Symptôme** :
```
[DatabaseBridge] Error: database is locked
```

**Cause** :
- Plusieurs processus accèdent à la base simultanément
- Transaction non terminée
- Fichier de lock non supprimé

**Solution** :
1. Utiliser WAL mode pour SQLite :

```typescript
db.exec('PRAGMA journal_mode=WAL;');
```

2. Ajouter un timeout :

```typescript
db.exec('PRAGMA busy_timeout=5000;'); // 5 secondes
```

3. Supprimer les fichiers de lock :

```bash
rm aionui.db-shm
rm aionui.db-wal
```

---

## Problèmes d'Événements

### Problème 5.1 : Menu contextuel Electron s'affiche

**Symptôme** :
Le menu contextuel natif d'Electron s'affiche au lieu du menu personnalisé.

**Cause** :
L'événement `contextmenu` n'est pas intercepté en phase de capture.

**Solution** :
Utiliser `addEventListener` avec `capture: true` :

```typescript
document.addEventListener('contextmenu', handleContextMenu, true); // ← capture phase
```

**Explication** :
- Phase de capture : événement descend de `document` vers la cible
- Phase de bubbling : événement remonte de la cible vers `document`

Electron intercepte en phase de bubbling, donc nous devons intercepter en phase de capture.

### Problème 5.2 : Blur event ne se déclenche pas

**Symptôme** :
Les modifications de cellule ne sont pas sauvegardées automatiquement.

**Cause** :
- L'élément n'est pas focusable
- `contentEditable` n'est pas activé
- Event listener mal attaché

**Solution** :
1. S'assurer que `contentEditable` est activé :

```typescript
cell.contentEditable = 'true';
cell.setAttribute('tabindex', '0'); // Rendre focusable
```

2. Attacher l'event listener correctement :

```typescript
cell.addEventListener('blur', () => {
  console.log('[TableContextMenu] Cell blur event');
  syncTable();
});
```

3. Alternative : utiliser `focusout` (bubbles) :

```typescript
cell.addEventListener('focusout', () => {
  syncTable();
});
```

### Problème 5.3 : Event listener attaché plusieurs fois

**Symptôme** :
`syncTable()` est appelé plusieurs fois pour une seule modification.

**Cause** :
Le composant React se re-rend et attache de nouveaux listeners sans supprimer les anciens.

**Solution** :
Utiliser `useEffect` avec cleanup :

```typescript
useEffect(() => {
  const handleBlur = () => {
    syncTable();
  };

  const cells = targetTable?.querySelectorAll('td[contenteditable="true"]');
  cells?.forEach(cell => {
    cell.addEventListener('blur', handleBlur);
  });

  // Cleanup
  return () => {
    cells?.forEach(cell => {
      cell.removeEventListener('blur', handleBlur);
    });
  };
}, [targetTable, syncTable]);
```

---

## Problèmes de Conversion Markdown

### Problème 6.1 : Tableau mal formaté

**Symptôme** :
Le markdown généré ne s'affiche pas correctement après actualisation.

**Cause** :
- Séparateur manquant
- Pipes mal échappés
- Cellules vides non gérées

**Solution** :
Améliorer la fonction `tableToMarkdown()` :

```typescript
function tableToMarkdown(table: HTMLTableElement): string {
  const rows: string[] = [];

  // Process header
  const thead = table.querySelector('thead');
  if (thead) {
    const headerRow = thead.querySelector('tr');
    if (headerRow) {
      const headers = Array.from(headerRow.querySelectorAll('th, td'))
        .map((cell) => {
          let text = cell.textContent?.trim() || '';
          // Escape pipes
          text = text.replace(/\|/g, '\\|');
          return text || ' '; // Empty cell = space
        })
        .join(' | ');
      rows.push(`| ${headers} |`);

      // Add separator (CRITICAL)
      const separator = Array.from(headerRow.querySelectorAll('th, td'))
        .map(() => '---')
        .join(' | ');
      rows.push(`| ${separator} |`);
    }
  }

  // Process body
  const tbody = table.querySelector('tbody');
  const bodyRows = tbody ? tbody.querySelectorAll('tr') : table.querySelectorAll('tr');
  
  bodyRows.forEach((row, index) => {
    // Skip header row if no thead
    if (!thead && index === 0) return;

    const cells = Array.from(row.querySelectorAll('td, th'))
      .map((cell) => {
        let text = cell.textContent?.trim() || '';
        text = text.replace(/\|/g, '\\|');
        return text || ' ';
      })
      .join(' | ');
    rows.push(`| ${cells} |`);
  });

  return '\n' + rows.join('\n') + '\n';
}
```

### Problème 6.2 : Caractères spéciaux corrompus

**Symptôme** :
Les accents ou caractères spéciaux deviennent des `�` après sauvegarde.

**Cause** :
Problème d'encodage UTF-8.

**Solution** :
1. S'assurer que la base de données utilise UTF-8 :

```sql
PRAGMA encoding = "UTF-8";
```

2. Normaliser les caractères :

```typescript
content = content.normalize('NFC'); // Canonical composition
```

3. Vérifier l'encodage du fichier source :

```bash
file -i src/renderer/hooks/useTablePersistence.ts
# Devrait afficher: charset=utf-8
```

### Problème 6.3 : Lignes vides ajoutées

**Symptôme** :
Le markdown contient des lignes vides non désirées.

**Cause** :
Mauvaise gestion des retours à la ligne.

**Solution** :
```typescript
function tableToMarkdown(table: HTMLTableElement): string {
  const rows: string[] = [];
  
  // ... génération des lignes
  
  // Join without extra newlines
  return rows.join('\n');
}
```

---

## Diagnostic et Débogage

### 7.1 : Activer les Logs Détaillés

**Dans useTablePersistence.ts** :

```typescript
const DEBUG = true; // ← Activer

if (DEBUG) {
  console.log('[TablePersistence] 🔍 Starting sync');
  console.log('[TablePersistence] 📊 Table:', table);
  console.log('[TablePersistence] 🆔 Conversation:', conversationId);
}
```

**Dans databaseBridge.ts** :

```typescript
console.log('[DatabaseBridge] 📥 Received:', { messageId, conversationId });
console.log('[DatabaseBridge] 📝 Content length:', content.length);
console.log('[DatabaseBridge] 📝 Content preview:', content.substring(0, 100));
```

### 7.2 : Inspecter le DOM

**Dans DevTools Console** :

```javascript
// Trouver les tables
document.querySelectorAll('table').length // Nombre de tables (hors Shadow DOM)

// Trouver dans Shadow DOM
function findTables() {
  const tables = [];
  document.querySelectorAll('*').forEach(el => {
    if (el.shadowRoot) {
      el.shadowRoot.querySelectorAll('table').forEach(t => tables.push(t));
    }
  });
  return tables;
}
findTables()

// Vérifier data-message-id
document.querySelectorAll('[data-message-id]').forEach(el => {
  console.log(el.tagName, el.getAttribute('data-message-id'));
});
```

### 7.3 : Vérifier la Base de Données

**Ouvrir SQLite** :

```bash
sqlite3 "C:\Users\[USER]\AppData\Roaming\E-audit\aionui\aionui.db"
```

**Requêtes utiles** :

```sql
-- Lister les conversations
SELECT id, title, created_at FROM conversations ORDER BY created_at DESC LIMIT 10;

-- Voir les messages d'une conversation
SELECT id, type, substr(content, 1, 100) as content_preview 
FROM messages 
WHERE conversation_id = 'conv-123' 
ORDER BY created_at;

-- Trouver les messages avec des tables
SELECT id, content 
FROM messages 
WHERE content LIKE '%|%|%' 
LIMIT 10;

-- Vérifier la dernière modification
SELECT id, updated_at, datetime(updated_at/1000, 'unixepoch') as updated_time
FROM messages 
ORDER BY updated_at DESC 
LIMIT 5;
```

### 7.4 : Tester la Traversée Shadow DOM

**Script de test** :

```javascript
// Dans DevTools Console
function testShadowTraversal(table) {
  let current = table;
  let depth = 0;
  
  console.log('=== Shadow DOM Traversal Test ===');
  
  while (current && depth < 20) {
    console.log(`${depth}: ${current.tagName}.${current.className}`);
    console.log(`   data-message-id: ${current.getAttribute('data-message-id')}`);
    
    if (current.getAttribute('data-message-id')) {
      console.log('✅ FOUND!');
      return current;
    }
    
    const parent = current.parentElement;
    
    if (!parent && current.parentNode) {
      const parentNode = current.parentNode;
      if (parentNode.nodeType === 11) { // DOCUMENT_FRAGMENT_NODE
        console.log(`   → Crossing Shadow DOM boundary`);
        current = parentNode.host;
        depth++;
        continue;
      }
    }
    
    current = parent;
    depth++;
  }
  
  console.log('❌ NOT FOUND');
  return null;
}

// Utilisation
const table = document.querySelector('table'); // Ou trouver dans Shadow DOM
testShadowTraversal(table);
```

### 7.5 : Monitorer les IPC Calls

**Dans le Main Process** :

```typescript
// Ajouter dans src/process/bridge/index.ts
import { ipcMain } from 'electron';

ipcMain.on('*', (event, ...args) => {
  console.log('[IPC] Channel:', event, 'Args:', args);
});
```

**Dans le Renderer Process** :

```typescript
// Wrapper pour logger tous les appels
const originalInvoke = ipcBridge.database.updateMessageContent.invoke;
ipcBridge.database.updateMessageContent.invoke = async (...args) => {
  console.log('[IPC] Calling updateMessageContent:', args);
  const result = await originalInvoke(...args);
  console.log('[IPC] Result:', result);
  return result;
};
```

### 7.6 : Checklist de Diagnostic

Quand une modification ne persiste pas, vérifier dans l'ordre :

- [ ] 1. Le menu contextuel s'affiche-t-il ? (Problème d'événement)
- [ ] 2. `syncTable()` est-il appelé ? (Vérifier logs)
- [ ] 3. `data-message-id` est-il trouvé ? (Problème Shadow DOM)
- [ ] 4. Le markdown est-il généré correctement ? (Problème conversion)
- [ ] 5. L'IPC call est-il envoyé ? (Vérifier logs renderer)
- [ ] 6. L'IPC call est-il reçu ? (Vérifier logs main process)
- [ ] 7. Le message existe-t-il en base ? (Requête SQL)
- [ ] 8. La mise à jour réussit-elle ? (Vérifier retour)
- [ ] 9. Les données sont-elles en base ? (Requête SQL après)
- [ ] 10. Le cache est-il invalidé ? (Actualiser la page)

### 7.7 : Outils de Débogage Recommandés

**DevTools Extensions** :
- React Developer Tools
- Redux DevTools (si utilisé)

**SQLite Browsers** :
- DB Browser for SQLite
- SQLiteStudio

**Electron DevTools** :
- Ouvrir avec F12 ou `Ctrl+Shift+I`
- Onglet Console pour les logs
- Onglet Elements pour inspecter le DOM
- Onglet Network pour les requêtes (si applicable)

**Logs Système** :
```bash
# Windows
Get-Content "$env:APPDATA\E-audit\logs\main.log" -Tail 50

# Linux/Mac
tail -f ~/.config/E-audit/logs/main.log
```

---

## Résumé des Solutions Clés

| Problème | Solution Rapide | Fichier |
|----------|----------------|---------|
| Shadow DOM bloque closest() | Traversée manuelle | useTablePersistence.ts |
| data-message-id non trouvé | Placer sur .message-item | MessageList.tsx |
| Menu Electron s'affiche | addEventListener(..., true) | TableContextMenu.tsx |
| IPC timeout | Vérifier initDatabaseBridge() | bridge/index.ts |
| Message non trouvé | Vérifier messageId | databaseBridge.ts |
| Markdown mal formaté | Ajouter séparateur | useTablePersistence.ts |
| Modifications non persistées | Checklist complète | Voir 7.6 |

---

## Prévention des Erreurs Futures

### Bonnes Pratiques

1. **Toujours logger les étapes critiques** :
   ```typescript
   console.log('[Component] 🔍 Step 1: ...');
   console.log('[Component] ✅ Success');
   console.log('[Component] ❌ Error:', error);
   ```

2. **Valider les données à chaque frontière** :
   - Avant l'IPC call
   - Avant l'insertion en base
   - Après la lecture de la base

3. **Tester avec des cas limites** :
   - Tableaux vides
   - Cellules avec caractères spéciaux
   - Très grandes tables
   - Modifications rapides successives

4. **Documenter les changements** :
   - Ajouter des commentaires dans le code
   - Mettre à jour la documentation
   - Noter les problèmes rencontrés

5. **Utiliser TypeScript strictement** :
   - Pas de `any`
   - Typer tous les paramètres
   - Utiliser des interfaces

### Tests Automatisés

Créer des tests pour les fonctions critiques :

```typescript
// tests/unit/table-persistence.test.ts
describe('tableToMarkdown', () => {
  it('should convert simple table', () => {
    const table = createTable([
      ['A', 'B'],
      ['1', '2']
    ]);
    const markdown = tableToMarkdown(table);
    expect(markdown).toBe('| A | B |\n|---|---|\n| 1 | 2 |');
  });

  it('should escape pipes', () => {
    const table = createTable([['A|B', 'C']]);
    const markdown = tableToMarkdown(table);
    expect(markdown).toContain('A\\|B');
  });
});
```

---

Cette documentation devrait couvrir tous les problèmes possibles et leurs solutions. Pour toute nouvelle erreur, suivre la checklist de diagnostic (section 7.6) et ajouter la solution ici.
