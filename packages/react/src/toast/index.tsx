import { type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
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
export type ToastPosition = 'top' | 'bottom';

export type ToastOptions = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};

// Two toaster instances — one per position. Only one should be mounted at a time.
const toasters: Record<ToastPosition, ReturnType<typeof createToaster>> = {
  top: createToaster({ placement: 'top', overlap: false, gap: 8 }),
  bottom: createToaster({ placement: 'bottom', overlap: false, gap: 8 }),
};

// Tracks which position the mounted Toaster component uses.
let _mountedPosition: ToastPosition = 'top';

export const toast = {
  create: (options: ToastOptions) => {
    toasters[_mountedPosition].create({
      title: options.title,
      description: options.description,
      duration: options.duration ?? 5000,
      type: 'info',
      meta: { variant: options.variant ?? 'info' },
    });
  },
};

export type ToasterProps = {
  /** Toast 出现的位置，默认 'top'（顶部居中）*/
  position?: ToastPosition;
  className?: string;
  style?: CSSProperties;
};

const CloseIcon = () => (
  <svg aria-hidden focusable="false" height="14" viewBox="0 0 14 14" width="14">
    <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
  </svg>
);

export const Toaster = ({ position = 'top', className, style }: ToasterProps) => {
  _mountedPosition = position;
  const toaster = toasters[position];

  return createPortal(
    <ArkToaster toaster={toaster}>
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
              <CloseIcon />
            </ToastCloseTrigger>
          </ToastRoot>
        );
      }}
    </ArkToaster>,
    document.body,
  );
};
