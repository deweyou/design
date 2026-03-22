import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vite-plus/test';

import { SearchIcon } from '../exports/search';

import { Icon } from './index';
import { resolveIconViewBox } from './types';

test('icon inherits the surrounding font size by default and hides unlabeled output from assistive technology', () => {
  const markup = renderToStaticMarkup(<Icon name="add" />);

  expect(markup).toContain('data-icon-loading="true"');
  expect(markup).toContain('aria-hidden="true"');
  expect(markup).toContain('display:inline-flex');
  expect(markup).toContain('line-height:0');
  expect(markup).toContain('width:1em');
  expect(markup).toContain('height:1em');
});

test('icon supports numeric size overrides', () => {
  const markup = renderToStaticMarkup(<Icon name="search" size={28} />);

  expect(markup).toContain('width:28px');
  expect(markup).toContain('height:28px');
});

test('icon throws a descriptive error for unsupported icon names at runtime', () => {
  expect(() => renderToStaticMarkup(<Icon name={'missing' as never} />)).toThrow(
    'Unsupported icon name "missing".',
  );
});

test('icon normalizes non-square source viewBox values into a square viewport', () => {
  expect(resolveIconViewBox('0 0 24 24')).toBe('0 0 24 24');
  expect(resolveIconViewBox('0 0 25 24')).toBe('0 -0.5 25 25');
  expect(resolveIconViewBox('0 0 24 25')).toBe('-0.5 0 25 25');
});

test('icon wrapper keeps consumer style overrides while the inner svg fills the square box', () => {
  const markup = renderToStaticMarkup(<SearchIcon style={{ color: 'red' }} />);

  expect(markup).toContain('color:red');
  expect(markup).toContain('width:100%');
  expect(markup).toContain('height:100%');
});
