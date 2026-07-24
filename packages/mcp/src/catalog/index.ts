export const storybookUrl = 'https://design-storybook-deweyous-projects.vercel.app';
export const websiteUrl = 'https://design.deweyou.me';

export const componentCategories = [
  { id: 'foundations', label: 'Foundations' },
  { id: 'actions', label: 'Actions' },
  { id: 'forms', label: 'Forms' },
  { id: 'overlays', label: 'Overlays' },
  { id: 'navigation', label: 'Navigation' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'content', label: 'Content' },
  { id: 'data', label: 'Data' },
] as const;

export type ComponentCategoryId = (typeof componentCategories)[number]['id'];

export type ComponentCatalogItem = {
  category: ComponentCategoryId;
  description: string;
  dimensions: string[];
  importName: string;
  importSnippet: string;
  name: string;
  packageName?: string;
  storyId: string;
  subpath: string;
};

const rootImport = (importName: string, packageName = '@deweyou-design/react') => {
  return `import { ${importName} } from '${packageName}';`;
};

export const componentCatalog: ComponentCatalogItem[] = [
  {
    name: 'Badge',
    importName: 'Badge',
    category: 'feedback',
    description: 'Compact status and metadata label for low-density surfaces.',
    dimensions: ['variant', 'color', 'shape'],
    storyId: 'components-badge--default',
    subpath: 'badge',
    importSnippet: rootImport('Badge'),
  },
  {
    name: 'Breadcrumb',
    importName: 'Breadcrumb',
    category: 'navigation',
    description: 'Hierarchy trail for document and application navigation.',
    dimensions: ['root', 'item', 'current'],
    storyId: 'components-breadcrumb--default',
    subpath: 'breadcrumb',
    importSnippet: rootImport('Breadcrumb'),
  },
  {
    name: 'Button',
    importName: 'Button',
    category: 'actions',
    description: 'Primary command surface with semantic variants and stable sizing.',
    dimensions: ['variant', 'color', 'size', 'shape'],
    storyId: 'components-button--variants',
    subpath: 'button',
    importSnippet: rootImport('Button'),
  },
  {
    name: 'IconButton',
    importName: 'IconButton',
    category: 'actions',
    description: 'Icon-only command that keeps accessible names explicit.',
    dimensions: ['variant', 'color', 'size', 'shape'],
    storyId: 'components-button--variants',
    subpath: 'button',
    importSnippet: rootImport('IconButton'),
  },
  {
    name: 'Card',
    importName: 'Card',
    category: 'content',
    description: 'Border-led content container for small grouped surfaces.',
    dimensions: ['padding', 'shape'],
    storyId: 'components-card--default',
    subpath: 'card',
    importSnippet: rootImport('Card'),
  },
  {
    name: 'Checkbox',
    importName: 'Checkbox',
    category: 'forms',
    description: 'Binary choice control with checked, unchecked, and disabled states.',
    dimensions: ['checked', 'disabled', 'invalid'],
    storyId: 'components-checkbox--default',
    subpath: 'checkbox',
    importSnippet: rootImport('Checkbox'),
  },
  {
    name: 'CodeBlock',
    importName: 'CodeBlock',
    category: 'content',
    description:
      'Scrollable code block with reusable chrome primitives for code actions and language UI.',
    dimensions: ['language', 'size', 'overflow', 'chrome'],
    storyId: 'components-codeblock--default',
    subpath: 'code-block',
    importSnippet: rootImport('CodeBlock'),
  },
  {
    name: 'ConfigProvider',
    importName: 'ConfigProvider',
    category: 'foundations',
    description:
      'Shared configuration boundary for typed locale selection and future global settings.',
    dimensions: ['locale', 'nesting', 'component localeText'],
    storyId: 'components-configprovider--default',
    subpath: 'config-provider',
    importSnippet: rootImport('ConfigProvider'),
  },
  {
    name: 'ContextMenu',
    importName: 'ContextMenu',
    category: 'overlays',
    description: 'Right-click command surface built on the menu contract.',
    dimensions: ['trigger', 'content', 'selection'],
    storyId: 'components-menu--context-menu-story',
    subpath: 'menu',
    importSnippet: rootImport('ContextMenu'),
  },
  {
    name: 'Dialog',
    importName: 'Dialog',
    category: 'overlays',
    description: 'Modal decision surface for focused confirmation and details.',
    dimensions: ['root', 'trigger', 'content'],
    storyId: 'components-dialog--default',
    subpath: 'dialog',
    importSnippet: rootImport('Dialog'),
  },
  {
    name: 'Field',
    importName: 'Field',
    category: 'forms',
    description: 'Label, description, and validation wiring for form controls.',
    dimensions: ['label', 'description', 'error'],
    storyId: 'components-field--default',
    subpath: 'field',
    importSnippet: rootImport('Field'),
  },
  {
    name: 'ImagePreview',
    importName: 'ImagePreview',
    category: 'overlays',
    description: 'Modal image preview with zoom controls and gallery navigation.',
    dimensions: ['open', 'currentIndex', 'zoom'],
    storyId: 'components-imagepreview--default',
    subpath: 'image-preview',
    importSnippet: rootImport('ImagePreview'),
  },
  {
    name: 'ImageMasonry',
    importName: 'ImageMasonry',
    category: 'content',
    description: 'Responsive shortest-column image layout for galleries.',
    dimensions: ['columnCount', 'minColumnWidth', 'onItemClick'],
    storyId: 'components-imagemasonry--default',
    subpath: 'image-masonry',
    importSnippet: rootImport('ImageMasonry'),
  },
  {
    name: 'GroupedVirtualMasonry',
    importName: 'GroupedVirtualMasonry',
    category: 'data',
    description: 'Grouped virtual masonry renderer for long image sections.',
    dimensions: ['groups', 'groupHeaderHeight', 'renderGroupHeader', 'scrollToGroup'],
    storyId: 'components-groupedvirtualmasonry--default',
    subpath: 'grouped-virtual-masonry',
    importSnippet: rootImport('GroupedVirtualMasonry'),
  },
  {
    name: 'Input',
    importName: 'Input',
    category: 'forms',
    description: 'Single-line text input with Deweyou field styling.',
    dimensions: ['size', 'disabled', 'invalid'],
    storyId: 'components-input--default',
    subpath: 'input',
    importSnippet: rootImport('Input'),
  },
  {
    name: 'DatePicker',
    importName: 'DatePicker',
    category: 'forms',
    description:
      'Date, month, year, or date-time field with CalendarDate or CalendarDateTime values, year-first text, optional time wheels, explicit date-time confirmation, opt-in Today and Now actions, and constraints.',
    dimensions: [
      'mode',
      'showTime',
      'showNow',
      'timeGranularity',
      'timeSteps',
      'size',
      'variant',
      'locale',
      'formatting',
      'showToday',
      'constraints',
    ],
    storyId: 'components-datepicker--default',
    subpath: 'date-picker',
    importSnippet: rootImport('DatePicker'),
  },
  {
    name: 'DateRangePicker',
    importName: 'DateRangePicker',
    category: 'forms',
    description:
      'One contiguous date, month, year, or date-time range with two real inputs in one visual field, endpoint time wheels, explicit confirmation, optional Today and Now actions, and constraints.',
    dimensions: [
      'mode',
      'showTime',
      'showNow',
      'timeGranularity',
      'timeSteps',
      'size',
      'variant',
      'locale',
      'formatting',
      'showToday',
      'constraints',
    ],
    storyId: 'components-daterangepicker--default',
    subpath: 'date-range-picker',
    importSnippet: rootImport('DateRangePicker'),
  },
  {
    name: 'NumberInput',
    importName: 'NumberInput',
    category: 'forms',
    description:
      'Numeric input with direct editing, accessible step controls, locale formatting, and range constraints.',
    dimensions: ['size', 'variant', 'range', 'formatting'],
    storyId: 'components-numberinput--default',
    subpath: 'number-input',
    importSnippet: rootImport('NumberInput'),
  },
  {
    name: 'MarkdownRender',
    importName: 'MarkdownRender',
    category: 'content',
    description: 'Safe CommonMark and GFM rendering surface for product content.',
    dimensions: ['size', 'components', 'callbacks'],
    storyId: 'components-markdownrender--default',
    subpath: 'markdown-render',
    importSnippet: rootImport('MarkdownRender'),
  },
  {
    name: 'Editor',
    importName: 'Editor',
    category: 'content',
    description:
      'Editor capability surface with adapters, feature plugins, and Markdown shortcuts.',
    dimensions: ['adapter', 'plugins', 'state'],
    storyId: 'components-editor--default',
    subpath: 'editor',
    packageName: '@deweyou-design/react',
    importSnippet: rootImport('Editor', '@deweyou-design/react'),
  },
  {
    name: 'MermaidRender',
    importName: 'MermaidRender',
    category: 'content',
    description:
      'Read-only Mermaid diagram renderer with beautiful-mermaid, mindmap, and native fallback routes.',
    dimensions: ['diagramType', 'renderer', 'zoom'],
    storyId: 'components-mermaidrender--default',
    subpath: 'mermaid-render',
    importSnippet: rootImport('MermaidRender'),
  },
  {
    name: 'Menu',
    importName: 'Menu',
    category: 'overlays',
    description: 'Command menu and selection surface for grouped actions.',
    dimensions: ['size', 'placement', 'selection'],
    storyId: 'components-menu--basic',
    subpath: 'menu',
    importSnippet: "import { Menu, MenuTrigger, MenuContent } from '@deweyou-design/react';",
  },
  {
    name: 'Nav',
    importName: 'Nav',
    category: 'navigation',
    description: 'Visible navigation landmark for page and app destinations.',
    dimensions: ['orientation', 'size', 'active'],
    storyId: 'components-nav--default',
    subpath: 'nav',
    importSnippet: rootImport('Nav'),
  },
  {
    name: 'NavOverlay',
    importName: 'NavOverlay',
    category: 'navigation',
    description: 'Responsive overlay navigation pattern for compact screens.',
    dimensions: ['trigger', 'content', 'close'],
    storyId: 'components-navoverlay--default',
    subpath: 'nav-overlay',
    importSnippet: rootImport('NavOverlay'),
  },
  {
    name: 'Pagination',
    importName: 'Pagination',
    category: 'navigation',
    description: 'Paged navigation for lists and document sets.',
    dimensions: ['page', 'count', 'size', 'link'],
    storyId: 'components-pagination--default',
    subpath: 'pagination',
    importSnippet: rootImport('Pagination'),
  },
  {
    name: 'Popover',
    importName: 'Popover',
    category: 'overlays',
    description: 'Anchored floating content for lightweight contextual details.',
    dimensions: ['placement', 'trigger', 'shape'],
    storyId: 'components-popover--review-matrix',
    subpath: 'popover',
    importSnippet: rootImport('Popover'),
  },
  {
    name: 'RadioGroup',
    importName: 'RadioGroup',
    category: 'forms',
    description: 'Single-choice option group with accessible roving interaction.',
    dimensions: ['value', 'orientation', 'disabled'],
    storyId: 'components-radiogroup--default',
    subpath: 'radio-group',
    importSnippet: rootImport('RadioGroup'),
  },
  {
    name: 'ScrollArea',
    importName: 'ScrollArea',
    category: 'data',
    description: 'Styled scroll container that keeps overflow surfaces consistent.',
    dimensions: ['viewport', 'scrollbar', 'size'],
    storyId: 'components-scrollarea--default',
    subpath: 'scroll-area',
    importSnippet: rootImport('ScrollArea'),
  },
  {
    name: 'Select',
    importName: 'Select',
    category: 'forms',
    description: 'Listbox selection field with trigger, content, and item primitives.',
    dimensions: ['value', 'placeholder', 'size', 'disabled'],
    storyId: 'components-select--default',
    subpath: 'select',
    importSnippet: rootImport('Select'),
  },
  {
    name: 'Separator',
    importName: 'Separator',
    category: 'content',
    description: 'Semantic dividing line for content and controls.',
    dimensions: ['orientation', 'decorative'],
    storyId: 'components-separator--default',
    subpath: 'separator',
    importSnippet: rootImport('Separator'),
  },
  {
    name: 'Skeleton',
    importName: 'Skeleton',
    category: 'feedback',
    description: 'Low-noise loading affordance for content that has not resolved.',
    dimensions: ['shape', 'width', 'height'],
    storyId: 'components-skeleton--default',
    subpath: 'skeleton',
    importSnippet: rootImport('Skeleton'),
  },
  {
    name: 'Spinner',
    importName: 'Spinner',
    category: 'feedback',
    description: 'Small progress indicator for command and inline loading states.',
    dimensions: ['size', 'color'],
    storyId: 'components-spinner--default',
    subpath: 'spinner',
    importSnippet: rootImport('Spinner'),
  },
  {
    name: 'Switch',
    importName: 'Switch',
    category: 'forms',
    description: 'Immediate on/off setting control.',
    dimensions: ['checked', 'disabled', 'controlled'],
    storyId: 'components-switch--default',
    subpath: 'switch',
    importSnippet: rootImport('Switch'),
  },
  {
    name: 'Tabs',
    importName: 'Tabs',
    category: 'navigation',
    description: 'Section switcher with line, color, size, and overflow support.',
    dimensions: ['variant', 'color', 'size', 'overflow'],
    storyId: 'components-tabs--basic',
    subpath: 'tabs',
    importSnippet: "import { Tabs, TabList, TabTrigger, TabContent } from '@deweyou-design/react';",
  },
  {
    name: 'Text',
    importName: 'Text',
    category: 'content',
    description: 'Typography primitive for Deweyou heading, body, and caption rhythm.',
    dimensions: ['variant', 'as', 'className'],
    storyId: 'components-typography--text-contract',
    subpath: 'text',
    importSnippet: rootImport('Text'),
  },
  {
    name: 'Textarea',
    importName: 'Textarea',
    category: 'forms',
    description: 'Multi-line text input with the same field rhythm as Input.',
    dimensions: ['size', 'disabled', 'invalid'],
    storyId: 'components-textarea--default',
    subpath: 'textarea',
    importSnippet: rootImport('Textarea'),
  },
  {
    name: 'toast',
    importName: 'toast',
    category: 'feedback',
    description: 'Imperative feedback API for transient messages.',
    dimensions: ['variant', 'position', 'description'],
    storyId: 'components-toast--default',
    subpath: 'toast',
    importSnippet: rootImport('toast'),
  },
  {
    name: 'Toaster',
    importName: 'Toaster',
    category: 'feedback',
    description: 'Toast viewport renderer used once near the application root.',
    dimensions: ['position', 'limit', 'duration'],
    storyId: 'components-toast--default',
    subpath: 'toast',
    importSnippet: rootImport('Toaster'),
  },
  {
    name: 'Tooltip',
    importName: 'Tooltip',
    category: 'overlays',
    description: 'Small hover/focus label for controls that need extra naming.',
    dimensions: ['placement', 'size', 'delay'],
    storyId: 'components-tooltip--default',
    subpath: 'tooltip',
    importSnippet: rootImport('Tooltip'),
  },
  {
    name: 'VirtualList',
    importName: 'VirtualList',
    category: 'data',
    description: 'Windowed list renderer for dynamic-height document collections.',
    dimensions: ['count', 'estimateSize', 'scrollElement', 'onRangeChange'],
    storyId: 'components-virtuallist--default',
    subpath: 'virtual-list',
    importSnippet: rootImport('VirtualList'),
  },
  {
    name: 'VirtualMasonry',
    importName: 'VirtualMasonry',
    category: 'data',
    description: 'Windowed masonry renderer for long irregular image collections.',
    dimensions: ['height', 'overscan', 'scrollToIndex'],
    storyId: 'components-virtualmasonry--default',
    subpath: 'virtual-masonry',
    importSnippet: rootImport('VirtualMasonry'),
  },
];

export const findComponent = (name: string) => {
  const normalizedName = name.toLowerCase();

  return componentCatalog.find((component) => component.name.toLowerCase() === normalizedName);
};

export const getComponentStorybookUrl = (storyId: string) => {
  const componentStoryRoot = storyId.split('--')[0];

  return `${storybookUrl}/?path=/docs/${componentStoryRoot}--overview`;
};

export const getComponentImportSnippet = (name: string, options: { subpath?: boolean } = {}) => {
  const component = findComponent(name);

  if (!component) {
    return undefined;
  }

  if (options.subpath) {
    return `import { ${component.importName} } from '${
      component.packageName ?? '@deweyou-design/react'
    }/${component.subpath}';`;
  }

  return component.importSnippet;
};
