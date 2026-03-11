# Guide de Migration du Microservice n8n

## 🎯 Objectif

Ce guide vous accompagne pas à pas pour migrer le microservice n8n vers un nouveau projet du même fork.

## ⏱️ Temps Estimé

- Installation de base: 15-30 minutes
- Configuration et tests: 15-30 minutes
- Intégration complète: 30-60 minutes

## 📋 Prérequis

### Logiciels Requis
- ✅ Node.js 18+ (pour fetch natif)
- ✅ npm ou yarn
- ✅ TypeScript 5+
- ✅ Git

### Connaissances Requises
- React/TypeScript
- Express.js
- Architecture microservices
- n8n (basique)

### Accès Nécessaires
- ✅ Workflow n8n actif avec webhook
- ✅ URL du webhook n8n
- ✅ Droits d'écriture sur le projet cible

## 📦 Étape 1: Préparation du Projet Cible

### 1.1 Vérifier la Structure du Projet

Assurez-vous que le projet cible a la structure suivante:

```
projet-cible/
├── src/
│   ├── agents/              # Doit exister
│   ├── renderer/
│   │   └── pages/
│   │       └── conversation/ # Doit exister
│   └── common/
├── scripts/                 # Doit exister
├── package.json
└── tsconfig.json
```

### 1.2 Vérifier les Dépendances Existantes

```bash
# Vérifier que ces packages sont installés
npm list express cors
npm list react react-dom
npm list @arco-design/web-react
```

Si manquants, installer:
```bash
npm install express cors
npm install @types/express @types/cors --save-dev
```

## 📂 Étape 2: Copie des Fichiers Backend

### 2.1 Créer la Structure Backend

```bash
# Créer le dossier n8n dans agents
mkdir -p src/agents/n8n
```

### 2.2 Copier les Fichiers Backend

Copier depuis le projet source vers le projet cible:

```
Source → Cible

src/agents/n8n/n8n-server.ts → src/agents/n8n/n8n-server.ts
src/agents/n8n/n8nResponseParser.ts → src/agents/n8n/n8nResponseParser.ts
```

### 2.3 Adapter les Imports Backend

Ouvrir `src/agents/n8n/n8n-server.ts` et vérifier:

```typescript
// ✅ Correct - fetch est global en Node.js 18+
// Pas besoin d'import

// ✅ Vérifier ces imports
import express from 'express';
import cors from 'cors';
```

### 2.4 Configurer l'Endpoint n8n

Dans `src/agents/n8n/n8n-server.ts`, modifier:

```typescript
// ⚠️ IMPORTANT: Remplacer par votre endpoint n8n
const N8N_ENDPOINT = 'https://VOTRE-INSTANCE.app.n8n.cloud/webhook/VOTRE-WEBHOOK';

// Optionnel: Ajuster le timeout si nécessaire
const N8N_TIMEOUT = 10 * 60 * 1000; // 10 minutes par défaut
```

## 🎨 Étape 3: Copie des Fichiers Frontend

### 3.1 Créer la Structure Frontend

```bash
# Créer le dossier n8n dans conversation
mkdir -p src/renderer/pages/conversation/n8n
```

### 3.2 Copier les Fichiers Frontend

```
Source → Cible

src/renderer/pages/conversation/n8n/N8nChat.tsx → src/renderer/pages/conversation/n8n/N8nChat.tsx
src/renderer/pages/conversation/n8n/N8nSendBox.tsx → src/renderer/pages/conversation/n8n/N8nSendBox.tsx
```

### 3.3 Adapter les Imports Frontend

Ouvrir `N8nChat.tsx` et vérifier les imports:

```typescript
// ⚠️ Adapter selon votre structure de projet
import MessageList from '@renderer/messages/MessageList';
import { MessageListProvider } from '@renderer/messages/hooks';
import HOC from '@renderer/utils/HOC';
import FlexFullContainer from '@renderer/components/FlexFullContainer';
import N8nSendBox from './N8nSendBox';
```

Ouvrir `N8nSendBox.tsx` et vérifier:

```typescript
// ⚠️ Adapter selon votre structure
import { uuid } from '@/common/utils';
import SendBox from '@/renderer/components/sendbox';
import DemarrerMenuButton from '@/renderer/components/DemarrerMenuButton';
import { useAddOrUpdateMessage } from '@/renderer/messages/hooks';
import { Message } from '@arco-design/web-react';
import { parseN8nResponse } from '@/agents/n8n/n8nResponseParser';
import type { TMessage } from '@/common/chatLib';
```

### 3.4 Vérifier le Backend URL

Dans `N8nSendBox.tsx`:

```typescript
// ✅ Vérifier que le port correspond au backend
const BACKEND_URL = 'http://localhost:3458/api/n8n/execute';
```

## 🔧 Étape 4: Scripts de Démarrage

### 4.1 Copier le Script PowerShell

```bash
# Copier le script de démarrage
cp scripts/start-n8n-agent.ps1 PROJET_CIBLE/scripts/start-n8n-agent.ps1
```

### 4.2 Vérifier le Script

