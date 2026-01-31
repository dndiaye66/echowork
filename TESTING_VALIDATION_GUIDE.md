# Guide de test et validation

Ce guide vous aide à tester et valider la nouvelle structure de base de données ECHOWORK.

## 1. Prérequis

Assurez-vous que vous avez:
- PostgreSQL 17 installé et en cours d'exécution
- Node.js et npm installés
- Les dépendances backend installées (`cd backend && npm install`)

## 2. Étapes de migration

### 2.1 Sauvegarde de la base existante

**IMPORTANT:** Avant toute migration, sauvegardez votre base de données:

```bash
# Créer un backup
pg_dump -U postgres -d echowork_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Vérifier le backup
ls -lh backup_*.sql
```

### 2.2 Exécution de la migration

```bash
cd backend

# Option 1: Utiliser Prisma Migrate (recommandé)
npx prisma migrate deploy

# Option 2: Exécution manuelle du SQL
psql -U postgres -d echowork_db -f prisma/migrations/20260131180900_restructure_database/migration.sql
```

### 2.3 Vérification post-migration

```bash
# Régénérer le client Prisma
npm run prisma:generate

# Vérifier l'état de la base
npx prisma studio
```

## 3. Tests de validation SQL

Exécutez ces requêtes pour valider la migration:

```sql
-- 1. Vérifier que tous les nouveaux types ENUM existent
SELECT typname FROM pg_type WHERE typname IN (
  'ProfileType', 'CompanySize', 'ReviewContext', 'ReviewStatus',
  'SubscriptionPlan', 'AdvertisementType', 'AdvertisementStatus'
);
-- Devrait retourner 7 lignes

-- 2. Vérifier que toutes les nouvelles tables existent
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
  'UserProfile', 'CompanyLocation', 'CategoryKeyword',
  'RatingCriteria', 'ReviewScore', 'CompanyScore', 'Subscription'
);
-- Devrait retourner 7 lignes

-- 3. Vérifier que les nouveaux champs existent dans User
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'User' 
AND column_name IN ('phone', 'isVerified');
-- Devrait retourner 2 lignes

-- 4. Vérifier que les nouveaux champs existent dans Company
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'Company' 
AND column_name IN ('ninea', 'rccm', 'size', 'isVerified', 'claimedByUserId');
-- Devrait retourner 5 lignes

-- 5. Vérifier que les critères de notation ont été insérés
SELECT COUNT(*) as criteria_count FROM "RatingCriteria";
-- Devrait retourner 5

-- 6. Vérifier que les localisations ont été migrées
SELECT COUNT(*) as locations_count FROM "CompanyLocation";
-- Devrait être > 0 si vous aviez des entreprises avec ville/adresse

-- 7. Vérifier que les abonnements ont été créés
SELECT 
  COUNT(*) as total_subscriptions,
  SUM(CASE WHEN plan = 'FREE' THEN 1 ELSE 0 END) as free_plans
FROM "Subscription";
-- total_subscriptions devrait être égal au nombre d'entreprises

-- 8. Vérifier que les scores ont été initialisés
SELECT COUNT(*) as scores_count FROM "CompanyScore";
-- Devrait être égal au nombre d'entreprises

-- 9. Vérifier l'intégrité des données migrées
SELECT 
  c.id,
  c.name,
  c.ville as old_ville,
  cl.city as new_city,
  cl.isPrimary
FROM "Company" c
LEFT JOIN "CompanyLocation" cl ON cl."companyId" = c.id
WHERE c.ville IS NOT NULL
LIMIT 10;
-- Les valeurs ville et city devraient correspondre

-- 10. Statistiques globales
SELECT 
  (SELECT COUNT(*) FROM "User") as total_users,
  (SELECT COUNT(*) FROM "UserProfile") as total_profiles,
  (SELECT COUNT(*) FROM "Company") as total_companies,
  (SELECT COUNT(*) FROM "CompanyLocation") as total_locations,
  (SELECT COUNT(*) FROM "Review") as total_reviews,
  (SELECT COUNT(*) FROM "CompanyScore") as total_scores,
  (SELECT COUNT(*) FROM "Subscription") as total_subscriptions;
```

## 4. Tests fonctionnels avec Prisma Studio

