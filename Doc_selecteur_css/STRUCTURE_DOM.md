# Structure DOM des Tables dans AIONUI

## Vue d'ensemble

Les tables dans l'interface de chat AIONUI sont rendues à l'intérieur d'un **Shadow DOM** pour assurer l'isolation des styles et éviter les conflits CSS avec le reste de l'application.

## Hiérarchie complète

```
document
  └── #root
      └── .message-item [data-message-id="uuid"]
          ├── .flex.gap-8px.group.w-full
          │   ├── Avatar (32px)
          │   └── .flex.flex-col.flex-1
          │       ├── .text-12px.text-t-secondary (Name label)
          │       └── .markdown-shadow ← SHADOW DOM HOST
          │           └── #shadow-root (mode: open)
          │               └── .markdown-shadow-body
          │                   ├── <p>Texte avant la table</p>
          │                   ├── <div style="overflowX: auto">
          │                   │   └── <table>
          │                   │       ├── <thead>
          │                   │       │   └── <tr>
          │                   │       │       ├── <th>Header 1</th>
          │                   │       │       └── <th>Header 2</th>
          │                   │       └── <tbody>
          │                   │           └── <tr>
          │                   │               ├── <td>Cell 1</td>
          │                   │               └── <td>Cell 2</td>
          │                   └── <p>Texte après la table</p>
```

## Éléments clés

### 1. Message Container
```html
<div class="message-item" data-message-id="550e8400-e29b-41d4-a716-446655440000">
```
- **Classe**: `.message-item`
- **Attribut**: `data-message-id` (UUID unique)
- **Rôle**: Conteneur principal du message
- **Sélecteur**: `document.querySelectorAll('.message-item')`

### 2. Shadow DOM Host
```html
<div class="markdown-shadow">
```
- **Classe**: `.markdown-shadow`
- **Propriété**: `shadowRoot` (ShadowRoot object)
- **Mode**: `open` (accessible via JavaScript)
- **Rôle**: Point d'entrée du Shadow DOM
- **Sélecteur**: `document.querySelectorAll('.markdown-shadow')`

### 3. Shadow Root
```javascript
shadowHost.shadowRoot // ShadowRoot object
```
- **Type**: `ShadowRoot`
- **Mode**: `open`
- **Contenu**: Arbre DOM isolé
- **Accès**: `element.shadowRoot.querySelector(...)`

### 4. Shadow Body
```html
<div class="markdown-shadow-body">
```
- **Classe**: `.markdown-shadow-body`
- **Rôle**: Conteneur du contenu markdown
- **Parent**: Shadow Root
- **Sélecteur**: `shadowRoot.querySelector('.markdown-shadow-body')`

### 5. Table Wrapper
```html
<div style="overflowX: auto; maxWidth: 100%">
```
- **Rôle**: Wrapper pour le scroll horizontal
- **Créé par**: ReactMarkdown component
- **Parent**: `.markdown-shadow-body`

### 6. Table Element
```html
<table style="borderCollapse: collapse; border: 1px solid var(--bg-3)">
```
- **Styles inline**: Appliqués par ReactMarkdown
- **Variables CSS**: Utilise les variables AIONUI (`--bg-3`, etc.)
- **Parent**: Table wrapper div

## Styles appliqués

### Dans le Shadow DOM (style tag)

```css
/* Injecté dans le Shadow Root */
table {
  border-collapse: collapse;
}

table th {
  padding: 8px;
  border: 1px solid var(--bg-3);
  background-color: var(--bg-1);
  font-weight: bold;
}

table td {
  padding: 8px;
  border: 1px solid var(--bg-3);
  min-width: 120px;
}
```

### Variables CSS disponibles

Les variables suivantes sont injectées dans le Shadow DOM:
- `--bg-1`: Background principal
- `--bg-2`: Background secondaire
- `--bg-3`: Bordures
- `--text-primary`: Texte principal
- `--text-secondary`: Texte secondaire
- `--color-text-1`, `--color-text-2`, `--color-text-3`

## Propriétés importantes

