import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vite-plus/test';

import { ScrollArea, scrollAreaColorOptions } from './index';

const stylesheet = readFileSync(resolve(import.meta.dirname, 'index.module.less'), 'utf8');

// UT-P-01: 默认 props 渲染输出包含正确 data-color
test('renders with default color="primary" data attribute', () => {
  const html = renderToStaticMarkup(
    <ScrollArea>
      <p>内容</p>
    </ScrollArea>,
  );
  expect(html).toContain('data-color="primary"');
});

// UT-P-02a: color="primary" 渲染 data-color="primary"
test('renders data-color="primary" when color prop is "primary"', () => {
  const html = renderToStaticMarkup(
    <ScrollArea color="primary">
      <p>内容</p>
    </ScrollArea>,
  );
  expect(html).toContain('data-color="primary"');
});

// UT-P-02b: color="neutral" 渲染 data-color="neutral"
test('renders data-color="neutral" when color prop is "neutral"', () => {
  const html = renderToStaticMarkup(
    <ScrollArea color="neutral">
      <p>内容</p>
    </ScrollArea>,
  );
  expect(html).toContain('data-color="neutral"');
});

// UT-P-02c: 所有文档化 color 值都在 scrollAreaColorOptions 中
test('scrollAreaColorOptions covers all documented color values', () => {
  expect(scrollAreaColorOptions).toContain('primary');
  expect(scrollAreaColorOptions).toContain('neutral');
  expect(scrollAreaColorOptions).toHaveLength(2);
});

// UT-P-02d: horizontal=false（默认）时不渲染水平 Scrollbar
// Ark UI 在 Scrollbar wrapper 和 Thumb 两个元素上均写入 data-orientation，每个方向 2 个
test('does not render horizontal scrollbar when horizontal is false', () => {
  const html = renderToStaticMarkup(
    <ScrollArea horizontal={false}>
      <p>内容</p>
    </ScrollArea>,
  );
  expect(html).not.toContain('data-orientation="horizontal"');
  expect(html).toContain('data-orientation="vertical"');
});

// UT-P-02e: horizontal=true 时渲染水平和垂直两个 Scrollbar
test('renders both horizontal and vertical scrollbar when horizontal is true', () => {
  const html = renderToStaticMarkup(
    <ScrollArea horizontal>
      <p>内容</p>
    </ScrollArea>,
  );
  expect(html).toContain('data-orientation="vertical"');
  expect(html).toContain('data-orientation="horizontal"');
});

// UT-P-03: CSS 模块使用语义 token（--ui-color-*），不使用原始 palette token
test('CSS module references semantic tokens, not raw palette values', () => {
  // 不应出现 palette 原始值如 emerald-700、neutral-950 等
  expect(stylesheet).not.toMatch(/emerald-\d{3}/);
  expect(stylesheet).not.toMatch(/neutral-\d{3}/);
  expect(stylesheet).not.toMatch(/slate-\d{3}/);
  // primary 色档应使用品牌 token
  expect(stylesheet).toContain('--ui-color-brand-bg');
  // neutral 色档使用 currentColor，随父容器 color 自动反转，不硬编码具体 token
  expect(stylesheet).toContain('currentColor');
  // corner 背景使用画布 token
  expect(stylesheet).toContain('--ui-color-canvas');
});

// UT-P-04: CSS 模块包含必要的视觉状态 class 和过渡规则
test('CSS module contains required visual state classes', () => {
  expect(stylesheet).toContain('.root');
  expect(stylesheet).toContain('.viewport');
  expect(stylesheet).toContain('.scrollbar');
  expect(stylesheet).toContain('.thumb');
  expect(stylesheet).toContain('.corner');
  // 过渡值：宪章原则 VII 强制 140ms ease
  expect(stylesheet).toContain('140ms ease');
  // 原生滚动条隐藏
  expect(stylesheet).toContain('scrollbar-width: none');
  expect(stylesheet).toContain('::-webkit-scrollbar');
  // prefers-reduced-motion 降级
  expect(stylesheet).toContain('prefers-reduced-motion');
  // display:grid 解决水平滚动时 root 无显式高度导致 viewport 坍缩为 0 的问题
  expect(stylesheet).toContain('display: grid');
});

// UT-P-05: autoHide=false（默认）时不渲染 data-auto-hide 属性
test('does not render data-auto-hide when autoHide is false', () => {
  const html = renderToStaticMarkup(
    <ScrollArea>
      <p>内容</p>
    </ScrollArea>,
  );
  expect(html).not.toContain('data-auto-hide');
});

// UT-P-06: autoHide=true 时渲染 data-auto-hide 属性
test('renders data-auto-hide attribute when autoHide is true', () => {
  const html = renderToStaticMarkup(
    <ScrollArea autoHide>
      <p>内容</p>
    </ScrollArea>,
  );
  expect(html).toContain('data-auto-hide');
});

// UT-P-07: CSS 模块包含 autoHide 相关规则
test('CSS module contains auto-hide rules', () => {
  // data-auto-hide 选择器用于覆盖闲置透明度
  expect(stylesheet).toContain('data-auto-hide');
  // --scroll-area-hide-delay 控制淡出延迟
  expect(stylesheet).toContain('--scroll-area-hide-delay');
  // :not([data-hover]) 用于检测鼠标离开整个 root 的状态
  expect(stylesheet).toContain(':not([data-hover])');
});
