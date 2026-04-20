import { type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  DialogRoot as ArkDialogRoot,
  DialogTrigger as ArkDialogTrigger,
  DialogBackdrop as ArkDialogBackdrop,
  DialogPositioner as ArkDialogPositioner,
  DialogContent as ArkDialogContent,
  DialogTitle as ArkDialogTitle,
  DialogDescription as ArkDialogDescription,
  DialogCloseTrigger as ArkDialogCloseTrigger,
} from '@ark-ui/react/dialog';
import classNames from 'classnames';

import styles from './index.module.less';

export type DialogRootProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
};

export type DialogTriggerProps = { children: ReactNode };
export type DialogContentProps = { children: ReactNode; className?: string; style?: CSSProperties };
export type DialogTitleProps = { children: ReactNode; className?: string; style?: CSSProperties };
export type DialogDescriptionProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};
export type DialogCloseTriggerProps = { children: ReactNode };

const DialogRoot = ({ open, defaultOpen, onOpenChange, children }: DialogRootProps) => {
  const handleOpenChange = (details: { open: boolean }) => {
    onOpenChange?.(details.open);
  };
  return (
    <ArkDialogRoot
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={handleOpenChange}
      lazyMount
      unmountOnExit
    >
      {children}
    </ArkDialogRoot>
  );
};

const DialogTrigger = ({ children }: DialogTriggerProps) => (
  <ArkDialogTrigger asChild>{children}</ArkDialogTrigger>
);

const DialogContent = ({ children, className, style }: DialogContentProps) =>
  createPortal(
    <>
      <ArkDialogBackdrop className={styles.backdrop} />
      <ArkDialogPositioner className={styles.positioner}>
        <ArkDialogContent className={classNames(styles.panel, className)} style={style}>
          {children}
        </ArkDialogContent>
      </ArkDialogPositioner>
    </>,
    document.body,
  );

const DialogTitle = ({ children, className, style }: DialogTitleProps) => (
  <ArkDialogTitle className={classNames(styles.title, className)} style={style}>
    {children}
  </ArkDialogTitle>
);

const DialogDescription = ({ children, className, style }: DialogDescriptionProps) => (
  <ArkDialogDescription className={classNames(styles.description, className)} style={style}>
    {children}
  </ArkDialogDescription>
);

const DialogCloseTrigger = ({ children }: DialogCloseTriggerProps) => (
  <ArkDialogCloseTrigger asChild>{children}</ArkDialogCloseTrigger>
);

export const Dialog = {
  Root: DialogRoot,
  Trigger: DialogTrigger,
  Content: DialogContent,
  Title: DialogTitle,
  Description: DialogDescription,
  CloseTrigger: DialogCloseTrigger,
};
