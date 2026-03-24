import type { Meta, StoryObj } from '@storybook/react';
import { useRef, useState } from 'react';

import { Button, IconButton } from '@deweyou-ui/components';
import { AddIcon } from '@deweyou-ui/icons/add';
import { MenuIcon } from '@deweyou-ui/icons/menu';
import { SearchIcon } from '@deweyou-ui/icons/search';

const colorOptions = ['neutral', 'primary', 'danger'] as const;
const sizeOptions = ['extra-small', 'small', 'medium', 'large', 'extra-large'] as const;
const shapeOptions = ['rect', 'rounded', 'pill'] as const;
const storyStyles = {
  boundaryGrid: {
    display: 'grid',
    gap: '14px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    width: 'min(1040px, 100%)',
  },
  card: {
    background: 'color-mix(in srgb, var(--ui-color-surface) 86%, var(--ui-color-canvas))',
    border: '1px solid var(--ui-color-border)',
    borderRadius: '18px',
    color: 'var(--ui-color-text)',
    display: 'grid',
    gap: '12px',
    minWidth: 0,
    padding: '18px',
  },
  grid: {
    display: 'grid',
    gap: '14px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    width: 'min(1040px, 100%)',
  },
  matrix: {
    display: 'grid',
    gap: '18px',
    width: 'min(1040px, 100%)',
  },
  longLabelPreview: {
    minWidth: 0,
    overflow: 'hidden',
    maxWidth: '100%',
    width: 'min(260px, 100%)',
  },
  meta: {
    color: 'var(--ui-color-text-muted)',
    fontFamily: 'var(--ui-font-mono)',
    fontSize: '0.82rem',
    lineHeight: 1.4,
  },
  row: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  },
} as const;

const meta = {
  title: 'Internal review/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Internal review matrix for the Button / IconButton public API, native prop passthrough, loading feedback, color emphasis, shape support, and explicit icon entry guidance.',
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

const VariantGallery = () => {
  return (
    <div style={storyStyles.grid}>
      <article style={storyStyles.card}>
        <strong>filled</strong>
        <Button>Primary action</Button>
        <span style={storyStyles.meta}>Default variant, default color = neutral</span>
      </article>
      <article style={storyStyles.card}>
        <strong>outlined</strong>
        <Button variant="outlined">Secondary action</Button>
        <span style={storyStyles.meta}>Border-led feedback for supporting actions</span>
      </article>
      <article style={storyStyles.card}>
        <strong>ghost</strong>
        <Button variant="ghost">Contextual action</Button>
        <span style={storyStyles.meta}>Hover feedback comes from the background</span>
      </article>
      <article style={storyStyles.card}>
        <strong>link</strong>
        <Button variant="link">Inline action</Button>
        <span style={storyStyles.meta}>
          Hover feedback comes from the underline, not a separate box treatment
        </span>
      </article>
    </div>
  );
};

const ColorGallery = () => {
  return (
    <div style={storyStyles.matrix}>
      {colorOptions.map((color) => (
        <article key={color} style={storyStyles.card}>
          <strong>{color}</strong>
          <div style={storyStyles.row}>
            <Button color={color}>Filled</Button>
            <Button color={color} variant="outlined">
              Outlined
            </Button>
            <Button color={color} variant="ghost">
              Ghost
            </Button>
            <Button color={color} variant="link">
              Link
            </Button>
          </div>
          <span style={storyStyles.meta}>
            {color === 'neutral'
              ? 'Neutral is the default and keeps all variants monochrome.'
              : color === 'primary'
                ? 'Primary opts variants into theme color, including hover, border, text, and underline.'
                : 'Danger uses the same variant system but shifts emphasis to destructive actions.'}
          </span>
        </article>
      ))}
    </div>
  );
};

const PublicPropsGallery = () => {
  const [captureCount, setCaptureCount] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [submitCount, setSubmitCount] = useState(0);
  const focusTargetRef = useRef<HTMLButtonElement>(null);

  return (
    <div style={storyStyles.boundaryGrid}>
      <article style={storyStyles.card}>
        <strong>Click events</strong>
        <div style={storyStyles.row}>
          <Button
            onClick={() => {
              setClickCount((count) => count + 1);
            }}
            onClickCapture={() => {
              setCaptureCount((count) => count + 1);
            }}
            variant="outlined"
          >
            Trigger handlers
          </Button>
        </div>
        <span style={storyStyles.meta}>{`capture ${captureCount} / bubble ${clickCount}`}</span>
      </article>
      <article style={storyStyles.card}>
        <strong>htmlType + form</strong>
        <form
          style={storyStyles.row}
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitCount((count) => count + 1);
          }}
        >
          <Button color="primary" htmlType="submit" type="reset">
            Submit with htmlType
          </Button>
          <Button type="reset" variant="ghost">
            Reset form
          </Button>
        </form>
        <span style={storyStyles.meta}>
          {`submit count ${submitCount}. htmlType wins over the native type prop when both are present.`}
        </span>
      </article>
      <article style={storyStyles.card}>
        <strong>href + target anchor mode</strong>
        <div style={storyStyles.row}>
          <Button href="/contracts/button" target="_blank" variant="ghost">
            Pass metadata
          </Button>
          <IconButton
            aria-label="Open search metadata preview"
            href="/search"
            icon={<SearchIcon />}
            target="_blank"
            variant="outlined"
          />
        </div>
        <span style={storyStyles.meta}>
          `href` switches the root to a real anchor. `target` is only valid when `href` is present.
        </span>
      </article>
      <article style={storyStyles.card}>
        <strong>Ref forwarding</strong>
        <div style={storyStyles.row}>
          <Button ref={focusTargetRef} variant="outlined">
            Focus target
          </Button>
          <Button
            onClick={() => {
              focusTargetRef.current?.focus();
            }}
            size="small"
          >
            Focus via ref
          </Button>
        </div>
        <span style={storyStyles.meta}>Forwarded refs resolve to the rendered root DOM node.</span>
      </article>
    </div>
  );
};

