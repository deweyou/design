import type { Meta, StoryObj } from '@storybook/react';
import { useRef } from 'react';

import { Button, ScrollArea, type ScrollAreaRef } from '@deweyou-design/react';

const PARA_1 =
  'Typography has been a cornerstone of human communication since the invention of movable type ' +
  'in the fifteenth century. The choice of typeface, leading, tracking, and measure all conspire ' +
  'to determine whether a reader glides effortlessly through a page or stumbles at every line. ' +
  'Serif typefaces draw the eye along the baseline, guiding it from word to word with subtle ' +
  'horizontal strokes that act like invisible rails beneath each character.';

const PARA_2 =
  'The golden ratio has fascinated designers and mathematicians for millennia. When applied to ' +
  'layout grids, it produces proportions that feel instinctively balanced — not because the eye ' +
  'is easily fooled, but because those proportions echo patterns found throughout the natural ' +
  'world: the spiral of a nautilus shell, the branching of river deltas, the arrangement of ' +
  'seeds in a sunflower head. Good design rarely calls attention to itself; it simply feels right.';

const PARA_3 =
  'Colour in interface design carries enormous communicative weight. A saturated hue signals ' +
  'urgency or brand identity; a muted palette conveys calm and professionalism. The challenge ' +
  'is maintaining sufficient contrast for legibility across the full range of display ' +
  'technologies — from an OLED phone screen in a dark room to a laptop in direct sunlight — ' +
  'while still expressing a coherent visual personality. Token-based theming makes this ' +
  'tractable by separating the semantic intent of a colour from its specific hex value.';

const PARA_4 =
  "Spacing is perhaps the most underappreciated tool in a designer's kit. Generous whitespace " +
  'gives elements room to breathe, lowers cognitive load, and signals hierarchy without ' +
  'resorting to heavy borders or drop shadows. A consistent spacing scale — built on a base ' +
  'unit of four or eight pixels and doubling at each step — ensures that any two adjacent ' +
  'elements relate to each other in a mathematically predictable way, even when the designer ' +
  'makes purely intuitive choices during composition.';

const PARA_5 =
  'Motion in user interfaces should be purposeful, not decorative. Animation that communicates ' +
  'a state transition — a panel sliding in, a notification fading out — helps users build an ' +
  "accurate mental model of the application's structure. Animation that exists purely for " +
  'spectacle distracts and delays. The threshold between the two is surprisingly low: anything ' +
  'beyond 200 milliseconds risks feeling sluggish; anything below 80 milliseconds may be ' +
  'imperceptible. The sweet spot lives in a narrow band, and finding it requires testing with ' +
  'real users on real hardware.';

const PARA_6 =
  'Accessibility is not a feature to be added at the end of a project — it is a design ' +
  'constraint that shapes every decision from the first wireframe. Colour contrast ratios, ' +
  'focus indicators, keyboard navigation order, ARIA roles and live regions: each of these ' +
  'elements must be considered in tandem with the visual design, not retrofitted once the ' +
  'implementation is complete. The reward for this discipline is a product that works for ' +
  'everyone, including users with low vision, motor impairments, or situational limitations ' +
  'such as bright sunlight or a broken touchscreen.';

const LONG_TEXT = [PARA_1, PARA_2, PARA_3, PARA_4, PARA_5, PARA_6].join('\n\n');

const WIDE_TEXT =
  'Horizontal scrolling content — ' +
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789 !@#$%^&*()_+-=[]{}|;:,.<>? — ' +
  'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. ' +
  'How vexingly quick daft zebras jump! The five boxing wizards jump quickly. ' +
  'Sphinx of black quartz, judge my vow. Jackdaws love my big sphinx of quartz. ' +
  'Two driven jocks help fax my big quiz. Five quacking zephyrs jolt my wax bed. ' +
  'The jay, pig, fox, zebra and my wolves quack! Blowzy red vixens fight for a quick jump. ' +
  "Joaquin Phoenix was gazed by MTV for luck. A wizard's job is to vex chumps quickly in fog.";

