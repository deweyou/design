import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { IconButton, Nav } from '@deweyou-design/react';
import { MenuApplicationIcon } from '@deweyou-design/react-icons';

const meta = {
  title: 'Components/Nav',
  component: Nav.Root,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Nav provides landmark navigation links and a responsive navigation pattern that keeps desktop overflow in a More menu and switches to a full-screen overlay at configured breakpoints.',
      },
    },
  },
  argTypes: {
    orientation: {
      control: { type: 'select' },
      options: ['horizontal', 'vertical'],
      table: { defaultValue: { summary: 'horizontal' } },
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      table: { defaultValue: { summary: 'md' } },
    },
  },
} satisfies Meta<typeof Nav.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

const responsiveItems = [
  { href: '#overview', label: 'Overview', value: 'overview' },
  { href: '#components', label: 'Components', value: 'components' },
  { href: '#icons', label: 'Icons', value: 'icons' },
  { external: true, href: 'https://storybook.js.org', label: 'Storybook', value: 'storybook' },
] as const;

const longResponsiveItems = Array.from({ length: 32 }, (_, index) => ({
  label: `Section ${index + 1}`,
  value: `section-${index + 1}`,
}));

const BasicNavDemo = (args: Story['args'] = {}) => {
  const [activeValue, setActiveValue] = useState('overview');

  return (
    <Nav.Root aria-label="Example navigation" {...args}>
      {responsiveItems.slice(0, 3).map((item) => (
        <Nav.Link
          key={item.value}
          active={activeValue === item.value}
          href={item.href}
          onClick={(event) => {
            event.preventDefault();
            setActiveValue(item.value);
          }}
        >
          {item.label}
        </Nav.Link>
      ))}
    </Nav.Root>
  );
};

const ResponsiveNavDemo = () => {
  const [activeValue, setActiveValue] = useState('components');

  return (
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
      value={activeValue}
      onSelect={({ event, value }) => {
        event?.preventDefault();
        setActiveValue(value);
      }}
    />
  );
};

const ResponsiveLongListDemo = () => {
  const [activeValue, setActiveValue] = useState('section-1');

  return (
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
      value={activeValue}
      onSelect={({ value }) => {
        setActiveValue(value);
      }}
    />
  );
};

export const Default: Story = {
  args: {
    orientation: 'horizontal',
    size: 'md',
  },
  render: (args) => <BasicNavDemo {...args} />,
};

export const Responsive: Story = {
  render: () => <ResponsiveNavDemo />,
};

export const ResponsiveLongList: Story = {
  parameters: {
    fullViewport: true,
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  render: () => <ResponsiveLongListDemo />,
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
    await userEvent.click(canvas.getByRole('link', { name: 'Icons' }));
    await expect(canvas.getByRole('link', { name: 'Icons' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  },
};
