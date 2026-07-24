import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
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
import { DatePickerCalendar, DatePickerPortal } from '../date-picker/calendar.tsx';
import datePickerStyles from '../date-picker/index.module.less';
import type {
  DatePickerFormat,
  DatePickerMode,
  DatePickerOpenChangeDetails,
  DatePickerParse,
  DatePickerSize,
  DatePickerTextTransformDetails,
  DatePickerTimeOptions,
  DatePickerVariant,
} from '../date-picker/index.tsx';
import { useDatePickerLocaleText } from '../date-picker/locale/loader.ts';
import type { DatePickerLocaleTextOverrides } from '../date-picker/locale/types.ts';
import { Field } from '../field/index.tsx';
import {
  type DateRangePickerApi,
  DateRangePickerApiBridge,
  DateRangePickerControl,
  type DateRangePickerEndpoint,
} from './control.tsx';
import styles from './index.module.less';
import { DateRangePickerWithTime } from './time-picker.tsx';

export type DateRangePickerValue = {
  start: CalendarDate;
  end: CalendarDate;
};

export type DateRangePickerDateTimeValue = {
  start: CalendarDateTime;
  end: CalendarDateTime;
};

export type DateRangePickerTimeOptions = Omit<DatePickerTimeOptions, 'defaultTime'> & {
  /** Times applied when calendar dates are selected without existing endpoint times. */
  defaultTime?: {
    start?: Time;
    end?: Time;
  };
};

export type DateRangePickerValueChangeDetails<
  TValue extends DateRangePickerValue | DateRangePickerDateTimeValue = DateRangePickerValue,
> = {
  value: TValue | null;
};

export type DateRangePickerPlaceholder = {
  start?: string;
  end?: string;
};

type DateRangePickerSharedProps = {
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
  startName?: string;
  endName?: string;
  form?: string;
  placeholder?: DateRangePickerPlaceholder;
  autoFocus?: boolean;
  autoComplete?: string;
  startAriaLabel?: string;
  endAriaLabel?: string;
  clearable?: boolean;
  showToday?: boolean;
  localeText?: DatePickerLocaleTextOverrides;
  size?: DatePickerSize;
  variant?: DatePickerVariant;
  portalContainer?: HTMLElement | null;
  className?: string;
  style?: CSSProperties;
};

type DateRangePickerTextTransformProps<TValue extends CalendarDate | CalendarDateTime> =
  | {
      format?: undefined;
      parse?: undefined;
    }
  | {
      format: DatePickerFormat<TValue>;
      parse: DatePickerParse<TValue>;
    };

export type DateRangePickerDateProps = DateRangePickerSharedProps & {
  value?: DateRangePickerValue | null;
  defaultValue?: DateRangePickerValue | null;
  onValueChange?: (details: DateRangePickerValueChangeDetails) => void;
  min?: CalendarDate;
  max?: CalendarDate;
  isDateUnavailable?: (value: CalendarDate) => boolean;
  mode?: DatePickerMode;
  showTime?: false | undefined;
} & DateRangePickerTextTransformProps<CalendarDate>;

export type DateRangePickerDateTimeProps = DateRangePickerSharedProps & {
  value?: DateRangePickerDateTimeValue | null;
  defaultValue?: DateRangePickerDateTimeValue | null;
  onValueChange?: (
    details: DateRangePickerValueChangeDetails<DateRangePickerDateTimeValue>,
  ) => void;
  min?: CalendarDateTime;
  max?: CalendarDateTime;
  isDateUnavailable?: (value: CalendarDateTime) => boolean;
  mode?: 'date';
  showTime: true | DateRangePickerTimeOptions;
} & DateRangePickerTextTransformProps<CalendarDateTime>;

export type DateRangePickerProps = DateRangePickerDateProps | DateRangePickerDateTimeProps;

const sizeClassMap: Record<DatePickerSize, string> = {
  sm: datePickerStyles.sizeSm,
  md: datePickerStyles.sizeMd,
  lg: datePickerStyles.sizeLg,
};

