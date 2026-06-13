import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { expect, test } from 'vite-plus/test';

import * as buttonEntry from '../src/button/index.tsx';
import * as codeBlockEntry from '../src/code-block/index.tsx';
import * as fieldEntry from '../src/field/index.tsx';
import * as groupedVirtualMasonryEntry from '../src/grouped-virtual-masonry/index.tsx';
import * as imageMasonryEntry from '../src/image-masonry/index.tsx';
import * as imagePreviewEntry from '../src/image-preview/index.tsx';
import * as markdownRenderEntry from '../src/markdown-render/index.tsx';
import * as mermaidRenderEntry from '../src/mermaid-render/index.tsx';
import * as navEntry from '../src/nav/index.tsx';
import * as navOverlayEntry from '../src/nav-overlay/index.tsx';
import * as rootEntry from '../src';
import * as popoverEntry from '../src/popover/index.tsx';
import * as textEntry from '../src/text/index.tsx';
import * as virtualListEntry from '../src/virtual-list/index.tsx';
import * as virtualMasonryEntry from '../src/virtual-masonry/index.tsx';

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
    './grouped-virtual-masonry': {
      default: './dist/grouped-virtual-masonry/index.js',
      import: './dist/grouped-virtual-masonry/index.js',
      types: './dist/grouped-virtual-masonry/index.d.ts',
    },
    './image-masonry': {
      default: './dist/image-masonry/index.js',
      import: './dist/image-masonry/index.js',
      types: './dist/image-masonry/index.d.ts',
    },
    './image-preview': {
      default: './dist/image-preview/index.js',
      import: './dist/image-preview/index.js',
      types: './dist/image-preview/index.d.ts',
    },
    './markdown-render': {
      default: './dist/markdown-render/index.js',
      import: './dist/markdown-render/index.js',
      types: './dist/markdown-render/index.d.ts',
    },
    './mermaid-render': {
      default: './dist/mermaid-render/index.js',
      import: './dist/mermaid-render/index.js',
      types: './dist/mermaid-render/index.d.ts',
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
    './virtual-masonry': {
      default: './dist/virtual-masonry/index.js',
      import: './dist/virtual-masonry/index.js',
      types: './dist/virtual-masonry/index.d.ts',
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
  expect(groupedVirtualMasonryEntry.GroupedVirtualMasonry).toBe(rootEntry.GroupedVirtualMasonry);
  expect(imageMasonryEntry.ImageMasonry).toBe(rootEntry.ImageMasonry);
  expect(imagePreviewEntry.ImagePreview).toBe(rootEntry.ImagePreview);
  expect(markdownRenderEntry.MarkdownRender).toBe(rootEntry.MarkdownRender);
  expect(markdownRenderEntry.markdownRenderSizeOptions).toBe(rootEntry.markdownRenderSizeOptions);
  expect(mermaidRenderEntry.MermaidRender).toBe(rootEntry.MermaidRender);
  expect(mermaidRenderEntry.MindmapRender).toBe(rootEntry.MindmapRender);
  expect(navEntry.Nav).toBe(rootEntry.Nav);
  expect(navOverlayEntry.NavOverlay).toBe(rootEntry.NavOverlay);
  expect(popoverEntry.Popover).toBe(rootEntry.Popover);
  expect(textEntry.Text).toBe(rootEntry.Text);
  expect(virtualListEntry.VirtualList).toBe(rootEntry.VirtualList);
  expect(virtualMasonryEntry.VirtualMasonry).toBe(rootEntry.VirtualMasonry);
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
  expect(Object.keys(groupedVirtualMasonryEntry).sort()).toEqual(['GroupedVirtualMasonry']);
  expect(Object.keys(imageMasonryEntry).sort()).toEqual(['ImageMasonry']);
  expect(Object.keys(imagePreviewEntry).sort()).toEqual(['ImagePreview']);
  expect(Object.keys(markdownRenderEntry).sort()).toEqual([
    'MarkdownRender',
    'markdownRenderSizeOptions',
  ]);
  expect(Object.keys(mermaidRenderEntry).sort()).toEqual([
    'MermaidRender',
    'MindmapRender',
    'detectMermaidDiagramType',
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
  expect(Object.keys(virtualMasonryEntry).sort()).toEqual(['VirtualMasonry']);
});
