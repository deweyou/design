// @vitest-environment jsdom

import '../../test-setup';

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { useEffect } from 'react';
import { $createCodeNode } from '@lexical/code';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { $createTextNode, $getRoot } from 'lexical';
import { afterEach, expect, test, vi } from 'vite-plus/test';

import { markdownEditorAdapter } from '../../adapters/markdown/index.js';
import { Editor } from '../../editor/index.js';
import { codePlugin } from './index';

const codeStyles = readFileSync(resolve(import.meta.dirname, './index.module.less'), 'utf8');

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const SelectCodeBlockPlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.update(() => {
      const code = $createCodeNode('json');
      const text = $createTextNode('{"a":1}');

      code.append(text);
      $getRoot().clear().append(code);
      text.select(0, text.getTextContentSize());
    });
  }, [editor]);

  return null;
};

const InsertCodeBlockPlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.update(() => {
      const code = $createCodeNode('json');

      code.append($createTextNode('{"a":1}'));
      $getRoot().clear().append(code);
    });
  }, [editor]);

  return null;
};

test('codePlugin keeps code block actions visible without focusing the code block', async () => {
  render(
    <Editor
      adapter={markdownEditorAdapter()}
      plugins={[
        codePlugin({
          format: { formatters: { json: (code) => code } },
          wrap: true,
        }),
        {
          name: 'insert-code-block',
          setup: () => <InsertCodeBlockPlugin />,
          slot: 'after-content',
        },
      ]}
    />,
  );

  const toolbar = await screen.findByRole('toolbar', { name: 'Code block actions' });

  expect(toolbar.getAttribute('data-editor-code-block-header')).toBe('true');
  expect(toolbar.getAttribute('data-code-block-toolbar')).toBe('header');
  expect(within(toolbar).getByRole('button', { name: 'Code language' }).textContent).toContain(
    'json',
  );
});

test('codePlugin keeps active code block actions interactive', async () => {
  render(
    <Editor
      adapter={markdownEditorAdapter()}
      plugins={[
        codePlugin({
          format: { formatters: { json: (code) => code } },
          wrap: true,
        }),
        {
          name: 'select-code-block',
          setup: () => <SelectCodeBlockPlugin />,
          slot: 'after-content',
        },
      ]}
    />,
  );

  const toolbar = await screen.findByRole('toolbar', { name: 'Code block actions' });

  expect(toolbar.getAttribute('data-editor-code-block-actions')).toBe('true');
  expect(within(toolbar).getByRole('button', { name: 'Code language' }).textContent).toContain(
    'json',
  );
  expect(within(toolbar).getByRole('button', { name: 'Copy code' })).toBeInstanceOf(HTMLElement);
  expect(within(toolbar).getByRole('button', { name: 'Wrap code' })).toBeInstanceOf(HTMLElement);
  expect(within(toolbar).getByRole('button', { name: 'Format code' })).toBeInstanceOf(HTMLElement);
});

test('codePlugin layers code block actions above editor overlays', () => {
  expect(codeStyles).toContain('.codeActions');
  expect(codeStyles).toContain('z-index: 30;');
  expect(codeStyles).toContain('isolation: isolate;');
  expect(codeStyles).toContain('user-select: none;');
  expect(codeStyles).toContain('.languageMenu');
  expect(codeStyles).toContain('z-index: 50;');
});

test('codePlugin exposes tooltips for icon-only code block actions', async () => {
  const user = userEvent.setup();

  render(
    <Editor
      adapter={markdownEditorAdapter()}
      plugins={[
        codePlugin({
          format: { formatters: { json: (code) => code } },
          wrap: true,
        }),
        {
          name: 'select-code-block',
          setup: () => <SelectCodeBlockPlugin />,
          slot: 'after-content',
        },
      ]}
    />,
  );

  const toolbar = await screen.findByRole('toolbar', { name: 'Code block actions' });

  await user.hover(within(toolbar).getByRole('button', { name: 'Code language' }));

  expect(await screen.findByText('Code language')).toBeTruthy();

  await user.hover(within(toolbar).getByRole('button', { name: 'Copy code' }));

  expect(await screen.findByText('Copy code')).toBeTruthy();
});

test('codePlugin language button opens the language listbox', async () => {
  const user = userEvent.setup();

  render(
    <Editor
      adapter={markdownEditorAdapter()}
      plugins={[
        codePlugin({
          languages: [
            { label: 'JSON', value: 'json' },
            { label: 'TypeScript', value: 'ts' },
          ],
        }),
        {
          name: 'select-code-block',
          setup: () => <SelectCodeBlockPlugin />,
          slot: 'after-content',
        },
      ]}
    />,
  );

  await user.click(await screen.findByRole('button', { name: 'Code language' }));

  const listbox = await screen.findByRole('listbox', { name: 'Code language' });

  expect(within(listbox).getByRole('option', { name: 'JSON' }).getAttribute('aria-selected')).toBe(
    'true',
  );

  await user.click(within(listbox).getByRole('option', { name: 'TypeScript' }));

  await waitFor(() => {
    expect(document.querySelector('code[data-language="ts"]')).toBeInstanceOf(HTMLElement);
  });
});

test('codePlugin copies active code block content', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);

  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  });

  render(
    <Editor
      adapter={markdownEditorAdapter()}
      plugins={[
        codePlugin(),
        {
          name: 'select-code-block',
          setup: () => <SelectCodeBlockPlugin />,
          slot: 'after-content',
        },
      ]}
    />,
  );

  fireEvent.click(await screen.findByRole('button', { name: 'Copy code' }));

  await waitFor(() => {
    expect(writeText).toHaveBeenCalledWith('{"a":1}');
  });
  expect(await screen.findByRole('button', { name: 'Copied code' })).toBeInstanceOf(HTMLElement);
});

test('codePlugin exposes visible wrap toggle state', async () => {
  const user = userEvent.setup();

  render(
    <Editor
      adapter={markdownEditorAdapter()}
      plugins={[
        codePlugin({ wrap: true }),
        {
          name: 'insert-code-block',
          setup: () => <InsertCodeBlockPlugin />,
          slot: 'after-content',
        },
      ]}
    />,
  );

  const wrapButton = await screen.findByRole('button', { name: 'Wrap code' });

  expect(wrapButton.getAttribute('aria-pressed')).toBe('true');
  expect(wrapButton.getAttribute('data-active')).toBe('true');

  await user.click(wrapButton);

  expect(wrapButton.getAttribute('aria-pressed')).toBe('false');
  expect(wrapButton.getAttribute('data-active')).toBeNull();
});

test('codePlugin shows format feedback even when formatting keeps the same text', async () => {
  const user = userEvent.setup();

  render(
    <Editor
      adapter={markdownEditorAdapter()}
      plugins={[
        codePlugin({
          format: { formatters: { json: (code) => code } },
        }),
        {
          name: 'insert-code-block',
          setup: () => <InsertCodeBlockPlugin />,
          slot: 'after-content',
        },
      ]}
    />,
  );

  await user.click(await screen.findByRole('button', { name: 'Format code' }));

  expect(await screen.findByRole('button', { name: 'Formatted code' })).toBeInstanceOf(HTMLElement);
});
