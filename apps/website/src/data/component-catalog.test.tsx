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
  'CodeBlock',
  'ConfigProvider',
  'Dialog',
  'Field',
  'ImagePreview',
  'ImageMasonry',
  'GroupedVirtualMasonry',
  'Input',
  'DatePicker',
  'DateRangePicker',
  'NumberInput',
  'MarkdownRender',
  'Frontmatter',
  'Editor',
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
  'VirtualMasonry',
];

test('catalog covers every public React component surface', () => {
  expect(COMPONENT_CATALOG.map((item) => item.name)).toEqual(PUBLIC_COMPONENTS);
});

test('catalog entries have categories, import snippets, dimensions, previews, and story links', () => {
  for (const item of COMPONENT_CATALOG) {
    expect(COMPONENT_CATEGORIES.map((category) => category.id)).toContain(item.category);
    expect(item.importSnippet).toMatch(/@deweyou-design\/(?:react|editor)/);
    expect(item.dimensions.length).toBeGreaterThan(0);
    expect(item.storyId).toMatch(/^components-/);
    expect(item.preview).toBeDefined();
    expect(getStorybookUrl(item.storyId)).toContain('path=/docs/components-');
    expect(getStorybookUrl(item.storyId)).toContain('--overview');
  }
});

test('storybook links target the component docs overview on the deployed storybook', () => {
  expect(getStorybookUrl('components-breadcrumb--default')).toBe(
    'https://design-storybook-deweyous-projects.vercel.app/?path=/docs/components-breadcrumb--overview',
  );
});

test('picker catalog entries expose optional Today navigation', () => {
  const picker = COMPONENT_CATALOG.find((item) => item.name === 'DatePicker');
  const rangePicker = COMPONENT_CATALOG.find((item) => item.name === 'DateRangePicker');

  expect(picker?.dimensions).toEqual(
    expect.arrayContaining(['mode', 'showTime', 'showNow', 'showToday']),
  );
  expect(picker?.description).toContain('time wheels');
  expect(rangePicker?.dimensions).toEqual(
    expect.arrayContaining(['mode', 'showTime', 'showNow', 'showToday']),
  );
  expect(rangePicker?.description).toContain('contiguous');
});

test('NumberInput catalog entry exposes optional chrome', () => {
  const numberInput = COMPONENT_CATALOG.find((item) => item.name === 'NumberInput');

  expect(numberInput?.dimensions).toEqual(
    expect.arrayContaining(['placeholder', 'clearable', 'controls', 'focusRing']),
  );
  expect(numberInput?.description).toContain('optional clear and step controls');
});

test('Input catalog entry exposes placeholder and clearable behavior', () => {
  const input = COMPONENT_CATALOG.find((item) => item.name === 'Input');

  expect(input?.dimensions).toEqual(expect.arrayContaining(['placeholder', 'clearable']));
  expect(input?.description).toContain('optional localized clear action');
});
