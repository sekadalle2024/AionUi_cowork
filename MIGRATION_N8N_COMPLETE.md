# Migration n8n - Complétée ✅

## Résumé

Le microservice n8n a été migré avec succès dans le projet AionUi. Tous les fichiers ont été créés, les types TypeScript ont été mis à jour, et l'intégration est complète.

## Fichiers créés

### Backend
- `src/agent/n8n/n8n-server.ts` - Serveur Express (port 3458)
- `src/agent/n8n/n8nResponseParser.ts` - Parser de réponses n8n vers markdown
- `src/agent/n8n/README.md` - Documentation complète

### Frontend
- `src/renderer/pages/conversation/n8n/N8nChat.tsx` - Composant principal
- `src/renderer/pages/conversation/n8n/N8nSendBox.tsx` - Composant d'envoi

### Scripts
- `scripts/start-n8n-agent.ps1` - Script de démarrage du backend

## Modifications effectuées

### Types TypeScript
1. ✅ `src/common/storage.ts` - Ajout du type de conversation 'n8n'
2. ✅ `src/types/acpTypes.ts` - Ajout de 'n8n' au type PresetAgentType
3. ✅ `src/process/database/types.ts` - Ajout de 'n8n' au type IConversationRow
4. ✅ `src/renderer/hooks/useSendBoxDraft.ts` - Ajout du type Draft pour n8n
5. ✅ `src/renderer/pages/conversation/context/ConversationTabsContext.tsx` - Ajout de 'n8n' au type ConversationTab

### Intégration
1. ✅ `src/common/presets/assistantPresets.ts` - Ajout du preset n8n-workflow
2. ✅ `src/renderer/pages/conversation/ChatConversation.tsx` - Ajout du cas n8n dans le switch

## Configuration requise

### 1. Endpoint n8n
Éditer `src/agent/n8n/n8n-server.ts` ligne 13:
```typescript
const N8N_ENDPOINT = 'VOTRE_URL_N8N_ICI';
```

### 2. Démarrage du backend
```bash
.\scripts\start-n8n-agent.ps1
```

### 3. Test
```bash
# Health check
curl http://localhost:3458/health

# Test d'exécution
curl -X POST http://localhost:3458/api/n8n/execute \
  -H "Content-Type: application/json" \
  -d '{"userMessage":"Test"}'
```

## Utilisation

1. Démarrer le backend n8n: `.\scripts\start-n8n-agent.ps1`
2. Lancer l'application: `npm run start`
3. Dans l'interface, sélectionner "n8n Workflow" dans le menu des assistants
4. Envoyer une requête de test

## Dépendances

Toutes les dépendances nécessaires sont déjà présentes dans `package.json`:
- ✅ express
- ✅ cors
- ✅ ts-node
- ✅ react-markdown

## Validation

- ✅ Aucune erreur TypeScript (`npx tsc --noEmit`)
- ✅ Code formaté selon les conventions du projet
- ✅ Tous les types sont correctement définis
- ✅ L'intégration est complète

## Documentation

Consultez `src/agent/n8n/README.md` pour:
- Architecture détaillée
- Configuration avancée
- Résolution de problèmes
- Formats de réponse supportés

## Points d'attention

1. **Endpoint n8n** - Doit être configuré avant utilisation
2. **Port 3458** - Doit être libre
3. **Node.js 22+** - Requis (déjà OK selon package.json)
4. **Backend séparé** - Doit être démarré indépendamment de l'application

## Prochaines étapes (optionnel)

1. Configurer l'endpoint n8n dans un fichier `.env`
2. Ajouter des tests unitaires pour le parser
3. Ajouter des traductions i18n pour les messages
4. Intégrer le démarrage du backend dans le script principal

---

**Migration complétée le:** 2025-03-11  
**Statut:** ✅ Prêt pour utilisation
