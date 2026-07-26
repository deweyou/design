import {
  FrontmatterEditorRegistration,
  FrontmatterNode,
  type FrontmatterEditorOptions,
} from '../../frontmatter/index.js';
import { createEditorPlugin } from '../../core/index.js';

export type FrontmatterPluginOptions = FrontmatterEditorOptions;

export const frontmatterPlugin = (options: FrontmatterPluginOptions = {}) =>
  createEditorPlugin({
    feature: { id: 'frontmatter' },
    name: 'frontmatter',
    nodes: [FrontmatterNode],
    setup: () => <FrontmatterEditorRegistration options={options} />,
  });
