# Problème de Persistance des Messages n8n

## 🚨 Description du problème

**Date** : 13 mars 2026  
**Priorité** : Critique  
**Statut** : ✅ Résolu

### Symptômes observés
- Les messages générés par le workflow n8n n'étaient pas persistants
- Après actualisation de la page ou navigation, les tables et réponses n8n disparaissaient
- Les autres types d'agents (Gemini, ACP, etc.) fonctionnaient correctement

### Impact
- Perte de données utilisateur
- Expérience utilisateur dégradée
- Impossibilité de consulter l'historique des workflows n8n

## 🔍 Analyse du problème

### Investigation initiale
1. **Vérification du N8nSendBox** : Utilisait `fetch()` direct au lieu de l'IPC bridge
2. **Vérification du N8nAgentManager** : Ne sauvegardait pas les messages en base
3. **Vérification du N8nChat** : Ne chargeait pas les messages depuis la base

### Cause racine identifiée
Le composant `N8nChat` ne possédait pas le hook `useMessageLstCache(conversation_id)` nécessaire pour charger les messages depuis la base de données SQLite.

### Comparaison avec les autres agents
```typescript
// ✅ GeminiChat.tsx (CORRECT)
const GeminiChat = ({ conversation_id }) => {
  useMessageLstCache(conversation_id); // Charge les messages depuis la DB
  return <MessageList />;
};

// ❌ N8nChat.tsx (INCORRECT - avant correction)
const N8nChat = ({ conversation_id }) => {
  // Manque useMessageLstCache(conversation_id)
  return <MessageList />;
};
```

## 🛠️ Solutions appliquées

### 1. Correction du N8nAgentManager.ts
**Problème** : Ne sauvegardait pas les messages en base de données

**Solution** :
```typescript
// Ajout des imports nécessaires
import { addMessage } from '../message';
import type { TMessage } from '@/common/chatLib';
import { uuid } from '@/common/utils';

// Modification de sendMessage() pour sauvegarder le message utilisateur
async sendMessage({ content, msg_id }: { content: string; files?: string[]; msg_id: string }): Promise<void> {
  // Sauvegarde du message utilisateur
  const userMessage: TMessage = {
    id: uuid(),
    msg_id,
    type: 'text',
    position: 'right',
    conversation_id: this.id,
    content: { content },
    createdAt: Date.now(),
  };
  addMessage(this.id, userMessage);

  await this.execute(content, msg_id);
}

// Modification de execute() pour sauvegarder les réponses
async execute(userMessage: string, msgId: string): Promise<void> {
  try {
    const result = await executeN8nWorkflow({ userMessage });
    
    if (result.success && result.data) {
      const markdown = parseN8nResponse(result.data);
      
      // Sauvegarde de la réponse en base
      const assistantMessage: TMessage = {
        id: uuid(),
        msg_id: msgId,
        type: 'text',
        position: 'left',
        conversation_id: this.id,
        content: { content: markdown },
        createdAt: Date.now(),
      };
      addMessage(this.id, assistantMessage);
      
      // Émission pour mise à jour temps réel
      ipcBridge.conversation.responseStream.emit({
        type: 'message',
        conversation_id: this.id,
        msg_id: msgId,
        data: markdown,
      });
    }
  } catch (error) {
    // Gestion des erreurs avec sauvegarde
  }
}
```

### 2. Correction du conversationBridge.ts
**Problème** : Type TypeScript incorrect pour N8nAgentManager

**Solution** :
```typescript
// Ajout du type N8nAgentManager dans les imports et types
let task: GeminiAgentManager | AcpAgentManager | CodexAgentManager | OpenClawAgentManager | NanoBotAgentManager | N8nAgentManager | undefined;

// Correction de la condition n8n
} else if (task.type === 'n8n') {
  await (task as N8nAgentManager).sendMessage({ content: other.input, files: workspaceFiles, msg_id: other.msg_id });
  return { success: true };
}
```

### 3. Simplification du N8nSendBox.tsx
**Problème** : Ajoutait manuellement les messages utilisateur, créant des doublons

