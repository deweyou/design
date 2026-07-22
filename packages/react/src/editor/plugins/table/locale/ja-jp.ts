import type { TablePluginLocaleText } from './types.ts';

const localeText = {
  columnActions: (column) => `列 ${column} の操作`,
  columnControls: '列のコントロール',
  columnTools: (column) => `列 ${column} のツール`,
  deleteColumn: '列を削除',
  deleteRow: '行を削除',
  headerColumn: '見出し列',
  headerRow: '見出し行',
  insertColumnAfter: (column) => `列 ${column} の後に列を挿入`,
  insertColumnBefore: (column) => `列 ${column} の前に列を挿入`,
  insertColumnBetween: (firstColumn, secondColumn) =>
    `列 ${firstColumn} と列 ${secondColumn} の間に列を挿入`,
  insertColumnLeft: '左に列を挿入',
  insertColumnRight: '右に列を挿入',
  insertRowAbove: '上に行を挿入',
  insertRowAfter: (row) => `行 ${row} の後に行を挿入`,
  insertRowBefore: (row) => `行 ${row} の前に行を挿入`,
  insertRowBelow: '下に行を挿入',
  insertRowBetween: (firstRow, secondRow) => `行 ${firstRow} と行 ${secondRow} の間に行を挿入`,
  insertTable: '表を挿入',
  rowActions: (row) => `行 ${row} の操作`,
  rowControls: '行のコントロール',
  rowTools: (row) => `行 ${row} のツール`,
} satisfies TablePluginLocaleText;

export default localeText;
