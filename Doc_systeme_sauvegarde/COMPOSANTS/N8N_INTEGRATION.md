# Intégration n8n - Architecture Complète

## 🔄 Vue d'ensemble

L'intégration n8n permet d'exécuter des workflows d'automatisation et d'afficher les résultats dans l'interface de chat E-audit.

## 🏗️ Architecture

### Composants Frontend
- `N8nChat.tsx` : Interface de chat
- `N8nSendBox.tsx` : Zone de saisie
- `useMessageLstCache()` : Chargement des messages

### Composants Backend  
- `N8nAgentManager.ts` : Gestionnaire d'agent
- `n8nService.ts` : Service de communication
- `n8nResponseParser.ts` : Parser de réponses

### Services Externes
- Serveur n8n (port 3458)
- Workflows configurés
- API REST n8n

## 🔌 Flux de données

```
User → N8nSendBox → IPC → N8nAgentManager → n8nService → n8n Server
                                    ↓
                              addMessage() → SQLite
                                    ↓  
N8nChat → useMessageLstCache() → Database → MessageList
```

## 📝 Configuration

### Variables
- `N8N_BACKEND_URL=http://localhost:3458`
- Timeout : 10 minutes par défaut

### Démarrage
```bash
npm run start:all  # Lance n8n + E-audit
```

---

**Version** : 1.0  
**Statut** : ✅ Opérationnel