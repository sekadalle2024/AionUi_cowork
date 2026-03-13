# Système de Communication IPC

## 🌉 Vue d'ensemble

Le système IPC (Inter-Process Communication) permet la communication entre le processus de rendu (React) et le processus principal (Node.js) dans Electron.

## 🔧 Architecture

### Structure
```
Renderer Process ←→ IPC Bridge ←→ Main Process
    (React)           (Electron)      (Node.js)
```

### Channels principaux
- `conversation.*` : Gestion des conversations
- `database.*` : Accès base de données  
- `n8n.*` : Communication n8n
- `cron.*` : Tâches programmées

## 📡 Utilisation

### Frontend (Renderer)
```typescript
// Appel d'une méthode
const result = await ipcBridge.conversation.sendMessage.invoke({
  conversation_id: 'conv-123',
  input: 'Hello',
  msg_id: 'msg-456'
});

// Écoute d'événements
ipcBridge.conversation.responseStream.on((message) => {
  console.log('Nouveau message:', message);
});
```

### Backend (Main)
```typescript
// Fournisseur de méthode
ipcBridge.conversation.sendMessage.provider(async (params) => {
  const task = await WorkerManage.getTaskByIdRollbackBuild(params.conversation_id);
  await task.sendMessage(params);
  return { success: true };
});

// Émission d'événements
ipcBridge.conversation.responseStream.emit({
  type: 'message',
  conversation_id: 'conv-123',
  data: 'Response'
});
```

## 🛡️ Sécurité

- Validation des paramètres
- Typage TypeScript strict
- Isolation des processus
- Pas d'accès direct au système de fichiers depuis le renderer

---

**Version** : 3.0  
**Statut** : ✅ Sécurisé