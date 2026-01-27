# Database Migration and Seeding Instructions

This document provides step-by-step instructions for migrating the database schema and seeding it with company data.

## Prerequisites

- PostgreSQL database running (via Docker or locally)
- Node.js 18+ installed
- Backend dependencies installed (`npm install` in backend directory)

## Steps

### 1. Start the Database

If using Docker (recommended):

```bash
cd backend
docker-compose up -d db
```

This will start PostgreSQL on port 5432.

### 2. Configure Environment Variables

Make sure your `backend/.env` file has the correct database connection string:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/echowork_db?schema=public"
PORT=3000
FRONTEND_URL="http://localhost:5173"
JWT_SECRET="your-secret-key-change-this-in-production"
```

### 3. Generate Prisma Client

```bash
cd backend
npm run prisma:generate
```

This generates the Prisma Client based on the updated schema.

### 4. Create and Apply Migration

```bash
npm run prisma:migrate
```

This will:
1. Create a new migration file for the company field changes
2. Apply the migration to your database
3. Add the new columns: `ville`, `adresse`, `tel`, and `activite` to the Company table

**Migration Details:**
- Adds `ville` (String, optional) - City
- Adds `adresse` (String, optional) - Address
- Adds `tel` (String, optional) - Telephone
- Adds `activite` (String, optional) - Activity/Business type

### 5. Seed the Database

The seed script uses pre-extracted company data located in:
`backend/prisma/data/companies-categorized.json`

This data file is included in the repository, so you can directly seed the database:

```bash
cd backend
npm run prisma:seed
```

This will:
1. Create 10+ categories
2. Import 2,608 companies from the extracted PDF data
3. Associate each company with its appropriate category

**Expected Output:**
```
Starting database seeding...
Loaded 2608 companies from JSON
Found 10 unique categories
✓ Category: Énergie et Pétrole (ID: 1)
✓ Category: Commerce et Distribution (ID: 2)
...
Progress: 100 companies created...
Progress: 200 companies created...
...
=== Seeding Complete ===
✓ Created: 2608 companies
⚠ Skipped: 0 companies
✗ Errors: 0 companies
📊 Total categories: 10
```

### 6. Verify the Data

You can verify the data was imported correctly using Prisma Studio:

```bash
npm run prisma:studio
```

This opens a web interface at http://localhost:5555 where you can browse:
- Categories
- Companies with all their fields (ville, adresse, tel, activite)
- Reviews (if any exist)
- Job Offers
- Advertisements

### 7. Start the Backend Server

```bash
npm run start:dev
```

The API will be available at http://localhost:3000

### 8. Test the APIs

Test the new category endpoints:

```bash
# List all categories
curl http://localhost:3000/api/categories

# Get category details (replace 1 with actual category ID)
curl http://localhost:3000/api/categories/1

# Search in category
curl "http://localhost:3000/api/categories/1/search?q=dakar"
```

## Troubleshooting

### Database Connection Error

If you see "Can't reach database server":
1. Make sure PostgreSQL is running: `docker-compose ps` (in backend directory)
2. Check your DATABASE_URL in `.env`
3. Verify the database exists: `docker exec -it backend-db-1 psql -U postgres -l`

### Migration Conflicts

If you have existing migrations that conflict:
1. Option 1: Reset the database (⚠️ deletes all data):
   ```bash
   npx prisma migrate reset
   ```
2. Option 2: Create a new migration:
   ```bash
   npx prisma migrate dev --name add_company_fields
   ```

### Seed Script Errors

If the seed script fails:
1. Check that `scripts/companies-categorized.json` exists
2. Verify the file format matches the expected structure
3. Check for any database constraint violations in the error message
4. You can re-run the seed script - it uses `upsert` for categories

### TypeScript Errors in Seed Script

If you get TypeScript compilation errors:
1. Make sure ts-node is installed: `npm install --save-dev ts-node @types/node`
2. Check your `tsconfig.json` includes the prisma directory
3. Try running with explicit ts-node: `npx ts-node-dev prisma/seed.ts`

## Rollback

To rollback the migration (⚠️ this will remove the new columns):

```bash
# This is not recommended as it will lose data
npx prisma migrate reset
```

Instead, consider creating a new migration to modify the schema if needed.

## Production Deployment

For production:

1. Use a proper PostgreSQL instance (not Docker for dev)
2. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```
3. Run seed script once:
   ```bash
   npm run prisma:seed
   ```
4. Make sure to backup your database before running migrations

## Data Statistics

After successful seeding, you will have:

- **10 Categories**:
  - Énergie et Pétrole (160 companies)
  - Commerce et Distribution (2,190 companies)
  - Services (166 companies)
  - Santé et Pharmacie (24 companies)
  - Industrie (20 companies)
  - Alimentation et Boissons (18 companies)
  - Télécommunications (10 companies)
  - Construction et BTP (8 companies)
  - Agriculture (8 companies)
  - Automobile (4 companies)

- **2,608 Total Companies** with complete information:
  - Company name (entreprise)
  - City (ville)
  - Address (adresse)
  - Telephone (tel)
  - Activity/Business type (activite)
  - Category assignment

## Next Steps

After successful migration and seeding:

1. Update frontend to use the new company fields
2. Implement the category page UI to display all the information
3. Add search functionality in the category view
4. Consider adding pagination for large result sets
5. Implement caching for frequently accessed category data
