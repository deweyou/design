import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS,
  type Transformer,
} from '@lexical/markdown';

import type { EditorAdapter, EditorPluginRegistry } from '../../core/index.js';
import { FRONTMATTER_TRANSFORMER } from '../../frontmatter/index.js';
import { isLexicalRuntime } from '../../runtime/lexical.js';

export type MarkdownEditorAdapterOptions = {
  transformers?: Transformer[];
};

const withFrontmatterTransformer = (transformers: Transformer[]) =>
  transformers.includes(FRONTMATTER_TRANSFORMER)
    ? transformers
    : [FRONTMATTER_TRANSFORMER, ...transformers];

const getImportTransformers = (
  transformers: Transformer[],
  registry: EditorPluginRegistry | undefined,
) =>
  registry?.features.has('frontmatter') ? withFrontmatterTransformer(transformers) : transformers;

export const markdownEditorAdapter = (
  options: MarkdownEditorAdapterOptions = {},
): EditorAdapter<string> => {
  const transformers = options.transformers ?? TRANSFORMERS;

  return {
    name: 'markdown',
    createInitialState: ({ value, defaultValue, registry }) => {
      $convertFromMarkdownString(
        value ?? defaultValue ?? '',
        getImportTransformers(transformers, registry),
      );
    },
    readValue: ({ runtime }) => {
      if (!isLexicalRuntime(runtime)) {
        return '';
      }

      return $convertToMarkdownString(withFrontmatterTransformer(transformers));
    },
    applyValue: ({ registry, value }) => {
      $convertFromMarkdownString(value, getImportTransformers(transformers, registry));
    },
  };
};
