# 快速开始：优化 Button 间距平衡

## 目标

把 Button 的图标能力从隐式 icon-only children 推断改为显式 API：`Button` 通过 `icon` prop 承载图标，`IconButton` / `Button.Icon` 表达方形图标按钮；同时重新平衡文本按钮的 block/inline 间距，解决纯文本按钮视觉上“上下大、左右小”的问题。

## 建议实现顺序

1. 在 `packages/components/src/button/` 中重构按钮公开 props，把 `icon`、`IconButton`、`IconButtonProps` 和 `Button.Icon` 的公开契约建立起来。
2. 在 `packages/components/src/button/index.module.less` 中拆分内容按钮与方形图标按钮的密度变量，不再让所有按钮共享同一等边 padding。
3. 在 `packages/components/src/index.ts` 中补齐新的根级导出，并保持 `Button.Icon` 与 `IconButton` 的等价入口。
4. 更新 `packages/components/src/button/index.test.ts`，覆盖模式解析、`IconButton` 支持矩阵、`Button.Icon` 一致性、无障碍命名和视觉状态数据属性。
5. 更新 `apps/storybook/src/stories/Button.stories.tsx`，建立纯文本 Button、带 `icon` 的文本 Button、`IconButton` / `Button.Icon` 的评审矩阵和迁移示例。
6. 更新 `apps/website/src/main.tsx`，展示推荐写法，并把旧的 icon-only `Button` 示例迁移到显式 `IconButton` / `Button.Icon` 方案。
7. 更新 `packages/components/README.md`，记录公开 API、新增导出、breaking 行为变化和迁移步骤。

## 实现说明

- `Button` 继续支持 `filled`、`outlined`、`ghost`、`link` 四类 `variant`。
- `Button` 的 `icon` 只是图标入口，不是新的 `variant`。
- 当 `Button` 有 `icon` 且有可见文本时，它仍是内容按钮，不是 `IconButton`。
- 当 `Button` 有 `icon` 且没有可见文本时，它必须进入与 `IconButton` 相同的方形模式。
- `IconButton` 和 `Button.Icon` 必须完全等价；如果后续要补充某个状态或 props，两个入口必须同步更新。
- `IconButton` 支持 `filled`、`outlined`、`ghost`，不支持 `link`。
- `IconButton` 继续复用 `filled` / `outlined` 的 `shape` 语义；`ghost` 不对外暴露 `shape`。
- 纯文本 Button 与带 `icon` 的文本 Button 必须共享内容型间距，不得再因为 icon-only 目标而统一成等边 padding。
- `IconButton` 必须保持方形点击目标和图标居中。
- 任意没有可见文本的按钮都必须具备可访问名称。
- 旧的 icon-only children 方形行为不再作为标准契约，需要在文档和示例中给出迁移路径。
- 默认优先复用现有 `@deweyou-ui/styles` theme surface，不默认新增公共 spacing token。

## 验证

在仓库根目录运行：

```bash
vp check
vp test
vp run storybook#build
vp run components#build
vp run website#build
```

说明：

- `apps/website` 通过 package 根级导出消费 `@deweyou-ui/components`，因此在验证 website build 前必须先刷新 `packages/components/dist`。
- 如果希望一次性覆盖所有 package 产物与消费面，也可以补充运行 `vp run build -r` 作为发布前回归。

## 完成检查清单

- `@deweyou-ui/components` 对外暴露 `Button`、`ButtonProps`、`IconButton`、`IconButtonProps`。
- `Button.Icon` 与 `IconButton` 的行为、状态和无障碍约束完全一致。
- 文本按钮在主要尺寸下不再出现明显的上下偏重视觉问题。
- 带 `icon` 的文本 Button 与纯文本 Button 保持同一内容密度体系。
- `IconButton` 在所有支持尺寸下保持方形点击目标和图标居中。
- `IconButton` 的无障碍命名要求已通过自动化测试验证。
- Storybook 已覆盖三种入口和关键状态，website 已展示推荐接入与迁移示例。
- README 已记录 breaking 迁移项和推荐替换方式。
