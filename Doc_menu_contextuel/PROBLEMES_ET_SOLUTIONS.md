# Problèmes et Solutions - Menu Contextuel AIONUI

**Date**: 13 mars 2026  
**Version**: 1.0

## Historique des Problèmes Rencontrés

Ce document retrace tous les problèmes rencontrés lors de la migration du système de menu contextuel de Claraverse vers AIONUI, et les solutions implémentées.

---

## Problème 1: Scripts 404 dans electron-vite

### Description
Tentative initiale d'utiliser des scripts externes dans `public/scripts/` comme dans Claraverse.

**Erreur**:
```
GET http://localhost:5173/scripts/aionui_menu.js 404 (Not Found)
```

### Cause Racine
electron-vite ne sert pas le dossier `public/` en mode développement. Les fichiers statiques ne sont accessibles qu'après le build.

### Solution Tentée (Échec)
1. Ajout de scripts dans `public/scripts/aionui_menu.js`
2. Chargement via `<script src="/scripts/aionui_menu.js"></script>` dans `public/index.html`

**Résultat**: 404 en mode dev

### Solution Finale
**Conversion en composant React natif** (`TableContextMenu.tsx`)

**Avantages**:
- Fonctionne en dev et en production
- Intégration native avec React
- Accès aux hooks et état React
- Pas de problème de chargement de fichiers

**Fichier**: `src/renderer/components/TableContextMenu.tsx`

---

## Problème 2: Événements de Clic Non Capturés

### Description
Tentative d'utiliser Ctrl+Click comme alternative au clic droit.

**Code testé**:
```typescript
document.addEventListener('click', (e) => {
  if (e.ctrlKey) {
    // Ouvrir le menu
  }
});
```

### Symptômes
- Aucun log dans la console
- Événement non détecté
- Ctrl+Click ne déclenchait rien

### Causes Identifiées
1. **Propagation bloquée**: D'autres handlers capturaient l'événement avant
2. **Structure DOM complexe**: Tableaux imbriqués dans plusieurs niveaux
3. **Shadow DOM**: Isolation des événements

### Solutions Tentées

#### Tentative 1: Event Capture Phase
```typescript
document.addEventListener('click', handler, true); // Capture phase
```
**Résultat**: Partiellement fonctionnel, mais pas fiable

#### Tentative 2: Event Delegation
```typescript
document.body.addEventListener('click', (e) => {
  const table = (e.target as HTMLElement).closest('table');
});
```
**Résultat**: Ne détectait pas les tableaux dans Shadow DOM

### Solution Finale
**Utiliser l'événement `contextmenu` (clic droit natif)**

```typescript
document.addEventListener('contextmenu', handleContextMenu, true);
```

**Pourquoi ça fonctionne**:
- Événement natif du navigateur
- Capture phase garantit la priorité
- `e.preventDefault()` empêche le menu natif
- Compatible avec Shadow DOM

---

## Problème 3: Shadow DOM et Isolation du Contenu

### Description
Les tableaux dans AIONUI sont encapsulés dans un Shadow DOM (`.markdown-shadow-body`), ce qui les rend invisibles aux requêtes DOM normales.

### Symptômes
```typescript
document.querySelectorAll('table'); // Retourne []
```

Même si des tableaux sont visibles à l'écran, ils n'apparaissent pas dans les requêtes DOM standard.

### Découverte Critique
**Inspection du DOM**:
```html
<div class="markdown-shadow-body">
  #shadow-root (open)
    <table>
      <thead>...</thead>
      <tbody>...</tbody>
    </table>
</div>
```

**Logs de débogage**:
```
🔍 Table parent classes: 
  0: "markdown-shadow-body"
  1: "arco-layout-content bg-1 layout-content flex flex-col min-h-0"
  2: "arco-layout arco-layout-has-sider size-full layout flex-1 min-h-0"
  3: "app-shell flex flex-col size-full min-h-0"
```

