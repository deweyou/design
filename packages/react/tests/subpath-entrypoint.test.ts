import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { expect, test } from 'vite-plus/test';

import * as buttonEntry from '../src/button/index.tsx';
import * as codeBlockEntry from '../src/code-block/index.tsx';
import * as fieldEntry from '../src/field/index.tsx';
import * as markdownRenderEntry from '../src/markdown-render/index.tsx';
import * as navEntry from '../src/nav/index.tsx';
import * as navOverlayEntry from '../src/nav-overlay/index.tsx';
import * as rootEntry from '../src';
import * as popoverEntry from '../src/popover/index.tsx';
import * as textEntry from '../src/text/index.tsx';
import * as virtualListEntry from '../src/virtual-list/index.tsx';

const root = resolve(import.meta.dirname, '../../..');
const componentRoot = resolve(root, 'packages/react');

test('components package exposes button, popover, and text subpath exports in package.json', () => {
  const packageJson = JSON.parse(readFileSync(resolve(componentRoot, 'package.json'), 'utf8')) as {
    exports: Record<string, { default?: string; import?: string; types?: string } | string>;
  };

  expect(packageJson.exports).toMatchObject({
    '.': {
      default: './dist/index.js',
      import: './dist/index.js',
      types: './dist/index.d.ts',
    },
    './button': {
      default: './dist/button/index.js',
      import: './dist/button/index.js',
      types: './dist/button/index.d.ts',
    },
    './code-block': {
      default: './dist/code-block/index.js',
      import: './dist/code-block/index.js',
      types: './dist/code-block/index.d.ts',
    },
    './field': {
      default: './dist/field/index.js',
      import: './dist/field/index.js',
      types: './dist/field/index.d.ts',
    },
    './markdown-render': {
      default: './dist/markdown-render/index.js',
      import: './dist/markdown-render/index.js',
      types: './dist/markdown-render/index.d.ts',
    },
    './popover': {
      default: './dist/popover/index.js',
      import: './dist/popover/index.js',
      types: './dist/popover/index.d.ts',
    },
    './text': {
      default: './dist/text/index.js',
      import: './dist/text/index.js',
      types: './dist/text/index.d.ts',
    },
    './virtual-list': {
      default: './dist/virtual-list/index.js',
      import: './dist/virtual-list/index.js',
      types: './dist/virtual-list/index.d.ts',
    },
    './nav': {
      default: './dist/nav/index.js',
      import: './dist/nav/index.js',
      types: './dist/nav/index.d.ts',
    },
    './nav-overlay': {
      default: './dist/nav-overlay/index.js',
      import: './dist/nav-overlay/index.js',
      types: './dist/nav-overlay/index.d.ts',
    },
  });
});

test('components subpath entries match the root entry public contract', () => {
  expect(buttonEntry.Button).toBe(rootEntry.Button);
  expect(buttonEntry.IconButton).toBe(rootEntry.IconButton);
  expect(codeBlockEntry.CodeBlock).toBe(rootEntry.CodeBlock);
  expect(fieldEntry.Field).toBe(rootEntry.Field);
  expect(markdownRenderEntry.MarkdownRender).toBe(rootEntry.MarkdownRender);
  expect(markdownRenderEntry.markdownRenderSizeOptions).toBe(rootEntry.markdownRenderSizeOptions);
  expect(navEntry.Nav).toBe(rootEntry.Nav);
  expect(navOverlayEntry.NavOverlay).toBe(rootEntry.NavOverlay);
  expect(popoverEntry.Popover).toBe(rootEntry.Popover);
  expect(textEntry.Text).toBe(rootEntry.Text);
  expect(virtualListEntry.VirtualList).toBe(rootEntry.VirtualList);
});

test('components subpath entries expose their public API without requiring the package root', () => {
  expect(Object.keys(buttonEntry).sort()).toEqual([
    'Button',
    'IconButton',
    'buttonColorOptions',
    'buttonDefaultShapeByVariant',
    'buttonShapeOptions',
    'buttonShapeSupport',
    'buttonShapeableVariantOptions',
    'buttonSizeOptions',
    'buttonVariantOptions',
    'iconButtonVariantOptions',
  ]);
  expect(Object.keys(codeBlockEntry).sort()).toEqual(['CodeBlock']);
  expect(Object.keys(fieldEntry).sort()).toEqual([
    'Field',
    'useFieldContext',
    'useFieldControlProps',
  ]);
  expect(Object.keys(markdownRenderEntry).sort()).toEqual([
    'MarkdownRender',
    'markdownRenderSizeOptions',
  ]);
  expect(Object.keys(popoverEntry).sort()).toEqual([
    'Popover',
    'popoverModeOptions',
    'popoverPlacementOptions',
    'popoverShapeOptions',
    'popoverTriggerOptions',
    'popoverVisibilityChangeReasonOptions',
  ]);
  expect(Object.keys(textEntry).sort()).toEqual(['Text', 'textColorFamilyOptions']);
  expect(Object.keys(virtualListEntry).sort()).toEqual(['VirtualList']);
});
