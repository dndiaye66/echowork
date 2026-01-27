# Echowork — Backend (squelette NestJS + Prisma)

Ce dossier contient un squelette minimal NestJS + Prisma correspondant aux endpoints attendus par le frontend.

Principaux éléments :
- Endpoints REST :
  - `GET /api/companies` — liste des entreprises
  - `GET /api/companies/:id` — détails d'une entreprise
  - `GET /api/companies/category/:categoryId` — entreprises par catégorie
- Prisma : `prisma/schema.prisma` (modèles `Company` et `Category`)
- Exemple `.env` : `.env.example`
- Docker-compose pour Postgres : `docker-compose.yml`

Démarrage (local) :

1) Copier l'exemple d'env :

```bash
cd backend
cp .env.example .env
```

2) Démarrer Postgres (docker-compose) :

```bash
docker-compose up -d
```

3) Installer dépendances et générer Prisma client :

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
```

4) Lancer en dev :

```bash
npm run start:dev
```

Le serveur écoute par défaut sur `http://localhost:3000`.

Notes :
- Adapter `DATABASE_URL` dans `.env` si nécessaire.
- Ce squelette est minimal : ajoutez auth, validation, tests et gestion des erreurs selon vos besoins.
