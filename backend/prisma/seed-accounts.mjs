/**
 * Script de création des comptes de démonstration
 * Usage: node prisma/seed-accounts.mjs
 * Depuis: /var/www/echowork/backend
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Création des comptes...\n');

  // ── Admin ────────────────────────────────────────────────────────────────
  const adminPwd = await bcrypt.hash('Admin@2024!Echowork', 10);
  const admin = await prisma.user.upsert({
    where:  { email: 'admin@echowork.net' },
    update: { password: adminPwd, role: 'ADMIN', isVerified: true },
    create: {
      username:   'superadmin',
      email:      'admin@echowork.net',
      password:   adminPwd,
      role:       'ADMIN',
      isVerified: true,
    },
  });
  console.log('✅ Admin créé/mis à jour');
  console.log('   Pseudo    :', admin.username);
  console.log('   Email     :', admin.email);
  console.log('   Mot de passe : Admin@2024!Echowork');
  console.log('   URL       : https://www.echowork.net/admin\n');

  // ── Compte entreprise ────────────────────────────────────────────────────
  const bizPwd = await bcrypt.hash('Entreprise@2024!', 10);
  const biz = await prisma.user.upsert({
    where:  { email: 'entreprise@echowork.net' },
    update: { password: bizPwd, isVerified: true },
    create: {
      username:   'demo_entreprise',
      email:      'entreprise@echowork.net',
      password:   bizPwd,
      role:       'USER',
      isVerified: true,
    },
  });
  console.log('✅ Compte entreprise créé/mis à jour');
  console.log('   Pseudo    :', biz.username);
  console.log('   Email     :', biz.email);
  console.log('   Mot de passe : Entreprise@2024!');
  console.log('   URL       : https://www.echowork.net/espace-entreprise\n');

  console.log('🎉 Terminé !');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
