# Bonnes pratiques - Gestion des assets dans E-audit

## Règle d'or

**Toujours importer les assets depuis `src/renderer/assets/` en utilisant les imports ES6**

## Structure des dossiers

```
src/renderer/assets/
├── logo.png              # Logo principal PNG
├── logo.svg              # Logo principal SVG
├── logos/                # Logos de services tiers
│   ├── anthropic.svg
│   ├── openai.svg
│   └── ...
├── channel-logos/        # Logos de canaux de communication
│   ├── slack.svg
│   ├── discord.svg
│   └── ...
└── *.svg, *.png          # Autres assets
```

## Import des assets

### Images statiques

```tsx
// ✅ Recommandé
import logoImage from '@renderer/assets/logo.png';
import iconSvg from '@renderer/assets/icon.svg';

function MyComponent() {
  return (
    <>
      <img src={logoImage} alt='Logo' />
      <img src={iconSvg} alt='Icon' />
    </>
  );
}
```

### Images dynamiques

Si vous devez charger une image basée sur une variable:

```tsx
// ✅ Avec import dynamique
const loadLogo = async (name: string) => {
  const module = await import(`@renderer/assets/logos/${name}.svg`);
  return module.default;
};

// ✅ Avec un mapping statique (préféré)
import anthropicLogo from '@renderer/assets/logos/anthropic.svg';
import openaiLogo from '@renderer/assets/logos/openai.svg';

const LOGOS = {
  anthropic: anthropicLogo,
  openai: openaiLogo,
};

function ProviderLogo({ provider }: { provider: string }) {
  return <img src={LOGOS[provider]} alt={provider} />;
}
```

## Formats d'image

### PNG vs SVG

| Format | Avantages | Inconvénients | Usage recommandé |
|--------|-----------|---------------|------------------|
| **PNG** | - Qualité fixe<br>- Supporte la transparence<br>- Bon pour photos | - Taille fichier plus grande<br>- Pixelisé si agrandi | - Logos avec dégradés complexes<br>- Photos<br>- Icônes avec effets |
| **SVG** | - Vectoriel (scalable)<br>- Taille fichier petite<br>- Modifiable en CSS | - Pas pour photos<br>- Peut être complexe | - Logos simples<br>- Icônes<br>- Illustrations |

### Recommandations

- **Logo principal**: PNG si dégradés/effets, sinon SVG
- **Icônes UI**: SVG (via @icon-park/react de préférence)
- **Logos tiers**: Format fourni par le service (généralement SVG)

## Optimisation des images

### PNG

```bash
# Optimiser avec pngquant
pngquant --quality=65-80 logo.png -o logo-optimized.png

# Ou avec ImageOptim (macOS)
# Ou avec TinyPNG (web)
```

### SVG

```bash
# Optimiser avec SVGO
npx svgo logo.svg -o logo-optimized.svg
```

### Tailles recommandées

| Emplacement | Taille | Format |
|-------------|--------|--------|
| Page d'accueil | 128x128px | PNG/SVG |
| Titlebar | 24x24px | PNG/SVG |
| Sidebar | 24x24px | PNG/SVG |
| Favicon | 32x32px, 64x64px | PNG |
| Icônes | 16x16px, 24x24px | SVG |

## Alias de chemin

Les alias configurés dans `electron.vite.config.ts`:

```typescript
'@renderer': resolve('src/renderer')
'@': resolve('src')
'@common': resolve('src/common')
'@process': resolve('src/process')
'@worker': resolve('src/worker')
```

### Utilisation

```tsx
// ✅ Avec alias (recommandé)
import logo from '@renderer/assets/logo.png';

// ❌ Sans alias (à éviter)
import logo from '../../assets/logo.png';
```

## Styling des images

### Classes UnoCSS

```tsx
// Tailles
<img className='w-32 h-32' />      // 128x128px
<img className='w-24 h-24' />      // 96x96px
<img className='w-16 h-16' />      // 64x64px
<img className='w-8 h-8' />        // 32x32px
<img className='w-6 h-6' />        // 24x24px

// Object-fit
<img className='object-contain' /> // Garde les proportions
<img className='object-cover' />   // Remplit le conteneur
<img className='object-fill' />    // Étire l'image

// Arrondi
<img className='rounded' />        // Coins arrondis
<img className='rounded-full' />   // Cercle
```

### Responsive

```tsx
<img 
  className='w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64'
  alt='Logo'
/>
```

## Accessibilité

### Attribut alt

```tsx
// ✅ Bon
<img src={logo} alt='E-audit logo' />

// ✅ Décoratif
<img src={icon} alt='' role='presentation' />

// ❌ Mauvais
<img src={logo} />  // Manque alt
<img src={logo} alt='image' />  // Trop générique
```

### Lazy loading

```tsx
// Pour les images en bas de page
<img src={logo} alt='Logo' loading='lazy' />
```

## Erreurs courantes

### ❌ Utiliser public/ pour les assets du renderer

```tsx
// Ne fonctionne pas
<img src='/logo.png' />
```

### ❌ Chemins relatifs complexes

```tsx
// Fragile
<img src='../../../assets/logo.png' />
```

### ❌ Oublier l'import

```tsx
// Ne compile pas
<img src='@renderer/assets/logo.png' />
```

### ❌ Mauvais format

```tsx
// TypeScript peut se plaindre
import logo from '@renderer/assets/logo.png';
// Solution: ajouter dans src/renderer/vite-env.d.ts si nécessaire
```

## Checklist avant commit

- [ ] Asset placé dans `src/renderer/assets/`
- [ ] Import ES6 utilisé
- [ ] Alias de chemin utilisé (`@renderer`)
- [ ] Attribut `alt` présent et descriptif
- [ ] Taille appropriée (optimisée)
- [ ] Format approprié (PNG vs SVG)
- [ ] Testé en dev et build
- [ ] Pas d'erreur dans la console

## Ressources

- [Vite - Static Asset Handling](https://vitejs.dev/guide/assets.html)
- [Electron - File System](https://www.electronjs.org/docs/latest/api/protocol)
- [UnoCSS - Utilities](https://unocss.dev/interactive/)
