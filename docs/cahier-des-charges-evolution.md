# Cahier des charges — Évolution de la plateforme EchoWork

**Version** : 1.0  
**Date** : Juin 2026  
**Statut** : En cours de rédaction  

---

## Vision

Faire d'EchoWork la référence sénégalaise et ouest-africaine de la réputation numérique des entreprises, administrations et services publics.

---

## Contexte technique actuel

| Composant | Technologie |
|-----------|-------------|
| Frontend  | React 19 + Vite 6 + TailwindCSS 4 + DaisyUI 5 + React Router 7 |
| Backend   | NestJS 10 + Prisma 5 + PostgreSQL 15 + JWT |
| Hébergement | VPS Ubuntu + Nginx + PM2 + Let's Encrypt |

**Modèles Prisma existants pertinents :**  
`User`, `Company`, `Review`, `RatingCriteria`, `ReviewScore`, `CompanyScore`, `CompanyLocation`, `Subscription`, `ReviewVote`, `JobOffer`, `Advertisement`

---

## Roadmap

| Phase | Durée | Objectif principal |
|-------|-------|--------------------|
| Phase 1 | 0 – 6 mois | Crédibilité & engagement |
| Phase 2 | 6 – 12 mois | Monétisation & croissance |
| Phase 3 | 12 – 24 mois | Expansion régionale |

---

## Phase 1 — Renforcer la crédibilité et l'engagement (0 à 6 mois)

---

### 1. Système de notation détaillé par secteur

#### État actuel
- Note globale unique (1–5 étoiles) par avis.
- L'infrastructure existe déjà en base (`RatingCriteria`, `ReviewScore`) mais n'est pas utilisée en production.

#### Objectif
Afficher des critères de notation spécifiques selon la catégorie de l'entreprise.

#### Critères par secteur

| Secteur | Critères |
|---------|----------|
| **Banques & Institutions financières** | Qualité de l'accueil · Temps d'attente · Professionnalisme · Disponibilité des services · Satisfaction globale |
| **Restaurants & Alimentation** | Qualité des plats · Propreté · Service · Prix · Ambiance |
| **Télécoms** | Couverture réseau · Qualité Internet · Service client · Rapport qualité/prix |
| **Santé & Pharmacie** | Accueil · Temps d'attente · Compétence · Propreté · Suivi |
| **Commerce & Distribution** | Qualité produits · Prix · Accueil · SAV · Disponibilité stock |
| **Enseignement** | Qualité pédagogique · Encadrement · Infrastructure · Rapport qualité/prix · Administration |
| **Défaut (autres secteurs)** | Qualité du service · Rapport qualité/prix · Accueil · Ponctualité |

#### Spécifications techniques

**Backend — Modifications Prisma :**

```prisma
// Lier les critères à une catégorie (nouvelle relation)
model RatingCriteria {
  id          Int                      @id @default(autoincrement())
  name        String
  description String?
  weight      Float                    @default(1.0)
  isActive    Boolean                  @default(true)
  categoryId  Int?                     // ← NOUVEAU : null = critère générique
  category    Category?                @relation(fields: [categoryId], references: [id])
  scores      ReviewScore[]
  createdAt   DateTime                 @default(now())
  updatedAt   DateTime                 @updatedAt
}
```

