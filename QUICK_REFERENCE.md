# 📋 Quick Reference - ECHOWORK Database Restructuring

## 🎯 What Changed?

### New Database Models (7)
1. **UserProfile** - User trust scores and profile types
2. **CompanyLocation** - Multi-location support with GPS
3. **CategoryKeyword** - Enhanced search capabilities
4. **RatingCriteria** - Pre-defined weighted rating criteria
5. **ReviewScore** - Multi-dimensional review scoring
6. **CompanyScore** - Aggregated company metrics
7. **Subscription** - Monetization system

### Enhanced Models (5)
1. **User** - Added: phone, isVerified, MODERATOR role
2. **Company** - Added: ninea, rccm, size, isVerified, claimedByUserId
3. **Category** - Added: parentId (hierarchy support)
4. **Review** - Added: context, status (moderation)
5. **Advertisement** - Added: type, status

### New ENUMs (8)
- ProfileType: CLIENT, EMPLOYEE, SUPPLIER, OTHER
- CompanySize: TPE, PME, GRANDE
- ReviewContext: CLIENT, EMPLOYEE, SUPPLIER, OTHER
- ReviewStatus: PENDING, APPROVED, REJECTED
- SubscriptionPlan: FREE, PRO, PREMIUM
- AdvertisementType: BANNER, SPONSORED
- AdvertisementStatus: ACTIVE, PAUSED, ENDED
- UserRole: Added MODERATOR

## 📁 Files You Need to Know

### Critical Files
```
backend/prisma/schema.prisma                    ← New database schema
backend/prisma/migrations/.../migration.sql     ← Migration script
```

### Documentation (Read in Order)
```
1. RESTRUCTURATION_SUMMARY.md           ← Start here (executive summary)
2. DATABASE_RESTRUCTURATION.md          ← Understand the architecture
3. DATABASE_ARCHITECTURE_DIAGRAM.md     ← Visual diagrams
4. TESTING_VALIDATION_GUIDE.md          ← How to test the migration
5. BACKEND_IMPLEMENTATION_GUIDE.md      ← Backend code examples
6. FRONTEND_INTEGRATION_GUIDE.md        ← Frontend components
```

## 🚀 Quick Start

### 1. Migration Steps
```bash
# Backup first!
pg_dump -U postgres -d echowork_db > backup.sql

# Run migration
cd backend
npx prisma migrate deploy

# Or manually
psql -U postgres -d echowork_db -f prisma/migrations/.../migration.sql

# Regenerate client
npm run prisma:generate
```

### 2. Validate Migration
```sql
-- Check new tables exist
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Check data migrated
SELECT COUNT(*) FROM "CompanyLocation";
SELECT COUNT(*) FROM "CompanyScore";
SELECT COUNT(*) FROM "Subscription";

-- Check rating criteria
SELECT * FROM "RatingCriteria";
```

### 3. Test Basic Functionality
```bash
# Start Prisma Studio
npx prisma studio

# Test API (if running)
curl http://localhost:3000/api/rating-criteria
```

## 🔑 Key Concepts

### Trust Score (0-1)
- Increases with: account age, verified reviews, account verification
- Formula: (reviews×5 + days/10 + verified×20) / 100

### Global Score (0-5)
- Weighted average across all rating criteria
- Formula: Σ(score × weight) / Σ(weight)

### Trust Index (0-1)
- Based on number of reviews
- Formula: min(totalReviews / 10, 1.0)

### Review Lifecycle
```
PENDING → APPROVED → Update Scores
        ↓
      REJECTED
```

## 📊 Default Data Created

### Rating Criteria (5)
1. Qualité du service (weight: 1.5)
2. Prix (weight: 1.0)
3. Transparence (weight: 1.3)
4. Respect des délais (weight: 1.2)
5. Service client (weight: 1.4)

### For Each Company
- ✅ CompanyScore (initialized)
- ✅ Subscription (FREE plan)
- ✅ CompanyLocation (if had ville/adresse)

## 🔍 Common Queries

### Get Company with Full Details
```sql
SELECT 
  c.*,
  cs.*,
  json_agg(cl.*) as locations
FROM "Company" c
LEFT JOIN "CompanyScore" cs ON cs."companyId" = c.id
LEFT JOIN "CompanyLocation" cl ON cl."companyId" = c.id
WHERE c.slug = 'company-slug'
GROUP BY c.id, cs.id;
```

### Get Reviews by Context
```sql
SELECT r.*, u.username
FROM "Review" r
JOIN "User" u ON u.id = r."userId"
WHERE r."companyId" = 1
AND r.context = 'EMPLOYEE'
AND r.status = 'APPROVED';
```

### Get Top Companies
```sql
SELECT c.name, cs."globalScore", cs."trustIndex"
FROM "Company" c
JOIN "CompanyScore" cs ON cs."companyId" = c.id
WHERE cs."totalReviews" >= 5
ORDER BY cs."globalScore" DESC, cs."trustIndex" DESC
LIMIT 10;
```

## 🛠️ Common Tasks

### Create Review with Scores
```typescript
await prisma.review.create({
  data: {
    rating: 4,
    comment: 'Great service',
    userId: 1,
    companyId: 1,
    context: 'CLIENT',
    status: 'PENDING',
    scores: {
      create: [
        { criteriaId: 1, score: 5 },
        { criteriaId: 2, score: 4 },
        { criteriaId: 3, score: 4 }
      ]
    }
  }
});
```

### Claim Company
```typescript
await prisma.company.update({
  where: { id: companyId },
  data: { claimedByUserId: userId }
});
```

### Update Company Score
```typescript
const reviews = await prisma.review.findMany({
  where: { companyId, status: 'APPROVED' },
  include: { scores: { include: { criteria: true } } }
});

const globalScore = calculateWeightedAverage(reviews);

await prisma.companyScore.update({
  where: { companyId },
  data: {
    globalScore,
    totalReviews: reviews.length,
    trustIndex: Math.min(reviews.length / 10, 1.0)
  }
});
```

## ⚠️ Important Notes

### Backwards Compatibility
- ✅ Old fields (ville, adresse) still exist
- ✅ All existing data preserved
- ✅ New fields have defaults
- ✅ Can rollback if needed

### Required Actions
1. Regenerate Prisma client after migration
2. Update services to use new fields
3. Implement moderation workflow
4. Set up score recalculation cron

### Don't Forget
- [ ] Backup before migrating
- [ ] Test in staging first
- [ ] Update API documentation
- [ ] Train team on new features
- [ ] Configure cron jobs

## 📞 Quick Help

### Issue: Migration fails
→ Check database connection
→ Verify PostgreSQL version (17+)
→ Check for conflicting data

### Issue: Client not updated
→ Run `npm run prisma:generate`
→ Restart TypeScript server

### Issue: Missing data
→ Check migration logs
→ Verify data migration queries
→ Restore from backup if needed

## 🎯 Next Actions

### Immediate
1. ✅ Run migration in staging
2. ✅ Validate with test queries
3. ⏳ Update backend services

### Short-term
4. ⏳ Create moderation interface
5. ⏳ Implement score calculations
6. ⏳ Update frontend components

### Long-term
7. ⏳ Add analytics dashboard
8. ⏳ Implement payment system
9. ⏳ Expand to West Africa

---

**Need detailed info?** See the full documentation files above.

**Found a bug?** Check TESTING_VALIDATION_GUIDE.md for debugging.

**Ready to code?** See BACKEND_IMPLEMENTATION_GUIDE.md and FRONTEND_INTEGRATION_GUIDE.md.
