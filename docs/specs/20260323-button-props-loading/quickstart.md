# 快速开始：补齐 Button 公开属性与加载态

## 目标

在不拆散现有 Button API 的前提下，补齐开发者常用属性和状态：显式文档化点击事件，新增 `htmlType`、`href`、`target`、`loading`、`danger`，并让 `Button` / `IconButton` 一起支持 ref-forwarding 到实际渲染根节点。

## 建议实现顺序

1. 在 `packages/styles/src/` 中补齐 danger 语义色 surface，保证浅色 / 深色主题都有可复用的 token。
2. 在 `packages/components/src/button/index.tsx` 中扩展 `ButtonProps` / `IconButtonProps`，补入 `htmlType`、`href`、`target`、`loading` 和 ref-forwarding。
3. 在 `packages/components/src/button/index.tsx` 中明确 `htmlType` 与原生 `type` 的优先级，并保证 `href` 存在时切到 `<a>` 根节点、`target` 仅在该路径下生效。
4. 在 `packages/components/src/button/index.tsx` 与 `index.module.less` 中实现 loading 状态：普通按钮前置内建 spinner、图标按钮替换 spinner、阻止重复激活、保留常规鼠标指针，并暴露忙碌语义。
5. 在 `packages/components/src/button/index.module.less` 中扩展 `danger` 颜色样式和 loading-disabled 视觉分支，避免沿用 `not-allowed` 指针。
6. 在 `packages/components/src/button/index.test.ts` 中补齐 danger / loading / htmlType / href / target / ref / 事件行为的单测或服务端渲染断言。
7. 在 `apps/storybook/src/stories/Button.stories.tsx` 中补充 danger、loading、事件接入、`htmlType`、`href` / `target` 和 ref 的评审样例。
8. 在 `apps/website/src/main.tsx` 中更新面向消费方的推荐写法，并补充 loading 与 danger 精选示例。
9. 更新 `packages/components/README.md`，记录新增 props、loading 规则、danger 颜色和验证方式。

## 实现说明

- `Button` 继续支持 `filled`、`outlined`、`ghost`、`link` 四类 `variant`。
- `IconButton` 继续支持 `filled`、`outlined`、`ghost` 三类 `variant`。
- `danger` 是 `color` 轴上的新增值，不是新的 `variant`。
- `loading` 是独立状态字段，不并入 `variant` 或 `disabled`。
- `Button` 在 `loading` 时要保留文本，并把 loading 图标放到内容前面。
- `IconButton` / `Button.Icon` 在 `loading` 时要用 loading 图标替换原图标。
- `loading` 必须阻止再次点击，但不能使用 `not-allowed` 光标。
- `loading` 必须在 button 根节点上表达 busy / processing 语义。
- `htmlType` 只影响原生 button `type`，不影响视觉样式。
- `href` 存在时必须使用原生链接语义。
- `target` 只有在 `href` 存在时才允许传入。
- `Button` 与 `IconButton` 都必须把 ref 暴露到实际渲染根节点。

## 验证

在仓库根目录运行：

```bash
vp check
vp test
vp run components#build
vp run storybook#build
vp run website#build
```

说明：

- `packages/components` 的 dist 产物需要先刷新，website 才能基于最新根级导出完成构建验证。
- 如果 Storybook 和 website 都通过，说明 package 契约与消费面示例没有明显脱节。

## 完成检查清单

- `@deweyou-ui/components` 对外文档化并验证 `onClick`、`onClickCapture`、`htmlType`、`href`、`target`、`loading`、`danger` 与 ref。
- `Button` 与 `IconButton` 的 ref 都指向实际渲染根节点。
- `danger` 在所有受支持的按钮入口中都能被明确识别为危险动作。
- `loading` 在普通按钮和图标按钮中都使用正确的 spinner 呈现策略。
- `loading` 会阻止重复激活，但不会显示 disabled 专属鼠标指针。
- Storybook 与 website 已覆盖新增 props、danger、loading 和边界说明。
- README 已同步记录新增公开 API 和验证方式。
