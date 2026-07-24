import { useCallback, useId, useMemo, useRef, useState } from 'react';
import {
  DatePicker as ArkDatePicker,
  type DateValue as ArkDateValue,
} from '@ark-ui/react/date-picker';
import { ArrowRightIcon } from '@deweyou-design/react-icons';
import {
  type CalendarDate,
  type CalendarDateTime,
  getLocalTimeZone,
  Time,
  today,
  toCalendarDate,
  toCalendarDateTime,
  toTime,
} from '@internationalized/date';
import classNames from 'classnames';

import { Button } from '../button/index.tsx';
import { useConfigLocale } from '../config-provider/context.ts';
import { DatePickerCalendar, DatePickerPortal } from '../date-picker/calendar.tsx';
import datePickerStyles from '../date-picker/index.module.less';
import type {
  DatePickerDateTimeValue,
  DatePickerSize,
  DatePickerTimeGranularity,
  DatePickerVariant,
} from '../date-picker/index.tsx';
import { useDatePickerLocaleText } from '../date-picker/locale/loader.ts';
import {
  combineDateAndTime,
  formatDateTime,
  formatTime,
  isSameCalendarDate,
  normalizeDateTimePrecision,
  parseDefaultDateTime,
  resolveCurrentTimeDraft,
  resolveHourCycle,
  type ResolvedDatePickerTimeOptions,
} from '../date-picker/time-picker.tsx';
import { DatePickerTimeWheel } from '../date-picker/time-wheel.tsx';
import { Field } from '../field/index.tsx';
import {
  type DateRangePickerApi,
  DateRangePickerApiBridge,
  DateRangePickerControl,
  type DateRangePickerEndpoint,
} from './control.tsx';
import styles from './index.module.less';
import type {
  DateRangePickerDateTimeProps,
  DateRangePickerDateTimeValue,
  DateRangePickerTimeOptions,
} from './index.tsx';

type DateRangePickerTimePanelView = 'calendar' | 'time';

type ResolvedDateRangePickerTimeOptions = Omit<ResolvedDatePickerTimeOptions, 'defaultTime'> & {
  defaultTime: {
    start: Time;
    end: Time;
  };
};

const sizeClassMap: Record<DatePickerSize, string> = {
  sm: datePickerStyles.sizeSm,
  md: datePickerStyles.sizeMd,
  lg: datePickerStyles.sizeLg,
};

const variantClassMap: Record<DatePickerVariant, string> = {
  outlined: datePickerStyles.variantOutlined,
  ghost: datePickerStyles.variantGhost,
};

const validateTimeStep = (name: string, value: number, maximum: number) => {
  if (!Number.isInteger(value) || value < 1 || value > maximum) {
    throw new RangeError(`DateRangePicker ${name} must be an integer between 1 and ${maximum}.`);
  }
  return value;
};

const validateTimePrecision = (
  time: Time,
  granularity: DatePickerTimeGranularity,
  name: string,
) => {
  if (time.millisecond !== 0 || (granularity === 'minute' && time.second !== 0)) {
    throw new RangeError(`DateRangePicker ${name} must use ${granularity} precision.`);
  }
  return time;
};

const formatEndpointDate = (value: CalendarDateTime | undefined) =>
  value
    ? `${String(value.year).padStart(4, '0')}/${String(value.month).padStart(2, '0')}/${String(value.day).padStart(2, '0')}`
    : '—';

const resolveTimeOptions = (
  showTime: DateRangePickerDateTimeProps['showTime'],
): ResolvedDateRangePickerTimeOptions => {
  const options: DateRangePickerTimeOptions = showTime === true ? {} : showTime;
  const granularity = options.granularity ?? 'minute';

  return {
    defaultTime: {
      start: validateTimePrecision(
        options.defaultTime?.start ?? new Time(0, 0),
        granularity,
        'defaultTime.start',
      ),
      end: validateTimePrecision(
        options.defaultTime?.end ?? new Time(0, 0),
        granularity,
        'defaultTime.end',
      ),
    },
    granularity,
    hourCycle: options.hourCycle,
    hourStep: validateTimeStep('hourStep', options.hourStep ?? 1, 24),
    isTimeUnavailable: options.isTimeUnavailable,
    minuteStep: validateTimeStep('minuteStep', options.minuteStep ?? 1, 60),
    secondStep: validateTimeStep('secondStep', options.secondStep ?? 1, 60),
    showNow: options.showNow ?? false,
  };
};

