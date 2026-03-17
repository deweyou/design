import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { expect, test } from 'vite-plus/test';

const source = readFileSync(resolve(import.meta.dirname, '../src/main.tsx'), 'utf8');

test('website source includes installation and theme guidance sections', () => {
  expect(source).toContain('Installation');
  expect(source).toContain('Theme modes');
  expect(source).toContain('Brand token overrides');
});
