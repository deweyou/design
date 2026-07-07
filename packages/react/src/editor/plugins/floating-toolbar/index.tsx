import { createEditorPlugin, type EditorPluginRegistry } from '../../core/index.js';
import { EditorActionToolbar } from '../action-toolbar/index.js';

export type FloatingToolbarPluginOptions = {
  actions?: string[];
  className?: string;
  labels?: Partial<Record<string, string>>;
};

type FloatingToolbarProps = Required<Pick<FloatingToolbarPluginOptions, 'actions' | 'labels'>> &
  Pick<FloatingToolbarPluginOptions, 'className'> & {
    registry: EditorPluginRegistry;
  };

const FloatingToolbar = ({ actions, className, labels, registry }: FloatingToolbarProps) => (
  <EditorActionToolbar
    actionIds={actions}
    actions={registry.floatingToolbarActions}
    ariaLabel="Editor floating toolbar"
    className={className}
    labels={labels}
    registry={registry}
    surface="floating"
    visibleWhenTextSelection
  />
);

export const floatingToolbarPlugin = ({
  actions = [],
  className,
  labels = {},
}: FloatingToolbarPluginOptions = {}) =>
  createEditorPlugin({
    name: 'floating-toolbar',
    setup: ({ registry }) =>
      registry ? (
        <FloatingToolbar
          actions={actions}
          className={className}
          labels={labels}
          registry={registry}
        />
      ) : null,
  });
