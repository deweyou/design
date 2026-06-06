// @vitest-environment jsdom

import '../test-setup';

import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical';
import { afterEach, expect, test, vi } from 'vite-plus/test';

import { markdownEditorAdapter } from '../adapters/markdown/index.js';
import { createEditorPlugin } from '../core/index.js';
import { markdownShortcutPlugin } from '../plugins/markdown-shortcut/index.js';
import { richTextPlugin } from '../plugins/rich-text/index.js';
import { Editor } from './index';

afterEach(() => {
  cleanup();
});

test('renders editable editor with stable data attributes and placeholder', () => {
  render(
    <Editor
      adapter={markdownEditorAdapter()}
      placeholder="Write a comment..."
      plugins={[richTextPlugin(), markdownShortcutPlugin()]}
    />,
  );

  expect(screen.getByTestId('editor-root')).toHaveAttribute('data-editor-root', 'true');
  expect(screen.getByTestId('editor-content')).toHaveAttribute('data-editor-content', 'true');
  expect(screen.getByTestId('editor-content').parentElement).toHaveAttribute(
    'data-editor-content-frame',
    'true',
  );
  expect(screen.getByText('Write a comment...')).toBeInTheDocument();
});

const InsertTextOnMountPlugin = ({ text }: { text: string }) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.update(() => {
      const paragraph = $createParagraphNode();
      paragraph.append($createTextNode(text));
      $getRoot().clear().append(paragraph);
    });
  }, [editor, text]);

  return null;
};

test('emits markdown value when editor content changes', async () => {
  const onChange = vi.fn();

  render(
    <Editor
      adapter={markdownEditorAdapter()}
      plugins={[
        richTextPlugin(),
        markdownShortcutPlugin(),
        createEditorPlugin({
          name: 'insert-text-on-mount',
          setup: () => <InsertTextOnMountPlugin text="Hello editor" />,
        }),
      ]}
      onChange={onChange}
    />,
  );

  await waitFor(() => {
    expect(
      onChange.mock.calls.some(([details]) => {
        return String(details.value).includes('Hello editor');
      }),
    ).toBe(true);
  });
});

test('uses defaultValue as initial content', () => {
  render(
    <Editor
      adapter={markdownEditorAdapter()}
      defaultValue="Initial markdown"
      plugins={[richTextPlugin(), markdownShortcutPlugin()]}
    />,
  );

  expect(screen.getByText('Initial markdown')).toBeInTheDocument();
});

test('readOnly and disabled prevent editing', () => {
  const { rerender } = render(
    <Editor adapter={markdownEditorAdapter()} readOnly defaultValue="Read only text" />,
  );

  expect(screen.getByRole('textbox')).toHaveAttribute('contenteditable', 'false');
  expect(screen.getByTestId('editor-root')).toHaveAttribute('data-readonly', 'true');

  rerender(<Editor adapter={markdownEditorAdapter()} disabled defaultValue="Disabled text" />);

  expect(screen.getByRole('textbox')).toHaveAttribute('contenteditable', 'false');
  expect(screen.getByTestId('editor-root')).toHaveAttribute('data-disabled', 'true');
});
