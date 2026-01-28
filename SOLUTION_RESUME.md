# Solution au problème d'affichage sur serveur LWS

## Problème
Votre application EchoWork ne s'affichait pas lorsque vous accédiez au lien sur votre serveur LWS.

## Cause du problème
Votre application React utilise `BrowserRouter` pour la navigation. Lorsque vous accédez à une URL comme `https://votre-domaine.com/categories/banque`, le serveur LWS (Apache) cherche un fichier physique à ce chemin et retourne une erreur 404 car ce fichier n'existe pas. En réalité, toutes les routes sont gérées côté client par React Router.

## Solution appliquée

### 1. Fichier `.htaccess` ajouté
Un fichier `.htaccess` a été créé dans le dossier `public/` qui configure Apache pour:
- Rediriger toutes les requêtes vers `index.html`
- Permettre aux fichiers statiques (CSS, JS, images) d'être servis normalement
- Laisser React Router gérer le routage côté client

**Emplacement**: `public/.htaccess`

Ce fichier sera automatiquement copié dans le dossier `dist/` quand vous faites `npm run build`.

### 2. Documentation de déploiement
Un guide complet a été créé: `DEPLOYMENT_LWS.md` qui explique:
- Comment configurer l'application pour la production
- Comment builder l'application
- Comment déployer sur LWS
- Comment résoudre les problèmes courants
- Configuration pour sous-dossier si nécessaire

### 3. README mis à jour
Le README principal a été mis à jour avec une nouvelle section "Déploiement" qui référence le guide LWS.

## Instructions de déploiement

### Étape 1: Configurer l'API
Créez un fichier `.env` à la racine du projet:
```bash
VITE_API_URL=https://votre-domaine.com/api
```
Remplacez par l'URL réelle de votre API backend.

### Étape 2: Builder l'application
```bash
npm install
npm run build
```

### Étape 3: Déployer sur LWS
1. Connectez-vous à votre espace LWS (FTP ou gestionnaire de fichiers)
2. Allez dans le dossier `www/` ou `public_html/`
3. Uploadez **tout le contenu** du dossier `dist/` :
   - `index.html`
   - `.htaccess` (très important!)
   - `vite.svg`
   - Le dossier `assets/` complet

### Étape 4: Vérifier
Visitez votre site `https://votre-domaine.com` - l'application devrait maintenant s'afficher correctement!

## Important

- **Ne jamais oublier le fichier `.htaccess`** - c'est lui qui résout le problème
- **Toujours builder avant de déployer** - ne déployez jamais les fichiers sources
- **Configurer l'URL de l'API** avant de builder
- **Vérifier que le backend accepte les requêtes** de votre domaine (CORS)

## En cas de problème

Consultez la section "Dépannage" dans `DEPLOYMENT_LWS.md` qui couvre:
- Page blanche
- Erreur 404 sur les routes
- Images qui ne se chargent pas
- API qui ne répond pas

## Fichiers modifiés dans ce PR

- ✅ `public/.htaccess` - Configuration Apache (nouveau fichier)
- ✅ `DEPLOYMENT_LWS.md` - Guide de déploiement complet (nouveau fichier)
- ✅ `README.md` - Section déploiement ajoutée (modification)

Aucun code applicatif n'a été modifié - seuls des fichiers de configuration et de documentation ont été ajoutés.
