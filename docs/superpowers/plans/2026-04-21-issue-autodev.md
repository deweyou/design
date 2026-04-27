# Issue AutoDev 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 当 GitHub Issue 打上 `autodev` label 时，Hermes 自动启动 Claude agent，完成 brainstorm → 等待用户确认 → 实现 → 提 PR 的全流程。

**Architecture:** 仓库侧提供四个 issue 模板、一份 agent 系统提示词文件和一个 Hermes 调用脚本；Hermes 作为 GitHub App 的 webhook handler，收到 issue labeled 事件后调用脚本组装 prompt，启动 claude 会话；agent 在 brainstorming 结束后主动输出 design doc 摘要并等待用户通过 Hermes 回复确认，之后继续执行实现流程。

**Tech Stack:** GitHub Issue Forms (YAML)、Bash、GitHub CLI (`gh`)、Claude Code CLI (`claude`)、Hermes（本地 GitHub App webhook handler）

---

## 文件结构

| 文件                                           | 操作 | 职责                                                    |
| ---------------------------------------------- | ---- | ------------------------------------------------------- |
| `.github/ISSUE_TEMPLATE/new-component.yml`     | 新建 | 新增组件的结构化 issue 模板                             |
| `.github/ISSUE_TEMPLATE/new-icon.yml`          | 新建 | 新增 icon 的结构化 issue 模板                           |
| `.github/ISSUE_TEMPLATE/bugfix.yml`            | 新建 | Bug 修复的结构化 issue 模板                             |
| `.github/ISSUE_TEMPLATE/enhance-component.yml` | 新建 | 组件能力扩展的结构化 issue 模板                         |
| `.github/autodev/system-prompt.md`             | 新建 | Agent 系统提示词，Hermes 组装 prompt 时注入             |
| `.github/autodev/parse-issue.sh`               | 新建 | Hermes 调用的脚本，解析 issue payload → 输出最终 prompt |
| `docs/superpowers/plans/hermes-setup.md`       | 新建 | Hermes + GitHub App 配置指南                            |

---

## Task 1：GitHub Issue Templates

**Files:**

- Create: `.github/ISSUE_TEMPLATE/new-component.yml`
- Create: `.github/ISSUE_TEMPLATE/new-icon.yml`
- Create: `.github/ISSUE_TEMPLATE/bugfix.yml`
- Create: `.github/ISSUE_TEMPLATE/enhance-component.yml`

- [ ] **Step 1：创建 `.github/ISSUE_TEMPLATE/` 目录**

```bash
mkdir -p .github/ISSUE_TEMPLATE
```

- [ ] **Step 2：创建新增组件模板**

创建 `.github/ISSUE_TEMPLATE/new-component.yml`：

```yaml
name: 新增组件
description: 新增一个 React UI 组件
labels: ['autodev', 'component']
body:
  - type: input
    id: name
    attributes:
      label: 组件名称
      placeholder: 'e.g. Tag, Badge, Tooltip'
    validations:
      required: true
  - type: textarea
    id: variants
    attributes:
      label: 需要的 variant / size / color
      placeholder: 'e.g. filled/outlined, small/medium/large, neutral/primary/danger'
    validations:
      required: true
  - type: textarea
    id: usage
    attributes:
      label: 使用场景描述
      placeholder: '这个组件在哪里用、解决什么问题'
    validations:
      required: true
  - type: textarea
    id: api_hints
    attributes:
      label: API 提示（可选）
      placeholder: 'e.g. 需要 closable prop, 支持 icon slot'
    validations:
      required: false
  - type: input
    id: ref
    attributes:
      label: 参考（可选）
      placeholder: '设计稿链接或截图说明'
    validations:
      required: false
```

- [ ] **Step 3：创建新增 Icon 模板**

创建 `.github/ISSUE_TEMPLATE/new-icon.yml`：

```yaml
name: 新增 Icon
description: 新增一个或多个 SVG 图标
labels: ['autodev', 'icon']
body:
  - type: input
    id: name
    attributes:
      label: Icon 名称
      placeholder: 'e.g. ChevronDown, StarFilled（多个用逗号分隔）'
    validations:
      required: true
  - type: input
    id: category
    attributes:
      label: 分类
      placeholder: 'e.g. navigation, action, status'
    validations:
      required: true
  - type: textarea
    id: usage
    attributes:
      label: 使用场景
      placeholder: '在哪个组件或页面用'
    validations:
      required: true
  - type: textarea
    id: source
    attributes:
      label: SVG 来源（可选）
      placeholder: '粘贴 SVG 代码，或描述图形形态'
    validations:
      required: false
```

