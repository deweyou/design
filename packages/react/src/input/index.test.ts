import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vite-plus/test';

import { Input, type InputProps } from './index';
import styles from './index.module.less';

const stylesheet = readFileSync(resolve(import.meta.dirname, 'index.module.less'), 'utf8');

const renderMarkup = (props: InputProps) => renderToStaticMarkup(createElement(Input, props));

test('input renders a root div with an inner input element by default', () => {
  const markup = renderMarkup({});
  expect(markup).toContain('<div');
  expect(markup).toContain('<input');
});

test('input applies the md size class by default', () => {
  const markup = renderMarkup({});
  expect(markup).toContain(styles.sizeMd);
});

test('input applies correct size class for each size value', () => {
  for (const size of ['sm', 'md', 'lg'] as const) {
    const markup = renderMarkup({ size });
    const expectedClass =
      size === 'sm' ? styles.sizeSm : size === 'lg' ? styles.sizeLg : styles.sizeMd;
    expect(markup).toContain(expectedClass);
  }
});

test('input renders label element with htmlFor when label prop is provided', () => {
  const markup = renderMarkup({ label: 'Email address', id: 'email' });
  expect(markup).toContain('<label');
  expect(markup).toContain('Email address');
  expect(markup).toContain('for="email"');
});

test('input does not render label element when label prop is absent', () => {
  const markup = renderMarkup({});
  expect(markup).not.toContain('<label');
});

test('input renders hint text when hint prop is provided', () => {
  const markup = renderMarkup({ hint: 'We will never share your email.' });
  expect(markup).toContain('We will never share your email.');
  expect(markup).toContain(styles.hint);
});

test('input renders error message and applies error classes when error prop is provided', () => {
  const markup = renderMarkup({ error: 'This field is required.' });
  expect(markup).toContain('This field is required.');
  expect(markup).toContain(styles.error);
  expect(markup).toContain(styles.fieldError);
});

test('input does not apply error classes when error is absent', () => {
  const markup = renderMarkup({ hint: 'Some hint' });
  expect(markup).not.toContain(styles.error);
  expect(markup).not.toContain(styles.fieldError);
});

test('input applies disabled class and disabled attribute when disabled is true', () => {
  const markup = renderMarkup({ disabled: true });
  expect(markup).toContain(styles.disabled);
  expect(markup).toContain('disabled');
});

test('input forwards className and style to root element', () => {
  const markup = renderMarkup({ className: 'consumer-input', style: { marginTop: '8px' } });
  expect(markup).toContain('consumer-input');
  expect(markup).toContain('margin-top');
});

test('input stylesheet uses semantic tokens and does not reference raw palette steps', () => {
  expect(stylesheet).toContain('--ui-color-border');
  expect(stylesheet).toContain('--ui-color-canvas');
  expect(stylesheet).toContain('--ui-color-text');
  expect(stylesheet).toContain('--ui-color-focus-ring');
  expect(stylesheet).not.toContain('--ui-color-palette-');
});

test('input stylesheet contains focus-visible outline rule', () => {
  expect(stylesheet).toContain('focus-visible');
  expect(stylesheet).toContain('outline');
});

test('input renders outlined variant (default) with border class', () => {
  const markup = renderMarkup({});
  expect(markup).toContain(styles.variantOutlined);
});

test('input renders ghost variant without border class', () => {
  const markup = renderMarkup({ variant: 'ghost' });
  expect(markup).toContain(styles.variantGhost);
  expect(markup).not.toContain(styles.variantOutlined);
});
