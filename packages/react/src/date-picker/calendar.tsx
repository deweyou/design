import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  DatePicker as ArkDatePicker,
  type DatePickerDateView as ArkDateView,
} from '@ark-ui/react/date-picker';
import { ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon } from '@deweyou-design/react-icons';
import { type CalendarDate, getLocalTimeZone, today } from '@internationalized/date';
import classNames from 'classnames';

import { Button } from '../button/index.tsx';
import type { DatePickerSize } from './index.tsx';
import type { DatePickerLocaleText } from './locale/types.ts';
import styles from './index.module.less';

type DatePickerCalendarProps = {
  children?: ReactNode;
  calendarVisible?: boolean;
  className?: string;
  closeOnToday?: boolean;
  disabled?: boolean;
  localeText: DatePickerLocaleText;
  minimumView?: ArkDateView;
  onToday?: (value: CalendarDate) => void;
  panel?: ReactNode;
  showToday?: boolean;
  size?: DatePickerSize;
};

type DatePickerCalendarCell = {
  disabled: boolean;
  label: string;
  value: number;
};

type DatePickerCalendarHeaderProps = {
  label: string;
  localeText: DatePickerLocaleText;
  minimumView: ArkDateView;
  onBack?: () => void;
  view: ArkDateView;
};

type DatePickerCalendarSelectionTableProps = {
  columns: number;
  rows: DatePickerCalendarCell[][];
};

const calendarSizeClassMap: Record<DatePickerSize, string> = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
};

const DatePickerCalendarHeader = ({
  label,
  localeText,
  minimumView,
  onBack,
  view,
}: DatePickerCalendarHeaderProps) => {
  const title =
    view === 'year' ? (
      <div className={styles.viewTitle}>{label}</div>
    ) : (
      <ArkDatePicker.ViewTrigger className={styles.viewTrigger}>
        <span className={styles.rangeText}>{label}</span>
      </ArkDatePicker.ViewTrigger>
    );

  if (view === minimumView) {
    return (
      <ArkDatePicker.ViewControl className={styles.viewControl}>
        <ArkDatePicker.PrevTrigger
          aria-label={localeText.previousMonth}
          className={styles.navigationButton}
        >
          <ChevronLeftIcon aria-hidden size="1em" />
        </ArkDatePicker.PrevTrigger>
        {title}
        <ArkDatePicker.NextTrigger
          aria-label={localeText.nextMonth}
          className={styles.navigationButton}
        >
          <ChevronRightIcon aria-hidden size="1em" />
        </ArkDatePicker.NextTrigger>
      </ArkDatePicker.ViewControl>
    );
  }

  return (
    <ArkDatePicker.ViewControl className={classNames(styles.viewControl, styles.nestedViewControl)}>
      <button
        aria-label={localeText.backToPreviousView}
        className={classNames(styles.navigationButton, styles.viewBackButton)}
        onClick={onBack}
        type="button"
      >
        <ArrowLeftIcon aria-hidden size="1em" />
      </button>
      {title}
      <div className={styles.viewPagingControls}>
        <ArkDatePicker.PrevTrigger
          aria-label={localeText.previousMonth}
          className={styles.navigationButton}
        >
          <ChevronLeftIcon aria-hidden size="1em" />
        </ArkDatePicker.PrevTrigger>
        <ArkDatePicker.NextTrigger
          aria-label={localeText.nextMonth}
          className={styles.navigationButton}
        >
          <ChevronRightIcon aria-hidden size="1em" />
        </ArkDatePicker.NextTrigger>
      </div>
    </ArkDatePicker.ViewControl>
  );
};

const DatePickerCalendarSelectionTable = ({
  columns,
  rows,
}: DatePickerCalendarSelectionTableProps) => (
  <ArkDatePicker.Table className={styles.selectionTable} columns={columns}>
    <ArkDatePicker.TableBody>
      {rows.map((row, rowIndex) => (
        <ArkDatePicker.TableRow key={row[0]?.value ?? rowIndex}>
          {row.map((cell) => (
            <ArkDatePicker.TableCell
              className={styles.selectionCell}
              disabled={cell.disabled}
              key={cell.value}
              value={cell.value}
            >
              <ArkDatePicker.TableCellTrigger asChild>
                <button className={styles.selectionButton} disabled={cell.disabled} type="button">
                  <span className={styles.cellLabel}>{cell.label}</span>
                </button>
              </ArkDatePicker.TableCellTrigger>
            </ArkDatePicker.TableCell>
          ))}
        </ArkDatePicker.TableRow>
      ))}
    </ArkDatePicker.TableBody>
  </ArkDatePicker.Table>
);

