# 归档：重构 Button 组件基础能力

**分支**：`20260320-button-variants`  
**完成时间**：2026-03-21  
**类型**：feat

---

## 交付摘要

全面重构 Button 组件，将公开 API 收敛为 `Button` + `ButtonProps`，引入 `variant`（`filled`/`outlined`/`ghost`/`link`）、`color`（`neutral`/`primary`）、`size`（五档）、`shape`（`rect`/`rounded`/`pill`）四个正交维度的能力模型。明确 `shape` 仅对 `filled` 和 `outlined` 生效，`ghost`/`link` 不支持 `shape` 且传入时给出明确错误。`ghost` 和 `link` 使用轻量文本流内边距，实体按钮高度由字号+行高+内边距驱动，不再依赖固定 `min-height`。同步将 website 和 Storybook 的页面底色统一为白底/黑底，避免背景色干扰按钮颜色判断。

---

## 关键决策

| 决策                  | 选择                   | 理由                                       | 备选方案                  |
| --------------------- | ---------------------- | ------------------------------------------ | ------------------------- |
| 配置字段命名          | `variant`（非 `type`） | 原生 `<button>` 已有 `type` 语义，不应重名 | `type`                    |
| 轮廓字段命名          | `shape`（非 `radius`） | 表达离散轮廓类型而非可调数值               | `radius` / `borderRadius` |
| `color` 默认值        | `neutral`              | 按钮未显式配置时保持黑白灰中性色表现       | `primary`                 |
| 高度驱动方式          | 字号+行高+内边距       | 更自然的内容盒模型，不依赖固定最小高度     | 固定 `min-height`         |
| `ghost`/`link` 内边距 | 轻量文本流内边距       | 与实体按钮区分，适合文本流和密集工具栏场景 | 与 `filled` 对齐          |

---

## 踩坑记录

- **问题**：`icon` 源数据 `viewBox` 非正方形时，在 Button 内容区产生占位偏差。  
  **解决方案**：通过稳定的方形 wrapper 与 `viewBox` 补方策略降低图标占位抖动。

---

## 可复用模式

- [variant/color/size/shape 正交模型]：四维正交能力轴是后续所有组件 API 设计的参考范式，各维度独立控制，不互相折叠。
- [不支持组合显式报错]：对于明确不在支持矩阵内的组合给出明确错误而非静默回退，保持 API 契约可预测。

---

## 宪章反馈

- [ ] 无需更新

---

## 后续待办

- 无
