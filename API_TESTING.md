# API Testing Guide

This document provides test cases and examples for testing the new company database and category APIs.

## Prerequisites

Before testing, ensure:
1. PostgreSQL database is running
2. Database has been migrated (`npm run prisma:migrate`)
3. Database has been seeded (`npm run prisma:seed`)
4. Backend server is running (`npm run start:dev` in backend directory)

## Test Environment

- Backend URL: `http://localhost:3000`
- API Base: `http://localhost:3000/api`

## Manual Testing with cURL

### 1. Test Categories List

**Request:**
```bash
curl -X GET http://localhost:3000/api/categories
```

**Expected Response:**
- Status: 200 OK
- Body: Array of categories with id, name, and slug

**Example Response:**
```json
[
  {
    "id": 1,
    "name": "Énergie et Pétrole",
    "slug": "energie-et-petrole"
  },
  {
    "id": 2,
    "name": "Commerce et Distribution",
    "slug": "commerce-et-distribution"
  }
]
```

**Validation:**
- ✓ Returns array
- ✓ Each category has id, name, slug
- ✓ Should have 10+ categories

### 2. Test Category Details

**Request:**
```bash
curl -X GET http://localhost:3000/api/categories/1
```

**Expected Response:**
- Status: 200 OK
- Body: Category details with topCompanies, jobOffers, advertisements, and kpis

**Example Response:**
```json
{
  "category": {
    "id": 1,
    "name": "Énergie et Pétrole",
    "slug": "energie-et-petrole"
  },
  "topCompanies": [
    {
      "id": 1,
      "name": "Total Senegal",
      "ville": "Dakar",
      "tel": "33 839 54 54",
      "averageRating": 0,
      "reviewCount": 0,
      "reviews": []
    }
  ],
  "jobOffers": [],
  "advertisements": [],
  "kpis": {
    "totalCompanies": 160,
    "totalReviews": 0,
    "totalJobOffers": 0,
    "averageRating": 0,
    "reviewDistribution": {
      "5": 0,
      "4": 0,
      "3": 0,
      "2": 0,
      "1": 0
    }
  }
}
```

**Validation:**
- ✓ Returns category object
- ✓ topCompanies array exists (max 10 items)
- ✓ Each company has ville, adresse, tel, activite fields
- ✓ jobOffers array exists
- ✓ advertisements array exists
- ✓ kpis object with all metrics exists
- ✓ reviewDistribution shows counts for each rating (1-5)

### 3. Test Category Search

**Request:**
```bash
curl -X GET "http://localhost:3000/api/categories/1/search?q=dakar"
```

**Expected Response:**
- Status: 200 OK
- Body: Array of companies matching search query

**Example Response:**
```json
[
  {
    "id": 1,
    "name": "Total Senegal",
    "slug": "total-senegal",
    "ville": "Dakar",
    "adresse": "BCCD",
    "tel": "33 839 54 54",
    "activite": "Vente De Produits Petroliers",
    "averageRating": 0,
    "reviewCount": 0,
    "category": {
      "id": 1,
      "name": "Énergie et Pétrole",
      "slug": "energie-et-petrole"
    }
  }
]
```

**Validation:**
- ✓ Returns array of companies
- ✓ Companies match search query (in name, ville, activite, or adresse)
- ✓ Each company includes category information
- ✓ averageRating and reviewCount are calculated

### 4. Test Invalid Category ID

**Request:**
```bash
curl -X GET http://localhost:3000/api/categories/99999
```

**Expected Response:**
- Status: 404 Not Found
- Body: Error message

**Example Response:**
```json
{
  "statusCode": 404,
  "message": "Category with ID 99999 not found"
}
```

### 5. Test Empty Search Query

**Request:**
```bash
curl -X GET "http://localhost:3000/api/categories/1/search?q="
```

**Expected Response:**
- Status: 200 OK
- Body: Array of all companies in category (same as no filter)

## Testing with Postman/Insomnia

### Import Collection

Create a collection with these requests:

1. **Get All Categories**
   - Method: GET
   - URL: `{{base_url}}/api/categories`

2. **Get Category Details**
   - Method: GET
   - URL: `{{base_url}}/api/categories/{{category_id}}`
   - Path Variable: `category_id` = 1

3. **Search in Category**
   - Method: GET
   - URL: `{{base_url}}/api/categories/{{category_id}}/search`
   - Query Param: `q` = "dakar"
   - Path Variable: `category_id` = 1

