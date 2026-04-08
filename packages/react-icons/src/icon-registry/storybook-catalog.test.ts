import { expect, test } from 'vite-plus/test';

import { iconNames } from './index';

test('story-review registry exposes the full upstream icon set', () => {
  expect(iconNames.length).toBeGreaterThan(2000);
  expect(iconNames).toContain('add');
  expect(iconNames).toContain('chevron-right');
  expect(iconNames).toContain('info-circle');
});
