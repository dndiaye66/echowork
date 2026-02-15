# Adding "Établissements d'Enseignement Supérieur" Category

This document describes the addition of a new category for Higher Education Institutions (universities, colleges, and higher education schools) to the EchoWork platform.

## Overview

The new category "Établissements d'Enseignement Supérieur" has been added to allow better categorization and discovery of higher education institutions in Senegal, including:
- Universities (Universités)
- Higher Education Schools (Écoles Supérieures)
- Professional Training Institutes (Instituts de Formation)
- Colleges and Academies

## Category Details

- **Name**: Établissements d'Enseignement Supérieur
- **Slug**: `etablissements-d-enseignement-superieur`
- **ID**: 1 (may vary based on database state)

## Keywords Added

The following keywords have been added to help with automatic categorization and search:

1. université
2. university
3. institut supérieur
4. école supérieure
5. enseignement supérieur
6. higher education
7. formation supérieure
8. académie
9. faculté
10. college

## How to Run

### Adding the Category (First Time)

If you're setting up a new database or need to add this category:

```bash
cd backend
npm run add:education-category
```

This script will:
- Create the category if it doesn't exist
- Add all associated keywords
- Skip if the category already exists (safe to run multiple times)

### Verifying the Category

To verify that the category was added successfully:

```bash
cd backend
npm run verify:categories
```

This will display all categories in the database along with their details.

## API Endpoints

Once added, the category is available through the standard EchoWork API endpoints:

### List All Categories
```bash
GET /api/categories
```

Example response:
```json
[
  {
    "id": 1,
    "name": "Établissements d'Enseignement Supérieur",
    "slug": "etablissements-d-enseignement-superieur",
    "parentId": null
  }
]
```

### Get Category Details
```bash
GET /api/categories/1
```

This returns:
- Top-rated companies in the category
- Active job offers
- Advertisements
- KPIs (total companies, reviews, average rating, etc.)

### Search Within Category
```bash
GET /api/categories/1/search?q=universite
```

## Admin Panel Integration

Administrators can:

1. **Add Companies to this Category**: Via the admin panel at `/api/admin/companies`
2. **Update Category Details**: Via `/api/admin/categories/1`
3. **Add/Remove Keywords**: Via the database or future admin features

## Database Structure

### Category Table
```sql
CREATE TABLE "Category" (
  id        SERIAL PRIMARY KEY,
  name      TEXT NOT NULL,
  slug      TEXT UNIQUE NOT NULL,
  parentId  INTEGER NULL
);
```

### CategoryKeyword Table
```sql
CREATE TABLE "CategoryKeyword" (
  id         SERIAL PRIMARY KEY,
  categoryId INTEGER NOT NULL,
  keyword    TEXT NOT NULL,
  createdAt  TIMESTAMP DEFAULT NOW()
);
```

## Adding Companies to this Category

### Via Admin API

```bash
POST /api/admin/companies
Content-Type: application/json

{
  "name": "Université Cheikh Anta Diop",
  "slug": "universite-cheikh-anta-diop",
  "description": "Principale université publique du Sénégal",
  "categoryId": 1,
  "ville": "Dakar",
  "adresse": "Avenue Cheikh Anta Diop"
}
```

### Via Database Migration

You can also update existing companies to belong to this category:

```sql
UPDATE "Company" 
SET "categoryId" = 1
WHERE name ILIKE '%université%' 
   OR name ILIKE '%institut supérieur%'
   OR activite ILIKE '%enseignement%';
```

## Testing

To test that the category is working correctly:

1. **Start the backend server**:
```bash
cd backend
npm run start:dev
```

2. **Query the API**:
```bash
# List all categories
curl http://localhost:3000/api/categories

# Get category details
curl http://localhost:3000/api/categories/1
```

3. **Expected Results**:
   - The category should appear in the list
   - Category details should return empty arrays for companies, jobs, and ads initially
   - KPIs should show 0 values until companies are added

## Future Enhancements

Potential improvements for this category:

1. **Automatic Categorization**: Update the PDF extraction scripts to automatically assign companies to this category based on keywords
2. **Subcategories**: Add subcategories like:
   - Public Universities
   - Private Universities
   - Technical/Professional Institutes
   - Business Schools
3. **Additional Fields**: Add education-specific fields like:
   - Programs offered
   - Number of students
   - Accreditation status
4. **Integration**: Link with job offers specifically for academic positions

## Related Files

- **Migration Script**: `backend/prisma/add-education-category.ts`
- **Verification Script**: `backend/prisma/verify-category.ts`
- **Package Scripts**: `backend/package.json`
- **Schema**: `backend/prisma/schema.prisma`
- **Categories API**: `backend/src/categories/`
- **Admin API**: `backend/src/admin/`

## Support

If you encounter any issues or have questions about this category:

1. Check the logs: `docker compose logs backend`
2. Verify database connection: `npm run verify:categories`
3. Review the API documentation: `CATEGORY_API.md`

## Changelog

- **2026-02-15**: Initial creation of "Établissements d'Enseignement Supérieur" category
  - Added migration script
  - Added verification script
  - Added npm scripts for easy execution
  - Added 10 keywords for categorization
