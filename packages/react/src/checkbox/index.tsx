import { type CSSProperties, type ReactNode } from 'react';
import {
  CheckboxRoot as ArkCheckboxRoot,
  CheckboxControl as ArkCheckboxControl,
  CheckboxLabel as ArkCheckboxLabel,
  CheckboxHiddenInput as ArkCheckboxHiddenInput,
} from '@ark-ui/react/checkbox';
import classNames from 'classnames';

import { CheckboxMark } from '../checkbox-mark/index.tsx';

import styles from './index.module.less';

export type CheckboxProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  indeterminate?: boolean;
  children?: ReactNode;
  name?: string;
  value?: string;
  className?: string;
  style?: CSSProperties;
  'aria-label'?: string;
  'aria-labelledby'?: string;
};

export const Checkbox = ({
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  indeterminate,
  children,
  name,
  value,
  className,
  style,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: CheckboxProps) => {
  const handleCheckedChange = (details: { checked: boolean | 'indeterminate' }) => {
    if (typeof details.checked === 'boolean') {
      onCheckedChange?.(details.checked);
    }
  };

  return (
    <ArkCheckboxRoot
      checked={indeterminate ? 'indeterminate' : checked}
      defaultChecked={defaultChecked}
      onCheckedChange={handleCheckedChange}
      disabled={disabled}
      name={name}
      value={value}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={classNames(styles.root, className)}
      style={style}
    >
      <ArkCheckboxHiddenInput
        aria-disabled={disabled ? true : undefined}
        aria-checked={indeterminate ? 'mixed' : undefined}
      />
      <ArkCheckboxControl asChild>
        <CheckboxMark icon={indeterminate ? 'minus' : 'check'} />
      </ArkCheckboxControl>
      {children !== undefined && (
        <ArkCheckboxLabel className={styles.label}>{children}</ArkCheckboxLabel>
      )}
    </ArkCheckboxRoot>
  );
};
