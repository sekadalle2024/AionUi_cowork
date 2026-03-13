# 📚 Documentation - Menu Contextuel AIONUI

**Date**: March 13, 2026  
**Version**: 1.0  
**Status**: ✅ Fonctionnel - Documentation Complète

## 📖 Vue d'Ensemble

Ce dossier contient la documentation complète du système de menu contextuel pour les tableaux dans AIONUI, migré depuis Claraverse menu.js V9.3.

## 📁 Structure de la Documentation

### 1. [ARCHITECTURE.md](./ARCHITECTURE.md)
Architecture technique du système:
- Composant React natif
- Gestion du Shadow DOM
- Event listeners et MutationObserver
- Intégration dans l'application

### 2. [PROBLEMES_ET_SOLUTIONS.md](./PROBLEMES_ET_SOLUTIONS.md)
Historique des problèmes rencontrés et solutions:
- Scripts 404 dans electron-vite
- Événements de clic non capturés
- Shadow DOM et isolation du contenu
- Solutions implémentées

### 3. [GUIDE_UTILISATION.md](./GUIDE_UTILISATION.md)
Guide d'utilisation pour les développeurs:
- Comment utiliser le menu
- Opérations disponibles
- Personnalisation
- Maintenance

### 4. [MIGRATION_CLARAVERSE.md](./MIGRATION_CLARAVERSE.md)
Détails de la migration depuis Claraverse:
- Différences entre menu.js et TableContextMenu
- Adaptations effectuées
- Compatibilité

### 5. [PERSISTANCE.md](./PERSISTANCE.md)
Système de persistance des modifications:
- Intégration avec SQLite
- Synchronisation DOM → Base de données
- Conversion HTML → Markdown
- Optimisations et limitations

## 🎯 Résumé Rapide

### Fonctionnalité
Menu contextuel (clic droit) sur les tableaux du chat permettant:
- ✏️ Édition de cellules (avec persistance automatique)
- ➕ Ajout de lignes/colonnes (persisté en base)
- 🗑️ Suppression de lignes/colonnes (persisté en base)
- 📋 Copie de tableau
- 📄 Export CSV
- 💾 Synchronisation automatique avec SQLite

### Fichiers Principaux
- `src/renderer/components/TableContextMenu.tsx` - Composant React
- `src/renderer/hooks/useTablePersistence.ts` - Hook de persistance
- `src/renderer/layout.tsx` - Intégration
- `src/process/message.ts` - Système de sauvegarde

### Utilisation
1. Ouvrir une conversation avec un tableau
2. **Clic droit** sur le tableau
3. Sélectionner une opération dans le menu

## 🔗 Liens Utiles

- [Migration AIONUI](../Migration%20AIONUI/) - Documentation de migration complète
- [AGENTS.md](../AGENTS.md) - Conventions de code AIONUI
- Source Claraverse: `Migration AIONUI/source-claraverse/menu.js`

## 📞 Support

Pour toute question ou problème:
1. Consulter [PROBLEMES_ET_SOLUTIONS.md](./PROBLEMES_ET_SOLUTIONS.md)
2. Vérifier les logs dans la console DevTools
3. Consulter l'historique de migration dans `Migration AIONUI/`