const ensureValuePrecision = (
  value: DatePickerDateTimeValue | undefined,
  granularity: DatePickerTimeGranularity,
  name: string,
) => {
  if (value && (value.millisecond !== 0 || (granularity === 'minute' && value.second !== 0))) {
    throw new RangeError(`DateRangePicker ${name} must use ${granularity} precision.`);
  }
  return value;
};

const ensureRangePrecision = (
  value: DateRangePickerDateTimeValue | null | undefined,
  granularity: DatePickerTimeGranularity,
  name: 'value' | 'defaultValue',
) => {
  if (!value) return value;

  const range = {
    start: ensureValuePrecision(value.start, granularity, `${name}.start`)!,
    end: ensureValuePrecision(value.end, granularity, `${name}.end`)!,
  };
  if (range.start.compare(range.end) > 0) {
    throw new RangeError(`DateRangePicker ${name} start must not be after end.`);
  }
  return range;
};

const rangeToArray = (value: DateRangePickerDateTimeValue | null | undefined): CalendarDateTime[] =>
  value ? [value.start, value.end] : [];

const endpointIndex = (endpoint: DateRangePickerEndpoint) => (endpoint === 'start' ? 0 : 1);

const endpointFromIndex = (index: number): DateRangePickerEndpoint =>
  index === 0 ? 'start' : 'end';

