import { useCallback, useId, useMemo, useState } from 'react';
import {
  DatePicker as ArkDatePicker,
  type DateValue as ArkDateValue,
} from '@ark-ui/react/date-picker';
import {
  type CalendarDate,
  type CalendarDateTime,
  getLocalTimeZone,
  parseDateTime,
  Time,
  today,
  toCalendarDate,
  toCalendarDateTime,
  toTime,
} from '@internationalized/date';
import classNames from 'classnames';

import { Button } from '../button/index.tsx';
import { useConfigLocale } from '../config-provider/context.ts';
import { Field } from '../field/index.tsx';
import { DatePickerCalendar, DatePickerPortal } from './calendar.tsx';
import { DatePickerTextControl } from './control.tsx';
import datePickerStyles from './index.module.less';
import type {
  DatePickerDateTimeProps,
  DatePickerDateTimeValue,
  DatePickerSize,
  DatePickerTimeGranularity,
  DatePickerTimeOptions,
  DatePickerVariant,
} from './index.tsx';
import { useDatePickerLocaleText } from './locale/loader.ts';
import { DatePickerTimeWheel } from './time-wheel.tsx';
import styles from './time-picker.module.less';

type DatePickerTimePanelView = 'calendar' | 'time';

export type ResolvedDatePickerTimeOptions = {
  defaultTime: Time;
  granularity: DatePickerTimeGranularity;
  hourCycle?: 12 | 24;
  hourStep: number;
  isTimeUnavailable?: DatePickerTimeOptions['isTimeUnavailable'];
  minuteStep: number;
  secondStep: number;
  showNow: boolean;
};

const canonicalDateTimePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/;

const sizeClassMap: Record<DatePickerSize, string> = {
  sm: datePickerStyles.sizeSm,
  md: datePickerStyles.sizeMd,
  lg: datePickerStyles.sizeLg,
};

const variantClassMap: Record<DatePickerVariant, string> = {
  outlined: datePickerStyles.variantOutlined,
  ghost: datePickerStyles.variantGhost,
};

export const validateTimeStep = (name: string, value: number, maximum: number) => {
  if (!Number.isInteger(value) || value < 1 || value > maximum) {
    throw new RangeError(`DatePicker ${name} must be an integer between 1 and ${maximum}.`);
  }
  return value;
};

const resolveTimeOptions = (
  showTime: DatePickerDateTimeProps['showTime'],
): ResolvedDatePickerTimeOptions => {
  const options = showTime === true ? {} : showTime;
  const granularity = options.granularity ?? 'minute';
  const defaultTime = options.defaultTime ?? new Time(0, 0);

  if (defaultTime.millisecond !== 0 || (granularity === 'minute' && defaultTime.second !== 0)) {
    throw new RangeError(`DatePicker defaultTime must use ${granularity} precision.`);
  }

  return {
    defaultTime,
    granularity,
    hourCycle: options.hourCycle,
    hourStep: validateTimeStep('hourStep', options.hourStep ?? 1, 24),
    isTimeUnavailable: options.isTimeUnavailable,
    minuteStep: validateTimeStep('minuteStep', options.minuteStep ?? 1, 60),
    secondStep: validateTimeStep('secondStep', options.secondStep ?? 1, 60),
    showNow: options.showNow ?? false,
  };
};

const ensureDateTimePrecision = (
  value: DatePickerDateTimeValue | null | undefined,
  granularity: DatePickerTimeGranularity,
  propName: 'value' | 'defaultValue' | 'min' | 'max',
) => {
  if (value && (value.millisecond !== 0 || (granularity === 'minute' && value.second !== 0))) {
    throw new RangeError(`DatePicker ${propName} must use ${granularity} precision.`);
  }
  return value;
};

export const normalizeDateTimePrecision = (
  value: DatePickerDateTimeValue,
  granularity: DatePickerTimeGranularity,
) =>
  value.set({
    millisecond: 0,
    second: granularity === 'minute' ? 0 : value.second,
  });

export const resolveHourCycle = (locale: string, hourCycle: 12 | 24 | undefined): 12 | 24 => {
  if (hourCycle) return hourCycle;
  const resolved = new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions().hourCycle;
  return resolved === 'h11' || resolved === 'h12' ? 12 : 24;
};

const toUtcDate = (value: Pick<CalendarDateTime, 'hour' | 'minute' | 'second'>) =>
  new Date(Date.UTC(2000, 0, 1, value.hour, value.minute, value.second));

