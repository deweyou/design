// @vitest-environment jsdom

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import '../test-setup';

import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type CalendarDateTime, Time } from '@internationalized/date';
import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from 'vite-plus/test';

import { ConfigProvider } from '../config-provider/index.tsx';
import {
  DatePicker,
  type DatePickerDateTimeProps,
  type DatePickerProps,
  type DatePickerTimeOptions,
  parseDatePickerDateTimeValue,
  parseDatePickerValue,
} from './index.tsx';

const timeWheelStylesheet = readFileSync(
  resolve(import.meta.dirname, './time-wheel.module.less'),
  'utf8',
);

afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

describe('DatePicker showTime', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it('renders a date-time value in one year-first field', () => {
    render(
      <DatePicker
        defaultValue={parseDatePickerDateTimeValue('2026-07-22T14:30')}
        label="Published at"
        showTime={{ hourCycle: 24 }}
      />,
    );

    expect(screen.getByRole('textbox', { name: 'Published at' })).toHaveValue('2026/07/22 14:30');
  });

  it.each(['2026-08-07 15:45', '2026 08 07 15:45'])(
    'accepts alternate date separators in %s',
    async (inputValue) => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <DatePicker
          defaultOpen
          label="Published at"
          onValueChange={onValueChange}
          showTime={{ hourCycle: 24 }}
        />,
      );

      const input = screen.getByRole('textbox', { name: 'Published at' });
      await user.type(input, inputValue);

      expect(input).toHaveValue('2026/08/07 15:45');
      await user.click(screen.getByRole('button', { name: 'Confirm' }));
      expect(onValueChange).toHaveBeenLastCalledWith({
        value: parseDatePickerDateTimeValue('2026-08-07T15:45'),
      });
    },
  );

  it('exposes a discriminated CalendarDateTime public contract', () => {
    expectTypeOf<DatePickerDateTimeProps['value']>().toEqualTypeOf<
      CalendarDateTime | null | undefined
    >();
    expectTypeOf<DatePickerTimeOptions['granularity']>().toEqualTypeOf<
      'minute' | 'second' | undefined
    >();
    expectTypeOf<DatePickerTimeOptions['showNow']>().toEqualTypeOf<boolean | undefined>();
    expectTypeOf<{
      mode: 'month';
      showTime: true;
    }>().not.toMatchTypeOf<DatePickerProps>();
  });

  it('supports paired custom format and parse callbacks', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const format = (value: CalendarDateTime) =>
      `${value.year}.${String(value.month).padStart(2, '0')}.${String(value.day).padStart(2, '0')} · ${String(value.hour).padStart(2, '0')}:${String(value.minute).padStart(2, '0')}`;
    const parse = (input: string) => {
      const match = /^(\d{4})\.(\d{2})\.(\d{2}) · (\d{2}):(\d{2})$/.exec(input);
      return match
        ? parseDatePickerDateTimeValue(
            `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}`,
          )
        : undefined;
    };
    render(
      <DatePicker
        defaultOpen
        defaultValue={parseDatePickerDateTimeValue('2026-07-22T14:30')}
        format={format}
        label="Published at"
        onValueChange={onValueChange}
        parse={parse}
        showTime={{ hourCycle: 24 }}
      />,
    );

    const input = screen.getByRole('textbox', { name: 'Published at' });
    expect(input).toHaveValue('2026.07.22 · 14:30');
    await user.clear(input);
    await user.type(input, '2026.08.07 · 15:45');
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(onValueChange).toHaveBeenLastCalledWith({
      value: parseDatePickerDateTimeValue('2026-08-07T15:45'),
    });
  });

  it('keeps calendar and wheel edits as a draft until confirm', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DatePicker
        defaultOpen
        defaultValue={parseDatePickerDateTimeValue('2026-07-22T14:30')}
        label="Published at"
        onValueChange={onValueChange}
        showTime={{ hourCycle: 24 }}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Choose Thursday, July 23, 2026/i }));
    expect(onValueChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Time 14:30' }));
    const hourWheel = screen.getByRole('listbox', { name: 'Hour' });
    const minuteWheel = screen.getByRole('listbox', { name: 'Minute' });
    await user.click(within(hourWheel).getByRole('option', { name: '15' }));
    await user.click(within(minuteWheel).getByRole('option', { name: '45' }));

    expect(onValueChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(onValueChange).toHaveBeenLastCalledWith({
      value: parseDatePickerDateTimeValue('2026-07-23T15:45'),
    });
    await waitFor(() => {
      expect(screen.queryByRole('listbox', { name: 'Hour' })).not.toBeInTheDocument();
    });
  });

  it('returns from the time wheel without committing the draft', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DatePicker
        defaultOpen
        defaultValue={parseDatePickerDateTimeValue('2026-07-22T14:30')}
        onValueChange={onValueChange}
        showTime={{ hourCycle: 24 }}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Time 14:30' }));
    await user.click(screen.getByRole('button', { name: 'Back to calendar' }));

    expect(screen.getByRole('application', { name: 'calendar' })).toBeVisible();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('discards wheel edits when the popup is dismissed', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DatePicker
        defaultOpen
        defaultValue={parseDatePickerDateTimeValue('2026-07-22T14:30')}
        label="Published at"
        onValueChange={onValueChange}
        showTime={{ hourCycle: 24 }}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Time 14:30' }));
    await user.click(
      within(screen.getByRole('listbox', { name: 'Hour' })).getByRole('option', {
        name: '15',
      }),
    );
    await user.keyboard('{Escape}');

    expect(onValueChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole('textbox', { name: 'Published at' }));
    expect(screen.getByRole('button', { name: 'Time 14:30' })).toBeVisible();
  });

  it('uses defaultTime when the first calendar date is selected', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DatePicker
        defaultOpen
        onValueChange={onValueChange}
        showTime={{ defaultTime: new Time(9, 30), hourCycle: 24 }}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Choose Wednesday, July 22, 2026/i }));
    expect(screen.getByRole('button', { name: 'Time 09:30' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(onValueChange).toHaveBeenCalledWith({
      value: parseDatePickerDateTimeValue('2026-07-22T09:30'),
    });
  });

  it('supports seconds, steps, and time unavailability', async () => {
    const user = userEvent.setup();
    render(
      <DatePicker
        defaultOpen
        defaultValue={parseDatePickerDateTimeValue('2026-07-22T14:30:15')}
        showTime={{
          granularity: 'second',
          hourCycle: 24,
          isTimeUnavailable: (value) => value.minute === 45,
          minuteStep: 15,
          secondStep: 15,
        }}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Time 14:30:15' }));

    expect(screen.getByRole('listbox', { name: 'Second' })).toBeVisible();
    expect(
      within(screen.getByRole('listbox', { name: 'Minute' })).getByRole('option', {
        name: '45',
      }),
    ).toHaveAttribute('aria-disabled', 'true');
  });

  it('shows the Now action only when configured and the time panel is active', async () => {
    const user = userEvent.setup();
    const { unmount } = render(
      <DatePicker
        defaultOpen
        defaultValue={parseDatePickerDateTimeValue('2026-07-22T14:30')}
        showTime={{ hourCycle: 24 }}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Time 14:30' }));
    expect(screen.queryByRole('button', { name: 'Now' })).not.toBeInTheDocument();
    unmount();

    render(
      <DatePicker
        defaultOpen
        defaultValue={parseDatePickerDateTimeValue('2026-07-22T14:30')}
        showTime={{ hourCycle: 24, showNow: true }}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Time 14:30' }));
    expect(screen.getByRole('button', { name: 'Now' })).toBeVisible();
  });

  it('snaps Now to the nearest stepped time without committing before Confirm', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 23, 14, 53, 44));
    const onValueChange = vi.fn();
    render(
      <DatePicker
        defaultOpen
        defaultValue={parseDatePickerDateTimeValue('2026-07-22T08:00:00')}
        onValueChange={onValueChange}
        showTime={{
          granularity: 'second',
          hourCycle: 24,
          minuteStep: 15,
          secondStep: 15,
          showNow: true,
        }}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Time 08:00:00' }));
    fireEvent.click(screen.getByRole('button', { name: 'Now' }));

    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Time 15:00:00' })).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(onValueChange).toHaveBeenLastCalledWith({
      value: parseDatePickerDateTimeValue('2026-07-22T15:00:00'),
    });
  });

  it('disables Now when the snapped current time is unavailable', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 23, 14, 30));
    render(
      <DatePicker
        defaultOpen
        defaultValue={parseDatePickerDateTimeValue('2026-07-22T08:00')}
        showTime={{
          hourCycle: 24,
          isTimeUnavailable: (value) => value.hour === 14 && value.minute === 30,
          showNow: true,
        }}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Time 08:00' }));

    expect(screen.getByRole('button', { name: 'Now' })).toBeDisabled();
  });

  it('localizes the Now action through ConfigProvider', async () => {
    const user = userEvent.setup();
    render(
      <ConfigProvider locale="zh-CN">
        <DatePicker
          defaultOpen
          defaultValue={parseDatePickerDateTimeValue('2026-07-22T14:30')}
          showTime={{ hourCycle: 24, showNow: true }}
        />
      </ConfigProvider>,
    );

    await user.click(await screen.findByRole('button', { name: '时间 14:30' }));
    expect(screen.getByRole('button', { name: '此刻' })).toBeVisible();
  });

  it('uses one aligned selection track and hides native wheel scrollbars', () => {
    const wheelColumnsRule = timeWheelStylesheet.match(/\.wheelColumns\s*\{([^}]*)\}/)?.[1];
    const selectionTrackRule = timeWheelStylesheet.match(
      /\.wheelColumns::after\s*\{([^}]*)\}/,
    )?.[1];
    const wheelContentRule = timeWheelStylesheet.match(/\.wheelContent\s*\{([^}]*)\}/)?.[1];
    const selectedItemRule = timeWheelStylesheet.match(
      /\.wheelItem\[data-selected\]\s*\{([^}]*)\}/,
    )?.[1];

    expect(wheelColumnsRule).toContain('position: relative');
    expect(selectionTrackRule).toContain('inset-inline: 0');
    expect(selectionTrackRule).toContain('block-size: var(--date-picker-panel-day-size)');
    expect(selectionTrackRule).toContain('border-block: 1px solid var(--ui-color-border-strong)');
    expect(wheelContentRule).toContain('scrollbar-width: none');
    expect(wheelContentRule).toContain('-ms-overflow-style: none');
    expect(wheelContentRule).toContain('scroll-snap-type: y mandatory');
    expect(timeWheelStylesheet).toContain('.wheelContent::-webkit-scrollbar');
    expect(selectedItemRule).not.toContain('box-shadow');
  });

  it('selects the available item that settles in the center track', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DatePicker
        defaultOpen
        defaultValue={parseDatePickerDateTimeValue('2026-07-22T14:30')}
        onValueChange={onValueChange}
        showTime={{ hourCycle: 24 }}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Time 14:30' }));
    const hourWheel = screen.getByRole('listbox', { name: 'Hour' });
    const hourOptions = within(hourWheel).getAllByRole('option');
    Object.defineProperty(hourWheel, 'clientHeight', { configurable: true, value: 160 });
    hourWheel.getBoundingClientRect = () =>
      ({
        bottom: 160,
        height: 160,
        left: 0,
        right: 90,
        top: 0,
        width: 90,
        x: 0,
        y: 0,
      }) as DOMRect;
    hourOptions.forEach((option, hour) => {
      const top = (hour - 15) * 32 + 64;
      option.getBoundingClientRect = () =>
        ({
          bottom: top + 32,
          height: 32,
          left: 0,
          right: 90,
          top,
          width: 90,
          x: 0,
          y: top,
        }) as DOMRect;
    });

    fireEvent.scroll(hourWheel);

    await waitFor(() => {
      expect(within(hourWheel).getByRole('option', { name: '15' })).toHaveAttribute(
        'data-selected',
      );
    });
    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(onValueChange).toHaveBeenLastCalledWith({
      value: parseDatePickerDateTimeValue('2026-07-22T15:30'),
    });
  });

  it('keeps date-only behavior unchanged when showTime is absent', () => {
    render(<DatePicker defaultValue={parseDatePickerValue('2026-07-22')} label="Published" />);

    expect(screen.getByRole('textbox', { name: 'Published' })).toHaveValue('2026/07/22');
    expect(screen.queryByRole('button', { name: /^Time / })).not.toBeInTheDocument();
  });

  it('clears a committed date-time directly from the field action', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DatePicker
        clearable
        defaultValue={parseDatePickerDateTimeValue('2026-07-22T14:30')}
        label="Published at"
        onValueChange={onValueChange}
        showTime={{ hourCycle: 24 }}
      />,
    );

    await user.click(screen.getByRole('textbox', { name: 'Published at' }));
    await user.click(screen.getByRole('button', { name: 'Clear date and time' }));

    expect(onValueChange).toHaveBeenLastCalledWith({ value: null });
    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: 'Published at' })).toHaveValue('');
      expect(screen.queryByRole('application', { name: 'calendar' })).not.toBeInTheDocument();
    });
  });

  it('rejects time selection with month or year mode at runtime', () => {
    expect(() =>
      render(
        <DatePicker
          mode={'month' as 'date'}
          showTime
          value={parseDatePickerDateTimeValue('2026-07-22T14:30')}
        />,
      ),
    ).toThrow('DatePicker showTime only supports mode="date".');
  });

  it('inherits locale hour cycle when no override is provided', async () => {
    render(
      <ConfigProvider locale="zh-CN">
        <DatePicker
          defaultOpen
          defaultValue={parseDatePickerDateTimeValue('2026-07-22T14:30')}
          showTime
        />
      </ConfigProvider>,
    );

    expect(await screen.findByRole('button', { name: '时间 14:30' })).toBeVisible();
  });
});
