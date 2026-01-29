# EchoWork Frontend

Interface utilisateur de la plateforme **EchoWork** – une application de notation et de classement des entreprises et services publics au Sénégal.

## 📋 Table des matières

- [Technologies](#technologies)
- [Nouvelles Fonctionnalités](#nouvelles-fonctionnalités)
- [Structure du projet](#structure-du-projet)
- [Installation](#installation)
- [Configuration](#configuration)
- [Déploiement](#déploiement)
- [API Endpoints](#api-endpoints)
- [Sécurité](#sécurité)

## Technologies

- **React.js** avec **Vite**
- **Tailwind CSS** + **DaisyUI**
- **Lucide-react** (icônes)
- **Axios** (appel API)
- **React Router** (navigation)
- Hooks personnalisés pour la gestion des appels API

## Nouvelles Fonctionnalités

### Backend
- ✅ **Authentification JWT** - Inscription et connexion sécurisées
- ✅ **Gestion des avis** - Création, lecture, vote (upvote/downvote)
- ✅ **Contrôle d'accès** - Rôles utilisateur (USER, ADMIN)
- ✅ **API REST complète** - Endpoints pour entreprises, catégories, avis
- ✅ **Validation des données** - Protection contre les données invalides
- ✅ **Base de données Prisma** - PostgreSQL avec ORM moderne
- ✅ **Base de données d'entreprises** - 2,608 entreprises extraites de PDFs avec informations complètes (ville, adresse, téléphone, activité)
- ✅ **API Catégories avancée** - Affichage des entreprises notées, avis, offres d'emploi, KPIs et publicités par catégorie
- ✅ **Recherche par catégorie** - Fonction de recherche intégrée dans chaque catégorie

### Frontend
- ✅ **Pages d'authentification** - Login et Signup
- ✅ **Gestion de l'état** - Context API pour l'authentification
- ✅ **Routage amélioré** - Navigation entre les pages
- ✅ **Interface moderne** - Design avec TailwindCSS et DaisyUI

---

## Structure du projet

```
.
├── backend/                # Backend NestJS + Prisma
│   ├── src/
│   │   ├── auth/          # Module d'authentification
│   │   ├── companies/     # Module des entreprises
│   │   ├── reviews/       # Module des avis
│   │   └── prisma/        # Service Prisma
│   ├── prisma/
│   │   └── schema.prisma  # Schéma de base de données
│   ├── Dockerfile         # Image Docker pour le backend
│   └── docker-compose.yml # Services Docker (PostgreSQL, backend, Adminer)
├── src/
│   ├── assets/            # Images et ressources statiques
│   ├── components/        # Composants réutilisables (Foot, Navbar)
│   ├── contexts/          # Contextes React (AuthContext)
│   ├── data/              # Données des catégories d'entreprise
│   ├── hooks/             # Hooks personnalisés (useApi, useHomeData, etc.)
│   ├── pages/             # Pages principales (VitrinePage, LoginPage, etc.)
│   ├── services/          # Services API
│   └── api/
│       └── config.js      # Configuration Axios
└── public/                # Fichiers publics statiques
```

## Installation

### Prérequis

- Node.js 18+ et npm/pnpm
- PostgreSQL 14+ (ou Docker)

### Étapes

1. **Cloner le dépôt:**
   ```bash
   git clone https://github.com/dndiaye66/echowork.git
   cd echowork
   ```

2. **Installation Backend:**
   ```bash
   cd backend
   npm install
   
   # Copier et configurer les variables d'environnement
   cp .env.example .env
   # Éditer .env avec vos valeurs
   
   # Démarrer PostgreSQL avec Docker
   docker-compose up -d db
   
   # Générer le client Prisma et exécuter les migrations
   npm run prisma:generate
   npm run prisma:migrate
   
   # Lancer le serveur backend
   npm run start:dev
   ```

3. **Installation Frontend:**
   ```bash
   # Depuis la racine du projet
   npm install
   
   # Créer un fichier .env à la racine
   cp .env.example .env
   # Le fichier devrait contenir:
   # VITE_API_URL=http://localhost:3000/api
   
   # Lancer en mode développement
   npm run dev
   ```

4. **Accéder à l'application:**
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost:3000/api](http://localhost:3000/api)
   - Adminer (DB GUI): [http://localhost:8080](http://localhost:8080)

## Configuration

### Variables d'environnement

#### Frontend (.env à la racine)
| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `VITE_API_URL` | URL de base de l'API backend | `http://localhost:3000/api` |

#### Backend (backend/.env)
| Variable | Description | Exemple |
|----------|-------------|---------|
| `DATABASE_URL` | URL de connexion PostgreSQL | `postgresql://postgres:password@localhost:5432/echowork_db?schema=public` |
| `PORT` | Port du serveur backend | `3000` |
| `FRONTEND_URL` | URL du frontend (CORS) | `http://localhost:5173` |
| `JWT_SECRET` | Clé secrète pour JWT | `your-secret-key-change-this-in-production` |

### Build de production

#### Frontend
```bash
npm run build
npm run preview  # Pour tester le build localement
```

#### Backend
```bash
cd backend
npm run build
npm run start    # Lancer le build de production
```

## Déploiement

### Déploiement avec Nginx sur Ubuntu 24.04 (Recommandé)

Pour déployer l'application sur un serveur Ubuntu 24.04 avec Nginx, consultez les guides:

- **[DEPLOYMENT_QUICKSTART.md](DEPLOYMENT_QUICKSTART.md)** - Guide de démarrage rapide (10-15 minutes)
- **[DEPLOYMENT_NGINX.md](DEPLOYMENT_NGINX.md)** - Guide détaillé avec toutes les commandes

**Méthodes de déploiement:**
1. **Script automatisé**: `sudo bash deploy.sh` (recommandé)
2. **Docker Compose**: `bash deploy-docker.sh` avec nginx inclus
3. **Manuel**: Installation pas à pas avec configuration complète

**Fonctionnalités:**
- Configuration Nginx complète avec reverse proxy
- Service systemd pour le backend
- Support SSL avec Let's Encrypt
- Optimisations de performance et sécurité
- Scripts de déploiement automatisés

### Déploiement sur serveur LWS (Apache)

Pour déployer l'application sur un serveur LWS ou tout autre serveur Apache, consultez le guide complet: [DEPLOYMENT_LWS.md](DEPLOYMENT_LWS.md)

**Points clés:**
- Le fichier `.htaccess` est inclus dans `public/` et sera automatiquement copié dans `dist/` lors du build
- Configurez `VITE_API_URL` dans `.env` avant de builder pour pointer vers votre API de production
- Uploadez le contenu du dossier `dist/` sur votre serveur (pas le dossier lui-même)
- Vérifiez que votre backend est configuré avec les bonnes URL CORS

### Autres plateformes

- **Vercel/Netlify**: Configuration automatique - détection de React + Vite sans configuration requise
- **Docker**: Voir [backend/README.md](backend/README.md) pour le déploiement avec Docker Compose

## API Endpoints

### Authentication
| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/api/auth/signup` | Créer un compte | Non |
| POST | `/api/auth/login` | Se connecter | Non |

**Exemple de requête (signup):**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

### Companies
| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/companies` | Liste toutes les entreprises | Non |
| GET | `/api/companies/:id` | Détails d'une entreprise | Non |
| GET | `/api/companies/category/:categoryId` | Entreprises par catégorie | Non |

**Champs des entreprises:**
Les entreprises incluent maintenant: `ville` (city), `adresse` (address), `tel` (telephone), `activite` (activity/business type).

### Categories
| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/categories` | Liste toutes les catégories | Non |
| GET | `/api/categories/:id` | Détails d'une catégorie avec entreprises notées, avis, offres d'emploi, KPIs et publicités | Non |
| GET | `/api/categories/:id/search?q={query}` | Rechercher des entreprises dans une catégorie | Non |

**Note:** Le endpoint `/api/categories/:id` retourne un ensemble complet d'informations incluant:
- Les entreprises les mieux notées de la catégorie
- Les avis et commentaires des entreprises
- Les offres d'emploi actives dans la catégorie
- Les KPIs (nombre total d'entreprises, avis, note moyenne, distribution des notes)
- Les publicités actives
- Voir [CATEGORY_API.md](CATEGORY_API.md) pour plus de détails

### Reviews
| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/api/reviews` | Créer un avis | Oui |
| GET | `/api/reviews/company/:companyId` | Avis d'une entreprise | Non |
| GET | `/api/reviews/:id` | Détails d'un avis | Non |
| POST | `/api/reviews/:id/upvote` | Voter pour un avis | Non |
| POST | `/api/reviews/:id/downvote` | Voter contre un avis | Non |
| DELETE | `/api/reviews/:id` | Supprimer un avis | Oui (owner/admin) |

**Exemple de requête (create review):**
```json
{
  "rating": 5,
  "comment": "Excellent service!",
  "companyId": 1
}
```

**Note:** Les endpoints nécessitant une authentification doivent inclure le token JWT dans le header:
```
Authorization: Bearer <your-jwt-token>
```

## Sécurité

⚠️ **Important:** Lisez le fichier [SECURITY.md](SECURITY.md) pour les meilleures pratiques de sécurité.

Points clés:
- Ne jamais commiter de fichiers `.env` contenant des données sensibles
- Toujours utiliser HTTPS en production
- Configurer correctement CORS sur le backend
- Changer `JWT_SECRET` en production avec une valeur forte
- Les mots de passe sont hashés avec bcrypt
- Validation des entrées sur backend et frontend

## Déploiement Docker

Pour déployer l'application complète avec Docker:

```bash
cd backend
docker-compose up -d
```

Cela démarre:
- PostgreSQL sur le port 5432
- Backend API sur le port 3000
- Adminer sur le port 8080

## Scripts disponibles

### Frontend
- `npm run dev` - Lance le serveur de développement
- `npm run build` - Build pour la production
- `npm run preview` - Prévisualise le build de production
- `npm run lint` - Vérifie la qualité du code avec ESLint

### Backend
- `npm run start:dev` - Lance en mode développement avec hot-reload
- `npm run build` - Compile TypeScript
- `npm run start` - Lance le serveur compilé
- `npm run prisma:generate` - Génère le client Prisma
- `npm run prisma:migrate` - Exécute les migrations
- `npm run prisma:studio` - Ouvre Prisma Studio (GUI BD)

## Backend

Pour plus d'informations sur le backend (NestJS + Prisma), consultez [backend/README.md](backend/README.md).

## Contribution

Les contributions sont les bienvenues ! Veuillez:
1. Fork le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Commiter vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Pousser vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## Licence

Ce projet est sous licence GNU General Public License v3.0. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

