import type { Meta, StoryObj } from '@storybook/react-vite';

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
};
