import { expect, test } from 'vite-plus/test';

import { textFormatPlugin } from './index';

test('textFormatPlugin contributes inline mark commands, actions, and shortcuts', () => {
  const plugin = textFormatPlugin();

  expect(plugin.feature).toEqual({ id: 'text-format' });
  expect(plugin.commands?.map((command) => command.id)).toEqual([
    'text-format.bold',
    'text-format.italic',
    'text-format.strikethrough',
    'text-format.code',
  ]);
  expect(plugin.toolbarActions?.map((action) => action.id)).toEqual([
    'text-format.bold',
    'text-format.italic',
    'text-format.strikethrough',
    'text-format.code',
  ]);
  expect(plugin.markdownShortcuts?.map((shortcut) => shortcut.feature)).toEqual(['text-format']);
});
