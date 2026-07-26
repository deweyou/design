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
    expect(names).toContain('ConfigProvider');
    expect(names).toContain('Dialog');
    expect(names).toContain('DatePicker');
    expect(names).toContain('DateRangePicker');
    expect(names).toContain('Editor');
    expect(names).toContain('GroupedVirtualMasonry');
    expect(names).toContain('ImageMasonry');
    expect(names).toContain('ImagePreview');
    expect(names).toContain('MermaidRender');
    expect(names).toContain('NavOverlay');
    expect(names).toContain('NumberInput');
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
    expect(componentCatalog.find((component) => component.name === 'DatePicker')).toMatchObject({
      dimensions: expect.arrayContaining(['mode', 'showTime', 'showNow', 'showToday']),
      subpath: 'date-picker',
    });
    expect(
      componentCatalog.find((component) => component.name === 'DateRangePicker'),
    ).toMatchObject({
      dimensions: expect.arrayContaining(['mode', 'showTime', 'showNow', 'showToday']),
      subpath: 'date-range-picker',
    });
    expect(componentCatalog.find((component) => component.name === 'NumberInput')).toMatchObject({
      dimensions: expect.arrayContaining(['placeholder', 'clearable', 'controls', 'focusRing']),
      subpath: 'number-input',
    });
    expect(componentCatalog.find((component) => component.name === 'Input')).toMatchObject({
      dimensions: expect.arrayContaining(['placeholder', 'clearable']),
      subpath: 'input',
    });
  });

  test('keeps catalog categories aligned with website navigation', () => {
    expect(componentCategories.map((category) => category.id)).toEqual([
      'foundations',
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
    expect(getComponentImportSnippet('ConfigProvider', { subpath: true })).toBe(
      "import { ConfigProvider } from '@deweyou-design/react/config-provider';",
    );
    expect(getComponentImportSnippet('DatePicker', { subpath: true })).toBe(
      "import { DatePicker } from '@deweyou-design/react/date-picker';",
    );
    expect(getComponentImportSnippet('DateRangePicker', { subpath: true })).toBe(
      "import { DateRangePicker } from '@deweyou-design/react/date-range-picker';",
    );
    expect(getComponentImportSnippet('MermaidRender', { subpath: true })).toBe(
      "import { MermaidRender } from '@deweyou-design/react/mermaid-render';",
    );
    expect(getComponentImportSnippet('NumberInput', { subpath: true })).toBe(
      "import { NumberInput } from '@deweyou-design/react/number-input';",
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
      "import { Editor } from '@deweyou-design/react';",
    );
    expect(getComponentImportSnippet('Editor', { subpath: true })).toBe(
      "import { Editor } from '@deweyou-design/react/editor';",
    );
    expect(getComponentImportSnippet('Frontmatter', { subpath: true })).toBe(
      "import { Frontmatter } from '@deweyou-design/react/frontmatter';",
    );
  });
});
