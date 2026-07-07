import { Fragment } from 'react';

import {
  createEditorPlugin,
  type EditorPlugin,
  type EditorPluginContext,
} from '../../core/index.js';
import { codePlugin } from '../code/index.js';
import { headingPlugin } from '../heading/index.js';
import { historyPlugin } from '../history/index.js';
import { linkPlugin } from '../link/index.js';
import { listPlugin } from '../list/index.js';
import { quotePlugin } from '../quote/index.js';
import { textFormatPlugin } from '../text-format/index.js';

const richTextFeaturePlugins = (): EditorPlugin[] => [
  historyPlugin(),
  textFormatPlugin(),
  headingPlugin({ levels: [1, 2, 3] }),
  listPlugin(),
  quotePlugin(),
  linkPlugin(),
  codePlugin(),
];

const renderRichTextSetups = (plugins: EditorPlugin[], context: EditorPluginContext) => (
  <>
    {plugins.map((plugin) => (
      <Fragment key={plugin.name}>{plugin.setup(context)}</Fragment>
    ))}
  </>
);

export const richTextPlugin = () => {
  const plugins = richTextFeaturePlugins();

  return createEditorPlugin({
    name: 'rich-text',
    blockToolbarActions: plugins.flatMap((plugin) => plugin.blockToolbarActions ?? []),
    commands: plugins.flatMap((plugin) => plugin.commands ?? []),
    floatingToolbarActions: plugins.flatMap((plugin) => plugin.floatingToolbarActions ?? []),
    keyboardShortcuts: plugins.flatMap((plugin) => plugin.keyboardShortcuts ?? []),
    markdownShortcuts: plugins.flatMap((plugin) => plugin.markdownShortcuts ?? []),
    nodes: plugins.flatMap((plugin) => plugin.nodes ?? []),
    pasteHandlers: plugins.flatMap((plugin) => plugin.pasteHandlers ?? []),
    setup: (context) => renderRichTextSetups(plugins, context),
    toolbarActions: plugins.flatMap((plugin) => plugin.toolbarActions ?? []),
  });
};