const variantClassMap: Record<DatePickerVariant, string> = {
  outlined: datePickerStyles.variantOutlined,
  ghost: datePickerStyles.variantGhost,
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

const normalizeDateRangePickerValue = (value: CalendarDate, mode: DatePickerMode): CalendarDate => {
  if (mode === 'month') return value.set({ day: 1 });
  if (mode === 'year') return value.set({ month: 1, day: 1 });
  return value;
};

const defaultFormatMap: Record<DatePickerMode, DatePickerFormat> = {
  date: (value) =>
    `${String(value.year).padStart(4, '0')}/${String(value.month).padStart(2, '0')}/${String(value.day).padStart(2, '0')}`,
  month: (value) =>
    `${String(value.year).padStart(4, '0')}/${String(value.month).padStart(2, '0')}`,
  year: (value) => String(value.year).padStart(4, '0'),
};

const defaultInputPatternMap: Record<DatePickerMode, RegExp> = {
  date: /^(\d{4})([/ -])(\d{2})\2(\d{2})$/,
  month: /^(\d{4})([/ -])(\d{2})$/,
  year: /^(\d{4})$/,
};

const createDefaultParse =
  (mode: DatePickerMode): DatePickerParse =>
  (value) => {
    const match = defaultInputPatternMap[mode].exec(value.trim());
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

const normalizeRange = (
  value: DateRangePickerValue | null | undefined,
  mode: DatePickerMode,
  propName: 'value' | 'defaultValue',
) => {
  if (!value) return value;

  const range = {
    start: normalizeDateRangePickerValue(value.start, mode),
    end: normalizeDateRangePickerValue(value.end, mode),
  };
  if (range.start.compare(range.end) > 0) {
    throw new RangeError(`DateRangePicker ${propName} start must not be after end.`);
  }
  return range;
};

const rangeToArray = (value: DateRangePickerValue | null | undefined): CalendarDate[] =>
  value ? [value.start, value.end] : [];

const hasTimeSelection = (props: DateRangePickerProps): props is DateRangePickerDateTimeProps =>
  props.showTime !== undefined && props.showTime !== false;

const DateOnlyRangePicker = ({
  value,
  defaultValue,
  onValueChange,
  open,
  defaultOpen = false,
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
  startName,
  endName,
  form,
  placeholder,
  autoFocus,
  autoComplete,
  startAriaLabel,
  endAriaLabel,
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
}: DateRangePickerDateProps) => {
  if (Boolean(format) !== Boolean(parse)) {
    throw new Error('DateRangePicker format and parse must be provided together.');
  }

  const reactId = useId();
  const locale = useConfigLocale();
  const text = useDatePickerLocaleText(localeText);
  const fieldId = id?.length
    ? id
    : `date-range-picker-field-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const endInputId = `${fieldId}-end`;
  const fieldLabelId = `${fieldId}-label`;
  const startLabelId = `${fieldId}-start-label`;
  const endLabelId = `${fieldId}-end-label`;
  const hasError = Boolean(error);
  const hasHint = Boolean(hint);
  const normalizedControlledValue = normalizeRange(value, mode, 'value');
  const normalizedDefaultValue = normalizeRange(defaultValue, mode, 'defaultValue') ?? null;
  const [uncontrolledValue, setUncontrolledValue] = useState<DateRangePickerValue | null>(
    normalizedDefaultValue,
  );
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const datePickerApiRef = useRef<DateRangePickerApi | null>(null);
  const resolvedValue =
    value === undefined ? uncontrolledValue : (normalizedControlledValue ?? null);
  const resolvedOpen = open === undefined ? uncontrolledOpen : open;
  const [draftValues, setDraftValues] = useState<CalendarDate[]>(rangeToArray(resolvedValue));
  const [activeEndpoint, setActiveEndpoint] = useState<DateRangePickerEndpoint>('start');
  const displayedValues = resolvedOpen ? draftValues : rangeToArray(resolvedValue);
  const minimumView = arkViewMap[mode];
  const normalizedMin = min ? normalizeDateRangePickerValue(min, mode) : undefined;
  const normalizedMax = max ? normalizeDateRangePickerValue(max, mode) : undefined;
  const resolvedFormat = format ?? defaultFormatMap[mode];
  const resolvedParse = parse ?? createDefaultParse(mode);
  const ids = useMemo(
    () => ({
      clearTrigger: `${fieldId}-clear`,
      content: `${fieldId}-content`,
      control: `${fieldId}-control`,
      input: (index: number) => (index === 0 ? fieldId : endInputId),
      positioner: `${fieldId}-positioner`,
      root: `${fieldId}-root`,
    }),
    [endInputId, fieldId],
  );
  const commitValue = useCallback(
    (nextValue: DateRangePickerValue | null) => {
      if (value === undefined) {
        setUncontrolledValue(nextValue);
      }
      onValueChange?.({ value: nextValue });
    },
    [onValueChange, value],
  );
  const requestOpen = useCallback(
    (nextOpen: boolean) => {
      setDraftValues(rangeToArray(resolvedValue));
      if (open === undefined) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.({ open: nextOpen });
    },
    [onOpenChange, open, resolvedValue],
  );
  const closePopup = useCallback(() => {
    datePickerApiRef.current?.setOpen(false);
  }, []);
  const handleValueChange = useCallback(
    (details: { value: ArkDateValue[] }) => {
      const nextValues = details.value.map((item) =>
        normalizeDateRangePickerValue(toCalendarDate(item), mode),
      );
      setDraftValues(nextValues);

      if (nextValues.length === 0) {
        commitValue(null);
        return;
      }
      if (nextValues.length === 1) {
        setActiveEndpoint('end');
        return;
      }

      const nextValue = { start: nextValues[0]!, end: nextValues[1]! };
      commitValue(nextValue);
    },
    [commitValue, mode],
  );
  const handleDateUnavailable = useCallback(
    (date: ArkDateValue) =>
      isDateUnavailable?.(normalizeDateRangePickerValue(toCalendarDate(date), mode)) ?? false,
    [isDateUnavailable, mode],
  );
  const handleFormat = useCallback(
    (date: ArkDateValue, details: { locale: string }) =>
      resolvedFormat(normalizeDateRangePickerValue(toCalendarDate(date), mode), {
        locale: details.locale,
      }),
    [mode, resolvedFormat],
  );
  const handleParse = useCallback(
    (inputValue: string, details: { locale: string }) => {
      const parsedValue = resolvedParse(inputValue, { locale: details.locale });
      return parsedValue ? normalizeDateRangePickerValue(parsedValue, mode) : undefined;
    },
    [mode, resolvedParse],
  );
  const handleParsedEndpointValue = useCallback(
    (endpoint: DateRangePickerEndpoint, parsedValue: ArkDateValue) => {
      const index = endpoint === 'start' ? 0 : 1;
      const nextValues = [...(resolvedOpen ? draftValues : rangeToArray(resolvedValue))];
      if (index === 1 && !nextValues[0]) return false;

      nextValues[index] = normalizeDateRangePickerValue(toCalendarDate(parsedValue), mode);
      if (nextValues[0] && nextValues[1] && nextValues[0].compare(nextValues[1]) > 0) {
        return false;
      }

      setDraftValues(nextValues);
      if (nextValues[0] && nextValues[1]) {
        commitValue({ start: nextValues[0], end: nextValues[1] });
      } else {
        setActiveEndpoint('end');
      }
      return true;
    },
    [commitValue, draftValues, mode, resolvedOpen, resolvedValue],
  );
  const handleClear = useCallback(() => {
    setDraftValues([]);
    commitValue(null);
    closePopup();
  }, [closePopup, commitValue]);
  const handleToday = useCallback(
    (date: CalendarDate) => {
      const normalizedDate = normalizeDateRangePickerValue(date, mode);
      const start = draftValues[0];

      if (activeEndpoint === 'start' || !start || normalizedDate.compare(start) < 0) {
        setDraftValues([normalizedDate]);
        setActiveEndpoint('end');
        return;
      }

      const nextValue = { start, end: normalizedDate };
      setDraftValues([nextValue.start, nextValue.end]);
      commitValue(nextValue);
      closePopup();
    },
    [activeEndpoint, closePopup, commitValue, draftValues, mode],
  );

  return (
    <Field.Root
      className={classNames(datePickerStyles.root, styles.root, sizeClassMap[size], className)}
      data-readonly={readOnly ? 'true' : undefined}
      disabled={disabled}
      hasDescription={hasHint}
      hasError={hasError}
      id={fieldId}
      invalid={hasError}
      required={required}
      style={style}
    >
      {label && (
        <Field.Label className={datePickerStyles.label} id={fieldLabelId}>
          {label}
        </Field.Label>
      )}
      <ArkDatePicker.Root
        key={mode}
        className={classNames(datePickerStyles.machine, variantClassMap[variant])}
        closeOnSelect
        defaultFocusedValue={displayedValues[0] ?? normalizedMin}
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
        onOpenChange={({ open: nextOpen }) => requestOpen(nextOpen)}
        onValueChange={handleValueChange}
        defaultOpen={defaultOpen}
        open={open}
        openOnClick
        parse={handleParse}
        positioning={{ placement: 'bottom-start', gutter: 8 }}
        readOnly={readOnly}
        required={required}
        selectionMode="range"
        unmountOnExit
        value={displayedValues}
      >
        <DateRangePickerApiBridge apiRef={datePickerApiRef} />
        <DateRangePickerControl
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          clearable={clearable}
          clearLabel={text.clearDateRange}
          disabled={disabled}
          endAriaLabel={endAriaLabel}
          endId={endInputId}
          endLabel={text.endDate}
          endLabelId={endLabelId}
          endName={endName}
          endPlaceholder={placeholder?.end ?? defaultPlaceholderMap[mode]}
          form={form}
          labelId={label ? fieldLabelId : undefined}
          normalizeAlternateSeparators="date"
          onClear={handleClear}
          onEndpointFocus={setActiveEndpoint}
          onParsedEndpointValue={handleParsedEndpointValue}
          parseInput={(inputValue) => handleParse(inputValue, { locale })}
          readOnly={readOnly}
          startAriaLabel={startAriaLabel}
          startId={fieldId}
          startLabel={text.startDate}
          startLabelId={startLabelId}
          startName={startName}
          startPlaceholder={placeholder?.start ?? defaultPlaceholderMap[mode]}
        />
        <DatePickerPortal container={portalContainer}>
          <DatePickerCalendar
            className={styles.rangeCalendar}
            disabled={disabled || readOnly}
            closeOnToday
            localeText={text}
            minimumView={minimumView}
            onToday={handleToday}
            showToday={showToday}
            size={size}
          />
        </DatePickerPortal>
      </ArkDatePicker.Root>
      {hint && <Field.Description className={datePickerStyles.hint}>{hint}</Field.Description>}
      {hasError && <Field.ErrorText className={datePickerStyles.error}>{error}</Field.ErrorText>}
    </Field.Root>
  );
};

export const DateRangePicker = (props: DateRangePickerProps) => {
  if (hasTimeSelection(props)) {
    if (props.mode !== undefined && props.mode !== 'date') {
      throw new Error('DateRangePicker showTime only supports mode="date".');
    }
    return <DateRangePickerWithTime {...props} />;
  }

  return <DateOnlyRangePicker {...props} />;
};

export type { DatePickerLocaleText, DatePickerLocaleTextOverrides } from '../date-picker/index.tsx';
export type { DatePickerTextTransformDetails };
