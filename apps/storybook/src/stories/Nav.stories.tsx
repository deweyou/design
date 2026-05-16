import type { Meta, StoryObj } from '@storybook/react-vite';

import { Nav } from '@deweyou-design/react';

const meta: Meta = {
  title: 'Components/Nav',
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Nav.Root aria-label="Example navigation">
      <Nav.Link href="#" active>
        Overview
      </Nav.Link>
      <Nav.Link href="#">Components</Nav.Link>
      <Nav.Link href="#">Icons</Nav.Link>
    </Nav.Root>
  ),
};
