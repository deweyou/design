// @vitest-environment jsdom

import '../../test-setup';

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, test } from 'vite-plus/test';

import { markdownEditorAdapter } from '../../adapters/markdown/index.js';
import { createEditorPlugin } from '../../core/index.js';
import { Editor } from '../../editor/index.js';
import { keyboardShortcutPlugin } from './index';

afterEach(() => {
  cleanup();
});

test('keyboardShortcutPlugin dispatches registered keyboard commands', async () => {
  let runs = 0;

  render(
    <Editor
      adapter={markdownEditorAdapter()}
      plugins={[
        createEditorPlugin({
          name: 'shortcut-command',
          commands: [
            {
              id: 'shortcut.run',
              run: () => {
                runs += 1;
              },
            },
          ],
          keyboardShortcuts: [{ command: 'shortcut.run', id: 'shortcut.run.key', key: 'mod+b' }],
        }),
        keyboardShortcutPlugin(),
      ]}
    />,
  );

  fireEvent.keyDown(screen.getByRole('textbox'), {
    key: 'b',
    metaKey: true,
    shiftKey: true,
  });
  fireEvent.keyDown(screen.getByRole('textbox'), { key: 'b', metaKey: true });

  await waitFor(() => {
    expect(runs).toBe(1);
  });
});
