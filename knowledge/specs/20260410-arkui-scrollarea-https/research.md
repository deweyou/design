# 研究报告：ScrollArea 组件

**分支**：`20260410-arkui-scrollarea-https`  
**日期**：2026-04-10

---

## 1. Ark UI ScrollArea 原语能力

**决策**：使用 `@ark-ui/react` 的 `ScrollArea` 作为行为基础层。

**理由**：

- 提供叠层滚动条所需的结构（Root / Viewport / Content / Scrollbar / Thumb / Corner）
- 通过 `[data-overflow-x]` / `[data-overflow-y]` data attribute 自动响应内容溢出状态
- 通过 `[data-scrolling]` / `[data-hover]` 暴露交互状态，CSS 即可驱动样式
- `Scrollbar` 组件的 `orientation` prop 支持垂直和水平两个方向
- `useScrollArea()` 提供程序式控制（`scrollToEdge`）

**替代方案评估**：

- 手写原生 `overflow: auto` + 自定义滚动条：需要大量 JS 监听滚动尺寸，维护成本高
- 第三方库（如 `radix-ui/react-scroll-area`）：宪章要求优先 Ark UI，无需引入额外依赖

---

## 2. 叠层滚动条实现方案

**决策**：`ScrollArea.Root` 使用 `position: relative`，`ScrollArea.Scrollbar` 使用 `position: absolute` 叠在内容之上。

**理由**：

- Ark UI 的 Scrollbar 元素本身已适合绝对定位，不依赖父元素的布局模型
- 叠层模式下 Viewport 不需要为滚动条预留 padding，内容宽度保持完整
- 垂直滚动条 `right: 0; top: 0; bottom: 0`，水平滚动条 `bottom: 0; left: 0; right: 0`

**实现细节**：

- Root：`position: relative; overflow: hidden`
- Viewport：`width: 100%; height: 100%; overflow: scroll`（原生滚动，隐藏原生滚动条）
- 隐藏原生滚动条：`scrollbar-width: none`（Firefox）+ `::-webkit-scrollbar { display: none }`（Chromium/Safari）
- Scrollbar：`position: absolute`，`pointer-events: auto`

---

## 3. size 维度设计

**决策**：提供 `small`（4px）/ `medium`（6px，默认）/ `large`（8px）三档，控制滚动条轨道宽度。

**理由**：

- 轨道宽度是唯一随尺寸变化有意义的视觉属性
- 三档与现有 button 的尺寸体系保持层级对应关系（非强制映射）
- 不引入 `variant` / `color` / `shape`，ScrollArea 是容器型组件，不适用交互按钮的四维变体模型

---

## 4. Token 使用策略

**决策**：复用现有 `--ui-*` token，不新增 scrollbar 专用 token。

| 部件       | Token                                                                             | 用途                               |
| ---------- | --------------------------------------------------------------------------------- | ---------------------------------- |
| 轨道背景   | 透明                                                                              | overlay 模式下轨道通常不可见       |
| 滑块默认   | `--ui-color-border-strong`                                                        | 与现有边框体系统一，深色模式自适应 |
| 滑块 hover | `color-mix(in srgb, var(--ui-color-border-strong) 80%, var(--ui-color-text) 20%)` | 加深混色                           |
| 过渡       | `140ms ease`                                                                      | 宪章强制值                         |

**理由**：`--ui-color-border-strong` 在浅色（slate-400）和深色（slate-700）模式下都有合理的滑块对比度，无需新增语义 token。

---

## 5. 公开 API 设计

**决策**：提供单一 `ScrollArea` 组件（非复合对象），包装 Ark UI 复合结构，保持消费方 API 简洁。

```tsx
export type ScrollAreaSize = 'small' | 'medium' | 'large';

export type ScrollAreaProps = {
  children: ReactNode;
  className?: string;
  horizontal?: boolean; // 开启水平滚动条
  size?: ScrollAreaSize; // 默认 'medium'
  style?: CSSProperties;
};

export const ScrollArea: React.FC<ScrollAreaProps>;
```

**理由**：

- ScrollArea 的结构（Root/Viewport/Content/Scrollbar/Thumb/Corner）对消费方透明，无需暴露复合子组件
- `horizontal` prop 语义清晰，垂直滚动是默认行为
- 与 Ark UI 内部接口解耦，符合宪章原则 I 要求

---

## 6. 无障碍

**决策**：`ScrollArea.Scrollbar` 和 `ScrollArea.Thumb` 通过 Ark UI 原生 ARIA 处理，消费方无需额外配置。

**研究结论**：

- Ark UI 的 Scrollbar 不带 `role` 属性，对辅助技术不可见（内容通过原生 overflow scroll 访问）
- 键盘用户使用 Tab 穿透内容，方向键在内容元素上操作，不被滚动容器拦截
- `ScrollArea.Viewport` 承担原生滚动容器职责，屏幕阅读器可正常访问内容

---

## 7. website 预览方案

**决策**：在 `apps/website` 中新增 `scroll-area` 预览页，覆盖以下状态：

1. 垂直滚动默认态（size: medium）
2. 水平滚动（horizontal: true）
3. 双向同时滚动（horizontal: true + 垂直内容）
4. size 三档对比（small / medium / large）
5. 内容不溢出时滚动条隐藏态
