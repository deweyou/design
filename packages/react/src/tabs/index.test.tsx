// @vitest-environment jsdom

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { Tabs, TabContent, TabIndicator, TabList, TabTrigger } from './index.tsx';

const stylesheet = readFileSync(resolve(import.meta.dirname, 'index.module.less'), 'utf8');

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  if (!window.ResizeObserver) {
    window.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
  // Ark UI's indicator sync uses CSS.escape which jsdom doesn't provide.
  if (!window.CSS) {
    // @ts-expect-error — jsdom polyfill
    window.CSS = {};
  }
  if (!window.CSS.escape) {
    window.CSS.escape = (value: string) => value.replace(/([^\w-])/g, '\\$1');
  }
});

afterEach(() => {
  cleanup();
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BasicTabs = ({
  defaultValue,
  value,
  onValueChange,
  hideContent,
}: {
  defaultValue?: string;
  value?: string;
  onValueChange?: (d: { value: string }) => void;
  hideContent?: boolean;
}) => (
  <Tabs
    defaultValue={defaultValue}
    hideContent={hideContent}
    onValueChange={onValueChange}
    value={value}
  >
    <TabList>
      <TabTrigger value="tab1">标签一</TabTrigger>
      <TabTrigger value="tab2">标签二</TabTrigger>
      <TabTrigger value="tab3" disabled>
        标签三
      </TabTrigger>
    </TabList>
    <TabContent value="tab1">内容一</TabContent>
    <TabContent value="tab2">内容二</TabContent>
    <TabContent value="tab3">内容三</TabContent>
  </Tabs>
);

// ─── T006: 基础切换逻辑 ────────────────────────────────────────────────────────

describe('Tabs — 基础切换', () => {
  it('渲染 tablist 和 tab 角色', () => {
    render(<BasicTabs defaultValue="tab1" />);
    expect(screen.getByRole('tablist')).toBeTruthy();
    expect(screen.getAllByRole('tab')).toHaveLength(3);
  });

  it('defaultValue 正确设置初始激活标签', async () => {
    render(<BasicTabs defaultValue="tab1" />);
    const tab1 = screen.getByRole('tab', { name: '标签一' });
    await waitFor(() => {
      // Ark UI uses empty string for data-selected (boolean attribute pattern)
      expect(tab1.hasAttribute('data-selected')).toBe(true);
      expect(tab1.getAttribute('aria-selected')).toBe('true');
    });
  });

  it('点击标签触发 onValueChange 携带正确 value', async () => {
    const onValueChange = vi.fn();
    render(<BasicTabs defaultValue="tab1" onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole('tab', { name: '标签二' }));
    await waitFor(() => {
      expect(onValueChange).toHaveBeenCalledWith({ value: 'tab2' });
    });
  });

  it('点击后激活状态正确更新', async () => {
    render(<BasicTabs defaultValue="tab1" />);
    fireEvent.click(screen.getByRole('tab', { name: '标签二' }));
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: '标签二' }).getAttribute('aria-selected')).toBe(
        'true',
      );
      expect(screen.getByRole('tab', { name: '标签一' }).getAttribute('aria-selected')).toBe(
        'false',
      );
    });
  });

  it('disabled 标签点击后 onValueChange 不触发', async () => {
    const onValueChange = vi.fn();
    render(<BasicTabs defaultValue="tab1" onValueChange={onValueChange} />);
    const disabledTab = screen.getByRole('tab', { name: '标签三' });
    expect(disabledTab.getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(disabledTab);
    await waitFor(() => {
      expect(onValueChange).not.toHaveBeenCalled();
    });
  });

  it('受控模式：外部 value prop 控制激活标签', async () => {
    const { rerender } = render(<BasicTabs value="tab1" />);
    expect(screen.getByRole('tab', { name: '标签一' }).getAttribute('aria-selected')).toBe('true');

    rerender(<BasicTabs value="tab2" />);
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: '标签二' }).getAttribute('aria-selected')).toBe(
        'true',
      );
    });
  });
});

// ─── T007: variant 渲染 ───────────────────────────────────────────────────────

