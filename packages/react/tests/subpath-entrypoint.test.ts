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
import * as numberInputEntry from '../src/number-input/index.tsx';
import * as editorEntry from '../src/editor/index.ts';
import * as editorCoreEntry from '../src/editor/core/index.ts';
import * as editorMarkdownAdapterEntry from '../src/editor/adapters/markdown/index.ts';
import * as editorRichTextPluginEntry from '../src/editor/plugins/rich-text/index.tsx';
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
    './editor': {
      default: './dist/editor/index.js',
      import: './dist/editor/index.js',
      types: './dist/editor/index.d.ts',
    },
    './editor/core': {
      default: './dist/editor/core/index.js',
      import: './dist/editor/core/index.js',
      types: './dist/editor/core/index.d.ts',
    },
    './editor/adapters/markdown': {
      default: './dist/editor/adapters/markdown/index.js',
      import: './dist/editor/adapters/markdown/index.js',
      types: './dist/editor/adapters/markdown/index.d.ts',
    },
    './editor/plugins/block-toolbar': {
      default: './dist/editor/plugins/block-toolbar/index.js',
      import: './dist/editor/plugins/block-toolbar/index.js',
      types: './dist/editor/plugins/block-toolbar/index.d.ts',
    },
    './editor/plugins/code': {
      default: './dist/editor/plugins/code/index.js',
      import: './dist/editor/plugins/code/index.js',
      types: './dist/editor/plugins/code/index.d.ts',
    },
    './editor/plugins/floating-toolbar': {
      default: './dist/editor/plugins/floating-toolbar/index.js',
      import: './dist/editor/plugins/floating-toolbar/index.js',
      types: './dist/editor/plugins/floating-toolbar/index.d.ts',
    },
    './editor/plugins/heading': {
      default: './dist/editor/plugins/heading/index.js',
      import: './dist/editor/plugins/heading/index.js',
      types: './dist/editor/plugins/heading/index.d.ts',
    },
    './editor/plugins/history': {
      default: './dist/editor/plugins/history/index.js',
      import: './dist/editor/plugins/history/index.js',
      types: './dist/editor/plugins/history/index.d.ts',
    },
    './editor/plugins/keyboard-shortcut': {
      default: './dist/editor/plugins/keyboard-shortcut/index.js',
      import: './dist/editor/plugins/keyboard-shortcut/index.js',
      types: './dist/editor/plugins/keyboard-shortcut/index.d.ts',
    },
    './editor/plugins/link': {
      default: './dist/editor/plugins/link/index.js',
      import: './dist/editor/plugins/link/index.js',
      types: './dist/editor/plugins/link/index.d.ts',
    },
    './editor/plugins/list': {
      default: './dist/editor/plugins/list/index.js',
      import: './dist/editor/plugins/list/index.js',
      types: './dist/editor/plugins/list/index.d.ts',
    },
    './editor/plugins/markdown-shortcut': {
      default: './dist/editor/plugins/markdown-shortcut/index.js',
      import: './dist/editor/plugins/markdown-shortcut/index.js',
      types: './dist/editor/plugins/markdown-shortcut/index.d.ts',
    },
    './editor/plugins/paste': {
      default: './dist/editor/plugins/paste/index.js',
      import: './dist/editor/plugins/paste/index.js',
      types: './dist/editor/plugins/paste/index.d.ts',
    },
    './editor/plugins/quote': {
      default: './dist/editor/plugins/quote/index.js',
      import: './dist/editor/plugins/quote/index.js',
      types: './dist/editor/plugins/quote/index.d.ts',
    },
    './editor/plugins/rich-text': {
      default: './dist/editor/plugins/rich-text/index.js',
      import: './dist/editor/plugins/rich-text/index.js',
      types: './dist/editor/plugins/rich-text/index.d.ts',
    },
    './editor/plugins/table': {
      default: './dist/editor/plugins/table/index.js',
      import: './dist/editor/plugins/table/index.js',
      types: './dist/editor/plugins/table/index.d.ts',
    },
    './editor/plugins/text-format': {
      default: './dist/editor/plugins/text-format/index.js',
      import: './dist/editor/plugins/text-format/index.js',
      types: './dist/editor/plugins/text-format/index.d.ts',
    },
    './editor/plugins/toolbar': {
      default: './dist/editor/plugins/toolbar/index.js',
      import: './dist/editor/plugins/toolbar/index.js',
      types: './dist/editor/plugins/toolbar/index.d.ts',
    },
    './editor/utils': {
      default: './dist/editor/utils/index.js',
      import: './dist/editor/utils/index.js',
      types: './dist/editor/utils/index.d.ts',
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
    './number-input': {
      default: './dist/number-input/index.js',
      import: './dist/number-input/index.js',
      types: './dist/number-input/index.d.ts',
    },
  });
});

