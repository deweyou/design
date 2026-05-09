import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vite-plus/test';

import { Badge, type BadgeProps } from './index';
import styles from './index.module.less';

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
