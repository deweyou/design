// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { Switch } from './index.tsx';

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

describe('Switch — default render', () => {
  it('renders a switch with accessible role', () => {
    render(<Switch>Notifications</Switch>);
    const sw = screen.getByRole('switch');
    expect(sw).toBeDefined();
  });

  it('renders label text when children provided', () => {
    render(<Switch>Notifications</Switch>);
    expect(screen.getByText('Notifications')).toBeDefined();
  });

  it('starts unchecked by default', () => {
    render(<Switch>Toggle</Switch>);
    const sw = screen.getByRole('switch');
    expect(sw.getAttribute('aria-checked')).toBe('false');
  });
});

describe('Switch — toggle callback', () => {
  it('fires onCheckedChange with true when toggled on', async () => {
    const onCheckedChange = vi.fn();
    render(
      <Switch defaultChecked={false} onCheckedChange={onCheckedChange}>
        Toggle
      </Switch>,
    );
    const sw = screen.getByRole('switch');
    fireEvent.click(sw);
    await waitFor(() => {
      expect(onCheckedChange).toHaveBeenCalledWith(true);
    });
  });

  it('fires onCheckedChange with false when toggled off', async () => {
    const onCheckedChange = vi.fn();
    render(
      <Switch defaultChecked={true} onCheckedChange={onCheckedChange}>
        Toggle
      </Switch>,
    );
    const sw = screen.getByRole('switch');
    fireEvent.click(sw);
    await waitFor(() => {
      expect(onCheckedChange).toHaveBeenCalledWith(false);
    });
  });
});

describe('Switch — disabled state', () => {
  it('has aria-disabled when disabled', () => {
    render(<Switch disabled>Disabled switch</Switch>);
    const sw = screen.getByRole('switch');
    expect(sw.getAttribute('aria-disabled')).toBe('true');
  });

  it('does not fire onCheckedChange when disabled and clicked', async () => {
    const onCheckedChange = vi.fn();
    render(
      <Switch disabled onCheckedChange={onCheckedChange}>
        Disabled
      </Switch>,
    );
    const sw = screen.getByRole('switch');
    fireEvent.click(sw);
    await waitFor(() => {
      expect(onCheckedChange).not.toHaveBeenCalled();
    });
  });
});
