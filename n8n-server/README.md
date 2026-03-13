# Serveur n8n - Documentation de Maintenance

## 📋 Vue d'ensemble

Ce dossier contient tous les outils, scripts et documentation nécessaires pour maintenir et dépanner le serveur n8n backend utilisé par E-audit.

## 🏗️ Architecture

```
E-audit Application (Electron)
    ↓
Backend n8n (Express - Port 3458)
    ↓
n8n Workflow (Port 5678)
    ↓
Claude API / Autres services
```

## 🚀 Démarrage rapide

### Démarrer tous les services
```bash
npm run start:all
```

Cette commande démarre:
1. Le serveur n8n backend (port 3458)
2. L'application E-audit (Electron)

### Démarrer uniquement le backend n8n
```bash
node src/agent/n8n/n8n-server.ts
```

## 🔧 Scripts de maintenance

### 1. Test de connexion
```bash
node n8n-server/scripts/test-connection.js
```
Vérifie que le backend répond correctement.

### 2. Diagnostic complet
```bash
node n8n-server/scripts/diagnose.js
```
Effectue un diagnostic complet de tous les services.

### 3. Test du workflow n8n
```bash
node n8n-server/scripts/test-workflow.js
```
Teste directement le webhook n8n.

## ⚠️ Problèmes courants et solutions

### Erreur 500: Internal Server Error

**Symptôme**: L'application affiche "HTTP error! status: 500"

**Causes possibles**:
1. ✅ **Workflow n8n non publié** (CAUSE LA PLUS FRÉQUENTE)
   - Solution: Ouvrir n8n (http://localhost:5678), activer et PUBLIER le workflow
   - Vérifier que le workflow est en mode "Active"

2. Le serveur n8n (port 5678) n'est pas démarré
   - Solution: `n8n start`

3. L'URL du webhook est incorrecte
   - Vérifier dans n8n-server.ts: `N8N_ENDPOINT = 'http://localhost:5678/webhook/template'`

4. Le workflow n8n a une erreur interne
   - Consulter les logs n8n pour identifier l'erreur

### Erreur: Network error

**Symptôme**: "Unable to connect to n8n endpoint"

**Solution**:
1. Vérifier que le backend est démarré: `curl http://localhost:3458/health`
2. Vérifier que n8n est démarré: `curl http://localhost:5678`

### Timeout

**Symptôme**: "Request timeout (>600s)"

**Solution**:
1. Le workflow prend trop de temps
2. Augmenter le timeout dans `n8n-server.ts`: `N8N_TIMEOUT`
3. Optimiser le workflow n8n

## 📊 Endpoints du backend

### GET /health
Vérification de l'état du serveur
```bash
curl http://localhost:3458/health
```

### POST /api/n8n/execute
Exécution du workflow n8n
```bash
curl -X POST http://localhost:3458/api/n8n/execute \
  -H "Content-Type: application/json" \
  -d '{"userMessage": "Test", "attachments": []}'
```

## 🔍 Logs et débogage

### Logs du backend n8n
Les logs s'affichent dans la console où le backend est démarré.

Format des logs:
- 📥 Requête reçue
- 🔄 Appel à n8n
- 📡 Réponse de n8n
- ✅ Succès
- ❌ Erreur

### Logs de n8n
Accessible via l'interface n8n: http://localhost:5678

## 📝 Checklist de vérification

Avant de signaler un problème, vérifier:

- [ ] Le backend n8n est démarré (port 3458)
- [ ] Le serveur n8n est démarré (port 5678)
- [ ] Le workflow n8n est ACTIF
- [ ] Le workflow n8n est PUBLIÉ (très important!)
- [ ] L'URL du webhook est correcte
- [ ] Les logs ne montrent pas d'erreur évidente

## 🔄 Mise à jour du workflow n8n

**IMPORTANT**: Après toute modification du workflow n8n:

1. Sauvegarder les modifications
2. **PUBLIER le workflow** (bouton "Activate" en haut à droite)
3. Tester avec le script de diagnostic
4. Vérifier dans l'application E-audit

## 📞 Support

Pour toute question ou problème non résolu:
1. Consulter les logs du backend
2. Exécuter le script de diagnostic
3. Vérifier la checklist ci-dessus
4. Consulter la documentation n8n: https://docs.n8n.io

## 📚 Fichiers importants

- `src/agent/n8n/n8n-server.ts` - Code du serveur backend
- `src/agent/n8n/n8nResponseParser.ts` - Parser des réponses n8n
- `src/process/services/n8nService.ts` - Service n8n côté process
- `src/process/task/N8nAgentManager.ts` - Gestionnaire d'agent n8n