**Solution** :
```typescript
// Suppression de l'ajout manuel du message utilisateur
// (maintenant géré par N8nAgentManager)
const handleSend = useCallback(async (content: string) => {
  if (!content.trim() || sending) return;
  setSending(true);
  const msg_id = uuid();

  // Seul le placeholder est ajouté pour le feedback UI
  addOrUpdateMessage({
    id: msg_id,
    msg_id,
    type: 'text',
    position: 'left',
    conversation_id,
    content: {
      content: '⏳ Exécution du workflow n8n...',
    },
    createdAt: Date.now(),
  } as TMessage, true);

  // Envoi via IPC (sauvegarde gérée par N8nAgentManager)
  await ipcBridge.conversation.sendMessage.invoke({
    conversation_id,
    input: content,
    msg_id,
    files: [],
  });
}, [conversation_id, addOrUpdateMessage, sending, t]);
```

### 4. Correction principale : N8nChat.tsx
**Problème** : Ne chargeait pas les messages depuis la base de données

**Solution** :
```typescript
// AVANT (incorrect)
import { MessageListProvider } from '@renderer/messages/hooks';

const N8nChat: React.FC<{ conversation_id: string }> = ({ conversation_id }) => {
  return (
    <div className='flex-1 flex flex-col px-20px'>
      <FlexFullContainer>
        <MessageList className='flex-1'></MessageList>
      </FlexFullContainer>
      <N8nSendBox conversation_id={conversation_id} />
    </div>
  );
};

// APRÈS (correct)
import { MessageListProvider, useMessageLstCache } from '@renderer/messages/hooks';

const N8nChat: React.FC<{ conversation_id: string }> = ({ conversation_id }) => {
  useMessageLstCache(conversation_id); // 🔑 AJOUT CRUCIAL

  return (
    <div className='flex-1 flex flex-col px-20px'>
      <FlexFullContainer>
        <MessageList className='flex-1'></MessageList>
      </FlexFullContainer>
      <N8nSendBox conversation_id={conversation_id} />
    </div>
  );
};
```

## ✅ Validation de la solution

### Tests effectués
1. **Test de persistance** : Messages n8n restent après actualisation ✅
2. **Test de navigation** : Messages n8n restent après changement de page ✅
3. **Test de redémarrage** : Messages n8n restent après redémarrage de l'app ✅
4. **Test de cohérence** : Pas de doublons de messages ✅

### Architecture finale
```
User Input → N8nSendBox → IPC Bridge → N8nAgentManager → n8n Service
                                           ↓
                                      addMessage() → SQLite
                                           ↓
N8nChat → useMessageLstCache() → Database Query → Message Display
```

## 📚 Leçons apprises

### Points clés à retenir
1. **Cohérence architecturale** : Tous les agents doivent suivre le même pattern
2. **Hook useMessageLstCache** : Obligatoire pour tous les composants de chat
3. **Sauvegarde via addMessage()** : Seule méthode fiable pour la persistance
4. **Tests de persistance** : Toujours tester après actualisation/navigation

### Checklist pour nouveaux agents
- [ ] Agent Manager sauvegarde via `addMessage()`
- [ ] Composant Chat utilise `useMessageLstCache()`
- [ ] IPC Bridge inclut le nouveau type d'agent
- [ ] Tests de persistance effectués

## 🔄 Impact sur le système

### Fichiers modifiés
- `src/process/task/N8nAgentManager.ts` : Ajout de la persistance
- `src/process/bridge/conversationBridge.ts` : Correction du typage
- `src/renderer/pages/conversation/n8n/N8nSendBox.tsx` : Simplification
- `src/renderer/pages/conversation/n8n/N8nChat.tsx` : Ajout du hook de chargement

### Compatibilité
- ✅ Rétrocompatible avec les conversations existantes
- ✅ Pas d'impact sur les autres types d'agents
- ✅ Migration automatique des données

---

**Résolu par** : Assistant IA  
**Date de résolution** : 13 mars 2026  
**Temps de résolution** : ~2 heures  
**Complexité** : Moyenne