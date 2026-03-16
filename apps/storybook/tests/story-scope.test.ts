import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { expect, test } from 'vite-plus/test';

const mainConfig = readFileSync(resolve(import.meta.dirname, '../.storybook/main.ts'), 'utf8');
const storySource = readFileSync(
  resolve(import.meta.dirname, '../src/stories/Button.stories.tsx'),
  'utf8',
);

test('storybook stays focused on internal review stories', () => {
  expect(mainConfig).toContain('Internal review stories for component state coverage');
  expect(storySource).toContain('Internal review');
});
