import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { expect, test } from 'vite-plus/test';

const root = resolve(import.meta.dirname, '../../..');

test('repository contains the expected app and package boundaries', () => {
  const expected = [
    'apps/storybook',
    'apps/website',
    'packages/components',
    'packages/hooks',
    'packages/styles',
    'packages/utils',
  ];

  for (const entry of expected) {
    expect(existsSync(resolve(root, entry))).toBe(true);
  }
});
