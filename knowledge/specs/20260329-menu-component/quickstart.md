# 快速上手：Menu 组件

**分支**：`20260329-menu-component`
**日期**：2026-03-29

## 安装

Menu 组件随 `@deweyou-ui/components` 包一起发布，无需单独安装。

```tsx
import {
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuGroup,
  MenuSeparator,
  MenuTriggerItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuCheckboxItem,
  ContextMenu,
} from '@deweyou-ui/components';
import { Button } from '@deweyou-ui/components';
```

---

## 基础菜单

最简单的菜单：一个触发按钮 + 一组菜单项。

```tsx
<Menu>
  <MenuTrigger>
    <Button>打开菜单</Button>
  </MenuTrigger>
  <MenuContent>
    <MenuItem value="new" onSelect={() => console.log('新建')}>
      新建
    </MenuItem>
    <MenuItem value="open">打开</MenuItem>
    <MenuItem value="save">保存</MenuItem>
    <MenuItem value="delete" disabled>
      删除（已禁用）
    </MenuItem>
  </MenuContent>
</Menu>
```

---

## 分组与分割线

使用 `MenuGroup` 对菜单项进行语义分组，使用 `MenuSeparator` 添加分割线。

```tsx
<Menu>
  <MenuTrigger>
    <Button>文件操作</Button>
  </MenuTrigger>
  <MenuContent>
    <MenuGroup label="文件">
      <MenuItem value="new">新建</MenuItem>
      <MenuItem value="open">打开</MenuItem>
    </MenuGroup>
    <MenuSeparator />
    <MenuGroup label="编辑">
      <MenuItem value="cut">剪切</MenuItem>
      <MenuItem value="copy">复制</MenuItem>
      <MenuItem value="paste">粘贴</MenuItem>
    </MenuGroup>
    <MenuSeparator />
    <MenuItem value="quit">退出</MenuItem>
  </MenuContent>
</Menu>
```

---

## 子菜单（嵌套菜单）

将 `Menu` 嵌套到 `MenuTriggerItem` 内部即可实现多级子菜单。

```tsx
<Menu>
  <MenuTrigger>
    <Button>更多操作</Button>
  </MenuTrigger>
  <MenuContent>
    <MenuItem value="profile">个人资料</MenuItem>
    <Menu placement="right-start">
      <MenuTriggerItem>导出为…</MenuTriggerItem>
      <MenuContent>
        <MenuItem value="export-pdf">PDF</MenuItem>
        <MenuItem value="export-csv">CSV</MenuItem>
        <Menu placement="right-start">
          <MenuTriggerItem>图片格式</MenuTriggerItem>
          <MenuContent>
            <MenuItem value="export-png">PNG</MenuItem>
            <MenuItem value="export-svg">SVG</MenuItem>
          </MenuContent>
        </Menu>
      </MenuContent>
    </Menu>
    <MenuItem value="settings">设置</MenuItem>
  </MenuContent>
</Menu>
```

---

## 单选菜单

使用 `MenuRadioGroup` + `MenuRadioItem` 实现同组内互斥的选中状态。

```tsx
const [view, setView] = React.useState('grid');

<Menu>
  <MenuTrigger>
    <Button>视图设置</Button>
  </MenuTrigger>
  <MenuContent>
    <MenuRadioGroup value={view} onValueChange={({ value }) => setView(value)}>
      <MenuRadioItem value="list">列表视图</MenuRadioItem>
      <MenuRadioItem value="grid">网格视图</MenuRadioItem>
      <MenuRadioItem value="kanban">看板视图</MenuRadioItem>
    </MenuRadioGroup>
  </MenuContent>
</Menu>;
```

选中项文字将呈现主题绿色，右侧展示 check 图标。

---

## 多选菜单

使用 `MenuCheckboxItem` 实现相互独立的多选状态。

```tsx
const [showSidebar, setShowSidebar] = React.useState(true);
const [showToolbar, setShowToolbar] = React.useState(false);
const [showStatusBar, setShowStatusBar] = React.useState(true);

<Menu closeOnSelect={false}>
  <MenuTrigger>
    <Button>视图</Button>
  </MenuTrigger>
  <MenuContent>
    <MenuCheckboxItem
      checked={showSidebar}
      onCheckedChange={({ checked }) => setShowSidebar(checked)}
    >
      显示侧边栏
    </MenuCheckboxItem>
    <MenuCheckboxItem
      checked={showToolbar}
      onCheckedChange={({ checked }) => setShowToolbar(checked)}
    >
      显示工具栏
    </MenuCheckboxItem>
    <MenuCheckboxItem
      checked={showStatusBar}
      onCheckedChange={({ checked }) => setShowStatusBar(checked)}
    >
      显示状态栏
    </MenuCheckboxItem>
  </MenuContent>
</Menu>;
```

> 提示：多选菜单通常需要设置 `closeOnSelect={false}` 以避免每次点击后菜单关闭。

---

## 右键上下文菜单（ContextMenu）

使用 `ContextMenu` 包裹目标区域，用户右键点击时在光标位置弹出菜单。

```tsx
<ContextMenu onSelect={({ value }) => console.log('选中：', value)}>
  <ContextMenu.Trigger>
    <div style={{ width: 300, height: 200, background: '#f5f5f5', borderRadius: 8 }}>
      在此区域内右键点击
    </div>
  </ContextMenu.Trigger>
  <ContextMenu.Content>
    <MenuItem value="refresh">刷新</MenuItem>
    <MenuSeparator />
    <MenuItem value="copy">复制</MenuItem>
    <MenuItem value="paste">粘贴</MenuItem>
    <MenuSeparator />
    <MenuItem value="inspect">检查元素</MenuItem>
  </ContextMenu.Content>
</ContextMenu>
```

---

## 受控菜单

通过 `open` + `onOpenChange` 完全控制菜单的开关状态。

```tsx
const [open, setOpen] = React.useState(false);

<Menu open={open} onOpenChange={({ open }) => setOpen(open)}>
  <MenuTrigger>
    <Button onClick={() => setOpen(true)}>打开</Button>
  </MenuTrigger>
  <MenuContent>
    <MenuItem value="close" onSelect={() => setOpen(false)}>
      关闭菜单
    </MenuItem>
  </MenuContent>
</Menu>;
```

---

## 带图标的菜单项

通过 `icon` prop 在菜单项前置图标。

```tsx
import { Icon } from '@deweyou-ui/icons';

<MenuItem value="settings" icon={<Icon name="adjustment" size="small" />}>
  设置
</MenuItem>;
```

---

## 键盘交互速查

| 按键            | 行为                            |
| --------------- | ------------------------------- |
| `Enter`/`Space` | 打开菜单 / 激活菜单项           |
| `ArrowDown`     | 移动到下一菜单项                |
| `ArrowUp`       | 移动到上一菜单项                |
| `ArrowRight`    | 展开子菜单（在 TriggerItem 上） |
| `ArrowLeft`     | 关闭子菜单，返回父菜单          |
| `Escape`        | 关闭当前层级菜单                |
| `Tab`           | 关闭菜单并移出焦点              |
| `Home`          | 移动到第一个菜单项              |
| `End`           | 移动到最后一个菜单项            |
