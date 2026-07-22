import type { CSSProperties } from 'react';
import { Pagination as ArkPagination } from '@ark-ui/react/pagination';
import classNames from 'classnames';

import styles from './index.module.less';
import { usePaginationLocaleText } from './locale/loader.ts';
import type { PaginationLocaleText } from './locale/types.ts';

export type PaginationSize = 'sm' | 'md' | 'lg';

export type PaginationProps = {
  count: number;
  pageSize?: number;
  page?: number;
  defaultPage?: number;
  siblingCount?: number;
  onPageChange?: (details: { page: number }) => void;
  localeText?: Partial<PaginationLocaleText>;
  size?: PaginationSize;
  variant?: 'button' | 'link';
  className?: string;
  style?: CSSProperties;
};

export const Pagination = ({
  count,
  pageSize = 10,
  page,
  defaultPage = 1,
  siblingCount = 1,
  onPageChange,
  localeText,
  size = 'md',
  variant = 'button',
  className,
  style,
}: PaginationProps) => {
  const text = usePaginationLocaleText(localeText);

  return (
    <ArkPagination.Root
      count={count}
      pageSize={pageSize}
      page={page}
      defaultPage={defaultPage}
      siblingCount={siblingCount}
      onPageChange={onPageChange}
      className={classNames(styles.root, variant === 'link' && styles.linkVariant, className)}
      data-size={size}
      style={style}
    >
      <ArkPagination.PrevTrigger className={styles.prevNext}>
        {text.previous}
      </ArkPagination.PrevTrigger>
      <ArkPagination.Context>
        {({ pages }) =>
          pages.map((pageItem, index) =>
            pageItem.type === 'page' ? (
              <ArkPagination.Item key={index} {...pageItem} className={styles.item}>
                {pageItem.value}
              </ArkPagination.Item>
            ) : (
              <ArkPagination.Ellipsis key={index} index={index} className={styles.ellipsis}>
                &#8230;
              </ArkPagination.Ellipsis>
            ),
          )
        }
      </ArkPagination.Context>
      <ArkPagination.NextTrigger className={styles.prevNext}>{text.next}</ArkPagination.NextTrigger>
    </ArkPagination.Root>
  );
};

export type { PaginationLocaleText } from './locale/types.ts';
