import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vite-plus/test';

import { Text, textColorFamilyOptions, type TextProps } from './index';
import styles from './index.module.less';

const stylesheet = readFileSync(resolve(import.meta.dirname, 'index.module.less'), 'utf8');

void stylesheet;

const renderSurface = (props: TextProps) => {
  return Text(props) as {
    props: Record<string, unknown>;
    type: string;
  };
};

test('text defaults to the plain variant on a span root', () => {
  const surface = renderSurface({
    children: '默认正文',
  });
  const markup = renderToStaticMarkup(createElement(Text, null, '默认正文'));

  expect(surface.type).toBe('span');
  expect(String(surface.props.className)).toContain(styles.plain);
  expect(markup).toContain('默认正文');
});

test('body and caption render on div roots with their documented classes', () => {
  const bodySurface = renderSurface({
    children: '块级正文',
    variant: 'body',
  });
  const captionSurface = renderSurface({
    children: '说明文字',
    variant: 'caption',
  });

  expect(bodySurface.type).toBe('div');
  expect(String(bodySurface.props.className)).toContain(styles.body);
  expect(captionSurface.type).toBe('div');
  expect(String(captionSurface.props.className)).toContain(styles.caption);
});

test('heading variants render on native heading roots with distinct variant classes', () => {
  const variants = ['h1', 'h2', 'h3', 'h4', 'h5'] as const;

  for (const variant of variants) {
    const surface = renderSurface({
      children: `${variant} heading`,
      variant,
    });
    const markup = renderToStaticMarkup(createElement(Text, { variant }, `${variant} heading`));

    expect(surface.type).toBe(variant);
    expect(String(surface.props.className)).toContain(styles[variant]);
    expect(markup.startsWith(`<${variant}`)).toBe(true);
  }

  expect(stylesheet).toContain('margin-block-start');
  expect(stylesheet).toContain('margin-block-end');
});

test('text supports composable italic, bold, underline, and strikethrough styles', () => {
  const surface = renderSurface({
    bold: true,
    children: '组合样式',
    italic: true,
    strikethrough: true,
    underline: true,
  });
  const style = surface.props.style as Record<string, unknown>;

  expect(String(surface.props.className)).toContain(styles.bold);
  expect(String(surface.props.className)).toContain(styles.italic);
  expect(String(surface.props.className)).toContain(styles.underline);
  expect(String(surface.props.className)).toContain(styles.strikethrough);
  expect(style.textDecorationLine).toBe('underline line-through');
});

test('text supports palette-backed color and background props without arbitrary values', () => {
  const surface = renderSurface({
    background: 'amber',
    bold: true,
    children: '重点高亮',
    color: 'violet',
    variant: 'body',
  });
  const style = surface.props.style as Record<string, unknown>;

  expect(textColorFamilyOptions).toHaveLength(26);
  expect(String(surface.props.className)).toContain(styles.highlighted);
  expect(style['--text-color-current']).toBe('var(--ui-text-color-violet)');
  expect(style['--text-background-current']).toBe('var(--ui-text-background-amber)');
  expect(String(surface.props.className)).toContain(styles.bold);
});

test('text applies lineClamp only for positive integers', () => {
  const clampedSurface = renderSurface({
    children: '需要截断的超长文本',
    lineClamp: 3,
  });
  const unclampedSurface = renderSurface({
    children: '无效行数',
    lineClamp: 0,
  });
  const clampedStyle = clampedSurface.props.style as Record<string, unknown>;
  const unclampedStyle = unclampedSurface.props.style as Record<string, unknown>;

  expect(String(clampedSurface.props.className)).toContain(styles.clamped);
  expect(clampedStyle.WebkitLineClamp).toBe(3);
  expect(clampedStyle['--text-line-clamp']).toBe(3);
  expect(String(unclampedSurface.props.className)).not.toContain(styles.clamped);
  expect(unclampedStyle.WebkitLineClamp).toBeUndefined();
  expect(unclampedStyle['--text-line-clamp']).toBeUndefined();
  expect(stylesheet).toContain('-webkit-box-orient');
  expect(stylesheet).toContain('max-block-size');
});

test('text forwards standard node props to the rendered root node', () => {
  let clickCount = 0;
  const surface = renderSurface({
    'aria-label': '章节标题',
    children: '章节标题',
    className: 'consumer-text',
    'data-slot': 'help-copy',
    id: 'text-prop-sample',
    onClick: () => {
      clickCount += 1;
    },
    tabIndex: 0,
    title: 'prop passthrough',
    variant: 'h2',
  });

  expect(surface.type).toBe('h2');
  expect(surface.props.id).toBe('text-prop-sample');
  expect(surface.props['aria-label']).toBe('章节标题');
  expect(surface.props['data-slot']).toBe('help-copy');
  expect(surface.props.tabIndex).toBe(0);
  expect(surface.props.title).toBe('prop passthrough');
  expect(String(surface.props.className)).toContain('consumer-text');

  (surface.props.onClick as () => void)();

  expect(clickCount).toBe(1);
});
