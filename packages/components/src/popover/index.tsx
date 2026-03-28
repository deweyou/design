import {
  Fragment,
  cloneElement,
  createElement,
  isValidElement,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type HTMLAttributes,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import { Popover as ArkPopover, usePopoverContext } from '@ark-ui/react/popover';

import styles from './index.module.less';

export const popoverTriggerOptions = ['click', 'hover', 'focus', 'context-menu'] as const;

export type PopoverTrigger = (typeof popoverTriggerOptions)[number];

export const popoverPlacementOptions = [
  'top',
  'bottom',
  'left',
  'right',
  'left-top',
  'left-bottom',
  'right-top',
  'right-bottom',
] as const;

export type PopoverPlacement = (typeof popoverPlacementOptions)[number];

export const popoverModeOptions = ['card', 'loose', 'pure'] as const;

export type PopoverMode = (typeof popoverModeOptions)[number];

export const popoverShapeOptions = ['rect', 'rounded'] as const;

export type PopoverShape = (typeof popoverShapeOptions)[number];

export const popoverVisibilityChangeReasonOptions = [
  'trigger',
  'context-menu',
  'outside-press',
  'escape',
  'explicit-action',
  'controlled-update',
  'disabled-reference',
] as const;

export type PopoverVisibilityChangeReason = (typeof popoverVisibilityChangeReasonOptions)[number];

export type PopoverVisibilityChangeDetails = {
  event?: Event;
  reason: PopoverVisibilityChangeReason;
};

export type PopoverProps = Omit<HTMLAttributes<HTMLElement>, 'children' | 'content'> & {
  boundaryPadding?: number;
  children?: ReactNode;
  content: ReactNode;
  defaultVisible?: boolean;
  disabled?: boolean;
  mode?: PopoverMode;
  offset?: number;
  onVisibleChange?: (visible: boolean, details: PopoverVisibilityChangeDetails) => void;
  overlayClassName?: string;
  overlayStyle?: CSSProperties;
  placement?: PopoverPlacement;
  popupPortalContainer?:
    | HTMLElement
    | ShadowRoot
    | null
    | { current: HTMLElement | ShadowRoot | null };
  shape?: PopoverShape;
  trigger?: PopoverTrigger | readonly PopoverTrigger[];
  visible?: boolean;
};

const defaultBoundaryPadding = 16;
const defaultOffset = 8;

const arkPlacementByPopoverPlacement = {
  top: 'top',
  bottom: 'bottom',
  left: 'left',
  right: 'right',
  'left-top': 'left-end',
  'left-bottom': 'left-start',
  'right-top': 'right-end',
  'right-bottom': 'right-start',
} as const satisfies Record<PopoverPlacement, string>;

const popoverPlacementByArkPlacement: Partial<Record<string, PopoverPlacement>> = {
  top: 'top',
  bottom: 'bottom',
  left: 'left',
  right: 'right',
  'left-start': 'left-bottom',
  'left-end': 'left-top',
  'right-start': 'right-bottom',
  'right-end': 'right-top',
};

const sanitizeNumber = (value: number | undefined, fallbackValue: number) => {
  if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) {
    return fallbackValue;
  }

  return Math.max(0, value);
};

const normalizeTriggerList = (
  trigger: PopoverTrigger | readonly PopoverTrigger[] | undefined,
): PopoverTrigger[] => {
  const input = trigger === undefined ? ['click'] : Array.isArray(trigger) ? trigger : [trigger];

  return Array.from(new Set(input));
};

const canCloneReferenceChild = (node: ReactNode): node is ReactElement<Record<string, unknown>> => {
  return isValidElement(node) && node.type !== Fragment;
};

const getArrowShapeData = (side: string) => {
  switch (side) {
    case 'top':
      return {
        height: 8,
        strokePath: 'M1 0.75 L7 7 L13 0.75',
        viewBox: '0 0 14 8',
        width: 14,
      };
    case 'left':
      return {
        height: 14,
        strokePath: 'M0.75 1 L7 7 L0.75 13',
        viewBox: '0 0 8 14',
        width: 8,
      };
    case 'right':
      return {
        height: 14,
        strokePath: 'M7.25 1 L1 7 L7.25 13',
        viewBox: '0 0 8 14',
        width: 8,
      };
    case 'bottom':
    default:
      return {
        height: 8,
        strokePath: 'M1 7.25 L7 1 L13 7.25',
        viewBox: '0 0 14 8',
        width: 14,
      };
  }
};

