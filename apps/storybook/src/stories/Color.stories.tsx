import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import {
  baseMonochrome,
  colorFamilyNames,
  colorPalette,
  colorPaletteStepNames,
} from '@deweyou-design/styles';

const storyStyles = {
  card: {
    background: 'color-mix(in srgb, var(--ui-color-surface) 88%, var(--ui-color-canvas))',
    border: '1px solid var(--ui-color-border)',
    borderRadius: '20px',
    color: 'var(--ui-color-text)',
    display: 'grid',
    gap: '16px',
    minWidth: 0,
    padding: '22px',
  },
  familyCard: {
    background: 'color-mix(in srgb, var(--ui-color-canvas) 78%, var(--ui-color-surface))',
    border: '1px solid var(--ui-color-border)',
    borderRadius: '18px',
    display: 'grid',
    gap: '12px',
    minWidth: 0,
    padding: '16px',
  },
  grid: {
    display: 'grid',
    gap: '18px',
    width: 'min(1120px, 100%)',
  },
  meta: {
    color: 'var(--ui-color-text-muted)',
    fontFamily: 'var(--ui-font-mono)',
    fontSize: '0.82rem',
    lineHeight: 1.5,
  },
  monochromeGrid: {
    display: 'grid',
    gap: '12px',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
  monochromeSwatch: {
    border: '1px solid color-mix(in srgb, var(--ui-color-border) 86%, transparent)',
    borderRadius: '14px',
    display: 'grid',
    gap: '8px',
    minBlockSize: '120px',
    padding: '14px',
  },
  paletteGrid: {
    display: 'grid',
    gap: '16px',
    gridTemplateColumns: 'minmax(0, 1fr)',
  },
  stepGrid: {
    display: 'grid',
    gap: '8px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(4.25rem, 1fr))',
  },
  stepSwatch: {
    alignItems: 'end',
    border: '1px solid color-mix(in srgb, var(--ui-color-border) 86%, transparent)',
    borderRadius: '12px',
    display: 'grid',
    minBlockSize: '74px',
    padding: '8px 6px',
  },
} as const satisfies Record<string, CSSProperties>;

const monochromeEntries = [
  ['black', baseMonochrome.black],
  ['white', baseMonochrome.white],
] as const;

const getReadableSwatchTextColor = (hslValue: string) => {
  const match = /hsl\(\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%\s*\)/.exec(hslValue);

  if (!match) {
    return baseMonochrome.black;
  }

  const hue = Number(match[1]);
  const saturation = Number(match[2]) / 100;
  const lightness = Number(match[3]) / 100;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const segment = hue / 60;
  const x = chroma * (1 - Math.abs((segment % 2) - 1));
  const offset = lightness - chroma / 2;
  const [red, green, blue] =
    segment < 1
      ? [chroma, x, 0]
      : segment < 2
        ? [x, chroma, 0]
        : segment < 3
          ? [0, chroma, x]
          : segment < 4
            ? [0, x, chroma]
            : segment < 5
              ? [x, 0, chroma]
              : [chroma, 0, x];
  const toLinear = (channel: number) => {
    const value = channel + offset;

    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  const luminance = 0.2126 * toLinear(red) + 0.7152 * toLinear(green) + 0.0722 * toLinear(blue);

  return luminance > 0.18 ? baseMonochrome.black : baseMonochrome.white;
};

const meta = {
  title: 'Foundations/Color',
  parameters: {
    docs: {
      description: {
        component:
          'Review the shared palette foundation and governance notes. Use Storybook theme switching to inspect the same palette in light and dark mode.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const SharedColorFoundation = () => {
  return (
    <article style={storyStyles.card}>
      <strong>Shared color foundation</strong>
      <span style={storyStyles.meta}>
        26 color families, 11 steps each, plus pure black and white. Components reuse this
        foundation first — new specialized tokens require justification.
      </span>
      <div style={storyStyles.paletteGrid}>
        <article style={storyStyles.familyCard}>
          <strong>Monochrome</strong>
          <div style={storyStyles.monochromeGrid}>
            {monochromeEntries.map(([name, value]) => (
              <div
                key={name}
                style={{
                  ...storyStyles.monochromeSwatch,
                  background: value,
                  color: name === 'black' ? baseMonochrome.white : baseMonochrome.black,
                }}
              >
                <strong>{name}</strong>
                <code>{value}</code>
              </div>
            ))}
          </div>
          <span style={storyStyles.meta}>`baseMonochrome.black` / `baseMonochrome.white`</span>
        </article>
        {colorFamilyNames.map((familyName) => (
          <article key={familyName} style={storyStyles.familyCard}>
            <strong>{familyName}</strong>
            <div style={storyStyles.stepGrid}>
              {colorPaletteStepNames.map((stepName) => (
                <div
                  key={stepName}
                  style={{
                    ...storyStyles.stepSwatch,
                    background: `var(--ui-color-palette-${familyName}-${stepName})`,
                    color: getReadableSwatchTextColor(colorPalette[familyName][stepName]),
                  }}
                >
                  <code>{stepName}</code>
                </div>
              ))}
            </div>
            <span style={storyStyles.meta}>{`Path: colorPalette.${familyName}.{step}`}</span>
            <span style={storyStyles.meta}>{`CSS var: --ui-color-palette-${familyName}-*`}</span>
          </article>
        ))}
      </div>
    </article>
  );
};

const ReviewGuidance = () => {
  return (
    <article style={storyStyles.card}>
      <strong>Governance notes</strong>
      <span style={storyStyles.meta}>
        Storybook hosts the full palette review matrix; the website contains only public guidance.
        Any new color requirement must first demonstrate that the shared foundation palette plus
        existing semantic theme tokens are insufficient before a new specialized token is approved.
      </span>
      <span style={storyStyles.meta}>
        Use Storybook theme switching to inspect the same palette in light and dark mode.
      </span>
      <pre
        style={{
          background: 'color-mix(in srgb, var(--ui-color-surface) 92%, var(--ui-color-canvas))',
          border: '1px solid var(--ui-color-border)',
          borderRadius: '16px',
          color: 'var(--ui-color-text)',
          margin: 0,
          padding: '16px',
          whiteSpace: 'pre-wrap',
        }}
      >
        {`import {
  baseMonochrome,
  colorFamilyNames,
  colorPalette,
  colorPaletteStepNames,
} from '@deweyou-design/styles';`}
      </pre>
    </article>
  );
};

const Overview = () => {
  return (
    <div style={storyStyles.grid}>
      <SharedColorFoundation />
      <ReviewGuidance />
    </div>
  );
};

export const OverviewStory: Story = {
  name: 'Overview',
  render: () => <Overview />,
};

// ---------------------------------------------------------------------------
// Story: Interaction — smoke test (purely presentational, no interactive behavior)
// ---------------------------------------------------------------------------

import { expect } from 'storybook/test';

export const Interaction: Story = {
  name: 'Interaction',
  render: () => <Overview />,
  play: async ({ canvasElement }) => {
    // Verify the color palette renders at least one swatch element
    const swatches = canvasElement.querySelectorAll('[style*="background"]');
    await expect(swatches.length).toBeGreaterThan(0);
  },
};
