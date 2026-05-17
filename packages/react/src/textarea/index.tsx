import type { CSSProperties, TextareaHTMLAttributes } from 'react';
import classNames from 'classnames';

import { Field } from '../field/index.tsx';
import styles from './index.module.less';

export type TextareaSize = 'sm' | 'md' | 'lg';

export type TextareaVariant = 'outlined' | 'ghost';

export type TextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> & {
  /** 标签文字，显示在文本域上方 */
  label?: string;
  /** 辅助提示文字，显示在文本域下方 */
  hint?: string;
  /** 错误信息，非空时文本域进入错误状态 */
  error?: string;
  /** 文本域尺寸，默认 'md' */
  size?: TextareaSize;
  /** 文本域视觉变体，默认 'outlined' */
  variant?: TextareaVariant;
  /** 禁用文本域 */
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
};

const sizeClassMap: Record<TextareaSize, string> = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
};

const variantClassMap: Record<TextareaVariant, string> = {
  outlined: styles.variantOutlined,
  ghost: styles.variantGhost,
};

export const Textarea = ({
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
}: TextareaProps) => {
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
        <textarea
          {...props}
          className={classNames(styles.field, variantClassMap[variant], {
            [styles.fieldError]: hasError,
          })}
          disabled={disabled}
          id={id}
          required={required}
        />
      </Field.Control>
      {hint && <Field.Description className={styles.hint}>{hint}</Field.Description>}
      {hasError && <Field.ErrorText className={styles.error}>{error}</Field.ErrorText>}
    </Field.Root>
  );
};
