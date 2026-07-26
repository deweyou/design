import {
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type InputHTMLAttributes,
} from 'react';
import { XIcon } from '@deweyou-design/react-icons';
import classNames from 'classnames';

import { Field } from '../field/index.tsx';
import styles from './index.module.less';
import { useInputLocaleText } from './locale/loader.ts';
import type { InputLocaleText } from './locale/types.ts';

export type InputSize = 'sm' | 'md' | 'lg';

export type InputVariant = 'outlined' | 'ghost';

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  /** 标签文字，显示在输入框上方 */
  label?: string;
  /** 辅助提示文字，显示在输入框下方 */
  hint?: string;
  /** 错误信息，非空时输入框进入错误状态 */
  error?: string;
  /** 输入框尺寸，默认 'md' */
  size?: InputSize;
  /** 输入框视觉变体，默认 'outlined' */
  variant?: InputVariant;
  /** Whether to show a clear action when the editable input has a value. */
  clearable?: boolean;
  /** Component-owned accessible labels. */
  localeText?: Partial<InputLocaleText>;
  /** 禁用输入框 */
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
};

type InputControlProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  clearable: boolean;
  clearLabel: string;
  hasError: boolean;
  variant: InputVariant;
};

const sizeClassMap: Record<InputSize, string> = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
};

const variantClassMap: Record<InputVariant, string> = {
  outlined: styles.variantOutlined,
  ghost: styles.variantGhost,
};

const hasInputValue = (value: InputHTMLAttributes<HTMLInputElement>['value']) => {
  if (value === undefined || value === null) return false;
  if (Array.isArray(value)) return value.length > 0;
  return String(value).length > 0;
};

const InputControl = ({
  clearable,
  clearLabel,
  defaultValue,
  disabled,
  hasError,
  onChange,
  readOnly,
  value,
  variant,
  ...props
}: InputControlProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uncontrolledValue, setUncontrolledValue] =
    useState<InputHTMLAttributes<HTMLInputElement>['value']>(defaultValue);
  const currentValue = value === undefined ? uncontrolledValue : value;
  const canClear = clearable && !disabled && !readOnly && hasInputValue(currentValue);

  const changeValue = (event: ChangeEvent<HTMLInputElement>) => {
    if (value === undefined) {
      setUncontrolledValue(event.currentTarget.value);
    }
    onChange?.(event);
  };

  const clearValue = () => {
    const input = inputRef.current;
    const view = input?.ownerDocument.defaultView;
    if (!input || !view) return;

    const valueDescriptor = Object.getOwnPropertyDescriptor(
      view.HTMLInputElement.prototype,
      'value',
    );
    if (valueDescriptor?.set) {
      valueDescriptor.set.call(input, '');
    } else {
      input.value = '';
    }

    input.dispatchEvent(new view.Event('input', { bubbles: true }));
    input.focus();
  };

  return (
    <span className={styles.control} data-clearable={clearable ? 'true' : undefined}>
      <input
        {...props}
        className={classNames(styles.field, variantClassMap[variant], {
          [styles.fieldError]: hasError,
        })}
        defaultValue={defaultValue}
        disabled={disabled}
        onChange={changeValue}
        readOnly={readOnly}
        ref={inputRef}
        value={value}
      />
      {clearable && (
        <span className={styles.clearAction}>
          {canClear && (
            <button
              aria-label={clearLabel}
              className={styles.clearButton}
              onClick={clearValue}
              onPointerDown={(event) => event.preventDefault()}
              type="button"
            >
              <span className={styles.clearButtonSurface}>
                <XIcon aria-hidden size="0.625em" />
              </span>
            </button>
          )}
        </span>
      )}
    </span>
  );
};

export const Input = ({
  className,
  clearable = false,
  disabled,
  error,
  hint,
  id,
  label,
  localeText,
  required,
  size = 'md',
  style,
  variant = 'outlined',
  ...props
}: InputProps) => {
  const text = useInputLocaleText(localeText);
  const hasError = Boolean(error);
  const hasHint = Boolean(hint);

  return (
    <Field.Root
      className={classNames(
        styles.root,
        sizeClassMap[size],
        {
          [styles.disabled]: disabled,
        },
        className,
      )}
      disabled={disabled}
      hasDescription={hasHint}
      hasError={hasError}
      id={id}
      invalid={hasError}
      required={required}
      style={style}
    >
      {label && <Field.Label className={styles.label}>{label}</Field.Label>}
      <Field.Control>
        <InputControl
          {...props}
          clearable={clearable}
          clearLabel={text.clearInput}
          disabled={disabled}
          hasError={hasError}
          variant={variant}
        />
      </Field.Control>
      {hint && <Field.Description className={styles.hint}>{hint}</Field.Description>}
      {hasError && <Field.ErrorText className={styles.error}>{error}</Field.ErrorText>}
    </Field.Root>
  );
};

export type { InputLocaleText } from './locale/types.ts';
