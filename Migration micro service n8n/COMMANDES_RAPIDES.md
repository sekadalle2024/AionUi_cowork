# Commandes Rapides - Microservice n8n

## 🚀 Commandes Essentielles

### Vérifications Préalables

```powershell
# Vérifier Node.js (doit être ≥ 18)
node --version

# Vérifier npm
npm --version

# Vérifier TypeScript
npx tsc --version

# Vérifier si le port 3458 est libre
netstat -ano | findstr :3458
```

---

## 📦 Installation

### Dépendances Backend

```powershell
# Installation des dépendances de production
npm install express cors

# Installation des dépendances de développement
npm install @types/express @types/cors ts-node typescript --save-dev
```

### Dépendances Frontend (si nécessaire)

```powershell
# Installation des dépendances React
npm install react react-dom @arco-design/web-react react-markdown react-i18next

# Installation des types
npm install @types/react @types/react-dom --save-dev
```

### Vérification des Dépendances

```powershell
# Vérifier les dépendances installées
npm list express cors react @arco-design/web-react
```

---

## 🏗️ Création de la Structure

```powershell
# Créer les dossiers backend
mkdir -p src/agents/n8n

# Créer les dossiers frontend
mkdir -p src/renderer/pages/conversation/n8n

# Créer le dossier scripts (si n'existe pas)
mkdir -p scripts
```

---

## 🔧 Configuration

### Copier les Fichiers

```powershell
# Depuis le dossier "Migration micro service n8n"

# Backend
Copy-Item backend/n8n-server.ts src/agents/n8n/
Copy-Item backend/n8nResponseParser.ts src/agents/n8n/

# Frontend
Copy-Item frontend/N8nChat.tsx src/renderer/pages/conversation/n8n/
Copy-Item frontend/N8nSendBox.tsx src/renderer/pages/conversation/n8n/

# Scripts
Copy-Item scripts/start-n8n-agent.ps1 scripts/
```

---

## 🧪 Tests

### Test Backend Seul

```powershell
# Démarrer le backend
.\scripts\start-n8n-agent.ps1

# Dans un autre terminal:

# Test health check
curl http://localhost:3458/health

# Test exécution simple
curl -X POST http://localhost:3458/api/n8n/execute `
  -H "Content-Type: application/json" `
  -d '{"userMessage":"Test de connexion"}'

# Test avec Invoke-WebRequest (PowerShell natif)
Invoke-WebRequest -Uri "http://localhost:3458/health" -Method GET

# Test POST avec PowerShell
$body = @{
    userMessage = "Test de connexion"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3458/api/n8n/execute" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

### Test Endpoint n8n Direct

```powershell
# Tester l'endpoint n8n directement
curl -X POST https://VOTRE-ENDPOINT.app.n8n.cloud/webhook/integration `
  -H "Content-Type: application/json" `
  -d '{"question":"test"}'
```

### Test Compilation TypeScript

```powershell
# Vérifier les erreurs TypeScript sans compiler
npx tsc --noEmit

# Compiler le projet
npx tsc

# Vérifier un fichier spécifique
npx tsc src/agents/n8n/n8n-server.ts --noEmit
```

---

## 🚀 Démarrage

### Démarrage Manuel

```powershell
# Terminal 1: Backend n8n
.\scripts\start-n8n-agent.ps1

# Terminal 2: Application principale
npm start
```

### Démarrage Automatique (si START_COMPLETE.ps1 existe)

```powershell
# Démarre tous les backends + application
.\START_COMPLETE.ps1
```

### Démarrage en Arrière-Plan

```powershell
# Démarrer le backend en arrière-plan
$job = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    .\scripts\start-n8n-agent.ps1
}

# Vérifier le statut
Get-Job

# Voir les logs
Receive-Job -Job $job -Keep

# Arrêter le backend
Stop-Job -Job $job
Remove-Job -Job $job
```

---

## 🔍 Debugging

### Logs Backend

