import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  Delete1Icon,
  PlusIcon,
  TableIcon,
  TrashIcon,
} from '@deweyou-design/react-icons';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import {
  $createTableNodeWithDimensions,
  $deleteTableColumnAtSelection,
  $deleteTableRowAtSelection,
  $getTableCellNodeFromLexicalNode,
  $isTableNode,
  $insertTableColumnAtSelection,
  $insertTableRowAtSelection,
  $isTableCellNode,
  $isTableRowNode,
  $isTableSelection,
  INSERT_TABLE_COMMAND,
  TableCellNode,
  TableNode,
  TableRowNode,
} from '@lexical/table';
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getNodeByKey,
  $getNearestNodeFromDOMNode,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  SELECTION_CHANGE_COMMAND,
  type LexicalEditor,
  type LexicalNode,
  type NodeKey,
} from 'lexical';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
} from 'react';

import {
  createEditorPlugin,
  type EditorCommandContext,
  type EditorPluginRegistry,
} from '../../core/index.js';
import { createLexicalRuntime, isLexicalRuntime } from '../../runtime/lexical.js';

import styles from './index.module.less';

export type TableInsertCommandPayload = {
  cells?: ReadonlyArray<ReadonlyArray<string>>;
  columns?: number | string;
  includeHeaders?: boolean;
  placement?: 'end' | 'selection';
  rows?: number | string;
};

export type TablePluginOptions = {
  initialTable?: boolean | TableInsertCommandPayload;
};

type TableBoundaryCommandPayload = {
  index?: number;
  tableKey?: string;
};

type TableTargetCommandPayload = TableBoundaryCommandPayload & {
  cellKey?: string;
  insertAfter?: boolean;
};

type TableInteractionTarget = {
  cellKey?: string;
  columnIndex?: number;
  rowIndex?: number;
  tableKey: string;
};

type TableBoundaryPosition = {
  index: number;
  label: string;
  offset: number;
};

type TableHandlePosition = TableBoundaryPosition & {
  cellKey?: string;
  size: number;
};

type TableAxisToolState = {
  index: number;
  kind: 'column' | 'row';
  tableKey: string;
};

type TableOverlayState = {
  columnBoundaries: TableBoundaryPosition[];
  columnHandles: TableHandlePosition[];
  height: number;
  isActive: boolean;
  left: number;
  nodeKey: string;
  rowBoundaries: TableBoundaryPosition[];
  rowHandles: TableHandlePosition[];
  targetColumnIndex?: number;
  targetCellKey?: string;
  targetRowIndex?: number;
  top: number;
  width: number;
};

const defaultTableColumns = 3;
const defaultTableRows = 3;
const viewportPadding = 8;

const getEditor = ({ runtime }: EditorCommandContext) => {
  if (!isLexicalRuntime(runtime)) {
    return undefined;
  }

  return runtime.handle.editor ?? undefined;
};

const normalizeTableDimension = (value: number | string | undefined, fallback: number) => {
  const dimension = typeof value === 'number' ? value : Number(value);

  return Number.isInteger(dimension) && dimension > 0 ? dimension : fallback;
};

const getSeededTableColumnCount = (cells: TableInsertCommandPayload['cells']) =>
  Math.max(0, ...(cells ?? []).map((row) => row.length));

const getTableRowCount = (payload: TableInsertCommandPayload | undefined) =>
  normalizeTableDimension(payload?.rows, payload?.cells?.length ?? defaultTableRows);

const getTableColumnCount = (payload: TableInsertCommandPayload | undefined) =>
  normalizeTableDimension(
    payload?.columns,
    getSeededTableColumnCount(payload?.cells) || defaultTableColumns,
  );

const isTableInsertCommandPayload = (payload: unknown): payload is TableInsertCommandPayload =>
  typeof payload === 'object' && payload !== null;

const isTableBoundaryCommandPayload = (payload: unknown): payload is TableBoundaryCommandPayload =>
  typeof payload === 'object' && payload !== null;

const isTableTargetCommandPayload = (payload: unknown): payload is TableTargetCommandPayload =>
  typeof payload === 'object' && payload !== null;

const getTargetInsertAfter = (payload: unknown, fallback: boolean) =>
  isTableTargetCommandPayload(payload) && typeof payload.insertAfter === 'boolean'
    ? payload.insertAfter
    : fallback;

