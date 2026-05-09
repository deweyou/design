import { type CSSProperties, type ReactNode } from 'react';
import {
  CheckboxRoot as ArkCheckboxRoot,
  CheckboxControl as ArkCheckboxControl,
  CheckboxIndicator as ArkCheckboxIndicator,
  CheckboxLabel as ArkCheckboxLabel,
  CheckboxHiddenInput as ArkCheckboxHiddenInput,
} from '@ark-ui/react/checkbox';
import { CheckIcon, MinusIcon } from '@deweyou-design/react-icons';
import classNames from 'classnames';

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
      className={classNames(styles.root, className)}
      style={style}
    >
      <ArkCheckboxHiddenInput
        aria-disabled={disabled ? true : undefined}
        aria-checked={indeterminate ? 'mixed' : undefined}
      />
      <ArkCheckboxControl className={styles.control}>
        <ArkCheckboxIndicator className={styles.indicator}>
          {indeterminate ? <MinusIcon /> : <CheckIcon />}
        </ArkCheckboxIndicator>
      </ArkCheckboxControl>
      {children !== undefined && (
        <ArkCheckboxLabel className={styles.label}>{children}</ArkCheckboxLabel>
      )}
    </ArkCheckboxRoot>
  );
};
