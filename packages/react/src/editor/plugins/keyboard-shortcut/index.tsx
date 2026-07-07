import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { COMMAND_PRIORITY_LOW, KEY_DOWN_COMMAND } from 'lexical';

import {
  createEditorPlugin,
  type EditorKeyboardShortcutContribution,
  type EditorPluginRegistry,
} from '../../core/index.js';
import { createLexicalRuntime } from '../../runtime/lexical.js';

const normalizeKey = (key: string) => {
  if (key === ' ') {
    return 'space';
  }

  return key.toLowerCase();
};

const shortcutMatches = (shortcut: EditorKeyboardShortcutContribution, event: KeyboardEvent) => {
  const tokens = shortcut.key.toLowerCase().split('+');
  const key = tokens.at(-1);
  const modifiers = new Set(tokens.slice(0, -1));
  const expectsMod = modifiers.has('mod');

  if (normalizeKey(event.key) !== key) {
    return false;
  }

  if (expectsMod && !event.metaKey && !event.ctrlKey) {
    return false;
  }

  if (!expectsMod && event.metaKey !== modifiers.has('meta')) {
    return false;
  }

  if (!expectsMod && event.ctrlKey !== modifiers.has('ctrl')) {
    return false;
  }

  return event.altKey === modifiers.has('alt') && event.shiftKey === modifiers.has('shift');
};

const KeyboardShortcutRegistrationPlugin = ({ registry }: { registry: EditorPluginRegistry }) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event) => {
        const runtime = createLexicalRuntime(editor);

        for (const shortcut of registry.keyboardShortcuts) {
          if (!shortcutMatches(shortcut, event)) {
            continue;
          }

          const command = registry.commands.get(shortcut.command);

          if (!command || command.canRun?.({ registry, runtime }, shortcut.payload) === false) {
            continue;
          }

          event.preventDefault();
          void command.run({ registry, runtime }, shortcut.payload);
          return true;
        }

        return false;
      },
      COMMAND_PRIORITY_LOW,
    );
  }, [editor, registry]);

  return null;
};

export const keyboardShortcutPlugin = () =>
  createEditorPlugin({
    name: 'keyboard-shortcut',
    setup: ({ registry }) =>
      registry ? <KeyboardShortcutRegistrationPlugin registry={registry} /> : null,
  });