Ouvrir `scripts/start-n8n-agent.ps1` et vérifier:

```powershell
# ✅ Vérifier le chemin vers le serveur
npx ts-node src/agents/n8n/n8n-server.ts

# ✅ Vérifier l'endpoint affiché
Write-Host "Endpoint: https://VOTRE-INSTANCE.app.n8n.cloud/webhook/VOTRE-WEBHOOK"
```

### 4.3 Tester le Script

```powershell
# Tester le démarrage du backend
.\scripts\start-n8n-agent.ps1

# Vous devriez voir:
# ========================================
#   n8n Backend Server
# ========================================
# 📡 Listening on http://localhost:3458
# ...
```

## 🔗 Étape 5: Intégration dans le Projet

### 5.1 Ajouter au Menu de Sélection

Ouvrir `src/common/presets/assistantPresets.ts` (ou équivalent):

```typescript
export const assistantPresets = [
  // ... autres presets
  {
    id: 'n8n-workflow',
    name: 'n8n Workflow',
    description: 'Exécution de workflows n8n pour génération de documents',
    icon: '🔄',
    component: 'N8nChat',
    path: '/conversation/n8n',
  },
];
```

### 5.2 Configurer le Routing

Ouvrir le fichier de routing principal (ex: `src/renderer/App.tsx` ou `src/renderer/routes.tsx`):

```typescript
import N8nChat from '@renderer/pages/conversation/n8n/N8nChat';

// Dans les routes
<Route 
  path="/conversation/n8n/:conversation_id" 
  element={<N8nChat conversation_id={conversation_id} />} 
/>
```

### 5.3 Ajouter au Script de Démarrage Global

Si vous avez un script de démarrage global (ex: `START_COMPLETE.ps1`):

```powershell
# Ajouter après les autres backends
Write-Host "3. Demarrage du backend n8n..." -ForegroundColor Yellow
Write-Host "   URL: http://localhost:3458" -ForegroundColor Gray

$n8nBackendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    .\scripts\start-n8n-agent.ps1
}

Write-Host "   OK Backend n8n demarre (Job ID: $($n8nBackendJob.Id))" -ForegroundColor Green
```

Et dans le cleanup:

```powershell
finally {
    # Arrêter le backend n8n
    Write-Host "  Arret n8n Backend..." -ForegroundColor Gray
    Stop-Job -Job $n8nBackendJob -ErrorAction SilentlyContinue
    Remove-Job -Job $n8nBackendJob -ErrorAction SilentlyContinue
}
```

## 🧪 Étape 6: Tests et Validation

### 6.1 Test du Backend Seul

```bash
# Terminal 1: Démarrer le backend
.\scripts\start-n8n-agent.ps1

# Terminal 2: Tester le health check
curl http://localhost:3458/health

# Résultat attendu:
# {
#   "status": "ok",
#   "service": "n8n-backend",
#   "port": 3458,
#   "endpoint": "https://..."
# }
```

### 6.2 Test d'Exécution Backend

```bash
# Tester une requête simple
curl -X POST http://localhost:3458/api/n8n/execute \
  -H "Content-Type: application/json" \
  -d '{"userMessage":"Test de connexion"}'

# Résultat attendu:
# {
#   "success": true,
#   "data": { ... }
# }
```

### 6.3 Test de l'Interface Complète

1. Démarrer le backend:
   ```bash
   .\scripts\start-n8n-agent.ps1
   ```

2. Démarrer l'application principale:
   ```bash
   npm start
   ```

3. Dans l'interface:
   - Sélectionner "n8n Workflow" dans le menu
   - Envoyer un message de test
   - Vérifier l'affichage de la réponse

### 6.4 Tests de Cas d'Usage

#### Test 1: Requête Simple
```
Message: "Bonjour"
Résultat attendu: Réponse du workflow n8n
```

#### Test 2: Requête Complexe
```
Message: "Génère un programme de travail pour l'inventaire de caisse"
Résultat attendu: Tableaux markdown formatés
```

#### Test 3: Gestion d'Erreur
```
1. Arrêter le backend
2. Envoyer un message
Résultat attendu: Message d'erreur avec instructions
```

#### Test 4: Timeout
```
Message: Requête très longue (>10 minutes)
Résultat attendu: Message de timeout avec suggestions
```

## 🔍 Étape 7: Vérifications Post-Migration

### 7.1 Checklist Technique

- [ ] Backend démarre sans erreur sur le port 3458
- [ ] Health check répond correctement
- [ ] Frontend affiche l'interface de chat
- [ ] Les messages s'envoient et s'affichent
- [ ] Les réponses n8n sont formatées en markdown
- [ ] Les tableaux s'affichent correctement
- [ ] Les erreurs sont gérées proprement
- [ ] Le timeout fonctionne (si applicable)

### 7.2 Checklist Fonctionnelle