const LoadingGallery = () => {
  return (
    <div style={storyStyles.boundaryGrid}>
      <article style={storyStyles.card}>
        <strong>Text button loading</strong>
        <div style={storyStyles.row}>
          <Button loading>Saving changes</Button>
          <Button icon={<SearchIcon />} loading variant="outlined">
            Searching
          </Button>
        </div>
        <span style={storyStyles.meta}>
          Loading prepends the spinner, keeps text visible, and blocks repeated activation.
        </span>
      </article>
      <article style={storyStyles.card}>
        <strong>Danger loading</strong>
        <div style={storyStyles.row}>
          <Button color="danger" loading>
            Delete item
          </Button>
          <Button color="danger" loading variant="ghost">
            Archive thread
          </Button>
        </div>
        <span style={storyStyles.meta}>
          Danger remains a color choice, not a separate variant or mode.
        </span>
      </article>
      <article style={storyStyles.card}>
        <strong>Icon-only loading</strong>
        <div style={storyStyles.row}>
          <IconButton
            aria-label="Refreshing search results"
            icon={<SearchIcon />}
            loading
            variant="outlined"
          />
          <Button.Icon aria-label="Syncing menu state" icon={<MenuIcon />} loading />
        </div>
        <span style={storyStyles.meta}>
          Icon-only entries replace the original icon with the spinner and still require an
          accessible name.
        </span>
      </article>
      <article style={storyStyles.card}>
        <strong>Loading + disabled</strong>
        <div style={storyStyles.row}>
          <Button disabled loading variant="outlined">
            Publishing
          </Button>
          <IconButton
            aria-label="Refreshing disabled action"
            disabled
            icon={<AddIcon />}
            loading
            variant="ghost"
          />
        </div>
        <span style={storyStyles.meta}>
          Loading keeps the disabled-like visual treatment without switching to a `not-allowed`
          cursor.
        </span>
      </article>
    </div>
  );
};

const SizeGallery = () => {
  return (
    <div style={storyStyles.grid}>
      {sizeOptions.map((size) => (
        <article key={size} style={storyStyles.card}>
          <strong>{size}</strong>
          <div style={storyStyles.row}>
            <Button size={size}>Approve</Button>
            <Button color="primary" size={size} variant="outlined">
              Review
            </Button>
            <IconButton
              aria-label={`Open search at ${size}`}
              color="primary"
              icon={<SearchIcon />}
              size={size}
              variant="ghost"
            />
          </div>
        </article>
      ))}
    </div>
  );
};

const ShapeGallery = () => {
  return (
    <div style={storyStyles.matrix}>
      <article style={storyStyles.card}>
        <strong>filled</strong>
        <div style={storyStyles.row}>
          {shapeOptions.map((shape) => (
            <Button key={shape} color="primary" shape={shape}>
              {shape}
            </Button>
          ))}
        </div>
        <span style={storyStyles.meta}>Supported shapes: rect, rounded, pill</span>
      </article>
      <article style={storyStyles.card}>
        <strong>outlined</strong>
        <div style={storyStyles.row}>
          {shapeOptions.map((shape) => (
            <Button key={shape} color="primary" shape={shape} variant="outlined">
              {shape}
            </Button>
          ))}
        </div>
        <span style={storyStyles.meta}>Supported shapes: rect, rounded, pill</span>
      </article>
      <article style={storyStyles.card}>
        <strong>ghost + link</strong>
        <div style={storyStyles.row}>
          <Button variant="ghost">Background hover</Button>
          <Button variant="link">Underline hover</Button>
        </div>
        <span style={storyStyles.meta}>No shape prop is supported for lightweight variants</span>
      </article>
    </div>
  );
};

