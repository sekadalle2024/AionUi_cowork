# 🧪 TEST MENU ALTERNATIF - Instructions Simples

## 🎯 Nouvelle Solution Implémentée

**Problème**: Le clic droit ne fonctionne pas  
**Solution**: Menu alternatif avec Ctrl+Click et bouton flottant  
**Fichier**: `public/scripts/aionui_menu_alternative.js`

## ✅ Tests à Effectuer MAINTENANT

### Test 1: Vérifier le Chargement
1. **Ouvrir DevTools** (F12)
2. **Aller dans Console**
3. **Chercher ce message**:
   ```
   🎉 Alternative Menu System loaded!
   ```

### Test 2: Vérifier l'Objet Global
**Dans la console, taper**:
```javascript
window.aionui_alt_menu
```
**Résultat attendu**: Un objet avec des méthodes

### Test 3: Créer un Tableau de Test
**Dans la console, taper**:
```javascript
const table = document.createElement('table');
table.className = 'prose';
table.innerHTML = '<tr><th>Col1</th><th>Col2</th></tr><tr><td>A</td><td>B</td></tr>';
table.style.cssText = 'border: 2px solid red; margin: 20px; padding: 10px;';
document.body.appendChild(table);
```

### Test 4: Tester le Menu
**Deux méthodes**:

#### Méthode A: Ctrl+Click
1. **Cliquer sur le tableau rouge**
2. **Maintenir Ctrl** et **cliquer à nouveau**
3. **Le menu devrait s'ouvrir**

#### Méthode B: Bouton Flottant
1. **Cliquer sur le tableau rouge**
2. **Un bouton bleu "🗃️ Table Menu"** devrait apparaître en bas à droite
3. **Cliquer sur le bouton**
4. **Le menu devrait s'ouvrir**

### Test 5: Tester une Opération
1. **Ouvrir le menu** (Ctrl+Click ou bouton)
2. **Cliquer sur "Insert Row"**
3. **Une nouvelle ligne devrait être ajoutée**
4. **Une notification devrait apparaître**: "✅ Row added"

## 🎯 Résultats Attendus

### ✅ SI ÇA MARCHE
- Le menu s'ouvre avec Ctrl+Click
- Le bouton flottant apparaît
- Les opérations fonctionnent
- Les notifications s'affichent

### ❌ SI ÇA NE MARCHE PAS
**Vérifier dans la console**:
1. Y a-t-il des erreurs JavaScript ?
2. Le message de chargement est-il présent ?
3. `window.aionui_alt_menu` existe-t-il ?

**Si rien ne fonctionne, taper dans la console**:
```javascript
// Forcer le chargement
const script = document.createElement('script');
script.src = './scripts/aionui_menu_alternative.js';
document.head.appendChild(script);
```

## 💡 Commandes de Debug

### Ouvrir le Menu Manuellement
```javascript
window.aionui_alt_menu.showMenu(300, 300);
```

### Afficher une Notification
```javascript
window.aionui_alt_menu.showNotification("Test notification");
```

### Afficher le Bouton
```javascript
window.aionui_alt_menu.showFloatingButton();
```

## 📊 Checklist de Test

- [ ] Console montre "Alternative Menu System loaded"
- [ ] `window.aionui_alt_menu` existe
- [ ] Tableau de test créé
- [ ] Ctrl+Click ouvre le menu
- [ ] Bouton flottant apparaît
- [ ] Opérations fonctionnent
- [ ] Notifications s'affichent

## 🎉 Prochaines Étapes

**Si les tests fonctionnent**:
- Tester sur de vrais tableaux dans le chat
- Vérifier toutes les opérations
- Confirmer que c'est utilisable

**Si les tests ne fonctionnent pas**:
- Partager les messages d'erreur de la console
- Indiquer quelle étape échoue
- Nous trouverons une autre solution