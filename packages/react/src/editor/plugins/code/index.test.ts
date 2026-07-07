// @vitest-environment jsdom

import { $createCodeNode, $isCodeNode, CodeHighlightNode, CodeNode } from '@lexical/code';
import { $createTextNode, $getRoot, createEditor, type LexicalEditor } from 'lexical';
import { expect, test } from 'vite-plus/test';

import {
  composeEditorPlugins,
  type EditorCommandContext,
  type EditorRuntime,
} from '../../core/index';
import { createLexicalRuntime } from '../../runtime/lexical';
import { codePlugin } from './index';

const createCodeEditor = () =>
  createEditor({
    namespace: 'CodePluginTest',
    nodes: [CodeNode, CodeHighlightNode],
    onError: (error) => {
      throw error;
    },
  });

const insertSelectedCodeBlock = (
  editor: LexicalEditor,
  { code, language }: { code: string; language?: string },
) => {
  editor.update(
    () => {
      const codeNode = $createCodeNode(language);
      const textNode = $createTextNode(code);

      codeNode.append(textNode);
      $getRoot().clear().append(codeNode);
      textNode.select(0, code.length);
    },
    { discrete: true },
  );
};

const readCodeBlock = (editor: LexicalEditor) =>
  editor.getEditorState().read(() => {
    const node = $getRoot().getFirstChild();

    if (!$isCodeNode(node)) {
      return undefined;
    }

    return {
      code: node.getTextContent(),
      language: node.getLanguage() ?? undefined,
    };
  });

const waitForLexicalUpdate = () => new Promise((resolve) => setTimeout(resolve, 0));

test('codePlugin keeps code as one parameterized feature', () => {
  const plugin = codePlugin({
    format: {
      formatters: {
        json: async (code) => code,
      },
    },
    highlight: true,
    languageMenu: true,
    wrap: true,
  });

  expect(plugin.feature).toEqual({ id: 'code' });
  expect(plugin.commands?.map((command) => command.id)).toEqual([
    'code.toggle-block',
    'code.set-language',
    'code.toggle-wrap',
    'code.format',
  ]);
  expect(plugin.blockToolbarActions).toEqual([]);
});

test('codePlugin cycles selected code block languages', async () => {
  const editor = createCodeEditor();
  const plugin = codePlugin({
    languages: [
      { label: 'TypeScript', value: 'ts' },
      { label: 'JSON', value: 'json' },
      { label: 'Plain text', value: undefined },
    ],
  });
  const registry = composeEditorPlugins([plugin]);
  const command = registry.commands.get('code.set-language');

  insertSelectedCodeBlock(editor, { code: 'const value = 1;', language: 'ts' });

  await command?.run({ registry, runtime: createLexicalRuntime(editor) });
  await waitForLexicalUpdate();

  expect(readCodeBlock(editor)?.language).toBe('json');

  await command?.run({ registry, runtime: createLexicalRuntime(editor) }, { language: 'ts' });
  await waitForLexicalUpdate();

  expect(readCodeBlock(editor)?.language).toBe('ts');
});

test('codePlugin formats selected code blocks with injected formatters', async () => {
  const editor = createCodeEditor();
  const plugin = codePlugin({
    format: {
      formatters: {
        json: (code) => JSON.stringify(JSON.parse(code), null, 2),
      },
    },
  });
  const registry = composeEditorPlugins([plugin]);
  const command = registry.commands.get('code.format');

  insertSelectedCodeBlock(editor, { code: '{"a":1}', language: 'json' });

  await command?.run({ registry, runtime: createLexicalRuntime(editor) });
  await waitForLexicalUpdate();

  expect(readCodeBlock(editor)?.code).toBe('{\n  "a": 1\n}');
});

test('codePlugin toggles editor level code wrapping', () => {
  const plugin = codePlugin({ wrap: true });
  const registry = composeEditorPlugins([plugin]);
  const command = registry.commands.get('code.toggle-wrap');
  const editorRoot = document.createElement('div');
  const contentEditable = document.createElement('div');
  const runtime = {
    kind: 'lexical',
    handle: {
      editor: {
        getRootElement: () => contentEditable,
      },
    },
  } as unknown as EditorRuntime;
  const context: EditorCommandContext = { registry, runtime };

  editorRoot.dataset.editorRoot = 'true';
  editorRoot.append(contentEditable);

  void command?.run(context);
  expect(editorRoot.dataset.editorCodeWrap).toBe('true');

  void command?.run(context);
  expect(editorRoot.dataset.editorCodeWrap).toBe('false');
});
