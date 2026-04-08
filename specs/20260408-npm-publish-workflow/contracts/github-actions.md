# 契约：GitHub Actions Release 工作流输入

**功能**：`20260408-npm-publish-workflow`

---

## 工作流触发

### 手动触发（`workflow_dispatch`）

```yaml
inputs:
  channel:
    description: '发布通道'
    required: true
    type: choice
    options:
      - beta
      - stable
  dry_run:
    description: '预演模式（不实际发布）'
    required: false
    type: boolean
    default: false
```

### 分支约束

| 触发分支 | 允许 channel                      |
| -------- | --------------------------------- |
| `main`   | `stable` 或 `beta`（manual only） |
| 任意分支 | `beta`                            |

工作流内部调用 `scripts/release.sh <channel>`，分支校验在脚本层执行。

---

## 必需 Secrets

| Secret 名称 | 说明                                                 |
| ----------- | ---------------------------------------------------- |
| `NPM_TOKEN` | npm 自动化 token，需在仓库 Settings → Secrets 中配置 |

---

## 工作流输出（job summary）

发布完成后写入 GitHub Actions job summary，格式与 `release.sh` 标准输出一致。
