# Restructuration de la base de données ECHOWORK

## Vue d'ensemble

Cette migration transforme ECHOWORK en une plateforme complète de notation et d'évaluation pour les entreprises sénégalaises, inspirée de Trustpilot, Google Reviews et Glassdoor.

## Architecture en 6 modules

### MODULE 1 – Identité & Utilisateurs

#### Table `User` (modifiée)
- **Nouveaux champs:**
  - `phone` (TEXT, nullable): Numéro de téléphone
  - `isVerified` (BOOLEAN, default: false): Statut de vérification
  - `role` (UserRole): Ajout de MODERATOR

#### Table `UserProfile` (nouvelle)
- `userId` (INT, unique): Référence à User
- `fullName` (TEXT): Nom complet
- `profileType` (ProfileType): CLIENT, EMPLOYEE, SUPPLIER, OTHER
- `trustScore` (FLOAT): Score de confiance (0-1)
  - Augmente avec l'ancienneté, les avis validés, et la vérification du compte

### MODULE 2 – Entreprises

#### Table `Company` (modifiée)
- **Nouveaux champs:**
  - `ninea` (TEXT, unique): Numéro NINEA (identifiant entreprise sénégalaise)
  - `rccm` (TEXT): Numéro RCCM (registre de commerce)
  - `size` (CompanySize): TPE, PME, GRANDE
  - `isVerified` (BOOLEAN): Entreprise vérifiée
  - `claimedByUserId` (INT): Entreprise revendiquée par un utilisateur

#### Table `CompanyLocation` (nouvelle)
- `companyId` (INT): Référence à Company
- `region` (TEXT): Région
- `department` (TEXT): Département
- `city` (TEXT): Ville
- `address` (TEXT): Adresse complète
- `lat`, `lng` (FLOAT): Coordonnées géographiques
- `isPrimary` (BOOLEAN): Localisation principale

**Note:** Les données existantes `ville` et `adresse` sont automatiquement migrées vers `CompanyLocation`.

### MODULE 3 – Catégories & secteurs

#### Table `Category` (modifiée)
- **Nouveaux champs:**
  - `parentId` (INT): Support de hiérarchie de catégories

#### Table `CategoryKeyword` (nouvelle)
- `categoryId` (INT): Référence à Category
- `keyword` (TEXT): Mot-clé pour recherche et classification

### MODULE 4 – Notation & Avis (cœur métier)

#### Table `Review` (modifiée)
- **Nouveaux champs:**
  - `context` (ReviewContext): CLIENT, EMPLOYEE, SUPPLIER, OTHER
  - `status` (ReviewStatus): PENDING, APPROVED, REJECTED

#### Table `RatingCriteria` (nouvelle)
Critères prédéfinis pour l'évaluation:
- Qualité du service (poids: 1.5)
- Prix (poids: 1.0)
- Transparence (poids: 1.3)
- Respect des délais (poids: 1.2)
- Service client (poids: 1.4)

#### Table `ReviewScore` (nouvelle)
- `reviewId` (INT): Référence à Review
- `criteriaId` (INT): Référence à RatingCriteria
- `score` (INT): Note de 1 à 5

**Avantage:** Permet des notes multi-dimensionnelles et des comparaisons sectorielles.

### MODULE 5 – Scores & Réputation

#### Table `CompanyScore` (nouvelle)
- `companyId` (INT, unique): Référence à Company
- `globalScore` (FLOAT): Score global calculé
- `trustIndex` (FLOAT): Indice de confiance (basé sur le nombre et la qualité des avis)
- `totalReviews` (INT): Nombre total d'avis
- `lastUpdated` (TIMESTAMP): Dernière mise à jour

**Note:** Les scores sont automatiquement calculés pour toutes les entreprises existantes lors de la migration.

### MODULE 6 – Business & Monétisation

#### Table `Subscription` (nouvelle)
- `companyId` (INT, unique): Référence à Company
- `plan` (SubscriptionPlan): FREE, PRO, PREMIUM
- `startDate`, `endDate` (TIMESTAMP): Période d'abonnement
- `isActive` (BOOLEAN): Statut actif

**Note:** Toutes les entreprises existantes reçoivent automatiquement un plan FREE.

#### Table `Advertisement` (modifiée)
- **Nouveaux champs:**
  - `type` (AdvertisementType): BANNER, SPONSORED
  - `status` (AdvertisementStatus): ACTIVE, PAUSED, ENDED

## Bénéfices de cette restructuration

✅ **Plateforme crédible:** Vérification NINEA/RCCM, entreprises revendiquées, badges

✅ **Lutte contre faux avis:** Système de statut (PENDING/APPROVED/REJECTED), contexte de l'évaluateur

✅ **Score transparent:** Notes multi-dimensionnelles avec critères pondérés

✅ **Comparaison entre entreprises:** Scores normalisés, indice de confiance

✅ **Compatible IA/RAG/analytics:** Structure de données riche et normalisée

✅ **Monétisable proprement:** Système d'abonnements découplé

✅ **Évolutif Afrique de l'Ouest:** Architecture modulaire et extensible

## Migration

### Exécution de la migration

```bash
cd backend
npm run prisma:migrate
```

### Rollback (si nécessaire)

Les champs dépréciés (`ville`, `adresse` dans Company) sont conservés pour compatibilité descendante. Ils peuvent être supprimés dans une future migration après validation complète.

## Développement futur

### Fonctionnalités recommandées

1. **Calcul automatique des scores:**
   - Trigger PostgreSQL ou tâche cron pour recalculer `CompanyScore`
   - Mise à jour du `trustScore` des utilisateurs

2. **API endpoints:**
   - GET /companies/:id/scores (scores détaillés)
   - GET /companies/:id/reviews?context=EMPLOYEE (filtrage par contexte)
   - POST /companies/:id/claim (revendication d'entreprise)

3. **Modération:**
   - Interface admin pour approuver/rejeter les avis
   - Détection automatique de spam/fake reviews

4. **Analytics:**
   - Tableaux de bord par secteur
   - Évolution des scores dans le temps
   - Comparaisons régionales

## Compatibilité

Cette migration est **rétrocompatible** avec le code existant:
- Tous les champs existants sont conservés
- Les nouvelles colonnes ont des valeurs par défaut
- Les relations existantes restent inchangées
- Les données sont automatiquement migrées (ville/adresse → CompanyLocation)

## Support

Pour toute question ou problème, consulter:
- Schema Prisma: `backend/prisma/schema.prisma`
- Migration SQL: `backend/prisma/migrations/20260131180900_restructure_database/migration.sql`
