import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS,
} from '@lexical/markdown';

import type { EditorAdapter } from '../../core/index.js';
import { isLexicalRuntime } from '../../runtime/lexical.js';

export type MarkdownEditorAdapterOptions = {
  transformers?: typeof TRANSFORMERS;
};

export const markdownEditorAdapter = (
  options: MarkdownEditorAdapterOptions = {},
): EditorAdapter<string> => {
  const transformers = options.transformers ?? TRANSFORMERS;

  return {
    name: 'markdown',
    createInitialState: ({ value, defaultValue }) => {
      $convertFromMarkdownString(value ?? defaultValue ?? '', transformers);
    },
    readValue: ({ runtime }) => {
      if (!isLexicalRuntime(runtime)) {
        return '';
      }

      return $convertToMarkdownString(transformers);
    },
    applyValue: ({ value }) => {
      $convertFromMarkdownString(value, transformers);
    },
  };
};
