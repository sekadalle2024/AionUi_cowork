# Instructions pour voir la nouvelle page de login

## Problème

Vous voyez toujours l'ancienne page de login avec "AionUi" et le sélecteur de langue.

## Cause

L'application n'a pas été complètement redémarrée, ou le cache du navigateur/Electron n'a pas été vidé.

## Solution

### Étape 1: Arrêter complètement l'application

1. **Fermer la fenêtre de l'application E-audit**
2. **Arrêter le serveur de développement** dans le terminal:
   - Appuyez sur `Ctrl+C` dans le terminal où `bun run start` est en cours
   - Attendez que le processus se termine complètement

### Étape 2: Nettoyer le cache (IMPORTANT)

```bash
# Supprimer les fichiers de build
rm -rf out/
rm -rf dist/

# Supprimer le cache Vite
rm -rf node_modules/.vite
```

Ou sur Windows PowerShell:
```powershell
Remove-Item -Recurse -Force out/
Remove-Item -Recurse -Force dist/
Remove-Item -Recurse -Force node_modules/.vite
```

### Étape 3: Redémarrer l'application

```bash
bun run start
```

### Étape 4: Vérifier

1. L'application devrait se lancer
2. Aller dans **Settings → Sécurité**
3. Vérifier que "Écran de connexion" est **activé** (toggle à droite)
4. **Fermer complètement l'application** (pas juste la fenêtre)
5. **Relancer** l'application

Vous devriez maintenant voir la nouvelle page de login avec:
- ✅ Logo E-audit (depuis /logo_projet/)
- ✅ Titre "E-audit"
- ✅ Deux onglets: "Se connecter" et "S'inscrire"
- ✅ Thème gris
- ✅ Pas de sélecteur de langue

## Si ça ne fonctionne toujours pas

### Vérification 1: Mode d'exécution

Assurez-vous que vous lancez bien l'application en mode **desktop** et non en mode **WebUI**:

```bash
# Mode desktop (correct)
bun run start

# Mode WebUI (incorrect pour ce test)
bun run webui
```

### Vérification 2: Paramètre de sécurité

Ouvrez la console DevTools (F12) et exécutez:

```javascript
// Vérifier si le login est activé
const { ConfigStorage } = require('@/common/storage');
ConfigStorage.get('security.loginEnabled').then(console.log);
// Devrait afficher: true
```

Si c'est `false` ou `undefined`:

```javascript
// Activer le login
ConfigStorage.set('security.loginEnabled', true).then(() => {
  console.log('Login activé');
  // Redémarrer l'application
});
```

### Vérification 3: Session en cours

Si vous avez une session active, le login ne s'affichera pas. Pour forcer l'affichage:

```javascript
// Dans la console DevTools (F12)
localStorage.removeItem('eaudit_logged_in');
localStorage.removeItem('eaudit_login_time');
location.reload();
```

## Dépannage avancé

### Problème: Cache navigateur persistant

Si le cache persiste malgré tout:

1. Ouvrir DevTools (F12)
2. Aller dans l'onglet **Application** (ou **Storage**)
3. Cliquer sur **Clear storage** (ou **Effacer le stockage**)
4. Cocher toutes les cases
5. Cliquer sur **Clear site data**
6. Fermer et relancer l'application

### Problème: Build corrompu

Si rien ne fonctionne, rebuild complet:

```bash
# Arrêter l'application
# Ctrl+C dans le terminal

# Nettoyer TOUT
rm -rf out/ dist/ node_modules/.vite

# Rebuild
bun run start
```

## Vérification finale

Une fois l'application relancée avec le login activé, vous devriez voir:

```
┌─────────────────────────────────┐
│                                 │
│         [Logo E-audit]          │
│                                 │
│           E-audit               │
│  Automatisez vos activités...   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Se connecter │ S'inscrire│   │
│  ├─────────────────────────┤   │
│  │                         │   │
│  │  [Nom d'utilisateur]    │   │
│  │  [Mot de passe]         │   │
│  │                         │   │
│  │  [Se connecter]         │   │
│  │                         │   │
│  └─────────────────────────┘   │
│                                 │
│  © 2025 E-audit                 │
│                                 │
└─────────────────────────────────┘
```

**Pas de**:
- ❌ Sélecteur de langue en haut à droite
- ❌ Texte "AionUi"
- ❌ Logo AionUi (triangle)
- ❌ Fond bleu/violet

**Avec**:
- ✅ Logo E-audit (votre logo)
- ✅ Texte "E-audit"
- ✅ Thème gris
- ✅ Onglets Se connecter / S'inscrire

## Contact

Si après toutes ces étapes vous voyez toujours l'ancienne page, il se peut que:
1. Vous soyez en mode WebUI au lieu de desktop
2. Il y ait un autre fichier de login que je n'ai pas modifié
3. Le cache soit dans un autre emplacement

Dans ce cas, envoyez-moi une capture d'écran et la commande exacte que vous utilisez pour lancer l'application.
