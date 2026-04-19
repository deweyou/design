import { type CSSProperties, type ReactNode } from 'react';
import { Carousel as ArkCarousel } from '@ark-ui/react/carousel';
import classNames from 'classnames';

import styles from './index.module.less';

export type CarouselRootProps = {
  defaultIndex?: number;
  index?: number;
  onIndexChange?: (index: number) => void;
  loop?: boolean;
  slideCount?: number;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export type CarouselItemGroupProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};
export type CarouselItemProps = {
  index: number;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};
export type CarouselPrevTriggerProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};
export type CarouselNextTriggerProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};
export type CarouselIndicatorGroupProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};
export type CarouselIndicatorProps = { index: number; className?: string; style?: CSSProperties };

const CarouselRoot = ({
  defaultIndex = 0,
  index,
  onIndexChange,
  loop = false,
  slideCount = 0,
  children,
  className,
  style,
}: CarouselRootProps) => (
  <ArkCarousel.Root
    className={classNames(styles.root, className)}
    defaultPage={defaultIndex}
    page={index}
    loop={loop}
    slideCount={slideCount}
    onPageChange={onIndexChange ? ({ page }) => onIndexChange(page) : undefined}
    style={style}
  >
    {children}
  </ArkCarousel.Root>
);

const CarouselItemGroup = ({ children, className, style }: CarouselItemGroupProps) => (
  <ArkCarousel.ItemGroup className={classNames(styles.itemGroup, className)} style={style}>
    {children}
  </ArkCarousel.ItemGroup>
);

const CarouselItem = ({ index, children, className, style }: CarouselItemProps) => (
  <ArkCarousel.Item className={classNames(styles.item, className)} index={index} style={style}>
    {children}
  </ArkCarousel.Item>
);

const CarouselPrevTrigger = ({ children, className, style }: CarouselPrevTriggerProps) => (
  <ArkCarousel.PrevTrigger
    className={classNames(styles.trigger, styles.prevTrigger, className)}
    style={style}
  >
    {children}
  </ArkCarousel.PrevTrigger>
);

const CarouselNextTrigger = ({ children, className, style }: CarouselNextTriggerProps) => (
  <ArkCarousel.NextTrigger
    className={classNames(styles.trigger, styles.nextTrigger, className)}
    style={style}
  >
    {children}
  </ArkCarousel.NextTrigger>
);

const CarouselIndicatorGroup = ({ children, className, style }: CarouselIndicatorGroupProps) => (
  <ArkCarousel.IndicatorGroup
    className={classNames(styles.indicatorGroup, className)}
    style={style}
  >
    {children}
  </ArkCarousel.IndicatorGroup>
);

const CarouselIndicator = ({ index, className, style }: CarouselIndicatorProps) => (
  <ArkCarousel.Indicator
    className={classNames(styles.indicator, className)}
    index={index}
    style={style}
  />
);

export const Carousel = {
  Root: CarouselRoot,
  ItemGroup: CarouselItemGroup,
  Item: CarouselItem,
  PrevTrigger: CarouselPrevTrigger,
  NextTrigger: CarouselNextTrigger,
  IndicatorGroup: CarouselIndicatorGroup,
  Indicator: CarouselIndicator,
};
