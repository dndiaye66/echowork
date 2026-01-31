# Architecture de la base de données ECHOWORK

## Diagramme des relations

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         MODULE 1: UTILISATEURS                          │
└─────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────┐           ┌──────────────────┐
    │      User        │ 1       1 │   UserProfile    │
    │                  │◄──────────│                  │
    │ • id             │           │ • userId (FK)    │
    │ • username       │           │ • fullName       │
    │ • email          │           │ • profileType    │
    │ • phone          │           │ • trustScore     │
    │ • password       │           │                  │
    │ • role           │           │ ProfileType:     │
    │ • isVerified     │           │ • CLIENT         │
    └──────────────────┘           │ • EMPLOYEE       │
            │                      │ • SUPPLIER       │
            │                      │ • OTHER          │
            │                      └──────────────────┘
            │
            │ claimedBy
            │
┌───────────┼─────────────────────────────────────────────────────────────┐
│           │              MODULE 2: ENTREPRISES                          │
└───────────┼─────────────────────────────────────────────────────────────┘
            ▼
    ┌──────────────────┐
    │     Company      │
    │                  │
    │ • id             │
    │ • name           │
    │ • slug           │
    │ • ninea (unique) │──┐
    │ • rccm           │  │  NINEA/RCCM: Identifiants
    │ • size           │  │  officiels entreprises
    │ • isVerified     │──┘  sénégalaises
    │ • claimedByUser  │
    │ • categoryId (FK)│
    └──────────────────┘
            │
            ├─────────────────────────────────┐
            │ 1                         1..* │
            ▼                                 ▼
    ┌──────────────────┐           ┌──────────────────┐
    │  CompanyScore    │           │ CompanyLocation  │
    │                  │           │                  │
    │ • companyId (FK) │           │ • companyId (FK) │
    │ • globalScore    │           │ • region         │
    │ • trustIndex     │           │ • department     │
    │ • totalReviews   │           │ • city           │
    │ • lastUpdated    │           │ • address        │
    └──────────────────┘           │ • lat, lng       │
                                   │ • isPrimary      │
                                   └──────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                      MODULE 3: CATÉGORIES                               │
└─────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────┐           ┌──────────────────┐
    │    Category      │ parent  1 │  CategoryKeyword │
    │                  │◄──────────│                  │
    │ • id             │         * │ • categoryId (FK)│
    │ • name           │           │ • keyword        │
    │ • slug           │           └──────────────────┘
    │ • parentId (FK)  │
    └──────────────────┘
            │
            │ self-referencing (hiérarchie)
            └────────┐
                     │
                     ▼
            (sous-catégories)

┌─────────────────────────────────────────────────────────────────────────┐
│                MODULE 4: NOTATION & AVIS (CŒUR MÉTIER)                  │
└─────────────────────────────────────────────────────────────────────────┘

    User                    Company
      │                        │
      │                        │
      └────────┬───────────────┘
               │
               │ userId, companyId
               ▼
    ┌──────────────────┐
    │      Review      │
    │                  │
    │ • id             │
    │ • rating         │
    │ • comment        │
    │ • context        │──┐  ReviewContext:
    │ • status         │  ├─ • CLIENT
    │ • userId (FK)    │  ├─ • EMPLOYEE
    │ • companyId (FK) │  ├─ • SUPPLIER
    │ • upvotes        │  └─ • OTHER
    │ • downvotes      │
    └──────────────────┘  ReviewStatus:
            │             • PENDING
            │             • APPROVED
            │             • REJECTED
            │ 1
            │
            │ *
            ▼
    ┌──────────────────┐           ┌──────────────────┐
    │   ReviewScore    │ *       1 │ RatingCriteria   │
    │                  │◄──────────│                  │
    │ • reviewId (FK)  │           │ • id             │
    │ • criteriaId (FK)│           │ • name           │
    │ • score (1-5)    │           │ • description    │
    └──────────────────┘           │ • weight         │
                                   │ • isActive       │
                                   └──────────────────┘
                                   
                                   Critères prédéfinis:
                                   1. Qualité service (1.5)
                                   2. Prix (1.0)
                                   3. Transparence (1.3)
                                   4. Respect délais (1.2)
                                   5. Service client (1.4)

┌─────────────────────────────────────────────────────────────────────────┐
│             MODULE 6: BUSINESS & MONÉTISATION                           │
└─────────────────────────────────────────────────────────────────────────┘

    Company
      │
      ├──────────────┬────────────────┐
      │ 1          1 │              0│*
      ▼              ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│Subscription  │ │Advertisement │ │   JobOffer   │
│              │ │              │ │              │
│• companyId   │ │• companyId   │ │• companyId   │
│• plan        │ │• type        │ │• title       │
│• startDate   │ │• status      │ │• description │
│• endDate     │ │• content     │ │• salary      │
│• isActive    │ │• startDate   │ │• isActive    │
└──────────────┘ │• endDate     │ └──────────────┘
                 └──────────────┘
SubscriptionPlan:
• FREE           AdvertisementType & Status:
• PRO            • BANNER    / ACTIVE
• PREMIUM        • SPONSORED / PAUSED
                             / ENDED
