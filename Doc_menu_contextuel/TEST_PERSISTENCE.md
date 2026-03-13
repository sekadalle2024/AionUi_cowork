# Test de Persistance des Tables

## Instructions de Test

1. **Démarrer l'application** : `npm run start`

2. **Créer une conversation de test** avec un tableau markdown :

```markdown
| Nom | Prénom | Age |
|-----|--------|-----|
| Dupont | Jean | 30 |
| Martin | Marie | 25 |
```

3. **Tester les modifications** :
   - Faire un clic droit sur le tableau
   - Sélectionner "Enable Editing"
   - Modifier une cellule
   - Cliquer en dehors de la cellule (blur event)
   - Vérifier les logs dans la console DevTools

4. **Vérifier la persistance** :
   - Actualiser la page (F5)
   - Vérifier que les modifications sont toujours présentes

## Logs à Vérifier

Dans la console DevTools, vous devriez voir :

```
[TableContextMenu] 🔄 syncTable called
[TableContextMenu] 📊 targetTable: <table>
[TableContextMenu] 🔍 Current URL: http://localhost:5173/conversation/[id]
[TableContextMenu] 🆔 Extracted conversationId: [id]
[TablePersistence] 🔍 Starting sync for conversation: [id]
[TablePersistence] 📊 Table element: <table>
[TablePersistence] 🔍 Parent chain: ...
[TablePersistence] ✅ Found message ID: [message-id]
[TablePersistence] 📝 Converted markdown: ...
[TablePersistence] ✅ Table modifications synced to database
```

## Problèmes Connus

### data-message-id non trouvé

Si vous voyez `❌ Could not find message container`, cela signifie que l'attribut `data-message-id` n'est pas présent dans le DOM.

**Solution** :
1. Vérifier que `MessagetText.tsx` a bien été recompilé
2. Inspecter le DOM avec DevTools pour voir la structure réelle
3. Vérifier que l'attribut est bien ajouté au bon élément parent

### conversationId non extrait

Si vous voyez `⚠️ Cannot sync - could not extract conversationId from URL`, vérifier :
1. L'URL de la page (doit contenir `/conversation/[id]`)
2. Les patterns de regex dans `syncTable()`

## Architecture

```
User modifies table cell
    ↓
blur event triggered
    ↓
syncTable() called
    ↓
Extract conversationId from URL
    ↓
syncTableToDatabase(table, conversationId)
    ↓
Find message container with data-message-id
    ↓
Convert table to markdown
    ↓
IPC call: database.updateMessageContent
    ↓
Update message in SQLite database
    ↓
Success! Modifications persisted
```

## Fichiers Modifiés

- `src/renderer/messages/MessagetText.tsx` - Ajout de `data-message-id`
- `src/renderer/hooks/useTablePersistence.ts` - Hook de persistance
- `src/renderer/components/TableContextMenu.tsx` - Appels à syncTable()
- `src/common/ipcBridge.ts` - Définition IPC route
- `src/process/bridge/databaseBridge.ts` - Implémentation IPC

## Prochaines Étapes

Si la persistance ne fonctionne toujours pas :

1. **Vérifier l'attribut data-message-id** :
   - Ouvrir DevTools → Elements
   - Chercher le tableau dans le DOM
   - Remonter les parents pour trouver `data-message-id`

2. **Alternative : Utiliser le contexte de message** :
   - Au lieu de chercher dans le DOM, utiliser le contexte React
   - Passer le messageId via props au composant de tableau

3. **Déboguer l'IPC** :
   - Ajouter des logs dans `databaseBridge.ts`
   - Vérifier que l'IPC call arrive bien au backend
   - Vérifier que la base de données est mise à jour
