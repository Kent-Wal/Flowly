import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(process.cwd(), 'dist');
if (!fs.existsSync(outDir)) process.exit(0);

const info = {
  builtAt: new Date().toISOString(),
  buildCommit: process.env.BUILD_COMMIT || null,
  buildId: process.env.BUILD_ID || null,
};

fs.writeFileSync(path.join(outDir, 'build-info.json'), JSON.stringify(info, null, 2));
console.log('Wrote build-info.json', info);
