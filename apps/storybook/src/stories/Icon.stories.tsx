import type { Meta, StoryObj } from '@storybook/react';

import { AddIcon } from '@deweyou-ui/icons/add';
import { CheckIcon } from '@deweyou-ui/icons/check';
import { ChevronLeftIcon } from '@deweyou-ui/icons/chevron-left';
import { ChevronRightIcon } from '@deweyou-ui/icons/chevron-right';
import { CloseIcon } from '@deweyou-ui/icons/close';
import { ErrorCircleIcon } from '@deweyou-ui/icons/error-circle';
import { InfoCircleIcon } from '@deweyou-ui/icons/info-circle';
import { MenuIcon } from '@deweyou-ui/icons/menu';
import { SearchIcon } from '@deweyou-ui/icons/search';

const galleryItems = [
  { name: 'add', Component: AddIcon },
  { name: 'check', Component: CheckIcon },
  { name: 'chevron-left', Component: ChevronLeftIcon },
  { name: 'chevron-right', Component: ChevronRightIcon },
  { name: 'close', Component: CloseIcon },
  { name: 'error-circle', Component: ErrorCircleIcon },
  { name: 'info-circle', Component: InfoCircleIcon },
  { name: 'menu', Component: MenuIcon },
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
  title: 'Internal review/Icon',
  parameters: {
    docs: {
      description: {
        component:
          'Internal review story for the generated Deweyou UI icon subpath exports, sizing contract, accessibility semantics, and unsupported-name guidance.',
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const CatalogGallery = () => {
  return (
    <div style={storyStyles.grid}>
      {galleryItems.map(({ Component, name }) => (
        <article key={name} style={storyStyles.card}>
          <Component size="large" />
          <strong>{name}</strong>
          <code style={storyStyles.meta}>{`${Component.displayName ?? 'Icon'}`}</code>
        </article>
      ))}
    </div>
  );
};

const SizingGallery = () => {
  return (
    <div style={{ ...storyStyles.grid, gridTemplateColumns: 'repeat(5, minmax(110px, 1fr))' }}>
      {(['extra-small', 'small', 'medium', 'large', 'extra-large'] as const).map((size) => (
        <article key={size} style={storyStyles.card}>
          <SearchIcon size={size} />
          <strong>{size}</strong>
        </article>
      ))}
      <article style={storyStyles.card}>
        <SearchIcon size={18} />
        <strong>18</strong>
      </article>
    </div>
  );
};

const AccessibilityGallery = () => {
  return (
    <div style={storyStyles.grid}>
      <article style={storyStyles.card}>
        <MenuIcon />
        <strong>Unlabeled</strong>
        <span style={storyStyles.meta}>aria-hidden=true</span>
      </article>
      <article style={storyStyles.card}>
        <InfoCircleIcon label="Information" />
        <strong>Labeled</strong>
        <span style={storyStyles.meta}>aria-label=Information</span>
      </article>
    </div>
  );
};

const UnsupportedNamePreview = () => (
  <pre
    style={{
      background: 'color-mix(in srgb, var(--ui-color-surface) 92%, white)',
      border: '1px solid var(--ui-color-border)',
      borderRadius: '16px',
      color: 'var(--ui-color-text)',
      padding: '16px',
      width: 'min(720px, 100%)',
      whiteSpace: 'pre-wrap',
    }}
  >
    Unsupported icon name "missing-icon".
  </pre>
);

export const Catalog: Story = {
  render: () => <CatalogGallery />,
};

export const Sizes: Story = {
  render: () => <SizingGallery />,
};

export const Accessibility: Story = {
  render: () => <AccessibilityGallery />,
};

export const UnsupportedName: Story = {
  render: () => <UnsupportedNamePreview />,
};
