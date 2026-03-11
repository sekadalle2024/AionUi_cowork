# Configuration Complète - AionUi

## ✅ Modifications Effectuées

### 1. Configuration Mémoire (8GB)

Trois méthodes ont été créées pour lancer l'application avec 8GB de mémoire Node.js :

#### a) Script PowerShell : `start-dev.ps1`
```powershell
.\start-dev.ps1
```

#### b) Script Batch : `start-dev.bat`
```cmd
start-dev.bat
```

#### c) Commande npm : `npm run start:mem`
```bash
npm run start:mem
```

### 2. Désactivation du WebUI Automatique

L'application est maintenant configurée pour lancer uniquement le mode desktop par défaut.

#### Mode Desktop (Sans WebUI)
```bash
npm start
# ou avec mémoire augmentée
npm run start:mem
```

#### Mode WebUI (Quand nécessaire)
```bash
npm run webui              # WebUI local
npm run webui:remote       # WebUI avec accès distant
```

## 📁 Fichiers Créés

1. **start-dev.ps1** - Script PowerShell pour Windows
2. **start-dev.bat** - Script Batch pour Windows
3. **.env.local** - Configuration locale (ignoré par git)
4. **DEMARRAGE.md** - Guide de démarrage en français
5. **CONFIGURATION_COMPLETE.md** - Ce fichier

## 🔧 Modifications des Fichiers Existants

1. **package.json** - Ajout du script `start:mem`
2. **.gitignore** - Ajout de `.env.local` pour ignorer les configs locales

## 🚀 Utilisation Recommandée

### Pour le Développement Quotidien

```powershell
# Option 1 : Script PowerShell (Recommandé)
.\start-dev.ps1

# Option 2 : Commande npm
npm run start:mem
```

### Pour Tester le WebUI

```bash
npm run webui
```

## 📝 Notes Importantes

1. **Mémoire** : La configuration de 8GB est maintenant automatique avec les scripts fournis
2. **WebUI** : Ne se lance plus automatiquement, uniquement en mode desktop
3. **Configuration locale** : Le fichier `.env.local` n'est pas versionné (ignoré par git)
4. **Compatibilité** : Les scripts fonctionnent avec npm (pas besoin de Bun)

## 🔍 Vérification

Pour vérifier que tout fonctionne :

```bash
# 1. Vérifier Node.js version 22
node --version

# 2. Lancer l'application
.\start-dev.ps1

# 3. L'application desktop devrait se lancer sans WebUI
```

## 🆘 Dépannage

### Problème de Mémoire
Si vous voyez encore des erreurs de mémoire, vérifiez que vous utilisez bien les scripts fournis ou `npm run start:mem`.

### WebUI se Lance Quand Même
Vérifiez que vous n'utilisez pas `npm run webui` par erreur. Utilisez `npm start` ou `npm run start:mem`.

### Erreur de Permission PowerShell
Si le script PowerShell ne s'exécute pas :
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 📚 Documentation Complète

Consultez `DEMARRAGE.md` pour plus de détails sur toutes les options disponibles.
