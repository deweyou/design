// @vitest-environment jsdom

import '../../test-setup';

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { useEffect } from 'react';
import { $createTableNodeWithDimensions, $isTableCellNode, $isTableRowNode } from '@lexical/table';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { $createTextNode, $getRoot, $isElementNode } from 'lexical';
import { afterEach, expect, test } from 'vite-plus/test';

import { markdownEditorAdapter } from '../../adapters/markdown/index.js';
import { Editor } from '../../editor/index.js';
import { tablePlugin } from './index.js';

const tableStyles = readFileSync(resolve(import.meta.dirname, './index.module.less'), 'utf8');

afterEach(() => {
  cleanup();
});

const SelectTableCellPlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.update(
      () => {
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
      },
      { discrete: true },
    );
  }, [editor]);

  return null;
};

test('tablePlugin aligns table rails without hover size changes', () => {
  expect(tableStyles).toContain('--table-control-rail-size: 0.9rem;');
  expect(tableStyles).toContain('block-size: var(--table-control-rail-size);');
  expect(tableStyles).toContain('inline-size: var(--table-control-rail-size);');
  expect(tableStyles).toContain('border: 0;');
  expect(tableStyles).toContain('.tableHandleButton {\n  display: flex;');
  expect(tableStyles).not.toContain('.tableControlCorner');
  expect(tableStyles).not.toContain('.tableCornerButton');
  expect(tableStyles).not.toContain('.tableRootToolbar');
  expect(tableStyles).not.toContain('.tableHandleMenu');
  expect(tableStyles).not.toContain('.tableActions');
  expect(tableStyles).not.toContain('.tableActionButton');
});

test('tablePlugin keeps boundary insert controls above table rails', () => {
  expect(tableStyles).toContain('--table-insert-button-size: 1.55rem;');
  expect(tableStyles).toContain('--table-insert-line-size: 2px;');
  expect(tableStyles).toContain('z-index: 5;');
  expect(tableStyles).toContain('block-size: var(--table-insert-button-size);');
  expect(tableStyles).toContain('inline-size: var(--table-insert-button-size);');
  expect(tableStyles).toContain('background: var(--ui-color-brand-text);');
  expect(tableStyles).toContain('block-size: var(--table-insert-line-size);');
  expect(tableStyles).toContain('inline-size: var(--table-insert-line-size);');
});

test('tablePlugin renders contextual table tools and boundary insert controls', async () => {
  const user = userEvent.setup();

  render(
    <Editor
      adapter={markdownEditorAdapter()}
      plugins={[
        tablePlugin(),
        {
          name: 'select-table-cell',
          setup: () => <SelectTableCellPlugin />,
          slot: 'after-content',
        },
      ]}
    />,
  );

  expect(await screen.findByRole('button', { name: 'Row 1 actions' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Table tools' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Column 1 actions' })).toBeInTheDocument();

  const table = screen.getByRole('table');

  expect(table.querySelectorAll('tr')).toHaveLength(2);
  await user.click(screen.getByRole('button', { name: 'Insert row between rows 1 and 2' }));
  await waitFor(() => expect(screen.getByRole('table').querySelectorAll('tr')).toHaveLength(3));

  const firstRow = screen.getByRole('table').querySelector('tr');

  expect(firstRow?.querySelectorAll('th, td')).toHaveLength(2);
  await user.click(screen.getByRole('button', { name: 'Insert column between columns 1 and 2' }));
  await waitFor(() =>
    expect(screen.getByRole('table').querySelector('tr')?.querySelectorAll('th, td')).toHaveLength(
      3,
    ),
  );
});

test('tablePlugin shows table controls when hovering a table', async () => {
  const user = userEvent.setup();

  render(
    <Editor
      adapter={markdownEditorAdapter()}
      plugins={[
        tablePlugin({
          initialTable: {
            cells: [
              ['Feature', 'Status'],
              ['Tables', 'Ready'],
            ],
          },
        }),
      ]}
    />,
  );

  await user.hover(await screen.findByRole('table'));

  expect(await screen.findByRole('button', { name: 'Row 1 actions' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Table tools' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Column 1 actions' })).toBeInTheDocument();
});

test('tablePlugin closes open row tools with Escape', async () => {
  const user = userEvent.setup();

  render(
    <Editor
      adapter={markdownEditorAdapter()}
      plugins={[
        tablePlugin(),
        {
          name: 'select-table-cell',
          setup: () => <SelectTableCellPlugin />,
          slot: 'after-content',
        },
      ]}
    />,
  );

  await user.click(await screen.findByRole('button', { name: 'Row 1 actions' }));

  expect(await screen.findByRole('toolbar', { name: 'Row 1 tools' })).toBeInTheDocument();

  await user.keyboard('{Escape}');

  await waitFor(() =>
    expect(screen.queryByRole('toolbar', { name: 'Row 1 tools' })).not.toBeInTheDocument(),
  );
});

