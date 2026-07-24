export type DatePickerLocaleTextOverrides = {
  /** Accessible label for returning from time selection to the calendar. */
  backToCalendar?: string;
  /** Accessible label for returning from year to month or month to day view. */
  backToPreviousView?: string;
  /** Accessible label for clearing a selected date. */
  clearDate?: string;
  /** Accessible label for clearing a selected date and time. */
  clearDateTime?: string;
  /** Accessible label for clearing a selected date or date-time range. */
  clearDateRange?: string;
  /** Label for confirming a date-time draft. */
  confirm?: string;
  /** Label for the AM/PM wheel. */
  dayPeriod?: string;
  /** Accessible label for the range end date input. */
  endDate?: string;
  /** Label for the range end time editor. */
  endTime?: string;
  /** Label for the hour wheel. */
  hour?: string;
  /** Label for the minute wheel. */
  minute?: string;
  /** Label for applying the current local wall-clock time. */
  now?: string;
  /** Accessible label for moving to the next calendar page. */
  nextMonth?: string;
  /** Accessible label for opening the calendar panel. */
  openCalendar?: string;
  /** Accessible label for moving to the previous calendar page. */
  previousMonth?: string;
  /** Label for the second wheel. */
  second?: string;
  /** Accessible label for the range start date input. */
  startDate?: string;
  /** Label for the range start time editor. */
  startTime?: string;
  /** Label for the time editor. */
  time?: string;
  /** Label for the action that moves selection to today. */
  today?: string;
};

export type DatePickerLocaleText = Required<DatePickerLocaleTextOverrides>;
