import type { CSSProperties, InputHTMLAttributes } from 'react';
import classNames from 'classnames';

import { Field } from '../field/index.tsx';
import styles from './index.module.less';

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
  /** 禁用输入框 */
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
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

export const Input = ({
  className,
  disabled,
  error,
  hint,
  id,
  label,
  required,
  size = 'md',
  style,
  variant = 'outlined',
  ...props
}: InputProps) => {
  const hasError = Boolean(error);
  const hintText = error ?? hint;

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
      hasDescription={hint !== undefined}
      hasError={hasError}
      id={id}
      invalid={hasError}
      required={required}
      style={style}
    >
      {label && <Field.Label className={styles.label}>{label}</Field.Label>}
      <Field.Control>
        <input
          {...props}
          className={classNames(styles.field, variantClassMap[variant], {
            [styles.fieldError]: hasError,
          })}
          disabled={disabled}
          id={id}
          required={required}
        />
      </Field.Control>
      {hintText &&
        (hasError ? (
          <Field.ErrorText className={styles.error}>{hintText}</Field.ErrorText>
        ) : (
          <Field.Description className={styles.hint}>{hintText}</Field.Description>
        ))}
    </Field.Root>
  );
};
