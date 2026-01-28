# Companies from PDF Files - Import Guide

## Overview
This guide explains how to import the companies extracted from PDF files into your PostgreSQL database.

## What's Included

### Source Data
- **15 PDF files** containing company information from various sources
- **6,657 unique companies** extracted and deduplicated
- Companies from multiple cities across Senegal

### SQL File: `companies_from_pdfs.sql`
The SQL file contains:
- Complete INSERT statements for all companies
- Batch insertions (100 companies per batch for efficiency)
- Conflict handling to prevent duplicate entries
- Sequence reset after import
- Verification queries

### Company Information Fields
Each company record includes:
- **name**: Company name
- **slug**: URL-friendly unique identifier
- **description**: Business description (derived from activity)
- **ville**: City/location (Dakar, Thiès, Saint-Louis, etc.)
- **adresse**: Physical address (when available)
- **tel**: Phone number (when available)
- **activite**: Business activity/type
- **categoryId**: Set to 1 by default (update as needed)

## Data Statistics

### Extraction Summary
- **Total entries extracted**: 8,092
- **Unique companies after deduplication**: 6,657
- **Cities covered**: 30+ cities across Senegal
- **Primary city**: Dakar (majority of companies)

### Top Cities by Company Count
Companies are distributed across many Senegalese cities including:
- Dakar
- Thiès
- Saint-Louis
- Kaolack
- Ziguinchor
- And many more...

## Import Instructions

### Prerequisites
1. PostgreSQL database must be installed and running
2. Prisma migrations must be executed first to create the database schema
3. Database connection configured in `backend/.env`
4. At least one Category must exist (default categoryId = 1)

### Step 1: Ensure Database Schema Exists
First, make sure you've run Prisma migrations to create the tables:

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate dev
```

### Step 2: Verify Category Exists
The SQL file assigns all companies to `categoryId = 1`. Make sure this category exists:

```sql
-- Check existing categories
SELECT id, name, slug FROM "Category" ORDER BY id;

-- If needed, create a default category
INSERT INTO "Category" (id, name, slug) 
VALUES (1, 'General', 'general')
ON CONFLICT (slug) DO NOTHING;
```

### Step 3: Import the SQL File

#### Option A: Using psql (Command Line)
```bash
# Navigate to the project root where companies_from_pdfs.sql is located
cd /path/to/echowork

# Import the SQL file
psql -h localhost -U your_username -d your_database_name -f companies_from_pdfs.sql
```

#### Option B: Using pgAdmin (GUI)
1. Open pgAdmin
2. Connect to your database
3. Right-click on your database → "Query Tool"
4. Click "Open File" icon
5. Select `companies_from_pdfs.sql`
6. Click "Execute" (F5)

#### Option C: Using Docker (if using docker-compose)
```bash
# Copy the SQL file into the container
docker cp companies_from_pdfs.sql echowork-db:/tmp/

# Execute the SQL file
docker exec -i echowork-db psql -U your_username -d your_database_name -f /tmp/companies_from_pdfs.sql
```

### Step 4: Verify Import
Run these queries to verify the data was imported correctly:

```sql
-- Check total companies
SELECT COUNT(*) as total_companies FROM "Company";

-- Check companies by city (top 10)
SELECT ville, COUNT(*) as count 
FROM "Company" 
GROUP BY ville 
ORDER BY count DESC 
LIMIT 10;

-- Check sample companies
SELECT id, name, ville, activite, tel 
FROM "Company" 
ORDER BY id 
LIMIT 10;

-- Check companies without phone numbers
SELECT COUNT(*) as companies_without_phone 
FROM "Company" 
WHERE tel IS NULL OR tel = '';

-- Check companies without addresses
SELECT COUNT(*) as companies_without_address 
FROM "Company" 
WHERE adresse IS NULL OR adresse = '';
```

## Post-Import Steps

### 1. Categorize Companies
The import assigns all companies to `categoryId = 1`. You should update this to properly categorize companies:

```sql
-- Example: Update companies based on activity keywords

-- Update to Banks category (categoryId = 1)
UPDATE "Company" 
SET "categoryId" = 1 
WHERE activite ILIKE '%banque%' OR activite ILIKE '%credit%';

-- Update to Restaurants category (categoryId = 2)
UPDATE "Company" 
SET "categoryId" = 2 
WHERE activite ILIKE '%restaurant%' OR activite ILIKE '%bar%';

-- Update to Healthcare category (categoryId = 5)
UPDATE "Company" 
SET "categoryId" = 5 
WHERE activite ILIKE '%pharmacie%' 
   OR activite ILIKE '%hospital%' 
   OR activite ILIKE '%clinique%'
   OR activite ILIKE '%sante%'
   OR activite ILIKE '%medical%';

-- Update to Hotels category (categoryId = 4)
UPDATE "Company" 
SET "categoryId" = 4 
WHERE activite ILIKE '%hotel%' OR activite ILIKE '%hotelerie%';

