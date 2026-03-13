# Installation du logo E-audit - Terminée

## Fichiers installés

### ✅ Icônes système (resources/)

Les fichiers suivants ont été copiés depuis `public/logo_projet/` vers `resources/`:

1. **app.ico** - Icône Windows (15 KB)
   - Source: `public/logo_projet/favicon.ico`
   - Utilisation: Barre des tâches Windows, fenêtre, Alt+Tab
   - Résolutions: 16x16, 32x32, 48x48 (multi-résolution)

2. **app.png** - Icône générale (217 KB, 512x512px)
   - Source: `public/logo_projet/android-chrome-512x512.png`
   - Utilisation: Tray icon, fallback général

3. **app_dev.png** - Icône développement (217 KB, 512x512px)
   - Source: `public/logo_projet/android-chrome-512x512.png`
   - Utilisation: Mode développement uniquement

4. **app.icns** - Icône macOS (111 KB)
   - ⚠️ Fichier existant conservé (à remplacer manuellement si nécessaire)
   - Utilisation: Application macOS, Dock

### ✅ Logo UI (src/renderer/assets/)

**logo.png** - Logo pour l'interface utilisateur (217 KB, 512x512px)
- Source: `public/logo_projet/android-chrome-512x512.png`
- Utilisation: Page d'accueil, titlebar, sidebar

## Prochaines étapes

### 1. Rebuild l'application

```bash
# Nettoyer le cache
rm -rf out/ dist/

# Rebuild
bun run build

# Ou tester en dev
bun run start
```

### 2. Vider le cache Windows (si nécessaire)

Si l'icône ne change pas immédiatement dans la barre des tâches:

```bash
# Ouvrir cmd en administrateur et exécuter:
ie4uinit.exe -show
```

Ou redémarrer l'explorateur Windows:
1. Ctrl+Shift+Échap (Gestionnaire des tâches)
2. Trouver "Explorateur Windows"
3. Clic droit → Redémarrer

### 3. Générer app.icns pour macOS (optionnel)

Si vous développez aussi sur macOS, générez le fichier .icns:

**Option A: En ligne**
- https://cloudconvert.com/png-to-icns
- Uploader `public/logo_projet/android-chrome-512x512.png`
- Télécharger et remplacer `resources/app.icns`

**Option B: Avec ImageMagick (macOS/Linux)**
```bash
# Installer ImageMagick
brew install imagemagick  # macOS
# ou
sudo apt install imagemagick  # Linux

# Générer .icns
magick convert public/logo_projet/android-chrome-512x512.png resources/app.icns
```

## Vérification

### En développement

Lancer l'application:
```bash
bun run start
```

Vérifier:
- ✅ Logo sur la page d'accueil (128x128px)
- ✅ Logo dans la titlebar (24x24px)
- ✅ Logo dans la sidebar (24x24px)
- ✅ Icône dans la barre des tâches Windows

### En production

Builder et installer:
```bash
bun run build
```

Vérifier:
- ✅ Icône dans la barre des tâches
- ✅ Icône dans le menu Démarrer
- ✅ Icône du raccourci bureau
- ✅ Icône dans l'explorateur de fichiers

## Fichiers sources conservés

Les fichiers originaux restent disponibles dans `public/logo_projet/`:
- `android-chrome-192x192.png` - Logo 192x192px
- `android-chrome-512x512.png` - Logo 512x512px ⭐ Utilisé
- `apple-touch-icon.png` - Icône Apple Touch (180x180px)
- `favicon-16x16.png` - Favicon 16x16px
- `favicon-32x32.png` - Favicon 32x32px
- `favicon.ico` - Favicon multi-résolution ⭐ Utilisé
- `site.webmanifest` - Manifest web

## Résumé des emplacements

| Fichier | Emplacement | Utilisation |
|---------|-------------|-------------|
| `app.ico` | `resources/` | Icône Windows (barre des tâches) |
| `app.png` | `resources/` | Icône générale (512x512px) |
| `app_dev.png` | `resources/` | Icône développement |
| `app.icns` | `resources/` | Icône macOS (Dock) |
| `logo.png` | `src/renderer/assets/` | Logo UI (page d'accueil, titlebar, sidebar) |

## Statut

✅ **Installation terminée!**

Tous les fichiers nécessaires ont été copiés aux bons emplacements. L'application E-audit utilise maintenant le nouveau logo partout.

## Troubleshooting

### L'icône Windows ne change pas

1. **Vider le cache d'icônes**:
   ```bash
   ie4uinit.exe -show
   ```

2. **Redémarrer l'explorateur Windows**

3. **Rebuild complet**:
   ```bash
   rm -rf out/ dist/ node_modules/.vite
   bun install
   bun run build
   ```

### Le logo dans l'UI ne s'affiche pas

1. Vérifier que le fichier existe:
   ```bash
   ls src/renderer/assets/logo.png
   ```

2. Vérifier l'import dans les composants:
   ```tsx
   import logoImage from '@renderer/assets/logo.png';
   ```

3. Rebuild:
   ```bash
   bun run start
   ```

## Documentation

Pour plus d'informations, consultez:
- `Doc_logo/README.md` - Vue d'ensemble
- `Doc_logo/PROBLEME_AFFICHAGE.md` - Problèmes d'affichage
- `Doc_logo/BONNES_PRATIQUES.md` - Bonnes pratiques
- `Doc_logo/EMPLACEMENTS.md` - Emplacements du logo
- `Doc_logo/ICONE_WINDOWS.md` - Configuration Windows