**Backend — Endpoints à créer/modifier :**

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/criteria?categoryId=:id` | Récupérer les critères d'une catégorie |
| `POST` | `/api/reviews` | Accepter un tableau `scores: [{criteriaId, score}]` |
| `GET` | `/api/companies/:slug/scores` | Notes détaillées par critère |

**Frontend — Modifications `CompanyPage.jsx` :**
- Charger les critères de la catégorie avant d'afficher le formulaire d'avis.
- Remplacer le `StarPicker` unique par un `StarPicker` par critère.
- Afficher les notes moyennes par critère dans la fiche entreprise (barres de progression).

**Calcul de la note globale :**
```
noteGlobale = Σ(score_i × weight_i) / Σ(weight_i)
```
Mis à jour dans `CompanyScore.globalScore` à chaque avis approuvé.

#### Bénéfice
Avis plus riches et exploitables — permet aux entreprises d'identifier leurs points faibles précis.

---

### 2. Vérification des avis

#### État actuel
- Les utilisateurs ont un `isVerified` (vérification email à l'inscription).
- Aucun badge "avis vérifié" n'est affiché.

#### Objectif
Afficher un badge **✅ Avis vérifié** sur les avis postés par des comptes ayant leur email confirmé.

#### Méthodes de vérification

| Méthode | Description | Priorité |
|---------|-------------|----------|
| Email vérifié | Compte ayant complété la vérification email à l'inscription | Phase 1 |
| Numéro de téléphone | Vérification par SMS OTP | Phase 2 |
| Document d'identité | Upload + validation manuelle (modérateur) | Phase 3 |

#### Spécifications techniques

**Aucune migration Prisma requise** — `User.isVerified` suffit pour la Phase 1.

**Backend :**
- Inclure `user.isVerified` dans la réponse `GET /api/companies/:slug/reviews`.

**Frontend :**
- Dans la carte d'avis (`ReviewCard`), afficher un badge vert `Avis vérifié` si `review.user.isVerified === true`.
- Ajouter un filtre "Avis vérifiés uniquement" dans la liste des avis.

**Score de confiance :**
- Un avis vérifié compte pour `1.0×` dans le `trustIndex`.
- Un avis non vérifié compte pour `0.7×`.
- Mise à jour dans `CompanyScore.trustIndex`.

#### Bénéfice
Réduction des faux avis, meilleure confiance des visiteurs.

---

### 3. Profils entreprises enrichis

#### État actuel
La fiche entreprise contient : nom, description, adresse, téléphone, catégorie, note globale.

#### Objectif
Fiche entreprise complète comparable à Google My Business.

#### Champs cibles

| Champ | Modèle Prisma | État |
|-------|---------------|------|
| Logo / image principale | `Company.imageUrl` | ✅ Existe |
| Description | `Company.description` | ✅ Existe |
| Adresse | `CompanyLocation.address` | ✅ Existe |
| Téléphone | `Company.tel` | ✅ Existe |
| Ville / Région | `CompanyLocation.city`, `.region` | ✅ Existe |
| Coordonnées GPS | `CompanyLocation.lat`, `.lng` | ✅ Existe |
| Site web | — | ❌ À ajouter |
| Horaires d'ouverture | — | ❌ À ajouter |
| Réseaux sociaux | — | ❌ À ajouter |
| Galerie photos | — | ❌ À ajouter |
| NINEA / RCCM | `Company.ninea`, `.rccm` | ✅ Existe |

**Migration Prisma à créer :**

```prisma
model Company {
  // ... champs existants ...
  website        String?
  socialLinks    Json?           // { facebook, instagram, linkedin, twitter }
  openingHours   Json?           // { lundi: "08:00-18:00", mardi: "08:00-18:00", ... }
  photos         CompanyPhoto[]
}

