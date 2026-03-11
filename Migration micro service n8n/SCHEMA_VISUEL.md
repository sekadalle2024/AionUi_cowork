# Schémas Visuels - Microservice n8n

## 🏗️ Architecture Globale

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PROJET AIONUI                                │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                    FRONTEND (Electron/React)                    │ │
│  │                                                                  │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │ │
│  │  │ Audit Interne│  │  NotebookLM  │  │  n8n Workflow│         │ │
│  │  │    Chat      │  │     Chat     │  │     Chat     │         │ │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │ │
│  │         │                  │                  │                  │ │
│  │         │ localhost:3456   │ localhost:3457   │ localhost:3458  │ │
│  └─────────┼──────────────────┼──────────────────┼─────────────────┘ │
│            │                  │                  │                    │
│  ┌─────────▼──────────────────▼──────────────────▼─────────────────┐ │
│  │              BACKENDS (Express/Node.js)                          │ │
│  │                                                                   │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │ │
│  │  │Audit Backend │  │NotebookLM    │  │ n8n Backend  │          │ │
│  │  │Port: 3456    │  │Backend       │  │Port: 3458    │          │ │
│  │  │              │  │Port: 3457    │  │              │          │ │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │ │
│  │         │                  │                  │                   │ │
│  └─────────┼──────────────────┼──────────────────┼──────────────────┘ │
│            │                  │                  │                     │
└────────────┼──────────────────┼──────────────────┼─────────────────────┘
             │                  │                  │
             │                  │                  │
             ▼                  ▼                  ▼
    ┌────────────────┐  ┌────────────────┐  ┌────────────────┐
    │  LangGraph     │  │  Google Gemini │  │  n8n Cloud     │
    │  Agent         │  │  NotebookLM    │  │  Workflow      │
    └────────────────┘  └────────────────┘  └────────────────┘
```

## 🔄 Flux de Données n8n

```
┌─────────────────────────────────────────────────────────────────────┐
│ ÉTAPE 1: Utilisateur saisit un message                              │
│ "Génère un programme de travail pour l'inventaire de caisse"        │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│ ÉTAPE 2: N8nSendBox.tsx                                             │
│ • Crée message utilisateur (droite)                                 │
│ • Crée placeholder assistant (gauche)                               │
│ • Appelle sendN8nRequest()                                          │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│ ÉTAPE 3: HTTP POST → localhost:3458/api/n8n/execute                │
│ Body: { userMessage: "Génère un programme..." }                     │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│ ÉTAPE 4: n8n-server.ts                                              │
│ • Valide la requête                                                 │
│ • Construit le body pour n8n                                        │
│ • POST → n8n webhook (timeout 10min)                                │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│ ÉTAPE 5: n8n Cloud Workflow                                         │
│ • Traite la requête                                                 │
│ • Génère les données                                                │
│ • Retourne JSON structuré                                           │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│ ÉTAPE 6: n8n-server.ts                                              │
│ • Reçoit la réponse                                                 │
│ • normalizeN8nResponse() → Détecte format                           │
│ • Retourne { success: true, data: {...} }                           │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│ ÉTAPE 7: N8nSendBox.tsx                                             │
│ • Reçoit responseData                                               │
│ • parseN8nResponse() → Convertit en markdown                        │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│ ÉTAPE 8: Interface Utilisateur                                      │
│ • Affiche le markdown formaté                                       │
│ • Tableaux, titres, liens, etc.                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 📁 Structure des Fichiers

```
projet-cible/
│
├── src/
│   ├── agents/
│   │   └── n8n/                          ← BACKEND
│   │       ├── n8n-server.ts             ← Serveur Express (Port 3458)
│   │       └── n8nResponseParser.ts      ← Parser markdown
│   │
│   ├── renderer/
│   │   └── pages/
│   │       └── conversation/
│   │           └── n8n/                  ← FRONTEND
│   │               ├── N8nChat.tsx       ← Interface de chat
│   │               └── N8nSendBox.tsx    ← Composant d'envoi
│   │
│   └── common/
│       └── presets/
│           └── assistantPresets.ts       ← Configuration menu
│
├── scripts/
│   └── start-n8n-agent.ps1               ← Script de démarrage
│
├── package.json                          ← Dépendances
└── tsconfig.json                         ← Configuration TypeScript
```

## 🔌 Points d'Intégration

