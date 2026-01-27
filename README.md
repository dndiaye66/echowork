# EchoWork Frontend

Interface utilisateur de la plateforme **EchoWork** – une application de notation et de classement des entreprises et services publics au Sénégal.

## Technologies

- **React.js** avec **Vite**
- **Tailwind CSS** + **DaisyUI**
- **Lucide-react** (icônes)
- **Axios** (appel API)
- Hooks personnalisés pour la gestion des appels API

---

## Structure du projet# React + Vite
src/
assets/ # Images et ressources statiques
data/ # Les données des différentes catégories d'entreprise et les différentes catégories d'entreprise
components/ # Composants réutilisables (Foot, Navbar)
hooks/ # Hooks personnalisés (useApi, useHomeData, useReview, useVoting, useCategory, homeService, useCompany)
pages/ # Pages principales (VitrinePage.jsx, CategoryPage, CompanyPage.)
services/ # Fichiers des appels API (vitrineService, companyService, reviewService)
api/
└── config.js # Configuration de l'instance Axios

