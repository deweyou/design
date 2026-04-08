import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { TabContent, TabList, Tabs, TabTrigger } from '@deweyou-ui/components/tabs';

const storyStyles = {
  grid: {
    display: 'grid',
    gap: '24px',
    width: 'min(960px, 100%)',
  },
  card: {
    background: 'color-mix(in srgb, var(--ui-color-surface) 86%, var(--ui-color-canvas))',
    border: '1px solid var(--ui-color-border)',
    borderRadius: '18px',
    display: 'grid',
    gap: '16px',
    padding: '20px',
  },
  label: {
    color: 'var(--ui-color-text)',
    fontSize: '0.8rem',
    fontWeight: 500,
    letterSpacing: '0.04em',
    opacity: 0.5,
    textTransform: 'uppercase' as const,
  },
};

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  subcomponents: { TabList, TabTrigger, TabContent },
  argTypes: {
    variant: {
      description: 'Visual style of the active indicator.',
      control: { type: 'select' },
      options: ['line', 'bg'],
      table: {
        type: { summary: "'line' | 'bg'" },
        defaultValue: { summary: 'line' },
      },
    },
    color: {
      description: 'Semantic color for the active indicator and selected tab text.',
      control: { type: 'select' },
      options: ['neutral', 'primary'],
      table: {
        type: { summary: "'neutral' | 'primary'" },
        defaultValue: { summary: 'neutral' },
      },
    },
    size: {
      description: 'Size of the tab triggers.',
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      table: {
        type: { summary: "'small' | 'medium' | 'large'" },
        defaultValue: { summary: 'medium' },
      },
    },
    orientation: {
      description: 'Layout direction: horizontal (default) or vertical.',
      control: { type: 'select' },
      options: ['horizontal', 'vertical'],
      table: {
        type: { summary: "'horizontal' | 'vertical'" },
        defaultValue: { summary: 'horizontal' },
      },
    },
    overflowMode: {
      description: 'How to handle tabs that overflow the container width.',
      control: { type: 'select' },
      options: ['scroll', 'collapse'],
      table: {
        type: { summary: "'scroll' | 'collapse'" },
        defaultValue: { summary: 'scroll' },
      },
    },
    hideContent: {
      description: 'When true, no TabContent panels are rendered (tabs-only / routing mode).',
      control: { type: 'boolean' },
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    loopFocus: {
      description: 'Whether keyboard focus wraps around from last to first tab.',
      control: { type: 'boolean' },
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    defaultValue: {
      description: 'Initial selected tab value for uncontrolled usage.',
      control: { type: 'text' },
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '—' },
      },
    },
    value: {
      description: 'Controlled selected tab value. Use with `onValueChange`.',
      control: false,
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '—' },
      },
    },
    onValueChange: {
      description: 'Callback fired when the active tab changes.',
      control: false,
      table: {
        type: { summary: '(details: TabsValueChangeDetails) => void' },
        defaultValue: { summary: '—' },
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Tabs organises related content into separate panels with a list of triggers at the top (or side). Built on Ark UI for keyboard navigation, ARIA semantics, and focus management. Import from `@deweyou-ui/components/tabs`.\n\n**Composition**: `Tabs` → `TabList` → `TabTrigger`+; `TabContent`+ (one per trigger value).',
      },
    },
  },
};

export default meta;

// ---------------------------------------------------------------------------
// Story: Basic
// ---------------------------------------------------------------------------

