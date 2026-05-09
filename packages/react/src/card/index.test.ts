import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vite-plus/test';

import { Card, type CardProps } from './index';
import styles from './index.module.less';

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

test('card renders as an anchor element when href is provided', () => {
  const markup = renderMarkup({ href: '/detail/123' });
  expect(markup).toContain('<a');
  expect(markup).toContain('href="/detail/123"');
  expect(markup).not.toContain('<div');
});

test('card renders as div when href is not provided', () => {
  const markup = renderMarkup({});
  expect(markup).toContain('<div');
  expect(markup).not.toContain('<a');
});

test('card forwards target when href is provided', () => {
  const markup = renderMarkup({ href: '/detail', target: '_blank' });
  expect(markup).toContain('target="_blank"');
});

test('card throws when target is provided without href', () => {
  expect(() => renderMarkup({ target: '_blank' })).toThrow('Card: target requires href');
});
