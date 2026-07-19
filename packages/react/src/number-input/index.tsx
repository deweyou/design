import {
  useCallback,
  useId,
  type CSSProperties,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import {
  NumberInputControl as ArkNumberInputControl,
  NumberInputDecrementTrigger as ArkNumberInputDecrementTrigger,
  NumberInputIncrementTrigger as ArkNumberInputIncrementTrigger,
  NumberInputInput as ArkNumberInputInput,
  NumberInputRoot as ArkNumberInputRoot,
} from '@ark-ui/react/number-input';
import { MinusIcon, PlusIcon } from '@deweyou-design/react-icons';
import classNames from 'classnames';

import { Field, useFieldControlProps } from '../field/index.tsx';
import styles from './index.module.less';

export type NumberInputSize = 'sm' | 'md' | 'lg';

export type NumberInputVariant = 'outlined' | 'ghost';

export type NumberInputValueChangeDetails = {
  value: string;
  valueAsNumber: number;
};

export type NumberInputInvalidDetails = NumberInputValueChangeDetails & {
  reason: 'rangeUnderflow' | 'rangeOverflow';
};

type NumberInputInputMode = 'text' | 'tel' | 'numeric' | 'decimal';

export type NumberInputProps = {
  /** Current numeric string for controlled usage. */
  value?: string;
  /** Initial numeric string for uncontrolled usage. */
  defaultValue?: string;
  /** Called whenever typing or stepping changes the value. */
  onValueChange?: (details: NumberInputValueChangeDetails) => void;
  /** Called when blur or Enter commits the value. */
  onValueCommit?: (details: NumberInputValueChangeDetails) => void;
  /** Called when the value underflows or overflows the configured range. */
  onValueInvalid?: (details: NumberInputInvalidDetails) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Fraction digits used when formatOptions does not override either bound. */
  precision?: number;
  clampValueOnBlur?: boolean;
  allowMouseWheel?: boolean;
  locale?: string;
  formatOptions?: Intl.NumberFormatOptions;
  inputMode?: NumberInputInputMode;
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
  incrementLabel?: string;
  decrementLabel?: string;
  size?: NumberInputSize;
  variant?: NumberInputVariant;
  className?: string;
  style?: CSSProperties;
};

type NumberInputControlProps = Pick<
  NumberInputProps,
  | 'aria-label'
  | 'aria-labelledby'
  | 'autoComplete'
  | 'autoFocus'
  | 'decrementLabel'
  | 'disabled'
  | 'incrementLabel'
  | 'placeholder'
  | 'readOnly'
>;

const sizeClassMap: Record<NumberInputSize, string> = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
};

const variantClassMap: Record<NumberInputVariant, string> = {
  outlined: styles.variantOutlined,
  ghost: styles.variantGhost,
};

const getFormatOptions = ({
  formatOptions,
  precision,
}: Pick<NumberInputProps, 'formatOptions' | 'precision'>) => {
  if (precision === undefined) return formatOptions;

  const fractionDigits = Math.max(0, Math.trunc(precision));
  return {
    ...formatOptions,
    minimumFractionDigits: formatOptions?.minimumFractionDigits ?? fractionDigits,
    maximumFractionDigits: formatOptions?.maximumFractionDigits ?? fractionDigits,
  };
};

const NumberInputControl = ({
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  autoComplete,
  autoFocus,
  decrementLabel,
  disabled,
  incrementLabel,
  placeholder,
  readOnly,
}: NumberInputControlProps) => {
  const inputProps = useFieldControlProps<
    Pick<
      InputHTMLAttributes<HTMLInputElement>,
      'aria-label' | 'aria-labelledby' | 'autoComplete' | 'autoFocus' | 'placeholder'
    >
  >({
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    autoComplete,
    autoFocus,
    placeholder,
  });

  return (
    <ArkNumberInputControl className={styles.control}>
      <ArkNumberInputDecrementTrigger
        aria-label={decrementLabel}
        className={styles.trigger}
        disabled={disabled || readOnly}
      >
        <MinusIcon aria-hidden size="1em" />
      </ArkNumberInputDecrementTrigger>
      <ArkNumberInputInput {...inputProps} className={styles.input} />
      <ArkNumberInputIncrementTrigger
        aria-label={incrementLabel}
        className={styles.trigger}
        disabled={disabled || readOnly}
      >
        <PlusIcon aria-hidden size="1em" />
      </ArkNumberInputIncrementTrigger>
    </ArkNumberInputControl>
  );
};

export const NumberInput = ({
  value,
  defaultValue,
  onValueChange,
  onValueCommit,
  onValueInvalid,
  min,
  max,
  step,
  precision,
  clampValueOnBlur,
  allowMouseWheel,
  locale,
  formatOptions,
  inputMode,
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
  incrementLabel = 'Increase value',
  decrementLabel = 'Decrease value',
  size = 'md',
  variant = 'outlined',
  className,
  style,
}: NumberInputProps) => {
  const reactId = useId();
  const fieldId = id?.length ? id : `number-input-field-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const hasError = Boolean(error);
  const hasHint = Boolean(hint);
  const handleValueChange = useCallback(
    (details: NumberInputValueChangeDetails) => {
      onValueChange?.(details);

      if (!Number.isFinite(details.valueAsNumber)) return;
      if (max !== undefined && details.valueAsNumber > max) {
        onValueInvalid?.({ ...details, reason: 'rangeOverflow' });
      } else if (min !== undefined && details.valueAsNumber < min) {
        onValueInvalid?.({ ...details, reason: 'rangeUnderflow' });
      }
    },
    [max, min, onValueChange, onValueInvalid],
  );

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
      <ArkNumberInputRoot
        allowMouseWheel={allowMouseWheel}
        clampValueOnBlur={clampValueOnBlur}
        defaultValue={defaultValue}
        disabled={disabled}
        form={form}
        formatOptions={getFormatOptions({ formatOptions, precision })}
        ids={{ input: fieldId }}
        inputMode={inputMode}
        invalid={hasError}
        locale={locale}
        max={max}
        min={min}
        name={name}
        onValueChange={handleValueChange}
        onValueCommit={onValueCommit}
        readOnly={readOnly}
        required={required}
        step={step}
        value={value}
        className={classNames(styles.machine, variantClassMap[variant])}
        translations={{ decrementLabel, incrementLabel }}
      >
        <NumberInputControl
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          decrementLabel={decrementLabel}
          disabled={disabled}
          incrementLabel={incrementLabel}
          placeholder={placeholder}
          readOnly={readOnly}
        />
      </ArkNumberInputRoot>
      {hint && <Field.Description className={styles.hint}>{hint}</Field.Description>}
      {hasError && <Field.ErrorText className={styles.error}>{error}</Field.ErrorText>}
    </Field.Root>
  );
};
