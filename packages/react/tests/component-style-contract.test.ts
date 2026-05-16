import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { expect, test } from 'vite-plus/test';

const reactSourceRoot = resolve(import.meta.dirname, '../src');
const buttonStylesPath = resolve(reactSourceRoot, 'button/index.module.less');
const checkboxStylesPath = resolve(reactSourceRoot, 'checkbox/index.module.less');
const inputStylesPath = resolve(reactSourceRoot, 'input/index.module.less');
const menuStylesPath = resolve(reactSourceRoot, 'menu/index.module.less');
const markdownRenderStylesPath = resolve(reactSourceRoot, 'markdown-render/index.module.less');
const paginationStylesPath = resolve(reactSourceRoot, 'pagination/index.module.less');
const radioGroupStylesPath = resolve(reactSourceRoot, 'radio-group/index.module.less');
const scrollAreaStylesPath = resolve(reactSourceRoot, 'scroll-area/index.module.less');
const selectStylesPath = resolve(reactSourceRoot, 'select/index.module.less');
const skeletonStylesPath = resolve(reactSourceRoot, 'skeleton/index.module.less');
const spinnerStylesPath = resolve(reactSourceRoot, 'spinner/index.module.less');
const switchStylesPath = resolve(reactSourceRoot, 'switch/index.module.less');
const tabsStylesPath = resolve(reactSourceRoot, 'tabs/index.module.less');
const textStylesPath = resolve(reactSourceRoot, 'text/index.module.less');
const toastStylesPath = resolve(reactSourceRoot, 'toast/index.module.less');
const tooltipStylesPath = resolve(reactSourceRoot, 'tooltip/index.module.less');

const collectLessModules = (directory: string): string[] => {
  const entries = readdirSync(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = resolve(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectLessModules(entryPath));
      continue;
    }

    if (entry.name.endsWith('.module.less')) {
      files.push(entryPath);
    }
  }

  return files;
};

test('component styles avoid hardcoded color literals and retired color tokens', () => {
  const lessModules = collectLessModules(reactSourceRoot);

  expect(lessModules.length).toBeGreaterThan(0);

  for (const lessModule of lessModules) {
    const stylesheet = readFileSync(lessModule, 'utf8');

    expect(stylesheet, lessModule).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(stylesheet, lessModule).not.toContain('--ui-color-link');
  }
});

test('button styles keep visual feedback contracts out of component unit tests', () => {
  const stylesheet = readFileSync(buttonStylesPath, 'utf8');

  expect(stylesheet).toContain('@import');
  expect(stylesheet).toContain('.focus-ring-offset()');
  expect(stylesheet).toContain('--ui-color-brand-bg');
  expect(stylesheet).toContain('--ui-color-danger-bg');
  expect(stylesheet).toContain('--ui-color-danger-text');
  expect(stylesheet).toContain('--ui-color-text-on-danger');
  expect(stylesheet).toContain('font: 600 var(--button-font-size) / 1.25 var(--ui-font-body);');
  expect(stylesheet).toContain('padding-block-end: 0.08em;');
  expect(stylesheet).toContain('margin-block-end: -0.08em;');
  expect(stylesheet).toContain('.linkUnderlineDecoration');
  expect(stylesheet).toContain('clip-path: inset(0 100% 0 0 round var(--ui-radius-pill));');
  expect(stylesheet).toContain(".link:hover:not([data-disabled='true']) .linkUnderlineDecoration");
  expect(stylesheet).toContain('clip-path: inset(0 0 0 0 round var(--ui-radius-pill));');
  expect(stylesheet).toContain('text-decoration-line: none;');
  expect(stylesheet).not.toContain('text-decoration: underline;');
  expect(stylesheet).toContain(".root[data-loading='true'][data-disabled='true']");
  expect(stylesheet).toContain(".root[data-loading='true'] .contentGraphic");
  expect(stylesheet).toContain('color: transparent;');
  expect(stylesheet).toContain('.loadingOverlay');
  expect(stylesheet).toContain('.loadingIndicator');
  expect(stylesheet).toContain('@keyframes button-loading-spin');
  expect(stylesheet).toContain('cursor: default;');
});

