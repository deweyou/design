import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vite-plus/test';

import {
  Button,
  type ButtonProps,
  buttonColorOptions,
  buttonDefaultShapeByVariant,
  buttonShapeOptions,
  buttonShapeSupport,
  buttonSizeOptions,
  buttonVariantOptions,
} from '../src/button/index';

test('button support matrix matches the documented variants, sizes, and shapes', () => {
  expect(buttonVariantOptions).toEqual(['filled', 'outlined', 'ghost', 'link']);
  expect(buttonColorOptions).toEqual(['neutral', 'primary']);
  expect(buttonSizeOptions).toEqual(['extra-small', 'small', 'medium', 'large', 'extra-large']);
  expect(buttonShapeOptions).toEqual(['rect', 'rounded', 'pill']);
  expect(buttonShapeSupport).toEqual({
    filled: ['rect', 'rounded', 'pill'],
    outlined: ['rect', 'rounded', 'pill'],
    ghost: [],
    link: [],
  });
  expect(buttonDefaultShapeByVariant).toEqual({
    filled: 'rounded',
    outlined: 'rounded',
  });
});

test('button renders supported shapes instead of silently falling back', () => {
  const filledMarkup = renderToStaticMarkup(
    createElement(Button, { shape: 'rect', variant: 'filled' }, 'Primary'),
  );
  const outlinedMarkup = renderToStaticMarkup(
    createElement(Button, { color: 'primary', shape: 'pill', variant: 'outlined' }, 'Secondary'),
  );

  expect(filledMarkup).toContain('data-shape="rect"');
  expect(outlinedMarkup).toContain('data-shape="pill"');
  expect(outlinedMarkup).toContain('data-color="primary"');
});

test('button rejects unsupported variant and shape combinations with a descriptive error', () => {
  const invalidLinkProps = {
    shape: 'rect',
    variant: 'link',
  } as unknown as ButtonProps;
  const invalidGhostProps = {
    shape: 'rounded',
    variant: 'ghost',
  } as unknown as ButtonProps;

  expect(() =>
    renderToStaticMarkup(createElement(Button, invalidLinkProps, 'Link action')),
  ).toThrow('does not support the shape prop');

  expect(() =>
    renderToStaticMarkup(createElement(Button, invalidGhostProps, 'Ghost action')),
  ).toThrow('does not support the shape prop');
});

test('button requires an accessible name when no visible text is rendered', () => {
  expect(() =>
    renderToStaticMarkup(
      createElement(
        Button,
        { variant: 'outlined' },
        createElement('svg', { 'aria-hidden': true, viewBox: '0 0 16 16' }),
      ),
    ),
  ).toThrow('requires aria-label or aria-labelledby');
});