```

## Flux de données principaux

### 1. Création d'un avis complet

```
┌─────────┐     ┌─────────┐     ┌────────────┐     ┌──────────────┐
│  User   │────▶│ Review  │────▶│ReviewScore │────▶│CompanyScore  │
└─────────┘     └─────────┘     └────────────┘     └──────────────┘
                     │                │                     ▲
                     │                │                     │
                     │                ▼                     │
                     │         ┌────────────┐              │
                     │         │Rating      │              │
                     │         │Criteria    │              │
                     │         └────────────┘              │
                     │                                     │
                     └─────────────────────────────────────┘
                              (recalcul automatique)
```

### 2. Cycle de vie d'un avis

```
PENDING ──(modérateur approuve)──▶ APPROVED ──▶ Mise à jour scores
   │                                                      │
   │                                                      ▼
   │                                            • CompanyScore.globalScore
   └──(modérateur rejette)──▶ REJECTED         • CompanyScore.trustIndex
                                                • UserProfile.trustScore
```

### 3. Revendication d'entreprise

```
┌────────────┐                  ┌─────────────┐
│ Entreprise │                  │ Utilisateur │
│ (non       │                  │ (vérifié)   │
│ revendiquée│                  └─────────────┘
└────────────┘                         │
      │                                │
      │         ┌──────────────────────┘
      │         │ POST /companies/:id/claim
      │         ▼
      │   ┌──────────────┐
      └──▶│ Company      │
          │ claimedBy    │──┐
          │ = userId     │  │  Vérification manuelle
          └──────────────┘  │  par l'équipe
                 │          │
                 │          ▼
                 │    ┌──────────────┐
                 └───▶│ isVerified   │
                      │ = true       │
                      └──────────────┘
```

### 4. Calcul du score global pondéré

```
ReviewScore1 (Qualité service): 5 × 1.5 = 7.5
ReviewScore2 (Prix):            4 × 1.0 = 4.0
ReviewScore3 (Transparence):    5 × 1.3 = 6.5
ReviewScore4 (Délais):          4 × 1.2 = 4.8
ReviewScore5 (Service client):  5 × 1.4 = 7.0
                                      ─────
                         Total:       29.8
                         Poids total:  6.4
                         
Global Score = 29.8 / 6.4 = 4.66 / 5 ⭐⭐⭐⭐⭐
```

### 5. Trust Index (Indice de confiance)

```
Trust Index = min(totalReviews / 10, 1.0)

Exemples:
• 3 avis   → 0.3 (30% confiance)
• 5 avis   → 0.5 (50% confiance)
• 10 avis  → 1.0 (100% confiance)
• 50 avis  → 1.0 (100% confiance, plafonné)
```

## Relations clés par module

### MODULE 1: Utilisateurs
- `User` 1:1 `UserProfile` (création automatique recommandée)
- `User` 1:* `Company` (via claimedBy)
- `User` 1:* `Review` (avis créés)

### MODULE 2: Entreprises
- `Company` 1:1 `CompanyScore` (création automatique)
- `Company` 1:* `CompanyLocation` (multi-sites)
- `Company` 1:1 `Subscription` (création automatique avec FREE)
- `Company` *:1 `Category`

### MODULE 3: Catégories
- `Category` 1:* `Category` (hiérarchie parent-enfant)
- `Category` 1:* `CategoryKeyword` (recherche améliorée)
- `Category` 1:* `Company`

### MODULE 4: Notation
- `Review` *:1 `User`
- `Review` *:1 `Company`
- `Review` 1:* `ReviewScore` (multi-critères)
- `ReviewScore` *:1 `RatingCriteria`

### MODULE 6: Business
- `Company` 1:1 `Subscription`
- `Company` 1:* `Advertisement`
- `Company` 1:* `JobOffer`

## Index stratégiques

```sql
-- Recherche géographique
INDEX ON CompanyLocation(region)
INDEX ON CompanyLocation(city)

-- Filtrage des avis
INDEX ON Review(status)
INDEX ON Review(context)

-- Classements
INDEX ON CompanyScore(globalScore)
INDEX ON CompanyScore(trustIndex)

-- Vérification
INDEX ON Company(isVerified)
INDEX ON Company(ninea)

-- Trust score
INDEX ON UserProfile(trustScore)

-- Modération
INDEX ON Review(status, createdAt)
```

## Contraintes d'intégrité

```sql
-- Unicité
• Company.slug (UNIQUE)
• Company.ninea (UNIQUE)
• User.email (UNIQUE)
• ReviewScore(reviewId, criteriaId) (UNIQUE)

-- Clés étrangères avec CASCADE
• UserProfile → User (DELETE CASCADE)
• CompanyLocation → Company (DELETE CASCADE)
• Review → Company (DELETE CASCADE)
• Review → User (DELETE CASCADE)
• ReviewScore → Review (DELETE CASCADE)

-- Clés étrangères avec SET NULL
• Company.claimedByUserId → User (DELETE SET NULL)
• Advertisement.companyId → Company (DELETE SET NULL)
```

---

*Cette architecture garantit l'évolutivité, la performance et l'intégrité des données pour une plateforme de notation professionnelle.*
