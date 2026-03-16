import { expect, test } from 'vite-plus/test';

import { themeModes } from '../src';

test('theme modes stay limited to the public light and dark options', () => {
  expect(themeModes).toEqual(['light', 'dark']);
});
