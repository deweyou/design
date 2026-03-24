import type { Meta, StoryObj } from '@storybook/react';
import { Text } from '@deweyou-ui/components';
import { colorFamilyNames } from '@deweyou-ui/styles';

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
  textBoundaryCard: {
    display: 'grid',
    gap: '10px',
  },
  readingArticle: {
    display: 'grid',
    gap: '18px',
    margin: '0 auto',
    maxWidth: '720px',
  },
  readingFrame: {
    background:
      'linear-gradient(180deg, color-mix(in srgb, var(--ui-color-surface) 92%, var(--ui-color-canvas)), color-mix(in srgb, var(--ui-color-surface) 82%, var(--ui-color-canvas)))',
    border: '1px solid var(--ui-color-border)',
    borderRadius: '28px',
    boxShadow: 'var(--ui-shadow-soft)',
    padding: '28px',
  },
  readingInline: {
    display: 'inline',
  },
  readingSection: {
    display: 'grid',
    gap: '12px',
  },
} as const;

const textVariantSamples = [
  {
    variant: 'plain',
    label: 'plain / span',
    note: '默认行内文本',
    sample: '普通内联文本会按默认正文排版。',
  },
  {
    variant: 'body',
    label: 'body / div',
    note: '块级正文',
    sample: '块级正文适合承载说明段落和正文内容。',
  },
  {
    variant: 'caption',
    label: 'caption / div',
    note: '弱化说明文字',
    sample: '说明文字保持可读，但视觉强调弱于正文。',
  },
  {
    variant: 'h1',
    label: 'h1 / h1',
    note: '一级标题语义与视觉层级',
    sample: '一级标题用于页面最强抬升。',
  },
  {
    variant: 'h2',
    label: 'h2 / h2',
    note: '二级标题语义与视觉层级',
    sample: '二级标题适合模块和卡片标题。',
  },
  {
    variant: 'h3',
    label: 'h3 / h3',
    note: '三级标题语义与视觉层级',
    sample: '三级标题适合子分组抬升。',
  },
  {
    variant: 'h4',
    label: 'h4 / h4',
    note: '四级标题语义与视觉层级',
    sample: '四级标题适合辅助分组。',
  },
  {
    variant: 'h5',
    label: 'h5 / h5',
    note: '五级标题语义与视觉层级',
    sample: '五级标题适合小范围提示。',
  },
] as const;

const textDecorationSamples = [
  { label: 'italic', props: { italic: true }, sample: '斜体适合轻度语气变化。' },
  { label: 'bold', props: { bold: true }, sample: '加粗适合更强的视觉强调。' },
  { label: 'underline', props: { underline: true }, sample: '下划线适合标记重点信息。' },
  {
    label: 'strikethrough',
    props: { strikethrough: true },
    sample: '删除线适合表示修订或失效内容。',
  },
  {
    label: 'combined',
    props: { bold: true, italic: true, strikethrough: true, underline: true },
    sample: '组合样式必须可以叠加工作。',
  },
] as const;

const textPaletteFamilies = colorFamilyNames;

const longTextSample =
  '长文本摘要会在设置 lineClamp 后保持可读的最大行数，并在溢出时以省略形式提示仍有未显示内容。';
const editorialBodyLead =
  '黄昏落在海峡另一侧时，Typography Review 2026 的长文页面会同时出现中文、English labels、版本号 Build v1.4.0、价格 ¥299.00 与时间 19:45。排版层级如果不稳定，这类混合内容很快就会显得松散。';
const editorialBodySection =
  '这次 Text 的目标不是制造一组孤立的字体样式，而是让 heading、body、caption 与 inline emphasis 在同一篇内容里自然衔接。阅读过程中，用户会先扫过标题，再回到段落，随后在数字、外文与强调词之间快速切换。';
const editorialBodyClose =
  '因此我们既需要 `lineClamp` 处理摘要卡片，也需要完整正文在长段落里保持节奏。一个稳定的排版入口，应该让 “Q2 revenue +18.6% / 审核完成率 97% / 截止 2026-03-31” 这类信息和中文叙述落在同一块阅读表面里，既不失重，也不刺眼。';

