import { createElement, createRef } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Time } from '@internationalized/date';
import { expect, test } from 'vite-plus/test';

import * as components from '../src';

const SearchIcon = () => {
  return createElement('svg', { 'aria-hidden': true, viewBox: '0 0 16 16' });
};

SearchIcon.displayName = 'SearchIcon';

const exampleButtonProps: import('../src').ButtonProps = {
  href: '/docs/button',
  htmlType: 'submit',
  color: 'primary',
  icon: createElement(SearchIcon),
  shape: 'pill',
  size: 'md',
  type: 'button',
  variant: 'outlined',
};

const exampleIconButtonProps: import('../src').IconButtonProps = {
  'aria-label': 'Open search',
  color: 'danger',
  href: '/docs/search',
  htmlType: 'button',
  icon: createElement(SearchIcon),
  loading: true,
  shape: 'pill',
  size: 'md',
  target: '_blank',
  variant: 'outlined',
};

const exampleTextProps: import('../src').TextProps = {
  background: 'yellow',
  children: '说明文字',
  color: 'olive',
  italic: true,
  lineClamp: 2,
  variant: 'caption',
};

const examplePopoverProps: import('../src').PopoverProps = {
  children: createElement('button', { type: 'button' }, '打开浮层'),
  content: '基础内容',
  mode: 'card',
  offset: 8,
  overlayClassName: 'consumer-overlay',
  placement: 'right-bottom',
  shape: 'rounded',
  trigger: ['click', 'focus'],
};

const exampleMarkdownRenderProps: import('../src').MarkdownRenderProps = {
  frontmatter: {
    propertyTypes: { published: 'date' },
  },
  value: '# 标题\n\n- 事项',
  size: 'md',
  onCopy: ({ text }) => {
    void text;
  },
  onLinkClick: ({ href, index, text }) => {
    void href;
    void index;
    void text;
  },
  components: {
    a: ({ children, ...props }) => createElement('a', { ...props, target: '_blank' }, children),
  },
};

const exampleMermaidRenderProps: import('../src').MermaidRenderProps = {
  value: 'flowchart TD\n  A --> B',
};

const exampleNumberInputProps: import('../src').NumberInputProps = {
  defaultValue: '2',
  label: 'Quantity',
  max: 10,
  min: 1,
  onValueChange: ({ value, valueAsNumber }) => {
    void value;
    void valueAsNumber;
  },
  step: 1,
};

const exampleDatePickerProps: import('../src').DatePickerProps = {
  defaultValue: components.parseDatePickerValue('2026-07-22'),
  format: (value, { locale }) => `${locale}: ${value.toString()}`,
  label: 'Published',
  max: components.parseDatePickerValue('2026-12-31'),
  min: components.parseDatePickerValue('2026-01-01'),
  mode: 'month',
  onValueChange: ({ value }) => {
    void value;
  },
  parse: (input) => components.parseDatePickerValue(input.split(': ').at(-1) ?? input),
  showToday: true,
};

const exampleDatePickerMode: import('../src').DatePickerMode = 'year';

const exampleDatePickerLocaleText: import('../src').DatePickerLocaleTextOverrides = {
  openCalendar: 'Open release calendar',
  today: 'Today',
};

const exampleDatePickerTimeProps: import('../src').DatePickerDateTimeProps = {
  defaultValue: components.parseDatePickerDateTimeValue('2026-07-22T14:30'),
  label: 'Published at',
  onValueChange: ({ value }) => {
    void value;
  },
  showToday: true,
  showTime: true,
};

const exampleDateRangePickerProps: import('../src').DateRangePickerProps = {
  defaultValue: {
    end: components.parseDatePickerValue('2026-07-25'),
    start: components.parseDatePickerValue('2026-07-22'),
  },
  label: 'Publishing period',
  onValueChange: ({ value }) => {
    void value?.start;
    void value?.end;
  },
};

const exampleDateRangePickerTimeProps: import('../src').DateRangePickerDateTimeProps = {
  defaultValue: {
    end: components.parseDatePickerDateTimeValue('2026-07-25T18:00'),
    start: components.parseDatePickerDateTimeValue('2026-07-22T09:00'),
  },
  label: 'Booking period',
  showTime: {
    defaultTime: {
      end: new Time(18, 0),
      start: new Time(9, 0),
    },
  },
};

const exampleEditorProps: import('../src').EditorProps<string> = {
  adapter: components.markdownEditorAdapter(),
  defaultValue: '# Editor',
  plugins: [
    components.frontmatterPlugin(),
    components.richTextPlugin(),
    components.markdownShortcutPlugin(),
  ],
};

const exampleFrontmatterProps: import('../src').FrontmatterProps = {
  localeText: { addProperty: 'New metadata' },
  propertyOptions: {
    priority: { number: { max: 5, min: 0, step: 1 }, placeholder: 'Set priority' },
    slug: { editable: false },
  },
  propertyTypes: { published: 'date' },
  value: { draft: true, published: '2026-07-22', tags: ['markdown'] },
};

void exampleButtonProps;
void exampleDatePickerProps;
void exampleDatePickerMode;
void exampleDatePickerLocaleText;
void exampleDatePickerTimeProps;
void exampleDateRangePickerProps;
void exampleDateRangePickerTimeProps;
void exampleEditorProps;
void exampleFrontmatterProps;
void exampleIconButtonProps;
void exampleMarkdownRenderProps;
void exampleMermaidRenderProps;
void exampleNumberInputProps;
void examplePopoverProps;
void exampleTextProps;

