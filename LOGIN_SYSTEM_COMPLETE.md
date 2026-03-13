# Système de Login E-audit - Implémentation Complète

## Vue d'ensemble

Un système de login optionnel a été ajouté à E-audit. L'utilisateur peut activer ou désactiver l'écran de connexion via les paramètres.

## Fonctionnalités

### 1. Écran de connexion
- Logo E-audit
- Slogan: "Automatisez vos activités, d'audit, risque et contrôle"
- Champs: Nom d'utilisateur et mot de passe
- Option "Se souvenir de moi"
- Sélecteur de langue
- Design moderne et responsive

### 2. Page de paramètres de sécurité
- Activation/désactivation du login
- Accessible via Settings → Sécurité
- Icône: Puzzle
- Sauvegarde automatique des préférences

### 3. Gestion de session
- Session valide pendant 24 heures
- Stockage local sécurisé
- Déconnexion automatique après expiration

## Fichiers créés/modifiés

### Nouveaux fichiers

1. **src/renderer/pages/settings/SecuritySettings.tsx**
   - Page de paramètres de sécurité
   - Toggle pour activer/désactiver le login
   - Informations sur le fonctionnement

2. **src/renderer/pages/login/LoginPage.tsx**
   - Page de login existante (déjà présente)
   - Utilise le logo E-audit
   - Intégration avec AuthContext

3. **src/renderer/components/ProtectedRoute.tsx**
   - Composant de protection des routes (créé mais non utilisé)
   - L'AuthContext gère déjà la protection

### Fichiers modifiés

1. **src/renderer/context/AuthContext.tsx**
   - Ajout de la vérification des paramètres de sécurité
   - Support du login desktop optionnel
   - Gestion de session 24h
   - Fonctions: `checkDesktopLoginRequired()`, `checkDesktopLoginStatus()`

2. **src/renderer/router.tsx**
   - Ajout de la route `/settings/security`
   - Import de `SecuritySettings`

3. **src/renderer/pages/settings/SettingsSider.tsx**
   - Ajout de l'option "Sécurité" dans le menu
   - Icône Puzzle
   - Position: entre System et About

## Configuration

### Clé de stockage

```typescript
'security.loginEnabled' // boolean - true = login activé, false = désactivé
```

### Stockage local (session)

```typescript
'eaudit_logged_in'    // 'true' si connecté
'eaudit_login_time'   // timestamp de connexion
```

## Utilisation

### Pour l'utilisateur

1. **Activer le login**:
   - Ouvrir Settings (icône engrenage en bas à gauche)
   - Cliquer sur "Sécurité"
   - Activer le toggle "Écran de connexion"
   - Redémarrer l'application

2. **Se connecter**:
   - Entrer n'importe quel nom d'utilisateur et mot de passe
   - (Note: Validation simple pour le moment, à améliorer en production)
   - Cliquer sur "Se connecter"

3. **Désactiver le login**:
   - Aller dans Settings → Sécurité
   - Désactiver le toggle
   - Le login ne sera plus demandé au prochain démarrage

### Pour le développeur

#### Vérifier si le login est activé

```typescript
import { ConfigStorage } from '@/common/storage';

const loginEnabled = await ConfigStorage.get('security.loginEnabled');
if (loginEnabled === true) {
  // Login is required
}
```

#### Vérifier si l'utilisateur est connecté

```typescript
import { useAuth } from '@/renderer/context/AuthContext';

const { status, user } = useAuth();

if (status === 'authenticated') {
  // User is logged in
  console.log('User:', user);
}
```

#### Déconnecter l'utilisateur

```typescript
import { useAuth } from '@/renderer/context/AuthContext';

const { logout } = useAuth();

await logout();
```

## Flux d'authentification

### Au démarrage de l'application

```
1. AuthContext.refresh() est appelé
2. Vérification: isDesktopRuntime?
   ├─ Oui (Desktop)
   │  ├─ Vérifier: security.loginEnabled?
   │  │  ├─ Non → Authentifier automatiquement
   │  │  └─ Oui → Vérifier session locale
   │  │     ├─ Session valide → Authentifier
   │  │     └─ Session invalide → Rediriger vers /login
   │  └─ ...
   └─ Non (WebUI)
      └─ Vérifier avec le serveur
```

### Lors de la connexion

```
1. Utilisateur entre username/password
2. login({ username, password }) est appelé
3. Desktop:
   ├─ Validation simple (champs non vides)
   ├─ Stockage: eaudit_logged_in = true
   ├─ Stockage: eaudit_login_time = now
   └─ Redirection vers /guid
4. WebUI:
   └─ Requête POST /login avec CSRF token
```