test('interactive component styles consume shared control and touch target tokens', () => {
  const buttonStylesheet = readFileSync(buttonStylesPath, 'utf8');
  const checkboxStylesheet = readFileSync(checkboxStylesPath, 'utf8');
  const inputStylesheet = readFileSync(inputStylesPath, 'utf8');
  const paginationStylesheet = readFileSync(paginationStylesPath, 'utf8');
  const radioGroupStylesheet = readFileSync(radioGroupStylesPath, 'utf8');
  const selectStylesheet = readFileSync(selectStylesPath, 'utf8');
  const switchStylesheet = readFileSync(switchStylesPath, 'utf8');
  const toastStylesheet = readFileSync(toastStylesPath, 'utf8');

  expect(buttonStylesheet).toContain('--button-height: var(--ui-control-height-xs);');
  expect(buttonStylesheet).toContain('--button-height: var(--ui-control-height-sm);');
  expect(buttonStylesheet).toContain('--button-height: var(--ui-control-height-md);');
  expect(buttonStylesheet).toContain('--button-height: var(--ui-control-height-lg);');
  expect(buttonStylesheet).toContain('--button-height: var(--ui-control-height-xl);');
  expect(paginationStylesheet).toContain('min-inline-size: var(--ui-touch-target-min);');
  expect(paginationStylesheet).toContain('min-block-size: var(--ui-touch-target-min);');
  expect(inputStylesheet).toContain('min-block-size: var(--ui-control-height-sm);');
  expect(inputStylesheet).toContain('min-block-size: var(--ui-control-height-md);');
  expect(inputStylesheet).toContain('min-block-size: var(--ui-control-height-lg);');
  expect(selectStylesheet).toContain('min-block-size: var(--ui-control-height-sm);');
  expect(checkboxStylesheet).toContain('min-block-size: var(--ui-touch-target-min);');
  expect(radioGroupStylesheet).toContain('min-block-size: var(--ui-touch-target-min);');
  expect(switchStylesheet).toContain('min-block-size: var(--ui-touch-target-min);');
  expect(toastStylesheet).toContain('inline-size: var(--ui-touch-target-min);');
  expect(toastStylesheet).toContain('block-size: var(--ui-touch-target-min);');
});

test('overlay and motion styles use shared z-index and motion tokens', () => {
  const menuStylesheet = readFileSync(menuStylesPath, 'utf8');
  const selectStylesheet = readFileSync(selectStylesPath, 'utf8');
  const skeletonStylesheet = readFileSync(skeletonStylesPath, 'utf8');
  const spinnerStylesheet = readFileSync(spinnerStylesPath, 'utf8');
  const toastStylesheet = readFileSync(toastStylesPath, 'utf8');
  const tooltipStylesheet = readFileSync(tooltipStylesPath, 'utf8');

  expect(menuStylesheet).toContain('@menu-z-index: var(--ui-z-dropdown);');
  expect(menuStylesheet).not.toContain("[data-part='trigger']:focus-visible");
  expect(menuStylesheet).toContain('var(--ui-motion-duration-base)');
  expect(menuStylesheet).toContain('var(--ui-motion-ease-standard)');
  expect(selectStylesheet).toContain('z-index: var(--ui-z-dropdown);');
  expect(selectStylesheet).toContain('var(--ui-motion-duration-base)');
  expect(tooltipStylesheet).toContain('z-index: var(--ui-z-tooltip);');
  expect(tooltipStylesheet).toContain('@media (prefers-reduced-motion: reduce)');
  expect(toastStylesheet).toContain('var(--ui-motion-duration-slow)');
  expect(skeletonStylesheet).toContain('@media (prefers-reduced-motion: reduce)');
  expect(spinnerStylesheet).toContain('@media (prefers-reduced-motion: reduce)');
});

test('text styles preserve typography and truncation layout contracts', () => {
  const stylesheet = readFileSync(textStylesPath, 'utf8');

  expect(stylesheet).toContain('--ui-color-text');
  expect(stylesheet).toContain('--ui-font-body');
  expect(stylesheet).toContain('--ui-text-size-body');
  expect(stylesheet).toContain('--text-color-current');
  expect(stylesheet).toContain('--text-background-current');
  expect(stylesheet).toContain('margin-block-start');
  expect(stylesheet).toContain('margin-block-end');
  expect(stylesheet).toContain('-webkit-box-orient');
  expect(stylesheet).toContain('max-block-size');
  expect(stylesheet).not.toContain('border-radius');
  expect(stylesheet).not.toContain('--ui-color-palette-');
});