export const Basic: StoryObj = {
  render: () => (
    <div style={storyStyles.grid}>
      <div style={storyStyles.card}>
        <div style={storyStyles.label}>line variant (default)</div>
        <Tabs defaultValue="overview">
          <TabList>
            <TabTrigger value="overview">Overview</TabTrigger>
            <TabTrigger value="settings">Settings</TabTrigger>
            <TabTrigger value="history">History</TabTrigger>
            <TabTrigger disabled value="disabled">
              Disabled
            </TabTrigger>
          </TabList>
          <TabContent value="overview">Overview content</TabContent>
          <TabContent value="settings">Settings content</TabContent>
          <TabContent value="history">History content</TabContent>
          <TabContent value="disabled">Disabled content</TabContent>
        </Tabs>
      </div>

      <div style={storyStyles.card}>
        <div style={storyStyles.label}>bg variant</div>
        <Tabs defaultValue="all" variant="bg">
          <TabList>
            <TabTrigger value="all">All</TabTrigger>
            <TabTrigger value="active">Active</TabTrigger>
            <TabTrigger value="closed">Closed</TabTrigger>
          </TabList>
          <TabContent value="all">All content</TabContent>
          <TabContent value="active">Active content</TabContent>
          <TabContent value="closed">Closed content</TabContent>
        </Tabs>
      </div>
    </div>
  ),
  name: 'Basic',
};

// ---------------------------------------------------------------------------
// Story: Playground (args-driven)
// ---------------------------------------------------------------------------

export const Playground: StoryObj<typeof Tabs> = {
  args: {
    defaultValue: 'tab1',
    variant: 'line',
    color: 'neutral',
    size: 'medium',
    orientation: 'horizontal',
  },
  render: (args) => (
    <Tabs {...args}>
      <TabList>
        <TabTrigger value="tab1">Tab One</TabTrigger>
        <TabTrigger value="tab2">Tab Two</TabTrigger>
        <TabTrigger value="tab3">Tab Three</TabTrigger>
      </TabList>
      <TabContent value="tab1">Content for tab one</TabContent>
      <TabContent value="tab2">Content for tab two</TabContent>
      <TabContent value="tab3">Content for tab three</TabContent>
    </Tabs>
  ),
};

// ---------------------------------------------------------------------------
// Story: Color
// ---------------------------------------------------------------------------

export const Color: StoryObj = {
  render: () => (
    <div style={storyStyles.grid}>
      {(['neutral', 'primary'] as const).map((color) => (
        <div key={`line-${color}`} style={storyStyles.card}>
          <div style={storyStyles.label}>line · {color}</div>
          <Tabs color={color} defaultValue="a">
            <TabList>
              <TabTrigger value="a">Alpha</TabTrigger>
              <TabTrigger value="b">Beta</TabTrigger>
              <TabTrigger value="c">Gamma</TabTrigger>
            </TabList>
            <TabContent value="a">Alpha content</TabContent>
            <TabContent value="b">Beta content</TabContent>
            <TabContent value="c">Gamma content</TabContent>
          </Tabs>
        </div>
      ))}
      {(['neutral', 'primary'] as const).map((color) => (
        <div key={`bg-${color}`} style={storyStyles.card}>
          <div style={storyStyles.label}>bg · {color}</div>
          <Tabs color={color} defaultValue="a" variant="bg">
            <TabList>
              <TabTrigger value="a">Alpha</TabTrigger>
              <TabTrigger value="b">Beta</TabTrigger>
              <TabTrigger value="c">Gamma</TabTrigger>
            </TabList>
            <TabContent value="a">Alpha content</TabContent>
            <TabContent value="b">Beta content</TabContent>
            <TabContent value="c">Gamma content</TabContent>
          </Tabs>
        </div>
      ))}
    </div>
  ),
  name: 'Color',
};

// ---------------------------------------------------------------------------
// Story: Size
// ---------------------------------------------------------------------------

export const Size: StoryObj = {
  render: () => (
    <div style={storyStyles.grid}>
      {(['small', 'medium', 'large'] as const).map((size) => (
        <div key={size} style={storyStyles.card}>
          <div style={storyStyles.label}>{size}</div>
          <Tabs defaultValue="a" size={size}>
            <TabList>
              <TabTrigger value="a">Alpha</TabTrigger>
              <TabTrigger value="b">Beta</TabTrigger>
              <TabTrigger value="c">Gamma</TabTrigger>
            </TabList>
            <TabContent value="a">Alpha content</TabContent>
            <TabContent value="b">Beta content</TabContent>
            <TabContent value="c">Gamma content</TabContent>
          </Tabs>
        </div>
      ))}
    </div>
  ),
  name: 'Size',
};

