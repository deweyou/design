import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button, NavOverlay } from '@deweyou-design/react';

const meta: Meta = {
  title: 'Components/NavOverlay',
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <NavOverlay.Root>
      <NavOverlay.Trigger>
        <Button variant="outlined">Open navigation</Button>
      </NavOverlay.Trigger>
      <NavOverlay.Content>
        <a href="#">Overview</a>
        <a href="#">Components</a>
        <NavOverlay.CloseButton />
      </NavOverlay.Content>
    </NavOverlay.Root>
  ),
};
