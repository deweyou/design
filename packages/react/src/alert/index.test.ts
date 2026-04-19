import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vite-plus/test';

import { Alert, type AlertProps } from './index';
import styles from './index.module.less';

const stylesheet = readFileSync(resolve(import.meta.dirname, 'index.module.less'), 'utf8');

const renderMarkup = (props: AlertProps) =>
  renderToStaticMarkup(createElement(Alert, props, props.children ?? 'Alert content'));

test('alert renders as a div element', () => {
  const markup = renderMarkup({});
  expect(markup).toContain('<div');
});

test('alert applies info variant class by default', () => {
  const markup = renderMarkup({});
  expect(markup).toContain(styles.info);
});

test('alert applies correct variant class for each variant', () => {
  for (const variant of ['info', 'success', 'warning', 'danger'] as const) {
    const markup = renderMarkup({ variant });
    const expectedClass = styles[variant];
    expect(markup).toContain(expectedClass);
  }
});

test('alert renders title when title prop is provided', () => {
  const markup = renderMarkup({ title: 'Heads up' });
  expect(markup).toContain('Heads up');
  expect(markup).toContain(styles.title);
});

test('alert does not render title element when title is absent', () => {
  const markup = renderMarkup({});
  expect(markup).not.toContain(styles.title);
});

test('alert renders children content', () => {
  const markup = renderMarkup({ children: 'Something went wrong.' });
  expect(markup).toContain('Something went wrong.');
});

test('alert has role="alert" for danger variant', () => {
  const markup = renderMarkup({ variant: 'danger' });
  expect(markup).toContain('role="alert"');
});

test('alert forwards className and style', () => {
  const markup = renderMarkup({ className: 'consumer-alert', style: { margin: '8px' } });
  expect(markup).toContain('consumer-alert');
  expect(markup).toContain('margin');
});

test('alert stylesheet uses semantic tokens', () => {
  expect(stylesheet).toContain('--ui-color-brand-bg');
  expect(stylesheet).toContain('--ui-color-danger-bg');
  expect(stylesheet).toContain('--ui-radius-float');
  expect(stylesheet).not.toContain('--ui-color-palette-');
});

test('alert stylesheet defines all four variant classes', () => {
  expect(stylesheet).toContain('info');
  expect(stylesheet).toContain('success');
  expect(stylesheet).toContain('warning');
  expect(stylesheet).toContain('danger');
});
