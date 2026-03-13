# Emplacements des logos dans E-audit

## Vue d'ensemble

Ce document liste tous les emplacements où le logo E-audit apparaît dans l'application.

## 1. Page d'accueil (GuidPage)

**Fichier**: `src/renderer/pages/guid/GuidPage.tsx`

**Emplacement**: Au-dessus du titre "Automatisez vos activités, d'audit, risque et contrôle"

**Taille**: 128x128px (w-32 h-32)

**Code**:
```tsx
import logoImage from '@renderer/assets/logo.png';

<div className='flex flex-col items-center mb-6'>
  <img src={logoImage} alt='E-audit' className='w-32 h-32 mb-4 object-contain' />
  <p className='text-2xl font-semibold text-0 text-center'>
    {t('conversation.welcome.title')}
  </p>
</div>
```

**Visibilité**: Visible uniquement sur la page d'accueil (route `/`)

---

## 2. Titlebar (Barre de titre)

**Fichier**: `src/renderer/components/Titlebar/index.tsx`

**Emplacement**: En haut de l'application, à gauche du nom "E-audit"

**Taille**: 24x24px

**Code**:
```tsx
const EauditLogoMark: React.FC = () => (
  <img 
    src='/logo.png' 
    alt='E-audit' 
    className='app-titlebar__brand-logo' 
    style={{ width: '24px', height: '24px', objectFit: 'contain' }} 
  />
);
```

**Note**: Ce code utilise encore `/logo.png` et pourrait nécessiter une mise à jour pour utiliser l'import ES6.

**Visibilité**: Visible sur toutes les pages

---

## 3. Sidebar (Barre latérale)

**Fichier**: `src/renderer/layout.tsx`

**Emplacement**: Dans la sidebar gauche, avant le texte "E-audit"

**Taille**: 24x24px (normal), 16x16px (collapsed)

**Code** (à implémenter):
```tsx
import logoImage from '@renderer/assets/logo.png';

<ArcoLayout.Header className='...'>
  <img 
    src={logoImage} 
    alt='E-audit' 
    className={classNames('shrink-0 object-contain', {
      'w-6 h-6': !collapsed,
      'w-4 h-4': collapsed,
    })}
  />
  <div className='flex-1 text-20px text-1 collapsed-hidden font-bold'>
    E-audit
  </div>
</ArcoLayout.Header>
```

**Visibilité**: Visible sur toutes les pages avec sidebar (conversations, settings)

---

## 4. Favicon (Icône du navigateur/fenêtre)

**Fichier**: `src/renderer/index.html`

**Emplacement**: Onglet du navigateur / Icône de la fenêtre Electron

**Taille**: 32x32px, 64x64px (multi-résolution)

**Code**:
```html
<link rel='icon' type='image/png' sizes='32x32' href='/favicon-32x32.png'>
<link rel='icon' type='image/png' sizes='64x64' href='/favicon-64x64.png'>
```

**Note**: Les favicons doivent rester dans `public/` car ils sont référencés dans le HTML.

---

## Emplacements potentiels futurs

### 5. About Dialog (À propos)

**Fichier**: `src/renderer/pages/settings/About.tsx`

**Emplacement**: Dans la fenêtre "À propos" des paramètres

**Taille suggérée**: 64x64px ou 96x96px

### 6. Splash Screen (Écran de démarrage)

**Emplacement**: Au démarrage de l'application

**Taille suggérée**: 256x256px

### 7. Notifications

**Emplacement**: Dans les notifications système

**Taille suggérée**: 64x64px

### 8. Tray Icon (Icône système)

**Emplacement**: Barre des tâches / Menu bar

**Taille suggérée**: 16x16px, 32x32px (multi-résolution)

---

## Récapitulatif des tailles

| Emplacement | Taille | Format | Priorité |
|-------------|--------|--------|----------|
| Page d'accueil | 128x128px | PNG/SVG | ✅ Implémenté |
| Titlebar | 24x24px | PNG/SVG | ✅ Implémenté |
| Sidebar | 24x24px | PNG/SVG | 🔄 En cours |
| Favicon | 32x32px, 64x64px | PNG | ⚠️ À vérifier |
| About | 64-96px | PNG/SVG | ⏳ Futur |
| Splash | 256x256px | PNG/SVG | ⏳ Futur |
| Notifications | 64x64px | PNG | ⏳ Futur |
| Tray | 16x16px, 32x32px | PNG | ⏳ Futur |

---

## Checklist d'implémentation

### Page d'accueil
- [x] Logo ajouté
- [x] Import ES6 utilisé
- [x] Taille correcte (128x128px)
- [x] Centré au-dessus du titre
- [x] Testé et fonctionnel

### Titlebar
- [x] Logo ajouté
- [ ] Migrer vers import ES6 (actuellement `/logo.png`)
- [x] Taille correcte (24x24px)
- [x] Positionné à gauche du nom
- [x] Testé et fonctionnel

### Sidebar
- [ ] Logo à ajouter
- [ ] Import ES6 à utiliser
- [ ] Taille responsive (24px normal, 16px collapsed)
- [ ] Positionné avant "E-audit"
- [ ] Tester en mode normal et collapsed

### Favicon
- [ ] Vérifier que les fichiers existent
- [ ] Vérifier les tailles (32x32, 64x64)
- [ ] Tester dans différents contextes

---

## Notes de maintenance

### Changement de logo

Si le logo doit être changé:

1. Remplacer `src/renderer/assets/logo.png` et/ou `logo.svg`
2. Vérifier que les dimensions sont appropriées
3. Optimiser l'image (voir `BONNES_PRATIQUES.md`)
4. Tester tous les emplacements listés ci-dessus
5. Mettre à jour les favicons si nécessaire

### Ajout d'un nouvel emplacement

1. Ajouter une section dans ce document
2. Utiliser l'import ES6 depuis `@renderer/assets/`
3. Choisir la taille appropriée
4. Ajouter les classes UnoCSS pour le styling
5. Tester en dev et build
6. Mettre à jour la checklist
