import { createEditorPlugin, type EditorPluginRegistry } from '../../core/index.js';
import { EditorActionToolbar } from '../action-toolbar/index.js';

export type EditorToolbarAction = string;

export type EditorToolbarPluginOptions = {
  actions?: EditorToolbarAction[];
  labels?: Partial<Record<EditorToolbarAction, string>>;
  className?: string;
};

type EditorToolbarProps = Required<Pick<EditorToolbarPluginOptions, 'actions' | 'labels'>> &
  Pick<EditorToolbarPluginOptions, 'className'> & {
    registry: EditorPluginRegistry;
  };

const legacyActionAliases: Record<string, string> = {
  bold: 'text-format.bold',
  'bullet-list': 'list.unordered',
  code: 'text-format.code',
  'heading-1': 'heading.h1',
  'heading-2': 'heading.h2',
  italic: 'text-format.italic',
  'ordered-list': 'list.ordered',
  redo: 'history.redo',
  strikethrough: 'text-format.strikethrough',
  undo: 'history.undo',
};

const normalizeActionId = (action: string) => legacyActionAliases[action] ?? action;

const EditorToolbar = ({ actions, className, labels, registry }: EditorToolbarProps) => {
  return (
    <EditorActionToolbar
      actionIds={actions}
      ariaLabel="Editor formatting toolbar"
      actions={registry.toolbarActions}
      className={className}
      labels={labels}
      normalizeActionId={normalizeActionId}
      registry={registry}
      surface="toolbar"
    />
  );
};

export const toolbarPlugin = ({
  actions = [],
  className,
  labels = {},
}: EditorToolbarPluginOptions = {}) =>
  createEditorPlugin({
    name: 'toolbar',
    slot: 'before-content',
    setup: ({ registry }) => {
      if (!registry) {
        return null;
      }

      return (
        <EditorToolbar
          actions={actions}
          className={className}
          labels={labels}
          registry={registry}
        />
      );
    },
  });
