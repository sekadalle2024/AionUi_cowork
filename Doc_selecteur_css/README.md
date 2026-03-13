# Guide des Sélecteurs CSS pour les Tables du Chat AIONUI

## Vue d'ensemble

Ce dossier contient la documentation complète pour identifier et manipuler les tables dans l'interface de chat AIONUI. Les tables sont rendues dans un **Shadow DOM**, ce qui nécessite des techniques spéciales pour les détecter et les manipuler.

## Documents disponibles

1. **[STRUCTURE_DOM.md](./STRUCTURE_DOM.md)** - Structure complète du DOM et Shadow DOM
2. **[PROBLEMES_COURANTS.md](./PROBLEMES_COURANTS.md)** - Problèmes fréquents et leurs causes
3. **[SOLUTIONS.md](./SOLUTIONS.md)** - Solutions détaillées avec exemples de code
4. **[SELECTEURS_RECOMMANDES.md](./SELECTEURS_RECOMMANDES.md)** - Liste des sélecteurs à utiliser
5. **[EXEMPLES_CODE.md](./EXEMPLES_CODE.md)** - Exemples pratiques complets

## Démarrage rapide

### ❌ Ce qui NE fonctionne PAS

```javascript
// Ces méthodes ne traversent pas le Shadow DOM
document.querySelectorAll('.markdown-shadow-body table');
table.closest('.markdown-shadow-body');
document.querySelector('table');
```

### ✅ Ce qui fonctionne

```javascript
// Méthode 1: Accès direct au Shadow DOM
const shadowHosts = document.querySelectorAll('.markdown-shadow');
shadowHosts.forEach(host => {
  if (host.shadowRoot) {
    const tables = host.shadowRoot.querySelectorAll('table');
    // Traiter les tables...
  }
});

// Méthode 2: Traversée manuelle depuis une table
function isTableInChat(table) {
  let element = table;
  while (element) {
    if (element.parentElement) {
      element = element.parentElement;
    } else if (element.parentNode instanceof ShadowRoot) {
      element = element.parentNode.host; // Traverser le Shadow DOM
    } else {
      break;
    }
    
    if (element.classList?.contains('message-item')) {
      return true;
    }
  }
  return false;
}
```

## Concepts clés

### Shadow DOM
Les tables AIONUI sont encapsulées dans un Shadow DOM pour l'isolation des styles. Cela signifie:
- Les sélecteurs CSS normaux ne peuvent pas les atteindre
- Il faut accéder explicitement à `shadowRoot`
- Les événements peuvent traverser le Shadow DOM (event bubbling)

### Structure hiérarchique
```
.message-item
  └── .markdown-shadow (Shadow DOM host)
      └── #shadow-root
          └── .markdown-shadow-body
              └── table
```

## Cas d'usage

- **Scripts d'amélioration de tables** → Voir [EXEMPLES_CODE.md](./EXEMPLES_CODE.md#amélioration-de-tables)
- **Menu contextuel** → Voir [EXEMPLES_CODE.md](./EXEMPLES_CODE.md#menu-contextuel)
- **Détection de nouvelles tables** → Voir [EXEMPLES_CODE.md](./EXEMPLES_CODE.md#mutation-observer)
- **Composants React** → Voir [EXEMPLES_CODE.md](./EXEMPLES_CODE.md#composants-react)

## Support

Pour toute question ou problème:
1. Consultez [PROBLEMES_COURANTS.md](./PROBLEMES_COURANTS.md)
2. Vérifiez les exemples dans [EXEMPLES_CODE.md](./EXEMPLES_CODE.md)
3. Référez-vous à la structure dans [STRUCTURE_DOM.md](./STRUCTURE_DOM.md)
