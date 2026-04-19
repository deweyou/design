import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { RadioGroup } from '@deweyou-design/react/radio-group';

const meta: Meta = {
  title: 'Components/RadioGroup',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'RadioGroup allows users to select one option from a set. Built on Ark UI for ARIA semantics, keyboard navigation, and focus management. Compose with `RadioGroup.Root` and `RadioGroup.Item`. Import from `@deweyou-design/react/radio-group`.',
      },
    },
  },
};

export default meta;

export const Default: StoryObj = {
  render: () => (
    <RadioGroup.Root defaultValue="b">
      <RadioGroup.Item value="a">Option A</RadioGroup.Item>
      <RadioGroup.Item value="b">Option B</RadioGroup.Item>
      <RadioGroup.Item value="c">Option C</RadioGroup.Item>
    </RadioGroup.Root>
  ),
};

export const Variants: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <p style={{ marginBottom: '8px', fontSize: '0.875rem', color: 'var(--ui-color-text)' }}>
          Vertical (default)
        </p>
        <RadioGroup.Root defaultValue="a">
          <RadioGroup.Item value="a">Apple</RadioGroup.Item>
          <RadioGroup.Item value="b">Banana</RadioGroup.Item>
          <RadioGroup.Item value="c">Cherry</RadioGroup.Item>
        </RadioGroup.Root>
      </div>
      <div>
        <p style={{ marginBottom: '8px', fontSize: '0.875rem', color: 'var(--ui-color-text)' }}>
          Horizontal
        </p>
        <RadioGroup.Root defaultValue="a" orientation="horizontal">
          <RadioGroup.Item value="a">Apple</RadioGroup.Item>
          <RadioGroup.Item value="b">Banana</RadioGroup.Item>
          <RadioGroup.Item value="c">Cherry</RadioGroup.Item>
        </RadioGroup.Root>
      </div>
    </div>
  ),
};

export const States: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <p style={{ marginBottom: '8px', fontSize: '0.875rem', color: 'var(--ui-color-text)' }}>
          Default
        </p>
        <RadioGroup.Root>
          <RadioGroup.Item value="a">Option A</RadioGroup.Item>
          <RadioGroup.Item value="b">Option B</RadioGroup.Item>
        </RadioGroup.Root>
      </div>
      <div>
        <p style={{ marginBottom: '8px', fontSize: '0.875rem', color: 'var(--ui-color-text)' }}>
          Disabled (group)
        </p>
        <RadioGroup.Root disabled defaultValue="a">
          <RadioGroup.Item value="a">Option A</RadioGroup.Item>
          <RadioGroup.Item value="b">Option B</RadioGroup.Item>
        </RadioGroup.Root>
      </div>
      <div>
        <p style={{ marginBottom: '8px', fontSize: '0.875rem', color: 'var(--ui-color-text)' }}>
          Partially disabled
        </p>
        <RadioGroup.Root defaultValue="a">
          <RadioGroup.Item value="a">Option A</RadioGroup.Item>
          <RadioGroup.Item value="b" disabled>
            Option B (disabled)
          </RadioGroup.Item>
        </RadioGroup.Root>
      </div>
    </div>
  ),
};

const ControlledDemo = () => {
  const [value, setValue] = useState('a');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <RadioGroup.Root value={value} onValueChange={setValue}>
        <RadioGroup.Item value="a">Option A</RadioGroup.Item>
        <RadioGroup.Item value="b">Option B</RadioGroup.Item>
        <RadioGroup.Item value="c">Option C</RadioGroup.Item>
      </RadioGroup.Root>
      <p style={{ fontSize: '0.875rem', color: 'var(--ui-color-text)' }}>
        Selected: <strong>{value}</strong>
      </p>
    </div>
  );
};

export const Controlled: StoryObj = {
  render: () => <ControlledDemo />,
};

export const Interaction: StoryObj = {
  name: 'Interaction',
  render: () => (
    <RadioGroup.Root defaultValue="a">
      <RadioGroup.Item value="a">Option A</RadioGroup.Item>
      <RadioGroup.Item value="b">Option B</RadioGroup.Item>
      <RadioGroup.Item value="c">Option C</RadioGroup.Item>
    </RadioGroup.Root>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const group = canvas.getByRole('radiogroup');
    void expect(group).toBeInTheDocument();

    const radios = canvas.getAllByRole('radio');
    void expect(radios[0].getAttribute('aria-checked')).toBe('true');
    void expect(radios[1].getAttribute('aria-checked')).toBe('false');

    await userEvent.click(radios[1]);
    await waitFor(() => {
      void expect(radios[1].getAttribute('aria-checked')).toBe('true');
      void expect(radios[0].getAttribute('aria-checked')).toBe('false');
    });
  },
};
