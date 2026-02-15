import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Verifying categories in database...\n');

  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          companies: true,
          keywords: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  console.log(`Found ${categories.length} categories:\n`);
  
  categories.forEach((category) => {
    console.log(`📁 ${category.name}`);
    console.log(`   ID: ${category.id}`);
    console.log(`   Slug: ${category.slug}`);
    console.log(`   Companies: ${category._count.companies}`);
    console.log(`   Keywords: ${category._count.keywords}`);
    console.log('');
  });

  // Show keywords for the education category
  const educationCategory = categories.find(c => 
    c.slug === 'etablissements-d-enseignement-superieur'
  );

  if (educationCategory) {
    console.log('\n📚 Keywords for "Établissements d\'Enseignement Supérieur":');
    const keywords = await prisma.categoryKeyword.findMany({
      where: { categoryId: educationCategory.id },
    });
    keywords.forEach(k => console.log(`   - ${k.keyword}`));
  }
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
