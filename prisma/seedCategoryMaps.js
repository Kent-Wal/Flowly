// Simple seed script to create common Plaid category -> app category mappings
import 'dotenv/config';
import pkg from '@prisma/client';
import pgPkg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const { PrismaClient } = pkg;
const { Pool } = pgPkg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const seeds = [
    { plaidCategory: '13005000', appCategory: 'Groceries' },
    { plaidCategory: '11001000', appCategory: 'Dining' },
    { plaidCategory: '22005000', appCategory: 'Transportation' },
    { plaidCategory: '21000000', appCategory: 'Housing' },
  ];
  for (const s of seeds) {
    try {
      await prisma.categoryMap.upsert({ where: { plaidCategory: s.plaidCategory }, update: { appCategory: s.appCategory }, create: s });
      console.log('Seeded', s.plaidCategory, '->', s.appCategory);
    } catch (e) {
      console.warn('Failed to seed', s, e?.message || e);
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
