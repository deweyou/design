// @vitest-environment jsdom

import { test } from 'vite-plus/test';

import { expect } from '../test-setup';
import { COMPONENT_CATEGORIES, COMPONENT_CATALOG, getStorybookUrl } from './component-catalog';

const PUBLIC_COMPONENTS = [
  'Badge',
  'Breadcrumb',
  'Button',
  'IconButton',
  'Card',
  'Checkbox',
  'Dialog',
  'Field',
  'Input',
  'MarkdownRender',
  'Menu',
  'ContextMenu',
  'Nav',
  'NavOverlay',
  'Pagination',
  'Popover',
  'RadioGroup',
  'ScrollArea',
  'Select',
  'Separator',
  'Skeleton',
  'Spinner',
  'Switch',
  'Tabs',
  'Text',
  'Textarea',
  'toast',
  'Toaster',
  'Tooltip',
  'VirtualList',
];

test('catalog covers every public React component surface', () => {
  expect(COMPONENT_CATALOG.map((item) => item.name)).toEqual(PUBLIC_COMPONENTS);
});

test('catalog entries have categories, import snippets, dimensions, previews, and story links', () => {
  for (const item of COMPONENT_CATALOG) {
    expect(COMPONENT_CATEGORIES.map((category) => category.id)).toContain(item.category);
    expect(item.importSnippet).toContain('@deweyou-design/react');
    expect(item.dimensions.length).toBeGreaterThan(0);
    expect(item.storyId).toMatch(/^components-/);
    expect(item.preview).toBeDefined();
    expect(getStorybookUrl(item.storyId)).toContain(`path=/story/${item.storyId}`);
  }
});
