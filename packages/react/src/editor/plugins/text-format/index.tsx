import {
  CodeIcon,
  TextformatBoldIcon,
  TextformatItalicIcon,
  TextformatStrikethroughIcon,
} from '@deweyou-design/react-icons';
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  type TextFormatType,
} from 'lexical';
import {
  BOLD_STAR,
  BOLD_UNDERSCORE,
  INLINE_CODE,
  ITALIC_STAR,
  ITALIC_UNDERSCORE,
  STRIKETHROUGH,
} from '@lexical/markdown';

import {
  createEditorPlugin,
  type EditorAction,
  type EditorCommand,
  type EditorCommandContext,
} from '../../core/index.js';
import { isLexicalRuntime } from '../../runtime/lexical.js';

type TextFormatAction = {
  id: string;
  format: TextFormatType;
  icon: EditorAction['icon'];
  label: string;
};

const textFormatActions = [
  {
    format: 'bold',
    icon: TextformatBoldIcon,
    id: 'text-format.bold',
    label: 'Bold',
  },
  {
    format: 'italic',
    icon: TextformatItalicIcon,
    id: 'text-format.italic',
    label: 'Italic',
  },
  {
    format: 'strikethrough',
    icon: TextformatStrikethroughIcon,
    id: 'text-format.strikethrough',
    label: 'Strikethrough',
  },
  {
    format: 'code',
    icon: CodeIcon,
    id: 'text-format.code',
    label: 'Inline code',
  },
] as const satisfies readonly TextFormatAction[];

const runFormatCommand =
  (format: TextFormatType) =>
  ({ runtime }: EditorCommandContext) => {
    if (!isLexicalRuntime(runtime) || !runtime.handle.editor) {
      return;
    }

    runtime.handle.editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

const isFormatActive = (format: TextFormatType) => () => {
  const selection = $getSelection();

  return $isRangeSelection(selection) && selection.hasFormat(format);
};

export const textFormatPlugin = () =>
  createEditorPlugin({
    name: 'text-format',
    feature: { id: 'text-format' },
    commands: textFormatActions.map(
      ({ format, id }): EditorCommand => ({
        id,
        run: runFormatCommand(format),
      }),
    ),
    toolbarActions: textFormatActions.map(
      ({ format, icon, id, label }): EditorAction => ({
        command: id,
        icon,
        id,
        isActive: isFormatActive(format),
        label,
      }),
    ),
    floatingToolbarActions: textFormatActions.map(
      ({ format, icon, id, label }): EditorAction => ({
        command: id,
        icon,
        id,
        isActive: isFormatActive(format),
        label,
      }),
    ),
    keyboardShortcuts: [
      { command: 'text-format.bold', id: 'text-format.bold.shortcut', key: 'mod+b' },
      { command: 'text-format.italic', id: 'text-format.italic.shortcut', key: 'mod+i' },
      {
        command: 'text-format.strikethrough',
        id: 'text-format.strikethrough.shortcut',
        key: 'mod+shift+x',
      },
      { command: 'text-format.code', id: 'text-format.code.shortcut', key: 'mod+e' },
    ],
    markdownShortcuts: [
      {
        feature: 'text-format',
        transformers: [
          BOLD_STAR,
          BOLD_UNDERSCORE,
          ITALIC_STAR,
          ITALIC_UNDERSCORE,
          STRIKETHROUGH,
          INLINE_CODE,
        ],
      },
    ],
  });
