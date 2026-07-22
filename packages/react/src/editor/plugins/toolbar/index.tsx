import { createEditorPlugin, type EditorPluginRegistry } from '../../core/index.js';
import { EditorActionToolbar } from '../action-toolbar/index.js';
import type { EditorActionToolbarLocaleText } from '../action-toolbar/locale/types.ts';

export type EditorToolbarAction = string;

export type EditorToolbarPluginOptions = {
  actions?: EditorToolbarAction[];
  labels?: Partial<Record<EditorToolbarAction, string>>;
  localeText?: Partial<EditorActionToolbarLocaleText>;
  className?: string;
};

type EditorToolbarProps = Required<Pick<EditorToolbarPluginOptions, 'actions' | 'labels'>> &
  Pick<EditorToolbarPluginOptions, 'className'> & {
    localeText?: Partial<EditorActionToolbarLocaleText>;
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

const EditorToolbar = ({
  actions,
  className,
  labels,
  localeText,
  registry,
}: EditorToolbarProps) => {
  return (
    <EditorActionToolbar
      actionIds={actions}
      actions={registry.toolbarActions}
      className={className}
      labels={labels}
      localeText={localeText}
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
  localeText,
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
          localeText={localeText}
          registry={registry}
        />
      );
    },
  });

export type { EditorActionToolbarLocaleText as EditorToolbarLocaleText } from '../action-toolbar/locale/types.ts';
