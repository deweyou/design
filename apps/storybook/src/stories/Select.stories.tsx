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
    <Select.Root placeholder="Select a fruit">
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
        <Select.Root placeholder="Select a fruit">
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
        <Select.Root placeholder="Select fruits" multiple>
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
        <Select.Root placeholder="No selection">
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
        <Select.Root defaultValue={['banana']}>
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
        <Select.Root disabled placeholder="Cannot select">
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
      <Select.Root value={value} onValueChange={setValue} placeholder="Select a fruit">
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
    <Select.Root placeholder="Select a fruit">
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
    void expect(trigger).toBeInTheDocument();
    void expect(document.querySelector('[role="listbox"]')).not.toBeInTheDocument();

    await userEvent.click(trigger);
    await waitFor(() => {
      void expect(document.querySelector('[role="listbox"]')).toBeInTheDocument();
    });

    const option = Array.from(document.querySelectorAll('[role="option"]')).find((el) =>
      el.textContent?.includes('Banana'),
    ) as HTMLElement | undefined;
    void expect(option).toBeDefined();
    if (option) await userEvent.click(option);

    await waitFor(() => {
      void expect(document.querySelector('[role="listbox"]')).not.toBeInTheDocument();
    });

    await userEvent.click(trigger);
    await waitFor(() => {
      void expect(document.querySelector('[role="listbox"]')).toBeInTheDocument();
    });
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      void expect(document.querySelector('[role="listbox"]')).not.toBeInTheDocument();
    });
  },
};
