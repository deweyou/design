import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { COMMAND_PRIORITY_LOW, PASTE_COMMAND } from 'lexical';

import { createEditorPlugin, type EditorPluginRegistry } from '../../core/index.js';
import { createLexicalRuntime } from '../../runtime/lexical.js';

const isClipboardEvent = (event: unknown): event is ClipboardEvent =>
  typeof event === 'object' && event !== null && 'clipboardData' in event;

const PasteRegistrationPlugin = ({ registry }: { registry: EditorPluginRegistry }) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      PASTE_COMMAND,
      (event) => {
        if (!isClipboardEvent(event)) {
          return false;
        }

        const context = { registry, runtime: createLexicalRuntime(editor) };

        for (const pasteHandler of registry.pasteHandlers) {
          if (!pasteHandler.handle(context, event)) {
            continue;
          }

          event.preventDefault();
          return true;
        }

        return false;
      },
      COMMAND_PRIORITY_LOW,
    );
  }, [editor, registry]);

  return null;
};

export const pastePlugin = () =>
  createEditorPlugin({
    name: 'paste',
    setup: ({ registry }) => (registry ? <PasteRegistrationPlugin registry={registry} /> : null),
  });
