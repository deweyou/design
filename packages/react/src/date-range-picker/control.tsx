import {
  type ChangeEvent,
  type FormEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type MutableRefObject,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  DatePicker as ArkDatePicker,
  type DateValue as ArkDateValue,
  useDatePickerContext,
} from '@ark-ui/react/date-picker';
import classNames from 'classnames';

import {
  allowAlternateDateSeparator,
  DatePickerTrailingAction,
  normalizeAlternateDateSeparators,
} from '../date-picker/control.tsx';
import datePickerStyles from '../date-picker/index.module.less';
import { useFieldControlProps } from '../field/index.tsx';
import styles from './index.module.less';

export type DateRangePickerEndpoint = 'start' | 'end';
export type DateRangePickerApi = ReturnType<typeof useDatePickerContext>;

export const DateRangePickerApiBridge = ({
  apiRef,
}: {
  apiRef: MutableRefObject<DateRangePickerApi | null>;
}) => {
  const api = useDatePickerContext();
  useImperativeHandle(apiRef, () => api, [api]);
  return null;
};

type DateRangePickerControlProps = {
  autoComplete?: string;
  autoFocus?: boolean;
  clearable?: boolean;
  clearLabel: string;
  disabled?: boolean;
  endAriaLabel?: string;
  endId: string;
  endLabel: string;
  endLabelId: string;
  endName?: string;
  endPlaceholder: string;
  form?: string;
  labelId?: string;
  normalizeAlternateSeparators: 'date' | 'date-time' | false;
  onClear: () => void;
  onEndpointFocus: (endpoint: DateRangePickerEndpoint) => void;
  onParsedEndpointValue: (endpoint: DateRangePickerEndpoint, value: ArkDateValue) => boolean;
  parseInput: (value: string) => ArkDateValue | undefined;
  readOnly?: boolean;
  startAriaLabel?: string;
  startId: string;
  startLabel: string;
  startLabelId: string;
  startName?: string;
  startPlaceholder: string;
};

const mergeIds = (...ids: Array<string | undefined>) => {
  const values = ids.filter((id): id is string => Boolean(id?.length));
  return values.length > 0 ? values.join(' ') : undefined;
};

