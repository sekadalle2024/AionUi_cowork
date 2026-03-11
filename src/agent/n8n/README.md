# Microservice n8n - AionUi

## 📋 Vue d'ensemble

Microservice backend permettant d'exécuter des workflows n8n et d'afficher les résultats dans une interface de chat moderne.

## 🏗️ Architecture

```
src/agent/n8n/
├── n8n-server.ts          # Serveur Express backend (port 3458)
├── n8nResponseParser.ts   # Parser de réponses n8n vers markdown
└── README.md              # Cette documentation

src/renderer/pages/conversation/n8n/
├── N8nChat.tsx            # Composant principal de chat
└── N8nSendBox.tsx         # Composant d'envoi de messages

scripts/
└── start-n8n-agent.ps1    # Script de démarrage du backend
```

## 🚀 Démarrage Rapide

### 1. Configuration de l'endpoint n8n

Éditez `src/agent/n8n/n8n-server.ts` ligne 13:

```typescript
const N8N_ENDPOINT = 'VOTRE_URL_N8N_ICI';
```

### 2. Démarrer le backend

```bash
# PowerShell
.\scripts\start-n8n-agent.ps1

# Ou directement
npx ts-node src/agent/n8n/n8n-server.ts
```

### 3. Tester le backend

```bash
# Health check
curl http://localhost:3458/health

# Test d'exécution
curl -X POST http://localhost:3458/api/n8n/execute \
  -H "Content-Type: application/json" \
  -d '{"userMessage":"Test de connexion"}'
```

## 📦 Dépendances

### Backend
- `express` - Serveur HTTP
- `cors` - Gestion CORS
- `ts-node` - Exécution TypeScript

### Frontend
- `react` - Interface utilisateur
- `react-markdown` - Affichage markdown
- `@arco-design/web-react` - Composants UI

Toutes les dépendances sont déjà présentes dans le projet AionUi.

## 🔧 Configuration

### Port
Par défaut: `3458`

Pour changer:
1. Modifier `PORT` dans `n8n-server.ts`
2. Modifier `BACKEND_URL` dans `N8nSendBox.tsx`

### Timeout
Par défaut: `10 minutes`

Pour changer:
```typescript
// Dans n8n-server.ts
const N8N_TIMEOUT = 20 * 60 * 1000; // 20 minutes
```

### Endpoint n8n
```typescript
// Dans n8n-server.ts
const N8N_ENDPOINT = 'http://localhost:5678/webhook/template';
```

Pour utiliser une instance cloud n8n:
```typescript
const N8N_ENDPOINT = 'https://votre-instance.app.n8n.cloud/webhook/votre-webhook';
```

## 📡 API Backend

### GET /health
Vérification de l'état du serveur

**Réponse:**
```json
{
  "status": "ok",
  "service": "n8n-backend",
  "port": 3458,
  "endpoint": "https://..."
}
```

### POST /api/n8n/execute
Exécution d'un workflow n8n

**Body:**
```json
{
  "userMessage": "Votre requête",
  "attachments": []  // Optionnel
}
```

**Réponse:**
```json
{
  "success": true,
  "data": {
    "type": "structured_data",
    "data": { ... },
    "metadata": { ... }
  }
}
```

## 🎨 Intégration Frontend

### Ajouter au routing

Dans `src/renderer/router.tsx`:

```typescript
import N8nChat from '@renderer/pages/conversation/n8n/N8nChat';

// Ajouter la route
<Route path="/conversation/n8n/:conversation_id" element={<N8nChat />} />
```

### Ajouter au menu

Dans `src/common/presets/assistantPresets.ts`:

```typescript
{
  id: 'n8n-workflow',
  name: 'n8n Workflow',
  description: 'Exécution de workflows n8n',
  icon: '🔄',
  component: 'N8nChat',
  path: '/conversation/n8n',
}
```

## 🔍 Formats de Réponse Supportés

Le parser supporte 4 formats de réponse n8n:

### FORMAT 1: Array avec output
```json
[{ "output": "texte", "stats": {...} }]
```

### FORMAT 2: Object avec tables
```json
{ "tables": [...], "status": "ok" }
```

### FORMAT 3: Direct output
```json
{ "output": "texte" }
```

### FORMAT 4: Programme de travail
```json
[{ "data": {...} }]
```

## 🐛 Résolution de Problèmes

### Backend ne démarre pas

**Vérifier Node.js:**
```bash
node --version  # Doit être 22+
```

**Vérifier le port:**
```bash
netstat -ano | findstr :3458  # Windows
lsof -i :3458                 # Linux/Mac
```

### Erreur "Failed to fetch"

1. Vérifier que le backend est démarré
2. Vérifier l'URL dans `N8nSendBox.tsx`
3. Tester avec curl

### Timeout

Augmenter `N8N_TIMEOUT` dans `n8n-server.ts`

### Format non reconnu

Ajouter un nouveau format dans `normalizeN8nResponse()` et `parseN8nResponse()`

## 📊 Logs

Le backend affiche des logs détaillés:

```
📥 Received request: { userMessage: "...", attachments: 0 }
🔄 Calling n8n endpoint: https://...
📡 Response status: 200 (5.23s)
✅ n8n response received
🔍 Normalizing n8n response...
✅ FORMAT 4: Programme de travail with data structure
```

## 🔒 Sécurité

### Production

Configurer CORS dans `n8n-server.ts`:

```typescript
app.use(cors({
  origin: ['http://localhost:3000', 'https://votre-domaine.com'],
  credentials: true
}));
```

### Variables d'environnement

Créer `.env`:

```env
N8N_ENDPOINT=https://votre-instance.app.n8n.cloud/webhook/integration
N8N_PORT=3458
N8N_TIMEOUT=600000
```

Charger dans `n8n-server.ts`:

```typescript
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.N8N_PORT || 3458;
const N8N_ENDPOINT = process.env.N8N_ENDPOINT;
```

## 📚 Documentation Complète

Pour plus de détails, consultez le dossier `Migration micro service n8n/`:

- `COMMENCEZ_ICI.md` - Guide de démarrage
- `ARCHITECTURE.md` - Architecture détaillée
- `GUIDE_MIGRATION.md` - Guide de migration complet
- `POINTS_ATTENTION.md` - Points critiques

## ✅ Checklist de Validation

- [ ] Backend démarre sans erreur
- [ ] Health check répond
- [ ] Endpoint n8n configuré
- [ ] Requête test fonctionne
- [ ] Interface affiche correctement
- [ ] Erreurs gérées proprement

## 🎉 Migration Réussie !

Le microservice n8n est maintenant intégré dans AionUi.

Pour démarrer:
1. `.\scripts\start-n8n-agent.ps1`
2. Lancer l'application AionUi
3. Sélectionner "n8n Workflow" dans le menu
4. Envoyer une requête de test

---

**Version:** 1.0  
**Projet:** AionUi  
**Date:** 2025
