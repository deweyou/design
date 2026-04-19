// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test';

import { ScrollArea } from './index.tsx';

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

describe('ScrollArea', () => {
  it('renders viewport with content', () => {
    render(
      <ScrollArea.Root style={{ height: '200px' }}>
        <ScrollArea.Viewport>
          <div data-testid="inner-content">Scrollable content</div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical">
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>,
    );
    expect(screen.getByTestId('inner-content')).toBeTruthy();
  });

  it('scrollbar has correct data-orientation attribute', () => {
    render(
      <ScrollArea.Root style={{ height: '200px' }}>
        <ScrollArea.Viewport>
          <div>Content</div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical">
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>,
    );
    const scrollbars = document.querySelectorAll('[data-orientation]');
    const hasVertical = Array.from(scrollbars).some(
      (el) => el.getAttribute('data-orientation') === 'vertical',
    );
    expect(hasVertical).toBe(true);
  });

  it('renders compound components as functions', () => {
    expect(typeof ScrollArea.Root).toBe('function');
    expect(typeof ScrollArea.Viewport).toBe('function');
    expect(typeof ScrollArea.Scrollbar).toBe('function');
    expect(typeof ScrollArea.Thumb).toBe('function');
  });
});
