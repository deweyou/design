import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vite-plus/test';

import { Button, type ButtonProps } from './index';
import styles from './index.module.less';

const stylesheet = readFileSync(resolve(import.meta.dirname, 'index.module.less'), 'utf8');

test('button defaults to filled medium with the rounded shape and native button semantics', () => {
  const markup = renderToStaticMarkup(createElement(Button, null, 'Save'));

  expect(markup).toContain('type="button"');
  expect(markup).toContain('data-color="neutral"');
  expect(markup).toContain('data-variant="filled"');
  expect(markup).toContain('data-size="medium"');
  expect(markup).toContain('data-shape="rounded"');
  expect(markup).toContain('data-icon-only="false"');
  expect(markup).toContain('>Save<');
});

test('button falls back to label when children are omitted', () => {
  const markup = renderToStaticMarkup(createElement(Button, { label: 'Continue' }));

  expect(markup).toContain('>Continue<');
});

test('button falls back to label when children only contain placeholders', () => {
  const markup = renderToStaticMarkup(createElement(Button, { label: 'Continue' }, false, '', []));

  expect(markup).toContain('>Continue<');
});

test('button prefers children over label when both are provided', () => {
  const markup = renderToStaticMarkup(
    createElement(Button, { label: 'Legacy label' }, 'Children win'),
  );

  expect(markup).toContain('>Children win<');
  expect(markup).not.toContain('Legacy label');
});

test('button renders every documented variant through the same API surface', () => {
  const variants = ['filled', 'outlined', 'ghost', 'link'] as const;

  for (const variant of variants) {
    const markup = renderToStaticMarkup(
      createElement(Button, { variant, size: 'large' }, `${variant} action`),
    );

    expect(markup).toContain(`data-variant="${variant}"`);
    expect(markup).toContain('data-size="large"');
  }
});

test('button opts into theme color only when color is set to primary', () => {
  const neutralMarkup = renderToStaticMarkup(createElement(Button, null, 'Default'));
  const primaryMarkup = renderToStaticMarkup(
    createElement(Button, { color: 'primary', variant: 'outlined' }, 'Accent'),
  );

  expect(neutralMarkup).toContain('data-color="neutral"');
  expect(primaryMarkup).toContain('data-color="primary"');
  expect(primaryMarkup).toContain('data-variant="outlined"');
});

test('button resolves supported shapes for filled and outlined variants', () => {
  const filledMarkup = renderToStaticMarkup(
    createElement(Button, { shape: 'pill', variant: 'filled' }, 'Publish'),
  );
  const outlinedMarkup = renderToStaticMarkup(
    createElement(Button, { shape: 'rect', variant: 'outlined' }, 'Review'),
  );

  expect(filledMarkup).toContain('data-shape="pill"');
  expect(outlinedMarkup).toContain('data-shape="rect"');
});

test('button preserves disabled semantics for supported variants', () => {
  const markup = renderToStaticMarkup(
    createElement(Button, { disabled: true, variant: 'outlined' }, 'Disabled'),
  );

  expect(markup).toContain('disabled=""');
  expect(markup).toContain('data-disabled="true"');
});

test('button keeps long labels in the rendered content', () => {
  const markup = renderToStaticMarkup(
    createElement(
      Button,
      { size: 'extra-small', variant: 'outlined' },
      'This extra-small button keeps a stable target even when the copy wraps.',
    ),
  );

  expect(markup).toContain(
    'This extra-small button keeps a stable target even when the copy wraps.',
  );
  expect(markup).toContain(styles.contentLabel);
});

test('button separates graphic and text content so only the label is truncated', () => {
  const markup = renderToStaticMarkup(
    createElement(
      Button,
      null,
      createElement('svg', { 'aria-hidden': true, viewBox: '0 0 16 16' }),
      'Search results with an overly long action label',
    ),
  );

  expect(markup).toContain(styles.contentGraphic);
  expect(markup).toContain(styles.contentLabel);
});

test('button treats text-producing custom components as visible text content', () => {
  const ButtonLabel = () => {
    return 'Save changes';
  };

  const markup = renderToStaticMarkup(createElement(Button, null, createElement(ButtonLabel)));

  expect(markup).toContain('Save changes');
  expect(markup).toContain(styles.contentLabel);
  expect(markup).toContain('data-icon-only="false"');
});

test('button allows icon-only content when an accessible name is provided', () => {
  const SearchIcon = () => {
    return createElement('svg', { 'aria-hidden': true, viewBox: '0 0 16 16' });
  };

  SearchIcon.displayName = 'SearchIcon';

  const markup = renderToStaticMarkup(
    createElement(
      Button,
      { 'aria-label': 'Open search', shape: 'pill' },
      createElement(SearchIcon),
    ),
  );

  expect(markup).toContain('aria-label="Open search"');
  expect(markup).toContain('data-icon-only="true"');
  expect(markup).toContain('data-shape="pill"');
  expect(markup).toContain(styles.contentGraphic);
});

test('button rejects shape on ghost and link variants', () => {
  const invalidGhostProps = {
    shape: 'rect',
    variant: 'ghost',
  } as unknown as ButtonProps;
  const invalidLinkProps = {
    shape: 'pill',
    variant: 'link',
  } as unknown as ButtonProps;

  expect(() => renderToStaticMarkup(createElement(Button, invalidGhostProps, 'Ghost'))).toThrow(
    'does not support the shape prop',
  );

  expect(() => renderToStaticMarkup(createElement(Button, invalidLinkProps, 'Link'))).toThrow(
    'does not support the shape prop',
  );
});

test('button rejects icon-only content without an accessible name', () => {
  const SearchIcon = () => {
    return createElement('svg', { 'aria-hidden': true, viewBox: '0 0 16 16' });
  };

  SearchIcon.displayName = 'SearchIcon';

  expect(() =>
    renderToStaticMarkup(createElement(Button, { variant: 'filled' }, createElement(SearchIcon))),
  ).toThrow('requires aria-label or aria-labelledby');
});

test('link variant keeps underline hover feedback attached to the label text', () => {
  expect(stylesheet).toContain('font: 600 var(--button-font-size) / 1.4 var(--ui-font-body);');
  expect(stylesheet).toContain('.contentLabel {');
  expect(stylesheet).toContain('display: block;');
  expect(stylesheet).toContain('line-height: 1.4;');
  expect(stylesheet).toContain('.link .contentLabel');
  expect(stylesheet).toContain('overflow: visible;');
  expect(stylesheet).toContain('text-overflow: clip;');
  expect(stylesheet).toContain('.link:hover:not(:disabled) .contentLabel');
  expect(stylesheet).toContain('text-decoration: underline;');
  expect(stylesheet).toContain('text-underline-offset: 0.24em;');
});