test('tablePlugin opens row and column handle toolbars instead of menus', async () => {
  const user = userEvent.setup();

  render(
    <Editor
      adapter={markdownEditorAdapter()}
      plugins={[
        tablePlugin(),
        {
          name: 'select-table-cell',
          setup: () => <SelectTableCellPlugin />,
          slot: 'after-content',
        },
      ]}
    />,
  );

  expect(await screen.findByRole('button', { name: 'Row 1 actions' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Table tools' })).not.toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Row 1 actions' }));

  expect(await screen.findByRole('toolbar', { name: 'Row 1 tools' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Insert row above' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Insert row below' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Delete table' })).toBeInTheDocument();
  expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Column 1 actions' }));

  expect(await screen.findByRole('toolbar', { name: 'Column 1 tools' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Insert column left' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Insert column right' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Delete table' })).toBeInTheDocument();
  expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
});

test('tablePlugin inserts rows and columns from handle toolbars', async () => {
  const user = userEvent.setup();

  render(
    <Editor
      adapter={markdownEditorAdapter()}
      plugins={[
        tablePlugin(),
        {
          name: 'select-table-cell',
          setup: () => <SelectTableCellPlugin />,
          slot: 'after-content',
        },
      ]}
    />,
  );

  expect(await screen.findByRole('button', { name: 'Row 1 actions' })).toBeInTheDocument();
  expect(screen.getByRole('table').querySelectorAll('tr')).toHaveLength(2);

  await user.click(screen.getByRole('button', { name: 'Row 1 actions' }));
  await user.click(await screen.findByRole('button', { name: 'Insert row below' }));

  await waitFor(() => expect(screen.getByRole('table').querySelectorAll('tr')).toHaveLength(3));

  await user.click(screen.getByRole('button', { name: 'Column 1 actions' }));
  await user.click(await screen.findByRole('button', { name: 'Insert column right' }));

  await waitFor(() =>
    expect(screen.getByRole('table').querySelector('tr')?.querySelectorAll('th, td')).toHaveLength(
      3,
    ),
  );
});

test('tablePlugin deletes a table from a handle toolbar', async () => {
  const user = userEvent.setup();

  render(
    <Editor
      adapter={markdownEditorAdapter()}
      plugins={[
        tablePlugin(),
        {
          name: 'select-table-cell',
          setup: () => <SelectTableCellPlugin />,
          slot: 'after-content',
        },
      ]}
    />,
  );

  expect(await screen.findByRole('button', { name: 'Row 1 actions' })).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Row 1 actions' }));
  await user.click(await screen.findByRole('button', { name: 'Delete table' }));

  await waitFor(() => expect(screen.queryByRole('table')).not.toBeInTheDocument());
});

test('tablePlugin deletes a row from the row handle toolbar', async () => {
  const user = userEvent.setup();

  render(
    <Editor
      adapter={markdownEditorAdapter()}
      plugins={[
        tablePlugin(),
        {
          name: 'select-table-cell',
          setup: () => <SelectTableCellPlugin />,
          slot: 'after-content',
        },
      ]}
    />,
  );

  expect(await screen.findByRole('button', { name: 'Row 1 actions' })).toBeInTheDocument();
  expect(screen.getByRole('table').querySelectorAll('tr')).toHaveLength(2);

  await user.click(screen.getByRole('button', { name: 'Row 1 actions' }));
  expect(await screen.findByRole('toolbar', { name: 'Row 1 tools' })).toBeInTheDocument();
  await user.click(await screen.findByRole('button', { name: 'Delete row' }));

  await waitFor(() => expect(screen.getByRole('table').querySelectorAll('tr')).toHaveLength(1));
});

test('tablePlugin deletes a column from the column handle toolbar', async () => {
  const user = userEvent.setup();

  render(
    <Editor
      adapter={markdownEditorAdapter()}
      plugins={[
        tablePlugin(),
        {
          name: 'select-table-cell',
          setup: () => <SelectTableCellPlugin />,
          slot: 'after-content',
        },
      ]}
    />,
  );

  expect(await screen.findByRole('button', { name: 'Column 1 actions' })).toBeInTheDocument();
  expect(screen.getByRole('table').querySelector('tr')?.querySelectorAll('th, td')).toHaveLength(2);

  await user.click(screen.getByRole('button', { name: 'Column 1 actions' }));
  expect(await screen.findByRole('toolbar', { name: 'Column 1 tools' })).toBeInTheDocument();
  await user.click(await screen.findByRole('button', { name: 'Delete column' }));

  await waitFor(() =>
    expect(screen.getByRole('table').querySelector('tr')?.querySelectorAll('th, td')).toHaveLength(
      1,
    ),
  );
});

test('tablePlugin deletes a table after a column has been deleted', async () => {
  const user = userEvent.setup();

  render(
    <Editor
      adapter={markdownEditorAdapter()}
      plugins={[
        tablePlugin(),
        {
          name: 'select-table-cell',
          setup: () => <SelectTableCellPlugin />,
          slot: 'after-content',
        },
      ]}
    />,
  );

  expect(await screen.findByRole('button', { name: 'Column 1 actions' })).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Column 1 actions' }));
  await user.click(await screen.findByRole('button', { name: 'Delete column' }));

  await waitFor(() =>
    expect(screen.getByRole('table').querySelector('tr')?.querySelectorAll('th, td')).toHaveLength(
      1,
    ),
  );
  await waitFor(() =>
    expect(screen.queryByRole('toolbar', { name: 'Column 1 tools' })).not.toBeInTheDocument(),
  );

  await user.click(await screen.findByRole('button', { name: 'Column 1 actions' }));
  await user.click(await screen.findByRole('button', { name: 'Delete table' }));

  await waitFor(() => expect(screen.queryByRole('table')).not.toBeInTheDocument());
});