const setTableCellText = (cell: TableCellNode, text: string | undefined) => {
  if (text === undefined) {
    return;
  }

  const paragraph = $createParagraphNode();

  if (text) {
    paragraph.append($createTextNode(text));
  }

  cell.clear().append(paragraph);
};

const seedTableCells = (table: TableNode, cells: TableInsertCommandPayload['cells']) => {
  if (!cells) {
    return;
  }

  table.getChildren().forEach((rowNode, rowIndex) => {
    if (!$isTableRowNode(rowNode)) {
      return;
    }

    rowNode.getChildren().forEach((cellNode, columnIndex) => {
      if ($isTableCellNode(cellNode)) {
        setTableCellText(cellNode, cells[rowIndex]?.[columnIndex]);
      }
    });
  });
};

const appendTable = (payload: TableInsertCommandPayload | undefined) => {
  const table = $createTableNodeWithDimensions(
    getTableRowCount(payload),
    getTableColumnCount(payload),
    payload?.includeHeaders ?? true,
  );

  seedTableCells(table, payload?.cells);
  $getRoot().append(table, $createParagraphNode());
};

const runInsertTable = (context: EditorCommandContext, payload: unknown) => {
  const editor = getEditor(context);

  if (!editor) {
    return;
  }

  const tablePayload = isTableInsertCommandPayload(payload) ? payload : undefined;

  if (tablePayload?.placement === 'end') {
    editor.update(
      () => {
        appendTable(tablePayload);
      },
      { discrete: true },
    );
    return;
  }

  editor.dispatchCommand(INSERT_TABLE_COMMAND, {
    columns: String(normalizeTableDimension(tablePayload?.columns, defaultTableColumns)),
    includeHeaders: tablePayload?.includeHeaders ?? true,
    rows: String(normalizeTableDimension(tablePayload?.rows, defaultTableRows)),
  });
};

const runTableUpdate = (context: EditorCommandContext, update: () => void) => {
  const editor = getEditor(context);

  if (!editor) {
    return;
  }

  editor.update(() => {
    update();
  });
};

const getTableRows = (table: TableNode) => table.getChildren().filter($isTableRowNode);

const getTableFromCell = (cell: TableCellNode) => {
  const table = cell.getParent()?.getParent();

  return $isTableNode(table) ? table : undefined;
};

const getRowTargetCell = (table: TableNode, boundaryIndex: number) => {
  const rows = getTableRows(table);

  if (rows.length === 0) {
    return undefined;
  }

  const targetRowIndex = boundaryIndex <= 0 ? 0 : Math.min(boundaryIndex - 1, rows.length - 1);
  const targetRow = rows[targetRowIndex];
  const targetCell = targetRow?.getFirstChild();

  return $isTableCellNode(targetCell) ? targetCell : undefined;
};

const getColumnTargetCell = (table: TableNode, boundaryIndex: number) => {
  const firstRow = getTableRows(table)[0];

  if (!firstRow) {
    return undefined;
  }

  const cells = firstRow.getChildren().filter($isTableCellNode);
  const targetColumnIndex = boundaryIndex <= 0 ? 0 : Math.min(boundaryIndex - 1, cells.length - 1);

  return cells[targetColumnIndex];
};

const getPayloadTargetCell = (payload: unknown) => {
  if (!isTableTargetCommandPayload(payload)) {
    return undefined;
  }

  const cell = payload.cellKey ? $getNodeByKey(payload.cellKey as NodeKey) : undefined;

  if ($isTableCellNode(cell)) {
    return cell;
  }

  const table = payload.tableKey ? $getNodeByKey(payload.tableKey as NodeKey) : undefined;

  return $isTableNode(table) ? getRowTargetCell(table, 0) : undefined;
};

const selectPayloadTargetCell = (payload: unknown) => {
  const targetCell = getPayloadTargetCell(payload);

  if (!targetCell) {
    return false;
  }

  targetCell.selectStart();
  return true;
};

const hasExplicitTableTarget = (payload: unknown) =>
  isTableTargetCommandPayload(payload) && Boolean(payload.cellKey || payload.tableKey);

const runTableSelectionUpdate = (
  context: EditorCommandContext,
  payload: unknown,
  update: () => void,
) => {
  const editor = getEditor(context);

  if (!editor) {
    return;
  }

  editor.update(
    () => {
      if (hasExplicitTableTarget(payload) && !selectPayloadTargetCell(payload)) {
        return;
      }

      update();
    },
    { discrete: true },
  );
};

