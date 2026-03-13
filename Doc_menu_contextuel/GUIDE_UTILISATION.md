# Guide d'Utilisation - Menu Contextuel AIONUI

**Date**: 13 mars 2026  
**Version**: 1.0  
**Public**: Développeurs et Utilisateurs

## Vue d'Ensemble

Le menu contextuel permet d'interagir avec les tableaux dans les conversations AIONUI via un simple clic droit. Ce guide explique comment utiliser, personnaliser et maintenir ce système.

---

## Pour les Utilisateurs

### Utilisation Basique

#### 1. Ouvrir le Menu
1. Ouvrez une conversation contenant un tableau
2. **Clic droit** sur n'importe quelle cellule du tableau
3. Le menu contextuel apparaît à la position du curseur

**Raccourci**: Clic droit sur le tableau

#### 2. Opérations Disponibles

##### ✏️ Enable Editing
**Action**: Rend toutes les cellules du tableau éditables

**Utilisation**:
1. Clic droit → "Enable Editing"
2. Cliquez sur une cellule pour la modifier
3. Tapez votre texte
4. Cliquez ailleurs pour valider

**Exemple**:
```
Avant: | Nom | Âge |
       | --- | --- |
       | Alice | 30 |

Après édition: | Nom | Âge |
               | --- | --- |
               | Alice | 31 | ← Modifié
```

##### ➕ Insert Row
**Action**: Ajoute une nouvelle ligne à la fin du tableau

**Utilisation**:
1. Clic droit sur n'importe quelle cellule
2. Sélectionner "Insert Row"
3. Une nouvelle ligne vide apparaît

**Résultat**:
```
| Nom | Âge |
| --- | --- |
| Alice | 30 |
| Bob | 25 |
| [Nouvelle ligne] | [Nouvelle ligne] | ← Ajoutée
```

##### ➕ Insert Column
**Action**: Ajoute une nouvelle colonne à droite du tableau

**Utilisation**:
1. Clic droit sur n'importe quelle cellule
2. Sélectionner "Insert Column"
3. Une nouvelle colonne apparaît à droite

**Résultat**:
```
| Nom | Âge | New | ← Nouvelle colonne
| --- | --- | --- |
| Alice | 30 | New |
| Bob | 25 | New |
```

##### 🗑️ Delete Row
**Action**: Supprime la ligne contenant la cellule sélectionnée

**Utilisation**:
1. Clic droit sur une cellule de la ligne à supprimer
2. Sélectionner "Delete Row"
3. Confirmer la suppression

**⚠️ Attention**: Cette action est irréversible!

##### 🗑️ Delete Column
**Action**: Supprime la colonne contenant la cellule sélectionnée

**Utilisation**:
1. Clic droit sur une cellule de la colonne à supprimer
2. Sélectionner "Delete Column"
3. Confirmer la suppression

**⚠️ Attention**: Cette action est irréversible!

##### 📋 Copy Table
**Action**: Copie le HTML complet du tableau dans le presse-papiers

**Utilisation**:
1. Clic droit sur le tableau
2. Sélectionner "Copy Table"
3. Coller ailleurs (Ctrl+V)

**Format copié**: HTML complet du tableau

##### 📄 Export CSV
**Action**: Exporte le tableau au format CSV

**Utilisation**:
1. Clic droit sur le tableau
2. Sélectionner "Export CSV"
3. Le fichier `table-export.csv` est téléchargé

**Format CSV**:
```csv
Nom,Âge,Ville
Alice,30,Paris
Bob,25,Lyon
```

##### ❌ Close Menu
**Action**: Ferme le menu contextuel

**Raccourcis**:
- Cliquer sur "Close Menu"
- Appuyer sur `Échap`
- Cliquer en dehors du menu

---

## Pour les Développeurs

### Installation

Le composant est déjà intégré dans `src/renderer/layout.tsx`:

```typescript
import { TableContextMenu } from './components/TableContextMenu';

// Dans le composant Layout
<>
  {/* Autres composants */}
  <TableContextMenu />
</>
```

**Aucune configuration supplémentaire nécessaire!**

### Personnalisation

#### 1. Ajouter une Nouvelle Opération

**Étape 1**: Créer la fonction dans `TableContextMenu.tsx`

```typescript
const myCustomOperation = useCallback(() => {
  if (!targetTable) return;
  
  // Votre logique ici
  console.log('Custom operation executed');
  
  showNotification('✅ Operation completed');
  hideMenu();
}, [targetTable, showNotification, hideMenu]);
```

**Étape 2**: Ajouter au menu

