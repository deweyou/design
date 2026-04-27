# 快速开始：UI Monorepo 基础建设

## 目标

在仓库按 packages 与 apps 重组后，验证 v1 monorepo 基础设施是否成立。

## 准备流程

1. 使用项目标准工作流安装依赖：

```bash
vp install
```

2. 确认 monorepo 中包含以下目录：
   - `apps/website`
   - `apps/storybook`
   - `packages/utils`
   - `packages/hooks`
   - `packages/styles`
   - `packages/components`
3. 确认 package 文档或 README 已说明每个 package 的职责与公开入口。

## 消费者验证流程

1. 打开文档中记录的消费者接入说明。
2. 从 styles package 导入文档化的全局样式入口。
3. 从 components package 导入至少一个组件。
4. 确认组件在没有任何自定义主题配置的情况下，能够按默认设计语言正确渲染。
5. 通过文档中说明的机制在亮色和暗色主题间切换。
6. 覆盖一个被允许的公开品牌色 token，并确认组件在保持默认布局与结构的前提下反映出新的品牌表达。

示例消费者接入方式：

```ts
import '@deweyou-ui/styles/theme.css';
import { FoundationButton } from '@deweyou-ui/components';
```

## 维护者验证流程

1. 审查 package 依赖方向，确认没有引入循环依赖。
2. 审查 website 内容，确认其承担官方安装说明、主题说明和精选示例指导。
3. 审查 Storybook，确认其聚焦于内部状态覆盖和探索式验证，而不是复制完整公开文档。
4. 审查至少一个组件契约，并确认：
   - 全局样式不会被静默注入
   - 组件本地样式具备作用域隔离
   - 根级 `className` 是主要公开样式入口
   - 内部类名不会被视作公开 API

## 验证命令

运行标准 monorepo 检查：

```bash
vp install
vp check
vp test
```

如果实现计划中引入了 app 或 package 级专门验证命令，请通过 `vp run` 执行。

推荐 app 级检查：

```bash
vp run website#build
vp run storybook#build
```

## 后续说明

- 已于 2026-03-16 使用 `vp check`、`vp test`、`vp run website#build` 和 `vp run storybook#build` 完成验证。
- Storybook 构建过程会输出关于其内部直接使用 `eval` 和预览 chunk 较大的上游警告，但构建本身仍然成功。
