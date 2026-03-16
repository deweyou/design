import { expect, test } from 'vite-plus/test';

import { publicThemeTokens } from '../src';

test('styles package exposes the documented public color token surface', () => {
  expect(publicThemeTokens.map((token) => token.cssVar)).toEqual([
    '--ui-color-brand-bg',
    '--ui-color-brand-bg-hover',
    '--ui-color-brand-bg-active',
    '--ui-color-text-on-brand',
    '--ui-color-focus-ring',
    '--ui-color-link',
  ]);
});
