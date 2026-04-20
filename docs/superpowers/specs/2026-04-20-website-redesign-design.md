# Website Redesign Design

**Date:** 2026-04-20  
**Scope:** `apps/website/` 完整重写  
**Status:** Approved

---

## 目标

将现有的组件预览 playground（`main.tsx` 单文件 1500+ 行）改造为一个正式的组件库官网，风格简约、有线条感，充分复用组件库自身的组件。

---

## 页面结构

| 路由           | 内容           | 实现方式   |
| -------------- | -------------- | ---------- |
| `/`            | Landing Page   | 本次重点   |
| `/icons`       | 全量图标展示页 | 新增       |
| 外链 Storybook | 组件文档       | 不在此实现 |
| 外链 GitHub    | 源码仓库       | 不在此实现 |

路由采用 **React Router v6**（`createBrowserRouter`），两个页面共享 Navbar 和主题切换。

---

## 视觉风格

**方向：印刷排版（Editorial）+ 极简几何（Minimal Geometric）的融合。**

- 水平线作为主要分隔语言（`border-bottom: 1px solid`），不用卡片阴影
- 宋体（Source Han Serif CN）作为标题字体，正文和 UI 标签用系统 sans-serif
- 暖底色（`--ui-color-canvas: #fefcf8`）贯穿全页，深色模式切换为 stone-950
- Emerald 绿仅用于品牌强调（CTA 按钮 primary color、成功状态 badge）
- 无圆形大图、无渐变色块、无动态粒子等装饰性元素
- 所有间距通过 `--ui-spacing-*` token 实现

**容器布局：**

```
max-width: 640px（正文区域）
max-width: 820px（宽内容区，如图标网格）
margin: 0 auto
padding: 0 32px
```

大屏两侧自然留白，不做满屏填充。

---

## Navbar

```
[ Home ]  [ Icons ]  [ Storybook ↗ ]  [ GitHub ↗ ]
```

- 居中对齐，无 Logo
- 底部 `border-bottom: 1px solid var(--ui-color-text)`（印刷感强分割线）
- 高度 50px，链接字号 11px，`color: var(--ui-color-text-muted)`，active 状态用 `--ui-color-text`
- Storybook / GitHub 为外链，带 ↗ 标识
- 主题切换按钮**不在** Navbar，见下文

---

## 主题切换

- `<IconButton>` 组件，`position: fixed`，右下角 `bottom: 28px; right: 28px`
- 图标：浅色模式显示月亮（切换到深色），深色模式显示太阳（切换到浅色）
- 圆形，轻微阴影（`--ui-shadow-soft`）
- 点击修改 `document.documentElement.dataset.theme`

---

## Landing Page（`/`）

### 1. Hero

居中布局。

```
[eyebrow]   COMPONENT LIBRARY · v1.0
[h1]        为汉字排印
            而生的
            组件库
[rule]      ── (44px 实线)
[desc]      基于宋体字形节奏与温暖色系构建，27 个组件覆盖完整 UI 场景。
            深浅双主题，开箱即用。
[actions]   <Button color="neutral" variant="filled">查看文档 →</Button>
            <Button color="neutral" variant="outlined">Storybook ↗</Button>
[install]   npm install @deweyou-design/react
```

- `<Text as="h1">` 渲染标题，字号 clamp(2.8rem, 5vw, 4.6rem)
- install 命令用等宽字体、浅灰背景 inline block，不做复制功能
- Hero 底部 `border-bottom: 1px solid var(--ui-color-border)`

### 2. Design & Components

section label（`DESIGN & COMPONENTS`）居中，字号 10px，letter-spacing 0.14em，`color: --ui-color-text-muted`。

内部三个子区块，每个用细线分隔：

#### 2a. Color

子标签：`COLOR · 26 色族 · 11 色阶`

展示三行色板，每行 9 个色块（20×20px，border-radius: 2px）：

- Emerald（品牌色，950→50）
- Red（danger 色，950→50）
- Stone（中性色，950→50）

不可交互，纯展示。

#### 2b. Typography

子标签：`TYPE · Source Han Serif CN · 4 字重`

居中排列，展示四个层级：

```
<Text as="h1">标题一 H1</Text>
<Text as="h3">标题三 H3</Text>
<Text>正文 Body — 清晰易读，适合长文阅读</Text>
<Text variant="caption">说明 Caption · 辅助信息层级</Text>
```

#### 2c. Components

子标签：`COMPONENTS`

用 `<Tabs.Root>` 包裹，四个 tab：**按钮 / 操作**、**表单输入**、**浮层 / 菜单**、**反馈 / 徽标**。

各 tab 内容（均使用真实组件）：

**按钮 / 操作**

