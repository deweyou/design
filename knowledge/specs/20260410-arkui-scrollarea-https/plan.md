# 实施计划：ScrollArea 滚动区域组件

**分支**：`20260410-arkui-scrollarea-https` | **日期**：2026-04-10 | **规格**：[spec.md](spec.md)  
**输入**：来自 `knowledge/specs/20260410-arkui-scrollarea-https/spec.md` 的功能规格  
**语言要求**：本文件及同级 `/specs/` 文档正文必须使用简体中文；代码标识符、命令、
文件路径、协议字段和第三方 API 名称可保留原文。

---

## 摘要

基于 `@ark-ui/react` 的 `ScrollArea` 原语，在 `packages/react/src/scroll-area/` 下实现 `ScrollArea` 组件。采用叠层（overlay）滚动条模式——滚动条绝对定位浮于内容上方，不占用布局空间。支持垂直（默认）和水平方向，提供 `color` 三档（primary / black / white）控制滚动条滑块颜色，所有样式通过 CSS Modules（Less）+ `--ui-*` token 实现，符合设计系统数值规范（原则 VII）。

---

## 技术上下文

**语言/版本**：TypeScript 5.x、React 19.x  
**主要依赖**：`@ark-ui/react`（ScrollArea 原语）、`classnames`、`@deweyou-design/styles`  
**存储**：N/A  
**测试**：`vp test`（vitest + @testing-library/react）  
**目标平台**：现代浏览器（支持 `scrollbar-width: none` 和 `color-mix`）  
**项目类型**：组件库（library）  
**性能目标**：无额外 JS 滚动监听；样式完全由 Ark UI data attribute + CSS 驱动  
**约束**：不引入 Ark UI 默认样式；公开 API 与 Ark UI 原语解耦  
**规模/范围**：单一源码单元，1 个组件，1 个 website 预览页

---

## 宪章检查

### 实施前检查（Phase 0）

| 原则 | 检查项                                                                                                                | 结果    |
| ---- | --------------------------------------------------------------------------------------------------------------------- | ------- |
| I    | 行为层使用 Ark UI ScrollArea 原语，不手写状态机                                                                       | ✅ 通过 |
| I    | 组件在 `packages/react` 中作为独立源码单元实现，website 仅做消费                                                      | ✅ 通过 |
| II   | 无障碍契约已定义：键盘穿透、屏幕阅读器不感知滚动条                                                                    | ✅ 通过 |
| III  | 所有视觉值通过 `--ui-*` token 表达，不硬编码；使用 `--ui-color-border-strong` 作为滑块色                              | ✅ 通过 |
| IV   | 计划包含单测 + website 预览                                                                                           | ✅ 通过 |
| V    | 使用 `vp check` / `vp test` 验证；无包级专用构建配置                                                                  | ✅ 通过 |
| VI   | 文件采用 kebab-case（`scroll-area/`），组件 `.tsx`，函数箭头风格                                                      | ✅ 通过 |
| VII  | 过渡 140ms ease，disabled opacity 0.56，hover color-mix 6-12%；滚动条为容器组件，不强制四维变体模型（有据可查的例外） | ✅ 通过 |
| 文档 | spec / plan / tasks 均使用简体中文                                                                                    | ✅ 通过 |

**四维变体模型例外说明**：ScrollArea 是纯容器组件，无"填充"或"线框"视觉层级，无 shape 变化，无 size 差异化需求。引入 `color` 维度（primary / black / white）控制滑块色，与宪章 color 语义对齐但取值不同（非 neutral/primary/danger 三档）。该例外在 plan 中显式记录，符合宪章要求。

---

## 项目结构

### 文档（本功能）

```text
knowledge/specs/20260410-arkui-scrollarea-https/
├── spec.md           ✅ 已完成
├── plan.md           ✅ 本文件
├── research.md       ✅ 已完成
├── data-model.md     ✅ 已完成
└── tasks.md          ⏳ Phase 2 生成
```

### 源代码

```text
packages/react/src/
└── scroll-area/           # 新建源码单元
    ├── index.tsx          # 组件实现
    ├── index.module.less  # 样式
    └── index.test.tsx     # 单测（colocate）

packages/react/src/
└── index.ts               # 新增 ScrollArea 导出

apps/website/src/
└── pages/
    └── scroll-area.tsx    # website 预览页

apps/website/src/
└── main.tsx               # 新增 ScrollArea 预览入口
```

---

## 架构决策

### 1. 组件结构：单一封装 vs 复合对象

**选择**：单一 `ScrollArea` 组件，内部封装 Ark UI 复合结构。

