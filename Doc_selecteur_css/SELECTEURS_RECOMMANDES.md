# Sélecteurs CSS Recommandés pour AIONUI

## Sélecteurs principaux

### 1. Shadow DOM Host
```javascript
// Trouver tous les hôtes Shadow DOM
document.querySelectorAll('.markdown-shadow')
```
- **Classe**: `.markdown-shadow`
- **Usage**: Point d'entrée pour accéder au Shadow DOM
- **Propriété**: `shadowRoot` (ShadowRoot object)

### 2. Message Container
```javascript
// Trouver tous les messages
document.querySelectorAll('.message-item')

// Trouver un message spécifique
document.querySelector('[data-message-id="uuid"]')
```
- **Classe**: `.message-item`
- **Attribut**: `data-message-id` (UUID)
- **Usage**: Conteneur principal du message

### 3. Shadow Body (dans Shadow DOM)
```javascript
// Depuis un Shadow Root
shadowRoot.querySelector('.markdown-shadow-body')
```
- **Classe**: `.markdown-shadow-body`
- **Usage**: Conteneur du contenu markdown
- **Parent**: Shadow Root

### 4. Tables (dans Shadow DOM)
```javascript
// Depuis un Shadow Root
shadowRoot.querySelectorAll('table')
```
- **Tag**: `<table>`
- **Parent**: Wrapper div ou `.markdown-shadow-body`

## Sélecteurs par cas d'usage

### Trouver toutes les tables
```javascript
const tables = [];
document.querySelectorAll('.markdown-shadow').forEach(host => {
  if (host.shadowRoot) {
    tables.push(...host.shadowRoot.querySelectorAll('table'));
  }
});
```

### Trouver les tables dans un message
```javascript
const message = document.querySelector(`[data-message-id="${messageId}"]`);
const shadowHost = message?.querySelector('.markdown-shadow');
const tables = shadowHost?.shadowRoot?.querySelectorAll('table') || [];
```

### Vérifier si un élément est dans le chat
```javascript
// Traverser jusqu'à trouver .message-item
let element = targetElement;
while (element) {
  if (element.classList?.contains('message-item')) {
    return true;
  }
  element = element.parentElement || element.parentNode?.host;
}
```

## Sélecteurs à éviter

### ❌ Ne fonctionne pas
```javascript
// Ces sélecteurs ne traversent pas le Shadow DOM
document.querySelectorAll('table');
document.querySelector('.markdown-shadow-body table');
table.closest('.message-item'); // depuis Shadow DOM
```

### ✅ Alternative correcte
```javascript
// Accès explicite au Shadow Root
document.querySelectorAll('.markdown-shadow').forEach(host => {
  host.shadowRoot?.querySelectorAll('table');
});

// Traversée manuelle
function findAncestor(element, selector) {
  while (element) {
    if (element.matches?.(selector)) return element;
    element = element.parentElement || element.parentNode?.host;
  }
  return null;
}
```

## Références rapides

| Élément | Sélecteur | Contexte |
|---------|-----------|----------|
| Shadow Host | `.markdown-shadow` | Document |
| Message | `.message-item` | Document |
| Message ID | `[data-message-id]` | Document |
| Shadow Body | `.markdown-shadow-body` | Shadow Root |
| Table | `table` | Shadow Root |
| Header | `th` | Shadow Root |
| Cell | `td` | Shadow Root |

Voir [SOLUTIONS.md](./SOLUTIONS.md) pour des exemples complets.
