import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Script to create a super-admin user
 * Run with: npm run create:admin
 */

async function main() {
  console.log('Creating super-admin user...');

  const adminEmail = 'admin@echowork.com';
  const adminUsername = 'superadmin';
  const adminPassword = 'Admin@2024!Echowork';

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('⚠ Super-admin already exists!');
    console.log('Email:', adminEmail);
    console.log('Updating role to ADMIN...');
    
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: { role: 'ADMIN' },
    });
    
    console.log('✓ Role updated successfully!');
    return;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  // Create super-admin
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      username: adminUsername,
      password: hashedPassword,
      role: 'ADMIN',
      isVerified: true,
    },
  });

  console.log('\n=== Super-Admin Created Successfully ===');
  console.log('Email:', adminEmail);
  console.log('Username:', adminUsername);
  console.log('Password:', adminPassword);
  console.log('Role:', admin.role);
  console.log('\n⚠ IMPORTANT: Please save these credentials securely!');
  console.log('⚠ Consider changing the password after first login.');
  console.log('=====================================\n');
}

main()
  .catch((e) => {
    console.error('Error creating super-admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