model CompanyPhoto {
  id          Int      @id @default(autoincrement())
  companyId   Int
  company     Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  url         String
  caption     String?
  isPrimary   Boolean  @default(false)
  createdAt   DateTime @default(now())

  @@index([companyId])
}
```

**Backend — Endpoints à créer :**

| Méthode | Route | Description |
|---------|-------|-------------|
| `PATCH` | `/api/companies/:id` | Mise à jour du profil (entreprise connectée) |
| `POST` | `/api/companies/:id/photos` | Upload d'une photo (multipart/form-data) |
| `DELETE` | `/api/companies/:id/photos/:photoId` | Supprimer une photo |

**Frontend — `CompanyPage.jsx` à enrichir :**
- Carte Google Maps intégrée via l'API Maps Embed (gratuite jusqu'à un certain seuil).
- Galerie photos avec lightbox (bibliothèque `yet-another-react-lightbox`).
- Affichage des horaires avec indication "Ouvert maintenant / Fermé".
- Liens réseaux sociaux avec icônes Lucide.

#### Bénéfice
Fiche complète → meilleur référencement SEO + expérience utilisateur de niveau Trustpilot/Google.

---

### 4. Réponse officielle des entreprises

#### État actuel
Aucun mécanisme de réponse. Les entreprises ne peuvent pas interagir avec les avis.

#### Objectif
Permettre à l'entreprise propriétaire de la fiche (compte `claimedBy`) de répondre publiquement à un avis.

#### Exemple

> **Client** — ★★★☆☆  
> *"Temps d'attente trop long au guichet."*  
>
> **Réponse officielle de la Banque X** — *2 juin 2026*  
> *"Merci pour votre retour. Nous avons renforcé nos équipes depuis le 1er juin et réduisons le temps d'attente moyen à 10 minutes."*

#### Spécifications techniques

**Migration Prisma :**

```prisma
model CompanyReply {
  id          Int      @id @default(autoincrement())
  reviewId    Int      @unique      // une seule réponse par avis
  review      Review   @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  companyId   Int
  company     Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  content     String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([reviewId])
  @@index([companyId])
}

// Ajouter dans Review :
model Review {
  // ... champs existants ...
  reply       CompanyReply?
}

// Ajouter dans Company :
model Company {
  // ... champs existants ...
  replies     CompanyReply[]
}
```

**Backend — Endpoints :**

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| `POST` | `/api/reviews/:id/reply` | Entreprise propriétaire | Créer une réponse |
| `PATCH` | `/api/reviews/:id/reply` | Entreprise propriétaire | Modifier la réponse |
| `DELETE` | `/api/reviews/:id/reply` | Entreprise ou Admin | Supprimer la réponse |

**Guard :** Vérifier que `req.user.id === company.claimedByUserId` avant toute modification.

**Frontend :**
- Afficher la réponse juste sous l'avis avec un badge distinctif "Réponse officielle".
- Si l'utilisateur connecté est le `claimedBy` de l'entreprise, afficher un bouton "Répondre à cet avis".
- Formulaire inline (pas de modal) avec compteur de caractères (max 1 000).

#### Bénéfice
Dialogue public → montre que l'entreprise est à l'écoute → améliore sa note de confiance.

---

## Récapitulatif Phase 1 — Priorités et effort

| Feature | Effort backend | Effort frontend | Priorité |
|---------|----------------|-----------------|----------|
| Notation multi-critères par secteur | Moyen (migration + seeding des critères) | Élevé (refonte formulaire) | 🔴 Haute |
| Badge avis vérifié | Faible (champ existant) | Faible | 🔴 Haute |
| Profil enrichi (website, hours, socials) | Moyen (migration + endpoints) | Moyen | 🟡 Moyenne |
| Galerie photos | Moyen (upload + stockage) | Moyen | 🟡 Moyenne |
| Carte Google Maps | Faible (composant embed) | Faible | 🟡 Moyenne |
| Réponse officielle entreprise | Moyen (migration + guard) | Moyen | 🔴 Haute |

---

## Phase 2 — Intelligence et données (6 à 12 mois)

---

### 5. Classements nationaux

#### État actuel
La page d'accueil affiche un Top 10 global (`GET /api/companies/best`) sans filtrage par secteur ni par ville. Les méthodes `findBestCompanies()` et `findWorstCompanies()` existent dans `companies.service.ts` mais utilisent une requête SQL brute non paramétrée.

#### Objectif
Une page dédiée `/classements` avec deux axes de navigation :

**Top 10 par secteur**

| Catégorie |
|-----------|
| Banques & institutions financières |
| Assurances |
| Hôpitaux & santé |
| Universités & enseignement supérieur |
| Restaurants & alimentation |
| Télécommunications |

**Top 10 par ville**

| Ville |
|-------|
| Dakar · Thiès · Saint-Louis · Kaolack · Ziguinchor |

#### Spécifications techniques

**Backend — Nouveau endpoint :**

```
GET /api/companies/rankings
  ?type=category&categorySlug=banques-et-institutions-financieres
  ?type=city&city=Dakar
  ?limit=10
