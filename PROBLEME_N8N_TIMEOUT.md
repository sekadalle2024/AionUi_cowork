# Problème: Timeout N8N Workflow

## Erreur observée

```
[n8nService] Workflow execution failed: TypeError: fetch failed
HeadersTimeoutError: Headers Timeout Error
code: 'UND_ERR_HEADERS_TIMEOUT'
```

## Cause

Le serveur N8N backend n'est pas démarré ou n'est pas accessible sur `http://localhost:3458`.

## Solution

### 1. Vérifier si le serveur N8N backend est démarré

```bash
# Dans un terminal séparé, vérifier si le port 3458 est utilisé
netstat -ano | findstr :3458
```

### 2. Démarrer le serveur N8N backend

**Option A: Démarrage manuel**
```bash
# Dans le dossier du projet
cd n8n-server
npm start
```

**Option B: Démarrage avec le script**
```bash
# À la racine du projet
npm run start:all
```

Ce script démarre à la fois:
- L'application AIONUI (port 5173)
- Le serveur N8N backend (port 3458)

### 3. Vérifier que le serveur répond

```bash
# Test de connexion
curl http://localhost:3458/health
```

Ou ouvrir dans le navigateur: http://localhost:3458/health

### 4. Vérifier la configuration

**Fichier**: `src/agent/n8n/n8n-server.ts`

Vérifier que l'URL est correcte:
```typescript
const N8N_BACKEND_URL = 'http://localhost:3458';
```

## Commande recommandée

Pour éviter ce problème, toujours utiliser:

```bash
npm run start:all
```

Au lieu de:
```bash
bun run start  # Lance seulement AIONUI, pas le serveur N8N
```

## Vérification rapide

1. ✅ Serveur N8N backend démarré sur port 3458
2. ✅ Workflow N8N actif dans l'interface N8N
3. ✅ Endpoint webhook configuré
4. ✅ Pas de firewall bloquant le port 3458

## Logs à surveiller

Quand le serveur N8N backend démarre correctement, vous devriez voir:
```
N8N Backend Server listening on port 3458
N8N workflow endpoint ready
```

## Si le problème persiste

1. Vérifier les logs du serveur N8N backend
2. Vérifier que le workflow N8N est bien actif
3. Tester l'endpoint directement avec curl ou Postman
4. Vérifier les paramètres de timeout dans `n8n-server.ts`
