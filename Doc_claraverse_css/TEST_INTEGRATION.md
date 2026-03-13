# Guide de Test - Intégration Styles Claraverse

## Démarrage rapide

### 1. Lancer l'application

```bash
bun run start
```

### 2. Créer une conversation

1. Ouvrir AIONUI
2. Créer une nouvelle conversation
3. Envoyer un message avec une table markdown

### 3. Exemple de table à tester

Copier-coller ce message dans le chat:

```markdown
Voici un tableau de test:

| Nom | Prénom | Âge | Ville | Profession |
|-----|--------|-----|-------|------------|
| Dupont | Jean | 35 | Paris | Développeur |
| Martin | Marie | 28 | Lyon | Designer |
| Bernard | Pierre | 42 | Marseille | Chef de projet |
| Dubois | Sophie | 31 | Toulouse | Analyste |
| Moreau | Luc | 39 | Nice | Architecte |
```

## Checklist de vérification

### Apparence générale

- [ ] **En-têtes rouge bordeaux** (#6b1102)
  - Les en-têtes (Nom, Prénom, Âge, etc.) doivent être rouge bordeaux foncé
  - Le texte des en-têtes doit être blanc

- [ ] **Ombres prononcées**
  - La table doit avoir des ombres visibles en dessous
  - Effet 3D subtil

- [ ] **Coins arrondis**
  - Les coins de la table doivent être arrondis (8px)

- [ ] **Bordures**
  - Bordure grise autour de la table
  - Bordures entre les cellules

### Interactions

- [ ] **Hover sur les lignes**
  - Survoler une ligne avec la souris
  - La ligne doit changer de couleur de fond

- [ ] **Scroll horizontal**
  - Réduire la largeur de la fenêtre
  - La table doit avoir un scroll horizontal si nécessaire

- [ ] **Headers sticky**
  - Ajouter plusieurs lignes à la table (10+)
  - Scroller verticalement
  - Les en-têtes doivent rester visibles en haut

### Mode sombre

- [ ] **Basculer en mode sombre**
  - Cliquer sur l'icône de thème
  - Passer en mode sombre

- [ ] **Vérifier l'apparence**
  - En-têtes toujours rouge bordeaux
  - Bordures adaptées au mode sombre
  - Hover toujours visible
  - Texte lisible

### Responsive

- [ ] **Réduire la fenêtre**
  - Réduire la largeur à ~600px
  - Vérifier que le padding des cellules s'adapte
  - Vérifier que la taille de police diminue

## Tests avancés

### Test 1: Table avec colonne Flowise

```markdown
| Nom | Flowise | Description |
|-----|---------|-------------|
| Test 1 | keyword1 | Description test 1 |
| Test 2 | keyword2 | Description test 2 |
```

**Vérifications**:
- [ ] La table s'affiche correctement
- [ ] Le script `aionui_flowise.js` détecte la colonne Flowise
- [ ] Console affiche: "✅ Container X: Match found for keyword"

### Test 2: Édition de cellules

1. Ctrl+Click sur la table
2. Sélectionner "Enable editing"

**Vérifications**:
- [ ] Les cellules deviennent éditables
- [ ] Curseur texte apparaît au clic
- [ ] Outline bleu au focus
- [ ] Background change au focus

### Test 3: Menu contextuel

1. Ctrl+Click sur la table
2. Le menu contextuel doit apparaître

**Vérifications**:
- [ ] Menu s'affiche
- [ ] Options disponibles (Edit, Export, Copy)
- [ ] Menu fonctionne correctement

### Test 4: Grande table

```markdown
| Col1 | Col2 | Col3 | Col4 | Col5 | Col6 | Col7 | Col8 |
|------|------|------|------|------|------|------|------|
| A1 | B1 | C1 | D1 | E1 | F1 | G1 | H1 |
| A2 | B2 | C2 | D2 | E2 | F2 | G2 | H2 |
| A3 | B3 | C3 | D3 | E3 | F3 | G3 | H3 |
| A4 | B4 | C4 | D4 | E4 | F4 | G4 | H4 |
| A5 | B5 | C5 | D5 | E5 | F5 | G5 | H5 |
| A6 | B6 | C6 | D6 | E6 | F6 | G6 | H6 |
| A7 | B7 | C7 | D7 | E7 | F7 | G7 | H7 |
| A8 | B8 | C8 | D8 | E8 | F8 | G8 | H8 |
| A9 | B9 | C9 | D9 | E9 | F9 | G9 | H9 |
| A10 | B10 | C10 | D10 | E10 | F10 | G10 | H10 |
```

**Vérifications**:
- [ ] Scroll horizontal fonctionne
- [ ] Scroll vertical fonctionne
- [ ] Headers restent sticky
- [ ] Performance acceptable

## Inspection dans DevTools

### 1. Ouvrir DevTools

Appuyer sur `F12` ou `Ctrl+Shift+I`

### 2. Inspecter le Shadow DOM

1. Onglet Elements
2. Chercher `.markdown-shadow`
3. Cliquer sur `#shadow-root` pour l'explorer
4. Trouver la `<table>`

### 3. Vérifier les styles

Dans l'inspecteur, sélectionner un `<th>`:

```
Computed styles:
- background-color: rgb(107, 17, 2) ✓
- color: rgb(255, 255, 255) ✓
- padding: 12px 16px ✓
- font-weight: 600 ✓
```

### 4. Vérifier les ombres

Sélectionner la `<table>`:

```
Computed styles:
- box-shadow: 0 12px 24px 0 rgba(0, 0, 0, 0.25), ... ✓
- border-radius: 8px ✓
```

## Console JavaScript

### Vérifier le Shadow DOM

```javascript
// Trouver le Shadow Host
const shadowHost = document.querySelector('.markdown-shadow');
console.log('Shadow Host:', shadowHost);

// Accéder au Shadow Root
const shadowRoot = shadowHost.shadowRoot;
console.log('Shadow Root:', shadowRoot);

// Trouver la table
const table = shadowRoot.querySelector('table');
console.log('Table:', table);

// Vérifier les styles
const th = table.querySelector('th');
const computedStyle = getComputedStyle(th);
console.log('Header background:', computedStyle.backgroundColor);
console.log('Header color:', computedStyle.color);
```

### Vérifier les scripts

```javascript
// Vérifier que les scripts sont chargés
console.log('Flowise script:', window.aionui_flowise);
console.log('Menu script:', window.aionui_menu);
```

## Problèmes courants

### Les en-têtes ne sont pas rouge bordeaux

**Cause**: Styles non appliqués dans le Shadow DOM

**Solution**:
1. Vérifier que `Markdown.tsx` a été modifié
2. Redémarrer l'application: `bun run start`
3. Vider le cache: `Ctrl+Shift+R`

### Les ombres ne sont pas visibles

**Cause**: Ombres masquées par le conteneur parent

**Solution**:
1. Vérifier le padding du conteneur
2. Inspecter le wrapper div
3. Ajuster le CSS si nécessaire

### Le hover ne fonctionne pas

**Cause**: Variable CSS `--color-fill-1` non définie

**Solution**:
```javascript
// Vérifier la variable
const root = document.documentElement;
const fillColor = getComputedStyle(root).getPropertyValue('--color-fill-1');
console.log('Fill color:', fillColor);
```

### Les headers ne sont pas sticky

**Cause**: Conteneur parent avec `overflow: hidden`

**Solution**:
1. Inspecter le conteneur parent
2. Vérifier les propriétés `overflow`
3. Ajuster si nécessaire

## Résultats attendus

### ✅ Succès

- En-têtes rouge bordeaux (#6b1102)
- Ombres prononcées visibles
- Hover change la couleur des lignes
- Headers sticky au scroll
- Scroll horizontal fonctionne
- Mode sombre fonctionne
- Responsive adapte les tailles

### ❌ Échec

Si un des points ci-dessus ne fonctionne pas:

1. Consulter `Doc_claraverse_css/INTEGRATION_AIONUI.md`
2. Vérifier les modifications dans `Markdown.tsx`
3. Inspecter le Shadow DOM dans DevTools
4. Consulter la console pour les erreurs

## Rapport de test

Après avoir effectué tous les tests, remplir ce rapport:

```
Date: ___________
Testeur: ___________

Apparence générale: ☐ OK ☐ KO
Interactions: ☐ OK ☐ KO
Mode sombre: ☐ OK ☐ KO
Responsive: ☐ OK ☐ KO
Tests avancés: ☐ OK ☐ KO

Problèmes rencontrés:
_______________________
_______________________
_______________________

Notes:
_______________________
_______________________
_______________________
```

## Prochaines étapes

Si tous les tests passent:
- ✅ L'intégration est réussie
- ✅ Les styles Claraverse sont actifs
- ✅ Prêt pour la production

Si des tests échouent:
- Consulter la section "Résolution de problèmes"
- Vérifier les fichiers modifiés
- Contacter l'équipe de développement
