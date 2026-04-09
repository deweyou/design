import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const workspaceRoot = resolve(import.meta.dirname, '../../..');

/**
 * Copies README.md (from the package root) and LICENSE (from the workspace root) into dist/.
 * Called as a post-build step so that published packages include both files.
 *
 * @param {string} packageDir - Path to the package root, resolved relative to cwd (default: '.').
 */
export const copyDistAssets = (packageDir = '.') => {
  const packageRoot = resolve(process.cwd(), packageDir);
  const distDir = resolve(packageRoot, 'dist');

  mkdirSync(distDir, { recursive: true });

  const readmeSrc = resolve(packageRoot, 'README.md');
  if (existsSync(readmeSrc)) {
    copyFileSync(readmeSrc, resolve(distDir, 'README.md'));
  }

  const licenseSrc = resolve(workspaceRoot, 'LICENSE');
  if (existsSync(licenseSrc)) {
    copyFileSync(licenseSrc, resolve(distDir, 'LICENSE'));
  }
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  copyDistAssets(process.argv[2] ?? '.');
}
