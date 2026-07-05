import { expect, test } from 'vite-plus/test';

import { historyPlugin } from './index';

test('historyPlugin contributes undo and redo commands and toolbar actions', () => {
  const plugin = historyPlugin();

  expect(plugin.feature).toEqual({ id: 'history' });
  expect(plugin.commands?.map((command) => command.id)).toEqual(['history.undo', 'history.redo']);
  expect(plugin.toolbarActions?.map((action) => action.id)).toEqual([
    'history.undo',
    'history.redo',
  ]);
});