test('components subpath entries match the root entry public contract', () => {
  expect(buttonEntry.Button).toBe(rootEntry.Button);
  expect(buttonEntry.IconButton).toBe(rootEntry.IconButton);
  expect(codeBlockEntry.CodeBlock).toBe(rootEntry.CodeBlock);
  expect(codeBlockEntry.CodeBlockActionButton).toBe(rootEntry.CodeBlockActionButton);
  expect(codeBlockEntry.CodeBlockLanguageButton).toBe(rootEntry.CodeBlockLanguageButton);
  expect(codeBlockEntry.CodeBlockLanguageLabel).toBe(rootEntry.CodeBlockLanguageLabel);
  expect(codeBlockEntry.CodeBlockToolbar).toBe(rootEntry.CodeBlockToolbar);
  expect(fieldEntry.Field).toBe(rootEntry.Field);
  expect(editorEntry.Editor).toBe(rootEntry.Editor);
  expect(editorEntry.markdownEditorAdapter).toBe(rootEntry.markdownEditorAdapter);
  expect(editorEntry.richTextPlugin).toBe(rootEntry.richTextPlugin);
  expect(editorCoreEntry.createEditorPlugin).toBe(rootEntry.createEditorPlugin);
  expect(editorMarkdownAdapterEntry.markdownEditorAdapter).toBe(rootEntry.markdownEditorAdapter);
  expect(editorRichTextPluginEntry.richTextPlugin).toBe(rootEntry.richTextPlugin);
  expect(groupedVirtualMasonryEntry.GroupedVirtualMasonry).toBe(rootEntry.GroupedVirtualMasonry);
  expect(imageMasonryEntry.ImageMasonry).toBe(rootEntry.ImageMasonry);
  expect(imagePreviewEntry.ImagePreview).toBe(rootEntry.ImagePreview);
  expect(markdownRenderEntry.MarkdownRender).toBe(rootEntry.MarkdownRender);
  expect(markdownRenderEntry.markdownRenderSizeOptions).toBe(rootEntry.markdownRenderSizeOptions);
  expect(mermaidRenderEntry.MermaidRender).toBe(rootEntry.MermaidRender);
  expect(mermaidRenderEntry.MindmapRender).toBe(rootEntry.MindmapRender);
  expect(navEntry.Nav).toBe(rootEntry.Nav);
  expect(navOverlayEntry.NavOverlay).toBe(rootEntry.NavOverlay);
  expect(numberInputEntry.NumberInput).toBe(rootEntry.NumberInput);
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
  expect(Object.keys(codeBlockEntry).sort()).toEqual([
    'CodeBlock',
    'CodeBlockActionButton',
    'CodeBlockLanguageButton',
    'CodeBlockLanguageLabel',
    'CodeBlockToolbar',
  ]);
  expect(Object.keys(fieldEntry).sort()).toEqual([
    'Field',
    'useFieldContext',
    'useFieldControlProps',
  ]);
  expect(Object.keys(editorEntry).sort()).toEqual([
    'Editor',
    'EditorPluginCompatibilityError',
    'blockToolbarPlugin',
    'codePlugin',
    'composeEditorPlugins',
    'createEditorPlugin',
    'createEditorPluginCompatibilityError',
    'floatingToolbarPlugin',
    'formatJsonPreservingDuplicateKeys',
    'hasDuplicateJsonObjectKeys',
    'headingPlugin',
    'historyPlugin',
    'isEditorPluginCompatibilityError',
    'keyboardShortcutPlugin',
    'linkPlugin',
    'listPlugin',
    'markdownEditorAdapter',
    'markdownShortcutPlugin',
    'pastePlugin',
    'quotePlugin',
    'richTextPlugin',
    'tablePlugin',
    'textFormatPlugin',
    'toolbarPlugin',
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
  expect(Object.keys(numberInputEntry).sort()).toEqual(['NumberInput']);
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
