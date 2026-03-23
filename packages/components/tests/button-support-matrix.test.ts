import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vite-plus/test';

import {
  Button,
  IconButton,
  type ButtonProps,
  buttonColorOptions,
  buttonDefaultShapeByVariant,
  buttonShapeOptions,
  buttonShapeSupport,
  buttonSizeOptions,
  buttonVariantOptions,
  iconButtonVariantOptions,
} from '../src/button/index';

const SearchIcon = () => {
  return createElement('svg', { 'aria-hidden': true, viewBox: '0 0 16 16' });
};

SearchIcon.displayName = 'SearchIcon';

test('button support matrix matches the documented text and icon button variants', () => {
  expect(buttonVariantOptions).toEqual(['filled', 'outlined', 'ghost', 'link']);
  expect(iconButtonVariantOptions).toEqual(['filled', 'outlined', 'ghost']);
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

test('button and icon button render supported shapes instead of silently falling back', () => {
  const filledMarkup = renderToStaticMarkup(
    createElement(Button, { shape: 'rect', variant: 'filled' }, 'Primary'),
  );
  const iconMarkup = renderToStaticMarkup(
    createElement(IconButton, {
      'aria-label': 'Open search',
      color: 'primary',
      icon: createElement(SearchIcon),
      shape: 'pill',
      variant: 'outlined',
    }),
  );

  expect(filledMarkup).toContain('data-shape="rect"');
  expect(iconMarkup).toContain('data-shape="pill"');
  expect(iconMarkup).toContain('data-color="primary"');
});

test('button rejects unsupported shape combinations with a descriptive error', () => {
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

test('button and icon button keep the explicit icon boundary in the support matrix', () => {
  expect(() =>
    renderToStaticMarkup(
      createElement(Button, { 'aria-label': 'Open search' }, createElement(SearchIcon)),
    ),
  ).toThrow('no longer infers icon-only mode from children');

  expect(() =>
    renderToStaticMarkup(
      createElement(IconButton, {
        'aria-label': 'Open search',
        icon: createElement(SearchIcon),
        variant: 'link' as never,
      }),
    ),
  ).toThrow('does not support the "link" variant');
});
