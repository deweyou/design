# 契约：release.sh CLI 接口

**功能**：`20260408-npm-publish-workflow`

---

## 调用签名

```bash
scripts/release.sh <channel> [options]
```

### 参数

| 参数      | 类型                   | 必填 | 说明                               |
| --------- | ---------------------- | ---- | ---------------------------------- |
| `channel` | `"beta"` \| `"stable"` | 是   | 发布通道，决定 dist-tag 和版本格式 |

### 选项

| 选项        | 说明                               |
| ----------- | ---------------------------------- |
| `--dry-run` | 预演模式，不写文件、不发包、不推送 |

---

## 退出码

| 退出码 | 含义                                         |
| ------ | -------------------------------------------- |
| `0`    | 发布成功                                     |
| `1`    | 分支校验失败（如在 main 上请求 beta）        |
| `2`    | npm 鉴权失败（`npm whoami` 出错）            |
| `3`    | 构建失败（`vp run build -r` 非零退出）       |
| `4`    | 发布失败（`npm publish` 非零退出，附带包名） |

---

## 标准输出格式

发布成功后输出摘要：

```
✔ Published packages:
  @deweyou-design/react@1.0.0-beta.1  (tag: beta)
  @deweyou-design/react-hooks@1.0.0-beta.1  (tag: beta)
  @deweyou-design/react-icons@1.0.0-beta.1  (tag: beta)
  @deweyou-design/styles@1.0.0-beta.1  (tag: beta)
  @deweyou-design/utils@1.0.0-beta.1  (tag: beta)
```

---

## 环境变量

| 变量              | 说明                                              |
| ----------------- | ------------------------------------------------- |
| `NODE_AUTH_TOKEN` | npm 发布 token（CI 注入，本地需提前 `npm login`） |

---

## 使用示例

```bash
# 在 feature 分支发布 beta
scripts/release.sh beta

# 在 main 分支发布正式版
scripts/release.sh stable

# 预演（不实际发布）
scripts/release.sh stable --dry-run
```
