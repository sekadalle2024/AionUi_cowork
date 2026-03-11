# Points d'Attention Critiques - Migration n8n

## ⚠️ Points Critiques à Ne Pas Manquer

### 1. 🔴 CRITIQUE: Configuration de l'Endpoint n8n

**Problème**: L'endpoint n8n est hardcodé dans le serveur backend.

**Localisation**: `src/agents/n8n/n8n-server.ts`

```typescript
// ⚠️ DOIT ÊTRE MODIFIÉ
const N8N_ENDPOINT = 'https://fetanif511.app.n8n.cloud/webhook/integration';
```

**Action Requise**:
1. Remplacer par votre propre endpoint n8n
2. Vérifier que le workflow est actif
3. Tester l'endpoint avec curl avant l'intégration

**Test de Validation**:
```bash
curl -X POST https://VOTRE-ENDPOINT \
  -H "Content-Type: application/json" \
  -d '{"question":"test"}'
```

**Conséquences si Oublié**:
- ❌ Toutes les requêtes échoueront
- ❌ Messages d'erreur "Failed to fetch"
- ❌ Timeout après 10 minutes

---

### 2. 🔴 CRITIQUE: Port 3458 Disponible

**Problème**: Le backend utilise le port 3458 qui peut être occupé.

**Localisation**: `src/agents/n8n/n8n-server.ts`

```typescript
const PORT = 3458;
```

**Vérification**:
```bash
# Windows
netstat -ano | findstr :3458

# Linux/Mac
lsof -i :3458
```

**Si le Port est Occupé**:

Option 1 - Libérer le port:
```bash
# Windows
taskkill /PID <PID> /F

# Linux/Mac
kill -9 <PID>
```

Option 2 - Changer le port:
```typescript
// Dans n8n-server.ts
const PORT = 3459; // Ou autre port libre

// Dans N8nSendBox.tsx
const BACKEND_URL = 'http://localhost:3459/api/n8n/execute';
```

**Conséquences si Oublié**:
- ❌ Backend ne démarre pas
- ❌ Erreur "EADDRINUSE"
- ❌ Frontend ne peut pas communiquer

---

### 3. 🟠 IMPORTANT: Imports et Chemins

**Problème**: Les imports utilisent des alias qui peuvent différer entre projets.

**Localisations Critiques**:

#### N8nChat.tsx
```typescript
// ⚠️ Vérifier ces imports
import MessageList from '@renderer/messages/MessageList';
import { MessageListProvider } from '@renderer/messages/hooks';
import HOC from '@renderer/utils/HOC';
import FlexFullContainer from '@renderer/components/FlexFullContainer';
```

#### N8nSendBox.tsx
```typescript
// ⚠️ Vérifier ces imports
import { uuid } from '@/common/utils';
import SendBox from '@/renderer/components/sendbox';
import DemarrerMenuButton from '@/renderer/components/DemarrerMenuButton';
import { useAddOrUpdateMessage } from '@/renderer/messages/hooks';
import { parseN8nResponse } from '@/agents/n8n/n8nResponseParser';
import type { TMessage } from '@/common/chatLib';
```

**Action Requise**:
1. Vérifier `tsconfig.json` pour les alias de chemins
2. Adapter les imports selon votre structure
3. Compiler pour détecter les erreurs

**Vérification tsconfig.json**:
```json
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

**Conséquences si Oublié**:
- ❌ Erreurs de compilation TypeScript
- ❌ "Cannot find module"
- ❌ Application ne build pas

---

### 4. 🟠 IMPORTANT: Dépendances NPM

**Problème**: Certaines dépendances peuvent manquer dans le projet cible.

**Dépendances Backend Requises**:
```json
{
  "dependencies": {
    "express": "^5.1.0",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "@types/express": "^4.17.x",
    "@types/cors": "^2.8.x",
    "ts-node": "^10.9.2"
  }
}
```

**Dépendances Frontend Requises**:
```json
{
  "dependencies": {
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "@arco-design/web-react": "^2.66.1",
    "react-markdown": "^10.1.0"
  }
}
```

**Vérification**:
```bash
npm list express cors react @arco-design/web-react
```

**Installation si Manquant**:
```bash
npm install express cors
npm install @types/express @types/cors ts-node --save-dev
```

**Conséquences si Oublié**:
- ❌ Erreurs de compilation
- ❌ Runtime errors
- ❌ Fonctionnalités manquantes

---

### 5. 🟡 ATTENTION: Node.js Version

**Problème**: Le code utilise `fetch` natif disponible uniquement en Node.js 18+.

**Localisation**: `src/agents/n8n/n8n-server.ts`

```typescript
// Utilise fetch global (Node.js 18+)
const response = await fetch(N8N_ENDPOINT, { ... });
```

**Vérification**:
```bash
node --version
# Doit afficher v18.x.x ou supérieur
```

**Si Version < 18**:

Option 1 - Mettre à jour Node.js (recommandé):
```bash
# Installer Node.js 18+ depuis nodejs.org
```

Option 2 - Utiliser node-fetch:
```bash
npm install node-fetch@2
```

```typescript
// Dans n8n-server.ts
import fetch from 'node-fetch';
```

**Conséquences si Oublié**:
- ❌ Erreur "fetch is not defined"
- ❌ Backend crash au démarrage
- ❌ Aucune requête ne fonctionne

---

### 6. 🟡 ATTENTION: Timeout Configuration

**Problème**: Le timeout par défaut est de 10 minutes, peut être insuffisant.

**Localisation**: `src/agents/n8n/n8n-server.ts`

```typescript
const N8N_TIMEOUT = 10 * 60 * 1000; // 10 minutes
```

**Quand Ajuster**:
- Workflows n8n très longs (>10 min)
- Traitement de gros volumes de données
- Appels API externes lents

**Ajustement**:
```typescript
// Pour 20 minutes
const N8N_TIMEOUT = 20 * 60 * 1000;

