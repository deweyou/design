import type { Meta, StoryObj } from '@storybook/react';

const weightSamples = [
  {
    className: 'typography-tier-body',
    label: 'Body / 400',
    note: '默认正文、按钮文案、表单说明',
    sample: '观海听涛 Typography 2026 / Source Han Serif CN / Build v1.4.0 / ¥299.00',
  },
  {
    className: 'typography-tier-emphasis',
    label: 'Emphasis / 500',
    note: '轻度强调、标签、状态提示',
    sample: '观海听涛 Typography 2026 / Source Han Serif CN / Build v1.4.0 / ¥299.00',
  },
  {
    className: 'typography-tier-title',
    label: 'Title / 600',
    note: '标题、模块名称、信息分组抬升',
    sample: '观海听涛 Typography 2026 / Source Han Serif CN / Build v1.4.0 / ¥299.00',
  },
  {
    className: 'typography-tier-strong',
    label: 'Strong / 700',
    note: '强强调标题、重点提示',
    sample: '观海听涛 Typography 2026 / Source Han Serif CN / Build v1.4.0 / ¥299.00',
  },
] as const;

const previewStyles = {
  card: {
    background: 'color-mix(in srgb, var(--ui-color-surface) 88%, var(--ui-color-canvas))',
    border: '1px solid var(--ui-color-border)',
    borderRadius: '18px',
    color: 'var(--ui-color-text)',
    display: 'grid',
    gap: '14px',
    padding: '20px',
  },
  grid: {
    display: 'grid',
    gap: '16px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    width: 'min(1120px, 100%)',
  },
  matrix: {
    display: 'grid',
    gap: '16px',
    width: 'min(1120px, 100%)',
  },
  meta: {
    color: 'var(--ui-color-text-muted)',
    fontFamily: 'var(--ui-font-mono)',
    fontSize: '0.82rem',
    lineHeight: 1.5,
  },
  sample: {
    display: 'grid',
    gap: '8px',
    lineHeight: 1.6,
  },
  sentence: {
    fontSize: '1.25rem',
  },
  stack: {
    display: 'grid',
    gap: '8px',
  },
} as const;

const meta = {
  title: 'Internal review/Typography',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Preview for the default Songti-oriented typography contract, focused on comparing the four semantic font-weight tiers side by side.',
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const FontWeightsPreview = () => {
  return (
    <div style={previewStyles.matrix}>
      <article style={previewStyles.card}>
        <strong>Weight comparison</strong>
        <div style={previewStyles.grid}>
          {weightSamples.map((sample) => (
            <article key={sample.label} style={previewStyles.card}>
              <div style={previewStyles.stack}>
                <span style={previewStyles.meta}>{sample.label}</span>
                <span style={previewStyles.meta}>{sample.note}</span>
              </div>
              <div className={sample.className} style={previewStyles.sample}>
                <div style={previewStyles.sentence}>{sample.sample}</div>
                <div>静夜思 / Quiet Night Thoughts / 2026-03-22 / 98.4%</div>
              </div>
            </article>
          ))}
        </div>
      </article>
      <article style={previewStyles.card}>
        <strong>Fallback and exceptions</strong>
        <div style={previewStyles.grid}>
          <article style={previewStyles.card}>
            <div className="typography-tier-body" style={previewStyles.sample}>
              默认加载 `Source Han Serif CN Web`，未就绪时应退回 `Songti SC`、`STSong`、`SimSun`、
              `NSimSun`。
            </div>
            <span style={previewStyles.meta}>font-display: swap / platform fallback audit</span>
          </article>
          <article style={previewStyles.card}>
            <code>{'const releaseTag = "v1.4.0"; // mono exception'}</code>
            <span style={previewStyles.meta}>
              Code, fixed-width identifiers, and terminal-like content stay on `--ui-font-mono`.
            </span>
          </article>
        </div>
      </article>
    </div>
  );
};

export const FontWeights: Story = {
  render: () => <FontWeightsPreview />,
};
