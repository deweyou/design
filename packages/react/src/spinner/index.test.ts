import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vite-plus/test';

import { Spinner, type SpinnerProps } from './index';
import styles from './index.module.less';

const stylesheet = readFileSync(resolve(import.meta.dirname, 'index.module.less'), 'utf8');

const renderMarkup = (props: SpinnerProps) => renderToStaticMarkup(createElement(Spinner, props));

test('spinner renders as a span element', () => {
  const markup = renderMarkup({});
  expect(markup).toContain('<span');
});

test('spinner has aria-hidden="true" when no aria-label is provided', () => {
  const markup = renderMarkup({});
  expect(markup).toContain('aria-hidden="true"');
  expect(markup).not.toContain('role="status"');
});

test('spinner has role="status" when aria-label is provided', () => {
  const markup = renderMarkup({ 'aria-label': 'Loading content' });
  expect(markup).toContain('role="status"');
  expect(markup).toContain('aria-label="Loading content"');
  expect(markup).not.toContain('aria-hidden');
});

test('spinner applies size as inline style when size is a number', () => {
  const markup = renderMarkup({ size: 24 });
  expect(markup).toContain('24px');
});

test('spinner applies size as inline style when size is a string', () => {
  const markup = renderMarkup({ size: '2rem' });
  expect(markup).toContain('2rem');
});

test('spinner applies root class', () => {
  const markup = renderMarkup({});
  expect(markup).toContain(styles.root);
});

test('spinner forwards className and style', () => {
  const markup = renderMarkup({ className: 'consumer-spinner', style: { color: 'red' } });
  expect(markup).toContain('consumer-spinner');
});

test('spinner stylesheet contains keyframe animation', () => {
  expect(stylesheet).toContain('@keyframes');
  expect(stylesheet).toContain('rotate');
});

test('spinner stylesheet uses border and pill radius', () => {
  expect(stylesheet).toContain('border');
  expect(stylesheet).toContain('--ui-radius-pill');
});
