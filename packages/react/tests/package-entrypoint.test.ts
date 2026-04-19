import { createElement, createRef } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vite-plus/test';

import * as components from '../src';

const SearchIcon = () => {
  return createElement('svg', { 'aria-hidden': true, viewBox: '0 0 16 16' });
};

SearchIcon.displayName = 'SearchIcon';

const exampleButtonProps: import('../src').ButtonProps = {
  href: '/docs/button',
  htmlType: 'submit',
  color: 'primary',
  icon: createElement(SearchIcon),
  shape: 'pill',
  size: 'md',
  type: 'button',
  variant: 'outlined',
};

const exampleIconButtonProps: import('../src').IconButtonProps = {
  'aria-label': 'Open search',
  color: 'danger',
  href: '/docs/search',
  htmlType: 'button',
  icon: createElement(SearchIcon),
  loading: true,
  shape: 'pill',
  size: 'md',
  target: '_blank',
  variant: 'outlined',
};

const exampleTextProps: import('../src').TextProps = {
  background: 'yellow',
  children: '说明文字',
  color: 'olive',
  italic: true,
  lineClamp: 2,
  variant: 'caption',
};

const examplePopoverProps: import('../src').PopoverProps = {
  children: createElement('button', { type: 'button' }, '打开浮层'),
  content: '基础内容',
  mode: 'card',
  offset: 8,
  overlayClassName: 'consumer-overlay',
  placement: 'right-bottom',
  shape: 'rounded',
  trigger: ['click', 'focus'],
};

void exampleButtonProps;
void exampleIconButtonProps;
void examplePopoverProps;
void exampleTextProps;

test('components root entry exposes Button, IconButton, Popover, Text, Menu family, Tabs family, Phase 2 and Phase 3 components as the runtime public exports', () => {
  expect(Object.keys(components).sort()).toEqual([
    'Alert',
    'Badge',
    'Breadcrumb',
    'Button',
    'Card',
    'Checkbox',
    'ContextMenu',
    'Dialog',
    'IconButton',
    'Input',
    'Menu',
    'MenuCheckboxItem',
    'MenuContent',
    'MenuGroup',
    'MenuGroupLabel',
    'MenuItem',
    'MenuRadioGroup',
    'MenuRadioItem',
    'MenuSeparator',
    'MenuTrigger',
    'MenuTriggerItem',
    'Pagination',
    'Popover',
    'RadioGroup',
    'ScrollArea',
    'Select',
    'Separator',
    'Skeleton',
    'Spinner',
    'Switch',
    'TabContent',
    'TabIndicator',
    'TabList',
    'TabTrigger',
    'Tabs',
    'Text',
    'Textarea',
    'Toaster',
    'Tooltip',
    'toast',
  ]);
});

test('components root entry renders Button, IconButton, Popover, and Text without any legacy contract object', () => {
  const buttonMarkup = renderToStaticMarkup(
    createElement(components.Button, { href: '/publish' }, 'Publish'),
  );
  const iconButtonMarkup = renderToStaticMarkup(
    createElement(components.IconButton, {
      'aria-label': 'Open search',
      href: '/search',
      icon: createElement(SearchIcon),
    }),
  );
  const popoverMarkup = renderToStaticMarkup(
    createElement(
      components.Popover,
      { content: createElement('span', null, '公开说明') },
      createElement('button', { type: 'button' }, 'Open popover'),
    ),
  );
  const textMarkup = renderToStaticMarkup(
    createElement(components.Text, { variant: 'body' }, '公开正文'),
  );

  expect(buttonMarkup).toContain('data-content-mode="text-only"');
  expect(buttonMarkup.startsWith('<a')).toBe(true);
  expect(iconButtonMarkup).toContain('data-content-mode="icon-button"');
  expect(iconButtonMarkup.startsWith('<a')).toBe(true);
  expect(popoverMarkup).toContain('aria-haspopup="dialog"');
  expect(popoverMarkup).toContain('Open popover');
  expect(textMarkup.startsWith('<div')).toBe(true);
  expect(textMarkup).toContain('公开正文');
  expect(components.Button.Icon).toBe(components.IconButton);
});

test('components root entry accepts HTMLButtonElement refs for Button and IconButton', () => {
  const buttonRef = createRef<HTMLButtonElement>();
  const iconButtonRef = createRef<HTMLButtonElement>();

  void createElement(components.Button, { ref: buttonRef }, 'Publish');
  void createElement(components.IconButton, {
    'aria-label': 'Open search',
    icon: createElement(SearchIcon),
    ref: iconButtonRef,
  });

  expect(buttonRef.current).toBeNull();
  expect(iconButtonRef.current).toBeNull();
});