### Solution Implémentée

#### 1. Détection du Shadow DOM
```typescript
document.querySelectorAll('.markdown-shadow-body').forEach((host) => {
  if (host.shadowRoot) {
    console.log('🔍 Found Shadow DOM in .markdown-shadow-body');
    host.shadowRoot.querySelectorAll('table').forEach((table) => {
      // Attacher les event listeners
    });
  }
});
```

#### 2. Recherche Multi-Méthode
```typescript
// Méthode 1: closest()
let table = target.closest('table');

// Méthode 2: Via cellule
if (!table) {
  const cell = target.closest('td, th');
  if (cell) {
    table = cell.closest('table');
  }
}

// Méthode 3: Traversée manuelle
if (!table) {
  let element = target;
  let depth = 0;
  while (element && depth < 20) {
    if (element.tagName === 'TABLE') {
      table = element;
      break;
    }
    element = element.parentElement;
    depth++;
  }
}
```

#### 3. Validation de Zone Chat
```typescript
const isTableInChat = (table: HTMLTableElement): boolean => {
  const chatSelectors = [
    '.markdown-shadow-body',  // Critique!
    '.message-item',
    '[class*="chat"]',
    // ... autres sélecteurs
  ];
  return chatSelectors.some((selector) => table.closest(selector));
};
```

---

## Problème 4: Tableaux Ajoutés Dynamiquement

### Description
Les messages du chat sont ajoutés dynamiquement après le chargement initial. Les event listeners attachés au montage du composant ne capturent pas les nouveaux tableaux.

### Symptômes
- Menu fonctionne sur les tableaux existants
- Pas de menu sur les nouveaux tableaux ajoutés
- Nécessite un rechargement de la page

### Solution: MutationObserver

```typescript
const observer = new MutationObserver(() => {
  attachToTables(); // Réattacher les listeners
});

observer.observe(document.body, {
  childList: true,  // Observer les ajouts/suppressions
  subtree: true,    // Observer tous les descendants
});
```

**Fonction `attachToTables()`**:
```typescript
const attachToTables = () => {
  const tables: HTMLTableElement[] = [];
  
  // Tables régulières
  document.querySelectorAll('table').forEach((t) => tables.push(t));
  
  // Tables dans Shadow DOM
  document.querySelectorAll('.markdown-shadow-body').forEach((host) => {
    if (host.shadowRoot) {
      host.shadowRoot.querySelectorAll('table').forEach((t) => tables.push(t));
    }
  });
  
  // Attacher les event listeners
  tables.forEach((table) => {
    table.addEventListener('contextmenu', handleContextMenu, true);
  });
};
```

**Cleanup au démontage**:
```typescript
return () => {
  observer.disconnect();
  // Supprimer tous les event listeners
};
```

---

## Problème 5: Erreurs de Syntaxe TypeScript

### Description
Erreur lors de l'édition du composant:

```
ERROR: Expected ";" but found ")"
File: TableContextMenu.tsx:259:58
```

### Cause
Erreur de syntaxe dans le tableau de dépendances du `useEffect`:

```typescript
// ❌ Incorrect
}, [isTableInChat, showMenu, hideMenu, showNotification]);
//                                                        ^ Erreur ici
```

### Solution
Vérification de la syntaxe et correction:

```typescript
// ✅ Correct
}, [isTableInChat, showMenu, hideMenu, showNotification]);
```

**Leçon**: Toujours exécuter `bun run lint:fix` après modification

---

## Problème 6: Menu Ne S'Ouvre Pas

### Description
Après plusieurs itérations, le menu ne s'ouvrait toujours pas sur les tableaux du chat.

### Débogage Effectué

#### Logs ajoutés:
```typescript
console.log('🖱️ Right-click captured!', { target: e.target.tagName });
console.log('📊 Table search result:', { found: !!table });
console.log('📊 In chat?', inChat);
console.log('✅ Opening menu at:', e.pageX, e.pageY);
```

