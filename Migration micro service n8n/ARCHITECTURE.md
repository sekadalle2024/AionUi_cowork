# Architecture Technique du Microservice n8n

## 🎯 Vue d'Ensemble

Le microservice n8n est une architecture en 3 couches qui permet d'exécuter des workflows n8n et d'afficher les résultats dans une interface de chat moderne.

## 🏛️ Architecture en Couches

### Couche 1: Frontend (React/TypeScript)

#### N8nChat.tsx
**Rôle**: Composant principal de l'interface de chat

```typescript
Responsabilités:
- Affichage de la liste des messages
- Gestion du contexte de conversation
- Intégration du composant SendBox
- Gestion de l'état de la conversation

Dépendances:
- MessageList (affichage des messages)
- MessageListProvider (contexte)
- N8nSendBox (envoi de messages)
```

**Structure**:
```tsx
<div className='flex-1 flex flex-col px-20px'>
  <FlexFullContainer>
    <MessageList className='flex-1'></MessageList>
  </FlexFullContainer>
  <N8nSendBox conversation_id={conversation_id} />
</div>
```

#### N8nSendBox.tsx
**Rôle**: Composant d'envoi de requêtes et gestion des réponses

```typescript
Responsabilités:
- Capture de l'input utilisateur
- Envoi de requêtes HTTP au backend
- Affichage des messages de chargement
- Gestion des erreurs
- Conversion des réponses en markdown
- Mise à jour de l'interface

Flux de données:
1. Utilisateur saisit un message
2. Création d'un message utilisateur (position: right)
3. Création d'un message assistant placeholder (position: left)
4. Appel HTTP POST vers localhost:3458
5. Réception de la réponse
6. Parsing avec n8nResponseParser
7. Mise à jour du message assistant avec le markdown
```

**Fonction clé: sendN8nRequest**
```typescript
async function sendN8nRequest(userMessage: string, attachments?: any[]): Promise<any> {
  const response = await fetch(BACKEND_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userMessage, attachments })
  });
  
  const result = await response.json();
  if (!result.success) throw new Error(result.error);
  return result.data;
}
```

### Couche 2: Backend (Express/Node.js)

#### n8n-server.ts
**Rôle**: Serveur API REST qui fait le pont entre le frontend et n8n

```typescript
Configuration:
- Port: 3458
- Endpoint n8n: http://localhost:5678/webhook/template
- Timeout: 10 minutes (600 000 ms)
- CORS: Activé pour toutes les origines
```

**Endpoints**:

1. **GET /health**
   - Vérification de l'état du serveur
   - Retourne: `{ status, service, port, endpoint }`

2. **POST /api/n8n/execute**
   - Exécution d'un workflow n8n
   - Body: `{ userMessage: string, attachments?: any[] }`
   - Retourne: `{ success: boolean, data?: any, error?: string }`

**Flux de traitement**:
```
1. Réception de la requête
   ↓
2. Validation du userMessage
   ↓
3. Construction du body pour n8n
   - Avec attachments: { data: { question, attachments } }
   - Sans attachments: { question }
   ↓
4. Appel HTTP POST vers n8n avec timeout
   ↓
5. Normalisation de la réponse (normalizeN8nResponse)
   ↓
6. Retour au frontend
```

**Gestion du timeout**:
```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), N8N_TIMEOUT);

const response = await fetch(N8N_ENDPOINT, {
  method: 'POST',
  signal: controller.signal,
  // ...
});

clearTimeout(timeoutId);
```

**Fonction normalizeN8nResponse**:
Détecte et normalise 4 formats de réponse n8n différents:

```typescript
FORMAT 1: Array avec output
[{ output: "texte", stats: {...} }]
→ { type: 'text', content: "texte", metadata: {...} }

FORMAT 2: Object avec tables
{ tables: [...], status: "ok" }
→ { type: 'tables', tables: [...], metadata: {...} }

FORMAT 3: Direct output
{ output: "texte" }
→ { type: 'text', content: "texte", metadata: {...} }

FORMAT 4: Programme de travail avec data
[{ data: {...} }]
→ { type: 'structured_data', data: {...}, metadata: {...} }
```