const removePayloadTargetTable = (payload: unknown) => {
  if (!isTableTargetCommandPayload(payload)) {
    return false;
  }

  const table = payload.tableKey ? $getNodeByKey(payload.tableKey as NodeKey) : undefined;

  if ($isTableNode(table)) {
    table.remove();
    return true;
  }

  const cell = getPayloadTargetCell(payload);
  const cellTable = cell ? getTableFromCell(cell) : undefined;

  if (!cellTable) {
    return false;
  }

  cellTable.remove();
  return true;
};

const runInsertRowAtBoundary = (context: EditorCommandContext, payload: unknown) => {
  const editor = getEditor(context);

  if (!editor || !isTableBoundaryCommandPayload(payload) || !payload.tableKey) {
    return;
  }

  const boundaryIndex = Math.max(0, Math.floor(payload.index ?? 0));

  editor.update(
    () => {
      const table = $getNodeByKey(payload.tableKey as NodeKey);

      if (!$isTableNode(table)) {
        return;
      }

      const targetCell = getRowTargetCell(table, boundaryIndex);

      if (!targetCell) {
        return;
      }

      targetCell.selectStart();
      $insertTableRowAtSelection(boundaryIndex > 0);
    },
    { discrete: true },
  );
};

const runInsertColumnAtBoundary = (context: EditorCommandContext, payload: unknown) => {
  const editor = getEditor(context);

  if (!editor || !isTableBoundaryCommandPayload(payload) || !payload.tableKey) {
    return;
  }

  const boundaryIndex = Math.max(0, Math.floor(payload.index ?? 0));

  editor.update(
    () => {
      const table = $getNodeByKey(payload.tableKey as NodeKey);

      if (!$isTableNode(table)) {
        return;
      }

      const targetCell = getColumnTargetCell(table, boundaryIndex);

      if (!targetCell) {
        return;
      }

      targetCell.selectStart();
      $insertTableColumnAtSelection(boundaryIndex > 0);
    },
    { discrete: true },
  );
};

const getInitialTablePayload = (
  initialTable: TablePluginOptions['initialTable'],
): TableInsertCommandPayload | undefined => {
  if (!initialTable) {
    return undefined;
  }

  if (initialTable === true) {
    return { placement: 'end' };
  }

  return { ...initialTable, placement: 'end' };
};

const getSelectedTableContext = (): TableInteractionTarget | undefined => {
  const selection = $getSelection();
  const getContextFromNode = (node: LexicalNode) => {
    const tableCell = $getTableCellNodeFromLexicalNode(node);

    if (!tableCell) {
      return undefined;
    }

    const table = tableCell ? getTableFromCell(tableCell) : undefined;

    return table ? { cellKey: tableCell.getKey(), tableKey: table.getKey() } : undefined;
  };

  if ($isTableSelection(selection)) {
    return getContextFromNode(selection.anchor.getNode());
  }

  if (!$isRangeSelection(selection)) {
    return undefined;
  }

  const anchorContext = getContextFromNode(selection.anchor.getNode());

  if (anchorContext) {
    return anchorContext;
  }

  for (const node of selection.getNodes()) {
    const selectedContext = getContextFromNode(node);

    if (selectedContext) {
      return selectedContext;
    }
  }

  return undefined;
};

const getTableNodeKeyFromElement = (tableElement: HTMLTableElement) => {
  const node = $getNearestNodeFromDOMNode(tableElement);

  return $isTableNode(node) ? node.getKey() : undefined;
};

const getTableCellKeyFromElement = (cellElement: HTMLTableCellElement | undefined) => {
  if (!cellElement) {
    return undefined;
  }

  const node = $getNearestNodeFromDOMNode(cellElement);

  return $isTableCellNode(node) ? node.getKey() : undefined;
};

const getTableCellPositionFromElement = (
  tableElement: HTMLTableElement,
  cellElement: HTMLTableCellElement | undefined,
) => {
  if (!cellElement || !(cellElement.parentElement instanceof HTMLTableRowElement)) {
    return {};
  }

  const rowIndex = Array.from(tableElement.rows).indexOf(cellElement.parentElement);
  const columnIndex = Array.from(cellElement.parentElement.cells).indexOf(cellElement);

  return {
    columnIndex: columnIndex >= 0 ? columnIndex : undefined,
    rowIndex: rowIndex >= 0 ? rowIndex : undefined,
  };
};

