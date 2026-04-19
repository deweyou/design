import { type CSSProperties } from 'react';
import {
  createToaster,
  Toaster as ArkToaster,
  ToastCloseTrigger,
  ToastDescription,
  ToastRoot,
  ToastTitle,
} from '@ark-ui/react/toast';
import classNames from 'classnames';

import styles from './index.module.less';

export type ToastVariant = 'info' | 'success' | 'warning' | 'danger';

export type ToastOptions = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};

const toasterInstance = createToaster({
  placement: 'top-end',
  overlap: false,
  gap: 8,
});

export const toast = {
  create: (options: ToastOptions) => {
    toasterInstance.create({
      title: options.title,
      description: options.description,
      duration: options.duration ?? 5000,
      type: 'info',
      meta: { variant: options.variant ?? 'info' },
    });
  },
};

export type ToasterProps = {
  className?: string;
  style?: CSSProperties;
};

export const Toaster = ({ className, style }: ToasterProps) => (
  <ArkToaster toaster={toasterInstance}>
    {(t) => {
      const variant = (t.meta as Record<string, unknown>)?.variant as ToastVariant | undefined;

      return (
        <ToastRoot
          key={t.id}
          className={classNames(styles.toast, variant && styles[variant], className)}
          style={style}
        >
          <div className={styles.body}>
            {t.title && <ToastTitle className={styles.title}>{t.title}</ToastTitle>}
            {t.description && (
              <ToastDescription className={styles.description}>{t.description}</ToastDescription>
            )}
          </div>
          <ToastCloseTrigger className={styles.close} aria-label="Dismiss notification">
            <svg aria-hidden focusable="false" height="14" viewBox="0 0 14 14" width="14">
              <path
                d="M1 1l12 12M13 1L1 13"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.5"
              />
            </svg>
          </ToastCloseTrigger>
        </ToastRoot>
      );
    }}
  </ArkToaster>
);
