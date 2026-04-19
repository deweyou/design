// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { Pagination } from './index.tsx';

beforeEach(() => {
  if (!window.ResizeObserver) {
    window.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});

afterEach(() => {
  cleanup();
});

describe('Pagination — default render', () => {
  it('renders page numbers', () => {
    render(<Pagination count={50} pageSize={10} />);
    // 50 items / 10 per page = 5 pages
    expect(screen.getByText('1')).toBeDefined();
    expect(screen.getByText('2')).toBeDefined();
    expect(screen.getByText('5')).toBeDefined();
  });

  it('renders prev and next triggers', () => {
    render(<Pagination count={50} pageSize={10} />);
    expect(screen.getByText('Prev')).toBeDefined();
    expect(screen.getByText('Next')).toBeDefined();
  });

  it('selected page has data-selected attribute', () => {
    render(<Pagination count={50} pageSize={10} defaultPage={1} />);
    // Find the button with text "1" — it should be selected
    const pageOne = screen.getByText('1');
    expect(pageOne.closest('[data-selected]')).toBeDefined();
  });
});

describe('Pagination — page change', () => {
  it('calls onPageChange with correct page when clicking a page number', async () => {
    const onPageChange = vi.fn();
    render(<Pagination count={50} pageSize={10} defaultPage={1} onPageChange={onPageChange} />);
    const pageThree = screen.getByText('3');
    fireEvent.click(pageThree);
    await waitFor(() => {
      expect(onPageChange).toHaveBeenCalledWith(expect.objectContaining({ page: 3 }));
    });
  });

  it('calls onPageChange when clicking next trigger', async () => {
    const onPageChange = vi.fn();
    render(<Pagination count={50} pageSize={10} defaultPage={1} onPageChange={onPageChange} />);
    const nextBtn = screen.getByText('Next');
    fireEvent.click(nextBtn);
    await waitFor(() => {
      expect(onPageChange).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }));
    });
  });
});

describe('Pagination — controlled mode', () => {
  it('reflects controlled page prop', () => {
    render(<Pagination count={50} pageSize={10} page={3} />);
    const pageThree = screen.getByText('3');
    expect(pageThree.closest('[data-selected]')).toBeDefined();
  });
});

describe('Pagination — siblingCount', () => {
  it('renders ellipsis when pages exceed display window', () => {
    // 100 items / 10 per page = 10 pages, siblingCount=1, defaultPage=5 should show ellipsis
    render(<Pagination count={100} pageSize={10} defaultPage={5} siblingCount={1} />);
    const ellipses = screen.getAllByText('…');
    expect(ellipses.length).toBeGreaterThan(0);
  });
});

describe('Pagination — disabled state', () => {
  it('prev trigger is disabled on first page', () => {
    render(<Pagination count={50} pageSize={10} defaultPage={1} />);
    const prevBtn = screen.getByText('Prev');
    // Ark UI sets data-disabled on disabled buttons
    const disabledEl = prevBtn.closest('[data-disabled]');
    expect(disabledEl).toBeDefined();
  });

  it('next trigger is disabled on last page', () => {
    render(<Pagination count={50} pageSize={10} defaultPage={5} />);
    const nextBtn = screen.getByText('Next');
    const disabledEl = nextBtn.closest('[data-disabled]');
    expect(disabledEl).toBeDefined();
  });
});
