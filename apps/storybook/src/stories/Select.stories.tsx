import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Select } from '@deweyou-design/react/select';

const fruits = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'mango', label: 'Mango' },
  { value: 'orange', label: 'Orange' },
];

const meta: Meta = {
  title: 'Components/Select',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Select is a dropdown picker. Built on Ark UI for ARIA combobox semantics and keyboard navigation. Import from `@deweyou-design/react/select`.',
      },
    },
  },
};

export default meta;

export const Default: StoryObj = {
  render: () => (
    <Select.Root label="Fruit" name="default-fruit" placeholder="Select a fruit">
      <Select.Trigger />
      <Select.Content>
        {fruits.map((f) => (
          <Select.Item key={f.value} value={f.value} label={f.label} />
        ))}
      </Select.Content>
    </Select.Root>
  ),
};

export const Variants: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--ui-color-text)' }}>Single</p>
        <Select.Root label="Single fruit" name="single-fruit" placeholder="Select a fruit">
          <Select.Trigger />
          <Select.Content>
            {fruits.map((f) => (
              <Select.Item key={f.value} value={f.value} label={f.label} />
            ))}
          </Select.Content>
        </Select.Root>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--ui-color-text)' }}>Multiple</p>
        <Select.Root
          label="Multiple fruits"
          multiple
          name="multiple-fruits"
          placeholder="Select fruits"
        >
          <Select.Trigger />
          <Select.Content>
            {fruits.map((f) => (
              <Select.Item key={f.value} value={f.value} label={f.label} />
            ))}
          </Select.Content>
        </Select.Root>
      </div>
    </div>
  ),
};

export const States: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <p style={{ margin: '0 0 6px', fontSize: '0.875rem', color: 'var(--ui-color-text)' }}>
          Placeholder
        </p>
        <Select.Root label="Placeholder fruit" name="placeholder-fruit" placeholder="No selection">
          <Select.Trigger />
          <Select.Content>
            {fruits.map((f) => (
              <Select.Item key={f.value} value={f.value} label={f.label} />
            ))}
          </Select.Content>
        </Select.Root>
      </div>
      <div>
        <p style={{ margin: '0 0 6px', fontSize: '0.875rem', color: 'var(--ui-color-text)' }}>
          With initial value
        </p>
        <Select.Root defaultValue={['banana']} label="Initial fruit" name="initial-fruit">
          <Select.Trigger />
          <Select.Content>
            {fruits.map((f) => (
              <Select.Item key={f.value} value={f.value} label={f.label} />
            ))}
          </Select.Content>
        </Select.Root>
      </div>
      <div>
        <p style={{ margin: '0 0 6px', fontSize: '0.875rem', color: 'var(--ui-color-text)' }}>
          Disabled
        </p>
        <Select.Root
          disabled
          label="Disabled fruit"
          name="disabled-fruit"
          placeholder="Cannot select"
        >
          <Select.Trigger />
          <Select.Content>
            {fruits.map((f) => (
              <Select.Item key={f.value} value={f.value} label={f.label} />
            ))}
          </Select.Content>
        </Select.Root>
      </div>
    </div>
  ),
};

const ControlledDemo = () => {
  const [value, setValue] = useState<string[]>([]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <Select.Root
        label="Controlled fruit"
        name="controlled-fruit"
        value={value}
        onValueChange={setValue}
        placeholder="Select a fruit"
      >
        <Select.Trigger />
        <Select.Content>
          {fruits.map((f) => (
            <Select.Item key={f.value} value={f.value} label={f.label} />
          ))}
        </Select.Content>
      </Select.Root>
      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--ui-color-text)' }}>
        Selected: <strong>{value.length > 0 ? value.join(', ') : '(none)'}</strong>
      </p>
    </div>
  );
};

export const Controlled: StoryObj = { render: () => <ControlledDemo /> };

export const Interaction: StoryObj = {
  name: 'Interaction',
  render: () => (
    <Select.Root label="Interaction fruit" name="interaction-fruit" placeholder="Select a fruit">
      <Select.Trigger />
      <Select.Content>
        {fruits.map((f) => (
          <Select.Item key={f.value} value={f.value} label={f.label} />
        ))}
      </Select.Content>
    </Select.Root>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const trigger = canvas.getByRole('combobox');
    await expect(trigger).toBeInTheDocument();
    // Check trigger state rather than listbox DOM presence — avoids racing
    // against the 160 ms selectExit animation that keeps the element in the
    // DOM until animationend fires (which may not fire in Playwright).
    await expect(trigger.getAttribute('data-state')).toBe('closed');

    await userEvent.click(trigger);
    await waitFor(async () => {
      await expect(trigger.getAttribute('data-state')).toBe('open');
    });

    // Scope option query to the listbox to avoid stale elements from other stories.
    const listbox = document.querySelector('[role="listbox"]') as HTMLElement;
    await expect(listbox).toBeInTheDocument();
    const option = within(listbox).getByText('Banana');
    await expect(option).toBeInTheDocument();
    await userEvent.click(option);

    await waitFor(async () => {
      await expect(trigger.getAttribute('data-state')).toBe('closed');
    });

    await userEvent.click(trigger);
    await waitFor(async () => {
      await expect(trigger.getAttribute('data-state')).toBe('open');
    });
    await userEvent.keyboard('{Escape}');
    await waitFor(async () => {
      await expect(trigger.getAttribute('data-state')).toBe('closed');
    });
  },
};
