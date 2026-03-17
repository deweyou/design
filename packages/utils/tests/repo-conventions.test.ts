import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { expect, test } from 'vite-plus/test';

const root = resolve(import.meta.dirname, '../../..');

const read = (relativePath: string) => readFileSync(resolve(root, relativePath), 'utf8');

test('repository guidance documents the shared authoring conventions', () => {
  const rootAgents = read('AGENTS.md');
  const componentAgents = read('packages/components/AGENTS.md');
  const hookAgents = read('packages/hooks/AGENTS.md');
  const utilAgents = read('packages/utils/AGENTS.md');

  expect(rootAgents).toContain('Functions default to arrow-function style');
  expect(rootAgents).toContain('React components must be authored in TSX files');
  expect(rootAgents).toContain('lowercase names with hyphen separators');
  expect(rootAgents).toContain(
    'Top-level package `tests/` directories are reserved for cross-cutting',
  );

  expect(componentAgents).toContain('index.test.ts');
  expect(componentAgents).toContain('Use arrow functions by default');
  expect(hookAgents).toContain('src/<hook-name>/');
  expect(hookAgents).toContain('Use arrow functions by default');
  expect(utilAgents).toContain('lowercase, hyphen-separated names');
  expect(utilAgents).toContain('Top-level tests in `packages/utils/tests` are reserved');
});

test('repository automation records the lint and example-code constraints', () => {
  const lintConfig = read('vite.config.ts');
  const websiteEntryPath = resolve(root, 'apps/website/src/main.tsx');

  expect(lintConfig).toContain("'func-style': 'error'");
  expect(lintConfig).toContain("'unicorn/filename-case'");
  expect(existsSync(websiteEntryPath)).toBe(true);
  expect(readFileSync(websiteEntryPath, 'utf8')).not.toContain('React.createElement');
});

test('governed unit tests are colocated and legacy top-level unit tests are removed', () => {
  expect(existsSync(resolve(root, 'packages/components/src/button/index.test.ts'))).toBe(true);
  expect(existsSync(resolve(root, 'packages/hooks/src/use-theme-mode/index.test.ts'))).toBe(true);
  expect(existsSync(resolve(root, 'packages/components/tests/index.test.ts'))).toBe(false);
  expect(existsSync(resolve(root, 'packages/hooks/tests/index.test.ts'))).toBe(false);
});
