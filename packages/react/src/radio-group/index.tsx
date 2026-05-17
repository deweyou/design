import { createContext, useContext, type CSSProperties, type ReactNode } from 'react';
import {
  RadioGroupRoot as ArkRadioGroupRoot,
  RadioGroupItem as ArkRadioGroupItem,
  RadioGroupItemControl as ArkRadioGroupItemControl,
  RadioGroupItemText as ArkRadioGroupItemText,
  RadioGroupItemHiddenInput as ArkRadioGroupItemHiddenInput,
  type RadioGroupValueChangeDetails,
} from '@ark-ui/react/radio-group';
import classNames from 'classnames';

import styles from './index.module.less';

type RadioGroupCtx = {
  value?: string;
  groupDisabled: boolean;
};

const RadioGroupCtx = createContext<RadioGroupCtx>({ groupDisabled: false });

export type RadioGroupRootProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  form?: string;
  name?: string;
  orientation?: 'horizontal' | 'vertical';
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  'aria-label'?: string;
  'aria-labelledby'?: string;
};

export type RadioGroupItemProps = {
  value: string;
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

const RadioGroupRoot = ({
  value,
  defaultValue,
  onValueChange,
  disabled,
  form,
  name,
  orientation = 'vertical',
  children,
  className,
  style,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: RadioGroupRootProps) => {
  const handleValueChange = (details: RadioGroupValueChangeDetails) => {
    if (details.value !== null) {
      onValueChange?.(details.value);
    }
  };

  return (
    <RadioGroupCtx.Provider value={{ value, groupDisabled: !!disabled }}>
      <ArkRadioGroupRoot
        value={value}
        defaultValue={defaultValue}
        onValueChange={handleValueChange}
        disabled={disabled}
        form={form}
        name={name}
        orientation={orientation}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className={classNames(
          styles.root,
          orientation === 'horizontal' ? styles.horizontal : styles.vertical,
          className,
        )}
        style={style}
      >
        {children}
      </ArkRadioGroupRoot>
    </RadioGroupCtx.Provider>
  );
};

const RadioGroupItem = ({ value, disabled, children, className, style }: RadioGroupItemProps) => {
  const { groupDisabled } = useContext(RadioGroupCtx);
  const isDisabled = disabled || groupDisabled;

  return (
    <ArkRadioGroupItem
      value={value}
      disabled={disabled}
      className={classNames(styles.item, className)}
      style={style}
    >
      <ArkRadioGroupItemHiddenInput aria-disabled={isDisabled ? true : undefined} />
      <ArkRadioGroupItemControl className={styles.control} />
      {children !== undefined && (
        <ArkRadioGroupItemText className={styles.itemText}>{children}</ArkRadioGroupItemText>
      )}
    </ArkRadioGroupItem>
  );
};

export const RadioGroup = {
  Root: RadioGroupRoot,
  Item: RadioGroupItem,
};
