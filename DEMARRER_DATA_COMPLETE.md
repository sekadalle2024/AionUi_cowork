# Guide pour copier les données complètes du menu Démarrer

## Situation actuelle

Le composant `src/renderer/components/DemarrerMenu.tsx` contient actuellement une **version simplifiée** des données pour tester l'intégration.

Le fichier source `public/DemarrerMenu.tsx` contient **TOUTES les données complètes** (3672 lignes) avec :

- **E-audit pro** : Phase de préparation, Phase de réalisation, Phase de conclusion
- **E-revision** : Planification, Revue analytique, Programme de contrôle (avec tous les cycles comptables)
- **E-cartographie** : Analyse des risques
- **E-contrôle** : Phase de préparation, Phase de réalisation, Phase de conclusion
- **E-CIA exam part 1** : Section A, Section B, Section C, Section D (avec tous les objectifs)
- **Bibliothèque** : Guides, Commandes complémentaires

## Comment copier les données complètes

### Méthode 1 : Copie manuelle (recommandée)

1. **Ouvrir les deux fichiers côte à côte** :
   - `public/DemarrerMenu.tsx` (source)
   - `src/renderer/components/DemarrerMenu.tsx` (destination)

2. **Localiser la section MENU_DATA** :
   - Dans le fichier source : lignes 108 à 3277
   - Dans le fichier destination : chercher `const MENU_DATA: LogicielItem[]`

3. **Copier le contenu** :
   - Sélectionner tout le contenu de `MENU_DATA` dans le fichier source
   - Remplacer le contenu simplifié dans le fichier destination

4. **Adapter les icônes** :
   - Remplacer les icônes Lucide par des icônes UnoCSS ou @icon-park/react
   - Exemple : `<Briefcase className="w-4 h-4" />` → `<span className="i-carbon-briefcase w-4 h-4" />`

### Méthode 2 : Script de copie

Créer un script Node.js pour automatiser la copie :

```javascript
const fs = require('fs');

// Lire le fichier source
const source = fs.readFileSync('public/DemarrerMenu.tsx', 'utf8');

// Extraire MENU_DATA (lignes 108 à 3277)
const lines = source.split('\n');
const menuDataLines = lines.slice(107, 3277); // indices 0-based
const menuData = menuDataLines.join('\n');

// Lire le fichier destination
const dest = fs.readFileSync('src/renderer/components/DemarrerMenu.tsx', 'utf8');

// Remplacer MENU_DATA
const destLines = dest.split('\n');
const startIndex = destLines.findIndex(line => line.includes('const MENU_DATA: LogicielItem[]'));
const endIndex = destLines.findIndex((line, i) => i > startIndex && line.trim() === '];');

// Reconstruire le fichier
const newDest = [
  ...destLines.slice(0, startIndex),
  'const MENU_DATA: LogicielItem[] = [',
  ...menuDataLines.slice(1, -1), // Exclure la première et dernière ligne
  '];',
  ...destLines.slice(endIndex + 1)
].join('\n');

// Écrire le résultat
fs.writeFileSync('src/renderer/components/DemarrerMenu.tsx', newDest, 'utf8');
console.log('✅ Données copiées avec succès !');
```

### Méthode 3 : Import depuis un fichier séparé

Créer un fichier de données séparé pour garder le composant propre :

1. **Créer** `src/renderer/components/DemarrerMenu.data.tsx` :
   ```typescript
   // Copier tout le contenu de MENU_DATA depuis public/DemarrerMenu.tsx
   export const MENU_DATA = [ /* ... */ ];
   ```

2. **Importer dans le composant** :
   ```typescript
   import { MENU_DATA } from './DemarrerMenu.data';
   ```

## Adaptation des icônes

Le fichier source utilise des icônes Lucide React. Voici les correspondances UnoCSS :

