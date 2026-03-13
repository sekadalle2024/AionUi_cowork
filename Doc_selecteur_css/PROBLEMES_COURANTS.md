# Problèmes Courants avec les Tables AIONUI

## 1. Les tables ne sont pas détectées

### Symptôme
```javascript
const tables = document.querySelectorAll('table');
console.log(tables.length); // 0 - Aucune table trouvée
```

### Cause
Les tables sont dans un Shadow DOM. `querySelectorAll()` ne traverse pas les frontières du Shadow DOM.

### Solution
Accéder explicitement au Shadow Root:
```javascript
const shadowHosts = document.querySelectorAll('.markdown-shadow');
const tables = [];

shadowHosts.forEach(host => {
  if (host.shadowRoot) {
    const shadowTables = host.shadowRoot.querySelectorAll('table');
    tables.push(...shadowTables);
  }
});

console.log(tables.length); // Nombre correct de tables
```

---

## 2. `.closest()` retourne `null`

### Symptôme
```javascript
// Depuis une table dans le Shadow DOM
const messageContainer = table.closest('.message-item');
console.log(messageContainer); // null
```

### Cause
`.closest()` ne peut pas traverser la frontière du Shadow DOM vers l'extérieur.

### Solution
Traverser manuellement en gérant le Shadow DOM:
```javascript
function findAncestor(element, selector) {
  let current = element;
  
  while (current) {
    // Vérifier si l'élément correspond
    if (current.matches && current.matches(selector)) {
      return current;
    }
    
    // Monter dans l'arbre
    if (current.parentElement) {
      current = current.parentElement;
    }
    // Traverser le Shadow DOM boundary
    else if (current.parentNode instanceof ShadowRoot) {
      current = current.parentNode.host;
    }
    else {
      break;
    }
  }
  
  return null;
}

const messageContainer = findAncestor(table, '.message-item');
```

---

## 3. Les styles CSS ne s'appliquent pas

### Symptôme
```css
/* Dans votre CSS global */
table {
  border: 2px solid red !important;
}
```
Les tables restent avec leurs styles par défaut.

### Cause
Le Shadow DOM isole les styles. Les styles globaux n'affectent pas le contenu du Shadow DOM.

### Solution

**Option A: Modifier les styles dans le Shadow DOM**
```javascript
const shadowHost = document.querySelector('.markdown-shadow');
if (shadowHost.shadowRoot) {
  const style = document.createElement('style');
  style.textContent = `
    table {
      border: 2px solid red !important;
    }
  `;
  shadowHost.shadowRoot.appendChild(style);
}
```

**Option B: Utiliser les variables CSS**
Les variables CSS traversent le Shadow DOM:
```css
/* Dans votre CSS global */
:root {
  --custom-table-border: 2px solid red;
}
```

```javascript
// Dans le Shadow DOM
const style = document.createElement('style');
style.textContent = `
  table {
    border: var(--custom-table-border);
  }
`;
shadowRoot.appendChild(style);
```

---

## 4. MutationObserver ne détecte pas les nouvelles tables

### Symptôme
```javascript
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.tagName === 'TABLE') {
        console.log('Table added'); // Jamais appelé
      }
    });
  });
});

observer.observe(document.body, { childList: true, subtree: true });
```

### Cause
Le MutationObserver observe le DOM principal, pas le contenu du Shadow DOM.

### Solution

**Option A: Observer les Shadow Hosts**
```javascript
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        // Détecter les nouveaux Shadow Hosts
        if (node.classList?.contains('markdown-shadow')) {
          console.log('New shadow host detected');
          processNewShadowHost(node);
        }
        
        // Chercher dans les enfants
        const shadowHosts = node.querySelectorAll?.('.markdown-shadow');
        shadowHosts?.forEach(processNewShadowHost);
      }
    });
  });
});

function processNewShadowHost(host) {
  if (host.shadowRoot) {
    const tables = host.shadowRoot.querySelectorAll('table');
    tables.forEach(table => {
      console.log('Table found in new shadow host');
    });
  }
}

observer.observe(document.body, { childList: true, subtree: true });
```

**Option B: Observer chaque Shadow Root**
```javascript
function observeShadowRoot(shadowRoot) {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.tagName === 'TABLE') {
          console.log('Table added in shadow DOM');
        }
      });
    });
  });
  
  observer.observe(shadowRoot, { childList: true, subtree: true });
}

// Observer tous les Shadow Roots existants
document.querySelectorAll('.markdown-shadow').forEach(host => {
  if (host.shadowRoot) {
    observeShadowRoot(host.shadowRoot);
  }
});
```

