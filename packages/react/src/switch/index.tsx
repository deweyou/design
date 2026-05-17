import { type CSSProperties, type ReactNode } from 'react';
import {
  SwitchRoot as ArkSwitchRoot,
  SwitchControl as ArkSwitchControl,
  SwitchThumb as ArkSwitchThumb,
  SwitchLabel as ArkSwitchLabel,
  SwitchHiddenInput as ArkSwitchHiddenInput,
} from '@ark-ui/react/switch';
import { useSwitchContext } from '@ark-ui/react/switch';
import classNames from 'classnames';

import styles from './index.module.less';

export type SwitchProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  children?: ReactNode;
  name?: string;
  value?: string;
  className?: string;
  style?: CSSProperties;
  'aria-label'?: string;
  'aria-labelledby'?: string;
};

const SwitchHiddenControl = ({
  ariaLabel,
  ariaLabelledBy,
}: {
  ariaLabel?: string;
  ariaLabelledBy?: string;
}) => {
  const ctx = useSwitchContext();

  return (
    <ArkSwitchHiddenInput
      aria-checked={ctx.checked}
      aria-disabled={ctx.disabled ? true : undefined}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      role="switch"
    />
  );
};

export const Switch = ({
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  children,
  name,
  value,
  className,
  style,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: SwitchProps) => {
  const handleCheckedChange = (details: { checked: boolean }) => {
    onCheckedChange?.(details.checked);
  };

  return (
    <ArkSwitchRoot
      checked={checked}
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
      <SwitchHiddenControl
        ariaLabel={children === undefined ? ariaLabel : undefined}
        ariaLabelledBy={children === undefined ? ariaLabelledBy : undefined}
      />
      <ArkSwitchControl className={styles.control}>
        <ArkSwitchThumb className={styles.thumb} />
      </ArkSwitchControl>
      {children !== undefined && (
        <ArkSwitchLabel className={styles.label}>{children}</ArkSwitchLabel>
      )}
    </ArkSwitchRoot>
  );
};
