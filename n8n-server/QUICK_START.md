# Guide de démarrage rapide - n8n

## 🚀 Démarrage en 5 minutes

### 1. Vérifications préalables
```bash
# Vérifier que n8n est installé
n8n --version

# Vérifier que Node.js est installé
node --version
```

### 2. Démarrer n8n
```bash
# Dans un terminal séparé
n8n start
```
➡️ n8n sera accessible sur http://localhost:5678

### 3. Configurer le workflow
1. Ouvrir http://localhost:5678 dans le navigateur
2. Créer ou importer le workflow "template"
3. **IMPORTANT**: Cliquer sur "Activate" pour publier le workflow
4. Vérifier que le webhook est sur `/webhook/template`

### 4. Démarrer l'application E-audit
```bash
# Dans le dossier du projet
npm run start:all
```

### 5. Test rapide
```bash
# Tester la connexion
node n8n-server/scripts/test-connection.js
```

## ✅ Vérification du bon fonctionnement

### Indicateurs de succès
- ✅ n8n accessible sur http://localhost:5678
- ✅ Backend accessible sur http://localhost:3458/health
- ✅ Workflow actif et publié
- ✅ Application E-audit démarrée
- ✅ Test de connexion réussi

### En cas de problème
```bash
# Diagnostic complet
node n8n-server/scripts/diagnose.js

# Consulter le guide de dépannage
# Voir: n8n-server/TROUBLESHOOTING.md
```

## 🔧 Configuration minimale

### Workflow n8n requis
- **Nom**: template (ou autre, mais adapter l'URL)
- **Trigger**: Webhook
- **URL**: `/webhook/template`
- **Méthode**: POST
- **Statut**: Actif et publié

### Ports utilisés
- **5678**: Serveur n8n
- **3458**: Backend n8n pour E-audit
- **5173**: Application E-audit (dev)

### Structure de requête
```json
{
  "question": "Votre message ici",
  "attachments": []
}
```

### Structure de réponse attendue
```json
[{
  "data": {
    "table1": {...},
    "table2": [...]
  }
}]
```

## 🆘 Aide rapide

### Commandes utiles
```bash
# Redémarrer tout
# Ctrl+C dans tous les terminaux, puis:
n8n start
npm run start:all

# Vérifier les processus
netstat -ano | findstr :5678
netstat -ano | findstr :3458

# Test minimal
curl http://localhost:5678
curl http://localhost:3458/health
```

### Erreurs courantes
1. **"Workflow non publié"** → Cliquer sur "Activate" dans n8n
2. **"Port déjà utilisé"** → Tuer le processus ou changer de port
3. **"n8n non démarré"** → Exécuter `n8n start`

### Ressources
- 📖 Documentation complète: `n8n-server/README.md`
- 🔧 Guide de dépannage: `n8n-server/TROUBLESHOOTING.md`
- 🛠️ Scripts de test: `n8n-server/scripts/`