- [ ] **Step 4：创建 Bug 修复模板**

创建 `.github/ISSUE_TEMPLATE/bugfix.yml`：

```yaml
name: Bug 修复
description: 报告现有组件的问题
labels: ['autodev', 'bugfix']
body:
  - type: input
    id: component
    attributes:
      label: 涉及组件
      placeholder: 'e.g. Button, Popover'
    validations:
      required: true
  - type: textarea
    id: description
    attributes:
      label: 问题描述
      placeholder: '现在的行为是什么，期望的行为是什么'
    validations:
      required: true
  - type: textarea
    id: reproduce
    attributes:
      label: 复现步骤
      placeholder: "1. ...\n2. ...\n3. ..."
    validations:
      required: true
  - type: textarea
    id: context
    attributes:
      label: 附加上下文（可选）
      placeholder: '截图、报错信息、浏览器版本'
    validations:
      required: false
```

- [ ] **Step 5：创建组件能力扩展模板**

创建 `.github/ISSUE_TEMPLATE/enhance-component.yml`：

```yaml
name: 组件能力扩展
description: 为现有组件新增功能或 prop
labels: ['autodev', 'enhance']
body:
  - type: input
    id: component
    attributes:
      label: 目标组件
      placeholder: 'e.g. Button, Input'
    validations:
      required: true
  - type: textarea
    id: capability
    attributes:
      label: 新增能力描述
      placeholder: '要加什么，解决什么问题'
    validations:
      required: true
  - type: textarea
    id: api_hints
    attributes:
      label: API 变更提示（可选）
      placeholder: 'e.g. 新增 prefix slot，loading 支持自定义图标'
    validations:
      required: false
  - type: dropdown
    id: breaking
    attributes:
      label: 是否可能有破坏性变更
      options:
        - 不确定
        - 否
        - 是
    validations:
      required: true
```

- [ ] **Step 6：验证 YAML 格式正确**

```bash
# 需要 yq（brew install yq）
yq eval '.' .github/ISSUE_TEMPLATE/new-component.yml > /dev/null && echo "OK"
yq eval '.' .github/ISSUE_TEMPLATE/new-icon.yml > /dev/null && echo "OK"
yq eval '.' .github/ISSUE_TEMPLATE/bugfix.yml > /dev/null && echo "OK"
yq eval '.' .github/ISSUE_TEMPLATE/enhance-component.yml > /dev/null && echo "OK"
```

预期输出：四行 `OK`

- [ ] **Step 7：提交**

```bash
git add .github/ISSUE_TEMPLATE/
git commit -m "feat: add issue templates for autodev workflow"
```

---

## Task 2：Agent 系统提示词

**Files:**

- Create: `.github/autodev/system-prompt.md`

- [ ] **Step 1：创建目录**

```bash
mkdir -p .github/autodev
```

- [ ] **Step 2：创建系统提示词文件**

创建 `.github/autodev/system-prompt.md`：

````markdown
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

1. 阅读 `CLAUDE.md` 和 `docs/constitution.md` 了解项目规范
2. 基于 issue 内容自主推导设计方案，**不要向用户提问**
3. 生成 design doc，保存到：
   `docs/superpowers/specs/{YYYYMMDD}-{slug}-design.md`
4. 将以下内容输出给用户（让 Hermes 转发）：

