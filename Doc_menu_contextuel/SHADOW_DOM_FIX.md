# Fix Shadow DOM - Persistance des Tables

## Problème Identifié

Le Shadow DOM (`.markdown-shadow-body`) crée une barrière qui empêche `closest()` de traverser vers les parents en dehors du Shadow DOM. C'est pourquoi `data-message-id` n'était jamais trouvé.

## Solution Appliquée

Implémenté une traversée manuelle du Shadow DOM dans `useTablePersistence.ts` qui :

1. Commence depuis l'élément `<table>`
2. Remonte les parents normalement
3. Détecte quand on atteint une frontière Shadow DOM
4. Traverse vers l'élément `host` du Shadow Root
5. Continue la recherche jusqu'à trouver `data-message-id`

## Code Modifié

```typescript
// Traverse Shadow DOM boundary manually
let messageContainer: Element | null = null;
let currentElement: Element | null = table;

while (currentElement && !messageContainer) {
  if (currentElement.hasAttribute('data-message-id')) {
    messageContainer = currentElement;
    break;
  }

  const parent = currentElement.parentElement;

  if (!parent && currentElement.parentNode) {
    // Check if we're at a shadow root boundary
    const parentNode = currentElement.parentNode;
    if (parentNode.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
      const shadowRoot = parentNode as ShadowRoot;
      if (shadowRoot.host) {
        // Cross the Shadow DOM boundary
        currentElement = shadowRoot.host;
        continue;
      }
    }
  }

  currentElement = parent;
}
```

## Structure DOM avec Shadow DOM

```
<div class="message-item" data-message-id="[id]">  ← Target
  └─ <MessageText>
      └─ <MarkdownView>
          └─ #shadow-root
              └─ <div class="markdown-shadow-body">  ← Shadow boundary
                  └─ <table>  ← Start here
```

## Test

1. Relancer l'app : `npm run start`
2. Créer une conversation avec un tableau
3. Clic droit → Enable Editing
4. Modifier une cellule
5. Vérifier les nouveaux logs :

```
[TablePersistence] 🔍 Starting Shadow DOM traversal
[TablePersistence] 🔍 Checking element: TABLE ...
[TablePersistence] 🔍 Checking element: DIV markdown-shadow-body
[TablePersistence] 🔍 Crossing Shadow DOM boundary from DIV to host DIV
[TablePersistence] 🔍 Checking element: DIV message-item
[TablePersistence] ✅ Found data-message-id on: DIV
[TablePersistence] ✅ Found message ID: [id]
[TablePersistence] ✅ Table modifications synced to database
```

## Fichier Modifié

- `src/renderer/hooks/useTablePersistence.ts` - Ajout de la traversée Shadow DOM

## Prochaines Étapes

Après avoir relancé l'app, testez la persistance et vérifiez que les logs montrent bien la traversée du Shadow DOM et la découverte de `data-message-id`.
