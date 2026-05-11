import type { Meta, StoryObj } from '@storybook/react';
import type { ComponentType } from 'react';
import type { IconColor, IconProps, IconSize } from '@deweyou-design/react-icons';

import { AlertCircleIcon, InfoIcon, Menu2Icon, SearchIcon } from '@deweyou-design/react-icons';
import * as Icons from '@deweyou-design/react-icons';
import { iconRegistry } from '../../../../packages/react-icons/src/icon-registry';

type PublicIconExportName = Extract<keyof typeof Icons, `${string}Icon`>;

const isPublicIconExportName = (exportName: string): exportName is PublicIconExportName => {
  return exportName in Icons;
};

const getPublicIconComponent = (exportName: `${string}Icon`): ComponentType<IconProps> => {
  if (!isPublicIconExportName(exportName)) {
    throw new Error(`Icon registry export is missing from the public surface: ${exportName}`);
  }

  return Icons[exportName] as ComponentType<IconProps>;
};

const toCatalogName = (exportName: `${string}Icon`) => {
  return exportName
    .replace(/Icon$/, '')
    .replace(/([a-z])([0-9])/g, '$1-$2')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();
};

const galleryItems = iconRegistry.map(({ category, exportName }) => ({
  category,
  Component: getPublicIconComponent(exportName),
  exportName,
  name: toCatalogName(exportName),
}));

const sizeExamples = [
  { label: 'xs', description: 'compact controls' },
  { label: 'sm', description: 'small controls' },
  { label: 'md', description: 'default controls' },
  { label: 'lg', description: 'large controls' },
  { label: 'xl', description: 'empty states' },
] as const satisfies readonly { label: IconSize; description: string }[];

const colorExamples = [
  { label: 'inherit', description: 'follow surrounding text' },
  { label: 'neutral', description: 'default interface icon' },
  { label: 'primary', description: 'brand emphasis' },
  { label: 'danger', description: 'destructive or error state' },
] as const satisfies readonly { label: IconColor; description: string }[];

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
    borderRadius: '8px',
    color: 'var(--ui-color-text)',
    display: 'grid',
    gap: '10px',
    justifyItems: 'center',
    minWidth: 0,
    padding: '16px',
  },
  description: {
    color: 'var(--ui-color-text-muted)',
    fontSize: '0.82rem',
    lineHeight: 1.4,
    textAlign: 'center',
  },
  meta: {
    color: 'var(--ui-color-text-muted)',
    fontFamily: 'var(--ui-font-mono)',
    fontSize: '0.8rem',
  },
  shell: {
    display: 'grid',
    gap: '18px',
    width: 'min(840px, 100%)',
  },
} as const;

const meta = {
  title: 'Components/Icon',
  component: SearchIcon,
  tags: ['autodocs'],
  args: {
    size: 'md',
    color: 'inherit',
  },
  argTypes: {
    size: {
      description:
        'Icon size. Prefer named design-system sizes, with number and CSS length fallbacks for special cases.',
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      table: {
        type: { summary: "'xs' | 'sm' | 'md' | 'lg' | 'xl' | number | string" },
        defaultValue: { summary: "'md'" },
      },
    },
    color: {
      description:
        'Semantic icon color. `inherit` keeps the icon aligned with the surrounding text color.',
      control: { type: 'select' },
      options: ['inherit', 'neutral', 'primary', 'danger'],
      table: {
        type: { summary: "'inherit' | 'neutral' | 'primary' | 'danger'" },
        defaultValue: { summary: "'inherit'" },
      },
    },
    'aria-label': {
      description:
        'Accessible label. When provided, the icon renders with `role="img"` and `aria-label`. When omitted, the icon is decorative.',
      control: { type: 'text' },
      table: {
        type: { summary: 'string | undefined' },
        defaultValue: { summary: '-' },
      },
    },
    className: {
      description: 'Additional CSS class applied to the SVG root.',
      control: { type: 'text' },
      table: {
        type: { summary: 'string | undefined' },
        defaultValue: { summary: '-' },
      },
    },
    style: {
      control: false,
      table: {
        type: { summary: 'CSSProperties | undefined' },
        defaultValue: { summary: '-' },
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Named icon components are generated from a Deweyou-curated registry backed by `tdesign-icons-svg` and local SVG assets. Import icons directly from `@deweyou-design/react-icons`; the registry defines the supported catalog while shared props keep size, color, and accessibility behavior consistent.',
      },
    },
  },
} satisfies Meta<typeof SearchIcon>;

