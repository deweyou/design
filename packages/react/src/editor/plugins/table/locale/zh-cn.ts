import type { TablePluginLocaleText } from './types.ts';

const localeText = {
  columnActions: (column) => `第 ${column} 列操作`,
  columnControls: '列控件',
  columnTools: (column) => `第 ${column} 列工具`,
  deleteColumn: '删除列',
  deleteRow: '删除行',
  headerColumn: '表头列',
  headerRow: '表头行',
  insertColumnAfter: (column) => `在第 ${column} 列后插入列`,
  insertColumnBefore: (column) => `在第 ${column} 列前插入列`,
  insertColumnBetween: (firstColumn, secondColumn) =>
    `在第 ${firstColumn} 列和第 ${secondColumn} 列之间插入列`,
  insertColumnLeft: '在左侧插入列',
  insertColumnRight: '在右侧插入列',
  insertRowAbove: '在上方插入行',
  insertRowAfter: (row) => `在第 ${row} 行后插入行`,
  insertRowBefore: (row) => `在第 ${row} 行前插入行`,
  insertRowBelow: '在下方插入行',
  insertRowBetween: (firstRow, secondRow) => `在第 ${firstRow} 行和第 ${secondRow} 行之间插入行`,
  insertTable: '插入表格',
  rowActions: (row) => `第 ${row} 行操作`,
  rowControls: '行控件',
  rowTools: (row) => `第 ${row} 行工具`,
} satisfies TablePluginLocaleText;

export default localeText;
