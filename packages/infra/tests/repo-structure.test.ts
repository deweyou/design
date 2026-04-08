import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { expect, test } from 'vite-plus/test';

const root = resolve(import.meta.dirname, '../../..');

test('repository contains the expected app and package boundaries', () => {
  const expected = [
    'apps/storybook',
    'apps/website',
    'packages/react',
    'packages/react-hooks',
    'packages/react-icons',
    'packages/styles',
    'packages/infra',
    'packages/utils',
  ];

  for (const entry of expected) {
    expect(existsSync(resolve(root, entry))).toBe(true);
  }
});

test('governed packages expose the expected unit-directory structure', () => {
  const expected = [
    'packages/react/src/button/index.tsx',
    'packages/react/src/button/index.module.less',
    'packages/react/src/button/index.test.ts',
    'packages/react-hooks/src/use-theme-mode/index.ts',
    'packages/react-hooks/src/use-theme-mode/index.test.ts',
  ];

  for (const entry of expected) {
    expect(existsSync(resolve(root, entry))).toBe(true);
  }
});

test('legacy top-level unit test files are not kept for governed source units', () => {
  expect(existsSync(resolve(root, 'packages/react/tests/index.test.ts'))).toBe(false);
  expect(existsSync(resolve(root, 'packages/react-hooks/tests/index.test.ts'))).toBe(false);
});
