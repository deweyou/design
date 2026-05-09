import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { expect, test } from 'vite-plus/test';

const root = resolve(import.meta.dirname, '../../..');

const read = (relativePath: string) => readFileSync(resolve(root, relativePath), 'utf8');

test('repository automation records the lint and example-code constraints', () => {
  const lintConfig = read('vite.config.ts');
  const websiteEntryPath = resolve(root, 'apps/website/src/main.tsx');

  expect(lintConfig).toContain("'func-style': 'error'");
  expect(lintConfig).toContain("'unicorn/filename-case'");
  expect(existsSync(websiteEntryPath)).toBe(true);
  expect(readFileSync(websiteEntryPath, 'utf8')).not.toContain('React.createElement');
});

test('governed unit tests are colocated and legacy top-level unit tests are removed', () => {
  expect(existsSync(resolve(root, 'packages/react/src/button/index.test.ts'))).toBe(true);
  expect(existsSync(resolve(root, 'packages/react-hooks/src/use-theme-mode/index.test.ts'))).toBe(
    true,
  );
  expect(existsSync(resolve(root, 'packages/react/tests/index.test.ts'))).toBe(false);
  expect(existsSync(resolve(root, 'packages/react-hooks/tests/index.test.ts'))).toBe(false);
});
