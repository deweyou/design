// @vitest-environment jsdom

import '../test-setup';

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vite-plus/test';

import { NumberInput, type NumberInputProps } from './index.tsx';

afterEach(() => {
  cleanup();
});

describe('NumberInput field semantics', () => {
  it('exposes placeholder and clearable as public props', () => {
    expectTypeOf<NumberInputProps['placeholder']>().toEqualTypeOf<string | undefined>();
    expectTypeOf<NumberInputProps['clearable']>().toEqualTypeOf<boolean | undefined>();

    render(<NumberInput placeholder="Enter quantity" />);

    expect(screen.getByRole('spinbutton')).toHaveAttribute('placeholder', 'Enter quantity');
    expect(screen.queryByRole('button', { name: 'Clear value' })).toBeNull();
  });

  it('connects the label, hint, and error to the spinbutton', () => {
    render(
      <NumberInput
        id="quantity"
        label="Quantity"
        hint="Choose between 1 and 10."
        error="Quantity is required."
        required
      />,
    );

    const input = screen.getByRole('spinbutton', { name: 'Quantity' });
    expect(input).toHaveAttribute('id', 'quantity');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'quantity-description quantity-error');
    expect(input).toBeRequired();
    expect(screen.getByText('Quantity is required.')).toHaveAttribute('role', 'alert');
  });

  it('generates a usable field id when no id is provided', () => {
    render(<NumberInput label="Guests" hint="Include yourself." />);

    const input = screen.getByRole('spinbutton', { name: 'Guests' });
    expect(input.id).toMatch(/^number-input-field-/);
    expect(screen.getByText('Include yourself.')).toHaveAttribute('id', `${input.id}-description`);
    for (const trigger of screen.getAllByRole('button')) {
      expect(trigger).toHaveAttribute('aria-controls', input.id);
    }
  });
});

describe('NumberInput value behavior', () => {
  it('increments and decrements an uncontrolled value', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<NumberInput defaultValue="2" onValueChange={onValueChange} />);

    const input = screen.getByRole('spinbutton');
    await user.click(screen.getByRole('button', { name: 'Increase value' }));
    await waitFor(() => {
      expect(input).toHaveAttribute('aria-valuenow', '3');
      expect(onValueChange).toHaveBeenLastCalledWith({ value: '3', valueAsNumber: 3 });
    });

    await user.click(screen.getByRole('button', { name: 'Decrease value' }));
    await waitFor(() => {
      expect(input).toHaveAttribute('aria-valuenow', '2');
      expect(onValueChange).toHaveBeenLastCalledWith({ value: '2', valueAsNumber: 2 });
    });
  });

  it('supports Arrow Up and Arrow Down stepping', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<NumberInput defaultValue="4" step={2} onValueChange={onValueChange} />);

    const input = screen.getByRole('spinbutton');
    await user.click(input);
    await user.keyboard('{ArrowUp}');
    expect(onValueChange).toHaveBeenLastCalledWith({ value: '6', valueAsNumber: 6 });

    await user.keyboard('{ArrowDown}');
    expect(onValueChange).toHaveBeenLastCalledWith({ value: '4', valueAsNumber: 4 });
  });

  it('does not replace a controlled value until its owner updates it', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<NumberInput value="5" onValueChange={onValueChange} />);

    const input = screen.getByRole('spinbutton');
    await user.click(screen.getByRole('button', { name: 'Increase value' }));

    expect(onValueChange).toHaveBeenCalledWith({ value: '6', valueAsNumber: 6 });
    expect(input).toHaveValue('5');
  });

  it('commits the value on Enter', async () => {
    const user = userEvent.setup();
    const onValueCommit = vi.fn();
    render(<NumberInput defaultValue="8" onValueCommit={onValueCommit} />);

    await user.click(screen.getByRole('spinbutton'));
    await user.keyboard('{Enter}');
    expect(onValueCommit).toHaveBeenCalledWith({ value: '8', valueAsNumber: 8 });
  });
});

