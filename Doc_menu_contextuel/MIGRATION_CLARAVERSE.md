# Migration depuis Claraverse - Menu Contextuel

**Date**: 13 mars 2026  
**Version**: 1.0  
**Source**: Claraverse menu.js V9.3  
**Destination**: AIONUI TableContextMenu.tsx

## Vue d'Ensemble

Ce document détaille la migration du système de menu contextuel depuis Claraverse vers AIONUI, incluant les différences architecturales, les adaptations effectuées, et les fonctionnalités conservées ou modifiées.

---

## Comparaison Architecturale

### Claraverse (menu.js V9.3)

**Type**: Script JavaScript vanilla  
**Chargement**: `<script src="/scripts/menu.js"></script>`  
**Architecture**: Classe `ContextualMenuManager`  
**Framework**: Aucun (DOM natif)  
**Styling**: CSS inline avec variables Tailwind

```javascript
class ContextualMenuManager {
  constructor() {
    this.menuElement = null;
    this.targetTable = null;
    // ...
  }
  
  init() {
    this.createMenuElement();
    this.attachEventListeners();
    // ...
  }
}
```

### AIONUI (TableContextMenu.tsx)

**Type**: Composant React fonctionnel  
**Chargement**: Import dans `layout.tsx`  
**Architecture**: Hooks React  
**Framework**: React 19 + TypeScript 5.8  
**Styling**: CSS inline avec variables AIONUI

```typescript
export const TableContextMenu: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [targetTable, setTargetTable] = useState<HTMLTableElement | null>(null);
  // ...
  
  useEffect(() => {
    // Event listeners
  }, []);
  
  return <>{/* JSX */}</>;
};
```

---

## Différences Clés

### 1. Gestion de l'État

**Claraverse**:
```javascript
this.isMenuVisible = false;
this.targetTable = null;
```

**AIONUI**:
```typescript
const [isVisible, setIsVisible] = useState(false);
const [targetTable, setTargetTable] = useState<HTMLTableElement | null>(null);
```

**Avantage AIONUI**: Réactivité automatique de React

### 2. Event Listeners

**Claraverse**:
```javascript
attachEventListeners() {
  document.addEventListener('contextmenu', (e) => {
    // ...
  });
}
```


**AIONUI**:
```typescript
useEffect(() => {
  const handleContextMenu = (e: MouseEvent) => {
    // ...
  };
  
  document.addEventListener('contextmenu', handleContextMenu, true);
  
  return () => {
    document.removeEventListener('contextmenu', handleContextMenu, true);
  };
}, []);
```

**Avantage AIONUI**: Cleanup automatique avec `useEffect`

### 3. Création du Menu

**Claraverse**:
```javascript
createMenuElement() {
  this.menuElement = document.createElement("div");
  this.menuElement.style.cssText = `
    position: fixed;
    background: #ffffff;
    border: 1px solid #380101;
    // ...
  `;
  document.body.appendChild(this.menuElement);
}
```

**AIONUI**:
```typescript
return (
  <div
    className='table-context-menu'
    style={{
      position: 'fixed',
      background: 'var(--color-bg-1)',
      border: '2px solid var(--color-primary-6)',
      // ...
    }}
  >
    {/* JSX */}
  </div>
);
```

**Avantage AIONUI**: JSX plus lisible, variables CSS AIONUI

### 4. Styling

**Claraverse** (Tailwind):
```javascript
border: '1px solid #380101'
background: '#ffffff'
```

**AIONUI** (CSS Variables):
```typescript
border: '2px solid var(--color-primary-6)'
background: 'var(--color-bg-1)'
```

**Mapping des couleurs**:
| Claraverse | AIONUI | Usage |
|------------|--------|-------|
| `#ffffff` | `var(--color-bg-1)` | Fond principal |
| `#380101` | `var(--color-primary-6)` | Couleur primaire |
| `#d1d5db` | `var(--color-border-2)` | Bordures |
| `#555` | `var(--color-text-1)` | Texte |

---

## Fonctionnalités Migrées

### ✅ Fonctionnalités Conservées