```tsx
<Button variant="filled" color="neutral">操作</Button>
<Button variant="filled" color="primary">确认</Button>
<Button variant="filled" color="danger">删除</Button>
<Button variant="outlined">取消</Button>
<Button variant="ghost">次要</Button>
```

**表单输入**

```tsx
<Input placeholder="用户名" />
<Input placeholder="格式不正确" error="请输入有效邮箱" />
<Select>...</Select>
<Switch />  (on + off 各一个)
<Checkbox checked />  <Checkbox />
```

**浮层 / 菜单**

各组件通过按钮触发，不静态 open（避免遮挡）：

```tsx
<Popover.Root>
  <Popover.Trigger><Button variant="outlined">打开 Popover</Button></Popover.Trigger>
  <Popover.Content>确认删除弹层示例</Popover.Content>
</Popover.Root>

<Menu.Root>
  <Menu.Trigger><Button variant="outlined">打开 Menu</Button></Menu.Trigger>
  <Menu.Content>
    <Menu.Item>编辑</Menu.Item>
    <Menu.Item>复制链接</Menu.Item>
    <Menu.Separator />
    <Menu.Item color="danger">删除</Menu.Item>
  </Menu.Content>
</Menu.Root>
```

**反馈 / 徽标**

Toast 为命令式组件，通过点击按钮触发：

```tsx
<Badge color="neutral">默认</Badge>
<Badge color="primary">成功</Badge>
<Badge color="danger">错误</Badge>
<Spinner />
{/* Toast 演示：点击按钮触发 */}
<Button variant="outlined" onClick={() => toast.create({ title: '操作已完成' })}>
  触发 Toast
</Button>
<Toaster />
```

### 3. Icons 预览

section label：`ICONS · Tabler Icons`

展示 20 个代表性图标，10 列网格，每格：图标（34×34px 边框容器）+ 图标名称（7px，muted）。

底部：`查看全部图标 →`（`<Button variant="link">`，跳转 `/icons`）

### 4. Footer

居中，单行：

```
MIT License · 2026
```

字号 10px，`color: --ui-color-text-muted`，`padding: 28px 0`，`border-top: 1px solid var(--ui-color-border)`。

---

## Icons Page（`/icons`）

共享 Navbar 和主题切换。

```
[section label]  ALL ICONS · @deweyou-design/react-icons

[搜索框]  <Input placeholder="搜索图标..." />

[图标网格]  每格：图标 + 名称，点击复制 import 语句
           grid-template-columns: repeat(auto-fill, minmax(80px, 1fr))
```

- `import * as Icons from '@deweyou-design/react-icons'`，过滤出 `Icon` 前缀的导出，遍历渲染
- 搜索过滤图标名称（`<Input>` 组件）
- 点击图标：显示 `<Toast>` 提示"已复制"，复制 `import { IconXxx } from '@deweyou-design/react-icons'` 到剪贴板

---

## 组件库复用清单

| 位置           | 使用组件                                                    |
| -------------- | ----------------------------------------------------------- |
| 主题切换按钮   | `<IconButton>`                                              |
| Hero CTA       | `<Button variant="filled">` / `<Button variant="outlined">` |
| 文档跳转链接   | `<Button variant="link">`                                   |
| 标题层级       | `<Text as="h1/h2/h3">`                                      |
| 正文 / 说明    | `<Text>` / `<Text variant="caption">`                       |
| 组件展示容器   | `<Tabs.Root/List/Trigger/Content>`                          |
| 按钮展示       | `<Button>` 全变体                                           |
| 表单展示       | `<Input>` `<Select>` `<Switch>` `<Checkbox>`                |
| 浮层展示       | `<Popover>` `<Menu>`                                        |
| 反馈展示       | `<Badge>` `<Spinner>`                                       |
| 图标展示       | `@deweyou-design/react-icons` 直接渲染                      |
| 图标页搜索     | `<Input>`                                                   |
| 图标页复制反馈 | `<Toast>` (命令式)                                          |

---

## 文件结构

```
apps/website/src/
├── main.tsx              # 应用入口，路由配置，主题初始化
├── pages/
│   ├── home.tsx          # Landing Page
│   └── icons.tsx         # Icons Page（现有文件重写）
├── components/
│   └── navbar.tsx        # 共享 Navbar
└── style.css             # 全局样式（仅保留必要的 body/html 重置）
```

现有 `main.tsx`（1500+ 行）全部废弃，拆分为上述结构。

---

## 不做的事

- 不实现组件文档页（由 Storybook 承担）
- 不做搜索功能（Landing 不需要）
- 不做代码复制按钮（install 命令）
- 不做动画/过渡（除组件库自带的交互反馈外）
- 不引入新的第三方 UI 库
