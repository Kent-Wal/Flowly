import { execSync } from 'node:child_process';

// Vercel deploys the React frontend only — Prisma runs on Render.
if (process.env.VERCEL) {
  console.log('postinstall: skipping prisma generate on Vercel');
  process.exit(0);
}

if (!process.env.DIRECT_URL && !process.env.DATABASE_URL) {
  console.log('postinstall: skipping prisma generate (no DATABASE_URL or DIRECT_URL)');
  process.exit(0);
}

execSync('npx prisma generate', { stdio: 'inherit' });