test('scroll area styles only reveal scrollbars for overflowing directions', () => {
  const stylesheet = readFileSync(scrollAreaStylesPath, 'utf8');

  expect(stylesheet).toContain(
    ".root:hover .scrollbar[data-orientation='vertical'][data-overflow-y]",
  );
  expect(stylesheet).toContain(
    ".root:hover .scrollbar[data-orientation='horizontal'][data-overflow-x]",
  );
  expect(stylesheet).not.toContain('.root:hover .scrollbar,\n.scrollbar[data-scrolling]');
});

test('markdown render styles consume semantic typography and surface tokens', () => {
  const stylesheet = readFileSync(markdownRenderStylesPath, 'utf8');

  expect(stylesheet).toContain('@import');
  expect(stylesheet).toContain('.focus-ring-offset()');
  expect(stylesheet).toContain('--ui-color-text');
  expect(stylesheet).toContain('--ui-color-border');
  expect(stylesheet).toContain('--ui-font-body');
  expect(stylesheet).toContain('--ui-text-size-body');
  expect(stylesheet).toContain('var(--ui-radius-rect)');
  expect(stylesheet).toContain('.root :where(strong, b)');
  expect(stylesheet).toContain('font-weight: var(--ui-font-weight-strong);');
  expect(stylesheet).toContain('.root :where(del, s)');
  expect(stylesheet).toContain('background-position: 0 54%;');
  expect(stylesheet).toContain('text-decoration-line: none;');
  expect(stylesheet).toContain('--markdown-heading-font-size');
  expect(stylesheet).toContain(".heading:where([data-markdown-node='h1'])");
  expect(stylesheet).toContain(".heading:where([data-markdown-node='h6'])");
  expect(stylesheet).toContain('.blockquote :where(.paragraph, .list, .listItem)');
  expect(stylesheet).toContain('color: inherit;');
  expect(stylesheet).toContain('.listItem:has(.taskMarker)');
  expect(stylesheet).toContain('margin-inline-start: -1.2rem;');
  expect(stylesheet).toContain('flex-wrap: wrap;');
  expect(stylesheet).toContain('list-style: none;');
  expect(stylesheet).toContain('background: var(--ui-color-surface);');
  expect(stylesheet).toContain(':global(.hljs-keyword)');
  expect(stylesheet).toContain('--markdown-code-keyword');
  expect(stylesheet).toContain('--markdown-code-max-height');
  expect(stylesheet).toContain('--markdown-table-max-height');
  expect(stylesheet).toContain('overflow-x: hidden;');
  expect(stylesheet).toContain('inline-size: 100%;');
  expect(stylesheet).toContain('min-inline-size: 0;');
  expect(stylesheet).toContain('inline-size: max-content;');
  expect(stylesheet).toContain('min-inline-size: 100%;');
  expect(stylesheet).toContain('position: sticky;');
  expect(stylesheet).toContain('inset-block-start: 0;');
  expect(stylesheet).not.toContain('--markdown-list-max-height');
  expect(stylesheet).toContain('transition:');
  expect(stylesheet).not.toContain('--ui-color-palette-');
});

test('tabs styles consume semantic focus, color, and radius tokens', () => {
  const stylesheet = readFileSync(tabsStylesPath, 'utf8');

  expect(stylesheet).toContain('.focus-ring-offset()');
  expect(stylesheet).toContain('--ui-color-border');
  expect(stylesheet).toContain('--ui-color-brand-bg');
  expect(stylesheet).toContain('--ui-color-text');
  expect(stylesheet).toContain('var(--ui-radius-float)');
  expect(stylesheet).toContain('var(--ui-radius-pill)');
  expect(stylesheet).not.toContain('--ui-color-palette-');
  expect(stylesheet).not.toContain('border-radius: 0.4rem');
  expect(stylesheet).not.toContain('border-radius: 0.3rem');
  expect(stylesheet).not.toContain('border-radius: 999px');
});
