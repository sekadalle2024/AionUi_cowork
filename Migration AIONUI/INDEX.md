# 📚 Migration AIONUI - Index des Fichiers

## 🎯 Navigation Rapide

### 📖 Documentation Principale
- **[README.md](./README.md)** - Vue d'ensemble complète du système
- **[MIGRATION_COMPLETE.md](./MIGRATION_COMPLETE.md)** - Statut final de la migration
- **[CONTEXT_MENU_INTEGRATION.md](./CONTEXT_MENU_INTEGRATION.md)** - Intégration menu contextuel
- **[CONTEXT_MENU_FIX.md](./CONTEXT_MENU_FIX.md)** - Résolution problème clic droit
- **[NAMING_CONVENTION_UPDATE.md](./NAMING_CONVENTION_UPDATE.md)** - Mise à jour nommage

### 📁 Dossiers Organisés

#### 📚 Documentation Technique
- **[documentation/CHAT_UI_IMPROVEMENTS.md](./documentation/CHAT_UI_IMPROVEMENTS.md)** - Guide d'implémentation détaillé
- **[documentation/table-enhancement.md](./documentation/table-enhancement.md)** - Documentation technique complète

#### 🔧 Scripts et Utilitaires
- **[scripts/migration-utils.js](./scripts/migration-utils.js)** - Utilitaires de migration et conversion

#### 💡 Exemples et Modèles
- **[examples/table-examples.md](./examples/table-examples.md)** - Formats de tables et exemples d'usage

#### 📦 Sources Claraverse
- **[source-claraverse/Flowise.js](./source-claraverse/Flowise.js)** - Script original Claraverse V17.1
- **[source-claraverse/Data.js](./source-claraverse/Data.js)** - Utilitaires de données
- **[source-claraverse/menu.js](./source-claraverse/menu.js)** - Scripts de menu

## 🚀 Fichiers Actifs dans AIONUI

### Scripts Publics (Runtime)
- `public/scripts/aionui_flowise.js` - Script principal adapté (Table Enhancer)
- `public/scripts/aionui_menu.js` - Menu contextuel pour tables

### Composants React
- `src/renderer/hooks/useTableEnhancer.ts` - Hook TypeScript pour Flowise
- `src/renderer/hooks/useContextMenu.ts` - Hook TypeScript pour Menu
- `src/renderer/components/TableEnhancerDebug.tsx` - Interface de debug

### Tests
- `tests/unit/table-enhancer-utils.test.ts` - Tests unitaires (18 tests)

### Fichiers Modifiés
- `public/index.html` - Chargement asynchrone des scripts

## 🎯 Démarrage Rapide

1. **Comprendre le système** → [README.md](./README.md)
2. **Voir des exemples** → [examples/table-examples.md](./examples/table-examples.md)
3. **Guide d'implémentation** → [documentation/CHAT_UI_IMPROVEMENTS.md](./documentation/CHAT_UI_IMPROVEMENTS.md)
4. **Vérifier le statut** → [MIGRATION_COMPLETE.md](./MIGRATION_COMPLETE.md)

## 🔍 Recherche par Sujet

### Configuration
- Configuration N8N → [README.md](./README.md#configuration)
- Sélecteurs CSS → [scripts/migration-utils.js](./scripts/migration-utils.js)

### Utilisation
- Exemples de tables → [examples/table-examples.md](./examples/table-examples.md)
- Commandes debug → [README.md](./README.md#debug-commands-browser-console)

### Développement
- Hook React → [documentation/CHAT_UI_IMPROVEMENTS.md](./documentation/CHAT_UI_IMPROVEMENTS.md#react-hook-integration)
- Tests unitaires → [documentation/table-enhancement.md](./documentation/table-enhancement.md#testing)

### Dépannage
- Problèmes courants → [README.md](./README.md#troubleshooting)
- Guide de debug → [examples/table-examples.md](./examples/table-examples.md#troubleshooting)

## 📊 Statut du Projet

- ✅ **Migration**: 100% Complète
- ✅ **Menu Contextuel**: Fonctionnel (clic droit résolu)
- ✅ **Convention Nommage**: Unifiée avec préfixe `aionui_`
- ✅ **Tests**: 18/18 Passants
- ✅ **Documentation**: Complète
- ✅ **Intégration**: React + TypeScript
- ✅ **Prêt**: Production

### 🎯 Objets Globaux Disponibles
- `window.aionui_flowise` - API Table Enhancer
- `window.aionui_menu` - API Menu Contextuel

---

*Tous les fichiers sont organisés pour faciliter la maintenance et l'évolution du système d'amélioration des tables AIONUI.*