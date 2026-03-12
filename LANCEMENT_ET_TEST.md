# Guide de Lancement et Test des Modifications UI

## Lancement du Projet

Pour démarrer l'application AIONUI avec toutes les modifications UI appliquées:

```powershell
npm run start:all
```

Cette commande lance le script PowerShell qui démarre tous les services nécessaires.

## Modifications Appliquées

### 1. Avatars dans les Messages
- **Avatar système**: Logo E-audit (logo.svg)
- **Avatar utilisateur**: Icône utilisateur générique
- **Noms affichés**: "E-audit" pour le système, "User" pour l'utilisateur

### 2. Zone de Saisie Ultra-Compacte (Style Claraverse)
- Padding réduit: 8px (au lieu de 16px)
- Border radius: 8px (au lieu de 20px)
- Border width: 1px (au lieu de 3px)
- Hauteur minimale: 18px (au lieu de 80px)
- Bouton d'envoi en taille mini
- Maximum 2 lignes d'expansion

### 3. Header Épuré
- Sélecteur de modèle masqué
- Nom de l'agent masqué

## Ce que Vous Devriez Voir

### Dans la Zone de Chat:
1. **Messages système** (à gauche):
   - Avatar circulaire avec le logo E-audit
   - Nom "E-audit" au-dessus du message
   - Contenu du message

2. **Messages utilisateur** (à droite):
   - Avatar circulaire avec icône utilisateur
   - Nom "User" au-dessus du message
   - Contenu du message avec fond coloré

### Dans la Zone de Saisie:
1. **Apparence compacte**:
   - Bordure fine (1px)
   - Coins arrondis subtils (8px)
   - Padding minimal (8px)
   - Hauteur très réduite

2. **Boutons**:
   - Bouton d'envoi circulaire mini en bas à droite
   - Autres boutons d'action compacts

## Vérification des Modifications

### 1. Logo E-audit
✅ Le logo devrait apparaître dans l'avatar système
❌ Si le logo n'apparaît pas, vérifiez que `src/renderer/assets/logo.svg` existe

### 2. Zone de Saisie
✅ La zone devrait être très compacte, similaire à Claraverse
✅ Une seule ligne de texte par défaut
✅ Expansion limitée à 2 lignes maximum

### 3. Header
✅ Pas de sélecteur de modèle visible
✅ Pas de nom d'agent affiché

## Dépannage

### Si le logo n'apparaît pas:
1. Vérifiez que le fichier existe: `src/renderer/assets/logo.svg`
2. Si vous n'avez que `public/logo.png`, copiez-le vers `src/renderer/assets/`
3. Redémarrez l'application

### Si la zone de saisie est trop grande:
1. Vérifiez que les modifications dans `src/renderer/components/sendbox.tsx` sont bien appliquées
2. Effacez le cache du navigateur (Ctrl+Shift+R dans l'app)
3. Redémarrez l'application

### Si les avatars ne s'affichent pas:
1. Vérifiez que les modifications dans `src/renderer/messages/MessagetText.tsx` sont appliquées
2. Ouvrez la console développeur (F12) pour voir les erreurs
3. Redémarrez l'application

## Commandes Utiles

```powershell
# Lancer l'application
npm run start:all

# Vérifier les erreurs TypeScript
npx tsc --noEmit

# Formater le code
npm run lint:fix

# Arrêter l'application
# Utilisez Ctrl+C dans le terminal où l'app tourne
```

## Fichiers Modifiés

1. `src/renderer/messages/MessagetText.tsx` - Avatars et noms
2. `src/renderer/components/sendbox.tsx` - Zone de saisie compacte
3. `src/renderer/pages/conversation/ChatLayout.tsx` - Header épuré

## Comparaison Avant/Après

### Avant:
- Messages sans avatars
- Zone de saisie large (80px min)
- Bordures épaisses (3px)
- Padding généreux (16px)
- Boutons standards

### Après (Style Claraverse):
- Messages avec avatars et noms
- Zone de saisie compacte (18px min)
- Bordures fines (1px)
- Padding minimal (8px)
- Boutons mini

## Support

Si vous rencontrez des problèmes:
1. Vérifiez les fichiers modifiés listés ci-dessus
2. Consultez `CHAT_UI_IMPROVEMENTS.md` pour les détails techniques
3. Vérifiez la console développeur pour les erreurs JavaScript/TypeScript
