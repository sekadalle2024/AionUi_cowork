# n8n Integration - Setup Final

## ✅ Intégration complète

n8n est maintenant intégré comme un **agent conversationnel** dans AionUi.

## 🚀 Comment utiliser

### 1. Démarrer le backend n8n

```bash
# Dans un terminal PowerShell
.\scripts\start-n8n-agent.ps1
```

Le backend démarre sur `http://localhost:3458` et se connecte à n8n sur `http://localhost:5678/webhook/template`.

### 2. Lancer l'application

```bash
# Dans un autre terminal
npm run start:mem
```

### 3. Utiliser n8n dans l'application

1. **Sur la page d'accueil (Guid)**, vous verrez "n8n Workflow" dans la liste des agents disponibles
2. **Sélectionnez "n8n Workflow"** et cliquez sur "Start Chat"
3. **Une conversation s'ouvre** - interface de chat normale
4. **Envoyez votre message** (ex: "Generate a work program for cash inventory")
5. **La réponse du workflow n8n s'affiche** dans le chat

## 📁 Fichiers modifiés/créés

### Backend (Process)
- ✅ `src/process/task/N8nAgentManager.ts` - Gestionnaire de tâches n8n
- ✅ `src/process/bridge/n8nConversationBridge.ts` - Bridge de conversation
- ✅ `src/process/WorkerManage.ts` - Ajout du cas 'n8n'
- ✅ `src/process/bridge/index.ts` - Initialisation du bridge
- ✅ `src/process/bridge/conversationBridge.ts` - Ajout du cas 'n8n' dans sendMessage

### Configuration
- ✅ `src/common/storage.ts` - Type 'n8n' déjà présent
- ✅ `src/common/presets/assistantPresets.ts` - Preset "n8n Workflow" déjà configuré

### Services (déjà existants)
- ✅ `src/process/services/n8nService.ts` - Service HTTP
- ✅ `src/agent/n8n/n8nResponseParser.ts` - Parser de réponses
- ✅ `src/agent/n8n/n8n-server.ts` - Backend Express

### Scripts
- ✅ `scripts/start-n8n-agent.ps1` - Démarrage du backend
- ✅ `scripts/start-all.ps1` - Démarrage unifié (optionnel)

## 🔄 Flow d'exécution

```
User → Guid Page
  ↓ Sélectionne "n8n Workflow"
  ↓
Crée conversation n8n
  ↓
Interface de chat
  ↓
User envoie message
  ↓
conversationBridge.sendMessage()
  ↓
N8nAgentManager.sendMessage()
  ↓
N8nAgentManager.execute()
  ↓
n8nService.executeN8nWorkflow()
  ↓
HTTP POST → n8n-server (port 3458)
  ↓
HTTP POST → n8n workflow (port 5678)
  ↓
Réponse n8n
  ↓
n8nResponseParser.parseN8nResponse()
  ↓
ipcBridge.conversation.responseStream.emit()
  ↓
Affichage dans le chat
```

## 🎯 Fonctionnalités

✅ **Interface de chat complète**
- Historique des conversations sauvegardé
- Même UX que Gemini/Claude
- Support des messages longs

✅ **Gestion des erreurs**
- Erreurs réseau affichées dans le chat
- Timeout après 10 minutes
- Messages d'erreur clairs

✅ **Architecture propre**
- Pas d'intervention d'agent IA
- Proxy HTTP direct vers n8n
- Réponses parsées en Markdown

## 🧪 Test rapide

1. Démarrez le backend: `.\scripts\start-n8n-agent.ps1`
2. Lancez l'app: `npm run start:mem`
3. Sélectionnez "n8n Workflow" sur la page Guid
4. Envoyez: "Generate a work program for cash inventory"
5. Vérifiez la réponse

## 🐛 Troubleshooting

### "conversation not found" ou pas de réponse
- ✅ Vérifiez que le backend n8n est démarré
- ✅ Testez l'endpoint: `curl http://localhost:3458/health`
- ✅ Vérifiez les logs du backend n8n

### "Unsupported task type: n8n"
- ✅ Relancez complètement l'application
- ✅ Vérifiez que tous les fichiers sont sauvegardés
- ✅ Vérifiez les logs de la console

### Erreurs TypeScript
- ✅ Exécutez: `bunx tsc --noEmit`
- ✅ Tous les diagnostics doivent être résolus

## 📝 Notes techniques

### N8nAgentManager
- **Type**: `'n8n'`
- **Interface**: Compatible avec AgentBaseTask
- **Méthodes**: `sendMessage()`, `execute()`, `stop()`, `kill()`, `getConfirmations()`, `confirm()`

### Messages IPC
Format: `{ type, data, msg_id, conversation_id }`
- `type: 'message'` - Contenu de la réponse
- `type: 'finish'` - Signal de fin
- `type: 'error'` - Message d'erreur

### Backend n8n
- **Port**: 3458
- **Endpoint n8n**: `http://localhost:5678/webhook/template`
- **Timeout**: 10 minutes
- **Démarrage**: `npx ts-node --transpile-only src/agent/n8n/n8n-server.ts`

## ✨ Prochaines améliorations possibles

1. Indicateur de statut du backend dans l'UI
2. Configuration de l'endpoint n8n dans les settings
3. Support de plusieurs workflows n8n
4. Système de retry automatique
5. Streaming des réponses (si supporté par n8n)

## 🎉 C'est prêt!

L'intégration est complète. n8n fonctionne maintenant comme un agent conversationnel à part entière dans AionUi!