```bash
cd backend
npx prisma studio
```

Dans Prisma Studio, vérifiez:

1. **UserProfile**: Peut créer un profil avec différents `profileType`
2. **CompanyLocation**: Les données de localisation sont correctement migrées
3. **RatingCriteria**: Les 5 critères par défaut existent
4. **CompanyScore**: Chaque entreprise a un score
5. **Subscription**: Chaque entreprise a un abonnement FREE

## 5. Tests API avec cURL ou Postman

### 5.1 Test de création d'entreprise avec localisation

```bash
curl -X POST http://localhost:3000/api/companies \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Company SARL",
    "slug": "test-company-sarl",
    "description": "Entreprise de test",
    "categoryId": 1,
    "ninea": "123456789",
    "rccm": "SN-DKR-2024-B-12345",
    "size": "PME",
    "locations": [{
      "region": "Dakar",
      "city": "Dakar",
      "address": "Rue 123, Plateau"
    }]
  }'
```

### 5.2 Test de création d'avis avec scores multi-critères

```bash
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 4,
    "comment": "Excellent service",
    "userId": 1,
    "companyId": 1,
    "context": "CLIENT",
    "scores": [
      {"criteriaId": 1, "score": 5},
      {"criteriaId": 2, "score": 4},
      {"criteriaId": 3, "score": 4},
      {"criteriaId": 4, "score": 4},
      {"criteriaId": 5, "score": 5}
    ]
  }'
```

### 5.3 Test de récupération des critères de notation

```bash
curl http://localhost:3000/api/rating-criteria
```

### 5.4 Test de filtrage des avis par contexte

```bash
curl http://localhost:3000/api/companies/1/reviews?context=CLIENT
curl http://localhost:3000/api/companies/1/reviews?context=EMPLOYEE
```

### 5.5 Test de revendication d'entreprise

```bash
curl -X POST http://localhost:3000/api/companies/1/claim \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 6. Tests de performance

### 6.1 Index vérifications

```sql
-- Vérifier que tous les index ont été créés
SELECT 
  tablename, 
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN (
  'User', 'UserProfile', 'Company', 'CompanyLocation',
  'Category', 'CategoryKeyword', 'Review', 'ReviewScore',
  'RatingCriteria', 'CompanyScore', 'Subscription', 'Advertisement'
)
ORDER BY tablename, indexname;
```

### 6.2 Test de performance de recherche géographique

```sql
-- Temps d'exécution de la recherche par région
EXPLAIN ANALYZE
SELECT c.*, cl.*
FROM "Company" c
INNER JOIN "CompanyLocation" cl ON cl."companyId" = c.id
WHERE cl.region = 'Dakar'
AND cl.isPrimary = true;
```

### 6.3 Test de performance du calcul de scores

```sql
-- Temps de calcul du score moyen par critère
EXPLAIN ANALYZE
SELECT 
  rc.name,
  AVG(rs.score) as avg_score,
  COUNT(*) as total_ratings
FROM "ReviewScore" rs
INNER JOIN "RatingCriteria" rc ON rc.id = rs."criteriaId"
INNER JOIN "Review" r ON r.id = rs."reviewId"
WHERE r.status = 'APPROVED'
GROUP BY rc.id, rc.name;
```

## 7. Tests d'intégrité référentielle

```sql
-- 1. Vérifier qu'il n'y a pas de UserProfile orphelins
SELECT COUNT(*) FROM "UserProfile" up
WHERE NOT EXISTS (
  SELECT 1 FROM "User" u WHERE u.id = up."userId"
);
-- Devrait retourner 0

-- 2. Vérifier qu'il n'y a pas de CompanyLocation orphelines
SELECT COUNT(*) FROM "CompanyLocation" cl
WHERE NOT EXISTS (
  SELECT 1 FROM "Company" c WHERE c.id = cl."companyId"
);
-- Devrait retourner 0

-- 3. Vérifier qu'il n'y a pas de ReviewScore orphelins
SELECT COUNT(*) FROM "ReviewScore" rs
WHERE NOT EXISTS (
  SELECT 1 FROM "Review" r WHERE r.id = rs."reviewId"
);
-- Devrait retourner 0

