import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { expect, test } from 'vite-plus/test';

import * as buttonEntry from '../src/button/index.tsx';
import * as rootEntry from '../src';
import * as popoverEntry from '../src/popover/index.tsx';
import * as textEntry from '../src/text/index.tsx';

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
  });
});

test('components subpath entries match the root entry public contract', () => {
  expect(buttonEntry.Button).toBe(rootEntry.Button);
  expect(buttonEntry.IconButton).toBe(rootEntry.IconButton);
  expect(popoverEntry.Popover).toBe(rootEntry.Popover);
  expect(textEntry.Text).toBe(rootEntry.Text);
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
  expect(Object.keys(popoverEntry).sort()).toEqual([
    'Popover',
    'popoverModeOptions',
    'popoverPlacementOptions',
    'popoverShapeOptions',
    'popoverTriggerOptions',
    'popoverVisibilityChangeReasonOptions',
  ]);
  expect(Object.keys(textEntry).sort()).toEqual(['Text', 'textColorFamilyOptions']);
});
