import { createEditorPlugin, type EditorPluginRegistry } from '../../core/index.js';
import { EditorActionToolbar } from '../action-toolbar/index.js';
import type { EditorActionToolbarLocaleText } from '../action-toolbar/locale/types.ts';

export type FloatingToolbarPluginOptions = {
  actions?: string[];
  className?: string;
  labels?: Partial<Record<string, string>>;
  localeText?: Partial<EditorActionToolbarLocaleText>;
};

type FloatingToolbarProps = Required<Pick<FloatingToolbarPluginOptions, 'actions' | 'labels'>> &
  Pick<FloatingToolbarPluginOptions, 'className'> & {
    localeText?: Partial<EditorActionToolbarLocaleText>;
    registry: EditorPluginRegistry;
  };

const FloatingToolbar = ({
  actions,
  className,
  labels,
  localeText,
  registry,
}: FloatingToolbarProps) => (
  <EditorActionToolbar
    actionIds={actions}
    actions={registry.floatingToolbarActions}
    className={className}
    labels={labels}
    localeText={localeText}
    registry={registry}
    surface="floating"
    visibleWhenTextSelection
  />
);

export const floatingToolbarPlugin = ({
  actions = [],
  className,
  labels = {},
  localeText,
}: FloatingToolbarPluginOptions = {}) =>
  createEditorPlugin({
    name: 'floating-toolbar',
    setup: ({ registry }) =>
      registry ? (
        <FloatingToolbar
          actions={actions}
          className={className}
          labels={labels}
          localeText={localeText}
          registry={registry}
        />
      ) : null,
  });

export type { EditorActionToolbarLocaleText as FloatingToolbarLocaleText } from '../action-toolbar/locale/types.ts';
