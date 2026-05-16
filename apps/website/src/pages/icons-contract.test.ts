import { expect, test } from 'vite-plus/test';

import { iconRegistry } from '../../../../packages/react-icons/src/icon-registry';

test('website icon registry covers the full TDesign icon set', () => {
  expect(iconRegistry.length).toBeGreaterThan(2000);
});
