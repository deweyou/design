// @vitest-environment jsdom

import '../test-setup';

import { Suspense, act } from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vite-plus/test';

import { useConfigLocale } from './context.ts';
import { ConfigProvider } from './index.tsx';
import { createComponentLocaleText } from './locale-text.ts';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

afterEach(() => {
  cleanup();
});

const LocaleProbe = () => <span>{useConfigLocale()}</span>;

describe('ConfigProvider', () => {
  it('uses en-US without a provider', () => {
    render(<LocaleProbe />);
    expect(screen.getByText('en-US')).toBeInTheDocument();
  });

  it('provides an explicit locale and lets a nested provider override it', () => {
    render(
      <ConfigProvider locale="zh-CN">
        <LocaleProbe />
        <ConfigProvider locale="ja-JP">
          <LocaleProbe />
        </ConfigProvider>
      </ConfigProvider>,
    );

    expect(screen.getByText('zh-CN')).toBeInTheDocument();
    expect(screen.getByText('ja-JP')).toBeInTheDocument();
  });

  it('inherits the parent locale when a nested provider omits locale', () => {
    render(
      <ConfigProvider locale="ko-KR">
        <ConfigProvider>
          <LocaleProbe />
        </ConfigProvider>
      </ConfigProvider>,
    );

    expect(screen.getByText('ko-KR')).toBeInTheDocument();
  });
});

type ProbeLocaleText = {
  next: string;
  previous: string;
};

const createDeferredLocale = () => {
  let resolve!: (localeText: { default: ProbeLocaleText }) => void;
  const promise = new Promise<{ default: ProbeLocaleText }>((nextResolve) => {
    resolve = nextResolve;
  });

  return { promise, resolve };
};

describe('component locale text loader', () => {
  it('uses synchronous English copy and applies a component-owned override', () => {
    const useProbeLocaleText = createComponentLocaleText<ProbeLocaleText>(
      { next: 'Next', previous: 'Previous' },
      {
        'ja-JP': async () => ({ default: { next: '次へ', previous: '前へ' } }),
        'ko-KR': async () => ({ default: { next: '다음', previous: '이전' } }),
        'zh-CN': async () => ({ default: { next: '下一页', previous: '上一页' } }),
        'zh-TW': async () => ({ default: { next: '下一頁', previous: '上一頁' } }),
      },
    );
    const Probe = ({ localeText }: { localeText?: Partial<ProbeLocaleText> }) => {
      const text = useProbeLocaleText(localeText);
      return <span>{`${text.previous}/${text.next}`}</span>;
    };

    render(<Probe localeText={{ previous: 'Back' }} />);
    expect(screen.getByText('Back/Next')).toBeInTheDocument();
  });

  it('suspends an uncached locale and caches the loaded dictionary', async () => {
    const deferred = createDeferredLocale();
    let loadCount = 0;
    const useProbeLocaleText = createComponentLocaleText<ProbeLocaleText>(
      { next: 'Next', previous: 'Previous' },
      {
        'ja-JP': async () => ({ default: { next: '次へ', previous: '前へ' } }),
        'ko-KR': async () => ({ default: { next: '다음', previous: '이전' } }),
        'zh-CN': () => {
          loadCount += 1;
          return deferred.promise;
        },
        'zh-TW': async () => ({ default: { next: '下一頁', previous: '上一頁' } }),
      },
    );
    const Probe = () => {
      const text = useProbeLocaleText();
      return <span>{text.previous}</span>;
    };
    const content = (
      <Suspense fallback={<span>Loading locale</span>}>
        <ConfigProvider locale="zh-CN">
          <Probe />
        </ConfigProvider>
      </Suspense>
    );
    const { unmount } = render(content);

    expect(screen.getByText('Loading locale')).toBeInTheDocument();
    await act(async () => {
      deferred.resolve({ default: { next: '下一页', previous: '上一页' } });
    });
    await waitFor(() => {
      expect(screen.getByText('上一页')).toBeInTheDocument();
    });
    unmount();

    render(content);
    expect(screen.getByText('上一页')).toBeInTheDocument();
    expect(loadCount).toBe(1);
  });

  it('keeps the revealed locale visible while a new locale loads', async () => {
    const deferred = createDeferredLocale();
    const useProbeLocaleText = createComponentLocaleText<ProbeLocaleText>(
      { next: 'Next', previous: 'Previous' },
      {
        'ja-JP': () => deferred.promise,
        'ko-KR': async () => ({ default: { next: '다음', previous: '이전' } }),
        'zh-CN': async () => ({ default: { next: '下一页', previous: '上一页' } }),
        'zh-TW': async () => ({ default: { next: '下一頁', previous: '上一頁' } }),
      },
    );
    const Probe = () => {
      const text = useProbeLocaleText();
      return <span>{text.previous}</span>;
    };
    const renderTree = (locale: 'en-US' | 'ja-JP') => (
      <Suspense fallback={<span>Loading locale</span>}>
        <ConfigProvider locale={locale}>
          <Probe />
        </ConfigProvider>
      </Suspense>
    );
    const { rerender } = render(renderTree('en-US'));

    expect(screen.getByText('Previous')).toBeInTheDocument();
    rerender(renderTree('ja-JP'));
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.queryByText('Loading locale')).not.toBeInTheDocument();

    await act(async () => {
      deferred.resolve({ default: { next: '次へ', previous: '前へ' } });
    });
    await waitFor(() => {
      expect(screen.getByText('前へ')).toBeInTheDocument();
    });
  });
});
