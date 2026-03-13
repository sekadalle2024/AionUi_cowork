# Système de Persistance - Menu Contextuel

**Date**: 13 mars 2026  
**Version**: 1.0  
**Statut**: ✅ Implémenté

## 🎯 Problème Résolu

Les modifications effectuées sur les tableaux via le menu contextuel (ajout/suppression de lignes/colonnes, édition de cellules) n'étaient pas persistantes après actualisation de la page. Les changements étaient uniquement appliqués au DOM sans être sauvegardés dans la base de données SQLite.

## 🏗️ Architecture de la Solution

### Vue d'ensemble

```
User Action → TableContextMenu → DOM Modification → useTablePersistence
                                                            ↓
                                                    syncTableToDatabase()
                                                            ↓
                                            Convert HTML → Markdown
                                                            ↓
                                            Update Message Content
                                                            ↓
                                            addOrUpdateMessage()
                                                            ↓
                                                    SQLite Database
```

### Composants Créés

#### 1. Hook `useTablePersistence`

**Fichier**: `src/renderer/hooks/useTablePersistence.ts`

**Responsabilités**:
- Synchroniser les modifications DOM avec la base de données
- Convertir HTML de table en format Markdown
- Mettre à jour le contenu du message dans SQLite

**API**:
```typescript
const { syncTableToDatabase } = useTablePersistence();

// Synchroniser une table modifiée
syncTableToDatabase(tableElement, conversationId);
```

#### 2. Modifications du `TableContextMenu`

**Fichier**: `src/renderer/components/TableContextMenu.tsx`

**Ajouts**:
- État `conversationId` pour tracker la conversation active
- Hook `useTablePersistence` pour la synchronisation
- Fonction `syncTable()` appelée après chaque modification
- Extraction automatique du `conversationId` depuis l'URL

## 🔄 Flux de Persistance

### 1. Détection de la Conversation

```typescript
const isTableInChat = useCallback((table: HTMLTableElement): boolean => {
  const chatSelectors = ['.markdown-shadow-body', '.message-item', /* ... */];
  const inChat = chatSelectors.some((selector) => table.closest(selector));
  
  if (inChat) {
    // Extraire l'ID de conversation depuis l'URL
    const url = window.location.href;
    const match = url.match(/conversation\/([^/]+)/);
    if (match) {
      setConversationId(match[1]);
    }
  }
  
  return inChat;
}, []);
```

### 2. Synchronisation après Modification

Chaque opération de modification appelle `syncTable()`:

```typescript
const insertRowBelow = useCallback(() => {
  // ... ajout de ligne
  showNotification('✅ Row added');
  syncTable(); // ← Synchronisation
  hideMenu();
}, [targetTable, showNotification, syncTable, hideMenu]);
```

**Opérations synchronisées**:
- ✅ Enable Editing (avec sync automatique au blur)
- ✅ Insert Row
- ✅ Insert Column
- ✅ Delete Row
- ✅ Delete Column

### 3. Conversion HTML → Markdown

**Fonction**: `tableToMarkdown()`

```typescript
function tableToMarkdown(table: HTMLTableElement): string {
  const rows: string[] = [];

  // En-têtes
  const thead = table.querySelector('thead');
  if (thead) {
    const headerRow = thead.querySelector('tr');
    const headers = Array.from(headerRow.querySelectorAll('th, td'))
      .map((cell) => cell.textContent?.trim() || '')
      .join(' | ');
    rows.push(`| ${headers} |`);
    
    // Séparateur
    const separator = Array.from(headerRow.querySelectorAll('th, td'))
      .map(() => '---')
      .join(' | ');
    rows.push(`| ${separator} |`);
  }

  // Corps du tableau
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

**Exemple de conversion**:

```html
<!-- HTML -->
<table>
  <thead>
    <tr><th>Nom</th><th>Âge</th></tr>
  </thead>
  <tbody>
    <tr><td>Alice</td><td>30</td></tr>
    <tr><td>Bob</td><td>25</td></tr>
  </tbody>
