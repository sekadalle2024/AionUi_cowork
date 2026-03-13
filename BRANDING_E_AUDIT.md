# Branding E-audit - Modifications

## Modifications effectuées

### 1. Titre de la page d'accueil
- **Ancien**: "Hi, what's your plan for today?"
- **Nouveau**: "Automatisez vos activités, d'audit, risque et contrôle"
- **Fichier**: `src/renderer/i18n/locales/en-US/conversation.json`

### 2. Nom de l'application
- **Ancien**: "AionUi"
- **Nouveau**: "E-audit"
- **Fichiers**: 
  - `src/renderer/components/Titlebar/index.tsx` (barre de titre)
  - `src/renderer/layout.tsx` (sidebar)

### 3. Logo de l'application
- **Ancien**: Logo SVG AionUi (forme géométrique)
- **Nouveau**: Logo PNG E-audit depuis `/public/logo.png`
- **Fichiers**: 
  - `src/renderer/components/Titlebar/index.tsx` (barre de titre)
  - `src/renderer/layout.tsx` (sidebar)
- **Composant**: `AionLogoMark` → `EauditLogoMark`

### 4. Interface d'accueil simplifiée
- **Supprimé**: Section "Assistant Description"
- **Supprimé**: Prompts génériques suggérés
- **Fichier**: `src/renderer/pages/guid/components/AssistantSelectionArea.tsx`
- **Changement**: Retourne `null` quand un assistant est sélectionné

### 5. Zone de saisie réduite
- **Ancien**: minRows: 3, maxRows: 20
- **Nouveau**: minRows: 1, maxRows: 7
- **Fichier**: `src/renderer/pages/guid/components/GuidInputCard.tsx`
- **Réduction**: 2/3 de la hauteur originale

## Fichiers modifiés

1. `src/renderer/i18n/locales/en-US/conversation.json` - Titre d'accueil
2. `src/renderer/components/Titlebar/index.tsx` - Nom et logo (barre de titre)
3. `src/renderer/layout.tsx` - Nom et logo (sidebar)
4. `src/renderer/pages/guid/components/AssistantSelectionArea.tsx` - Suppression description/prompts
5. `src/renderer/pages/guid/components/GuidInputCard.tsx` - Réduction hauteur textarea

## Logo

Le logo utilisé est `/public/logo.png`. Le logo apparaît dans:
- La barre de titre (en haut)
- La sidebar (panneau gauche)

Tailles:
- Normal: 40px × 40px
- Sidebar réduite: 24px × 24px

## Résultat

L'interface affiche maintenant:
- "E-audit" comme nom d'application dans la barre de titre ET la sidebar
- Logo E-audit dans la barre de titre ET la sidebar
- "Automatisez vos activités, d'audit, risque et contrôle" comme message d'accueil
- Interface épurée sans description d'assistant ni prompts suggérés
- Zone de saisie plus compacte (1-7 lignes au lieu de 3-20)

## Statut

✅ Toutes les modifications de branding sont complètes
