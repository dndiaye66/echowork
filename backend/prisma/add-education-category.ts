import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Migration script to add the "Établissements d'Enseignement Supérieur" category
 * for universities and higher education institutions
 */

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

async function main() {
  console.log('Starting migration: Adding Établissements d\'Enseignement Supérieur category...');

  const categoryName = 'Établissements d\'Enseignement Supérieur';
  const categorySlug = createSlug(categoryName);

  try {
    // Check if category already exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug: categorySlug },
    });

    if (existingCategory) {
      console.log(`✓ Category "${categoryName}" already exists (ID: ${existingCategory.id})`);
      return;
    }

    // Create the new category
    const category = await prisma.category.create({
      data: {
        name: categoryName,
        slug: categorySlug,
      },
    });

    console.log(`✓ Successfully created category "${categoryName}" (ID: ${category.id})`);
    console.log(`  Slug: ${categorySlug}`);

    // Optionally, add keywords for better categorization
    const keywords = [
      'université',
      'university',
      'institut supérieur',
      'école supérieure',
      'enseignement supérieur',
      'higher education',
      'formation supérieure',
      'académie',
      'faculté',
      'college',
    ];

    console.log('\nAdding keywords for category...');
    for (const keyword of keywords) {
      await prisma.categoryKeyword.create({
        data: {
          categoryId: category.id,
          keyword: keyword.toLowerCase(),
        },
      });
      console.log(`  ✓ Added keyword: ${keyword}`);
    }

    console.log('\n=== Migration Complete ===');
    console.log(`Category "${categoryName}" has been successfully added to the database.`);
    console.log('You can now assign companies to this category via the admin panel.');
  } catch (error) {
    console.error('✗ Error during migration:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
