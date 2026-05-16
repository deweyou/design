import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { Field, Input } from '@deweyou-design/react';

const meta: Meta = {
  title: 'Components/Field',
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Field.Root id="field-story" hasDescription>
      <Field.Label>Name</Field.Label>
      <Field.Control>
        <Input placeholder="Deweyou" />
      </Field.Control>
      <Field.Description>Field connects label, description, and control ids.</Field.Description>
    </Field.Root>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Name');
    const description = canvas.getByText('Field connects label, description, and control ids.');

    await expect(input).toBeInTheDocument();
    await expect(input.getAttribute('aria-describedby')).toBe(description.id);
    await userEvent.type(input, ' Dewey');
    await expect(input).toHaveValue(' Dewey');
  },
};