// ---------------------------------------------------------------------------
// Story: Vertical
// ---------------------------------------------------------------------------

export const Vertical: StoryObj = {
  render: () => (
    <div style={storyStyles.grid}>
      <div style={storyStyles.card}>
        <div style={storyStyles.label}>line · vertical</div>
        <Tabs defaultValue="profile" orientation="vertical">
          <TabList>
            <TabTrigger value="profile">Profile</TabTrigger>
            <TabTrigger value="security">Security</TabTrigger>
            <TabTrigger value="billing">Billing</TabTrigger>
            <TabTrigger disabled value="api">
              API (disabled)
            </TabTrigger>
          </TabList>
          <TabContent value="profile">Profile content</TabContent>
          <TabContent value="security">Security content</TabContent>
          <TabContent value="billing">Billing content</TabContent>
          <TabContent value="api">API content</TabContent>
        </Tabs>
      </div>

      <div style={storyStyles.card}>
        <div style={storyStyles.label}>bg · vertical</div>
        <Tabs defaultValue="profile" orientation="vertical" variant="bg">
          <TabList>
            <TabTrigger value="profile">Profile</TabTrigger>
            <TabTrigger value="security">Security</TabTrigger>
            <TabTrigger value="billing">Billing</TabTrigger>
          </TabList>
          <TabContent value="profile">Profile content</TabContent>
          <TabContent value="security">Security content</TabContent>
          <TabContent value="billing">Billing content</TabContent>
        </Tabs>
      </div>
    </div>
  ),
  name: 'Vertical',
};

// ---------------------------------------------------------------------------
// Story: Controlled
// ---------------------------------------------------------------------------

const ControlledExample = () => {
  const [active, setActive] = useState('overview');
  return (
    <div style={storyStyles.card}>
      <div style={storyStyles.label}>controlled — current: {active}</div>
      <Tabs value={active} onValueChange={({ value }) => setActive(value)}>
        <TabList>
          <TabTrigger value="overview">Overview</TabTrigger>
          <TabTrigger value="settings">Settings</TabTrigger>
          <TabTrigger value="history">History</TabTrigger>
        </TabList>
        <TabContent value="overview">Overview content</TabContent>
        <TabContent value="settings">Settings content</TabContent>
        <TabContent value="history">History content</TabContent>
      </Tabs>
    </div>
  );
};

export const Controlled: StoryObj = {
  render: () => <ControlledExample />,
  name: 'Controlled',
};

// ---------------------------------------------------------------------------
// Story: HideContent (tabs-only mode)
// ---------------------------------------------------------------------------

