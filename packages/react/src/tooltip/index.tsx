import { createContext, type CSSProperties, type ReactNode, useContext } from 'react';
import { Tooltip as ArkTooltip } from '@ark-ui/react/tooltip';
import classNames from 'classnames';

import styles from './index.module.less';

type TooltipSize = 'sm' | 'md' | 'lg';

export type TooltipPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';

const TooltipSizeContext = createContext<TooltipSize>('sm');

export type TooltipRootProps = {
  openDelay?: number;
  closeDelay?: number;
  children: ReactNode;
  size?: TooltipSize;
  /** Preferred placement of the tooltip relative to its trigger. Defaults to Ark UI's 'bottom'. */
  placement?: TooltipPlacement;
};

export type TooltipTriggerProps = {
  children: ReactNode;
};

export type TooltipContentProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

const sizeClassMap: Record<TooltipSize, string> = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
};

const TooltipRoot = ({
  openDelay = 400,
  closeDelay = 100,
  children,
  size = 'sm',
  placement,
}: TooltipRootProps) => (
  <TooltipSizeContext value={size}>
    <ArkTooltip.Root
      closeDelay={closeDelay}
      lazyMount
      openDelay={openDelay}
      positioning={{ placement }}
      unmountOnExit
    >
      {children}
    </ArkTooltip.Root>
  </TooltipSizeContext>
);

const TooltipTrigger = ({ children }: TooltipTriggerProps) => (
  <ArkTooltip.Trigger asChild>{children}</ArkTooltip.Trigger>
);

const TooltipContent = ({ children, className, style }: TooltipContentProps) => {
  const size = useContext(TooltipSizeContext);
  return (
    <ArkTooltip.Positioner>
      <ArkTooltip.Content
        className={classNames(styles.content, sizeClassMap[size], className)}
        style={style}
      >
        {children}
      </ArkTooltip.Content>
    </ArkTooltip.Positioner>
  );
};

export const Tooltip = {
  Root: TooltipRoot,
  Trigger: TooltipTrigger,
  Content: TooltipContent,
};
