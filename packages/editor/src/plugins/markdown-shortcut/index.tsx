import { TRANSFORMERS } from '@lexical/markdown';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';

import { createEditorPlugin } from '../../core/index.js';
import { isLexicalRuntime } from '../../runtime/lexical.js';

export const markdownShortcutPlugin = () =>
  createEditorPlugin({
    name: 'markdown-shortcut',
    setup: ({ runtime }) => {
      if (!isLexicalRuntime(runtime)) {
        return null;
      }

      return <MarkdownShortcutPlugin transformers={TRANSFORMERS} />;
    },
  });