type PopoverOverlayProps = {
  boundaryPadding: number;
  children: ReactNode;
  contentRef: React.RefObject<HTMLDivElement | null>;
  mode: PopoverMode;
  onSurfaceBlurCapture: (event: React.FocusEvent<HTMLDivElement>) => void;
  onSurfaceFocusCapture: () => void;
  overlayClassName: string | undefined;
  overlayStyle: CSSProperties | undefined;
  placement: PopoverPlacement;
  requestedPlacement: PopoverPlacement;
  shape: PopoverShape;
};

const PopoverOverlay = ({
  boundaryPadding,
  children,
  contentRef,
  mode,
  onSurfaceBlurCapture,
  onSurfaceFocusCapture,
  overlayClassName,
  overlayStyle,
  placement,
  requestedPlacement,
  shape,
}: PopoverOverlayProps) => {
  const api = usePopoverContext();
  const positionerProps = api.getPositionerProps() as Record<string, unknown>;
  const currentArkPlacement =
    (positionerProps['data-placement'] as string | undefined) ??
    arkPlacementByPopoverPlacement[placement];
  const resolvedPlacement = popoverPlacementByArkPlacement[currentArkPlacement] ?? placement;
  const resolvedSide = currentArkPlacement.split('-')[0];
  const arrowShape = getArrowShapeData(resolvedSide);

  return (
    <ArkPopover.Positioner>
      <ArkPopover.Content
        className={classNames(styles.overlay, overlayClassName)}
        data-boundary-padding={String(boundaryPadding)}
        data-mode={mode}
        data-placement={resolvedPlacement}
        data-popover-overlay="true"
        data-requested-placement={requestedPlacement}
        data-shape={shape}
        data-side={resolvedSide}
        ref={contentRef}
        style={overlayStyle}
      >
        <div
          className={styles.surface}
          data-mode={mode}
          onBlurCapture={onSurfaceBlurCapture}
          onFocusCapture={onSurfaceFocusCapture}
        >
          {children}
        </div>
        <span className={styles.arrow} data-popover-arrow="true" data-side={resolvedSide}>
          <svg
            aria-hidden="true"
            focusable="false"
            height={arrowShape.height}
            viewBox={arrowShape.viewBox}
            width={arrowShape.width}
          >
            <path
              d={
                resolvedSide === 'top'
                  ? 'M0 0 H14 L7 8 Z'
                  : resolvedSide === 'bottom'
                    ? 'M0 8 H14 L7 0 Z'
                    : resolvedSide === 'left'
                      ? 'M0 0 V14 L8 7 Z'
                      : 'M8 0 V14 L0 7 Z'
              }
              fill="var(--popover-surface-background)"
            />
            <path
              d={arrowShape.strokePath}
              fill="none"
              stroke="var(--ui-color-border)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.25"
            />
          </svg>
        </span>
      </ArkPopover.Content>
    </ArkPopover.Positioner>
  );
};

