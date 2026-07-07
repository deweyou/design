import { expect, test } from 'vite-plus/test';

import { quotePlugin } from './index';

test('quotePlugin contributes quote command, action, and markdown shortcut', () => {
  const plugin = quotePlugin();

  expect(plugin.feature).toEqual({ id: 'quote' });
  expect(plugin.commands?.map((command) => command.id)).toEqual(['quote.toggle']);
  expect(plugin.toolbarActions?.map((action) => action.id)).toEqual(['quote.toggle']);
  expect(plugin.markdownShortcuts?.map((shortcut) => shortcut.feature)).toEqual(['quote']);
});