1. **Enable Editing** - Rendre les cellules éditables
2. **Insert Row** - Ajouter une ligne
3. **Insert Column** - Ajouter une colonne
4. **Delete Row** - Supprimer une ligne
5. **Delete Column** - Supprimer une colonne
6. **Copy Table** - Copier le tableau
7. **Export CSV** - Exporter en CSV

### ⏳ Fonctionnalités Non Migrées (Futures)

1. **Duplicate Row** - Dupliquer une ligne
2. **Clear All Rows** - Effacer le contenu des lignes
3. **Paste from Excel** - Coller depuis Excel
4. **Import Excel** - Importer un fichier Excel
5. **Export Word** - Exporter en Word
6. **Arithmetic Operations** - Opérations arithmétiques (Validation, Mouvement, etc.)
7. **Risk Evaluation** - Évaluation des risques
8. **Pandas Modeling** - Modélisation avec Pandas
9. **Financial Statements** - États financiers SYSCOHADA
10. **Sampling** - Échantillonnage audit
11. **Fraud Detection** - Détection de fraude
12. **Audit Reports** - Rapports d'audit

**Raison**: Ces fonctionnalités nécessitent une intégration avec N8N et des backends Python

---

## Adaptations Effectuées

### 1. Shadow DOM

**Problème Claraverse**: Pas de Shadow DOM dans Claraverse

**Solution AIONUI**:
```typescript
document.querySelectorAll('.markdown-shadow-body').forEach((host) => {
  if (host.shadowRoot) {
    host.shadowRoot.querySelectorAll('table').forEach((table) => {
      // Attacher les event listeners
    });
  }
});
```

### 2. MutationObserver

**Claraverse**: Utilise `observeNewTables()` avec MutationObserver

**AIONUI**: Même approche, mais intégrée dans `useEffect`

```typescript
useEffect(() => {
  const observer = new MutationObserver(() => {
    attachToTables();
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
  
  return () => observer.disconnect();
}, []);
```

### 3. Notifications

**Claraverse**:
```javascript
showQuickNotification(message) {
  // Custom notification system
}
```

**AIONUI**:
```typescript
import { Message } from '@arco-design/web-react';

showNotification('✅ Operation completed');
// Utilise Arco Design Message
```

### 4. Menu Structure

**Claraverse**: Menu accordéon avec sections

```javascript
getMenuSections() {
  return [
    { id: "edition", title: "Édition des cellules", icon: "✏️", items: [...] },
    { id: "lignes", title: "Lignes", icon: "📋", items: [...] },
    // ...
  ];
}
```

**AIONUI**: Menu plat simplifié

```typescript
const menuItems = [
  { icon: '✏️', text: 'Enable Editing', action: enableCellEditing },
  { icon: '➕', text: 'Insert Row', action: insertRowBelow },
  // ...
];
```

**Raison**: Simplification pour la version initiale

---

## Compatibilité

### Données de Tableau

**Format identique**: Les deux systèmes utilisent des tableaux HTML standard

```html
<table>
  <thead>
    <tr><th>Colonne 1</th><th>Colonne 2</th></tr>
  </thead>
  <tbody>
    <tr><td>Valeur 1</td><td>Valeur 2</td></tr>
  </tbody>
</table>
```

### Export CSV

**Format identique**: CSV standard avec virgules

```csv
Colonne 1,Colonne 2
Valeur 1,Valeur 2
```

### Intégration N8N

**Claraverse**: Appels directs à N8N

```javascript
async executePandasAgent() {
  const response = await fetch('http://localhost:5678/webhook/pandas-agent', {
    method: 'POST',
    body: JSON.stringify({ table: tableData }),
  });
}
```

**AIONUI**: Même approche possible (à implémenter)

```typescript
const executeN8nWorkflow = useCallback(async () => {
  const response = await fetch('http://localhost:5678/webhook/workflow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ table: extractTableData(targetTable) }),
  });
}, [targetTable]);
```

---

## Migration des Fonctionnalités Avancées

### Exemple: Paste from Excel

**Claraverse** (menu.js):
```javascript
async pasteFromExcel() {
  const clipboardText = await navigator.clipboard.readText();
  const parsedData = this.parseClipboardData(clipboardText);
  this.insertClipboardDataIntoTable(parsedData, startRow, startCol);
}
```

