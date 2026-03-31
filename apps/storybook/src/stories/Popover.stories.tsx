import type { Meta, StoryObj } from '@storybook/react';
import { useRef, useState } from 'react';

import { Button } from '@deweyou-ui/components/button';
import { Popover } from '@deweyou-ui/components/popover';
import { Text } from '@deweyou-ui/components/text';
import { SearchIcon } from '@deweyou-ui/icons/search';

const placementOptions = [
  'top',
  'bottom',
  'left',
  'right',
  'left-top',
  'left-bottom',
  'right-top',
  'right-bottom',
] as const;
const modeOptions = ['card', 'loose', 'pure'] as const;
const storyStyles = {
  card: {
    background: 'color-mix(in srgb, var(--ui-color-surface) 86%, var(--ui-color-canvas))',
    border: '1px solid var(--ui-color-border)',
    borderRadius: '18px',
    display: 'grid',
    gap: '12px',
    minWidth: 0,
    padding: '18px',
  },
  grid: {
    display: 'grid',
    gap: '14px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
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
  portalBox: {
    alignItems: 'center',
    background:
      'linear-gradient(160deg, color-mix(in srgb, var(--ui-color-brand-bg) 7%, var(--ui-color-canvas)), color-mix(in srgb, var(--ui-color-surface) 82%, var(--ui-color-canvas)))',
    border: '1px dashed color-mix(in srgb, var(--ui-color-border) 84%, transparent)',
    borderRadius: '18px',
    display: 'grid',
    minHeight: '148px',
    padding: '16px',
    placeItems: 'center',
  },
  row: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  },
} as const;

const meta = {
  title: 'Components/Popover',
  component: Popover,
  tags: ['autodocs'],
  argTypes: {
    content: {
      description: 'Content rendered inside the popover panel. Required.',
      control: false,
      table: {
        type: { summary: 'ReactNode' },
        defaultValue: { summary: '—' },
      },
    },
    trigger: {
      description:
        'Interaction that opens the popover. Accepts a single value or an array to combine triggers. `context-menu` is an explicit extension that does not change the base non-modal contract.',
      control: { type: 'select' },
      options: ['click', 'hover', 'focus', 'context-menu'],
      table: {
        type: {
          summary:
            "'click' | 'hover' | 'focus' | 'context-menu' | readonly ('click' | 'hover' | 'focus' | 'context-menu')[]",
        },
        defaultValue: { summary: 'click' },
      },
    },
    placement: {
      description:
        'Preferred placement relative to the trigger. Falls back automatically when there is insufficient space — content is never clipped.',
      control: { type: 'select' },
      options: [
        'top',
        'bottom',
        'left',
        'right',
        'left-top',
        'left-bottom',
        'right-top',
        'right-bottom',
      ],
      table: {
        type: {
          summary:
            "'top' | 'bottom' | 'left' | 'right' | 'left-top' | 'left-bottom' | 'right-top' | 'right-bottom'",
        },
        defaultValue: { summary: 'bottom' },
      },
    },
    shape: {
      description:
        'Corner shape of the panel. `rounded` aligns with the button small-radius scale (`0.4rem`).',
      control: { type: 'select' },
      options: ['rect', 'rounded'],
      table: {
        type: { summary: "'rect' | 'rounded'" },
        defaultValue: { summary: 'rounded' },
      },
    },
    mode: {
      description:
        'Panel padding and border treatment. `card` includes border, shadow, and arrow; `loose` applies more padding; `pure` strips all chrome. `shape` still applies in `pure` mode.',
      control: { type: 'select' },
      options: ['card', 'loose', 'pure'],
      table: {
        type: { summary: "'card' | 'loose' | 'pure'" },
        defaultValue: { summary: 'card' },
      },
    },
    visible: {
      description:
        'Controlled visibility. When provided, the popover is fully controlled by the parent. Use `onVisibleChange` to react to open/close events.',
      control: { type: 'boolean' },
      table: {
        type: { summary: 'boolean | undefined' },
        defaultValue: { summary: '—' },
      },
    },
    defaultVisible: {
      description: 'Initial visibility for uncontrolled usage.',
      control: { type: 'boolean' },
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    disabled: {
      description: 'When true, the popover cannot be opened by any trigger.',
      control: { type: 'boolean' },
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    offset: {
      description: 'Distance in pixels between the trigger element and the panel.',
      control: { type: 'number' },
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '8' },
      },
    },
    boundaryPadding: {
      description: 'Minimum distance in pixels the panel must maintain from the viewport edge.',
      control: { type: 'number' },
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '16' },
      },
    },
    onVisibleChange: {
      description:
        'Callback fired when the popover opens or closes. Receives the next `visible` state and a `details` object with `reason` and optionally the triggering `event`.',
      control: false,
      table: {
        type: { summary: '(visible: boolean, details: PopoverVisibilityChangeDetails) => void' },
        defaultValue: { summary: '—' },
      },
    },
    overlayClassName: {
      description: 'Additional CSS class applied to the popover panel overlay element.',
      control: { type: 'text' },
      table: {
        type: { summary: 'string | undefined' },
        defaultValue: { summary: '—' },
      },
    },
    overlayStyle: {
      description: 'Inline style applied to the popover panel overlay element.',
      control: false,
      table: {
        type: { summary: 'CSSProperties | undefined' },
        defaultValue: { summary: '—' },
      },
    },
    popupPortalContainer: {
      description:
        'DOM node to portal the panel into. Useful for local scroll containers or Shadow DOM contexts.',
      control: false,
      table: {
        type: { summary: 'HTMLElement | ShadowRoot | null | { current: ... }' },
        defaultValue: { summary: '—' },
      },
    },
    children: {
      description:
        'Trigger element. The popover attaches to this element for positioning and event handling.',
      control: false,
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
          'Popover displays floating content anchored to a trigger element. It supports four trigger types, eight placements with automatic fallback, three panel modes, and both controlled (`visible`) and uncontrolled (`defaultVisible`) usage. Built on Ark UI for state management, ARIA semantics, and focus handling. Import from `@deweyou-ui/components/popover`.',
      },
    },
  },
} satisfies Meta<typeof Popover>;

