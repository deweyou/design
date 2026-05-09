import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vite-plus/test';

import { Separator, type SeparatorProps } from './index';
import styles from './index.module.less';

const renderMarkup = (props: SeparatorProps) =>
  renderToStaticMarkup(createElement(Separator, props));

test('separator renders as hr by default (horizontal orientation)', () => {
  const markup = renderMarkup({});
  expect(markup).toContain('<hr');
});

test('separator applies horizontal class by default', () => {
  const markup = renderMarkup({});
  expect(markup).toContain(styles.horizontal);
});

test('separator renders as div for vertical orientation', () => {
  const markup = renderMarkup({ orientation: 'vertical' });
  expect(markup).toContain('<div');
  expect(markup).toContain(styles.vertical);
});

test('separator renders label content when label prop is provided', () => {
  const markup = renderMarkup({ label: 'OR' });
  expect(markup).toContain('OR');
  expect(markup).toContain(styles.withLabel);
});

test('separator does not render label element when label prop is absent', () => {
  const markup = renderMarkup({});
  expect(markup).not.toContain(styles.withLabel);
});

test('separator forwards className and style', () => {
  const markup = renderMarkup({ className: 'consumer-sep', style: { margin: '8px 0' } });
  expect(markup).toContain('consumer-sep');
  expect(markup).toContain('margin');
});
