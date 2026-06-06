// @vitest-environment jsdom

import '../../test-setup';

import { isValidElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, test } from 'vite-plus/test';

import { markdownEditorAdapter } from '../../adapters/markdown/index.js';
import { Editor } from '../../editor/index.js';
import { createLexicalRuntime } from '../../runtime/lexical';
import { richTextPlugin } from './index';

afterEach(() => {
  cleanup();
});

test('richTextPlugin exposes a Dewey plugin wrapper', () => {
  const plugin = richTextPlugin();

  expect(plugin.name).toBe('rich-text');
  expect(renderToStaticMarkup(plugin.setup({ runtime: { kind: 'unknown', handle: null } }))).toBe(
    '',
  );
});

test('richTextPlugin renders Lexical base plugins for lexical runtime', () => {
  const plugin = richTextPlugin();
  const element = plugin.setup({ runtime: createLexicalRuntime(null) });

  expect(isValidElement(element)).toBe(true);
});

test('richTextPlugin lets users switch fenced code languages from the language pill', async () => {
  render(
    <Editor
      adapter={markdownEditorAdapter()}
      defaultValue={['```ts', 'const a = 1;', '```'].join('\n')}
      plugins={[richTextPlugin()]}
    />,
  );

  const codeBlock = await waitFor(() => {
    const element = document.querySelector('code[data-language="ts"]');

    expect(element).toBeInstanceOf(HTMLElement);

    return element as HTMLElement;
  });

  codeBlock.getBoundingClientRect = () =>
    ({
      bottom: 120,
      height: 100,
      left: 20,
      right: 420,
      toJSON: () => undefined,
      top: 20,
      width: 400,
      x: 20,
      y: 20,
    }) as DOMRect;

  fireEvent.click(codeBlock, { clientX: 390, clientY: 36 });

  expect(await screen.findByRole('listbox', { name: 'Code language' })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('option', { name: 'JavaScript' }));

  await waitFor(() => {
    expect(document.querySelector('code[data-language="js"]')).toBeInstanceOf(HTMLElement);
  });
});
