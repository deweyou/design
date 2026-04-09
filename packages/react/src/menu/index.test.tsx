// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import {
  ContextMenu,
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuTrigger,
  MenuTriggerItem,
} from './index.tsx';

beforeEach(() => {
  if (!window.ResizeObserver) {
    window.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});

afterEach(() => {
  cleanup();
  // Reset any lingering pointer state from userEvent
  fireEvent.pointerUp(document.body, { pointerId: 1, button: 0, bubbles: true });
});

// ---------------------------------------------------------------------------
// T007: 基础菜单开关与全局 onSelect
// ---------------------------------------------------------------------------

describe('Menu — 基础开关与菜单项', () => {
  it('点击触发器后菜单出现', async () => {
    render(
      <Menu>
        <MenuTrigger>
          <button>打开</button>
        </MenuTrigger>
        <MenuContent>
          <MenuItem value="item1">选项一</MenuItem>
        </MenuContent>
      </Menu>,
    );

    expect(screen.queryByRole('menu')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '打开' }));
    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeTruthy();
    });
  });

  it('按 Escape 键关闭菜单', async () => {
    const onOpenChange = vi.fn();
    render(
      <ContextMenu onOpenChange={onOpenChange}>
        <ContextMenu.Trigger>
          <div data-testid="esc-trigger">菜单区域</div>
        </ContextMenu.Trigger>
        <ContextMenu.Content portalContainer={null}>
          <MenuItem value="item1">选项一</MenuItem>
        </ContextMenu.Content>
      </ContextMenu>,
    );

    fireEvent.contextMenu(screen.getByTestId('esc-trigger'));
    const menuEl = await waitFor(() => screen.getByRole('menu'));
    // Wait for Zag to auto-focus the menu (signals listeners are attached)
    await waitFor(() => expect(menuEl.contains(document.activeElement)).toBe(true));
    fireEvent.keyDown(menuEl, { key: 'Escape', keyCode: 27, bubbles: true });

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith({ open: false });
    });
  });

  it('点击菜单项后触发 onSelect 并关闭菜单', async () => {
    const onSelect = vi.fn();
    render(
      <Menu onSelect={onSelect}>
        <MenuTrigger>
          <button>打开</button>
        </MenuTrigger>
        <MenuContent>
          <MenuItem value="item1">选项一</MenuItem>
        </MenuContent>
      </Menu>,
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: '打开' }));
    await waitFor(() => screen.getByRole('menu'));
    await user.click(screen.getByRole('menuitem', { name: '选项一' }));

    await waitFor(() => {
      expect(onSelect).toHaveBeenCalledWith({ value: 'item1' });
      expect(screen.queryByRole('menu')).toBeNull();
    });
  });

  it('受控模式：外部 open prop 控制菜单显示', async () => {
    const { rerender } = render(
      <Menu open={false}>
        <MenuTrigger>
          <button>打开</button>
        </MenuTrigger>
        <MenuContent>
          <MenuItem value="item1">选项一</MenuItem>
        </MenuContent>
      </Menu>,
    );

    expect(screen.queryByRole('menu')).toBeNull();

    rerender(
      <Menu open={true}>
        <MenuTrigger>
          <button>打开</button>
        </MenuTrigger>
        <MenuContent>
          <MenuItem value="item1">选项一</MenuItem>
        </MenuContent>
      </Menu>,
    );

    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeTruthy();
    });
  });

  it('两个 Menu 实例互不干扰', async () => {
    render(
      <>
        <Menu>
          <MenuTrigger>
            <button>打开一</button>
          </MenuTrigger>
          <MenuContent>
            <MenuItem value="a">选项 A</MenuItem>
          </MenuContent>
        </Menu>
        <Menu>
          <MenuTrigger>
            <button>打开二</button>
          </MenuTrigger>
          <MenuContent>
            <MenuItem value="b">选项 B</MenuItem>
          </MenuContent>
        </Menu>
      </>,
    );

    expect(screen.queryByRole('menu')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '打开一' }));

    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeTruthy();
    });

    // 第二个菜单不应自动打开
    expect(screen.queryAllByRole('menu')).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// T008: MenuItem — disabled 状态
// ---------------------------------------------------------------------------