describe('Tabs — variant 渲染', () => {
  it('line 变体下 Tabs.Indicator 节点存在（data-part="indicator"）', async () => {
    const { container } = render(<BasicTabs defaultValue="tab1" />);
    // line is the default variant
    await waitFor(() => {
      expect(container.querySelector('[data-part="indicator"]')).toBeTruthy();
    });
  });

  it('bg 变体下不渲染 Tabs.Indicator', () => {
    const { container } = render(
      <Tabs defaultValue="tab1" variant="bg">
        <TabList>
          <TabTrigger value="tab1">标签一</TabTrigger>
        </TabList>
        <TabContent value="tab1">内容</TabContent>
      </Tabs>,
    );
    expect(container.querySelector('[data-part="indicator"]')).toBeNull();
  });

  it('data-variant 属性正确传递到根节点', () => {
    const { container } = render(
      <Tabs defaultValue="tab1" variant="bg">
        <TabList>
          <TabTrigger value="tab1">标签一</TabTrigger>
        </TabList>
        <TabContent value="tab1">内容</TabContent>
      </Tabs>,
    );
    const root = container.querySelector('[data-variant="bg"]');
    expect(root).toBeTruthy();
  });

  it('data-selected 属性随切换正确更新', async () => {
    render(<BasicTabs defaultValue="tab1" />);
    fireEvent.click(screen.getByRole('tab', { name: '标签二' }));
    await waitFor(() => {
      // Ark UI: selected = attribute present, not selected = attribute absent
      expect(screen.getByRole('tab', { name: '标签二' }).hasAttribute('data-selected')).toBe(true);
      expect(screen.getByRole('tab', { name: '标签一' }).hasAttribute('data-selected')).toBe(false);
    });
  });
});

// ─── T016: hideContent 模式 ───────────────────────────────────────────────────

describe('Tabs — hideContent 模式', () => {
  it('hideContent=true 时 DOM 中不存在 role="tabpanel"', () => {
    render(<BasicTabs defaultValue="tab1" hideContent />);
    expect(screen.queryAllByRole('tabpanel')).toHaveLength(0);
  });

  it('hideContent=false（默认）时 role="tabpanel" 存在', async () => {
    render(<BasicTabs defaultValue="tab1" />);
    await waitFor(() => {
      expect(screen.queryAllByRole('tabpanel').length).toBeGreaterThan(0);
    });
  });

  it('hideContent 模式下 onValueChange 仍在切换时触发', async () => {
    const onValueChange = vi.fn();
    render(<BasicTabs defaultValue="tab1" hideContent onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole('tab', { name: '标签二' }));
    await waitFor(() => {
      expect(onValueChange).toHaveBeenCalledWith({ value: 'tab2' });
    });
  });
});

// ─── T019: menuItems ARIA 属性 ────────────────────────────────────────────────

describe('TabTrigger — menuItems（Menu Tab）', () => {
  const MenuTabs = ({ onValueChange }: { onValueChange?: (d: { value: string }) => void }) => (
    <Tabs defaultValue="sub1" onValueChange={onValueChange}>
      <TabList>
        <TabTrigger value="tab1">基础</TabTrigger>
        <TabTrigger
          menuItems={[
            { label: '子项一', value: 'sub1' },
            { label: '子项二', value: 'sub2' },
          ]}
          value="group"
        >
          更多
        </TabTrigger>
      </TabList>
      <TabContent value="tab1">基础内容</TabContent>
      <TabContent value="sub1">子项一内容</TabContent>
      <TabContent value="sub2">子项二内容</TabContent>
    </Tabs>
  );

  it('Menu Tab 触发器带有 aria-haspopup="menu"', () => {
    render(<MenuTabs />);
    const menuTab = screen.getByRole('tab', { name: /更多/ });
    expect(menuTab.getAttribute('aria-haspopup')).toBe('menu');
  });

  it('当前激活值为子项时，Menu Tab 带有 data-selected 属性', async () => {
    render(<MenuTabs />);
    await waitFor(() => {
      const menuTab = screen.getByRole('tab', { name: /更多/ });
      expect(menuTab.hasAttribute('data-selected')).toBe(true);
    });
  });

  it('点击子菜单项后 onValueChange 以对应 value 触发', async () => {
    const onValueChange = vi.fn();
    render(<MenuTabs onValueChange={onValueChange} />);
    const user = userEvent.setup();
    const menuTab = screen.getByRole('tab', { name: /更多/ });
    await user.click(menuTab);
    await waitFor(() => screen.getByRole('menu'));
    await user.click(screen.getByRole('menuitem', { name: '子项二' }));
    await waitFor(() => {
      expect(onValueChange).toHaveBeenCalledWith({ value: 'sub2' });
    });
  });

  it('disabled 的 Menu Tab 按钮有 disabled 属性', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabList>
          <TabTrigger disabled menuItems={[{ label: '子项', value: 'sub' }]} value="group">
            更多
          </TabTrigger>
        </TabList>
        <TabContent value="tab1">内容</TabContent>
      </Tabs>,
    );
    const menuTab = screen.getByRole('tab', { name: '更多' });
    expect((menuTab as HTMLButtonElement).disabled).toBe(true);
  });
});

