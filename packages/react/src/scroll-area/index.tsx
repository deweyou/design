import { type CSSProperties, type ReactNode, forwardRef, useImperativeHandle, useRef } from 'react';
import { ScrollArea as ArkScrollArea } from '@ark-ui/react/scroll-area';
import classNames from 'classnames';

import styles from './index.module.less';

export const scrollAreaColorOptions = ['primary', 'neutral'] as const;

export type ScrollAreaColor = (typeof scrollAreaColorOptions)[number];

export type ScrollAreaEdge = 'top' | 'bottom' | 'left' | 'right';

export type ScrollAreaRef = {
  /** 以编程方式将内容滚动到指定边缘 */
  scrollToEdge: (options: { edge: ScrollAreaEdge }) => void;
};

export type ScrollAreaProps = {
  children: ReactNode;
  className?: string;
  /** 滑块颜色，默认 'primary'（品牌绿）；neutral 随主题自动反转 */
  color?: ScrollAreaColor;
  /** 是否同时显示水平滚动条，默认 false */
  horizontal?: boolean;
  /**
   * 闲置自动隐藏：停止滚动且鼠标离开滚动条后，经 1500ms 延迟自动淡出。
   * 滚动中或鼠标悬浮于滚动条时立即显示。默认 false。
   */
  autoHide?: boolean;
  style?: CSSProperties;
};

export const ScrollArea = forwardRef<ScrollAreaRef, ScrollAreaProps>(
  (
    { children, className, color = 'primary', horizontal = false, autoHide = false, style },
    ref,
  ) => {
    const viewportRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      scrollToEdge: ({ edge }) => {
        const viewport = viewportRef.current;
        if (!viewport) return;
        if (edge === 'top') viewport.scrollTop = 0;
        else if (edge === 'bottom') viewport.scrollTop = viewport.scrollHeight;
        else if (edge === 'left') viewport.scrollLeft = 0;
        else if (edge === 'right') viewport.scrollLeft = viewport.scrollWidth;
      },
    }));

    return (
      <ArkScrollArea.Root
        className={classNames(styles.root, className)}
        data-color={color}
        data-auto-hide={autoHide || undefined}
        style={style}
      >
        <ArkScrollArea.Viewport className={styles.viewport} ref={viewportRef}>
          <ArkScrollArea.Content className={styles.content}>{children}</ArkScrollArea.Content>
        </ArkScrollArea.Viewport>

        <ArkScrollArea.Scrollbar className={styles.scrollbar} orientation="vertical">
          <ArkScrollArea.Thumb className={styles.thumb} />
        </ArkScrollArea.Scrollbar>

        {horizontal && (
          <>
            <ArkScrollArea.Scrollbar className={styles.scrollbar} orientation="horizontal">
              <ArkScrollArea.Thumb className={styles.thumb} />
            </ArkScrollArea.Scrollbar>
            <ArkScrollArea.Corner className={styles.corner} />
          </>
        )}
      </ArkScrollArea.Root>
    );
  },
);

ScrollArea.displayName = 'ScrollArea';
