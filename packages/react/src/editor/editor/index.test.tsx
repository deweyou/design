// @vitest-environment jsdom

import '../test-setup';

import { Suspense, createRef, useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical';
import { afterEach, expect, test, vi } from 'vite-plus/test';

import { markdownEditorAdapter } from '../adapters/markdown/index.js';
import { ConfigProvider } from '../../config-provider/index.tsx';
import { createEditorPlugin, type EditorHandle, type EditorPluginRegistry } from '../core/index.js';
import { markdownShortcutPlugin } from '../plugins/markdown-shortcut/index.js';
import { richTextPlugin } from '../plugins/rich-text/index.js';
import { tablePlugin } from '../plugins/table/index.js';
import { Editor } from './index';
import styles from './index.module.less';

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

test('loads the provider locale for the default accessible name', async () => {
  render(
    <Suspense fallback={<span>Loading locale</span>}>
      <ConfigProvider locale="zh-CN">
        <Editor adapter={markdownEditorAdapter()} />
      </ConfigProvider>
    </Suspense>,
  );

  expect(await screen.findByRole('textbox', { name: '编辑器' })).toBeInTheDocument();
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

test('passes the composed registry to plugin setup', () => {
  let receivedRegistry: EditorPluginRegistry | undefined;

  render(
    <Editor
      adapter={markdownEditorAdapter()}
      plugins={[
        createEditorPlugin({
          name: 'registry-aware',
          commands: [{ id: 'registry-aware.run', run: () => undefined }],
          setup: ({ registry }) => {
            receivedRegistry = registry;
            return null;
          },
        }),
      ]}
    />,
  );

  expect(receivedRegistry?.commands.has('registry-aware.run')).toBe(true);
});

test('exposes imperative editor handle for value and focus operations', async () => {
  const ref = createRef<EditorHandle<string>>();

  render(<Editor adapter={markdownEditorAdapter()} defaultValue="Initial markdown" ref={ref} />);

  await waitFor(() => {
    expect(ref.current?.getValue()).toContain('Initial markdown');
  });

  act(() => {
    ref.current?.setValue('Next markdown');
  });

  await waitFor(() => {
    expect(ref.current?.getValue()).toContain('Next markdown');
    expect(screen.getByText('Next markdown')).toBeInTheDocument();
  });

  act(() => {
    ref.current?.focus();
  });

  expect(screen.getByRole('textbox')).toHaveFocus();

  act(() => {
    ref.current?.blur();
  });

  expect(screen.getByRole('textbox')).not.toHaveFocus();
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

test('passes browser correction controls to the editable surface', () => {
  render(
    <Editor
      adapter={markdownEditorAdapter()}
      autoCapitalize="off"
      autoCorrect="off"
      spellCheck={false}
    />,
  );

  expect(screen.getByRole('textbox')).toHaveAttribute('autocapitalize', 'off');
  expect(screen.getByRole('textbox')).toHaveAttribute('autocorrect', 'off');
  expect(screen.getByRole('textbox')).toHaveAttribute('spellcheck', 'false');
});

test('applies the editor link theme class to markdown links', async () => {
  render(
    <Editor
      adapter={markdownEditorAdapter()}
      defaultValue="[Deweyou](https://deweyou.com)"
      plugins={[richTextPlugin(), markdownShortcutPlugin()]}
    />,
  );

  expect(styles.link).toBeTruthy();
  expect(await screen.findByRole('link', { name: 'Deweyou' })).toHaveClass(styles.link);
});

test('applies table theme classes to inserted tables', async () => {
  render(
    <Editor adapter={markdownEditorAdapter()} plugins={[tablePlugin({ initialTable: true })]} />,
  );

  const table = await screen.findByRole('table');
  const firstCell = table.querySelector('th, td');

  expect(styles.table).toBeTruthy();
  expect(styles.tableCell).toBeTruthy();
  expect(styles.tableCellHeader).toBeTruthy();
  expect(styles.tableCellSelected).toBeTruthy();
  expect(styles.tableSelection).toBeTruthy();
  expect(table).toHaveClass(styles.table);
  expect(firstCell).toHaveClass(styles.tableCell);
  expect(firstCell).not.toHaveClass(styles.tableCellHeader);
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
