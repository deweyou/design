import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { expect, test } from 'vite-plus/test';

const reactSourceRoot = resolve(import.meta.dirname, '../src');
const stylesSourceRoot = resolve(import.meta.dirname, '../../styles/src');
const breadcrumbStylesPath = resolve(reactSourceRoot, 'breadcrumb/index.module.less');
const buttonStylesPath = resolve(reactSourceRoot, 'button/index.module.less');
const cardStylesPath = resolve(reactSourceRoot, 'card/index.module.less');
const codeBlockStylesPath = resolve(reactSourceRoot, 'code-block/index.module.less');
const checkboxMarkStylesPath = resolve(reactSourceRoot, 'checkbox-mark/index.module.less');
const checkboxStylesPath = resolve(reactSourceRoot, 'checkbox/index.module.less');
const dialogStylesPath = resolve(reactSourceRoot, 'dialog/index.module.less');
const inputStylesPath = resolve(reactSourceRoot, 'input/index.module.less');
const menuStylesPath = resolve(reactSourceRoot, 'menu/index.module.less');
const markdownRenderStylesPath = resolve(reactSourceRoot, 'markdown-render/index.module.less');
const mermaidRenderStylesPath = resolve(reactSourceRoot, 'mermaid-render/index.module.less');
const navStylesPath = resolve(reactSourceRoot, 'nav/index.module.less');
const navOverlayStylesPath = resolve(reactSourceRoot, 'nav-overlay/index.module.less');
const paginationStylesPath = resolve(reactSourceRoot, 'pagination/index.module.less');
const popoverStylesPath = resolve(reactSourceRoot, 'popover/index.module.less');
const radioGroupStylesPath = resolve(reactSourceRoot, 'radio-group/index.module.less');
const scrollAreaStylesPath = resolve(reactSourceRoot, 'scroll-area/index.module.less');
const selectStylesPath = resolve(reactSourceRoot, 'select/index.module.less');
const skeletonStylesPath = resolve(reactSourceRoot, 'skeleton/index.module.less');
const spinnerStylesPath = resolve(reactSourceRoot, 'spinner/index.module.less');
const switchStylesPath = resolve(reactSourceRoot, 'switch/index.module.less');
const tabsStylesPath = resolve(reactSourceRoot, 'tabs/index.module.less');
const textareaStylesPath = resolve(reactSourceRoot, 'textarea/index.module.less');
const textStylesPath = resolve(reactSourceRoot, 'text/index.module.less');
const toastStylesPath = resolve(reactSourceRoot, 'toast/index.module.less');
const tooltipStylesPath = resolve(reactSourceRoot, 'tooltip/index.module.less');
const bridgeStylesPath = resolve(stylesSourceRoot, 'less/bridge.less');
const legacyMixinsStylesPath = resolve(stylesSourceRoot, 'less/mixins.less');

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
    expect(stylesheet, lessModule).not.toMatch(/\b(?:140|160|260)ms\s+ease\b/);
    expect(stylesheet, lessModule).not.toMatch(/\bz-index:\s*10[0-9]{2}\b/);
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
  expect(stylesheet).toContain('font: 600 var(--button-font-size) / 1.25 var(--ui-font-control);');
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
  expect(buttonStylesheet).toContain('min-block-size: var(--button-height);');
  expect(buttonStylesheet).toContain(
    'inline-size: max(var(--button-square-size), var(--ui-touch-target-min));',
  );
  expect(buttonStylesheet).toContain(
    'block-size: max(var(--button-square-size), var(--ui-touch-target-min));',
  );
  expect(paginationStylesheet).toContain('min-inline-size: var(--ui-touch-target-min);');
  expect(paginationStylesheet).toContain('min-block-size: var(--ui-touch-target-min);');
  expect(inputStylesheet).toContain('min-block-size: var(--ui-control-height-sm);');
  expect(inputStylesheet).toContain('min-block-size: var(--ui-control-height-md);');
  expect(inputStylesheet).toContain('min-block-size: var(--ui-control-height-lg);');
  expect(selectStylesheet).toContain('min-block-size: var(--ui-touch-target-min);');
  expect(checkboxStylesheet).toContain('min-block-size: var(--ui-touch-target-min);');
  expect(checkboxStylesheet).toContain('min-inline-size: var(--ui-touch-target-min);');
  expect(radioGroupStylesheet).toContain('min-block-size: var(--ui-touch-target-min);');
  expect(radioGroupStylesheet).toContain('min-inline-size: var(--ui-touch-target-min);');
  expect(switchStylesheet).toContain('min-block-size: var(--ui-touch-target-min);');
  expect(switchStylesheet).toContain('min-inline-size: var(--ui-touch-target-min);');
  expect(toastStylesheet).toContain('inline-size: var(--ui-touch-target-min);');
  expect(toastStylesheet).toContain('block-size: var(--ui-touch-target-min);');
});