-- 4. Vérifier la cohérence des scores globaux
SELECT 
  c.name,
  cs."globalScore" as stored_score,
  AVG(r.rating) as calculated_score,
  ABS(cs."globalScore" - AVG(r.rating)) as difference
FROM "Company" c
INNER JOIN "CompanyScore" cs ON cs."companyId" = c.id
LEFT JOIN "Review" r ON r."companyId" = c.id AND r.status = 'APPROVED'
GROUP BY c.id, c.name, cs."globalScore"
HAVING COUNT(r.id) > 0
AND ABS(cs."globalScore" - AVG(r.rating)) > 0.1;
-- Devrait idéalement retourner 0 lignes (ou très peu)
```

## 8. Scénarios de test fonctionnels

### Scénario 1: Cycle de vie d'un avis

```sql
-- 1. Créer un avis (status = PENDING par défaut)
INSERT INTO "Review" (rating, comment, "userId", "companyId", context, status, upvotes, downvotes, "createdAt", "updatedAt")
VALUES (4, 'Bon service', 1, 1, 'CLIENT', 'PENDING', 0, 0, NOW(), NOW())
RETURNING id;

-- 2. Ajouter des scores détaillés
INSERT INTO "ReviewScore" ("reviewId", "criteriaId", score, "createdAt")
VALUES 
  (LAST_INSERT_ID, 1, 4),
  (LAST_INSERT_ID, 2, 3),
  (LAST_INSERT_ID, 3, 5);

-- 3. Approuver l'avis
UPDATE "Review" SET status = 'APPROVED' WHERE id = LAST_INSERT_ID;

-- 4. Vérifier que le score de l'entreprise a été mis à jour
SELECT * FROM "CompanyScore" WHERE "companyId" = 1;
```

### Scénario 2: Revendication d'entreprise

```sql
-- 1. Vérifier qu'une entreprise n'est pas revendiquée
SELECT name, "isVerified", "claimedByUserId" 
FROM "Company" 
WHERE id = 1;

-- 2. Revendiquer l'entreprise
UPDATE "Company" 
SET "claimedByUserId" = 1
WHERE id = 1 
AND "claimedByUserId" IS NULL;

-- 3. Vérifier la revendication
SELECT c.name, u.username as claimed_by
FROM "Company" c
LEFT JOIN "User" u ON u.id = c."claimedByUserId"
WHERE c.id = 1;
```

### Scénario 3: Upgrade d'abonnement

```sql
-- 1. Vérifier l'abonnement actuel
SELECT plan, "isActive", "endDate"
FROM "Subscription"
WHERE "companyId" = 1;

-- 2. Upgrader vers PRO (30 jours)
UPDATE "Subscription"
SET 
  plan = 'PRO',
  "endDate" = NOW() + INTERVAL '30 days',
  "isActive" = true,
  "updatedAt" = NOW()
WHERE "companyId" = 1;

-- 3. Vérifier l'upgrade
SELECT * FROM "Subscription" WHERE "companyId" = 1;
```

## 9. Tests de rollback (optionnel)

Si vous devez annuler la migration:

```sql
-- ATTENTION: Ceci supprimera toutes les nouvelles données
-- Sauvegarder d'abord si nécessaire

-- Supprimer les nouvelles tables
DROP TABLE IF EXISTS "ReviewScore" CASCADE;
DROP TABLE IF EXISTS "RatingCriteria" CASCADE;
DROP TABLE IF EXISTS "CompanyScore" CASCADE;
DROP TABLE IF EXISTS "Subscription" CASCADE;
DROP TABLE IF EXISTS "CompanyLocation" CASCADE;
DROP TABLE IF EXISTS "CategoryKeyword" CASCADE;
DROP TABLE IF EXISTS "UserProfile" CASCADE;

-- Supprimer les nouveaux champs
ALTER TABLE "User" DROP COLUMN IF EXISTS "phone";
ALTER TABLE "User" DROP COLUMN IF EXISTS "isVerified";

ALTER TABLE "Company" DROP COLUMN IF EXISTS "ninea";
ALTER TABLE "Company" DROP COLUMN IF EXISTS "rccm";
ALTER TABLE "Company" DROP COLUMN IF EXISTS "size";
ALTER TABLE "Company" DROP COLUMN IF EXISTS "isVerified";
ALTER TABLE "Company" DROP COLUMN IF EXISTS "claimedByUserId";