</table>
```

```markdown
<!-- Markdown -->
| Nom | Âge |
| --- | --- |
| Alice | 30 |
| Bob | 25 |
```

### 4. Mise à Jour du Message

```typescript
const syncTableToDatabase = useCallback((table: HTMLTableElement, conversationId: string) => {
  // 1. Trouver le conteneur du message
  const messageContainer = table.closest('[data-message-id]');
  const messageId = messageContainer.getAttribute('data-message-id');
  
  // 2. Extraire le contenu markdown
  const markdownContainer = table.closest('.markdown-shadow-body, .markdown-body');
  const updatedContent = extractAndConvertContent(markdownContainer);
  
  // 3. Créer le message mis à jour
  const updatedMessage: TMessage = {
    id: messageId,
    msg_id: messageId,
    type: 'text',
    position: 'left',
    conversation_id: conversationId,
    content: { content: updatedContent },
    createdAt: Date.now(),
  };
  
  // 4. Sauvegarder dans la base de données
  addOrUpdateMessage(updatedMessage, false);
}, [addOrUpdateMessage]);
```

## 🔧 Intégration avec le Système Existant

### Compatibilité avec le Système de Messages

Le système de persistance s'intègre parfaitement avec l'architecture existante:

```
TableContextMenu → useTablePersistence → addOrUpdateMessage()
                                              ↓
                                    ConversationManageWithDB
                                              ↓
                                        SQLite Database
```

**Avantages**:
- Utilise le même système que les autres agents (Gemini, ACP, n8n)
- Pas de duplication de code
- Cohérence architecturale
- Réutilise les mécanismes de queue et de batch

### Système de Queue

Les modifications sont ajoutées à la queue de `ConversationManageWithDB`:

```typescript
// Dans message.ts
class ConversationManageWithDB {
  private stack: Array<['insert' | 'accumulate', TMessage]> = [];
  
  sync(type: 'insert' | 'accumulate', message: TMessage) {
    this.stack.push([type, message]);
    // Batch les modifications pour optimiser les écritures DB
  }
}
```

**Type utilisé**: `'accumulate'` (mise à jour de message existant)

## 📊 Gestion du Shadow DOM

### Problème

Les tableaux dans AIONUI sont encapsulés dans un Shadow DOM:

```html
<div class="markdown-shadow-body">
  #shadow-root (open)
    <table>...</table>
</div>
```

### Solution

```typescript
// Accès au Shadow DOM
const shadowHost = markdownContainer as HTMLElement;

if ((shadowHost as any).shadowRoot) {
  const shadowRoot = (shadowHost as any).shadowRoot;
  updatedContent = shadowRoot.innerHTML || '';
} else {
  updatedContent = markdownContainer.innerHTML || '';
}
```

## ⚡ Optimisations

### 1. Synchronisation Différée pour l'Édition

Lors de l'activation de l'édition, la synchronisation se fait au `blur` (perte de focus) plutôt qu'à chaque frappe:

```typescript
const enableCellEditing = useCallback(() => {
  cells.forEach((cell) => {
    cell.contentEditable = 'true';
    
    // Sync uniquement quand l'utilisateur termine l'édition
    cell.addEventListener('blur', () => {
      syncTable();
    });
  });
}, [targetTable, syncTable]);
```

**Avantages**:
- Réduit le nombre d'écritures en base
- Meilleure performance
- Évite les conflits de synchronisation

### 2. Batch des Modifications

Le système `ConversationManageWithDB` batch automatiquement les modifications:

```typescript
// Timer de 2 secondes pour accumuler les modifications
this.timer = setTimeout(() => {
  this.save2DataBase();
}, 2000);
```

### 3. Cache des Indices

Le système de messages utilise un cache d'indices pour optimiser les recherches:

```typescript
const indexCache = new WeakMap<TMessage[], MessageIndex>();