export default meta;

type Story = StoryObj<typeof meta>;

const CatalogGallery = () => {
  return (
    <div style={storyStyles.shell}>
      <p style={{ ...storyStyles.description, textAlign: 'left' }}>
        Curated catalog backed by tdesign-icons-svg and Deweyou local assets.
      </p>
      <div style={storyStyles.grid}>
        {galleryItems.map(({ Component, category, exportName, name }) => (
          <article data-testid="catalog-icon-card" key={exportName} style={storyStyles.card}>
            <Component size="lg" />
            <strong>{name}</strong>
            <code style={storyStyles.meta}>{category}</code>
          </article>
        ))}
      </div>
    </div>
  );
};

const SizingGallery = () => {
  return (
    <div
      style={{ ...storyStyles.grid, gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))' }}
    >
      {sizeExamples.map(({ description, label }) => (
        <article key={label} style={storyStyles.card}>
          <SearchIcon data-testid={`size-${label}`} size={label} />
          <strong>{label}</strong>
          <span style={storyStyles.description}>{description}</span>
        </article>
      ))}
    </div>
  );
};

const ColorGallery = () => {
  return (
    <div style={storyStyles.grid}>
      {colorExamples.map(({ description, label }) => (
        <article key={label} style={storyStyles.card}>
          <AlertCircleIcon color={label} data-testid={`color-${label}`} size="lg" />
          <strong>{label}</strong>
          <span style={storyStyles.description}>{description}</span>
        </article>
      ))}
    </div>
  );
};

const AccessibilityGallery = () => {
  return (
    <div style={storyStyles.grid}>
      <article style={storyStyles.card}>
        <Menu2Icon data-testid="decorative-icon" size="lg" />
        <strong>Decorative</strong>
        <span style={storyStyles.meta}>aria-hidden=true</span>
      </article>
      <article style={storyStyles.card}>
        <InfoIcon aria-label="Information" data-testid="labeled-icon" size="lg" />
        <strong>Labeled</strong>
        <span style={storyStyles.meta}>role=img</span>
      </article>
    </div>
  );
};

const ReviewSurface = () => {
  return (
    <div style={storyStyles.shell}>
      <CatalogGallery />
      <SizingGallery />
      <ColorGallery />
      <AccessibilityGallery />
    </div>
  );
};

export const Catalog: Story = {
  render: () => <CatalogGallery />,
};

export const Sizes: Story = {
  render: () => <SizingGallery />,
};

export const Colors: Story = {
  render: () => <ColorGallery />,
};

export const Accessibility: Story = {
  render: () => <AccessibilityGallery />,
};

// ---------------------------------------------------------------------------
// Story: Interaction — play function tests
// ---------------------------------------------------------------------------

import { expect, within } from 'storybook/test';

export const Interaction: Story = {
  name: 'Interaction',
  render: () => <ReviewSurface />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText('Curated catalog backed by tdesign-icons-svg and Deweyou local assets.'),
    ).toBeInTheDocument();
    await expect(canvas.getAllByTestId('catalog-icon-card')).toHaveLength(iconRegistry.length);
    await expect(canvas.getByText('search', { selector: 'strong' })).toBeInTheDocument();
    await expect(canvas.getByText('xl')).toBeInTheDocument();
    await expect(canvas.getByText('primary')).toBeInTheDocument();
    await expect(canvas.getByRole('img', { name: 'Information' })).toBeInTheDocument();
  },
};
