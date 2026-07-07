import { ArrowRightIcon, RollbackIcon } from '@deweyou-design/react-icons';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { REDO_COMMAND, UNDO_COMMAND } from 'lexical';

import { createEditorPlugin, type EditorCommandContext } from '../../core/index.js';
import { isLexicalRuntime } from '../../runtime/lexical.js';

const dispatchHistoryCommand = (
  { runtime }: EditorCommandContext,
  command: typeof UNDO_COMMAND,
) => {
  if (!isLexicalRuntime(runtime) || !runtime.handle.editor) {
    return;
  }

  runtime.handle.editor.dispatchCommand(command, undefined);
};

export const historyPlugin = () =>
  createEditorPlugin({
    name: 'history',
    feature: { id: 'history' },
    commands: [
      {
        id: 'history.undo',
        run: (context) => dispatchHistoryCommand(context, UNDO_COMMAND),
      },
      {
        id: 'history.redo',
        run: (context) => dispatchHistoryCommand(context, REDO_COMMAND),
      },
    ],
    toolbarActions: [
      {
        command: 'history.undo',
        icon: RollbackIcon,
        id: 'history.undo',
        label: 'Undo',
      },
      {
        command: 'history.redo',
        icon: ArrowRightIcon,
        id: 'history.redo',
        label: 'Redo',
      },
    ],
    setup: () => <HistoryPlugin />,
  });
