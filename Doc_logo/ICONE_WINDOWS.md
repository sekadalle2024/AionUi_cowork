# Icône Windows - Configuration et génération

## Problème

L'icône dans la barre des tâches Windows affiche encore l'ancien logo AionUi au lieu du logo E-audit.

## Fichiers d'icônes nécessaires

Pour une application Electron sur Windows, vous avez besoin de:

### 1. `app.ico` - Icône Windows (multi-résolution)

**Emplacement**: `resources/app.ico`

**Format**: Fichier `.ico` contenant plusieurs résolutions:
- 16x16px (petite icône)
- 32x32px (icône normale)
- 48x48px (grande icône)
- 256x256px (haute résolution)

**Utilisation**:
- Barre des tâches Windows
- Coin supérieur gauche de la fenêtre
- Alt+Tab
- Explorateur de fichiers

### 2. `app.png` - Icône générale

**Emplacement**: `resources/app.png`

**Format**: PNG 512x512px ou 1024x1024px

**Utilisation**:
- Tray icon (icône système)
- Fallback pour autres plateformes

### 3. `app_dev.png` - Icône développement

**Emplacement**: `resources/app_dev.png`

**Format**: PNG avec padding (pour Linux)

**Utilisation**:
- Mode développement uniquement
- Permet de distinguer dev de production

### 4. `app.icns` - Icône macOS

**Emplacement**: `resources/app.icns`

**Format**: Fichier `.icns` (format macOS)

**Utilisation**:
- Application macOS
- Dock macOS

## Comment générer les fichiers d'icônes

### Option 1: Outils en ligne (Recommandé)

#### Pour .ico (Windows)

1. **icoconvert.com**
   - Aller sur https://icoconvert.com/
   - Uploader votre `logo.png` (minimum 256x256px)
   - Sélectionner les tailles: 16, 32, 48, 256
   - Télécharger le fichier `.ico`

2. **favicon.io**
   - Aller sur https://favicon.io/favicon-converter/
   - Uploader votre logo
   - Télécharger le pack d'icônes

3. **cloudconvert.com**
   - Aller sur https://cloudconvert.com/png-to-ico
   - Uploader votre logo
   - Convertir en .ico

#### Pour .icns (macOS)

1. **cloudconvert.com**
   - Aller sur https://cloudconvert.com/png-to-icns
   - Uploader votre logo
   - Convertir en .icns

### Option 2: Ligne de commande

#### Avec ImageMagick (Windows/Linux/macOS)

```bash
# Installer ImageMagick
# Windows: choco install imagemagick
# macOS: brew install imagemagick
# Linux: sudo apt install imagemagick

# Générer app.ico avec plusieurs résolutions
magick convert logo.png -define icon:auto-resize=256,48,32,16 app.ico

# Générer app.png (512x512)
magick convert logo.png -resize 512x512 app.png
```

#### Avec png2icons (Node.js)

```bash
# Installer
npm install -g png2icons

# Générer .ico
png2icons logo.png -icns -ico -output resources/

# Cela crée:
# - app.ico (Windows)
# - app.icns (macOS)
```

### Option 3: Electron Icon Maker

```bash
# Installer
npm install -g electron-icon-maker

# Générer toutes les icônes
electron-icon-maker --input=logo.png --output=resources/
```

## Étapes pour remplacer l'icône

### 1. Préparer votre logo

Votre logo doit être:
- Format: PNG
- Taille: Minimum 512x512px (recommandé 1024x1024px)
- Fond: Transparent ou couleur unie
- Qualité: Haute résolution

### 2. Générer les fichiers d'icônes

Utilisez une des méthodes ci-dessus pour générer:
- `app.ico` (Windows)
- `app.png` (512x512px)
- `app_dev.png` (copie de app.png)
- `app.icns` (macOS)

### 3. Remplacer les fichiers

