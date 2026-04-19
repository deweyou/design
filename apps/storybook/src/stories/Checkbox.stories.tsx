import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Checkbox } from '@deweyou-design/react/checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  argTypes: {
    checked: {
      description: 'Controlled checked state.',
      control: { type: 'boolean' },
      table: { type: { summary: 'boolean | undefined' } },
    },
    defaultChecked: {
      description: 'Initial checked state for uncontrolled usage.',
      control: { type: 'boolean' },
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    onCheckedChange: {
      description: 'Callback fired when the checked state changes.',
      control: false,
      table: { type: { summary: '(checked: boolean) => void' } },
    },
    disabled: {
      description: 'When true, the checkbox is non-interactive.',
      control: { type: 'boolean' },
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    indeterminate: {
      description: 'When true, displays an indeterminate (mixed) state.',
      control: { type: 'boolean' },
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    children: {
      description: 'Label text rendered next to the control.',
      control: { type: 'text' },
      table: { type: { summary: 'ReactNode' } },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Checkbox is a form control for boolean or tri-state (indeterminate) selection. Built on Ark UI for ARIA semantics and keyboard accessibility. Import from `@deweyou-design/react/checkbox`.',
      },
    },
  },
};

export default meta;

export const Default: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Checkbox>Subscribe to newsletter</Checkbox>
      <Checkbox defaultChecked>Accept terms and conditions</Checkbox>
    </div>
  ),
};

export const Variants: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <Checkbox />
        <Checkbox defaultChecked />
        <Checkbox indeterminate />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Checkbox>Unchecked with label</Checkbox>
        <Checkbox defaultChecked>Checked with label</Checkbox>
        <Checkbox indeterminate>Indeterminate with label</Checkbox>
      </div>
    </div>
  ),
};

export const States: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <Checkbox>Default (unchecked)</Checkbox>
      <Checkbox defaultChecked>Default (checked)</Checkbox>
      <Checkbox indeterminate>Indeterminate</Checkbox>
      <Checkbox disabled>Disabled (unchecked)</Checkbox>
      <Checkbox disabled defaultChecked>
        Disabled (checked)
      </Checkbox>
    </div>
  ),
};

const ControlledDemo = () => {
  const [checked, setChecked] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <Checkbox checked={checked} onCheckedChange={setChecked}>
        Controlled: {checked ? 'ON' : 'OFF'}
      </Checkbox>
      <button onClick={() => setChecked((v) => !v)} style={{ alignSelf: 'flex-start' }}>
        Toggle externally
      </button>
    </div>
  );
};

export const Controlled: StoryObj = {
  render: () => <ControlledDemo />,
};

export const Interaction: StoryObj = {
  name: 'Interaction',
  render: () => <Checkbox data-testid="cb">Click to toggle</Checkbox>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const checkbox = canvas.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox.getAttribute('aria-checked')).toBe('false');

    await userEvent.click(checkbox);
    await waitFor(() => {
      expect(checkbox.getAttribute('aria-checked')).toBe('true');
    });

    await userEvent.click(checkbox);
    await waitFor(() => {
      expect(checkbox.getAttribute('aria-checked')).toBe('false');
    });
  },
};