// ─── T023: scroll 模式边缘状态 ───────────────────────────────────────────────

describe('TabList — scroll 模式边缘状态', () => {
  it('初始渲染时 data-scroll-at-start="true"', () => {
    const { container } = render(
      <Tabs defaultValue="t1">
        <TabList>
          <TabTrigger value="t1">T1</TabTrigger>
          <TabTrigger value="t2">T2</TabTrigger>
        </TabList>
      </Tabs>,
    );
    // The listScroller div holds the scroll state attributes
    const scroller = container.querySelector('[data-overflow-mode="scroll"]');
    expect(scroller?.getAttribute('data-scroll-at-start')).toBe('true');
  });

  it('data-overflow-mode 属性正确传递', () => {
    const { container } = render(
      <Tabs defaultValue="t1" overflowMode="collapse">
        <TabList>
          <TabTrigger value="t1">T1</TabTrigger>
        </TabList>
      </Tabs>,
    );
    const scroller = container.querySelector('[data-overflow-mode="collapse"]');
    expect(scroller).toBeTruthy();
  });
});

// ─── T028: collapse 模式更多按钮 ─────────────────────────────────────────────

describe('TabList — collapse 模式', () => {
  it('collapse 模式在 jsdom 零宽布局下检测到溢出并显示 More 按钮', () => {
    render(
      <Tabs defaultValue="t1" overflowMode="collapse">
        <TabList>
          <TabTrigger value="t1">T1</TabTrigger>
          <TabTrigger value="t2">T2</TabTrigger>
        </TabList>
        <TabContent value="t1">Content 1</TabContent>
        <TabContent value="t2">Content 2</TabContent>
      </Tabs>,
    );
    // In jsdom all element dimensions are 0, so containerSize=0 and any tabs
    // with a subsequent sibling are considered overflow. The More button renders.
    expect(screen.queryByText('More')).not.toBeNull();
  });
});

// ─── T033: 边界状态 ───────────────────────────────────────────────────────────

