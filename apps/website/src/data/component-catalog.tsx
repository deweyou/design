import type { ReactNode } from 'react';

import {
  Badge,
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  CodeBlock,
  Dialog,
  Editor,
  Field,
  GroupedVirtualMasonry,
  headingPlugin,
  historyPlugin,
  IconButton,
  ImageMasonry,
  ImagePreview,
  Input,
  keyboardShortcutPlugin,
  listPlugin,
  markdownEditorAdapter,
  MarkdownRender,
  markdownShortcutPlugin,
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
  Nav,
  NumberInput,
  Pagination,
  Popover,
  RadioGroup,
  ScrollArea,
  Select,
  Separator,
  Skeleton,
  Spinner,
  Switch,
  TabContent,
  TabList,
  Tabs,
  TabTrigger,
  Text,
  Textarea,
  textFormatPlugin,
  Tooltip,
  toolbarPlugin,
  VirtualList,
  VirtualMasonry,
  toast,
} from '@deweyou-design/react';
import { SettingsIcon } from '@deweyou-design/react-icons';

import styles from '../pages/components.module.less';

const STORYBOOK_URL = 'https://design-storybook-deweyous-projects.vercel.app';

export const COMPONENT_CATEGORIES = [
  { id: 'actions', label: 'Actions' },
  { id: 'forms', label: 'Forms' },
  { id: 'overlays', label: 'Overlays' },
  { id: 'navigation', label: 'Navigation' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'content', label: 'Content' },
  { id: 'data', label: 'Data' },
] as const;

export type ComponentCategoryId = (typeof COMPONENT_CATEGORIES)[number]['id'];

export type ComponentCatalogItem = {
  category: ComponentCategoryId;
  description: string;
  dimensions: string[];
  importSnippet: string;
  name: string;
  preview: ReactNode;
  storyId: string;
};

export const getStorybookUrl = (storyId: string) => {
  const componentStoryRoot = storyId.split('--')[0];

  return `${STORYBOOK_URL}/?path=/docs/${componentStoryRoot}--overview`;
};

const buttonPreview = (
  <>
    <Button color="primary" size="sm" variant="filled">
      Primary
    </Button>
    <Button color="neutral" size="sm" variant="outlined">
      Outline
    </Button>
  </>
);

const catalogImages = [
  {
    alt: 'Teal block',
    height: 160,
    src: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 160%22%3E%3Crect width=%22200%22 height=%22160%22 fill=%22%230f766e%22/%3E%3C/svg%3E',
    width: 200,
  },
  {
    alt: 'Rose block',
    height: 220,
    src: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 220%22%3E%3Crect width=%22200%22 height=%22220%22 fill=%22%23be123c%22/%3E%3C/svg%3E',
    width: 200,
  },
  {
    alt: 'Indigo block',
    height: 130,
    src: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 130%22%3E%3Crect width=%22200%22 height=%22130%22 fill=%22%234338ca%22/%3E%3C/svg%3E',
    width: 200,
  },
];

const catalogImageGroups = [
  {
    id: 'recent',
    images: catalogImages,
    title: 'Recent',
  },
  {
    id: 'saved',
    images: catalogImages.map((image, index) => ({
      ...image,
      alt: `Saved ${image.alt}`,
      id: `saved-${index}`,
    })),
    title: 'Saved',
  },
];