// Pour 30 minutes
const N8N_TIMEOUT = 30 * 60 * 1000;
```

**⚠️ Attention**: Un timeout trop long peut bloquer l'interface.

**Conséquences si Mal Configuré**:
- ❌ Timeout prématuré sur workflows longs
- ❌ Blocage de l'interface si trop long
- ❌ Mauvaise expérience utilisateur

---

### 7. 🟡 ATTENTION: Format de Réponse n8n

**Problème**: Le parser supporte 4 formats spécifiques. Un format différent peut ne pas être reconnu.

**Formats Supportés**:

```typescript
// FORMAT 1: Array avec output
[{ output: "texte", stats: {...} }]

// FORMAT 2: Object avec tables
{ tables: [...], status: "ok" }

// FORMAT 3: Direct output
{ output: "texte" }

// FORMAT 4: Programme de travail
[{ data: {...} }]
```

**Vérification**:
1. Tester votre workflow n8n
2. Examiner la structure de la réponse
3. Vérifier qu'elle correspond à un des 4 formats

**Si Format Différent**:

Ajouter un nouveau cas dans `normalizeN8nResponse`:
```typescript
// Dans n8n-server.ts
function normalizeN8nResponse(result: any): any {
  // ... formats existants ...
  
  // FORMAT 5: Votre nouveau format
  if (result && result.votreStructure) {
    return {
      type: 'votre_type',
      data: result.votreStructure,
      metadata: { format: 'votre_format' }
    };
  }
}
```

Et dans `n8nResponseParser.ts`:
```typescript
export function parseN8nResponse(data: any): string {
  switch (data.type) {
    // ... cas existants ...
    
    case 'votre_type':
      return convertVotreFormatToMarkdown(data.data);
  }
}
```

**Conséquences si Oublié**:
- ⚠️ Affichage "Format non reconnu"
- ⚠️ Données brutes en JSON
- ⚠️ Mauvaise présentation

---

### 8. 🟡 ATTENTION: CORS Configuration

**Problème**: CORS est activé pour toutes les origines (développement).

**Localisation**: `src/agents/n8n/n8n-server.ts`

```typescript
app.use(cors()); // ⚠️ Permissif
```

**Pour Production**:
```typescript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://votre-domaine.com'
  ],
  credentials: true
}));
```

**Conséquences si Oublié**:
- ⚠️ Risque de sécurité en production
- ⚠️ Accès non autorisé possible
- ⚠️ Vulnérabilité CSRF

---

### 9. 🔵 RECOMMANDÉ: Gestion des Erreurs

**Problème**: Les erreurs doivent être claires pour l'utilisateur.

**Bonnes Pratiques**:

```typescript
// Dans N8nSendBox.tsx
catch (error) {
  const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
  
  // Ajouter du contexte
  let troubleshooting = '';
  if (errorMessage.includes('timeout')) {
    troubleshooting = '\n\n**Solutions:**\n1. Augmentez le timeout\n2. Simplifiez la requête';
  }
  
  // Message complet
  addOrUpdateMessage({
    content: `❌ Erreur: ${errorMessage}${troubleshooting}`
  });
}
```

**Conséquences si Oublié**:
- ⚠️ Messages d'erreur cryptiques
- ⚠️ Utilisateurs perdus
- ⚠️ Support difficile

---

### 10. 🔵 RECOMMANDÉ: Logs et Monitoring

**Problème**: Sans logs, le debugging est difficile.

**Logs Essentiels**:

```typescript
// Dans n8n-server.ts
console.log('📥 Received request:', { userMessage, attachments });
console.log('🔄 Calling n8n endpoint:', N8N_ENDPOINT);
console.log('📡 Response status:', response.status);
console.log('✅ n8n response received');
```

**Pour Production**:
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'n8n-backend.log' }),
    new winston.transports.Console()
  ]
});

logger.info('Request received', { userMessage, attachments });
```