```

Requête SQL optimisée utilisant `AVG(r.rating)` et `COUNT(r.id)` avec filtre sur `CompanyLocation.city` ou `Category.slug`.

**Migration Prisma :** Aucune — utilise les modèles existants (`Company`, `Review`, `Category`, `CompanyLocation`).

**Frontend — Nouvelle page `/classements` :**
- Onglets horizontaux : Secteur / Ville
- Liste déroulante pour choisir le secteur ou la ville
- Cards entreprises avec rang (🥇 🥈 🥉), note, nombre d'avis, badge "En hausse / En baisse" (comparaison note mois N vs mois N-1)
- Mise à jour hebdomadaire (cache backend 1h)

#### Bénéfice
Contenu éditorial fort → SEO, partage sur les réseaux sociaux, engagement médias.

---

### 6. Tableau de bord entreprise enrichi (Freemium)

#### État actuel
L'espace entreprise (Phase 1) affiche la note globale et le nombre total d'avis. Aucune donnée temporelle ni comparaison concurrentielle.

#### Objectif
Transformer le tableau de bord en outil d'aide à la décision pour les dirigeants.

#### Métriques à afficher

| Métrique | Description | Plan requis |
|----------|-------------|-------------|
| Nombre de vues de la fiche | Comptage des visites sur `CompanyPage` | FREE |
| Nombre d'avis | Total + évolution vs mois précédent | FREE |
| Évolution de la note | Courbe mensuelle sur 12 mois | FREE |
| Taux de réponse aux avis | % d'avis avec réponse officielle | FREE |
| Analyse des commentaires (IA) | Points forts / points faibles extraits automatiquement | PRO |
| Comparaison avec la concurrence | Note moyenne du secteur vs la fiche | PRO |
| Mots-clés fréquents | Nuage de mots issu des avis | PRO |

#### Spécifications techniques

**Migration Prisma :**

```prisma
model CompanyView {
  id        Int      @id @default(autoincrement())
  companyId Int
  company   Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  viewedAt  DateTime @default(now())
  source    String?  // 'direct' | 'search' | 'category'

  @@index([companyId])
  @@index([viewedAt])
}
```

**Backend :**

| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/api/companies/:id/view` | Enregistrer une vue (appelé depuis `CompanyPage`) |
| `GET` | `/api/companies/:id/analytics` | Données analytiques (guard owner + plan check) |

Structure de la réponse `/analytics` :
```json
{
  "views": { "total": 1240, "trend": "+12%" },
  "reviews": { "total": 87, "thisMonth": 6, "trend": "+2" },
  "ratingHistory": [
    { "month": "2026-01", "avg": 3.8 },
    { "month": "2026-02", "avg": 4.1 },
    ...
  ],
  "responseRate": 72,
  "competitorAvg": 3.6
}
```

**Frontend — Dashboard enrichi :**
- Graphique d'évolution de note : bibliothèque `recharts` (déjà légère, pas de dépendance lourde)
- Jauge de taux de réponse
- Comparaison concurrents : barre horizontale "Votre note vs. moyenne du secteur"
- Blocage des métriques PRO avec CTA "Passer au plan Pro"

#### Bénéfice
Les entreprises comprennent leur performance, identifient les tendances et justifient l'abonnement payant.

---

### 7. Analyse automatique des avis par IA

#### Objectif
Pour une entreprise ayant reçu au moins 20 avis, générer automatiquement une synthèse structurée lisible par un dirigeant non-technique.

#### Exemple de sortie

