import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { expect, test } from 'vite-plus/test';

const globalStyles = readFileSync(resolve(import.meta.dirname, 'style.css'), 'utf8');
const websiteHtml = readFileSync(resolve(import.meta.dirname, '../index.html'), 'utf8');

test('global styles target the website mount node', () => {
  expect(websiteHtml).toContain('id="root"');
  expect(globalStyles).toContain('#root');
  expect(globalStyles).not.toContain('#app');
});