test('overlay and motion styles use shared z-index and motion tokens', () => {
  const dialogStylesheet = readFileSync(dialogStylesPath, 'utf8');
  const menuStylesheet = readFileSync(menuStylesPath, 'utf8');
  const navOverlayStylesheet = readFileSync(navOverlayStylesPath, 'utf8');
  const popoverStylesheet = readFileSync(popoverStylesPath, 'utf8');
  const selectStylesheet = readFileSync(selectStylesPath, 'utf8');
  const skeletonStylesheet = readFileSync(skeletonStylesPath, 'utf8');
  const spinnerStylesheet = readFileSync(spinnerStylesPath, 'utf8');
  const textareaStylesheet = readFileSync(textareaStylesPath, 'utf8');
  const toastStylesheet = readFileSync(toastStylesPath, 'utf8');
  const tooltipStylesheet = readFileSync(tooltipStylesPath, 'utf8');

  expect(dialogStylesheet).toContain('var(--ui-motion-duration-base)');
  expect(dialogStylesheet).toContain('var(--ui-motion-ease-standard)');
  expect(dialogStylesheet).toContain('z-index: var(--ui-z-dialog);');
  expect(dialogStylesheet).not.toContain('z-index: 1090');
  expect(dialogStylesheet).not.toContain('z-index: 1091');
  expect(menuStylesheet).toContain('@menu-z-index: var(--ui-z-dropdown);');
  expect(menuStylesheet).not.toContain("[data-part='trigger']:focus-visible");
  expect(menuStylesheet).toContain('var(--ui-motion-duration-base)');
  expect(menuStylesheet).toContain('var(--ui-motion-ease-standard)');
  expect(navOverlayStylesheet).toContain('env(safe-area-inset-bottom)');
  expect(navOverlayStylesheet).toContain('env(safe-area-inset-top)');
  expect(navOverlayStylesheet).toContain('overscroll-behavior: contain');
  expect(popoverStylesheet).toContain('100dvh');
  expect(popoverStylesheet).toContain('--popover-z-index: var(--ui-z-popover);');
  expect(popoverStylesheet).toContain('var(--ui-motion-duration-base)');
  expect(popoverStylesheet).toContain('var(--ui-motion-ease-standard)');
  expect(selectStylesheet).toContain('z-index: var(--ui-z-dropdown);');
  expect(selectStylesheet).toContain('100dvh');
  expect(selectStylesheet).toContain('var(--ui-motion-duration-base)');
  expect(textareaStylesheet).toContain('var(--ui-motion-duration-fast)');
  expect(textareaStylesheet).not.toContain('140ms ease');
  expect(tooltipStylesheet).toContain('z-index: var(--ui-z-tooltip);');
  expect(tooltipStylesheet).toContain('@media (prefers-reduced-motion: reduce)');
  expect(toastStylesheet).toContain('var(--ui-motion-duration-slow)');
  expect(skeletonStylesheet).toContain('@media (prefers-reduced-motion: reduce)');
  expect(spinnerStylesheet).toContain('@media (prefers-reduced-motion: reduce)');
});

