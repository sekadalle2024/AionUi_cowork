# Guide de dépannage n8n

## 🚨 Problèmes fréquents

### 1. Erreur 500 - Workflow non publié

**Symptôme**:
```
❌ Erreur: HTTP error! status: 500
```

**Cause**: Le workflow n8n a été modifié mais pas publié.

**Solution étape par étape**:
1. Ouvrir n8n dans le navigateur: http://localhost:5678
2. Ouvrir le workflow concerné
3. Cliquer sur le bouton "Activate" en haut à droite
4. Vérifier que le statut passe à "Active" (vert)
5. Tester à nouveau dans E-audit

**Vérification**:
```bash
node n8n-server/scripts/test-workflow.js
```

---

### 2. Erreur de connexion réseau

**Symptôme**:
```
❌ Network error: Unable to connect to n8n endpoint
```

**Causes possibles**:

#### A. Backend n8n non démarré
```bash
# Vérifier
curl http://localhost:3458/health

# Si erreur, démarrer
npm run start:all
```

#### B. Serveur n8n non démarré
```bash
# Vérifier
curl http://localhost:5678

# Si erreur, démarrer
n8n start
```

#### C. Port déjà utilisé
```bash
# Windows
netstat -ano | findstr :3458
netstat -ano | findstr :5678

# Tuer le processus si nécessaire
taskkill /PID <PID> /F
```

---

### 3. Timeout

**Symptôme**:
```
❌ Request timeout (>600s)
```

**Causes**:
- Le workflow prend trop de temps à s'exécuter
- Appel API externe lent
- Boucle infinie dans le workflow

**Solutions**:

1. **Augmenter le timeout** (temporaire):
   Éditer `src/agent/n8n/n8n-server.ts`:
   ```typescript
   const N8N_TIMEOUT = 20 * 60 * 1000; // 20 minutes
   ```

2. **Optimiser le workflow**:
   - Réduire le nombre d'appels API
   - Utiliser le cache quand possible
   - Paralléliser les opérations

3. **Diviser en plusieurs workflows**:
   - Créer des workflows plus petits
   - Chaîner les workflows si nécessaire

---

### 4. Réponse vide ou incorrecte

**Symptôme**: Le workflow s'exécute mais retourne une réponse vide ou mal formatée.

**Diagnostic**:
1. Vérifier les logs du backend:
   ```
   🔍 Normalizing n8n response...
   ⚠️ Unknown format, returning raw
   ```

2. Vérifier le format de sortie du workflow n8n

**Solution**:
Le parser attend l'un de ces formats:

**Format 1**: Array avec output
```json
[{
  "output": "Texte de réponse",
  "stats": {}
}]
```

**Format 2**: Object avec tables
```json
{
  "tables": [...],
  "status": "success",
  "tables_found": 2
}
```

**Format 3**: Direct output
```json
{
  "output": "Texte de réponse"
}
```

**Format 4**: Programme de travail
```json
[{
  "data": {
    "table1": {...},
    "table2": [...]
  }
}]
```

---

### 5. Erreur CORS

**Symptôme**:
```
Access to fetch at 'http://localhost:3458' from origin 'http://localhost:5173' has been blocked by CORS
```

**Solution**: Le backend a déjà CORS activé. Si l'erreur persiste:

1. Vérifier que le backend est bien démarré
2. Redémarrer le backend
3. Vider le cache du navigateur

---

### 6. Erreur de parsing JSON

**Symptôme**:
```
SyntaxError: Unexpected token < in JSON at position 0
```

**Cause**: n8n retourne du HTML au lieu de JSON (souvent une page d'erreur).

**Solution**:
1. Vérifier l'URL du webhook dans n8n-server.ts
2. Vérifier que le workflow est configuré pour retourner du JSON
3. Consulter les logs n8n pour voir l'erreur exacte

---

## 🔍 Commandes de diagnostic

### Vérification rapide
```bash
# Backend
curl http://localhost:3458/health

# n8n
curl http://localhost:5678

# Test complet
node n8n-server/scripts/diagnose.js
```

### Logs en temps réel
```bash
# Backend n8n
# Les logs s'affichent dans la console où le backend est démarré

# n8n
# Consulter l'interface web: http://localhost:5678
```

### Test manuel du webhook
```bash
curl -X POST http://localhost:5678/webhook/template \
  -H "Content-Type: application/json" \
  -d '{"question": "Test manuel"}'
```

---

## 📋 Checklist de dépannage

Suivre cette checklist dans l'ordre:

1. [ ] Le backend n8n répond-il?
   ```bash
   curl http://localhost:3458/health
   ```

2. [ ] Le serveur n8n répond-il?
   ```bash
   curl http://localhost:5678
   ```

3. [ ] Le workflow est-il actif?
   - Ouvrir http://localhost:5678
   - Vérifier le statut "Active"

4. [ ] Le workflow est-il publié?
   - Vérifier qu'il n'y a pas de modifications non publiées

5. [ ] L'URL du webhook est-elle correcte?
   - Vérifier dans n8n-server.ts
   - Comparer avec l'URL dans n8n

6. [ ] Le workflow retourne-t-il le bon format?
   - Tester avec le script de diagnostic
   - Vérifier les logs

7. [ ] Y a-t-il des erreurs dans les logs?
   - Backend: console où il est démarré
   - n8n: interface web

---

## 🆘 Procédure de redémarrage complet

Si rien ne fonctionne, redémarrer tout:

```bash
# 1. Arrêter tous les processus
# Ctrl+C dans toutes les consoles

# 2. Vérifier qu'aucun processus ne tourne
netstat -ano | findstr :3458
netstat -ano | findstr :5678

# 3. Tuer les processus si nécessaire
taskkill /PID <PID> /F

# 4. Redémarrer n8n
n8n start

# 5. Attendre que n8n soit prêt (http://localhost:5678)

# 6. Vérifier que le workflow est actif et publié

# 7. Redémarrer l'application
npm run start:all

# 8. Tester
node n8n-server/scripts/diagnose.js
```

---

## 📞 Obtenir de l'aide

Si le problème persiste après avoir suivi ce guide:

1. Exécuter le diagnostic complet:
   ```bash
   node n8n-server/scripts/diagnose.js > diagnostic.log 2>&1
   ```

2. Copier les logs du backend

3. Copier les logs de n8n

4. Noter les étapes exactes pour reproduire le problème

5. Consulter la documentation n8n: https://docs.n8n.io
