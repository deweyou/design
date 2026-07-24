import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Time } from '@internationalized/date';

import { DateRangePicker } from '@deweyou-design/react/date-range-picker';
import {
  type DatePickerFormat,
  type DatePickerParse,
  parseDatePickerDateTimeValue,
  parseDatePickerValue,
} from '@deweyou-design/react/date-picker';

const dateValue = parseDatePickerValue;
const dateTimeValue = parseDatePickerDateTimeValue;
const dottedDateFormat: DatePickerFormat = (value) =>
  `${String(value.year).padStart(4, '0')}.${String(value.month).padStart(2, '0')}.${String(value.day).padStart(2, '0')}`;
const dottedDateParse: DatePickerParse = (input) => {
  const match = /^(\d{4})\.(\d{2})\.(\d{2})$/.exec(input.trim());
  if (!match) return undefined;

  try {
    return dateValue(`${match[1]}-${match[2]}-${match[3]}`);
  } catch {
    return undefined;
  }
};

const meta = {
  title: 'Components/DateRangePicker',
  component: DateRangePicker,
  tags: ['autodocs'],
  args: {
    clearable: true,
    defaultValue: {
      end: dateValue('2026-07-25'),
      start: dateValue('2026-07-22'),
    },
    hint: 'Choose one inclusive publishing period.',
    label: 'Publishing period',
  },
  argTypes: {
    defaultValue: {
      control: false,
      table: { type: { summary: 'DateRangePickerValue | DateRangePickerDateTimeValue | null' } },
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
        'Selects a contiguous date, month, or year range. Month mode can navigate to the year panel.',
      options: ['date', 'month', 'year'],
      table: { defaultValue: { summary: 'date' } },
    },
    parse: {
      control: false,
    },
    size: {
      control: { type: 'select' },
      description: 'Controls the density of both the unified field and calendar panel.',
      options: ['sm', 'md', 'lg'],
      table: { defaultValue: { summary: 'md' } },
    },
    showTime: {
      control: false,
      description:
        'Enables independent start and end wall-clock time wheels. Accepts true or DateRangePickerTimeOptions.',
      table: { type: { summary: 'boolean | DateRangePickerTimeOptions' } },
    },
    value: {
      control: false,
    },
    variant: {
      control: { type: 'select' },
      options: ['outlined', 'ghost'],
      table: { defaultValue: { summary: 'outlined' } },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'DateRangePicker selects one contiguous range through two real inputs in one visual field. It shares DatePicker modes, locale, constraints, formatting, sizing, and optional date-time wheels.',
      },
    },
  },
} satisfies Meta<typeof DateRangePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    clearable: true,
    defaultValue: {
      end: dateValue('2026-07-25'),
      start: dateValue('2026-07-22'),
    },
    hint: 'Choose one inclusive publishing period.',
    label: 'Publishing period',
  },
};

export const Modes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, inlineSize: 'min(100%, 440px)' }}>
      <DateRangePicker
        defaultValue={{
          end: dateValue('2026-07-25'),
          start: dateValue('2026-07-22'),
        }}
        label="Date range"
      />
      <DateRangePicker
        defaultValue={{
          end: dateValue('2026-10-01'),
          start: dateValue('2026-07-01'),
        }}
        label="Month range"
        mode="month"
      />
      <DateRangePicker
        defaultValue={{
          end: dateValue('2028-01-01'),
          start: dateValue('2026-01-01'),
        }}
        label="Year range"
        mode="year"
      />
    </div>
  ),
};

export const FormatAndParse: Story = {
  args: {
    format: dottedDateFormat,
    hint: 'Both inputs display YYYY.MM.DD and parse back into CalendarDate values.',
    parse: dottedDateParse,
  },
};

export const ShowTime: Story = {
  args: {
    defaultValue: {
      end: dateTimeValue('2026-07-25T18:30'),
      start: dateTimeValue('2026-07-22T09:15'),
    },
    hint: 'Edit each endpoint time independently, then confirm the complete range.',
    label: 'Booking period',
    showTime: true,
  },
};

