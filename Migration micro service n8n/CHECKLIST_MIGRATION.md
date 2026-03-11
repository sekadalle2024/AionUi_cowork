# Checklist de Migration - Microservice n8n

## ✅ Phase 1: Préparation (15 min)

### Vérifications Système
- [ ] Node.js version 18+ installé (`node --version`)
- [ ] npm ou yarn disponible (`npm --version`)
- [ ] TypeScript installé (`npx tsc --version`)
- [ ] Port 3458 disponible (`netstat -ano | findstr :3458`)

### Vérifications Projet
- [ ] Structure de dossiers existe:
  - [ ] `src/agents/`
  - [ ] `src/renderer/pages/conversation/`
  - [ ] `scripts/`
- [ ] `package.json` présent
- [ ] `tsconfig.json` configuré avec les alias de chemins

### Accès n8n
- [ ] Workflow n8n créé et actif
- [ ] URL du webhook n8n disponible
- [ ] Webhook testé avec curl

---

## ✅ Phase 2: Installation Backend (10 min)

### Copie des Fichiers
- [ ] Créer `src/agents/n8n/`
- [ ] Copier `n8n-server.ts` → `src/agents/n8n/n8n-server.ts`
- [ ] Copier `n8nResponseParser.ts` → `src/agents/n8n/n8nResponseParser.ts`

### Configuration Backend
- [ ] Ouvrir `src/agents/n8n/n8n-server.ts`
- [ ] Remplacer `N8N_ENDPOINT` par votre URL webhook
- [ ] Vérifier/ajuster `N8N_TIMEOUT` si nécessaire
- [ ] Vérifier/ajuster `PORT` si 3458 est occupé

### Installation Dépendances
- [ ] `npm install express cors`
- [ ] `npm install @types/express @types/cors ts-node --save-dev`

### Test Backend
- [ ] Copier `start-n8n-agent.ps1` → `scripts/start-n8n-agent.ps1`
- [ ] Exécuter `.\scripts\start-n8n-agent.ps1`
- [ ] Vérifier que le serveur démarre sans erreur
- [ ] Tester health check: `curl http://localhost:3458/health`
- [ ] Tester exécution: `curl -X POST http://localhost:3458/api/n8n/execute -H "Content-Type: application/json" -d '{"userMessage":"test"}'`

---

## ✅ Phase 3: Installation Frontend (15 min)

### Copie des Fichiers
- [ ] Créer `src/renderer/pages/conversation/n8n/`
- [ ] Copier `N8nChat.tsx` → `src/renderer/pages/conversation/n8n/N8nChat.tsx`
- [ ] Copier `N8nSendBox.tsx` → `src/renderer/pages/conversation/n8n/N8nSendBox.tsx`

### Adaptation des Imports
- [ ] Ouvrir `N8nChat.tsx`
- [ ] Vérifier tous les imports (MessageList, MessageListProvider, HOC, etc.)
- [ ] Adapter les chemins selon votre `tsconfig.json`
- [ ] Ouvrir `N8nSendBox.tsx`
- [ ] Vérifier tous les imports (uuid, SendBox, hooks, etc.)
- [ ] Adapter les chemins selon votre structure

### Vérification Dépendances Frontend
- [ ] `npm list react react-dom @arco-design/web-react`
- [ ] Installer si manquant

### Compilation TypeScript
- [ ] Exécuter `npx tsc --noEmit` pour vérifier les erreurs
- [ ] Corriger toutes les erreurs d'import
- [ ] Corriger toutes les erreurs de types

---

## ✅ Phase 4: Intégration (20 min)

### Configuration du Menu
- [ ] Ouvrir `src/common/presets/assistantPresets.ts` (ou équivalent)
- [ ] Ajouter l'entrée n8n:
```typescript
{
  id: 'n8n-workflow',
  name: 'n8n Workflow',
  description: 'Exécution de workflows n8n',
  icon: '🔄',
  component: 'N8nChat',
  path: '/conversation/n8n'
}
```

### Configuration du Routing
- [ ] Ouvrir le fichier de routing principal
- [ ] Importer `N8nChat`
- [ ] Ajouter la route:
```typescript
<Route 
  path="/conversation/n8n/:conversation_id" 
  element={<N8nChat conversation_id={conversation_id} />} 
/>
```

### Script de Démarrage Global (Optionnel)
- [ ] Ouvrir `START_COMPLETE.ps1` (si existe)
- [ ] Ajouter le démarrage du backend n8n
- [ ] Ajouter l'arrêt du backend n8n dans le cleanup

---

## ✅ Phase 5: Tests (20 min)

### Test Backend Isolé
- [ ] Backend démarre sans erreur
- [ ] Health check répond: `{"status":"ok",...}`
- [ ] Requête test retourne une réponse valide
- [ ] Logs affichent les emojis correctement (📥 🔄 📡 ✅)