```powershell
# Les logs s'affichent automatiquement dans le terminal où le backend tourne
# Chercher les lignes avec ces emojis:
# 📥 = Requête reçue
# 🔄 = Appel n8n en cours
# 📡 = Réponse reçue
# ✅ = Succès
# ❌ = Erreur
```

### Logs Frontend

```powershell
# Ouvrir la console du navigateur
# F12 > Console
# Chercher les erreurs en rouge
```

### Vérifier les Processus

```powershell
# Voir les processus Node.js en cours
Get-Process node

# Voir quel processus utilise le port 3458
netstat -ano | findstr :3458

# Tuer un processus par PID
taskkill /PID <PID> /F
```

### Nettoyer les Processus

```powershell
# Arrêter tous les processus Node.js (⚠️ Attention!)
Get-Process node | Stop-Process -Force

# Arrêter uniquement le backend n8n (si vous connaissez le PID)
Stop-Process -Id <PID> -Force
```

---

## 🔧 Maintenance

### Mise à Jour des Dépendances

```powershell
# Vérifier les dépendances obsolètes
npm outdated

# Mettre à jour une dépendance spécifique
npm update express

# Mettre à jour toutes les dépendances (attention!)
npm update
```

### Nettoyage

```powershell
# Nettoyer node_modules et réinstaller
Remove-Item -Recurse -Force node_modules
npm install

# Nettoyer le cache npm
npm cache clean --force

# Nettoyer les fichiers de build
Remove-Item -Recurse -Force dist, build, .webpack
```

---

## 📊 Monitoring

### Surveiller les Logs en Temps Réel

```powershell
# Si vous utilisez un fichier de log
Get-Content n8n-backend.log -Wait -Tail 50

# Filtrer les erreurs
Get-Content n8n-backend.log -Wait | Select-String "ERROR|❌"
```

### Statistiques de Performance

```powershell
# Mesurer le temps de réponse
Measure-Command {
    Invoke-WebRequest -Uri "http://localhost:3458/health" -Method GET
}

# Test de charge simple (10 requêtes)
1..10 | ForEach-Object {
    $start = Get-Date
    Invoke-WebRequest -Uri "http://localhost:3458/health" -Method GET | Out-Null
    $end = Get-Date
    Write-Host "Requête $_ : $(($end - $start).TotalMilliseconds)ms"
}
```

---

## 🛠️ Résolution de Problèmes

### Problème: Port Occupé

```powershell
# Trouver le processus qui utilise le port 3458
netstat -ano | findstr :3458

# Tuer le processus (remplacer <PID> par le numéro)
taskkill /PID <PID> /F

# Ou changer le port dans n8n-server.ts et N8nSendBox.tsx
```

### Problème: Erreur "fetch is not defined"

```powershell
# Vérifier la version de Node.js
node --version

# Si < 18, mettre à jour Node.js
# Télécharger depuis https://nodejs.org/

# Ou installer node-fetch
npm install node-fetch@2
```

### Problème: Erreurs TypeScript

```powershell
# Vérifier la configuration TypeScript
cat tsconfig.json

# Vérifier les erreurs
npx tsc --noEmit

# Régénérer les types
npm install @types/node @types/express @types/cors --save-dev
```

### Problème: Module Non Trouvé

```powershell
# Réinstaller les dépendances
npm install

# Vérifier les alias de chemins dans tsconfig.json
cat tsconfig.json | Select-String "paths"

# Vérifier que le module existe
npm list <nom-du-module>
```

---

## 📦 Build et Déploiement

### Build de Développement

```powershell
# Build TypeScript
npx tsc

# Build avec webpack (si configuré)
npm run build
```

### Build de Production

```powershell
# Build optimisé
npm run build:prod

# Ou avec Electron
npm run make
```

### Package Electron

```powershell
# Créer un exécutable
npm run package

# Créer un installateur
npm run make

# Build pour Windows
npm run build-win
```

---

## 🔐 Sécurité

### Vérifier les Vulnérabilités

