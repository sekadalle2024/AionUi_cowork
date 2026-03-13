# Architecture Générale - E-audit

## 🏗️ Vue d'ensemble de l'architecture

E-audit est une application Electron multi-processus basée sur une architecture en 3 couches :

```
┌─────────────────────────────────────────────────────────────┐
│                    RENDERER PROCESS                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   React UI      │  │  Message System │  │  IPC Client  │ │
│  │  - Components   │  │  - Hooks        │  │  - Bridge    │ │
│  │  - Pages        │  │  - Persistence  │  │  - Events    │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                                │ IPC Communication
                                │
┌─────────────────────────────────────────────────────────────┐
│                     MAIN PROCESS                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  Agent Managers │  │   IPC Bridge    │  │   Database   │ │
│  │  - Gemini       │  │  - Routes       │  │  - SQLite    │ │
│  │  - ACP          │  │  - Handlers     │  │  - Messages  │ │
│  │  - n8n          │  │  - Events       │  │  - Convs     │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                                │ HTTP/API Calls
                                │
┌─────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   n8n Server    │  │   AI Models     │  │   WebUI      │ │
│  │  - Workflows    │  │  - Gemini       │  │  - Server    │ │
│  │  - API          │  │  - Claude       │  │  - Routes    │ │
│  │  - Parser       │  │  - Local LLMs   │  │  - Auth      │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Structure des dossiers

### Frontend (Renderer Process)
```
src/renderer/
├── components/           # Composants réutilisables
│   ├── sendbox.tsx      # Composant d'envoi de messages
│   ├── DemarrerMenu.tsx # Menu de démarrage
│   └── ...
├── pages/               # Pages de l'application
│   ├── conversation/    # Pages de conversation
│   │   ├── gemini/     # Chat Gemini
│   │   ├── acp/        # Chat ACP
│   │   ├── n8n/        # Chat n8n
│   │   └── ...
│   └── guid/           # Page d'accueil
├── messages/           # Système de messages
│   ├── hooks.ts        # Hooks de gestion des messages
│   ├── MessageList.tsx # Liste des messages
│   └── MessageText.tsx # Affichage des messages
└── hooks/              # Hooks personnalisés
```

### Backend (Main Process)
```
src/process/
├── bridge/             # IPC Bridge
│   ├── conversationBridge.ts  # Routes de conversation
│   └── ...
├── task/               # Gestionnaires d'agents
│   ├── GeminiAgentManager.ts
│   ├── N8nAgentManager.ts
│   └── ...
├── services/           # Services métier
│   ├── conversationService.ts
│   ├── n8nService.ts
│   └── ...
├── database/           # Base de données
│   ├── index.ts        # Interface SQLite
│   ├── schema.ts       # Schéma de base
│   └── migrations.ts   # Migrations
└── message.ts          # Système de persistance des messages
```

## 🔄 Flux de données

### 1. Envoi d'un message
```
User Input → SendBox → IPC Bridge → Agent Manager → External Service → Response → Database → UI Update
```

### 2. Chargement des messages
```
Component Mount → useMessageLstCache → Database Query → Message List Update → UI Render
```

### 3. Persistance des messages
```
Agent Response → addMessage() → ConversationManageWithDB → SQLite Insert → Persistence
```

## 🎯 Types d'agents supportés

| Agent | Type | Description | Persistance |
|-------|------|-------------|-------------|
| Gemini | `gemini` | Google Gemini AI | ✅ SQLite |
| ACP | `acp` | Agent Communication Protocol | ✅ SQLite |
| Codex | `codex` | Code generation (legacy) | ✅ SQLite |
| OpenClaw | `openclaw-gateway` | OpenClaw integration | ✅ SQLite |
| NanoBot | `nanobot` | Lightweight bot | ✅ SQLite |
| n8n | `n8n` | Workflow automation | ✅ SQLite |

## 🗄️ Base de données SQLite

### Tables principales
```sql
-- Conversations
CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('gemini', 'acp', 'codex', 'openclaw-gateway', 'nanobot', 'n8n')),
  extra TEXT NOT NULL,
  model TEXT,
  source TEXT DEFAULT 'aionui',
  channel_chat_id TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Messages
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  msg_id TEXT,
  type TEXT NOT NULL,
  position TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);
```

## 🔌 Communication IPC

### Channels principaux
- `conversation.*` : Gestion des conversations
- `database.*` : Accès à la base de données
- `n8n.*` : Communication avec n8n
- `cron.*` : Tâches programmées

### Exemple de communication
```typescript
// Frontend
const result = await ipcBridge.conversation.sendMessage.invoke({
  conversation_id: 'conv-123',
  input: 'Hello',
  msg_id: 'msg-456',
  files: []
});

// Backend
ipcBridge.conversation.sendMessage.provider(async (params) => {
  const task = await WorkerManage.getTaskByIdRollbackBuild(params.conversation_id);
  await task.sendMessage(params);
  return { success: true };
});
```

## 🛠️ Système de messages

### Hooks principaux
- `useMessageLstCache(conversation_id)` : Charge les messages depuis la DB
- `useAddOrUpdateMessage()` : Ajoute/met à jour des messages
- `useMessageList()` : Accède à la liste des messages

### Persistance
- **Temps réel** : Messages ajoutés via `addOrUpdateMessage()`
- **Base de données** : Sauvegarde via `addMessage()` dans `message.ts`
- **Chargement** : Récupération via `useMessageLstCache()`

## 🎨 Interface utilisateur

### Design System
- **Framework** : Arco Design 2
- **Styling** : UnoCSS (atomic classes)
- **Layout** : Flexbox + CSS Grid
- **Responsive** : Desktop-first (Electron app)

### Composants clés
- `SendBox` : Zone de saisie (66% width, centrée)
- `MessageList` : Liste des messages avec avatars
- `MessageText` : Affichage des messages individuels
- `DemarrerMenu` : Menu de démarrage avec actions rapides

## 🔧 Configuration

### Variables d'environnement
```bash
NODE_ENV=development
N8N_BACKEND_URL=http://localhost:3458
DATABASE_PATH=./data/aionui.db
```

### Fichiers de configuration
- `package.json` : Métadonnées de l'application
- `electron-builder.yml` : Configuration de build
- `vitest.config.ts` : Configuration des tests
- `.eslintrc.json` : Règles de linting

---

**Dernière mise à jour** : 13 mars 2026  
**Version** : E-audit v1.8.25