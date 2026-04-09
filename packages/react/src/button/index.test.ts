import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createElement, createRef } from 'react';
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
  color: 'danger',
  icon: createElement(SearchIcon),
  shape: 'pill',
  size: 'medium',
  variant: 'outlined',
};

void exampleButtonProps;
void exampleIconButtonProps;

const renderSurface = (
  component: typeof Button | typeof IconButton,
  props: ButtonProps | IconButtonProps,
  ref: unknown = null,
) => {
  return (
    component as unknown as {
      render: (
        componentProps: ButtonProps | IconButtonProps,
        componentRef: unknown,
      ) => {
        props: Record<string, unknown>;
        ref?: unknown;
        type: string;
      };
    }
  ).render(props, ref);
};

test('button defaults to filled medium with rounded shape and text-only mode', () => {
  const markup = renderToStaticMarkup(createElement(Button, null, 'Save'));

  expect(markup).toContain('type="button"');
  expect(markup).toContain('data-color="neutral"');
  expect(markup).toContain('data-content-mode="text-only"');
  expect(markup).toContain('data-icon-only="false"');
  expect(markup).toContain('data-loading="false"');
  expect(markup).toContain('data-shape="rounded"');
  expect(markup).toContain('data-size="medium"');
  expect(markup).toContain('data-variant="filled"');
  expect(markup).toContain('>Save<');
});

test('button renders an anchor root when href is provided and forwards click handlers there', () => {
  let bubbleCount = 0;
  let captureCount = 0;
  const surface = renderSurface(Button, {
    href: '/docs/button',
    htmlType: 'submit',
    onClick: () => {
      bubbleCount += 1;
    },
    onClickCapture: () => {
      captureCount += 1;
    },
    target: '_blank',
    type: 'reset',
    variant: 'outlined',
    children: 'Submit action',
  });

  expect(surface.type).toBe('a');
  expect(surface.props.href).toBe('/docs/button');
  expect(typeof surface.props.onClick).toBe('function');
  expect(typeof surface.props.onClickCapture).toBe('function');
  expect(surface.props.target).toBe('_blank');
  expect(surface.props.type).toBeUndefined();

  (surface.props.onClickCapture as () => void)();
  (surface.props.onClick as () => void)();

  expect(captureCount).toBe(1);
  expect(bubbleCount).toBe(1);
});

test('button rejects target without href', () => {
  expect(() =>
    renderToStaticMarkup(
      createElement(Button, {
        label: 'Invalid link target',
        target: '_blank',
      }),
    ),
  ).toThrow('Button target requires href.');
});

