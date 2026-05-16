import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { expect, test } from 'vite-plus/test';

const iconsStyles = readFileSync(resolve(import.meta.dirname, 'icons.module.less'), 'utf8');

test('icon labels do not break names at arbitrary characters', () => {
  const iconNameRule = iconsStyles.match(/\.iconName\s*\{[\s\S]*?\n\}/)?.[0] ?? '';

  expect(iconNameRule).not.toContain('overflow-wrap: anywhere');
  expect(iconNameRule).toContain('word-break: keep-all');
});

test('mobile icon cells leave enough room for common icon names', () => {
  expect(iconsStyles).toContain('grid-template-columns: repeat(auto-fill, minmax(104px, 1fr));');
});
