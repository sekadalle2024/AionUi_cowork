# Correction - Activation du système de login

## Problème

Le système de login ne s'activait pas au démarrage même après avoir activé l'option dans Settings → Sécurité.

## Cause

Dans `src/renderer/context/AuthContext.tsx`, la fonction `refresh()` authentifiait automatiquement l'utilisateur en mode desktop sans vérifier si le login était activé dans la configuration.

```typescript
// Code problématique
const refresh = useCallback(async () => {
  if (isDesktopRuntime) {
    setStatus('authenticated');  // ❌ Authentification automatique
    setUser(null);
    setReady(true);
    return;
  }
  // ...
}, []);
```

## Solution

Ajout de la vérification de `security.loginEnabled` avant d'authentifier automatiquement :

### 1. Import de ConfigStorage

```typescript
import { ConfigStorage } from '@/common/storage';
```

### 2. Vérification du paramètre de sécurité

```typescript
const refresh = useCallback(async () => {
  if (isDesktopRuntime) {
    try {
      const loginEnabled = await ConfigStorage.get('security.loginEnabled');
      
      if (loginEnabled === true) {
        // Vérifier si l'utilisateur a une session valide
        const loggedIn = localStorage.getItem('eaudit_logged_in');
        const loginTime = localStorage.getItem('eaudit_login_time');
        
        if (loggedIn === 'true' && loginTime) {
          const elapsed = Date.now() - parseInt(loginTime, 10);
          const sessionDuration = 24 * 60 * 60 * 1000; // 24 heures
          
          if (elapsed < sessionDuration) {
            // Session valide
            setStatus('authenticated');
            setUser({ id: 'desktop-user', username: 'Desktop User' });
            setReady(true);
            return;
          } else {
            // Session expirée
            localStorage.removeItem('eaudit_logged_in');
            localStorage.removeItem('eaudit_login_time');
          }
        }
        
        // Pas de session valide, demander le login
        setStatus('unauthenticated');
        setUser(null);
        setReady(true);
        return;
      }
    } catch (error) {
      console.error('Failed to check login settings:', error);
    }
    
    // Login non requis, authentifier automatiquement
    setStatus('authenticated');
    setUser(null);
    setReady(true);
    return;
  }
  // ... reste du code pour WebUI
}, []);
```

### 3. Amélioration de la fonction login

```typescript
const login = useCallback(async ({ username, password, remember }: LoginParams): Promise<LoginResult> => {
  try {
    if (isDesktopRuntime) {
      // Validation simple pour le mode desktop
      if (!username || !password) {
        return {
          success: false,
          message: 'Veuillez remplir tous les champs',
          code: 'invalidCredentials',
        };
      }
      
      // Stocker l'état de connexion
      localStorage.setItem('eaudit_logged_in', 'true');
      localStorage.setItem('eaudit_login_time', Date.now().toString());
      
      setUser({ id: 'desktop-user', username });
      setStatus('authenticated');
      setReady(true);
      return { success: true };
    }
    // ... reste du code pour WebUI
  } catch (error) {
    // ...
  }
}, []);
```

## Flux d'authentification corrigé

### Au démarrage de l'application

```
1. AuthContext.refresh() est appelé
2. Vérification: isDesktopRuntime?
   ├─ Oui (Desktop)
   │  ├─ Lire: security.loginEnabled
   │  │  ├─ true → Vérifier session localStorage
   │  │  │  ├─ Session valide (< 24h) → Authentifier
   │  │  │  └─ Session invalide → status = 'unauthenticated' → Afficher /login
   │  │  └─ false → Authentifier automatiquement
   │  └─ ...
   └─ Non (WebUI)
      └─ Vérifier avec le serveur
```

### Lors de la connexion

```
1. Utilisateur entre username/password
2. login({ username, password }) est appelé
3. Desktop:
   ├─ Validation (champs non vides)
   ├─ Stockage: eaudit_logged_in = 'true'
   ├─ Stockage: eaudit_login_time = Date.now()
   ├─ setUser({ id: 'desktop-user', username })
   ├─ setStatus('authenticated')
   └─ Redirection vers /guid (via router)
```

## Fichiers modifiés

- `src/renderer/context/AuthContext.tsx`
  - Ajout de l'import `ConfigStorage`
  - Modification de la fonction `refresh()` pour vérifier `security.loginEnabled`
  - Modification de la fonction `login()` pour stocker correctement la session

## Test

1. **Activer le login**:
   ```
   Settings → Sécurité → Activer "Écran de connexion"
   ```

2. **Redémarrer l'application**:
   ```bash
   # Fermer l'application
   # Relancer
   bun run start
   ```

3. **Vérifier**:
   - L'écran de login doit s'afficher
   - Entrer n'importe quel username/password
   - Cliquer "Se connecter"
   - Doit rediriger vers la page d'accueil

4. **Vérifier la persistance**:
   - Fermer l'application
   - Rouvrir dans les 24h
   - Doit rester connecté (pas de login)

5. **Désactiver le login**:
   ```
   Settings → Sécurité → Désactiver "Écran de connexion"
   Redémarrer l'application
   ```
   - Doit ouvrir directement la page d'accueil

## Clés de stockage

### ConfigStorage (persistant)
- `security.loginEnabled` (boolean) - Active/désactive le login

### localStorage (session)
- `eaudit_logged_in` ('true' | null) - État de connexion
- `eaudit_login_time` (timestamp string) - Date de connexion

## Notes

- La session est valide pendant 24 heures
- Après 24h, l'utilisateur doit se reconnecter
- La validation des identifiants est simple (tout est accepté)
- Pour la production, il faudra ajouter une vraie validation

## Statut

✅ **Correction appliquée**

Le système de login fonctionne maintenant correctement :
- S'active quand `security.loginEnabled = true`
- Affiche l'écran de login au démarrage
- Gère la session (24h)
- Se désactive quand `security.loginEnabled = false`