const getTableContextFromElement = (
  tableElement: HTMLTableElement,
  target: EventTarget | null,
): TableInteractionTarget | undefined => {
  const tableKey = getTableNodeKeyFromElement(tableElement);

  if (!tableKey) {
    return undefined;
  }

  const targetElement = target instanceof HTMLElement ? target.closest('th, td') : undefined;
  const targetCellElement =
    targetElement instanceof HTMLTableCellElement ? targetElement : undefined;
  const targetNode = targetCellElement ? $getNearestNodeFromDOMNode(targetCellElement) : undefined;

  return {
    cellKey: $isTableCellNode(targetNode) ? targetNode.getKey() : undefined,
    ...getTableCellPositionFromElement(tableElement, targetCellElement),
    tableKey,
  };
};

const getTableContextWithPosition = (
  editor: LexicalEditor,
  tableElement: HTMLTableElement,
  target: TableInteractionTarget | undefined,
) => {
  if (!target?.cellKey) {
    return target;
  }

  const cellElement = editor.getElementByKey(target.cellKey);
  const tableCellElement =
    cellElement instanceof HTMLTableCellElement ? cellElement : cellElement?.closest('th, td');

  if (!(tableCellElement instanceof HTMLTableCellElement)) {
    return target;
  }

  return {
    ...target,
    ...getTableCellPositionFromElement(tableElement, tableCellElement),
  };
};

const getRowBoundaryLabel = (index: number, rowCount: number) => {
  if (index === 0) {
    return 'Insert row before row 1';
  }

  if (index === rowCount) {
    return `Insert row after row ${rowCount}`;
  }

  return `Insert row between rows ${index} and ${index + 1}`;
};

const getColumnBoundaryLabel = (index: number, columnCount: number) => {
  if (index === 0) {
    return 'Insert column before column 1';
  }

  if (index === columnCount) {
    return `Insert column after column ${columnCount}`;
  }

  return `Insert column between columns ${index} and ${index + 1}`;
};

const getRowBoundaries = (
  tableElement: HTMLTableElement,
  tableRect: DOMRect,
): TableBoundaryPosition[] => {
  const rows = Array.from(tableElement.rows);

  return rows
    .map((row, index) => {
      const rowRect = row.getBoundingClientRect();

      return {
        index,
        label: getRowBoundaryLabel(index, rows.length),
        offset: rowRect.top - tableRect.top,
      };
    })
    .concat(
      rows.length > 0
        ? [
            {
              index: rows.length,
              label: getRowBoundaryLabel(rows.length, rows.length),
              offset: rows[rows.length - 1].getBoundingClientRect().bottom - tableRect.top,
            },
          ]
        : [],
    );
};

const getColumnBoundaries = (
  tableElement: HTMLTableElement,
  tableRect: DOMRect,
): TableBoundaryPosition[] => {
  const cells = Array.from(tableElement.rows[0]?.cells ?? []);

  return cells
    .map((cell, index) => {
      const cellRect = cell.getBoundingClientRect();

      return {
        index,
        label: getColumnBoundaryLabel(index, cells.length),
        offset: cellRect.left - tableRect.left,
      };
    })
    .concat(
      cells.length > 0
        ? [
            {
              index: cells.length,
              label: getColumnBoundaryLabel(cells.length, cells.length),
              offset: cells[cells.length - 1].getBoundingClientRect().right - tableRect.left,
            },
          ]
        : [],
    );
};

const getRowHandles = (tableElement: HTMLTableElement, tableRect: DOMRect): TableHandlePosition[] =>
  Array.from(tableElement.rows).map((row, index) => {
    const rowRect = row.getBoundingClientRect();

    return {
      cellKey: getTableCellKeyFromElement(row.cells[0]),
      index,
      label: `Row ${index + 1} actions`,
      offset: rowRect.top - tableRect.top,
      size: rowRect.height,
    };
  });

const getColumnHandles = (
  tableElement: HTMLTableElement,
  tableRect: DOMRect,
): TableHandlePosition[] =>
  Array.from(tableElement.rows[0]?.cells ?? []).map((cell, index) => {
    const cellRect = cell.getBoundingClientRect();

    return {
      cellKey: getTableCellKeyFromElement(cell),
      index,
      label: `Column ${index + 1} actions`,
      offset: cellRect.left - tableRect.left,
      size: cellRect.width,
    };
  });

