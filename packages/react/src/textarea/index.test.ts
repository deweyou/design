import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vite-plus/test';

import { Textarea, type TextareaProps } from './index';
import styles from './index.module.less';

const stylesheet = readFileSync(resolve(import.meta.dirname, 'index.module.less'), 'utf8');

const renderMarkup = (props: TextareaProps) => renderToStaticMarkup(createElement(Textarea, props));

test('textarea renders a root div with an inner textarea element by default', () => {
  const markup = renderMarkup({});
  expect(markup).toContain('<div');
  expect(markup).toContain('<textarea');
});

test('textarea applies the md size class by default', () => {
  const markup = renderMarkup({});
  expect(markup).toContain(styles.sizeMd);
});

test('textarea applies correct size class for each size value', () => {
  for (const size of ['sm', 'md', 'lg'] as const) {
    const markup = renderMarkup({ size });
    const expectedClass =
      size === 'sm' ? styles.sizeSm : size === 'lg' ? styles.sizeLg : styles.sizeMd;
    expect(markup).toContain(expectedClass);
  }
});

test('textarea renders label element with htmlFor when label prop is provided', () => {
  const markup = renderMarkup({ label: 'Message', id: 'msg' });
  expect(markup).toContain('<label');
  expect(markup).toContain('Message');
  expect(markup).toContain('for="msg"');
});

test('textarea does not render label element when label prop is absent', () => {
  const markup = renderMarkup({});
  expect(markup).not.toContain('<label');
});

test('textarea renders hint text when hint prop is provided', () => {
  const markup = renderMarkup({ hint: 'Max 500 characters.' });
  expect(markup).toContain('Max 500 characters.');
  expect(markup).toContain(styles.hint);
});

test('textarea renders error message and applies error classes when error prop is provided', () => {
  const markup = renderMarkup({ error: 'Message is required.' });
  expect(markup).toContain('Message is required.');
  expect(markup).toContain(styles.error);
  expect(markup).toContain(styles.fieldError);
});

test('textarea applies disabled class and disabled attribute when disabled is true', () => {
  const markup = renderMarkup({ disabled: true });
  expect(markup).toContain(styles.disabled);
  expect(markup).toContain('disabled');
});

test('textarea forwards className and style to root element', () => {
  const markup = renderMarkup({ className: 'consumer-textarea', style: { marginTop: '8px' } });
  expect(markup).toContain('consumer-textarea');
  expect(markup).toContain('margin-top');
});

test('textarea stylesheet uses semantic tokens', () => {
  expect(stylesheet).toContain('--ui-color-border');
  expect(stylesheet).toContain('--ui-color-canvas');
  expect(stylesheet).toContain('--ui-color-text');
  expect(stylesheet).toContain('--ui-color-focus-ring');
  expect(stylesheet).not.toContain('--ui-color-palette-');
});

test('textarea stylesheet contains resize and min-height rules', () => {
  expect(stylesheet).toContain('resize');
  expect(stylesheet).toContain('min-height');
});
