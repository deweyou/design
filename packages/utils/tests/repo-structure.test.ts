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

test('governed packages expose the expected unit-directory structure', () => {
  const expected = [
    'packages/components/src/button/index.tsx',
    'packages/components/src/button/index.module.less',
    'packages/components/src/button/index.test.ts',
    'packages/hooks/src/use-theme-mode/index.ts',
    'packages/hooks/src/use-theme-mode/index.test.ts',
  ];

  for (const entry of expected) {
    expect(existsSync(resolve(root, entry))).toBe(true);
  }
});

test('legacy top-level unit test files are not kept for governed source units', () => {
  expect(existsSync(resolve(root, 'packages/components/tests/index.test.ts'))).toBe(false);
  expect(existsSync(resolve(root, 'packages/hooks/tests/index.test.ts'))).toBe(false);
});