#### n8nResponseParser.ts
**Rôle**: Conversion des réponses n8n en markdown formaté

**Fonctions principales**:

1. **detectTableType(tableKey, tableData)**
   - Détecte le type de table: header, data_array, download, unknown
   - Utilise des heuristiques basées sur:
     - Structure des données
     - Mots-clés dans les noms de colonnes
     - Présence d'URLs

2. **generateTableTitle(tableKey, tableData)**
   - Génère un titre approprié pour chaque table
   - Détection automatique:
     - 📑 Programme de Travail - Contrôles Audit
     - 📊 Principales Opérations
     - 💡 Recommandations
     - 📋 Modèle

3. **convertHeaderTableToMarkdown(data)**
   - Convertit un objet simple en tableau markdown 2 colonnes
   - Format: | Rubrique | Description |

4. **convertArrayTableToMarkdown(tableName, data)**
   - Convertit un array d'objets en tableau markdown
   - Génère automatiquement les headers
   - Nettoie les valeurs (pipes, newlines, longueur)

5. **convertDownloadTableToMarkdown(data)**
   - Convertit les liens de téléchargement en markdown
   - Détecte les URLs et crée des liens cliquables

6. **convertStructuredDataToMarkdown(data)**
   - Fonction principale de conversion
   - Parcourt la structure de données
   - Applique le bon convertisseur selon le type

7. **parseN8nResponse(data)**
   - Point d'entrée principal pour le frontend
   - Route vers le bon parser selon data.type

**Exemple de conversion**:
```typescript
Input (n8n):
{
  type: 'structured_data',
  data: {
    'Etape mission - Programme': [
      { 'Table_Header': { etape: '1', titre: 'Inventaire' } },
      { 'Table_Controles': [
          { controle: 'C1', objectif: 'Vérifier...' }
        ]
      }
    ]
  }
}

Output (markdown):
| Rubrique | Description |
|----------|-------------|
| **Etape** | 1 |
| **Titre** | Inventaire |

### 📑 Programme de Travail - Contrôles Audit

| Controle | Objectif |
|----------|----------|
| C1 | Vérifier... |
```

### Couche 3: Workflow n8n (Cloud)

**Endpoint**: `https://fetanif511.app.n8n.cloud/webhook/integration`

**Responsabilités**:
- Réception des requêtes webhook
- Traitement métier (génération de programmes, analyses, etc.)
- Retour de données structurées en JSON

**Format de réponse attendu**:
Le workflow doit retourner un des 4 formats supportés par le parser.

## 🔄 Flux de Données Complet

```
┌─────────────────────────────────────────────────────────────┐
│ 1. UTILISATEUR                                               │
│    Saisit: "Génère un programme de travail pour l'inventaire"│
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. N8nSendBox.tsx                                            │
│    - Crée message utilisateur (right)                        │
│    - Crée message assistant placeholder (left)               │
│    - Appelle sendN8nRequest(userMessage)                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. HTTP POST → localhost:3458/api/n8n/execute               │
│    Body: { userMessage: "Génère un programme..." }          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. n8n-server.ts                                             │
│    - Valide la requête                                       │
│    - Construit le body pour n8n                              │
│    - POST → n8n webhook avec timeout 10min                   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. WORKFLOW N8N (Cloud)                                      │
│    - Traite la requête                                       │
│    - Génère les données                                      │
│    - Retourne JSON structuré                                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. n8n-server.ts                                             │
│    - Reçoit la réponse n8n                                   │
│    - Appelle normalizeN8nResponse()                          │
│    - Détecte le format (1, 2, 3 ou 4)                        │
│    - Normalise en { type, data/content, metadata }           │
│    - Retourne { success: true, data: normalized }            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. N8nSendBox.tsx                                            │
│    - Reçoit responseData                                     │
│    - Appelle parseN8nResponse(responseData)                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. n8nResponseParser.ts                                      │
│    - Route selon data.type                                   │
│    - Convertit en markdown                                   │
│    - Retourne string markdown                                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 9. N8nSendBox.tsx                                            │
│    - Met à jour le message assistant avec le markdown        │
│    - addOrUpdateMessage({ content: markdown })               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 10. N8nChat.tsx / MessageList                                │
│     - Affiche le markdown formaté                            │
│     - Tableaux, titres, liens, etc.                          │
└─────────────────────────────────────────────────────────────┘
```

