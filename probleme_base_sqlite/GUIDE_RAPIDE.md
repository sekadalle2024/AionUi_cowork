# Guide Rapide - Résolution Problème SQLite

## 🚨 Symptôme

L'application affiche en boucle :
```
Error: The module 'better_sqlite3.node' was compiled against a different Node.js version
NODE_MODULE_VERSION 127 vs NODE_MODULE_VERSION 136
```

## ⚡ Solution Rapide (3 étapes)

### Windows

```powershell
# 1. Nettoyer
Remove-Item -Recurse -Force out, node_modules\better-sqlite3\build -ErrorAction SilentlyContinue

# 2. Recompiler pour Electron
npx electron-builder install-app-deps

# 3. Lancer
.\start-dev.ps1
```

### macOS/Linux

```bash
# 1. Nettoyer
rm -rf out node_modules/better-sqlite3/build

# 2. Recompiler pour Electron
npx electron-builder install-app-deps

# 3. Lancer
npm start
```

## 🎯 Script Automatique

Utilisez le script fourni :

```powershell
# Windows
.\probleme_base_sqlite\fix-sqlite.ps1

# macOS/Linux
chmod +x probleme_base_sqlite/fix-sqlite.sh
./probleme_base_sqlite/fix-sqlite.sh
```

## ✅ Vérification

Après la solution, vous devriez voir :
```
[Database] Schema initialized successfully
[Migrations] All migrations completed successfully
```

## 📝 Pourquoi ça arrive ?

- **better-sqlite3** est un module natif C++
- Il doit être compilé pour la version exacte de Node.js
- Electron 37 utilise Node.js v22 (MODULE_VERSION 136)
- npm install télécharge la version pour Node.js v20 (MODULE_VERSION 127)
- **Solution** : Recompiler spécifiquement pour Electron

## 🔄 Quand réappliquer ?

- Après `npm install`
- Après mise à jour d'Electron
- Sur une nouvelle machine
- Après suppression de `node_modules`

## 📚 Documentation Complète

Voir `README.md` dans ce dossier pour tous les détails.
