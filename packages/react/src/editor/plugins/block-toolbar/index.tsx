import { createEditorPlugin, type EditorPluginRegistry } from '../../core/index.js';
import { EditorActionToolbar } from '../action-toolbar/index.js';

export type BlockToolbarPluginOptions = {
  actions?: string[];
  className?: string;
  labels?: Partial<Record<string, string>>;
};

type BlockToolbarProps = Required<Pick<BlockToolbarPluginOptions, 'actions' | 'labels'>> &
  Pick<BlockToolbarPluginOptions, 'className'> & {
    registry: EditorPluginRegistry;
  };

const BlockToolbar = ({ actions, className, labels, registry }: BlockToolbarProps) => (
  <EditorActionToolbar
    actionIds={actions}
    actions={registry.blockToolbarActions}
    ariaLabel="Editor block toolbar"
    className={className}
    labels={labels}
    registry={registry}
    surface="block"
  />
);

export const blockToolbarPlugin = ({
  actions = [],
  className,
  labels = {},
}: BlockToolbarPluginOptions = {}) =>
  createEditorPlugin({
    name: 'block-toolbar',
    setup: ({ registry }) =>
      registry ? (
        <BlockToolbar actions={actions} className={className} labels={labels} registry={registry} />
      ) : null,
  });
