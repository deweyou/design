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

test('navbar actions delegate visual size and touch targets to shared buttons', () => {
  const actionButtonRule = navbarStyles.match(/\.actionButton\s*\{[\s\S]*?\n\}/)?.[0] ?? '';

  expect(actionButtonRule).not.toContain('block-size: var(--ui-touch-target-min)');
  expect(actionButtonRule).not.toContain('inline-size: var(--ui-touch-target-min)');
});

test('navbar chrome keeps keyboard focus neutral', () => {
  expect(navbarStyles).toContain("@import '@deweyou-design/styles/less/bridge';");
  expect(navbarStyles).not.toContain('var(--ui-color-focus-ring)');

  for (const selector of [
    '.mark',
    '.routeLink,\n.routeMenuTrigger',
    '.routeMenuItem',
    '.mobileNavCloseButton',
    '.mobileNavLink',
    '.actionButton',
  ]) {
    const ruleStart = navbarStyles.indexOf(selector);
    const ruleEnd = navbarStyles.indexOf('\n}\n', ruleStart);
    const rule = navbarStyles.slice(ruleStart, ruleEnd + 2);

    expect(rule, selector).toContain('&:focus-visible');
    expect(rule, selector).toContain('.focus-ring-neutral()');
  }
});

test('desktop navbar allows the Explore menu to overflow the link row', () => {
  const linksRule = navbarStyles.match(/\.links\s*\{[\s\S]*?\n\}/)?.[0] ?? '';

  expect(linksRule).toContain('overflow: visible');
  expect(linksRule).not.toContain('overflow-x: auto');
});

test('mobile document offset matches the compact navbar height', () => {
  const mobileGlobalRule =
    globalStyles.match(/@media \(max-width: 760px\) \{[\s\S]*?\n\}/)?.[0] ?? '';

  expect(mobileGlobalRule).toContain('--website-nav-offset: 64px');
  expect(mobileGlobalRule).toContain('scroll-padding-top: 64px');
});
