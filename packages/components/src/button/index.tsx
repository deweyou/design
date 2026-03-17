import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';
import classNames from 'classnames';

import styles from './index.module.less';

export type FoundationButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: 'brand' | 'neutral';
  label?: ReactNode;
};

export const buttonCustomizationContract = {
  componentName: 'FoundationButton',
  rootClassNameSupport: true,
  componentStyleVariables: ['--button-brand-bg', '--button-text-color'],
  internalClassExposure: false,
  themeDependencies: [
    '--ui-color-brand-bg',
    '--ui-color-brand-bg-hover',
    '--ui-color-brand-bg-active',
    '--ui-color-text-on-brand',
    '--ui-color-focus-ring',
  ],
} as const;

export const FoundationButton = ({
  className,
  label,
  tone = 'brand',
  style,
  type = 'button',
  children,
  ...props
}: FoundationButtonProps) => {
  return (
    <button
      {...props}
      className={classNames(styles.root, tone === 'neutral' && styles.neutral, className)}
      style={style as CSSProperties}
      type={type}
    >
      {label ?? children}
    </button>
  );
};
