import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

/**
 * Seed script to populate database with companies from extracted PDF data
 */

// Define company data interface
interface CompanyData {
  ville: string;
  entreprise: string;
  activite: string;
  adresse: string;
  tel: string;
  category: string;
}

// Helper function to create a slug from a string
function createSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .substring(0, 100); // Limit length
}

// Ensure slug uniqueness
async function ensureUniqueSlug(baseSlug: string, model: 'category' | 'company'): Promise<string> {
  let slug = baseSlug;
  let counter = 1;
  
  while (true) {
    const existing = model === 'category'
      ? await prisma.category.findUnique({ where: { slug } })
      : await prisma.company.findUnique({ where: { slug } });
    
    if (!existing) {
      return slug;
    }
    
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

async function main() {
  console.log('Starting database seeding...');

  // Load categorized companies data
  const dataPath = path.join(__dirname, 'data', 'companies-categorized.json');
  const fileContent = fs.readFileSync(dataPath, 'utf8');
  const companiesData: CompanyData[] = JSON.parse(fileContent);

  console.log(`Loaded ${companiesData.length} companies from JSON`);

  // Get unique categories
  const uniqueCategories = [...new Set(companiesData.map((c) => c.category))];
  console.log(`Found ${uniqueCategories.length} unique categories`);

  // Create categories
  const categoryMap = new Map<string, number>();
  
  for (const categoryName of uniqueCategories) {
    const slug = await ensureUniqueSlug(createSlug(categoryName), 'category');
    
    const category = await prisma.category.upsert({
      where: { slug },
      update: { name: categoryName },
      create: {
        name: categoryName,
        slug: slug,
      },
    });
    
    categoryMap.set(categoryName, category.id);
    console.log(`✓ Category: ${categoryName} (ID: ${category.id})`);
  }

  // Create companies
  let createdCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const companyData of companiesData) {
    try {
      const categoryId = categoryMap.get(companyData.category);
      
      if (!categoryId) {
        console.warn(`⚠ Category not found for ${companyData.entreprise}`);
        skippedCount++;
        continue;
      }

      const baseSlug = createSlug(companyData.entreprise);
      const slug = await ensureUniqueSlug(baseSlug, 'company');

      await prisma.company.create({
        data: {
          name: companyData.entreprise,
          slug: slug,
          description: companyData.activite,
          ville: companyData.ville,
          adresse: companyData.adresse,
          tel: companyData.tel,
          activite: companyData.activite,
          categoryId: categoryId,
        },
      });

      createdCount++;
      
      if (createdCount % 100 === 0) {
        console.log(`  Progress: ${createdCount} companies created...`);
      }
    } catch (error) {
      console.error(`✗ Error creating company ${companyData.entreprise}:`, error);
      errorCount++;
    }
  }

  console.log('\n=== Seeding Complete ===');
  console.log(`✓ Created: ${createdCount} companies`);
  console.log(`⚠ Skipped: ${skippedCount} companies`);
  console.log(`✗ Errors: ${errorCount} companies`);
  console.log(`📊 Total categories: ${uniqueCategories.length}`);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
