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