const getTableOverlayStates = (
  editor: LexicalEditor,
  hoveredTable: TableInteractionTarget | undefined,
): TableOverlayState[] => {
  const rootElement = editor.getRootElement();

  if (!rootElement) {
    return [];
  }

  const tableElements = Array.from(rootElement.querySelectorAll('table')).filter(
    (element): element is HTMLTableElement => element instanceof HTMLTableElement,
  );

  return editor.getEditorState().read(
    () => {
      const selectedTable = getSelectedTableContext();

      return tableElements.flatMap((tableElement) => {
        const nodeKey = getTableNodeKeyFromElement(tableElement);

        if (!nodeKey) {
          return [];
        }

        const rect = tableElement.getBoundingClientRect();
        const selectedTarget =
          selectedTable?.tableKey === nodeKey
            ? getTableContextWithPosition(editor, tableElement, selectedTable)
            : undefined;
        const hoveredTarget =
          hoveredTable?.tableKey === nodeKey
            ? getTableContextWithPosition(editor, tableElement, hoveredTable)
            : undefined;
        const target = selectedTarget ?? hoveredTarget;

        return [
          {
            columnBoundaries: getColumnBoundaries(tableElement, rect),
            columnHandles: getColumnHandles(tableElement, rect),
            height: rect.height,
            isActive: Boolean(target),
            left: Math.max(viewportPadding, rect.left),
            nodeKey,
            rowBoundaries: getRowBoundaries(tableElement, rect),
            rowHandles: getRowHandles(tableElement, rect),
            targetCellKey: target?.cellKey,
            targetColumnIndex: target?.columnIndex,
            targetRowIndex: target?.rowIndex,
            top: Math.max(viewportPadding, rect.top),
            width: rect.width,
          },
        ];
      });
    },
    { editor },
  );
};

const stopTableToolMouseDown = (event: ReactMouseEvent<HTMLElement>) => {
  event.preventDefault();
};

type TableToolsPluginProps = {
  registry?: EditorPluginRegistry;
};

type TableHandleTriggerProps = {
  handle: TableHandlePosition;
  isOpen: boolean;
  kind: 'column' | 'row';
  setActiveTool: (tool: TableAxisToolState | undefined) => void;
  tableKey: string;
};

type TableAxisToolbarProps = {
  handle: TableHandlePosition;
  kind: 'column' | 'row';
  runCommand: (command: string, payload?: unknown) => void;
  setActiveTool: (tool: TableAxisToolState | undefined) => void;
  tableKey: string;
};

const TableHandleTrigger = ({
  handle,
  isOpen,
  kind,
  setActiveTool,
  tableKey,
}: TableHandleTriggerProps) => (
  <button
    aria-label={handle.label}
    className={styles.tableHandleButton}
    data-state={isOpen ? 'open' : undefined}
    onClick={() =>
      setActiveTool(
        isOpen
          ? undefined
          : {
              index: handle.index,
              kind,
              tableKey,
            },
      )
    }
    onMouseDown={stopTableToolMouseDown}
    onPointerDown={stopTableToolMouseDown}
    type="button"
  />
);

