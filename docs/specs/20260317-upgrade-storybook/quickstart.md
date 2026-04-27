# 快速开始：升级 Storybook 到最新稳定版

## 目标

验证内部 Storybook 评审应用已经升级到当前稳定版本线，且没有破坏贡献者工作流。

## 准备流程

1. 使用仓库标准方式安装工作区依赖：

```bash
vp install
```

2. 确认 Storybook 版本归属已集中在 workspace catalog 中，并由 `apps/storybook/package.json` 消费。
3. 检查 `apps/storybook/.storybook/main.ts` 和 `apps/storybook/.storybook/preview.ts`，确认其中记录的迁移变更已经同步。

## 维护者验证流程

1. 运行标准工作区验证：

```bash
vp check
vp test
```

2. 构建内部预览应用：

```bash
vp run storybook#build
```

3. 启动内部预览应用并打开一个代表性 story：

```bash
vp run storybook#dev
```

4. 在运行中的预览环境中确认以下事项：
   - Storybook 可通过 `http://localhost:6106/` 访问
   - story 导航仍显示预期的内部评审分组
   - 代表性 story 能在 canvas 视图中正常渲染
   - 使用 autodocs 的 story 仍可访问 docs 内容
   - 交互控件仍可使用
   - 共享样式 package 提供的主题样式仍然成功加载

## 迁移评审检查清单

1. 确认不存在未解决的 Storybook 版本不匹配警告。
2. 确认 app 不再依赖已废弃或已移除的 Storybook 包。
3. 确认所有面向贡献者的编写变化都已记录进升级说明。
4. 确认 `apps/storybook` 仍是内部评审面，而不是公开文档面。

## 后续说明

- 实现目标版本：Storybook `10.2.19`。
- 工作区当前统一使用 `@storybook/addon-docs`、`@storybook/react`、`@storybook/react-vite` 和 `storybook` 这一条对齐后的版本线。
- 已于 2026-03-17 使用 `vp check`、`vp test`、`vp run storybook#build` 和 `vp run storybook#dev` 完成验证。
