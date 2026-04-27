# 实施计划：按钮 Hover 反馈整理

## 概述

本次实现收敛为两个默认行为：

- `link`：使用从左到右显现的自定义下划线反馈。
- `outlined`：取消额外描边动画，仅保留真实 border 从低色度到文字颜色的过渡。

同时移除已尝试过的 `animated` 公开属性及相关演示、测试与文档。

## 技术上下文

- Package：`@deweyou-ui/components`
- 关键文件：
  - `packages/components/src/button/index.tsx`
  - `packages/components/src/button/index.module.less`
  - `packages/components/src/button/index.test.ts`
  - `packages/components/tests/button-support-matrix.test.ts`
  - `apps/storybook/src/stories/Button.stories.tsx`
  - `apps/website/src/main.tsx`
  - `packages/components/README.md`
- 约束：
  - 不新增公开属性
  - 不改变 `IconButton` 与 `Button.Icon` 合约
  - 低动态偏好与 disabled 场景必须保持稳定

## 设计决策

- `link` 下划线由组件内部装饰层提供，但不叠加原生 `text-decoration`。
- `outlined` 只修改真实 border 的默认颜色与 hover 过渡，不额外绘制 SVG、mask 或伪边框层。
- 所有评审材料直接展示默认行为，不再区分 opt-in / fallback。

## 宪章检查

- 公开 API 变化：通过。最终没有新增公开属性。
- 无障碍：通过。focus-visible、disabled、reduced-motion 均保留独立状态信号。
- 文档一致性：通过。实现、测试、Storybook、website 与 README 统一回到默认行为描述。
