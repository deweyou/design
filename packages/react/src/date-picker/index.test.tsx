// @vitest-environment jsdom

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import '../test-setup';

import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getLocalTimeZone, today } from '@internationalized/date';
import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vite-plus/test';

import { ConfigProvider } from '../config-provider/index.tsx';
import styles from './index.module.less';
import {
  DatePicker,
  type DatePickerFormat,
  type DatePickerDateProps,
  type DatePickerLocaleTextOverrides,
  type DatePickerMode,
  type DatePickerParse,
  type DatePickerProps,
  type DatePickerValue,
  parseDatePickerValue,
} from './index.tsx';

const stylesheet = readFileSync(resolve(import.meta.dirname, './index.module.less'), 'utf8');
const dateValue = parseDatePickerValue;

afterEach(() => {
  cleanup();
});

describe('DatePicker field semantics', () => {
  it('connects the label, hint, and error to the date input', () => {
    render(
      <DatePicker
        defaultValue={dateValue('2026-07-22')}
        error="Choose an available publication date."
        hint="Dates are shown in your locale."
        id="published"
        label="Published"
        required
      />,
    );

    const input = screen.getByRole('textbox', { name: 'Published' });
    expect(input).toHaveAttribute('id', 'published');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'published-description published-error');
    expect(input).toBeRequired();
    expect(screen.getByText('Choose an available publication date.')).toHaveAttribute(
      'role',
      'alert',
    );
  });

  it('generates stable field relationships when no id is provided', () => {
    render(<DatePicker hint="Use the calendar or type a date." label="Start date" />);

    const input = screen.getByRole('textbox', { name: 'Start date' });
    expect(input.id).toMatch(/^date-picker-field-/);
    expect(screen.getByText('Use the calendar or type a date.')).toHaveAttribute(
      'id',
      `${input.id}-description`,
    );
  });
});