test('components root entry exposes Button, IconButton, Popover, Text, Menu family, Tabs family, Phase 2, Phase 3, and MarkdownRender components as the runtime public exports', () => {
  expect(Object.keys(components).sort()).toEqual([
    'Badge',
    'Breadcrumb',
    'Button',
    'Card',
    'Checkbox',
    'CodeBlock',
    'CodeBlockActionButton',
    'CodeBlockLanguageButton',
    'CodeBlockLanguageLabel',
    'CodeBlockToolbar',
    'ConfigProvider',
    'ContextMenu',
    'DatePicker',
    'DateRangePicker',
    'Dialog',
    'Editor',
    'EditorPluginCompatibilityError',
    'Field',
    'Frontmatter',
    'GroupedVirtualMasonry',
    'IconButton',
    'ImageMasonry',
    'ImagePreview',
    'Input',
    'MarkdownRender',
    'Menu',
    'MenuCheckboxItem',
    'MenuContent',
    'MenuGroup',
    'MenuGroupLabel',
    'MenuItem',
    'MenuRadioGroup',
    'MenuRadioItem',
    'MenuSeparator',
    'MenuTrigger',
    'MenuTriggerItem',
    'MermaidRender',
    'MindmapRender',
    'Nav',
    'NavOverlay',
    'NumberInput',
    'Pagination',
    'Popover',
    'RadioGroup',
    'ScrollArea',
    'Select',
    'Separator',
    'Skeleton',
    'Spinner',
    'Switch',
    'TabContent',
    'TabIndicator',
    'TabList',
    'TabTrigger',
    'Tabs',
    'Text',
    'Textarea',
    'Toaster',
    'Tooltip',
    'VirtualList',
    'VirtualMasonry',
    'blockToolbarPlugin',
    'codePlugin',
    'composeEditorPlugins',
    'configLocales',
    'createEditorPlugin',
    'createEditorPluginCompatibilityError',
    'defaultConfigLocale',
    'detectMermaidDiagramType',
    'floatingToolbarPlugin',
    'formatJsonPreservingDuplicateKeys',
    'frontmatterPlugin',
    'frontmatterPropertyTypeOptions',
    'hasDuplicateJsonObjectKeys',
    'headingPlugin',
    'historyPlugin',
    'isEditorPluginCompatibilityError',
    'keyboardShortcutPlugin',
    'linkPlugin',
    'listPlugin',
    'markdownEditorAdapter',
    'markdownRenderSizeOptions',
    'markdownShortcutPlugin',
    'parseDatePickerDateTimeValue',
    'parseDatePickerValue',
    'pastePlugin',
    'quotePlugin',
    'richTextPlugin',
    'tablePlugin',
    'textFormatPlugin',
    'toast',
    'toolbarPlugin',
    'useFieldContext',
    'useFieldControlProps',
  ]);
});

test('components root entry renders Button, IconButton, Popover, Text, and MarkdownRender without any legacy contract object', () => {
  const buttonMarkup = renderToStaticMarkup(
    createElement(components.Button, { href: '/publish' }, 'Publish'),
  );
  const iconButtonMarkup = renderToStaticMarkup(
    createElement(components.IconButton, {
      'aria-label': 'Open search',
      href: '/search',
      icon: createElement(SearchIcon),
    }),
  );
  const popoverMarkup = renderToStaticMarkup(
    createElement(
      components.Popover,
      { content: createElement('span', null, '公开说明') },
      createElement('button', { type: 'button' }, 'Open popover'),
    ),
  );
  const textMarkup = renderToStaticMarkup(
    createElement(components.Text, { variant: 'body' }, '公开正文'),
  );
  const markdownMarkup = renderToStaticMarkup(
    createElement(components.MarkdownRender, { value: '# Public markdown' }),
  );

  expect(buttonMarkup).toContain('data-content-mode="text-only"');
  expect(buttonMarkup.startsWith('<a')).toBe(true);
  expect(iconButtonMarkup).toContain('data-content-mode="icon-button"');
  expect(iconButtonMarkup.startsWith('<a')).toBe(true);
  expect(popoverMarkup).toContain('aria-haspopup="dialog"');
  expect(popoverMarkup).toContain('Open popover');
  expect(textMarkup.startsWith('<div')).toBe(true);
  expect(textMarkup).toContain('公开正文');
  expect(markdownMarkup).toContain('data-markdown-root="true"');
  expect(markdownMarkup).toContain('data-markdown-node="h1"');
  expect(markdownMarkup).toContain('Public markdown');
  expect(components.Button.Icon).toBe(components.IconButton);
});

test('components root entry accepts HTMLButtonElement refs for Button and IconButton', () => {
  const buttonRef = createRef<HTMLButtonElement>();
  const iconButtonRef = createRef<HTMLButtonElement>();

  void createElement(components.Button, { ref: buttonRef }, 'Publish');
  void createElement(components.IconButton, {
    'aria-label': 'Open search',
    icon: createElement(SearchIcon),
    ref: iconButtonRef,
  });

  expect(buttonRef.current).toBeNull();
  expect(iconButtonRef.current).toBeNull();
});