```typescript
const menuItems = [
  // ... items existants
  { 
    icon: '🎯', 
    text: 'My Custom Operation', 
    action: myCustomOperation 
  },
];
```

#### 2. Modifier le Style du Menu

**Variables CSS à utiliser**:
```typescript
style={{
  background: 'var(--color-bg-1)',      // Fond
  border: '2px solid var(--color-primary-6)', // Bordure
  color: 'var(--color-text-1)',         // Texte
  // ... autres styles
}}
```

**Variables AIONUI disponibles**:
- `--color-bg-1`, `--color-bg-2`, `--color-bg-3`
- `--color-primary-6`
- `--color-fill-2`
- `--color-border-2`
- `--color-text-1`, `--color-text-2`

#### 3. Changer la Position du Menu

**Modifier la fonction `showMenu()`**:

```typescript
const showMenu = useCallback((x: number, y: number) => {
  setPosition({
    x: Math.min(x, window.innerWidth - 220),  // Marge droite
    y: Math.min(y, window.innerHeight - 400), // Marge bas
  });
  setIsVisible(true);
}, []);
```

**Ajuster les marges** selon vos besoins.

#### 4. Ajouter des Raccourcis Clavier

**Dans le `useEffect` des event listeners**:

```typescript
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    hideMenu();
  }
  
  // Ajouter votre raccourci
  if (e.ctrlKey && e.key === 'k') {
    e.preventDefault();
    myCustomOperation();
  }
};

document.addEventListener('keydown', handleKeyDown);
```

### Intégration avec N8N

Pour intégrer une opération avec N8N (comme dans Claraverse):

```typescript
const executeN8nWorkflow = useCallback(async () => {
  if (!targetTable) return;
  
  // Extraire les données du tableau
  const tableData = extractTableData(targetTable);
  
  // Appeler N8N
  try {
    const response = await fetch('http://localhost:5678/webhook/your-workflow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: tableData }),
    });
    
    const result = await response.json();
    showNotification('✅ Workflow executed');
  } catch (error) {
    showNotification('❌ Workflow failed');
  }
  
  hideMenu();
}, [targetTable, showNotification, hideMenu]);
```

### Débogage

#### Activer les Logs

Les logs sont déjà présents dans le code:

```typescript
console.log('✅ TableContextMenu mounted');
console.log('🖱️ Right-click captured!');
console.log('📊 Table found!');
console.log('📊 In chat?', inChat);
```

**Pour ajouter vos propres logs**:

```typescript
console.log('🔍 [Debug] My custom log:', variable);
```

#### Inspecter le Shadow DOM

**Dans DevTools**:
1. Ouvrir DevTools (F12)
2. Onglet "Elements"
3. Chercher `.markdown-shadow-body`
4. Cliquer sur `#shadow-root` pour l'ouvrir
5. Inspecter les tableaux à l'intérieur

#### Tester les Événements

**Dans la console**:

```javascript
// Tester la détection de table
document.querySelectorAll('.markdown-shadow-body').forEach(host => {
  if (host.shadowRoot) {
    console.log('Tables:', host.shadowRoot.querySelectorAll('table'));
  }
});

// Tester le clic droit
document.addEventListener('contextmenu', (e) => {
  console.log('Right-click:', e.target);
}, true);
```

### Tests

#### Test Manuel

1. Ouvrir une conversation avec un tableau
2. Clic droit sur le tableau
3. Vérifier que le menu apparaît
4. Tester chaque opération
5. Vérifier les notifications

#### Test Automatisé (Future)

```typescript
// tests/unit/table-context-menu.test.ts
import { render, fireEvent } from '@testing-library/react';
import { TableContextMenu } from '@/components/TableContextMenu';

describe('TableContextMenu', () => {
  it('should open menu on right-click', () => {
    const { container } = render(<TableContextMenu />);
    
    const table = document.createElement('table');
    document.body.appendChild(table);
    
    fireEvent.contextMenu(table);
    
    expect(container.querySelector('.table-context-menu')).toBeInTheDocument();
  });
});
```

### Performance

#### Optimisations Actuelles

1. **useCallback**: Toutes les fonctions sont mémorisées
2. **Event Delegation**: Un seul listener au niveau document
3. **Cleanup**: Suppression des listeners au démontage

#### Optimisations Futures

**Debouncing du MutationObserver**:

```typescript
let debounceTimer: NodeJS.Timeout;

const observer = new MutationObserver(() => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    attachToTables();
  }, 100);
});
```

**Lazy Loading des Opérations**:

