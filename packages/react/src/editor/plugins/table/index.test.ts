import {
  $createTableNodeWithDimensions,
  $isTableCellNode,
  $isTableNode,
  $isTableRowNode,
  TableCellHeaderStates,
} from '@lexical/table';
import { $getRoot, createEditor } from 'lexical';
import { expect, test } from 'vite-plus/test';

import { composeEditorPlugins } from '../../core/index.js';
import { createLexicalRuntime, lexicalEditorNodes } from '../../runtime/lexical.js';
import { tablePlugin } from './index';

test('tablePlugin contributes basic table commands and block actions', () => {
  const plugin = tablePlugin();

  expect(plugin.feature).toEqual({ id: 'table' });
  expect(plugin.commands?.map((command) => command.id)).toEqual([
    'table.insert',
    'table.insert-row-at-boundary',
    'table.insert-column-at-boundary',
    'table.add-row',
    'table.add-column',
    'table.toggle-header-row',
    'table.toggle-header-column',
    'table.delete-row',
    'table.delete-column',
    'table.delete-table',
  ]);
  expect(plugin.blockToolbarActions).toEqual([]);
});

test('tablePlugin applies its component-owned localeText to action metadata', () => {
  const plugin = tablePlugin({ localeText: { insertTable: 'Add grid' } });

  expect(plugin.toolbarActions?.[0]?.label).toBe('Add grid');
});

test('table header row command toggles only the first row header state', () => {
  const plugin = tablePlugin();
  const editor = createEditor({
    namespace: 'TablePluginToggleHeaderRowTest',
    nodes: [...lexicalEditorNodes, ...(plugin.nodes ?? [])] as NonNullable<
      Parameters<typeof createEditor>[0]
    >['nodes'],
    onError: (error) => {
      throw error;
    },
  });
  const registry = composeEditorPlugins([plugin]);
  let tableKey = '';

  editor.update(
    () => {
      const table = $createTableNodeWithDimensions(2, 2, true);

      tableKey = table.getKey();
      $getRoot().clear().append(table);
    },
    { discrete: true },
  );

  void registry.commands
    .get('table.toggle-header-row')
    ?.run({ registry, runtime: createLexicalRuntime(editor) }, { header: false, tableKey });

  let headerStates = editor.getEditorState().read(() => {
    const table = $getRoot().getFirstChild();
    const rows = $isTableNode(table) ? table.getChildren().filter($isTableRowNode) : [];

    return rows.map((row) =>
      row
        .getChildren()
        .filter($isTableCellNode)
        .map((cell) => cell.getHeaderStyles()),
    );
  });

  expect(headerStates[0]?.every((state) => (state & TableCellHeaderStates.ROW) === 0)).toBe(true);
  expect(headerStates.every((row) => (row[0] & TableCellHeaderStates.COLUMN) > 0)).toBe(true);

  void registry.commands
    .get('table.toggle-header-row')
    ?.run({ registry, runtime: createLexicalRuntime(editor) }, { header: true, tableKey });

  headerStates = editor.getEditorState().read(() => {
    const table = $getRoot().getFirstChild();
    const rows = $isTableNode(table) ? table.getChildren().filter($isTableRowNode) : [];

    return rows.map((row) =>
      row
        .getChildren()
        .filter($isTableCellNode)
        .map((cell) => cell.getHeaderStyles()),
    );
  });

  expect(headerStates[0]?.every((state) => (state & TableCellHeaderStates.ROW) > 0)).toBe(true);
});