export const COMPONENT_CATALOG: ComponentCatalogItem[] = [
  {
    name: 'Badge',
    category: 'feedback',
    description: 'Compact status and metadata label for low-density surfaces.',
    importSnippet: "import { Badge } from '@deweyou-design/react';",
    dimensions: ['variant', 'color', 'shape'],
    storyId: 'components-badge--default',
    preview: <Badge color="primary">Stable</Badge>,
  },
  {
    name: 'Breadcrumb',
    category: 'navigation',
    description: 'Hierarchy trail for document and application navigation.',
    importSnippet: "import { Breadcrumb } from '@deweyou-design/react';",
    dimensions: ['root', 'item', 'current'],
    storyId: 'components-breadcrumb--default',
    preview: (
      <Breadcrumb.Root>
        <Breadcrumb.List>
          <Breadcrumb.Item>
            <Breadcrumb.Link href="#">Docs</Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Separator />
          <Breadcrumb.Item>
            <Breadcrumb.Current>Components</Breadcrumb.Current>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb.Root>
    ),
  },
  {
    name: 'Button',
    category: 'actions',
    description: 'Primary command surface with semantic variants and stable sizing.',
    importSnippet: "import { Button } from '@deweyou-design/react';",
    dimensions: ['variant', 'color', 'size', 'shape'],
    storyId: 'components-button--variants',
    preview: buttonPreview,
  },
  {
    name: 'IconButton',
    category: 'actions',
    description: 'Icon-only command that keeps accessible names explicit.',
    importSnippet: "import { IconButton } from '@deweyou-design/react';",
    dimensions: ['variant', 'color', 'size', 'shape'],
    storyId: 'components-button--variants',
    preview: (
      <IconButton aria-label="Settings" icon={<SettingsIcon />} size="sm" variant="outlined" />
    ),
  },
  {
    name: 'Card',
    category: 'content',
    description: 'Border-led content container for small grouped surfaces.',
    importSnippet: "import { Card } from '@deweyou-design/react';",
    dimensions: ['padding', 'shape'],
    storyId: 'components-card--default',
    preview: <Card padding="sm">Card surface</Card>,
  },
  {
    name: 'Checkbox',
    category: 'forms',
    description: 'Binary choice control with checked, unchecked, and disabled states.',
    importSnippet: "import { Checkbox } from '@deweyou-design/react';",
    dimensions: ['checked', 'disabled', 'invalid'],
    storyId: 'components-checkbox--default',
    preview: <Checkbox defaultChecked>Accept</Checkbox>,
  },
  {
    name: 'CodeBlock',
    category: 'content',
    description:
      'Scrollable code block with reusable chrome primitives for code actions and language UI.',
    importSnippet: "import { CodeBlock } from '@deweyou-design/react';",
    dimensions: ['language', 'size', 'overflow', 'chrome'],
    storyId: 'components-codeblock--default',
    preview: (
      <CodeBlock language="tsx" size="sm">
        {'const active = true;'}
      </CodeBlock>
    ),
  },
  {
    name: 'Dialog',
    category: 'overlays',
    description: 'Modal decision surface for focused confirmation and details.',
    importSnippet: "import { Dialog } from '@deweyou-design/react';",
    dimensions: ['root', 'trigger', 'content'],
    storyId: 'components-dialog--default',
    preview: (
      <Dialog.Root>
        <Dialog.Trigger>
          <Button size="sm" variant="outlined">
            Open dialog
          </Button>
        </Dialog.Trigger>
        <Dialog.Content className={styles.previewDialog}>
          <Dialog.Title>Catalog dialog</Dialog.Title>
          <Dialog.Description>
            Review a focused message without leaving the component catalog.
          </Dialog.Description>
          <div className={styles.previewDialogBody}>
            <span>Status</span>
            <strong>Ready for review</strong>
          </div>
          <div className={styles.previewDialogActions}>
            <Dialog.CloseTrigger>
              <Button size="sm" variant="outlined">
                Close
              </Button>
            </Dialog.CloseTrigger>
            <Dialog.CloseTrigger>
              <Button color="primary" size="sm" variant="filled">
                Confirm
              </Button>
            </Dialog.CloseTrigger>
          </div>
        </Dialog.Content>
      </Dialog.Root>
    ),
  },
  {
    name: 'Field',
    category: 'forms',
    description: 'Label, description, and validation wiring for form controls.',
    importSnippet: "import { Field } from '@deweyou-design/react';",
    dimensions: ['label', 'description', 'error'],
    storyId: 'components-field--default',
    preview: (
      <Field.Root id="catalog-field" hasDescription>
        <Field.Label>Name</Field.Label>
        <Field.Control>
          <Input placeholder="Deweyou" size="sm" />
        </Field.Control>
        <Field.Description>Short field hint</Field.Description>
      </Field.Root>
    ),
  },
  {
    name: 'ImagePreview',
    category: 'overlays',
    description: 'Modal image preview with zoom controls and gallery navigation.',
    importSnippet: "import { ImagePreview } from '@deweyou-design/react';",
    dimensions: ['open', 'currentIndex', 'zoom'],
    storyId: 'components-imagepreview--default',
    preview: (
      <ImagePreview
        images={catalogImages}
        trigger={
          <Button size="sm" variant="outlined">
            Preview image
          </Button>
        }
      />
    ),
  },
  {
    name: 'ImageMasonry',
    category: 'content',
    description: 'Responsive shortest-column image layout for galleries.',
    importSnippet: "import { ImageMasonry } from '@deweyou-design/react';",
    dimensions: ['columnCount', 'minColumnWidth', 'onItemClick'],
    storyId: 'components-imagemasonry--default',
    preview: (
      <ImageMasonry columnCount={3} defaultContainerWidth={180} gap={6} images={catalogImages} />
    ),
  },
  {
    name: 'GroupedVirtualMasonry',
    category: 'data',
    description: 'Grouped virtual masonry renderer for long image sections.',
    importSnippet: "import { GroupedVirtualMasonry } from '@deweyou-design/react';",
    dimensions: ['groups', 'groupHeaderHeight', 'renderGroupHeader', 'scrollToGroup'],
    storyId: 'components-groupedvirtualmasonry--default',
    preview: (
      <GroupedVirtualMasonry
        columnCount={3}
        defaultContainerWidth={180}
        gap={6}
        groupHeaderHeight={18}
        groups={catalogImageGroups}
        height={72}
      />
    ),
  },
  {
    name: 'Input',
    category: 'forms',
    description: 'Single-line text input with Deweyou field styling.',
    importSnippet: "import { Input } from '@deweyou-design/react';",
    dimensions: ['size', 'disabled', 'invalid'],
    storyId: 'components-input--default',
    preview: <Input hint="Filters the component catalog." label="Search" placeholder="Search…" />,
  },
  {
    name: 'NumberInput',
    category: 'forms',
    description:
      'Numeric input with direct editing, step controls, formatting, and range feedback.',
    importSnippet: "import { NumberInput } from '@deweyou-design/react';",
    dimensions: ['size', 'variant', 'range', 'formatting'],
    storyId: 'components-numberinput--default',
    preview: <NumberInput defaultValue="4" label="Quantity" max={10} min={0} />,
  },
  {
    name: 'MarkdownRender',
    category: 'content',
    description: 'Safe CommonMark and GFM rendering surface for product content.',
    importSnippet: "import { MarkdownRender } from '@deweyou-design/react';",
    dimensions: ['size', 'components', 'callbacks'],
    storyId: 'components-markdownrender--default',
    preview: <MarkdownRender size="sm" value={'### Markdown\nCompact rendering.'} />,
  },
  {
    name: 'Editor',
    category: 'content',
    description:
      'Editor capability surface with adapters, feature plugins, and Markdown shortcuts.',
    importSnippet: "import { Editor } from '@deweyou-design/react';",
    dimensions: ['adapter', 'plugins', 'state'],
    storyId: 'components-editor--default',
    preview: (
      <Editor
        adapter={markdownEditorAdapter()}
        defaultValue="Editor preview"
        plugins={[
          historyPlugin(),
          textFormatPlugin(),
          headingPlugin(),
          listPlugin(),
          toolbarPlugin(),
          markdownShortcutPlugin(),
          keyboardShortcutPlugin(),
        ]}
        readOnly
      />
    ),
  },
  {
    name: 'Menu',
    category: 'overlays',
    description: 'Command menu and selection surface for grouped actions.',
    importSnippet: "import { Menu, MenuTrigger, MenuContent } from '@deweyou-design/react';",
    dimensions: ['size', 'placement', 'selection'],
    storyId: 'components-menu--basic',
    preview: (
      <Menu>
        <MenuTrigger>
          <Button size="sm" variant="outlined">
            Menu
          </Button>
        </MenuTrigger>
        <MenuContent>
          <MenuItem value="copy">Copy</MenuItem>
        </MenuContent>
      </Menu>
    ),
  },
  {
    name: 'ContextMenu',
    category: 'overlays',
    description: 'Right-click command surface built on the menu contract.',
    importSnippet: "import { ContextMenu } from '@deweyou-design/react';",
    dimensions: ['trigger', 'content', 'selection'],
    storyId: 'components-menu--context-menu-story',
    preview: (
      <Button size="sm" variant="outlined">
        Context menu
      </Button>
    ),
  },
  {
    name: 'Nav',
    category: 'navigation',
    description: 'Visible navigation landmark for page and app destinations.',
    importSnippet: "import { Nav } from '@deweyou-design/react';",
    dimensions: ['orientation', 'size', 'active'],
    storyId: 'components-nav--default',
    preview: (
      <Nav.Root>
        <Nav.Link href="#" active>
          Overview
        </Nav.Link>
      </Nav.Root>
    ),
  },
  {
    name: 'NavOverlay',
    category: 'navigation',
    description: 'Responsive overlay navigation pattern for compact screens.',
    importSnippet: "import { NavOverlay } from '@deweyou-design/react';",
    dimensions: ['trigger', 'content', 'close'],
    storyId: 'components-navoverlay--default',
    preview: (
      <Button size="sm" variant="outlined">
        Open nav
      </Button>
    ),
  },
  {
    name: 'Pagination',
    category: 'navigation',
    description: 'Paged navigation for lists and document sets.',
    importSnippet: "import { Pagination } from '@deweyou-design/react';",
    dimensions: ['page', 'count', 'link'],
    storyId: 'components-pagination--default',
    preview: <Pagination count={50} page={2} />,
  },
  {
    name: 'Popover',
    category: 'overlays',
    description: 'Anchored floating content for lightweight contextual details.',
    importSnippet: "import { Popover } from '@deweyou-design/react';",
    dimensions: ['placement', 'trigger', 'shape'],
    storyId: 'components-popover--review-matrix',
    preview: (
      <Popover content="Popover content">
        <Button size="sm" variant="outlined">
          Popover
        </Button>
      </Popover>
    ),
  },
  {
    name: 'RadioGroup',
    category: 'forms',
    description: 'Single-choice option group with accessible roving interaction.',
    importSnippet: "import { RadioGroup } from '@deweyou-design/react';",
    dimensions: ['value', 'orientation', 'disabled'],
    storyId: 'components-radiogroup--default',
    preview: (
      <RadioGroup.Root aria-label="Catalog choice" defaultValue="a" name="catalog-choice">
        <RadioGroup.Item value="a">A</RadioGroup.Item>
      </RadioGroup.Root>
    ),
  },
  {
    name: 'ScrollArea',
    category: 'data',
    description: 'Styled scroll container that keeps overflow surfaces consistent.',
    importSnippet: "import { ScrollArea } from '@deweyou-design/react';",
    dimensions: ['viewport', 'scrollbar', 'size'],
    storyId: 'components-scrollarea--default',
    preview: (
      <ScrollArea.Root style={{ height: 56 }}>
        <ScrollArea.Viewport>Scrollable content</ScrollArea.Viewport>
      </ScrollArea.Root>
    ),
  },
  {
    name: 'Select',
    category: 'forms',
    description: 'Listbox selection field with trigger, content, and item primitives.',
    importSnippet: "import { Select } from '@deweyou-design/react';",
    dimensions: ['value', 'placeholder', 'disabled'],
    storyId: 'components-select--default',
    preview: (
      <Select.Root label="Choice" name="catalog-select" placeholder="Choose">
        <Select.Trigger />
        <Select.Content>
          <Select.Item value="a" label="Option A" />
        </Select.Content>
      </Select.Root>
    ),
  },
  {
    name: 'Separator',
    category: 'content',
    description: 'Semantic dividing line for content and controls.',
    importSnippet: "import { Separator } from '@deweyou-design/react';",
    dimensions: ['orientation', 'decorative'],
    storyId: 'components-separator--default',
    preview: <Separator />,
  },
  {
    name: 'Skeleton',
    category: 'feedback',
    description: 'Low-noise loading affordance for content that has not resolved.',
    importSnippet: "import { Skeleton } from '@deweyou-design/react';",
    dimensions: ['shape', 'width', 'height'],
    storyId: 'components-skeleton--default',
    preview: <Skeleton style={{ height: 24, width: 120 }} />,
  },
  {
    name: 'Spinner',
    category: 'feedback',
    description: 'Small progress indicator for command and inline loading states.',
    importSnippet: "import { Spinner } from '@deweyou-design/react';",
    dimensions: ['size', 'color'],
    storyId: 'components-spinner--default',
    preview: <Spinner size="sm" />,
  },
  {
    name: 'Switch',
    category: 'forms',
    description: 'Immediate on/off setting control.',
    importSnippet: "import { Switch } from '@deweyou-design/react';",
    dimensions: ['checked', 'disabled', 'controlled'],
    storyId: 'components-switch--default',
    preview: <Switch defaultChecked>On</Switch>,
  },
  {
    name: 'Tabs',
    category: 'navigation',
    description: 'Section switcher with line, color, size, and overflow support.',
    importSnippet: "import { Tabs, TabList, TabTrigger, TabContent } from '@deweyou-design/react';",
    dimensions: ['variant', 'color', 'size', 'overflow'],
    storyId: 'components-tabs--basic',
    preview: (
      <Tabs defaultValue="a" size="sm">
        <TabList>
          <TabTrigger value="a">One</TabTrigger>
        </TabList>
        <TabContent value="a">Panel</TabContent>
      </Tabs>
    ),
  },
  {
    name: 'Text',
    category: 'content',
    description: 'Typography primitive for Deweyou heading, body, and caption rhythm.',
    importSnippet: "import { Text } from '@deweyou-design/react';",
    dimensions: ['variant', 'as', 'className'],
    storyId: 'components-typography--text-contract',
    preview: <Text variant="h5">Serif text</Text>,
  },
  {
    name: 'Textarea',
    category: 'forms',
    description: 'Multi-line text input with the same field rhythm as Input.',
    importSnippet: "import { Textarea } from '@deweyou-design/react';",
    dimensions: ['size', 'disabled', 'invalid'],
    storyId: 'components-textarea--default',
    preview: <Textarea hint="Supports multiline input." label="Message" placeholder="Write…" />,
  },
  {
    name: 'toast',
    category: 'feedback',
    description: 'Imperative feedback API for transient messages.',
    importSnippet: "import { toast } from '@deweyou-design/react';",
    dimensions: ['variant', 'position', 'description'],
    storyId: 'components-toast--default',
    preview: (
      <Button size="sm" variant="outlined" onClick={() => toast.create({ title: 'Saved' })}>
        Toast
      </Button>
    ),
  },
  {
    name: 'Toaster',
    category: 'feedback',
    description: 'Toast viewport renderer used once near the application root.',
    importSnippet: "import { Toaster } from '@deweyou-design/react';",
    dimensions: ['position', 'limit', 'duration'],
    storyId: 'components-toast--default',
    preview: <Badge>Viewport</Badge>,
  },
  {
    name: 'Tooltip',
    category: 'overlays',
    description: 'Small hover/focus label for controls that need extra naming.',
    importSnippet: "import { Tooltip } from '@deweyou-design/react';",
    dimensions: ['placement', 'size', 'delay'],
    storyId: 'components-tooltip--default',
    preview: (
      <Tooltip.Root>
        <Tooltip.Trigger>
          <Button size="sm" variant="outlined">
            Hover
          </Button>
        </Tooltip.Trigger>
        <Tooltip.Content>Tooltip</Tooltip.Content>
      </Tooltip.Root>
    ),
  },
  {
    name: 'VirtualList',
    category: 'data',
    description: 'Windowed list renderer for dynamic-height document collections.',
    importSnippet: "import { VirtualList } from '@deweyou-design/react';",
    dimensions: ['count', 'estimateSize', 'scrollElement', 'onRangeChange'],
    storyId: 'components-virtuallist--default',
    preview: (
      <VirtualList
        count={3}
        height={64}
        estimateSize={() => 28}
        renderItem={({ index }) => <div>Row {index + 1}</div>}
      />
    ),
  },
  {
    name: 'VirtualMasonry',
    category: 'data',
    description: 'Windowed masonry renderer for long irregular image collections.',
    importSnippet: "import { VirtualMasonry } from '@deweyou-design/react';",
    dimensions: ['height', 'overscan', 'scrollToIndex'],
    storyId: 'components-virtualmasonry--default',
    preview: (
      <VirtualMasonry
        columnCount={3}
        defaultContainerWidth={180}
        gap={6}
        height={64}
        images={catalogImages}
      />
    ),
  },
];
