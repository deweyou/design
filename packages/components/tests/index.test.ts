import { expect, test } from 'vite-plus/test';

import { buttonCustomizationContract } from '../src';

test('button contract exposes root className and color-only overrides', () => {
  expect(buttonCustomizationContract.rootClassNameSupport).toBe(true);
  expect(buttonCustomizationContract.componentStyleVariables).toEqual([
    '--button-brand-bg',
    '--button-text-color',
  ]);
});
