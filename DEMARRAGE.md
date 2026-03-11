# Guide de Démarrage AionUi

## Configuration Mémoire

Le projet a été configuré pour utiliser 8GB de mémoire Node.js afin d'éviter les problèmes de mémoire.

## Méthodes de Démarrage

### Option 1 : Script PowerShell (Recommandé pour Windows)

```powershell
.\start-dev.ps1
```

### Option 2 : Script Batch

```cmd
start-dev.bat
```

### Option 3 : Commande npm directe

```bash
npm run start:mem
```

### Option 4 : Commande manuelle

```powershell
$env:NODE_OPTIONS="--max-old-space-size=8192"; npm start
```

## Mode Desktop vs WebUI

### Mode Desktop Uniquement (Par défaut)

Le mode desktop lance uniquement l'application Electron sans serveur WebUI :

```bash
npm start
# ou
npm run start:mem
```

### Mode WebUI

Pour lancer le serveur WebUI en plus de l'application desktop :

```bash
npm run webui
```

### Mode WebUI avec Accès Distant

Pour permettre l'accès depuis d'autres appareils sur le réseau :

```bash
npm run webui:remote
```

## Configuration

### Fichier .env.local

Un fichier `.env.local` a été créé avec les configurations suivantes :

- `NODE_OPTIONS=--max-old-space-size=8192` : Allocation mémoire de 8GB
- `AIONUI_DISABLE_WEBUI_AUTO=true` : Désactive le démarrage automatique du WebUI

### Fichier webui.config.json

Pour configurer le WebUI de manière permanente, créez un fichier `webui.config.json` dans le dossier userData de l'application :

```json
{
  "port": 3000,
  "allowRemote": false
}
```

## Commandes Utiles

```bash
# Démarrage normal
npm start

# Démarrage avec 8GB mémoire
npm run start:mem

# WebUI uniquement
npm run webui

# WebUI avec accès distant
npm run webui:remote

# Linting
npm run lint

# Tests
npm run test

# Build production
npm run dist
```

## Résolution de Problèmes

### Erreur de mémoire

Si vous rencontrez des erreurs de type "JavaScript heap out of memory", utilisez toujours `npm run start:mem` ou les scripts PowerShell/Batch fournis.

### Port déjà utilisé

Si le port 5173 (renderer) ou 3000 (WebUI) est déjà utilisé, fermez les autres applications ou modifiez la configuration.

### WebUI se lance automatiquement

Vérifiez que vous n'utilisez pas `npm run webui` par erreur. Utilisez `npm start` ou `npm run start:mem` pour le mode desktop uniquement.
