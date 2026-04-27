# 快速开始：实现 Popover 组件

## 目标

验证 `@deweyou-ui/components` 已新增可复用的 `Popover` 组件，并且 package 测试、公开 website demo 与内部 Storybook review 面都已同步更新。

## 准备流程

1. 安装工作区依赖：

```bash
vp install
```

2. 确认当前分支为 `20260324-add-popover-component`。
3. 阅读以下文档，确保实现与公开契约一致：
   - `specs/20260324-add-popover-component/spec.md`
   - `specs/20260324-add-popover-component/research.md`
   - `specs/20260324-add-popover-component/contracts/popover-public-contract.md`

## 实现范围

1. 在 `packages/components/src/popover/` 下实现 `Popover`、样式和单测。
2. 更新 `packages/components/src/index.ts` 根导出，并补充 package 入口测试。
3. 更新 `apps/website/src/main.tsx` 与必要样式，增加公开 demo。
4. 新增 `apps/storybook/src/stories/Popover.stories.tsx`，覆盖内部评审矩阵。
5. 如需新增依赖，统一通过 `vp add` 写入 `packages/components` 的依赖声明。

## 自动化验证

1. 运行工作区静态检查与测试：

```bash
vp check
vp test
```

2. 构建内部 Storybook 评审应用：

```bash
vp run storybook#build
```

3. 构建公开 website demo：

```bash
vp run website#build
```

## 人工评审流程

1. 启动公开 demo：

```bash
vp run website#dev
```

2. 启动内部 Storybook：

```bash
vp run storybook#dev
```

3. 在两处预览面确认以下事项：
   - 默认 `click` 触发可用
   - `hover`、`focus`、`context-menu` 组合触发按文档规则工作
   - `content` 为交互内容时，面板内部点击不会默认关闭
   - `visible` / `defaultVisible` / `onVisibleChange` 行为一致
   - `top`、`bottom`、`left`、`right`、`left-top`、`left-bottom`、`right-top`、`right-bottom` 都有覆盖
   - `offset` 和 `boundaryPadding` 会影响最终位置与边界回退
   - `popupPortalContainer` 不会破坏层级、外部关闭和锚定定位
   - `disabled` 状态不会打开 Popover
   - 键盘用户可以进入内容、离开内容，并在关闭后回到触发元素
   - `card`、`loose`、`pure` 和 `rect`、`rounded` 样式符合预期
   - 箭头、border、shadow 和开关动画在浅色/深色主题下都保持一致

## 完成标准

- `@deweyou-ui/components` 根入口可稳定导出 `Popover`
- package 单测和入口测试通过
- `apps/website` 与 `apps/storybook` 都包含可评审的 Popover 预览
- 所有验证命令均通过，且预览面未出现明显脱锚、裁切或焦点回归

## 最终验证记录

- 2026-03-24 已完成以下自动化验证：
  - `vp run components#build`
  - `vp run components#test`
  - `vp run website#build`
  - `vp run storybook#build`
  - `vp test`
- `vp check` 在实现完成后只暴露过格式化问题；修正格式后需再次通过作为最终交付确认。
- 当前公开 demo 已覆盖：
  - 默认 `click` 打开
  - 受控 `visible` / `onVisibleChange`
  - `pure` / `loose` / `card` 内容模式
  - `rect` / `rounded` 视觉形态
  - `popupPortalContainer` 与 `boundaryPadding`
  - 带交互内容与 `disabled` 的边界场景
- 当前 Storybook 已覆盖：
  - 八向 placement 矩阵
  - trigger 组合矩阵
  - mode / shape 评审
  - 自定义 portal 容器
  - 多实例独立与受控关闭流程
