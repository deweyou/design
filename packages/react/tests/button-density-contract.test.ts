import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vite-plus/test';

import { Button, IconButton } from '../src';

const stylesheet = readFileSync(
  resolve(import.meta.dirname, '../src/button/index.module.less'),
  'utf8',
);

const SearchIcon = () => {
  return createElement('svg', { 'aria-hidden': true, viewBox: '0 0 16 16' });
};

SearchIcon.displayName = 'SearchIcon';

test('text buttons use split block and inline padding variables', () => {
  expect(stylesheet).toContain('padding-block: var(--button-padding-block);');
  expect(stylesheet).toContain('padding-inline: var(--button-padding-inline);');
  expect(stylesheet).toContain('--button-square-size: calc(');
});

test('button typography scale keeps extra-small and reduces the larger sizes', () => {
  expect(stylesheet).toContain('--button-font-size: 0.75rem;');
  expect(stylesheet).toContain('--button-font-size: 0.8125rem;');
  expect(stylesheet).toContain('--button-font-size: 0.875rem;');
  expect(stylesheet).toContain('--button-font-size: 0.9375rem;');
  expect(stylesheet).toContain('--button-font-size: 1rem;');
});

test('icon buttons use the dedicated square-size mode', () => {
  const textMarkup = renderToStaticMarkup(
    createElement(Button, { icon: createElement(SearchIcon) }, 'Search'),
  );
  const iconMarkup = renderToStaticMarkup(
    createElement(IconButton, { 'aria-label': 'Open search', icon: createElement(SearchIcon) }),
  );

  expect(textMarkup).toContain('data-content-mode="text-with-icon"');
  expect(iconMarkup).toContain('data-content-mode="icon-button"');
  expect(stylesheet).toContain('.modeIconButton');
  expect(stylesheet).toContain('inline-size: var(--button-square-size);');
  expect(stylesheet).toContain('block-size: var(--button-square-size);');
});
