// @vitest-environment jsdom

import '../../test-setup';

import { useEffect } from 'react';
import { $createCodeNode } from '@lexical/code';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createTableNodeWithDimensions, $isTableCellNode, $isTableRowNode } from '@lexical/table';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { $createTextNode, $getRoot, $isElementNode } from 'lexical';
import { afterEach, expect, test } from 'vite-plus/test';

import { markdownEditorAdapter } from '../../adapters/markdown/index.js';
import { Editor } from '../../editor/index.js';
import { codePlugin } from '../code/index.js';
import { tablePlugin } from '../table/index.js';
import { blockToolbarPlugin } from './index';

afterEach(() => {
  cleanup();
});

const SelectCodeBlockPlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.update(() => {
      const code = $createCodeNode('json');
      const text = $createTextNode('{"a":1}');

      code.append(text);
      $getRoot().clear().append(code);
      text.select(0, text.getTextContentSize());
    });
  }, [editor]);

  return null;
};

const SelectTableCellPlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.update(() => {
      const table = $createTableNodeWithDimensions(2, 2, true);
      const firstRow = table.getFirstChildOrThrow();

      if (!$isTableRowNode(firstRow)) {
        throw new Error('Expected a table row.');
      }

      const firstCell = firstRow.getFirstChildOrThrow();

      if (!$isTableCellNode(firstCell)) {
        throw new Error('Expected a table cell.');
      }

      const paragraph = firstCell.getFirstChildOrThrow();
      const text = $createTextNode('Cell');

      if (!$isElementNode(paragraph)) {
        throw new Error('Expected a table cell paragraph.');
      }

      paragraph.clear().append(text);
      $getRoot().clear().append(table);
      text.select(0, text.getTextContentSize());
    });
  }, [editor]);

  return null;
};

test('blockToolbarPlugin hides contextual block actions outside matching blocks', () => {
  render(
    <Editor
      adapter={markdownEditorAdapter()}
      defaultValue="Plain text"
      plugins={[
        codePlugin({
          format: { formatters: { json: (code) => code } },
          wrap: true,
        }),
        tablePlugin(),
        blockToolbarPlugin(),
      ]}
    />,
  );

  expect(screen.queryByRole('toolbar', { name: 'Editor block toolbar' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Code language' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Add column' })).not.toBeInTheDocument();
});

test('blockToolbarPlugin does not render code actions because codePlugin owns code block actions', async () => {
  render(
    <Editor
      adapter={markdownEditorAdapter()}
      plugins={[
        codePlugin({
          format: { formatters: { json: (code) => code } },
          wrap: true,
        }),
        tablePlugin(),
        blockToolbarPlugin(),
        {
          name: 'select-code-block',
          setup: () => <SelectCodeBlockPlugin />,
          slot: 'after-content',
        },
      ]}
    />,
  );

  expect(screen.queryByRole('toolbar', { name: 'Editor block toolbar' })).not.toBeInTheDocument();
  expect(await screen.findByRole('toolbar', { name: 'Code block actions' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Code language' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Wrap code' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Format code' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Add column' })).not.toBeInTheDocument();
});

test('blockToolbarPlugin does not render table actions because tablePlugin owns table tools', async () => {
  const user = userEvent.setup();

  render(
    <Editor
      adapter={markdownEditorAdapter()}
      plugins={[
        codePlugin({
          format: { formatters: { json: (code) => code } },
          wrap: true,
        }),
        tablePlugin(),
        blockToolbarPlugin(),
        {
          name: 'select-table-cell',
          setup: () => <SelectTableCellPlugin />,
          slot: 'after-content',
        },
      ]}
    />,
  );

  expect(await screen.findByRole('button', { name: 'Row 1 actions' })).toBeInTheDocument();
  expect(screen.queryByRole('toolbar', { name: 'Editor block toolbar' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Row 1 actions' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Column 1 actions' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Delete table' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Table tools' })).not.toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Row 1 actions' }));

  expect(await screen.findByRole('toolbar', { name: 'Row 1 tools' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Delete table' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Code language' })).not.toBeInTheDocument();
});
