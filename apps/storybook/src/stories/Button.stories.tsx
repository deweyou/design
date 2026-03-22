import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '@deweyou-ui/components';
import { AddIcon } from '@deweyou-ui/icons/add';
import { MenuIcon } from '@deweyou-ui/icons/menu';
import { SearchIcon } from '@deweyou-ui/icons/search';

const colorOptions = ['neutral', 'primary'] as const;
const sizeOptions = ['extra-small', 'small', 'medium', 'large', 'extra-large'] as const;
const shapeOptions = ['rect', 'rounded', 'pill'] as const;
const typographyTiers = [
  {
    className: 'typography-tier-body',
    example: '正文层级：组件文案默认使用宋体方向，适合按钮、表单与说明文本。',
    label: 'Body / 400',
  },
  {
    className: 'typography-tier-emphasis',
    example: '次强调层级：适合标签、状态说明和需要轻度抬升的信息。',
    label: 'Emphasis / 500',
  },
  {
    className: 'typography-tier-title',
    example: '标题层级：为页面标题、卡片标题和更强信息层级准备。',
    label: 'Title / 600',
  },
  {
    className: 'typography-tier-strong',
    example: '强强调层级：用于更突出的标题或重点提示。',
    label: 'Strong / 700',
  },
] as const;
const typographyMixSamples = [
  'Typography Contract 2026 / 版本 2.003R / 价格 ¥299.00 / 完成率 97%',
  'Publish changes / 审核剩余 14 分钟 / Build v1.4.0 / Delta +12.8%',
] as const;

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
  typographyGrid: {
    display: 'grid',
    gap: '14px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    width: 'min(1040px, 100%)',
  },
  typographySample: {
    display: 'grid',
    gap: '10px',
    lineHeight: 1.6,
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
          'Internal review matrix for the Button public API, color emphasis, shape support, content-mode boundaries, and invalid-combination guidance.',
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
              : 'Primary opts variants into theme color, including hover, border, text, and underline.'}
          </span>
        </article>
      ))}
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
            <Button
              aria-label={`Open search at ${size}`}
              color="primary"
              size={size}
              variant="ghost"
            >
              <SearchIcon />
            </Button>
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
          <Button aria-label="Open menu" disabled variant="ghost">
            <MenuIcon />
          </Button>
        </div>
      </article>
      <article style={storyStyles.card}>
        <strong>Long label</strong>
        <Button size="extra-small" variant="outlined">
          This extra-small button keeps a single-line action label, even when the copy gets verbose.
        </Button>
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
        <strong>Icon-only content</strong>
        <div style={storyStyles.row}>
          <Button aria-label="Open search">
            <SearchIcon />
          </Button>
          <Button aria-label="Add item" shape="pill" variant="outlined">
            <AddIcon />
          </Button>
        </div>
        <span style={storyStyles.meta}>
          Any button without visible text must provide aria-label or aria-labelledby. This is a
          content boundary, not a special layout mode.
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
      {`Button variant "link" does not support the shape prop.\nButton requires aria-label or aria-labelledby when no visible text is rendered.`}
    </pre>
  );
};

const TypographyContractPreview = () => {
  return (
    <div style={storyStyles.matrix}>
      <article style={storyStyles.card}>
        <strong>Type tiers</strong>
        <div style={storyStyles.typographyGrid}>
          {typographyTiers.map((tier) => (
            <article key={tier.label} style={storyStyles.card}>
              <span style={storyStyles.meta}>{tier.label}</span>
              <div className={tier.className} style={storyStyles.typographySample}>
                {tier.example}
              </div>
            </article>
          ))}
        </div>
      </article>
      <article style={storyStyles.card}>
        <strong>Mixed-script review</strong>
        <div style={storyStyles.typographyGrid}>
          {typographyMixSamples.map((sample) => (
            <article key={sample} style={storyStyles.card}>
              <div className="typography-tier-body" style={storyStyles.typographySample}>
                {sample}
              </div>
              <code style={storyStyles.meta}>Source Han Serif CN + platform fallback audit</code>
            </article>
          ))}
          <article style={storyStyles.card}>
            <div className="typography-tier-body" style={storyStyles.typographySample}>
              默认字体未就绪时，`macOS` 应退回 `Songti SC` / `STSong`，`Windows` 应退回 `SimSun` /
              `NSimSun`。
            </div>
            <code style={storyStyles.meta}>Fallback expectation</code>
          </article>
          <article style={storyStyles.card}>
            <code>{'const buildVersion = "v1.4.0";'}</code>
            <span style={storyStyles.meta}>
              Code and fixed-width identifiers stay on `--ui-font-mono`.
            </span>
          </article>
        </div>
      </article>
    </div>
  );
};

export const Variants: Story = {
  render: () => <VariantGallery />,
};

export const Colors: Story = {
  render: () => <ColorGallery />,
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

export const InvalidCombinations: Story = {
  render: () => <InvalidCombinationPreview />,
};

export const TypographyContract: Story = {
  render: () => <TypographyContractPreview />,
};
