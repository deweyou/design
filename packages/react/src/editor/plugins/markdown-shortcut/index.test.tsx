import { isValidElement } from 'react';
import { expect, test } from 'vite-plus/test';

import { composeEditorPlugins } from '../../core/index';
import { headingPlugin } from '../heading/index';
import { textFormatPlugin } from '../text-format/index';
import { markdownShortcutPlugin } from './index';

test('markdownShortcutPlugin exposes a Dewey plugin wrapper', () => {
  const plugin = markdownShortcutPlugin();

  expect(plugin.name).toBe('markdown-shortcut');
});

test('markdownShortcutPlugin renders Lexical shortcut plugin from the registry', () => {
  const plugin = markdownShortcutPlugin();
  const registry = composeEditorPlugins([headingPlugin(), textFormatPlugin()]);
  const element = plugin.setup({ registry, runtime: { kind: 'unknown', handle: null } });

  expect(isValidElement(element)).toBe(true);
});

test('markdownShortcutPlugin filters shortcuts from enabled feature contributions', () => {
  const registry = composeEditorPlugins([headingPlugin({ levels: [1] }), textFormatPlugin()]);
  const plugin = markdownShortcutPlugin({ shortcuts: ['heading'] });
  const element = plugin.setup({ registry, runtime: { kind: 'unknown', handle: null } });

  expect(isValidElement(element)).toBe(true);
  expect((element as { props: { transformers: unknown[] } }).props.transformers).toEqual(
    headingPlugin({ levels: [1] }).markdownShortcuts?.[0]?.transformers,
  );
});