const BoundaryGallery = () => {
  return (
    <div style={storyStyles.boundaryGrid}>
      <article style={storyStyles.card}>
        <strong>Disabled</strong>
        <div style={storyStyles.row}>
          <Button disabled>Save changes</Button>
          <Button disabled variant="outlined">
            Review
          </Button>
          <IconButton aria-label="Open menu" disabled icon={<MenuIcon />} variant="ghost" />
        </div>
      </article>
      <article style={storyStyles.card}>
        <strong>Long label</strong>
        <div style={storyStyles.longLabelPreview}>
          <Button
            size="extra-small"
            style={{ boxSizing: 'border-box', maxWidth: '100%', width: '100%' }}
            variant="outlined"
          >
            This extra-small button keeps a single-line action label, even when the copy gets
            verbose.
          </Button>
        </div>
        <span style={storyStyles.meta}>
          Constrained-width preview for single-line truncation audit
        </span>
      </article>
      <article style={storyStyles.card}>
        <strong>Focus-visible</strong>
        <div style={storyStyles.row}>
          <Button>Tab into me</Button>
          <Button variant="link">Keyboard audit</Button>
        </div>
        <span style={storyStyles.meta}>
          Use keyboard Tab inside the preview to inspect the shared focus ring treatment.
        </span>
      </article>
      <article style={storyStyles.card}>
        <strong>Explicit icon buttons</strong>
        <div style={storyStyles.row}>
          <IconButton aria-label="Open search" icon={<SearchIcon />} />
          <Button.Icon aria-label="Add item" icon={<AddIcon />} shape="pill" variant="outlined" />
        </div>
        <span style={storyStyles.meta}>
          Use `IconButton` or `Button.Icon` for square icon actions. Graphic-only `children` no
          longer request a special layout mode by themselves.
        </span>
      </article>
      <article style={storyStyles.card}>
        <strong>Icon + text</strong>
        <div style={storyStyles.row}>
          <Button icon={<SearchIcon />}>Search results</Button>
          <Button icon={<AddIcon />} variant="outlined">
            Add item
          </Button>
          <Button variant="link">
            Read migration
            <MenuIcon />
          </Button>
        </div>
        <span style={storyStyles.meta}>
          Visible text keeps Button in the content-density model, even when an icon is present.
        </span>
      </article>
    </div>
  );
};

const HoverFeedbackGallery = () => {
  return (
    <div style={storyStyles.matrix}>
      <article style={storyStyles.card}>
        <strong>Link underline reveal</strong>
        <div style={storyStyles.row}>
          <Button variant="link">Neutral link</Button>
          <Button color="primary" variant="link">
            Primary link
          </Button>
          <Button size="extra-small" variant="link">
            Compact link
          </Button>
        </div>
        <span style={storyStyles.meta}>
          `link` 默认使用从左到右的下划线显现反馈，不再回退到第二套 hover 模式。
        </span>
      </article>
      <article style={storyStyles.card}>
        <strong>Outlined border transition</strong>
        <div style={storyStyles.row}>
          <Button variant="outlined">Neutral outlined</Button>
          <Button color="primary" variant="outlined">
            Primary outlined
          </Button>
          {shapeOptions.map((shape) => (
            <Button key={shape} color="primary" shape={shape} variant="outlined">
              {shape}
            </Button>
          ))}
        </div>
        <span style={storyStyles.meta}>
          `outlined` 仅保留真实 border 的颜色过渡：默认低色度，hover 时平滑过渡到与文字一致的颜色。
        </span>
      </article>
      <article style={storyStyles.card}>
        <strong>Boundary audit</strong>
        <div style={storyStyles.row}>
          <Button disabled variant="link">
            Disabled link
          </Button>
          <Button disabled variant="outlined">
            Disabled outlined
          </Button>
          <Button variant="link">Keyboard audit</Button>
        </div>
        <span style={storyStyles.meta}>
          Disabled buttons must stay static. Focus-visible remains the primary keyboard signal, and
          reduced-motion users should still see restrained state changes.
        </span>
      </article>
    </div>
  );
};

const InvalidCombinationPreview = () => {
  return (
    <pre
      style={{
        background: 'color-mix(in srgb, var(--ui-color-surface) 92%, white)',
        border: '1px solid var(--ui-color-border)',
        borderRadius: '18px',
        color: 'var(--ui-color-text)',
        padding: '18px',
        whiteSpace: 'pre-wrap',
        width: 'min(720px, 100%)',
      }}
    >
      {`Button variant "link" does not support the shape prop.\nIconButton does not support the "link" variant. Use Button with visible text for link actions.\nButton no longer infers icon-only mode from children. Pass the graphic through the icon prop or use IconButton/Button.Icon.`}
    </pre>
  );
};

export const Variants: Story = {
  render: () => <VariantGallery />,
};

export const Colors: Story = {
  render: () => <ColorGallery />,
};

export const PublicProps: Story = {
  render: () => <PublicPropsGallery />,
};

export const LoadingStates: Story = {
  render: () => <LoadingGallery />,
};

export const Sizes: Story = {
  render: () => <SizeGallery />,
};

export const ShapeSupport: Story = {
  render: () => <ShapeGallery />,
};

export const Boundaries: Story = {
  render: () => <BoundaryGallery />,
};

export const HoverFeedback: Story = {
  render: () => <HoverFeedbackGallery />,
};

export const InvalidCombinations: Story = {
  render: () => <InvalidCombinationPreview />,
};
