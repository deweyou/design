import { isValidElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vite-plus/test';

import { createLexicalRuntime } from '../../runtime/lexical';
import { markdownShortcutPlugin } from './index';

test('markdownShortcutPlugin exposes a Dewey plugin wrapper', () => {
  const plugin = markdownShortcutPlugin();

  expect(plugin.name).toBe('markdown-shortcut');
  expect(renderToStaticMarkup(plugin.setup({ runtime: { kind: 'unknown', handle: null } }))).toBe(
    '',
  );
});

test('markdownShortcutPlugin renders Lexical shortcut plugin for lexical runtime', () => {
  const plugin = markdownShortcutPlugin();
  const element = plugin.setup({ runtime: createLexicalRuntime(null) });

  expect(isValidElement(element)).toBe(true);
});
