import type { EditorActionToolbarLocaleText } from './types.ts';

const localeText = {
  blockToolbar: '编辑器块工具栏',
  bold: '加粗',
  bulletedList: '项目符号列表',
  floatingToolbar: '编辑器浮动工具栏',
  heading: (level) => `${level} 级标题`,
  inlineCode: '行内代码',
  insertTable: '插入表格',
  italic: '斜体',
  link: '链接',
  numberedList: '编号列表',
  quote: '引用',
  redo: '重做',
  strikethrough: '删除线',
  toolbar: '编辑器格式工具栏',
  undo: '撤销',
  unlink: '取消链接',
} satisfies EditorActionToolbarLocaleText;

export default localeText;
