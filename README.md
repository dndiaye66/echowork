# EchoWork Frontend

Interface utilisateur de la plateforme **EchoWork** – une application de notation et de classement des entreprises et services publics au Sénégal.

## 📋 Table des matières

- [Technologies](#technologies)
- [Structure du projet](#structure-du-projet)
- [Installation](#installation)
- [Configuration](#configuration)
- [Sécurité](#sécurité)

## Technologies

- **React.js** avec **Vite**
- **Tailwind CSS** + **DaisyUI**
- **Lucide-react** (icônes)
- **Axios** (appel API)
- Hooks personnalisés pour la gestion des appels API

---

## Structure du projet

```
src/
├── assets/         # Images et ressources statiques
├── data/          # Les données des différentes catégories d'entreprise
├── components/    # Composants réutilisables (Foot, Navbar)
├── hooks/         # Hooks personnalisés (useApi, useHomeData, useReview, etc.)
├── pages/         # Pages principales (VitrinePage, CategoryPage, CompanyPage)
├── services/      # Fichiers des appels API (vitrineService, companyService, reviewService)
└── api/
    └── config.js  # Configuration de l'instance Axios
```

## Installation

### Prérequis

- Node.js 18+ et npm/pnpm
- Backend configuré et en cours d'exécution (voir [backend/README.md](backend/README.md))

### Étapes

1. **Cloner le dépôt:**
   ```bash
   git clone https://github.com/dndiaye66/echowork.git
   cd echowork
   ```

2. **Installer les dépendances:**
   ```bash
   npm install
   # ou
   pnpm install
   ```

3. **Configurer les variables d'environnement:**
   ```bash
   # Créer un fichier .env à la racine du projet
   echo "VITE_API_URL=http://localhost:3000/api/" > .env
   ```

4. **Lancer en mode développement:**
   ```bash
   npm run dev
   ```

5. **Accéder à l'application:**
   Ouvrir [http://localhost:5173](http://localhost:5173) dans votre navigateur

## Configuration

### Variables d'environnement

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `VITE_API_URL` | URL de base de l'API backend | `http://localhost:3000/api/` |

### Build de production

```bash
npm run build
npm run preview  # Pour tester le build localement
```

## Sécurité

⚠️ **Important:** Lisez le fichier [SECURITY.md](SECURITY.md) pour les meilleures pratiques de sécurité.

Points clés:
- Ne jamais commiter de fichiers `.env` contenant des données sensibles
- Toujours utiliser HTTPS en production
- Configurer correctement CORS sur le backend

## Scripts disponibles

- `npm run dev` - Lance le serveur de développement
- `npm run build` - Build pour la production
- `npm run preview` - Prévisualise le build de production
- `npm run lint` - Vérifie la qualité du code avec ESLint

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
