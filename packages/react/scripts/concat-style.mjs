import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

const distDir = resolve(fileURLToPath(import.meta.url), '../../dist');

const cssFiles = [];
const walk = (dir) => {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full);
    } else if (entry.endsWith('.css')) {
      cssFiles.push(full);
    }
  }
};
walk(distDir);
cssFiles.sort();

const combined = cssFiles.map((f) => readFileSync(f, 'utf8')).join('\n');
writeFileSync(join(distDir, 'style.css'), combined);
console.log(`style.css written (${cssFiles.length} files concatenated)`);
