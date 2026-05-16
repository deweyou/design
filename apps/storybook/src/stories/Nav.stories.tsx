import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { IconButton, Nav } from '@deweyou-design/react';
import { MenuApplicationIcon } from '@deweyou-design/react-icons';

const meta: Meta = {
  title: 'Components/Nav',
};

export default meta;
type Story = StoryObj;

const responsiveItems = [
  { href: '#overview', label: 'Overview', value: 'overview' },
  { href: '#components', label: 'Components', value: 'components' },
  { href: '#icons', label: 'Icons', value: 'icons' },
  { external: true, href: 'https://storybook.js.org', label: 'Storybook', value: 'storybook' },
] as const;

const longResponsiveItems = Array.from({ length: 32 }, (_, index) => ({
  href: `#section-${index + 1}`,
  label: `Section ${index + 1}`,
  value: `section-${index + 1}`,
}));

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

export const Responsive: Story = {
  render: () => (
    <Nav.Responsive
      aria-label="Responsive navigation"
      collapseTrigger={
        <IconButton
          aria-label="Open navigation"
          icon={<MenuApplicationIcon />}
          size="sm"
          variant="ghost"
        />
      }
      items={responsiveItems}
      value="components"
    />
  ),
};

export const ResponsiveLongList: Story = {
  parameters: {
    fullViewport: true,
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  render: () => (
    <Nav.Responsive
      aria-label="Long responsive navigation"
      collapseTrigger={
        <IconButton
          aria-label="Open navigation"
          icon={<MenuApplicationIcon />}
          size="sm"
          variant="ghost"
        />
      }
      items={longResponsiveItems}
      value="section-1"
    />
  ),
};

export const Interaction: Story = {
  name: 'Interaction',
  render: Responsive.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('navigation', { name: 'Responsive navigation' })).toBeVisible();
    await expect(canvas.getByRole('link', { name: 'Components' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(canvas.getByRole('link', { name: /Storybook/ })).toHaveAttribute(
      'target',
      '_blank',
    );
  },
};