export const HideContent: StoryObj = {
  render: () => (
    <div style={storyStyles.grid}>
      <div style={storyStyles.card}>
        <div style={storyStyles.label}>hideContent — tabs only (horizontal)</div>
        <Tabs hideContent defaultValue="home">
          <TabList>
            <TabTrigger value="home">Home</TabTrigger>
            <TabTrigger value="docs">Docs</TabTrigger>
            <TabTrigger value="about">About</TabTrigger>
          </TabList>
        </Tabs>
        <p style={{ color: 'var(--ui-color-text)', fontSize: '0.875rem', margin: 0, opacity: 0.6 }}>
          onValueChange still fires on switch — suitable for routing.
        </p>
      </div>

      <div style={storyStyles.card}>
        <div style={storyStyles.label}>hideContent — tabs only (vertical)</div>
        <Tabs hideContent defaultValue="home" orientation="vertical">
          <TabList>
            <TabTrigger value="home">Home</TabTrigger>
            <TabTrigger value="docs">Docs</TabTrigger>
            <TabTrigger value="about">About</TabTrigger>
          </TabList>
        </Tabs>
      </div>
    </div>
  ),
  name: 'HideContent',
  parameters: {
    docs: {
      description: {
        story:
          '`hideContent` suppresses all `TabContent` panels. Suitable for routing scenarios where content is rendered by the router. `onValueChange` still fires normally.',
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Story: MenuItems (dropdown tab)
// ---------------------------------------------------------------------------

export const MenuItems: StoryObj = {
  render: () => (
    <div style={storyStyles.grid}>
      <div style={storyStyles.card}>
        <div style={storyStyles.label}>menuItems — horizontal (dropdown below)</div>
        <Tabs defaultValue="typescript">
          <TabList>
            <TabTrigger value="javascript">JavaScript</TabTrigger>
            <TabTrigger
              menuItems={[
                { value: 'typescript', label: 'TypeScript' },
                { value: 'tsx', label: 'TSX / React' },
                { value: 'dts', label: 'Declaration files' },
              ]}
              value="ts-group"
            >
              TypeScript
            </TabTrigger>
            <TabTrigger value="css">CSS</TabTrigger>
          </TabList>
          <TabContent value="javascript">JavaScript content</TabContent>
          <TabContent value="typescript">TypeScript content</TabContent>
          <TabContent value="tsx">TSX / React content</TabContent>
          <TabContent value="dts">Declaration file content</TabContent>
          <TabContent value="css">CSS content</TabContent>
        </Tabs>
      </div>

      <div style={storyStyles.card}>
        <div style={storyStyles.label}>menuItems — vertical (dropdown to right)</div>
        <Tabs defaultValue="overview" orientation="vertical">
          <TabList>
            <TabTrigger value="overview">Overview</TabTrigger>
            <TabTrigger
              menuItems={[
                { value: 'profile', label: 'Profile' },
                { value: 'security', label: 'Security' },
                { value: 'billing', label: 'Billing' },
              ]}
              value="account-group"
            >
              Account
            </TabTrigger>
          </TabList>
          <TabContent value="overview">Overview content</TabContent>
          <TabContent value="profile">Profile content</TabContent>
          <TabContent value="security">Security content</TabContent>
          <TabContent value="billing">Billing content</TabContent>
        </Tabs>
      </div>
    </div>
  ),
  name: 'MenuItems',
  parameters: {
    docs: {
      description: {
        story:
          'The `menuItems` prop on `TabTrigger` renders a dropdown menu instead of a plain trigger. The dropdown opens below in horizontal mode and to the right in vertical mode. Selecting a menu item updates the active tab and shows the matching content panel.',
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Story: Overflow Scroll
// ---------------------------------------------------------------------------

export const OverflowScroll: StoryObj = {
  render: () => (
    <div style={{ ...storyStyles.card, overflow: 'hidden', width: '480px' }}>
      <div style={storyStyles.label}>overflowMode="scroll" — 20 tabs in 480 px container</div>
      <Tabs defaultValue="t1">
        <TabList>
          {Array.from({ length: 20 }, (_, i) => (
            <TabTrigger key={i} value={`t${i + 1}`}>
              Tab {i + 1}
            </TabTrigger>
          ))}
        </TabList>
        {Array.from({ length: 20 }, (_, i) => (
          <TabContent key={i} value={`t${i + 1}`}>
            Content {i + 1}
          </TabContent>
        ))}
      </Tabs>
    </div>
  ),
  name: 'OverflowScroll',
  parameters: {
    docs: {
      description: {
        story:
          'Default `overflowMode="scroll"`: tabs scroll horizontally when they overflow. Gradient masks fade the edges; the mask is removed when scrolled to the boundary.',
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Story: Overflow Collapse
// ---------------------------------------------------------------------------

export const OverflowCollapse: StoryObj = {
  render: () => (
    <div style={{ ...storyStyles.card, overflow: 'hidden', width: '480px' }}>
      <div style={storyStyles.label}>overflowMode="collapse" — 20 tabs in 480 px container</div>
      <Tabs defaultValue="t1" overflowMode="collapse">
        <TabList>
          {Array.from({ length: 20 }, (_, i) => (
            <TabTrigger key={i} value={`t${i + 1}`}>
              Tab {i + 1}
            </TabTrigger>
          ))}
        </TabList>
        {Array.from({ length: 20 }, (_, i) => (
          <TabContent key={i} value={`t${i + 1}`}>
            Content {i + 1}
          </TabContent>
        ))}
      </Tabs>
    </div>
  ),
  name: 'OverflowCollapse',
  parameters: {
    docs: {
      description: {
        story:
          '`overflowMode="collapse"`: overflowing tabs are collected into a trailing "More" dropdown. When the active tab is in the overflow set, the "More" button takes on the active visual style. Selecting an item from the More menu shows a checkmark next to it.',
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Story: Overflow Collapse with nested sub-menu in More
// ---------------------------------------------------------------------------

export const OverflowCollapseWithSubMenu: StoryObj = {
  render: () => (
    <div style={{ ...storyStyles.card, overflow: 'hidden', width: '440px' }}>
      <div style={storyStyles.label}>
        overflowMode="collapse" — one overflow tab has sub-menu items
      </div>
      <Tabs defaultValue="dashboard" overflowMode="collapse">
        <TabList>
          <TabTrigger value="dashboard">Dashboard</TabTrigger>
          <TabTrigger value="analytics">Analytics</TabTrigger>
          <TabTrigger value="reports">Reports</TabTrigger>
          {/* This tab will overflow; it carries its own sub-items into the More dropdown */}
          <TabTrigger
            menuItems={[
              { value: 'profile', label: 'Profile' },
              { value: 'security', label: 'Security' },
              { value: 'billing', label: 'Billing' },
            ]}
            value="account-group"
          >
            Account
          </TabTrigger>
          <TabTrigger value="help">Help</TabTrigger>
        </TabList>
        <TabContent value="dashboard">Dashboard content</TabContent>
        <TabContent value="analytics">Analytics content</TabContent>
        <TabContent value="reports">Reports content</TabContent>
        <TabContent value="profile">Profile content</TabContent>
        <TabContent value="security">Security content</TabContent>
        <TabContent value="billing">Billing content</TabContent>
        <TabContent value="help">Help content</TabContent>
      </Tabs>
    </div>
  ),
  name: 'OverflowCollapseWithSubMenu',
  parameters: {
    docs: {
      description: {
        story:
          'When a `TabTrigger` with `menuItems` overflows into the More dropdown, it renders as a nested sub-menu (flyout to the right). Selecting a sub-item activates its content panel and marks both the sub-item (checkmark) and the "More" button as active.',
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Story: Interaction — play function tests
// ---------------------------------------------------------------------------

import { expect, userEvent, waitFor, within } from 'storybook/test';

export const Interaction: StoryObj = {
  name: 'Interaction',
  render: () => (
    <Tabs defaultValue="first">
      <TabList>
        <TabTrigger value="first">First</TabTrigger>
        <TabTrigger value="second">Second</TabTrigger>
        <TabTrigger value="third">Third</TabTrigger>
      </TabList>
      <TabContent value="first">First panel</TabContent>
      <TabContent value="second">Second panel</TabContent>
      <TabContent value="third">Third panel</TabContent>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // US1 uncontrolled: click second tab → second panel shown, aria-selected transfers
    const tabs = canvas.getAllByRole('tab');
    const [firstTab, secondTab] = tabs;

    expect(firstTab).toHaveAttribute('aria-selected', 'true');
    expect(secondTab).toHaveAttribute('aria-selected', 'false');

    await userEvent.click(secondTab!);

    await waitFor(() => {
      expect(secondTab).toHaveAttribute('aria-selected', 'true');
      expect(firstTab).toHaveAttribute('aria-selected', 'false');
    });

    const secondPanel = canvas.getByText('Second panel');
    expect(secondPanel).toBeVisible();

    // US2: focus first tab, ArrowRight → second tab gains focus, aria-selected follows
    await userEvent.click(firstTab!);
    firstTab!.focus();
    expect(document.activeElement).toBe(firstTab);

    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => {
      expect(document.activeElement).toBe(secondTab);
    });
  },
};
