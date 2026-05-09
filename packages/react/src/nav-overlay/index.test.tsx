// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vite-plus/test';

import { NavOverlay } from './index.tsx';

afterEach(() => {
  cleanup();
});

describe('NavOverlay', () => {
  it('renders the trigger element', () => {
    render(
      <NavOverlay.Root>
        <NavOverlay.Trigger>
          <button>Open nav</button>
        </NavOverlay.Trigger>
        <NavOverlay.Content>Navigation content</NavOverlay.Content>
      </NavOverlay.Root>,
    );
    expect(screen.getByRole('button', { name: 'Open nav' })).toBeTruthy();
  });

  it('content is not visible by default (lazyMount + unmountOnExit)', () => {
    render(
      <NavOverlay.Root>
        <NavOverlay.Trigger>
          <button>Open nav</button>
        </NavOverlay.Trigger>
        <NavOverlay.Content>Navigation content</NavOverlay.Content>
      </NavOverlay.Root>,
    );
    expect(screen.queryByText('Navigation content')).toBeNull();
  });

  it('exports Root, Trigger, Content, CloseButton as compound components', () => {
    expect(typeof NavOverlay.Root).toBe('function');
    expect(typeof NavOverlay.Trigger).toBe('function');
    expect(typeof NavOverlay.Content).toBe('function');
    expect(typeof NavOverlay.CloseButton).toBe('function');
  });

  it('accepts controlled open/onOpenChange props without error', () => {
    const onOpenChange = () => {};
    expect(() =>
      render(
        <NavOverlay.Root open={false} onOpenChange={onOpenChange}>
          <NavOverlay.Trigger>
            <button>Open</button>
          </NavOverlay.Trigger>
          <NavOverlay.Content>Content</NavOverlay.Content>
        </NavOverlay.Root>,
      ),
    ).not.toThrow();
  });
});
