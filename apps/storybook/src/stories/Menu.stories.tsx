import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Button } from '@deweyou-ui/components/button';
import {
  ContextMenu,
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuTrigger,
  MenuTriggerItem,
} from '@deweyou-ui/components/menu';

const storyStyles = {
  grid: {
    display: 'grid',
    gap: '14px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    width: 'min(1040px, 100%)',
  },
  card: {
    background: 'color-mix(in srgb, var(--ui-color-surface) 86%, var(--ui-color-canvas))',
    border: '1px solid var(--ui-color-border)',
    borderRadius: '18px',
    display: 'grid',
    gap: '12px',
    minWidth: 0,
    padding: '18px',
  },
};

const meta: Meta = {
  title: 'Components/Menu',
};

export default meta;

// ---------------------------------------------------------------------------
// Story: Basic
// ---------------------------------------------------------------------------

export const Basic: StoryObj = {
  render: () => (
    <div style={storyStyles.grid}>
      <div style={storyStyles.card}>
        <strong>基础菜单</strong>
        <Menu>
          <MenuTrigger>
            <Button variant="outlined">打开菜单</Button>
          </MenuTrigger>
          <MenuContent>
            <MenuItem value="new">新建文件</MenuItem>
            <MenuItem value="open">打开文件</MenuItem>
            <MenuItem value="save">保存</MenuItem>
            <MenuSeparator />
            <MenuItem value="delete" disabled>
              删除（禁用）
            </MenuItem>
          </MenuContent>
        </Menu>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story: Groups (no separator)
// ---------------------------------------------------------------------------

export const Groups: StoryObj = {
  render: () => (
    <div style={storyStyles.grid}>
      <div style={storyStyles.card}>
        <strong>分组（无分割线）</strong>
        <Menu>
          <MenuTrigger>
            <Button variant="outlined">文件操作</Button>
          </MenuTrigger>
          <MenuContent>
            <MenuGroup label="创建">
              <MenuItem value="new-file">新建文件</MenuItem>
              <MenuItem value="new-folder">新建文件夹</MenuItem>
            </MenuGroup>
            <MenuGroup label="编辑">
              <MenuItem value="cut">剪切</MenuItem>
              <MenuItem value="copy">复制</MenuItem>
              <MenuItem value="paste">粘贴</MenuItem>
            </MenuGroup>
          </MenuContent>
        </Menu>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story: Separator
// ---------------------------------------------------------------------------

export const Separator: StoryObj = {
  render: () => (
    <div style={storyStyles.grid}>
      <div style={storyStyles.card}>
        <strong>仅分割线</strong>
        <Menu>
          <MenuTrigger>
            <Button variant="outlined">文件操作</Button>
          </MenuTrigger>
          <MenuContent>
            <MenuItem value="new-file">新建文件</MenuItem>
            <MenuItem value="new-folder">新建文件夹</MenuItem>
            <MenuSeparator />
            <MenuItem value="cut">剪切</MenuItem>
            <MenuItem value="copy">复制</MenuItem>
            <MenuItem value="paste">粘贴</MenuItem>
          </MenuContent>
        </Menu>
      </div>
      <div style={storyStyles.card}>
        <strong>分组 + 分割线</strong>
        <Menu>
          <MenuTrigger>
            <Button variant="outlined">文件操作</Button>
          </MenuTrigger>
          <MenuContent>
            <MenuGroup label="创建">
              <MenuItem value="new-file">新建文件</MenuItem>
              <MenuItem value="new-folder">新建文件夹</MenuItem>
            </MenuGroup>
            <MenuSeparator />
            <MenuGroup label="编辑">
              <MenuItem value="cut">剪切</MenuItem>
              <MenuItem value="copy">复制</MenuItem>
              <MenuItem value="paste">粘贴</MenuItem>
            </MenuGroup>
          </MenuContent>
        </Menu>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story: Submenu
// ---------------------------------------------------------------------------

export const Submenu: StoryObj = {
  render: () => (
    <div style={storyStyles.grid}>
      <div style={storyStyles.card}>
        <strong>二级子菜单</strong>
        <Menu>
          <MenuTrigger>
            <Button variant="outlined">更多选项</Button>
          </MenuTrigger>
          <MenuContent>
            <MenuItem value="undo">撤销</MenuItem>
            <Menu>
              <MenuTriggerItem>导出为</MenuTriggerItem>
              <MenuContent>
                <MenuItem value="export-pdf">PDF</MenuItem>
                <MenuItem value="export-png">PNG</MenuItem>
                <MenuItem value="export-svg">SVG</MenuItem>
              </MenuContent>
            </Menu>
            <MenuItem value="redo">重做</MenuItem>
          </MenuContent>
        </Menu>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story: Radio selection
// ---------------------------------------------------------------------------

const RadioSelectionDemo = () => {
  const [value, setValue] = useState('grid');

  return (
    <div style={storyStyles.grid}>
      <div style={storyStyles.card}>
        <strong>单选（RadioGroup）</strong>
        <Menu closeOnSelect={false}>
          <MenuTrigger>
            <Button variant="outlined">视图：{value === 'grid' ? '网格' : '列表'}</Button>
          </MenuTrigger>
          <MenuContent>
            <MenuRadioGroup value={value} onValueChange={({ value: v }) => setValue(v)}>
              <MenuRadioItem value="list">列表视图</MenuRadioItem>
              <MenuRadioItem value="grid">网格视图</MenuRadioItem>
            </MenuRadioGroup>
          </MenuContent>
        </Menu>
      </div>
    </div>
  );
};

export const RadioSelection: StoryObj = {
  render: () => <RadioSelectionDemo />,
};

// ---------------------------------------------------------------------------
// Story: Checkbox items
// ---------------------------------------------------------------------------

const CheckboxItemsDemo = () => {
  const [sidebar, setSidebar] = useState(true);
  const [toolbar, setToolbar] = useState(false);

  return (
    <div style={storyStyles.grid}>
      <div style={storyStyles.card}>
        <strong>多选（CheckboxItem）</strong>
        <Menu closeOnSelect={false}>
          <MenuTrigger>
            <Button variant="outlined">面板显示</Button>
          </MenuTrigger>
          <MenuContent>
            <MenuCheckboxItem
              checked={sidebar}
              value="sidebar"
              onCheckedChange={({ checked }) => setSidebar(checked)}
            >
              侧边栏
            </MenuCheckboxItem>
            <MenuCheckboxItem
              checked={toolbar}
              value="toolbar"
              onCheckedChange={({ checked }) => setToolbar(checked)}
            >
              工具栏
            </MenuCheckboxItem>
          </MenuContent>
        </Menu>
      </div>
    </div>
  );
};

export const CheckboxItems: StoryObj = {
  render: () => <CheckboxItemsDemo />,
};

// ---------------------------------------------------------------------------
// Story: Context menu
// ---------------------------------------------------------------------------

export const ContextMenuStory: StoryObj = {
  name: 'ContextMenu',
  render: () => (
    <div style={storyStyles.grid}>
      <div style={storyStyles.card}>
        <strong>右键菜单（ContextMenu）</strong>
        <ContextMenu>
          <ContextMenu.Trigger>
            <div
              style={{
                border: '1px dashed var(--ui-color-border)',
                borderRadius: '0.4rem',
                color: 'var(--ui-color-text)',
                cursor: 'context-menu',
                fontSize: '0.875rem',
                padding: '2rem 1rem',
                textAlign: 'center',
              }}
            >
              在此区域右键点击
            </div>
          </ContextMenu.Trigger>
          <ContextMenu.Content>
            <MenuItem value="cut">剪切</MenuItem>
            <MenuItem value="copy">复制</MenuItem>
            <MenuItem value="paste">粘贴</MenuItem>
            <MenuSeparator />
            <MenuItem value="properties">属性</MenuItem>
          </ContextMenu.Content>
        </ContextMenu>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story: Disabled items
// ---------------------------------------------------------------------------

export const DisabledItems: StoryObj = {
  render: () => (
    <div style={storyStyles.grid}>
      <div style={storyStyles.card}>
        <strong>禁用项</strong>
        <Menu>
          <MenuTrigger>
            <Button variant="outlined">操作菜单</Button>
          </MenuTrigger>
          <MenuContent>
            <MenuItem value="view">查看</MenuItem>
            <MenuItem value="edit">编辑</MenuItem>
            <MenuItem value="delete" disabled>
              删除
            </MenuItem>
            <MenuItem value="archive" disabled>
              归档
            </MenuItem>
          </MenuContent>
        </Menu>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story: Size variants
// ---------------------------------------------------------------------------

export const SizeVariants: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} style={storyStyles.card}>
          <strong>size="{size}"</strong>
          <Menu size={size}>
            <MenuTrigger>
              <Button
                variant="outlined"
                size={size === 'sm' ? 'small' : size === 'lg' ? 'large' : 'medium'}
              >
                {size.toUpperCase()} 菜单
              </Button>
            </MenuTrigger>
            <MenuContent>
              <MenuItem value="new">新建文件</MenuItem>
              <MenuItem value="open">打开文件</MenuItem>
              <MenuItem value="save">保存</MenuItem>
              <MenuSeparator />
              <MenuItem value="delete" disabled>
                删除（禁用）
              </MenuItem>
            </MenuContent>
          </Menu>
        </div>
      ))}
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story: Shape variants
// ---------------------------------------------------------------------------

export const ShapeVariants: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      {(['rounded', 'rect'] as const).map((shape) => (
        <div key={shape} style={storyStyles.card}>
          <strong>shape="{shape}"</strong>
          <Menu shape={shape}>
            <MenuTrigger>
              <Button variant="outlined" shape={shape === 'rect' ? 'rect' : 'rounded'}>
                {shape === 'rounded' ? '圆角菜单' : '直角菜单'}
              </Button>
            </MenuTrigger>
            <MenuContent>
              <MenuItem value="new">新建文件</MenuItem>
              <MenuItem value="open">打开文件</MenuItem>
              <MenuItem value="save">保存</MenuItem>
              <MenuSeparator />
              <MenuItem value="delete" disabled>
                删除（禁用）
              </MenuItem>
            </MenuContent>
          </Menu>
        </div>
      ))}
    </div>
  ),
};
