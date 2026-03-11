# Migration du Microservice n8n

## 📋 Vue d'ensemble

Ce dossier contient toute la documentation nécessaire pour migrer le microservice n8n vers un autre projet du même fork.

Le microservice n8n permet d'exécuter des workflows n8n via une API REST et d'afficher les résultats dans une interface de chat.

## 🏗️ Architecture Générale

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React/Electron)                 │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │  N8nChat.tsx     │────────▶│ N8nSendBox.tsx   │         │
│  │  (Interface)     │         │  (Envoi requêtes)│         │
│  └──────────────────┘         └──────────────────┘         │
│                                        │                     │
│                                        │ HTTP POST           │
│                                        ▼                     │
└────────────────────────────────────────────────────────────┘
                                         │
                                         │ localhost:3458
                                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Express/Node.js)                 │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │  n8n-server.ts   │────────▶│ n8nResponseParser│         │
│  │  (API REST)      │         │  (Formatage MD)  │         │
│  └──────────────────┘         └──────────────────┘         │
│         │                                                    │
│         │ HTTP POST                                          │
│         ▼                                                    │
└─────────────────────────────────────────────────────────────┘
          │
          │ https://fetanif511.app.n8n.cloud/webhook/integration
          ▼
┌─────────────────────────────────────────────────────────────┐
│                    WORKFLOW N8N (Cloud)                      │
│  - Traitement des requêtes                                   │
│  - Génération de données structurées                         │
│  - Retour JSON                                               │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Structure des Fichiers

```
Migration micro service n8n/
├── README.md                           # Ce fichier
├── ARCHITECTURE.md                     # Architecture détaillée
├── GUIDE_MIGRATION.md                  # Guide pas à pas
├── POINTS_ATTENTION.md                 # Points critiques
├── backend/
│   ├── n8n-server.ts                   # Serveur Express
│   └── n8nResponseParser.ts            # Parser de réponses
├── frontend/
│   ├── N8nChat.tsx                     # Interface de chat
│   └── N8nSendBox.tsx                  # Composant d'envoi
├── scripts/
│   └── start-n8n-agent.ps1             # Script de démarrage
└── config/
    └── dependencies.json               # Dépendances NPM
```

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+ (pour fetch natif)
- npm ou yarn
- TypeScript
- Un workflow n8n actif avec webhook

### Installation

1. Copier les fichiers backend dans `src/agents/n8n/`
2. Copier les fichiers frontend dans `src/renderer/pages/conversation/n8n/`
3. Copier le script de démarrage dans `scripts/`
4. Installer les dépendances (voir `config/dependencies.json`)
5. Configurer l'endpoint n8n dans `n8n-server.ts`
6. Démarrer le backend: `.\scripts\start-n8n-agent.ps1`

## 📚 Documentation Détaillée

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Architecture technique complète
- **[GUIDE_MIGRATION.md](./GUIDE_MIGRATION.md)** - Guide de migration étape par étape
- **[POINTS_ATTENTION.md](./POINTS_ATTENTION.md)** - Points critiques et pièges à éviter

## 🔧 Configuration

### Backend (Port 3458)
```typescript
const PORT = 3458;
const N8N_ENDPOINT = 'https://fetanif511.app.n8n.cloud/webhook/integration';
const N8N_TIMEOUT = 10 * 60 * 1000; // 10 minutes
```

### Frontend
```typescript
const BACKEND_URL = 'http://localhost:3458/api/n8n/execute';
```

## 🧪 Test de Fonctionnement

```bash
# 1. Démarrer le backend
.\scripts\start-n8n-agent.ps1

# 2. Tester le health check
curl http://localhost:3458/health

# 3. Tester une requête
curl -X POST http://localhost:3458/api/n8n/execute \
  -H "Content-Type: application/json" \
  -d '{"userMessage":"Test"}'
```

## 📦 Dépendances Principales

### Backend
- `express` - Serveur HTTP
- `cors` - Gestion CORS
- `ts-node` - Exécution TypeScript

### Frontend
- `react` - Interface utilisateur
- `@arco-design/web-react` - Composants UI

## 🔗 Intégration avec le Projet Principal

Le microservice s'intègre via:
1. **Menu de sélection** - Ajout dans `assistantPresets.ts`
2. **Routing** - Configuration des routes React
3. **Script de démarrage global** - Inclusion dans `START_COMPLETE.ps1`

## ⚠️ Points d'Attention Critiques

1. **Port 3458** - Doit être libre et non utilisé
2. **Endpoint n8n** - Doit être accessible et actif
3. **Timeout** - 10 minutes par défaut, ajustable selon les besoins
4. **Format de réponse** - Le parser supporte 4 formats différents
5. **CORS** - Activé pour permettre les requêtes cross-origin

## 📞 Support

Pour toute question sur la migration, consultez:
- Les fichiers de code source commentés
- Les logs du serveur backend
- La documentation n8n officielle

## 📝 Licence

Apache-2.0 - Voir le fichier LICENSE du projet principal
