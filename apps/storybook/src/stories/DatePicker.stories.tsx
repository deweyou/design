import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  DatePicker,
  type DatePickerDateTimeValue,
  type DatePickerFormat,
  type DatePickerParse,
  parseDatePickerDateTimeValue,
  parseDatePickerValue,
} from '@deweyou-design/react/date-picker';

const dateValue = parseDatePickerValue;
const dateTimeValue = parseDatePickerDateTimeValue;
const dayFirstSlashFormat: DatePickerFormat = (value) =>
  `${String(value.day).padStart(2, '0')}/${String(value.month).padStart(2, '0')}/${value.year}`;
const dayFirstSlashParse: DatePickerParse = (input) => {
  const [day, month, year] = input.split('/').map(Number);

  if (!year || !month || !day) return undefined;

  try {
    return dateValue(
      `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    );
  } catch {
    return undefined;
  }
};
const dottedDateTimeFormat: DatePickerFormat<DatePickerDateTimeValue> = (value) =>
  `${String(value.year).padStart(4, '0')}.${String(value.month).padStart(2, '0')}.${String(value.day).padStart(2, '0')} · ${String(value.hour).padStart(2, '0')}:${String(value.minute).padStart(2, '0')}`;
const dottedDateTimeParse: DatePickerParse<DatePickerDateTimeValue> = (input) => {
  const match = /^(\d{4})\.(\d{2})\.(\d{2}) · (\d{2}):(\d{2})$/.exec(input.trim());
  if (!match) return undefined;

  try {
    return dateTimeValue(`${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}`);
  } catch {
    return undefined;
  }
};
const getCalendarCellTrigger = (document: Document, view: 'month' | 'year', index: number) => {
  const trigger = document.querySelectorAll<HTMLButtonElement>(
    `[data-part="table"][data-view="${view}"] [data-part="table-cell-trigger"]`,
  )[index];

  if (!trigger) {
    throw new Error(`Missing ${view} calendar cell at index ${index}.`);
  }

  return trigger;
};

const meta = {
  title: 'Components/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
  args: {
    clearable: true,
    defaultValue: dateValue('2026-07-22'),
    hint: 'Type a year-first value or choose from the calendar.',
    label: 'Published',
  },
  argTypes: {
    defaultValue: {
      control: false,
    },
    format: {
      control: false,
    },
    isDateUnavailable: {
      control: false,
    },
    localeText: {
      table: { type: { summary: 'DatePickerLocaleTextOverrides' } },
    },
    max: {
      control: false,
    },
    min: {
      control: false,
    },
    mode: {
      control: { type: 'select' },
      description:
        'Selects the date, month, or year granularity. Month mode can navigate to the year panel.',
      options: ['date', 'month', 'year'],
      table: { defaultValue: { summary: 'date' } },
    },
    parse: {
      control: false,
    },
    size: {
      control: { type: 'select' },
      description: 'Controls the density of both the field and calendar panel.',
      options: ['sm', 'md', 'lg'],
      table: { defaultValue: { summary: 'md' } },
    },
    showToday: {
      control: 'boolean',
      description: 'Shows the localized Today action in the calendar footer.',
      table: { defaultValue: { summary: 'false' } },
    },
    showTime: {
      control: false,
      description:
        'Enables date-time selection with a scroll-wheel time panel. Accepts true or DatePickerTimeOptions.',
      table: { type: { summary: 'boolean | DatePickerTimeOptions' } },
    },
    variant: {
      control: { type: 'select' },
      options: ['outlined', 'ghost'],
      table: { defaultValue: { summary: 'outlined' } },
    },
    value: {
      control: false,
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'DatePicker combines fixed year-first text entry with an accessible locale-aware Ark UI calendar. It uses CalendarDate by default and CalendarDateTime when showTime is enabled.',
      },
    },
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    clearable: true,
    defaultValue: dateValue('2026-07-22'),
    hint: 'Type a year-first value or choose from the calendar.',
    label: 'Published',
  },
};

export const DateMode: Story = {
  args: {
    hint: 'Select a specific calendar date.',
    label: 'Calendar date',
    mode: 'date',
  },
};

export const MonthMode: Story = {
  args: {
    hint: 'Select a month, or use the header to choose its year first.',
    label: 'Billing month',
    mode: 'month',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const input = canvas.getByRole('textbox', { name: 'Billing month' });
    const document = canvasElement.ownerDocument;

    await expect(input).toHaveValue('2026/07');
    await userEvent.click(input);
    await waitFor(() => expect(page.getByRole('application', { name: 'calendar' })).toBeVisible());

    const monthViewTrigger = document.querySelector<HTMLButtonElement>(
      '[data-part="view-trigger"][data-view="month"]',
    );
    await expect(monthViewTrigger).toBeVisible();
    await userEvent.click(monthViewTrigger!);
    await userEvent.click(page.getByRole('button', { name: '2027' }));
    await waitFor(() => expect(monthViewTrigger).toBeVisible());
    await userEvent.click(getCalendarCellTrigger(document, 'month', 7));

    await expect(input).toHaveValue('2027/08');
    await waitFor(() =>
      expect(page.queryByRole('application', { name: 'calendar' })).not.toBeInTheDocument(),
    );
  },
};

export const YearMode: Story = {
  args: {
    hint: 'Select a calendar year.',
    label: 'Reporting year',
    mode: 'year',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const input = canvas.getByRole('textbox', { name: 'Reporting year' });

    await expect(input).toHaveValue('2026');
    await userEvent.click(input);
    await waitFor(() => expect(page.getByRole('button', { name: '2028' })).toBeVisible());
    await userEvent.click(page.getByRole('button', { name: '2028' }));

    await expect(input).toHaveValue('2028');
    await waitFor(() =>
      expect(page.queryByRole('application', { name: 'calendar' })).not.toBeInTheDocument(),
    );
  },
};

export const Modes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, inlineSize: 'min(100%, 360px)' }}>
      <DatePicker
        defaultValue={dateValue('2026-07-22')}
        hint="Select a calendar date."
        label="Date"
      />
      <DatePicker
        defaultValue={dateValue('2026-07-22')}
        hint="Select a month, with year navigation available."
        label="Month"
        mode="month"
      />
      <DatePicker
        defaultValue={dateValue('2026-07-22')}
        hint="Select a year."
        label="Year"
        mode="year"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const monthInput = canvas.getByRole('textbox', { name: 'Month' });
    const yearInput = canvas.getByRole('textbox', { name: 'Year' });

    await expect(canvas.getByRole('textbox', { name: 'Date' })).toHaveValue('2026/07/22');
    await expect(monthInput).toHaveValue('2026/07');
    await expect(yearInput).toHaveValue('2026');

    await userEvent.click(monthInput);
    await waitFor(() => expect(page.getByRole('application', { name: 'calendar' })).toBeVisible());

    const monthViewTrigger = canvasElement.ownerDocument.querySelector<HTMLButtonElement>(
      '[data-part="view-trigger"][data-view="month"]',
    );
    await expect(monthViewTrigger).toBeVisible();
    await userEvent.click(monthViewTrigger!);
    await userEvent.click(page.getByRole('button', { name: '2027' }));
    await userEvent.click(getCalendarCellTrigger(canvasElement.ownerDocument, 'month', 7));
    await expect(monthInput).toHaveValue('2027/08');

    await userEvent.click(yearInput);
    await waitFor(() => expect(page.getByRole('button', { name: '2028' })).toBeVisible());
    await userEvent.click(page.getByRole('button', { name: '2028' }));
    await expect(yearInput).toHaveValue('2028');
  },
};

export const SizesAndVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, inlineSize: 'min(100%, 360px)' }}>
      <DatePicker defaultValue={dateValue('2026-07-22')} label="Small" size="sm" />
      <DatePicker defaultValue={dateValue('2026-07-22')} label="Medium" />
      <DatePicker defaultValue={dateValue('2026-07-22')} label="Large" size="lg" />
      <DatePicker defaultValue={dateValue('2026-07-22')} label="Ghost" variant="ghost" />
    </div>
  ),
};

export const FormatAndParse: Story = {
  args: {
    format: dayFirstSlashFormat,
    hint: 'Displayed as DD/MM/YYYY and parsed back into CalendarDate when you type.',
    label: 'Published with a custom format',
    parse: dayFirstSlashParse,
  },
  parameters: {
    docs: {
      description: {
        story:
          '`format` controls the text shown in the input. The matching `parse` callback converts edited text back into the semantic `CalendarDate` value.',
      },
    },
  },
};

export const ShowTime: Story = {
  args: {
    defaultValue: dateTimeValue('2026-07-22T14:30'),
    hint: 'Choose a calendar date and wall-clock time, then confirm.',
    label: 'Published at',
    showTime: true,
  },
};

export const ShowTimeConfigured: Story = {
  args: {
    defaultOpen: true,
    defaultValue: dateTimeValue('2026-07-22T14:30:15'),
    hint: 'Uses 24-hour time, seconds, 15-unit wheel steps, and an opt-in Now action.',
    label: 'Published with seconds',
    showTime: {
      granularity: 'second',
      hourCycle: 24,
      minuteStep: 15,
      secondStep: 15,
      showNow: true,
    },
  },
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);

    await waitFor(() => expect(page.getByRole('application', { name: 'calendar' })).toBeVisible());
    await userEvent.click(page.getByRole('button', { name: /14:30:15/ }));
    await expect(page.getByRole('button', { name: /^(Now|此刻|現在|현재)$/ })).toBeVisible();
  },
};

export const ShowTimeFormatAndParse: Story = {
  args: {
    defaultValue: dateTimeValue('2026-07-22T14:30'),
    format: dottedDateTimeFormat,
    hint: 'Displayed as YYYY.MM.DD · HH:mm and parsed back into CalendarDateTime.',
    label: 'Custom date and time format',
    parse: dottedDateTimeParse,
    showTime: { hourCycle: 24 },
  },
};

export const Constraints: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, inlineSize: 'min(100%, 360px)' }}>
      <DatePicker
        defaultValue={dateValue('2026-07-22')}
        hint="Only weekdays from July 20 to July 31 are available."
        isDateUnavailable={(value) => {
          return value.day === 25 || value.day === 26;
        }}
        label="Delivery date"
        max={dateValue('2026-07-31')}
        min={dateValue('2026-07-20')}
      />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, inlineSize: 'min(100%, 360px)' }}>
      <DatePicker clearable label="Empty" />
      <DatePicker
        defaultValue={dateValue('2026-07-22')}
        error="Choose a future publication date."
        label="Invalid"
      />
      <DatePicker defaultValue={dateValue('2026-07-22')} label="Read only" readOnly />
      <DatePicker defaultValue={dateValue('2026-07-22')} disabled label="Disabled" />
    </div>
  ),
};

export const Interaction: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, inlineSize: 'min(100%, 360px)' }}>
      <DatePicker clearable defaultValue={dateValue('2026-07-22')} label="Release date" showToday />
      <DatePicker
        defaultValue={dateValue('2026-07-22')}
        error="The date needs review."
        label="Invalid date"
      />
      <DatePicker defaultValue={dateValue('2026-07-22')} disabled label="Disabled date" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const input = canvas.getByRole('textbox', { name: 'Release date' });

    await expect(input).toHaveValue('2026/07/22');
    await expect(canvas.queryByRole('button', { name: 'Open calendar' })).not.toBeInTheDocument();
    await userEvent.click(input);
    await waitFor(() => expect(page.getByRole('application', { name: 'calendar' })).toBeVisible());

    const document = canvasElement.ownerDocument;
    const dayViewTrigger = document.querySelector<HTMLButtonElement>(
      '[data-part="view-trigger"][data-view="day"]',
    );
    await expect(dayViewTrigger).toBeVisible();
    await expect(dayViewTrigger).toHaveTextContent('July 2026');
    await userEvent.click(dayViewTrigger!);

    const monthViewTrigger = document.querySelector<HTMLButtonElement>(
      '[data-part="view-trigger"][data-view="month"]',
    );
    await expect(monthViewTrigger).toBeVisible();
    await expect(page.getByRole('button', { name: 'August 2026' })).toBeVisible();
    await userEvent.click(page.getByRole('button', { name: 'Back to previous calendar view' }));
    await waitFor(() => expect(dayViewTrigger).toBeVisible());
    await expect(document.activeElement).toHaveAttribute('data-view', 'day');

    await userEvent.click(dayViewTrigger!);
    await userEvent.click(monthViewTrigger!);

    const yearViewControl = document.querySelector('[data-part="view-control"][data-view="year"]');
    await expect(yearViewControl).toBeVisible();
    await expect(yearViewControl).toHaveTextContent('2020 - 2029');
    await userEvent.click(page.getByRole('button', { name: 'Back to previous calendar view' }));
    await waitFor(() => expect(monthViewTrigger).toBeVisible());
    await expect(document.activeElement).toHaveAttribute('data-view', 'month');

    await userEvent.click(monthViewTrigger!);
    await userEvent.click(page.getByRole('button', { name: '2026' }));
    await userEvent.click(page.getByRole('button', { name: 'August 2026' }));

    await userEvent.click(page.getByRole('button', { name: /Choose Thursday, August 6, 2026/i }));
    await expect(canvas.getByRole('textbox', { name: 'Release date' })).toHaveValue('2026/08/06');

    await userEvent.click(input);
    await expect(canvas.getByRole('button', { name: 'Clear date' })).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Clear date' }));
    await expect(canvas.getByRole('textbox', { name: 'Release date' })).toHaveValue('');
    await expect(canvas.queryByRole('button', { name: 'Clear date' })).not.toBeInTheDocument();

    const clearedInput = canvas.getByRole('textbox', { name: 'Release date' });
    await userEvent.type(clearedInput, '2026-08-07');
    await waitFor(() => {
      const input = canvas.getByRole<HTMLInputElement>('textbox', { name: 'Release date' });
      if (input.value !== '2026/08/07') {
        throw new Error(`Expected the normalized input value, received "${input.value}".`);
      }
    });
    await userEvent.keyboard('{Enter}');
    await waitFor(() => {
      const input = canvas.getByRole<HTMLInputElement>('textbox', { name: 'Release date' });
      if (input.value !== '2026/08/07') {
        throw new Error(`Expected the committed input value, received "${input.value}".`);
      }
    });
    await userEvent.click(canvas.getByRole('button', { name: 'Clear date' }));
    await waitFor(() => {
      const input = canvas.getByRole<HTMLInputElement>('textbox', { name: 'Release date' });
      if (input.value !== '') {
        throw new Error(`Expected the cleared input value, received "${input.value}".`);
      }
    });

    await userEvent.click(canvas.getByRole('textbox', { name: 'Release date' }));
    await userEvent.click(page.getByRole('button', { name: 'Today' }));
    await waitFor(() =>
      expect(page.queryByRole('application', { name: 'calendar' })).not.toBeInTheDocument(),
    );
    await expect(canvas.getByRole('textbox', { name: 'Release date' })).not.toHaveValue('');

    await expect(canvas.getByText('The date needs review.')).toBeInTheDocument();
    await expect(canvas.getByRole('textbox', { name: 'Disabled date' })).toBeDisabled();
  },
};

export const ShowTimeInteraction: Story = {
  args: {
    defaultOpen: true,
    defaultValue: dateTimeValue('2026-07-22T14:30'),
    label: 'Release time',
    showTime: { hourCycle: 24 },
    showToday: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await waitFor(() => expect(page.getByRole('application', { name: 'calendar' })).toBeVisible());
    await userEvent.click(page.getByRole('button', { name: /Choose Thursday, July 23, 2026/i }));
    await waitFor(() =>
      expect(canvas.getByRole('textbox', { name: 'Release time' })).toHaveValue('2026/07/23 14:30'),
    );

    await userEvent.click(page.getByRole('button', { name: 'Time 14:30' }));
    await userEvent.click(
      within(page.getByRole('listbox', { name: 'Hour' })).getByRole('option', {
        name: '15',
      }),
    );
    await userEvent.click(
      within(page.getByRole('listbox', { name: 'Minute' })).getByRole('option', {
        name: '45',
      }),
    );
    await userEvent.click(page.getByRole('button', { name: 'Confirm' }));

    await waitFor(() =>
      expect(canvas.getByRole('textbox', { name: 'Release time' })).toHaveValue('2026/07/23 15:45'),
    );
    await waitFor(() =>
      expect(page.queryByRole('application', { name: 'calendar' })).not.toBeInTheDocument(),
    );
  },
};