```
┌─────────────────────────────────────────────────────────────────────┐
│ 1. MENU DE SÉLECTION                                                │
│    Fichier: src/common/presets/assistantPresets.ts                  │
│                                                                       │
│    {                                                                 │
│      id: 'n8n-workflow',                                             │
│      name: 'n8n Workflow',                                           │
│      component: 'N8nChat'                                            │
│    }                                                                 │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ 2. ROUTING REACT                                                     │
│    Fichier: src/renderer/App.tsx (ou routes.tsx)                    │
│                                                                       │
│    <Route                                                            │
│      path="/conversation/n8n/:conversation_id"                       │
│      element={<N8nChat />}                                           │
│    />                                                                │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ 3. SCRIPT DE DÉMARRAGE GLOBAL                                       │
│    Fichier: START_COMPLETE.ps1                                      │
│                                                                       │
│    $n8nBackendJob = Start-Job -ScriptBlock {                         │
│        .\scripts\start-n8n-agent.ps1                                 │
│    }                                                                 │
└─────────────────────────────────────────────────────────────────────┘
```

## 🔄 Formats de Réponse n8n

```
┌─────────────────────────────────────────────────────────────────────┐
│ FORMAT 1: Array avec output                                         │
│                                                                       │
│ INPUT:                                                               │
│ [{ output: "Texte de réponse", stats: {...} }]                      │
│                                                                       │
│ NORMALISATION:                                                       │
│ { type: 'text', content: "Texte de réponse", metadata: {...} }      │
│                                                                       │
│ OUTPUT MARKDOWN:                                                     │
│ Texte de réponse                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ FORMAT 2: Object avec tables                                        │
│                                                                       │
│ INPUT:                                                               │
│ { tables: [{markdown: "..."}, ...], status: "ok" }                  │
│                                                                       │
│ NORMALISATION:                                                       │
│ { type: 'tables', tables: [...], metadata: {...} }                  │
│                                                                       │
│ OUTPUT MARKDOWN:                                                     │
│ [Tableaux markdown concaténés]                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ FORMAT 3: Direct output                                             │
│                                                                       │
│ INPUT:                                                               │
│ { output: "Texte direct" }                                          │
│                                                                       │
│ NORMALISATION:                                                       │
│ { type: 'text', content: "Texte direct", metadata: {...} }          │
│                                                                       │
│ OUTPUT MARKDOWN:                                                     │
│ Texte direct                                                         │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ FORMAT 4: Programme de travail (structured_data)                    │
│                                                                       │
│ INPUT:                                                               │
│ [{ data: {                                                           │
│     "Etape mission - Programme": [                                   │
│       { "Table_Header": { etape: "1", titre: "..." } },             │
│       { "Table_Controles": [{ controle: "C1", ... }] }              │
│     ]                                                                │
│   }                                                                  │
│ }]                                                                   │
│                                                                       │
│ NORMALISATION:                                                       │
│ { type: 'structured_data', data: {...}, metadata: {...} }           │
│                                                                       │
│ OUTPUT MARKDOWN:                                                     │
│ | Rubrique | Description |                                          │
│ |----------|-------------|                                          │
│ | Etape    | 1           |                                          │
│ | Titre    | ...         |                                          │
│                                                                       │
│ ### 📑 Programme de Travail - Contrôles Audit                       │
│ | Controle | Objectif | ... |                                       │
│ |----------|----------|-----|                                       │
│ | C1       | ...      | ... |                                       │
└─────────────────────────────────────────────────────────────────────┘
```

## 🔧 Configuration Critique

```
┌─────────────────────────────────────────────────────────────────────┐
│ BACKEND (n8n-server.ts)                                             │
│                                                                       │
│ const PORT = 3458;                    ← Port du serveur             │
│ const N8N_ENDPOINT = 'https://...';   ← ⚠️ À CONFIGURER             │
│ const N8N_TIMEOUT = 10 * 60 * 1000;   ← Timeout 10 minutes          │
│                                                                       │
│ app.use(cors());                      ← CORS permissif (dev)        │
│ app.use(express.json());              ← Parser JSON                 │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ FRONTEND (N8nSendBox.tsx)                                           │
│                                                                       │
│ const BACKEND_URL =                   ← URL du backend              │
│   'http://localhost:3458/api/n8n/execute';                          │
└─────────────────────────────────────────────────────────────────────┘
```

## 📊 Dépendances

```
┌─────────────────────────────────────────────────────────────────────┐
│ BACKEND                                                              │
│                                                                       │
│ Production:                                                          │
│ • express (^5.1.0)          → Serveur HTTP                          │
│ • cors (^2.8.5)             → Gestion CORS                          │
│                                                                       │
│ Développement:                                                       │
│ • @types/express            → Types TypeScript                      │
│ • @types/cors               → Types TypeScript                      │
│ • ts-node (^10.9.2)         → Exécution TypeScript                  │
│ • typescript (^5.8.3)       → Compilateur                           │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ FRONTEND                                                             │
│                                                                       │
│ Production:                                                          │
│ • react (^19.1.0)           → Framework UI                          │
│ • react-dom (^19.1.0)       → Rendu React                           │
│ • @arco-design/web-react    → Composants UI                         │
│ • react-markdown            → Rendu markdown                        │
│ • react-i18next             → Internationalisation                  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ SYSTÈME                                                              │
│                                                                       │
│ • Node.js ≥ 18.0.0          → ⚠️ OBLIGATOIRE (fetch natif)          │
│ • npm ou yarn               → Gestionnaire de packages              │
└─────────────────────────────────────────────────────────────────────┘
```