export const DatePickerCalendar = ({
  children,
  calendarVisible = true,
  className,
  closeOnToday = false,
  disabled,
  localeText,
  minimumView = 'day',
  onToday,
  panel,
  showToday = false,
  size = 'md',
}: DatePickerCalendarProps) => (
  <ArkDatePicker.Positioner className={styles.positioner}>
    <ArkDatePicker.Content
      className={classNames(styles.content, calendarSizeClassMap[size], className)}
    >
      <ArkDatePicker.Context>
        {(datePicker) => {
          const currentDate = today(getLocalTimeZone());
          const monthRows = datePicker.getMonthsGrid({ columns: 3, format: 'short' }).map((row) =>
            row.map((month) => {
              const monthState = datePicker.getMonthTableCellState(month);
              return {
                disabled:
                  !monthState.selectable ||
                  (minimumView === 'month' &&
                    datePicker.isUnavailable(monthState.value.set({ day: 1 }))),
                label: month.label,
                value: month.value,
              };
            }),
          );
          const yearRows = datePicker.getYearsGrid({ columns: 3 }).map((row) =>
            row.map((year) => {
              const yearState = datePicker.getYearTableCellState(year);
              return {
                disabled:
                  !yearState.selectable ||
                  (minimumView === 'year' &&
                    datePicker.isUnavailable(yearState.value.set({ month: 1, day: 1 }))),
                label: year.label,
                value: year.value,
              };
            }),
          );
          const normalizedCurrentDate =
            minimumView === 'month'
              ? currentDate.set({ day: 1 })
              : minimumView === 'year'
                ? currentDate.set({ month: 1, day: 1 })
                : currentDate;
          const handleToday = () => {
            datePicker.setFocusedValue(normalizedCurrentDate);
            if (onToday) {
              onToday(normalizedCurrentDate);
            } else {
              datePicker.setValue([normalizedCurrentDate]);
            }
            if (closeOnToday) {
              datePicker.setOpen(false);
            }
          };

          return (
            <>
              <div className={styles.calendarViews} hidden={!calendarVisible}>
                <ArkDatePicker.View className={styles.view} view="day">
                  <DatePickerCalendarHeader
                    label={datePicker.visibleRangeText.formatted}
                    localeText={localeText}
                    minimumView={minimumView}
                    view="day"
                  />
                  <ArkDatePicker.Table className={styles.table}>
                    <ArkDatePicker.TableHead>
                      <ArkDatePicker.TableRow>
                        {datePicker.weekDays.map((weekDay) => (
                          <ArkDatePicker.TableHeader
                            aria-label={weekDay.long}
                            className={styles.tableHeader}
                            key={weekDay.value.toString()}
                          >
                            {weekDay.narrow}
                          </ArkDatePicker.TableHeader>
                        ))}
                      </ArkDatePicker.TableRow>
                    </ArkDatePicker.TableHead>
                    <ArkDatePicker.TableBody>
                      {datePicker.weeks.map((week) => (
                        <ArkDatePicker.TableRow key={week[0]?.toString()}>
                          {week.map((day, dayIndex) => {
                            const dayState = datePicker.getDayTableCellState({ value: day });
                            const startsRangeRow =
                              dayState.inRange &&
                              (dayIndex === 0 ||
                                dayState.firstInRange ||
                                dayState.firstInHoveredRange);
                            const endsRangeRow =
                              dayState.inRange &&
                              (dayIndex === week.length - 1 ||
                                dayState.lastInRange ||
                                dayState.lastInHoveredRange);
                            return (
                              <ArkDatePicker.TableCell
                                className={styles.tableCell}
                                data-hover-range-end={dayState.lastInHoveredRange ? '' : undefined}
                                data-hover-range-start={
                                  dayState.firstInHoveredRange ? '' : undefined
                                }
                                data-in-hover-range={dayState.inHoveredRange ? '' : undefined}
                                data-in-range={
                                  dayState.inRange && !dayState.inHoveredRange ? '' : undefined
                                }
                                data-range-end={dayState.lastInRange ? '' : undefined}
                                data-range-row-end={endsRangeRow ? '' : undefined}
                                data-range-row-start={startsRangeRow ? '' : undefined}
                                data-range-start={dayState.firstInRange ? '' : undefined}
                                key={day.toString()}
                                value={day}
                              >
                                <ArkDatePicker.TableCellTrigger asChild>
                                  <button
                                    className={styles.dayButton}
                                    disabled={!dayState.selectable}
                                    type="button"
                                  >
                                    <span className={styles.cellLabel}>{day.day}</span>
                                  </button>
                                </ArkDatePicker.TableCellTrigger>
                              </ArkDatePicker.TableCell>
                            );
                          })}
                        </ArkDatePicker.TableRow>
                      ))}
                    </ArkDatePicker.TableBody>
                  </ArkDatePicker.Table>
                </ArkDatePicker.View>
                <ArkDatePicker.View className={styles.view} view="month">
                  <DatePickerCalendarHeader
                    label={datePicker.visibleRangeText.formatted}
                    localeText={localeText}
                    minimumView={minimumView}
                    onBack={() => datePicker.setView('day')}
                    view="month"
                  />
                  <DatePickerCalendarSelectionTable columns={3} rows={monthRows} />
                </ArkDatePicker.View>
                <ArkDatePicker.View className={styles.view} view="year">
                  <DatePickerCalendarHeader
                    label={datePicker.visibleRangeText.formatted}
                    localeText={localeText}
                    minimumView={minimumView}
                    onBack={() => datePicker.setView('month')}
                    view="year"
                  />
                  <DatePickerCalendarSelectionTable columns={3} rows={yearRows} />
                </ArkDatePicker.View>
              </div>
              {!calendarVisible && panel}
              {(showToday || (children !== null && children !== undefined)) && (
                <div className={styles.calendarFooter}>
                  {showToday && (
                    <Button
                      className={styles.todayButton}
                      color="primary"
                      disabled={disabled || datePicker.isUnavailable(normalizedCurrentDate)}
                      onClick={handleToday}
                      size="xs"
                      type="button"
                      variant="ghost"
                    >
                      {localeText.today}
                    </Button>
                  )}
                  {children}
                </div>
              )}
            </>
          );
        }}
      </ArkDatePicker.Context>
    </ArkDatePicker.Content>
  </ArkDatePicker.Positioner>
);

export const DatePickerPortal = ({
  children,
  container,
}: {
  children: ReactNode;
  container: HTMLElement | null | undefined;
}) => {
  const resolvedContainer =
    container !== undefined ? container : typeof document !== 'undefined' ? document.body : null;

  return resolvedContainer ? createPortal(children, resolvedContainer) : children;
};