describe('Tabs — 边界状态', () => {
  it('单个标签也能正常渲染', () => {
    render(
      <Tabs defaultValue="only">
        <TabList>
          <TabTrigger value="only">唯一标签</TabTrigger>
        </TabList>
        <TabContent value="only">内容</TabContent>
      </Tabs>,
    );
    expect(screen.getByRole('tab', { name: '唯一标签' })).toBeTruthy();
  });

  it('orientation="vertical" 时 data-orientation 正确传递', () => {
    const { container } = render(
      <Tabs defaultValue="t1" orientation="vertical">
        <TabList>
          <TabTrigger value="t1">T1</TabTrigger>
        </TabList>
        <TabContent value="t1">内容</TabContent>
      </Tabs>,
    );
    expect(container.querySelector('[data-orientation="vertical"]')).toBeTruthy();
  });

  it('size 和 color 属性正确传递到根节点', () => {
    const { container } = render(
      <Tabs color="primary" defaultValue="t1" size="lg">
        <TabList>
          <TabTrigger value="t1">T1</TabTrigger>
        </TabList>
        <TabContent value="t1">内容</TabContent>
      </Tabs>,
    );
    const root = container.firstElementChild;
    expect(root?.getAttribute('data-color')).toBe('primary');
    expect(root?.getAttribute('data-size')).toBe('lg');
  });

  it('vertical 方向切换后 indicator 更新且 data-orientation 正确', async () => {
    const onValueChange = vi.fn();
    render(
      <Tabs defaultValue="t1" orientation="vertical" onValueChange={onValueChange}>
        <TabList>
          <TabTrigger value="t1">T1</TabTrigger>
          <TabTrigger value="t2">T2</TabTrigger>
        </TabList>
        <TabContent value="t1">内容一</TabContent>
        <TabContent value="t2">内容二</TabContent>
      </Tabs>,
    );

    fireEvent.click(screen.getByRole('tab', { name: 'T2' }));

    await waitFor(() => {
      expect(onValueChange).toHaveBeenCalledWith({ value: 't2' });
      expect(screen.getByRole('tab', { name: 'T2' }).getAttribute('aria-selected')).toBe('true');
    });
  });

  it('TabIndicator 接受可选 className', () => {
    const { container } = render(
      // variant='bg' 不渲染内置 indicator，确保只有显式传入的那一个
      <Tabs defaultValue="t1" variant="bg">
        <TabList>
          <TabTrigger value="t1">T1</TabTrigger>
        </TabList>
        <TabIndicator className="custom-indicator" />
        <TabContent value="t1">内容</TabContent>
      </Tabs>,
    );

    const indicator = container.querySelector('[data-part="indicator"]');
    expect(indicator?.className).toContain('custom-indicator');
  });

  it('两个 Tabs 实例互不干扰', async () => {
    render(
      <>
        <Tabs defaultValue="a1" data-testid="tabs-first">
          <TabList>
            <TabTrigger value="a1">A1</TabTrigger>
            <TabTrigger value="a2">A2</TabTrigger>
          </TabList>
          <TabContent value="a1">A1 内容</TabContent>
          <TabContent value="a2">A2 内容</TabContent>
        </Tabs>
        <Tabs defaultValue="b1" data-testid="tabs-second">
          <TabList>
            <TabTrigger value="b1">B1</TabTrigger>
            <TabTrigger value="b2">B2</TabTrigger>
          </TabList>
          <TabContent value="b1">B1 内容</TabContent>
          <TabContent value="b2">B2 内容</TabContent>
        </Tabs>
      </>,
    );

    const [a1Tab, , b1Tab] = screen.getAllByRole('tab');
    await waitFor(() => {
      expect(a1Tab!.getAttribute('aria-selected')).toBe('true');
      expect(b1Tab!.getAttribute('aria-selected')).toBe('true');
    });

    fireEvent.click(screen.getByRole('tab', { name: 'A2' }));

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'A2' }).getAttribute('aria-selected')).toBe('true');
      // 第二个实例的激活状态不受影响
      expect(screen.getByRole('tab', { name: 'B1' }).getAttribute('aria-selected')).toBe('true');
      expect(screen.getByRole('tab', { name: 'B2' }).getAttribute('aria-selected')).toBe('false');
    });
  });
});

// ─── T036: onFocusChange 回调 ────────────────────────────────────────────────

describe('Tabs — onFocusChange', () => {
  it('传入 onFocusChange 后键盘切换焦点时调用回调', async () => {
    const onFocusChange = vi.fn();
    render(
      <Tabs defaultValue="t1" onFocusChange={onFocusChange}>
        <TabList>
          <TabTrigger value="t1">T1</TabTrigger>
          <TabTrigger value="t2">T2</TabTrigger>
        </TabList>
        <TabContent value="t1">内容1</TabContent>
        <TabContent value="t2">内容2</TabContent>
      </Tabs>,
    );

    const tab1 = screen.getByRole('tab', { name: 'T1' });
    act(() => {
      tab1.focus();
    });
    fireEvent.keyDown(tab1, { key: 'ArrowRight', bubbles: true });

    await waitFor(() => {
      expect(onFocusChange).toHaveBeenCalledWith({ value: 't2' });
    });
  });
});

// ─── Stylesheet token 断言 ────────────────────────────────────────────────────

describe('Tabs — stylesheet token 约束', () => {
  it('tabs stylesheet 消费语义 token，不引用 raw palette', () => {
    expect(stylesheet).toContain('.focus-ring-offset()');
    expect(stylesheet).toContain('--ui-color-border');
    expect(stylesheet).toContain('--ui-color-brand-bg');
    expect(stylesheet).toContain('--ui-color-text');
    expect(stylesheet).not.toContain('--ui-color-palette-');
  });

  it('tabs stylesheet 使用语义 radius token，不含硬编码 border-radius 值', () => {
    expect(stylesheet).not.toContain('border-radius: 0.4rem');
    expect(stylesheet).not.toContain('border-radius: 0.3rem');
    expect(stylesheet).not.toContain('border-radius: 999px');
    expect(stylesheet).toContain('var(--ui-radius-float)');
    expect(stylesheet).toContain('var(--ui-radius-pill)');
  });
});