#### Tests effectués:
1. ✅ Clic droit détecté
2. ✅ Table trouvée
3. ✅ Table dans zone chat
4. ✅ Menu positionné
5. ❌ Menu non visible

### Cause Identifiée
État `isVisible` non mis à jour correctement.

### Solution
Vérification de la logique de `showMenu()`:

```typescript
const showMenu = useCallback((x: number, y: number) => {
  setPosition({
    x: Math.min(x, window.innerWidth - 220),
    y: Math.min(y, window.innerHeight - 400),
  });
  setIsVisible(true); // Critique!
}, []);
```

**Ajout de notification de confirmation**:
```typescript
showNotification('✅ Menu opened');
```

---

## Problème 7: Copier-Coller dans la Console

### Description
Difficulté à copier-coller les logs de la console pour le débogage.

### Solution
Utilisation de la fonctionnalité "Save as..." de DevTools:
1. Ouvrir DevTools (F12)
2. Onglet Console
3. Clic droit → "Save as..."
4. Sauvegarder en `.log`

**Alternative**: Utiliser `copy()` dans la console:
```javascript
copy(document.querySelector('.markdown-shadow-body'));
```

---

## Problème 8: Performance avec MutationObserver

### Description
Le MutationObserver peut déclencher de nombreux appels à `attachToTables()`.

### Solution: Debouncing (Future)
```typescript
let debounceTimer: NodeJS.Timeout;

const observer = new MutationObserver(() => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    attachToTables();
  }, 100); // Attendre 100ms avant de réattacher
});
```

**Note**: Non implémenté dans la version actuelle, mais recommandé pour optimisation future.

---

## Résumé des Solutions Clés

| Problème | Solution | Fichier |
|----------|----------|---------|
| Scripts 404 | Composant React natif | `TableContextMenu.tsx` |
| Événements non capturés | `contextmenu` + capture phase | `TableContextMenu.tsx` |
| Shadow DOM | Recherche dans `shadowRoot` | `TableContextMenu.tsx` |
| Tableaux dynamiques | MutationObserver | `TableContextMenu.tsx` |
| Erreurs TypeScript | `bun run lint:fix` | - |
| Menu invisible | Vérification état React | `TableContextMenu.tsx` |

---

## Leçons Apprises

### 1. Architecture
- **Préférer les composants React natifs** aux scripts externes dans Electron
- **Comprendre le Shadow DOM** est critique pour AIONUI
- **MutationObserver** est essentiel pour le contenu dynamique

### 2. Événements
- **`contextmenu`** est plus fiable que Ctrl+Click
- **Capture phase** (`true`) garantit la priorité
- **Event delegation** fonctionne mieux au niveau document

### 3. Débogage
- **Logs détaillés** à chaque étape critique
- **Inspection du DOM** pour comprendre la structure
- **Tests incrémentaux** plutôt que changements massifs

### 4. TypeScript
- **Toujours linter** après modification
- **Vérifier les dépendances** des hooks React
- **Types stricts** évitent les erreurs runtime

---

## Recommandations pour Futurs Développements

### 1. Avant de Commencer
- Inspecter le DOM pour comprendre la structure
- Vérifier si Shadow DOM est utilisé
- Tester les événements dans la console

### 2. Pendant le Développement
- Ajouter des logs de débogage détaillés
- Tester chaque fonctionnalité isolément
- Utiliser `bun run lint:fix` fréquemment

### 3. Avant la Production
- Supprimer tous les `console.log`
- Tester avec des tableaux de différentes tailles
- Vérifier la performance avec MutationObserver
- Valider le cleanup des event listeners

---

## Références

- [Migration AIONUI](../Migration%20AIONUI/)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [Source Claraverse](../Migration%20AIONUI/source-claraverse/menu.js)
- [Shadow DOM MDN](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM)
- [MutationObserver MDN](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)