---

## 5. `getElementById()` ne trouve pas les éléments

### Symptôme
```javascript
// ID défini dans le Shadow DOM
const element = document.
getElementById('my-table');
console.log(element); // null
```

### Cause
`getElementById()` cherche uniquement dans le document principal, pas dans les Shadow DOMs.

### Solution
```javascript
function findElementByIdInShadowDOM(id) {
  // Chercher dans le document principal
  let element = document.getElementById(id);
  if (element) return element;
  
  // Chercher dans tous les Shadow Roots
  const shadowHosts = document.querySelectorAll('.markdown-shadow');
  for (const host of shadowHosts) {
    if (host.shadowRoot) {
      element = host.shadowRoot.getElementById(id);
      if (element) return element;
    }
  }
  
  return null;
}
```

---

## 6. Les événements ne se propagent pas correctement

### Symptôme
```javascript
document.addEventListener('click', (e) => {
  console.log(e.target); // Ne montre jamais les éléments du Shadow DOM
});
```

### Cause
`e.target` est retargeté pour masquer les détails du Shadow DOM.

### Solution
Utiliser `composedPath()` pour obtenir le chemin complet:
```javascript
document.addEventListener('click', (e) => {
  const path = e.composedPath();
  console.log('Full path:', path);
  
  // Trouver la table dans le chemin
  const table = path.find(el => el.tagName === 'TABLE');
  if (table) {
    console.log('Table clicked:', table);
  }
  
  // Trouver la cellule
  const cell = path.find(el => el.tagName === 'TD' || el.tagName === 'TH');
  if (cell) {
    console.log('Cell clicked:', cell);
  }
});
```

---

## 7. Impossible de modifier le contenu des cellules

### Symptôme
```javascript
const cell = table.querySelector('td');
cell.contentEditable = 'true'; // Fonctionne
cell.textContent = 'New value'; // Fonctionne
// Mais les changements ne sont pas persistés
```

### Cause
Les modifications dans le Shadow DOM ne sont pas automatiquement synchronisées avec la base de données.

### Solution
Implémenter un système de persistance:
```javascript
function makeCellEditable(cell, table) {
  cell.contentEditable = 'true';
  cell.style.cursor = 'text';
  
  // Sauvegarder lors de la perte de focus
  cell.addEventListener('blur', () => {
    saveTableToDatabase(table);
  });
  
  // Sauvegarder avec Ctrl+S
  cell.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      saveTableToDatabase(table);
    }
  });
}

function saveTableToDatabase(table) {
  // Extraire les données
  const data = extractTableData(table);
  
  // Trouver le conversationId
  const messageItem = findAncestor(table, '.message-item');
  const messageId = messageItem?.getAttribute('data-message-id');
  
  // Sauvegarder via IPC (Electron)
  window.electron?.ipcRenderer.invoke('save-table', {
    messageId,
    tableData: data
  });
}
```

---

## 8. Performance: Trop de Shadow Roots à parcourir

### Symptôme
```javascript
// Lent avec beaucoup de messages
function findAllTables() {
  const tables = [];
  document.querySelectorAll('.markdown-shadow').forEach(host => {
    if (host.shadowRoot) {
      tables.push(...host.shadowRoot.querySelectorAll('table'));
    }
  });
  return tables;
}
```

### Cause
Parcourir tous les Shadow Roots à chaque fois est coûteux.

### Solution

**Option A: Cache avec invalidation**
```javascript
class TableCache {
  constructor() {
    this.cache = new Map();
    this.setupObserver();
  }
  
  setupObserver() {
    const observer = new MutationObserver(() => {
      this.cache.clear(); // Invalider le cache
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  getAllTables() {
    if (this.cache.has('all')) {
      return this.cache.get('all');
    }
    
    const tables = [];
    document.querySelectorAll('.markdown-shadow').forEach(host => {
      if (host.shadowRoot) {
        tables.push(...host.shadowRoot.querySelectorAll('table'));
      }
    });
    
    this.cache.set('all', tables);
    return tables;
  }
}

const tableCache = new TableCache();
const tables = tableCache.getAllTables();
```