## 🔌 Points d'Intégration

### 1. Configuration des Routes (React Router)
```typescript
// Dans le fichier de routing principal
import N8nChat from '@renderer/pages/conversation/n8n/N8nChat';

<Route path="/n8n/:conversation_id" element={<N8nChat />} />
```

### 2. Menu de Sélection
```typescript
// Dans assistantPresets.ts
{
  id: 'n8n-workflow',
  name: 'n8n Workflow',
  description: 'Exécution de workflows n8n',
  component: 'N8nChat',
  icon: '🔄'
}
```

### 3. Script de Démarrage Global
```powershell
# Dans START_COMPLETE.ps1
$n8nBackendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    .\scripts\start-n8n-agent.ps1
}
```

## 📊 Gestion des Erreurs

### Frontend (N8nSendBox.tsx)
```typescript
try {
  const responseData = await sendN8nRequest(content);
  const markdown = parseN8nResponse(responseData);
  // Mise à jour du message
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
  
  // Détection du type d'erreur
  if (errorMessage.includes('timeout')) {
    // Suggestions pour timeout
  } else if (errorMessage.includes('Network')) {
    // Suggestions pour problème réseau
  }
  
  // Affichage du message d'erreur avec troubleshooting
}
```

### Backend (n8n-server.ts)
```typescript
try {
  // Appel n8n
} catch (error: any) {
  let errorType = 'unknown';
  
  if (error.name === 'AbortError') {
    errorType = 'timeout';
  } else if (error.message.includes('Failed to fetch')) {
    errorType = 'network';
  }
  
  res.status(500).json({
    success: false,
    error: errorMessage,
    errorType
  });
}
```

## 🔒 Sécurité

### CORS
```typescript
app.use(cors()); // Activé pour toutes les origines
```

### Validation des Entrées
```typescript
if (!userMessage || typeof userMessage !== 'string') {
  return res.status(400).json({
    success: false,
    error: 'userMessage is required and must be a string'
  });
}
```

### Timeout
```typescript
const N8N_TIMEOUT = 10 * 60 * 1000; // Protection contre les requêtes infinies
```

## 📈 Performance

### Optimisations
1. **Fetch natif Node.js 18+** - Pas de dépendance externe
2. **Timeout configurable** - Évite les blocages
3. **Logs détaillés** - Monitoring des performances
4. **Normalisation côté backend** - Réduit le travail frontend

### Métriques
```typescript
const startTime = Date.now();
// ... appel n8n ...
const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
console.log(`Response time: ${elapsedTime}s`);
```

## 🧪 Tests

### Test du Backend
```bash
# Health check
curl http://localhost:3458/health

# Exécution
curl -X POST http://localhost:3458/api/n8n/execute \
  -H "Content-Type: application/json" \
  -d '{"userMessage":"Test"}'
```

### Test du Frontend
1. Démarrer le backend
2. Ouvrir l'application
3. Sélectionner "n8n Workflow"
4. Envoyer un message de test
5. Vérifier l'affichage du résultat

## 📝 Logs et Debugging

### Backend Logs
```typescript
console.log('📥 Received request:', { userMessage, attachments });
console.log('🔄 Calling n8n endpoint:', N8N_ENDPOINT);
console.log('📡 Response status:', response.status);
console.log('✅ n8n response received');
console.log('🔍 Normalizing n8n response...');
```

### Frontend Logs
```typescript
// Automatiques via les messages d'erreur dans l'interface
```

## 🔄 Évolutions Possibles

1. **Cache des réponses** - Éviter les appels répétés
2. **Authentification** - Sécuriser l'accès au backend
3. **Rate limiting** - Limiter le nombre de requêtes
4. **Webhooks bidirectionnels** - Notifications en temps réel
5. **Support multi-workflows** - Sélection du workflow à exécuter
6. **Historique des requêtes** - Sauvegarde et rejeu
