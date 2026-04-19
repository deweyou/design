import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vite-plus/test';

import { Card, type CardProps } from './index';
import styles from './index.module.less';

const stylesheet = readFileSync(resolve(import.meta.dirname, 'index.module.less'), 'utf8');

const renderMarkup = (props: CardProps) =>
  renderToStaticMarkup(createElement(Card, props, props.children ?? 'Card content'));

test('card renders as a div element', () => {
  const markup = renderMarkup({});
  expect(markup).toContain('<div');
});

test('card applies root class', () => {
  const markup = renderMarkup({});
  expect(markup).toContain(styles.root);
});

test('card applies md padding class by default', () => {
  const markup = renderMarkup({});
  expect(markup).toContain(styles.paddingMd);
});

test('card applies correct padding class for each padding value', () => {
  const paddingMap: Record<string, string> = {
    none: styles.paddingNone,
    sm: styles.paddingSm,
    md: styles.paddingMd,
    lg: styles.paddingLg,
  };
  for (const [padding, expectedClass] of Object.entries(paddingMap)) {
    const markup = renderMarkup({ padding: padding as CardProps['padding'] });
    expect(markup).toContain(expectedClass);
  }
});

test('card applies shapeRect class when shape=rect', () => {
  const markup = renderMarkup({ shape: 'rect' });
  expect(markup).toContain(styles.shapeRect);
});

test('card does not apply shapeRect class when shape=auto (default)', () => {
  const markup = renderMarkup({});
  expect(markup).not.toContain(styles.shapeRect);
});

test('card renders children', () => {
  const markup = renderMarkup({ children: 'Card body text' });
  expect(markup).toContain('Card body text');
});

test('card forwards className and style', () => {
  const markup = renderMarkup({ className: 'consumer-card', style: { maxWidth: '400px' } });
  expect(markup).toContain('consumer-card');
  expect(markup).toContain('max-width');
});

test('card stylesheet uses semantic surface and border tokens', () => {
  expect(stylesheet).toContain('--ui-color-surface');
  expect(stylesheet).toContain('--ui-color-border');
  expect(stylesheet).toContain('--ui-radius-auto');
  expect(stylesheet).toContain('box-shadow');
  expect(stylesheet).not.toContain('--ui-color-palette-');
});

test('card stylesheet defines shapeRect class', () => {
  expect(stylesheet).toContain('shapeRect');
  expect(stylesheet).toContain('--ui-radius-rect');
});

test('card stylesheet defines all padding variant classes', () => {
  expect(stylesheet).toContain('paddingNone');
  expect(stylesheet).toContain('paddingSm');
  expect(stylesheet).toContain('paddingMd');
  expect(stylesheet).toContain('paddingLg');
});
