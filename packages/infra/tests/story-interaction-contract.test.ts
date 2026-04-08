import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { expect, test } from 'vite-plus/test';

const root = resolve(import.meta.dirname, '../../..');
const storiesDir = resolve(root, 'apps/storybook/src/stories');

const storyFiles = readdirSync(storiesDir).filter((f) => f.endsWith('.stories.tsx'));

test('every story file exports an Interaction story with a play function', () => {
  const violations: string[] = [];

  for (const file of storyFiles) {
    const content = readFileSync(resolve(storiesDir, file), 'utf8');

    const hasInteractionExport = /export\s+const\s+Interaction\s*[=:]/.test(content);
    const hasPlayFn = /\bplay\s*:/.test(content);

    if (!hasInteractionExport || !hasPlayFn) {
      violations.push(
        `${file}: missing ${!hasInteractionExport ? 'Interaction export' : ''} ${!hasPlayFn ? 'play function' : ''}`.trim(),
      );
    }
  }

  expect(violations, `Story files missing e2e coverage:\n${violations.join('\n')}`).toEqual([]);
});
