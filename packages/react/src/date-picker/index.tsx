import { type CSSProperties, type ReactNode, useCallback, useId, useMemo } from 'react';
import {
  DatePicker as ArkDatePicker,
  type DatePickerDateView as ArkDateView,
  type DateValue as ArkDateValue,
} from '@ark-ui/react/date-picker';
import {
  type CalendarDate,
  type CalendarDateTime,
  parseDate,
  type Time,
  toCalendarDate,
} from '@internationalized/date';
import classNames from 'classnames';

import { useConfigLocale } from '../config-provider/context.ts';
import { Field } from '../field/index.tsx';
import { DatePickerCalendar, DatePickerPortal } from './calendar.tsx';
import { DatePickerControl } from './control.tsx';
import styles from './index.module.less';
import { useDatePickerLocaleText } from './locale/loader.ts';
import type { DatePickerLocaleTextOverrides } from './locale/types.ts';
import { DatePickerWithTime, parseDatePickerDateTimeValue } from './time-picker.tsx';

export type DatePickerSize = 'sm' | 'md' | 'lg';

export type DatePickerVariant = 'outlined' | 'ghost';

export type DatePickerMode = 'date' | 'month' | 'year';

export type DatePickerValue = CalendarDate;

export type DatePickerDateTimeValue = CalendarDateTime;

export type DatePickerTimeGranularity = 'minute' | 'second';

export type DatePickerTimeOptions = {
  /** Time applied when the first calendar date is selected from an empty value. */
  defaultTime?: Time;
  /** Overrides the locale-derived 12 or 24 hour cycle. */
  hourCycle?: 12 | 24;
  /** Smallest editable time unit. @default 'minute' */
  granularity?: DatePickerTimeGranularity;
  /** Interval between hour options. @default 1 */
  hourStep?: number;
  /** Interval between minute options. @default 1 */
  minuteStep?: number;
  /** Interval between second options. @default 1 */
  secondStep?: number;
  /** Shows a localized action that applies the current local wall-clock time to the draft. @default false */
  showNow?: boolean;
  /** Returns whether a complete date-time must not be selected. */
  isTimeUnavailable?: (value: DatePickerDateTimeValue) => boolean;
};

export type DatePickerTextTransformDetails = {
  locale: string;
};

type DatePickerSemanticValue = DatePickerValue | DatePickerDateTimeValue;

export type DatePickerFormat<TValue extends DatePickerSemanticValue = DatePickerValue> = (
  value: TValue,
  details: DatePickerTextTransformDetails,
) => string;

export type DatePickerParse<TValue extends DatePickerSemanticValue = DatePickerValue> = (
  value: string,
  details: DatePickerTextTransformDetails,
) => TValue | undefined;

export type DatePickerValueChangeDetails<TValue extends DatePickerSemanticValue = DatePickerValue> =
  {
    value: TValue | null;
  };

export type DatePickerOpenChangeDetails = {
  open: boolean;
};

type DatePickerTextTransformProps<TValue extends DatePickerSemanticValue> =
  | {
      format?: undefined;
      parse?: undefined;
    }
  | {
      /** Formats the semantic date shown in the text input. Must be paired with parse. */
      format: DatePickerFormat<TValue>;
      /** Parses text input into a semantic date. Must be paired with format. */
      parse: DatePickerParse<TValue>;
    };

type DatePickerSharedProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (details: DatePickerOpenChangeDetails) => void;
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  id?: string;
  name?: string;
  form?: string;
  placeholder?: string;
  autoFocus?: boolean;
  autoComplete?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  clearable?: boolean;
  /** Shows the localized Today action in the calendar footer. */
  showToday?: boolean;
  /** Overrides localized copy inherited from ConfigProvider. */
  localeText?: DatePickerLocaleTextOverrides;
  size?: DatePickerSize;
  variant?: DatePickerVariant;
  portalContainer?: HTMLElement | null;
  className?: string;
  style?: CSSProperties;
};

export type DatePickerDateProps = DatePickerSharedProps & {
  /** Controlled calendar date. Pass null when no date is selected. */
  value?: DatePickerValue | null;
  /** Initial calendar date for uncontrolled usage. */
  defaultValue?: DatePickerValue | null;
  onValueChange?: (details: DatePickerValueChangeDetails) => void;
  /** Earliest selectable calendar date. */
  min?: DatePickerValue;
  /** Latest selectable calendar date. */
  max?: DatePickerValue;
  isDateUnavailable?: (value: DatePickerValue) => boolean;
  /**
   * The minimum selectable calendar unit.
   * Date mode may navigate through month and year views, month mode may navigate
   * to years, and year mode stays on the year grid.
   * @default 'date'
   */
  mode?: DatePickerMode;
  showTime?: false | undefined;
} & DatePickerTextTransformProps<DatePickerValue>;

