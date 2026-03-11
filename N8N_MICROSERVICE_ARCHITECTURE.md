# Architecture Microservice n8n - Option 1 ✅

## Vue d'ensemble

Architecture microservice pure avec API directe via IPC, **sans intervention d'agent IA**.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ RENDERER PROCESS (Frontend)                                 │
│                                                              │
│  N8nWorkflowPage.tsx                                        │
│  ├─ Input: userMessage                                      │
│  ├─ Button: Execute Workflow                                │
│  └─ Display: Markdown result                                │
│                                                              │
│  Appelle: n8n.execute.invoke({ userMessage })              │
└─────────────────────────────────────────────────────────────┘
                          ↓ IPC
┌─────────────────────────────────────────────────────────────┐
│ MAIN PROCESS (Electron)                                     │
│                                                              │
│  n8nBridge.ts                                               │
│  ├─ ipcMain.handle('n8n:execute')                          │
│  └─ ipcMain.handle('n8n:health')                           │
│                                                              │
│  n8nService.ts                                              │
│  ├─ executeN8nWorkflow()                                    │
│  └─ checkN8nHealth()                                        │
│                                                              │
│  Appelle: http://localhost:3458/api/n8n/execute            │
└─────────────────────────────────────────────────────────────┘
                          ↓ HTTP
┌─────────────────────────────────────────────────────────────┐
│ N8N BACKEND (Express Server - Port 3458)                    │
│                                                              │
│  n8n-server.ts                                              │
│  ├─ POST /api/n8n/execute                                   │
│  ├─ GET /health                                             │
│  └─ normalizeN8nResponse()                                  │
│                                                              │
│  Appelle: http://localhost:5678/webhook/template           │
└─────────────────────────────────────────────────────────────┘
                          ↓ HTTP
┌─────────────────────────────────────────────────────────────┐
│ N8N WORKFLOW (Local n8n instance - Port 5678)               │
│                                                              │
│  Webhook: /webhook/template                                 │
│  ├─ Traite la requête                                       │
│  ├─ Exécute le workflow                                     │
│  └─ Retourne JSON structuré                                 │
└─────────────────────────────────────────────────────────────┘
```

## Fichiers créés

### Backend (Main Process)
- `src/process/services/n8nService.ts` - Service n8n avec executeN8nWorkflow()
- `src/process/bridge/n8nBridge.ts` - IPC handlers pour n8n
- `src/process/bridge/index.ts` - Ajout de initN8nBridge()

### Frontend (Renderer Process)
- `src/renderer/pages/n8n-workflow/N8nWorkflowPage.tsx` - Page UI standalone
- `src/renderer/router.tsx` - Route `/n8n-workflow`
- `src/common/ipcBridge.ts` - Export `n8n.execute` et `n8n.health`

### Microservice Backend (Standalone)
- `src/agent/n8n/n8n-server.ts` - Serveur Express (port 3458)
- `src/agent/n8n/n8nResponseParser.ts` - Parser de réponses
- `scripts/start-n8n-agent.ps1` - Script de démarrage

## Flux de données

1. **User Input** → N8nWorkflowPage
2. **IPC Call** → `n8n.execute.invoke({ userMessage })`
3. **Main Process** → n8nService.executeN8nWorkflow()
4. **HTTP POST** → http://localhost:3458/api/n8n/execute
5. **Backend** → n8n-server.ts normalise et forward
6. **HTTP POST** → http://localhost:5678/webhook/template
7. **n8n** → Exécute le workflow
8. **Response** → JSON structuré
9. **Backend** → Normalise avec normalizeN8nResponse()
10. **Main Process** → Retourne via IPC
11. **Frontend** → Parse avec parseN8nResponse() et affiche en markdown

## Avantages de cette architecture

✅ **Pas d'agent IA** - Simple proxy HTTP, pas de système de conversation
✅ **IPC natif** - Communication Electron standard
✅ **Standalone UI** - Page dédiée, pas de mélange avec les conversations
✅ **Microservice pur** - Backend Express indépendant
✅ **Testable** - Chaque couche peut être testée séparément
✅ **Scalable** - Facile d'ajouter d'autres endpoints

## Utilisation

### 1. Démarrer le backend n8n
```bash
.\scripts\start-n8n-agent.ps1
```

### 2. Démarrer l'application
```bash
npm run start:mem
```

### 3. Accéder à la page n8n
- Dans l'application, naviguer vers `/n8n-workflow`
- Ou ajouter un lien dans le menu principal

### 4. Exécuter un workflow
1. Entrer un message (ex: "Generate a work program for cash inventory")
2. Cliquer sur "Execute Workflow"
3. Attendre la réponse (peut prendre plusieurs minutes)
4. Le résultat s'affiche en markdown formaté

## API IPC

### n8n.execute
```typescript
const response = await n8n.execute.invoke({
  userMessage: string,
  attachments?: any[]
});

// Response
{
  success: boolean,
  data?: any,
  error?: string,
  errorType?: string
}
```

### n8n.health
```typescript
const health = await n8n.health.invoke();

// Response
{
  status: string,
  available: boolean
}
```

## Configuration

### Endpoint n8n
Dans `src/agent/n8n/n8n-server.ts`:
```typescript
const N8N_ENDPOINT = 'http://localhost:5678/webhook/template';
```

### Backend URL
Dans `src/process/services/n8nService.ts`:
```typescript
const N8N_BACKEND_URL = 'http://localhost:3458/api/n8n/execute';
```

## Différences avec l'approche précédente

| Aspect | Avant (Preset) | Maintenant (Microservice) |
|--------|----------------|---------------------------|
| Architecture | Système de conversations | API directe via IPC |
| Agent IA | Utilisé (preset assistant) | Aucun |
| UI | Composant de chat | Page standalone |
| Historique | Sauvegardé en DB | Non sauvegardé |
| Complexité | Élevée | Faible |
| Performance | Overhead du système de conversations | Direct, rapide |

## Prochaines étapes

1. ✅ Ajouter un lien dans le menu principal vers `/n8n-workflow`
2. ✅ Tester l'intégration complète
3. ⏳ Ajouter des tests unitaires pour n8nService
4. ⏳ Ajouter un indicateur de santé du backend dans l'UI
5. ⏳ Permettre la configuration de l'endpoint via settings

## Notes

- Le backend n8n (port 3458) doit être démarré **avant** l'application
- L'instance n8n locale (port 5678) doit être active
- Aucune donnée n'est sauvegardée en base de données
- Pas de système de conversation, juste des appels API directs

---

**Architecture:** Microservice pure  
**Status:** ✅ Implémentée  
**Date:** 2025-03-11
