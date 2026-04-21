# Hermes + GitHub App 配置指南

本文档说明如何将 GitHub App、Hermes 和本仓库的 autodev 脚本串联起来，实现 issue 打上 `autodev` label 后自动触发 Claude agent 开发流程。

## 前置条件

- Hermes 在本机运行中
- `gh` CLI 已安装并登录（`gh auth status` 确认）
- 仓库根目录：`/path/to/deweyou-design`（以实际路径为准）

## 1. 创建 GitHub App

前往 GitHub Settings → Developer settings → GitHub Apps → New GitHub App：

| 配置项         | 值                                           |
| -------------- | -------------------------------------------- |
| App name       | `deweyou-autodev`（或任意名称）              |
| Homepage URL   | 任意（如仓库 URL）                           |
| Webhook URL    | Hermes 的 webhook 接收地址（见 Hermes 文档） |
| Webhook secret | 生成随机字符串，同时填入 Hermes 配置         |

**Repository permissions：**

- Issues: `Read-only`
- Pull requests: `Read and write`
- Contents: `Read and write`

**Subscribe to events：** 勾选 `Issues`

创建后，在 App 设置页面生成 Private Key（`.pem` 文件），记录 **App ID**。

将 App 安装到 `deweyou-design` 仓库（App 设置 → Install App）。

## 2. 配置 Hermes

在 Hermes 中填入以下信息（字段名以 Hermes 实际 UI 为准）：

```
GitHub App ID:      <步骤 1 中的 App ID>
GitHub App Key:     <Private Key .pem 文件路径>
Webhook Secret:     <步骤 1 中设置的 secret>
```

## 3. 配置 Issue 事件处理器

在 Hermes 中新建一个处理器：

**触发条件：**

```
事件类型：issues
过滤条件：action == "labeled" AND label.name == "autodev"
```

**处理动作（以 Hermes 实际配置方式为准）：**

1. 将 webhook payload 通过 stdin 传给脚本：
   ```
   bash /path/to/deweyou-design/.github/autodev/parse-issue.sh
   ```
2. 将脚本输出（组装好的系统提示词）作为初始 prompt 启动 claude 会话：
   ```
   claude --model claude-opus-4-6
   ```
3. 会话工作目录设置为仓库根目录：
   ```
   /path/to/deweyou-design
   ```

## 4. Labels 配置

确保仓库中存在以下 labels（GitHub 会在 issue template 首次使用时自动创建，也可手动创建）：

| Label       | 用途                     |
| ----------- | ------------------------ |
| `autodev`   | 触发 Hermes autodev 流程 |
| `component` | 新增组件类 issue         |
| `icon`      | 新增 icon 类 issue       |
| `bugfix`    | Bug 修复类 issue         |
| `enhance`   | 组件能力扩展类 issue     |

## 5. 验证流程

1. 在仓库创建一个测试 issue，使用"新增组件"模板
2. 给该 issue 打上 `autodev` label
3. 在 Hermes 日志中确认 webhook 已收到
4. 在 Hermes 对话界面中看到 agent 输出的 design doc 摘要（含 📋 emoji）
5. 回复 `approve`，观察 agent 继续执行

**本地快速测试脚本（无需 Hermes）：**

```bash
# 测试 parse-issue.sh 的输出是否正确
cat <<'EOF' | bash .github/autodev/parse-issue.sh
{
  "action": "labeled",
  "label": { "name": "autodev" },
  "issue": {
    "number": 1,
    "title": "新增 Tag 组件",
    "body": "### 组件名称\nTag\n\n### 使用场景描述\n用于内容分类",
    "labels": [{"name": "autodev"}, {"name": "component"}]
  }
}
EOF
```

## 6. 切换全自动模式（B 方案）

当你对 agent 输出质量建立信任后，修改 `.github/autodev/system-prompt.md` 中的阶段二说明，将等待确认逻辑改为直接进入阶段三。Design doc 会随 PR 一起提交供 review。
