# Guide d'utilisation du Bouton Démarrer

## Vue d'ensemble

Le bouton "Démarrer" permet d'insérer rapidement des prompts structurés pour les missions E-audit directement dans la zone de saisie du chat.

## Localisation

Le bouton "Démarrer" se trouve **en dessous de la zone de saisie du chat**, dans la barre d'outils.

```
┌─────────────────────────────────────────────┐
│  Zone de saisie du message                  │
│  [Entrez votre requête...]          [Send]  │
└─────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────┐
│  [▶ Démarrer]  [Autres outils...]           │
└─────────────────────────────────────────────┘
```

## Utilisation

### Étape 1 : Ouvrir le menu
Cliquez sur le bouton **[▶ Démarrer]**

### Étape 2 : Sélectionner un logiciel
Le menu s'ouvre avec la liste des logiciels :
- E-audit pro
- E-revision
- E-cartographie
- E-contrôle
- E-CIA exam part 1
- Bibliothèque

Cliquez sur le logiciel souhaité (ex: "E-audit pro")

### Étape 3 : Sélectionner une phase
Les phases du logiciel s'affichent :
- Phase de préparation
- Phase de réalisation
- Phase de conclusion

### Étape 4 : Sélectionner une étape
Les étapes de la phase s'affichent :
- Programme de travail
- Cartographie des risques
- Feuille de couverture
- etc.

Cliquez sur l'étape souhaitée

### Étape 5 : Choisir un mode
Un sous-menu s'ouvre à droite avec les modes disponibles :
- Normal
- Demo
- Avancé
- Manuel

Cliquez sur le mode souhaité

### Résultat
Le prompt structuré est automatiquement inséré dans la zone de saisie :

```
- [Command] = Programme de travail
- [Processus] = inventaire de caisse
- [Nb de lignes] = 25
```

Vous pouvez ensuite :
1. Modifier les valeurs des variables si nécessaire
2. Ajouter du contexte supplémentaire
3. Cliquer sur "Send" pour envoyer le prompt au LLM

## Exemples d'utilisation

### Exemple 1 : Créer un programme de travail

**Navigation :**
E-audit pro → Phase de préparation → Programme de travail → Normal

**Prompt généré :**
```
- [Command] = Programme de travail
- [Processus] = inventaire de caisse
- [Nb de lignes] = 25
```

**Modification :**
Remplacez "inventaire de caisse" par votre processus spécifique, par exemple "rapprochements bancaires"

### Exemple 2 : Créer une cartographie des risques

**Navigation :**
E-audit pro → Phase de préparation → Cartographie des risques → Avancé

**Prompt généré :**
```
- [Command] = /Cartographie des risques
- [Processus] = Sécurité trésorerie
- [Modele] : operationnel, risque, évaluation risque, probabilité, impact, controle audit
- [Matrice de criticite] = Matrice numerique - 5 niveau
- [Integration] = integration_min
- [Variable 1] = Contenu de [Variable 1]
- [Variable 2] = Contenu de [Variable 2]
- [Nb de lignes] = 40
```

### Exemple 3 : Créer une feuille de couverture

**Navigation :**
E-audit pro → Phase de réalisation → Feuille couverture

**Prompt généré :**
```
- [Command] = Couverture
- [Processus] = Sécurité trésorerie
- [Contrôle] = Verifier l exhaustivite des inventaires de caisse
- [Instruction] = Template
- [Modele de test] = no, compte, site, libelle, solde BG, Solde Pv inventaire
- [Nb de lignes] = 15
```

### Exemple 4 : Tests de révision (E-revision)

**Navigation :**
E-revision → Programme de contrôle → Trésorerie → AA040 - Rapprochements

**Prompt généré :**
```
- [Command] = /feuille couverture
- [Processus] = Trésorerie
- [test] = AA040
- [reference] = Rapprochements
- [Nb de lignes] = 10
```

## Raccourcis clavier

- **Échap** : Fermer le menu
- **Clic extérieur** : Fermer le menu

## Conseils

1. **Personnalisation** : Après insertion, modifiez toujours les valeurs par défaut pour correspondre à votre contexte spécifique

2. **Contexte supplémentaire** : N'hésitez pas à ajouter du texte avant ou après le prompt structuré pour donner plus de contexte au LLM

3. **Combinaison** : Vous pouvez combiner plusieurs prompts en les insérant successivement

4. **Sauvegarde** : Les prompts fréquemment utilisés peuvent être sauvegardés comme slash commands personnalisés

## Dépannage

### Le menu ne s'ouvre pas
- Vérifiez que vous n'êtes pas en train d'envoyer un message
- Vérifiez que le bouton n'est pas désactivé (grisé)

### Le sous-menu ne s'affiche pas
- Assurez-vous de cliquer sur une étape qui a des modes disponibles
- Le sous-menu s'affiche à droite de l'étape sélectionnée

### Le prompt n'est pas inséré
- Vérifiez que vous avez bien cliqué sur un mode (Normal, Demo, Avancé, Manuel)
- Le menu se ferme automatiquement après insertion

## Support

Pour toute question ou problème, consultez la documentation complète dans `DEMARRER_IMPLEMENTATION.md`
