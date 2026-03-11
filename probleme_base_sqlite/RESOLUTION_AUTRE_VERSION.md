# Résolution pour Autre Version du Projet AionUi

## 📋 Contexte

Vous avez une autre installation du projet AionUi qui rencontre le même problème SQLite. Ce guide vous explique comment appliquer la solution rapidement.

## 🎯 Scénarios d'Utilisation

### Scénario 1 : Projet sur une Autre Machine

Vous avez cloné AionUi sur un autre ordinateur et rencontrez l'erreur SQLite.

### Scénario 2 : Projet dans un Autre Dossier

Vous avez plusieurs versions du projet (dev, test, prod) dans différents dossiers.

### Scénario 3 : Projet Après Mise à Jour

Vous avez mis à jour les dépendances et l'erreur SQLite est apparue.

## 🚀 Méthode 1 : Copier le Dossier de Solution

### Étape 1 : Copier le Dossier

```powershell
# Windows PowerShell
# Depuis le projet actuel (qui fonctionne)
Copy-Item -Recurse probleme_base_sqlite "C:\chemin\vers\autre\projet\"

# Exemple concret
Copy-Item -Recurse probleme_base_sqlite "D:\Projets\AionUi_Production\"
```

```bash
# macOS/Linux
# Depuis le projet actuel (qui fonctionne)
cp -r probleme_base_sqlite /chemin/vers/autre/projet/

# Exemple concret
cp -r probleme_base_sqlite ~/Projects/AionUi_Production/
```

### Étape 2 : Aller dans l'Autre Projet

```powershell
# Windows
cd "C:\chemin\vers\autre\projet"

# Exemple
cd "D:\Projets\AionUi_Production"
```

```bash
# macOS/Linux
cd /chemin/vers/autre/projet

# Exemple
cd ~/Projects/AionUi_Production
```

### Étape 3 : Exécuter le Script de Résolution

```powershell
# Windows
.\probleme_base_sqlite\fix-sqlite.ps1
```

```bash
# macOS/Linux
chmod +x probleme_base_sqlite/fix-sqlite.sh
./probleme_base_sqlite/fix-sqlite.sh
```

### Étape 4 : Lancer l'Application

```bash
npm start
# ou si vous avez le script start-dev
.\start-dev.ps1  # Windows
./start-dev.sh   # macOS/Linux
```

## 🔧 Méthode 2 : Commandes Manuelles

Si vous préférez ne pas copier le dossier, exécutez directement les commandes :

### Windows PowerShell

```powershell
# 1. Aller dans le projet problématique
cd "C:\chemin\vers\autre\projet"

# 2. Nettoyer
Remove-Item -Recurse -Force out -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\better-sqlite3\build -ErrorAction SilentlyContinue

# 3. Recompiler pour Electron
npx electron-builder install-app-deps

# 4. Lancer
npm start
```

### macOS/Linux

```bash
# 1. Aller dans le projet problématique
cd /chemin/vers/autre/projet

# 2. Nettoyer
rm -rf out
rm -rf node_modules/better-sqlite3/build

# 3. Recompiler pour Electron
npx electron-builder install-app-deps

# 4. Lancer
npm start
```

## 📦 Méthode 3 : Script Unique pour Tous les Projets

Créez un script global que vous pouvez utiliser depuis n'importe quel projet.

### Windows : Créer un Script Global

```powershell
# Créer le fichier dans un dossier accessible
New-Item -ItemType File -Path "$HOME\Scripts\fix-aionui-sqlite.ps1" -Force

# Contenu du script (copiez le contenu de fix-sqlite.ps1)
```

Puis utilisez-le depuis n'importe quel projet :

```powershell
cd "C:\chemin\vers\projet"
& "$HOME\Scripts\fix-aionui-sqlite.ps1"
```

### macOS/Linux : Créer un Script Global

```bash
# Créer le dossier de scripts
mkdir -p ~/bin

# Copier le script
cp probleme_base_sqlite/fix-sqlite.sh ~/bin/fix-aionui-sqlite

# Rendre exécutable
chmod +x ~/bin/fix-aionui-sqlite

# Ajouter au PATH (si pas déjà fait)
echo 'export PATH="$HOME/bin:$PATH"' >> ~/.bashrc  # ou ~/.zshrc
source ~/.bashrc  # ou source ~/.zshrc
```

Puis utilisez-le depuis n'importe quel projet :

```bash
cd /chemin/vers/projet
fix-aionui-sqlite
```

## 🔄 Cas Particuliers

### Cas 1 : Projet avec node_modules Existant

Si le projet a déjà `node_modules` installé :

```powershell
# Windows
cd "C:\chemin\vers\projet"
Remove-Item -Recurse -Force node_modules\better-sqlite3\build -ErrorAction SilentlyContinue
npx electron-builder install-app-deps
npm start
```

### Cas 2 : Projet Sans node_modules

Si le projet n'a pas encore `node_modules` :

```bash
# 1. Installer les dépendances
npm install

# 2. Appliquer la solution SQLite
npx electron-builder install-app-deps

# 3. Lancer
npm start
```

### Cas 3 : Projet Après git pull

Après avoir récupéré des modifications :

```bash
# 1. Mettre à jour les dépendances
npm install

# 2. Recompiler les modules natifs
npx electron-builder install-app-deps

# 3. Lancer
npm start
```

### Cas 4 : Plusieurs Projets à Corriger

Script pour corriger plusieurs projets d'un coup :

