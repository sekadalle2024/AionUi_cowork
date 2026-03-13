# Mémo - Intégration Styles Claraverse dans AIONUI

## Date
2025 - Intégration complète

## Contexte

Les styles CSS des tables du projet Claraverse ont été adaptés et intégrés dans AIONUI pour donner aux tables du chat une apparence professionnelle et distinctive.

## Problème résolu

**Avant**: Tables AIONUI avec style minimaliste (en-têtes gris, pas d'ombres)
**Après**: Tables avec style Claraverse (en-têtes rouge bordeaux, ombres prononcées)

## Contrainte technique majeure

Les tables AIONUI sont rendues dans un **Shadow DOM**, ce qui nécessite une adaptation spéciale des styles CSS.

### Pourquoi le Shadow DOM pose problème

```javascript
// ❌ Ne fonctionne PAS
document.querySelectorAll('table'); // Ne trouve pas les tables dans Shadow DOM

// ❌ Ne fonctionne PAS
.prose table { /* styles */ } // Les sélecteurs externes n'atteignent pas le Shadow DOM

// ✅ Fonctionne
shadowHost.shadowRoot.querySelectorAll('table'); // Accès direct au Shadow Root
```

## Solution implémentée

### 1. Injection des styles dans le Shadow DOM

**Fichier modifié**: `src/renderer/components/Markdown.tsx`

Les styles Claraverse sont injectés directement dans la fonction `createInitStyle()` qui crée le `<style>` tag dans chaque Shadow Root.

**Ligne ~320-400**: Remplacement du bloc de styles de table

### 2. Adaptation des sélecteurs

**Claraverse original** (Tailwind):
```css
.prose table.min-w-full th {
  background-color: #6b1102;
}
```

**AIONUI adapté** (Shadow DOM):
```css
table th {
  background-color: #6b1102 !important;
}
```

### 3. Utilisation des variables CSS AIONUI

**Claraverse**: Classes Tailwind (`border-gray-200`, `bg-gray-50`)
**AIONUI**: Variables CSS (`var(--bg-3)`, `var(--color-fill-1)`)

## Styles intégrés

### En-têtes rouge bordeaux
```css
table th {
  background-color: #6b1102 !important;
  color: white !important;
  padding: 12px 16px !important;
}
```

### Ombres prononcées
```css
table {
  box-shadow:
    0 12px 24px 0 rgba(0, 0, 0, 0.25),
    0 8px 16px 0 rgba(0, 0, 0, 0.2),
    0 4px 8px 0 rgba(0, 0, 0, 0.15) !important;
}
```

### Headers sticky
```css
table thead {
  position: sticky !important;
  top: 0 !important;
  z-index: 10 !important;
}
```

### Hover effects
```css
table tbody tr:hover {
  background-color: var(--color-fill-1) !important;
}
```

## Fichiers créés/modifiés

### Modifié
- ✅ `src/renderer/components/Markdown.tsx` (lignes ~320-400)

### Créés
- ✅ `src/renderer/styles/claraverse-tables-shadow.css` (référence)
- ✅ `Doc_claraverse_css/INTEGRATION_AIONUI.md` (documentation)
- ✅ `Doc_claraverse_css/TEST_INTEGRATION.md` (guide de test)
- ✅ `INTEGRATION_CLARAVERSE_COMPLETE.md` (résumé)

## Test rapide

```bash
# 1. Lancer l'application
bun run start

# 2. Créer une conversation et envoyer:
| Nom | Prénom | Âge |
|-----|--------|-----|
| Doe | John | 30 |

# 3. Vérifier:
# - En-têtes rouge bordeaux ✓
# - Ombres visibles ✓
# - Hover change la couleur ✓
```

## Vérification DevTools

```javascript
// Console
const shadowHost = document.querySelector('.markdown-shadow');
const table = shadowHost.shadowRoot.querySelector('table');
const th = table.querySelector('th');
console.log(getComputedStyle(th).backgroundColor);
// Résultat attendu: rgb(107, 17, 2)
```

## Compatibilité

### Scripts existants
- ✅ `aionui_flowise.js` - Détection tables OK
- ✅ `aionui_menu.js` - Menu contextuel OK
- ✅ `TableContextMenu.tsx` - Composant React OK
- ✅ `useTablePersistence.ts` - Persistance OK

### Modes
- ✅ Mode clair
- ✅ Mode sombre (variables CSS s'adaptent automatiquement)
- ✅ Responsive (media query @768px)

## Points clés à retenir

### 1. Shadow DOM = Isolation
Les styles globaux n'affectent pas le contenu du Shadow DOM. Il faut injecter les styles directement dans chaque Shadow Root.

### 2. Variables CSS traversent le Shadow DOM
Les variables CSS définies sur `:root` sont accessibles dans le Shadow DOM, ce qui permet le support du mode sombre.

### 3. Sélecteurs simplifiés
Dans le Shadow DOM, on peut utiliser des sélecteurs simples (`table`, `th`, `td`) car il n'y a pas de conflit avec d'autres éléments.

### 4. !important nécessaire
Pour garantir que les styles Claraverse ne soient pas écrasés, `!important` est utilisé sur les propriétés critiques.

## Maintenance

### Changer la couleur des en-têtes
Éditer `src/renderer/components/Markdown.tsx` ligne ~330:
```typescript
table th {
  background-color: #6b1102 !important; // Modifier ici
}
```

### Ajuster les ombres
Ligne ~320:
```typescript
box-shadow:
  0 12px 24px 0 rgba(0, 0, 0, 0.25), // Intensité principale
  0 8px 16px 0 rgba(0, 0, 0, 0.2),   // Intensité secondaire
  0 4px 8px 0 rgba(0, 0, 0, 0.15) !important; // Intensité douce
```

### Revenir aux styles originaux
Remplacer le bloc de styles de table par:
```typescript
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

## Problèmes potentiels

### Les styles ne s'appliquent pas
**Cause**: Modification non prise en compte
**Solution**: 
1. Redémarrer l'application: `bun run start`
2. Vider le cache: `Ctrl+Shift+R`

### Les en-têtes ne sont pas rouge bordeaux
**Cause**: Style écrasé ou Shadow DOM non créé
**Solution**: Inspecter dans DevTools et vérifier que le Shadow Root existe

### Le hover ne fonctionne pas
**Cause**: Variable `--color-fill-1` non définie
**Solution**: Vérifier que les variables CSS AIONUI sont bien injectées

## Documentation complète

Pour plus de détails, consulter:
- `Doc_claraverse_css/INTEGRATION_AIONUI.md` - Guide complet
- `Doc_claraverse_css/TEST_INTEGRATION.md` - Tests détaillés
- `Doc_selecteur_css/STRUCTURE_DOM.md` - Structure Shadow DOM
- `Doc_selecteur_css/SOLUTIONS.md` - Solutions techniques

## Résumé en une ligne

**Les styles Claraverse (en-têtes rouge bordeaux, ombres prononcées) sont maintenant injectés dans le Shadow DOM d'AIONUI via `Markdown.tsx`, préservant l'apparence signature de Claraverse tout en respectant l'architecture technique d'AIONUI.**

---

**Statut**: ✅ Intégration complète et fonctionnelle
**Test**: `bun run start` puis envoyer une table markdown
**Maintenance**: Éditer `src/renderer/components/Markdown.tsx` lignes ~320-400
