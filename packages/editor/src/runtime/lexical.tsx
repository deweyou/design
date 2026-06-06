import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import type { LexicalEditor } from 'lexical';

import type { EditorRuntime } from '../core/index.js';

export const lexicalEditorNodes = [
  HeadingNode,
  ListNode,
  ListItemNode,
  QuoteNode,
  LinkNode,
  CodeNode,
  CodeHighlightNode,
];

export type LexicalRuntimeHandle = {
  editor: LexicalEditor | null;
};

export type LexicalEditorRuntime = EditorRuntime & {
  kind: 'lexical';
  handle: LexicalRuntimeHandle;
};

export const createLexicalRuntime = (editor: LexicalEditor | null): LexicalEditorRuntime => ({
  kind: 'lexical',
  handle: { editor },
});

export const isLexicalRuntime = (runtime: EditorRuntime): runtime is LexicalEditorRuntime =>
  runtime.kind === 'lexical' &&
  typeof runtime.handle === 'object' &&
  runtime.handle !== null &&
  'editor' in runtime.handle;
