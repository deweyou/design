import { describe, expect, test } from 'vite-plus/test';

import {
  componentCategories,
  componentCatalog,
  findComponent,
  getComponentImportSnippet,
} from './index.js';

describe('component catalog', () => {
  test('keeps current public components available to AI tools', () => {
    const names = componentCatalog.map((component) => component.name);

    expect(names).toContain('Button');
    expect(names).toContain('Dialog');
    expect(names).toContain('NavOverlay');
    expect(names).toContain('VirtualList');
    expect(names).toContain('toast');
    expect(names).toContain('Toaster');
  });

  test('keeps catalog categories aligned with website navigation', () => {
    expect(componentCategories.map((category) => category.id)).toEqual([
      'actions',
      'forms',
      'overlays',
      'navigation',
      'feedback',
      'content',
      'data',
    ]);
  });

  test('looks up components case-insensitively', () => {
    expect(findComponent('button')?.name).toBe('Button');
    expect(findComponent('VIRTUALlist')?.name).toBe('VirtualList');
    expect(findComponent('missing')).toBeUndefined();
  });

  test('generates root and subpath import snippets', () => {
    expect(getComponentImportSnippet('Button')).toBe(
      "import { Button } from '@deweyou-design/react';",
    );
    expect(getComponentImportSnippet('Button', { subpath: true })).toBe(
      "import { Button } from '@deweyou-design/react/button';",
    );
    expect(getComponentImportSnippet('toast', { subpath: true })).toBe(
      "import { toast } from '@deweyou-design/react/toast';",
    );
  });
});