**AIONUI** (à implémenter):
```typescript
const pasteFromExcel = useCallback(async () => {
  if (!targetTable) return;
  
  try {
    const clipboardText = await navigator.clipboard.readText();
    const parsedData = parseClipboardData(clipboardText);
    insertClipboardDataIntoTable(targetTable, parsedData);
    showNotification('✅ Data pasted');
  } catch (error) {
    showNotification('❌ Paste failed');
  }
  
  hideMenu();
}, [targetTable, showNotification, hideMenu]);
```

### Exemple: Arithmetic Operations

**Claraverse** (menu.js):
```javascript
executeValidation() {
  // C = A + B, Écart = C - D
  const rows = this.targetTable.querySelectorAll('tbody tr');
  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    const A = parseFloat(cells[0].textContent);
    const B = parseFloat(cells[1].textContent);
    cells[2].textContent = (A + B).toString();
    // ...
  });
}
```

**AIONUI** (à implémenter):
```typescript
const executeValidation = useCallback(() => {
  if (!targetTable) return;
  
  const rows = targetTable.querySelectorAll('tbody tr');
  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    const A = parseFloat(cells[0].textContent || '0');
    const B = parseFloat(cells[1].textContent || '0');
    cells[2].textContent = (A + B).toString();
  });
  
  showNotification('✅ Validation completed');
  hideMenu();
}, [targetTable, showNotification, hideMenu]);
```

---

## Roadmap de Migration

### Phase 1: ✅ Fonctionnalités de Base (Complétée)
- [x] Enable Editing
- [x] Insert Row/Column
- [x] Delete Row/Column
- [x] Copy Table
- [x] Export CSV
- [x] Shadow DOM support
- [x] MutationObserver

### Phase 2: 🔄 Opérations Avancées (À venir)
- [ ] Duplicate Row/Column
- [ ] Clear All Rows
- [ ] Paste from Excel
- [ ] Replace Table from Excel

### Phase 3: 🔄 Intégration N8N (À venir)
- [ ] Pandas Agent
- [ ] Modelisation
- [ ] Lead Balance
- [ ] États Financiers

### Phase 4: 🔄 Fonctionnalités Audit (À venir)
- [ ] Arithmetic Operations
- [ ] Risk Evaluation
- [ ] Sampling
- [ ] Fraud Detection
- [ ] Audit Reports

---

## Guide de Migration pour Développeurs

### Étape 1: Identifier la Fonctionnalité

**Dans Claraverse** (menu.js):
```javascript
myFunction() {
  // Code Claraverse
}
```

### Étape 2: Créer le Hook React

**Dans AIONUI** (TableContextMenu.tsx):
```typescript
const myFunction = useCallback(() => {
  if (!targetTable) return;
  
  // Votre code ici
  
  showNotification('✅ Operation completed');
  hideMenu();
}, [targetTable, showNotification, hideMenu]);
```

### Étape 3: Ajouter au Menu

```typescript
const menuItems = [
  // ... items existants
  { icon: '🎯', text: 'My Function', action: myFunction },
];
```

### Étape 4: Adapter le Styling

**Claraverse**:
```javascript
style.cssText = "border: 1px solid #380101;";
```

**AIONUI**:
```typescript
style.border = "2px solid var(--color-primary-6)";
```

### Étape 5: Tester

```bash
bun run start
# Tester la fonctionnalité dans l'application
```

---

## Références

### Fichiers Source

**Claraverse**:
- `Migration AIONUI/source-claraverse/menu.js` (V9.3)

**AIONUI**:
- `src/renderer/components/TableContextMenu.tsx`
- `src/renderer/layout.tsx`

### Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [PROBLEMES_ET_SOLUTIONS.md](./PROBLEMES_ET_SOLUTIONS.md)
- [GUIDE_UTILISATION.md](./GUIDE_UTILISATION.md)
- [Migration AIONUI](../Migration%20AIONUI/)

---

**Version**: 1.0  
**Dernière mise à jour**: 13 mars 2026  
**Statut**: Documentation complète
