# Intégration des Styles Claraverse dans AIONUI

## Vue d'ensemble

Les styles CSS des tables Claraverse ont été adaptés et intégrés dans AIONUI en tenant compte de l'architecture Shadow DOM. Cette intégration préserve l'apparence signature de Claraverse tout en respectant les contraintes techniques d'AIONUI.

## Modifications effectuées

### 1. Création du fichier CSS adapté

**Fichier**: `src/renderer/styles/claraverse-tables-shadow.css`

Ce fichier contient les styles Claraverse adaptés pour:
- Fonctionner dans le Shadow DOM
- Utiliser les variables CSS AIONUI au lieu des classes Tailwind
- Supporter le mode sombre AIONUI
- Être compatible avec les scripts d'amélioration de tables

### 2. Modification du composant Markdown

**Fichier**: `src/renderer/components/Markdown.tsx`

La fonction `createInitStyle()` a été modifiée pour intégrer les styles Claraverse directement dans le Shadow DOM.

**Changements**:
- Remplacement des styles de table basiques par les styles Claraverse
- Ajout des ombres prononcées caractéristiques
- En-têtes rouge bordeaux (#6b1102)
- Headers sticky pour le scroll vertical
- Effets hover sur les lignes
- Support des cellules éditables

## Caractéristiques préservées de Claraverse

### 1. Couleur signature
- **En-têtes**: Rouge bordeaux `#6b1102`
- **Texte des en-têtes**: Blanc

### 2. Effets visuels
- **Ombres prononcées**: Triple couche d'ombres pour un effet 3D
- **Coins arrondis**: `border-radius: 8px`
- **Hover**: Changement de couleur au survol des lignes

### 3. Fonctionnalités
- **Headers sticky**: Les en-têtes restent visibles lors du scroll vertical
- **Scroll horizontal**: Support automatique pour les tables larges
- **Responsive**: Adaptation pour les petits écrans

## Adaptations pour AIONUI

### 1. Variables CSS au lieu de Tailwind

| Claraverse (Tailwind) | AIONUI (CSS Variables) |
|----------------------|------------------------|
| `border-gray-200` | `var(--bg-3)` |
| `bg-gray-50` | `var(--color-fill-1)` |
| `text-gray-900` | `var(--text-primary)` |
| `blue-600` | `var(--color-primary-6)` |

### 2. Sélecteurs adaptés au Shadow DOM

**Claraverse**:
```css
.prose table.min-w-full th {
  /* styles */
}
```

**AIONUI**:
```css
table th {
  /* styles */
}
```

Les sélecteurs sont simplifiés car les styles sont injectés directement dans le Shadow DOM où se trouvent les tables.

### 3. Support du mode sombre

Les variables CSS AIONUI s'adaptent automatiquement au mode sombre:
- `var(--bg-3)` change selon le thème
- `var(--color-fill-1)` s'ajuste pour le mode sombre
- `var(--text-primary)` adapte la couleur du texte

## Fonctionnalités supplémentaires AIONUI

### 1. Cellules éditables

```css
table td[contenteditable="true"] {
  cursor: text !important;
  outline: 2px solid transparent !important;
}

table td[contenteditable="true"]:focus {
  outline-color: var(--color-primary-6) !important;
  background-color: var(--color-fill-1) !important;
}
```

### 2. Marqueur de tables traitées

```css
table.aionui-n8n-processed {
  border-left: 3px solid var(--color-primary-6) !important;
}
```

### 3. Responsive design

```css
@media (max-width: 768px) {
  table th,
  table td {
    padding: 8px 12px !important;
    font-size: 14px !important;
  }
}
```

## Structure DOM

### Claraverse
```html
<div class="prose prose-base dark:prose-invert max-w-none">
  <table class="min-w-full border border-gray-200 rounded-lg">
    <!-- contenu -->
  </table>
</div>
```

### AIONUI
```html
<div class="markdown-shadow">
  #shadow-root
    <div class="markdown-shadow-body">
      <div style="overflowX: auto">
        <table>
          <!-- contenu -->
        </table>
      </div>
    </div>
</div>
```

## Thèmes alternatifs (optionnels)

### Thème gris
```css
.theme-gray table th {
  background-color: var(--color-fill-2) !important;
  color: var(--text-primary) !important;
}
```

### Thème bleu
```css
.theme-blue table th {
  background-color: var(--color-primary-6) !important;
  color: white !important;
}
```

Pour activer un thème, ajouter la classe au conteneur parent.

## Test de l'intégration

### 1. Vérifier l'apparence

Envoyer un message avec une table markdown:

```markdown
| Nom | Prénom | Âge |
|-----|--------|-----|
| Doe | John | 30 |
| Smith | Jane | 25 |
```

**Vérifications**:
- [ ] En-têtes rouge bordeaux (#6b1102)
- [ ] Ombres prononcées visibles
- [ ] Hover change la couleur de la ligne
- [ ] Headers restent visibles au scroll
- [ ] Scroll horizontal fonctionne pour tables larges

### 2. Vérifier le mode sombre

Basculer en mode sombre et vérifier:
- [ ] Bordures s'adaptent
- [ ] Hover reste visible
- [ ] Texte reste lisible
- [ ] En-têtes restent rouge bordeaux

### 3. Vérifier l'édition

Activer l'édition des cellules:
- [ ] Curseur texte apparaît
- [ ] Outline bleu au focus
- [ ] Background change au focus

## Compatibilité

### Scripts compatibles
- ✅ `aionui_flowise.js` - Détection et amélioration de tables
- ✅ `aionui_menu.js` - Menu contextuel
- ✅ `TableContextMenu.tsx` - Composant React
- ✅ `useTablePersistence.ts` - Persistance des données

### Navigateurs testés
- ✅ Chrome/Edge (Electron 37)
- ✅ Mode clair et sombre

## Maintenance

### Modifier les couleurs des en-têtes

Éditer `src/renderer/components/Markdown.tsx`:

```typescript
table th {
  background-color: #6b1102 !important; // Changer cette valeur
  color: white !important;
}
```

### Ajuster les ombres

```typescript
table {
  box-shadow:
    0 12px 24px 0 rgba(0, 0, 0, 0.25), // Ombre principale
    0 8px 16px 0 rgba(0, 0, 0, 0.2),   // Ombre secondaire
    0 4px 8px 0 rgba(0, 0, 0, 0.15) !important; // Ombre douce
}
```

### Désactiver les styles Claraverse

Pour revenir aux styles AIONUI par défaut, remplacer le bloc de styles de table dans `Markdown.tsx` par:

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

## Références

- **Styles originaux**: `Doc_claraverse_css/claraverse-tables.css`
- **Styles adaptés**: `src/renderer/styles/claraverse-tables-shadow.css`
- **Composant modifié**: `src/renderer/components/Markdown.tsx`
- **Documentation Shadow DOM**: `Doc_selecteur_css/`

## Résolution de problèmes

### Les styles ne s'appliquent pas

1. Vérifier que le Shadow DOM est bien créé:
```javascript
const shadowHost = document.querySelector('.markdown-shadow');
console.log(shadowHost.shadowRoot); // Doit retourner un ShadowRoot
```

2. Inspecter les styles dans le Shadow DOM:
```javascript
const shadowRoot = shadowHost.shadowRoot;
const styles = shadowRoot.querySelector('style');
console.log(styles.textContent); // Doit contenir les styles Claraverse
```

### Les en-têtes ne sont pas rouge bordeaux

Vérifier que le style n'est pas écrasé par `!important`:
```javascript
const th = shadowRoot.querySelector('th');
console.log(getComputedStyle(th).backgroundColor); // Doit être rgb(107, 17, 2)
```

### Le hover ne fonctionne pas

Vérifier que la variable CSS est définie:
```javascript
const root = document.documentElement;
console.log(getComputedStyle(root).getPropertyValue('--color-fill-1'));
```

## Conclusion

L'intégration des styles Claraverse dans AIONUI est maintenant complète. Les tables du chat affichent l'apparence signature de Claraverse (en-têtes rouge bordeaux, ombres prononcées) tout en respectant l'architecture Shadow DOM d'AIONUI et en supportant le mode sombre.
