# Guide de Test - Persistance des Tables

## Prérequis
- Application démarrée avec `npm run start`
- DevTools ouvert (F12) pour voir les logs

## Étapes de Test

### 1. Créer une Conversation avec un Tableau

Dans une nouvelle conversation, envoyer ce message :

```markdown
Voici un tableau de test :

| Nom | Prénom | Age |
|-----|--------|-----|
| Dupont | Jean | 30 |
| Martin | Marie | 25 |
| Durand | Paul | 35 |
```

### 2. Activer l'Édition

1. Faire un **clic droit** sur le tableau
2. Sélectionner **"Enable Editing"**
3. Les cellules deviennent éditables (curseur texte)

### 3. Modifier une Cellule

1. Cliquer dans une cellule (ex: "Jean")
2. Modifier le texte (ex: "Jean-Pierre")
3. Cliquer **en dehors** de la cellule (blur event)

### 4. Vérifier les Logs

Dans la console DevTools, vous devriez voir :

```
[TableContextMenu] 🔄 syncTable called
[TableContextMenu] 📊 targetTable: <table>
[TableContextMenu] 🔍 Current URL: http://localhost:5173/conversation/[id]
[TableContextMenu] 🆔 Extracted conversationId: [id]
[TablePersistence] 🔍 Starting sync for conversation: [id]
[TablePersistence] 📊 Table element: <table>
[TablePersistence] 🔍 Parent chain:
  0: DIV.message-item [data-message-id=[message-id]]
[TablePersistence] ✅ Found message ID: [message-id]
[TablePersistence] 📝 Converted markdown: | Nom | Prénom | Age |...
[TablePersistence] ✅ Table modifications synced to database
```

### 5. Tester la Persistance

1. Actualiser la page (F5)
2. Naviguer vers une autre conversation
3. Revenir à la conversation de test
4. **Vérifier** : La modification ("Jean-Pierre") est toujours présente

## Autres Opérations à Tester

### Ajouter une Ligne
1. Clic droit → "Insert Row Below"
2. Vérifier les logs de sync
3. Actualiser → Vérifier persistance

### Ajouter une Colonne
1. Clic droit → "Insert Column Right"
2. Vérifier les logs de sync
3. Actualiser → Vérifier persistance

### Supprimer une Ligne
1. Cliquer dans une cellule
2. Clic droit → "Delete Row"
3. Confirmer
4. Vérifier les logs de sync
5. Actualiser → Vérifier persistance

## Dépannage

### ❌ "Could not find message container"

**Cause** : L'attribut `data-message-id` n'est pas trouvé

**Solution** :
1. Ouvrir DevTools → Elements
2. Inspecter le tableau
3. Remonter les parents pour trouver `<div class="message-item" data-message-id="...">`
4. Si absent, vérifier que l'app a bien été recompilée

### ❌ "Cannot sync - could not extract conversationId"

**Cause** : L'URL ne contient pas l'ID de conversation

**Solution** :
1. Vérifier l'URL : doit être `/conversation/[id]`
2. Si différent, adapter les regex dans `syncTable()`

### ❌ Modifications non persistées après refresh

**Causes possibles** :
1. IPC call échoue → Vérifier logs backend
2. Base de données non mise à jour → Vérifier `databaseBridge.ts`
3. Message non trouvé → Vérifier que messageId est correct

## Vérification Base de Données

Pour vérifier directement dans SQLite :

```bash
# Ouvrir la base de données
sqlite3 "C:\Users\[USER]\AppData\Roaming\E-audit\aionui\aionui.db"

# Lister les conversations
SELECT id, title FROM conversations;

# Voir les messages d'une conversation
SELECT id, content FROM messages WHERE conversation_id = '[conversation-id]';
```

## Architecture du Flux

```
User edits cell → blur event
    ↓
TableContextMenu.syncTable()
    ↓
Extract conversationId from URL
    ↓
useTablePersistence.syncTableToDatabase()
    ↓
Find parent with data-message-id
    ↓
Convert table to markdown
    ↓
IPC: database.updateMessageContent
    ↓
databaseBridge.ts updates SQLite
    ↓
✅ Persisted!
```