export const ShowTimeConfigured: Story = {
  args: {
    defaultOpen: true,
    defaultValue: {
      end: dateTimeValue('2026-07-25T18:30'),
      start: dateTimeValue('2026-07-22T09:15'),
    },
    hint: 'Uses 24-hour time, 15-minute steps, endpoint defaults, and an opt-in Now action.',
    label: 'Configured booking period',
    showTime: {
      defaultTime: {
        end: new Time(18, 0),
        start: new Time(9, 0),
      },
      hourCycle: 24,
      minuteStep: 15,
      showNow: true,
    },
  },
};

export const Constraints: Story = {
  args: {
    defaultValue: {
      end: dateValue('2026-07-24'),
      start: dateValue('2026-07-22'),
    },
    hint: 'The range must stay inside July 20–31 and cannot include the unavailable weekend.',
    isDateUnavailable: (value: ReturnType<typeof dateValue>) =>
      value.day === 25 || value.day === 26,
    max: dateValue('2026-07-31'),
    min: dateValue('2026-07-20'),
  },
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, inlineSize: 'min(100%, 440px)' }}>
      <DateRangePicker clearable label="Empty range" />
      <DateRangePicker
        defaultValue={{
          end: dateValue('2026-07-25'),
          start: dateValue('2026-07-22'),
        }}
        error="Review the publishing period."
        label="Invalid range"
      />
      <DateRangePicker
        defaultValue={{
          end: dateValue('2026-07-25'),
          start: dateValue('2026-07-22'),
        }}
        label="Read-only range"
        readOnly
      />
      <DateRangePicker
        defaultValue={{
          end: dateValue('2026-07-25'),
          start: dateValue('2026-07-22'),
        }}
        disabled
        label="Disabled range"
      />
    </div>
  ),
};

export const Interaction: Story = {
  args: {
    defaultOpen: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const startInput = canvas.getByRole('textbox', { name: 'Publishing period Start date' });
    const endInput = canvas.getByRole('textbox', { name: 'Publishing period End date' });

    await waitFor(() => expect(page.getByRole('application', { name: 'calendar' })).toBeVisible());
    await userEvent.click(page.getByRole('button', { name: /Choose Monday, July 27, 2026/i }));
    await userEvent.click(page.getByRole('button', { name: /Choose Thursday, July 30, 2026/i }));

    await expect(startInput).toHaveValue('2026/07/27');
    await expect(endInput).toHaveValue('2026/07/30');
    await waitFor(() =>
      expect(page.queryByRole('application', { name: 'calendar' })).not.toBeInTheDocument(),
    );
  },
};

export const ShowTimeInteraction: Story = {
  args: {
    defaultOpen: true,
    defaultValue: {
      end: dateTimeValue('2026-07-25T18:30'),
      start: dateTimeValue('2026-07-22T09:15'),
    },
    label: 'Booking period',
    showTime: { hourCycle: 24 },
  },
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);

    const startTimeButton = await page.findByRole('button', {
      name: 'Start time 2026/07/22 09:15',
    });
    const endTimeButton = page.getByRole('button', {
      name: 'End time 2026/07/25 18:30',
    });
    const startDate = within(startTimeButton).getByText('2026/07/22');
    const endDate = within(endTimeButton).getByText('2026/07/25');
    await expect(startTimeButton).toBeVisible();
    await expect(startDate).toBeVisible();
    await expect(endDate).toBeVisible();
    await expect(startDate.scrollWidth).toBeLessThanOrEqual(startDate.clientWidth);
    await expect(endDate.scrollWidth).toBeLessThanOrEqual(endDate.clientWidth);
    await userEvent.click(startTimeButton);
    await userEvent.click(
      within(page.getByRole('listbox', { name: 'Hour' })).getByRole('option', {
        name: '10',
      }),
    );
    await userEvent.click(page.getByRole('button', { name: 'Confirm' }));

    await expect(
      within(canvasElement).getByRole('textbox', { name: 'Booking period Start date' }),
    ).toHaveValue('2026/07/22 10:15');
  },
};
