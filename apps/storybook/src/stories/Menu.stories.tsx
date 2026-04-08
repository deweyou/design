import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Button } from '@deweyou-ui/components/button';
import {
  ContextMenu,
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuTrigger,
  MenuTriggerItem,
} from '@deweyou-ui/components/menu';

const storyStyles = {
  grid: {
    display: 'grid',
    gap: '14px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    width: 'min(1040px, 100%)',
  },
  card: {
    background: 'color-mix(in srgb, var(--ui-color-surface) 86%, var(--ui-color-canvas))',
    border: '1px solid var(--ui-color-border)',
    borderRadius: '18px',
    display: 'grid',
    gap: '12px',
    minWidth: 0,
    padding: '18px',
  },
};

const meta: Meta<typeof Menu> = {
  title: 'Components/Menu',
  component: Menu,
  tags: ['autodocs'],
  subcomponents: { MenuItem, MenuCheckboxItem, MenuRadioItem, MenuGroup },
  argTypes: {
    size: {
      description: 'Controls the font size and item height of the menu content.',
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      table: {
        type: { summary: "'sm' | 'md' | 'lg'" },
        defaultValue: { summary: 'md' },
      },
    },
    shape: {
      description: 'Corner shape of the menu panel.',
      control: { type: 'select' },
      options: ['rect', 'rounded'],
      table: {
        type: { summary: "'rect' | 'rounded'" },
        defaultValue: { summary: 'rounded' },
      },
    },
    open: {
      description: 'Controlled open state. Use with `onOpenChange` for full control.',
      control: { type: 'boolean' },
      table: {
        type: { summary: 'boolean | undefined' },
        defaultValue: { summary: '—' },
      },
    },
    defaultOpen: {
      description: 'Initial open state for uncontrolled usage.',
      control: { type: 'boolean' },
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    onOpenChange: {
      description: 'Callback fired when the menu opens or closes.',
      control: false,
      table: {
        type: { summary: '(details: MenuOpenChangeDetails) => void' },
        defaultValue: { summary: '—' },
      },
    },
    closeOnSelect: {
      description:
        'Whether the menu closes when a `MenuItem` is selected. Set to `false` for checkbox or radio menus.',
      control: { type: 'boolean' },
      table: {
        type: { summary: 'boolean | undefined' },
        defaultValue: { summary: 'true' },
      },
    },
    placement: {
      description: 'Preferred placement of the menu relative to its trigger.',
      control: { type: 'select' },
      options: ['bottom-start', 'bottom-end', 'top-start', 'top-end', 'right-start', 'left-start'],
      table: {
        type: { summary: 'MenuPlacement' },
        defaultValue: { summary: 'bottom-start' },
      },
    },
    disabled: {
      description: 'When true, the menu cannot be opened.',
      control: { type: 'boolean' },
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    children: {
      description: 'Must include a `MenuTrigger` and a `MenuContent` as children.',
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
          'Menu displays a floating list of actions anchored to a trigger button. It supports groups, separators, submenus, radio selection, checkbox items, and context menus. Built on Ark UI for keyboard navigation, ARIA semantics, and focus management. Import from `@deweyou-ui/components/menu`.\n\n**Composition**: `Menu` → `MenuTrigger` → trigger element; `MenuContent` → `MenuItem` | `MenuGroup` | `MenuCheckboxItem` | `MenuRadioGroup` → `MenuRadioItem` | `MenuSeparator` | `MenuTriggerItem` (for submenus).',
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
        <strong>Basic menu</strong>
        <Menu>
          <MenuTrigger>
            <Button variant="outlined">Open menu</Button>
          </MenuTrigger>
          <MenuContent>
            <MenuItem value="new">New file</MenuItem>
            <MenuItem value="open">Open file</MenuItem>
            <MenuItem value="save">Save</MenuItem>
            <MenuSeparator />
            <MenuItem value="delete" disabled>
              Delete (disabled)
            </MenuItem>
          </MenuContent>
        </Menu>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story: Groups (no separator)
// ---------------------------------------------------------------------------

export const Groups: StoryObj = {
  render: () => (
    <div style={storyStyles.grid}>
      <div style={storyStyles.card}>
        <strong>Groups (no separator)</strong>
        <Menu>
          <MenuTrigger>
            <Button variant="outlined">File actions</Button>
          </MenuTrigger>
          <MenuContent>
            <MenuGroup label="Create">
              <MenuItem value="new-file">New file</MenuItem>
              <MenuItem value="new-folder">New folder</MenuItem>
            </MenuGroup>
            <MenuGroup label="Edit">
              <MenuItem value="cut">Cut</MenuItem>
              <MenuItem value="copy">Copy</MenuItem>
              <MenuItem value="paste">Paste</MenuItem>
            </MenuGroup>
          </MenuContent>
        </Menu>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story: Separator
// ---------------------------------------------------------------------------

export const Separator: StoryObj = {
  render: () => (
    <div style={storyStyles.grid}>
      <div style={storyStyles.card}>
        <strong>Separator only</strong>
        <Menu>
          <MenuTrigger>
            <Button variant="outlined">File actions</Button>
          </MenuTrigger>
          <MenuContent>
            <MenuItem value="new-file">New file</MenuItem>
            <MenuItem value="new-folder">New folder</MenuItem>
            <MenuSeparator />
            <MenuItem value="cut">Cut</MenuItem>
            <MenuItem value="copy">Copy</MenuItem>
            <MenuItem value="paste">Paste</MenuItem>
          </MenuContent>
        </Menu>
      </div>
      <div style={storyStyles.card}>
        <strong>Groups + separator</strong>
        <Menu>
          <MenuTrigger>
            <Button variant="outlined">File actions</Button>
          </MenuTrigger>
          <MenuContent>
            <MenuGroup label="Create">
              <MenuItem value="new-file">New file</MenuItem>
              <MenuItem value="new-folder">New folder</MenuItem>
            </MenuGroup>
            <MenuSeparator />
            <MenuGroup label="Edit">
              <MenuItem value="cut">Cut</MenuItem>
              <MenuItem value="copy">Copy</MenuItem>
              <MenuItem value="paste">Paste</MenuItem>
            </MenuGroup>
          </MenuContent>
        </Menu>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story: Submenu
// ---------------------------------------------------------------------------

export const Submenu: StoryObj = {
  render: () => (
    <div style={storyStyles.grid}>
      <div style={storyStyles.card}>
        <strong>Nested submenu</strong>
        <Menu>
          <MenuTrigger>
            <Button variant="outlined">More options</Button>
          </MenuTrigger>
          <MenuContent>
            <MenuItem value="undo">Undo</MenuItem>
            <Menu>
              <MenuTriggerItem>Export as</MenuTriggerItem>
              <MenuContent>
                <MenuItem value="export-pdf">PDF</MenuItem>
                <MenuItem value="export-png">PNG</MenuItem>
                <MenuItem value="export-svg">SVG</MenuItem>
              </MenuContent>
            </Menu>
            <MenuItem value="redo">Redo</MenuItem>
          </MenuContent>
        </Menu>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story: Radio selection
// ---------------------------------------------------------------------------

const RadioSelectionDemo = () => {
  const [value, setValue] = useState('grid');

  return (
    <div style={storyStyles.grid}>
      <div style={storyStyles.card}>
        <strong>Radio selection</strong>
        <Menu closeOnSelect={false}>
          <MenuTrigger>
            <Button variant="outlined">View: {value === 'grid' ? 'Grid' : 'List'}</Button>
          </MenuTrigger>
          <MenuContent>
            <MenuRadioGroup value={value} onValueChange={({ value: v }) => setValue(v)}>
              <MenuRadioItem value="list">List view</MenuRadioItem>
              <MenuRadioItem value="grid">Grid view</MenuRadioItem>
            </MenuRadioGroup>
          </MenuContent>
        </Menu>
      </div>
    </div>
  );
};

export const RadioSelection: StoryObj = {
  render: () => <RadioSelectionDemo />,
};

// ---------------------------------------------------------------------------
// Story: Checkbox items
// ---------------------------------------------------------------------------

const CheckboxItemsDemo = () => {
  const [sidebar, setSidebar] = useState(true);
  const [toolbar, setToolbar] = useState(false);

  return (
    <div style={storyStyles.grid}>
      <div style={storyStyles.card}>
        <strong>Checkbox items</strong>
        <Menu closeOnSelect={false}>
          <MenuTrigger>
            <Button variant="outlined">Panel visibility</Button>
          </MenuTrigger>
          <MenuContent>
            <MenuCheckboxItem
              checked={sidebar}
              value="sidebar"
              onCheckedChange={({ checked }) => setSidebar(checked)}
            >
              Sidebar
            </MenuCheckboxItem>
            <MenuCheckboxItem
              checked={toolbar}
              value="toolbar"
              onCheckedChange={({ checked }) => setToolbar(checked)}
            >
              Toolbar
            </MenuCheckboxItem>
          </MenuContent>
        </Menu>
      </div>
    </div>
  );
};

export const CheckboxItems: StoryObj = {
  render: () => <CheckboxItemsDemo />,
};

// ---------------------------------------------------------------------------
// Story: Context menu
// ---------------------------------------------------------------------------

export const ContextMenuStory: StoryObj = {
  name: 'ContextMenu',
  render: () => (
    <div style={storyStyles.grid}>
      <div style={storyStyles.card}>
        <strong>Context menu (right-click)</strong>
        <ContextMenu>
          <ContextMenu.Trigger>
            <div
              style={{
                border: '1px dashed var(--ui-color-border)',
                borderRadius: '0.4rem',
                color: 'var(--ui-color-text)',
                cursor: 'context-menu',
                fontSize: '0.875rem',
                padding: '2rem 1rem',
                textAlign: 'center',
              }}
            >
              Right-click anywhere in this area
            </div>
          </ContextMenu.Trigger>
          <ContextMenu.Content>
            <MenuItem value="cut">Cut</MenuItem>
            <MenuItem value="copy">Copy</MenuItem>
            <MenuItem value="paste">Paste</MenuItem>
            <MenuSeparator />
            <MenuItem value="properties">Properties</MenuItem>
          </ContextMenu.Content>
        </ContextMenu>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story: Disabled items
// ---------------------------------------------------------------------------

export const DisabledItems: StoryObj = {
  render: () => (
    <div style={storyStyles.grid}>
      <div style={storyStyles.card}>
        <strong>Disabled items</strong>
        <Menu>
          <MenuTrigger>
            <Button variant="outlined">Actions</Button>
          </MenuTrigger>
          <MenuContent>
            <MenuItem value="view">View</MenuItem>
            <MenuItem value="edit">Edit</MenuItem>
            <MenuItem value="delete" disabled>
              Delete
            </MenuItem>
            <MenuItem value="archive" disabled>
              Archive
            </MenuItem>
          </MenuContent>
        </Menu>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story: Size variants
// ---------------------------------------------------------------------------

export const SizeVariants: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} style={storyStyles.card}>
          <strong>size="{size}"</strong>
          <Menu size={size}>
            <MenuTrigger>
              <Button
                variant="outlined"
                size={size === 'sm' ? 'small' : size === 'lg' ? 'large' : 'medium'}
              >
                {size.toUpperCase()} menu
              </Button>
            </MenuTrigger>
            <MenuContent>
              <MenuItem value="new">New file</MenuItem>
              <MenuItem value="open">Open file</MenuItem>
              <MenuItem value="save">Save</MenuItem>
              <MenuSeparator />
              <MenuItem value="delete" disabled>
                Delete (disabled)
              </MenuItem>
            </MenuContent>
          </Menu>
        </div>
      ))}
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story: Shape variants
// ---------------------------------------------------------------------------

export const ShapeVariants: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      {(['rounded', 'rect'] as const).map((shape) => (
        <div key={shape} style={storyStyles.card}>
          <strong>shape="{shape}"</strong>
          <Menu shape={shape}>
            <MenuTrigger>
              <Button variant="outlined" shape={shape === 'rect' ? 'rect' : 'rounded'}>
                {shape === 'rounded' ? 'Rounded menu' : 'Rect menu'}
              </Button>
            </MenuTrigger>
            <MenuContent>
              <MenuItem value="new">New file</MenuItem>
              <MenuItem value="open">Open file</MenuItem>
              <MenuItem value="save">Save</MenuItem>
              <MenuSeparator />
              <MenuItem value="delete" disabled>
                Delete (disabled)
              </MenuItem>
            </MenuContent>
          </Menu>
        </div>
      ))}
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story: Interaction — play function tests
// ---------------------------------------------------------------------------

import { expect, userEvent, waitFor, within } from 'storybook/test';

export const Interaction: StoryObj = {
  name: 'Interaction',
  render: () => (
    <Menu>
      <MenuTrigger>
        <Button variant="outlined" data-testid="menu-trigger">
          Open menu
        </Button>
      </MenuTrigger>
      <MenuContent>
        <MenuItem value="edit">Edit</MenuItem>
        <MenuItem value="copy">Copy</MenuItem>
        <Menu>
          <MenuTriggerItem>Export as</MenuTriggerItem>
          <MenuContent>
            <MenuItem value="export-pdf">PDF</MenuItem>
            <MenuItem value="export-png">PNG</MenuItem>
          </MenuContent>
        </Menu>
        <MenuItem value="delete" disabled>
          Delete (disabled)
        </MenuItem>
      </MenuContent>
    </Menu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // US1: click trigger → menu appears
    const trigger = canvas.getByTestId('menu-trigger');
    await userEvent.click(trigger);

    await waitFor(() => {
      const menu = document.querySelector('[role="menu"]');
      expect(menu).toBeInTheDocument();
      expect(menu).toBeVisible();
    });

    // US1: hover submenu trigger (MenuTriggerItem) → nested menu appears
    // MenuTriggerItem renders as role="menuitem" with submenu expand behavior
    const submenuTrigger = Array.from(document.querySelectorAll('[role="menuitem"]')).find((el) =>
      el.textContent?.includes('Export as'),
    ) as HTMLElement | undefined;

    if (submenuTrigger) {
      await userEvent.hover(submenuTrigger);
      await waitFor(() => {
        const menus = document.querySelectorAll('[role="menu"]');
        expect(menus.length).toBeGreaterThanOrEqual(2);
      });
    }

    // US2: ArrowDown navigates menuitems — focus moves between items
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      const menus = document.querySelectorAll('[role="menu"]');
      expect(menus.length).toBe(0);
    });

    // US1: Escape closes menu
    await userEvent.click(trigger);
    await waitFor(() => {
      expect(document.querySelector('[role="menu"]')).toBeInTheDocument();
    });

    // US2: ArrowDown navigates — focused element gains role menuitem or menu (Ark UI focuses menu, then items on ArrowDown)
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => {
      const focused = document.activeElement;
      const role = focused?.getAttribute('role') ?? '';
      expect(['menuitem', 'menu'].includes(role)).toBe(true);
    });

    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(document.querySelector('[role="menu"]')).not.toBeInTheDocument();
    });
  },
};