```tsx
// 消费方用法
<ScrollArea style={{ height: 300 }}>
  <p>长内容...</p>
</ScrollArea>

// 可选开启水平
<ScrollArea style={{ height: 300 }} horizontal>
  <div style={{ width: 1000 }}>宽内容...</div>
</ScrollArea>
```

**理由**：ScrollArea 的 Root/Viewport/Content/Scrollbar/Thumb/Corner 对消费方没有定制价值，暴露复合子组件只会增加使用复杂度。Popover 的复合设计是因为其 trigger/content 两侧可以各自承载任意子树，ScrollArea 无此需求。

### 2. 叠层滚动条实现

```
Root        position: relative; overflow: hidden
Viewport    width: 100%; height: 100%; overflow: scroll
            scrollbar-width: none  /* Firefox */
            &::-webkit-scrollbar { display: none }  /* WebKit */
Scrollbar   position: absolute
            vertical: top:0; right:0; bottom:0; width: var(--scroll-area-scrollbar-size)
            horizontal: left:0; right:0; bottom:0; height: var(--scroll-area-scrollbar-size)
Thumb       border-radius: 999px; background: var(--ui-color-border-strong)
            transition: background 140ms ease, opacity 140ms ease
```

### 3. 溢出状态驱动的显隐

Ark UI 在 Scrollbar 上写入 `[data-overflow-y]` / `[data-overflow-x]`：

```less
.scrollbar[data-orientation='vertical'] {
  opacity: 0;
  transition: opacity 140ms ease;
}
.scrollbar[data-orientation='vertical'][data-overflow-y] {
  opacity: 1;
}
// 水平同理
```

### 4. color 档位实现

通过 `data-color` attribute + CSS 变量覆盖：

```less
.root[data-color='primary'] {
  --scroll-area-thumb-color: var(--ui-color-brand-bg);
}
.root[data-color='neutral'] {
  --scroll-area-thumb-color: var(--ui-color-text);
}
// --ui-color-text 在浅色主题为 neutral-950，深色主题为 neutral-100，自动跟随主题反转
```

---

## 公开 API

**package**：`@deweyou-design/react`  
**导出**：`ScrollArea`、`ScrollAreaProps`、`ScrollAreaColor`（`'primary' | 'neutral'`）  
**semver 影响**：minor（新增导出，无破坏性变更）

```tsx
export type ScrollAreaColor = 'primary' | 'neutral';

export type ScrollAreaProps = {
  children: ReactNode;
  className?: string;
  color?: ScrollAreaColor; // 滑块颜色，默认 'primary'（品牌绿）；neutral 随主题自动反转
  horizontal?: boolean; // 是否同时显示水平滚动条，默认 false
  style?: CSSProperties;
};

export const ScrollArea: React.FC<ScrollAreaProps>;
```

---

## Token 影响

**不新增 token**。复用：

| Token                 | 用途                                    |
| --------------------- | --------------------------------------- |
| `--ui-color-brand-bg` | 滑块色（color=primary，默认）           |
| `--ui-color-text`     | 滑块色（color=neutral，随主题自动反转） |
| `--ui-color-canvas`   | Corner 填充色                           |

组件内部定义局部 CSS 变量（`--scroll-area-scrollbar-size` 等），不进入全局 token 系统。

---

## 无障碍契约

- `ScrollArea.Scrollbar` 由 Ark UI 原生处理，不挂载 ARIA role，对辅助技术透明
- `ScrollArea.Viewport` 是标准溢出容器，屏幕阅读器可正常访问内容
- 键盘用户 Tab 焦点正常穿透内容；不添加 `tabIndex` 到滚动条相关元素
- 不拦截方向键、Home、End 等默认浏览器滚动行为

---

## 测试计划

**单测**（`src/scroll-area/index.test.tsx`）：

1. 渲染基本结构，快照验证 DOM 层级
2. `size` prop 传递到根元素的 `data-size` attribute
3. `horizontal=true` 时渲染水平 Scrollbar 和 Corner
4. `horizontal=false`（默认）时不渲染水平 Scrollbar

**website 预览**（人工评审）：

1. 垂直滚动默认态（高度受限容器内超长文本）
2. 水平滚动（宽内容）
3. 双向同时滚动
4. color 两档对比（primary / neutral，neutral 需在浅色和深色主题下各验证一次）
5. 内容不溢出时滚动条隐藏态

---

## 验证命令

```bash
vp check                    # 类型检查 + lint + 格式化
vp test packages/react      # 单测
vp run website#dev          # 启动预览站人工评审
```

---

## 复杂度追踪

_无宪章违反项需要说明。_
