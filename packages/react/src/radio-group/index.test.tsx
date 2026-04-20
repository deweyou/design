// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { RadioGroup } from './index.tsx';

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

describe('RadioGroup — default render', () => {
  it('renders a radiogroup with accessible role', () => {
    render(
      <RadioGroup.Root>
        <RadioGroup.Item value="a">Option A</RadioGroup.Item>
        <RadioGroup.Item value="b">Option B</RadioGroup.Item>
      </RadioGroup.Root>,
    );
    expect(screen.getByRole('radiogroup')).toBeDefined();
  });

  it('renders all radio items', () => {
    render(
      <RadioGroup.Root>
        <RadioGroup.Item value="a">Option A</RadioGroup.Item>
        <RadioGroup.Item value="b">Option B</RadioGroup.Item>
      </RadioGroup.Root>,
    );
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(2);
  });

  it('renders item labels', () => {
    render(
      <RadioGroup.Root>
        <RadioGroup.Item value="a">Option A</RadioGroup.Item>
      </RadioGroup.Root>,
    );
    expect(screen.getByText('Option A')).toBeDefined();
  });
});

describe('RadioGroup — onValueChange', () => {
  it('fires onValueChange with the selected value when an item is clicked', async () => {
    const onValueChange = vi.fn();
    render(
      <RadioGroup.Root onValueChange={onValueChange}>
        <RadioGroup.Item value="a">Option A</RadioGroup.Item>
        <RadioGroup.Item value="b">Option B</RadioGroup.Item>
      </RadioGroup.Root>,
    );
    const radios = screen.getAllByRole('radio');
    fireEvent.click(radios[1]);
    await waitFor(() => {
      expect(onValueChange).toHaveBeenCalledWith('b');
    });
  });
});

describe('RadioGroup — disabled state', () => {
  it('root disabled: all items have aria-disabled', () => {
    render(
      <RadioGroup.Root disabled>
        <RadioGroup.Item value="a">Option A</RadioGroup.Item>
        <RadioGroup.Item value="b">Option B</RadioGroup.Item>
      </RadioGroup.Root>,
    );
    const radios = screen.getAllByRole('radio');
    radios.forEach((radio) => {
      expect(radio.getAttribute('aria-disabled')).toBe('true');
    });
  });

  it('item-level disabled: only that item has aria-disabled', () => {
    render(
      <RadioGroup.Root>
        <RadioGroup.Item value="a">Option A</RadioGroup.Item>
        <RadioGroup.Item value="b" disabled>
          Option B
        </RadioGroup.Item>
      </RadioGroup.Root>,
    );
    const radios = screen.getAllByRole('radio');
    expect(radios[0].getAttribute('aria-disabled')).not.toBe('true');
    expect(radios[1].getAttribute('aria-disabled')).toBe('true');
  });
});

describe('RadioGroup — value state', () => {
  it('controlled value: selected item has data-state checked', () => {
    render(
      <RadioGroup.Root value="b">
        <RadioGroup.Item value="a">Option A</RadioGroup.Item>
        <RadioGroup.Item value="b">Option B</RadioGroup.Item>
      </RadioGroup.Root>,
    );
    const items = document.querySelectorAll('[data-scope="radio-group"][data-part="item"]');
    expect(items[0].getAttribute('data-state')).toBe('unchecked');
    expect(items[1].getAttribute('data-state')).toBe('checked');
  });
});