export const Popover = ({
  boundaryPadding,
  children,
  className,
  content,
  defaultVisible = false,
  disabled = false,
  mode = 'card',
  offset = defaultOffset,
  onVisibleChange,
  overlayClassName,
  overlayStyle,
  placement = 'bottom',
  popupPortalContainer,
  shape = 'rounded',
  style,
  trigger,
  visible,
  ...domProps
}: PopoverProps) => {
  if (content === null || content === undefined) {
    throw new Error('Popover content is required.');
  }

  const normalizedTriggers = normalizeTriggerList(trigger);
  const resolvedBoundaryPadding = sanitizeNumber(boundaryPadding, defaultBoundaryPadding);
  const resolvedOffset = sanitizeNumber(offset, defaultOffset);
  const isControlled = visible !== undefined;
  const [uncontrolledVisible, setUncontrolledVisible] = useState(defaultVisible);
  const requestedOpen = isControlled ? visible : uncontrolledVisible;
  const open = disabled ? false : requestedOpen;
  const openRef = useRef(open);
  const blurTimeoutRef = useRef<number | null>(null);
  const pointerFocusGuardRef = useRef(false);
  const suppressFocusOpenRef = useRef(false);
  const openedFromFocusRef = useRef(false);
  const referenceRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const dismissReasonRef = useRef<PopoverVisibilityChangeReason | null>(null);
  const hasMountedRef = useRef(false);

  openRef.current = open;

  const applyVisibleChange = (nextVisible: boolean, details: PopoverVisibilityChangeDetails) => {
    if (disabled && nextVisible) {
      return;
    }

    if (!isControlled) {
      setUncontrolledVisible(nextVisible);
    }

    if (nextVisible !== openRef.current) {
      onVisibleChange?.(nextVisible, details);
    }
  };

  const applyVisibleChangeRef = useRef(applyVisibleChange);
  applyVisibleChangeRef.current = applyVisibleChange;

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current !== null) {
        window.clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!open) {
      openedFromFocusRef.current = false;
    }
  }, [open]);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    if (open) {
      const activeElement =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      const referenceElement = referenceRef.current;

      if (!activeElement || !referenceElement?.contains(activeElement)) {
        return;
      }

      return;
    }

    const referenceElement = referenceRef.current;

    if (referenceElement && referenceElement.isConnected) {
      suppressFocusOpenRef.current = true;
      referenceElement.focus();
      window.setTimeout(() => {
        suppressFocusOpenRef.current = false;
      }, 0);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Stop propagation so nested popovers don't double-close (inner closes first).
        // This also prevents Zag's deferred dismissable layer (RAF-based) from firing.
        event.stopImmediatePropagation();
        dismissReasonRef.current = 'escape';
        applyVisibleChangeRef.current(false, { reason: 'escape' });
      }
    };
    document.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => document.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [open]);

  useEffect(() => {
    if (!disabled || !requestedOpen) {
      return;
    }

    if (!isControlled) {
      setUncontrolledVisible(false);
    }

    if (openRef.current) {
      onVisibleChange?.(false, {
        reason: 'disabled-reference',
      });
    }
  }, [disabled, isControlled, onVisibleChange, requestedOpen]);

  const shouldCloseOnFocusOut =
    normalizedTriggers.includes('focus') &&
    (!normalizedTriggers.includes('click') || openedFromFocusRef.current);

  const referenceChild = canCloneReferenceChild(children)
    ? children
    : createElement('span', null, children);
  const referenceChildProps = referenceChild.props as Record<string, unknown>;

  const referenceContextMenu = referenceChildProps.onContextMenu as
    | ((event: ReactMouseEvent<Element>) => void)
    | undefined;
  const referenceFocus = referenceChildProps.onFocus as
    | ((event: ReactFocusEvent<Element>) => void)
    | undefined;
  const referenceBlur = referenceChildProps.onBlur as
    | ((event: ReactFocusEvent<Element>) => void)
    | undefined;
  const referenceKeyDown = referenceChildProps.onKeyDown as
    | ((event: ReactKeyboardEvent<Element>) => void)
    | undefined;
  const rootContextMenu = (domProps as Record<string, unknown>).onContextMenu as
    | ((event: ReactMouseEvent<Element>) => void)
    | undefined;
  const rootFocus = (domProps as Record<string, unknown>).onFocus as
    | ((event: ReactFocusEvent<Element>) => void)
    | undefined;
  const rootBlur = (domProps as Record<string, unknown>).onBlur as
    | ((event: ReactFocusEvent<Element>) => void)
    | undefined;
  const rootKeyDown = (domProps as Record<string, unknown>).onKeyDown as
    | ((event: ReactKeyboardEvent<Element>) => void)
    | undefined;

  const referenceClassName = classNames(
    styles.reference,
    referenceChildProps.className as string | undefined,
    className,
  );
  const referenceStyle = {
    ...(referenceChildProps.style as CSSProperties | undefined),
    ...style,
  };

  const isClickTrigger = normalizedTriggers.includes('click');
  const isHoverTrigger = normalizedTriggers.includes('hover');
  const isFocusTrigger = normalizedTriggers.includes('focus');

  const sharedReferenceProps: Record<string, unknown> = {
    ...referenceChildProps,
    ...domProps,
    'aria-disabled': disabled || undefined,
    className: referenceClassName,
    style: referenceStyle,
    'data-disabled': String(disabled),
    'data-popover-reference': 'true',
    'data-visible': String(open),
    onClick: (event: ReactMouseEvent<Element>) => {
      const childOnClick = referenceChildProps.onClick as
        | ((e: ReactMouseEvent<Element>) => void)
        | undefined;
      const rootOnClick = (domProps as Record<string, unknown>).onClick as
        | ((e: ReactMouseEvent<Element>) => void)
        | undefined;

      childOnClick?.(event);
      rootOnClick?.(event);

      if (isClickTrigger) {
        dismissReasonRef.current = 'trigger';
      }
    },
    onBlur: (event: ReactFocusEvent<Element>) => {
      referenceBlur?.(event);
      rootBlur?.(event);

      if (event.defaultPrevented || disabled || !shouldCloseOnFocusOut) {
        return;
      }

      if (blurTimeoutRef.current !== null) {
        window.clearTimeout(blurTimeoutRef.current);
      }

      blurTimeoutRef.current = window.setTimeout(() => {
        const nextFocusedElement =
          event.relatedTarget instanceof HTMLElement
            ? event.relatedTarget
            : document.activeElement instanceof HTMLElement
              ? document.activeElement
              : null;

        const isWithin =
          referenceRef.current?.contains(nextFocusedElement) === true ||
          contentRef.current?.contains(nextFocusedElement) === true;

        if (isWithin) {
          return;
        }

        applyVisibleChange(false, {
          event: event.nativeEvent,
          reason: 'trigger',
        });
      }, 0);
    },
    onFocus: (event: ReactFocusEvent<Element>) => {
      referenceFocus?.(event);
      rootFocus?.(event);

      if (event.defaultPrevented || disabled || !isFocusTrigger) {
        return;
      }

      if (blurTimeoutRef.current !== null) {
        window.clearTimeout(blurTimeoutRef.current);
      }

      if (suppressFocusOpenRef.current) {
        return;
      }

      if (pointerFocusGuardRef.current && isClickTrigger) {
        pointerFocusGuardRef.current = false;
        return;
      }

      openedFromFocusRef.current = true;
      applyVisibleChange(true, {
        event: event.nativeEvent,
        reason: 'trigger',
      });
    },
    onKeyDown: (event: ReactKeyboardEvent<Element>) => {
      referenceKeyDown?.(event);
      rootKeyDown?.(event);

      pointerFocusGuardRef.current = false;

      const focusableEls = contentRef.current
        ? Array.from(
            contentRef.current.querySelectorAll<HTMLElement>(
              'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
            ),
          ).filter(
            (el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true',
          )
        : [];

      if (
        !event.defaultPrevented &&
        open &&
        event.key === 'Tab' &&
        !event.shiftKey &&
        focusableEls.length > 0 &&
        event.currentTarget === event.target
      ) {
        event.preventDefault();
        focusableEls[0]?.focus();
      }
    },
    onMouseEnter: isHoverTrigger
      ? (event: ReactMouseEvent<Element>) => {
          const childOnMouseEnter = referenceChildProps.onMouseEnter as
            | ((e: ReactMouseEvent<Element>) => void)
            | undefined;
          const rootOnMouseEnter = (domProps as Record<string, unknown>).onMouseEnter as
            | ((e: ReactMouseEvent<Element>) => void)
            | undefined;

          childOnMouseEnter?.(event);
          rootOnMouseEnter?.(event);

          if (event.defaultPrevented || disabled) {
            return;
          }

          applyVisibleChange(true, { event: event.nativeEvent, reason: 'trigger' });
        }
      : undefined,
    onMouseLeave: isHoverTrigger
      ? (event: ReactMouseEvent<Element>) => {
          const childOnMouseLeave = referenceChildProps.onMouseLeave as
            | ((e: ReactMouseEvent<Element>) => void)
            | undefined;
          const rootOnMouseLeave = (domProps as Record<string, unknown>).onMouseLeave as
            | ((e: ReactMouseEvent<Element>) => void)
            | undefined;

          childOnMouseLeave?.(event);
          rootOnMouseLeave?.(event);

          if (event.defaultPrevented || disabled) {
            return;
          }

          applyVisibleChange(false, { event: event.nativeEvent, reason: 'trigger' });
        }
      : undefined,
    onContextMenu: (event: ReactMouseEvent<Element>) => {
      referenceContextMenu?.(event);
      rootContextMenu?.(event);

      if (event.defaultPrevented || disabled || !normalizedTriggers.includes('context-menu')) {
        return;
      }

      event.preventDefault();
      applyVisibleChange(true, {
        event: event.nativeEvent,
        reason: 'context-menu',
      });
    },
    onPointerDown: (event: ReactPointerEvent<Element>) => {
      const referencePointerDown = referenceChildProps.onPointerDown as
        | ((pointerEvent: ReactPointerEvent<Element>) => void)
        | undefined;
      const rootPointerDown = (domProps as Record<string, unknown>).onPointerDown as
        | ((pointerEvent: ReactPointerEvent<Element>) => void)
        | undefined;

      referencePointerDown?.(event);
      rootPointerDown?.(event);

      pointerFocusGuardRef.current = true;
    },
    ref: (node: HTMLElement | null) => {
      referenceRef.current = node;

      const childRef = (
        referenceChild as ReactElement & {
          ref?: { current: HTMLElement | null } | ((node: HTMLElement | null) => void);
        }
      ).ref;

      if (typeof childRef === 'function') {
        childRef(node);
      } else if (childRef && typeof childRef === 'object') {
        childRef.current = node;
      }
    },
    tabIndex:
      (referenceChildProps.tabIndex as number | undefined) ??
      (!canCloneReferenceChild(children) && isFocusTrigger ? 0 : undefined),
  };

  const resolvedPortalContainer =
    popupPortalContainer !== null &&
    popupPortalContainer !== undefined &&
    typeof popupPortalContainer === 'object' &&
    'current' in popupPortalContainer
      ? popupPortalContainer.current
      : (popupPortalContainer as HTMLElement | ShadowRoot | null | undefined);

  const arkPlacement = arkPlacementByPopoverPlacement[placement];

  const handleOpenChange = ({ open: nextOpen }: { open: boolean }) => {
    if (nextOpen && !isClickTrigger) {
      // Non-click triggers manage their own open state; only allow Ark UI to close
      return;
    }

    const reason = dismissReasonRef.current ?? (nextOpen ? 'trigger' : 'explicit-action');

    dismissReasonRef.current = null;

    applyVisibleChange(nextOpen, { reason });
  };

  // For click triggers, ArkPopover.Trigger handles toggle and registers the reference position.
  // For non-click triggers, ArkPopover.Anchor registers the reference position for correct
  // positioner alignment without adding click-toggle behaviour or aria-expanded.
  const triggerElement = isClickTrigger ? (
    <ArkPopover.Trigger asChild>
      {cloneElement(referenceChild as ReactElement, sharedReferenceProps)}
    </ArkPopover.Trigger>
  ) : (
    <ArkPopover.Anchor asChild>
      {cloneElement(referenceChild as ReactElement, sharedReferenceProps)}
    </ArkPopover.Anchor>
  );

  const overlayContent = (
    <PopoverOverlay
      boundaryPadding={resolvedBoundaryPadding}
      contentRef={contentRef}
      mode={mode}
      onSurfaceBlurCapture={(event) => {
        if (disabled || !shouldCloseOnFocusOut) {
          return;
        }

        if (blurTimeoutRef.current !== null) {
          window.clearTimeout(blurTimeoutRef.current);
        }

        blurTimeoutRef.current = window.setTimeout(() => {
          const nextFocusedElement =
            event.relatedTarget instanceof HTMLElement
              ? event.relatedTarget
              : document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;

          const isWithin =
            referenceRef.current?.contains(nextFocusedElement) === true ||
            contentRef.current?.contains(nextFocusedElement) === true;

          if (isWithin) {
            return;
          }

          applyVisibleChange(false, {
            event: event.nativeEvent,
            reason: 'trigger',
          });
        }, 0);
      }}
      onSurfaceFocusCapture={() => {
        if (blurTimeoutRef.current !== null) {
          window.clearTimeout(blurTimeoutRef.current);
        }
      }}
      overlayClassName={overlayClassName}
      overlayStyle={overlayStyle}
      placement={placement}
      requestedPlacement={placement}
      shape={shape}
    >
      {content}
    </PopoverOverlay>
  );

  const portalContainer =
    typeof HTMLElement !== 'undefined' && resolvedPortalContainer instanceof HTMLElement
      ? resolvedPortalContainer
      : typeof document !== 'undefined'
        ? document.body
        : null;

  return (
    <ArkPopover.Root
      autoFocus={false}
      closeOnEscape={false}
      closeOnInteractOutside={!disabled}
      lazyMount
      onOpenChange={handleOpenChange}
      onPointerDownOutside={() => {
        dismissReasonRef.current = 'outside-press';
      }}
      open={open}
      positioning={{
        gutter: resolvedOffset,
        overflowPadding: resolvedBoundaryPadding,
        placement: arkPlacement,
      }}
      unmountOnExit
    >
      {triggerElement}
      {portalContainer ? createPortal(overlayContent, portalContainer) : overlayContent}
    </ArkPopover.Root>
  );
};
