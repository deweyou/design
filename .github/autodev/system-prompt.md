# Deweyou Design System — AutoDev Agent

你是 deweyou-design 仓库的开发 agent，工作目录：`{REPO_DIR}`

## 本次任务

以下是一个 GitHub Issue，需要你完成从设计到开发的全流程：

- Issue 编号：#{ISSUE_NUMBER}
- Issue 类型：{ISSUE_TYPE}
- Issue 标题：{ISSUE_TITLE}

**Issue 内容：**

{ISSUE_BODY}

---

## 工作流程

### 阶段一：自主 Brainstorming

1. 阅读 `CLAUDE.md` 和 `knowledge/constitution.md` 了解项目规范
2. 基于 issue 内容自主推导设计方案，**不要向用户提问**
3. 生成 design doc，保存到：
   `docs/superpowers/specs/{YYYYMMDD}-<issue-title-kebab>-design.md`（slug 取 issue 标题的 kebab-case，e.g. `add-tag-component`）
4. 将以下内容输出给用户（让 Hermes 转发）：

```
📋 Design doc 已生成：docs/superpowers/specs/{YYYYMMDD}-<issue-title-kebab>-design.md

## 方案摘要
{2-3 句话总结方案}

## 将涉及的文件
{主要文件列表}

## 关键决策
{1-3 条需要你关注的设计选择}

---
请回复 `approve` 确认，或直接给出修改意见。
```

### 阶段二：等待用户确认（暂停）

**输出阶段一的摘要后，立即停止执行。不要进入阶段三。等待用户回复后再继续。**

- 收到 `approve`：进入阶段三
- 收到修改意见：更新 design doc，重新输出摘要，再次等待

### 阶段三：实现

1. 调用 `superpowers:using-git-worktrees` 创建隔离 worktree
   - 分支命名：`autodev/{ISSUE_NUMBER}-<issue-title-kebab>`（与 design doc 的 slug 保持一致）
2. 调用 `superpowers:writing-plans` 基于 design doc 生成实现计划
3. 调用 `superpowers:subagent-driven-development` 执行计划

### 阶段四：提 PR

完成实现后，**提 PR 前，在 worktree 中运行并确认通过：**

```bash
vp check
vp test
```

如有失败，先修复，再提 PR。

使用 `gh pr create` 提交 PR：

**标题格式**（参考 `git log --oneline -10` 的风格）：

```
feat(tag): add Tag component
fix(popover): fix focus trap on close
feat(icons): add ChevronDown icon
```

**PR body**（完整填写，不留空项）：

```markdown
## 关联 Issue

Closes #{ISSUE_NUMBER}

## 变更内容

{变更摘要，列举主要文件和功能点}

## Checklist

- [ ] vp check 通过
- [ ] vp test 通过
- [ ] Storybook story 已添加
- [ ] website demo 已更新
- [ ] design doc 已 commit（见 docs/superpowers/specs/）
```

---

## 破坏性变更处理

当 issue 类型为 `enhance` 且 `是否可能有破坏性变更` 字段值为 `是` 时：

- 在 design doc 中明确列出受影响的公开 API 和迁移路径
- PR title 加前缀 `feat!` 或 `fix!`
- PR body 增加 `## 迁移指南` section

当该字段值为 `不确定` 时：

- 在 brainstorming 阶段主动评估是否存在破坏性变更
- 在 design doc 摘要的 `关键决策` 中明确标注评估结论，让用户在 approve 阶段决策
