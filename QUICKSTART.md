# Quick Start Guide

Get the company database and category APIs up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Docker (for PostgreSQL) or PostgreSQL installed locally

## Step 1: Clone and Install (1 min)

```bash
git clone https://github.com/dndiaye66/echowork.git
cd echowork/backend
npm install
```

## Step 2: Start Database (30 seconds)

```bash
# Start PostgreSQL with Docker
docker-compose up -d db

# Wait for database to be ready
sleep 5
```

## Step 3: Setup Database (2 min)

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database with 2,608 companies
npm run prisma:seed
```

You should see:
```
✓ Created: 2608 companies
📊 Total categories: 10
```

## Step 4: Start Backend (30 seconds)

```bash
npm run start:dev
```

Backend now running at http://localhost:3000

## Step 5: Test It! (1 min)

Open a new terminal:

```bash
# List all categories
curl http://localhost:3000/api/categories

# Get category details (Energy & Petroleum)
curl http://localhost:3000/api/categories/1

# Search for companies in Dakar
curl "http://localhost:3000/api/categories/1/search?q=dakar"
```

## ✅ Success!

You now have:
- 2,608 companies in the database
- 10 categories
- 3 working API endpoints
- Full company information (ville, adresse, tel, activite)

## What's in the Database?

**Top Categories:**
- Commerce et Distribution: 2,190 companies
- Services: 166 companies
- Énergie et Pétrole: 160 companies
- Santé et Pharmacie: 24 companies
- Industrie: 20 companies

**Company Fields:**
Every company has:
- Name (Entreprise)
- City (Ville)
- Address (Adresse)
- Phone (Tel)
- Activity/Business Type (Activité)
- Category

## Next Steps

### Explore with Prisma Studio
```bash
npm run prisma:studio
```
Opens a GUI at http://localhost:5555 to browse the database.

### API Documentation
- See `CATEGORY_API.md` for complete API reference
- See `API_TESTING.md` for testing examples

### Frontend Integration
Use the APIs in your React frontend:

```javascript
// Fetch categories
const categories = await fetch('http://localhost:3000/api/categories');

// Get category details
const data = await fetch('http://localhost:3000/api/categories/1');
```

## Troubleshooting

### Database won't start?
```bash
docker-compose down
docker-compose up -d db
```

### Migration fails?
```bash
# Reset database (⚠️ deletes all data)
npx prisma migrate reset
```

### Port 3000 already in use?
Edit `backend/.env` and change PORT to 3001

### Need help?
- Check `MIGRATION_GUIDE.md` for detailed setup
- Check `API_TESTING.md` for API examples
- Check `IMPLEMENTATION_SUMMARY.md` for overview

## Production Deployment

For production:

1. Use a proper PostgreSQL instance
2. Update `DATABASE_URL` in `.env`
3. Run migrations: `npx prisma migrate deploy`
4. Seed once: `npm run prisma:seed`
5. Build: `npm run build`
6. Start: `npm start`

## That's It! 🎉

You've successfully set up the company database with 2,608 companies and the category APIs. The system is ready to use!

For complete documentation, see:
- `CATEGORY_API.md` - API reference
- `MIGRATION_GUIDE.md` - Detailed setup
- `API_TESTING.md` - Testing guide
- `IMPLEMENTATION_SUMMARY.md` - Complete overview
