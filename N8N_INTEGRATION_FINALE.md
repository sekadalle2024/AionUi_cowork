# Intégration n8n - Résumé Complet

## ✅ Ce qui a été fait

### 1. Architecture mise en place
- **Backend n8n**: `src/agent/n8n/n8n-server.ts` (port 3458)
- **Agent Manager**: `src/process/task/N8nAgentManager.ts`
- **Service**: `src/process/services/n8nService.ts`
- **Types**: Ajout de 'n8n' dans tous les types TypeScript
- **Database**: Migration v16 pour supporter le type 'n8n'

### 2. Corrections apportées

#### Base de données
- ✅ Ajout de 'n8n' au schéma (`src/process/database/schema.ts`)
- ✅ Migration v16 créée (`src/process/database/migrations.ts`)
- ✅ `CURRENT_DB_VERSION` mis à jour à 16
- ✅ Fonction `rowToConversation` mise à jour (`src/process/database/types.ts`)

#### Frontend
- ✅ Agent n8n reconnu comme disponible (`useGuidAgentSelection.ts`)
- ✅ Création de conversation n8n (`useGuidSend.ts`)
- ✅ Type 'n8n' ajouté à `TChatConversation` (`src/common/storage.ts`)

#### Backend
- ✅ `createN8nAgent` fonction créée (`src/process/initAgent.ts`)
- ✅ Service de conversation mis à jour (`src/process/services/conversationService.ts`)
- ✅ Bridge n8n initialisé (`src/process/bridge/n8nConversationBridge.ts`)

## ⚠️ Problème actuel

### Symptôme
```
❌ Erreur: HTTP error! status: 500
```

### Cause
Le webhook n8n (`http://localhost:5678/webhook/template`) répond avec:
- Status: 200 OK ✅
- Body: VIDE ❌

### Test effectué
```powershell
.\test-n8n-webhook.ps1
# Résultat: Status 200, Response vide
```

## 🔧 Solution requise

### Le workflow n8n doit retourner des données

Le backend n8n attend l'un de ces formats:

#### Format 1: Array avec output (simple)
```json
[
  {
    "output": "Votre texte de réponse ici",
    "stats": {}
  }
]
```

#### Format 2: Object avec tables
```json
{
  "status": "success",
  "tables": [
    {
      "markdown": "# Votre contenu markdown"
    }
  ]
}
```

#### Format 3: Output direct
```json
{
  "output": "Votre texte de réponse"
}
```

#### Format 4: Programme de travail (structure complexe)
```json
[
  {
    "data": {
      "Etape mission - Programme": [
        {
          "En-tête": {
            "Etape": "Planification",
            "Reference": "REF-001"
          }
        },
        {
          "Controles": [
            {
              "N°": "1",
              "Controle": "Description",
              "Objectif": "Objectif"
            }
          ]
        }
      ]
    }
  }
]
```

### Configuration n8n requise

Dans votre workflow n8n:

1. **Webhook Node** doit avoir:
   - Method: POST
   - Path: `/webhook/template`
   - Response Mode: "Respond to Webhook"

2. **Respond to Webhook Node** doit:
   - Être connecté à la fin du workflow
   - Retourner les données dans l'un des formats ci-dessus
   - Avoir le Content-Type: `application/json`

3. **CORS Headers** (si nécessaire):
   ```
   Access-Control-Allow-Origin: *
   Access-Control-Allow-Methods: POST, OPTIONS
   Access-Control-Allow-Headers: Content-Type
   ```

## 📋 Checklist de vérification

### Workflow n8n
- [ ] Le workflow est activé dans n8n
- [ ] Le webhook path est `/webhook/template`
- [ ] Le workflow a un node "Respond to Webhook"
- [ ] Le node "Respond to Webhook" retourne des données JSON
- [ ] Le format de réponse correspond à l'un des 4 formats supportés

### Backend n8n (port 3458)
- [ ] Le serveur démarre sans erreur
- [ ] Les logs montrent: `🚀 n8n Backend Server`
- [ ] L'endpoint est: `http://localhost:3458/api/n8n/execute`
- [ ] Le health check répond: `http://localhost:3458/health`

### Application AionUi
- [ ] La migration v16 s'est exécutée avec succès
- [ ] L'agent n8n apparaît dans la liste des agents
- [ ] La conversation n8n se crée sans erreur de base de données
- [ ] Les logs montrent: `[ConversationService] Created n8n conversation`

## 🚀 Commandes de démarrage

### Option 1: Démarrage unifié
```bash
npm run start:all
```

### Option 2: Démarrage séparé

**Terminal 1** - Backend n8n:
```bash
npx ts-node --transpile-only src/agent/n8n/n8n-server.ts
```

**Terminal 2** - Application:
```bash
npm run start
```

## 🔍 Debugging

### Tester le webhook n8n directement
```powershell
.\test-n8n-webhook.ps1
```

### Vérifier les logs du backend n8n
Le backend affiche maintenant des logs détaillés:
```
📥 Received request: { userMessage: '...', attachments: 0 }
🔄 Calling n8n endpoint: http://localhost:5678/webhook/template
📡 Response status: 200 (X.XXs)
✅ n8n response received
🔍 Normalizing n8n response...
```

### Vérifier la base de données
```sql
SELECT type, COUNT(*) FROM conversations GROUP BY type;
-- Devrait montrer: n8n | X
```

## 📝 Prochaines étapes

1. **Configurer le workflow n8n** pour retourner des données
2. **Tester avec un message simple** comme "test"
3. **Vérifier les logs** du backend n8n pour voir la réponse
4. **Ajuster le format** si nécessaire

## 📚 Fichiers modifiés

### Database
- `src/process/database/schema.ts` - Ajout 'n8n' au CHECK constraint
- `src/process/database/migrations.ts` - Migration v16
- `src/process/database/types.ts` - rowToConversation avec cas 'n8n'

### Backend
- `src/process/initAgent.ts` - createN8nAgent()
- `src/process/services/conversationService.ts` - Cas 'n8n'
- `src/process/services/n8nService.ts` - Service HTTP
- `src/process/task/N8nAgentManager.ts` - Gestionnaire d'agent
- `src/process/bridge/n8nConversationBridge.ts` - Bridge IPC

### Frontend
- `src/renderer/pages/guid/hooks/useGuidAgentSelection.ts` - Disponibilité
- `src/renderer/pages/guid/hooks/useGuidSend.ts` - Création conversation
- `src/common/storage.ts` - Type TChatConversation

### Types
- `src/types/acpTypes.ts` - PresetAgentType avec 'n8n'
- `src/common/presets/assistantPresets.ts` - Preset "n8n Workflow"

## ✅ Tests réussis

- ✅ Migration v16 exécutée
- ✅ Conversation n8n créée dans la base de données
- ✅ Agent n8n reconnu comme disponible
- ✅ Message envoyé au backend n8n
- ✅ Backend n8n appelle le webhook n8n
- ⚠️ Webhook n8n répond mais sans données

## 🎯 Objectif final

Quand tout fonctionnera:
1. Utilisateur sélectionne l'agent n8n
2. Utilisateur envoie: `[Command] = Programme de travail [Processus] = inventaire de caisse`
3. Le workflow n8n génère un programme de travail
4. La réponse est affichée en Markdown formaté dans l'interface

---

**Status actuel**: Infrastructure complète ✅ | Configuration workflow n8n requise ⚠️
