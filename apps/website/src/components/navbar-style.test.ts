import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { expect, test } from 'vite-plus/test';

const navbarStyles = readFileSync(resolve(import.meta.dirname, 'navbar.module.less'), 'utf8');
const globalStyles = readFileSync(resolve(import.meta.dirname, '../style.css'), 'utf8');

test('mobile navbar uses compact single-row spacing', () => {
  const mobileNavbarRule =
    navbarStyles.match(/@media \(max-width: 760px\) \{[\s\S]*?\.mark\s*\{/)?.[0] ?? '';

  expect(mobileNavbarRule).toContain('grid-template-columns: 1fr auto auto');
  expect(mobileNavbarRule).toContain('padding: 10px 14px');
});

test('mobile document offset matches the compact navbar height', () => {
  const mobileGlobalRule =
    globalStyles.match(/@media \(max-width: 760px\) \{[\s\S]*?\n\}/)?.[0] ?? '';

  expect(mobileGlobalRule).toContain('--website-nav-offset: 64px');
  expect(mobileGlobalRule).toContain('scroll-padding-top: 64px');
});
