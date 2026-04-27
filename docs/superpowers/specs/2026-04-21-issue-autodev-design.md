# Issue 自动开发流程设计

**日期**：2026-04-21
**状态**：待实现

---

## 概述

当 GitHub Issue 打上 `autodev` label 时，自动触发 Claude agent 完成从需求分析到提 PR 的全流程。当前阶段采用半自动模式（C 方案）：agent 在 brainstorming 结束后暂停，通过 Hermes 发送 design doc 等待用户确认，批准后继续执行。待用户对 agent 输出质量建立信任后，可切换为全自动模式（B 方案）。

---

## 整体流程

```
GitHub Issue (labeled: autodev)
    ↓ GitHub App webhook
Hermes（本地 webhook handler）
    ↓ 解析 payload，启动 claude CLI 会话
Claude Agent
    ├── 1. 读取 issue 类型与字段
    ├── 2. 自主运行 brainstorming → 生成 design doc
    ├── 3. 通过 Hermes 把 design doc 发给用户
    ├── 4. ⏸ 等待用户在 Hermes 回复 approve / 修改意见
    ├── 5. writing-plans → executing-plans（git worktree 隔离）
    └── 6. 通过 GitHub App API 提 PR，关联原 issue
```

---

## 触发层

### GitHub App

- Hermes 作为 GitHub App 的 webhook handler
- 订阅 `issues` 事件，过滤条件：`action: labeled` + `label.name: autodev`
- GitHub App 同时持有仓库写权限，供后续 PR 创建使用

### Hermes → Claude Agent

Hermes 收到 payload 后，解析 issue 字段，拼接 prompt 启动 claude 会话：

```
你是 deweyou-design 仓库的开发 agent。
以下是一个 GitHub Issue，请：
1. 基于 issue 内容自主完成 brainstorming（无需交互提问）
2. 生成 design doc 后通过 Hermes 发给用户确认
3. 收到 approve 后继续 writing-plans → executing-plans → 提 PR

Issue 类型：{label}        # component / icon / bugfix / enhance
Issue 内容：
{issue_body_parsed}        # 各模板字段的解析结果
```

---

## Issue 模板

仓库新增四个 issue template，位于 `.github/ISSUE_TEMPLATE/`。

### new-component.yml — 新增组件

字段：组件名称、需要的 variant/size/color、使用场景、API 提示（可选）、参考（可选）
自动打 label：`autodev`, `component`

### new-icon.yml — 新增 Icon

字段：icon 名称、分类、使用场景、SVG 来源（可选）
自动打 label：`autodev`, `icon`

### bugfix.yml — Bug 修复

字段：涉及组件、问题描述（现在行为 vs 期望行为）、复现步骤、附加上下文（可选）
自动打 label：`autodev`, `bugfix`

### enhance-component.yml — 现有组件能力扩展

字段：目标组件、新增能力描述、API 变更提示（可选）、是否可能有破坏性变更（dropdown）
自动打 label：`autodev`, `enhance`

---

## Claude Agent 会话设计

### 上下文注入

- 仓库本地路径
- issue 类型 + 解析后的结构化字段
- 加载 CLAUDE.md、docs/knowledge/constitution.md

### Brainstorming 阶段（自主）

- agent 基于 issue 内容自主推导，不发起交互提问
- 输出 design doc，保存至 `docs/superpowers/specs/YYYY-MM-DD-{slug}-design.md`
- 通过 Hermes 将 design doc 路径/内容推送给用户

### Pause 机制

- agent 发送 design doc 后阻塞等待 Hermes 回复
- 用户回复 `approve`：继续执行
- 用户回复修改意见：agent 更新 design doc 后再次推送，重新等待确认

### 执行阶段

- 使用 `superpowers:using-git-worktrees` 在隔离 worktree 中开发
- 分支命名：`autodev/{issue-number}-{kebab-slug}`
- 执行 writing-plans → executing-plans

---

## PR 规范

### 标题格式

遵循仓库 commit 规范：

```
feat(tag): add Tag component
fix(popover): fix focus trap on close
feat(icons): add ChevronDown, StarFilled icons
```

### PR Body

```markdown
## 关联 Issue

Closes #{issue_number}

## 变更内容

{agent 自动填写}

## Checklist

- [ ] vp check 通过
- [ ] vp test 通过
- [ ] Storybook story 已添加
- [ ] website demo 已更新
- [ ] design doc 已 commit（见 docs/superpowers/specs/）
```

---

## 后续演进

当用户对 agent 输出质量建立信任后，可将 pause 机制移除，切换为全自动模式（B 方案）：brainstorming 结果直接进入 writing-plans，无需人工确认，design doc 随 PR 一起提交供 review。
