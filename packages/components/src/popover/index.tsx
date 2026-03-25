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
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import {
  FloatingPortal,
  arrow,
  autoUpdate,
  flip,
  offset as floatingOffset,
  safePolygon,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useHover,
  useInteractions,
  useRole,
  type Placement,
  type UseDismissProps,
} from '@floating-ui/react';

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
const defaultCloseAnimationDuration = 160;
const defaultOffset = 8;
const dismissProps: UseDismissProps = {
  ancestorScroll: true,
  escapeKey: true,
  outsidePress: true,
  outsidePressEvent: 'mousedown',
};

const floatingPlacementByPopoverPlacement = {
  top: 'top',
  bottom: 'bottom',
  left: 'left',
  right: 'right',
  'left-top': 'left-end',
  'left-bottom': 'left-start',
  'right-top': 'right-end',
  'right-bottom': 'right-start',
} as const satisfies Record<PopoverPlacement, Placement>;

const popoverPlacementByFloatingPlacement = {
  top: 'top',
  bottom: 'bottom',
  left: 'left',
  right: 'right',
  'left-start': 'left-bottom',
  'left-end': 'left-top',
  'right-start': 'right-bottom',
  'right-end': 'right-top',
} as const satisfies Partial<Record<Placement, PopoverPlacement>>;

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

const normalizeVisibilityReason = (
  reason: string | undefined,
  nextVisible: boolean,
): PopoverVisibilityChangeReason => {
  if (!nextVisible && reason === 'outside-press') {
    return 'outside-press';
  }

  if (!nextVisible && reason === 'escape-key') {
    return 'escape';
  }

  if (!nextVisible && reason === 'focus-out') {
    return 'outside-press';
  }

  if (
    reason === 'click' ||
    reason === 'hover' ||
    reason === 'focus' ||
    reason === 'reference-press'
  ) {
    return 'trigger';
  }

  return nextVisible ? 'trigger' : 'explicit-action';
};

const toFloatingPlacement = (placement: PopoverPlacement) => {
  return floatingPlacementByPopoverPlacement[placement];
};

const toPopoverPlacement = (placement: Placement) => {
  return (
    popoverPlacementByFloatingPlacement[
      placement as keyof typeof popoverPlacementByFloatingPlacement
    ] ?? 'bottom'
  );
};

const mergeRefs = <T,>(
  ...refs: Array<((value: T | null) => void) | { current: T | null } | null | undefined>
) => {
  return (value: T | null) => {
    for (const ref of refs) {
      if (typeof ref === 'function') {
        ref(value);
        continue;
      }

      if (ref && typeof ref === 'object') {
        ref.current = value;
      }
    }
  };
};

const getFocusableElements = (container: HTMLElement | null) => {
  if (!container) {
    return [];
  }

  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => {
    return !element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true';
  });
};

