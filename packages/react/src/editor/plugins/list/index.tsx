import { BulletpointIcon, ListNumberedIcon } from '@deweyou-design/react-icons';
import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListItemNode,
  ListNode,
} from '@lexical/list';
import { ORDERED_LIST, UNORDERED_LIST } from '@lexical/markdown';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { $getNearestNodeOfType } from '@lexical/utils';
import { $getSelection, $isRangeSelection } from 'lexical';

import {
  createEditorPlugin,
  type EditorAction,
  type EditorCommand,
  type EditorCommandContext,
} from '../../core/index.js';
import { isLexicalRuntime } from '../../runtime/lexical.js';

const runListCommand =
  (command: typeof INSERT_UNORDERED_LIST_COMMAND) =>
  ({ runtime }: EditorCommandContext) => {
    if (!isLexicalRuntime(runtime) || !runtime.handle.editor) {
      return;
    }

    runtime.handle.editor.dispatchCommand(command, undefined);
  };

const isListActive = (type: 'bullet' | 'number') => () => {
  const selection = $getSelection();

  if (!$isRangeSelection(selection)) {
    return false;
  }

  const listNode = $getNearestNodeOfType(selection.anchor.getNode(), ListNode);

  return $isListNode(listNode) && listNode.getListType() === type;
};

const listCommands = [
  {
    icon: BulletpointIcon,
    id: 'list.unordered',
    label: 'Bulleted list',
    lexicalCommand: INSERT_UNORDERED_LIST_COMMAND,
    listType: 'bullet',
  },
  {
    icon: ListNumberedIcon,
    id: 'list.ordered',
    label: 'Numbered list',
    lexicalCommand: INSERT_ORDERED_LIST_COMMAND,
    listType: 'number',
  },
] as const;

export const listPlugin = () =>
  createEditorPlugin({
    name: 'list',
    feature: { id: 'list' },
    nodes: [ListNode, ListItemNode],
    commands: listCommands.map(
      ({ id, lexicalCommand }): EditorCommand => ({
        id,
        run: runListCommand(lexicalCommand),
      }),
    ),
    toolbarActions: listCommands.map(
      ({ icon, id, label, listType }): EditorAction => ({
        command: id,
        icon,
        id,
        isActive: isListActive(listType),
        label,
      }),
    ),
    markdownShortcuts: [
      {
        feature: 'list',
        transformers: [UNORDERED_LIST, ORDERED_LIST],
      },
    ],
    setup: () => <ListPlugin />,
  });