```powershell
# Audit de sécurité
npm audit

# Corriger automatiquement
npm audit fix

# Corriger avec breaking changes
npm audit fix --force
```

### Variables d'Environnement

```powershell
# Créer un fichier .env
@"
N8N_ENDPOINT=https://votre-instance.app.n8n.cloud/webhook/integration
N8N_PORT=3458
N8N_TIMEOUT=600000
"@ | Out-File -FilePath .env -Encoding UTF8

# Charger les variables (nécessite dotenv)
npm install dotenv
```

---

## 📝 Commandes Git

### Commit des Changements

```powershell
# Ajouter les nouveaux fichiers
git add src/agents/n8n/
git add src/renderer/pages/conversation/n8n/
git add scripts/start-n8n-agent.ps1

# Commit
git commit -m "feat: Add n8n microservice integration"

# Push
git push origin main
```

### Créer une Branche

```powershell
# Créer une branche pour la migration
git checkout -b feature/n8n-microservice

# Faire les modifications...

# Commit et push
git add .
git commit -m "feat: Migrate n8n microservice"
git push origin feature/n8n-microservice
```

---

## 🎯 Commandes Rapides par Scénario

### Scénario 1: Première Installation

```powershell
# 1. Vérifications
node --version
npm --version

# 2. Installation
npm install express cors
npm install @types/express @types/cors ts-node --save-dev

# 3. Création structure
mkdir -p src/agents/n8n
mkdir -p src/renderer/pages/conversation/n8n

# 4. Copie des fichiers (depuis dossier Migration)
# ... (voir section Copier les Fichiers)

# 5. Test
.\scripts\start-n8n-agent.ps1
```

### Scénario 2: Redémarrage Rapide

```powershell
# Arrêter les processus existants
Get-Process node | Stop-Process -Force

# Redémarrer
.\scripts\start-n8n-agent.ps1
```

### Scénario 3: Debug d'un Problème

```powershell
# 1. Vérifier le backend
curl http://localhost:3458/health

# 2. Vérifier les logs
# (dans le terminal du backend)

# 3. Tester l'endpoint n8n
curl -X POST https://VOTRE-ENDPOINT/webhook/integration -d '{"question":"test"}'

# 4. Vérifier TypeScript
npx tsc --noEmit
```

### Scénario 4: Mise à Jour

```powershell
# 1. Sauvegarder les modifications
git add .
git commit -m "backup: Save current state"

# 2. Copier les nouveaux fichiers
# ... (depuis dossier Migration)

# 3. Tester
.\scripts\start-n8n-agent.ps1

# 4. Valider
curl http://localhost:3458/health
```

---

## 📚 Aide-Mémoire

### Ports Utilisés
- **3456**: Backend Audit Interne
- **3457**: Backend NotebookLM
- **3458**: Backend n8n ← NOTRE MICROSERVICE

### Fichiers Clés
- `src/agents/n8n/n8n-server.ts` - Serveur backend
- `src/agents/n8n/n8nResponseParser.ts` - Parser de réponses
- `src/renderer/pages/conversation/n8n/N8nChat.tsx` - Interface chat
- `src/renderer/pages/conversation/n8n/N8nSendBox.tsx` - Composant envoi
- `scripts/start-n8n-agent.ps1` - Script de démarrage

### URLs Importantes
- Health check: `http://localhost:3458/health`
- API execute: `http://localhost:3458/api/n8n/execute`
- Endpoint n8n: `https://VOTRE-INSTANCE.app.n8n.cloud/webhook/integration`

---

## 🆘 Commandes d'Urgence

```powershell
# Tout arrêter
Get-Process node | Stop-Process -Force

# Tout nettoyer
Remove-Item -Recurse -Force node_modules
npm cache clean --force
npm install

# Redémarrer proprement
.\scripts\start-n8n-agent.ps1
```

---

**💡 Astuce**: Gardez ce fichier ouvert pendant la migration pour un accès rapide aux commandes !
