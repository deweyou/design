import { createEditorPlugin, type EditorPluginRegistry } from '../../core/index.js';
import { EditorActionToolbar } from '../action-toolbar/index.js';
import type { EditorActionToolbarLocaleText } from '../action-toolbar/locale/types.ts';

export type BlockToolbarPluginOptions = {
  actions?: string[];
  className?: string;
  labels?: Partial<Record<string, string>>;
  localeText?: Partial<EditorActionToolbarLocaleText>;
};

type BlockToolbarProps = Required<Pick<BlockToolbarPluginOptions, 'actions' | 'labels'>> &
  Pick<BlockToolbarPluginOptions, 'className'> & {
    localeText?: Partial<EditorActionToolbarLocaleText>;
    registry: EditorPluginRegistry;
  };

const BlockToolbar = ({ actions, className, labels, localeText, registry }: BlockToolbarProps) => (
  <EditorActionToolbar
    actionIds={actions}
    actions={registry.blockToolbarActions}
    className={className}
    labels={labels}
    localeText={localeText}
    registry={registry}
    surface="block"
  />
);

export const blockToolbarPlugin = ({
  actions = [],
  className,
  labels = {},
  localeText,
}: BlockToolbarPluginOptions = {}) =>
  createEditorPlugin({
    name: 'block-toolbar',
    setup: ({ registry }) =>
      registry ? (
        <BlockToolbar
          actions={actions}
          className={className}
          labels={labels}
          localeText={localeText}
          registry={registry}
        />
      ) : null,
  });

export type { EditorActionToolbarLocaleText as BlockToolbarLocaleText } from '../action-toolbar/locale/types.ts';
