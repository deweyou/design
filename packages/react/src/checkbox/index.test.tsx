// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { Checkbox } from './index.tsx';

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

describe('Checkbox — default render', () => {
  it('renders a checkbox with accessible role', () => {
    render(<Checkbox>Accept terms</Checkbox>);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDefined();
  });

  it('renders label text when children provided', () => {
    render(<Checkbox>Accept terms</Checkbox>);
    expect(screen.getByText('Accept terms')).toBeDefined();
  });

  it('accepts className and style props', () => {
    render(
      <Checkbox className="custom-class" style={{ color: 'red' }}>
        Label
      </Checkbox>,
    );
    expect(screen.getByText('Label')).toBeDefined();
  });
});

describe('Checkbox — onCheckedChange', () => {
  it('fires onCheckedChange with true when clicked from unchecked', async () => {
    const onCheckedChange = vi.fn();
    render(
      <Checkbox defaultChecked={false} onCheckedChange={onCheckedChange}>
        Toggle me
      </Checkbox>,
    );
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    await waitFor(() => {
      expect(onCheckedChange).toHaveBeenCalledWith(true);
    });
  });

  it('fires onCheckedChange with false when clicked from checked', async () => {
    const onCheckedChange = vi.fn();
    render(
      <Checkbox defaultChecked={true} onCheckedChange={onCheckedChange}>
        Toggle me
      </Checkbox>,
    );
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    await waitFor(() => {
      expect(onCheckedChange).toHaveBeenCalledWith(false);
    });
  });
});

describe('Checkbox — disabled state', () => {
  it('has aria-disabled when disabled', () => {
    render(<Checkbox disabled>Disabled</Checkbox>);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox.getAttribute('aria-disabled')).toBe('true');
  });

  it('does not fire onCheckedChange when disabled and clicked', async () => {
    const onCheckedChange = vi.fn();
    render(
      <Checkbox disabled onCheckedChange={onCheckedChange}>
        Disabled
      </Checkbox>,
    );
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    await waitFor(() => {
      expect(onCheckedChange).not.toHaveBeenCalled();
    });
  });
});

describe('Checkbox — indeterminate state', () => {
  it('reflects indeterminate in aria-checked', () => {
    render(<Checkbox indeterminate>Indeterminate</Checkbox>);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox.getAttribute('aria-checked')).toBe('mixed');
  });
});
