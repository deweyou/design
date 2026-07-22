import type { EditorActionToolbarLocaleText } from './types.ts';

const localeText = {
  blockToolbar: 'Editor block toolbar',
  bold: 'Bold',
  bulletedList: 'Bulleted list',
  floatingToolbar: 'Editor floating toolbar',
  heading: (level) => `Heading ${level}`,
  inlineCode: 'Inline code',
  insertTable: 'Insert table',
  italic: 'Italic',
  link: 'Link',
  numberedList: 'Numbered list',
  quote: 'Quote',
  redo: 'Redo',
  strikethrough: 'Strikethrough',
  toolbar: 'Editor formatting toolbar',
  undo: 'Undo',
  unlink: 'Unlink',
} satisfies EditorActionToolbarLocaleText;

export default localeText;
