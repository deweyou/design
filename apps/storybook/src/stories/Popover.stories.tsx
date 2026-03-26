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
  title: 'Internal review/Popover',
  component: Popover,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Internal review matrix for the Popover public API, including the direct `@deweyou-ui/components/popover` subpath contract, trigger combinations, eight-way placement vocabulary, boundary fallback, custom portal containers, non-modal keyboard behavior, and panel style modes.',
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
          <span style={storyStyles.meta}>首选位置不足时应自动回退，而不是直接裁切内容。</span>
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
          默认 trigger = click；context-menu 为显式扩展，不改变基础非模态契约。
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
                  <Text variant="caption">同一内容在不同 mode 下调整内边距。</Text>
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
          `pure` 仍然读取 `shape`；是否圆角只由 `shape` 决定，不由 `mode` 覆盖。
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
                  浮层挂到局部容器中，仍然保留位置回退、安全边距和外部关闭能力。
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
          `popupPortalContainer` 用于评审局部滚动区和裁切边界中的挂载行为。
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
                  面板内点击默认不会自动关闭，交给显式动作处理。
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
          非模态 Popover 不做焦点陷阱，但关闭后应把焦点返还给 trigger。
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
          同页多个实例默认互不影响；只在业务层显式受控时才做互斥。
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
          <span style={storyStyles.meta}>与 Button 的小圆角对齐，圆角值为 `0.4rem`。</span>
        </article>
        <article style={storyStyles.card}>
          <strong>rect</strong>
          <div style={storyStyles.row}>
            <Popover content={basicContent} shape="rect">
              <Button variant="outlined">rect</Button>
            </Popover>
          </div>
          <span style={storyStyles.meta}>直角模式不再保留额外圆角。</span>
        </article>
      </div>
    );
  },
};
