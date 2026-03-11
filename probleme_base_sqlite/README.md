# Problème Base de Données SQLite - AionUi

## 📋 Résumé du Problème

Lors du démarrage de l'application AionUi en mode développement, l'erreur suivante se produit de manière répétée :

```
Error: The module '\\?\G:\Aionui_client\node_modules\better-sqlite3\build\Release\better_sqlite3.node'
was compiled against a different Node.js version using
NODE_MODULE_VERSION 127. This version of Node.js requires
NODE_MODULE_VERSION 136. Please try re-compiling or re-installing
the module (for instance, using `npm rebuild` or `npm install`).
```

## 🔍 Analyse du Problème

### Cause Racine

Le module natif `better-sqlite3` a été compilé pour une version de Node.js différente de celle utilisée par Electron :

- **NODE_MODULE_VERSION 127** = Node.js v20.x (version avec laquelle le module a été compilé)
- **NODE_MODULE_VERSION 136** = Node.js v22.x (version utilisée par Electron 37)

### Contexte Technique

AionUi utilise :
- **Electron 37.3.1** qui embarque **Node.js v22.x**
- **better-sqlite3** : Module natif C++ qui nécessite une compilation spécifique pour chaque version de Node.js

Lorsque vous installez les dépendances avec `npm install`, les modules natifs peuvent être téléchargés en version précompilée pour Node.js standard, mais pas pour la version spécifique de Node.js embarquée dans Electron.

## ❌ Solutions Qui N'ONT PAS Fonctionné

### 1. npm rebuild (Échec)
```bash
npm rebuild better-sqlite3 --build-from-source
```
**Pourquoi ça échoue** : Recompile pour Node.js standard, pas pour Electron.

### 2. electron-rebuild seul (Échec partiel)
```bash
npx electron-rebuild -f -w better-sqlite3
```
**Pourquoi ça échoue** : Problème avec les dépendances Visual Studio (bibliothèques Spectre manquantes pour node-pty).

### 3. Suppression du dossier out/ seul (Échec)
```bash
Remove-Item -Recurse -Force out
```
**Pourquoi ça échoue** : Le module natif dans node_modules reste compilé pour la mauvaise version.

## ✅ Solution Qui Fonctionne

### Étape 1 : Utiliser electron-builder install-app-deps

Cette commande utilise `@electron/rebuild` pour recompiler tous les modules natifs spécifiquement pour Electron :

```bash
npx electron-builder install-app-deps
```