export const formatTime = (
  value: CalendarDateTime,
  locale: string,
  hourCycle: 12 | 24,
  granularity: DatePickerTimeGranularity,
) =>
  new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    hourCycle: hourCycle === 12 ? 'h12' : 'h23',
    minute: '2-digit',
    second: granularity === 'second' ? '2-digit' : undefined,
    timeZone: 'UTC',
  }).format(toUtcDate(value));

export const formatDateTime = (
  value: CalendarDateTime,
  locale: string,
  hourCycle: 12 | 24,
  granularity: DatePickerTimeGranularity,
) => {
  const date = `${String(value.year).padStart(4, '0')}/${String(value.month).padStart(2, '0')}/${String(value.day).padStart(2, '0')}`;
  return `${date} ${formatTime(value, locale, hourCycle, granularity)}`;
};

const getDayPeriodLabels = (locale: string) =>
  [1, 13].map(
    (hour) =>
      new Intl.DateTimeFormat(locale, {
        hour: 'numeric',
        hour12: true,
        timeZone: 'UTC',
      })
        .formatToParts(new Date(Date.UTC(2000, 0, 1, hour)))
        .find((part) => part.type === 'dayPeriod')?.value ?? (hour < 12 ? 'AM' : 'PM'),
  );

export const parseDefaultDateTime = (
  inputValue: string,
  locale: string,
  hourCycle: 12 | 24,
  granularity: DatePickerTimeGranularity,
) => {
  const match =
    /^(\d{4})[/ -](\d{2})[/ -](\d{2})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s+(.+))?$/.exec(
      inputValue.trim(),
    );

  if (!match) return undefined;

  const [, year, month, day, rawHour, minute, rawSecond, rawDayPeriod] = match;
  if (
    !year ||
    !month ||
    !day ||
    !rawHour ||
    !minute ||
    (granularity === 'minute' && rawSecond !== undefined) ||
    (granularity === 'second' && rawSecond === undefined)
  ) {
    return undefined;
  }

  let hour = Number(rawHour);
  const second = Number(rawSecond ?? 0);

  if (hourCycle === 12) {
    if (!rawDayPeriod || hour < 1 || hour > 12) return undefined;
    const [amLabel, pmLabel] = getDayPeriodLabels(locale).map((label) =>
      label.toLocaleLowerCase(locale),
    );
    const dayPeriod = rawDayPeriod.toLocaleLowerCase(locale);
    const isMorning = dayPeriod === amLabel || dayPeriod === 'am';
    const isAfternoon = dayPeriod === pmLabel || dayPeriod === 'pm';
    if (!isMorning && !isAfternoon) return undefined;
    hour = (hour % 12) + (isAfternoon ? 12 : 0);
  } else if (rawDayPeriod || hour > 23) {
    return undefined;
  }

  const canonicalValue = `${year}-${month}-${day}T${String(hour).padStart(2, '0')}:${minute}${
    granularity === 'second' ? `:${String(second).padStart(2, '0')}` : ''
  }`;

  try {
    return parseDateTime(canonicalValue);
  } catch {
    return undefined;
  }
};

export const isSameCalendarDate = (
  left: CalendarDate | CalendarDateTime,
  right: CalendarDate | CalendarDateTime,
) => toCalendarDate(left).compare(toCalendarDate(right)) === 0;

export const combineDateAndTime = (
  date: ArkDateValue,
  time: Time,
  granularity: DatePickerTimeGranularity,
) => normalizeDateTimePrecision(toCalendarDateTime(toCalendarDate(date), time), granularity);

const createSteppedTimeValues = (start: number, end: number, step: number) => {
  const values: number[] = [];
  for (let value = start; value <= end; value += step) {
    values.push(value);
  }
  return values;
};

const createSelectableHours = (hourCycle: 12 | 24, hourStep: number) => {
  if (hourCycle === 24) {
    return createSteppedTimeValues(0, 23, hourStep);
  }

  const displayHours = createSteppedTimeValues(1, 12, hourStep);
  return [0, 1]
    .flatMap((dayPeriod) => displayHours.map((displayHour) => (displayHour % 12) + dayPeriod * 12))
    .sort((left, right) => left - right);
};