### Shadow Root Properties
```javascript
const shadowHost = document.querySelector('.markdown-shadow');
const shadowRoot = shadowHost.shadowRoot;

console.log(shadowRoot.mode);        // "open"
console.log(shadowRoot.host);        // shadowHost element
console.log(shadowRoot.innerHTML);   // Shadow DOM content
```

### Table Properties
```javascript
const table = shadowRoot.querySelector('table');

console.log(table.rows);             // HTMLCollection of <tr>
console.log(table.tHead);            // <thead> element
console.log(table.tBodies);          // HTMLCollection of <tbody>
console.log(table.parentElement);    // wrapper div
console.log(table.parentNode);       // wrapper div
```

## Traversée du DOM

### De l'extérieur vers l'intérieur
```javascript
// 1. Trouver le message
const message = document.querySelector('[data-message-id]');

// 2. Trouver le Shadow Host
const shadowHost = message.querySelector('.markdown-shadow');

// 3. Accéder au Shadow Root
const shadowRoot = shadowHost.shadowRoot;

// 4. Trouver la table
const table = shadowRoot.querySelector('table');
```

### De l'intérieur vers l'extérieur
```javascript
// Depuis une table, remonter jusqu'au message
function getMessageFromTable(table) {
  let element = table;
  
  while (element) {
    // Traverser vers le parent
    if (element.parentElement) {
      element = element.parentElement;
    }
    // Traverser le Shadow DOM boundary
    else if (element.parentNode instanceof ShadowRoot) {
      element = element.parentNode.host;
    }
    else {
      break;
    }
    
    // Vérifier si on a atteint le message
    if (element.classList?.contains('message-item')) {
      return element;
    }
  }
  
  return null;
}
```

## Événements

### Event Bubbling à travers le Shadow DOM

Les événements traversent le Shadow DOM boundary:
```javascript
// Événement sur une cellule de table
table.addEventListener('click', (e) => {
  console.log(e.target);        // <td> element
  console.log(e.currentTarget); // <table> element
  console.log(e.composedPath()); // Chemin complet incluant Shadow DOM
});

// Événement capturé à l'extérieur
document.addEventListener('click', (e) => {
  const path = e.composedPath();
  const table = path.find(el => el.tagName === 'TABLE');
  if (table) {
    console.log('Table clicked:', table);
  }
});
```

### Événements qui traversent
- `click`, `dblclick`
- `mousedown`, `mouseup`, `mousemove`
- `keydown`, `keyup`, `keypress`
- `focus`, `blur` (avec `composed: true`)
- `input`, `change`

### Événements qui ne traversent pas
- Événements personnalisés sans `composed: true`
- Certains événements de formulaire

## Limitations du Shadow DOM

### ❌ Ne fonctionne pas
```javascript
// Sélecteurs CSS depuis l'extérieur
document.querySelector('.markdown-shadow-body table');
document.querySelectorAll('table');

// .closest() depuis l'intérieur
table.closest('.message-item'); // null

// Styles globaux
/* Ces styles n'affectent pas le Shadow DOM */
table { border: 2px solid red; }
```

### ✅ Fonctionne
```javascript
// Accès explicite au Shadow Root
shadowHost.shadowRoot.querySelector('table');

// Traversée manuelle
element.parentNode.host; // Depuis Shadow DOM vers host

// Événements avec composedPath()
event.composedPath();

// Variables CSS (si injectées)
var(--bg-3)
```

## Inspection dans DevTools

### Chrome/Edge DevTools
1. Ouvrir DevTools (F12)
2. Onglet Elements
3. Chercher `.markdown-shadow`
4. Cliquer sur `#shadow-root` pour l'explorer
5. Les éléments dans le Shadow DOM sont légèrement indentés

### Console
```javascript
// Inspecter le Shadow DOM
$0.shadowRoot // Si .markdown-shadow est sélectionné
$0.shadowRoot.querySelector('table')

// Trouver tous les Shadow Roots
$$('.markdown-shadow').map(h => h.shadowRoot)
```

## Références

- [MDN: Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM)
- [MDN: Event.composedPath()](https://developer.mozilla.org/en-US/docs/Web/API/Event/composedPath)
- Composant source: `src/renderer/components/Markdown.tsx`
