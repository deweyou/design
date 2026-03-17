import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { expect, test } from 'vite-plus/test';

const root = resolve(import.meta.dirname, '../../..');

test('cross-package boundary coverage stays in top-level tests', () => {
  const componentPackage = JSON.parse(
    readFileSync(resolve(root, 'packages/components/package.json'), 'utf8'),
  ) as { dependencies: Record<string, string> };
  const hooksPackage = JSON.parse(
    readFileSync(resolve(root, 'packages/hooks/package.json'), 'utf8'),
  ) as { dependencies: Record<string, string> };
  const stylesPackage = JSON.parse(
    readFileSync(resolve(root, 'packages/styles/package.json'), 'utf8'),
  ) as { dependencies?: Record<string, string> };

  expect(componentPackage.dependencies).toMatchObject({
    '@deweyou-ui/hooks': 'workspace:*',
    '@deweyou-ui/styles': 'workspace:*',
  });
  expect(hooksPackage.dependencies).toMatchObject({
    '@deweyou-ui/utils': 'workspace:*',
  });
  expect(stylesPackage.dependencies ?? {}).not.toHaveProperty('@deweyou-ui/components');
});