export const resolveCurrentTimeDraft = (
  value: DatePickerDateTimeValue,
  hourCycle: 12 | 24,
  options: ResolvedDatePickerTimeOptions,
) => {
  const currentTime = new Date();
  const targetSecondOfDay =
    currentTime.getHours() * 3600 + currentTime.getMinutes() * 60 + currentTime.getSeconds();
  const hours = createSelectableHours(hourCycle, options.hourStep);
  const minutes = createSteppedTimeValues(0, 59, options.minuteStep);
  const seconds =
    options.granularity === 'second' ? createSteppedTimeValues(0, 59, options.secondStep) : [0];
  let nearestTime = {
    distance: Number.POSITIVE_INFINITY,
    hour: 0,
    minute: 0,
    second: 0,
  };

  for (const hour of hours) {
    for (const minute of minutes) {
      for (const second of seconds) {
        const secondOfDay = hour * 3600 + minute * 60 + second;
        const distance = Math.abs(secondOfDay - targetSecondOfDay);
        if (distance < nearestTime.distance) {
          nearestTime = { distance, hour, minute, second };
        }
      }
    }
  }

  return value.set({
    hour: nearestTime.hour,
    millisecond: 0,
    minute: nearestTime.minute,
    second: nearestTime.second,
  });
};

export const parseDatePickerDateTimeValue = (value: string): DatePickerDateTimeValue => {
  if (!canonicalDateTimePattern.test(value)) {
    throw new RangeError(
      'DatePicker date-time values must use canonical YYYY-MM-DDTHH:mm or YYYY-MM-DDTHH:mm:ss format.',
    );
  }
  return parseDateTime(value);
};

