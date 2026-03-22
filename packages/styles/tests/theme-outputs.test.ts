import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { expect, test } from 'vite-plus/test';

const cssDir = resolve(import.meta.dirname, '../src/css');
const fontsDir = resolve(import.meta.dirname, '../src/assets/fonts');

test('theme outputs define light, dark, and default entrypoints', () => {
  const theme = readFileSync(resolve(cssDir, 'theme.css'), 'utf8');
  const light = readFileSync(resolve(cssDir, 'theme-light.css'), 'utf8');
  const dark = readFileSync(resolve(cssDir, 'theme-dark.css'), 'utf8');
  const base = readFileSync(resolve(cssDir, 'base.css'), 'utf8');
  const fonts = readFileSync(resolve(cssDir, 'fonts.css'), 'utf8');

  expect(theme).toContain("@import './reset.css';");
  expect(theme).toContain("@import './fonts.css';");
  expect(theme).toContain("@import './base.css';");
  expect(light).toContain('--ui-color-brand-bg');
  expect(light).toContain('--ui-font-body');
  expect(light).toContain('--ui-font-weight-title');
  expect(light).toContain('Songti SC');
  expect(light).toContain('SimSun');
  expect(dark).toContain('[data-theme');
  expect(base).toContain('font-family: var(--ui-font-body);');
  expect(base).toContain('font-family: var(--ui-font-mono);');
  expect(base).toContain('.typography-tier-title');
  expect(base).toContain('.typography-tier-strong');
  expect(fonts).toContain("font-family: 'Source Han Serif CN Web';");
  expect(fonts).toContain('font-display: swap;');
});

test('fonts asset directory contains the vendored Source Han Serif CN files', () => {
  const license = readFileSync(resolve(fontsDir, 'LICENSE.txt'), 'utf8');

  expect(license).toContain('SIL OPEN FONT LICENSE');
  expect(readFileSync(resolve(fontsDir, 'SourceHanSerifCN-Regular.otf'))).toBeTruthy();
  expect(readFileSync(resolve(fontsDir, 'SourceHanSerifCN-Medium.otf'))).toBeTruthy();
  expect(readFileSync(resolve(fontsDir, 'SourceHanSerifCN-SemiBold.otf'))).toBeTruthy();
  expect(readFileSync(resolve(fontsDir, 'SourceHanSerifCN-Bold.otf'))).toBeTruthy();
});
