// @vitest-environment jsdom

import '../../test-setup';

import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createHeadingNode } from '@lexical/rich-text';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical';
import { afterEach, expect, test } from 'vite-plus/test';

import { markdownEditorAdapter } from '../../adapters/markdown/index.js';
import { createEditorPlugin } from '../../core/index.js';
import { Editor } from '../../editor/index.js';
import { richTextPlugin } from '../rich-text/index.js';
import { toolbarPlugin } from './index';

afterEach(() => {
  cleanup();
});

const SelectBoldTextPlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.update(() => {
      const paragraph = $createParagraphNode();
      const text = $createTextNode('Bold text');

      text.toggleFormat('bold');
      paragraph.append(text);
      $getRoot().clear().append(paragraph);
      text.select(0, 4);
    });
  }, [editor]);

  return null;
};

const SelectHeadingTextPlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.update(() => {
      const heading = $createHeadingNode('h1');
      const text = $createTextNode('Heading text');

      heading.append(text);
      $getRoot().clear().append(heading);
      text.select(0, 7);
    });
  }, [editor]);

  return null;
};

test('toolbarPlugin renders an editor toolbar before the editable content', () => {
  render(
    <Editor
      adapter={markdownEditorAdapter()}
      defaultValue="Toolbar text"
      plugins={[richTextPlugin(), toolbarPlugin()]}
    />,
  );

  const toolbar = screen.getByRole('toolbar', { name: 'Editor formatting toolbar' });
  const textbox = screen.getByRole('textbox');

  expect(toolbar).toHaveAttribute('data-editor-toolbar', 'true');
  expect(toolbar.compareDocumentPosition(textbox)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  expect(screen.getByRole('button', { name: 'Bold' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Italic' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Heading 1' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Heading 2' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Bulleted list' })).toBeInTheDocument();
});

test('toolbarPlugin supports configurable actions and labels', () => {
  render(
    <Editor
      adapter={markdownEditorAdapter()}
      plugins={[
        toolbarPlugin({
          actions: ['bold', 'italic'],
          labels: {
            bold: 'Strong',
          },
        }),
      ]}
    />,
  );

  expect(screen.getByRole('button', { name: 'Strong' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Italic' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Undo' })).not.toBeInTheDocument();
});

test('toolbarPlugin marks selected inline formats as active', async () => {
  render(
    <Editor
      adapter={markdownEditorAdapter()}
      plugins={[
        richTextPlugin(),
        toolbarPlugin({ actions: ['bold', 'italic'] }),
        createEditorPlugin({
          name: 'select-bold-text',
          setup: () => <SelectBoldTextPlugin />,
        }),
      ]}
    />,
  );

  expect(await screen.findByRole('button', { name: 'Bold', pressed: true })).toHaveAttribute(
    'data-active',
    'true',
  );
  expect(screen.getByRole('button', { name: 'Italic' })).toHaveAttribute('aria-pressed', 'false');
});

test('toolbarPlugin marks selected heading blocks as active', async () => {
  render(
    <Editor
      adapter={markdownEditorAdapter()}
      plugins={[
        richTextPlugin(),
        toolbarPlugin({ actions: ['heading-1', 'heading-2'] }),
        createEditorPlugin({
          name: 'select-heading-text',
          setup: () => <SelectHeadingTextPlugin />,
        }),
      ]}
    />,
  );

  expect(await screen.findByRole('button', { name: 'Heading 1', pressed: true })).toHaveAttribute(
    'data-active',
    'true',
  );
  expect(screen.getByRole('button', { name: 'Heading 2' })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
});

test('toolbarPlugin disables actions when editor is read only', () => {
  render(
    <Editor
      adapter={markdownEditorAdapter()}
      plugins={[toolbarPlugin({ actions: ['bold', 'italic'] })]}
      readOnly
    />,
  );

  expect(screen.getByRole('button', { name: 'Bold' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Italic' })).toBeDisabled();
});

test('toolbar buttons dispatch formatting actions', async () => {
  const user = userEvent.setup();

  render(
    <Editor
      adapter={markdownEditorAdapter()}
      defaultValue="Toolbar text"
      plugins={[richTextPlugin(), toolbarPlugin({ actions: ['bold'] })]}
    />,
  );

  await user.click(screen.getByRole('button', { name: 'Bold' }));

  expect(screen.getByRole('button', { name: 'Bold' })).toBeEnabled();
});
