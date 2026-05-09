import { type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  DialogCloseTrigger as ArkDialogCloseTrigger,
  DialogContent as ArkDialogContent,
  DialogRoot as ArkDialogRoot,
  DialogTrigger as ArkDialogTrigger,
} from '@ark-ui/react/dialog';
import { XIcon } from '@deweyou-design/react-icons';
import classNames from 'classnames';

import { IconButton } from '../button/index.tsx';
import styles from './index.module.less';

// ── Types ─────────────────────────────────────────────────────────────────

export type NavOverlayRootProps = {
  /** Controlled open state. Use with onOpenChange for full control. */
  open?: boolean;
  /** Initial open state for uncontrolled usage. Defaults to false. */
  defaultOpen?: boolean;
  /** Callback fired when the overlay opens or closes. */
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
};

export type NavOverlayTriggerProps = {
  /** The trigger element. Must be a single focusable element. */
  children: ReactNode;
};

export type NavOverlayContentProps = {
  /** Navigation content rendered inside the fullscreen overlay. */
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export type NavOverlayCloseButtonProps = {
  /** Override the default top-right positioning. */
  className?: string;
  style?: CSSProperties;
  /** Accessible label for the close button. Defaults to 'Close navigation'. */
  'aria-label'?: string;
};

// ── Sub-components ────────────────────────────────────────────────────────

const NavOverlayRoot = ({ open, defaultOpen, onOpenChange, children }: NavOverlayRootProps) => {
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

const NavOverlayTrigger = ({ children }: NavOverlayTriggerProps) => (
  <ArkDialogTrigger asChild>{children}</ArkDialogTrigger>
);

const NavOverlayContent = ({ children, className, style }: NavOverlayContentProps) =>
  createPortal(
    <ArkDialogContent className={classNames(styles.content, className)} style={style}>
      {children}
    </ArkDialogContent>,
    document.body,
  );

const NavOverlayCloseButton = ({
  className,
  style,
  'aria-label': ariaLabel = 'Close navigation',
}: NavOverlayCloseButtonProps) => (
  <ArkDialogCloseTrigger asChild>
    <IconButton
      aria-label={ariaLabel}
      className={classNames(styles.closeButton, className)}
      icon={<XIcon />}
      style={style}
      variant="ghost"
    />
  </ArkDialogCloseTrigger>
);

// ── Compound export ───────────────────────────────────────────────────────

export const NavOverlay = {
  Root: NavOverlayRoot,
  Trigger: NavOverlayTrigger,
  Content: NavOverlayContent,
  CloseButton: NavOverlayCloseButton,
};
