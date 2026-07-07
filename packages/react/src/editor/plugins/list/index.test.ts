import { expect, test } from 'vite-plus/test';

import { listPlugin } from './index';

test('listPlugin contributes ordered and unordered list capabilities', () => {
  const plugin = listPlugin();

  expect(plugin.feature).toEqual({ id: 'list' });
  expect(plugin.commands?.map((command) => command.id)).toEqual(['list.unordered', 'list.ordered']);
  expect(plugin.toolbarActions?.map((action) => action.id)).toEqual([
    'list.unordered',
    'list.ordered',
  ]);
});
