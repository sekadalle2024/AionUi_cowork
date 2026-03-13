# Guide de Dépannage - E-audit

## 🚨 Problèmes courants

### 1. Messages non persistants

**Symptômes** : Messages disparaissent après actualisation

**Solutions** :
1. Vérifier que le composant Chat utilise `useMessageLstCache()`
2. Vérifier que l'AgentManager sauvegarde via `addMessage()`
3. Contrôler la base de données SQLite

**Diagnostic** :
```typescript
// Dans le composant Chat
useMessageLstCache(conversation_id); // Doit être présent

// Dans l'AgentManager  
addMessage(this.id, message); // Doit être appelé
```

### 2. Serveur n8n non accessible

**Symptômes** : Erreur HTTP 500 ou timeout

**Solutions** :
1. Vérifier que n8n est démarré sur le port 3458
2. Contrôler que le workflow est publié (bouton "Activate")
3. Tester la connectivité

**Diagnostic** :
```bash
# Test de connectivité
curl http://localhost:3458/api/n8n/health

# Vérification des logs n8n
npm run start:all
```

### 3. Interface chat déformée

**Symptômes** : Layout cassé, boutons masqués

**Solutions** :
1. Vérifier les classes UnoCSS
2. Contrôler les marges (mb-60px pour les SendBox)
3. Valider la largeur de la zone de saisie (w-2/3)

### 4. Erreurs TypeScript

**Symptômes** : Erreurs de compilation

**Solutions** :
```bash
# Vérification des types
bunx tsc --noEmit

# Correction automatique
bun run lint:fix
```

## 🔧 Outils de diagnostic

### Logs système
- Console développeur (F12)
- Logs Electron (terminal)
- Logs n8n (port 3458)

### Base de données
```sql
-- Vérifier les conversations
SELECT * FROM conversations WHERE type = 'n8n';

-- Vérifier les messages
SELECT * FROM messages WHERE conversation_id = 'conv-id';
```

### Tests de connectivité
```bash
# Test n8n
node n8n-server/scripts/test-connection.js

# Test workflow
node n8n-server/scripts/test-workflow.js
```

---

**Dernière mise à jour** : 13 mars 2026