describe('DatePicker value behavior', () => {
  it('formats the initial semantic value as year-first slash text', () => {
    render(<DatePicker defaultValue={dateValue('2026-07-22')} label="Published" />);
    expect(screen.getByRole('textbox', { name: 'Published' })).toHaveValue('2026/07/22');
  });

  it.each([
    ['month', '2026/07', 'YYYY/MM'],
    ['year', '2026', 'YYYY'],
  ] as const)(
    'formats the initial %s value at its selection granularity',
    (mode, value, placeholder) => {
      render(
        <DatePicker
          defaultValue={dateValue('2026-07-22')}
          label={`${mode} selection`}
          mode={mode}
        />,
      );

      const input = screen.getByRole('textbox', { name: `${mode} selection` });
      expect(input).toHaveValue(value);
      expect(input).toHaveAttribute('placeholder', placeholder);
    },
  );

  it.each(['2026/07/23', '2026-07-23', '2026 07 23'])(
    'accepts the default date input format %s and normalizes the display',
    async (inputValue) => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<DatePicker label="Published" onValueChange={onValueChange} />);

      const input = screen.getByRole('textbox', { name: 'Published' });
      expect(input).toHaveAttribute('placeholder', 'YYYY/MM/DD');

      await user.type(input, inputValue);
      await user.keyboard('{Enter}');

      expect(onValueChange).toHaveBeenLastCalledWith({ value: dateValue('2026-07-23') });
      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: 'Published' })).toHaveValue('2026/07/23');
      });
    },
  );

  it.each([
    ['month', '2027/08', '2027-08-01', '2027/08'],
    ['month', '2027-08', '2027-08-01', '2027/08'],
    ['month', '2027 08', '2027-08-01', '2027/08'],
    ['year', '2027', '2027-01-01', '2027'],
  ] as const)(
    'accepts %s input %s and normalizes its CalendarDate value',
    async (mode, inputValue, expectedValue, expectedText) => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<DatePicker label="Period" mode={mode} onValueChange={onValueChange} />);

      const input = screen.getByRole('textbox', { name: 'Period' });
      await user.type(input, inputValue);
      await user.keyboard('{Enter}');

      expect(onValueChange).toHaveBeenLastCalledWith({ value: dateValue(expectedValue) });
      await waitFor(() => {
        expect(input).toHaveValue(expectedText);
      });
    },
  );

  it('uses paired format and parse callbacks with the inherited locale', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const format = vi.fn<DatePickerFormat>(
      (date) =>
        `${String(date.day).padStart(2, '0')}/${String(date.month).padStart(2, '0')}/${date.year}`,
    );
    const parse = vi.fn<DatePickerParse>((input) => {
      const [day, month, year] = input.split('/').map(Number);

      if (!year || !month || !day) return undefined;
      return dateValue(
        `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      );
    });

    render(
      <ConfigProvider locale="ja-JP">
        <DatePicker
          defaultValue={dateValue('2026-07-22')}
          format={format}
          label="公開日"
          onValueChange={onValueChange}
          parse={parse}
        />
      </ConfigProvider>,
    );

    const input = await screen.findByRole('textbox', { name: '公開日' });
    expect(input).toHaveValue('22/07/2026');
    expect(format).toHaveBeenCalledWith(dateValue('2026-07-22'), { locale: 'ja-JP' });

    await user.clear(input);
    await user.type(input, '23/07/2026');
    await user.tab();

    expect(parse).toHaveBeenLastCalledWith('23/07/2026', { locale: 'ja-JP' });
    expect(onValueChange).toHaveBeenLastCalledWith({ value: dateValue('2026-07-23') });
  });

  it('requires custom format and parse callbacks to be provided together', () => {
    const props = {
      format: (date: DatePickerValue) => date.toString(),
      label: 'Published',
    } as unknown as DatePickerProps;

    expect(() => render(<DatePicker {...props} />)).toThrowError(
      'DatePicker format and parse must be provided together.',
    );
  });

  it('inherits locale only from ConfigProvider', async () => {
    render(
      <ConfigProvider locale="ja-JP">
        <DatePicker defaultOpen defaultValue={dateValue('2026-07-22')} label="公開日" />
      </ConfigProvider>,
    );

    await waitFor(() => {
      expect(
        document.querySelector('[data-part="view-trigger"][data-view="day"]'),
      ).toHaveTextContent('2026年7月');
    });
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('does not expose the clear action without a selected value', () => {
    render(<DatePicker clearable label="Published" />);

    expect(document.querySelector('button[aria-label="Clear date"]')).not.toBeInTheDocument();
  });

  it('uses a decorative calendar indicator and one contextual clear action', () => {
    const { unmount } = render(
      <DatePicker clearable defaultValue={dateValue('2026-07-22')} label="Published" />,
    );

    expect(screen.queryByRole('button', { name: 'Open calendar' })).not.toBeInTheDocument();
    expect(document.querySelector(`.${styles.calendarIndicator}`)).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Clear date' })).toBeInTheDocument();

    unmount();
    render(<DatePicker clearable label="Published" />);

    expect(screen.queryByRole('button', { name: 'Clear date' })).not.toBeInTheDocument();
    expect(document.querySelector(`.${styles.calendarIndicator}`)).toBeInTheDocument();
  });

  it('emits a CalendarDate after calendar selection', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DatePicker
        defaultOpen
        defaultValue={dateValue('2026-07-22')}
        label="Published"
        onValueChange={onValueChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Choose Thursday, July 23, 2026/i }));
    expect(onValueChange).toHaveBeenLastCalledWith({ value: dateValue('2026-07-23') });
    expect(screen.getByRole('textbox', { name: 'Published' })).toHaveValue('2026/07/23');
  });

  it('does not replace a controlled value until its owner updates it', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DatePicker
        defaultOpen
        label="Published"
        onValueChange={onValueChange}
        value={dateValue('2026-07-22')}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Choose Thursday, July 23, 2026/i }));
    expect(onValueChange).toHaveBeenCalledWith({ value: dateValue('2026-07-23') });
    expect(screen.getByRole('textbox', { name: 'Published' })).toHaveValue('2026/07/22');
  });

  it('clears the selected value through the explicit clear action', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DatePicker
        clearable
        defaultValue={dateValue('2026-07-22')}
        label="Published"
        onValueChange={onValueChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Clear date' }));
    expect(onValueChange).toHaveBeenLastCalledWith({ value: null });
    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: 'Published' })).toHaveValue('');
      expect(document.querySelector('button[aria-label="Clear date"]')).not.toBeInTheDocument();
    });
  });

  it('uses CalendarDate for the public value contract', () => {
    expectTypeOf<DatePickerDateProps['value']>().toEqualTypeOf<
      DatePickerValue | null | undefined
    >();
    expectTypeOf<DatePickerProps['localeText']>().toEqualTypeOf<
      DatePickerLocaleTextOverrides | undefined
    >();
    expectTypeOf<DatePickerProps['showToday']>().toEqualTypeOf<boolean | undefined>();
    expectTypeOf<DatePickerProps['mode']>().toEqualTypeOf<DatePickerMode | undefined>();
    expectTypeOf<DatePickerMode>().toEqualTypeOf<'date' | 'month' | 'year'>();
    expect(dateValue('2026-07-22').toString()).toBe('2026-07-22');
  });

  it.each([
    ['sm', styles.sizeSm],
    ['md', styles.sizeMd],
    ['lg', styles.sizeLg],
  ] as const)('applies the %s density to the portalled calendar panel', async (size, sizeClass) => {
    render(<DatePicker defaultOpen defaultValue={dateValue('2026-07-22')} size={size} />);

    await waitFor(() => {
      expect(document.querySelector('[data-part="content"]')).toHaveClass(sizeClass);
    });
  });

  it('reports open state changes through the Deweyou-owned contract', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<DatePicker label="Published" onOpenChange={onOpenChange} />);

    await user.click(screen.getByRole('textbox', { name: 'Published' }));
    expect(onOpenChange).toHaveBeenLastCalledWith({ open: true });
    await waitFor(() => {
      expect(screen.getByRole('application', { name: 'calendar' })).toBeVisible();
    });

    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenLastCalledWith({ open: false });
    });
  });

  it('selects the local calendar day from the Today action and closes', async () => {
    const user = userEvent.setup();
    const currentDate = today(getLocalTimeZone());
    const onValueChange = vi.fn();
    render(
      <DatePicker
        defaultOpen
        defaultValue={currentDate.subtract({ days: 1 })}
        label="Published"
        onValueChange={onValueChange}
        showToday
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Today' }));

    expect(onValueChange).toHaveBeenLastCalledWith({ value: currentDate });
    await waitFor(() => {
      expect(screen.queryByRole('application', { name: 'calendar' })).not.toBeInTheDocument();
    });
  });

  it.each([
    ['month', (value: DatePickerValue) => value.set({ day: 1 })],
    ['year', (value: DatePickerValue) => value.set({ month: 1, day: 1 })],
  ] as const)('normalizes Today to the current %s', async (mode, normalize) => {
    const user = userEvent.setup();
    const currentDate = today(getLocalTimeZone());
    const onValueChange = vi.fn();
    render(<DatePicker defaultOpen mode={mode} onValueChange={onValueChange} showToday />);

    await user.click(screen.getByRole('button', { name: 'Today' }));

    expect(onValueChange).toHaveBeenLastCalledWith({ value: normalize(currentDate) });
  });
});

describe('DatePicker constraints and navigation', () => {
  it('disables Today when the local date is outside the selectable range', () => {
    const currentDate = today(getLocalTimeZone());
    render(<DatePicker defaultOpen min={currentDate.add({ days: 1 })} showToday />);

    expect(screen.getByRole('button', { name: 'Today' })).toBeDisabled();
  });

  it('hides the Today footer action unless showToday is enabled', () => {
    const { rerender } = render(<DatePicker defaultOpen defaultValue={dateValue('2026-07-22')} />);

    expect(screen.queryByRole('button', { name: 'Today' })).not.toBeInTheDocument();
    expect(document.querySelector(`.${styles.calendarFooter}`)).not.toBeInTheDocument();

    rerender(<DatePicker defaultOpen defaultValue={dateValue('2026-07-22')} showToday />);

    expect(screen.getByRole('button', { name: 'Today' })).toBeVisible();
    expect(document.querySelector(`.${styles.calendarFooter}`)).toBeVisible();
  });

  it('uses narrow single-character weekday headings for Chinese', async () => {
    render(
      <ConfigProvider locale="zh-CN">
        <DatePicker defaultOpen defaultValue={dateValue('2026-07-22')} />
      </ConfigProvider>,
    );

    await waitFor(() => {
      expect(document.querySelectorAll('[data-part="table-header"]')).toHaveLength(7);
    });
    const weekdayHeadings = [...document.querySelectorAll('[data-part="table-header"]')];

    expect(weekdayHeadings.map((heading) => heading.textContent)).toEqual([
      '一',
      '二',
      '三',
      '四',
      '五',
      '六',
      '日',
    ]);
    expect(weekdayHeadings.map((heading) => heading.getAttribute('aria-label'))).toEqual([
      '星期一',
      '星期二',
      '星期三',
      '星期四',
      '星期五',
      '星期六',
      '星期日',
    ]);
  });

  it('uses the natural number of calendar weeks by default', () => {
    render(<DatePicker defaultOpen defaultValue={dateValue('2026-07-22')} />);

    expect(
      screen.queryByRole('button', { name: /Choose Saturday, August 8, 2026/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Choose Saturday, August 1, 2026/i })).toBeVisible();
  });

  it('uses one locale-formatted title action instead of separate month and year selects', () => {
    render(
      <ConfigProvider locale="ja-JP">
        <DatePicker defaultOpen defaultValue={dateValue('2026-07-22')} label="公開日" />
      </ConfigProvider>,
    );

    const viewTrigger = document.querySelector('[data-part="view-trigger"][data-view="day"]');
    expect(viewTrigger).toBeVisible();
    expect(viewTrigger).toHaveTextContent('2026年7月');
    expect(viewTrigger?.querySelector('svg')).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('renders month and year navigation with constrained unavailable days', () => {
    render(
      <DatePicker
        defaultOpen
        defaultValue={dateValue('2026-07-22')}
        isDateUnavailable={(value) => value.toString() === '2026-07-24'}
        max={dateValue('2026-07-25')}
        min={dateValue('2026-07-20')}
      />,
    );

    expect(document.querySelector('[data-part="view-trigger"][data-view="day"]')).toHaveTextContent(
      'July 2026',
    );
    expect(
      screen.getByRole('button', { name: /Not available\. Friday, July 24, 2026/i }),
    ).toBeDisabled();
    expect(screen.getByRole('button', { name: /Sunday, July 26, 2026/i })).toBeDisabled();
  });

  it('uses the month as the selection view while keeping year navigation available', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DatePicker
        defaultOpen
        defaultValue={dateValue('2026-07-22')}
        mode="month"
        onValueChange={onValueChange}
      />,
    );

    const monthViewTrigger = document.querySelector<HTMLButtonElement>(
      '[data-part="view-trigger"][data-view="month"]',
    );
    expect(monthViewTrigger).toBeVisible();
    expect(document.querySelector('[data-part="view-trigger"][data-view="day"]')).not.toBeVisible();
    expect(screen.queryByRole('button', { name: 'Back to previous calendar view' })).toBeNull();

    await user.click(monthViewTrigger!);
    expect(document.querySelector('[data-part="view-control"][data-view="year"]')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Back to previous calendar view' })).toBeVisible();

    await user.click(screen.getByRole('button', { name: '2027' }));
    expect(monthViewTrigger).toBeVisible();
    expect(monthViewTrigger).toHaveTextContent('2027');
    expect(onValueChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'August 2027' }));

    expect(onValueChange).toHaveBeenLastCalledWith({ value: dateValue('2027-08-01') });
    await waitFor(() => {
      expect(screen.queryByRole('application', { name: 'calendar' })).not.toBeInTheDocument();
    });
    expect(screen.getByRole('textbox')).toHaveValue('2027/08');
  });

  it('uses the year as the only panel and normalizes selection to January 1', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DatePicker
        defaultOpen
        defaultValue={dateValue('2026-07-22')}
        mode="year"
        onValueChange={onValueChange}
      />,
    );

    expect(document.querySelector('[data-part="view-control"][data-view="year"]')).toBeVisible();
    for (const viewTrigger of document.querySelectorAll('[data-part="view-trigger"]')) {
      expect(viewTrigger).not.toBeVisible();
    }
    expect(screen.queryByRole('button', { name: 'Back to previous calendar view' })).toBeNull();

    await user.click(screen.getByRole('button', { name: '2027' }));

    expect(onValueChange).toHaveBeenLastCalledWith({ value: dateValue('2027-01-01') });
    await waitFor(() => {
      expect(screen.queryByRole('application', { name: 'calendar' })).not.toBeInTheDocument();
    });
    expect(screen.getByRole('textbox')).toHaveValue('2027');
  });

  it.each([
    ['month', 'August 2026', '2026-08-01'],
    ['year', '2027', '2027-01-01'],
  ] as const)(
    'applies isDateUnavailable to normalized %s choices',
    (mode, accessibleName, unavailableValue) => {
      render(
        <DatePicker
          defaultOpen
          defaultValue={dateValue('2026-07-22')}
          isDateUnavailable={(value) => value.toString() === unavailableValue}
          mode={mode}
        />,
      );

      expect(screen.getByRole('button', { name: accessibleName })).toBeDisabled();
    },
  );

  it('keeps non-interactive dates muted without strikethrough', () => {
    const outsideRangeRule = stylesheet.match(
      /\.dayButton\[data-outside-range\]\s*\{([^}]*)\}/,
    )?.[1];
    const unavailableRule = stylesheet.match(/\.dayButton\[data-unavailable\]\s*\{([^}]*)\}/)?.[1];
    const disabledRule = stylesheet.match(/\.dayButton\[data-disabled\]\s*\{([^}]*)\}/)?.[1];

    expect(outsideRangeRule).not.toContain('text-decoration');
    expect(disabledRule).not.toContain('text-decoration');
    expect(unavailableRule).toContain('opacity');
    expect(unavailableRule).not.toContain('text-decoration');
  });

  it('uses circular outline emphasis for selected cells and a dot for today', () => {
    const selectionButtonRule = stylesheet.match(/\.selectionButton\s*\{([^}]*)\}/)?.[1];
    const dayButtonRule = stylesheet.match(/\.dayButton\s*\{([^}]*)\}/)?.[1];
    const choiceHoverRule = stylesheet.match(
      /\.selectionButton:hover:not\(:disabled\),\s*\.dayButton:hover:not\(:disabled\)\s*\{([^}]*)\}/,
    )?.[1];
    const choiceActiveRule = stylesheet.match(
      /\.selectionButton:active:not\(:disabled\),\s*\.dayButton:active:not\(:disabled\)\s*\{([^}]*)\}/,
    )?.[1];
    const selectedChoiceRule = stylesheet.match(
      /\.selectionButton\[data-selected\],\s*\.dayButton\[data-selected\]\s*\{([^}]*)\}/,
    )?.[1];
    const todayDotRule = stylesheet.match(/\.dayButton\[data-today\]::after\s*\{([^}]*)\}/)?.[1];

    expect(selectionButtonRule).toContain('inline-size: var(--date-picker-panel-selection-size)');
    expect(selectionButtonRule).toContain('block-size: var(--date-picker-panel-selection-size)');
    expect(selectionButtonRule).toContain('border-radius: var(--ui-radius-pill)');
    expect(dayButtonRule).toContain('inline-size: var(--date-picker-panel-day-size)');
    expect(dayButtonRule).toContain('block-size: var(--date-picker-panel-day-size)');
    expect(dayButtonRule).toContain('border-radius: var(--ui-radius-pill)');
    expect(choiceHoverRule).toContain('background: transparent');
    expect(choiceHoverRule).toContain('color: var(--ui-color-brand-text)');
    for (const activeRule of [choiceActiveRule, selectedChoiceRule]) {
      expect(activeRule).toContain('border-color: var(--ui-color-brand-text)');
      expect(activeRule).toContain('background: transparent');
      expect(activeRule).toContain('color: var(--ui-color-brand-text)');
      expect(activeRule).not.toContain('font-weight');
      expect(activeRule).not.toContain('text-decoration');
    }
    expect(stylesheet).not.toContain('.selectionButton[data-selected]::after');
    expect(stylesheet).not.toContain('.dayButton[data-selected]::before');
    expect(stylesheet).not.toContain('.dayButton[data-today] {');
    expect(todayDotRule).toContain('inset-block-end: 0.1875rem');
    expect(todayDotRule).toContain("content: ''");
    expect(todayDotRule).toContain('background: currentColor');
    expect(todayDotRule).toContain('border-radius: var(--ui-radius-pill)');
    expect(stylesheet).toContain(
      '.selectionButton {\n    inline-size: var(--ui-touch-target-min);\n    min-block-size: var(--ui-touch-target-min);',
    );
  });

  it('optically centers selectable cell labels without a state-specific shift', () => {
    const cellLabelRule = stylesheet.match(/\.cellLabel\s*\{([^}]*)\}/)?.[1];

    expect(cellLabelRule).toContain('display: inline-block');
    expect(cellLabelRule).toContain('transform: translateY(-0.0625rem)');
  });

  it('uses compact rounded icon-button surfaces for field actions', () => {
    const rootRule = stylesheet.match(/\.root\s*\{([^}]*)\}/)?.[1];
    const clearButtonRule = stylesheet.match(/\.clearButton\s*\{([^}]*)\}/)?.[1];
    const clearSurfaceRule = stylesheet.match(/\.clearButtonSurface\s*\{([^}]*)\}/)?.[1];
    const iconButtonRule = stylesheet.match(/\.iconButton\s*\{([^}]*)\}/)?.[1];
    const triggerButtonRule = stylesheet.match(/\.triggerButton\s*\{([^}]*)\}/)?.[1];

    expect(rootRule).toContain('--date-picker-clear-button-size: 1.5rem');
    expect(rootRule).toContain('--date-picker-clear-surface-size: 1rem');
    expect(clearButtonRule).toContain('var(--date-picker-clear-button-size)');
    expect(clearSurfaceRule).toContain('background:');
    expect(clearSurfaceRule).toContain('border-radius: var(--ui-radius-pill)');
    expect(iconButtonRule).toContain('padding: 0');
    expect(triggerButtonRule).toContain('border-radius: var(--ui-radius-pill)');
  });

  it('defines coordinated field and calendar-panel density for every size', () => {
    const smallRule = stylesheet.match(/\.sizeSm\s*\{([^}]*)\}/)?.[1];
    const mediumRule = stylesheet.match(/\.sizeMd\s*\{([^}]*)\}/)?.[1];
    const largeRule = stylesheet.match(/\.sizeLg\s*\{([^}]*)\}/)?.[1];
    const contentRule = stylesheet.match(/\.content\s*\{([^}]*)\}/)?.[1];
    const dayRule = stylesheet.match(/\.dayButton\s*\{([^}]*)\}/)?.[1];
    const selectionRule = stylesheet.match(/\.selectionButton\s*\{([^}]*)\}/)?.[1];

    expect(smallRule).toContain('--date-picker-panel-width: 16.5rem');
    expect(smallRule).toContain('--date-picker-panel-day-size: 1.75rem');
    expect(mediumRule).toContain('--date-picker-panel-width: 18.5rem');
    expect(mediumRule).toContain('--date-picker-panel-day-size: 2rem');
    expect(largeRule).toContain('--date-picker-panel-width: 20.5rem');
    expect(largeRule).toContain('--date-picker-panel-day-size: 2.25rem');
    expect(contentRule).toContain('inline-size: min(var(--date-picker-panel-width)');
    expect(stylesheet).toContain(
      '.navigationButton {\n  inline-size: var(--date-picker-panel-control-size);',
    );
    expect(dayRule).toContain('var(--date-picker-panel-day-size)');
    expect(selectionRule).toContain('var(--date-picker-panel-selection-size)');
    expect(stylesheet).toContain(
      'inline-size: min(max(var(--date-picker-panel-width), 22rem), calc(100vw - 32px))',
    );
  });

  it('swaps the decorative calendar indicator for clear on hover or field focus', () => {
    const clearButtonRule = stylesheet.match(/\.clearButton\s*\{([^}]*)\}/)?.[1];
    const trailingActionRule = stylesheet.match(/\.trailingAction\s*\{([^}]*)\}/)?.[1];
    const calendarIndicatorRule = stylesheet.match(/\.calendarIndicator\s*\{([^}]*)\}/)?.[1];

    expect(clearButtonRule).toContain('opacity: 0');
    expect(clearButtonRule).toContain('visibility: hidden');
    expect(clearButtonRule).toContain('pointer-events: none');
    expect(trailingActionRule).toContain('position: relative');
    expect(calendarIndicatorRule).toContain('pointer-events: none');
    expect(stylesheet).toContain(".trailingAction[data-clearable='true']:hover .calendarIndicator");
    expect(stylesheet).toContain(
      ".control:focus-within .trailingAction[data-clearable='true'] .calendarIndicator",
    );
    expect(stylesheet).toContain(".trailingAction[data-clearable='true']:hover .clearButton");
    expect(stylesheet).toContain(
      ".control:focus-within .trailingAction[data-clearable='true'] .clearButton",
    );
    expect(stylesheet).toContain('pointer-events: auto');
  });

  it('uses the control font and a quiet single-title calendar header', () => {
    const viewRule = stylesheet.match(/\.view\s*\{([^}]*)\}/)?.[1];
    const hiddenViewRule = stylesheet.match(/\.view\[hidden\]\s*\{([^}]*)\}/)?.[1];
    const viewControlRule = stylesheet.match(/\.viewControl\s*\{([^}]*)\}/)?.[1];
    const nestedViewControlRule = stylesheet.match(/\.nestedViewControl\s*\{([^}]*)\}/)?.[1];
    const viewPagingControlsRule = stylesheet.match(/\.viewPagingControls\s*\{([^}]*)\}/)?.[1];
    const viewTriggerRule = stylesheet.match(/\.viewTrigger\s*\{([^}]*)\}/)?.[1];
    const viewTitleRule = stylesheet.match(/\.viewTitle\s*\{([^}]*)\}/)?.[1];
    const rangeTextRule = stylesheet.match(/\.rangeText\s*\{([^}]*)\}/)?.[1];
    const tableHeaderRule = stylesheet.match(/\.tableHeader\s*\{([^}]*)\}/)?.[1];

    expect(stylesheet).not.toContain('--ui-font-family-sans');
    expect(stylesheet).not.toContain('--ui-font-weight-regular');
    expect(viewRule).toContain('gap: var(--date-picker-panel-view-gap)');
    expect(hiddenViewRule).toContain('display: none');
    expect(viewControlRule).toContain('var(--date-picker-panel-control-size)');
    expect(nestedViewControlRule).toContain(
      'calc(var(--date-picker-panel-control-size) * 2 + 0.25rem)',
    );
    expect(viewPagingControlsRule).toContain('display: flex');
    expect(viewPagingControlsRule).toContain('justify-content: flex-end');
    expect(stylesheet).toContain(
      '.navigationButton {\n  inline-size: var(--date-picker-panel-control-size);\n  block-size: var(--date-picker-panel-control-size);',
    );
    expect(viewTriggerRule).toContain('border: 0');
    expect(viewTriggerRule).toContain('background: transparent');
    expect(viewTriggerRule).toContain('justify-self: center');
    expect(viewTriggerRule).toContain('border-radius: var(--ui-radius-auto)');
    expect(viewTriggerRule).toContain(
      '500 var(--date-picker-panel-title-font-size) / 1.25 var(--ui-font-control)',
    );
    expect(viewTitleRule).toContain(
      '500 var(--date-picker-panel-title-font-size) / 1.25 var(--ui-font-control)',
    );
    expect(rangeTextRule).toContain('text-overflow: ellipsis');
    expect(stylesheet).not.toContain('.monthYearControls');
    expect(stylesheet).not.toContain('.calendarSelect');
    expect(tableHeaderRule).toContain('block-size: var(--date-picker-panel-weekday-height)');
    expect(tableHeaderRule).toContain('var(--date-picker-panel-weekday-font-size)');
  });

  it('centers square day surfaces and preserves coarse-pointer targets', () => {
    const dayButtonRule = stylesheet.match(/\.dayButton\s*\{([^}]*)\}/)?.[1];
    const selectedDayRule = stylesheet.match(/\.dayButton\[data-selected\]\s*\{([^}]*)\}/)?.[1];

    expect(dayButtonRule).toContain('display: inline-flex');
    expect(dayButtonRule).toContain('inline-size: var(--date-picker-panel-day-size)');
    expect(dayButtonRule).not.toContain('inline-size: 100%');
    expect(selectedDayRule).toContain('background: transparent');
    expect(stylesheet).toContain(
      '.navigationButton {\n    inline-size: var(--ui-touch-target-min);',
    );
    expect(stylesheet).toContain('.dayButton {\n    inline-size: var(--ui-touch-target-min);');
  });

  it('moves the visible month with the calendar navigation controls', async () => {
    const user = userEvent.setup();
    render(<DatePicker defaultOpen defaultValue={dateValue('2026-07-22')} />);

    await user.click(screen.getByRole('button', { name: 'Next month' }));
    await waitFor(() => {
      expect(
        document.querySelector('[data-part="view-trigger"][data-view="day"]'),
      ).toHaveTextContent('August 2026');
    });
  });

  it('drills into month and year views and returns to the day grid after selection', async () => {
    const user = userEvent.setup();
    render(<DatePicker defaultOpen defaultValue={dateValue('2026-07-22')} />);

    const dayViewTrigger = document.querySelector<HTMLButtonElement>(
      '[data-part="view-trigger"][data-view="day"]',
    );
    expect(dayViewTrigger).toBeVisible();
    await user.click(dayViewTrigger!);

    const monthViewTrigger = document.querySelector<HTMLButtonElement>(
      '[data-part="view-trigger"][data-view="month"]',
    );
    expect(monthViewTrigger).toBeVisible();
    expect(monthViewTrigger).toHaveTextContent('2026');
    expect(monthViewTrigger?.querySelector('svg')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'August 2026' })).toBeVisible();
    await user.click(monthViewTrigger!);

    const yearViewControl = document.querySelector('[data-part="view-control"][data-view="year"]');
    expect(yearViewControl).toBeVisible();
    expect(yearViewControl).toHaveTextContent('2020 - 2029');
    await user.click(screen.getByRole('button', { name: '2027' }));

    expect(monthViewTrigger).toBeVisible();
    expect(monthViewTrigger).toHaveTextContent('2027');
    await user.click(screen.getByRole('button', { name: 'August 2027' }));

    expect(dayViewTrigger).toBeVisible();
    expect(dayViewTrigger).toHaveTextContent('August 2027');
    expect(screen.getByRole('button', { name: /Choose Friday, August 6, 2027/i })).toBeVisible();
    expect(screen.getByRole('application', { name: 'calendar' })).toBeVisible();
  });

  it('returns through year and month views without changing the selected date', async () => {
    const user = userEvent.setup();
    render(
      <DatePicker
        defaultOpen
        defaultValue={dateValue('2026-07-22')}
        localeText={{ backToPreviousView: 'Return to previous calendar view' }}
      />,
    );

    const input = screen.getByRole('textbox');
    const dayViewTrigger = document.querySelector<HTMLButtonElement>(
      '[data-part="view-trigger"][data-view="day"]',
    );
    await user.click(dayViewTrigger!);

    const monthViewTrigger = document.querySelector<HTMLButtonElement>(
      '[data-part="view-trigger"][data-view="month"]',
    );
    await user.click(monthViewTrigger!);

    const backButton = screen.getByRole('button', {
      name: 'Return to previous calendar view',
    });
    await user.click(backButton);

    await waitFor(() => {
      expect(monthViewTrigger).toBeVisible();
      expect(document.activeElement).toHaveAttribute('data-view', 'month');
    });
    expect(input).toHaveValue('2026/07/22');
    expect(screen.getByRole('application', { name: 'calendar' })).toBeVisible();

    await user.click(
      screen.getByRole('button', {
        name: 'Return to previous calendar view',
      }),
    );

    await waitFor(() => {
      expect(dayViewTrigger).toBeVisible();
      expect(document.activeElement).toHaveAttribute('data-view', 'day');
    });
    expect(input).toHaveValue('2026/07/22');
    expect(screen.getByRole('application', { name: 'calendar' })).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Return to previous calendar view' }),
    ).not.toBeInTheDocument();
  });
});

describe('DatePicker states and validation', () => {
  it('disables interaction when disabled and keeps read-only input focusable', () => {
    const { rerender } = render(
      <DatePicker defaultValue={dateValue('2026-07-22')} disabled label="Date" />,
    );
    expect(screen.getByRole('textbox', { name: 'Date' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Open calendar' })).not.toBeInTheDocument();

    rerender(<DatePicker defaultValue={dateValue('2026-07-22')} label="Date" readOnly />);
    expect(screen.getByRole('textbox', { name: 'Date' })).toHaveAttribute('readonly');
  });

  it('supports custom labels for clear and calendar navigation actions', () => {
    render(
      <DatePicker
        clearable
        defaultOpen
        defaultValue={dateValue('2026-07-22')}
        localeText={{
          clearDate: 'Remove publication date',
          nextMonth: 'Show following month',
          previousMonth: 'Show previous month',
        }}
      />,
    );

    expect(screen.getByRole('button', { name: 'Remove publication date' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Show following month' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Show previous month' })).toBeInTheDocument();
  });

  it('rejects invalid canonical strings through the parsing boundary', () => {
    expect(() => dateValue('07/22/2026')).toThrow();
    expect(() => dateValue('2026-02-30')).toThrow();
  });

  it('keeps the popup inside a requested portal container', () => {
    const portalContainer = document.createElement('div');
    document.body.append(portalContainer);

    render(
      <DatePicker
        defaultOpen
        defaultValue={dateValue('2026-07-22')}
        portalContainer={portalContainer}
      />,
    );

    expect(within(portalContainer).getByRole('application', { name: 'calendar' })).toBeVisible();
  });
});