> **Analyse de 500 avis — Orange Sénégal**
>
> ✅ **Points forts**
> - Accueil en agence (mentionné dans 68% des avis positifs)
> - Rapidité des transactions (45%)
>
> ⚠️ **Points faibles**
> - Temps d'attente trop long (mentionné dans 54% des avis négatifs)
> - Difficulté à joindre le service client (41%)
>
> 📊 **Sentiment global** : 72% positif · 18% neutre · 10% négatif

#### Spécifications techniques

**Modèle IA utilisé :** Claude Haiku 4.5 (`claude-haiku-4-5-20251001`) via l'API Anthropic — optimisé coût/performance pour l'analyse de texte en volume.

**Migration Prisma :**

```prisma
model ReviewAnalysis {
  id             Int      @id @default(autoincrement())
  companyId      Int      @unique
  company        Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  strengths      Json     // string[]
  weaknesses     Json     // string[]
  sentimentPos   Float    // % positif
  sentimentNeu   Float    // % neutre
  sentimentNeg   Float    // % négatif
  reviewCount    Int      // nb d'avis analysés
  generatedAt    DateTime @default(now())

  @@index([companyId])
}
```

**Backend — NestJS :**

```typescript
// Module dédié : src/ai-analysis/ai-analysis.module.ts
// Dépendance : @anthropic-ai/sdk

POST /api/companies/:id/analysis/generate   // déclenche l'analyse (owner ou admin)
GET  /api/companies/:id/analysis            // récupère la dernière analyse
```

**Prompt envoyé à l'API Claude :**
```
Tu es un expert en analyse de satisfaction client.
Analyse ces [N] avis clients d'une entreprise sénégalaise du secteur [SECTEUR].
Identifie les 3 principaux points forts et les 3 principaux points faibles.
Calcule la répartition sentimentale (positif/neutre/négatif).
Réponds UNIQUEMENT en JSON avec la structure : 
{ strengths: string[], weaknesses: string[], sentiment: { pos, neu, neg } }

Avis :
[LISTE DES AVIS]
```

**Déclenchement :** Automatique via cron toutes les semaines pour les entreprises avec plan PRO ou plus de 50 nouveaux avis depuis la dernière analyse.

**Frontend :**
- Bloc "Analyse IA" dans le dashboard entreprise (plan PRO)
- Badge "Mis à jour le JJ/MM/AAAA"
- Affichage des forces en vert et faiblesses en rouge/orange
- Bouton "Régénérer l'analyse" (limité à 1x/semaine)

#### Bénéfice
Les dirigeants comprennent immédiatement et sans effort les tendances de leur réputation. Argument commercial fort pour le plan PRO.

---

### 8. Signalement citoyen

#### Objectif
Permettre aux citoyens de signaler des comportements problématiques de manière anonyme ou identifiée, avec une modération renforcée par une équipe dédiée.

#### Catégories de signalement

| Catégorie | Icône | Description |
|-----------|-------|-------------|
| Corruption | 🚨 | Demande de pot-de-vin, favoritisme |
| Mauvais accueil | 😠 | Comportement irrespectueux, discrimination |
| Retards administratifs | ⏰ | Dossiers bloqués sans justification |
| Non-respect des engagements | 📋 | Promesses non tenues, contrats non honorés |
| Autre | 📝 | Tout autre comportement problématique |

#### Différences avec un avis classique

| Critère | Avis | Signalement |
|---------|------|-------------|
| Anonymat possible | Non | Oui |
| Modération | Standard | Renforcée (délai max 48h) |
| Visible publiquement | Après approbation | Après validation équipe |
| Visible par l'entreprise | Oui | Non (protège le signalant) |
| Comptabilisé dans la note | Oui | Non |

#### Spécifications techniques

**Migration Prisma :**

