import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { CheckIcon, MinusIcon } from '@deweyou-design/react-icons';
import classNames from 'classnames';

import styles from './index.module.less';

export type CheckboxMarkState = 'checked' | 'indeterminate' | 'unchecked';

export type CheckboxMarkProps = Omit<ComponentPropsWithoutRef<'span'>, 'children'> & {
  icon?: 'check' | 'minus';
  state?: CheckboxMarkState;
  stateLabel?: ReactNode;
};

export const CheckboxMark = forwardRef<HTMLSpanElement, CheckboxMarkProps>(
  ({ className, icon, state, stateLabel, ...props }, ref) => {
    const iconName = icon ?? (state === 'indeterminate' ? 'minus' : 'check');

    return (
      <span
        {...props}
        ref={ref}
        className={classNames(styles.mark, className)}
        data-ui-checkbox-mark=""
        {...(state === undefined ? {} : { 'data-state': state })}
      >
        <span aria-hidden="true" className={styles.indicator}>
          {iconName === 'minus' ? <MinusIcon size={14} /> : <CheckIcon size={14} />}
        </span>
        {stateLabel !== undefined && <span className={styles.stateLabel}>{stateLabel}</span>}
      </span>
    );
  },
);

CheckboxMark.displayName = 'CheckboxMark';
