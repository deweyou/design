import { QuoteIcon } from '@deweyou-design/react-icons';
import { QUOTE } from '@lexical/markdown';
import { $createQuoteNode, $isQuoteNode, QuoteNode } from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import { $getSelection, $isRangeSelection } from 'lexical';

import { createEditorPlugin, type EditorCommandContext } from '../../core/index.js';
import { isLexicalRuntime } from '../../runtime/lexical.js';

const runQuoteCommand = ({ runtime }: EditorCommandContext) => {
  if (!isLexicalRuntime(runtime) || !runtime.handle.editor) {
    return;
  }

  runtime.handle.editor.update(() => {
    $setBlocksType($getSelection(), () => $createQuoteNode());
  });
};

const isQuoteActive = () => {
  const selection = $getSelection();

  if (!$isRangeSelection(selection)) {
    return false;
  }

  return $isQuoteNode(selection.anchor.getNode().getTopLevelElementOrThrow());
};

export const quotePlugin = () =>
  createEditorPlugin({
    name: 'quote',
    feature: { id: 'quote' },
    nodes: [QuoteNode],
    commands: [{ id: 'quote.toggle', run: runQuoteCommand }],
    toolbarActions: [
      {
        command: 'quote.toggle',
        icon: QuoteIcon,
        id: 'quote.toggle',
        isActive: isQuoteActive,
        label: 'Quote',
      },
    ],
    markdownShortcuts: [
      {
        feature: 'quote',
        transformers: [QUOTE],
      },
    ],
  });