const meta = {
  title: 'Internal review/Typography',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Preview for the default Songti-oriented typography contract plus the Text component contract, covering variants, shared-palette-backed highlights, lineClamp boundaries, and long-form reading flow.',
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

const TextContractPreview = () => {
  return (
    <div style={previewStyles.matrix}>
      <article style={previewStyles.card}>
        <strong>Text component contract</strong>
        <div style={previewStyles.grid}>
          {textVariantSamples.map((sample) => (
            <article key={sample.label} style={previewStyles.card}>
              <div style={previewStyles.stack}>
                <span style={previewStyles.meta}>{sample.label}</span>
                <span style={previewStyles.meta}>{sample.note}</span>
              </div>
              <div style={previewStyles.sample}>
                <Text variant={sample.variant}>{sample.sample}</Text>
              </div>
            </article>
          ))}
        </div>
      </article>
      <article style={previewStyles.card}>
        <strong>Decoration combinations</strong>
        <div style={previewStyles.grid}>
          {textDecorationSamples.map((sample) => (
            <article key={sample.label} style={previewStyles.card}>
              <span style={previewStyles.meta}>{sample.label}</span>
              <Text variant="body" {...sample.props}>
                {sample.sample}
              </Text>
            </article>
          ))}
        </div>
      </article>
      <article style={previewStyles.card}>
        <strong>Palette highlights</strong>
        <span style={previewStyles.meta}>
          `color` / `background` 直接复用 `@deweyou-ui/styles` 的共享基础色卡家族命名，不新增 Text
          私有颜色集合。
        </span>
        <div style={previewStyles.grid}>
          {textPaletteFamilies.map((family) => (
            <article key={family} style={previewStyles.card}>
              <span style={previewStyles.meta}>{family}</span>
              <Text background={family} bold color={family} variant="body">
                Palette-backed highlight / 中英数混排 / Build v1.4.0 / ¥299.00
              </Text>
            </article>
          ))}
        </div>
      </article>
      <article style={previewStyles.card}>
        <strong>Line clamp and heading defaults</strong>
        <div style={previewStyles.grid}>
          <article style={{ ...previewStyles.card, ...previewStyles.textBoundaryCard }}>
            <span style={previewStyles.meta}>Unclamped body</span>
            <Text variant="body">{longTextSample}</Text>
          </article>
          <article style={{ ...previewStyles.card, ...previewStyles.textBoundaryCard }}>
            <span style={previewStyles.meta}>lineClamp=2</span>
            <Text lineClamp={2} variant="body">
              {longTextSample}
            </Text>
          </article>
          <article style={{ ...previewStyles.card, ...previewStyles.textBoundaryCard }}>
            <span style={previewStyles.meta}>Native heading root</span>
            <Text variant="h2">标题 variant 现在默认输出原生 heading 节点。</Text>
          </article>
        </div>
      </article>
    </div>
  );
};

export const TextContract: Story = {
  render: () => <TextContractPreview />,
};

const LongFormPreview = () => {
  return (
    <div style={previewStyles.readingFrame}>
      <article style={previewStyles.readingArticle}>
        <Text variant="h1">雾港排版回顾 / Typographic Field Notes 2026</Text>
        <Text variant="caption">
          2026-03-24 · Issue 04 · CN / EN / Numerals review · Source Han Serif CN
        </Text>

        <section style={previewStyles.readingSection}>
          <Text lineClamp={3} variant="body">
            {editorialBodyLead}
          </Text>
          <Text variant="body">
            在同一段正文里，
            <Text bold style={previewStyles.readingInline}>
              标题抬升
            </Text>
            、
            <Text italic style={previewStyles.readingInline}>
              语气变化
            </Text>
            、
            <Text underline style={previewStyles.readingInline}>
              关键信息标记
            </Text>
            、
            <Text background="amber" bold color="amber" style={previewStyles.readingInline}>
              palette-backed highlight
            </Text>
            和
            <Text strikethrough style={previewStyles.readingInline}>
              已废弃表述
            </Text>
            都应该能自然拼接，不需要拆成一串临时 class。
          </Text>
        </section>

        <section style={previewStyles.readingSection}>
          <Text variant="h2">一、阅读入口与摘要节奏</Text>
          <Text variant="body">{editorialBodySection}</Text>
          <Text variant="h3">1.1 混合脚本的密度控制</Text>
          <Text variant="body">
            例如 “Latency 128ms / 平均停留 6.4 min / UV 12,480 / 转化率 3.2%” 这样的句子，
            需要在中文叙述、英文术语与阿拉伯数字之间维持稳定字面重心，而不是让某一类字符突然跳出来。
          </Text>
          <Text variant="h4">1.1.1 说明文字与脚注</Text>
          <Text variant="caption">
            Caption 适合放置来源、时间、注记与较低优先级信息，例如 Last sync 2026-03-24 19:45 CST。
          </Text>
        </section>

        <section style={previewStyles.readingSection}>
          <Text variant="h2">二、长文中的层级切换</Text>
          <Text variant="body">{editorialBodyClose}</Text>
          <Text variant="h3">2.1 小标题不该打断正文呼吸</Text>
          <Text variant="body">
            当一个模块从 overview 过渡到 detail，再进入 metrics appendix 时，`h3`、`h4`、`h5`
            应该逐级收束，而不是全部挤在同一个视觉重量上。
          </Text>
          <Text variant="h5">附注：用于列表、边注与轻量提醒</Text>
          <Text variant="caption">
            Example note: Keep code identifiers such as `releaseTag`, `BUILD_ID`, and `Q2_GROWTH` on
            the mono exception only when they truly act like code.
          </Text>
        </section>
      </article>
    </div>
  );
};

export const ReadingSurface: Story = {
  render: () => <LongFormPreview />,
};