describe('NumberInput constraints and formatting', () => {
  it('disables step buttons at the configured boundaries', () => {
    render(<NumberInput defaultValue="10" min={0} max={10} />);

    expect(screen.getByRole('button', { name: 'Increase value' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Decrease value' })).toBeEnabled();
  });

  it('uses precision as the default fraction digit range', () => {
    render(<NumberInput defaultValue="1.5" locale="en-US" precision={2} />);
    expect(screen.getByRole('spinbutton')).toHaveValue('1.50');
  });

  it('lets explicit format options override one side of precision', () => {
    render(
      <NumberInput
        defaultValue="1.2345"
        locale="en-US"
        precision={3}
        formatOptions={{ minimumFractionDigits: 1 }}
      />,
    );
    expect(screen.getByRole('spinbutton')).toHaveValue('1.235');
  });

  it('reports range overflow and clamps on blur', async () => {
    const user = userEvent.setup();
    const onValueInvalid = vi.fn();
    render(<NumberInput defaultValue="5" max={10} onValueInvalid={onValueInvalid} />);

    const input = screen.getByRole('spinbutton');
    await user.click(input);
    await user.keyboard('{Control>}a{/Control}12');
    expect(input).toHaveValue('12');
    await user.tab();

    await waitFor(() => {
      expect(onValueInvalid).toHaveBeenCalledWith({
        reason: 'rangeOverflow',
        value: '12',
        valueAsNumber: 12,
      });
      expect(input).toHaveAttribute('aria-valuenow', '10');
    });
  });
});

describe('NumberInput states', () => {
  it('clears an editable value through Ark UI while preserving input focus', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<NumberInput clearable defaultValue="4" onValueChange={onValueChange} />);

    const input = screen.getByRole('spinbutton');
    await user.click(screen.getByRole('button', { name: 'Clear value' }));

    await waitFor(() => {
      expect(input).toHaveValue('');
      expect(input).toHaveFocus();
      expect(onValueChange).toHaveBeenLastCalledWith({
        value: '',
        valueAsNumber: Number.NaN,
      });
      expect(screen.queryByRole('button', { name: 'Clear value' })).toBeNull();
    });
  });

  it('hides the clear action when disabled or read only', () => {
    render(
      <>
        <NumberInput clearable defaultValue="2" disabled />
        <NumberInput clearable defaultValue="3" readOnly />
      </>,
    );

    expect(screen.queryByRole('button', { name: 'Clear value' })).toBeNull();
  });

  it('supports a custom localized clear label', () => {
    render(
      <NumberInput clearable defaultValue="2" localeText={{ clearValue: 'Reset quantity' }} />,
    );

    expect(screen.getByRole('button', { name: 'Reset quantity' })).toBeInTheDocument();
  });

  it('can hide visual controls and the focus ring without disabling keyboard stepping', async () => {
    expectTypeOf<NumberInputProps['showControls']>().toEqualTypeOf<boolean | undefined>();
    expectTypeOf<NumberInputProps['showFocusRing']>().toEqualTypeOf<boolean | undefined>();

    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <NumberInput
        defaultValue="2"
        onValueChange={onValueChange}
        showControls={false}
        showFocusRing={false}
      />,
    );

    const input = screen.getByRole('spinbutton');
    const control = input.closest('[data-part="control"]');

    expect(control).toHaveAttribute('data-focus-ring', 'false');
    expect(screen.queryByRole('button', { name: 'Increase value' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Decrease value' })).toBeNull();

    await user.click(input);
    await user.keyboard('{ArrowUp}');
    expect(onValueChange).toHaveBeenLastCalledWith({ value: '3', valueAsNumber: 3 });
  });

  it('disables the input and both triggers', () => {
    render(<NumberInput defaultValue="2" disabled />);

    expect(screen.getByRole('spinbutton')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Increase value' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Decrease value' })).toBeDisabled();
  });

  it('keeps the value focusable but not editable when read only', () => {
    render(<NumberInput defaultValue="2" readOnly />);

    expect(screen.getByRole('spinbutton')).toHaveAttribute('readonly');
    expect(screen.getByRole('button', { name: 'Increase value' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Decrease value' })).toBeDisabled();
  });

  it('supports custom trigger labels', () => {
    render(<NumberInput decrementLabel="Remove one guest" incrementLabel="Add one guest" />);

    expect(screen.getByRole('button', { name: 'Add one guest' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove one guest' })).toBeInTheDocument();
  });
});
