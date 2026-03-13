# Documentation - Gestion des Logos dans E-audit

## Vue d'ensemble

Ce dossier documente les problèmes, solutions et bonnes pratiques pour l'intégration des logos dans l'application E-audit (Electron + Vite + React).

## Structure de la documentation

- **README.md** - Ce fichier (vue d'ensemble)
- **PROBLEME_AFFICHAGE.md** - Problème d'affichage du logo dans l'UI et sa résolution
- **BONNES_PRATIQUES.md** - Bonnes pratiques pour l'utilisation des assets
- **EMPLACEMENTS.md** - Où placer les logos dans l'application
- **ICONE_WINDOWS.md** - Configuration de l'icône Windows (.ico) pour la barre des tâches

## Contexte technique

- **Framework**: Electron 37 + electron-vite 5
- **Bundler**: Vite
- **UI**: React 19 + TypeScript 5.8
- **Styling**: UnoCSS 66 + Arco Design 2

## Problèmes résolus

### 1. Logo ne s'affichait pas dans l'UI

**Symptôme**: Icône d'image cassée au lieu du logo

**Cause**: Utilisation d'un chemin absolu `/logo.png` qui ne fonctionne pas avec Electron + Vite

**Solution**: Import ES6 depuis `src/renderer/assets/`

```tsx
// ❌ Ne fonctionne pas
<img src='/logo.png' />

// ✅ Fonctionne
import logoImage from '@renderer/assets/logo.png';
<img src={logoImage} />
```

**Documentation**: Voir `PROBLEME_AFFICHAGE.md`

### 2. Icône Windows dans la barre des tâches

**Symptôme**: L'ancien logo AionUi apparaît dans la barre des tâches Windows

**Cause**: Les fichiers d'icônes dans `resources/` n'ont pas été remplacés

**Solution**: Générer et remplacer les fichiers d'icônes:
- `resources/app.ico` - Icône Windows multi-résolution
- `resources/app.png` - Icône générale
- `resources/app_dev.png` - Icône développement
- `resources/app.icns` - Icône macOS

**Documentation**: Voir `ICONE_WINDOWS.md`

## Fichiers de logo disponibles

### Dans le code source

- `src/renderer/assets/logo.png` - Logo PNG (utilisé dans l'UI)
- `src/renderer/assets/logo.svg` - Logo SVG (vectoriel)

### Dans resources (icônes système)

- `resources/app.ico` - Icône Windows (barre des tâches)
- `resources/app.png` - Icône générale (512x512px)
- `resources/app_dev.png` - Icône développement
- `resources/app.icns` - Icône macOS (Dock)

### Anciens fichiers (non utilisés)

- `public/logo.png` - Non utilisé
- `public/logo.svg` - Non utilisé

## Emplacements actuels du logo

### Dans l'interface utilisateur

1. **Page d'accueil** - Logo 128x128px au-dessus du titre ✅
2. **Titlebar** - Logo 24x24px dans la barre de titre ✅
3. **Sidebar** - Logo 24x24px avant "E-audit" ✅

### Icônes système

4. **Barre des tâches Windows** - Icône depuis `resources/app.ico` ⚠️ À remplacer
5. **Tray icon** - Icône système depuis `resources/app.png` ⚠️ À remplacer
6. **Dock macOS** - Icône depuis `resources/app.icns` ⚠️ À remplacer

## Guide rapide

### Pour modifier le logo dans l'UI

1. Remplacer `src/renderer/assets/logo.png`
2. Utiliser l'import ES6 dans vos composants:
   ```tsx
   import logoImage from '@renderer/assets/logo.png';
   <img src={logoImage} alt='E-audit' />
   ```

### Pour modifier l'icône Windows/système

1. Préparer votre logo (PNG 512x512px minimum, fond transparent)
2. Générer les fichiers d'icônes (voir `ICONE_WINDOWS.md`)
3. Remplacer les fichiers dans `resources/`:
   - `app.ico` (Windows)
   - `app.png` (général)
   - `app_dev.png` (dev)
   - `app.icns` (macOS)
4. Rebuild l'application: `bun run build`
5. Vider le cache Windows si nécessaire

## Outils recommandés

### Génération d'icônes

- **En ligne**: https://icoconvert.com/ (PNG → ICO)
- **CLI**: ImageMagick, png2icons, electron-icon-maker

### Optimisation d'images

- **PNG**: pngquant, TinyPNG, ImageOptim
- **SVG**: SVGO

## Checklist complète

### Logo dans l'UI
- [x] Logo ajouté sur la page d'accueil
- [x] Logo ajouté dans la titlebar
- [x] Logo ajouté dans la sidebar
- [x] Import ES6 utilisé partout
- [x] Testé en dev et build

### Icônes système
- [ ] Logo source préparé (512x512px, transparent)
- [ ] `app.ico` généré (multi-résolution)
- [ ] `app.png` généré (512x512px)
- [ ] `app_dev.png` copié
- [ ] `app.icns` généré (macOS)
- [ ] Fichiers placés dans `resources/`
- [ ] Application rebuild
- [ ] Cache Windows vidé
- [ ] Testé sur Windows
- [ ] Testé sur macOS
- [ ] Testé sur Linux

## Prochaines étapes

1. **Générer les fichiers d'icônes système** (voir `ICONE_WINDOWS.md`)
2. **Remplacer les fichiers dans `resources/`**
3. **Tester sur toutes les plateformes**
4. **Mettre à jour les favicons** (si nécessaire)

## Support

Pour toute question ou problème:
1. Consulter la documentation dans ce dossier
2. Vérifier les logs de la console (F12)
3. Vérifier que les fichiers existent aux bons emplacements
4. Rebuild l'application après tout changement