export default meta;

type Story = StoryObj<typeof meta>;

const basicContent = (
  <div style={{ display: 'grid', gap: '8px', maxWidth: '18rem' }}>
    <strong>Popover surface</strong>
    <Text color="slate" variant="caption">
      Default card mode keeps border, shadow, arrow, and non-modal behavior.
    </Text>
  </div>
);

const PlacementMatrix = () => {
  return (
    <div style={storyStyles.grid}>
      {placementOptions.map((placement) => (
        <article key={placement} style={storyStyles.card}>
          <strong>{placement}</strong>
          <div style={storyStyles.row}>
            <Popover content={basicContent} placement={placement}>
              <Button variant="outlined">{placement}</Button>
            </Popover>
          </div>
          <span style={storyStyles.meta}>
            Falls back automatically when the preferred placement has insufficient space — content
            is never clipped.
          </span>
        </article>
      ))}
    </div>
  );
};

const TriggerAndModeGallery = () => {
  const portalContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div style={storyStyles.matrix}>
      <article style={storyStyles.card}>
        <strong>Trigger matrix</strong>
        <div style={storyStyles.row}>
          <Popover content={basicContent}>
            <Button variant="outlined">click</Button>
          </Popover>
          <Popover content={basicContent} trigger={['hover', 'focus']}>
            <Button variant="outlined">hover + focus</Button>
          </Popover>
          <Popover content={basicContent} trigger={['click', 'context-menu']}>
            <Button variant="outlined">click + context-menu</Button>
          </Popover>
          <Popover content={basicContent} disabled>
            <Button disabled variant="outlined">
              disabled
            </Button>
          </Popover>
        </div>
        <span style={storyStyles.meta}>
          Default trigger is `click`. `context-menu` is an explicit extension and does not change
          the base non-modal contract.
        </span>
      </article>
      <article style={storyStyles.card}>
        <strong>Mode + shape matrix</strong>
        <div style={storyStyles.row}>
          {modeOptions.map((mode) => (
            <Popover
              key={mode}
              content={
                <div style={{ display: 'grid', gap: '8px' }}>
                  <strong>{mode}</strong>
                  <Text variant="caption">The same content with adjusted padding per mode.</Text>
                </div>
              }
              mode={mode}
              shape="rounded"
            >
              <Button variant="outlined">{mode}</Button>
            </Popover>
          ))}
        </div>
        <span style={storyStyles.meta}>
          `pure` still respects `shape`. Corner radius is determined solely by `shape`, not
          overridden by `mode`.
        </span>
      </article>
      <article style={storyStyles.card}>
        <strong>Custom portal + boundary padding</strong>
        <div ref={portalContainerRef} style={storyStyles.portalBox}>
          <Popover
            boundaryPadding={24}
            content={
              <div style={{ display: 'grid', gap: '8px', maxWidth: '16rem' }}>
                <strong>Local portal</strong>
                <Text variant="caption">
                  Panel mounted into a local container while retaining placement fallback, boundary
                  padding, and outside-press dismiss.
                </Text>
              </div>
            }
            offset={12}
            placement="right-bottom"
            popupPortalContainer={portalContainerRef.current ?? undefined}
            trigger={['click', 'focus']}
          >
            <Button>Open in portal box</Button>
          </Popover>
        </div>
        <span style={storyStyles.meta}>
          `popupPortalContainer` lets you mount the panel inside a local scroll region or clipping
          boundary.
        </span>
      </article>
    </div>
  );
};

