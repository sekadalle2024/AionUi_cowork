# n8n Integration - Option A Complete

## Architecture Implemented

n8n est maintenant intégré comme un **agent conversationnel** dans AionUi, au même niveau que Gemini, Claude, etc.

### Flow d'exécution

```
User → Guid Page (sélectionne "n8n Workflow")
  ↓
Crée une conversation n8n
  ↓
Interface de chat normale
  ↓
User envoie un message
  ↓
N8nAgentManager.execute()
  ↓
n8nService → HTTP → n8n-server (port 3458) → n8n workflow
  ↓
Réponse parsée en Markdown
  ↓
Affichée dans le chat
```

## Fichiers créés/modifiés

### Backend (Process)

1. **`src/process/task/N8nAgentManager.ts`** (NOUVEAU)
   - Gestionnaire de tâches pour n8n
   - Exécute les workflows via n8nService
   - Parse et émet les réponses

2. **`src/process/bridge/n8nConversationBridge.ts`** (NOUVEAU)
   - Bridge de conversation pour n8n
   - Utilise l'interface unifiée `conversation.sendMessage`

3. **`src/process/WorkerManage.ts`** (MODIFIÉ)
   - Ajout du cas `'n8n'` dans `buildConversation()`
   - Import de `N8nAgentManager`

4. **`src/process/bridge/index.ts`** (MODIFIÉ)
   - Import et initialisation de `initN8nConversationBridge()`

### Types & Configuration

5. **`src/common/storage.ts`** (DÉJÀ EXISTANT)
   - Type `'n8n'` déjà présent dans `TChatConversation`

6. **`src/common/presets/assistantPresets.ts`** (DÉJÀ EXISTANT)
   - Preset "n8n Workflow" déjà configuré avec:
     - Avatar: 🔄
     - presetAgentType: 'n8n'
     - Descriptions en/zh-CN
     - Prompts d'exemple

### Services (déjà existants)

7. **`src/process/services/n8nService.ts`**
   - Service HTTP pour appeler le backend n8n

8. **`src/agent/n8n/n8nResponseParser.ts`**
   - Parse les réponses n8n en Markdown

9. **`src/agent/n8n/n8n-server.ts`**
   - Backend Express sur port 3458
   - Proxy vers n8n workflow

## Comment utiliser

### 1. Démarrer le backend n8n

```bash
# Terminal 1: Backend n8n
.\scripts\start-n8n-agent.ps1

# Terminal 2: Application Electron
npm run start:mem

# OU tout en un:
npm run start:all
```

### 2. Dans l'application

1. Sur la page d'accueil (Guid), sélectionnez **"n8n Workflow"** dans la liste des agents
2. Cliquez sur "Start Chat" ou équivalent
3. Une conversation n8n s'ouvre
4. Envoyez vos messages comme avec n'importe quel agent
5. Les réponses du workflow n8n s'affichent dans le chat

## Différences avec l'implémentation précédente

### Avant (Page standalone)
- Page séparée `/n8n-workflow`
- Bouton dédié dans QuickActionButtons
- Interface de formulaire simple
- Pas d'historique de conversation

### Maintenant (Agent conversationnel)
- Intégré dans le système de conversation
- Apparaît dans la liste des agents sur Guid
- Interface de chat complète
- Historique sauvegardé
- Même UX que Gemini/Claude

## Points techniques

### N8nAgentManager

- **Type**: `'n8n'`
- **Méthodes**:
  - `execute(userMessage, msgId)` - Exécute le workflow
  - `stop()` - Arrêt (non supporté par n8n)
  - `kill()` - Nettoyage
  - `destroy()` - Alias de kill

### Communication IPC

Utilise le stream unifié:
```typescript
ipcBridge.conversation.responseStream.emit({
  type: 'message' | 'error',
  conversation_id: string,
  msg_id: string,
  data: string,
  status: 'finished',
});
```

### Gestion des erreurs

- Erreurs réseau → Message d'erreur dans le chat
- Timeout → Message d'erreur après 10 minutes
- Workflow n8n échoue → Affiche l'erreur retournée

## Configuration n8n

Le backend n8n doit être configuré pour:
- **Port**: 3458
- **Endpoint n8n**: `http://localhost:5678/webhook/template`
- **Timeout**: 10 minutes

## Prochaines étapes possibles

1. Ajouter un indicateur de statut du backend n8n dans l'UI
2. Permettre la configuration de l'endpoint n8n dans les settings
3. Supporter plusieurs workflows n8n différents
4. Ajouter un système de retry en cas d'échec
5. Implémenter le streaming des réponses (si n8n le supporte)

## Tests

Pour tester l'intégration:

1. Démarrez le backend n8n
2. Lancez l'application
3. Créez une conversation n8n
4. Envoyez: "Generate a work program for cash inventory"
5. Vérifiez que la réponse s'affiche correctement

## Troubleshooting

### "n8n is not available"
- Le backend n8n n'est pas démarré
- Vérifiez que le port 3458 est libre
- Lancez `.\scripts\start-n8n-agent.ps1`

### Pas de réponse
- Vérifiez que n8n est accessible sur `http://localhost:5678`
- Vérifiez les logs du backend n8n
- Testez l'endpoint avec curl

### Erreurs TypeScript
- Relancez l'application complètement
- Vérifiez que tous les imports sont corrects
- Exécutez `bunx tsc --noEmit` pour voir les erreurs
