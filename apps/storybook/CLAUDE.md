# CLAUDE

## 适用范围

适用于 `apps/storybook`。

## 约束

- `apps/storybook` 仅用于内部评审和状态验证。
- 不要复制 `apps/website` 中完整的公开文档内容。
- 必须显式从 `@deweyou-ui/styles/theme.css` 导入全局样式。
- stories 应聚焦组件状态、边界情况和评审工作流。
- Storybook 相关依赖应保持在同一发布线，避免重新引入已废弃的 legacy add-on 包。
- **所有 story 内容必须使用英文**：标签文字、内容区域占位文、story 描述、story 标题、label 文本均须为英文，不得出现中文字符。

## E2E 测试约定

每个 `*.stories.tsx` 文件必须包含一个名为 `Interaction` 的导出 story，并带有 `play` 函数。**增删改任何 story 时，必须同步维护同文件的 `Interaction` story**：

- **新增 story**：若新 story 涉及可交互行为（点击、键盘、状态变化），需在 `Interaction.play` 中补充对应断言。
- **修改 story**：若修改影响组件行为或 DOM 结构，需同步更新 `Interaction.play` 中相关断言。
- **删除 story**：若被删 story 对应有 `Interaction.play` 中的测试用例，需一并移除，避免断言引用不存在的场景。

`Interaction` story 的 `play` 函数通过 `@storybook/test-runner` 作为 e2e 测试运行，是该文件唯一的行为验证层，不可省略。
