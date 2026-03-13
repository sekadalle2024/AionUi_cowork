# Refonte de la page de login E-audit

## Modifications apportées

### 1. Branding E-audit ✅

**Logo**
- Utilise maintenant le logo depuis `/logo_projet/android-chrome-512x512.png`
- Taille: 96x96px (w-24 h-24)
- Positionnement: Centré au-dessus du titre

**Nom de l'application**
- Changé de "AionUi" à "E-audit"
- Police: text-3xl font-bold
- Couleur: text-text-1 (couleur de texte principale du thème)

**Slogan**
- "Automatisez vos activités, d'audit, risque et contrôle"
- Police: text-base
- Couleur: text-text-2 (couleur de texte secondaire)

### 2. Système Sign In / Sign Up ✅

**Onglets**
- Utilise le composant `Tabs` d'Arco Design
- Type: 'rounded' pour un style moderne
- Deux onglets:
  - "Se connecter" (Sign In)
  - "S'inscrire" (Sign Up)

**Sign In (Se connecter)**
- Champs:
  - Nom d'utilisateur
  - Mot de passe
- Bouton: "Se connecter"
- Validation: Tous les champs requis
- Intégration avec `useAuth()` pour l'authentification

**Sign Up (S'inscrire)**
- Champs:
  - Nom d'utilisateur
  - Mot de passe
  - Confirmer le mot de passe
- Bouton: "Créer un compte"
- Validations:
  - Tous les champs requis
  - Mots de passe identiques
  - Mot de passe minimum 6 caractères
- Après inscription: Redirection vers l'onglet Sign In

### 3. Thème gris (thème par défaut) ✅

**Classes UnoCSS utilisées**
- `bg-fill-1` - Fond de la page (gris clair)
- `bg-fill-2` - Fond de la carte (gris plus clair)
- `text-text-1` - Texte principal (gris foncé)
- `text-text-2` - Texte secondaire (gris moyen)
- `text-text-3` - Texte tertiaire (gris clair)
- `border-border-2` - Bordure de la carte

Ces classes s'adaptent automatiquement au thème actif (clair/sombre).

### 4. Sélecteur de langue supprimé ✅

Le sélecteur de langue en haut à droite a été complètement retiré.

### 5. Améliorations UX

**Support clavier**
- Touche Entrée pour soumettre le formulaire
- Fonctionne dans les deux onglets (Sign In / Sign Up)

**Messages utilisateur**
- Messages de succès/erreur avec Arco Design `Message`
- Messages en français
- Feedback visuel clair

**État de chargement**
- Bouton avec état `loading` pendant la soumission
- Désactive les interactions pendant le traitement

## Structure du code

```tsx
const LoginPage: React.FC = () => {
  // États
  const [activeTab, setActiveTab] = useState('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Hooks
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // Handlers
  const handleSignIn = async () => { /* ... */ };
  const handleSignUp = async () => { /* ... */ };
  const handleKeyPress = (e: React.KeyboardEvent) => { /* ... */ };
  
  // Render
  return (
    <div className='flex items-center justify-center min-h-screen bg-fill-1'>
      {/* Logo + Titre */}
      {/* Formulaire avec Tabs */}
      {/* Footer */}
    </div>
  );
};
```

## Composants Arco Design utilisés

- `Tabs` / `TabPane` - Onglets Sign In / Sign Up
- `Input` - Champs de saisie
- `Input.Password` - Champ mot de passe avec masquage
- `Button` - Boutons de soumission
- `Message` - Notifications toast
- `IconUser` / `IconLock` - Icônes des champs

## Classes CSS (UnoCSS)

### Layout
- `flex items-center justify-center` - Centrage vertical et horizontal
- `min-h-screen` - Hauteur minimale plein écran
- `w-full max-w-md` - Largeur responsive (max 448px)
- `p-8` / `p-6` - Padding
- `mb-4` / `mb-6` / `mb-8` - Marges bottom

### Thème
- `bg-fill-1` - Fond page
- `bg-fill-2` - Fond carte
- `text-text-1` - Texte principal
- `text-text-2` - Texte secondaire
- `text-text-3` - Texte footer
- `border-border-2` - Bordure

### Style
- `rounded-lg` - Coins arrondis
- `shadow-lg` - Ombre portée
- `border border-solid` - Bordure solide
- `text-center` - Texte centré
- `object-contain` - Image contenue

## Flux utilisateur

### Inscription (Sign Up)

```
1. Utilisateur clique sur l'onglet "S'inscrire"
2. Remplit: username, password, confirmPassword
3. Clique "Créer un compte"
4. Validations:
   ├─ Champs vides? → Message warning
   ├─ Mots de passe différents? → Message error
   └─ Mot de passe < 6 caractères? → Message warning
5. Si OK:
   ├─ Message success "Compte créé avec succès"
   ├─ Bascule vers l'onglet "Se connecter"
   └─ Réinitialise les champs password
```

### Connexion (Sign In)

```
1. Utilisateur sur l'onglet "Se connecter" (par défaut)
2. Remplit: username, password
3. Clique "Se connecter" ou appuie sur Entrée
4. Validation:
   └─ Champs vides? → Message warning
5. Appel à login({ username, password })
6. Si succès:
   ├─ Message success "Connexion réussie"
   └─ Redirection vers /guid
7. Si échec:
   └─ Message error avec le message d'erreur
```

## Fichiers modifiés

- `src/renderer/pages/login/LoginPage.tsx` - Refonte complète

## Dépendances

- `@arco-design/web-react` - Composants UI
- `react-router-dom` - Navigation
- `@/renderer/context/AuthContext` - Authentification

## Variables de thème utilisées

Les classes UnoCSS utilisent les variables CSS du thème:
- `--color-fill-1` - Fond niveau 1
- `--color-fill-2` - Fond niveau 2
- `--color-text-1` - Texte principal
- `--color-text-2` - Texte secondaire
- `--color-text-3` - Texte tertiaire
- `--color-border-2` - Bordure

Ces variables s'adaptent automatiquement au thème clair/sombre.

## Test

### Test visuel

1. Lancer l'application:
   ```bash
   bun run start
   ```

2. Activer le login dans Settings → Sécurité

3. Redémarrer l'application

4. Vérifier:
   - ✅ Logo E-audit affiché (96x96px)
   - ✅ Titre "E-audit" en gras
   - ✅ Slogan "Automatisez vos activités..."
   - ✅ Thème gris (adapté au thème de l'app)
   - ✅ Pas de sélecteur de langue
   - ✅ Deux onglets: "Se connecter" et "S'inscrire"
   - ✅ Bordure grise autour de la carte

### Test fonctionnel Sign Up

1. Cliquer sur l'onglet "S'inscrire"
2. Essayer de soumettre avec champs vides → Warning
3. Entrer username et passwords différents → Error
4. Entrer password < 6 caractères → Warning
5. Entrer des valeurs valides → Success + bascule vers Sign In

### Test fonctionnel Sign In

1. Sur l'onglet "Se connecter"
2. Essayer de soumettre avec champs vides → Warning
3. Entrer username et password
4. Cliquer "Se connecter" → Success + redirection vers /guid
5. Vérifier que la session est sauvegardée

### Test clavier

1. Remplir les champs
2. Appuyer sur Entrée
3. Vérifier que le formulaire se soumet

## Notes de développement

### Sign Up (Inscription)

Pour le moment, le Sign Up est simulé (pas de vraie création de compte). Pour implémenter une vraie inscription:

1. Créer une table `users` dans la base de données
2. Ajouter une fonction `signup` dans `AuthContext`
3. Hasher les mots de passe avec bcrypt
4. Stocker les utilisateurs dans la DB

### Validation des mots de passe

Actuellement: minimum 6 caractères. Pour renforcer:
- Ajouter des règles (majuscule, chiffre, caractère spécial)
- Afficher un indicateur de force du mot de passe
- Utiliser une bibliothèque comme `zxcvbn`

### Gestion multi-utilisateurs

Pour supporter plusieurs utilisateurs:
- Stocker les comptes dans une base de données locale
- Implémenter un système de rôles (admin, auditor, viewer)
- Ajouter une page de gestion des utilisateurs

## Statut

✅ **Refonte terminée**

La page de login utilise maintenant:
- Le logo E-audit depuis `/logo_projet/`
- Le nom "E-audit"
- Le thème gris par défaut
- Un système Sign In / Sign Up avec onglets
- Pas de sélecteur de langue
