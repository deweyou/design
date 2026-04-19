import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vite-plus/test';

import { Skeleton, type SkeletonProps } from './index';
import styles from './index.module.less';

const stylesheet = readFileSync(resolve(import.meta.dirname, 'index.module.less'), 'utf8');

const renderMarkup = (props: SkeletonProps) => renderToStaticMarkup(createElement(Skeleton, props));

test('skeleton renders as a div element', () => {
  const markup = renderMarkup({});
  expect(markup).toContain('<div');
});

test('skeleton applies root class', () => {
  const markup = renderMarkup({});
  expect(markup).toContain(styles.root);
});

test('skeleton applies circle class when circle is true', () => {
  const markup = renderMarkup({ circle: true });
  expect(markup).toContain(styles.circle);
});

test('skeleton does not apply circle class when circle is false', () => {
  const markup = renderMarkup({ circle: false });
  expect(markup).not.toContain(styles.circle);
});

test('skeleton applies width as inline style when width is a number', () => {
  const markup = renderMarkup({ width: 200 });
  expect(markup).toContain('200px');
});

test('skeleton applies width as inline style when width is a string', () => {
  const markup = renderMarkup({ width: '50%' });
  expect(markup).toContain('50%');
});

test('skeleton applies height as inline style when height is a number', () => {
  const markup = renderMarkup({ height: 20 });
  expect(markup).toContain('20px');
});

test('skeleton applies height as inline style when height is a string', () => {
  const markup = renderMarkup({ height: '3em' });
  expect(markup).toContain('3em');
});

test('skeleton has aria-hidden="true"', () => {
  const markup = renderMarkup({});
  expect(markup).toContain('aria-hidden="true"');
});

test('skeleton forwards className', () => {
  const markup = renderMarkup({ className: 'consumer-skeleton' });
  expect(markup).toContain('consumer-skeleton');
});

test('skeleton stylesheet uses semantic tokens and shimmer animation', () => {
  expect(stylesheet).toContain('--ui-color-text');
  expect(stylesheet).toContain('--ui-color-canvas');
  expect(stylesheet).toContain('--ui-radius-float');
  expect(stylesheet).toContain('@keyframes');
  expect(stylesheet).not.toContain('--ui-color-palette-');
});

test('skeleton stylesheet contains circle variant with pill radius', () => {
  expect(stylesheet).toContain('--ui-radius-pill');
  expect(stylesheet).toContain('circle');
});
