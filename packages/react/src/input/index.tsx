import type { CSSProperties, InputHTMLAttributes } from 'react';
import classNames from 'classnames';

import styles from './index.module.less';

export type InputSize = 'sm' | 'md' | 'lg';

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  /** 标签文字，显示在输入框上方 */
  label?: string;
  /** 辅助提示文字，显示在输入框下方 */
  hint?: string;
  /** 错误信息，非空时输入框进入错误状态 */
  error?: string;
  /** 输入框尺寸，默认 'md' */
  size?: InputSize;
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

export const Input = ({
  className,
  disabled,
  error,
  hint,
  id,
  label,
  size = 'md',
  style,
  ...props
}: InputProps) => {
  const hasError = Boolean(error);
  const hintText = error ?? hint;

  return (
    <div
      className={classNames(
        styles.root,
        sizeClassMap[size],
        {
          [styles.disabled]: disabled,
        },
        className,
      )}
      style={style}
    >
      {label && (
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
      )}
      <input
        {...props}
        className={classNames(styles.field, {
          [styles.fieldError]: hasError,
        })}
        disabled={disabled}
        id={id}
      />
      {hintText && (
        <p className={classNames({ [styles.hint]: !hasError, [styles.error]: hasError })}>
          {hintText}
        </p>
      )}
    </div>
  );
};
