# Guide de déploiement sur serveur LWS

## Problème résolu
L'application ne s'affichait pas sur le serveur LWS car elle utilise React Router avec BrowserRouter, nécessitant une configuration Apache spéciale pour rediriger toutes les requêtes vers `index.html`.

## Solution
Un fichier `.htaccess` a été ajouté dans le dossier `public/` qui sera automatiquement copié dans le dossier `dist/` lors du build.

## Étapes de déploiement sur LWS

### 1. Configurer les variables d'environnement
Avant de builder, créez un fichier `.env` à la racine du projet avec votre URL d'API de production:

```bash
VITE_API_URL=https://votre-domaine.com/api
```

⚠️ **Important**: Remplacez `https://votre-domaine.com/api` par l'URL réelle de votre API backend en production.

### 2. Builder l'application
```bash
npm install
npm run build
```

Cela créera un dossier `dist/` contenant tous les fichiers à déployer, y compris le fichier `.htaccess`.

### 3. Télécharger les fichiers sur LWS
Via FTP ou le gestionnaire de fichiers LWS:

1. Connectez-vous à votre espace LWS
2. Allez dans le dossier `www/` ou `public_html/` (selon votre configuration)
3. Téléchargez **tout le contenu** du dossier `dist/` (pas le dossier lui-même)
   - `index.html`
   - `.htaccess`
   - `vite.svg`
   - Le dossier `assets/`

### 4. Vérifier la configuration du serveur

#### Si l'application est à la racine du domaine:
```
https://votre-domaine.com/
```
Le fichier `.htaccess` actuel fonctionne tel quel.

#### Si l'application est dans un sous-dossier:
```
https://votre-domaine.com/echowork/
```
Vous devez modifier le fichier `vite.config.js` AVANT de builder:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/echowork/', // Ajoutez cette ligne avec le nom de votre sous-dossier
})
```

Et modifier le `.htaccess`:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /echowork/
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /echowork/index.html [L]
</IfModule>
```

Puis re-buildez l'application avec `npm run build`.

### 5. Vérifier le backend
Assurez-vous que votre API backend:
- Est déployée et accessible
- A les bonnes configurations CORS pour accepter les requêtes de votre domaine frontend
- L'URL dans votre `.env` correspond à l'URL réelle du backend

Dans `backend/.env`, vérifiez:
```bash
FRONTEND_URL=https://votre-domaine.com
# PORT=3000  # Le port peut être géré par votre hébergeur LWS (reverse proxy)
```

**Note**: Sur un serveur partagé LWS, le port est souvent géré automatiquement par un reverse proxy ou la configuration du serveur. Consultez la documentation de votre hébergeur pour les paramètres spécifiques.

### 6. Tester l'application
1. Visitez votre site: `https://votre-domaine.com`
2. Testez la navigation entre les pages
3. Rafraîchissez une page (ex: `/categories/banque`) - elle devrait se charger correctement
4. Vérifiez que l'API fonctionne (connexion, avis, etc.)

## Dépannage

### L'application affiche une page blanche
1. Ouvrez la console du navigateur (F12)
2. Vérifiez s'il y a des erreurs JavaScript
3. Vérifiez si les fichiers CSS et JS se chargent correctement
4. Vérifiez que le `base` dans `vite.config.js` correspond au chemin réel

### Erreur 404 sur les routes
1. Vérifiez que le fichier `.htaccess` est bien présent dans le dossier
2. Vérifiez que `mod_rewrite` est activé sur votre serveur LWS (généralement activé par défaut)
3. Vérifiez les permissions du fichier `.htaccess` (644) et des dossiers (755)

**Permissions recommandées:**
- Fichiers: `644` (lecture pour tous, écriture pour le propriétaire)
- Dossiers: `755` (exécution/lecture pour tous, écriture pour le propriétaire)
- Commande: `chmod 644 .htaccess index.html assets/*` et `chmod 755 assets/`

### Les images/assets ne se chargent pas
1. Vérifiez que le dossier `assets/` est bien uploadé
2. Vérifiez le paramètre `base` dans `vite.config.js`
3. Vérifiez les chemins dans la console du navigateur

### L'API ne répond pas
1. Vérifiez que `VITE_API_URL` dans `.env` pointe vers la bonne URL
2. Vérifiez que le backend est démarré
3. Vérifiez les configurations CORS du backend
4. Vérifiez les logs du backend pour les erreurs

## Structure des fichiers après déploiement

```
www/ ou public_html/
├── .htaccess          ← Important pour le routing
├── index.html         ← Point d'entrée de l'application
├── vite.svg          
└── assets/            ← Tous les fichiers CSS, JS, images
    ├── index-XXXX.css
    ├── index-XXXX.js
    └── [images]
```

## Notes importantes

1. **Ne pas éditer les fichiers dans `dist/`** - Ils sont régénérés à chaque build
2. **Éditer les fichiers sources** dans `src/` puis rebuilder
3. **Variables d'environnement** - Pensez à configurer `.env` AVANT de builder
4. **Cache** - Parfois le navigateur garde en cache l'ancienne version, videz le cache (Ctrl+F5)

## Support
Si vous rencontrez des problèmes après avoir suivi ce guide:
1. Vérifiez les logs du serveur LWS
2. Vérifiez la console JavaScript du navigateur
3. Vérifiez que toutes les étapes ont été suivies correctement
