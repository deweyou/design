import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vite-plus/test';

import * as components from '../src';

const SearchIcon = () => {
  return createElement('svg', { 'aria-hidden': true, viewBox: '0 0 16 16' });
};

SearchIcon.displayName = 'SearchIcon';

const exampleButtonProps: import('../src').ButtonProps = {
  color: 'primary',
  icon: createElement(SearchIcon),
  shape: 'pill',
  size: 'medium',
  type: 'button',
  variant: 'outlined',
};

const exampleIconButtonProps: import('../src').IconButtonProps = {
  'aria-label': 'Open search',
  color: 'primary',
  icon: createElement(SearchIcon),
  shape: 'pill',
  size: 'medium',
  variant: 'outlined',
};

void exampleButtonProps;
void exampleIconButtonProps;

test('components root entry exposes Button and IconButton as the runtime public exports', () => {
  expect(Object.keys(components).sort()).toEqual(['Button', 'IconButton']);
});

test('components root entry renders both Button and IconButton without any legacy contract object', () => {
  const buttonMarkup = renderToStaticMarkup(createElement(components.Button, null, 'Publish'));
  const iconButtonMarkup = renderToStaticMarkup(
    createElement(components.IconButton, {
      'aria-label': 'Open search',
      icon: createElement(SearchIcon),
    }),
  );

  expect(buttonMarkup).toContain('data-content-mode="text-only"');
  expect(iconButtonMarkup).toContain('data-content-mode="icon-button"');
  expect(components.Button.Icon).toBe(components.IconButton);
});
