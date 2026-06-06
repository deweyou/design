import { useCallback, useEffect, useMemo, useState, type ComponentType } from 'react';
import {
  ArrowRightIcon,
  BulletpointIcon,
  CodeIcon,
  ListNumberedIcon,
  RollbackIcon,
  TextformatBoldIcon,
  TextformatItalicIcon,
  TextformatStrikethroughIcon,
} from '@deweyou-design/react-icons';
import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListNode,
} from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createHeadingNode, $isHeadingNode, type HeadingTagType } from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import { $getNearestNodeOfType, mergeRegister } from '@lexical/utils';
import {
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
  type TextFormatType,
} from 'lexical';
import classNames from 'classnames';

import { createEditorPlugin } from '../../core/index.js';
import { isLexicalRuntime } from '../../runtime/lexical.js';

import styles from './index.module.less';

export type EditorToolbarAction =
  | 'bold'
  | 'italic'
  | 'strikethrough'
  | 'code'
  | 'heading-1'
  | 'heading-2'
  | 'bullet-list'
  | 'ordered-list'
  | 'undo'
  | 'redo';

export type EditorToolbarPluginOptions = {
  actions?: EditorToolbarAction[];
  labels?: Partial<Record<EditorToolbarAction, string>>;
  className?: string;
};

type ToolbarButtonDefinition = {
  action: EditorToolbarAction;
  icon?: ComponentType<{ size?: 'sm' }>;
  label: string;
  visualLabel?: string;
};

type ToolbarFormatAction = Extract<
  EditorToolbarAction,
  'bold' | 'italic' | 'strikethrough' | 'code'
>;
type ToolbarBlockAction = Extract<
  EditorToolbarAction,
  'heading-1' | 'heading-2' | 'bullet-list' | 'ordered-list'
>;

const defaultToolbarActions = [
  'undo',
  'redo',
  'bold',
  'italic',
  'strikethrough',
  'code',
  'heading-1',
  'heading-2',
  'bullet-list',
  'ordered-list',
] as const satisfies readonly EditorToolbarAction[];

const toolbarButtonDefinitions: Record<EditorToolbarAction, ToolbarButtonDefinition> = {
  bold: {
    action: 'bold',
    icon: TextformatBoldIcon,
    label: 'Bold',
  },
  italic: {
    action: 'italic',
    icon: TextformatItalicIcon,
    label: 'Italic',
  },
  strikethrough: {
    action: 'strikethrough',
    icon: TextformatStrikethroughIcon,
    label: 'Strikethrough',
  },
  code: {
    action: 'code',
    icon: CodeIcon,
    label: 'Inline code',
  },
  'heading-1': {
    action: 'heading-1',
    label: 'Heading 1',
    visualLabel: 'H1',
  },
  'heading-2': {
    action: 'heading-2',
    label: 'Heading 2',
    visualLabel: 'H2',
  },
  'bullet-list': {
    action: 'bullet-list',
    icon: BulletpointIcon,
    label: 'Bulleted list',
  },
  'ordered-list': {
    action: 'ordered-list',
    icon: ListNumberedIcon,
    label: 'Numbered list',
  },
  undo: {
    action: 'undo',
    icon: RollbackIcon,
    label: 'Undo',
  },
  redo: {
    action: 'redo',
    icon: ArrowRightIcon,
    label: 'Redo',
  },
};

const formatActionToTextFormat = {
  bold: 'bold',
  italic: 'italic',
  strikethrough: 'strikethrough',
  code: 'code',
} as const satisfies Record<ToolbarFormatAction, TextFormatType>;

const isFormatAction = (action: EditorToolbarAction): action is ToolbarFormatAction =>
  action in formatActionToTextFormat;

const headingActionToTag = {
  'heading-1': 'h1',
  'heading-2': 'h2',
} as const satisfies Record<'heading-1' | 'heading-2', HeadingTagType>;

const isBlockAction = (action: EditorToolbarAction): action is ToolbarBlockAction =>
  action === 'heading-1' ||
  action === 'heading-2' ||
  action === 'bullet-list' ||
  action === 'ordered-list';

type EditorToolbarProps = Required<Pick<EditorToolbarPluginOptions, 'actions' | 'labels'>> &
  Pick<EditorToolbarPluginOptions, 'className'>;

