// Simple seed script to create common Plaid category -> app category mappings
import prismaPkg from '@prisma/client';
const { PrismaClient } = prismaPkg;
const prisma = new PrismaClient();

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
