# Documentation - Gestion des Logos dans E-audit

## Vue d'ensemble

Ce dossier documente les problèmes, solutions et bonnes pratiques pour l'intégration des logos dans l'application E-audit (Electron + Vite + React).

## Structure de la documentation

- **PROBLEME_AFFICHAGE.md** - Problème d'affichage du logo et sa résolution
- **BONNES_PRATIQUES.md** - Bonnes pratiques pour l'utilisation des assets
- **EMPLACEMENTS.md** - Où placer les logos dans l'application

## Contexte technique

- **Framework**: Electron 37 + electron-vite 5
- **Bundler**: Vite
- **UI**: React 19 + TypeScript 5.8
- **Styling**: UnoCSS 66 + Arco Design 2

## Résumé du problème résolu

Le logo ne s'affichait pas lorsqu'on utilisait un chemin absolu `/logo.png` depuis le dossier `public/`. La solution a été d'importer le logo depuis `src/renderer/assets/` en utilisant les alias de chemin Vite.

## Fichiers de logo disponibles

- `src/renderer/assets/logo.png` - Logo PNG (recommandé)
- `src/renderer/assets/logo.svg` - Logo SVG (vectoriel)
- `public/logo.png` - Logo dans public (non utilisé)
- `public/logo.svg` - Logo dans public (non utilisé)

## Emplacements actuels du logo

1. **Page d'accueil** - Logo 128x128px au-dessus du titre
2. **Titlebar** - Logo 24x24px dans la barre de titre
3. **Sidebar** - Logo 24x24px avant "E-audit" (à implémenter)
