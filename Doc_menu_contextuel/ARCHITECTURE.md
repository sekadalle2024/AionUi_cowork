# Architecture Technique - Menu Contextuel AIONUI

**Date**: 13 mars 2026  
**Version**: 1.0  
**Composant**: `TableContextMenu.tsx`

## Vue d'Ensemble

Le système de menu contextuel est un composant React natif qui permet d'interagir avec les tableaux dans les conversations AIONUI via un clic droit.

## Architecture Globale

```
┌─────────────────────────────────────────────────────────┐
│                    AIONUI Application                    │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │              src/renderer/layout.tsx                │ │
│  │                                                     │ │
│  │  ┌──────────────────────────────────────────────┐  │ │
│  │  │      TableContextMenu Component              │  │ │
│  │  │                                              │  │ │
│  │  │  • Event Listeners (contextmenu)            │  │ │
│  │  │  • Shadow DOM Detection                     │  │ │
│  │  │  • MutationObserver                         │  │ │
│  │  │  • Menu Rendering                           │  │ │
│  │  └──────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │           Chat Messages (Markdown)                 │ │
│  │                                                     │ │
│  │  ┌──────────────────────────────────────────────┐  │ │
│  │  │    .markdown-shadow-body (Shadow DOM)        │  │ │
│  │  │                                              │  │ │
│  │  │    #shadow-root                              │  │ │
│  │  │    └── <table>                               │  │ │
│  │  │         ├── <thead>                          │  │ │
│  │  │         └── <tbody>                          │  │ │
│  │  └──────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Composants Principaux

### 1. TableContextMenu Component

**Fichier**: `src/renderer/components/TableContextMenu.tsx`

**Responsabilités**:
- Détecter les clics droits sur les tableaux
- Gérer l'affichage du menu contextuel
- Exécuter les opérations sur les tableaux
- Gérer le Shadow DOM

**État React**:
```typescript
const [isVisible, setIsVisible] = useState(false);           // Visibilité du menu
const [position, setPosition] = useState<MenuPosition>(...); // Position x,y du menu
const [targetTable, setTargetTable] = useState<...>(null);   // Table ciblée
const [activeCell, setActiveCell] = useState<...>(null);     // Cellule active
const [showFloatingButton, setShowFloatingButton] = useState(false); // Bouton flottant
```

### 2. Event Listeners

**Type d'événement**: `contextmenu` (clic droit)

**Capture Phase**: `true` (capture avant propagation)

```typescript
document.addEventListener('contextmenu', handleContextMenu, true);
```

**Pourquoi la capture phase?**
- Intercepte l'événement avant les autres handlers
- Empêche le menu natif du navigateur
- Garantit la priorité du menu personnalisé

### 3. Shadow DOM Detection

**Problème**: Les tableaux dans AIONUI sont encapsulés dans un Shadow DOM (`.markdown-shadow-body`), ce qui les isole du DOM principal.

**Solution**:
```typescript
// Recherche dans le Shadow DOM
document.querySelectorAll('.markdown-shadow-body').forEach((host) => {
  if (host.shadowRoot) {
    host.shadowRoot.querySelectorAll('table').forEach((t) => {
      // Attacher les event listeners
    });
  }
});
```

**Éléments Shadow DOM**:
- `.markdown-shadow-body` - Conteneur principal
- `#shadow-root` - Racine du Shadow DOM
- `<table>` - Tableaux isolés

### 4. MutationObserver

**Rôle**: Détecter les tableaux ajoutés dynamiquement dans le chat

```typescript
const observer = new MutationObserver(() => {
  attachToTables(); // Réattacher les listeners
});

observer.observe(document.body, {
  childList: true,  // Observer les ajouts/suppressions d'enfants
  subtree: true,    // Observer tous les descendants
});
```

**Pourquoi nécessaire?**
- Les messages du chat sont ajoutés dynamiquement
- Les tableaux n'existent pas au chargement initial
- Permet de capturer les nouveaux tableaux automatiquement

### 5. Table Detection Strategy

**Méthode 1**: `closest('table')`
```typescript
let table = target.closest('table') as HTMLTableElement | null;
```

**Méthode 2**: Via cellule
```typescript
const cell = target.closest('td, th');
if (cell) {
  table = cell.closest('table') as HTMLTableElement | null;
}
```

