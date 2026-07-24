import { useEffect, useMemo, useRef } from 'react';
import { Listbox, createListCollection } from '@ark-ui/react/listbox';
import { ArrowLeftIcon } from '@deweyou-design/react-icons';
import type { CalendarDateTime } from '@internationalized/date';
import classNames from 'classnames';

import datePickerStyles from './index.module.less';
import type { DatePickerLocaleText } from './locale/types.ts';
import styles from './time-wheel.module.less';

type DatePickerTimeWheelProps = {
  disabled?: boolean;
  granularity: 'minute' | 'second';
  hourCycle: 12 | 24;
  hourStep: number;
  isUnavailable: (value: CalendarDateTime) => boolean;
  locale: string;
  localeText: DatePickerLocaleText;
  minuteStep: number;
  onBack: () => void;
  onChange: (value: CalendarDateTime) => void;
  secondStep: number;
  title?: string;
  value: CalendarDateTime;
};

type TimeWheelItem = {
  disabled: boolean;
  label: string;
  numericValue: number;
  value: string;
};

type TimeWheelColumnProps = {
  autoFocus?: boolean;
  formatValue?: (value: number) => string;
  isDisabled: (value: number) => boolean;
  label: string;
  onChange: (value: number) => void;
  selectedValue: number;
  values: number[];
};

const wheelSelectionSettleDelay = 100;

const createSteppedValues = (start: number, end: number, step: number, selectedValue: number) => {
  const values: number[] = [];
  for (let value = start; value <= end; value += step) {
    values.push(value);
  }
  if (!values.includes(selectedValue)) {
    values.push(selectedValue);
    values.sort((left, right) => left - right);
  }
  return values;
};

const padTimeValue = (value: number) => String(value).padStart(2, '0');

const getDayPeriodLabel = (locale: string, hour: number, fallback: string) =>
  new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    hour12: true,
    timeZone: 'UTC',
  })
    .formatToParts(new Date(Date.UTC(2000, 0, 1, hour)))
    .find((part) => part.type === 'dayPeriod')?.value ?? fallback;

const centerWheelItem = (element: Element | null) => {
  if (!(element instanceof HTMLElement)) return;

  const scrollContainer = element.parentElement;
  if (!scrollContainer) return;

  const elementRect = element.getBoundingClientRect();
  const containerRect = scrollContainer.getBoundingClientRect();
  const centerOffset =
    elementRect.top - containerRect.top - (scrollContainer.clientHeight - elementRect.height) / 2;

  scrollContainer.scrollTop += centerOffset;
};

const TimeWheelColumn = ({
  autoFocus,
  formatValue = padTimeValue,
  isDisabled,
  label,
  onChange,
  selectedValue,
  values,
}: TimeWheelColumnProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollSelectionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const collection = useMemo(
    () =>
      createListCollection<TimeWheelItem>({
        isItemDisabled: (item) => item.disabled,
        itemToString: (item) => item.label,
        itemToValue: (item) => item.value,
        items: values.map((numericValue) => ({
          disabled: isDisabled(numericValue),
          label: formatValue(numericValue),
          numericValue,
          value: String(numericValue),
        })),
      }),
    [formatValue, isDisabled, values],
  );

  useEffect(() => {
    centerWheelItem(contentRef.current?.querySelector('[data-selected]') ?? null);
  }, [selectedValue]);

  useEffect(
    () => () => {
      if (scrollSelectionTimerRef.current !== null) {
        clearTimeout(scrollSelectionTimerRef.current);
      }
    },
    [],
  );

  const selectCenteredItem = () => {
    const scrollContainer = contentRef.current;
    if (!scrollContainer) return;

    const containerRect = scrollContainer.getBoundingClientRect();
    const containerCenter =
      containerRect.top + (scrollContainer.clientHeight || containerRect.height) / 2;
    const availableItems = Array.from(
      scrollContainer.querySelectorAll<HTMLElement>('[data-wheel-value]:not([data-disabled])'),
    );
    const centeredItem = availableItems.reduce<HTMLElement | null>((nearestItem, item) => {
      if (!nearestItem) return item;

      const itemRect = item.getBoundingClientRect();
      const nearestRect = nearestItem.getBoundingClientRect();
      const itemDistance = Math.abs(itemRect.top + itemRect.height / 2 - containerCenter);
      const nearestDistance = Math.abs(nearestRect.top + nearestRect.height / 2 - containerCenter);

      return itemDistance < nearestDistance ? item : nearestItem;
    }, null);
    if (!centeredItem) return;

    const nextValue = Number(centeredItem.dataset.wheelValue);
    if (!Number.isFinite(nextValue)) return;

    centerWheelItem(centeredItem);
    if (nextValue !== selectedValue) onChange(nextValue);
  };
  const scheduleCenteredSelection = () => {
    if (scrollSelectionTimerRef.current !== null) {
      clearTimeout(scrollSelectionTimerRef.current);
    }
    scrollSelectionTimerRef.current = setTimeout(() => {
      scrollSelectionTimerRef.current = null;
      selectCenteredItem();
    }, wheelSelectionSettleDelay);
  };

  return (
    <Listbox.Root
      collection={collection}
      deselectable={false}
      loopFocus
      onValueChange={(details) => {
        const nextValue = details.items[0]?.numericValue;
        if (nextValue !== undefined) onChange(nextValue);
      }}
      scrollToIndexFn={({ getElement }) => centerWheelItem(getElement())}
      selectionMode="single"
      value={[String(selectedValue)]}
    >
      <div className={styles.wheelColumn}>
        <Listbox.Label className={styles.wheelLabel}>{label}</Listbox.Label>
        <Listbox.Content
          autoFocus={autoFocus}
          className={styles.wheelContent}
          onScroll={scheduleCenteredSelection}
          ref={contentRef}
        >
          {collection.items.map((item) => (
            <Listbox.Item
              className={styles.wheelItem}
              data-wheel-value={item.numericValue}
              highlightOnHover
              item={item}
              key={item.value}
            >
              <Listbox.ItemText>{item.label}</Listbox.ItemText>
            </Listbox.Item>
          ))}
        </Listbox.Content>
      </div>
    </Listbox.Root>
  );
};