```
📋 Design doc 已生成：docs/superpowers/specs/{filename}

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

- 收到 `approve`：进入阶段三
- 收到修改意见：更新 design doc，重新输出摘要，再次等待

### 阶段三：实现

1. 调用 `superpowers:using-git-worktrees` 创建隔离 worktree
   - 分支命名：`autodev/{ISSUE_NUMBER}-{slug}`
2. 调用 `superpowers:writing-plans` 基于 design doc 生成实现计划
3. 调用 `superpowers:subagent-driven-development` 执行计划

### 阶段四：提 PR

完成实现后，使用 `gh pr create` 提交 PR：

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
````

- [ ] **Step 3：提交**

```bash
git add .github/autodev/system-prompt.md
git commit -m "feat: add agent system prompt for autodev"
```

---

## Task 3：Hermes 调用脚本

**Files:**

- Create: `.github/autodev/parse-issue.sh`

- [ ] **Step 1：确认 `jq` 可用**

```bash
jq --version
```

预期输出：`jq-1.x`（如未安装：`brew install jq`）

- [ ] **Step 2：创建解析脚本**

创建 `.github/autodev/parse-issue.sh`：

```bash
#!/usr/bin/env bash
# 用途：将 GitHub issue webhook payload 解析为 claude 系统提示词
# 调用方：Hermes（stdin 接收 JSON payload）
# 输出：组装好的 prompt 文本（stdout）
#
# 用法：
#   echo '<github-issue-json>' | bash .github/autodev/parse-issue.sh
#   cat payload.json | bash .github/autodev/parse-issue.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
PROMPT_TEMPLATE="$SCRIPT_DIR/system-prompt.md"

# 从 stdin 读取 JSON payload
PAYLOAD=$(cat)

# 提取字段
ISSUE_NUMBER=$(echo "$PAYLOAD" | jq -r '.issue.number')
ISSUE_TITLE=$(echo "$PAYLOAD" | jq -r '.issue.title')
ISSUE_BODY=$(echo "$PAYLOAD" | jq -r '.issue.body // "(无内容)"')
ISSUE_LABELS=$(echo "$PAYLOAD" | jq -r '[.issue.labels[].name] | join(",")')

# 从 labels 判断 issue 类型
ISSUE_TYPE="unknown"
if echo "$ISSUE_LABELS" | grep -q "component"; then ISSUE_TYPE="component"
elif echo "$ISSUE_LABELS" | grep -q "icon"; then ISSUE_TYPE="icon"
elif echo "$ISSUE_LABELS" | grep -q "bugfix"; then ISSUE_TYPE="bugfix"
elif echo "$ISSUE_LABELS" | grep -q "enhance"; then ISSUE_TYPE="enhance"
fi

YYYYMMDD=$(date +%Y%m%d)

# 将模板中的占位符替换为实际值
# 使用 perl 避免 sed 在 macOS/Linux 上的换行符差异
perl -pe "
  s|\{REPO_DIR\}|$REPO_DIR|g;
  s|\{ISSUE_NUMBER\}|$ISSUE_NUMBER|g;
  s|\{ISSUE_TYPE\}|$ISSUE_TYPE|g;
  s|\{ISSUE_TITLE\}|$ISSUE_TITLE|g;
  s|\{YYYYMMDD\}|$YYYYMMDD|g;
" "$PROMPT_TEMPLATE" | perl -0pe "s|\{ISSUE_BODY\}|$ISSUE_BODY|g"
```

- [ ] **Step 3：添加执行权限**

```bash
chmod +x .github/autodev/parse-issue.sh
```

- [ ] **Step 4：用 mock payload 测试脚本**

```bash
cat <<'EOF' | bash .github/autodev/parse-issue.sh
{
  "action": "labeled",
  "label": { "name": "autodev" },
  "issue": {
    "number": 42,
    "title": "新增 Tag 组件",
    "body": "### 组件名称\nTag\n\n### 需要的 variant / size / color\nfilled/outlined, small/medium/large, neutral/primary/danger\n\n### 使用场景描述\n用于内容分类标注",
    "labels": [
      { "name": "autodev" },
      { "name": "component" }
    ]
  }
}
EOF
```

预期输出：完整的系统提示词，其中 `{ISSUE_NUMBER}` 替换为 `42`，`{ISSUE_TYPE}` 替换为 `component`，`{ISSUE_BODY}` 替换为 issue 正文。

- [ ] **Step 5：提交**

```bash
git add .github/autodev/parse-issue.sh
git commit -m "feat: add hermes parse-issue script"
```

---

## Task 4：Hermes + GitHub App 配置指南

**Files:**

- Create: `docs/superpowers/plans/hermes-setup.md`

- [ ] **Step 1：创建配置指南**

创建 `docs/superpowers/plans/hermes-setup.md`：

```markdown
# Hermes + GitHub App 配置指南

## 1. 创建 GitHub App

前往 GitHub Settings → Developer settings → GitHub Apps → New GitHub App：