test('table header column command toggles only the first column header state', () => {
  const plugin = tablePlugin();
  const editor = createEditor({
    namespace: 'TablePluginToggleHeaderColumnTest',
    nodes: [...lexicalEditorNodes, ...(plugin.nodes ?? [])] as NonNullable<
      Parameters<typeof createEditor>[0]
    >['nodes'],
    onError: (error) => {
      throw error;
    },
  });
  const registry = composeEditorPlugins([plugin]);
  let tableKey = '';

  editor.update(
    () => {
      const table = $createTableNodeWithDimensions(2, 2, true);

      tableKey = table.getKey();
      $getRoot().clear().append(table);
    },
    { discrete: true },
  );

  void registry.commands
    .get('table.toggle-header-column')
    ?.run({ registry, runtime: createLexicalRuntime(editor) }, { header: false, tableKey });

  let headerStates = editor.getEditorState().read(() => {
    const table = $getRoot().getFirstChild();
    const rows = $isTableNode(table) ? table.getChildren().filter($isTableRowNode) : [];

    return rows.map((row) =>
      row
        .getChildren()
        .filter($isTableCellNode)
        .map((cell) => cell.getHeaderStyles()),
    );
  });

  expect(headerStates.every((row) => (row[0] & TableCellHeaderStates.COLUMN) === 0)).toBe(true);
  expect(headerStates[0]?.every((state) => (state & TableCellHeaderStates.ROW) > 0)).toBe(true);

  void registry.commands
    .get('table.toggle-header-column')
    ?.run({ registry, runtime: createLexicalRuntime(editor) }, { header: true, tableKey });

  headerStates = editor.getEditorState().read(() => {
    const table = $getRoot().getFirstChild();
    const rows = $isTableNode(table) ? table.getChildren().filter($isTableRowNode) : [];

    return rows.map((row) =>
      row
        .getChildren()
        .filter($isTableCellNode)
        .map((cell) => cell.getHeaderStyles()),
    );
  });

  expect(headerStates.every((row) => (row[0] & TableCellHeaderStates.COLUMN) > 0)).toBe(true);
});

test('table.insert can append an initial table without a DOM selection', () => {
  const plugin = tablePlugin();
  const editor = createEditor({
    namespace: 'TablePluginAppendTest',
    nodes: [...lexicalEditorNodes, ...(plugin.nodes ?? [])] as NonNullable<
      Parameters<typeof createEditor>[0]
    >['nodes'],
    onError: (error) => {
      throw error;
    },
  });
  const registry = composeEditorPlugins([plugin]);

  void registry.commands
    .get('table.insert')
    ?.run({ registry, runtime: createLexicalRuntime(editor) }, { placement: 'end' });

  const tableSummary = editor.getEditorState().read(() => {
    const table = $getRoot().getChildren().find($isTableNode);
    const rows = table?.getChildren().filter($isTableRowNode) ?? [];

    return {
      headerStates: rows.map((row) =>
        row
          .getChildren()
          .filter($isTableCellNode)
          .map((cell) => cell.getHeaderStyles()),
      ),
      tableCount: table ? 1 : 0,
    };
  });

  expect(tableSummary.tableCount).toBe(1);
  expect(
    tableSummary.headerStates.every((row) =>
      row.every((state) => state === TableCellHeaderStates.NO_STATUS),
    ),
  ).toBe(true);
});

test('table.insert still supports explicit initial table headers', () => {
  const plugin = tablePlugin();
  const editor = createEditor({
    namespace: 'TablePluginAppendHeadersTest',
    nodes: [...lexicalEditorNodes, ...(plugin.nodes ?? [])] as NonNullable<
      Parameters<typeof createEditor>[0]
    >['nodes'],
    onError: (error) => {
      throw error;
    },
  });
  const registry = composeEditorPlugins([plugin]);

  void registry.commands
    .get('table.insert')
    ?.run(
      { registry, runtime: createLexicalRuntime(editor) },
      { includeHeaders: true, placement: 'end' },
    );

  const headerStates = editor.getEditorState().read(() => {
    const table = $getRoot().getChildren().find($isTableNode);
    const rows = table?.getChildren().filter($isTableRowNode) ?? [];

    return rows.map((row) =>
      row
        .getChildren()
        .filter($isTableCellNode)
        .map((cell) => cell.getHeaderStyles()),
    );
  });

  expect(headerStates[0]?.every((state) => (state & TableCellHeaderStates.ROW) > 0)).toBe(true);
  expect(headerStates.every((row) => (row[0] & TableCellHeaderStates.COLUMN) > 0)).toBe(true);
});

test('table.insert can seed table cell text without a DOM selection', () => {
  const plugin = tablePlugin();
  const editor = createEditor({
    namespace: 'TablePluginSeededAppendTest',
    nodes: [...lexicalEditorNodes, ...(plugin.nodes ?? [])] as NonNullable<
      Parameters<typeof createEditor>[0]
    >['nodes'],
    onError: (error) => {
      throw error;
    },
  });
  const registry = composeEditorPlugins([plugin]);

  void registry.commands.get('table.insert')?.run(
    { registry, runtime: createLexicalRuntime(editor) },
    {
      cells: [
        ['Feature', 'Plugin', 'Status'],
        ['Headings', 'headingPlugin', 'Enabled'],
      ],
      placement: 'end',
    },
  );

  const tableText = editor.getEditorState().read(() => $getRoot().getTextContent());

  expect(tableText).toContain('Feature');
  expect(tableText).toContain('headingPlugin');
});

