import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { expect, test } from 'vite-plus/test';

const storybookRoot = resolve(import.meta.dirname, '..');
const storiesRoot = resolve(storybookRoot, 'src/stories');

const readStorybookFile = (path: string) => {
  return readFileSync(resolve(storybookRoot, path), 'utf8');
};

const extractStoryObject = (source: string, storyName: string) => {
  const declarationStart = source.indexOf(`export const ${storyName}`);

  if (declarationStart === -1) {
    return '';
  }

  const declarationBodyStart = source.indexOf('{', declarationStart);

  if (declarationBodyStart === -1) {
    return '';
  }

  let depth = 1;
  let index = declarationBodyStart + 1;

  for (; index < source.length; index += 1) {
    if (source[index] === '{') {
      depth += 1;
      continue;
    }

    if (source[index] === '}') {
      depth -= 1;

      if (depth === 0) {
        return source.slice(declarationStart, index + 1);
      }
    }
  }

  return '';
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

test('preview exposes the component locale through a global toolbar and provider', () => {
  const preview = readStorybookFile('.storybook/preview.ts');

  expect(preview).toContain('context.globals.locale');
  expect(preview).toContain('configLocales.map');
  expect(preview).toContain('ConfigProvider');
  expect(preview).toContain('Suspense');
});

test('controls-oriented stories expose an args-driven Default playground', () => {
  const storyFiles = readdirSync(storiesRoot)
    .filter((file) => file.endsWith('.stories.tsx'))
    .sort();

  for (const storyFile of storyFiles) {
    const source = readFileSync(resolve(storiesRoot, storyFile), 'utf8');

    if (!source.includes('argTypes:')) {
      continue;
    }

    const defaultStory = extractStoryObject(source, 'Default');

    expect(
      defaultStory,
      `${storyFile} should export Default when argTypes are documented`,
    ).not.toBe('');
    expect(defaultStory, `${storyFile} Default should provide initial args`).toContain('args:');

    if (defaultStory.includes('render:')) {
      expect(
        /render\s*:\s*(?:\(?\s*(args|\{)|[A-Za-z_$][\w$]*\.render)/.test(defaultStory),
        `${storyFile} Default custom render should receive Storybook args`,
      ).toBe(true);
    }
  }
});
