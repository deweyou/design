import { createContext, type CSSProperties, type ReactNode, useContext } from 'react';
import { Tooltip as ArkTooltip } from '@ark-ui/react/tooltip';
import classNames from 'classnames';

import styles from './index.module.less';

type TooltipSize = 'sm' | 'md' | 'lg';

const TooltipSizeContext = createContext<TooltipSize>('sm');

export type TooltipRootProps = {
  openDelay?: number;
  closeDelay?: number;
  children: ReactNode;
  size?: TooltipSize;
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
}: TooltipRootProps) => (
  <TooltipSizeContext value={size}>
    <ArkTooltip.Root closeDelay={closeDelay} lazyMount openDelay={openDelay} unmountOnExit>
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
