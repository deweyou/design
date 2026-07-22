import type { TablePluginLocaleText } from './types.ts';

const localeText = {
  columnActions: (column) => `Column ${column} actions`,
  columnControls: 'Column controls',
  columnTools: (column) => `Column ${column} tools`,
  deleteColumn: 'Delete column',
  deleteRow: 'Delete row',
  headerColumn: 'Header column',
  headerRow: 'Header row',
  insertColumnAfter: (column) => `Insert column after column ${column}`,
  insertColumnBefore: (column) => `Insert column before column ${column}`,
  insertColumnBetween: (firstColumn, secondColumn) =>
    `Insert column between columns ${firstColumn} and ${secondColumn}`,
  insertColumnLeft: 'Insert column left',
  insertColumnRight: 'Insert column right',
  insertRowAbove: 'Insert row above',
  insertRowAfter: (row) => `Insert row after row ${row}`,
  insertRowBefore: (row) => `Insert row before row ${row}`,
  insertRowBelow: 'Insert row below',
  insertRowBetween: (firstRow, secondRow) => `Insert row between rows ${firstRow} and ${secondRow}`,
  insertTable: 'Insert table',
  rowActions: (row) => `Row ${row} actions`,
  rowControls: 'Row controls',
  rowTools: (row) => `Row ${row} tools`,
} satisfies TablePluginLocaleText;

export default localeText;