- [ ] Le menu affiche "n8n Workflow"
- [ ] La sélection ouvre l'interface de chat
- [ ] Les messages utilisateur s'affichent à droite
- [ ] Les réponses assistant s'affichent à gauche
- [ ] Le placeholder de chargement s'affiche
- [ ] Les tableaux sont lisibles et bien formatés
- [ ] Les liens sont cliquables (si applicable)
- [ ] Les erreurs sont compréhensibles

### 7.3 Checklist Performance

- [ ] Le backend démarre en moins de 5 secondes
- [ ] Les requêtes simples répondent en moins de 30 secondes
- [ ] L'interface reste réactive pendant l'exécution
- [ ] Pas de fuite mémoire après plusieurs requêtes
- [ ] Les logs sont clairs et utiles

## 🐛 Étape 8: Résolution des Problèmes Courants

### Problème 1: Backend ne démarre pas

**Symptôme**: Erreur au démarrage du script

**Solutions**:
```bash
# Vérifier Node.js
node --version  # Doit être 18+

# Vérifier ts-node
npx ts-node --version

# Réinstaller les dépendances
npm install

# Vérifier le port
netstat -ano | findstr :3458  # Windows
lsof -i :3458  # Linux/Mac
```

### Problème 2: Erreur "Failed to fetch"

**Symptôme**: Erreur réseau dans le frontend

**Solutions**:
1. Vérifier que le backend est démarré
2. Vérifier l'URL dans `N8nSendBox.tsx`
3. Vérifier CORS dans `n8n-server.ts`
4. Tester avec curl

### Problème 3: Timeout

**Symptôme**: Requête dépasse 10 minutes

**Solutions**:
```typescript
// Dans n8n-server.ts, augmenter le timeout
const N8N_TIMEOUT = 20 * 60 * 1000; // 20 minutes
```

### Problème 4: Format de Réponse Non Reconnu

**Symptôme**: Affichage de "Format non reconnu"

**Solutions**:
1. Vérifier les logs du backend
2. Examiner la structure de la réponse n8n
3. Ajouter un nouveau format dans `normalizeN8nResponse`
4. Mettre à jour le parser si nécessaire

### Problème 5: Imports Non Résolus

**Symptôme**: Erreurs TypeScript sur les imports

**Solutions**:
```typescript
// Vérifier tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@renderer/*": ["src/renderer/*"],
      "@common/*": ["src/common/*"]
    }
  }
}
```

## 📊 Étape 9: Monitoring et Logs

### 9.1 Logs Backend

Le backend affiche automatiquement:
```
📥 Received request: { userMessage: "...", attachments: 0 }
🔄 Calling n8n endpoint: https://...
📡 Response status: 200 (5.23s)
✅ n8n response received
🔍 Normalizing n8n response...
✅ FORMAT 4: Programme de travail with data structure
```

### 9.2 Logs Frontend

Les erreurs s'affichent dans l'interface avec:
- Message d'erreur clair
- Type d'erreur (timeout, network, etc.)
- Suggestions de résolution

### 9.3 Monitoring Production

Pour un environnement de production, ajouter:
```typescript
// Dans n8n-server.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'n8n-backend.log' })
  ]
});
```

## 🚀 Étape 10: Déploiement

### 10.1 Configuration Environnement

Créer un fichier `.env`:
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
const N8N_TIMEOUT = parseInt(process.env.N8N_TIMEOUT || '600000');
```

### 10.2 Build Production

```bash
# Build de l'application
npm run build

# Ou avec Electron
npm run make
```

### 10.3 Documentation Utilisateur

Créer un fichier `UTILISATION_N8N.md`:
```markdown
# Utilisation du Workflow n8n

## Démarrage
1. Lancer l'application
2. Sélectionner "n8n Workflow" dans le menu

## Exemples de Requêtes
- "Génère un programme de travail pour l'inventaire"
- "Analyse les risques du processus de paie"
- etc.

## Résolution de Problèmes
- Si timeout: simplifier la requête
- Si erreur réseau: vérifier la connexion
```

## ✅ Checklist Finale de Migration

### Fichiers Copiés
- [ ] `src/agents/n8n/n8n-server.ts`
- [ ] `src/agents/n8n/n8nResponseParser.ts`
- [ ] `src/renderer/pages/conversation/n8n/N8nChat.tsx`
- [ ] `src/renderer/pages/conversation/n8n/N8nSendBox.tsx`
- [ ] `scripts/start-n8n-agent.ps1`

### Configuration
- [ ] Endpoint n8n configuré
- [ ] Port 3458 disponible
- [ ] Imports adaptés au projet
- [ ] Routes configurées
- [ ] Menu mis à jour

### Tests
- [ ] Backend démarre
- [ ] Health check OK
- [ ] Requête test OK
- [ ] Interface fonctionnelle
- [ ] Erreurs gérées

### Documentation
- [ ] README mis à jour
- [ ] Guide utilisateur créé
- [ ] Commentaires de code vérifiés

## 🎉 Félicitations !

Votre microservice n8n est maintenant migré et opérationnel !

## 📞 Support

En cas de problème:
1. Consulter les logs du backend
2. Vérifier la checklist de résolution
3. Examiner les fichiers sources commentés
4. Tester avec curl pour isoler le problème
