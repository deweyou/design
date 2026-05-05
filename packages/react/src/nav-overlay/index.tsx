import { type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  DialogCloseTrigger as ArkDialogCloseTrigger,
  DialogContent as ArkDialogContent,
  DialogRoot as ArkDialogRoot,
  DialogTrigger as ArkDialogTrigger,
} from '@ark-ui/react/dialog';
import classNames from 'classnames';

import { IconButton } from '../button/index.tsx';
import styles from './index.module.less';

// ── Inline close icon (no cross-package dependency) ───────────────────────

const CloseSvg = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" aria-hidden="true">
    <path stroke="currentColor" strokeLinecap="square" strokeWidth="2" d="M6 6l12 12M18 6l-12 12" />
  </svg>
);

// ── Types ─────────────────────────────────────────────────────────────────

export type NavOverlayOpenChangeDetails = { open: boolean };

export type NavOverlayRootProps = {
  /** Controlled open state. Use with onOpenChange for full control. */
  open?: boolean;
  /** Initial open state for uncontrolled usage. Defaults to false. */
  defaultOpen?: boolean;
  /** Callback fired when the overlay opens or closes. */
  onOpenChange?: (details: NavOverlayOpenChangeDetails) => void;
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
};

// ── Sub-components ────────────────────────────────────────────────────────

const NavOverlayRoot = ({ open, defaultOpen, onOpenChange, children }: NavOverlayRootProps) => (
  <ArkDialogRoot
    open={open}
    defaultOpen={defaultOpen}
    onOpenChange={onOpenChange}
    lazyMount
    unmountOnExit
  >
    {children}
  </ArkDialogRoot>
);

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

const NavOverlayCloseButton = ({ className, style }: NavOverlayCloseButtonProps) => (
  <ArkDialogCloseTrigger asChild>
    <IconButton
      aria-label="关闭导航"
      className={classNames(styles.closeButton, className)}
      icon={<CloseSvg />}
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