Environment variables:
- `base_url`: `http://localhost:3000/api`
- `category_id`: `1`

## Automated Testing Scenarios

### Test Case 1: Category List Structure

```javascript
// Expected behavior
const response = await fetch('http://localhost:3000/api/categories');
const categories = await response.json();

// Assertions
expect(response.status).toBe(200);
expect(Array.isArray(categories)).toBe(true);
expect(categories.length).toBeGreaterThan(0);
expect(categories[0]).toHaveProperty('id');
expect(categories[0]).toHaveProperty('name');
expect(categories[0]).toHaveProperty('slug');
```

### Test Case 2: Category Details Structure

```javascript
const response = await fetch('http://localhost:3000/api/categories/1');
const data = await response.json();

// Assertions
expect(response.status).toBe(200);
expect(data).toHaveProperty('category');
expect(data).toHaveProperty('topCompanies');
expect(data).toHaveProperty('jobOffers');
expect(data).toHaveProperty('advertisements');
expect(data).toHaveProperty('kpis');

// KPIs structure
expect(data.kpis).toHaveProperty('totalCompanies');
expect(data.kpis).toHaveProperty('totalReviews');
expect(data.kpis).toHaveProperty('totalJobOffers');
expect(data.kpis).toHaveProperty('averageRating');
expect(data.kpis).toHaveProperty('reviewDistribution');

// Top companies have new fields
if (data.topCompanies.length > 0) {
  const company = data.topCompanies[0];
  expect(company).toHaveProperty('ville');
  expect(company).toHaveProperty('adresse');
  expect(company).toHaveProperty('tel');
  expect(company).toHaveProperty('activite');
}
```

### Test Case 3: Search Functionality

```javascript
const response = await fetch('http://localhost:3000/api/categories/1/search?q=dakar');
const results = await response.json();

// Assertions
expect(response.status).toBe(200);
expect(Array.isArray(results)).toBe(true);

// Each result should match search query
results.forEach(company => {
  const searchableText = `${company.name} ${company.ville} ${company.activite} ${company.adresse}`.toLowerCase();
  expect(searchableText).toContain('dakar');
});
```

## Performance Testing

### Load Test Category Endpoint

Test with multiple concurrent requests:

```bash
# Using Apache Bench (ab)
ab -n 100 -c 10 http://localhost:3000/api/categories/1

# Expected:
# - Response time < 500ms for 95% of requests
# - No failed requests
# - Handles 10 concurrent connections smoothly
```

### Database Query Performance

Monitor Prisma query performance:

```bash
# In backend/.env, add:
DEBUG=prisma:query

# Run server and watch query execution times
npm run start:dev

# Queries should complete in < 100ms for category details
```

## Integration Testing Checklist

- [ ] All categories are returned
- [ ] Category count matches seeded data (10 categories)
- [ ] Total companies across all categories = 2,608
- [ ] Category details include all required sections
- [ ] Top companies are sorted by rating
- [ ] Search returns relevant results
- [ ] Search is case-insensitive
- [ ] Invalid category ID returns 404
- [ ] Empty search query returns all companies
- [ ] New company fields (ville, adresse, tel, activite) are populated
- [ ] KPIs calculate correctly
- [ ] Review distribution sums correctly
- [ ] No N+1 query issues (check Prisma logs)

## Common Issues and Solutions

### Issue: "Cannot reach database"
**Solution:** Start PostgreSQL: `docker-compose up -d db` in backend directory

### Issue: "No categories found"
**Solution:** Run seed script: `npm run prisma:seed` in backend directory

### Issue: "Companies missing new fields"
**Solution:** Run migration: `npm run prisma:migrate` in backend directory

### Issue: "Wrong company count in KPIs"
**Solution:** Check if all companies were seeded. Verify in Prisma Studio.

### Issue: "Search returns no results"
**Solution:** Check if search query matches any company data. Try "dakar" or "commerce".

## Test Data Verification

After seeding, verify using Prisma Studio:

```bash
cd backend
npm run prisma:studio
```

Check:
1. **Categories table**: Should have 10 entries
2. **Company table**: Should have 2,608 entries
3. **Company fields**: All should have ville, activite populated
4. **Category distribution**: Match expected counts (e.g., 2,190 in Commerce et Distribution)

## Next Steps

After manual testing succeeds:
1. Create automated test suite (Jest + Supertest)
2. Add integration tests for all endpoints
3. Set up CI/CD pipeline to run tests
4. Add load testing to performance suite
5. Implement monitoring for API response times