ALTER TABLE "Review" DROP COLUMN IF EXISTS "context";
ALTER TABLE "Review" DROP COLUMN IF EXISTS "status";

ALTER TABLE "Category" DROP COLUMN IF EXISTS "parentId";

ALTER TABLE "Advertisement" DROP COLUMN IF EXISTS "type";
ALTER TABLE "Advertisement" DROP COLUMN IF EXISTS "status";

-- Supprimer les nouveaux types ENUM
DROP TYPE IF EXISTS "ProfileType";
DROP TYPE IF EXISTS "CompanySize";
DROP TYPE IF EXISTS "ReviewContext";
DROP TYPE IF EXISTS "ReviewStatus";
DROP TYPE IF EXISTS "SubscriptionPlan";
DROP TYPE IF EXISTS "AdvertisementType";
DROP TYPE IF EXISTS "AdvertisementStatus";

-- Restaurer depuis le backup
-- psql -U postgres -d echowork_db < backup_YYYYMMDD_HHMMSS.sql
```

## 10. Monitoring post-migration

### 10.1 Créer des vues pour le monitoring

```sql
-- Vue: Statistiques globales
CREATE OR REPLACE VIEW stats_overview AS
SELECT 
  (SELECT COUNT(*) FROM "User") as total_users,
  (SELECT COUNT(*) FROM "Company") as total_companies,
  (SELECT COUNT(*) FROM "Review" WHERE status = 'APPROVED') as approved_reviews,
  (SELECT COUNT(*) FROM "Review" WHERE status = 'PENDING') as pending_reviews,
  (SELECT COUNT(*) FROM "Company" WHERE "isVerified" = true) as verified_companies,
  (SELECT COUNT(*) FROM "Company" WHERE "claimedByUserId" IS NOT NULL) as claimed_companies,
  (SELECT AVG("globalScore") FROM "CompanyScore") as avg_global_score,
  (SELECT AVG("trustScore") FROM "UserProfile") as avg_trust_score;

-- Vue: Top entreprises par score
CREATE OR REPLACE VIEW top_companies AS
SELECT 
  c.name,
  c."isVerified",
  cs."globalScore",
  cs."trustIndex",
  cs."totalReviews",
  cat.name as category
FROM "Company" c
INNER JOIN "CompanyScore" cs ON cs."companyId" = c.id
INNER JOIN "Category" cat ON cat.id = c."categoryId"
WHERE cs."totalReviews" >= 3
ORDER BY cs."globalScore" DESC, cs."trustIndex" DESC
LIMIT 20;

-- Vue: Distribution des avis par contexte
CREATE OR REPLACE VIEW reviews_by_context AS
SELECT 
  context,
  COUNT(*) as count,
  AVG(rating) as avg_rating
FROM "Review"
WHERE status = 'APPROVED'
GROUP BY context;

-- Utiliser les vues
SELECT * FROM stats_overview;
SELECT * FROM top_companies;
SELECT * FROM reviews_by_context;
```

## 11. Checklist de validation finale

- [ ] Toutes les migrations ont été appliquées sans erreur
- [ ] Le client Prisma a été régénéré
- [ ] Tous les nouveaux types ENUM existent
- [ ] Toutes les nouvelles tables existent
- [ ] Les données existantes ont été migrées (ville → CompanyLocation)
- [ ] Les critères de notation par défaut sont présents
- [ ] Tous les index sont créés
- [ ] Les contraintes de clés étrangères fonctionnent
- [ ] Les tests API de base fonctionnent
- [ ] Aucune erreur dans les logs de l'application
- [ ] Un backup de la base existe
- [ ] La documentation est à jour

## 12. Prochaines étapes après validation

1. **Mettre à jour le code backend** selon BACKEND_IMPLEMENTATION_GUIDE.md
2. **Mettre à jour le code frontend** selon FRONTEND_INTEGRATION_GUIDE.md
3. **Créer des tests unitaires** pour les nouvelles fonctionnalités
4. **Créer des tests d'intégration** pour les workflows complets
5. **Configurer le monitoring** en production
6. **Former l'équipe** sur les nouvelles fonctionnalités
7. **Communiquer** avec les utilisateurs sur les nouvelles features
