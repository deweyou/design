// @vitest-environment jsdom

import '../../test-setup';

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { isValidElement, useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { cleanup, createEvent, fireEvent, render, screen, within } from '@testing-library/react';
import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical';
import { afterEach, expect, test } from 'vite-plus/test';

import { markdownEditorAdapter } from '../../adapters/markdown/index.js';
import { composeEditorPlugins, createEditorPlugin } from '../../core/index.js';
import { Editor } from '../../editor/index.js';
import { textFormatPlugin } from '../text-format/index.js';
import { floatingToolbarPlugin } from './index';

const toolbarStyles = readFileSync(
  resolve(import.meta.dirname, '../toolbar/index.module.less'),
  'utf8',
);

afterEach(() => {
  cleanup();
});

const SelectTextPlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.update(() => {
      const paragraph = $createParagraphNode();
      const text = $createTextNode('Selected text');

      paragraph.append(text);
      $getRoot().clear().append(paragraph);
      text.select(0, 8);
    });
  }, [editor]);

  return null;
};

test('floatingToolbarPlugin renders floating actions from the plugin registry', () => {
  const registry = composeEditorPlugins([textFormatPlugin(), floatingToolbarPlugin()]);
  const plugin = floatingToolbarPlugin({ actions: ['text-format.bold'] });
  const element = plugin.setup({ registry, runtime: { kind: 'unknown', handle: null } });

  expect(plugin.name).toBe('floating-toolbar');
  expect(isValidElement(element)).toBe(true);
});

test('floatingToolbarPlugin only renders when text is selected', async () => {
  const selectedTextPlugin = createEditorPlugin({
    name: 'select-text',
    setup: () => <SelectTextPlugin />,
  });

  render(
    <Editor
      adapter={markdownEditorAdapter()}
      defaultValue="Floating toolbar"
      plugins={[textFormatPlugin(), floatingToolbarPlugin()]}
    />,
  );

  expect(
    screen.queryByRole('toolbar', { name: 'Editor floating toolbar' }),
  ).not.toBeInTheDocument();

  cleanup();

  render(
    <Editor
      adapter={markdownEditorAdapter()}
      plugins={[textFormatPlugin(), floatingToolbarPlugin(), selectedTextPlugin]}
    />,
  );

  const toolbar = await screen.findByRole('toolbar', { name: 'Editor floating toolbar' });
  const boldButton = within(toolbar).getByRole('button', { name: 'Bold' });
  const pointerDown = createEvent.pointerDown(boldButton);

  fireEvent(boldButton, pointerDown);

  expect(toolbar).toHaveAttribute('data-editor-toolbar-surface', 'floating');
  expect(pointerDown.defaultPrevented).toBe(true);
});

test('floatingToolbarPlugin layers text selection tools above block chrome', () => {
  expect(toolbarStyles).toContain(".toolbar[data-editor-toolbar-surface='floating']");
  expect(toolbarStyles).toContain('z-index: 40;');
  expect(toolbarStyles).toContain('.linkPrompt');
  expect(toolbarStyles).toContain('z-index: 50;');
});
