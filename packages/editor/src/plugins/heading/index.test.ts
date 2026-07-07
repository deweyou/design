import { expect, test } from 'vite-plus/test';

import { headingPlugin } from './index';

test('headingPlugin contributes only configured heading levels', () => {
  const plugin = headingPlugin({ levels: [1, 2] });

  expect(plugin.feature).toEqual({ id: 'heading' });
  expect(plugin.commands?.map((command) => command.id)).toEqual(['heading.h1', 'heading.h2']);
  expect(plugin.toolbarActions?.map((action) => action.id)).toEqual(['heading.h1', 'heading.h2']);
  expect(plugin.markdownShortcuts?.flatMap((shortcut) => shortcut.transformers).length).toBe(1);
});
