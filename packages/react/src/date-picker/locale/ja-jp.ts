import type { DatePickerLocaleText } from './types.ts';

const localeText = {
  backToCalendar: 'カレンダーに戻る',
  backToPreviousView: '前のカレンダー表示に戻る',
  clearDate: '日付をクリア',
  clearDateRange: '日付範囲をクリア',
  clearDateTime: '日付と時刻をクリア',
  confirm: '確定',
  dayPeriod: '午前／午後',
  endDate: '終了日',
  endTime: '終了時刻',
  hour: '時',
  minute: '分',
  now: '現在',
  nextMonth: '翌月',
  openCalendar: 'カレンダーを開く',
  previousMonth: '前月',
  second: '秒',
  startDate: '開始日',
  startTime: '開始時刻',
  time: '時刻',
  today: '今日',
} satisfies DatePickerLocaleText;

export default localeText;
