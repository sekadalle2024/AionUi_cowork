# Problème d'affichage du logo

## Symptôme

Le logo ne s'affichait pas dans l'application. Une icône d'image cassée apparaissait à la place.

```tsx
// ❌ Code qui ne fonctionnait pas
<img src='/logo.png' alt='E-audit' className='w-32 h-32' />
```

## Cause du problème

### 1. Mauvaise compréhension du système de fichiers Electron + Vite

Dans une application Electron avec Vite, les fichiers du dossier `public/` ne sont pas automatiquement servis avec un chemin absolu `/` comme dans une application web classique.

### 2. Différence entre développement et production

- **En développement**: Vite sert les fichiers depuis un serveur de développement
- **En production**: Les fichiers sont bundlés et les chemins sont résolus différemment
- Le chemin `/logo.png` ne pointe vers aucun fichier accessible

### 3. Configuration Vite

Dans `electron.vite.config.ts`, la configuration montre que:
- Les assets du renderer doivent être dans `src/renderer/assets/`
- Les fichiers du `public/` sont copiés uniquement pour certains cas spécifiques en production
- Le renderer utilise `base: './'` ce qui signifie des chemins relatifs

```typescript
renderer: {
  base: './',  // Chemins relatifs, pas absolus
  // ...
}
```

## Solution

### Utiliser l'import ES6 avec les alias de chemin Vite

```tsx
// ✅ Code qui fonctionne
import logoImage from '@renderer/assets/logo.png';

<img src={logoImage} alt='E-audit' className='w-32 h-32' />
```

### Pourquoi ça fonctionne?

1. **Vite traite l'import**: Quand vous importez un asset, Vite le traite et génère le bon chemin
2. **Alias de chemin**: `@renderer` est un alias configuré qui pointe vers `src/renderer/`
3. **Bundling correct**: En production, Vite copie l'asset et met à jour le chemin automatiquement
4. **Type-safe**: TypeScript peut vérifier que le fichier existe

## Erreurs à éviter

### ❌ Chemin absolu depuis public/
```tsx
<img src='/logo.png' />  // Ne fonctionne pas
```

### ❌ Chemin relatif sans import
```tsx
<img src='../../assets/logo.png' />  // Fragile et peut casser
```

### ❌ Require (syntaxe CommonJS)
```tsx
<img src={require('@renderer/assets/logo.png')} />  // Pas supporté en ESM
```

## Bonnes pratiques

### ✅ Import ES6 avec alias
```tsx
import logoImage from '@renderer/assets/logo.png';
<img src={logoImage} alt='Logo' />
```

### ✅ Import dynamique si nécessaire
```tsx
const logoImage = await import('@renderer/assets/logo.png');
<img src={logoImage.default} alt='Logo' />
```

## Diagnostic

Si le logo ne s'affiche pas:

1. **Vérifier que le fichier existe**
   ```bash
   ls src/renderer/assets/logo.png
   ```

2. **Vérifier l'import**
   ```tsx
   import logoImage from '@renderer/assets/logo.png';
   console.log('Logo path:', logoImage);  // Doit afficher un chemin
   ```

3. **Vérifier la console du navigateur**
   - Ouvrir DevTools (F12)
   - Chercher des erreurs 404 ou de chargement d'image

4. **Vérifier la configuration Vite**
   - L'alias `@renderer` doit pointer vers `src/renderer/`
   - Voir `electron.vite.config.ts`

## Résolution appliquée

### Fichier: `src/renderer/pages/guid/GuidPage.tsx`

**Avant:**
```tsx
<img src='/logo.png' alt='E-audit' className='w-32 h-32 mb-4 object-contain' />
```

**Après:**
```tsx
import logoImage from '@renderer/assets/logo.png';

// Dans le JSX:
<img src={logoImage} alt='E-audit' className='w-32 h-32 mb-4 object-contain' />
```

## Résultat

✅ Le logo s'affiche correctement sur la page d'accueil
✅ Fonctionne en développement et en production
✅ Type-safe avec TypeScript
✅ Optimisé par Vite (cache, compression, etc.)
