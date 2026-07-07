// @vitest-environment jsdom

import '../../test-setup';

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { useEffect } from 'react';
import {
  $createTableNodeWithDimensions,
  $createTableSelectionFrom,
  $isTableCellNode,
  $isTableRowNode,
} from '@lexical/table';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { $createTextNode, $getRoot, $isElementNode, $setSelection } from 'lexical';
import { afterEach, expect, test, vi } from 'vite-plus/test';

import { markdownEditorAdapter } from '../../adapters/markdown/index.js';
import { Editor } from '../../editor/index.js';
import { tablePlugin } from './index.js';

const tableStyles = readFileSync(resolve(import.meta.dirname, './index.module.less'), 'utf8');

const rect = ({ height = 0, left = 0, top = 0, width = 0 }: Partial<DOMRect>) =>
  ({
    bottom: top + height,
    height,
    left,
    right: left + width,
    top,
    width,
    x: left,
    y: top,
    toJSON: () => ({}),
  }) as DOMRect;

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const SelectTableCellPlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.update(
      () => {
        const table = $createTableNodeWithDimensions(2, 2, false);
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

const SelectTableRangePlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.update(
      () => {
        const table = $createTableNodeWithDimensions(3, 3, true);
        const firstRow = table.getFirstChildOrThrow();
        const secondRow = firstRow.getNextSibling();

        if (!$isTableRowNode(firstRow) || !$isTableRowNode(secondRow)) {
          throw new Error('Expected table rows.');
        }

        const anchorCell = firstRow.getFirstChildOrThrow();
        const focusCell = secondRow.getChildAtIndex(1);

        if (!$isTableCellNode(anchorCell) || !$isTableCellNode(focusCell)) {
          throw new Error('Expected table cells.');
        }

        $getRoot().clear().append(table);
        $setSelection($createTableSelectionFrom(table, anchorCell, focusCell));
      },
      { discrete: true },
    );
  }, [editor]);

  return null;
};

test('tablePlugin aligns table rails without hover size changes', () => {
  expect(tableStyles).toContain('--table-control-rail-size: 0.625rem;');
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
  expect(tableStyles).toContain('--table-insert-button-size: 0.9rem;');
  expect(tableStyles).toContain('--table-insert-line-size: 2px;');
  expect(tableStyles).toContain('z-index: 5;');
  expect(tableStyles).toContain('block-size: var(--table-insert-button-size);');
  expect(tableStyles).toContain('inline-size: var(--table-insert-button-size);');
  expect(tableStyles).toContain('background: var(--ui-color-brand-text);');
  expect(tableStyles).toContain('block-size: var(--table-insert-line-size);');
  expect(tableStyles).toContain('inline-size: var(--table-insert-line-size);');
  expect(tableStyles).toContain('inset-inline-start: calc(var(--table-control-rail-size) / 2);');
  expect(tableStyles).toContain('inset-block-start: calc(var(--table-control-rail-size) / 2);');
});

