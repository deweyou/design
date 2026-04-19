import type { Meta, StoryObj } from '@storybook/react';

import {
  AlertCircleIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  InfoIcon,
  Menu2Icon,
  SearchIcon,
  XIcon,
} from '@deweyou-design/react-icons';

const galleryItems = [
  { name: 'alert-circle', Component: AlertCircleIcon },
  { name: 'check', Component: CheckIcon },
  { name: 'chevron-left', Component: ChevronLeftIcon },
  { name: 'chevron-right', Component: ChevronRightIcon },
  { name: 'x', Component: XIcon },
  { name: 'info', Component: InfoIcon },
  { name: 'menu-2', Component: Menu2Icon },
  { name: 'search', Component: SearchIcon },
] as const;

const storyStyles = {
  grid: {
    display: 'grid',
    gap: '12px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    width: 'min(840px, 100%)',
  },
  card: {
    alignItems: 'center',
    background: 'color-mix(in srgb, var(--ui-color-surface) 92%, white)',
    border: '1px solid var(--ui-color-border)',
    borderRadius: '16px',
    color: 'var(--ui-color-text)',
    display: 'grid',
    gap: '10px',
    justifyItems: 'center',
    padding: '16px',
  },
  meta: {
    color: 'var(--ui-color-text-muted)',
    fontFamily: 'var(--ui-font-mono)',
    fontSize: '0.8rem',
  },
} as const;

const meta = {
  title: 'Components/Icon',
  component: SearchIcon,
  tags: ['autodocs'],
  args: {
    size: 24,
  },
  argTypes: {
    size: {
      description: 'Icon size. Accepts a number (px) or any CSS length string.',
      control: { type: 'number' },
      table: {
        type: { summary: 'number | string' },
        defaultValue: { summary: "'1em'" },
      },
    },
    stroke: {
      description: 'Stroke width. Defaults to 1.5.',
      control: { type: 'number', min: 0.5, max: 3, step: 0.25 },
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '1.5' },
      },
    },
    'aria-label': {
      description:
        'Accessible label. When provided the icon renders with `role="img"` and `aria-label`. When omitted the icon is decorative (`aria-hidden="true"`).',
      control: { type: 'text' },
      table: {
        type: { summary: 'string | undefined' },
        defaultValue: { summary: '—' },
      },
    },
    className: {
      description: 'Additional CSS class applied to the SVG root.',
      control: { type: 'text' },
      table: {
        type: { summary: 'string | undefined' },
        defaultValue: { summary: '—' },
      },
    },
    style: {
      control: false,
      table: {
        type: { summary: 'CSSProperties | undefined' },
        defaultValue: { summary: '—' },
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Named icon components wrapping Tabler Icons with square stroke caps and miter joins to match the rect-first design language. Import named exports directly from `@deweyou-design/react-icons`. All icons use `currentColor` and are rendered synchronously — no loading state or registry lookup.',
      },
    },
  },
} satisfies Meta<typeof SearchIcon>;

export default meta;

type Story = StoryObj<typeof meta>;

const CatalogGallery = () => {
  return (
    <div style={storyStyles.grid}>
      {galleryItems.map(({ Component, name }) => (
        <article key={name} style={storyStyles.card}>
          <Component size={24} />
          <strong>{name}</strong>
          <code style={storyStyles.meta}>{name}</code>
        </article>
      ))}
    </div>
  );
};

const SizingGallery = () => {
  const sizes = [12, 16, 20, 24, 32] as const;
  return (
    <div style={{ ...storyStyles.grid, gridTemplateColumns: 'repeat(5, minmax(110px, 1fr))' }}>
      {sizes.map((size) => (
        <article key={size} style={storyStyles.card}>
          <SearchIcon size={size} />
          <strong>{size}px</strong>
        </article>
      ))}
    </div>
  );
};

const AccessibilityGallery = () => {
  return (
    <div style={storyStyles.grid}>
      <article style={storyStyles.card}>
        <Menu2Icon size={24} />
        <strong>Unlabeled</strong>
        <span style={storyStyles.meta}>aria-hidden=true</span>
      </article>
      <article style={storyStyles.card}>
        <InfoIcon aria-label="Information" size={24} />
        <strong>Labeled</strong>
        <span style={storyStyles.meta}>aria-label=Information</span>
      </article>
    </div>
  );
};

export const Catalog: Story = {
  render: () => <CatalogGallery />,
};

export const Sizes: Story = {
  render: () => <SizingGallery />,
};

export const Accessibility: Story = {
  render: () => <AccessibilityGallery />,
};

// ---------------------------------------------------------------------------
// Story: Interaction — smoke test (purely presentational, no interactive behavior)
// ---------------------------------------------------------------------------

import { expect } from 'storybook/test';

export const Interaction: Story = {
  name: 'Interaction',
  render: () => <CatalogGallery />,
  play: async ({ canvasElement }) => {
    const svgs = canvasElement.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
  },
};
