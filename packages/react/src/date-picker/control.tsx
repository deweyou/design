import {
  type ChangeEvent,
  type FormEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  DatePicker as ArkDatePicker,
  type DateValue as ArkDateValue,
  useDatePickerContext,
} from '@ark-ui/react/date-picker';
import { CalendarIcon, XIcon } from '@deweyou-design/react-icons';
import classNames from 'classnames';

import { useFieldControlProps } from '../field/index.tsx';
import styles from './index.module.less';

export type DatePickerControlProps = {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  clearable?: boolean;
  clearLabel: string;
  disabled?: boolean;
  form?: string;
  normalizeAlternateSeparators: 'date' | 'date-time' | false;
  readOnly?: boolean;
};

type DatePickerTextControlProps = Omit<DatePickerControlProps, 'normalizeAlternateSeparators'> & {
  normalizeAlternateSeparators: boolean;
  onClear: () => void;
  parseInput: (value: string) => ArkDateValue | undefined;
};

export const allowAlternateDateSeparator = (event: FormEvent<HTMLInputElement>) => {
  const data = (event.nativeEvent as InputEvent).data;

  if (data === '-' || data === ' ') {
    event.stopPropagation();
  }
};

const normalizeDateTimeSeparators = (value: string) => {
  let separatorCount = 0;
  let normalizedValue = '';

  for (const character of value) {
    if (separatorCount < 2 && (character === '/' || character === '-' || character === ' ')) {
      normalizedValue += '/';
      separatorCount += 1;
    } else {
      normalizedValue += character;
    }
  }

  return normalizedValue;
};

export const DatePickerTrailingAction = ({
  canClear,
  clearLabel,
  onClear,
}: {
  canClear: boolean;
  clearLabel: string;
  onClear?: () => void;
}) => (
  <span className={styles.trailingAction} data-clearable={canClear ? 'true' : undefined}>
    <span aria-hidden className={styles.calendarIndicator}>
      <CalendarIcon size="1em" />
    </span>
    {canClear && onClear && (
      <button
        aria-label={clearLabel}
        className={classNames(styles.iconButton, styles.clearButton, styles.mergedClearButton)}
        onClick={(event) => {
          event.stopPropagation();
          onClear();
        }}
        onPointerDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        type="button"
      >
        <span className={styles.clearButtonSurface}>
          <XIcon aria-hidden size="0.625em" />
        </span>
      </button>
    )}
    {canClear && !onClear && (
      <ArkDatePicker.ClearTrigger
        aria-label={clearLabel}
        className={classNames(styles.iconButton, styles.clearButton, styles.mergedClearButton)}
      >
        <span className={styles.clearButtonSurface}>
          <XIcon aria-hidden size="0.625em" />
        </span>
      </ArkDatePicker.ClearTrigger>
    )}
  </span>
);

export const normalizeAlternateDateSeparators = (
  event: FormEvent<HTMLInputElement>,
  mode: 'date' | 'date-time',
) => {
  const input = event.currentTarget;
  const normalizedValue =
    mode === 'date-time'
      ? normalizeDateTimeSeparators(input.value)
      : input.value.replace(/[- ]/g, '/');

  if (normalizedValue === input.value) return;

  const selectionStart = input.selectionStart;
  const selectionEnd = input.selectionEnd;
  input.value = normalizedValue;

  if (selectionStart !== null && selectionEnd !== null) {
    input.setSelectionRange(selectionStart, selectionEnd);
  }
};

export const DatePickerControl = ({
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  autoComplete,
  autoFocus,
  clearable,
  clearLabel,
  disabled,
  form,
  normalizeAlternateSeparators,
  readOnly,
}: DatePickerControlProps) => {
  const datePicker = useDatePickerContext();
  const canClear = Boolean(clearable && !disabled && !readOnly && datePicker.value.length > 0);
  const committedValueRef = useRef(datePicker.valueAsString[0] ?? '');
  committedValueRef.current = datePicker.valueAsString[0] ?? '';
  const inputProps = useFieldControlProps<
    Pick<
      InputHTMLAttributes<HTMLInputElement>,
      'aria-label' | 'aria-labelledby' | 'autoComplete' | 'autoFocus' | 'form' | 'readOnly'
    >
  >({
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    autoComplete,
    autoFocus,
    form,
    readOnly,
  });
  const restoreCommittedValueAfterEnter = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) return;

    const input = event.currentTarget;
    input.ownerDocument.defaultView?.requestAnimationFrame(() => {
      // Zag can write its missing array entry into the input when Enter commits the first value.
      if (input.value === 'undefined') {
        input.value = committedValueRef.current;
      }
    });
  }, []);

  return (
    <ArkDatePicker.Control className={styles.control}>
      <ArkDatePicker.Input
        {...inputProps}
        className={styles.input}
        index={0}
        onBeforeInputCapture={
          normalizeAlternateSeparators ? allowAlternateDateSeparator : undefined
        }
        onInputCapture={
          normalizeAlternateSeparators
            ? (event) => normalizeAlternateDateSeparators(event, normalizeAlternateSeparators)
            : undefined
        }
        onKeyDown={restoreCommittedValueAfterEnter}
      />
      <DatePickerTrailingAction canClear={canClear} clearLabel={clearLabel} />
    </ArkDatePicker.Control>
  );
};

export const DatePickerTextControl = ({
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  autoComplete,
  autoFocus,
  clearable,
  clearLabel,
  disabled,
  form,
  normalizeAlternateSeparators,
  onClear,
  parseInput,
  readOnly,
}: DatePickerTextControlProps) => {
  const datePicker = useDatePickerContext();
  const formattedValue = datePicker.valueAsString[0] ?? '';
  const [inputValue, setInputValue] = useState(formattedValue);
  const canClear = Boolean(clearable && !disabled && !readOnly && datePicker.value.length > 0);
  const inputProps = useFieldControlProps<
    Pick<
      InputHTMLAttributes<HTMLInputElement>,
      | 'aria-label'
      | 'aria-labelledby'
      | 'autoComplete'
      | 'autoFocus'
      | 'disabled'
      | 'form'
      | 'readOnly'
    >
  >({
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    autoComplete,
    autoFocus,
    disabled,
    form,
    readOnly,
  });

  useEffect(() => {
    setInputValue(formattedValue);
  }, [formattedValue]);

  const parseAndSetValue = (nextValue: string) => {
    const parsedValue = parseInput(nextValue);
    if (parsedValue) {
      datePicker.setValue([parsedValue]);
      datePicker.setOpen(true);
    }
    return parsedValue;
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = normalizeAlternateSeparators
      ? normalizeDateTimeSeparators(event.currentTarget.value)
      : event.currentTarget.value;
    setInputValue(nextValue);
    parseAndSetValue(nextValue);
  };

  return (
    <ArkDatePicker.Control className={styles.control}>
      <input
        {...inputProps}
        className={styles.input}
        onBlur={() => {
          if (!parseInput(inputValue)) {
            setInputValue(formattedValue);
          }
        }}
        onChange={handleChange}
        onClick={() => datePicker.setOpen(true)}
        onKeyDown={(event) => {
          if (event.key !== 'Escape' && event.key !== 'Tab') {
            event.stopPropagation();
          }
          if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
            event.preventDefault();
            parseAndSetValue(inputValue);
          }
        }}
        placeholder={datePicker.getInputProps({ index: 0 }).placeholder}
        value={inputValue}
      />
      <DatePickerTrailingAction canClear={canClear} clearLabel={clearLabel} onClear={onClear} />
    </ArkDatePicker.Control>
  );
};
