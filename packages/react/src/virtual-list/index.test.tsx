// @vitest-environment jsdom

import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test';

import { VirtualList, type VirtualListRef } from './index.tsx';

beforeEach(() => {
  if (!window.IntersectionObserver) {
    window.IntersectionObserver = class IntersectionObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof IntersectionObserver;
  }
});

afterEach(() => {
  cleanup();
});

describe('VirtualList', () => {
  it('renders only the visible items plus overscan', () => {
    render(
      <VirtualList
        count={100}
        estimateSize={() => 20}
        height={100}
        overscan={1}
        renderItem={({ index }) => <div>Row {index}</div>}
      />,
    );

    expect(screen.getByText('Row 0')).toBeDefined();
    expect(screen.getByText('Row 5')).toBeDefined();
    expect(screen.queryByText('Row 20')).toBeNull();
  });

  it('updates the visible range when scrolling', () => {
    render(
      <VirtualList
        count={100}
        estimateSize={() => 20}
        height={100}
        overscan={0}
        renderItem={({ index }) => <div>Row {index}</div>}
      />,
    );

    const viewport = screen.getByTestId('virtual-list-viewport');
    Object.defineProperty(viewport, 'scrollTop', { configurable: true, value: 200 });
    fireEvent.scroll(viewport);

    expect(screen.getByText('Row 10')).toBeDefined();
    expect(screen.queryByText('Row 0')).toBeNull();
  });

  it('renders ScrollArea-aligned scrollbar parts', () => {
    render(
      <VirtualList
        count={20}
        estimateSize={() => 20}
        height={100}
        renderItem={({ index }) => <div>Row {index}</div>}
      />,
    );

    expect(document.querySelector('[data-orientation="vertical"]')).toBeTruthy();
  });

  it('scrolls to a specific item and offset through the ref api', () => {
    const ref = createRef<VirtualListRef>();
    render(
      <VirtualList
        ref={ref}
        count={100}
        estimateSize={() => 20}
        height={100}
        renderItem={({ index }) => <div>Row {index}</div>}
      />,
    );

    ref.current?.scrollToIndex(12);
    expect(screen.getByTestId('virtual-list-viewport').scrollTop).toBe(240);

    ref.current?.scrollToOffset(88);
    expect(screen.getByTestId('virtual-list-viewport').scrollTop).toBe(88);
  });
});