const isNodeWithinPopover = (
  node: EventTarget | null,
  referenceElement: HTMLElement | null,
  floatingElement: HTMLElement | null,
) => {
  if (!(node instanceof HTMLElement)) {
    return false;
  }

  return referenceElement?.contains(node) === true || floatingElement?.contains(node) === true;
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
  const [isOverlayMounted, setIsOverlayMounted] = useState(open);
  const openRef = useRef(open);
  const arrowRef = useRef<HTMLSpanElement | null>(null);
  const floatingId = useId();
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const blurTimeoutRef = useRef<number | null>(null);
  const pointerFocusGuardRef = useRef(false);
  const suppressFocusOpenRef = useRef(false);
  const openedFromFocusRef = useRef(false);

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

  const {
    context,
    floatingStyles,
    placement: resolvedFloatingPlacement,
    refs,
  } = useFloating({
    middleware: [
      floatingOffset(resolvedOffset),
      flip({
        crossAxis: true,
        padding: resolvedBoundaryPadding,
      }),
      shift({
        padding: resolvedBoundaryPadding,
      }),
      arrow({
        element: arrowRef,
      }),
    ],
    onOpenChange: (nextVisible, event, reason) => {
      openedFromFocusRef.current = nextVisible && reason === 'focus';

      applyVisibleChange(nextVisible, {
        event,
        reason: normalizeVisibilityReason(reason, nextVisible),
      });
    },
    open,
    placement: toFloatingPlacement(placement),
    transform: false,
    whileElementsMounted: autoUpdate,
  });

  const clickInteraction = useClick(context, {
    enabled: !disabled && normalizedTriggers.includes('click'),
    stickIfOpen: true,
  });
  const hoverInteraction = useHover(context, {
    enabled: !disabled && normalizedTriggers.includes('hover'),
    handleClose: safePolygon(),
    move: false,
  });
  const dismissInteraction = useDismiss(context, {
    ...dismissProps,
    enabled: !disabled,
  });
  const roleInteraction = useRole(context, {
    role: 'dialog',
  });
  const { getFloatingProps, getReferenceProps } = useInteractions([
    clickInteraction,
    hoverInteraction,
    dismissInteraction,
    roleInteraction,
  ]);
  useLayoutEffect(() => {
    if (open) {
      setIsOverlayMounted(true);
      return;
    }

    if (!isOverlayMounted) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsOverlayMounted(false);
    }, defaultCloseAnimationDuration);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isOverlayMounted, open]);

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
    if (open) {
      const referenceElement = refs.domReference.current as HTMLElement | null;
      const activeElement =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;

      returnFocusRef.current =
        activeElement && referenceElement?.contains(activeElement)
          ? activeElement
          : referenceElement;
      return;
    }

    const referenceElement = returnFocusRef.current;

    if (referenceElement && referenceElement.isConnected) {
      suppressFocusOpenRef.current = true;
      referenceElement.focus();
      window.setTimeout(() => {
        suppressFocusOpenRef.current = false;
      }, 0);
    }
  }, [open, refs.domReference]);

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

  const resolvedPlacement = toPopoverPlacement(resolvedFloatingPlacement);
  const resolvedSide = resolvedFloatingPlacement.split('-')[0];
  const shouldCloseOnFocusOut =
    normalizedTriggers.includes('focus') &&
    (!normalizedTriggers.includes('click') || openedFromFocusRef.current);
  const currentState = open ? 'open' : isOverlayMounted ? 'closing' : 'closed';
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
  const referenceProps = getReferenceProps({
    ...referenceChildProps,
    ...domProps,
    'aria-controls': isOverlayMounted ? floatingId : undefined,
    'aria-disabled': disabled || undefined,
    'aria-expanded': open,
    'aria-haspopup': 'dialog',
    className: referenceClassName,
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
        const referenceElement = refs.domReference.current as HTMLElement | null;
        const floatingElement = refs.floating.current;
        const nextFocusedElement =
          event.relatedTarget instanceof HTMLElement
            ? event.relatedTarget
            : document.activeElement instanceof HTMLElement
              ? document.activeElement
              : null;

        if (isNodeWithinPopover(nextFocusedElement, referenceElement, floatingElement)) {
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

      if (event.defaultPrevented || disabled || !normalizedTriggers.includes('focus')) {
        return;
      }

      if (blurTimeoutRef.current !== null) {
        window.clearTimeout(blurTimeoutRef.current);
      }

      if (suppressFocusOpenRef.current) {
        return;
      }

      if (pointerFocusGuardRef.current && normalizedTriggers.includes('click')) {
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

      const focusableElements = getFocusableElements(refs.floating.current);

      if (
        !event.defaultPrevented &&
        open &&
        event.key === 'Tab' &&
        !event.shiftKey &&
        focusableElements.length > 0 &&
        event.currentTarget === event.target
      ) {
        event.preventDefault();
        focusableElements[0]?.focus();
      }
    },
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
    ref: mergeRefs(
      refs.setReference,
      (
        referenceChild as ReactElement & {
          ref?: { current: HTMLElement | null } | ((node: HTMLElement | null) => void);
        }
      ).ref ?? null,
    ),
    style: referenceStyle,
    tabIndex:
      (referenceChildProps.tabIndex as number | undefined) ??
      (!canCloneReferenceChild(children) && normalizedTriggers.includes('focus') ? 0 : undefined),
  });
  const floatingProps = getFloatingProps({
    className: classNames(styles.overlay, overlayClassName),
    id: floatingId,
    ref: refs.setFloating,
    style: {
      ...floatingStyles,
      ...overlayStyle,
    },
  });
  const arrowData = context.middlewareData.arrow;
  const arrowStyle: CSSProperties =
    resolvedSide === 'top' || resolvedSide === 'bottom'
      ? ({
          '--popover-arrow-offset-x':
            typeof arrowData?.x === 'number'
              ? `${arrowData.x}px`
              : 'calc(50% - (var(--popover-arrow-base) / 2))',
        } as CSSProperties)
      : ({
          '--popover-arrow-offset-y':
            typeof arrowData?.y === 'number'
              ? `${arrowData.y}px`
              : 'calc(50% - (var(--popover-arrow-base) / 2))',
        } as CSSProperties);
  const portalProps = popupPortalContainer === undefined ? {} : { root: popupPortalContainer };
  const arrowShape = getArrowShapeData(resolvedSide);

  return (
    <>
      {cloneElement(
        referenceChild as ReactElement,
        {
          ...referenceProps,
          'data-disabled': String(disabled),
          'data-popover-reference': 'true',
          'data-visible': String(open),
        } as Record<string, unknown>,
      )}
      {isOverlayMounted ? (
        <FloatingPortal {...portalProps}>
          <div
            {...floatingProps}
            data-boundary-padding={String(resolvedBoundaryPadding)}
            data-mode={mode}
            data-placement={resolvedPlacement}
            data-popover-overlay="true"
            data-requested-placement={placement}
            data-shape={shape}
            data-side={resolvedSide}
            data-state={currentState}
          >
            <div
              className={styles.surface}
              data-mode={mode}
              onBlurCapture={(event) => {
                if (disabled || !shouldCloseOnFocusOut) {
                  return;
                }

                if (blurTimeoutRef.current !== null) {
                  window.clearTimeout(blurTimeoutRef.current);
                }

                blurTimeoutRef.current = window.setTimeout(() => {
                  const referenceElement = refs.domReference.current as HTMLElement | null;
                  const floatingElement = refs.floating.current;
                  const nextFocusedElement =
                    event.relatedTarget instanceof HTMLElement
                      ? event.relatedTarget
                      : document.activeElement instanceof HTMLElement
                        ? document.activeElement
                        : null;

                  if (isNodeWithinPopover(nextFocusedElement, referenceElement, floatingElement)) {
                    return;
                  }

                  applyVisibleChange(false, {
                    event: event.nativeEvent,
                    reason: 'trigger',
                  });
                }, 0);
              }}
              onFocusCapture={() => {
                if (blurTimeoutRef.current !== null) {
                  window.clearTimeout(blurTimeoutRef.current);
                }
              }}
            >
              {content}
            </div>
            <span
              className={styles.arrow}
              data-popover-arrow="true"
              data-side={resolvedSide}
              ref={arrowRef}
              style={arrowStyle}
            >
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
          </div>
        </FloatingPortal>
      ) : null}
    </>
  );
};
