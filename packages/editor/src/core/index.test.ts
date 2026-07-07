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

  expect(composeEditorPlugins([first, second]).plugins.map((plugin) => plugin.name)).toEqual([
    'first',
    'second',
  ]);
  expect(() => composeEditorPlugins([first, first])).toThrow(
    'Editor plugin names must be unique: first',
  );
});

test('composeEditorPlugins aggregates feature contributions into a registry', () => {
  const setup = () => createElement('span', null, 'setup');
  const node = { name: 'TestNode' };
  const command = {
    id: 'feature-a.run',
    run: () => undefined,
  };
  const plugin = createEditorPlugin({
    name: 'feature-a',
    feature: { id: 'feature-a' },
    nodes: [node],
    commands: [command],
    toolbarActions: [{ command: 'feature-a.run', id: 'feature-a.run', label: 'Run' }],
    markdownShortcuts: [
      {
        feature: 'feature-a',
        transformers: ['shortcut'],
      },
    ],
    keyboardShortcuts: [
      {
        command: 'feature-a.run',
        id: 'feature-a.shortcut',
        key: 'mod+r',
      },
    ],
    pasteHandlers: [
      {
        feature: 'feature-a',
        handle: () => false,
      },
    ],
    setup,
  });
  const registry = composeEditorPlugins([plugin]);

  expect(registry.plugins).toEqual([plugin]);
  expect(registry.features.get('feature-a')).toEqual({ id: 'feature-a' });
  expect(registry.nodes).toEqual([node]);
  expect(registry.commands.get('feature-a.run')).toEqual(command);
  expect(registry.toolbarActions.map((action) => action.id)).toEqual(['feature-a.run']);
  expect(registry.markdownShortcuts.map((shortcut) => shortcut.feature)).toEqual(['feature-a']);
  expect(registry.keyboardShortcuts.map((shortcut) => shortcut.id)).toEqual(['feature-a.shortcut']);
  expect(registry.pasteHandlers.map((handler) => handler.feature)).toEqual(['feature-a']);
});

test('composeEditorPlugins validates feature dependencies and action references', () => {
  const feature = createEditorPlugin({
    name: 'feature',
    feature: { id: 'feature' },
    setup: () => null,
  });

  expect(() =>
    composeEditorPlugins([
      feature,
      createEditorPlugin({
        name: 'other-feature',
        feature: { id: 'feature' },
        setup: () => null,
      }),
    ]),
  ).toThrow('Editor feature ids must be unique: feature');

  expect(() =>
    composeEditorPlugins([
      createEditorPlugin({
        name: 'dependent',
        requires: ['missing'],
        setup: () => null,
      }),
    ]),
  ).toThrow('Editor plugin "dependent" requires missing feature: missing');

  expect(() =>
    composeEditorPlugins([
      createEditorPlugin({
        name: 'broken-action',
        toolbarActions: [{ command: 'missing.run', id: 'broken.run', label: 'Broken' }],
        setup: () => null,
      }),
    ]),
  ).toThrow('Editor action "broken.run" references unknown command: missing.run');

  expect(() =>
    composeEditorPlugins([
      createEditorPlugin({
        name: 'first-action',
        commands: [{ id: 'run', run: () => undefined }],
        toolbarActions: [{ command: 'run', id: 'duplicate', label: 'Duplicate' }],
        setup: () => null,
      }),
      createEditorPlugin({
        name: 'second-action',
        commands: [{ id: 'run-again', run: () => undefined }],
        toolbarActions: [{ command: 'run-again', id: 'duplicate', label: 'Duplicate' }],
        setup: () => null,
      }),
    ]),
  ).toThrow('Editor action ids must be unique: duplicate');
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