### Test Frontend Isolé
- [ ] Application compile sans erreur
- [ ] Pas d'erreurs TypeScript
- [ ] Menu affiche "n8n Workflow"
- [ ] Clic sur le menu ouvre l'interface

### Test Intégration Complète
- [ ] Backend démarré
- [ ] Application démarrée
- [ ] Sélection "n8n Workflow" fonctionne
- [ ] Interface de chat s'affiche
- [ ] Envoi d'un message simple
- [ ] Message utilisateur s'affiche à droite
- [ ] Placeholder de chargement s'affiche
- [ ] Réponse s'affiche à gauche
- [ ] Format markdown correct

### Tests de Cas d'Usage
- [ ] **Test 1**: Message simple → Réponse texte
- [ ] **Test 2**: Requête complexe → Tableaux formatés
- [ ] **Test 3**: Backend arrêté → Message d'erreur clair
- [ ] **Test 4**: Requête longue → Timeout géré (si applicable)

### Tests de Format
- [ ] Format 1 (Array avec output) → Texte affiché
- [ ] Format 2 (Object avec tables) → Tableaux affichés
- [ ] Format 3 (Direct output) → Texte affiché
- [ ] Format 4 (Programme de travail) → Tableaux structurés

---

## ✅ Phase 6: Validation Finale (10 min)

### Checklist Technique
- [ ] Aucune erreur de compilation
- [ ] Aucune erreur TypeScript
- [ ] Aucune erreur dans la console navigateur
- [ ] Aucune erreur dans les logs backend
- [ ] Performance acceptable (<5s pour requêtes simples)

### Checklist Fonctionnelle
- [ ] Menu accessible
- [ ] Interface intuitive
- [ ] Messages bien formatés
- [ ] Erreurs compréhensibles
- [ ] Expérience utilisateur fluide

### Checklist Sécurité
- [ ] CORS configuré (permissif en dev, restrictif en prod)
- [ ] Validation des entrées backend
- [ ] Timeout configuré
- [ ] Pas de données sensibles dans les logs

### Checklist Documentation
- [ ] README mis à jour avec instructions n8n
- [ ] Commentaires de code présents
- [ ] Guide utilisateur créé (optionnel)
- [ ] Points d'attention documentés

---

## ✅ Phase 7: Déploiement (Optionnel)

### Configuration Production
- [ ] Créer `.env` avec les variables
- [ ] Configurer CORS restrictif
- [ ] Ajouter logging avec winston
- [ ] Configurer monitoring

### Build Production
- [ ] `npm run build` réussit
- [ ] Application packagée fonctionne
- [ ] Backend inclus dans le build

### Tests Production
- [ ] Application déployée démarre
- [ ] Backend accessible
- [ ] Fonctionnalités opérationnelles
- [ ] Performance acceptable

---

## 📊 Résumé de Progression

| Phase | Temps Estimé | Statut |
|-------|--------------|--------|
| 1. Préparation | 15 min | ⬜ |
| 2. Backend | 10 min | ⬜ |
| 3. Frontend | 15 min | ⬜ |
| 4. Intégration | 20 min | ⬜ |
| 5. Tests | 20 min | ⬜ |
| 6. Validation | 10 min | ⬜ |
| 7. Déploiement | Variable | ⬜ |
| **TOTAL** | **1h30** | **⬜** |

---

## 🚨 Points Critiques à Ne Pas Oublier

1. ⚠️ **Endpoint n8n** - DOIT être configuré dans `n8n-server.ts`
2. ⚠️ **Port 3458** - DOIT être libre ou changé partout
3. ⚠️ **Node.js 18+** - OBLIGATOIRE pour fetch natif
4. ⚠️ **Imports** - DOIVENT être adaptés à votre structure
5. ⚠️ **TypeScript** - DOIT compiler sans erreur

---

## 📞 En Cas de Problème

### Backend ne démarre pas
1. Vérifier Node.js version
2. Vérifier port disponible
3. Vérifier dépendances installées
4. Consulter `POINTS_ATTENTION.md`

### Erreurs TypeScript
1. Vérifier `tsconfig.json`
2. Adapter les imports
3. Installer les types manquants
4. Consulter `GUIDE_MIGRATION.md`

### Erreur "Failed to fetch"
1. Vérifier backend démarré
2. Vérifier URL dans `N8nSendBox.tsx`
3. Vérifier CORS
4. Tester avec curl

### Format non reconnu
1. Examiner logs backend
2. Vérifier structure réponse n8n
3. Ajouter nouveau format si nécessaire
4. Consulter `ARCHITECTURE.md`

---

## ✅ Migration Terminée !

Une fois toutes les cases cochées, votre microservice n8n est opérationnel !

Pour toute question, consultez:
- `README.md` - Vue d'ensemble
- `ARCHITECTURE.md` - Détails techniques
- `GUIDE_MIGRATION.md` - Guide détaillé
- `POINTS_ATTENTION.md` - Points critiques
