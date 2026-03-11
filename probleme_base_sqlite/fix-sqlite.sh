#!/bin/bash
# Script de Résolution du Problème SQLite pour AionUi (macOS/Linux)
# Ce script recompile les modules natifs pour Electron

echo ""
echo "========================================"
echo "  Résolution Problème SQLite - AionUi  "
echo "========================================"
echo ""

# Vérifier si nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "ERREUR: package.json non trouvé!"
    echo "Assurez-vous d'exécuter ce script depuis la racine du projet AionUi."
    exit 1
fi

# Étape 1 : Nettoyage
echo "Étape 1/3 : Nettoyage des builds précédents..."
echo "  - Suppression du dossier 'out/'"
rm -rf out

echo "  - Suppression du build de better-sqlite3"
rm -rf node_modules/better-sqlite3/build

echo "  ✓ Nettoyage terminé"
echo ""

# Étape 2 : Recompilation
echo "Étape 2/3 : Recompilation des modules natifs pour Electron..."
echo "  Cette étape peut prendre quelques minutes..."
echo ""

npx electron-builder install-app-deps

echo ""
echo "  ✓ Recompilation terminée"
echo ""

# Étape 3 : Vérification
echo "Étape 3/3 : Vérification..."

if [ -f "node_modules/better-sqlite3/build/Release/better_sqlite3.node" ]; then
    echo "  ✓ better-sqlite3 compilé avec succès"
else
    echo "  ✗ better-sqlite3 non trouvé - la compilation a peut-être échoué"
fi

echo ""
echo "========================================"
echo "           Résolution Terminée          "
echo "========================================"
echo ""
echo "Vous pouvez maintenant lancer l'application avec :"
echo "  npm start"
echo ""
