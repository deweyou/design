import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Switch } from '@deweyou-design/react/switch';

const meta: Meta<typeof Switch> = {
  title: 'Components/Switch',
  component: Switch,
  tags: ['autodocs'],
  argTypes: {
    checked: { description: 'Controlled checked state.', control: { type: 'boolean' } },
    defaultChecked: { description: 'Initial checked state.', control: { type: 'boolean' } },
    onCheckedChange: { description: 'Callback on change.', control: false },
    disabled: { description: 'Non-interactive when true.', control: { type: 'boolean' } },
    children: { description: 'Label text.', control: { type: 'text' } },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Switch is a toggle control for binary on/off states. Built on Ark UI for ARIA `role="switch"` and keyboard accessibility. Import from `@deweyou-design/react/switch`.',
      },
    },
  },
};

export default meta;

export const Default: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Switch>Enable notifications</Switch>
      <Switch defaultChecked>Dark mode</Switch>
    </div>
  ),
};

export const Variants: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Switch>Without label off</Switch>
      <Switch defaultChecked>Without label on</Switch>
    </div>
  ),
};

export const States: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Switch>Off (default)</Switch>
      <Switch defaultChecked>On</Switch>
      <Switch disabled>Disabled off</Switch>
      <Switch disabled defaultChecked>
        Disabled on
      </Switch>
    </div>
  ),
};

const ControlledDemo = () => {
  const [checked, setChecked] = useState(false);
  return (
    <Switch checked={checked} onCheckedChange={setChecked}>
      Feature flag: {checked ? 'Enabled' : 'Disabled'}
    </Switch>
  );
};

export const Controlled: StoryObj = { render: () => <ControlledDemo /> };

export const Interaction: StoryObj = {
  name: 'Interaction',
  render: () => <Switch>Toggle me</Switch>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const sw = canvas.getByRole('switch');
    expect(sw).toBeInTheDocument();
    expect(sw.getAttribute('aria-checked')).toBe('false');

    await userEvent.click(sw);
    await waitFor(() => {
      expect(sw.getAttribute('aria-checked')).toBe('true');
    });

    await userEvent.click(sw);
    await waitFor(() => {
      expect(sw.getAttribute('aria-checked')).toBe('false');
    });
  },
};
