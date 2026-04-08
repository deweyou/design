import * as namedIconExports from '../generated/components';

import { expect, test } from 'vite-plus/test';

import { hasIconName, iconNames, loadIconDefinition } from './index';

test('generated icon names stay unique', () => {
  expect(new Set(iconNames).size).toBe(iconNames.length);
});

test('generated export names stay aligned to icon count', () => {
  const componentExportNames = Object.keys(namedIconExports).filter((name) =>
    name.endsWith('Icon'),
  );

  expect(componentExportNames).toHaveLength(iconNames.length);
});

test('icon name guard stays aligned to generated names', () => {
  expect(hasIconName('add')).toBe(true);
  expect(hasIconName('unknown-icon')).toBe(false);
});

test('icon definitions can be loaded lazily by name', async () => {
  const definition = await loadIconDefinition('add');

  expect(definition.sourceKey).toBe('add');
  expect(definition.viewBox).toBeTruthy();
  expect(definition.body).toContain('<path');
});
