import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vite-plus/test';

import * as components from '../src';

const exampleProps: import('../src').ButtonProps = {
  color: 'primary',
  shape: 'pill',
  size: 'medium',
  type: 'button',
  variant: 'outlined',
};

void exampleProps;

test('components root entry exposes Button as the runtime public export', () => {
  expect(Object.keys(components).sort()).toEqual(['Button']);
});

test('components root entry renders Button without any legacy contract object', () => {
  const markup = renderToStaticMarkup(createElement(components.Button, null, 'Publish'));

  expect(markup).toContain('data-variant="filled"');
  expect(markup).toContain('data-shape="rounded"');
  expect(markup).toContain('>Publish<');
});
