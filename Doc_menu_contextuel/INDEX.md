# Menu Contextuel des Tables - Index de Documentation

## 📚 Documents Disponibles

### ⭐ Documentation Essentielle

1. **ARCHITECTURE_COMPLETE.md** - Architecture détaillée du système
2. **PROBLEMES_SOLUTIONS_EXHAUSTIF.md** - Guide complet de dépannage
3. **SHADOW_DOM_FIX.md** - Solution au problème du Shadow DOM

### 📖 Guides Pratiques

4. **GUIDE_UTILISATION.md** - Guide utilisateur
5. **GUIDE_TEST_PERSISTANCE.md** - Guide de test
6. **TEST_PERSISTENCE.md** - Instructions de test

### 🔧 Documentation Technique

7. **PERSISTANCE.md** - Système de persistance
8. **RESOLUTION_PERSISTANCE.md** - Résolution des problèmes
9. **MIGRATION_CLARAVERSE.md** - Migration depuis Claraverse

## 🚀 Démarrage Rapide

**Pour comprendre** : ARCHITECTURE_COMPLETE.md → SHADOW_DOM_FIX.md  
**Pour tester** : GUIDE_TEST_PERSISTANCE.md  
**Pour déboguer** : PROBLEMES_SOLUTIONS_EXHAUSTIF.md (section 7.6)

## 🔑 Concepts Clés

- **Shadow DOM** : Barrière nécessitant une traversée manuelle
- **data-message-id** : Attribut sur `.message-item` dans MessageList.tsx
- **IPC Direct** : Appel immédiat sans queue
- **Conversion Markdown** : Séparateur de header obligatoire

## 📊 Fichiers Principaux

- `MessageList.tsx` (lignes 52-56) - data-message-id
- `TableContextMenu.tsx` - Menu contextuel
- `useTablePersistence.ts` - Persistance
- `ipcBridge.ts` (lignes 346-348) - Routes IPC
- `databaseBridge.ts` (lignes 70-94) - Handler IPC

## 🐛 Problèmes Fréquents

| Symptôme | Document | Section |
|----------|----------|---------|
| Could not find message container | SHADOW_DOM_FIX.md | - |
| Menu Electron s'affiche | PROBLEMES_SOLUTIONS_EXHAUSTIF.md | §5.1 |
| Modifications non persistées | PROBLEMES_SOLUTIONS_EXHAUSTIF.md | §7.6 |
| Tableau mal formaté | PROBLEMES_SOLUTIONS_EXHAUSTIF.md | §6.1 |

**Dernière mise à jour** : Mars 2025
