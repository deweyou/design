import { expect, it } from 'vite-plus/test';

import { iconRegistry } from '../icon-registry';
import * as icons from './index';
import * as publicSurface from '../index';

const expectedIconNames = iconRegistry.map(({ exportName }) => exportName).sort();

it('exports exactly the curated registry icon set', () => {
  expect(Object.keys(icons).sort()).toEqual(expectedIconNames);
});

it('keeps the root public surface to types plus curated icons', () => {
  expect(Object.keys(publicSurface).sort()).toEqual(expectedIconNames);
});

it('exports createIcon-backed components with stable display names', () => {
  for (const exportName of expectedIconNames) {
    const Icon = icons[exportName as keyof typeof icons] as { displayName?: string };

    expect(Icon.displayName).toBe(exportName);
  }
});

it('keeps registry export names unique and named as icons', () => {
  const names = iconRegistry.map(({ exportName }) => exportName);

  expect(new Set(names).size).toBe(names.length);
  expect(names.every((name) => /^[A-Z][A-Za-z0-9]*Icon$/.test(name))).toBe(true);
});

it('keeps registry source declarations explicit', () => {
  for (const entry of iconRegistry) {
    if (entry.source === 'tdesign') {
      expect(entry.sourceKey).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect('sourcePath' in entry).toBe(false);
    } else {
      expect(entry.sourcePath).toMatch(/^\.\/assets\/[a-z0-9-]+\.svg$/);
      expect('sourceKey' in entry).toBe(false);
    }
  }
});
