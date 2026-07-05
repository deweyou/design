import { HEADING } from '@lexical/markdown';
import {
  $createHeadingNode,
  $isHeadingNode,
  HeadingNode,
  type HeadingTagType,
} from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import { $getSelection, $isRangeSelection } from 'lexical';

import {
  createEditorPlugin,
  type EditorAction,
  type EditorCommand,
  type EditorCommandContext,
} from '../../core/index.js';
import { isLexicalRuntime } from '../../runtime/lexical.js';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type HeadingPluginOptions = {
  levels?: HeadingLevel[];
};

const toHeadingTag = (level: HeadingLevel): HeadingTagType => `h${level}` as HeadingTagType;

const runHeadingCommand =
  (level: HeadingLevel) =>
  ({ runtime }: EditorCommandContext) => {
    if (!isLexicalRuntime(runtime) || !runtime.handle.editor) {
      return;
    }

    runtime.handle.editor.update(() => {
      $setBlocksType($getSelection(), () => $createHeadingNode(toHeadingTag(level)));
    });
  };

const isHeadingActive = (level: HeadingLevel) => () => {
  const selection = $getSelection();

  if (!$isRangeSelection(selection)) {
    return false;
  }

  const topLevelNode = selection.anchor.getNode().getTopLevelElementOrThrow();

  return $isHeadingNode(topLevelNode) && topLevelNode.getTag() === toHeadingTag(level);
};

export const headingPlugin = ({ levels = [1, 2, 3] }: HeadingPluginOptions = {}) => {
  const sortedLevels = [...new Set(levels)].sort((first, second) => first - second);

  return createEditorPlugin({
    name: 'heading',
    feature: { id: 'heading' },
    nodes: [HeadingNode],
    commands: sortedLevels.map(
      (level): EditorCommand => ({
        id: `heading.h${level}`,
        run: runHeadingCommand(level),
      }),
    ),
    toolbarActions: sortedLevels.map(
      (level): EditorAction => ({
        command: `heading.h${level}`,
        displayLabel: `H${level}`,
        id: `heading.h${level}`,
        isActive: isHeadingActive(level),
        label: `Heading ${level}`,
      }),
    ),
    markdownShortcuts: [
      {
        feature: 'heading',
        transformers: [HEADING],
      },
    ],
  });
};
