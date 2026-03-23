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
  expect(buttonColorOptions).toEqual(['neutral', 'primary', 'danger']);
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

test('button support matrix keeps link underline feedback and outlined shape coverage in the default contract', () => {
  const linkMarkup = renderToStaticMarkup(createElement(Button, { variant: 'link' }, 'Link'));
  const outlinedMarkup = renderToStaticMarkup(
    createElement(Button, { shape: 'pill', variant: 'outlined' }, 'Outlined'),
  );

  expect(linkMarkup).toContain('data-variant="link"');
  expect(linkMarkup).not.toContain('data-animated=');
  expect(outlinedMarkup).toContain('data-variant="outlined"');
  expect(outlinedMarkup).toContain('data-shape="pill"');
});

test('button support matrix keeps outlined shapes and compact link sizes compatible with the default contract', () => {
  const rectMarkup = renderToStaticMarkup(
    createElement(Button, { shape: 'rect', variant: 'outlined' }, 'Rect'),
  );
  const pillMarkup = renderToStaticMarkup(
    createElement(Button, { shape: 'pill', variant: 'outlined' }, 'Pill'),
  );
  const compactLinkMarkup = renderToStaticMarkup(
    createElement(Button, { size: 'extra-small', variant: 'link' }, 'Compact'),
  );

  expect(rectMarkup).toContain('data-shape="rect"');
  expect(pillMarkup).toContain('data-shape="pill"');
  expect(compactLinkMarkup).toContain('data-size="extra-small"');
  expect(compactLinkMarkup).toContain('data-variant="link"');
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

test('button support matrix includes danger and loading as independent state axes', () => {
  const dangerMarkup = renderToStaticMarkup(
    createElement(Button, { color: 'danger', variant: 'ghost' }, 'Delete'),
  );
  const loadingMarkup = renderToStaticMarkup(
    createElement(IconButton, {
      'aria-label': 'Open search',
      color: 'danger',
      icon: createElement(SearchIcon),
      loading: true,
      variant: 'outlined',
    }),
  );

  expect(dangerMarkup).toContain('data-color="danger"');
  expect(loadingMarkup).toContain('data-loading="true"');
  expect(loadingMarkup).toContain('data-disabled="true"');
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
