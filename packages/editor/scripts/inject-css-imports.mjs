import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const distDir = resolve(import.meta.dirname, '../dist');

for (const entry of readdirSync(distDir)) {
  const dir = join(distDir, entry);
  if (!statSync(dir).isDirectory()) continue;

  const indexJs = join(dir, 'index.js');
  const cssFile = join(dir, 'index.module.css');

  if (!existsSync(indexJs) || !existsSync(cssFile)) continue;

  const content = readFileSync(indexJs, 'utf8');
  if (content.includes('index.module.css')) continue;

  writeFileSync(indexJs, `import './index.module.css';\n${content}`);
}

console.log('css imports injected');
