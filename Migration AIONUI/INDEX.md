# 📚 Migration AIONUI - Index des Fichiers

**Dernière mise à jour**: March 13, 2026  
**Status**: 🧪 Menu contextuel en test - Redémarrage requis

## 🎯 Navigation Rapide

### 🚨 DOCUMENTS PRIORITAIRES (À LIRE MAINTENANT)

1. **[INSTRUCTIONS_TEST_FINAL.md](./INSTRUCTIONS_TEST_FINAL.md)** ⭐ **COMMENCER ICI**
   - Instructions simples pour tester le menu contextuel
   - Checklist de vérification
   - À suivre MAINTENANT après redémarrage

2. **[RESUME_MODIFICATIONS.md](./RESUME_MODIFICATIONS.md)** 📋
   - Résumé complet de tous les changements
   - Fichiers créés et modifiés
   - État actuel du projet

3. **[SOLUTION_FINALE_REACT.md](./SOLUTION_FINALE_REACT.md)** 🎯
   - Documentation technique complète
   - Guide de dépannage détaillé
   - Explications de l'approche React

### 📖 Documentation Principale

- **[README.md](./README.md)** - Vue d'ensemble complète du système
- **[CONTEXT_MENU_INTEGRATION.md](./CONTEXT_MENU_INTEGRATION.md)** - Intégration menu contextuel (historique)
- **[NAMING_CONVENTION_UPDATE.md](./NAMING_CONVENTION_UPDATE.md)** - Conventions de nommage

### 🔧 Documentation de Dépannage

- **[TEST_MAINTENANT.md](./TEST_MAINTENANT.md)** - Tests détaillés avec diagnostics
- **[ALTERNATIVE_MENU_SOLUTION.md](./ALTERNATIVE_MENU_SOLUTION.md)** - Solution alternative (Ctrl+Click)
- **[RIGHT_CLICK_FIX_COMPLETE.md](./RIGHT_CLICK_FIX_COMPLETE.md)** - Tentatives de fix Electron
- **[ELECTRON_CONTEXT_MENU_FIX.md](./ELECTRON_CONTEXT_MENU_FIX.md)** - Configuration Electron
- **[RIGHT_CLICK_SOLUTIONS.md](./RIGHT_CLICK_SOLUTIONS.md)** - Solutions explorées
- **[RIGHT_CLICK_DIAGNOSTIC_GUIDE.md](./RIGHT_CLICK_DIAGNOSTIC_GUIDE.md)** - Guide diagnostic

### 📁 Dossiers Organisés

#### 📚 Documentation Technique
- **[documentation/CHAT_UI_IMPROVEMENTS.md](./documentation/CHAT_UI_IMPROVEMENTS.md)** - Guide d'implémentation
- **[documentation/table-enhancement.md](./documentation/table-enhancement.md)** - Documentation technique Flowise

#### 🔧 Scripts et Utilitaires
- **[scripts/migration-utils.js](./scripts/migration-utils.js)** - Utilitaires de migration

#### 💡 Exemples et Modèles
- **[examples/table-examples.md](./examples/table-examples.md)** - Formats de tables et exemples

#### 📦 Sources Claraverse
- **[source-claraverse/Flowise.js](./source-claraverse/Flowise.js)** - Script original V17.1
- **[source-claraverse/Data.js](./source-claraverse/Data.js)** - Utilitaires de données
- **[source-claraverse/menu.js](./source-claraverse/menu.js)** - Menu original V9.3

## 🚀 Fichiers Actifs dans AIONUI

### ✅ Composants React (NOUVEAUX - EN TEST)
- `src/renderer/components/TableContextMenu.tsx` - **Menu contextuel React** ⭐
- `src/renderer/components/TableContextMenuTest.tsx` - **Composant de test** 🧪
- `src/renderer/layout.tsx` - **Modifié** pour intégrer les composants

### Scripts Publics (Runtime)
- `public/scripts/aionui_flowise.js` - Table Enhancer (fonctionne)
- `public/scripts/aionui_menu.js` - Menu contextuel (404 - remplacé par React)
- `public/scripts/aionui_menu_alternative.js` - Alternative (404 - remplacé par React)

### Hooks React
- `src/renderer/hooks/useTableEnhancer.ts` - Hook TypeScript pour Flowise
- `src/renderer/hooks/useContextMenu.ts` - Hook TypeScript pour Menu (non utilisé)

### Composants de Debug
- `src/renderer/components/TableEnhancerDebug.tsx` - Interface de debug Flowise

### Tests
- `tests/unit/table-enhancer-utils.test.ts` - Tests unitaires Flowise (18 tests)

### Configuration
- `public/index.html` - Chargement asynchrone des scripts

## 🎯 Démarrage Rapide

### Pour Tester le Menu Contextuel (MAINTENANT)

1. **Redémarrer l'application**
   ```bash
   npm run start:all
   ```

2. **Suivre les instructions**
   - Lire: [INSTRUCTIONS_TEST_FINAL.md](./INSTRUCTIONS_TEST_FINAL.md)
   - Ouvrir DevTools (F12)
   - Chercher les messages de debug
   - Tester Ctrl+Click sur le tableau de test

3. **En cas de problème**
   - Consulter: [SOLUTION_FINALE_REACT.md](./SOLUTION_FINALE_REACT.md)
   - Section "Dépannage"

### Pour Comprendre le Système

1. **Vue d'ensemble** → [README.md](./README.md)
2. **Résumé des changements** → [RESUME_MODIFICATIONS.md](./RESUME_MODIFICATIONS.md)
3. **Exemples d'usage** → [examples/table-examples.md](./examples/table-examples.md)

## 📊 État du Projet

### ✅ Complété
- [x] Table Enhancement System (Flowise) - Fonctionne
- [x] Composant React TableContextMenu - Créé
- [x] Intégration dans layout.tsx - Fait
- [x] Logs de debug - Ajoutés
- [x] Documentation complète - Créée

### 🧪 En Test
- [ ] Vérifier chargement du composant
- [ ] Tester Ctrl+Click
- [ ] Tester bouton flottant
- [ ] Valider toutes les opérations

### 🔄 À Faire Après Tests
- [ ] Retirer composant de test
- [ ] Retirer logs de debug
- [ ] Tests unitaires
- [ ] Documentation finale

## 🆘 Support

**En cas de problème, consulter dans l'ordre**:
1. [INSTRUCTIONS_TEST_FINAL.md](./INSTRUCTIONS_TEST_FINAL.md) - Instructions simples
2. [SOLUTION_FINALE_REACT.md](./SOLUTION_FINALE_REACT.md) - Dépannage détaillé
3. [TEST_MAINTENANT.md](./TEST_MAINTENANT.md) - Tests de diagnostic

**Informations à collecter**:
- Messages console complets
- Résultat de `document.querySelectorAll('table').length`
- Capture d'écran
- Erreurs en rouge

---

**ACTION IMMÉDIATE**: Redémarrer l'app et suivre [INSTRUCTIONS_TEST_FINAL.md](./INSTRUCTIONS_TEST_FINAL.md) 🚀