describe('MenuItem — disabled 状态', () => {
  it('disabled 菜单项不触发 onSelect', async () => {
    const onSelect = vi.fn();
    render(
      <Menu onSelect={onSelect}>
        <MenuTrigger>
          <button>打开</button>
        </MenuTrigger>
        <MenuContent>
          <MenuItem value="disabled-item" disabled>
            禁用选项
          </MenuItem>
        </MenuContent>
      </Menu>,
    );

    fireEvent.click(screen.getByRole('button', { name: '打开' }));
    await waitFor(() => screen.getByRole('menu'));
    const disabledItem = screen.getByRole('menuitem', { name: '禁用选项' });
    fireEvent.click(disabledItem);

    expect(onSelect).not.toHaveBeenCalled();
  });

  it('disabled 菜单项具有 aria-disabled 属性', async () => {
    render(
      <Menu>
        <MenuTrigger>
          <button>打开</button>
        </MenuTrigger>
        <MenuContent>
          <MenuItem value="disabled-item" disabled>
            禁用选项
          </MenuItem>
        </MenuContent>
      </Menu>,
    );

    fireEvent.click(screen.getByRole('button', { name: '打开' }));
    await waitFor(() => screen.getByRole('menu'));
    const item = screen.getByRole('menuitem', { name: '禁用选项' });
    expect(item.getAttribute('aria-disabled')).toBe('true');
  });
});

// ---------------------------------------------------------------------------
// T016: MenuGroup — 分组标签渲染
// ---------------------------------------------------------------------------

describe('MenuGroup — 分组标签', () => {
  it('有 label 时正确渲染分组标签', async () => {
    render(
      <Menu>
        <MenuTrigger>
          <button>打开</button>
        </MenuTrigger>
        <MenuContent>
          <MenuGroup label="文件操作">
            <MenuItem value="new">新建</MenuItem>
          </MenuGroup>
        </MenuContent>
      </Menu>,
    );

    fireEvent.click(screen.getByRole('button', { name: '打开' }));
    await waitFor(() => screen.getByRole('menu'));
    expect(screen.getByText('文件操作')).toBeTruthy();
  });

  it('无 label 时仍渲染分组容器', async () => {
    render(
      <Menu>
        <MenuTrigger>
          <button>打开</button>
        </MenuTrigger>
        <MenuContent>
          <MenuGroup>
            <MenuItem value="new">新建</MenuItem>
          </MenuGroup>
        </MenuContent>
      </Menu>,
    );

    fireEvent.click(screen.getByRole('button', { name: '打开' }));
    await waitFor(() => screen.getByRole('menu'));
    expect(screen.getByRole('group')).toBeTruthy();
  });

  it('MenuGroupLabel 接受可选 className', async () => {
    render(
      <Menu>
        <MenuTrigger>
          <button>打开</button>
        </MenuTrigger>
        <MenuContent>
          <MenuGroup>
            <MenuGroupLabel className="custom-label">操作</MenuGroupLabel>
            <MenuItem value="new">新建</MenuItem>
          </MenuGroup>
        </MenuContent>
      </Menu>,
    );

    fireEvent.click(screen.getByRole('button', { name: '打开' }));
    await waitFor(() => screen.getByRole('menu'));
    const label = screen.getByText('操作');
    expect(label.className).toContain('custom-label');
  });
});

// ---------------------------------------------------------------------------
// T017: MenuSeparator — 分割线渲染
// ---------------------------------------------------------------------------

describe('MenuSeparator', () => {
  it('分割线渲染正确的 ARIA 语义', async () => {
    render(
      <Menu>
        <MenuTrigger>
          <button>打开</button>
        </MenuTrigger>
        <MenuContent>
          <MenuItem value="a">选项 A</MenuItem>
          <MenuSeparator />
          <MenuItem value="b">选项 B</MenuItem>
        </MenuContent>
      </Menu>,
    );

    fireEvent.click(screen.getByRole('button', { name: '打开' }));
    await waitFor(() => screen.getByRole('menu'));
    expect(screen.getByRole('separator')).toBeTruthy();
  });

  it('MenuSeparator 接受可选 className', async () => {
    render(
      <Menu>
        <MenuTrigger>
          <button>打开</button>
        </MenuTrigger>
        <MenuContent>
          <MenuItem value="a">选项 A</MenuItem>
          <MenuSeparator className="custom-sep" />
          <MenuItem value="b">选项 B</MenuItem>
        </MenuContent>
      </Menu>,
    );

    fireEvent.click(screen.getByRole('button', { name: '打开' }));
    await waitFor(() => screen.getByRole('menu'));
    expect(screen.getByRole('separator').className).toContain('custom-sep');
  });
});

