# 🎯 Test n8n - Instructions Immédiates

## ✅ État actuel

- ✅ Backend n8n: **EN COURS** sur http://localhost:3458
- ⏳ Application Electron: **À LANCER**

## 🚀 Étapes pour tester MAINTENANT

### 1. Lancer l'application Electron

Dans un nouveau terminal PowerShell:

```bash
npm run start:mem
```

### 2. Dans l'application

1. **Page d'accueil (Guid)** s'ouvre
2. **Cherchez "n8n Workflow"** dans la liste des agents (avec l'icône 🔄)
3. **Cliquez dessus** pour le sélectionner
4. **Cliquez sur "Start Chat"** ou le bouton équivalent
5. **Une conversation s'ouvre**

### 3. Envoyez un message de test

Dans la zone de texte, tapez:

```
[Command] : /feuille couverture
[Processus] : trésorerie
[test] : AA040
[reference] : test sur la validation du compte caisse
```

Ou plus simple:

```
Generate a work program for cash inventory
```

### 4. Vérifiez la réponse

- ✅ Un message de réponse devrait apparaître
- ✅ Le contenu devrait être formaté en Markdown
- ✅ Pas d'erreur "conversation not found"

## 🐛 Si ça ne marche pas

### Erreur: "conversation not found"

**Cause**: Le type 'n8n' n'est pas reconnu dans conversationBridge

**Solution**: Vérifiez que le fichier `src/process/bridge/conversationBridge.ts` contient:

```typescript
} else if (task.type === 'n8n') {
  await (task as any).sendMessage({ content: other.input, files: workspaceFiles, msg_id: other.msg_id });
  return { success: true };
}
```

### Erreur: "Unsupported task type: n8n"

**Cause**: Le cas 'n8n' n'est pas dans le switch

**Solution**: Même que ci-dessus

### Pas de réponse du tout

**Vérifications**:

1. Backend n8n actif?
   ```bash
   curl http://localhost:3458/health
   ```

2. Logs du backend n8n:
   - Regardez le terminal où tourne le backend
   - Devrait afficher "📥 Received request"

3. Logs de l'application:
   - Ouvrez DevTools (F12)
   - Regardez la console
   - Cherchez "[conversationBridge] sendMessage"

## 📊 Logs attendus

### Backend n8n (terminal)
```
📥 Received request: { userMessage: 'Generate...', attachments: 0 }
🔄 Calling n8n endpoint: http://localhost:5678/webhook/template
📡 Response status: 200 (2.5s)
✅ n8n response received
```

### Application (DevTools Console)
```
[conversationBridge] sendMessage called: conversation_id=xxx, msg_id=xxx
[conversationBridge] sendMessage: found task type=n8n, status=idle
[n8n] Executing workflow...
```

## 🎉 Succès attendu

Vous devriez voir:
1. ✅ Message envoyé
2. ✅ Indicateur de chargement
3. ✅ Réponse formatée en Markdown
4. ✅ Message "finish" dans les logs

## 📝 Notes

- Le backend n8n est déjà lancé (processus 7)
- Il écoute sur le port 3458
- Il se connecte à n8n sur le port 5678
- Timeout: 10 minutes

## 🔄 Relancer le backend si nécessaire

Si vous devez relancer le backend n8n:

```bash
# Arrêter le processus actuel
# (Ctrl+C dans le terminal du backend)

# Relancer
.\scripts\start-n8n-agent.ps1
```

## 📞 Debugging

Si vous rencontrez des problèmes, vérifiez:

1. **TypeScript compilé?**
   ```bash
   bunx tsc --noEmit
   ```

2. **Fichiers modifiés sauvegardés?**
   - N8nAgentManager.ts
   - conversationBridge.ts
   - WorkerManage.ts

3. **Application complètement relancée?**
   - Fermez TOUTES les fenêtres
   - Relancez `npm run start:mem`

---

**Le backend n8n est prêt. Lancez l'application et testez! 🚀**
