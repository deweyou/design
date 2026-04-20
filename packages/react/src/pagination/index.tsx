import type { CSSProperties } from 'react';
import { Pagination as ArkPagination } from '@ark-ui/react/pagination';
import classNames from 'classnames';

import styles from './index.module.less';

export type PaginationProps = {
  count: number;
  pageSize?: number;
  page?: number;
  defaultPage?: number;
  siblingCount?: number;
  onPageChange?: (details: { page: number }) => void;
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
  variant = 'button',
  className,
  style,
}: PaginationProps) => {
  return (
    <ArkPagination.Root
      count={count}
      pageSize={pageSize}
      page={page}
      defaultPage={defaultPage}
      siblingCount={siblingCount}
      onPageChange={onPageChange}
      className={classNames(styles.root, variant === 'link' && styles.linkVariant, className)}
      style={style}
    >
      <ArkPagination.PrevTrigger className={styles.prevNext}>Prev</ArkPagination.PrevTrigger>
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
      <ArkPagination.NextTrigger className={styles.prevNext}>Next</ArkPagination.NextTrigger>
    </ArkPagination.Root>
  );
};
