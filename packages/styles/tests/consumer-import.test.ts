import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { expect, test } from 'vite-plus/test';

const root = resolve(import.meta.dirname, '../../..');

test('consumer setup keeps the global style import explicit', () => {
  const websiteMain = readFileSync(resolve(root, 'apps/website/src/main.tsx'), 'utf8');
  const stylesReadme = readFileSync(resolve(root, 'packages/styles/README.md'), 'utf8');

  expect(websiteMain).toContain("import '@deweyou-ui/styles/theme.css';");
  expect(stylesReadme).toContain('Consumers should override only these color tokens in v1.');
});
