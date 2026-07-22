import type { TablePluginLocaleText } from './types.ts';

const localeText = {
  columnActions: (column) => `${column}열 작업`,
  columnControls: '열 컨트롤',
  columnTools: (column) => `${column}열 도구`,
  deleteColumn: '열 삭제',
  deleteRow: '행 삭제',
  headerColumn: '머리글 열',
  headerRow: '머리글 행',
  insertColumnAfter: (column) => `${column}열 뒤에 열 삽입`,
  insertColumnBefore: (column) => `${column}열 앞에 열 삽입`,
  insertColumnBetween: (firstColumn, secondColumn) =>
    `${firstColumn}열과 ${secondColumn}열 사이에 열 삽입`,
  insertColumnLeft: '왼쪽에 열 삽입',
  insertColumnRight: '오른쪽에 열 삽입',
  insertRowAbove: '위에 행 삽입',
  insertRowAfter: (row) => `${row}행 뒤에 행 삽입`,
  insertRowBefore: (row) => `${row}행 앞에 행 삽입`,
  insertRowBelow: '아래에 행 삽입',
  insertRowBetween: (firstRow, secondRow) => `${firstRow}행과 ${secondRow}행 사이에 행 삽입`,
  insertTable: '표 삽입',
  rowActions: (row) => `${row}행 작업`,
  rowControls: '행 컨트롤',
  rowTools: (row) => `${row}행 도구`,
} satisfies TablePluginLocaleText;

export default localeText;