const AccessibilityGallery = () => {
  const [visible, setVisible] = useState(false);

  return (
    <div style={storyStyles.grid}>
      <article style={storyStyles.card}>
        <strong>Controlled + explicit close</strong>
        <div style={storyStyles.row}>
          <Popover
            content={
              <div style={{ display: 'grid', gap: '10px', maxWidth: '18rem' }}>
                <Text bold variant="body">
                  Controlled review
                </Text>
                <Text color="slate" variant="caption">
                  Clicking inside the panel does not auto-dismiss — explicit actions handle that.
                </Text>
                <div style={storyStyles.row}>
                  <Button
                    size="small"
                    onClick={() => {
                      setVisible(false);
                    }}
                  >
                    Close
                  </Button>
                  <Button
                    size="small"
                    variant="ghost"
                    onClick={() => {
                      setVisible(true);
                    }}
                  >
                    Keep open
                  </Button>
                </div>
              </div>
            }
            onVisibleChange={(nextVisible, details) => {
              if (nextVisible || details.reason === 'explicit-action') {
                setVisible(nextVisible);
              }
            }}
            shape="rect"
            visible={visible}
          >
            <Button color="primary">{visible ? 'Open' : 'Open controlled'}</Button>
          </Popover>
          <Button
            size="small"
            variant="ghost"
            onClick={() => {
              setVisible((current) => !current);
            }}
          >
            Toggle state
          </Button>
        </div>
        <span style={storyStyles.meta}>
          Non-modal popover does not trap focus, but returns focus to the trigger on close.
        </span>
      </article>
      <article style={storyStyles.card}>
        <strong>Interactive content + multiple instances</strong>
        <div style={storyStyles.row}>
          <Popover
            content={
              <div style={{ display: 'grid', gap: '10px', maxWidth: '16rem' }}>
                <Text bold variant="body">
                  Quick search
                </Text>
                <input
                  aria-label="Search query"
                  placeholder="Search in popover"
                  style={{
                    background: 'var(--ui-color-canvas)',
                    border: '1px solid var(--ui-color-border)',
                    borderRadius: '10px',
                    color: 'var(--ui-color-text)',
                    padding: '8px 10px',
                  }}
                />
                <Button icon={<SearchIcon />} size="small">
                  Search
                </Button>
              </div>
            }
            trigger={['click', 'focus']}
          >
            <Button variant="outlined">Interactive content</Button>
          </Popover>
          <Popover content={basicContent}>
            <Button variant="outlined">Independent peer</Button>
          </Popover>
        </div>
        <span style={storyStyles.meta}>
          Multiple instances on the same page are independent by default; mutual exclusion requires
          explicit controlled state at the application layer.
        </span>
      </article>
    </div>
  );
};

export const ReviewMatrix: Story = {
  args: {
    content: basicContent,
  },
  render: () => {
    return (
      <div style={storyStyles.matrix}>
        <PlacementMatrix />
        <TriggerAndModeGallery />
        <AccessibilityGallery />
      </div>
    );
  },
};

export const ShapeReview: Story = {
  args: {
    content: basicContent,
  },
  render: () => {
    return (
      <div style={storyStyles.grid}>
        <article style={storyStyles.card}>
          <strong>rounded</strong>
          <div style={storyStyles.row}>
            <Popover content={basicContent} shape="rounded">
              <Button variant="outlined">rounded</Button>
            </Popover>
          </div>
          <span style={storyStyles.meta}>
            Aligns with the Button small-radius scale at `0.4rem`.
          </span>
        </article>
        <article style={storyStyles.card}>
          <strong>rect</strong>
          <div style={storyStyles.row}>
            <Popover content={basicContent} shape="rect">
              <Button variant="outlined">rect</Button>
            </Popover>
          </div>
          <span style={storyStyles.meta}>Rect mode has no corner radius.</span>
        </article>
      </div>
    );
  },
};