test('table.insert-row-at-boundary inserts a row at the requested table boundary', () => {
  const plugin = tablePlugin();
  const editor = createEditor({
    namespace: 'TablePluginInsertRowBoundaryTest',
    nodes: [...lexicalEditorNodes, ...(plugin.nodes ?? [])] as NonNullable<
      Parameters<typeof createEditor>[0]
    >['nodes'],
    onError: (error) => {
      throw error;
    },
  });
  const registry = composeEditorPlugins([plugin]);
  let tableKey = '';

  editor.update(
    () => {
      const table = $createTableNodeWithDimensions(2, 2, true);

      tableKey = table.getKey();
      $getRoot().clear().append(table);
    },
    { discrete: true },
  );

  void registry.commands
    .get('table.insert-row-at-boundary')
    ?.run({ registry, runtime: createLexicalRuntime(editor) }, { index: 1, tableKey });

  const rowCount = editor.getEditorState().read(() => {
    const table = $getRoot().getFirstChild();

    return $isTableNode(table) ? table.getChildrenSize() : 0;
  });

  expect(rowCount).toBe(3);
});

test('table.insert-column-at-boundary inserts a column at the requested table boundary', () => {
  const plugin = tablePlugin();
  const editor = createEditor({
    namespace: 'TablePluginInsertColumnBoundaryTest',
    nodes: [...lexicalEditorNodes, ...(plugin.nodes ?? [])] as NonNullable<
      Parameters<typeof createEditor>[0]
    >['nodes'],
    onError: (error) => {
      throw error;
    },
  });
  const registry = composeEditorPlugins([plugin]);
  let tableKey = '';

  editor.update(
    () => {
      const table = $createTableNodeWithDimensions(2, 2, true);

      tableKey = table.getKey();
      $getRoot().clear().append(table);
    },
    { discrete: true },
  );

  void registry.commands
    .get('table.insert-column-at-boundary')
    ?.run({ registry, runtime: createLexicalRuntime(editor) }, { index: 1, tableKey });

  const columnCount = editor.getEditorState().read(() => {
    const table = $getRoot().getFirstChild();
    const firstRow = $isTableNode(table) ? table.getFirstChild() : undefined;

    return $isTableRowNode(firstRow) ? firstRow.getChildrenSize() : 0;
  });

  expect(columnCount).toBe(3);
});

test('table.add-row can target a table cell after focus moves to table tools', () => {
  const plugin = tablePlugin();
  const editor = createEditor({
    namespace: 'TablePluginAddRowTargetTest',
    nodes: [...lexicalEditorNodes, ...(plugin.nodes ?? [])] as NonNullable<
      Parameters<typeof createEditor>[0]
    >['nodes'],
    onError: (error) => {
      throw error;
    },
  });
  const registry = composeEditorPlugins([plugin]);
  let tableKey = '';
  let cellKey = '';

  editor.update(
    () => {
      const table = $createTableNodeWithDimensions(2, 2, true);
      const firstRow = table.getFirstChild();
      const targetCell = $isTableRowNode(firstRow) ? firstRow.getFirstChild() : undefined;

      if (!$isTableCellNode(targetCell)) {
        throw new Error('Expected a target table cell.');
      }

      tableKey = table.getKey();
      cellKey = targetCell.getKey();
      $getRoot().clear().append(table);
      $getRoot().selectEnd();
    },
    { discrete: true },
  );

  void registry.commands
    .get('table.add-row')
    ?.run(
      { registry, runtime: createLexicalRuntime(editor) },
      { cellKey, insertAfter: true, tableKey },
    );

  const rowCount = editor.getEditorState().read(() => {
    const table = $getRoot().getFirstChild();

    return $isTableNode(table) ? table.getChildrenSize() : 0;
  });

  expect(rowCount).toBe(3);
});

