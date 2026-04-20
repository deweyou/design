import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vite-plus/test';

import { Badge, type BadgeProps } from './index';
import styles from './index.module.less';

const stylesheet = readFileSync(resolve(import.meta.dirname, 'index.module.less'), 'utf8');

const renderMarkup = (props: BadgeProps) =>
  renderToStaticMarkup(createElement(Badge, props, props.children ?? 'Label'));

test('badge renders as a span element', () => {
  const markup = renderMarkup({});
  expect(markup).toContain('<span');
});

test('badge applies soft variant class by default', () => {
  const markup = renderMarkup({});
  expect(markup).toContain(styles.soft);
});

test('badge applies correct variant classes', () => {
  for (const variant of ['soft', 'solid', 'outline'] as const) {
    const markup = renderMarkup({ variant });
    const expectedClass =
      variant === 'solid' ? styles.solid : variant === 'outline' ? styles.outline : styles.soft;
    expect(markup).toContain(expectedClass);
  }
});

test('badge applies neutral color class by default', () => {
  const markup = renderMarkup({});
  expect(markup).toContain(styles.colorNeutral);
});

test('badge applies correct color classes', () => {
  const colorMap: Record<string, string> = {
    neutral: styles.colorNeutral,
    primary: styles.colorPrimary,
    danger: styles.colorDanger,
    success: styles.colorSuccess,
    warning: styles.colorWarning,
  };
  for (const [color, expectedClass] of Object.entries(colorMap)) {
    const markup = renderMarkup({ color: color as BadgeProps['color'] });
    expect(markup).toContain(expectedClass);
  }
});

test('badge renders children', () => {
  const markup = renderMarkup({ children: 'New' });
  expect(markup).toContain('New');
});

test('badge forwards className and style', () => {
  const markup = renderMarkup({ className: 'consumer-badge', style: { marginLeft: '4px' } });
  expect(markup).toContain('consumer-badge');
  expect(markup).toContain('margin-left');
});

test('badge stylesheet uses semantic tokens and pill radius', () => {
  expect(stylesheet).toContain('--ui-radius-pill');
  expect(stylesheet).toContain('--ui-color-text');
  expect(stylesheet).toContain('--ui-font-body');
  expect(stylesheet).not.toContain('--ui-color-palette-');
});

test('badge stylesheet contains all variant and color class definitions', () => {
  expect(stylesheet).toContain('soft');
  expect(stylesheet).toContain('solid');
  expect(stylesheet).toContain('outline');
  expect(stylesheet).toContain('colorDanger');
  expect(stylesheet).toContain('colorSuccess');
  expect(stylesheet).toContain('colorWarning');
});