**Méthode 3**: Traversée manuelle du DOM (jusqu'à 20 niveaux)
```typescript
let element: HTMLElement | null = target;
let depth = 0;
while (element && depth < 20) {
  if (element.tagName === 'TABLE') {
    table = element as HTMLTableElement;
    break;
  }
  element = element.parentElement;
  depth++;
}
```

### 6. Chat Area Validation

**Fonction**: `isTableInChat()`

**Sélecteurs vérifiés**:
```typescript
const chatSelectors = [
  '.markdown-shadow-body',    // Principal
  '.message-item',
  '[class*="chat"]',
  '[class*="message"]',
  '[class*="conversation"]',
  '.prose',
  '.markdown-body',
  '.arco-typography',
  '[class*="markdown"]',
  '[class*="content"]',
];
```

**Logique**:
```typescript
return chatSelectors.some((selector) => table.closest(selector));
```

## Opérations Disponibles

### 1. Enable Editing
- Rend toutes les cellules `contentEditable`
- Change le curseur en mode texte

### 2. Insert Row
- Crée une nouvelle ligne avec le même nombre de colonnes
- Ajoute à la fin du `<tbody>`

### 3. Insert Column
- Ajoute une cellule à chaque ligne
- Respecte `<th>` pour les en-têtes

### 4. Delete Row
- Supprime la ligne contenant la cellule active
- Demande confirmation

### 5. Delete Column
- Calcule l'index de la colonne
- Supprime la cellule correspondante dans chaque ligne

### 6. Copy Table
- Copie le HTML complet de la table
- Utilise `navigator.clipboard.writeText()`

### 7. Export CSV
- Extrait le texte de chaque cellule
- Génère un fichier CSV téléchargeable
- Format: `cellule1,cellule2,cellule3\n`

## Intégration dans l'Application

**Fichier**: `src/renderer/layout.tsx`

```typescript
import { TableContextMenu } from './components/TableContextMenu';

// Dans le composant Layout
<>
  {/* Autres composants */}
  <TableContextMenu />
</>
```

**Pourquoi dans layout.tsx?**
- Disponible dans toute l'application
- Un seul composant pour tous les tableaux
- Gestion centralisée des événements

## Styling

**Système de design**: AIONUI CSS Variables

```typescript
background: 'var(--color-bg-1)',
border: '2px solid var(--color-primary-6)',
color: 'var(--color-text-1)',
```

**Variables utilisées**:
- `--color-bg-1` - Fond principal
- `--color-primary-6` - Couleur primaire
- `--color-fill-2` - Fond au survol
- `--color-border-2` - Bordures
- `--color-text-1` - Texte principal

## Performance

**Optimisations**:
1. **useCallback** pour toutes les fonctions
2. **Event delegation** via document
3. **Cleanup** des event listeners au démontage
4. **MutationObserver** limité au body
5. **Traversée DOM** limitée à 20 niveaux

## Sécurité

**Considérations**:
- Validation de l'existence de la table avant opération
- Confirmation pour les opérations destructives
- Pas d'injection HTML directe
- Utilisation de `textContent` plutôt que `innerHTML`

## Logs de Débogage

**Console logs actifs**:
```typescript
console.log('✅ TableContextMenu mounted');
console.log('🖱️ Right-click captured!');
console.log('📊 Table found!');
console.log('📊 In chat?', inChat);
console.log('✅ Opening menu at:', x, y);
```

**À supprimer en production**: Tous les `console.log` pour réduire le bruit

## Dépendances

**React**: 19
**Arco Design**: 2 (pour `Message.info()`)
**TypeScript**: 5.8

**APIs Web**:
- `MutationObserver`
- `navigator.clipboard`
- `document.createElement`
- `URL.createObjectURL`

## Limitations Connues

1. **Shadow DOM uniquement**: Ne fonctionne que pour les tableaux dans `.markdown-shadow-body`
2. **Pas de multi-sélection**: Une seule cellule/table à la fois
3. **CSV simple**: Pas de gestion des guillemets ou caractères spéciaux
4. **Pas de undo/redo**: Les modifications sont immédiates et irréversibles

## Évolutions Futures

1. Support de l'édition inline avec validation
2. Intégration avec N8N pour traitement avancé
3. Import/Export Excel natif
4. Historique des modifications (undo/redo)
5. Multi-sélection de cellules
6. Formules arithmétiques (comme Claraverse)
7. Analyse de données (doublons, écarts, etc.)

## Références

- [Migration AIONUI](../Migration%20AIONUI/)
- [Source Claraverse](../Migration%20AIONUI/source-claraverse/menu.js)
- [React Hooks Documentation](https://react.dev/reference/react)
- [Shadow DOM MDN](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM)
