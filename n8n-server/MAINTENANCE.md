# Guide de maintenance n8n

## 📅 Tâches de maintenance régulières

### Quotidien
- [ ] Vérifier que les services sont démarrés
- [ ] Consulter les logs pour détecter les erreurs
- [ ] Tester une requête simple

### Hebdomadaire
- [ ] Exécuter le diagnostic complet
- [ ] Vérifier les performances (temps de réponse)
- [ ] Nettoyer les logs anciens
- [ ] Vérifier l'espace disque

### Mensuel
- [ ] Sauvegarder les workflows n8n
- [ ] Mettre à jour la documentation
- [ ] Réviser les configurations
- [ ] Optimiser les workflows lents

## 🔧 Scripts de maintenance

### Tests automatisés
```bash
# Test rapide de connexion
node n8n-server/scripts/test-connection.js

# Diagnostic complet
node n8n-server/scripts/diagnose.js

# Test direct du workflow
node n8n-server/scripts/test-workflow.js
```

### Monitoring
```bash
# Vérifier les processus
netstat -ano | findstr :3458
netstat -ano | findstr :5678

# Vérifier l'utilisation mémoire
tasklist | findstr node
```

## 📊 Métriques à surveiller

### Performance
- **Temps de réponse**: < 30 secondes pour les requêtes simples
- **Taux de succès**: > 95%
- **Utilisation mémoire**: < 1GB par processus

### Disponibilité
- **Backend n8n**: 99.9% uptime
- **Serveur n8n**: 99.9% uptime
- **Temps de récupération**: < 5 minutes

## 🚨 Alertes et seuils

### Alertes critiques
- Service indisponible > 5 minutes
- Taux d'erreur > 10%
- Temps de réponse > 2 minutes

### Alertes d'avertissement
- Utilisation mémoire > 80%
- Temps de réponse > 1 minute
- Taux d'erreur > 5%

## 🔄 Procédures de redémarrage

### Redémarrage planifié
1. Notifier les utilisateurs
2. Arrêter l'application E-audit
3. Arrêter le backend n8n
4. Arrêter n8n
5. Redémarrer n8n
6. Vérifier que n8n est opérationnel
7. Redémarrer le backend n8n
8. Vérifier la connectivité
9. Redémarrer l'application E-audit
10. Tester le fonctionnement

### Redémarrage d'urgence
```bash
# Arrêt forcé
taskkill /F /IM node.exe
taskkill /F /IM electron.exe

# Redémarrage
n8n start &
npm run start:all

# Vérification
node n8n-server/scripts/diagnose.js
```

## 📝 Logs et monitoring

### Emplacements des logs
- **Backend n8n**: Console où le processus est démarré
- **n8n**: Interface web + logs système
- **Application E-audit**: Console Electron

### Rotation des logs
```bash
# Créer un script de rotation (Windows)
# rotate-logs.bat
@echo off
set LOG_DIR=logs
if not exist %LOG_DIR% mkdir %LOG_DIR%
move backend.log %LOG_DIR%\backend_%date:~-4,4%%date:~-10,2%%date:~-7,2%.log
```

### Analyse des logs
```bash
# Rechercher les erreurs
findstr /i "error" backend.log

# Compter les requêtes
findstr /c "📥 Received request" backend.log

# Analyser les temps de réponse
findstr /c "Response status" backend.log
```

## 🔐 Sécurité

### Bonnes pratiques
- Utiliser HTTPS en production
- Limiter l'accès aux ports (3458, 5678)
- Authentification pour n8n
- Logs d'audit

### Sauvegarde
```bash
# Sauvegarder les workflows n8n
# Via l'interface n8n: Settings > Import/Export

# Sauvegarder la configuration
copy src\agent\n8n\n8n-server.ts backup\
copy n8n-server\* backup\n8n-server\
```

## 📈 Optimisation des performances

### Workflow n8n
- Utiliser le cache quand possible
- Limiter les appels API externes
- Paralléliser les opérations indépendantes
- Optimiser les requêtes de base de données

### Backend
- Augmenter le timeout si nécessaire
- Implémenter un cache de réponses
- Utiliser la compression gzip
- Monitorer l'utilisation mémoire

### Application
- Limiter les requêtes simultanées
- Implémenter un retry automatique
- Afficher des indicateurs de progression
- Gérer les timeouts côté client

## 🆘 Procédures d'urgence

### Service indisponible
1. Vérifier l'état des processus
2. Consulter les logs d'erreur
3. Redémarrer les services
4. Tester la connectivité
5. Notifier les utilisateurs si nécessaire

### Performance dégradée
1. Identifier le goulot d'étranglement
2. Vérifier l'utilisation des ressources
3. Optimiser le workflow responsable
4. Redémarrer si nécessaire

### Corruption de données
1. Arrêter tous les services
2. Restaurer depuis la sauvegarde
3. Vérifier l'intégrité
4. Redémarrer les services
5. Tester le fonctionnement

## 📞 Contacts et escalade

### Niveau 1: Auto-diagnostic
- Exécuter les scripts de test
- Consulter la documentation
- Redémarrage simple

### Niveau 2: Investigation
- Analyser les logs détaillés
- Tester les composants individuellement
- Consulter la documentation n8n

### Niveau 3: Escalade
- Problème complexe nécessitant une expertise
- Impact critique sur la production
- Corruption de données

## 📚 Documentation de référence

### Interne
- `n8n-server/README.md` - Vue d'ensemble
- `n8n-server/TROUBLESHOOTING.md` - Guide de dépannage
- `src/agent/n8n/README.md` - Documentation technique

### Externe
- [Documentation n8n](https://docs.n8n.io)
- [API n8n](https://docs.n8n.io/api/)
- [Community n8n](https://community.n8n.io)