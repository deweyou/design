// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { Select } from './index.tsx';

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

const options = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
];

describe('Select — default render', () => {
  it('renders a combobox trigger button', () => {
    render(
      <Select.Root placeholder="Pick a fruit">
        <Select.Trigger />
        <Select.Content>
          {options.map((o) => (
            <Select.Item key={o.value} value={o.value} label={o.label} />
          ))}
        </Select.Content>
      </Select.Root>,
    );
    const trigger = screen.getByRole('combobox');
    expect(trigger).toBeDefined();
  });

  it('shows placeholder when no value is selected', () => {
    render(
      <Select.Root placeholder="Pick a fruit">
        <Select.Trigger />
        <Select.Content>
          {options.map((o) => (
            <Select.Item key={o.value} value={o.value} label={o.label} />
          ))}
        </Select.Content>
      </Select.Root>,
    );
    expect(screen.getByText('Pick a fruit')).toBeDefined();
  });

  it('content is initially hidden', () => {
    render(
      <Select.Root placeholder="Pick a fruit">
        <Select.Trigger />
        <Select.Content>
          {options.map((o) => (
            <Select.Item key={o.value} value={o.value} label={o.label} />
          ))}
        </Select.Content>
      </Select.Root>,
    );
    expect(screen.queryByRole('listbox')).toBeNull();
  });
});

describe('Select — open behavior', () => {
  it('opens the listbox when trigger is clicked', async () => {
    render(
      <Select.Root placeholder="Pick a fruit">
        <Select.Trigger />
        <Select.Content>
          {options.map((o) => (
            <Select.Item key={o.value} value={o.value} label={o.label} />
          ))}
        </Select.Content>
      </Select.Root>,
    );
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeDefined();
    });
  });
});

describe('Select — onValueChange', () => {
  it('fires onValueChange with the selected value array when an item is clicked', async () => {
    const onValueChange = vi.fn();
    render(
      <Select.Root placeholder="Pick a fruit" onValueChange={onValueChange}>
        <Select.Trigger />
        <Select.Content>
          {options.map((o) => (
            <Select.Item key={o.value} value={o.value} label={o.label} />
          ))}
        </Select.Content>
      </Select.Root>,
    );
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);
    await waitFor(() => screen.getByRole('listbox'));
    const appleOption = screen.getByRole('option', { name: 'Apple' });
    fireEvent.click(appleOption);
    await waitFor(() => {
      expect(onValueChange).toHaveBeenCalledWith(['apple']);
    });
  });
});

describe('Select — disabled state', () => {
  it('trigger has aria-disabled when select is disabled', () => {
    render(
      <Select.Root disabled placeholder="Pick a fruit">
        <Select.Trigger />
        <Select.Content>
          {options.map((o) => (
            <Select.Item key={o.value} value={o.value} label={o.label} />
          ))}
        </Select.Content>
      </Select.Root>,
    );
    const trigger = screen.getByRole('combobox');
    expect(trigger.getAttribute('aria-disabled')).toBe('true');
  });
});