export type DatePickerDateTimeProps = DatePickerSharedProps & {
  /** Controlled date and wall-clock time. Pass null when no value is selected. */
  value?: DatePickerDateTimeValue | null;
  /** Initial date and wall-clock time for uncontrolled usage. */
  defaultValue?: DatePickerDateTimeValue | null;
  onValueChange?: (details: DatePickerValueChangeDetails<DatePickerDateTimeValue>) => void;
  /** Earliest selectable date and wall-clock time. */
  min?: DatePickerDateTimeValue;
  /** Latest selectable date and wall-clock time. */
  max?: DatePickerDateTimeValue;
  isDateUnavailable?: (value: DatePickerDateTimeValue) => boolean;
  /** Time-enabled selection always uses the date panel. */
  mode?: 'date';
  /** Enables date-time selection and optionally configures the time wheel. */
  showTime: true | DatePickerTimeOptions;
} & DatePickerTextTransformProps<DatePickerDateTimeValue>;

export type DatePickerProps = DatePickerDateProps | DatePickerDateTimeProps;

const sizeClassMap: Record<DatePickerSize, string> = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
};

const variantClassMap: Record<DatePickerVariant, string> = {
  outlined: styles.variantOutlined,
  ghost: styles.variantGhost,
};

const arkViewMap: Record<DatePickerMode, ArkDateView> = {
  date: 'day',
  month: 'month',
  year: 'year',
};

const defaultPlaceholderMap: Record<DatePickerMode, string> = {
  date: 'YYYY/MM/DD',
  month: 'YYYY/MM',
  year: 'YYYY',
};

const normalizeDatePickerValue = (
  value: DatePickerValue,
  mode: DatePickerMode,
): DatePickerValue => {
  if (mode === 'month') return value.set({ day: 1 });
  if (mode === 'year') return value.set({ month: 1, day: 1 });
  return value;
};

const defaultDatePickerFormatMap: Record<DatePickerMode, DatePickerFormat> = {
  date: (value) =>
    `${String(value.year).padStart(4, '0')}/${String(value.month).padStart(2, '0')}/${String(value.day).padStart(2, '0')}`,
  month: (value) =>
    `${String(value.year).padStart(4, '0')}/${String(value.month).padStart(2, '0')}`,
  year: (value) => String(value.year).padStart(4, '0'),
};

const defaultDatePickerInputPatternMap: Record<DatePickerMode, RegExp> = {
  date: /^(\d{4})([/ -])(\d{2})\2(\d{2})$/,
  month: /^(\d{4})([/ -])(\d{2})$/,
  year: /^(\d{4})$/,
};

const createDefaultDatePickerParse =
  (mode: DatePickerMode): DatePickerParse =>
  (value) => {
    const match = defaultDatePickerInputPatternMap[mode].exec(value.trim());

    if (!match) return undefined;

    const canonicalValue =
      mode === 'date'
        ? `${match[1]}-${match[3]}-${match[4]}`
        : mode === 'month'
          ? `${match[1]}-${match[3]}-01`
          : `${match[1]}-01-01`;

    try {
      return parseDate(canonicalValue);
    } catch {
      return undefined;
    }
  };

export const parseDatePickerValue = (value: string): DatePickerValue => parseDate(value);

