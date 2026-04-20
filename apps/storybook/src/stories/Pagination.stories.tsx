import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Pagination } from '@deweyou-design/react/pagination';

const meta: Meta<typeof Pagination> = {
  title: 'Components/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  argTypes: {
    count: {
      description: 'Total number of items.',
      control: { type: 'number' },
      table: { type: { summary: 'number' } },
    },
    pageSize: {
      description: 'Number of items per page.',
      control: { type: 'number' },
      table: { type: { summary: 'number' }, defaultValue: { summary: '10' } },
    },
    siblingCount: {
      description: 'Number of page buttons to show on each side of the current page.',
      control: { type: 'number' },
      table: { type: { summary: 'number' }, defaultValue: { summary: '1' } },
    },
    onPageChange: {
      description: 'Callback fired when the current page changes.',
      control: false,
      table: { type: { summary: '(details: { page: number }) => void' } },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Pagination is a navigation control for paginated content. Built on Ark UI for ARIA semantics and keyboard accessibility. Import from `@deweyou-design/react/pagination`.',
      },
    },
  },
};

export default meta;

export const Default: StoryObj = {
  render: () => <Pagination count={100} pageSize={10} />,
};

export const Controlled: StoryObj = {
  render: () => {
    const [page, setPage] = useState(1);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Pagination
          count={100}
          pageSize={10}
          page={page}
          onPageChange={({ page: nextPage }) => setPage(nextPage)}
        />
        <p style={{ margin: 0, fontSize: '0.875rem' }}>Current page: {page}</p>
      </div>
    );
  },
};

export const ManyPages: StoryObj = {
  render: () => <Pagination count={500} pageSize={10} siblingCount={2} />,
};

export const LinkVariant: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Pagination count={100} pageSize={10} variant="link" />
      <Pagination count={500} pageSize={10} siblingCount={2} variant="link" defaultPage={5} />
    </div>
  ),
};

export const Interaction: StoryObj = {
  name: 'Interaction',
  render: () => <Pagination count={50} pageSize={10} defaultPage={1} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // E2E-I-01: page numbers are visible
    const pageOne = canvas.getByText('1');
    void expect(pageOne).toBeInTheDocument();

    // E2E-I-01: Prev and Next triggers exist
    const prevBtn = canvas.getByText('Prev');
    const nextBtn = canvas.getByText('Next');
    void expect(prevBtn).toBeInTheDocument();
    void expect(nextBtn).toBeInTheDocument();

    // E2E-I-02: clicking Next navigates to page 2
    await userEvent.click(nextBtn);
    await waitFor(() => {
      const pageTwo = canvas.getByText('2');
      void expect(pageTwo.closest('[data-selected]')).toBeTruthy();
    });

    // E2E-I-02: clicking a specific page navigates to it
    const pageFour = canvas.getByText('4');
    await userEvent.click(pageFour);
    await waitFor(() => {
      void expect(pageFour.closest('[data-selected]')).toBeTruthy();
    });

    // E2E-I-03: disabled state — on last page, Next should be disabled
    const pageFive = canvas.getByText('5');
    await userEvent.click(pageFive);
    await waitFor(() => {
      void expect(nextBtn.closest('[data-disabled]')).toBeTruthy();
    });
  },
};