| Lucide | UnoCSS Carbon |
|--------|---------------|
| `<Briefcase />` | `<span className="i-carbon-briefcase" />` |
| `<Calculator />` | `<span className="i-carbon-calculator" />` |
| `<Map />` | `<span className="i-carbon-map" />` |
| `<Shield />` | `<span className="i-carbon-security" />` |
| `<FileText />` | `<span className="i-carbon-document" />` |
| `<FileCheck />` | `<span className="i-carbon-document-tasks" />` |
| `<AlertTriangle />` | `<span className="i-carbon-warning" />` |
| `<FileSearch />` | `<span className="i-carbon-search" />` |
| `<CheckSquare />` | `<span className="i-carbon-checkbox-checked" />` |
| `<Target />` | `<span className="i-carbon-target" />` |
| `<BarChart3 />` | `<span className="i-carbon-chart-bar" />` |
| `<Settings />` | `<span className="i-carbon-settings" />` |
| `<Cog />` | `<span className="i-carbon-settings-adjust" />` |
| `<TrendingUp />` | `<span className="i-carbon-trending-up" />` |
| `<User />` | `<span className="i-carbon-user" />` |
| `<Package />` | `<span className="i-carbon-package" />` |
| `<Building />` | `<span className="i-carbon-building" />` |
| `<Users />` | `<span className="i-carbon-user-multiple" />` |
| `<Truck />` | `<span className="i-carbon-delivery-truck" />` |
| `<UserCheck />` | `<span className="i-carbon-user-certification" />` |
| `<PiggyBank />` | `<span className="i-carbon-piggy-bank" />` |
| `<Receipt />` | `<span className="i-carbon-receipt" />` |
| `<HelpCircle />` | `<span className="i-carbon-help" />` |
| `<GraduationCap />` | `<span className="i-carbon-education" />` |
| `<BookOpen />` | `<span className="i-carbon-book" />` |

## Script de remplacement des icônes

```bash
# Remplacer toutes les icônes Lucide par UnoCSS
sed -i 's/<Briefcase className="w-4 h-4" \/>/<span className="i-carbon-briefcase w-4 h-4" \/>/g' src/renderer/components/DemarrerMenu.tsx
sed -i 's/<Calculator className="w-4 h-4" \/>/<span className="i-carbon-calculator w-4 h-4" \/>/g' src/renderer/components/DemarrerMenu.tsx
# ... etc pour toutes les icônes
```

## Vérification après copie

1. **Formater le code** :
   ```bash
   npx prettier --write "src/renderer/components/DemarrerMenu.tsx"
   ```

2. **Vérifier les erreurs TypeScript** :
   ```bash
   npx tsc --noEmit
   ```

3. **Tester l'application** :
   ```bash
   bun run start
   ```

## Structure complète des données

Le fichier source contient :

### E-audit pro (3 phases)
- Phase de préparation (8 étapes)
- Phase de réalisation (1 étape)
- Phase de conclusion (6 étapes)

### E-revision (3 phases)
- Planification (5 étapes)
- Revue analytique (2 étapes)
- Programme de contrôle (8 cycles comptables avec ~100 tests)

### E-cartographie (1 phase)
- Analyse des risques (6 étapes)

### E-contrôle (2 phases)
- Phase de préparation (2 étapes)
- Phase de conclusion (6 étapes)

### E-CIA exam part 1 (4 sections)
- Section A : Fondements de l'audit interne (8 objectifs)
- Section B : Éthique et professionnalisme (objectifs)
- Section C : Gouvernance (objectifs)
- Section D : Risques de fraude (objectifs)

### Bibliothèque (2 phases)
- Guides (2 étapes)
- Commandes complémentaires (1 étape)

## Estimation

- **Taille totale** : ~3200 lignes de données
- **Nombre d'étapes** : ~150+
- **Nombre de tests** : ~100+
- **Temps de copie manuelle** : 15-30 minutes
- **Temps avec script** : 2-5 minutes

## Recommandation

Pour une intégration rapide et sans erreur, je recommande la **Méthode 3** (fichier de données séparé) car :
- Garde le composant principal propre et lisible
- Facilite la maintenance des données
- Permet de versionner les données séparément
- Évite les erreurs de copie manuelle