```bash
# Sauvegarder les anciens fichiers
cd resources
mkdir backup
cp app.ico app.png app_dev.png app.icns backup/

# Copier les nouveaux fichiers
# (après les avoir générés)
cp /path/to/new/app.ico .
cp /path/to/new/app.png .
cp /path/to/new/app.png app_dev.png
cp /path/to/new/app.icns .
```

### 4. Vérifier les fichiers

```bash
# Vérifier que les fichiers existent
ls -lh resources/app.*

# Devrait afficher:
# app.ico
# app.png
# app_dev.png
# app.icns
```

### 5. Rebuild l'application

```bash
# Nettoyer le cache
rm -rf out/
rm -rf dist/

# Rebuild
bun run build

# Ou en dev
bun run start
```

## Configuration dans le code

L'icône est configurée dans `src/index.ts`:

```typescript
// Ligne ~410
const iconFile = process.platform === 'win32' ? 'app.ico' : 'app_dev.png';
const iconPath = path.join(process.cwd(), 'resources', iconFile);

// Ligne ~425
mainWindow = new BrowserWindow({
  // ...
  ...(devIcon && process.platform !== 'darwin' ? { icon: devIcon } : {}),
  // ...
});
```

**Note**: En production, l'icône est définie dans `forge.config.ts` via `packagerConfig.icon`.

## Vérification

### En développement

1. Lancer l'application: `bun run start`
2. Vérifier l'icône dans:
   - Barre des tâches Windows
   - Coin supérieur gauche de la fenêtre
   - Alt+Tab

### En production

1. Builder l'application: `bun run build`
2. Installer l'application
3. Vérifier l'icône dans:
   - Barre des tâches
   - Menu Démarrer
   - Raccourci bureau
   - Explorateur de fichiers

## Troubleshooting

### L'icône ne change pas

1. **Cache Windows**: Windows met en cache les icônes
   ```bash
   # Vider le cache d'icônes Windows
   # Ouvrir cmd en admin et exécuter:
   ie4uinit.exe -show
   ```

2. **Rebuild complet**:
   ```bash
   rm -rf out/ dist/ node_modules/.vite
   bun install
   bun run build
   ```

3. **Vérifier le fichier .ico**:
   - Ouvrir `resources/app.ico` dans un éditeur d'images
   - Vérifier qu'il contient plusieurs résolutions
   - Vérifier qu'il n'est pas corrompu

### L'icône est floue

- Votre logo source est trop petit
- Utilisez un logo minimum 512x512px
- Régénérez le .ico avec des résolutions plus élevées

### L'icône a un fond blanc

- Votre logo PNG n'a pas de transparence
- Utilisez un éditeur d'images pour rendre le fond transparent
- Régénérez les fichiers d'icônes

## Checklist

- [ ] Logo source préparé (PNG, 512x512px minimum, fond transparent)
- [ ] `app.ico` généré avec multi-résolutions (16, 32, 48, 256)
- [ ] `app.png` généré (512x512px)
- [ ] `app_dev.png` copié depuis app.png
- [ ] `app.icns` généré (pour macOS)
- [ ] Fichiers placés dans `resources/`
- [ ] Application rebuild
- [ ] Cache Windows vidé
- [ ] Icône vérifiée en dev
- [ ] Icône vérifiée en production

## Ressources

### Outils en ligne
- https://icoconvert.com/ - Convertir PNG vers ICO
- https://cloudconvert.com/ - Convertir vers ICO/ICNS
- https://favicon.io/ - Générateur d'icônes

### Outils CLI
- ImageMagick: https://imagemagick.org/
- png2icons: https://www.npmjs.com/package/png2icons
- electron-icon-maker: https://www.npmjs.com/package/electron-icon-maker

### Documentation
- Electron Icons: https://www.electronjs.org/docs/latest/tutorial/icons
- Windows ICO format: https://en.wikipedia.org/wiki/ICO_(file_format)
- macOS ICNS format: https://en.wikipedia.org/wiki/Apple_Icon_Image_format
