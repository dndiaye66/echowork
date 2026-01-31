# Database Seeding Guide

This guide will help you set up and seed the ECHOWORK database with companies and categories.

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+ (or Docker)
- Git

## Quick Start

### 1. Start PostgreSQL Database

You have two options to run PostgreSQL:

#### Option A: Using Docker (Recommended)
```bash
cd backend
docker compose up -d db
```

This will start PostgreSQL on port 5432 with the following credentials:
- Database: `echowork_db`
- User: `postgres`
- Password: `password`

#### Option B: Using Local PostgreSQL
If you prefer to use a local PostgreSQL installation, make sure it's running and update the `DATABASE_URL` in `backend/.env`:
```env
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/echowork_db?schema=public"
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Generate Prisma Client

```bash
npm run prisma:generate
```

### 4. Run Database Migrations

```bash
npx prisma migrate deploy
```

This will create all the necessary tables in your database.

### 5. Seed the Database

You can seed the database using either of these commands:

**Method 1: Using Prisma CLI (Recommended)**
```bash
npx prisma db seed
```

**Method 2: Using npm script**
```bash
npm run prisma:seed
```

Both commands will:
- Load 2,608 companies from `backend/prisma/data/companies-categorized.json`
- Create 10 unique categories
- Populate the database with all companies and their information

Expected output:
```
Starting database seeding...
Loaded 2608 companies from JSON
Found 10 unique categories
✓ Category: Énergie et Pétrole (ID: 1)
✓ Category: Commerce et Distribution (ID: 2)
...
Progress: 100 companies created...
...
=== Seeding Complete ===
✓ Created: 2608 companies
⚠ Skipped: 0 companies
✗ Errors: 0 companies
📊 Total categories: 10

🌱  The seed command has been executed.
```

### 6. Create Super Admin User (Optional)

```bash
npm run create:admin
```

This creates a super-admin account with:
- **Email**: admin@echowork.com
- **Username**: superadmin
- **Password**: Admin@2024!Echowork
- **Role**: ADMIN

⚠️ **Important**: Change the password after first login!

### 7. Start the Backend Server

```bash
npm run start:dev
```

The server will start on http://localhost:3000

## Verify Database Seeding

### Check with Prisma Studio (GUI)
```bash
npx prisma studio
```

This opens a web interface at http://localhost:5555 where you can browse your data.

### Check with SQL Queries
```bash
PGPASSWORD=password psql -h localhost -U postgres -d echowork_db
```

Then run:
```sql
-- Count companies
SELECT COUNT(*) FROM "Company";

-- Count categories
SELECT COUNT(*) FROM "Category";

-- View sample companies
SELECT name, ville, activite FROM "Company" LIMIT 10;

-- View all categories
SELECT id, name, slug FROM "Category";
```

## Test API Endpoints

Once the backend is running, you can test the API:

```bash
# Get all categories
curl http://localhost:3000/api/categories

# Get best companies
curl http://localhost:3000/api/home/best-companies

# Get all companies
curl http://localhost:3000/api/companies

# Get companies by category slug
curl http://localhost:3000/api/companies/category/slug/commerce-et-distribution
```

## Troubleshooting

### Error: "No seed command configured"

This error occurs if the `prisma` section is missing from `backend/package.json`. The package.json should include:

```json
{
  "prisma": {
    "seed": "ts-node-dev prisma/seed.ts"
  }
}
```

This has been added to the project, so you should not see this error.

### Error: "Database not found"

Make sure PostgreSQL is running and the database exists:
```bash
# With Docker
docker compose ps

# Check if PostgreSQL is accepting connections
pg_isready -h localhost -p 5432
```

### Error: "Cannot find module"

Install dependencies:
```bash
cd backend
npm install
```

### Error: "Connection refused"

1. Check if PostgreSQL is running:
   ```bash
   docker compose ps
   # OR for local PostgreSQL
   sudo systemctl status postgresql
   ```

2. Check if the backend server is running:
   ```bash
   # Look for process on port 3000
   lsof -i :3000
   # OR
   netstat -tlnp | grep 3000
   ```

3. Verify the `DATABASE_URL` in `backend/.env` matches your PostgreSQL configuration.

### Seed Data Location

The seed data is located at:
- **File**: `backend/prisma/data/companies-categorized.json`
- **Size**: ~750KB
- **Companies**: 2,608
- **Categories**: 10 unique categories

## Database Schema

The database includes the following main models:

- **User** - User accounts with authentication
- **UserProfile** - User profiles with trust scores
- **Category** - Business categories (hierarchical)
- **Company** - Company information (name, address, phone, etc.)
- **CompanyLocation** - Multi-location support for companies
- **Review** - User reviews for companies
- **ReviewScore** - Multi-dimensional review scoring
- **CompanyScore** - Aggregated company metrics
- **Subscription** - Company subscription plans
- **Advertisement** - Platform advertisements
- **JobOffer** - Job postings

For more details, see:
- `backend/prisma/schema.prisma` - Full database schema
- `DATABASE_ARCHITECTURE_DIAGRAM.md` - Visual diagrams
- `DATABASE_RESTRUCTURATION.md` - Detailed architecture

## Next Steps

1. Start the frontend development server (from project root):
   ```bash
   npm install
   npm run dev
   ```

2. Access the application:
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:3000/api
   - **Prisma Studio**: http://localhost:5555 (if running)
   - **Adminer** (DB GUI): http://localhost:8080 (if using Docker)

3. Login with the super-admin account to access the admin dashboard at `/admin`

## Additional Resources

- [README.md](README.md) - Main project documentation
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Quick reference guide
- [BACKEND_IMPLEMENTATION_GUIDE.md](BACKEND_IMPLEMENTATION_GUIDE.md) - Backend API guide
- [ADMIN_BACKOFFICE_GUIDE.md](ADMIN_BACKOFFICE_GUIDE.md) - Admin panel guide
