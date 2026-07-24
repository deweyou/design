// @vitest-environment jsdom

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import '../test-setup';

import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vite-plus/test';

import { ConfigProvider } from '../config-provider/index.tsx';
import {
  DateRangePicker,
  type DateRangePickerDateProps,
  type DateRangePickerProps,
  type DateRangePickerValue,
} from './index.tsx';
import { parseDatePickerDateTimeValue, parseDatePickerValue } from '../date-picker/index.tsx';

const dateValue = parseDatePickerValue;
const dateTimeValue = parseDatePickerDateTimeValue;
const stylesheet = readFileSync(resolve(import.meta.dirname, './index.module.less'), 'utf8');

afterEach(() => {
  cleanup();
});

describe('DateRangePicker field and value contract', () => {
  it('renders two real inputs inside one unified control', () => {
    render(
      <DateRangePicker
        clearable
        defaultValue={{
          start: dateValue('2026-07-22'),
          end: dateValue('2026-07-25'),
        }}
        hint="Choose the inclusive publishing period."
        id="publishing-period"
        label="Publishing period"
        required
      />,
    );

    const startInput = screen.getByRole('textbox', {
      name: 'Publishing period Start date',
    });
    const endInput = screen.getByRole('textbox', {
      name: 'Publishing period End date',
    });
    const control = startInput.closest('[data-part="control"]');

    expect(startInput).toHaveValue('2026/07/22');
    expect(endInput).toHaveValue('2026/07/25');
    expect(startInput).toHaveAttribute('id', 'publishing-period');
    expect(endInput).toHaveAttribute('id', 'publishing-period-end');
    expect(startInput).toHaveAttribute('aria-describedby', 'publishing-period-description');
    expect(endInput).toHaveAttribute('aria-describedby', 'publishing-period-description');
    expect(startInput).toBeRequired();
    expect(endInput).toBeRequired();
    expect(control).toContainElement(endInput);
    expect(within(control as HTMLElement).getByText('–')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('button', { name: 'Clear date range' })).toBeInTheDocument();
  });

  it('uses an object range instead of a positional tuple', () => {
    expectTypeOf<DateRangePickerDateProps['value']>().toEqualTypeOf<
      DateRangePickerValue | null | undefined
    >();
    expectTypeOf<DateRangePickerValue>().toEqualTypeOf<{
      start: ReturnType<typeof dateValue>;
      end: ReturnType<typeof dateValue>;
    }>();
    expectTypeOf<{
      value: [ReturnType<typeof dateValue>, ReturnType<typeof dateValue>];
    }>().not.toMatchTypeOf<DateRangePickerProps>();
  });

  it('inherits localized endpoint and clear labels from ConfigProvider', async () => {
    render(
      <ConfigProvider locale="zh-CN">
        <DateRangePicker
          clearable
          defaultValue={{
            start: dateValue('2026-07-22'),
            end: dateValue('2026-07-25'),
          }}
          label="发布日期"
        />
      </ConfigProvider>,
    );

    expect(await screen.findByRole('textbox', { name: '发布日期 开始日期' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: '发布日期 结束日期' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '清除日期范围' })).toBeInTheDocument();
  });

  it('commits a complete date range after the second calendar selection', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DateRangePicker
        defaultOpen
        defaultValue={{
          start: dateValue('2026-07-22'),
          end: dateValue('2026-07-25'),
        }}
        label="Publishing period"
        onValueChange={onValueChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Choose Monday, July 27, 2026/i }));
    expect(onValueChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: /Choose Thursday, July 30, 2026/i }));

    expect(onValueChange).toHaveBeenLastCalledWith({
      value: {
        start: dateValue('2026-07-27'),
        end: dateValue('2026-07-30'),
      },
    });
    await waitFor(() => {
      expect(screen.queryByRole('application', { name: 'calendar' })).not.toBeInTheDocument();
    });
  });

  it.each([
    ['month', 'July 2026', 'October 2026', '2026-07-01', '2026-10-01'],
    ['year', '2026', '2028', '2026-01-01', '2028-01-01'],
  ] as const)(
    'normalizes a complete %s range to CalendarDate unit starts',
    async (mode, startLabel, endLabel, expectedStart, expectedEnd) => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<DateRangePicker defaultOpen mode={mode} onValueChange={onValueChange} />);

      await user.click(screen.getByRole('button', { name: startLabel }));
      await user.click(screen.getByRole('button', { name: endLabel }));

      expect(onValueChange).toHaveBeenLastCalledWith({
        value: {
          start: dateValue(expectedStart),
          end: dateValue(expectedEnd),
        },
      });
    },
  );

  it('applies custom format and parse to each endpoint', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const format = (value: ReturnType<typeof dateValue>) =>
      `${String(value.day).padStart(2, '0')}.${String(value.month).padStart(2, '0')}.${value.year}`;
    const parse = (input: string) => {
      const [day, month, year] = input.split('.').map(Number);
      if (!day || !month || !year) return undefined;
      return dateValue(
        `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      );
    };
    render(
      <DateRangePicker
        defaultValue={{
          start: dateValue('2026-07-22'),
          end: dateValue('2026-07-25'),
        }}
        format={format}
        label="Publishing period"
        onValueChange={onValueChange}
        parse={parse}
      />,
    );

    const startInput = screen.getByRole('textbox', {
      name: 'Publishing period Start date',
    });
    const endInput = screen.getByRole('textbox', {
      name: 'Publishing period End date',
    });
    expect(startInput).toHaveValue('22.07.2026');
    expect(endInput).toHaveValue('25.07.2026');

    await user.clear(startInput);
    await user.type(startInput, '23.07.2026');
    await user.keyboard('{Enter}');
    await user.clear(endInput);
    await user.type(endInput, '26.07.2026');
    await user.keyboard('{Enter}');

    expect(onValueChange).toHaveBeenLastCalledWith({
      value: {
        start: dateValue('2026-07-23'),
        end: dateValue('2026-07-26'),
      },
    });
  });

  it('clears both endpoints through one contextual clear action', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DateRangePicker
        clearable
        defaultValue={{
          start: dateValue('2026-07-22'),
          end: dateValue('2026-07-25'),
        }}
        label="Publishing period"
        onValueChange={onValueChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Clear date range' }));

    expect(onValueChange).toHaveBeenLastCalledWith({ value: null });
    expect(screen.getByRole('textbox', { name: /Start date/ })).toHaveValue('');
    expect(screen.getByRole('textbox', { name: /End date/ })).toHaveValue('');
  });

  it('shows localized labels and values for both editable time endpoints', async () => {
    render(
      <ConfigProvider locale="zh-CN">
        <DateRangePicker
          defaultOpen
          defaultValue={{
            start: dateTimeValue('2026-07-22T09:15'),
            end: dateTimeValue('2026-07-25T18:30'),
          }}
          showTime={{ hourCycle: 24 }}
        />
      </ConfigProvider>,
    );

    const startTimeButton = await screen.findByRole('button', {
      name: '开始时间 2026/07/22 09:15',
    });
    const endTimeButton = screen.getByRole('button', {
      name: '结束时间 2026/07/25 18:30',
    });

    expect(within(startTimeButton).getByText('2026/07/22')).toBeVisible();
    expect(within(startTimeButton).getByText('09:15')).toBeVisible();
    expect(within(endTimeButton).getByText('2026/07/25')).toBeVisible();
    expect(within(endTimeButton).getByText('18:30')).toBeVisible();
    expect(startTimeButton).toHaveAttribute('data-active', 'true');
  });

  it('marks one continuous range segment at each calendar week boundary', () => {
    render(
      <DateRangePicker
        defaultOpen
        defaultValue={{
          start: dateValue('2026-07-15'),
          end: dateValue('2026-07-29'),
        }}
      />,
    );

    const getCell = (accessibleName: RegExp) =>
      screen.getByRole('button', { name: accessibleName }).closest('[data-part="table-cell"]');

    const firstRowStart = getCell(/Starting range from Wednesday, July 15, 2026/i);
    const firstRowEnd = getCell(/Choose Saturday, July 18, 2026/i);
    const middleRowStart = getCell(/Choose Sunday, July 19, 2026/i);
    const middleRowEnd = getCell(/Choose Saturday, July 25, 2026/i);
    const lastRowStart = getCell(/Choose Sunday, July 26, 2026/i);
    const lastRowEnd = getCell(/Range ending at Wednesday, July 29, 2026/i);

    expect(firstRowStart).toHaveAttribute('data-range-row-start');
    expect(firstRowStart).toHaveAttribute('data-range-start');
    expect(firstRowEnd).toHaveAttribute('data-range-row-end');
    expect(middleRowStart).toHaveAttribute('data-range-row-start');
    expect(middleRowEnd).toHaveAttribute('data-range-row-end');
    expect(lastRowStart).toHaveAttribute('data-range-row-start');
    expect(lastRowEnd).toHaveAttribute('data-range-row-end');
    expect(lastRowEnd).toHaveAttribute('data-range-end');
  });
});

describe('DateRangePicker styles', () => {
  it('defines one unified control and continuous weekly range bands', () => {
    expect(stylesheet).toMatch(/\.rangeControl\s*\{[^}]*display:\s*flex/);
    expect(stylesheet).toMatch(/\.rangeInput\s*\{[^}]*border:\s*0/);
    expect(stylesheet).toContain("[data-part='table-cell'][data-in-range]::before");
    expect(stylesheet).toContain("[data-part='table-cell'][data-in-hover-range]::before");
    expect(stylesheet).toContain('[data-range-row-start]');
    expect(stylesheet).toContain('[data-range-row-end]');
    expect(stylesheet).toMatch(
      /\[data-part='table-cell'\]\[data-range-start\]::before,[\s\S]*?\[data-part='table-cell'\]\[data-hover-range-start\]::before\s*\{[^}]*inset-inline-start:\s*50%/,
    );
    expect(stylesheet).toMatch(
      /\[data-part='table-cell'\]\[data-range-end\]::before,[\s\S]*?\[data-part='table-cell'\]\[data-hover-range-end\]::before\s*\{[^}]*inset-inline-end:\s*50%/,
    );
    expect(stylesheet).toContain(
      "[data-part='table-cell'][data-hover-range-start] > [data-part='table-cell-trigger']",
    );
    expect(stylesheet).toMatch(
      /\[data-part='table-cell'\]\[data-hover-range-end\] > \[data-part='table-cell-trigger'\]\s*\{[^}]*background:\s*var\(--ui-color-surface-raised\)/,
    );
    expect(stylesheet).toMatch(
      /\[data-part='table-cell'\]\[data-hover-range-end\]\s*>\s*\[data-part='table-cell-trigger'\]\s*\{[^}]*border-color:\s*var\(--ui-color-brand-text\)/,
    );
    expect(stylesheet).toMatch(/\.timeEndpointContent\s*\{[^}]*display:\s*grid/);
    expect(stylesheet).toMatch(/\.timeEndpointDate\s*\{[^}]*color:\s*var\(--ui-color-text-muted\)/);
    expect(stylesheet).toMatch(
      /\.timeEndpointButton\[data-active='true'\]\s*\{[^}]*border-color:\s*var\(--ui-color-brand-text\)/,
    );
    expect(stylesheet).toContain('color-mix(');
  });
});