const DateOnlyPicker = ({
  value,
  defaultValue,
  onValueChange,
  open,
  defaultOpen,
  onOpenChange,
  min,
  max,
  isDateUnavailable,
  mode = 'date',
  label,
  hint,
  error,
  required,
  disabled,
  readOnly,
  id,
  name,
  form,
  placeholder,
  autoFocus,
  autoComplete,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  clearable,
  showToday = false,
  format,
  localeText,
  parse,
  size = 'md',
  variant = 'outlined',
  portalContainer,
  className,
  style,
}: DatePickerDateProps) => {
  if (Boolean(format) !== Boolean(parse)) {
    throw new Error('DatePicker format and parse must be provided together.');
  }

  const reactId = useId();
  const locale = useConfigLocale();
  const text = useDatePickerLocaleText(localeText);
  const fieldId = id?.length ? id : `date-picker-field-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const hasError = Boolean(error);
  const hasHint = Boolean(hint);
  const ids = useMemo(
    () => ({
      clearTrigger: `${fieldId}-clear`,
      content: `${fieldId}-content`,
      control: `${fieldId}-control`,
      input: () => fieldId,
      positioner: `${fieldId}-positioner`,
      root: `${fieldId}-root`,
    }),
    [fieldId],
  );
  const handleValueChange = useCallback(
    (details: { value: ArkDateValue[] }) => {
      onValueChange?.({
        value: details.value[0]
          ? normalizeDatePickerValue(toCalendarDate(details.value[0]), mode)
          : null,
      });
    },
    [mode, onValueChange],
  );
  const handleOpenChange = useCallback(
    (details: { open: boolean }) => {
      onOpenChange?.({ open: details.open });
    },
    [onOpenChange],
  );
  const handleDateUnavailable = useCallback(
    (date: ArkDateValue) =>
      isDateUnavailable?.(normalizeDatePickerValue(toCalendarDate(date), mode)) ?? false,
    [isDateUnavailable, mode],
  );
  const resolvedFormat = format ?? defaultDatePickerFormatMap[mode];
  const resolvedParse = parse ?? createDefaultDatePickerParse(mode);
  const handleFormat = useCallback(
    (date: ArkDateValue, details: { locale: string }) =>
      resolvedFormat(normalizeDatePickerValue(toCalendarDate(date), mode), {
        locale: details.locale,
      }),
    [mode, resolvedFormat],
  );
  const handleParse = useCallback(
    (inputValue: string, details: { locale: string }) => {
      const parsedValue = resolvedParse(inputValue, { locale: details.locale });
      return parsedValue ? normalizeDatePickerValue(parsedValue, mode) : undefined;
    },
    [mode, resolvedParse],
  );
  const minimumView = arkViewMap[mode];
  const normalizedValue = value ? normalizeDatePickerValue(value, mode) : value;
  const normalizedDefaultValue = defaultValue
    ? normalizeDatePickerValue(defaultValue, mode)
    : defaultValue;
  const normalizedMin = min ? normalizeDatePickerValue(min, mode) : undefined;
  const normalizedMax = max ? normalizeDatePickerValue(max, mode) : undefined;

  return (
    <Field.Root
      className={classNames(styles.root, sizeClassMap[size], className)}
      data-readonly={readOnly ? 'true' : undefined}
      disabled={disabled}
      hasDescription={hasHint}
      hasError={hasError}
      id={fieldId}
      invalid={hasError}
      required={required}
      style={style}
    >
      {label && <Field.Label className={styles.label}>{label}</Field.Label>}
      <ArkDatePicker.Root
        key={mode}
        className={classNames(styles.machine, variantClassMap[variant])}
        closeOnSelect
        defaultOpen={defaultOpen}
        defaultValue={normalizedDefaultValue ? [normalizedDefaultValue] : []}
        defaultView={minimumView}
        disabled={disabled}
        fixedWeeks={false}
        format={handleFormat}
        ids={ids}
        invalid={hasError}
        isDateUnavailable={isDateUnavailable ? handleDateUnavailable : undefined}
        lazyMount
        locale={locale}
        max={normalizedMax}
        maxView="year"
        min={normalizedMin}
        minView={minimumView}
        name={name}
        onOpenChange={handleOpenChange}
        onValueChange={handleValueChange}
        open={open}
        openOnClick
        parse={handleParse}
        placeholder={placeholder ?? defaultPlaceholderMap[mode]}
        positioning={{ placement: 'bottom-start', gutter: 8 }}
        readOnly={readOnly}
        required={required}
        selectionMode="single"
        unmountOnExit
        value={normalizedValue === undefined ? undefined : normalizedValue ? [normalizedValue] : []}
      >
        <DatePickerControl
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          clearable={clearable}
          clearLabel={text.clearDate}
          disabled={disabled}
          form={form}
          normalizeAlternateSeparators={format ? false : 'date'}
          readOnly={readOnly}
        />
        <DatePickerPortal container={portalContainer}>
          <DatePickerCalendar
            closeOnToday
            disabled={disabled || readOnly}
            localeText={text}
            minimumView={minimumView}
            showToday={showToday}
            size={size}
          />
        </DatePickerPortal>
      </ArkDatePicker.Root>
      {hint && <Field.Description className={styles.hint}>{hint}</Field.Description>}
      {hasError && <Field.ErrorText className={styles.error}>{error}</Field.ErrorText>}
    </Field.Root>
  );
};

const hasTimeSelection = (props: DatePickerProps): props is DatePickerDateTimeProps =>
  props.showTime !== undefined && props.showTime !== false;

export const DatePicker = (props: DatePickerProps) => {
  if (hasTimeSelection(props)) {
    if (props.mode !== undefined && props.mode !== 'date') {
      throw new Error('DatePicker showTime only supports mode="date".');
    }
    return <DatePickerWithTime {...props} />;
  }

  return <DateOnlyPicker {...props} />;
};

export { parseDatePickerDateTimeValue };
export type { DatePickerLocaleText, DatePickerLocaleTextOverrides } from './locale/types.ts';
