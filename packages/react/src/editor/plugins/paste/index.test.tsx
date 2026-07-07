// @vitest-environment jsdom

import '../../test-setup';

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, test } from 'vite-plus/test';

import { markdownEditorAdapter } from '../../adapters/markdown/index.js';
import { createEditorPlugin } from '../../core/index.js';
import { Editor } from '../../editor/index.js';
import { pastePlugin } from './index';

afterEach(() => {
  cleanup();
});

test('pastePlugin dispatches registered paste handlers in order', async () => {
  const calls: string[] = [];

  render(
    <Editor
      adapter={markdownEditorAdapter()}
      plugins={[
        createEditorPlugin({
          name: 'plain-paste-handler',
          pasteHandlers: [
            {
              feature: 'plain-text',
              handle: (_context, event) => {
                calls.push(event.clipboardData?.getData('text/plain') ?? '');
                return true;
              },
            },
          ],
        }),
        pastePlugin(),
      ]}
    />,
  );

  fireEvent.paste(screen.getByRole('textbox'), {
    clipboardData: {
      getData: () => 'pasted text',
    },
  });

  await waitFor(() => {
    expect(calls).toEqual(['pasted text']);
  });
});
