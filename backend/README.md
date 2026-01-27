# Echowork — Backend (NestJS + Prisma)

Ce dossier contient le backend NestJS + Prisma pour la plateforme EchoWork.

## 📋 Table des matières

- [Fonctionnalités](#fonctionnalités)
- [Technologies](#technologies)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Sécurité](#sécurité)

## Fonctionnalités

- API REST pour les entreprises et catégories
- Base de données PostgreSQL avec Prisma ORM
- Validation des entrées
- Gestion des erreurs
- CORS configuré pour le frontend

## Technologies

- **NestJS** - Framework Node.js
- **Prisma** - ORM pour PostgreSQL
- **PostgreSQL** - Base de données
- **TypeScript** - Langage de programmation
- **class-validator** - Validation des données

## Installation

### Prérequis

- Node.js 18+
- PostgreSQL 14+ (ou Docker)
- npm ou pnpm

### Étapes

1. **Naviguer vers le dossier backend:**
   ```bash
   cd backend
   ```

2. **Installer les dépendances:**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement:**
   ```bash
   cp .env.example .env
   ```
   
   Ensuite, éditez `.env` et mettez à jour les valeurs:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/echowork_db?schema=public"
   PORT=3000
   FRONTEND_URL=http://localhost:5173
   ```
   
   ⚠️ **Important:** Ne jamais commiter le fichier `.env` ! Voir [../SECURITY.md](../SECURITY.md)

4. **Démarrer PostgreSQL (avec Docker):**
   ```bash
   docker-compose up -d
   ```
   
   Ou installez PostgreSQL localement et créez une base de données:
   ```bash
   createdb echowork_db
   ```

5. **Générer le client Prisma et exécuter les migrations:**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

6. **Lancer le serveur en mode développement:**
   ```bash
   npm run start:dev
   ```

Le serveur écoute par défaut sur `http://localhost:3000`.

## Configuration

### Variables d'environnement

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DATABASE_URL` | URL de connexion PostgreSQL | `postgresql://user:pass@localhost:5432/db` |
| `PORT` | Port du serveur | `3000` |
| `FRONTEND_URL` | URL du frontend (pour CORS) | `http://localhost:5173` |

### Scripts disponibles

- `npm run start:dev` - Lance le serveur en mode développement avec hot-reload
- `npm run build` - Compile TypeScript en JavaScript
- `npm run start` - Lance le serveur compilé
- `npm run prisma:generate` - Génère le client Prisma
- `npm run prisma:migrate` - Exécute les migrations de base de données
- `npm run prisma:studio` - Ouvre Prisma Studio (GUI pour la base de données)

## API Endpoints

### Companies

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/companies` | Liste toutes les entreprises |
| GET | `/api/companies/:id` | Récupère une entreprise par ID |
| GET | `/api/companies/category/:categoryId` | Récupère les entreprises par catégorie |

### Réponses

**Succès (200):**
```json
{
  "id": 1,
  "name": "Entreprise XYZ",
  "description": "Description...",
  "categoryId": 1,
  "category": {
    "id": 1,
    "name": "Technologie"
  }
}
```

**Erreurs:**
- `400 Bad Request` - ID invalide
- `404 Not Found` - Ressource non trouvée
- `500 Internal Server Error` - Erreur serveur

## Sécurité

### Fonctionnalités de sécurité implémentées

✅ **Validation des entrées** - Tous les paramètres sont validés
✅ **Gestion des erreurs** - Les erreurs de base de données ne sont pas exposées
✅ **CORS configuré** - Accepte uniquement les requêtes du frontend
✅ **Variables d'environnement** - Toutes les données sensibles sont externalisées

### Recommandations pour la production

Avant de déployer en production:

1. **Changer tous les mots de passe par défaut**
2. **Utiliser des secrets forts** (minimum 16 caractères)
3. **Activer HTTPS/TLS**
4. **Configurer un pare-feu**
5. **Mettre en place la limitation de taux (rate limiting)**
6. **Activer les logs de sécurité**
7. **Utiliser un service de gestion de secrets** (AWS Secrets Manager, etc.)

Pour plus de détails, voir [../SECURITY.md](../SECURITY.md).

## Architecture

```
backend/
├── src/
│   ├── app.module.ts          # Module principal
│   ├── main.ts                # Point d'entrée
│   ├── companies/             # Module des entreprises
│   │   ├── companies.controller.ts
│   │   ├── companies.service.ts
│   │   └── companies.module.ts
│   └── prisma/                # Module Prisma
│       ├── prisma.service.ts
│       └── prisma.module.ts
├── prisma/
│   └── schema.prisma          # Schéma de la base de données
├── .env.example               # Exemple de configuration
└── docker-compose.yml         # Configuration Docker pour PostgreSQL
```

## Développement

### Ajout de nouveaux endpoints

1. Créer un nouveau module NestJS
2. Définir le contrôleur avec les routes
3. Implémenter la logique dans le service
4. Ajouter la validation avec class-validator
5. Mettre à jour le schéma Prisma si nécessaire

### Base de données

Pour visualiser et modifier la base de données:
```bash
npm run prisma:studio
```

Pour créer une nouvelle migration après modification du schéma:
```bash
npx prisma migrate dev --name description_changement
```

## Problèmes courants

### Erreur de connexion à la base de données

- Vérifiez que PostgreSQL est en cours d'exécution
- Vérifiez la `DATABASE_URL` dans `.env`
- Vérifiez que la base de données existe

### Port déjà utilisé

- Changez le `PORT` dans `.env`
- Ou arrêtez le processus utilisant le port 3000

## Support

Pour des questions ou des problèmes, ouvrez une issue sur GitHub.

## Licence

GNU General Public License v3.0