export const DateRangePickerControl = ({
  autoComplete,
  autoFocus,
  clearable,
  clearLabel,
  disabled,
  endAriaLabel,
  endId,
  endLabel,
  endLabelId,
  endName,
  endPlaceholder,
  form,
  labelId,
  normalizeAlternateSeparators,
  onClear,
  onEndpointFocus,
  onParsedEndpointValue,
  parseInput,
  readOnly,
  startAriaLabel,
  startId,
  startLabel,
  startLabelId,
  startName,
  startPlaceholder,
}: DateRangePickerControlProps) => {
  const datePicker = useDatePickerContext();
  const startMachineInputProps = datePicker.getInputProps({ fixOnBlur: false, index: 0 });
  const endMachineInputProps = datePicker.getInputProps({ fixOnBlur: false, index: 1 });
  const canClear = Boolean(clearable && !disabled && !readOnly && datePicker.value.length > 0);
  const formattedStartValue = datePicker.valueAsString[0] ?? '';
  const formattedEndValue = datePicker.valueAsString[1] ?? '';
  const [startInputValue, setStartInputValue] = useState(formattedStartValue);
  const [endInputValue, setEndInputValue] = useState(formattedEndValue);
  const focusedEndpointRef = useRef<DateRangePickerEndpoint | null>(null);
  const committedValuesRef = useRef([formattedStartValue, formattedEndValue]);
  committedValuesRef.current = [formattedStartValue, formattedEndValue];
  const startInputProps = useFieldControlProps<
    Pick<
      InputHTMLAttributes<HTMLInputElement>,
      | 'aria-label'
      | 'aria-labelledby'
      | 'autoComplete'
      | 'autoFocus'
      | 'form'
      | 'id'
      | 'name'
      | 'readOnly'
    >
  >({
    'aria-label': startAriaLabel,
    'aria-labelledby': startAriaLabel ? undefined : mergeIds(labelId, startLabelId),
    autoComplete,
    autoFocus,
    form,
    id: startId,
    name: startName,
    readOnly,
  });
  const endInputProps = useFieldControlProps<
    Pick<
      InputHTMLAttributes<HTMLInputElement>,
      'aria-label' | 'aria-labelledby' | 'autoComplete' | 'form' | 'id' | 'name' | 'readOnly'
    >
  >({
    'aria-label': endAriaLabel,
    'aria-labelledby': endAriaLabel ? undefined : mergeIds(labelId, endLabelId),
    autoComplete,
    form,
    id: endId,
    name: endName,
    readOnly,
  });
  useEffect(() => {
    if (focusedEndpointRef.current !== 'start') {
      setStartInputValue(formattedStartValue);
    }
  }, [formattedStartValue]);
  useEffect(() => {
    if (focusedEndpointRef.current !== 'end') {
      setEndInputValue(formattedEndValue);
    }
  }, [formattedEndValue]);

  const normalizeInputValue = useCallback(
    (value: string) => {
      if (normalizeAlternateSeparators === 'date') {
        return value.replace(/[- ]/g, '/');
      }
      if (normalizeAlternateSeparators === 'date-time') {
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
      }
      return value;
    },
    [normalizeAlternateSeparators],
  );
  const setParsedEndpointValue = useCallback(
    (index: number, inputValue: string) => {
      const parsedValue = parseInput(inputValue);
      if (!parsedValue) return false;
      return onParsedEndpointValue(index === 0 ? 'start' : 'end', parsedValue);
    },
    [onParsedEndpointValue, parseInput],
  );
  const handleInputChange = useCallback(
    (index: number, event: ChangeEvent<HTMLInputElement>) => {
      const inputValue = normalizeInputValue(event.currentTarget.value);
      if (index === 0) {
        setStartInputValue(inputValue);
      } else {
        setEndInputValue(inputValue);
      }
      setParsedEndpointValue(index, inputValue);
    },
    [normalizeInputValue, setParsedEndpointValue],
  );
  const restoreCommittedValueAfterEnter = useCallback(
    (index: number, event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Escape' || event.key === 'Tab') return;
      event.stopPropagation();
      if (event.key !== 'Enter' || event.nativeEvent.isComposing) return;

      event.preventDefault();
      const inputValue = index === 0 ? startInputValue : endInputValue;
      setParsedEndpointValue(index, inputValue);
    },
    [endInputValue, setParsedEndpointValue, startInputValue],
  );
  const normalizeSeparators = (event: FormEvent<HTMLInputElement>) => {
    if (normalizeAlternateSeparators) {
      normalizeAlternateDateSeparators(event, normalizeAlternateSeparators);
    }
  };

  return (
    <ArkDatePicker.Control className={classNames(datePickerStyles.control, styles.rangeControl)}>
      <span className={styles.visuallyHidden} id={startLabelId}>
        {startLabel}
      </span>
      <span className={styles.visuallyHidden} id={endLabelId}>
        {endLabel}
      </span>
      <input
        {...startInputProps}
        className={classNames(datePickerStyles.input, styles.rangeInput)}
        onBlur={() => {
          focusedEndpointRef.current = null;
          if (!setParsedEndpointValue(0, startInputValue)) {
            setStartInputValue(committedValuesRef.current[0] ?? '');
          }
        }}
        onBeforeInputCapture={
          normalizeAlternateSeparators ? allowAlternateDateSeparator : undefined
        }
        onChange={(event) => handleInputChange(0, event)}
        onClick={startMachineInputProps.onClick}
        onFocus={(event) => {
          startMachineInputProps.onFocus?.(event);
          focusedEndpointRef.current = 'start';
          onEndpointFocus('start');
        }}
        onInputCapture={normalizeAlternateSeparators ? normalizeSeparators : undefined}
        onKeyDown={(event) => restoreCommittedValueAfterEnter(0, event)}
        placeholder={startPlaceholder}
        value={startInputValue}
      />
      <span aria-hidden className={styles.rangeSeparator}>
        –
      </span>
      <input
        {...endInputProps}
        className={classNames(datePickerStyles.input, styles.rangeInput)}
        onBlur={() => {
          focusedEndpointRef.current = null;
          if (!setParsedEndpointValue(1, endInputValue)) {
            setEndInputValue(committedValuesRef.current[1] ?? '');
          }
        }}
        onBeforeInputCapture={
          normalizeAlternateSeparators ? allowAlternateDateSeparator : undefined
        }
        onChange={(event) => handleInputChange(1, event)}
        onClick={endMachineInputProps.onClick}
        onFocus={(event) => {
          endMachineInputProps.onFocus?.(event);
          focusedEndpointRef.current = 'end';
          onEndpointFocus('end');
        }}
        onInputCapture={normalizeAlternateSeparators ? normalizeSeparators : undefined}
        onKeyDown={(event) => restoreCommittedValueAfterEnter(1, event)}
        placeholder={endPlaceholder}
        value={endInputValue}
      />
      <DatePickerTrailingAction
        canClear={canClear}
        clearLabel={clearLabel}
        onClear={() => {
          setStartInputValue('');
          setEndInputValue('');
          onClear();
        }}
      />
    </ArkDatePicker.Control>
  );
};
