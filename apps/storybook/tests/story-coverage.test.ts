import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { expect, test } from 'vite-plus/test';

const storybookRoot = resolve(import.meta.dirname, '..');

const readStorybookFile = (path: string) => {
  return readFileSync(resolve(storybookRoot, path), 'utf8');
};

test('Nav and Field stories include interaction play functions', () => {
  const fieldStory = readStorybookFile('src/stories/Field.stories.tsx');
  const navStory = readStorybookFile('src/stories/Nav.stories.tsx');

  expect(fieldStory).toContain('play: async');
  expect(fieldStory).toContain('within(canvasElement)');
  expect(navStory).toContain('play: async');
  expect(navStory).toContain('Responsive navigation');
});

test('preview can render full viewport stories outside the centered layout frame', () => {
  const preview = readStorybookFile('.storybook/preview.ts');

  expect(preview).toContain('context.parameters.fullViewport');
  expect(preview).toContain("layout: 'fullscreen'");
});