export const DatePickerTimeWheel = ({
  disabled,
  granularity,
  hourCycle,
  hourStep,
  isUnavailable,
  locale,
  localeText,
  minuteStep,
  onBack,
  onChange,
  secondStep,
  title,
  value,
}: DatePickerTimeWheelProps) => {
  const isTwelveHour = hourCycle === 12;
  const selectedDisplayHour = isTwelveHour ? ((value.hour + 11) % 12) + 1 : value.hour;
  const selectedDayPeriod = value.hour >= 12 ? 1 : 0;
  const hourValues = useMemo(
    () =>
      createSteppedValues(
        isTwelveHour ? 1 : 0,
        isTwelveHour ? 12 : 23,
        hourStep,
        selectedDisplayHour,
      ),
    [hourStep, isTwelveHour, selectedDisplayHour],
  );
  const minuteValues = useMemo(
    () => createSteppedValues(0, 59, minuteStep, value.minute),
    [minuteStep, value.minute],
  );
  const secondValues = useMemo(
    () => createSteppedValues(0, 59, secondStep, value.second),
    [secondStep, value.second],
  );
  const dayPeriods = useMemo(
    () => [getDayPeriodLabel(locale, 1, 'AM'), getDayPeriodLabel(locale, 13, 'PM')],
    [locale],
  );
  const updateHour = (displayHour: number) => {
    const nextHour = isTwelveHour
      ? (displayHour % 12) + (selectedDayPeriod === 1 ? 12 : 0)
      : displayHour;
    onChange(value.set({ hour: nextHour }));
  };
  const updateDayPeriod = (dayPeriod: number) => {
    const nextHour = (value.hour % 12) + (dayPeriod === 1 ? 12 : 0);
    onChange(value.set({ hour: nextHour }));
  };
  const columnCount = 2 + (granularity === 'second' ? 1 : 0) + (isTwelveHour ? 1 : 0);

  return (
    <div className={styles.timePanel}>
      <div className={styles.timeHeader}>
        <button
          aria-label={localeText.backToCalendar}
          className={classNames(datePickerStyles.navigationButton, styles.backButton)}
          onClick={onBack}
          type="button"
        >
          <ArrowLeftIcon aria-hidden size="1em" />
        </button>
        <div className={styles.timeTitle}>{title ?? localeText.time}</div>
      </div>
      <div className={styles.wheelColumns} data-columns={columnCount}>
        <TimeWheelColumn
          autoFocus
          isDisabled={(displayHour) => {
            const nextHour = isTwelveHour
              ? (displayHour % 12) + (selectedDayPeriod === 1 ? 12 : 0)
              : displayHour;
            return disabled || isUnavailable(value.set({ hour: nextHour }));
          }}
          label={localeText.hour}
          onChange={updateHour}
          selectedValue={selectedDisplayHour}
          values={hourValues}
        />
        <TimeWheelColumn
          isDisabled={(minute) => disabled || isUnavailable(value.set({ minute }))}
          label={localeText.minute}
          onChange={(minute) => onChange(value.set({ minute }))}
          selectedValue={value.minute}
          values={minuteValues}
        />
        {granularity === 'second' && (
          <TimeWheelColumn
            isDisabled={(second) => disabled || isUnavailable(value.set({ second }))}
            label={localeText.second}
            onChange={(second) => onChange(value.set({ second }))}
            selectedValue={value.second}
            values={secondValues}
          />
        )}
        {isTwelveHour && (
          <TimeWheelColumn
            formatValue={(dayPeriod) => dayPeriods[dayPeriod] ?? ''}
            isDisabled={(dayPeriod) => {
              const nextHour = (value.hour % 12) + (dayPeriod === 1 ? 12 : 0);
              return disabled || isUnavailable(value.set({ hour: nextHour }));
            }}
            label={localeText.dayPeriod}
            onChange={updateDayPeriod}
            selectedValue={selectedDayPeriod}
            values={[0, 1]}
          />
        )}
      </div>
    </div>
  );
};