export const DatePickerWithTime = ({
  value,
  defaultValue,
  onValueChange,
  open,
  defaultOpen = false,
  onOpenChange,
  min,
  max,
  isDateUnavailable,
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
  showTime,
  format,
  localeText,
  parse,
  size = 'md',
  variant = 'outlined',
  portalContainer,
  className,
  style,
}: DatePickerDateTimeProps) => {
  if (Boolean(format) !== Boolean(parse)) {
    throw new Error('DatePicker format and parse must be provided together.');
  }

  const reactId = useId();
  const locale = useConfigLocale();
  const text = useDatePickerLocaleText(localeText);
  const fieldId = id?.length ? id : `date-picker-field-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const options = useMemo(() => resolveTimeOptions(showTime), [showTime]);
  const { isTimeUnavailable } = options;
  const hourCycle = resolveHourCycle(locale, options.hourCycle);
  const controlledValue = ensureDateTimePrecision(value, options.granularity, 'value');
  const initialValue =
    ensureDateTimePrecision(defaultValue, options.granularity, 'defaultValue') ?? null;
  const minimumValue = ensureDateTimePrecision(min, options.granularity, 'min') ?? undefined;
  const maximumValue = ensureDateTimePrecision(max, options.granularity, 'max') ?? undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<DatePickerDateTimeValue | null>(
    initialValue,
  );
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const [draftValue, setDraftValue] = useState<DatePickerDateTimeValue | null>(
    value === undefined ? initialValue : (controlledValue ?? null),
  );
  const [panelView, setPanelView] = useState<DatePickerTimePanelView>('calendar');
  const resolvedValue = value === undefined ? uncontrolledValue : (controlledValue ?? null);
  const resolvedOpen = open === undefined ? uncontrolledOpen : open;
  const displayedValue = resolvedOpen ? draftValue : resolvedValue;
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
  const placeholderValue = useMemo(
    () => combineDateAndTime(today(getLocalTimeZone()), options.defaultTime, options.granularity),
    [options.defaultTime, options.granularity],
  );
  const clampToBounds = useCallback(
    (nextValue: DatePickerDateTimeValue) => {
      if (
        minimumValue &&
        isSameCalendarDate(nextValue, minimumValue) &&
        nextValue.compare(minimumValue) < 0
      ) {
        return minimumValue;
      }
      if (
        maximumValue &&
        isSameCalendarDate(nextValue, maximumValue) &&
        nextValue.compare(maximumValue) > 0
      ) {
        return maximumValue;
      }
      return nextValue;
    },
    [maximumValue, minimumValue],
  );
  const isUnavailable = useCallback(
    (nextValue: DatePickerDateTimeValue) =>
      Boolean(
        (minimumValue && nextValue.compare(minimumValue) < 0) ||
        (maximumValue && nextValue.compare(maximumValue) > 0) ||
        isTimeUnavailable?.(nextValue) ||
        isDateUnavailable?.(nextValue),
      ),
    [isDateUnavailable, isTimeUnavailable, maximumValue, minimumValue],
  );
  const commitValue = useCallback(
    (nextValue: DatePickerDateTimeValue | null) => {
      if (value === undefined) {
        setUncontrolledValue(nextValue);
      }
      onValueChange?.({ value: nextValue });
    },
    [onValueChange, value],
  );
  const requestOpen = useCallback(
    (nextOpen: boolean) => {
      setDraftValue(resolvedValue);
      setPanelView('calendar');
      if (open === undefined) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.({ open: nextOpen });
    },
    [onOpenChange, open, resolvedValue],
  );
  const handleValueChange = useCallback(
    (details: { value: ArkDateValue[] }) => {
      const selectedValue = details.value[0];
      let nextValue: DatePickerDateTimeValue | null = null;

      if (selectedValue) {
        const selectedTime =
          'hour' in selectedValue
            ? toTime(toCalendarDateTime(selectedValue))
            : draftValue
              ? toTime(draftValue)
              : options.defaultTime;
        nextValue = clampToBounds(
          combineDateAndTime(selectedValue, selectedTime, options.granularity),
        );
      }

      if (resolvedOpen) {
        setDraftValue(nextValue);
      } else {
        commitValue(nextValue);
      }
    },
    [
      clampToBounds,
      commitValue,
      draftValue,
      options.defaultTime,
      options.granularity,
      resolvedOpen,
    ],
  );
  const handleDateUnavailable = useCallback(
    (date: ArkDateValue) => {
      const time = draftValue ? toTime(draftValue) : options.defaultTime;
      return isDateUnavailable?.(combineDateAndTime(date, time, options.granularity)) ?? false;
    },
    [draftValue, isDateUnavailable, options.defaultTime, options.granularity],
  );
  const resolvedFormat = useMemo(
    () =>
      format ??
      ((date: DatePickerDateTimeValue, details: { locale: string }) =>
        formatDateTime(date, details.locale, hourCycle, options.granularity)),
    [format, hourCycle, options.granularity],
  );
  const resolvedParse = useMemo(
    () =>
      parse ??
      ((inputValue: string, details: { locale: string }) =>
        parseDefaultDateTime(inputValue, details.locale, hourCycle, options.granularity)),
    [hourCycle, options.granularity, parse],
  );
  const handleFormat = useCallback(
    (date: ArkDateValue, details: { locale: string }) =>
      resolvedFormat(toCalendarDateTime(date), { locale: details.locale }),
    [resolvedFormat],
  );
  const handleParse = useCallback(
    (inputValue: string, details: { locale: string }) => {
      const parsedValue = resolvedParse(inputValue, { locale: details.locale });
      if (
        !parsedValue ||
        parsedValue.millisecond !== 0 ||
        (options.granularity === 'minute' && parsedValue.second !== 0)
      ) {
        return undefined;
      }
      return parsedValue;
    },
    [options.granularity, resolvedParse],
  );
  const handleConfirm = useCallback(() => {
    if (!draftValue || isUnavailable(draftValue)) return;
    commitValue(draftValue);
    setPanelView('calendar');
    if (open === undefined) {
      setUncontrolledOpen(false);
    }
    onOpenChange?.({ open: false });
  }, [commitValue, draftValue, isUnavailable, onOpenChange, open]);
  const handleClear = useCallback(() => {
    setDraftValue(null);
    setPanelView('calendar');
    commitValue(null);
    if (open === undefined) {
      setUncontrolledOpen(false);
    }
    onOpenChange?.({ open: false });
  }, [commitValue, onOpenChange, open]);
  const handleToday = useCallback(
    (date: CalendarDate) => {
      const time = draftValue ? toTime(draftValue) : options.defaultTime;
      setDraftValue(clampToBounds(combineDateAndTime(date, time, options.granularity)));
    },
    [clampToBounds, draftValue, options.defaultTime, options.granularity],
  );
  const handleNow = useCallback(() => {
    if (!draftValue) return;

    const nextValue = resolveCurrentTimeDraft(draftValue, hourCycle, options);
    if (!isUnavailable(nextValue)) setDraftValue(nextValue);
  }, [draftValue, hourCycle, isUnavailable, options]);
  const handleBackToCalendar = useCallback(() => {
    setPanelView('calendar');
    globalThis.requestAnimationFrame?.(() => {
      const content = document.getElementById(ids.content);
      const target = content?.querySelector<HTMLElement>(
        '[data-part="view-trigger"], [data-part="cell-trigger"][data-selected], [data-part="cell-trigger"]',
      );
      target?.focus();
    });
  }, [ids.content]);
  const timeText = draftValue
    ? formatTime(draftValue, locale, hourCycle, options.granularity)
    : formatTime(placeholderValue, locale, hourCycle, options.granularity);
  const defaultPlaceholder =
    options.granularity === 'second'
      ? hourCycle === 12
        ? 'YYYY/MM/DD hh:mm:ss A'
        : 'YYYY/MM/DD HH:mm:ss'
      : hourCycle === 12
        ? 'YYYY/MM/DD hh:mm A'
        : 'YYYY/MM/DD HH:mm';
  const currentTimeDraft =
    options.showNow && panelView === 'time' && draftValue
      ? resolveCurrentTimeDraft(draftValue, hourCycle, options)
      : null;

  return (
    <Field.Root
      className={classNames(datePickerStyles.root, sizeClassMap[size], className)}
      data-readonly={readOnly ? 'true' : undefined}
      disabled={disabled}
      hasDescription={hasHint}
      hasError={hasError}
      id={fieldId}
      invalid={hasError}
      required={required}
      style={style}
    >
      {label && <Field.Label className={datePickerStyles.label}>{label}</Field.Label>}
      <ArkDatePicker.Root
        className={classNames(datePickerStyles.machine, variantClassMap[variant])}
        closeOnSelect={false}
        defaultFocusedValue={resolvedValue ?? placeholderValue}
        disabled={disabled}
        fixedWeeks={false}
        format={handleFormat}
        ids={ids}
        invalid={hasError}
        isDateUnavailable={isDateUnavailable ? handleDateUnavailable : undefined}
        lazyMount
        locale={locale}
        max={maximumValue ? toCalendarDate(maximumValue) : undefined}
        maxView="year"
        min={minimumValue ? toCalendarDate(minimumValue) : undefined}
        minView="day"
        name={name}
        onOpenChange={({ open: nextOpen }) => requestOpen(nextOpen)}
        onValueChange={handleValueChange}
        open={resolvedOpen}
        openOnClick
        parse={handleParse}
        placeholder={placeholder ?? defaultPlaceholder}
        positioning={{ placement: 'bottom-start', gutter: 8 }}
        readOnly={readOnly}
        required={required}
        selectionMode="single"
        unmountOnExit
        value={displayedValue ? [displayedValue] : []}
      >
        <DatePickerTextControl
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          clearable={clearable}
          clearLabel={text.clearDateTime}
          disabled={disabled}
          form={form}
          normalizeAlternateSeparators={!format}
          onClear={handleClear}
          parseInput={(inputValue) => handleParse(inputValue, { locale })}
          readOnly={readOnly}
        />
        <DatePickerPortal container={portalContainer}>
          <DatePickerCalendar
            calendarVisible={panelView === 'calendar'}
            disabled={disabled || readOnly}
            localeText={text}
            onToday={handleToday}
            panel={
              draftValue ? (
                <DatePickerTimeWheel
                  disabled={disabled || readOnly}
                  granularity={options.granularity}
                  hourCycle={hourCycle}
                  hourStep={options.hourStep}
                  isUnavailable={isUnavailable}
                  locale={locale}
                  localeText={text}
                  minuteStep={options.minuteStep}
                  onBack={handleBackToCalendar}
                  onChange={(nextValue) =>
                    setDraftValue(normalizeDateTimePrecision(nextValue, options.granularity))
                  }
                  secondStep={options.secondStep}
                  value={draftValue}
                />
              ) : null
            }
            showToday={showToday && panelView === 'calendar'}
            size={size}
          >
            <div className={styles.timeFooter}>
              {options.showNow && panelView === 'time' && (
                <Button
                  className={styles.nowButton}
                  color="primary"
                  disabled={
                    disabled || readOnly || !currentTimeDraft || isUnavailable(currentTimeDraft)
                  }
                  onClick={handleNow}
                  size="xs"
                  type="button"
                  variant="ghost"
                >
                  {text.now}
                </Button>
              )}
              <Button
                aria-label={`${text.time} ${timeText}`}
                color="primary"
                disabled={disabled || readOnly || !draftValue}
                onClick={() => setPanelView('time')}
                size="xs"
                type="button"
                variant="ghost"
              >
                {timeText}
              </Button>
              <Button
                color="primary"
                disabled={disabled || readOnly || !draftValue || isUnavailable(draftValue)}
                onClick={handleConfirm}
                size="xs"
                type="button"
                variant="filled"
              >
                {text.confirm}
              </Button>
            </div>
          </DatePickerCalendar>
        </DatePickerPortal>
      </ArkDatePicker.Root>
      {hint && <Field.Description className={datePickerStyles.hint}>{hint}</Field.Description>}
      {hasError && <Field.ErrorText className={datePickerStyles.error}>{error}</Field.ErrorText>}
    </Field.Root>
  );
};
