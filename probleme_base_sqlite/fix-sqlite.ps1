# Script de Résolution du Problème SQLite pour AionUi
# Ce script recompile les modules natifs pour Electron

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Résolution Problème SQLite - AionUi  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si nous sommes dans le bon répertoire
if (-not (Test-Path "package.json")) {
    Write-Host "ERREUR: package.json non trouvé!" -ForegroundColor Red
    Write-Host "Assurez-vous d'exécuter ce script depuis la racine du projet AionUi." -ForegroundColor Yellow
    exit 1
}

# Étape 1 : Nettoyage
Write-Host "Étape 1/3 : Nettoyage des builds précédents..." -ForegroundColor Yellow
Write-Host "  - Suppression du dossier 'out/'" -ForegroundColor Gray
Remove-Item -Recurse -Force out -ErrorAction SilentlyContinue

Write-Host "  - Suppression du build de better-sqlite3" -ForegroundColor Gray
Remove-Item -Recurse -Force node_modules\better-sqlite3\build -ErrorAction SilentlyContinue

Write-Host "  ✓ Nettoyage terminé" -ForegroundColor Green
Write-Host ""

# Étape 2 : Recompilation
Write-Host "Étape 2/3 : Recompilation des modules natifs pour Electron..." -ForegroundColor Yellow
Write-Host "  Cette étape peut prendre quelques minutes..." -ForegroundColor Gray
Write-Host ""

try {
    npx electron-builder install-app-deps
    Write-Host ""
    Write-Host "  ✓ Recompilation terminée" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "  ⚠ Avertissement : Certains modules n'ont pas pu être recompilés" -ForegroundColor Yellow
    Write-Host "  Cela peut être normal si node-pty échoue (non critique)" -ForegroundColor Gray
}

Write-Host ""

# Étape 3 : Vérification
Write-Host "Étape 3/3 : Vérification..." -ForegroundColor Yellow

if (Test-Path "node_modules\better-sqlite3\build\Release\better_sqlite3.node") {
    Write-Host "  ✓ better-sqlite3 compilé avec succès" -ForegroundColor Green
} else {
    Write-Host "  ✗ better-sqlite3 non trouvé - la compilation a peut-être échoué" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "           Résolution Terminée          " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Vous pouvez maintenant lancer l'application avec :" -ForegroundColor Green
Write-Host "  .\start-dev.ps1" -ForegroundColor Cyan
Write-Host "  ou" -ForegroundColor Gray
Write-Host "  npm start" -ForegroundColor Cyan
Write-Host ""
