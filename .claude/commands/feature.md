# feature

为 Deweyou UI 组件库执行完整的需求开发流程，从 spec 到 implement，带关键检查点。

## 用法

```
/feature <需求描述>
```

## 目录约定

每个功能的文档放在 `specs/<###-feature-name>/`，例如 `specs/001-select/`。
编号从 001 开始递增，name 使用 kebab-case。speckit skill 会自动创建此目录。

## 执行流程

收到用户输入后，按以下步骤执行。每个检查点必须暂停并等待用户明确确认后才能继续。

---

### Step 1 — Specify

使用 `speckit.specify` skill，将 `$ARGUMENTS` 作为需求描述输入。

完成后展示生成的 spec 摘要（用户故事列表、FR-006/007/008 覆盖情况），然后**暂停**：

> **检查点 1/4：** spec 已生成。
> 请确认：用户故事范围是否准确？有没有遗漏或需要删减的？
> 回复「继续」或告诉我需要调整的地方。

---

### Step 2 — Clarify（可选）

询问用户：

> 是否需要先跑 `speckit.clarify` 澄清模糊点？（如果 spec 已经很清晰可以跳过，直接回复「跳过」）

- 用户回复「跳过」→ 直接进入 Step 3
- 用户回复其他 → 使用 `speckit.clarify` skill 执行澄清，完成后继续 Step 3

---

### Step 3 — Plan

使用 `speckit.plan` skill 生成实施计划。

完成后展示关键决策摘要：

- 目标 package 和文件结构
- Ark UI primitive 选型（若涉及交互组件）
- 公开 API 设计（props、variants、受控/非受控）
- 宪章检查结果

然后**暂停**：

> **检查点 2/4：** plan 已生成。
> 请确认：Ark UI 选型和 API 设计是否合理？这两个决策后续改动成本高，请仔细过一下。
> 回复「继续」或告诉我需要调整的地方。

---

### Step 4 — Tasks

使用 `speckit.tasks` skill 生成任务清单。

完成后立即使用 `speckit.analyze` skill 对 spec/plan/tasks 三个文档做一致性检查，
将分析结果中的风险项和遗漏项一并展示，然后**暂停**：

> **检查点 3/5：** tasks 已生成，一致性分析完毕。
> 共 N 个任务。如有风险项请先确认处理方式。
> 回复「继续」开始实现，或告诉我需要调整的地方。

---

### Step 5 — Implement

使用 `speckit.implement` skill 逐任务执行。

执行过程中：

- 每次 Claude 回复结束时自动触发 `vp check`（Stop hook）
- 如果 `vp check` 失败，停下来修复后再继续下一个任务

全部任务完成后**暂停**：

> **检查点 5/5：** 所有任务已完成，`vp check` 通过。
> 准备好进行最终 review 了吗？回复「继续」跑 checklist。

---

### Step 6 — Checklist

使用 `speckit.checklist` skill 生成针对本次变更的 review 清单。

重点核查宪章原则 VII 的设计数值：

- disabled opacity: `0.56`
- 交互过渡: `140ms ease`
- 浮层动效: `160ms`
- 焦点环: `2px solid var(--ui-color-focus-ring)`, `outline-offset: 2px`

展示 checklist 后流程结束。提示用户可运行 `vp check` 和 `vp test` 做最终验证。

---

## 注意事项

- 任何检查点用户要求调整时，重新运行对应的 speckit skill，不要跳过
- implement 阶段如遇 `vp check` 持续失败，向用户说明情况，不要静默跳过
- 所有生成文档（spec/plan/tasks）正文使用简体中文（宪章原则 V）
