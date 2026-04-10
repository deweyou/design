import React, { useRef } from 'react';
import { Button, ScrollArea, type ScrollAreaRef } from '@deweyou-design/react';

const LONG_TEXT = `宋体是中文排版的经典字体，由于其独特的笔画风格和良好的可读性，长期以来被广泛应用于书籍、报纸和各类正式文件中。宋体字形端庄，笔画有粗有细，横细竖粗，并在横画末端有向上的小斜角（称为衬线），使文字在长篇阅读时不易产生视觉疲劳。在数字排版时代，宋体依然保持着重要地位，许多高质量的设计方案都将宋体作为正文字体的首选。宋体的衬线设计有助于引导视线沿行方向移动，从而提升阅读流畅度。此外，宋体与其他字体的搭配也十分灵活，既可以与无衬线字体形成对比，也可以与楷体、仿宋等传统字体和谐共存。在现代网页设计中，随着高分辨率屏幕的普及，宋体在屏幕上的渲染质量也有了显著提升，使其成为兼顾传统美感与现代可读性的理想选择。`;

const WIDE_TEXT = `水平滚动内容 · Horizontal scroll content · 一二三四五六七八九十 · ABCDEFGHIJKLMNOPQRSTUVWXYZ · 0123456789 · ！@#￥%……&*（）— · 这是一段非常长的横向内容，用于测试水平方向的滚动条是否正常显示和工作。滚动条应当叠层显示在内容上方，不占用布局空间。`;

const previewBoxStyle: React.CSSProperties = {
  border: '1px solid var(--ui-color-border)',
  borderRadius: '0.4rem',
  overflow: 'hidden',
};

const darkBoxStyle: React.CSSProperties = {
  ...previewBoxStyle,
  background: 'var(--ui-color-text)',
  color: 'var(--ui-color-canvas)',
};

const ProgrammaticDemo = () => {
  const scrollRef = useRef<ScrollAreaRef>(null);
  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <Button
          size="small"
          variant="outlined"
          onClick={() => scrollRef.current?.scrollToEdge({ edge: 'top' })}
        >
          滚动到顶部
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={() => scrollRef.current?.scrollToEdge({ edge: 'bottom' })}
        >
          滚动到底部
        </Button>
      </div>
      <div style={previewBoxStyle}>
        <ScrollArea ref={scrollRef} style={{ height: 160 }}>
          <div style={{ padding: '1rem' }}>
            <p>{LONG_TEXT}</p>
            <p>{LONG_TEXT}</p>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export const ScrollAreaGuidance = () => (
  <section className="component-section">
    <h2>ScrollArea</h2>
    <p>
      叠层滚动区域——自定义滚动条浮于内容上方，不占用布局空间。溢出时自动显示，无溢出时自动隐藏。
    </p>

    {/* 垂直滚动 · primary（默认） */}
    <h3>垂直滚动 · primary</h3>
    <div style={previewBoxStyle}>
      <ScrollArea style={{ height: 160 }}>
        <div style={{ padding: '1rem' }}>
          <p>{LONG_TEXT}</p>
        </div>
      </ScrollArea>
    </div>

    {/* 垂直滚动 · neutral */}
    <h3>垂直滚动 · neutral（随主题自动反转）</h3>
    <div style={previewBoxStyle}>
      <ScrollArea color="neutral" style={{ height: 160 }}>
        <div style={{ padding: '1rem' }}>
          <p>{LONG_TEXT}</p>
        </div>
      </ScrollArea>
    </div>

    {/* neutral 在深色背景下 */}
    <h3>neutral · 深色容器场景</h3>
    <div style={darkBoxStyle}>
      <ScrollArea color="neutral" style={{ height: 160 }}>
        <div style={{ padding: '1rem', color: 'var(--ui-color-canvas)' }}>
          <p>{LONG_TEXT}</p>
        </div>
      </ScrollArea>
    </div>

    {/* 内容不溢出时滚动条隐藏 */}
    <h3>内容不溢出时滚动条隐藏</h3>
    <div style={previewBoxStyle}>
      <ScrollArea style={{ height: 160 }}>
        <div style={{ padding: '1rem' }}>
          <p>内容很短，不会溢出。滚动条此时不可见。</p>
        </div>
      </ScrollArea>
    </div>

    {/* 水平滚动 */}
    <h3>水平滚动</h3>
    <div style={previewBoxStyle}>
      <ScrollArea horizontal style={{ width: '100%' }}>
        <div style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
          <p>{WIDE_TEXT}</p>
        </div>
      </ScrollArea>
    </div>

    {/* 双向滚动 */}
    <h3>双向滚动（垂直 + 水平）</h3>
    <div style={previewBoxStyle}>
      <ScrollArea horizontal style={{ height: 180, width: '100%' }}>
        <div style={{ padding: '1rem', width: 1200 }}>
          <p>{LONG_TEXT}</p>
          <p>{LONG_TEXT}</p>
        </div>
      </ScrollArea>
    </div>

    {/* 程序式滚动控制 */}
    <h3>程序式滚动控制（ref.scrollToEdge）</h3>
    <ProgrammaticDemo />
  </section>
);
