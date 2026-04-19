import { type CSSProperties, type ReactNode, type RefObject, useRef } from 'react';
import {
  SwitchRoot as ArkSwitchRoot,
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
};

const SwitchTrack = ({
  className,
  inputRef,
}: {
  className?: string;
  inputRef: RefObject<HTMLInputElement | null>;
}) => {
  const ctx = useSwitchContext();
  return (
    <span
      role="switch"
      aria-checked={ctx.checked}
      aria-disabled={ctx.disabled ? true : undefined}
      data-state={ctx.checked ? 'checked' : 'unchecked'}
      className={className}
      onClick={(e) => {
        e.stopPropagation();
        if (!ctx.disabled) {
          inputRef.current?.click();
        }
      }}
    >
      <ArkSwitchThumb className={styles.thumb} />
    </span>
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
}: SwitchProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

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
      className={classNames(styles.root, className)}
      style={style}
    >
      <ArkSwitchHiddenInput ref={inputRef} />
      <SwitchTrack className={styles.control} inputRef={inputRef} />
      {children !== undefined && (
        <ArkSwitchLabel className={styles.label}>{children}</ArkSwitchLabel>
      )}
    </ArkSwitchRoot>
  );
};
