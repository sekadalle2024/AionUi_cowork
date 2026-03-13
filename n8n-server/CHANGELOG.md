# Changelog - Serveur n8n

## [1.0.0] - 2025-01-12

### ✨ Ajouté
- Création du dossier de maintenance n8n
- Documentation complète (README, TROUBLESHOOTING, MAINTENANCE)
- Scripts de diagnostic et de test
- Guide de dépannage pour les erreurs courantes
- Procédures de maintenance régulière

### 🔧 Configuré
- Backend n8n sur le port 3458
- Intégration avec l'application E-audit
- Parser de réponses n8n multi-format
- Gestion des timeouts et erreurs

### 📝 Documenté
- Architecture du système
- Procédures de dépannage
- Scripts de maintenance
- Bonnes pratiques de sécurité

## [0.9.0] - 2025-01-11

### 🐛 Corrigé
- **Problème majeur**: Workflow n8n non publié causant des erreurs 500
- Amélioration de la gestion d'erreurs
- Normalisation des réponses n8n

### 🔄 Modifié
- n8n défini comme assistant par défaut
- Interface utilisateur adaptée au style Claraverse
- Nom de l'application changé en "E-audit"

## [0.8.0] - 2025-01-10

### ✨ Ajouté
- Intégration initiale n8n
- Backend Express pour n8n
- Parser de réponses n8n
- Agent manager pour n8n

### 🔧 Configuré
- Endpoint `/api/n8n/execute`
- Webhook n8n sur `/webhook/template`
- Timeout de 10 minutes
- Support CORS

## Notes de version

### Problèmes résolus
1. **Erreur 500 récurrente**: Causée par des workflows n8n modifiés mais non publiés
2. **Timeouts**: Augmentation du timeout à 10 minutes pour les tâches complexes
3. **Format de réponse**: Support de 4 formats différents de réponses n8n

### Améliorations futures
- [ ] Cache des réponses n8n
- [ ] Retry automatique en cas d'échec
- [ ] Monitoring des performances
- [ ] Interface d'administration
- [ ] Sauvegarde automatique des workflows

### Migration depuis les versions précédentes
Aucune migration nécessaire. Le système est rétrocompatible.

### Dépendances
- Node.js 18+
- n8n installé et configuré
- Express.js
- Fetch API native

### Configuration requise
```javascript
// n8n-server.ts
const PORT = 3458;
const N8N_ENDPOINT = 'http://localhost:5678/webhook/template';
const N8N_TIMEOUT = 10 * 60 * 1000; // 10 minutes
```

### Tests
Tous les scripts de test sont disponibles dans `n8n-server/scripts/`:
- `test-connection.js` - Test de base
- `diagnose.js` - Diagnostic complet
- `test-workflow.js` - Test direct du workflow