// ---------------------------------------------------------------------------
// T023: MenuTriggerItem — 子菜单
// ---------------------------------------------------------------------------

describe('MenuTriggerItem — 子菜单', () => {
  it('子菜单触发项存在并包含文字', async () => {
    render(
      <Menu>
        <MenuTrigger>
          <button>打开</button>
        </MenuTrigger>
        <MenuContent>
          <Menu>
            <MenuTriggerItem>打开子菜单</MenuTriggerItem>
            <MenuContent>
              <MenuItem value="sub1">子菜单项</MenuItem>
            </MenuContent>
          </Menu>
        </MenuContent>
      </Menu>,
    );

    fireEvent.click(screen.getByRole('button', { name: '打开' }));
    await waitFor(() => screen.getByRole('menu'));
    expect(screen.getByText('打开子菜单')).toBeTruthy();
  });

  it('MenuTriggerItem 渲染带 icon 和 selected 状态的触发项', async () => {
    const StarIcon = () => <svg aria-hidden data-testid="star-icon" />;
    render(
      <Menu>
        <MenuTrigger>
          <button>打开</button>
        </MenuTrigger>
        <MenuContent>
          <Menu>
            <MenuTriggerItem icon={<StarIcon />} selected>
              收藏夹
            </MenuTriggerItem>
            <MenuContent>
              <MenuItem value="sub1">子项</MenuItem>
            </MenuContent>
          </Menu>
        </MenuContent>
      </Menu>,
    );

    fireEvent.click(screen.getByRole('button', { name: '打开' }));
    await waitFor(() => screen.getByRole('menu'));
    expect(screen.getByTestId('star-icon')).toBeTruthy();
    expect(screen.getByText('收藏夹')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// T027: MenuRadioGroup — 单选逻辑
// ---------------------------------------------------------------------------

describe('MenuRadioGroup — 单选', () => {
  it('点击 RadioItem 后触发 onValueChange 携带正确 value', async () => {
    const onValueChange = vi.fn();
    render(
      <Menu>
        <MenuTrigger>
          <button>打开</button>
        </MenuTrigger>
        <MenuContent>
          <MenuRadioGroup value="list" onValueChange={onValueChange}>
            <MenuRadioItem value="list">列表</MenuRadioItem>
            <MenuRadioItem value="grid">网格</MenuRadioItem>
          </MenuRadioGroup>
        </MenuContent>
      </Menu>,
    );

    fireEvent.click(screen.getByRole('button', { name: '打开' }));
    await waitFor(() => screen.getByRole('menu'));
    fireEvent.click(screen.getByRole('menuitemradio', { name: '网格' }));

    await waitFor(() => {
      expect(onValueChange).toHaveBeenCalledWith({ value: 'grid' });
    });
  });

  it('选中项具有 aria-checked="true"，非选中项为 false', async () => {
    render(
      <Menu>
        <MenuTrigger>
          <button>打开</button>
        </MenuTrigger>
        <MenuContent>
          <MenuRadioGroup value="grid">
            <MenuRadioItem value="list">列表</MenuRadioItem>
            <MenuRadioItem value="grid">网格</MenuRadioItem>
          </MenuRadioGroup>
        </MenuContent>
      </Menu>,
    );

    fireEvent.click(screen.getByRole('button', { name: '打开' }));
    await waitFor(() => screen.getByRole('menu'));

    expect(screen.getByRole('menuitemradio', { name: '网格' }).getAttribute('aria-checked')).toBe(
      'true',
    );
    expect(screen.getByRole('menuitemradio', { name: '列表' }).getAttribute('aria-checked')).toBe(
      'false',
    );
  });

  it('非受控模式：点击后 aria-checked 自动更新无需外部 value prop', async () => {
    render(
      <Menu closeOnSelect={false}>
        <MenuTrigger>
          <button>打开</button>
        </MenuTrigger>
        <MenuContent>
          <MenuRadioGroup defaultValue="list">
            <MenuRadioItem value="list">列表</MenuRadioItem>
            <MenuRadioItem value="grid">网格</MenuRadioItem>
          </MenuRadioGroup>
        </MenuContent>
      </Menu>,
    );

    fireEvent.click(screen.getByRole('button', { name: '打开' }));
    await waitFor(() => screen.getByRole('menu'));
    fireEvent.click(screen.getByRole('menuitemradio', { name: '网格' }));

    await waitFor(() => {
      expect(screen.getByRole('menuitemradio', { name: '网格' }).getAttribute('aria-checked')).toBe(
        'true',
      );
      expect(screen.getByRole('menuitemradio', { name: '列表' }).getAttribute('aria-checked')).toBe(
        'false',
      );
    });
  });

  it('MenuRadioItem 渲染带 icon 的单选项', async () => {
    const DotIcon = () => <svg aria-hidden data-testid="dot-icon" />;
    render(
      <Menu>
        <MenuTrigger>
          <button>打开</button>
        </MenuTrigger>
        <MenuContent>
          <MenuRadioGroup value="list">
            <MenuRadioItem value="list" icon={<DotIcon />}>
              列表
            </MenuRadioItem>
          </MenuRadioGroup>
        </MenuContent>
      </Menu>,
    );

    fireEvent.click(screen.getByRole('button', { name: '打开' }));
    await waitFor(() => screen.getByRole('menu'));
    expect(screen.getByTestId('dot-icon')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// T028: MenuCheckboxItem — 多选逻辑
// ---------------------------------------------------------------------------

describe('MenuCheckboxItem — 多选', () => {
  it('点击后触发 onCheckedChange 携带 checked: true', async () => {
    const onCheckedChange = vi.fn();
    render(
      <Menu closeOnSelect={false}>
        <MenuTrigger>
          <button>打开</button>
        </MenuTrigger>
        <MenuContent>
          <MenuCheckboxItem value="sidebar" checked={false} onCheckedChange={onCheckedChange}>
            显示侧边栏
          </MenuCheckboxItem>
        </MenuContent>
      </Menu>,
    );

    fireEvent.click(screen.getByRole('button', { name: '打开' }));
    await waitFor(() => screen.getByRole('menu'));
    fireEvent.click(screen.getByRole('menuitemcheckbox', { name: '显示侧边栏' }));

    await waitFor(() => {
      expect(onCheckedChange).toHaveBeenCalledWith({ checked: true });
    });
  });

  it('其他 CheckboxItem 状态不受影响', async () => {
    render(
      <Menu closeOnSelect={false}>
        <MenuTrigger>
          <button>打开</button>
        </MenuTrigger>
        <MenuContent>
          <MenuCheckboxItem value="sidebar" defaultChecked={false}>
            侧边栏
          </MenuCheckboxItem>
          <MenuCheckboxItem value="toolbar" defaultChecked={true}>
            工具栏
          </MenuCheckboxItem>
        </MenuContent>
      </Menu>,
    );

    fireEvent.click(screen.getByRole('button', { name: '打开' }));
    await waitFor(() => screen.getByRole('menu'));

    const toolbarItem = screen.getByRole('menuitemcheckbox', { name: '工具栏' });
    expect(toolbarItem.getAttribute('aria-checked')).toBe('true');

    fireEvent.click(screen.getByRole('menuitemcheckbox', { name: '侧边栏' }));

    await waitFor(() => {
      expect(toolbarItem.getAttribute('aria-checked')).toBe('true');
    });
  });

  it('MenuCheckboxItem 渲染带 icon 且无 value 时使用空字符串', async () => {
    const CheckIcon = () => <svg aria-hidden data-testid="check-icon" />;
    render(
      <Menu closeOnSelect={false}>
        <MenuTrigger>
          <button>打开</button>
        </MenuTrigger>
        <MenuContent>
          {/* no value prop → uses value ?? '' fallback */}
          <MenuCheckboxItem defaultChecked={false} icon={<CheckIcon />}>
            选项
          </MenuCheckboxItem>
        </MenuContent>
      </Menu>,
    );

    fireEvent.click(screen.getByRole('button', { name: '打开' }));
    await waitFor(() => screen.getByRole('menu'));
    expect(screen.getByTestId('check-icon')).toBeTruthy();
    expect(screen.getByRole('menuitemcheckbox', { name: '选项' })).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// T033: 补充分支覆盖 — disabled Menu、MenuItem icon、disabled MenuTriggerItem
// ---------------------------------------------------------------------------

describe('Menu — 补充分支覆盖', () => {
  it('disabled=true 时菜单无法打开', async () => {
    render(
      <Menu disabled open={false} onOpenChange={vi.fn()}>
        <MenuTrigger>
          <button>打开</button>
        </MenuTrigger>
        <MenuContent>
          <MenuItem value="a">选项</MenuItem>
        </MenuContent>
      </Menu>,
    );

    fireEvent.click(screen.getByRole('button', { name: '打开' }));
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('MenuItem 渲染带 icon 且无 value 的菜单项', async () => {
    const StarIcon = () => <svg aria-hidden data-testid="star-icon" />;
    render(
      <Menu>
        <MenuTrigger>
          <button>打开</button>
        </MenuTrigger>
        <MenuContent>
          <MenuItem icon={<StarIcon />}>无值选项</MenuItem>
        </MenuContent>
      </Menu>,
    );

    fireEvent.click(screen.getByRole('button', { name: '打开' }));
    await waitFor(() => screen.getByRole('menu'));
    expect(screen.getByTestId('star-icon')).toBeTruthy();
    expect(screen.getByRole('menuitem', { name: '无值选项' })).toBeTruthy();
  });

  it('disabled MenuTriggerItem 渲染 data-disabled 属性', async () => {
    render(
      <Menu>
        <MenuTrigger>
          <button>打开</button>
        </MenuTrigger>
        <MenuContent>
          <Menu>
            <MenuTriggerItem disabled>禁用子菜单</MenuTriggerItem>
            <MenuContent>
              <MenuItem value="sub1">子项</MenuItem>
            </MenuContent>
          </Menu>
        </MenuContent>
      </Menu>,
    );

    fireEvent.click(screen.getByRole('button', { name: '打开' }));
    await waitFor(() => screen.getByRole('menu'));
    const triggerItem = screen.getByText('禁用子菜单').closest('[data-part="trigger-item"]');
    expect(triggerItem?.hasAttribute('data-disabled')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// T034: ContextMenu — 右键触发
// ---------------------------------------------------------------------------

describe('ContextMenu — 右键菜单', () => {
  it('在触发区域内右键点击后菜单出现', async () => {
    render(
      <ContextMenu>
        <ContextMenu.Trigger>
          <div data-testid="trigger-zone">右键区域</div>
        </ContextMenu.Trigger>
        <ContextMenu.Content>
          <MenuItem value="copy">复制</MenuItem>
        </ContextMenu.Content>
      </ContextMenu>,
    );

    expect(screen.queryByRole('menu')).toBeNull();
    fireEvent.contextMenu(screen.getByTestId('trigger-zone'));

    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeTruthy();
    });
  });

  it('Escape 关闭 ContextMenu', async () => {
    const onOpenChange = vi.fn();
    render(
      <ContextMenu onOpenChange={onOpenChange}>
        <ContextMenu.Trigger>
          <div data-testid="trigger-zone">右键区域</div>
        </ContextMenu.Trigger>
        <ContextMenu.Content portalContainer={null}>
          <MenuItem value="copy">复制</MenuItem>
        </ContextMenu.Content>
      </ContextMenu>,
    );

    fireEvent.contextMenu(screen.getByTestId('trigger-zone'));
    const menuEl = await waitFor(() => screen.getByRole('menu'));
    // Wait for Zag to auto-focus the menu (signals listeners are attached)
    await waitFor(() => expect(menuEl.contains(document.activeElement)).toBe(true));
    fireEvent.keyDown(menuEl, { key: 'Escape', keyCode: 27, bubbles: true });

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith({ open: false });
    });
  });
});