**Conséquences si Oublié**:
- ⚠️ Debugging difficile
- ⚠️ Problèmes non détectés
- ⚠️ Pas de traçabilité

---

## 📋 Checklist de Vérification Rapide

Avant de déployer, vérifier:

### Configuration
- [ ] Endpoint n8n configuré et testé
- [ ] Port 3458 disponible (ou changé)
- [ ] Node.js version 18+
- [ ] Toutes les dépendances installées

### Code
- [ ] Imports adaptés au projet
- [ ] Chemins TypeScript corrects
- [ ] Pas d'erreurs de compilation
- [ ] Types correctement définis

### Tests
- [ ] Backend démarre sans erreur
- [ ] Health check répond
- [ ] Requête test fonctionne
- [ ] Interface affiche correctement
- [ ] Erreurs gérées proprement

### Sécurité
- [ ] CORS configuré pour production
- [ ] Timeout approprié
- [ ] Validation des entrées
- [ ] Logs en place

### Documentation
- [ ] README mis à jour
- [ ] Commentaires de code clairs
- [ ] Guide utilisateur créé
- [ ] Procédure de déploiement documentée

---

## 🚨 Erreurs Fréquentes et Solutions

### Erreur: "fetch is not defined"
**Cause**: Node.js < 18
**Solution**: Mettre à jour Node.js ou utiliser node-fetch

### Erreur: "EADDRINUSE"
**Cause**: Port 3458 occupé
**Solution**: Libérer le port ou en changer

### Erreur: "Cannot find module"
**Cause**: Imports incorrects
**Solution**: Vérifier tsconfig.json et adapter les imports

### Erreur: "Failed to fetch"
**Cause**: Backend non démarré ou endpoint incorrect
**Solution**: Démarrer le backend et vérifier l'endpoint

### Erreur: "Request timeout"
**Cause**: Workflow n8n trop long
**Solution**: Augmenter N8N_TIMEOUT

### Erreur: "Format non reconnu"
**Cause**: Format de réponse n8n non supporté
**Solution**: Ajouter le format dans le parser

---

## 📞 Aide au Debugging

### Étape 1: Isoler le Problème

```bash
# Tester le backend seul
curl http://localhost:3458/health

# Tester l'endpoint n8n directement
curl -X POST https://VOTRE-ENDPOINT -d '{"question":"test"}'

# Tester la requête complète
curl -X POST http://localhost:3458/api/n8n/execute \
  -H "Content-Type: application/json" \
  -d '{"userMessage":"test"}'
```

### Étape 2: Examiner les Logs

```bash
# Logs du backend (dans le terminal où il tourne)
# Chercher les lignes avec 📥 🔄 📡 ✅ ❌

# Logs du frontend (console navigateur)
# F12 > Console
```

### Étape 3: Vérifier la Configuration

```typescript
// Dans n8n-server.ts
console.log('Configuration:', {
  PORT,
  N8N_ENDPOINT,
  N8N_TIMEOUT
});
```

### Étape 4: Tester Progressivement

1. Backend seul → OK ?
2. Endpoint n8n → OK ?
3. Requête backend → OK ?
4. Interface frontend → OK ?
5. Intégration complète → OK ?

---

## 🎯 Résumé des Points Critiques

| Priorité | Point | Impact si Oublié | Temps de Fix |
|----------|-------|------------------|--------------|
| 🔴 | Endpoint n8n | Bloquant | 2 min |
| 🔴 | Port 3458 | Bloquant | 5 min |
| 🟠 | Imports | Bloquant | 10-30 min |
| 🟠 | Dépendances | Bloquant | 5 min |
| 🟡 | Node.js 18+ | Bloquant | 10 min |
| 🟡 | Timeout | Gênant | 2 min |
| 🟡 | Format réponse | Gênant | 30-60 min |
| 🟡 | CORS | Risque sécurité | 5 min |
| 🔵 | Erreurs | UX dégradée | 15 min |
| 🔵 | Logs | Debug difficile | 10 min |

**Temps total de migration**: 1-2 heures avec tous les points d'attention traités.