test('tablePlugin leaves boundary hit testing to visible insert buttons', () => {
  expect(tableStyles).toMatch(/\.rowBoundary,\n\.columnBoundary \{[\s\S]*?pointer-events: none;/);
  expect(tableStyles).toMatch(/\.boundaryButton \{[\s\S]*?pointer-events: auto;/);
});

test('tablePlugin highlights active axis tools without adding a border', () => {
  const activeRule = tableStyles.match(/&\[data-active='true'\] \{(?<rule>[\s\S]*?)\n  \}/)?.groups
    ?.rule;

  expect(activeRule).toContain('background: color-mix');
  expect(activeRule).not.toContain('border-color:');
});

test('tablePlugin anchors table controls in editor scroll space', async () => {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
    function (this: HTMLElement) {
      if (this.matches('[data-editor-root]')) {
        return rect({ height: 500, left: 100, top: 200, width: 600 });
      }

      if (this.tagName === 'TABLE') {
        return rect({ height: 140, left: 160, top: 280, width: 420 });
      }

      if (this.tagName === 'TR') {
        return rect({ height: 70, left: 160, top: 280, width: 420 });
      }

      if (this.tagName === 'TH' || this.tagName === 'TD') {
        return rect({ height: 70, left: 160, top: 280, width: 210 });
      }

      return rect({});
    },
  );

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

  const overlay = await screen.findByRole('toolbar', { name: 'Row controls' });
  const tableTools = overlay.closest('[data-editor-table-tools]');

  expect(tableStyles).toMatch(/\.tableOverlay \{[\s\S]*?position: absolute;/);
  expect(tableTools).toBeInstanceOf(HTMLElement);
  expect((tableTools as HTMLElement).style.insetBlockStart).toBe('80px');
  expect((tableTools as HTMLElement).style.insetInlineStart).toBe('60px');
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
  expect(screen.getByRole('table').querySelectorAll('col')).toHaveLength(3);
});

test('tablePlugin marks row and column handles active for selected cells', async () => {
  render(
    <Editor
      adapter={markdownEditorAdapter()}
      plugins={[
        tablePlugin(),
        {
          name: 'select-table-range',
          setup: () => <SelectTableRangePlugin />,
          slot: 'after-content',
        },
      ]}
    />,
  );

  expect(await screen.findByRole('button', { name: 'Column 1 actions' })).toBeInTheDocument();

  expect(screen.getByRole('button', { name: 'Column 1 actions' }).parentElement).toHaveAttribute(
    'data-active',
    'true',
  );
  expect(screen.getByRole('button', { name: 'Column 2 actions' }).parentElement).toHaveAttribute(
    'data-active',
    'true',
  );
  expect(
    screen.getByRole('button', { name: 'Column 3 actions' }).parentElement,
  ).not.toHaveAttribute('data-active');
  expect(screen.getByRole('button', { name: 'Row 1 actions' }).parentElement).toHaveAttribute(
    'data-active',
    'true',
  );
  expect(screen.getByRole('button', { name: 'Row 2 actions' }).parentElement).toHaveAttribute(
    'data-active',
    'true',
  );
  expect(screen.getByRole('button', { name: 'Row 3 actions' }).parentElement).not.toHaveAttribute(
    'data-active',
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
  expect(screen.getByRole('button', { name: 'Header row' })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  expect(screen.getByRole('button', { name: 'Insert row above' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Insert row below' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Delete table' })).not.toBeInTheDocument();
  expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Row 2 actions' }));
  expect(await screen.findByRole('toolbar', { name: 'Row 2 tools' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Header row' })).not.toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Column 1 actions' }));

  expect(await screen.findByRole('toolbar', { name: 'Column 1 tools' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Header column' })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  expect(screen.getByRole('button', { name: 'Insert column left' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Insert column right' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Delete table' })).not.toBeInTheDocument();
  expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Column 2 actions' }));
  expect(await screen.findByRole('toolbar', { name: 'Column 2 tools' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Header column' })).not.toBeInTheDocument();
});

test('tablePlugin toggles header row and column from first handle toolbars', async () => {
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
  await user.click(await screen.findByRole('button', { name: 'Header row' }));

  await waitFor(() => {
    const firstRowCells = screen.getByRole('table').querySelector('tr')?.children;

    expect(firstRowCells?.[0]?.tagName).toBe('TH');
    expect(firstRowCells?.[1]?.tagName).toBe('TH');
    expect(screen.getByRole('table').querySelectorAll('tr')[1]?.children[0]?.tagName).toBe('TD');
  });

  await user.click(screen.getByRole('button', { name: 'Column 1 actions' }));
  await user.click(await screen.findByRole('button', { name: 'Header column' }));

  await waitFor(() => {
    const rows = Array.from(screen.getByRole('table').querySelectorAll('tr'));

    expect(rows[0]?.children[0]?.tagName).toBe('TH');
    expect(rows[0]?.children[1]?.tagName).toBe('TH');
    expect(rows[1]?.children[0]?.tagName).toBe('TH');
    expect(rows[1]?.children[1]?.tagName).toBe('TD');
  });
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

test('tablePlugin keeps toolbar clicks on icon paths inside table tools', async () => {
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

  const iconPath =
    screen.getByRole('button', { name: 'Insert row below' }).querySelector('path') ??
    screen.getByRole('button', { name: 'Insert row below' });

  fireEvent.pointerDown(iconPath);

  expect(screen.getByRole('toolbar', { name: 'Row 1 tools' })).toBeInTheDocument();
});

test('tablePlugin omits whole-table deletion from handle toolbars', async () => {
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
  expect(await screen.findByRole('toolbar', { name: 'Row 1 tools' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Delete table' })).not.toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Column 1 actions' }));
  expect(await screen.findByRole('toolbar', { name: 'Column 1 tools' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Delete table' })).not.toBeInTheDocument();
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
  expect(screen.getByRole('table').querySelectorAll('col')).toHaveLength(1);
});

test('tablePlugin keeps handle toolbars scoped after a column has been deleted', async () => {
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
  expect(await screen.findByRole('toolbar', { name: 'Column 1 tools' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Delete column' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Delete table' })).not.toBeInTheDocument();
  expect(screen.getByRole('table')).toBeInTheDocument();
});
