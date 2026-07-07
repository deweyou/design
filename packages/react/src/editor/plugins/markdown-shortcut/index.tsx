import { TRANSFORMERS, type Transformer } from '@lexical/markdown';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';

import { createEditorPlugin } from '../../core/index.js';

export type MarkdownShortcutPluginOptions = {
  shortcuts?: string[];
};

export const markdownShortcutPlugin = ({ shortcuts }: MarkdownShortcutPluginOptions = {}) =>
  createEditorPlugin({
    name: 'markdown-shortcut',
    setup: ({ registry }) => {
      const enabledShortcuts = shortcuts ? new Set(shortcuts) : undefined;
      const transformers: Transformer[] = registry
        ? (registry.markdownShortcuts
            .filter((shortcut) => !enabledShortcuts || enabledShortcuts.has(shortcut.feature))
            .flatMap((shortcut) => shortcut.transformers) as Transformer[])
        : TRANSFORMERS;

      return <MarkdownShortcutPlugin transformers={transformers} />;
    },
  });