- **App name**：`deweyou-autodev`（或任意名称）
- **Webhook URL**：Hermes 的 webhook 接收地址（见 Hermes 文档获取）
- **Webhook secret**：生成一个随机字符串，填入 Hermes 配置
- **Permissions**：
  - Repository permissions → Issues: Read
  - Repository permissions → Pull requests: Write
  - Repository permissions → Contents: Write
- **Subscribe to events**：勾选 `Issues`
- 安装到目标仓库（deweyou-design）

记录生成的 **App ID** 和 **Private Key**，填入 Hermes 配置。

## 2. 配置 Hermes

在 Hermes 中配置以下内容（具体字段名以 Hermes 实际 UI 为准）：
```

GitHub App ID: <上一步的 App ID>
GitHub App Key: <Private Key 文件路径>
Webhook Secret: <上一步设置的 secret>

```

## 3. 配置 Issue 事件处理

在 Hermes 中新建一个处理器，条件：

```

事件类型：issues
过滤条件：action == "labeled" AND label.name == "autodev"

```

处理动作（伪代码，以 Hermes 实际配置方式为准）：

```

command: bash /path/to/repo/.github/autodev/parse-issue.sh
input: <webhook payload JSON>
then: 启动 claude 会话，将上一步输出作为初始 prompt
repo: /path/to/deweyou-design

```

## 4. 验证

1. 在仓库创建一个测试 issue，使用"新增组件"模板填写
2. 给该 issue 打上 `autodev` label
3. 在 Hermes 日志中确认收到 webhook，并看到 claude 会话启动
4. 在 Hermes 对话界面中看到 agent 输出的 design doc 摘要
5. 回复 `approve`，观察 agent 继续执行

## 5. 切换全自动模式（B 方案）

当对 agent 输出建立信任后，修改 `system-prompt.md` 中的阶段二说明：
将"输出摘要并等待用户确认"改为"直接进入阶段三"，同时将 design doc 路径写入 PR body 供 review。
```

- [ ] **Step 2：提交**

```bash
git add docs/superpowers/plans/hermes-setup.md
git commit -m "docs: add hermes github app setup guide"
```

---

## Task 5：端对端冒烟测试

**前置条件**：Hermes 已配置完成（Task 4），GitHub App 已安装到仓库。

- [ ] **Step 1：在 GitHub 创建测试 issue**

使用"新增组件"模板，填写：

- 组件名称：`TestBadge`
- variant/size/color：`filled, small/medium, neutral`
- 使用场景：`用于测试 autodev 流程，实际不合并`

- [ ] **Step 2：打上 `autodev` label**

在 issue 页面添加 `autodev` label，观察 Hermes 日志确认 webhook 收到。

- [ ] **Step 3：确认 agent 启动**

在 Hermes 对话界面看到 agent 输出的 design doc 摘要，格式类似：

```
📋 Design doc 已生成：docs/superpowers/specs/20260421-testbadge-design.md

## 方案摘要
...

请回复 `approve` 确认，或直接给出修改意见。
```

- [ ] **Step 4：回复确认**

在 Hermes 中回复 `approve`，观察 agent 继续执行 writing-plans → executing-plans。

- [ ] **Step 5：确认 PR 创建**

在 GitHub 仓库的 Pull Requests 页面看到新 PR，标题格式正确，body 包含 `Closes #<issue_number>`。

- [ ] **Step 6：关闭测试 PR 和 Issue**

测试 PR 和 Issue 不需要合并，直接关闭即可。

---

## 自审结果

**Spec 覆盖检查：**

- ✅ 整体流程（GitHub App → Hermes → agent → PR）：Task 3、4 覆盖
- ✅ 四个 issue 模板：Task 1 覆盖
- ✅ Agent 系统提示词（自主 brainstorm + pause 机制 + PR 规范）：Task 2 覆盖
- ✅ Hermes 配置：Task 4 覆盖
- ✅ 端对端验证：Task 5 覆盖

**Placeholder 检查：**

- `{REPO_DIR}`, `{ISSUE_NUMBER}` 等占位符是 `parse-issue.sh` 在运行时动态替换的，不是遗漏，符合设计意图。

**类型一致性：**

- `parse-issue.sh` 输出的 prompt 变量名与 `system-prompt.md` 中的占位符完全对应，无命名偏差。
