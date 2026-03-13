# Documentation Système - E-audit (AionUI)

## 📋 Vue d'ensemble

Ce dossier contient la documentation complète du système E-audit, incluant l'architecture, les problèmes rencontrés et leurs solutions. Cette documentation sert de référence pour la maintenance et l'évolution du système.

## 📁 Structure de la documentation

```
Doc_systeme_sauvegarde/
├── README.md                           # Ce fichier
├── ARCHITECTURE_GENERALE.md            # Architecture complète du système
├── PROBLEMES_ET_SOLUTIONS/             # Historique des problèmes et solutions
│   ├── N8N_PERSISTENCE_ISSUE.md        # Problème de persistance des messages n8n
│   ├── CHAT_UI_MODIFICATIONS.md        # Modifications de l'interface chat
│   └── APPLICATION_NAMING.md           # Changement de nom d'application
├── COMPOSANTS/                         # Documentation des composants
│   ├── N8N_INTEGRATION.md              # Intégration n8n complète
│   ├── MESSAGE_SYSTEM.md               # Système de messages et persistance
│   └── IPC_BRIDGE.md                   # Système de communication IPC
├── PROCEDURES/                         # Procédures de maintenance
│   ├── DEPLOYMENT.md                   # Procédures de déploiement
│   ├── TROUBLESHOOTING.md              # Guide de dépannage
│   └── TESTING.md                      # Procédures de test
└── CHANGELOG.md                        # Journal des modifications

```

## 🎯 Objectifs de cette documentation

1. **Préservation des connaissances** : Sauvegarder toutes les décisions techniques et solutions
2. **Faciliter la maintenance** : Permettre une compréhension rapide du système
3. **Éviter la répétition d'erreurs** : Documenter les problèmes et leurs solutions
4. **Accélérer le développement** : Fournir des références pour les nouvelles fonctionnalités

## 🔧 Technologies principales

- **Frontend** : React 19 + TypeScript 5.8
- **Backend** : Electron 37 + Node.js
- **Base de données** : SQLite
- **Styling** : UnoCSS + Arco Design
- **Tests** : Vitest 4
- **Workflow** : n8n

## 📊 État actuel du système

- ✅ Interface chat modifiée selon le design Claraverse
- ✅ Application renommée en "E-audit"
- ✅ Intégration n8n complète avec persistance
- ✅ Système de messages unifié
- ✅ Base de données SQLite opérationnelle

## 🚀 Prochaines étapes

Voir le fichier `CHANGELOG.md` pour les évolutions prévues et les améliorations à apporter.

---

**Date de création** : 13 mars 2026  
**Dernière mise à jour** : 13 mars 2026  
**Version du système** : E-audit v1.8.25