function getOrBuildIndex(list: TMessage[]): MessageIndex {
  let cached = indexCache.get(list);
  if (!cached) {
    cached = buildMessageIndex(list);
    indexCache.set(list, cached);
  }
  return cached;
}
```

## 🧪 Tests de Validation

### Scénarios Testés

1. **Ajout de ligne**
   - ✅ Ligne ajoutée dans le DOM
   - ✅ Modification persistée en base
   - ✅ Ligne présente après actualisation

2. **Suppression de colonne**
   - ✅ Colonne supprimée du DOM
   - ✅ Modification persistée en base
   - ✅ Colonne absente après actualisation

3. **Édition de cellule**
   - ✅ Contenu modifié dans le DOM
   - ✅ Synchronisation au blur
   - ✅ Contenu persisté après actualisation

4. **Navigation entre conversations**
   - ✅ Modifications conservées
   - ✅ Pas de perte de données
   - ✅ Chargement correct depuis la base

### Procédure de Test

```bash
# 1. Démarrer l'application
npm run start

# 2. Ouvrir une conversation avec un tableau
# 3. Effectuer des modifications via le menu contextuel
# 4. Actualiser la page (F5)
# 5. Vérifier que les modifications sont conservées
```

## 🚨 Limitations Connues

### 1. Conversion HTML → Markdown

**Limitation**: La conversion est simplifiée et ne gère pas tous les cas:
- Pas de support des cellules fusionnées (`colspan`, `rowspan`)
- Pas de support du formatage riche (gras, italique, liens)
- Pas de support des tableaux imbriqués

**Solution future**: Utiliser une bibliothèque comme `turndown` pour une conversion complète.

### 2. Détection du Message ID

**Limitation**: Nécessite que le conteneur du message ait l'attribut `data-message-id`.

**Workaround actuel**: Recherche du conteneur parent avec cet attribut.

**Solution future**: Améliorer la détection avec d'autres méthodes de fallback.

### 3. Synchronisation Temps Réel

**Limitation**: Les modifications ne sont pas synchronisées en temps réel entre plusieurs fenêtres/onglets.

**Impact**: Si deux utilisateurs modifient le même tableau simultanément, le dernier écrase le premier.

**Solution future**: Implémenter un système de verrouillage ou de merge.

## 🔄 Évolutions Futures

### Phase 1: Améliorations Immédiates
- [ ] Utiliser `turndown` pour conversion HTML → Markdown
- [ ] Ajouter un indicateur visuel de synchronisation
- [ ] Gérer les erreurs de synchronisation avec retry

### Phase 2: Fonctionnalités Avancées
- [ ] Support des cellules fusionnées
- [ ] Support du formatage riche dans les cellules
- [ ] Historique des modifications (undo/redo)
- [ ] Synchronisation temps réel multi-utilisateurs

### Phase 3: Optimisations
- [ ] Debouncing intelligent basé sur l'activité
- [ ] Compression des données de tableau
- [ ] Cache local pour réduire les requêtes DB

## 📚 Références

### Fichiers Modifiés
- `src/renderer/hooks/useTablePersistence.ts` (nouveau)
- `src/renderer/components/TableContextMenu.tsx` (modifié)

### Documentation Liée
- [Doc_systeme_sauvegarde/README.md](../Doc_systeme_sauvegarde/README.md)
- [Doc_systeme_sauvegarde/ARCHITECTURE_GENERALE.md](../Doc_systeme_sauvegarde/ARCHITECTURE_GENERALE.md)
- [Doc_systeme_sauvegarde/COMPOSANTS/MESSAGE_SYSTEM.md](../Doc_systeme_sauvegarde/COMPOSANTS/MESSAGE_SYSTEM.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)

### Code Source
- `src/process/message.ts` - Système de persistance
- `src/renderer/messages/hooks.ts` - Hooks de messages
- `src/process/database/` - Interface SQLite

---

**Implémenté par**: Assistant IA  
**Date d'implémentation**: 13 mars 2026  
**Temps d'implémentation**: ~1 heure  
**Complexité**: Moyenne  
**Statut**: ✅ Production Ready