export const DateRangePickerWithTime = ({
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
  showTime,
  format,
  localeText,
  parse,
  size = 'md',
  variant = 'outlined',
  portalContainer,
  className,
  style,
}: DateRangePickerDateTimeProps) => {
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
  const options = useMemo(() => resolveTimeOptions(showTime), [showTime]);
  const hourCycle = resolveHourCycle(locale, options.hourCycle);
  const normalizedControlledValue = ensureRangePrecision(value, options.granularity, 'value');
  const normalizedDefaultValue =
    ensureRangePrecision(defaultValue, options.granularity, 'defaultValue') ?? null;
  const minimumValue = ensureValuePrecision(min, options.granularity, 'min');
  const maximumValue = ensureValuePrecision(max, options.granularity, 'max');
  const [uncontrolledValue, setUncontrolledValue] = useState<DateRangePickerDateTimeValue | null>(
    normalizedDefaultValue,
  );
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const datePickerApiRef = useRef<DateRangePickerApi | null>(null);
  const resolvedValue =
    value === undefined ? uncontrolledValue : (normalizedControlledValue ?? null);
  const resolvedOpen = open === undefined ? uncontrolledOpen : open;
  const [draftValues, setDraftValues] = useState<CalendarDateTime[]>(rangeToArray(resolvedValue));
  const [activeEndpoint, setActiveEndpoint] = useState<DateRangePickerEndpoint>('start');
  const [panelView, setPanelView] = useState<DateRangePickerTimePanelView>('calendar');
  const displayedValues = resolvedOpen ? draftValues : rangeToArray(resolvedValue);
  const hasError = Boolean(error);
  const hasHint = Boolean(hint);
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
  const placeholderValue = useMemo(
    () =>
      combineDateAndTime(today(getLocalTimeZone()), options.defaultTime.start, options.granularity),
    [options.defaultTime.start, options.granularity],
  );
  const clampToBounds = useCallback(
    (nextValue: CalendarDateTime) => {
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
  const isValueUnavailable = useCallback(
    (nextValue: CalendarDateTime) =>
      Boolean(
        (minimumValue && nextValue.compare(minimumValue) < 0) ||
        (maximumValue && nextValue.compare(maximumValue) > 0) ||
        options.isTimeUnavailable?.(nextValue) ||
        isDateUnavailable?.(nextValue),
      ),
    [isDateUnavailable, maximumValue, minimumValue, options],
  );
  const isEndpointUnavailable = useCallback(
    (nextValue: CalendarDateTime, endpoint: DateRangePickerEndpoint) => {
      if (isValueUnavailable(nextValue)) return true;

      const otherValue = draftValues[endpoint === 'start' ? 1 : 0];
      if (!otherValue) return false;
      return endpoint === 'start'
        ? nextValue.compare(otherValue) > 0
        : nextValue.compare(otherValue) < 0;
    },
    [draftValues, isValueUnavailable],
  );
  const commitValue = useCallback(
    (nextValue: DateRangePickerDateTimeValue | null) => {
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
      setPanelView('calendar');
      if (open === undefined) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.({ open: nextOpen });
    },
    [onOpenChange, open, resolvedValue],
  );
  const closePopup = useCallback(() => {
    setPanelView('calendar');
    datePickerApiRef.current?.setOpen(false);
  }, []);
  const handleValueChange = useCallback(
    (details: { value: ArkDateValue[] }) => {
      const nextValues = details.value.map((selectedValue, index) => {
        const endpoint = endpointFromIndex(index);
        const selectedTime =
          'hour' in selectedValue
            ? toTime(toCalendarDateTime(selectedValue))
            : draftValues[index]
              ? toTime(draftValues[index])
              : options.defaultTime[endpoint];
        return clampToBounds(combineDateAndTime(selectedValue, selectedTime, options.granularity));
      });

      setDraftValues(nextValues);
      if (nextValues.length === 1) {
        setActiveEndpoint('end');
      }
    },
    [clampToBounds, draftValues, options.defaultTime, options.granularity],
  );
  const handleDateUnavailable = useCallback(
    (date: ArkDateValue) => {
      const index = endpointIndex(activeEndpoint);
      const time = draftValues[index]
        ? toTime(draftValues[index])
        : options.defaultTime[activeEndpoint];
      return isDateUnavailable?.(combineDateAndTime(date, time, options.granularity)) ?? false;
    },
    [activeEndpoint, draftValues, isDateUnavailable, options.defaultTime, options.granularity],
  );
  const resolvedFormat = useMemo(
    () =>
      format ??
      ((date: CalendarDateTime, details: { locale: string }) =>
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
  const handleParsedEndpointValue = useCallback(
    (endpoint: DateRangePickerEndpoint, parsedValue: ArkDateValue) => {
      const index = endpointIndex(endpoint);
      const nextValues = [...(resolvedOpen ? draftValues : rangeToArray(resolvedValue))];
      if (index === 1 && !nextValues[0]) return false;

      const nextValue = normalizeDateTimePrecision(
        toCalendarDateTime(parsedValue),
        options.granularity,
      );
      if (isValueUnavailable(nextValue)) return false;
      nextValues[index] = nextValue;
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
    [
      commitValue,
      draftValues,
      isValueUnavailable,
      options.granularity,
      resolvedOpen,
      resolvedValue,
    ],
  );
  const handleClear = useCallback(() => {
    setDraftValues([]);
    commitValue(null);
    closePopup();
  }, [closePopup, commitValue]);
  const handleConfirm = useCallback(() => {
    const start = draftValues[0];
    const end = draftValues[1];
    if (
      !start ||
      !end ||
      start.compare(end) > 0 ||
      isValueUnavailable(start) ||
      isValueUnavailable(end)
    ) {
      return;
    }

    commitValue({ start, end });
    closePopup();
  }, [closePopup, commitValue, draftValues, isValueUnavailable]);
  const handleToday = useCallback(
    (date: CalendarDate) => {
      const index = endpointIndex(activeEndpoint);
      const time = draftValues[index]
        ? toTime(draftValues[index])
        : options.defaultTime[activeEndpoint];
      const nextValue = clampToBounds(combineDateAndTime(date, time, options.granularity));
      const otherValue = draftValues[activeEndpoint === 'start' ? 1 : 0];

      if (activeEndpoint === 'start' && otherValue && nextValue.compare(otherValue) <= 0) {
        setDraftValues([nextValue, otherValue]);
        return;
      }
      if (activeEndpoint === 'end' && otherValue && nextValue.compare(otherValue) >= 0) {
        setDraftValues([otherValue, nextValue]);
        return;
      }

      setDraftValues([nextValue]);
      setActiveEndpoint('end');
    },
    [activeEndpoint, clampToBounds, draftValues, options.defaultTime, options.granularity],
  );
  const activeIndex = endpointIndex(activeEndpoint);
  const activeValue = draftValues[activeIndex];
  const handleNow = useCallback(() => {
    if (!activeValue) return;

    const nextValue = resolveCurrentTimeDraft(activeValue, hourCycle, {
      ...options,
      defaultTime: options.defaultTime[activeEndpoint],
    });
    if (isEndpointUnavailable(nextValue, activeEndpoint)) return;

    setDraftValues((currentValues) =>
      currentValues.map((currentValue, index) =>
        index === activeIndex ? nextValue : currentValue,
      ),
    );
  }, [activeEndpoint, activeIndex, activeValue, hourCycle, isEndpointUnavailable, options]);
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
  const startTimeText = formatTime(
    draftValues[0] ?? placeholderValue,
    locale,
    hourCycle,
    options.granularity,
  );
  const endPlaceholderValue = combineDateAndTime(
    today(getLocalTimeZone()),
    options.defaultTime.end,
    options.granularity,
  );
  const endTimeText = formatTime(
    draftValues[1] ?? endPlaceholderValue,
    locale,
    hourCycle,
    options.granularity,
  );
  const startDateText = formatEndpointDate(draftValues[0]);
  const endDateText = formatEndpointDate(draftValues[1]);
  const defaultPlaceholder =
    options.granularity === 'second'
      ? hourCycle === 12
        ? 'YYYY/MM/DD hh:mm:ss A'
        : 'YYYY/MM/DD HH:mm:ss'
      : hourCycle === 12
        ? 'YYYY/MM/DD hh:mm A'
        : 'YYYY/MM/DD HH:mm';
  const currentTimeDraft =
    options.showNow && panelView === 'time' && activeValue
      ? resolveCurrentTimeDraft(activeValue, hourCycle, {
          ...options,
          defaultTime: options.defaultTime[activeEndpoint],
        })
      : null;
  const completeRange = draftValues.length === 2;
  const isDraftInvalid =
    !completeRange ||
    draftValues[0]!.compare(draftValues[1]!) > 0 ||
    isValueUnavailable(draftValues[0]!) ||
    isValueUnavailable(draftValues[1]!);

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
        className={classNames(datePickerStyles.machine, variantClassMap[variant])}
        closeOnSelect={false}
        defaultFocusedValue={resolvedValue?.start ?? placeholderValue}
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
          endPlaceholder={placeholder?.end ?? defaultPlaceholder}
          form={form}
          labelId={label ? fieldLabelId : undefined}
          normalizeAlternateSeparators={format ? false : 'date-time'}
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
          startPlaceholder={placeholder?.start ?? defaultPlaceholder}
        />
        <DatePickerPortal container={portalContainer}>
          <DatePickerCalendar
            calendarVisible={panelView === 'calendar'}
            className={styles.rangeCalendar}
            disabled={disabled || readOnly}
            localeText={text}
            onToday={handleToday}
            panel={
              activeValue ? (
                <DatePickerTimeWheel
                  disabled={disabled || readOnly}
                  granularity={options.granularity}
                  hourCycle={hourCycle}
                  hourStep={options.hourStep}
                  isUnavailable={(nextValue) => isEndpointUnavailable(nextValue, activeEndpoint)}
                  locale={locale}
                  localeText={text}
                  minuteStep={options.minuteStep}
                  onBack={handleBackToCalendar}
                  onChange={(nextValue) =>
                    setDraftValues((currentValues) =>
                      currentValues.map((currentValue, index) =>
                        index === activeIndex
                          ? normalizeDateTimePrecision(nextValue, options.granularity)
                          : currentValue,
                      ),
                    )
                  }
                  secondStep={options.secondStep}
                  title={activeEndpoint === 'start' ? text.startTime : text.endTime}
                  value={activeValue}
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
                    disabled ||
                    readOnly ||
                    !currentTimeDraft ||
                    isEndpointUnavailable(currentTimeDraft, activeEndpoint)
                  }
                  onClick={handleNow}
                  size="xs"
                  type="button"
                  variant="ghost"
                >
                  {text.now}
                </Button>
              )}
              <div className={styles.timeRangeGroup}>
                <Button
                  aria-label={`${text.startTime} ${startDateText} ${startTimeText}`}
                  className={styles.timeEndpointButton}
                  color="neutral"
                  data-active={activeEndpoint === 'start' ? 'true' : undefined}
                  disabled={disabled || readOnly || !draftValues[0]}
                  onClick={() => {
                    setActiveEndpoint('start');
                    setPanelView('time');
                  }}
                  size="xs"
                  type="button"
                  variant="ghost"
                >
                  <span className={styles.timeEndpointContent}>
                    <span className={styles.timeEndpointDate}>{startDateText}</span>
                    <span className={styles.timeEndpointValue}>{startTimeText}</span>
                  </span>
                </Button>
                <span aria-hidden className={styles.timeRangeArrow}>
                  <ArrowRightIcon size="xs" />
                </span>
                <Button
                  aria-label={`${text.endTime} ${endDateText} ${endTimeText}`}
                  className={styles.timeEndpointButton}
                  color="neutral"
                  data-active={activeEndpoint === 'end' ? 'true' : undefined}
                  disabled={disabled || readOnly || !draftValues[1]}
                  onClick={() => {
                    setActiveEndpoint('end');
                    setPanelView('time');
                  }}
                  size="xs"
                  type="button"
                  variant="ghost"
                >
                  <span className={styles.timeEndpointContent}>
                    <span className={styles.timeEndpointDate}>{endDateText}</span>
                    <span className={styles.timeEndpointValue}>{endTimeText}</span>
                  </span>
                </Button>
              </div>
              <Button
                color="primary"
                disabled={disabled || readOnly || isDraftInvalid}
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
