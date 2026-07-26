import { $getRoot, createEditor } from 'lexical';
import { expect, test } from 'vite-plus/test';

import { composeEditorPlugins } from '../../core/index';
import { $isFrontmatterNode, FrontmatterNode } from '../../frontmatter/index';
import { frontmatterPlugin } from '../../plugins/frontmatter/index';
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

test('markdown adapter imports and exports a leading frontmatter node when the plugin is enabled', () => {
  const registry = composeEditorPlugins([frontmatterPlugin()]);
  const editor = createEditor({
    namespace: 'MarkdownFrontmatterTest',
    nodes: [...lexicalEditorNodes, FrontmatterNode],
    onError: (error) => {
      throw error;
    },
  });
  const adapter = markdownEditorAdapter();
  const markdown = [
    '---',
    '# publication state',
    'title: "Frontmatter support"',
    'draft: true',
    '---',
    '',
    '# Body',
  ].join('\n');

  editor.update(
    () => {
      adapter.createInitialState({ defaultValue: markdown, registry, value: undefined });
      expect($isFrontmatterNode($getRoot().getFirstChild())).toBe(true);
    },
    { discrete: true },
  );

  const value = editor
    .getEditorState()
    .read(() => adapter.readValue({ registry, runtime: createLexicalRuntime(editor) }));

  expect(value).toContain('# publication state');
  expect(value).toContain('title: "Frontmatter support"');
  expect(value).toContain('draft: true');
  expect(value).toContain('# Body');
});

test('markdown adapter keeps legacy Markdown behavior when the frontmatter plugin is absent', () => {
  const editor = createEditor({
    namespace: 'MarkdownWithoutFrontmatterPluginTest',
    nodes: lexicalEditorNodes,
    onError: (error) => {
      throw error;
    },
  });
  const adapter = markdownEditorAdapter();

  editor.update(
    () => {
      adapter.createInitialState({
        defaultValue: ['---', 'draft: true', '---', 'Body'].join('\n'),
        value: undefined,
      });

      expect($isFrontmatterNode($getRoot().getFirstChild())).toBe(false);
    },
    { discrete: true },
  );
});
