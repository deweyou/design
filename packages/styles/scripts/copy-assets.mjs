import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

import { copyDistAssets } from '../../infra/scripts/copy-dist-assets.mjs';
import { writePublishedManifest } from '../../infra/scripts/write-published-manifest.mjs';

const root = resolve(import.meta.dirname, '..');
const distDir = resolve(root, 'dist');
const cssSourceDir = resolve(root, 'src/css');
const lessSourceDir = resolve(root, 'src/less');
const assetSourceDir = resolve(root, 'src/assets');
const cssDistDir = resolve(distDir, 'css');
const lessDistDir = resolve(distDir, 'less');
const assetDistDir = resolve(distDir, 'assets');

mkdirSync(distDir, { recursive: true });

for (const target of [cssDistDir, lessDistDir, assetDistDir]) {
  if (existsSync(target)) {
    rmSync(target, { recursive: true, force: true });
  }
}

cpSync(cssSourceDir, cssDistDir, { recursive: true });
cpSync(lessSourceDir, lessDistDir, { recursive: true });

if (existsSync(assetSourceDir)) {
  cpSync(assetSourceDir, assetDistDir, { recursive: true });
}

writePublishedManifest(root);
copyDistAssets(root);