**Option B: Recherche ciblée**
```javascript
// Au lieu de chercher toutes les tables, chercher dans un contexte spécifique
function findTablesInMessage(messageId) {
  const message = document.querySelector(`[data-message-id="${messageId}"]`);
  if (!message) return [];
  
  const shadowHost = message.querySelector('.markdown-shadow');
  if (!shadowHost?.shadowRoot) return [];
  
  return Array.from(shadowHost.shadowRoot.querySelectorAll('table'));
}
```

---

## 9. Conflits avec d'autres scripts

### Symptôme
Plusieurs scripts tentent de manipuler les mêmes tables, causant des conflits.

### Cause
Pas de coordination entre les scripts.

### Solution

**Option A: Marquage des tables traitées**
```javascript
function processTable(table) {
  // Vérifier si déjà traité
  if (table.dataset.processed) {
    return;
  }
  
  // Marquer comme traité
  table.dataset.processed = 'true';
  table.dataset.processedBy = 'my-script';
  table.dataset.processedAt = Date.now();
  
  // Traiter la table
  // ...
}
```

**Option B: Système d'événements personnalisés**
```javascript
// Script A: Notifier avant traitement
const event = new CustomEvent('table-processing', {
  detail: { table, scriptName: 'script-a' },
  bubbles: true,
  composed: true // Traverse le Shadow DOM
});
table.dispatchEvent(event);

// Script B: Écouter les notifications
document.addEventListener('table-processing', (e) => {
  console.log('Table being processed by:', e.detail.scriptName);
  // Décider si on doit aussi traiter cette table
});
```

---

## 10. Debugging difficile

### Symptôme
Difficile de voir ce qui se passe dans le Shadow DOM.

### Solution

**Fonction de debug utilitaire:**
```javascript
function debugShadowDOM() {
  console.group('Shadow DOM Debug');
  
  const shadowHosts = document.querySelectorAll('.markdown-shadow');
  console.log(`Found ${shadowHosts.length} shadow hosts`);
  
  shadowHosts.forEach((host, index) => {
    console.group(`Shadow Host ${index + 1}`);
    console.log('Host element:', host);
    console.log('Has shadowRoot:', !!host.shadowRoot);
    
    if (host.shadowRoot) {
      const tables = host.shadowRoot.querySelectorAll('table');
      console.log(`Tables in shadow root: ${tables.length}`);
      
      tables.forEach((table, tableIndex) => {
        console.group(`Table ${tableIndex + 1}`);
        console.log('Rows:', table.rows.length);
        console.log('Headers:', Array.from(table.querySelectorAll('th')).map(th => th.textContent));
        console.log('First row data:', Array.from(table.rows[1]?.cells || []).map(cell => cell.textContent));
        console.groupEnd();
      });
    }
    
    console.groupEnd();
  });
  
  console.groupEnd();
}

// Appeler dans la console
debugShadowDOM();
```

**Exposer globalement pour debug:**
```javascript
// En développement uniquement
if (process.env.NODE_ENV === 'development') {
  window.aionui_debug = {
    findAllTables: () => {
      const tables = [];
      document.querySelectorAll('.markdown-shadow').forEach(host => {
        if (host.shadowRoot) {
          tables.push(...host.shadowRoot.querySelectorAll('table'));
        }
      });
      return tables;
    },
    
    inspectTable: (table) => {
      console.log('Table:', table);
      console.log('Parent:', table.parentElement);
      console.log('Shadow Root:', table.getRootNode());
      console.log('Message:', findAncestor(table, '.message-item'));
    }
  };
}
```

---

## Checklist de dépannage

Lorsque vous rencontrez un problème avec les tables:

- [ ] Vérifiez que vous accédez au `shadowRoot` explicitement
- [ ] Utilisez `composedPath()` pour les événements
- [ ] Traversez manuellement le Shadow DOM avec `parentNode.host`
- [ ] Vérifiez que les styles sont injectés dans le Shadow DOM
- [ ] Observez les Shadow Hosts, pas leur contenu
- [ ] Utilisez les variables CSS pour les styles
- [ ] Marquez les tables traitées pour éviter les conflits
- [ ] Testez dans la console avec les fonctions de debug
- [ ] Vérifiez les logs dans la console du navigateur
- [ ] Inspectez le Shadow DOM dans DevTools

## Ressources supplémentaires

- [STRUCTURE_DOM.md](./STRUCTURE_DOM.md) - Structure complète
- [SOLUTIONS.md](./SOLUTIONS.md) - Solutions détaillées
- [EXEMPLES_CODE.md](./EXEMPLES_CODE.md) - Exemples pratiques