## 🚀 Démarrage

```
┌─────────────────────────────────────────────────────────────────────┐
│ OPTION 1: Démarrage Manuel                                          │
│                                                                       │
│ Terminal 1:                                                          │
│ PS> .\scripts\start-n8n-agent.ps1                                    │
│                                                                       │
│ Terminal 2:                                                          │
│ PS> npm start                                                        │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ OPTION 2: Démarrage Automatique (avec START_COMPLETE.ps1)           │
│                                                                       │
│ PS> .\START_COMPLETE.ps1                                             │
│                                                                       │
│ Démarre automatiquement:                                             │
│ • Backend Audit Interne (3456)                                       │
│ • Backend NotebookLM (3457)                                          │
│ • Backend n8n (3458)                                                 │
│ • Application principale                                             │
└─────────────────────────────────────────────────────────────────────┘
```

## 🧪 Tests

```
┌─────────────────────────────────────────────────────────────────────┐
│ TEST 1: Health Check                                                │
│                                                                       │
│ PS> curl http://localhost:3458/health                                │
│                                                                       │
│ Résultat attendu:                                                    │
│ {                                                                    │
│   "status": "ok",                                                    │
│   "service": "n8n-backend",                                          │
│   "port": 3458,                                                      │
│   "endpoint": "https://..."                                          │
│ }                                                                    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ TEST 2: Exécution Simple                                            │
│                                                                       │
│ PS> curl -X POST http://localhost:3458/api/n8n/execute `            │
│      -H "Content-Type: application/json" `                           │
│      -d '{"userMessage":"Test"}'                                     │
│                                                                       │
│ Résultat attendu:                                                    │
│ {                                                                    │
│   "success": true,                                                   │
│   "data": { "type": "...", ... }                                     │
│ }                                                                    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ TEST 3: Interface Complète                                          │
│                                                                       │
│ 1. Démarrer backend: .\scripts\start-n8n-agent.ps1                  │
│ 2. Démarrer app: npm start                                          │
│ 3. Sélectionner "n8n Workflow" dans le menu                         │
│ 4. Envoyer: "Génère un programme de travail"                        │
│ 5. Vérifier l'affichage des tableaux markdown                       │
└─────────────────────────────────────────────────────────────────────┘
```

## 🎯 Temps de Migration

```
┌─────────────────────────────────────────────────────────────────────┐
│                     TIMELINE DE MIGRATION                            │
│                                                                       │
│ 0min ├─────────────────────────────────────────────────────┤ 90min  │
│      │                                                       │        │
│      ├──────┤ Préparation (15min)                                    │
│      │      ├──────┤ Backend (10min)                                 │
│      │      │      ├──────────┤ Frontend (15min)                     │
│      │      │      │          ├────────────┤ Intégration (20min)     │
│      │      │      │          │            ├────────────┤ Tests (20min)│
│      │      │      │          │            │            ├─────┤ Valid (10min)│
│                                                                       │
│ ✅ Préparation: Vérifications système et projet                      │
│ ✅ Backend: Installation et configuration serveur                    │
│ ✅ Frontend: Installation et adaptation composants                   │
│ ✅ Intégration: Menu, routing, scripts                               │
│ ✅ Tests: Validation fonctionnelle complète                          │
│ ✅ Validation: Checklist finale                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## 📞 Support

```
┌─────────────────────────────────────────────────────────────────────┐
│ DOCUMENTATION DISPONIBLE                                             │
│                                                                       │
│ 📄 README.md                  → Vue d'ensemble                       │
│ 🏗️  ARCHITECTURE.md            → Architecture détaillée             │
│ 📖 GUIDE_MIGRATION.md         → Guide pas à pas                     │
│ ⚠️  POINTS_ATTENTION.md        → Points critiques                    │
│ ✅ CHECKLIST_MIGRATION.md     → Checklist complète                  │
│ 📊 SCHEMA_VISUEL.md           → Ce fichier                          │
│                                                                       │
│ 📁 backend/                   → Code source backend                 │
│ 📁 frontend/                  → Code source frontend                │
│ 📁 scripts/                   → Scripts de démarrage                │
│ 📁 config/                    → Configuration dépendances           │
└─────────────────────────────────────────────────────────────────────┘
```
