import type { EditorActionToolbarLocaleText } from './types.ts';

const localeText = {
  blockToolbar: '編輯器區塊工具列',
  bold: '粗體',
  bulletedList: '項目符號清單',
  floatingToolbar: '編輯器浮動工具列',
  heading: (level) => `${level} 級標題`,
  inlineCode: '行內程式碼',
  insertTable: '插入表格',
  italic: '斜體',
  link: '連結',
  numberedList: '編號清單',
  quote: '引用',
  redo: '重做',
  strikethrough: '刪除線',
  toolbar: '編輯器格式工具列',
  undo: '復原',
  unlink: '移除連結',
} satisfies EditorActionToolbarLocaleText;

export default localeText;
