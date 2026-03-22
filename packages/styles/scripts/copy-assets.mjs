import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

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

const packageJsonPath = resolve(root, 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

packageJson.files = ['dist'];
packageJson.types = './dist/index.d.mts';
packageJson.exports = {
  '.': './dist/index.mjs',
  './theme.css': './dist/css/theme.css',
  './theme-light.css': './dist/css/theme-light.css',
  './theme-dark.css': './dist/css/theme-dark.css',
  './reset.css': './dist/css/reset.css',
  './base.css': './dist/css/base.css',
  './less/bridge.less': './dist/less/bridge.less',
  './less/mixins.less': './dist/less/mixins.less',
  './package.json': './package.json',
};

writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