const TableAxisToolbar = ({
  handle,
  kind,
  runCommand,
  setActiveTool,
  tableKey,
}: TableAxisToolbarProps) => {
  const tableTargetPayload = {
    cellKey: handle.cellKey,
    tableKey,
  };
  const isRow = kind === 'row';
  const closeAndRun = (command: string, payload: unknown) => {
    setActiveTool(undefined);
    runCommand(command, payload);
  };
  const toolbarStyle = isRow
    ? ({
        insetBlockStart: handle.offset + handle.size / 2,
      } as CSSProperties)
    : ({
        insetInlineStart: handle.offset + handle.size / 2,
      } as CSSProperties);

  return (
    <div
      aria-label={isRow ? `Row ${handle.index + 1} tools` : `Column ${handle.index + 1} tools`}
      className={styles.tableAxisToolbar}
      data-axis={kind}
      onMouseDown={stopTableToolMouseDown}
      onPointerDown={stopTableToolMouseDown}
      role="toolbar"
      style={toolbarStyle}
    >
      <button
        aria-label={isRow ? 'Insert row above' : 'Insert column left'}
        className={styles.tableAxisToolButton}
        onClick={() =>
          closeAndRun(isRow ? 'table.add-row' : 'table.add-column', {
            ...tableTargetPayload,
            insertAfter: false,
          })
        }
        title={isRow ? 'Insert row above' : 'Insert column left'}
        type="button"
      >
        {isRow ? <ArrowUpIcon size="xs" /> : <ArrowLeftIcon size="xs" />}
      </button>
      <button
        aria-label={isRow ? 'Insert row below' : 'Insert column right'}
        className={styles.tableAxisToolButton}
        onClick={() =>
          closeAndRun(isRow ? 'table.add-row' : 'table.add-column', {
            ...tableTargetPayload,
            insertAfter: true,
          })
        }
        title={isRow ? 'Insert row below' : 'Insert column right'}
        type="button"
      >
        {isRow ? <ArrowDownIcon size="xs" /> : <ArrowRightIcon size="xs" />}
      </button>
      <span className={styles.tableAxisToolbarSeparator} />
      <button
        aria-label={isRow ? 'Delete row' : 'Delete column'}
        className={styles.tableAxisToolButton}
        data-danger="true"
        onClick={() =>
          closeAndRun(isRow ? 'table.delete-row' : 'table.delete-column', tableTargetPayload)
        }
        title={isRow ? 'Delete row' : 'Delete column'}
        type="button"
      >
        <Delete1Icon size="xs" />
      </button>
      <span className={styles.tableAxisToolbarSeparator} />
      <button
        aria-label="Delete table"
        className={styles.tableAxisToolButton}
        data-danger="true"
        onClick={() => closeAndRun('table.delete-table', tableTargetPayload)}
        title="Delete table"
        type="button"
      >
        <TrashIcon size="xs" />
      </button>
    </div>
  );
};

