# Implémentation du Bouton Démarrer E-audit

## Résumé

Le bouton "Démarrer" du projet Claraverse a été intégré avec succès dans AIONUI. Ce bouton permet d'insérer automatiquement des prompts structurés pour les différentes étapes de mission E-audit.

## Fichiers créés

### 1. Composant principal

- **`src/renderer/components/DemarrerMenu.tsx`**
  - Composant React adapté au style AIONUI (UnoCSS, Arco Design)
  - Menu hiérarchique avec logiciels → phases → étapes → modes
  - Portail React pour les sous-menus
  - Formatage automatique des commandes avec listes à puces

### 2. Fichiers de traduction i18n

- **`src/renderer/i18n/locales/en-US/demarrer.json`** - Traductions anglaises
- **`src/renderer/i18n/locales/zh-CN/demarrer.json`** - Traductions chinoises
- **`src/renderer/i18n/locales/fr-FR/demarrer.json`** - Traductions françaises
- **`src/renderer/i18n/locales/fr-FR/index.ts`** - Index du module français

## Fichiers modifiés

### 1. Composant SendBox

- **`src/renderer/components/sendbox.tsx`**
  - Import du composant `DemarrerMenu`
  - Ajout de la fonction `handleInsertCommand` pour insérer les commandes dans la zone de saisie
  - Intégration du bouton dans la zone des outils sous la zone de saisie

### 2. Index i18n

- **`src/renderer/i18n/locales/en-US/index.ts`** - Ajout de l'import `demarrer`
- **`src/renderer/i18n/locales/zh-CN/index.ts`** - Ajout de l'import `demarrer`

## Fonctionnalités

### Menu hiérarchique

1. **Niveau 1 : Logiciels**
   - E-audit pro
   - E-revision
   - E-cartographie
   - E-contrôle
   - E-CIA exam part 1
   - Bibliothèque

2. **Niveau 2 : Phases**
   - Phase de préparation
   - Phase de réalisation
   - Phase de conclusion
   - Planification
   - Revue analytique
   - Programme de contrôle
   - Synthèse de mission

3. **Niveau 3 : Étapes**
   - Programme de travail
   - Cartographie des risques
   - Feuille de couverture
   - Frap
   - Design
   - Implementation
   - etc.

4. **Niveau 4 : Modes**
   - Normal
   - Demo
   - Avancé
   - Manuel

### Insertion de commandes

- Clic sur un mode → insertion automatique du prompt dans la zone de saisie
- Formatage avec listes à puces (préfixe `- ` devant chaque variable)
- Fermeture automatique du menu après insertion

### Style et UX

- Design cohérent avec AIONUI (UnoCSS, couleurs Arco Design)
- Bouton "Démarrer" avec icône Play
- Menu contextuel positionné au-dessus du bouton
- Sous-menus en portail React pour éviter les problèmes de z-index
- Fermeture par clic extérieur ou touche Échap
- États hover et actif avec transitions fluides

## Structure des données

Le menu utilise une structure hiérarchique :

```typescript
LogicielItem {
  id, label, icon,
  phases: PhaseItem[] {
    id, label,
    etapes?: EtapeItem[] {
      id, label, icon, command?, modes?, norme?
    },
    cycles?: CycleComptable[] {
      id, label, icon,
      tests: TestItem[] {
        id, reference, label, processus, command
      }
    }
  }
}
```

## Exemple de commande générée

Lorsqu'un utilisateur sélectionne "E-audit pro → Phase de préparation → Programme de travail → Normal", le prompt suivant est inséré :

```
- [Command] = Programme de travail
- [Processus] = inventaire de caisse
- [Nb de lignes] = 25
```

## Prochaines étapes

### Données complètes

Le fichier `public/DemarrerMenu.tsx` contient la structure complète avec tous les logiciels, phases, étapes et tests. Pour l'intégrer :

1. Copier les données complètes de `MENU_DATA` depuis `public/DemarrerMenu.tsx`
2. Remplacer la version simplifiée dans `src/renderer/components/DemarrerMenu.tsx`
3. Ajouter les icônes manquantes (utiliser les icônes UnoCSS ou @icon-park/react)

### Icônes

Actuellement, le composant utilise des icônes UnoCSS basiques. Pour améliorer :

- Utiliser les icônes de `@icon-park/react` (déjà installé)
- Ou utiliser les icônes UnoCSS Carbon (`i-carbon-*`)

### Tests

Ajouter des tests unitaires pour :

- Le rendu du composant
- L'ouverture/fermeture du menu
- L'insertion de commandes
- La navigation dans les sous-menus

## Commandes de développement

```bash
# Démarrer l'application
bun run start

# Formater le code
bun run format

# Vérifier les erreurs TypeScript
bunx tsc --noEmit

# Lancer les tests
bun run test
```

## Notes techniques

- Le composant utilise `ReactDOM.createPortal` pour les sous-menus afin d'éviter les problèmes de z-index
- Les événements de clic extérieur sont gérés avec `useEffect` et `addEventListener`
- La fermeture par Échap est également gérée
- Le formatage des commandes ajoute automatiquement des tirets devant les lignes commençant par `[`
- Les traductions i18n sont utilisées pour tous les textes visibles

## Compatibilité

- React 19
- TypeScript 5.8 (strict mode)
- UnoCSS 66
- Arco Design 2
- Electron 37

## Auteur

Implémentation basée sur le composant DemarrerMenu du projet Claraverse, adapté pour AIONUI.