-- Add more UPDATE statements for other categories...
```

### 2. Add Company Images (Optional)
You may want to add images for companies:

```sql
-- Example: Set placeholder image for companies without images
UPDATE "Company" 
SET "imageUrl" = '/images/placeholder-company.jpg' 
WHERE "imageUrl" IS NULL;
```

### 3. Enhance Descriptions (Optional)
Some companies may have generic descriptions. You can enhance them:

```sql
-- Example: Improve descriptions for companies without detailed info
UPDATE "Company" 
SET description = CONCAT(name, ' - ', activite, ' situé à ', ville)
WHERE LENGTH(description) < 30;
```

## Data Quality Notes

### Phone Numbers
- Approximately 70-80% of companies have phone numbers
- Phone formats vary (some with spaces, some without)
- Senegalese phone patterns: 33 XXX XX XX (landline), 7X XXX XX XX (mobile)

### Addresses
- Approximately 60-70% of companies have addresses
- Address formats vary in detail and completeness
- Some addresses are very detailed, others are just neighborhoods

### Activity Descriptions
- All companies have some form of activity description
- Activity descriptions range from general to very specific
- Descriptions are in French

### Duplicate Handling
- Duplicates are identified by matching company name + city
- The SQL file uses `ON CONFLICT (slug) DO NOTHING` to prevent re-insertion
- If you run the import multiple times, existing companies won't be duplicated

## Source PDF Files

The following PDF files were processed to extract company data:
1. `1687521612855.pdf` - 0 companies (not business directory)
2. `1689769182981.pdf` - 3,202 companies extracted
3. `1689770099281.pdf` - 1,436 companies extracted
4. `1689770237874.pdf` - 29 companies extracted
5. `1689770334557.pdf` - 72 companies extracted
6. `1689770850925.pdf` - 466 companies extracted
7. `1689770940206.pdf` - 555 companies extracted
8. `1689771983917.pdf` - 480 companies extracted
9. `1689772093289.pdf` - 248 companies extracted
10. `1689773015990.pdf` - 258 companies extracted
11. `1689773262440.pdf` - 227 companies extracted
12. `1689773379450.pdf` - 209 companies extracted
13. `1689774220883.pdf` - 183 companies extracted
14. `1689774415278.pdf` - 76 companies extracted
15. `1690027763648.pdf` - 651 companies extracted

**Total: 8,092 entries → 6,657 unique companies after deduplication**

## Extraction Script

The Python script `extract_companies_from_pdfs.py` was used to:
1. Parse all PDF files using PyPDF2 library
2. Identify company entries using pattern matching
3. Extract structured data (city, name, activity, address, phone)
4. Clean and normalize text data
5. Remove duplicates
6. Generate unique slugs for each company
7. Create SQL INSERT statements

The script can be re-run if needed to regenerate the SQL file with updated parsing logic.

## Troubleshooting

### Error: "relation does not exist"
- Make sure you've run Prisma migrations first
- Verify you're connected to the correct database

### Error: "duplicate key value violates unique constraint"
- The slug might already exist in your database
- The SQL file uses `ON CONFLICT DO NOTHING` to handle this gracefully
- Existing companies won't be updated, only new ones will be inserted

### Error: "foreign key constraint violation"
- Ensure `categoryId = 1` exists in the Category table
- Create it if missing (see Step 2 above)

### Import is Slow
- The file contains 6,657 INSERT statements in batches
- Importing may take 1-5 minutes depending on your system
- Consider using `COPY` command for faster bulk import if needed

### Some Data Looks Wrong
- The extraction is automated and may not be 100% accurate
- Review the data after import and make corrections as needed
- You can update individual records or re-extract with improved parsing

## Testing the Application

After importing the data, you can test:

1. **Browse Companies:**
   - Visit the homepage and search for companies
   - Filter by city using the search functionality
   - Check company detail pages

2. **Verify Data Quality:**
   - Check that phone numbers display correctly
   - Verify addresses are formatted properly
   - Ensure company names are readable

3. **Add Missing Information:**
   - Add images for companies
   - Enhance descriptions
   - Verify and correct phone numbers
   - Add missing addresses

## Statistics & Insights

### Business Types
The extracted companies represent various business sectors:
- Pharmacies and healthcare
- Retail and commerce
- Services and consulting
- Manufacturing and industry
- Hospitality and restaurants
- Construction and public works
- Finance and banking
- Transportation and logistics
- And many more...

### Geographic Distribution
Companies are spread across Senegal's major cities and towns, with the highest concentration in:
- Dakar (capital and economic center)
- Thiès (second largest city)
- Saint-Louis (historical city)
- Kaolack (central hub)
- Ziguinchor (southern region)

## Future Enhancements

Consider these improvements after initial import:

1. **Automated Categorization:**
   - Use machine learning or keyword matching to auto-categorize companies
   - Create a mapping script for business activities to categories

2. **Data Enrichment:**
   - Add company logos/images
   - Scrape additional information from websites
   - Verify phone numbers and addresses

3. **Deduplication Refinement:**
   - Implement fuzzy matching for better duplicate detection
   - Merge similar company entries

4. **Regular Updates:**
   - Set up a process to periodically update company information
   - Handle changes to addresses, phone numbers, etc.

## Support

If you encounter any issues:
1. Check that all Prisma migrations are up to date
2. Verify your database connection in `.env`
3. Review the PostgreSQL logs for detailed error messages
4. Check that the Category table has at least one entry
5. Ensure PostgreSQL version is 14+

## Summary

✅ **6,657 unique companies ready to import**  
✅ **Complete contact information where available**  
✅ **Organized by city and business activity**  
✅ **Ready-to-use SQL script with conflict handling**  
✅ **Verification queries included**  

---

**Ready to import!** 🚀

Simply run the SQL file against your PostgreSQL database and you'll have a comprehensive directory of Senegalese companies.
