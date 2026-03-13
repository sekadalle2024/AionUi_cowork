# Système de Messages et Persistance

## 💾 Architecture de persistance

### Composants clés
- `message.ts` : Gestionnaire de persistance
- `hooks.ts` : Hooks React pour les messages
- `database/` : Interface SQLite

## 🔄 Flux de persistance

### Sauvegarde
```typescript
Agent → addMessage() → ConversationManageWithDB → SQLite
```

### Chargement
```typescript
Component → useMessageLstCache() → Database Query → UI Update
```

## 📊 Base de données

### Table messages
```sql
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  msg_id TEXT,
  type TEXT NOT NULL,
  position TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id)
);
```

## 🎯 Hooks principaux

- `useMessageLstCache(id)` : Charge les messages
- `useAddOrUpdateMessage()` : Ajoute/met à jour
- `useMessageList()` : Accède à la liste

## ✅ Bonnes pratiques

1. Toujours utiliser `useMessageLstCache()` dans les composants Chat
2. Sauvegarder via `addMessage()` dans les AgentManagers
3. Éviter les doublons avec les flags appropriés

---

**Version** : 2.0  
**Statut** : ✅ Stable