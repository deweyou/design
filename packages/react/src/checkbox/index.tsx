import { type CSSProperties, type ReactNode } from 'react';
import {
  CheckboxRoot as ArkCheckboxRoot,
  CheckboxControl as ArkCheckboxControl,
  CheckboxIndicator as ArkCheckboxIndicator,
  CheckboxLabel as ArkCheckboxLabel,
  CheckboxHiddenInput as ArkCheckboxHiddenInput,
} from '@ark-ui/react/checkbox';
import classNames from 'classnames';

import styles from './index.module.less';

const CheckmarkSvg = () => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" fill="none" aria-hidden="true">
    <path stroke="currentColor" strokeWidth="2" strokeLinecap="square" d="M3 8.5L6.5 12L13 5" />
  </svg>
);

const IndeterminateSvg = () => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" fill="none" aria-hidden="true">
    <path stroke="currentColor" strokeWidth="2" strokeLinecap="square" d="M3 8H13" />
  </svg>
);

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
          {indeterminate ? <IndeterminateSvg /> : <CheckmarkSvg />}
        </ArkCheckboxIndicator>
      </ArkCheckboxControl>
      {children !== undefined && (
        <ArkCheckboxLabel className={styles.label}>{children}</ArkCheckboxLabel>
      )}
    </ArkCheckboxRoot>
  );
};
