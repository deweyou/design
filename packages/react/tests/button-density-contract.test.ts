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
  expect(stylesheet).toContain('--button-square-size: var(--button-height);');
  expect(stylesheet).toContain('min-block-size: var(--button-height);');
});

test('button typography and height scale follows the design-system size ladder', () => {
  expect(stylesheet).toContain('--button-font-size: 0.75rem;');
  expect(stylesheet).toContain('--button-font-size: 0.875rem;');
  expect(stylesheet).toContain('--button-font-size: 1rem;');
  expect(stylesheet).toContain('--button-font-size: 1.0625rem;');
  expect(stylesheet).toContain('--button-font-size: 1.125rem;');
  expect(stylesheet).toContain('--button-height: var(--ui-control-height-xs);');
  expect(stylesheet).toContain('--button-height: var(--ui-control-height-sm);');
  expect(stylesheet).toContain('--button-height: var(--ui-control-height-md);');
  expect(stylesheet).toContain('--button-height: var(--ui-control-height-lg);');
  expect(stylesheet).toContain('--button-height: var(--ui-control-height-xl);');
});

test('icon buttons keep their visual size while expanding coarse-pointer hit areas', () => {
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
  expect(stylesheet).toContain('@media (pointer: coarse)');
  expect(stylesheet).toContain('inline-size: max(100%, var(--ui-touch-target-min));');
  expect(stylesheet).toContain('block-size: max(100%, var(--ui-touch-target-min));');
});

test('buttons share one derived float radius across modes and variants', () => {
  expect(stylesheet).toContain(
    '--button-float-radius: calc(var(--ui-radius-float) + var(--ui-radius-float));',
  );
  expect(stylesheet).toMatch(/\.shapeAuto\s*{[^}]*--button-radius: var\(--button-float-radius\);/);
  expect(stylesheet).toMatch(/\.shapeFloat\s*{[^}]*--button-radius: var\(--button-float-radius\);/);
  expect(stylesheet).toMatch(/\.ghost\s*{[^}]*--button-radius: var\(--button-float-radius\);/);
  expect(stylesheet).toContain('.modeIconButton.ghost');
  expect(stylesheet).not.toContain('--button-icon-radius');
  expect(stylesheet).not.toContain('.modeIconButton.shapeAuto');
});

test('icon buttons keep balanced optical spacing across the size ladder', () => {
  expect(stylesheet).toMatch(/\.sizeXs\s*{[^}]*--button-icon-size: 1rem;/);
  expect(stylesheet).toMatch(/\.sizeSm\s*{[^}]*--button-icon-size: 1\.25rem;/);
  expect(stylesheet).toMatch(/\.sizeMd\s*{[^}]*--button-icon-size: 1\.5rem;/);
  expect(stylesheet).toMatch(/\.sizeLg\s*{[^}]*--button-icon-size: 1\.75rem;/);
  expect(stylesheet).toMatch(/\.sizeXl\s*{[^}]*--button-icon-size: 2rem;/);
  expect(stylesheet).toContain('.modeIconButton .contentGraphic > svg');
  expect(stylesheet).toContain('inline-size: var(--button-icon-size);');
  expect(stylesheet).toContain('block-size: var(--button-icon-size);');
});