const TableToolsPlugin = ({ registry }: TableToolsPluginProps) => {
  const [editor] = useLexicalComposerContext();
  const [activeTool, setActiveTool] = useState<TableAxisToolState | undefined>(undefined);
  const [hoveredTable, setHoveredTable] = useState<TableInteractionTarget | undefined>(undefined);
  const [overlays, setOverlays] = useState<TableOverlayState[]>([]);

  const syncTables = useCallback(() => {
    setOverlays(getTableOverlayStates(editor, hoveredTable));
  }, [editor, hoveredTable]);

  const updateHoveredTable = useCallback((nextHoveredTable: TableInteractionTarget | undefined) => {
    setHoveredTable((currentHoveredTable) => {
      if (
        currentHoveredTable?.tableKey === nextHoveredTable?.tableKey &&
        currentHoveredTable?.cellKey === nextHoveredTable?.cellKey
      ) {
        return currentHoveredTable;
      }

      return nextHoveredTable;
    });
  }, []);

  useEffect(() => {
    syncTables();

    const unregisterUpdate = editor.registerUpdateListener(() => syncTables());
    const unregisterSelection = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        syncTables();
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );

    return () => {
      unregisterUpdate();
      unregisterSelection();
    };
  }, [editor, syncTables]);

  useEffect(() => {
    const rootElement = editor.getRootElement();

    if (!rootElement) {
      return undefined;
    }

    const getHoveredTable = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) {
        return undefined;
      }

      const table = target.closest('table');

      if (!(table instanceof HTMLTableElement)) {
        return undefined;
      }

      return editor.getEditorState().read(() => getTableContextFromElement(table, target), {
        editor,
      });
    };

    const handlePointerOver = (event: PointerEvent) => {
      const nextHoveredTable = getHoveredTable(event.target);

      if (nextHoveredTable) {
        updateHoveredTable(nextHoveredTable);
      }
    };

    const handlePointerOut = (event: PointerEvent) => {
      const currentHoveredTable = getHoveredTable(event.target);

      if (!currentHoveredTable) {
        return;
      }

      const nextHoveredTable = getHoveredTable(event.relatedTarget);

      if (nextHoveredTable?.tableKey !== currentHoveredTable.tableKey) {
        updateHoveredTable(undefined);
      }
    };

    rootElement.addEventListener('pointerover', handlePointerOver);
    rootElement.addEventListener('pointermove', handlePointerOver);
    rootElement.addEventListener('pointerdown', handlePointerOver);
    rootElement.addEventListener('pointerout', handlePointerOut);

    return () => {
      rootElement.removeEventListener('pointerover', handlePointerOver);
      rootElement.removeEventListener('pointermove', handlePointerOver);
      rootElement.removeEventListener('pointerdown', handlePointerOver);
      rootElement.removeEventListener('pointerout', handlePointerOut);
    };
  }, [editor, updateHoveredTable]);

  useEffect(() => {
    const handleDocumentPointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (target instanceof HTMLElement && target.closest('[data-editor-table-tools]')) {
        return;
      }

      setActiveTool(undefined);
    };
    const handleDocumentKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveTool(undefined);
      }
    };

    document.addEventListener('pointerdown', handleDocumentPointerDown);
    document.addEventListener('keydown', handleDocumentKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handleDocumentPointerDown);
      document.removeEventListener('keydown', handleDocumentKeyDown);
    };
  }, []);

  useEffect(() => {
    if (overlays.length === 0) {
      return undefined;
    }

    const handleWindowChange = () => syncTables();

    window.addEventListener('resize', handleWindowChange);
    window.addEventListener('scroll', handleWindowChange, true);

    return () => {
      window.removeEventListener('resize', handleWindowChange);
      window.removeEventListener('scroll', handleWindowChange, true);
    };
  }, [overlays.length, syncTables]);

  const runCommand = useCallback(
    (command: string, payload?: unknown) => {
      if (!registry) {
        return;
      }

      void registry.commands
        .get(command)
        ?.run({ registry, runtime: createLexicalRuntime(editor) }, payload);
    },
    [editor, registry],
  );

  if (overlays.length === 0) {
    return null;
  }

  return (
    <>
      {overlays.map((overlay) => {
        const tableTargetPayload = {
          cellKey: overlay.targetCellKey,
          tableKey: overlay.nodeKey,
        };
        const overlayStyle = {
          blockSize: overlay.height,
          inlineSize: overlay.width,
          insetBlockStart: overlay.top,
          insetInlineStart: overlay.left,
        } as CSSProperties;
        const activeHandle =
          activeTool?.tableKey === overlay.nodeKey
            ? activeTool.kind === 'row'
              ? overlay.rowHandles.find((handle) => handle.index === activeTool.index)
              : overlay.columnHandles.find((handle) => handle.index === activeTool.index)
            : undefined;

        return (
          <div
            className={styles.tableOverlay}
            data-active={overlay.isActive ? 'true' : undefined}
            data-editor-table-tools="true"
            key={overlay.nodeKey}
            onPointerEnter={() => updateHoveredTable(tableTargetPayload)}
            onPointerLeave={() => updateHoveredTable(undefined)}
            style={overlayStyle}
          >
            {overlay.isActive ? (
              <div
                aria-label="Row controls"
                className={`${styles.tableControlRail} ${styles.rowControlRail}`}
                role="toolbar"
              >
                {overlay.rowHandles.map((handle) => (
                  <div
                    className={styles.rowControlSegment}
                    data-active={
                      handle.index === overlay.targetRowIndex ||
                      (activeTool?.kind === 'row' &&
                        activeTool.tableKey === overlay.nodeKey &&
                        activeTool.index === handle.index)
                        ? 'true'
                        : undefined
                    }
                    key={`row-handle-${handle.index}`}
                    style={{ blockSize: handle.size, insetBlockStart: handle.offset }}
                  >
                    <TableHandleTrigger
                      handle={handle}
                      isOpen={
                        activeTool?.kind === 'row' &&
                        activeTool.tableKey === overlay.nodeKey &&
                        activeTool.index === handle.index
                      }
                      kind="row"
                      setActiveTool={setActiveTool}
                      tableKey={overlay.nodeKey}
                    />
                  </div>
                ))}
              </div>
            ) : null}
            {overlay.isActive ? (
              <div
                aria-label="Column controls"
                className={`${styles.tableControlRail} ${styles.columnControlRail}`}
                role="toolbar"
              >
                {overlay.columnHandles.map((handle) => (
                  <div
                    className={styles.columnControlSegment}
                    data-active={
                      handle.index === overlay.targetColumnIndex ||
                      (activeTool?.kind === 'column' &&
                        activeTool.tableKey === overlay.nodeKey &&
                        activeTool.index === handle.index)
                        ? 'true'
                        : undefined
                    }
                    key={`column-handle-${handle.index}`}
                    style={{ inlineSize: handle.size, insetInlineStart: handle.offset }}
                  >
                    <TableHandleTrigger
                      handle={handle}
                      isOpen={
                        activeTool?.kind === 'column' &&
                        activeTool.tableKey === overlay.nodeKey &&
                        activeTool.index === handle.index
                      }
                      kind="column"
                      setActiveTool={setActiveTool}
                      tableKey={overlay.nodeKey}
                    />
                  </div>
                ))}
              </div>
            ) : null}
            {activeTool?.tableKey === overlay.nodeKey && activeHandle ? (
              <TableAxisToolbar
                handle={activeHandle}
                kind={activeTool.kind === 'row' ? 'row' : 'column'}
                runCommand={runCommand}
                setActiveTool={setActiveTool}
                tableKey={overlay.nodeKey}
              />
            ) : null}
            {overlay.rowBoundaries.map((boundary) => (
              <div
                className={styles.rowBoundary}
                data-editor-table-boundary="row"
                key={`row-${boundary.index}`}
                style={{ insetBlockStart: boundary.offset }}
              >
                <button
                  aria-label={boundary.label}
                  className={styles.boundaryButton}
                  onClick={() =>
                    runCommand('table.insert-row-at-boundary', {
                      index: boundary.index,
                      tableKey: overlay.nodeKey,
                    })
                  }
                  title={boundary.label}
                  type="button"
                >
                  <PlusIcon size="xs" />
                </button>
              </div>
            ))}
            {overlay.columnBoundaries.map((boundary) => (
              <div
                className={styles.columnBoundary}
                data-editor-table-boundary="column"
                key={`column-${boundary.index}`}
                style={{ insetInlineStart: boundary.offset }}
              >
                <button
                  aria-label={boundary.label}
                  className={styles.boundaryButton}
                  onClick={() =>
                    runCommand('table.insert-column-at-boundary', {
                      index: boundary.index,
                      tableKey: overlay.nodeKey,
                    })
                  }
                  title={boundary.label}
                  type="button"
                >
                  <PlusIcon size="xs" />
                </button>
              </div>
            ))}
          </div>
        );
      })}
    </>
  );
};