**Ce que fait cette commande** :
- Détecte automatiquement la version d'Electron dans package.json
- Recompile `better-sqlite3` pour Node.js v22 (Electron 37)
- Recompile `keytar` (autre module natif)
- Tente de recompiler `node-pty` (peut échouer mais n'est pas critique)

### Étape 2 : Nettoyer le cache de build

```bash
Remove-Item -Recurse -Force out -ErrorAction SilentlyContinue
```

### Étape 3 : Relancer l'application

```bash
npm start
# ou
.\start-dev.ps1
```

## 📝 Procédure Complète de Résolution

### Pour Windows (PowerShell)

```powershell
# 1. Arrêter l'application si elle tourne
# Ctrl+C dans le terminal

# 2. Nettoyer les builds précédents
Remove-Item -Recurse -Force out -ErrorAction SilentlyContinue

# 3. Supprimer le build du module natif
Remove-Item -Recurse -Force node_modules\better-sqlite3\build -ErrorAction SilentlyContinue

# 4. Recompiler les modules natifs pour Electron
npx electron-builder install-app-deps

# 5. Relancer l'application
.\start-dev.ps1
```

### Pour macOS/Linux (Bash)

```bash
# 1. Arrêter l'application si elle tourne
# Ctrl+C dans le terminal

# 2. Nettoyer les builds précédents
rm -rf out

# 3. Supprimer le build du module natif
rm -rf node_modules/better-sqlite3/build

# 4. Recompiler les modules natifs pour Electron
npx electron-builder install-app-deps

# 5. Relancer l'application
npm start
```

## 🔧 Script Automatisé de Résolution

Un script PowerShell a été créé pour automatiser la résolution :

**Fichier : `fix-sqlite.ps1`**

```powershell
Write-Host "Fixing SQLite native module for Electron..." -ForegroundColor Yellow

# Stop any running process
Write-Host "Step 1: Cleaning build directories..." -ForegroundColor Cyan
Remove-Item -Recurse -Force out -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\better-sqlite3\build -ErrorAction SilentlyContinue

# Rebuild native modules for Electron
Write-Host "Step 2: Rebuilding native modules for Electron..." -ForegroundColor Cyan
npx electron-builder install-app-deps

Write-Host "Step 3: Done! You can now run the application." -ForegroundColor Green
Write-Host "Run: .\start-dev.ps1" -ForegroundColor Green
```

## 🎯 Vérification de la Solution

Après avoir appliqué la solution, vérifiez que :

1. **Aucune erreur ERR_DLOPEN_FAILED** dans les logs
2. **Base de données initialisée** : Vous devriez voir dans les logs :
   ```
   [Database] Schema initialized successfully
   [Migrations] All migrations completed successfully
   ```
3. **Application fonctionnelle** : L'interface graphique s'ouvre sans erreur

## 📊 Logs de Succès

Quand la solution fonctionne, vous verrez :

```
[Database] Initializing database at: C:\Users\...\AionUi\aionui\aionui.db
[Database] Schema initialized successfully
[Migrations] Running 15 migrations from v0 to v15
[Migrations] All migrations completed successfully
[ConversationService] Created gemini conversation 4e6f2c16 with source=aionui
```

## ⚠️ Notes Importantes

### À propos de node-pty

L'erreur suivante peut apparaître mais n'est PAS critique :

```
error MSB8040: des bibliothèques avec atténuations de Spectre sont nécessaires
```

**Explication** : `node-pty` nécessite des bibliothèques Visual Studio spécifiques qui peuvent ne pas être installées. Cependant :
- `better-sqlite3` et `keytar` se compilent correctement
- L'application fonctionne sans `node-pty` recompilé
- `node-pty` est utilisé pour les terminaux intégrés (fonctionnalité optionnelle)

### Quand Réappliquer la Solution

Vous devrez réappliquer cette solution si :
- Vous supprimez `node_modules` et réinstallez (`npm install`)
- Vous changez de version d'Electron
- Vous clonez le projet sur une nouvelle machine
- Vous mettez à jour `better-sqlite3`

## 🔄 Prévention Future

### Option 1 : Script postinstall automatique

Le projet inclut déjà un script `scripts/postinstall.js` qui devrait gérer cela automatiquement. Si vous rencontrez le problème, c'est que le script a échoué.

### Option 2 : Ajouter un script npm

Ajoutez dans `package.json` :

```json
{
  "scripts": {
    "fix-native": "electron-builder install-app-deps",
    "clean": "rimraf out .vite",
    "fix-sqlite": "npm run clean && npm run fix-native"
  }
}
```

Puis utilisez :
```bash
npm run fix-sqlite
```

## 📚 Ressources Supplémentaires

- [Electron Documentation - Native Modules](https://www.electronjs.org/docs/latest/tutorial/using-native-node-modules)
- [better-sqlite3 Documentation](https://github.com/WiseLibs/better-sqlite3)
- [electron-builder Documentation](https://www.electron.build/)
- [Node.js ABI Versions](https://nodejs.org/en/download/releases/)

## 🆘 Support

Si le problème persiste après avoir appliqué cette solution :

1. Vérifiez votre version de Node.js : `node --version` (devrait être v22.x)
2. Vérifiez votre version d'Electron dans `package.json`
3. Assurez-vous d'avoir les outils de build installés :
   - Windows : Visual Studio Build Tools
   - macOS : Xcode Command Line Tools
   - Linux : build-essential

## 📅 Historique

- **2026-03-11** : Problème identifié et résolu pour AionUi v1.8.25 avec Electron 37.3.1