test('table.add-column can target a table cell after focus moves to table tools', () => {
  const plugin = tablePlugin();
  const editor = createEditor({
    namespace: 'TablePluginAddColumnTargetTest',
    nodes: [...lexicalEditorNodes, ...(plugin.nodes ?? [])] as NonNullable<
      Parameters<typeof createEditor>[0]
    >['nodes'],
    onError: (error) => {
      throw error;
    },
  });
  const registry = composeEditorPlugins([plugin]);
  let tableKey = '';
  let cellKey = '';

  editor.update(
    () => {
      const table = $createTableNodeWithDimensions(2, 2, true);
      const firstRow = table.getFirstChild();
      const targetCell = $isTableRowNode(firstRow) ? firstRow.getFirstChild() : undefined;

      if (!$isTableCellNode(targetCell)) {
        throw new Error('Expected a target table cell.');
      }

      tableKey = table.getKey();
      cellKey = targetCell.getKey();
      $getRoot().clear().append(table);
      $getRoot().selectEnd();
    },
    { discrete: true },
  );

  void registry.commands
    .get('table.add-column')
    ?.run(
      { registry, runtime: createLexicalRuntime(editor) },
      { cellKey, insertAfter: true, tableKey },
    );

  const columnCount = editor.getEditorState().read(() => {
    const table = $getRoot().getFirstChild();
    const firstRow = $isTableNode(table) ? table.getFirstChild() : undefined;

    return $isTableRowNode(firstRow) ? firstRow.getChildrenSize() : 0;
  });

  expect(columnCount).toBe(3);
});

test('table.delete-row can target a table cell after focus moves to table tools', () => {
  const plugin = tablePlugin();
  const editor = createEditor({
    namespace: 'TablePluginDeleteRowTargetTest',
    nodes: [...lexicalEditorNodes, ...(plugin.nodes ?? [])] as NonNullable<
      Parameters<typeof createEditor>[0]
    >['nodes'],
    onError: (error) => {
      throw error;
    },
  });
  const registry = composeEditorPlugins([plugin]);
  let tableKey = '';
  let cellKey = '';

  editor.update(
    () => {
      const table = $createTableNodeWithDimensions(2, 2, true);
      const targetRow = table.getChildAtIndex(1);
      const targetCell = $isTableRowNode(targetRow) ? targetRow.getFirstChild() : undefined;

      if (!$isTableCellNode(targetCell)) {
        throw new Error('Expected a target table cell.');
      }

      tableKey = table.getKey();
      cellKey = targetCell.getKey();
      $getRoot().clear().append(table);
      $getRoot().selectEnd();
    },
    { discrete: true },
  );

  void registry.commands
    .get('table.delete-row')
    ?.run({ registry, runtime: createLexicalRuntime(editor) }, { cellKey, tableKey });

  const rowCount = editor.getEditorState().read(() => {
    const table = $getRoot().getFirstChild();

    return $isTableNode(table) ? table.getChildrenSize() : 0;
  });

  expect(rowCount).toBe(1);
});

test('table.delete-column can target a table cell after focus moves to table tools', () => {
  const plugin = tablePlugin();
  const editor = createEditor({
    namespace: 'TablePluginDeleteColumnTargetTest',
    nodes: [...lexicalEditorNodes, ...(plugin.nodes ?? [])] as NonNullable<
      Parameters<typeof createEditor>[0]
    >['nodes'],
    onError: (error) => {
      throw error;
    },
  });
  const registry = composeEditorPlugins([plugin]);
  let tableKey = '';
  let cellKey = '';

  editor.update(
    () => {
      const table = $createTableNodeWithDimensions(2, 2, true);
      const firstRow = table.getFirstChild();
      const targetCell = $isTableRowNode(firstRow) ? firstRow.getChildAtIndex(1) : undefined;

      if (!$isTableCellNode(targetCell)) {
        throw new Error('Expected a target table cell.');
      }

      tableKey = table.getKey();
      cellKey = targetCell.getKey();
      $getRoot().clear().append(table);
      $getRoot().selectEnd();
    },
    { discrete: true },
  );

  void registry.commands
    .get('table.delete-column')
    ?.run({ registry, runtime: createLexicalRuntime(editor) }, { cellKey, tableKey });

  const columnCount = editor.getEditorState().read(() => {
    const table = $getRoot().getFirstChild();
    const firstRow = $isTableNode(table) ? table.getFirstChild() : undefined;

    return $isTableRowNode(firstRow) ? firstRow.getChildrenSize() : 0;
  });

  expect(columnCount).toBe(1);
});