const EditorToolbar = ({ actions, className, labels }: EditorToolbarProps) => {
  const [editor] = useLexicalComposerContext();
  const [activeFormats, setActiveFormats] = useState<Set<ToolbarFormatAction>>(() => new Set());
  const [activeBlocks, setActiveBlocks] = useState<Set<ToolbarBlockAction>>(() => new Set());
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());

  const updateActiveState = useCallback(() => {
    const selection = $getSelection();

    if (!$isRangeSelection(selection)) {
      setActiveFormats(new Set());
      setActiveBlocks(new Set());
      return;
    }

    setActiveFormats(
      new Set(
        (['bold', 'italic', 'strikethrough', 'code'] as const).filter((action) =>
          selection.hasFormat(formatActionToTextFormat[action]),
        ),
      ),
    );

    const anchorNode = selection.anchor.getNode();
    const topLevelNode = anchorNode.getTopLevelElementOrThrow();
    const listNode = $getNearestNodeOfType(anchorNode, ListNode);
    const nextActiveBlocks = new Set<ToolbarBlockAction>();

    if ($isHeadingNode(topLevelNode)) {
      if (topLevelNode.getTag() === 'h1') {
        nextActiveBlocks.add('heading-1');
      }

      if (topLevelNode.getTag() === 'h2') {
        nextActiveBlocks.add('heading-2');
      }
    }

    if ($isListNode(listNode)) {
      if (listNode.getListType() === 'bullet') {
        nextActiveBlocks.add('bullet-list');
      }

      if (listNode.getListType() === 'number') {
        nextActiveBlocks.add('ordered-list');
      }
    }

    setActiveBlocks(nextActiveBlocks);
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerEditableListener(setIsEditable),
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(updateActiveState);
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          editor.getEditorState().read(updateActiveState);
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (nextCanUndo) => {
          setCanUndo(nextCanUndo);
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (nextCanRedo) => {
          setCanRedo(nextCanRedo);
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor, updateActiveState]);

  const buttons = useMemo(
    () =>
      actions.map((action) => ({
        ...toolbarButtonDefinitions[action],
        label: labels[action] ?? toolbarButtonDefinitions[action].label,
      })),
    [actions, labels],
  );

  const dispatchAction = (action: EditorToolbarAction) => {
    if (isFormatAction(action)) {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, formatActionToTextFormat[action]);
      return;
    }

    if (action === 'heading-1' || action === 'heading-2') {
      editor.update(() => {
        $setBlocksType($getSelection(), () => $createHeadingNode(headingActionToTag[action]));
      });
      return;
    }

    if (action === 'bullet-list') {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
      return;
    }

    if (action === 'ordered-list') {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
      return;
    }

    if (action === 'undo') {
      editor.dispatchCommand(UNDO_COMMAND, undefined);
      return;
    }

    editor.dispatchCommand(REDO_COMMAND, undefined);
  };

  const isActionDisabled = (action: EditorToolbarAction) => {
    if (!isEditable) {
      return true;
    }

    if (action === 'undo') {
      return !canUndo;
    }

    if (action === 'redo') {
      return !canRedo;
    }

    return false;
  };

  return (
    <div
      aria-label="Editor formatting toolbar"
      className={classNames(styles.toolbar, className)}
      data-editor-toolbar="true"
      role="toolbar"
    >
      {buttons.map(({ action, icon: Icon, label, visualLabel }) => {
        const isActive =
          (isFormatAction(action) && activeFormats.has(action)) ||
          (isBlockAction(action) && activeBlocks.has(action));

        return (
          <button
            aria-label={label}
            aria-pressed={isFormatAction(action) || isBlockAction(action) ? isActive : undefined}
            className={styles.button}
            data-active={isActive ? 'true' : undefined}
            disabled={isActionDisabled(action)}
            key={action}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => dispatchAction(action)}
            type="button"
          >
            {Icon ? <Icon size="sm" /> : <span className={styles.textGlyph}>{visualLabel}</span>}
          </button>
        );
      })}
    </div>
  );
};

export const toolbarPlugin = ({
  actions = [...defaultToolbarActions],
  className,
  labels = {},
}: EditorToolbarPluginOptions = {}) =>
  createEditorPlugin({
    name: 'toolbar',
    slot: 'before-content',
    setup: ({ runtime }) => {
      if (!isLexicalRuntime(runtime)) {
        return null;
      }

      return <EditorToolbar actions={actions} className={className} labels={labels} />;
    },
  });
