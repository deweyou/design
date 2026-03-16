import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { expect, test } from 'vite-plus/test';

const cssDir = resolve(import.meta.dirname, '../src/css');

test('theme outputs define light, dark, and default entrypoints', () => {
  const theme = readFileSync(resolve(cssDir, 'theme.css'), 'utf8');
  const light = readFileSync(resolve(cssDir, 'theme-light.css'), 'utf8');
  const dark = readFileSync(resolve(cssDir, 'theme-dark.css'), 'utf8');

  expect(theme).toContain("@import './reset.css';");
  expect(theme).toContain("@import './base.css';");
  expect(light).toContain('--ui-color-brand-bg');
  expect(dark).toContain('[data-theme');
});
