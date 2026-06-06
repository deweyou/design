import { $getRoot, createEditor } from 'lexical';
import { expect, test } from 'vite-plus/test';

import { createLexicalRuntime, lexicalEditorNodes } from '../../runtime/lexical';
import { markdownEditorAdapter } from './index';

test('markdown adapter initializes and reads markdown', () => {
  const editor = createEditor({
    namespace: 'MarkdownAdapterTest',
    nodes: lexicalEditorNodes,
    onError: (error) => {
      throw error;
    },
  });
  const adapter = markdownEditorAdapter();

  editor.update(
    () => {
      const state = adapter.createInitialState({
        value: '# Hello\n\nThis is **bold**.',
        defaultValue: undefined,
      });

      expect(state).toBeUndefined();
    },
    { discrete: true },
  );

  const value = editor
    .getEditorState()
    .read(() => adapter.readValue({ runtime: createLexicalRuntime(editor) }));

  expect(value).toContain('# Hello');
  expect(value).toContain('**bold**');
});

test('markdown adapter uses defaultValue when value is missing', () => {
  const editor = createEditor({
    namespace: 'MarkdownDefaultValueTest',
    nodes: lexicalEditorNodes,
    onError: (error) => {
      throw error;
    },
  });
  const adapter = markdownEditorAdapter();

  editor.update(
    () => {
      adapter.createInitialState({
        value: undefined,
        defaultValue: 'A default paragraph.',
      });
    },
    { discrete: true },
  );

  const text = editor.getEditorState().read(() => $getRoot().getTextContent());

  expect(text).toBe('A default paragraph.');
});

test('markdown adapter preserves fenced code languages', () => {
  const editor = createEditor({
    namespace: 'MarkdownCodeLanguageTest',
    nodes: lexicalEditorNodes,
    onError: (error) => {
      throw error;
    },
  });
  const adapter = markdownEditorAdapter();

  editor.update(
    () => {
      adapter.createInitialState({
        value: ['```ts', 'const a = 1;', '```'].join('\n'),
        defaultValue: undefined,
      });
    },
    { discrete: true },
  );

  const value = editor
    .getEditorState()
    .read(() => adapter.readValue({ runtime: createLexicalRuntime(editor) }));

  expect(value).toContain('```ts');
  expect(value).toContain('const a = 1;');
});
