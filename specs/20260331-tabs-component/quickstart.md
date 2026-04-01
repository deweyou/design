# 快速上手：Tabs 组件

**分支**：`20260331-tabs-component` | **日期**：2026-03-31  
**语言要求**：正文使用简体中文；代码标识符、命令、路径可保留原文。

---

## 安装前提

```bash
# 确保已安装依赖
vp install
```

---

## 基础用法

### 横排 Tabs（`line` 变体，默认）

```tsx
import { Tabs, TabList, TabTrigger, TabContent } from '@deweyou-ui/components';

<Tabs defaultValue="overview">
  <TabList>
    <TabTrigger value="overview">概览</TabTrigger>
    <TabTrigger value="settings">设置</TabTrigger>
    <TabTrigger value="history">历史</TabTrigger>
  </TabList>
  <TabContent value="overview">概览内容</TabContent>
  <TabContent value="settings">设置内容</TabContent>
  <TabContent value="history">历史内容</TabContent>
</Tabs>;
```

---

### 竖排 Tabs

```tsx
<Tabs orientation="vertical" defaultValue="profile">
  <TabList>
    <TabTrigger value="profile">个人资料</TabTrigger>
    <TabTrigger value="security">安全</TabTrigger>
  </TabList>
  <TabContent value="profile">个人资料内容</TabContent>
  <TabContent value="security">安全内容</TabContent>
</Tabs>
```

---

### `bg` 变体

```tsx
<Tabs variant="bg" defaultValue="all">
  <TabList>
    <TabTrigger value="all">全部</TabTrigger>
    <TabTrigger value="active">活跃</TabTrigger>
    <TabTrigger value="closed">已关闭</TabTrigger>
  </TabList>
  <TabContent value="all">…</TabContent>
  <TabContent value="active">…</TabContent>
  <TabContent value="closed">…</TabContent>
</Tabs>
```

---

### 受控模式

```tsx
const [activeTab, setActiveTab] = useState('tab1');

<Tabs value={activeTab} onValueChange={({ value }) => setActiveTab(value)}>
  <TabList>
    <TabTrigger value="tab1">标签一</TabTrigger>
    <TabTrigger value="tab2">标签二</TabTrigger>
  </TabList>
  <TabContent value="tab1">内容一</TabContent>
  <TabContent value="tab2">内容二</TabContent>
</Tabs>;
```

---

### 仅标签栏（配合路由）

```tsx
// 不渲染 TabContent，通过 onValueChange 驱动路由跳转
<Tabs hideContent value={currentRoute} onValueChange={({ value }) => router.push(`/${value}`)}>
  <TabList>
    <TabTrigger value="home">首页</TabTrigger>
    <TabTrigger value="docs">文档</TabTrigger>
    <TabTrigger value="about">关于</TabTrigger>
  </TabList>
</Tabs>
```

---

### Tab 下拉菜单

```tsx
<Tabs defaultValue="typescript">
  <TabList>
    <TabTrigger value="javascript">JavaScript</TabTrigger>
    <TabTrigger
      value="typescript"
      menuItems={[
        { value: 'typescript', label: 'TypeScript' },
        { value: 'tsx', label: 'TSX / React' },
        { value: 'dts', label: '类型声明文件' },
      ]}
    >
      TypeScript ▾
    </TabTrigger>
  </TabList>
  <TabContent value="javascript">JS 内容</TabContent>
  <TabContent value="typescript">TS 内容</TabContent>
  <TabContent value="tsx">TSX 内容</TabContent>
  <TabContent value="dts">DTS 内容</TabContent>
</Tabs>
```

---

### 超长滚动（默认行为，自动渐变遮罩）

```tsx
// overflowMode 默认为 "scroll"，无需额外配置
<Tabs defaultValue="t1">
  <TabList>
    {Array.from({ length: 20 }, (_, i) => (
      <TabTrigger key={i} value={`t${i + 1}`}>
        标签 {i + 1}
      </TabTrigger>
    ))}
  </TabList>
  {Array.from({ length: 20 }, (_, i) => (
    <TabContent key={i} value={`t${i + 1}`}>
      内容 {i + 1}
    </TabContent>
  ))}
</Tabs>
```

---

### 超长收齐

```tsx
<Tabs defaultValue="t1" overflowMode="collapse">
  <TabList>
    {Array.from({ length: 20 }, (_, i) => (
      <TabTrigger key={i} value={`t${i + 1}`}>
        标签 {i + 1}
      </TabTrigger>
    ))}
  </TabList>
  …
</Tabs>
```

---

## Props 速查

| Prop             | 类型                             | 默认值         | 说明               |
| ---------------- | -------------------------------- | -------------- | ------------------ |
| `value`          | `string`                         | —              | 受控激活值         |
| `defaultValue`   | `string`                         | —              | 非受控默认激活值   |
| `onValueChange`  | `(details) => void`              | —              | 切换回调           |
| `orientation`    | `'horizontal' \| 'vertical'`     | `'horizontal'` | 排列方向           |
| `variant`        | `'line' \| 'bg'`                 | `'line'`       | 激活样式           |
| `color`          | `'neutral' \| 'primary'`         | `'neutral'`    | 语义色             |
| `size`           | `'small' \| 'medium' \| 'large'` | `'medium'`     | 尺寸               |
| `overflowMode`   | `'scroll' \| 'collapse'`         | `'scroll'`     | 超长策略           |
| `hideContent`    | `boolean`                        | `false`        | 仅标签栏模式       |
| `activationMode` | `'automatic' \| 'manual'`        | `'automatic'`  | 键盘激活模式       |
| `loopFocus`      | `boolean`                        | `true`         | 键盘导航首尾循环   |
| `lazyMount`      | `boolean`                        | `false`        | 内容面板懒挂载     |
| `unmountOnExit`  | `boolean`                        | `false`        | 非激活内容面板卸载 |

---

## 开发与验证命令

```bash
# 类型检查 + lint + 格式化
vp check

# 运行 Tabs 相关单测
vp test

# 启动 website 预览站
vp run website#dev
```

---

## 参考实现

- `packages/components/src/popover/index.tsx` —— Ark UI 行为基础层范式参考
- `packages/components/src/menu/index.tsx` —— Menu 组件（Tab 下拉菜单复用）
