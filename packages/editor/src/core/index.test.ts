import { createElement } from 'react';
import { expect, test } from 'vite-plus/test';

import {
  composeEditorPlugins,
  createEditorPlugin,
  createEditorPluginCompatibilityError,
  isEditorPluginCompatibilityError,
  type EditorAdapter,
  type EditorPlugin,
} from './index';

test('createEditorPlugin preserves plugin name, slot, and setup', () => {
  const plugin = createEditorPlugin({
    name: 'sample',
    slot: 'before-content',
    setup: () => createElement('span', null, 'sample plugin'),
  });

  expect(plugin.name).toBe('sample');
  expect(plugin.slot).toBe('before-content');
  expect(plugin.setup({ runtime: { kind: 'test', handle: null } })).toMatchObject({
    type: 'span',
  });
});

test('createEditorPlugin defaults to after-content slot', () => {
  const plugin = createEditorPlugin({
    name: 'sample',
    setup: () => null,
  });

  expect(plugin.slot).toBe('after-content');
});

test('composeEditorPlugins keeps order and rejects duplicate names', () => {
  const first = createEditorPlugin({ name: 'first', setup: () => null });
  const second = createEditorPlugin({ name: 'second', setup: () => null });

  expect(composeEditorPlugins([first, second]).map((plugin) => plugin.name)).toEqual([
    'first',
    'second',
  ]);
  expect(() => composeEditorPlugins([first, first])).toThrow(
    'Editor plugin names must be unique: first',
  );
});

test('compatibility errors are recoverable editor errors', () => {
  const error = createEditorPluginCompatibilityError({
    adapter: 'markdown',
    plugin: 'columns',
    reason: 'Markdown cannot serialize column blocks.',
  });

  expect(error.name).toBe('EditorPluginCompatibilityError');
  expect(error.message).toContain('markdown');
  expect(error.message).toContain('columns');
  expect(error.recoverable).toBe(true);
  expect(isEditorPluginCompatibilityError(error)).toBe(true);
  expect(isEditorPluginCompatibilityError(new Error('x'))).toBe(false);
});

test('adapter type keeps content protocol generic', () => {
  const adapter: EditorAdapter<string> = {
    name: 'text',
    createInitialState: ({ value }) => value ?? '',
    readValue: () => 'value',
  };
  const plugin: EditorPlugin = createEditorPlugin({ name: 'plain', setup: () => null });

  expect(adapter.name).toBe('text');
  expect(plugin.name).toBe('plain');
});
