import type { TablePluginLocaleText } from './types.ts';

const localeText = {
  columnActions: (column) => `第 ${column} 欄操作`,
  columnControls: '欄控制項',
  columnTools: (column) => `第 ${column} 欄工具`,
  deleteColumn: '刪除欄',
  deleteRow: '刪除列',
  headerColumn: '標題欄',
  headerRow: '標題列',
  insertColumnAfter: (column) => `在第 ${column} 欄後插入欄`,
  insertColumnBefore: (column) => `在第 ${column} 欄前插入欄`,
  insertColumnBetween: (firstColumn, secondColumn) =>
    `在第 ${firstColumn} 欄和第 ${secondColumn} 欄之間插入欄`,
  insertColumnLeft: '在左側插入欄',
  insertColumnRight: '在右側插入欄',
  insertRowAbove: '在上方插入列',
  insertRowAfter: (row) => `在第 ${row} 列後插入列`,
  insertRowBefore: (row) => `在第 ${row} 列前插入列`,
  insertRowBelow: '在下方插入列',
  insertRowBetween: (firstRow, secondRow) => `在第 ${firstRow} 列和第 ${secondRow} 列之間插入列`,
  insertTable: '插入表格',
  rowActions: (row) => `第 ${row} 列操作`,
  rowControls: '列控制項',
  rowTools: (row) => `第 ${row} 列工具`,
} satisfies TablePluginLocaleText;

export default localeText;
