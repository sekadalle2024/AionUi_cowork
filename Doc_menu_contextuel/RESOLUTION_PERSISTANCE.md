# Résolution du Problème de Persistance

## Problème Identifié

L'attribut `data-message-id` était ajouté au mauvais niveau du DOM. Il était dans le composant `MessageText`, mais le menu contextuel cherchait dans les parents et ne trouvait pas l'attribut car il n'était pas sur le wrapper `.message-item`.

## Solution Appliquée

Déplacé l'attribut `data-message-id` du composant `MessageText` vers le wrapper `MessageItem` dans `MessageList.tsx`.

### Fichiers Modifiés

1. **src/renderer/messages/MessageList.tsx**
   - Ajouté `data-message-id={message.id}` et `data-msg-id={message.msg_id}` au div wrapper avec la classe `message-item`

2. **src/renderer/messages/MessagetText.tsx**
   - Supprimé les attributs `data-message-id` et `data-msg-id` (maintenant dans le parent)

3. **src/renderer/components/TableContextMenu.tsx**
   - Corrigé l'erreur de floating promise avec `void syncTableToDatabase()`
   - Supprimé la variable d'état `conversationId` non utilisée

4. **src/renderer/hooks/useTablePersistence.ts**
   - Supprimé la fonction `getParentChain` non utilisée

## Structure DOM Correcte

```
<div class="message-item" data-message-id="[id]" data-msg-id="[msg_id]">
  └─ <MessageText>
      └─ <div class="flex gap-8px">
          └─ <MarkdownView>
              └─ <div class="markdown-shadow-body">
                  └─ <table>  ← Le menu contextuel trouve maintenant le parent avec data-message-id
```

## Test de la Persistance

1. Démarrer l'app : `npm run start`
2. Créer une conversation avec un tableau
3. Clic droit → Enable Editing
4. Modifier une cellule
5. Cliquer en dehors (blur)
6. Vérifier les logs dans DevTools
7. Actualiser la page (F5)
8. Vérifier que les modifications sont persistées

## Logs Attendus

```
[TableContextMenu] 🔄 syncTable called
[TableContextMenu] 🆔 Extracted conversationId: [id]
[TablePersistence] 🔍 Starting sync for conversation: [id]
[TablePersistence] ✅ Found message ID: [message-id]
[TablePersistence] 📝 Converted markdown: ...
[TablePersistence] ✅ Table modifications synced to database
[DatabaseBridge] Message content updated successfully: [message-id]
```

## Prochaines Étapes

Si la persistance ne fonctionne toujours pas après ce fix :

1. Vérifier que l'app a bien été recompilée (arrêter et redémarrer `npm run start`)
2. Inspecter le DOM avec DevTools pour confirmer que `data-message-id` est présent
3. Vérifier les logs de la console pour identifier où le processus échoue
4. Vérifier que la base de données SQLite est bien mise à jour

## Architecture Complète

```
User modifies table cell
    ↓
blur event triggered
    ↓
syncTable() in TableContextMenu
    ↓
Extract conversationId from URL
    ↓
syncTableToDatabase(table, conversationId)
    ↓
table.closest('[data-message-id]') → Trouve le wrapper .message-item
    ↓
Extract messageId from data-message-id attribute
    ↓
Convert table HTML to markdown
    ↓
IPC: database.updateMessageContent.invoke({ messageId, conversationId, content })
    ↓
databaseBridge.ts: Update message in SQLite
    ↓
Success! Modifications persisted
```