test('interactive surfaces expose hover and focus-visible affordances', () => {
  const breadcrumbStylesheet = readFileSync(breadcrumbStylesPath, 'utf8');
  const cardStylesheet = readFileSync(cardStylesPath, 'utf8');
  const checkboxMarkStylesheet = readFileSync(checkboxMarkStylesPath, 'utf8');
  const checkboxStylesheet = readFileSync(checkboxStylesPath, 'utf8');
  const navStylesheet = readFileSync(navStylesPath, 'utf8');
  const paginationStylesheet = readFileSync(paginationStylesPath, 'utf8');
  const radioGroupStylesheet = readFileSync(radioGroupStylesPath, 'utf8');
  const scrollAreaStylesheet = readFileSync(scrollAreaStylesPath, 'utf8');

  expect(cardStylesheet).toContain('.root:where(a)');
  expect(cardStylesheet).toContain('&:focus-visible');
  expect(breadcrumbStylesheet).toContain('&:hover');
  expect(breadcrumbStylesheet).toContain('.focus-ring-offset()');
  expect(breadcrumbStylesheet).not.toContain('&::after');
  expect(breadcrumbStylesheet).not.toContain('clip-path');
  expect(checkboxStylesheet).toContain('.root:hover:not([data-disabled]) [data-ui-checkbox-mark]');
  expect(checkboxMarkStylesheet).toContain(".mark[data-state='checked']");
  expect(checkboxMarkStylesheet).toContain(".mark[data-state='indeterminate']");
  expect(checkboxMarkStylesheet).toContain(":not([data-readonly='true'])");
  expect(radioGroupStylesheet).toContain('.item:hover:not([data-disabled]) .control');
  expect(navStylesheet).not.toContain('background var(--ui-motion-duration-fast)');
  expect(navStylesheet).not.toContain('background: color-mix(in srgb, var(--ui-color-text) 8%');
  expect(navStylesheet).toContain('min-block-size: var(--ui-touch-target-min);');
  expect(paginationStylesheet).toContain('&:hover:not([data-disabled]):not([data-selected])');
  expect(paginationStylesheet).toContain('&:focus-visible');
  expect(scrollAreaStylesheet).toContain('&:focus-visible');
  expect(scrollAreaStylesheet).toContain('.root:focus-within .scrollbar');
});

test('focus mixins keep visible keyboard focus without native outline styling', () => {
  const bridgeStylesheet = readFileSync(bridgeStylesPath, 'utf8');
  const legacyMixinsStylesheet = readFileSync(legacyMixinsStylesPath, 'utf8');

  expect(bridgeStylesheet).toContain('border-color: var(--ui-color-focus-ring);');
  expect(bridgeStylesheet).toContain(
    'box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ui-color-focus-ring) 42%, transparent);',
  );
  expect(bridgeStylesheet).toContain('outline: none;');
  expect(bridgeStylesheet).not.toMatch(/box-shadow:\s*0 0 0 [234]px/);
  expect(legacyMixinsStylesheet).not.toContain('outline: 2px solid var(--ui-color-focus-ring);');
  expect(legacyMixinsStylesheet).toContain('border-color: var(--ui-color-focus-ring);');
  expect(legacyMixinsStylesheet).not.toMatch(/box-shadow:\s*0 0 0 [234]px/);
});

test('field focus states use border color while invalid state keeps priority', () => {
  const inputStylesheet = readFileSync(inputStylesPath, 'utf8');
  const textareaStylesheet = readFileSync(textareaStylesPath, 'utf8');

  for (const stylesheet of [inputStylesheet, textareaStylesheet]) {
    expect(stylesheet).toContain('&:focus-visible');
    expect(stylesheet).toContain('border-color: var(--ui-color-focus-ring);');
    expect(stylesheet).toContain('.fieldError');
    expect(stylesheet).toContain('border-color: var(--ui-color-danger-bg);');
    expect(stylesheet).not.toContain('box-shadow: 0 0 0 2px');
  }
});

test('responsive styles use the shared compact breakpoint standard', () => {
  const bridgeStylesheet = readFileSync(bridgeStylesPath, 'utf8');
  const lessModules = collectLessModules(reactSourceRoot);

  expect(bridgeStylesheet).toContain('@ui-breakpoint-compact: 30rem;');

  for (const lessModule of lessModules) {
    const stylesheet = readFileSync(lessModule, 'utf8');

    expect(stylesheet, lessModule).not.toMatch(/@media\s*\([^)]*(?:480|500|520)px/);
  }
});