const storyStyles = {
  grid: {
    display: 'grid',
    gap: '24px',
    width: 'min(800px, 100%)',
  },
  label: {
    color: 'var(--ui-color-text-muted)',
    fontSize: '0.8rem',
    fontWeight: 500 as const,
    letterSpacing: '0.04em',
    marginBottom: '6px',
    textTransform: 'uppercase' as const,
  },
  box: {
    border: '1px solid var(--ui-color-border)',
    borderRadius: '0.4rem',
    overflow: 'hidden',
  },
  darkBox: {
    border: '1px solid var(--ui-color-border)',
    borderRadius: '0.4rem',
    overflow: 'hidden',
    background: 'var(--ui-color-text)',
    // Set color so neutral thumb (currentColor) is visible on dark background
    color: 'var(--ui-color-canvas)',
  },
  content: {
    padding: '1rem',
    lineHeight: 1.6,
  },
  row: {
    display: 'flex',
    gap: '8px',
    marginBottom: '8px',
  },
};

const meta: Meta<typeof ScrollArea> = {
  title: 'Components/ScrollArea',
  component: ScrollArea,
  tags: ['autodocs'],
  argTypes: {
    color: {
      description: 'Scrollbar thumb color.',
      control: { type: 'select' },
      options: ['primary', 'neutral'],
      table: {
        type: { summary: "'primary' | 'neutral'" },
        defaultValue: { summary: 'primary' },
      },
    },
    horizontal: {
      description: 'Whether to show a horizontal scrollbar in addition to vertical.',
      control: { type: 'boolean' },
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    autoHide: {
      description:
        'Auto-hide the scrollbar after 1500ms of inactivity. Shows immediately on scroll or when hovering the track.',
      control: { type: 'boolean' },
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
  },
};

export default meta;

// ---------------------------------------------------------------------------
// Basic
// ---------------------------------------------------------------------------

export const Basic: StoryObj<typeof ScrollArea> = {
  name: 'Basic',
  render: (args) => (
    <div style={storyStyles.box}>
      <ScrollArea style={{ height: 160 }} {...args}>
        <div style={storyStyles.content}>
          <p>{LONG_TEXT}</p>
        </div>
      </ScrollArea>
    </div>
  ),
  args: {
    color: 'primary',
    horizontal: false,
    autoHide: false,
  },
};

// ---------------------------------------------------------------------------
// Color
// ---------------------------------------------------------------------------

export const Color: StoryObj = {
  name: 'Color',
  render: () => (
    <div style={storyStyles.grid}>
      <div>
        <p style={storyStyles.label}>primary (default)</p>
        <div style={storyStyles.box}>
          <ScrollArea color="primary" style={{ height: 120 }}>
            <div style={storyStyles.content}>
              <p>{LONG_TEXT}</p>
            </div>
          </ScrollArea>
        </div>
      </div>
      <div>
        <p style={storyStyles.label}>neutral — light background</p>
        <div style={storyStyles.box}>
          <ScrollArea color="neutral" style={{ height: 120 }}>
            <div style={storyStyles.content}>
              <p>{LONG_TEXT}</p>
            </div>
          </ScrollArea>
        </div>
      </div>
      <div>
        <p style={storyStyles.label}>neutral — dark background</p>
        <div style={storyStyles.darkBox}>
          <ScrollArea color="neutral" style={{ height: 120 }}>
            <div style={{ ...storyStyles.content, color: 'var(--ui-color-canvas)' }}>
              <p>{LONG_TEXT}</p>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Horizontal
// ---------------------------------------------------------------------------

export const Horizontal: StoryObj = {
  name: 'Horizontal',
  render: () => (
    <div style={{ width: 'min(600px, 100%)' }}>
      <div style={storyStyles.box}>
        <ScrollArea horizontal style={{ width: '100%' }}>
          <div style={{ ...storyStyles.content, whiteSpace: 'nowrap' }}>
            <p>{WIDE_TEXT}</p>
          </div>
        </ScrollArea>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Both directions
// ---------------------------------------------------------------------------

export const BothDirections: StoryObj = {
  name: 'Both Directions',
  render: () => (
    <div style={{ width: 'min(600px, 100%)' }}>
      <div style={storyStyles.box}>
        <ScrollArea horizontal style={{ height: 160, width: '100%' }}>
          <div style={{ ...storyStyles.content, width: 1200 }}>
            <p>{LONG_TEXT}</p>
            <p>{LONG_TEXT}</p>
          </div>
        </ScrollArea>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// No overflow (scrollbar hidden)
// ---------------------------------------------------------------------------

export const NoOverflow: StoryObj = {
  name: 'No Overflow',
  render: () => (
    <div style={storyStyles.box}>
      <ScrollArea style={{ height: 160 }}>
        <div style={storyStyles.content}>
          <p>Short content — scrollbar should be invisible.</p>
        </div>
      </ScrollArea>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Auto-hide
// ---------------------------------------------------------------------------

export const AutoHide: StoryObj = {
  name: 'Auto-hide',
  render: () => (
    <div style={storyStyles.grid}>
      <div>
        <p style={storyStyles.label}>autoHide — scroll or hover the track to reveal</p>
        <div style={storyStyles.box}>
          <ScrollArea autoHide style={{ height: 160 }}>
            <div style={storyStyles.content}>
              <p>{LONG_TEXT}</p>
            </div>
          </ScrollArea>
        </div>
      </div>
      <div>
        <p style={storyStyles.label}>default (no auto-hide) — always visible at low opacity</p>
        <div style={storyStyles.box}>
          <ScrollArea style={{ height: 160 }}>
            <div style={storyStyles.content}>
              <p>{LONG_TEXT}</p>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Programmatic control
// ---------------------------------------------------------------------------

const ProgrammaticStory = () => {
  const scrollRef = useRef<ScrollAreaRef>(null);
  return (
    <div>
      <div style={storyStyles.row}>
        <Button
          size="small"
          variant="outlined"
          onClick={() => scrollRef.current?.scrollToEdge({ edge: 'top' })}
        >
          Scroll to top
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={() => scrollRef.current?.scrollToEdge({ edge: 'bottom' })}
        >
          Scroll to bottom
        </Button>
      </div>
      <div style={storyStyles.box}>
        <ScrollArea ref={scrollRef} style={{ height: 160 }}>
          <div style={storyStyles.content}>
            <p>{LONG_TEXT}</p>
            <p>{LONG_TEXT}</p>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export const Programmatic: StoryObj = {
  name: 'Programmatic Control',
  render: () => <ProgrammaticStory />,
};

// ---------------------------------------------------------------------------
// Interaction (E2E-P-01 / E2E-P-02)
// ---------------------------------------------------------------------------

import { expect, within } from 'storybook/test';

export const Interaction: StoryObj = {
  name: 'Interaction',
  render: () => (
    <div style={storyStyles.grid}>
      <div data-testid="vertical-scroll" style={{ ...storyStyles.box, overflow: 'hidden' }}>
        <ScrollArea color="primary" style={{ height: 120 }}>
          <div style={storyStyles.content}>
            <p>{LONG_TEXT}</p>
          </div>
        </ScrollArea>
      </div>
      <div data-testid="no-overflow" style={{ ...storyStyles.box, overflow: 'hidden' }}>
        <ScrollArea style={{ height: 120 }}>
          <div style={storyStyles.content}>
            <p>Short content.</p>
          </div>
        </ScrollArea>
      </div>
      <div data-testid="auto-hide" style={{ ...storyStyles.box, overflow: 'hidden' }}>
        <ScrollArea autoHide style={{ height: 120 }}>
          <div style={storyStyles.content}>
            <p>{LONG_TEXT}</p>
          </div>
        </ScrollArea>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // E2E-P-01: component renders, key structural elements visible
    const verticalContainer = canvas.getByTestId('vertical-scroll');
    void expect(verticalContainer).toBeInTheDocument();

    // E2E-P-01: data-color attribute is set on root
    const root = verticalContainer.querySelector('[data-color="primary"]');
    void expect(root).toBeInTheDocument();

    // E2E-P-01: no-overflow container renders without crashing
    const noOverflowContainer = canvas.getByTestId('no-overflow');
    void expect(noOverflowContainer).toBeInTheDocument();

    // E2E-P-02: autoHide=true sets data-auto-hide on root
    const autoHideContainer = canvas.getByTestId('auto-hide');
    void expect(autoHideContainer).toBeInTheDocument();
    const autoHideRoot = autoHideContainer.querySelector('[data-auto-hide]');
    void expect(autoHideRoot).toBeInTheDocument();

    // E2E-P-02: autoHide=false (default) does not set data-auto-hide
    const defaultRoot = verticalContainer.querySelector('[data-color="primary"]');
    void expect(defaultRoot?.hasAttribute('data-auto-hide')).toBe(false);
  },
};