```typescript
const heavyOperation = useCallback(async () => {
  const module = await import('./heavy-operation');
  module.execute(targetTable);
}, [targetTable]);
```

### Maintenance

#### Avant Chaque Commit

```bash
# Linter le code
bun run lint:fix

# Vérifier les types
bunx tsc --noEmit

# Exécuter les tests
bun run test
```

#### Supprimer les Logs de Debug

**Avant la production**, supprimer tous les `console.log`:

```typescript
// ❌ À supprimer
console.log('🖱️ Right-click captured!');

// ✅ Garder uniquement les erreurs
console.error('❌ Error:', error);
```

**Commande pour trouver les logs**:

```bash
grep -r "console.log" src/renderer/components/TableContextMenu.tsx
```

#### Mise à Jour des Dépendances

```bash
# Vérifier les mises à jour
bun outdated

# Mettre à jour
bun update
```

---

## Dépannage

### Le Menu Ne S'Ouvre Pas

**Vérifications**:
1. ✅ Le tableau est-il dans une zone de chat?
2. ✅ Le composant est-il monté? (vérifier les logs)
3. ✅ Y a-t-il des erreurs dans la console?

**Solution**:
```typescript
// Vérifier dans la console
document.querySelectorAll('.markdown-shadow-body').forEach(host => {
  console.log('Shadow root:', host.shadowRoot);
});
```

### Les Opérations Ne Fonctionnent Pas

**Vérifications**:
1. ✅ `targetTable` est-il défini?
2. ✅ Y a-t-il des erreurs JavaScript?
3. ✅ Les permissions sont-elles accordées? (clipboard)

**Solution**:
```typescript
// Ajouter des logs
const myOperation = useCallback(() => {
  console.log('Target table:', targetTable);
  if (!targetTable) {
    console.error('No target table!');
    return;
  }
  // ... opération
}, [targetTable]);
```

### Le Menu Reste Ouvert

**Cause**: Event listener de fermeture non attaché

**Solution**:
```typescript
// Vérifier le cleanup
useEffect(() => {
  // ... event listeners
  
  return () => {
    // Cleanup OBLIGATOIRE
    document.removeEventListener('contextmenu', handleContextMenu, true);
    document.removeEventListener('click', handleClick, true);
  };
}, []);
```

---

## Exemples d'Utilisation

### Exemple 1: Éditer un Tableau de Données

```
1. Créer un tableau dans le chat:
   | Produit | Prix | Stock |
   | ------- | ---- | ----- |
   | Laptop  | 1000 | 5     |
   | Mouse   | 20   | 50    |

2. Clic droit → "Enable Editing"

3. Modifier les valeurs:
   | Produit | Prix | Stock |
   | ------- | ---- | ----- |
   | Laptop  | 900  | 3     | ← Modifié
   | Mouse   | 25   | 45    | ← Modifié
```

### Exemple 2: Ajouter des Données

```
1. Tableau initial:
   | Nom | Email |
   | --- | ----- |
   | Alice | alice@example.com |

2. Clic droit → "Insert Row"

3. Clic droit → "Enable Editing"

4. Remplir la nouvelle ligne:
   | Nom | Email |
   | --- | ----- |
   | Alice | alice@example.com |
   | Bob | bob@example.com | ← Ajouté
```

### Exemple 3: Exporter des Données

```
1. Tableau avec données:
   | ID | Nom | Statut |
   | -- | --- | ------ |
   | 1  | Task A | Done |
   | 2  | Task B | Pending |

2. Clic droit → "Export CSV"

3. Fichier téléchargé: table-export.csv
   ID,Nom,Statut
   1,Task A,Done
   2,Task B,Pending
```

---

## Ressources

### Documentation
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture technique
- [PROBLEMES_ET_SOLUTIONS.md](./PROBLEMES_ET_SOLUTIONS.md) - Historique des problèmes
- [Migration AIONUI](../Migration%20AIONUI/) - Documentation de migration

### Code Source
- `src/renderer/components/TableContextMenu.tsx` - Composant principal
- `src/renderer/layout.tsx` - Intégration

### Références Externes
- [React Hooks](https://react.dev/reference/react)
- [Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM)
- [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)
- [Arco Design](https://arco.design/)

---

## Support

Pour toute question ou problème:
1. Consulter [PROBLEMES_ET_SOLUTIONS.md](./PROBLEMES_ET_SOLUTIONS.md)
2. Vérifier les logs dans DevTools (F12)
3. Consulter l'historique de migration dans `Migration AIONUI/`

**Version**: 1.0  
**Dernière mise à jour**: 13 mars 2026
