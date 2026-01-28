# EchoWork Sample Database - Import Guide

## Overview
This guide explains how to import the sample database file (`sample_database.sql`) into your PostgreSQL database.

## What's Included
The SQL file contains comprehensive sample data for testing the EchoWork application:

### Data Summary
- **8 Users** - 1 admin and 7 regular users
- **6 Categories** - banques, restaurants, services-publics, hotels, healthcare, vente-detail
- **29 Companies** - Distributed across all categories:
  - 5 Banks (Banques)
  - 5 Restaurants
  - 4 Public Services (Services publics)
  - 5 Hotels
  - 5 Santé (Healthcare) facilities
  - 5 Retail stores (Vente au détail)
- **30 Reviews** - Reviews with ratings and comments across all companies
- **12 Job Offers** - Active job postings from various companies
- **10 Advertisements** - Active promotional campaigns

## Prerequisites
1. PostgreSQL database must be installed and running
2. Prisma migrations must be executed first to create the database schema
3. Database connection configured in `backend/.env`

## Import Instructions

### Step 1: Ensure Database Schema Exists
First, make sure you've run Prisma migrations to create the tables:

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate dev
```

### Step 2: Import the SQL File

#### Option A: Using psql (Command Line)
```bash
# Navigate to the project root where sample_database.sql is located
cd /path/to/echowork

# Import the SQL file
psql -h localhost -U your_username -d your_database_name -f sample_database.sql
```

#### Option B: Using pgAdmin (GUI)
1. Open pgAdmin
2. Connect to your database
3. Right-click on your database → "Query Tool"
4. Click "Open File" icon
5. Select `sample_database.sql`
6. Click "Execute" (F5)

#### Option C: Using Docker (if using docker-compose)
```bash
# Copy the SQL file into the container
docker cp sample_database.sql echowork-db:/tmp/

# Execute the SQL file
docker exec -i echowork-db psql -U your_username -d your_database_name -f /tmp/sample_database.sql
```

### Step 3: Verify Import
Run these queries to verify the data was imported correctly:

```sql
-- Check categories
SELECT id, name, slug FROM "Category" ORDER BY id;

-- Check companies count by category
SELECT c.name as category, COUNT(co.*) as company_count 
FROM "Category" c 
LEFT JOIN "Company" co ON c.id = co."categoryId" 
GROUP BY c.id, c.name 
ORDER BY c.id;

-- Check users
SELECT id, username, email, role FROM "User" ORDER BY id;

-- Check reviews
SELECT COUNT(*) as total_reviews FROM "Review";

-- Check job offers
SELECT COUNT(*) as total_jobs FROM "JobOffer" WHERE "isActive" = true;

-- Check advertisements
SELECT COUNT(*) as total_ads FROM "Advertisement" WHERE "isActive" = true;
```

## Important Notes

### User Passwords
⚠️ **The passwords in the SQL file are PLACEHOLDERS!**

The SQL file includes user accounts with placeholder password hashes. To use these accounts, you need to:

1. **Generate actual bcrypt hashes** for the password "password123" (or any password you choose)

2. **Using Node.js:**
   ```javascript
   const bcrypt = require('bcrypt');
   const hash = await bcrypt.hash('password123', 10);
   console.log(hash);
   ```

3. **Using an online tool:**
   - Visit a bcrypt generator (e.g., bcrypt-generator.com)
   - Enter your desired password
   - Set rounds to 10
   - Copy the generated hash

4. **Replace placeholders in the SQL file:**
   - Find all instances of `$2b$10$YourHashedPasswordHere#`
   - Replace with your actual bcrypt hash

### Test Accounts
After setting up proper passwords, you can use these test accounts:

- **Admin Account:**
  - Username: `admin`
  - Email: `admin@echowork.sn`
  - Role: ADMIN

- **Regular Users:**
  - `john_doe` (john@example.com)
  - `marie_diop` (marie@example.com)
  - `ousmane_fall` (ousmane@example.com)
  - `awa_ndiaye` (awa@example.com)
  - `fatou_sow` (fatou@example.com)
  - `ibrahima_sy` (ibrahima@example.com)
  - `aissatou_ba` (aissatou@example.com)

## Testing the Application

After importing the data, you can test:

1. **Browse Companies by Category:**
   - Visit the homepage and click on any category
   - Try the "Santé" (Healthcare) category to verify the slug fix
   - Search for specific companies

2. **View Company Details:**
   - Click on any company to see its details
   - View reviews and ratings
   - Check job offers and advertisements

3. **User Authentication:**
   - Create a new account (Sign Up)
   - Login with test accounts (after setting up passwords)
   - Test admin vs regular user permissions

4. **Create Reviews:**
   - Login with a user account
   - Navigate to a company page
   - Add a review with rating and comment
   - Test upvote/downvote functionality

5. **Test Santé (Healthcare) Category Specifically:**
   - Go to `/categories/healthcare`
   - Verify the page loads correctly without the slug validation error
   - Browse the 5 healthcare facilities included in the sample data

## Clearing Data (Optional)

If you want to start fresh, uncomment the TRUNCATE statements at the top of the SQL file:

```sql
TRUNCATE TABLE "Advertisement" CASCADE;
TRUNCATE TABLE "JobOffer" CASCADE;
TRUNCATE TABLE "Review" CASCADE;
TRUNCATE TABLE "Company" CASCADE;
TRUNCATE TABLE "Category" CASCADE;
TRUNCATE TABLE "User" CASCADE;
```

## Troubleshooting

### Error: "relation does not exist"
- Make sure you've run Prisma migrations first
- Verify you're connected to the correct database

### Error: "duplicate key value violates unique constraint"
- The data might already exist in your database
- Either clear existing data first or modify the SQL file to use different IDs

### Password Login Issues
- Remember that password placeholders need to be replaced with actual bcrypt hashes
- Alternatively, create new accounts through the Sign Up page

## Support

If you encounter any issues:
1. Check that all Prisma migrations are up to date
2. Verify your database connection in `.env`
3. Review the PostgreSQL logs for detailed error messages
4. Ensure PostgreSQL version is 14+

---

**Happy Testing!** 🚀