### Expiration de session

- Durée: 24 heures
- Vérification: À chaque refresh de l'AuthContext
- Action: Suppression des données locales + redirection vers /login

## Sécurité

### Niveau actuel (MVP)

- ✅ Activation/désactivation du login
- ✅ Stockage local de la session
- ✅ Expiration automatique (24h)
- ✅ Protection des routes via AuthContext
- ⚠️ Validation simple (tout username/password accepté)

### Améliorations recommandées pour la production

1. **Validation des identifiants**
   ```typescript
   // Ajouter une base de données locale ou un fichier de config
   const VALID_USERS = {
     'admin': 'hashed_password_here'
   };
   ```

2. **Hachage des mots de passe**
   ```typescript
   import bcrypt from 'bcryptjs';
   
   const isValid = await bcrypt.compare(password, storedHash);
   ```

3. **Limitation des tentatives**
   ```typescript
   // Bloquer après 5 tentatives échouées
   const MAX_ATTEMPTS = 5;
   const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
   ```

4. **Chiffrement du stockage local**
   ```typescript
   import { safeStorage } from 'electron';
   
   const encrypted = safeStorage.encryptString(sessionData);
   ```

5. **Gestion des rôles**
   ```typescript
   type UserRole = 'admin' | 'auditor' | 'viewer';
   
   interface User {
     id: string;
     username: string;
     role: UserRole;
   }
   ```

## Tests

### Test manuel

1. **Sans login activé** (par défaut):
   ```bash
   bun run start
   # → Devrait ouvrir directement la page d'accueil
   ```

2. **Avec login activé**:
   ```bash
   bun run start
   # → Aller dans Settings → Sécurité
   # → Activer "Écran de connexion"
   # → Redémarrer l'application
   # → Devrait afficher l'écran de login
   ```

3. **Connexion**:
   - Entrer n'importe quel username/password
   - Cliquer "Se connecter"
   - → Devrait rediriger vers la page d'accueil

4. **Session persistante**:
   - Se connecter
   - Fermer l'application
   - Rouvrir dans les 24h
   - → Devrait rester connecté

5. **Expiration**:
   - Modifier manuellement `eaudit_login_time` dans localStorage
   - Mettre une date > 24h dans le passé
   - Rafraîchir
   - → Devrait rediriger vers /login

### Tests automatisés (à implémenter)

```typescript
// tests/unit/auth-context.test.ts
describe('AuthContext', () => {
  it('should authenticate when login is disabled', async () => {
    // ...
  });

  it('should require login when enabled', async () => {
    // ...
  });

  it('should expire session after 24 hours', async () => {
    // ...
  });
});
```

## Dépannage

### Le login ne s'affiche pas

1. Vérifier que le login est activé:
   ```javascript
   // Dans la console DevTools (F12)
   localStorage.getItem('eaudit_logged_in')
   ```

2. Vérifier la configuration:
   ```javascript
   // Dans la console
   const { ConfigStorage } = require('@/common/storage');
   ConfigStorage.get('security.loginEnabled').then(console.log);
   ```

3. Forcer l'affichage du login:
   ```javascript
   localStorage.removeItem('eaudit_logged_in');
   localStorage.removeItem('eaudit_login_time');
   location.reload();
   ```

### Impossible de se connecter

1. Vérifier la console pour les erreurs
2. S'assurer que les champs ne sont pas vides
3. Vérifier que l'AuthContext est bien chargé

### Le login reste affiché après connexion

1. Vérifier que la redirection fonctionne
2. Vérifier l'état de l'AuthContext:
   ```javascript
   // Dans React DevTools
   // Chercher AuthContext → status devrait être 'authenticated'
   ```

## Roadmap

### Phase 1: MVP ✅
- [x] Écran de login basique
- [x] Page de paramètres
- [x] Activation/désactivation
- [x] Gestion de session simple

### Phase 2: Sécurité (À faire)
- [ ] Validation des identifiants
- [ ] Hachage des mots de passe
- [ ] Limitation des tentatives
- [ ] Chiffrement du stockage

### Phase 3: Fonctionnalités avancées (À faire)
- [ ] Gestion multi-utilisateurs
- [ ] Rôles et permissions
- [ ] Historique des connexions
- [ ] Authentification à deux facteurs (2FA)
- [ ] Intégration LDAP/Active Directory

## Conclusion

Le système de login est maintenant fonctionnel et peut être activé/désactivé par l'utilisateur. Il offre une couche de sécurité basique pour protéger l'accès à l'application.

Pour une utilisation en production, il est fortement recommandé d'implémenter les améliorations de sécurité listées ci-dessus.