const InitialTablePlugin = ({ payload }: { payload: TableInsertCommandPayload }) => {
  const [editor] = useLexicalComposerContext();
  const hasInsertedTable = useRef(false);

  useEffect(() => {
    if (hasInsertedTable.current) {
      return;
    }

    hasInsertedTable.current = true;
    editor.update(
      () => {
        appendTable(payload);
      },
      { discrete: true },
    );
  }, [editor, payload]);

  return null;
};

export const tablePlugin = ({ initialTable }: TablePluginOptions = {}) => {
  const initialTablePayload = getInitialTablePayload(initialTable);

  return createEditorPlugin({
    name: 'table',
    feature: { id: 'table' },
    nodes: [TableNode, TableRowNode, TableCellNode],
    commands: [
      { id: 'table.insert', run: runInsertTable },
      { id: 'table.insert-row-at-boundary', run: runInsertRowAtBoundary },
      { id: 'table.insert-column-at-boundary', run: runInsertColumnAtBoundary },
      {
        id: 'table.add-row',
        run: (context, payload) =>
          runTableSelectionUpdate(context, payload, () =>
            $insertTableRowAtSelection(getTargetInsertAfter(payload, true)),
          ),
      },
      {
        id: 'table.add-column',
        run: (context, payload) =>
          runTableSelectionUpdate(context, payload, () =>
            $insertTableColumnAtSelection(getTargetInsertAfter(payload, true)),
          ),
      },
      {
        id: 'table.delete-row',
        run: (context, payload) =>
          runTableSelectionUpdate(context, payload, () => $deleteTableRowAtSelection()),
      },
      {
        id: 'table.delete-column',
        run: (context, payload) =>
          runTableSelectionUpdate(context, payload, () => $deleteTableColumnAtSelection()),
      },
      {
        id: 'table.delete-table',
        run: (context, payload) =>
          runTableUpdate(context, () => {
            if (removePayloadTargetTable(payload)) {
              return;
            }

            const selection = $getSelection();

            if ($isRangeSelection(selection)) {
              selection.anchor.getNode().getTopLevelElementOrThrow().remove();
            }
          }),
      },
    ],
    toolbarActions: [
      {
        command: 'table.insert',
        icon: TableIcon,
        id: 'table.insert',
        label: 'Insert table',
      },
    ],
    blockToolbarActions: [],
    setup: ({ registry }) => (
      <>
        <TablePlugin />
        <TableToolsPlugin registry={registry} />
        {initialTablePayload ? <InitialTablePlugin payload={initialTablePayload} /> : null}
      </>
    ),
  });
};
