// @vitest-environment jsdom

import '../test-setup';

import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Time, type CalendarDateTime } from '@internationalized/date';
import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vite-plus/test';

import {
  DateRangePicker,
  type DateRangePickerDateTimeProps,
  type DateRangePickerDateTimeValue,
  type DateRangePickerProps,
  type DateRangePickerTimeOptions,
} from './index.tsx';
import { parseDatePickerDateTimeValue } from '../date-picker/index.tsx';

const dateTimeValue = parseDatePickerDateTimeValue;

afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

describe('DateRangePicker showTime', () => {
  it('exposes a discriminated CalendarDateTime range contract', () => {
    expectTypeOf<DateRangePickerDateTimeProps['value']>().toEqualTypeOf<
      DateRangePickerDateTimeValue | null | undefined
    >();
    expectTypeOf<DateRangePickerDateTimeValue>().toEqualTypeOf<{
      start: CalendarDateTime;
      end: CalendarDateTime;
    }>();
    expectTypeOf<DateRangePickerTimeOptions['defaultTime']>().toEqualTypeOf<
      { start?: Time; end?: Time } | undefined
    >();
    expectTypeOf<{
      mode: 'month';
      showTime: true;
    }>().not.toMatchTypeOf<DateRangePickerProps>();
  });

  it('renders two formatted date-time inputs in one field', () => {
    render(
      <DateRangePicker
        defaultValue={{
          start: dateTimeValue('2026-07-22T09:15'),
          end: dateTimeValue('2026-07-25T18:30'),
        }}
        label="Booking period"
        showTime={{ hourCycle: 24 }}
      />,
    );

    expect(screen.getByRole('textbox', { name: 'Booking period Start date' })).toHaveValue(
      '2026/07/22 09:15',
    );
    expect(screen.getByRole('textbox', { name: 'Booking period End date' })).toHaveValue(
      '2026/07/25 18:30',
    );
  });

  it('edits each endpoint time as a draft and commits only on Confirm', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DateRangePicker
        defaultOpen
        defaultValue={{
          start: dateTimeValue('2026-07-22T09:15'),
          end: dateTimeValue('2026-07-25T18:30'),
        }}
        label="Booking period"
        onValueChange={onValueChange}
        showTime={{ hourCycle: 24 }}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Start time 2026/07/22 09:15' }));
    expect(
      within(screen.getByRole('button', { name: 'Back to calendar' }).parentElement!).getByText(
        'Start time',
      ),
    ).toBeVisible();
    await user.click(
      within(screen.getByRole('listbox', { name: 'Hour' })).getByRole('option', {
        name: '10',
      }),
    );
    await user.click(screen.getByRole('button', { name: 'Back to calendar' }));

    await user.click(screen.getByRole('button', { name: 'End time 2026/07/25 18:30' }));
    expect(
      within(screen.getByRole('button', { name: 'Back to calendar' }).parentElement!).getByText(
        'End time',
      ),
    ).toBeVisible();
    await user.click(
      within(screen.getByRole('listbox', { name: 'Minute' })).getByRole('option', {
        name: '45',
      }),
    );

    expect(onValueChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(onValueChange).toHaveBeenLastCalledWith({
      value: {
        start: dateTimeValue('2026-07-22T10:15'),
        end: dateTimeValue('2026-07-25T18:45'),
      },
    });
    await waitFor(() => {
      expect(screen.queryByRole('application', { name: 'calendar' })).not.toBeInTheDocument();
    });
  });

  it('disables an endpoint wheel choice that would invert a same-day range', async () => {
    const user = userEvent.setup();
    render(
      <DateRangePicker
        defaultOpen
        defaultValue={{
          start: dateTimeValue('2026-07-22T09:00'),
          end: dateTimeValue('2026-07-22T10:00'),
        }}
        label="Booking period"
        showTime={{ hourCycle: 24 }}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'End time 2026/07/22 10:00' }));

    expect(
      within(screen.getByRole('listbox', { name: 'Hour' })).getByRole('option', {
        name: '08',
      }),
    ).toHaveAttribute('data-disabled');
  });

  it('applies Now only to the active endpoint and still waits for Confirm', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 24, 15, 46, 0));
    const onValueChange = vi.fn();
    render(
      <DateRangePicker
        defaultOpen
        defaultValue={{
          start: dateTimeValue('2026-07-22T09:00'),
          end: dateTimeValue('2026-07-25T18:00'),
        }}
        label="Booking period"
        onValueChange={onValueChange}
        showTime={{ hourCycle: 24, minuteStep: 15, showNow: true }}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Start time 2026/07/22 09:00' }));
    fireEvent.click(screen.getByRole('button', { name: 'Now' }));
    expect(onValueChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(onValueChange).toHaveBeenLastCalledWith({
      value: {
        start: dateTimeValue('2026-07-22T15:45'),
        end: dateTimeValue('2026-07-25T18:00'),
      },
    });
  });
});