```powershell
# Windows PowerShell
$projects = @(
    "C:\Projets\AionUi_Dev",
    "C:\Projets\AionUi_Test",
    "D:\Backup\AionUi_Prod"
)

foreach ($project in $projects) {
    Write-Host "Fixing $project..." -ForegroundColor Yellow
    cd $project
    Remove-Item -Recurse -Force out, node_modules\better-sqlite3\build -ErrorAction SilentlyContinue
    npx electron-builder install-app-deps
    Write-Host "✓ $project fixed" -ForegroundColor Green
}
```

```bash
# macOS/Linux
projects=(
    "/Users/moi/Projects/AionUi_Dev"
    "/Users/moi/Projects/AionUi_Test"
    "/Volumes/Backup/AionUi_Prod"
)

for project in "${projects[@]}"; do
    echo "Fixing $project..."
    cd "$project"
    rm -rf out node_modules/better-sqlite3/build
    npx electron-builder install-app-deps
    echo "✓ $project fixed"
done
```

## ✅ Vérification de la Résolution

Après avoir appliqué la solution, vérifiez que :

### 1. Aucune Erreur au Démarrage

Les logs ne doivent PAS contenir :
```
Error: The module 'better_sqlite3.node' was compiled against a different Node.js version
NODE_MODULE_VERSION 127 vs NODE_MODULE_VERSION 136
```

### 2. Base de Données Initialisée

Les logs doivent contenir :
```
[Database] Schema initialized successfully
[Migrations] Running 15 migrations from v0 to v15
[Migrations] All migrations completed successfully
```

### 3. Application Fonctionnelle

- L'interface graphique s'ouvre
- Vous pouvez créer une conversation
- Les messages sont sauvegardés
- Aucune erreur dans la console

## 📊 Tableau de Comparaison des Méthodes

| Méthode | Avantages | Inconvénients | Recommandé Pour |
|---------|-----------|---------------|-----------------|
| **Copier le dossier** | Documentation complète disponible | Doit copier à chaque fois | Projets occasionnels |
| **Commandes manuelles** | Rapide, pas de fichiers supplémentaires | Doit retaper les commandes | Utilisateurs expérimentés |
| **Script global** | Utilisable partout, une seule fois | Configuration initiale | Développeurs avec plusieurs projets |
| **Script multi-projets** | Corrige tout d'un coup | Nécessite liste des projets | Maintenance de plusieurs versions |

## 🆘 Dépannage

### Problème : "npx: command not found"

**Solution** : Installez Node.js et npm
```bash
# Vérifier l'installation
node --version
npm --version
```

### Problème : "electron-builder: command not found"

**Solution** : Le package sera téléchargé automatiquement par npx. Assurez-vous d'avoir une connexion internet.

### Problème : Erreur de permissions (macOS/Linux)

**Solution** : Utilisez sudo si nécessaire
```bash
sudo npx electron-builder install-app-deps
```

### Problème : Le script ne s'exécute pas (Windows)

**Solution** : Autoriser l'exécution de scripts PowerShell
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Problème : node-pty échoue toujours

**Réponse** : C'est normal et non critique. Si `better-sqlite3` et `keytar` sont compilés avec succès, l'application fonctionnera.

## 📝 Checklist de Migration

Utilisez cette checklist pour chaque nouveau projet :

- [ ] Cloner ou copier le projet
- [ ] Installer les dépendances : `npm install`
- [ ] Copier le dossier `probleme_base_sqlite` (optionnel)
- [ ] Exécuter la résolution SQLite : `npx electron-builder install-app-deps`
- [ ] Vérifier qu'il n'y a pas d'erreur SQLite
- [ ] Tester le démarrage de l'application
- [ ] Créer une conversation de test
- [ ] Vérifier que les données sont sauvegardées

## 🔗 Ressources

- **Documentation complète** : `probleme_base_sqlite/README.md`
- **Guide rapide** : `probleme_base_sqlite/GUIDE_RAPIDE.md`
- **Erreur détaillée** : `probleme_base_sqlite/ERREUR_COMPLETE.txt`
- **Scripts automatiques** : 
  - Windows : `probleme_base_sqlite/fix-sqlite.ps1`
  - macOS/Linux : `probleme_base_sqlite/fix-sqlite.sh`

## 💡 Conseils

1. **Gardez une copie du dossier `probleme_base_sqlite`** dans un endroit accessible (Dropbox, Google Drive, etc.)

2. **Créez un alias** pour la commande de résolution :
   ```bash
   # Dans ~/.bashrc ou ~/.zshrc
   alias fix-aionui='npx electron-builder install-app-deps'
   ```

3. **Documentez dans votre README** que cette étape est nécessaire après `npm install`

4. **Ajoutez dans package.json** :
   ```json
   {
     "scripts": {
       "postinstall": "electron-builder install-app-deps",
       "fix-native": "electron-builder install-app-deps"
     }
   }
   ```

## 📅 Maintenance

Cette solution doit être réappliquée :
- ✅ Après chaque `npm install` (si postinstall échoue)
- ✅ Après mise à jour d'Electron
- ✅ Après mise à jour de better-sqlite3
- ✅ Sur chaque nouvelle machine
- ✅ Après suppression de `node_modules`

## 🎯 Résumé en Une Ligne

```bash
# La commande magique pour tous les projets AionUi
npx electron-builder install-app-deps
```

Cette commande résout le problème SQLite en recompilant les modules natifs pour la version exacte de Node.js utilisée par Electron.