```prisma
enum ReportCategory {
  CORRUPTION
  MAUVAIS_ACCUEIL
  RETARD_ADMINISTRATIF
  NON_RESPECT_ENGAGEMENT
  AUTRE
}

enum ReportStatus {
  PENDING
  UNDER_REVIEW
  VALIDATED
  REJECTED
}

model CitizenReport {
  id          Int            @id @default(autoincrement())
  companyId   Int
  company     Company        @relation(fields: [companyId], references: [id], onDelete: Cascade)
  userId      Int?           // null si anonyme
  user        User?          @relation(fields: [userId], references: [id], onDelete: SetNull)
  category    ReportCategory
  description String
  evidence    String?        // URL d'un document / capture d'écran
  isAnonymous Boolean        @default(false)
  status      ReportStatus   @default(PENDING)
  moderatorId Int?
  moderatorNote String?
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  @@index([companyId])
  @@index([status])
  @@index([category])
}
```

**Backend — Endpoints :**

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| `POST` | `/api/reports` | Optionnel | Soumettre un signalement |
| `GET` | `/api/reports` | Admin | Lister tous les signalements |
| `PATCH` | `/api/reports/:id/status` | Admin | Valider / rejeter |
| `GET` | `/api/companies/:id/reports` | Admin | Signalements d'une entreprise |

**Frontend :**
- Bouton "Signaler un problème" sur la fiche entreprise (discret, en bas de page)
- Formulaire dédié avec choix de catégorie, description (min 50 caractères), upload optionnel d'une preuve
- Option anonymat avec message d'information sur la protection des données
- Interface admin dédiée dans le back-office avec file de modération

**Modération renforcée :**
- Les signalements sont invisibles publiquement jusqu'à validation manuelle
- Délai de traitement cible : 48h
- Notification email à l'équipe de modération pour chaque nouveau signalement
- Score de gravité automatique basé sur la catégorie (CORRUPTION = critique)

#### Bénéfice
Outil citoyen unique au Sénégal → différenciation forte vs Trustpilot → impact sociétal et médiatique.

---

## Récapitulatif Phase 2 — Priorités et effort

| Feature | Effort backend | Effort frontend | Plan requis | Priorité |
|---------|----------------|-----------------|-------------|----------|
| Classements nationaux | Faible (requête paramétrée) | Moyen (page + UI) | FREE | 🔴 Haute |
| Vues de fiche (tracking) | Faible (migration + endpoint) | Faible | FREE | 🟡 Moyenne |
| Évolution de note (courbe) | Faible (agrégation SQL) | Moyen (recharts) | FREE | 🟡 Moyenne |
| Comparaison concurrents | Faible | Moyen | PRO | 🟡 Moyenne |
| Analyse IA des avis | Élevé (API Claude + cron) | Moyen | PRO | 🔴 Haute |
| Signalement citoyen | Élevé (migration + modération) | Élevé (formulaire + admin) | FREE | 🔴 Haute |

---

## Phase 3 — Expansion régionale (12 à 24 mois)

> *Détail à compléter dans la prochaine version du document.*

Points identifiés :
- Support multi-pays (Côte d'Ivoire, Mali, Burkina Faso, Guinée).
- Multi-langue (français, wolof).
- Couverture des services publics et administrations.
- API publique pour partenaires (comparateurs, journalistes).
- Application mobile (React Native).

---

## Annexe — Questions ouvertes

| # | Question | Impact |
|---|----------|--------|
| 1 | Hébergement des photos : VPS local ou S3/Cloudflare R2 ? | Phase 1 galerie |
| 2 | Intégration Google Maps : API key avec quota ou Maps Embed gratuit ? | Phase 1 carte |
| 3 | Vérification entreprise par NINEA : appel API APIX / ANSD ou manuelle ? | Phase 2 badge |
| 4 | Système de notification email sur réponse : Resend ou Postfix existant ? | Phase 1 réponse |
| 5 | Analyse IA : déclenchement cron (hebdo) ou à la demande (limité) ? | Phase 2 IA |
| 6 | Signalement anonyme : RGPD / protection des données au Sénégal (CDP) ? | Phase 2 signalement |
| 7 | Classements : cache Redis ou cache en mémoire NestJS suffit ? | Phase 2 classements |

---

*Document maintenu par l'équipe EchoWork — dernière mise à jour : juin 2026*
