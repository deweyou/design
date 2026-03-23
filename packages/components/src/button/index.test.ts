import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vite-plus/test';

import { Button, IconButton, type ButtonProps, type IconButtonProps } from './index';
import styles from './index.module.less';

const stylesheet = readFileSync(resolve(import.meta.dirname, 'index.module.less'), 'utf8');

const SearchIcon = () => {
  return createElement('svg', { 'aria-hidden': true, viewBox: '0 0 16 16' });
};

SearchIcon.displayName = 'SearchIcon';

const ChevronRightIcon = () => {
  return createElement('svg', { 'aria-hidden': true, viewBox: '0 0 16 16' });
};

ChevronRightIcon.displayName = 'ChevronRightIcon';

const exampleButtonProps: ButtonProps = {
  color: 'primary',
  icon: createElement(SearchIcon),
  shape: 'pill',
  size: 'medium',
  type: 'button',
  variant: 'outlined',
};

const exampleIconButtonProps: IconButtonProps = {
  'aria-label': 'Open search',
  color: 'primary',
  icon: createElement(SearchIcon),
  shape: 'pill',
  size: 'medium',
  variant: 'outlined',
};

void exampleButtonProps;
void exampleIconButtonProps;

test('button defaults to filled medium with rounded shape and text-only mode', () => {
  const markup = renderToStaticMarkup(createElement(Button, null, 'Save'));

  expect(markup).toContain('type="button"');
  expect(markup).toContain('data-color="neutral"');
  expect(markup).toContain('data-content-mode="text-only"');
  expect(markup).toContain('data-icon-only="false"');
  expect(markup).toContain('data-shape="rounded"');
  expect(markup).toContain('data-size="medium"');
  expect(markup).toContain('data-variant="filled"');
  expect(markup).toContain('>Save<');
});

test('link buttons render the underline decoration by default without a legacy animation flag', () => {
  const markup = renderToStaticMarkup(createElement(Button, { variant: 'link' }, 'Read details'));

  expect(markup).not.toContain('data-animated=');
  expect(markup).toContain(styles.link);
  expect(markup).toContain(styles.linkContent);
  expect(markup).toContain(styles.linkUnderlineDecoration);
});

test('link buttons with icon and text keep one underline decoration across the whole content row', () => {
  const markup = renderToStaticMarkup(
    createElement(Button, { icon: createElement(SearchIcon), variant: 'link' }, 'Read details'),
  );

  expect(markup).toContain(styles.linkContent);
  expect(markup).toContain(styles.contentGraphic);
  expect(markup).toContain(styles.contentLabel);
  expect(markup.match(new RegExp(styles.linkUnderlineDecoration, 'g'))).toHaveLength(1);
});

test('outlined buttons rely on the native border instead of an extra overlay layer', () => {
  const markup = renderToStaticMarkup(
    createElement(Button, { shape: 'pill', variant: 'outlined' }, 'Review copy'),
  );

  expect(markup).toContain(styles.outlined);
  expect(markup).toContain(styles.shapePill);
  expect(markup).not.toContain('<svg');
  expect(markup).not.toContain('outlinedAnimation');
});

test('button falls back to label when children are omitted', () => {
  const markup = renderToStaticMarkup(createElement(Button, { label: 'Continue' }));

  expect(markup).toContain('>Continue<');
  expect(markup).toContain('data-content-mode="text-only"');
});

test('button prefers children over label when both are provided', () => {
  const markup = renderToStaticMarkup(
    createElement(Button, { label: 'Legacy label' }, 'Children win'),
  );

  expect(markup).toContain('>Children win<');
  expect(markup).not.toContain('Legacy label');
});

test('button keeps every documented text variant on the shared API surface', () => {
  const variants = ['filled', 'outlined', 'ghost', 'link'] as const;

  for (const variant of variants) {
    const markup = renderToStaticMarkup(
      createElement(Button, { variant, size: 'large' }, `${variant} action`),
    );

    expect(markup).toContain(`data-variant="${variant}"`);
    expect(markup).toContain('data-content-mode="text-only"');
  }
});

test('button renders explicit icon and visible text as text-with-icon content', () => {
  const markup = renderToStaticMarkup(
    createElement(Button, { icon: createElement(SearchIcon) }, 'Search results'),
  );

  expect(markup).toContain('data-content-mode="text-with-icon"');
  expect(markup).toContain('data-icon-only="false"');
  expect(markup).toContain(styles.contentGraphic);
  expect(markup).toContain(styles.contentLabel);
});

test('button keeps mixed children with visible text out of icon-button mode', () => {
  const markup = renderToStaticMarkup(
    createElement(Button, { variant: 'link' }, 'Read migration', createElement(ChevronRightIcon)),
  );

  expect(markup).toContain('data-content-mode="text-with-icon"');
  expect(markup).toContain('data-variant="link"');
});