test('text styles preserve typography and truncation layout contracts', () => {
  const stylesheet = readFileSync(textStylesPath, 'utf8');

  expect(stylesheet).toContain('--ui-color-text');
  expect(stylesheet).toContain('--ui-font-content');
  expect(stylesheet).toContain('--ui-font-display');
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

test('scrollable component surfaces consume shared scrollbar styles', () => {
  const bridgeStylesheet = readFileSync(bridgeStylesPath, 'utf8');
  const dialogStylesheet = readFileSync(dialogStylesPath, 'utf8');
  const menuStylesheet = readFileSync(menuStylesPath, 'utf8');
  const mermaidRenderStylesheet = readFileSync(mermaidRenderStylesPath, 'utf8');
  const navStylesheet = readFileSync(navStylesPath, 'utf8');
  const navOverlayStylesheet = readFileSync(navOverlayStylesPath, 'utf8');
  const popoverStylesheet = readFileSync(popoverStylesPath, 'utf8');
  const scrollAreaStylesheet = readFileSync(scrollAreaStylesPath, 'utf8');
  const selectStylesheet = readFileSync(selectStylesPath, 'utf8');

  expect(bridgeStylesheet).toContain('.scrollbar-tokens()');
  expect(bridgeStylesheet).toContain('.native-scrollbar()');
  expect(bridgeStylesheet).toContain('--ui-scrollbar-thumb-bg');
  expect(bridgeStylesheet).toContain(
    '--ui-scrollbar-thumb-bg: color-mix(in srgb, var(--ui-color-text) 26%, transparent);',
  );
  expect(bridgeStylesheet).not.toContain(
    '--ui-scrollbar-thumb-bg: color-mix(in srgb, var(--ui-color-brand-bg)',
  );
  expect(bridgeStylesheet).toContain('--ui-scrollbar-track-padding: 1px;');
  expect(scrollAreaStylesheet).toContain('.scrollbar-tokens()');
  expect(scrollAreaStylesheet).toContain('opacity: var(--ui-scrollbar-opacity);');
  expect(scrollAreaStylesheet).toContain('background: var(--ui-scrollbar-thumb-bg);');
  expect(mermaidRenderStylesheet).toContain('.mermaidScrollArea');
  expect(mermaidRenderStylesheet).not.toContain('.native-scrollbar()');

  for (const stylesheet of [
    dialogStylesheet,
    menuStylesheet,
    navStylesheet,
    navOverlayStylesheet,
    popoverStylesheet,
    selectStylesheet,
  ]) {
    expect(stylesheet).toContain('.native-scrollbar()');
  }
});

test('markdown render styles consume semantic typography and surface tokens', () => {
  const stylesheet = readFileSync(markdownRenderStylesPath, 'utf8');
  const codeBlockStylesheet = readFileSync(codeBlockStylesPath, 'utf8');
  const checkboxMarkStylesheet = readFileSync(checkboxMarkStylesPath, 'utf8');

  expect(stylesheet).toContain('@import');
  expect(stylesheet).toContain('.focus-ring-offset()');
  expect(stylesheet).toContain('--ui-color-text');
  expect(stylesheet).toContain('--ui-color-border');
  expect(stylesheet).toContain('--ui-font-content');
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
  expect(stylesheet).toContain('margin-block-start: 0.12em;');
  expect(stylesheet).not.toContain('.taskMarkerIndicator');
  expect(stylesheet).toContain('--markdown-link-color');
  expect(stylesheet).toContain('--markdown-link-color-hover');
  expect(stylesheet).toContain('color: var(--markdown-link-color);');
  expect(stylesheet).toContain('color: var(--markdown-link-color-hover);');
  expect(stylesheet).not.toContain('color: var(--ui-color-brand-bg);');
  expect(stylesheet).not.toContain('color: var(--ui-color-brand-bg-hover);');
  expect(codeBlockStylesheet).toContain(':global(.hljs-keyword)');
  expect(codeBlockStylesheet).toContain(":global([data-theme='dark']) .root");
  expect(codeBlockStylesheet).toContain('--code-block-bg');
  expect(codeBlockStylesheet).toContain('--code-block-border');
  expect(codeBlockStylesheet).toContain('--code-block-highlight');
  expect(codeBlockStylesheet).toContain('--code-block-actions-bg');
  expect(codeBlockStylesheet).toContain('background: var(--code-block-bg);');
  expect(codeBlockStylesheet).toContain('border: 1px solid var(--code-block-border);');
  expect(codeBlockStylesheet).toContain('background: var(--code-block-actions-bg);');
  expect(codeBlockStylesheet).toContain('border: 1px solid var(--code-block-actions-border);');
  expect(codeBlockStylesheet).toContain('.toolbar');
  expect(codeBlockStylesheet).toContain('position: relative;');
  expect(codeBlockStylesheet).toContain('.headerToolbar');
  expect(codeBlockStylesheet).toContain('background: var(--code-block-bg);');
  expect(codeBlockStylesheet).toContain('border-block-end: 1px solid var(--code-block-border);');
  expect(stylesheet).toContain('--markdown-code-keyword');
  expect(stylesheet).toContain(":global([data-theme='dark']) .root");
  expect(stylesheet).toContain('--code-block-keyword: var(--markdown-code-keyword);');
  expect(codeBlockStylesheet).toContain('--code-block-keyword');
  expect(codeBlockStylesheet).toContain('block-size: 1.75rem;');
  expect(codeBlockStylesheet).toContain('inline-size: 1.75rem;');
  expect(codeBlockStylesheet).toContain('inset: calc((1.75rem - var(--ui-touch-target-min)) / 2);');
  expect(codeBlockStylesheet).not.toContain(
    'margin-block: calc((1.35rem - var(--ui-touch-target-min)) / 2);',
  );
  expect(stylesheet).toContain('--markdown-code-max-height');
  expect(stylesheet).toContain('--code-block-max-height: var(--markdown-code-max-height);');
  expect(stylesheet).toContain('--markdown-table-max-height');
  expect(stylesheet).toContain('overflow-x: hidden;');
  expect(stylesheet).toContain('inline-size: 100%;');
  expect(stylesheet).toContain('min-inline-size: 0;');
  expect(stylesheet).toContain('inline-size: max-content;');
  expect(stylesheet).toContain('min-inline-size: 100%;');
  expect(stylesheet).toContain('position: sticky;');
  expect(stylesheet).toContain('inset-block-start: 0;');
  expect(stylesheet).not.toContain('--markdown-list-max-height');
  expect(checkboxMarkStylesheet).toContain('transition:');
  expect(stylesheet).not.toContain('--ui-color-palette-');
});

test('mermaid render styles use sans typography even inside content surfaces', () => {
  const stylesheet = readFileSync(mermaidRenderStylesPath, 'utf8');

  expect(stylesheet).toContain('--mermaid-zoom: 1;');
  expect(stylesheet).toContain(":global([data-theme='dark']) .root");
  expect(stylesheet).toContain('--mermaid-toolbar-highlight');
  expect(stylesheet).toContain('--mermaid-root-bg');
  expect(stylesheet).toContain('--mermaid-root-border');
  expect(stylesheet).toContain('--mermaid-scroll-max-height: min(70vh, 36rem);');
  expect(stylesheet).toContain('cursor: grab;');
  expect(stylesheet).toContain('cursor: grabbing;');
  expect(stylesheet).toContain('touch-action: none;');
  expect(stylesheet).toContain('user-select: none;');
  expect(stylesheet).toContain(
    ".mermaidScrollArea:has(.scrollerViewport[data-mermaid-scroll-measured='true'])",
  );
  expect(stylesheet).toContain('calc(var(--mermaid-scroll-height) + 1.6rem + 2px)');
  expect(stylesheet).toContain('min-block-size: 100%;');
  expect(stylesheet).toContain('block-size: var(--mermaid-zoom-height, auto);');
  expect(stylesheet).toContain('inline-size: var(--mermaid-zoom-width, max-content);');
  expect(stylesheet).toContain('overflow: hidden;');
  expect(stylesheet).toContain(".zoomViewport[data-mermaid-zoom-measured='true'] .zoomContent");
  expect(stylesheet).toContain('transform: scale(var(--mermaid-zoom));');
  expect(stylesheet).toContain('transform-origin: 0 0;');
  expect(stylesheet).toContain('border-radius: 999px;');
  expect(stylesheet).toContain('block-size: 1.75rem;');
  expect(stylesheet).toContain('inline-size: 1.75rem;');
  expect(stylesheet).toContain('inset: calc((1.75rem - var(--ui-touch-target-min)) / 2);');
  expect(stylesheet).toContain('font-family: var(--ui-font-sans);');
  expect(stylesheet).toContain('.svgHost svg :where(text, tspan, foreignObject, span, div)');
  expect(stylesheet).toContain('color-mix(in srgb, var(--ui-color-success-bg)');
  expect(stylesheet).toContain('fill: var(--mermaid-root-bg);');
  expect(stylesheet).toContain('stroke: var(--mermaid-root-border);');
  expect(stylesheet).toContain('fill: var(--mermaid-root-text);');
  expect(stylesheet).toContain('.mindmapNodeToggle');
  expect(stylesheet).toContain('.mindmapNodeToggleCircle');
  expect(stylesheet).toContain('.mindmapNodeToggleMark');
  expect(stylesheet).toContain('stroke-linecap: round;');
  expect(stylesheet).not.toContain('fill: var(--ui-color-text);');
  expect(stylesheet).not.toContain('--mindmap-branch-2: var(--ui-color-success-bg);');
  expect(stylesheet).not.toContain('--mindmap-branch-3: var(--ui-color-warning-bg);');
  expect(stylesheet).not.toContain('--mindmap-branch-4: var(--ui-color-danger-bg);');
  expect(stylesheet).not.toContain('font-family: var(--ui-font-content);');
  expect(stylesheet).not.toContain('font-family: var(--ui-font-display);');
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
