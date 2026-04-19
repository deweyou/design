import { type CSSProperties, type ReactNode } from 'react';
import { Tooltip as ArkTooltip } from '@ark-ui/react/tooltip';
import classNames from 'classnames';

import styles from './index.module.less';

export type TooltipRootProps = {
  openDelay?: number;
  closeDelay?: number;
  children: ReactNode;
};

export type TooltipTriggerProps = {
  children: ReactNode;
};

export type TooltipContentProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

const TooltipRoot = ({ openDelay = 400, closeDelay = 100, children }: TooltipRootProps) => (
  <ArkTooltip.Root closeDelay={closeDelay} lazyMount openDelay={openDelay} unmountOnExit>
    {children}
  </ArkTooltip.Root>
);

const TooltipTrigger = ({ children }: TooltipTriggerProps) => (
  <ArkTooltip.Trigger asChild>{children}</ArkTooltip.Trigger>
);

const TooltipContent = ({ children, className, style }: TooltipContentProps) => (
  <ArkTooltip.Positioner>
    <ArkTooltip.Content className={classNames(styles.content, className)} style={style}>
      {children}
    </ArkTooltip.Content>
  </ArkTooltip.Positioner>
);

export const Tooltip = {
  Root: TooltipRoot,
  Trigger: TooltipTrigger,
  Content: TooltipContent,
};
