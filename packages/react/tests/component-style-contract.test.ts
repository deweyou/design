import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { expect, test } from 'vite-plus/test';

const reactSourceRoot = resolve(import.meta.dirname, '../src');
const buttonStylesPath = resolve(reactSourceRoot, 'button/index.module.less');
const markdownRenderStylesPath = resolve(reactSourceRoot, 'markdown-render/index.module.less');
const tabsStylesPath = resolve(reactSourceRoot, 'tabs/index.module.less');
const textStylesPath = resolve(reactSourceRoot, 'text/index.module.less');

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
  expect(stylesheet).toContain('.blockquote :where(.paragraph, .list, .listItem)');
  expect(stylesheet).toContain('color: inherit;');
  expect(stylesheet).toContain('.listItem:has(.taskMarker)');
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
