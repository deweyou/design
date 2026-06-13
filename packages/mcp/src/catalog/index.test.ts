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
    expect(names).toContain('Editor');
    expect(names).toContain('GroupedVirtualMasonry');
    expect(names).toContain('ImageMasonry');
    expect(names).toContain('ImagePreview');
    expect(names).toContain('MermaidRender');
    expect(names).toContain('NavOverlay');
    expect(names).toContain('VirtualList');
    expect(names).toContain('VirtualMasonry');
    expect(names).toContain('toast');
    expect(names).toContain('Toaster');
    expect(
      componentCatalog.find((component) => component.name === 'GroupedVirtualMasonry'),
    ).toMatchObject({
      dimensions: expect.arrayContaining(['renderGroupHeader']),
      subpath: 'grouped-virtual-masonry',
    });
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
    expect(getComponentImportSnippet('MermaidRender', { subpath: true })).toBe(
      "import { MermaidRender } from '@deweyou-design/react/mermaid-render';",
    );
    expect(getComponentImportSnippet('ImageMasonry', { subpath: true })).toBe(
      "import { ImageMasonry } from '@deweyou-design/react/image-masonry';",
    );
    expect(getComponentImportSnippet('GroupedVirtualMasonry', { subpath: true })).toBe(
      "import { GroupedVirtualMasonry } from '@deweyou-design/react/grouped-virtual-masonry';",
    );
    expect(getComponentImportSnippet('toast', { subpath: true })).toBe(
      "import { toast } from '@deweyou-design/react/toast';",
    );
    expect(getComponentImportSnippet('Editor')).toBe(
      "import { Editor } from '@deweyou-design/editor';",
    );
    expect(getComponentImportSnippet('Editor', { subpath: true })).toBe(
      "import { Editor } from '@deweyou-design/editor/editor';",
    );
  });
});