test('button treats text-producing custom components as visible text content', () => {
  const ButtonLabel = () => {
    return 'Save changes';
  };

  const markup = renderToStaticMarkup(createElement(Button, null, createElement(ButtonLabel)));

  expect(markup).toContain('Save changes');
  expect(markup).toContain('data-content-mode="text-only"');
});

test('button rejects graphic-only children and asks callers to use the explicit icon API', () => {
  expect(() =>
    renderToStaticMarkup(
      createElement(Button, { 'aria-label': 'Open search' }, createElement(SearchIcon)),
    ),
  ).toThrow('Button no longer infers icon-only mode from children');
});

test('button allows icon-button mode through the icon prop when an accessible name is provided', () => {
  const markup = renderToStaticMarkup(
    createElement(Button, { 'aria-label': 'Open search', icon: createElement(SearchIcon) }),
  );

  expect(markup).toContain('aria-label="Open search"');
  expect(markup).toContain('data-content-mode="icon-button"');
  expect(markup).toContain('data-icon-only="true"');
});

test('button rejects icon-button mode without an accessible name', () => {
  expect(() =>
    renderToStaticMarkup(createElement(Button, { icon: createElement(SearchIcon) })),
  ).toThrow('requires aria-label or aria-labelledby');
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

test('icon button renders the square icon-button mode and matches the Button.Icon alias', () => {
  const iconButtonMarkup = renderToStaticMarkup(
    createElement(IconButton, {
      'aria-label': 'Open search',
      icon: createElement(SearchIcon),
      variant: 'outlined',
    }),
  );
  const aliasMarkup = renderToStaticMarkup(
    createElement(Button.Icon, {
      'aria-label': 'Open search',
      icon: createElement(SearchIcon),
      variant: 'outlined',
    }),
  );

  expect(Button.Icon).toBe(IconButton);
  expect(iconButtonMarkup).toContain('data-content-mode="icon-button"');
  expect(iconButtonMarkup).toContain('data-icon-only="true"');
  expect(iconButtonMarkup).toContain('data-variant="outlined"');
  expect(aliasMarkup).toBe(iconButtonMarkup);
});

test('icon button rejects the link variant because it has no text underline feedback', () => {
  expect(() =>
    renderToStaticMarkup(
      createElement(IconButton, {
        'aria-label': 'Open search',
        icon: createElement(SearchIcon),
        variant: 'link' as never,
      }),
    ),
  ).toThrow('does not support the "link" variant');
});

test('icon button requires the icon prop', () => {
  const invalidIconButtonProps = {
    'aria-label': 'Open search',
  } as unknown as IconButtonProps;

  expect(() => renderToStaticMarkup(createElement(IconButton, invalidIconButtonProps))).toThrow(
    'requires the icon prop',
  );
});

test('button stylesheet protects descenders and keeps the custom underline anchored to link labels', () => {
  expect(stylesheet).toContain('font: 600 var(--button-font-size) / 1.25 var(--ui-font-body);');
  expect(stylesheet).toContain('padding-block-end: 0.08em;');
  expect(stylesheet).toContain('margin-block-end: -0.08em;');
  expect(stylesheet).toContain('.linkContent');
  expect(stylesheet).toContain('.linkUnderlineDecoration');
  expect(stylesheet).toContain('clip-path: inset(0 100% 0 0 round 999px);');
});

test('button stylesheet reveals the link underline on hover without falling back to native underline styling', () => {
  expect(stylesheet).toContain('.link:hover:not(:disabled) .linkUnderlineDecoration');
  expect(stylesheet).toContain('clip-path: inset(0 0 0 0 round 999px);');
  expect(stylesheet).toContain('text-decoration-line: none;');
  expect(stylesheet).not.toContain('text-decoration: underline;');
});

test('button stylesheet uses subdued outlined borders by default and transitions them to the text color on hover', () => {
  expect(stylesheet).toContain('--button-border-color-hover: var(--button-outlined-text-color);');
  expect(stylesheet).toContain('var(--ui-color-text) 14%');
  expect(stylesheet).toContain('var(--ui-color-brand-bg) 32%');
  expect(stylesheet).not.toContain('outlinedAnimation');
  expect(stylesheet).not.toContain('@property --button-outline-progress');
});

test('button stylesheet keeps hover motion safe for disabled and reduced-motion scenarios', () => {
  expect(stylesheet).toContain(':hover:not(:disabled)');
  expect(stylesheet).toContain('@media (prefers-reduced-motion: reduce)');
  expect(stylesheet).toContain('.linkUnderlineDecoration');
  expect(stylesheet).not.toContain('.outlinedAnimationPath');
});
