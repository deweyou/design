import type { Meta, StoryObj } from '@storybook/react';
import { Text } from '@deweyou-design/react/text';
import { colorFamilyNames } from '@deweyou-design/styles';

const weightSamples = [
  {
    className: 'typography-tier-body',
    label: 'Body / 400',
    note: 'Default body text, button labels, form descriptions',
    sample: '观海听涛 Typography 2026 / Source Han Serif CN / Build v1.4.0 / ¥299.00',
  },
  {
    className: 'typography-tier-emphasis',
    label: 'Emphasis / 500',
    note: 'Light emphasis, labels, status indicators',
    sample: '观海听涛 Typography 2026 / Source Han Serif CN / Build v1.4.0 / ¥299.00',
  },
  {
    className: 'typography-tier-title',
    label: 'Title / 600',
    note: 'Headings, module names, section elevation',
    sample: '观海听涛 Typography 2026 / Source Han Serif CN / Build v1.4.0 / ¥299.00',
  },
  {
    className: 'typography-tier-strong',
    label: 'Strong / 700',
    note: 'Strong heading emphasis, key highlights',
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
    minWidth: 0,
    overflow: 'hidden',
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
  shell: {
    display: 'grid',
    gap: '12px',
    width: 'min(920px, 100%)',
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
    note: 'Default inline text',
    sample: 'Inline text rendered with default body typography.',
  },
  {
    variant: 'body',
    label: 'body / div',
    note: 'Block-level body text',
    sample: 'Block body text for paragraphs and descriptive content.',
  },
  {
    variant: 'caption',
    label: 'caption / div',
    note: 'De-emphasised supporting text',
    sample: 'Caption text remains readable but carries lower visual weight.',
  },
  {
    variant: 'h1',
    label: 'h1 / h1',
    note: 'Level-1 heading semantics and scale',
    sample: 'Page-level primary heading.',
  },
  {
    variant: 'h2',
    label: 'h2 / h2',
    note: 'Level-2 heading semantics and scale',
    sample: 'Section or card heading.',
  },
  {
    variant: 'h3',
    label: 'h3 / h3',
    note: 'Level-3 heading semantics and scale',
    sample: 'Sub-section heading.',
  },
  {
    variant: 'h4',
    label: 'h4 / h4',
    note: 'Level-4 heading semantics and scale',
    sample: 'Supporting sub-group heading.',
  },
  {
    variant: 'h5',
    label: 'h5 / h5',
    note: 'Level-5 heading semantics and scale',
    sample: 'Compact label-level heading.',
  },
] as const;

const textDecorationSamples = [
  { label: 'italic', props: { italic: true }, sample: 'Italic is suitable for tone variation.' },
  { label: 'bold', props: { bold: true }, sample: 'Bold provides stronger visual emphasis.' },
  {
    label: 'underline',
    props: { underline: true },
    sample: 'Underline highlights key information.',
  },
  {
    label: 'strikethrough',
    props: { strikethrough: true },
    sample: 'Strikethrough marks revised or deprecated content.',
  },
  {
    label: 'combined',
    props: { bold: true, italic: true, strikethrough: true, underline: true },
    sample: 'Combined decorations must stack correctly.',
  },
] as const;

const textPaletteFamilies = colorFamilyNames;

const longTextSample =
  'Long-form text with lineClamp set will be truncated at the specified number of lines and show an ellipsis to indicate that more content exists beyond the visible area.';
const editorialBodyLead =
  'When dusk falls on the other side of the strait, the long-form page of Typography Review 2026 displays Chinese, English labels, build number Build v1.4.0, price ¥299.00, and time 19:45 simultaneously. An unstable typographic hierarchy quickly makes this kind of mixed-script content feel loose.';
const editorialBodySection =
  'The goal of this Text component is not to create a set of isolated font styles, but to let heading, body, caption, and inline emphasis connect naturally within the same piece of content. During reading, users scan headings first, return to paragraphs, then switch rapidly between numbers, foreign words, and emphasis markers.';
const editorialBodyClose =
  'We therefore need `lineClamp` for summary cards while keeping full body text rhythmic in long paragraphs. A stable typographic entry point should let information like "Q2 revenue +18.6% / Review completion rate 97% / Deadline 2026-03-31" sit on the same reading surface as narrative prose — neither losing weight nor becoming jarring.';

const meta = {
  title: 'Components/Typography',
  component: Text,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      description:
        'Typographic role and rendered HTML element. `plain` → `<span>`; `body` / `caption` → `<div>`; `h1`–`h5` → the corresponding heading element.',
      control: { type: 'select' },
      options: ['plain', 'body', 'caption', 'h1', 'h2', 'h3', 'h4', 'h5'],
      table: {
        type: { summary: "'plain' | 'body' | 'caption' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5'" },
        defaultValue: { summary: 'plain' },
      },
    },
    bold: {
      description: 'Applies `font-weight: 700` (strong emphasis tier).',
      control: { type: 'boolean' },
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    italic: {
      description: 'Applies italic style for tone variation.',
      control: { type: 'boolean' },
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    underline: {
      description: 'Adds an underline decoration to mark key information.',
      control: { type: 'boolean' },
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    strikethrough: {
      description: 'Adds a strikethrough to mark revised or deprecated content.',
      control: { type: 'boolean' },
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    color: {
      description:
        'Applies a foreground color from the shared palette. Directly reuses `@deweyou-design/styles` color family names — no separate Text-specific color set.',
      control: { type: 'select' },
      options: colorFamilyNames,
      table: {
        type: { summary: 'ColorFamilyName' },
        defaultValue: { summary: '—' },
      },
    },
    background: {
      description: 'Applies a background highlight from the shared palette color families.',
      control: { type: 'select' },
      options: colorFamilyNames,
      table: {
        type: { summary: 'ColorFamilyName' },
        defaultValue: { summary: '—' },
      },
    },
    lineClamp: {
      description:
        'Clamps the visible text to the given number of lines and appends an ellipsis when the content overflows.',
      control: { type: 'number' },
      table: {
        type: { summary: 'number | undefined' },
        defaultValue: { summary: '—' },
      },
    },
    children: {
      description: 'Text content.',
      control: { type: 'text' },
      table: {
        type: { summary: 'ReactNode' },
        defaultValue: { summary: '—' },
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Text renders semantic typographic content using the Songti-oriented font stack (Source Han Serif CN Web). It covers eight variants, four decoration props, shared-palette color and background highlights, and a `lineClamp` utility. Import from `@deweyou-design/react/text`.',
      },
    },
  },
} satisfies Meta<typeof Text>;

export default meta;

type Story = StoryObj<typeof meta>;

const EntrypointShell = () => {
  return (
    <div style={previewStyles.shell}>
      <article style={previewStyles.card}>
        <strong>Preferred subpath</strong>
        <code>{`import { Text } from '@deweyou-design/react/text';`}</code>
        <span style={previewStyles.meta}>
          Prefer the `text` subpath for single-component consumption. No extra style import
          required.
        </span>
      </article>
      <article style={previewStyles.card}>
        <strong>Root compatibility</strong>
        <code>{`import { Text } from '@deweyou-design/react';`}</code>
        <span style={previewStyles.meta}>
          The root entry remains available for aggregate consumption and existing documentation
          examples.
        </span>
      </article>
    </div>
  );
};

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
              Loads `Source Han Serif CN Web` by default; falls back to `Songti SC`, `STSong`,
              `SimSun`, `NSimSun` when unavailable.
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

export const Entrypoints: Story = {
  render: () => <EntrypointShell />,
};

const TextContractPreview = () => {
  return (
    <div style={previewStyles.matrix}>
      <article style={previewStyles.card}>
        <strong>Text component contract</strong>
        <div style={{ ...previewStyles.grid, gridTemplateColumns: '1fr' }}>
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
          `color` and `background` directly reuse `@deweyou-design/styles` shared color family
          names. No separate Text-specific color set is introduced.
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
            <Text variant="h2">
              Heading variant now renders a native heading element by default.
            </Text>
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
            Within a single paragraph,{' '}
            <Text bold style={previewStyles.readingInline}>
              heading elevation
            </Text>
            ,{' '}
            <Text italic style={previewStyles.readingInline}>
              tone variation
            </Text>
            ,{' '}
            <Text underline style={previewStyles.readingInline}>
              key information markers
            </Text>
            ,{' '}
            <Text background="amber" bold color="amber" style={previewStyles.readingInline}>
              palette-backed highlights
            </Text>
            , and{' '}
            <Text strikethrough style={previewStyles.readingInline}>
              deprecated expressions
            </Text>{' '}
            should all compose naturally without needing a chain of ad-hoc classes.
          </Text>
        </section>

        <section style={previewStyles.readingSection}>
          <Text variant="h2">I. Reading Entry and Summary Rhythm</Text>
          <Text variant="body">{editorialBodySection}</Text>
          <Text variant="h3">1.1 Density Control in Mixed Scripts</Text>
          <Text variant="body">
            For example, "Latency 128ms / Average dwell 6.4 min / UV 12,480 / Conversion rate 3.2%":
            such sentences need to maintain a stable visual centre of gravity across Chinese prose,
            English terms, and Arabic numerals without any one script type jumping out.
          </Text>
          <Text variant="h4">1.1.1 Supporting Text and Footnotes</Text>
          <Text variant="caption">
            Caption suits sources, timestamps, annotations and lower-priority information, e.g. Last
            sync 2026-03-24 19:45 CST.
          </Text>
        </section>

        <section style={previewStyles.readingSection}>
          <Text variant="h2">II. Hierarchy Transitions in Long-Form Content</Text>
          <Text variant="body">{editorialBodyClose}</Text>
          <Text variant="h3">2.1 Subheadings Should Not Interrupt Reading Flow</Text>
          <Text variant="body">
            When a module transitions from overview to detail and into a metrics appendix, `h3`,
            `h4`, and `h5` should progressively converge rather than all competing at the same
            visual weight.
          </Text>
          <Text variant="h5">Note: for lists, marginalia, and lightweight callouts</Text>
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

// ---------------------------------------------------------------------------
// Story: Interaction — smoke test (purely presentational, no interactive behavior)
// ---------------------------------------------------------------------------

import { expect } from 'storybook/test';

export const Interaction: Story = {
  name: 'Interaction',
  render: () => <FontWeightsPreview />,
  play: async ({ canvasElement }) => {
    // Verify the typography preview renders text content
    const textNodes = canvasElement.querySelectorAll('p, span, strong, article');
    expect(textNodes.length).toBeGreaterThan(0);
  },
};