test('button and icon button accept HTMLButtonElement refs on the public API surface', () => {
  const buttonRef = createRef<HTMLButtonElement>();
  const iconButtonRef = createRef<HTMLButtonElement>();
  const buttonSurface = renderSurface(Button, { children: 'Publish' }, buttonRef);
  const iconButtonSurface = renderSurface(
    IconButton,
    {
      'aria-label': 'Open search',
      icon: createElement(SearchIcon),
    },
    iconButtonRef,
  );

  void createElement(Button, { ref: buttonRef }, 'Publish');
  void createElement(IconButton, {
    'aria-label': 'Open search',
    icon: createElement(SearchIcon),
    ref: iconButtonRef,
  });

  expect((buttonSurface as { ref?: unknown }).ref).toBe(buttonRef);
  expect((iconButtonSurface as { ref?: unknown }).ref).toBe(iconButtonRef);
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

test('button styles consume shared semantic theme tokens instead of raw palette steps', () => {
  expect(stylesheet).toContain('--ui-color-brand-bg');
  expect(stylesheet).toContain('--ui-color-danger-bg');
  expect(stylesheet).toContain('--ui-color-link');
  expect(stylesheet).toContain('--ui-color-focus-ring');
  expect(stylesheet).not.toContain('--ui-color-palette-');
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

test('button loading keeps text visible, marks the button as loading, and disables repeated activation', () => {
  const markup = renderToStaticMarkup(createElement(Button, { loading: true }, 'Save changes'));

  expect(markup).toContain('data-content-mode="text-with-icon"');
  expect(markup).toContain('data-loading="true"');
  expect(markup).toContain('disabled=""');
  expect(markup).toContain(styles.loadingIndicator);
  expect(markup).toContain('>Save changes<');
});

test('button link mode renders an anchor when href is provided', () => {
  const markup = renderToStaticMarkup(
    createElement(
      Button,
      {
        href: '/docs/button',
        target: '_blank',
        variant: 'link',
      },
      'Read details',
    ),
  );

  expect(markup.startsWith('<a')).toBe(true);
  expect(markup).toContain('href="/docs/button"');
  expect(markup).toContain('target="_blank"');
  expect(markup).not.toContain('type="button"');
});

test('button loading replaces the leading icon with a spinner in text-with-icon mode', () => {
  const markup = renderToStaticMarkup(
    createElement(Button, { icon: createElement(SearchIcon), loading: true }, 'Search results'),
  );

  expect(markup).toContain(styles.loadingIndicator);
  expect(markup).not.toContain('<svg');
  expect(markup).toContain('>Search results<');
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

test('icon button loading replaces the original icon with a spinner', () => {
  const markup = renderToStaticMarkup(
    createElement(IconButton, {
      'aria-label': 'Refreshing search results',
      icon: createElement(SearchIcon),
      loading: true,
      variant: 'outlined',
    }),
  );

  expect(markup).toContain('data-loading="true"');
  expect(markup).toContain('disabled=""');
  expect(markup).toContain('aria-busy="true"');
  expect(markup).toContain('aria-label="Refreshing search results"');
  expect(markup).toContain(styles.loadingIndicator);
  expect(markup).not.toContain('<svg');
});

test('button keeps loading feedback visible when disabled and loading are both true', () => {
  const markup = renderToStaticMarkup(
    createElement(
      Button,
      {
        disabled: true,
        loading: true,
        variant: 'outlined',
      },
      'Publishing',
    ),
  );

  expect(markup).toContain('data-loading="true"');
  expect(markup).toContain('data-disabled="true"');
  expect(markup).toContain('disabled=""');
  expect(markup).toContain('aria-busy="true"');
  expect(markup).toContain(styles.loadingIndicator);
  expect(markup).toContain('>Publishing<');
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

test('button supports the danger color across the public API', () => {
  const markup = renderToStaticMarkup(
    createElement(Button, { color: 'danger', variant: 'outlined' }, 'Delete item'),
  );

  expect(markup).toContain('data-color="danger"');
  expect(markup).toContain(styles.colorDanger);
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
  expect(stylesheet).toContain(".link:hover:not([data-disabled='true']) .linkUnderlineDecoration");
  expect(stylesheet).toContain('clip-path: inset(0 0 0 0 round 999px);');
  expect(stylesheet).toContain('text-decoration-line: none;');
  expect(stylesheet).not.toContain('text-decoration: underline;');
});

test('button stylesheet includes loading cursor overrides and spinner animation', () => {
  expect(stylesheet).toContain(".root[data-loading='true'][data-disabled='true']");
  expect(stylesheet).toContain('.loadingIndicator');
  expect(stylesheet).toContain('@keyframes button-loading-spin');
  expect(stylesheet).toContain('cursor: default;');
});

test('button stylesheet keeps focus-visible affordance alongside loading and disabled states', () => {
  expect(stylesheet).toContain('.root:focus-visible');
  expect(stylesheet).toContain('outline: 2px solid var(--ui-color-focus-ring);');
  expect(stylesheet).toContain(".root[data-disabled='true']");
});

test('button stylesheet includes the danger color branch for semantic destructive actions', () => {
  expect(stylesheet).toContain('.colorDanger');
  expect(stylesheet).toContain('--ui-color-danger-bg');
  expect(stylesheet).toContain('--ui-color-danger-text');
  expect(stylesheet).toContain('--ui-color-text-on-danger');
});

test('disabled anchor button prevents navigation and stops propagation on both click phases', () => {
  const surface = renderSurface(Button, {
    disabled: true,
    href: '/docs',
    children: 'Disabled link',
  });

  expect(surface.type).toBe('a');
  expect(surface.props.href).toBeUndefined();
  expect(surface.props.tabIndex).toBe(-1);

  let preventCount = 0;
  let stopCount = 0;
  const mockEvent = {
    preventDefault: () => {
      preventCount++;
    },
    stopPropagation: () => {
      stopCount++;
    },
  };

  (surface.props.onClickCapture as (e: unknown) => void)(mockEvent);
  (surface.props.onClick as (e: unknown) => void)(mockEvent);

  expect(preventCount).toBe(2);
  expect(stopCount).toBe(2);
});

test('button rejects empty content when neither children, label, nor icon are provided', () => {
  expect(() => renderToStaticMarkup(createElement(Button, null))).toThrow(
    'requires visible content or the icon prop',
  );
});
