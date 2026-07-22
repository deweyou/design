import type { EditorActionToolbarLocaleText } from './types.ts';

const localeText = {
  blockToolbar: 'エディターのブロックツールバー',
  bold: '太字',
  bulletedList: '箇条書きリスト',
  floatingToolbar: 'エディターのフローティングツールバー',
  heading: (level) => `見出し ${level}`,
  inlineCode: 'インラインコード',
  insertTable: '表を挿入',
  italic: '斜体',
  link: 'リンク',
  numberedList: '番号付きリスト',
  quote: '引用',
  redo: 'やり直す',
  strikethrough: '取り消し線',
  toolbar: 'エディターの書式ツールバー',
  undo: '元に戻す',
  unlink: 'リンクを解除',
} satisfies EditorActionToolbarLocaleText;

export default localeText;
