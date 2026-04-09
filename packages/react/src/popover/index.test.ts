// @vitest-environment jsdom

import { act } from 'react';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vite-plus/test';

import {
  Popover,
  popoverModeOptions,
  popoverPlacementOptions,
  popoverShapeOptions,
  popoverTriggerOptions,
  type PopoverProps,
} from './index';

const originalInnerHeight = window.innerHeight;
const originalInnerWidth = window.innerWidth;

class ResizeObserverMock {
  disconnect = () => {};
  observe = () => {};
  unobserve = () => {};
}

class IntersectionObserverMock {
  disconnect = () => {};
  observe = () => {};
  unobserve = () => {};
  takeRecords = () => [];
}

const setElementRect = (
  element: Element,
  rect: Partial<DOMRect> & { height: number; width: number; x?: number; y?: number },
) => {
  const x = rect.x ?? 0;
  const y = rect.y ?? 0;
  const nextRect = {
    bottom: y + rect.height,
    height: rect.height,
    left: x,
    right: x + rect.width,
    top: y,
    width: rect.width,
    x,
    y,
    toJSON: () => null,
  } satisfies DOMRect;

  Object.defineProperty(element, 'getBoundingClientRect', {
    configurable: true,
    value: () => nextRect,
  });
  Object.defineProperty(element, 'clientHeight', {
    configurable: true,
    value: rect.height,
  });
  Object.defineProperty(element, 'clientWidth', {
    configurable: true,
    value: rect.width,
  });
  Object.defineProperty(element, 'offsetHeight', {
    configurable: true,
    value: rect.height,
  });
  Object.defineProperty(element, 'offsetWidth', {
    configurable: true,
    value: rect.width,
  });
};

const dispatchMouseEvent = (node: Element | Document, type: string, init: MouseEventInit = {}) => {
  node.dispatchEvent(
    new MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      ...init,
    }),
  );
};

const dispatchPointerEvent = (
  node: Element | Document,
  type: string,
  init: PointerEventInit = {},
) => {
  const EventCtor = globalThis.PointerEvent ?? MouseEvent;

  node.dispatchEvent(
    new EventCtor(type, {
      bubbles: true,
      cancelable: true,
      ...init,
    }),
  );
};

const dispatchKeyboardEvent = (node: Element | Document, key: string) => {
  node.dispatchEvent(
    new KeyboardEvent('keydown', {
      bubbles: true,
      key,
    }),
  );
};

const flushFloatingWork = async () => {
  await act(async () => {
    await Promise.resolve();
    await new Promise((resolve) => {
      window.setTimeout(resolve, 0);
    });
  });
};

const waitForOverlay = async () => {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const overlay = getOverlay();

    if (overlay) {
      return overlay as HTMLElement;
    }

    await flushFloatingWork();
  }

  return null;
};

const waitForOverlayCount = async (count: number) => {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const overlays = document.querySelectorAll('[data-popover-overlay="true"]');

    if (overlays.length === count) {
      return overlays;
    }

    await flushFloatingWork();
  }

  return document.querySelectorAll('[data-popover-overlay="true"]');
};

const waitForOverlayToClose = async () => {
  await act(async () => {
    await new Promise((resolve) => {
      window.setTimeout(resolve, 180);
    });
  });
};

const renderPopover = async (props: Partial<PopoverProps> = {}) => {
  const host = document.createElement('div');
  const portalRoot = document.createElement('div');
  const root = createRoot(host);
  const handleVisibleChange = vi.fn();

  document.body.append(host, portalRoot);

  await act(async () => {
    root.render(
      createElement(
        Popover,
        {
          content: createElement('button', { type: 'button' }, '卡片动作'),
          onVisibleChange: handleVisibleChange,
          ...props,
        },
        createElement('button', { type: 'button' }, '打开浮层'),
      ),
    );
  });

  const trigger = host.querySelector('button');

  if (!trigger) {
    throw new Error('Expected a trigger button to exist.');
  }

  setElementRect(trigger, {
    height: 32,
    width: 108,
    x: 72,
    y: 64,
  });

  return {
    handleVisibleChange,
    host,
    portalRoot,
    root,
    trigger,
  };
};

const getOverlay = () => {
  return document.querySelector('[data-popover-overlay="true"]');
};

const unmounts: Array<() => Promise<void>> = [];

beforeEach(() => {
  vi.useRealTimers();
  window.innerWidth = 320;
  window.innerHeight = 220;
  globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
  globalThis.IntersectionObserver =
    IntersectionObserverMock as unknown as typeof IntersectionObserver;
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

afterEach(async () => {
  while (unmounts.length > 0) {
    const cleanup = unmounts.pop();

    if (cleanup) {
      await cleanup();
    }
  }

  document.body.innerHTML = '';
  window.innerWidth = originalInnerWidth;
  window.innerHeight = originalInnerHeight;
});

test('popover exports the documented public option sets', () => {
  expect(popoverTriggerOptions).toEqual(['click', 'hover', 'focus', 'context-menu']);
  expect(popoverPlacementOptions).toEqual([
    'top',
    'bottom',
    'left',
    'right',
    'left-top',
    'left-bottom',
    'right-top',
    'right-bottom',
  ]);
  expect(popoverModeOptions).toEqual(['card', 'loose', 'pure']);
  expect(popoverShapeOptions).toEqual(['rect', 'rounded']);
});

test('popover requires content on the public API surface', () => {
  expect(() =>
    createElement(
      Popover,
      {
        content: undefined as never,
      },
      createElement('button', { type: 'button' }, '打开浮层'),
    ),
  ).not.toThrow();

  expect(() =>
    Popover({
      content: undefined as never,
      children: createElement('button', { type: 'button' }, '打开浮层'),
    }),
  ).toThrow('Popover content is required.');
});

test('popover keeps documented defaults and forwards root props to the reference element', async () => {
  const { host, root, trigger } = await renderPopover({
    className: 'consumer-trigger',
    id: 'popover-trigger',
    style: {
      inlineSize: '14rem',
    },
    title: 'trigger passthrough',
  });

  unmounts.push(async () => {
    await act(async () => {
      root.unmount();
    });
    host.remove();
  });

  expect(trigger.getAttribute('aria-expanded')).toBe('false');
  expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
  expect(trigger.getAttribute('data-disabled')).toBe('false');
  expect(trigger.getAttribute('id')).toBe('popover-trigger');
  expect(trigger.getAttribute('title')).toBe('trigger passthrough');
  expect(trigger.className).toContain('consumer-trigger');
  expect(trigger.getAttribute('style')).toContain('inline-size: 14rem');
});

test('popover opens on click by default, keeps internal clicks open, and closes on outside press', async () => {
  const { handleVisibleChange, host, root, trigger } = await renderPopover();

  unmounts.push(async () => {
    await act(async () => {
      root.unmount();
    });
    host.remove();
  });

  await act(async () => {
    dispatchMouseEvent(trigger, 'click');
  });
  await flushFloatingWork();

  const overlay = await waitForOverlay();

  expect(handleVisibleChange).toHaveBeenLastCalledWith(
    true,
    expect.objectContaining({
      reason: 'trigger',
    }),
  );
  expect(overlay).not.toBeNull();

  if (!overlay) {
    throw new Error('Expected overlay to exist after click.');
  }

  setElementRect(overlay, {
    height: 80,
    width: 160,
    x: 72,
    y: 104,
  });

  const surfaceButton = overlay.querySelector('button');

  if (!surfaceButton) {
    throw new Error('Expected a button inside the popover content.');
  }

  await act(async () => {
    dispatchMouseEvent(surfaceButton, 'click');
  });
  await flushFloatingWork();

  expect(await waitForOverlay()).not.toBeNull();

  await act(async () => {
    dispatchPointerEvent(document.body, 'pointerdown');
  });
  await waitForOverlayToClose();

  expect(handleVisibleChange).toHaveBeenLastCalledWith(
    false,
    expect.objectContaining({
      reason: 'outside-press',
    }),
  );
});

test('popover supports controlled and uncontrolled visibility entry points', async () => {
  const host = document.createElement('div');
  const root = createRoot(host);
  const handleVisibleChange = vi.fn();

  document.body.append(host);

  await act(async () => {
    root.render(
      createElement(
        Popover,
        {
          content: createElement('span', null, '受控内容'),
          defaultVisible: true,
          onVisibleChange: handleVisibleChange,
        },
        createElement('button', { type: 'button' }, '非受控'),
      ),
    );
  });
  await flushFloatingWork();

  unmounts.push(async () => {
    await act(async () => {
      root.unmount();
    });
    host.remove();
  });

  expect(getOverlay()).not.toBeNull();

  await act(async () => {
    root.render(
      createElement(
        Popover,
        {
          content: createElement('span', null, '受控内容'),
          onVisibleChange: handleVisibleChange,
          visible: false,
        },
        createElement('button', { type: 'button' }, '受控'),
      ),
    );
  });
  await flushFloatingWork();

  await waitForOverlayToClose();

  expect(getOverlay()).toBeNull();
});

test('popover closes on Escape and returns focus to the trigger in non-modal mode', async () => {
  const { host, root, trigger } = await renderPopover();

  unmounts.push(async () => {
    await act(async () => {
      root.unmount();
    });
    host.remove();
  });

  trigger.focus();

  await act(async () => {
    dispatchMouseEvent(trigger, 'click');
  });
  await flushFloatingWork();

  expect(await waitForOverlay()).not.toBeNull();

  await act(async () => {
    dispatchKeyboardEvent(document, 'Escape');
  });
  await waitForOverlayToClose();

  expect(getOverlay()).toBeNull();
  expect(document.activeElement).toBe(trigger);
});

test('popover supports placement fallback, boundary padding, and custom portal containers', async () => {
  const host = document.createElement('div');
  const portalRoot = document.createElement('div');
  const root = createRoot(host);
  const handleVisibleChange = vi.fn();

  document.body.append(host, portalRoot);

  await act(async () => {
    root.render(
      createElement(
        Popover,
        {
          boundaryPadding: 24,
          content: createElement('span', null, '右侧内容'),
          onVisibleChange: handleVisibleChange,
          placement: 'right',
          popupPortalContainer: portalRoot,
          visible: true,
        },
        createElement('button', { type: 'button' }, '右侧按钮'),
      ),
    );
  });
  await flushFloatingWork();

  const trigger = host.querySelector('button');

  if (!trigger) {
    throw new Error('Expected trigger to exist for the portal test.');
  }

  unmounts.push(async () => {
    await act(async () => {
      root.unmount();
    });
    host.remove();
    portalRoot.remove();
  });

  await flushFloatingWork();

  const overlay = await waitForOverlay();

  if (!overlay) {
    throw new Error('Expected overlay to exist in the custom portal container.');
  }

  setElementRect(trigger, {
    height: 32,
    width: 90,
    x: 270,
    y: 72,
  });
  setElementRect(overlay, {
    height: 88,
    width: 140,
    x: 270,
    y: 72,
  });

  window.dispatchEvent(new Event('resize'));
  await flushFloatingWork();

  expect(portalRoot.contains(overlay)).toBe(true);
  expect(overlay.getAttribute('data-boundary-padding')).toBe('24');
  expect(overlay.getAttribute('data-requested-placement')).toBe('right');
  expect(['left', 'right']).toContain(overlay.getAttribute('data-placement'));
  expect(handleVisibleChange).not.toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      reason: 'disabled-reference',
    }),
  );
});

test('popover supports hover, focus, context-menu, disabled, mode, and shape variations', async () => {
  const { handleVisibleChange, host, root, trigger } = await renderPopover({
    disabled: false,
    mode: 'loose',
    shape: 'rect',
    trigger: ['hover', 'focus', 'context-menu'],
  });

  unmounts.push(async () => {
    await act(async () => {
      root.unmount();
    });
    host.remove();
  });

  await act(async () => {
    dispatchMouseEvent(trigger, 'mouseover');
  });
  await flushFloatingWork();

  let overlay = await waitForOverlay();

  if (!overlay) {
    await act(async () => {
      trigger.focus();
    });
    overlay = await waitForOverlay();
  }

  expect(overlay).not.toBeNull();

  if (!overlay) {
    throw new Error('Expected hover or focus to open the overlay.');
  }

  expect(overlay.getAttribute('data-mode')).toBe('loose');
  expect(overlay.getAttribute('data-shape')).toBe('rect');

  await act(async () => {
    root.render(
      createElement(
        Popover,
        {
          content: createElement('span', null, '右键菜单'),
          mode: 'loose',
          onVisibleChange: handleVisibleChange,
          shape: 'rect',
          trigger: ['context-menu'],
        },
        createElement('button', { type: 'button' }, '右键打开'),
      ),
    );
  });

  const contextMenuTrigger = host.querySelector('button');

  if (!contextMenuTrigger) {
    throw new Error('Expected context-menu trigger to exist.');
  }

  await act(async () => {
    dispatchMouseEvent(contextMenuTrigger, 'contextmenu', {
      button: 2,
    });
  });
  await flushFloatingWork();

  expect(await waitForOverlay()).not.toBeNull();

  await act(async () => {
    root.render(
      createElement(
        Popover,
        {
          content: createElement('span', null, '禁用'),
          disabled: true,
          trigger: ['click', 'focus'],
        },
        createElement('button', { type: 'button' }, '禁用'),
      ),
    );
  });

  const disabledTrigger = host.querySelector('button');

  if (!disabledTrigger) {
    throw new Error('Expected disabled trigger to exist.');
  }

  await act(async () => {
    dispatchMouseEvent(disabledTrigger, 'click');
    disabledTrigger.focus();
  });
  await waitForOverlayToClose();

  expect(getOverlay()).toBeNull();
});

test('popover keeps focus-triggered interactive content open while focus moves into the panel', async () => {
  const host = document.createElement('div');
  const root = createRoot(host);

  document.body.append(host);

  await act(async () => {
    root.render(
      createElement(
        Popover,
        {
          content: createElement('input', {
            'aria-label': 'popover input',
            placeholder: 'Type here',
          }),
          trigger: ['focus'],
        },
        createElement('button', { type: 'button' }, '聚焦打开'),
      ),
    );
  });

  unmounts.push(async () => {
    await act(async () => {
      root.unmount();
    });
    host.remove();
  });

  const trigger = host.querySelector('button');

  if (!trigger) {
    throw new Error('Expected a focus trigger button to exist.');
  }

  await act(async () => {
    trigger.focus();
  });

  const overlay = await waitForOverlay();

  if (!overlay) {
    throw new Error('Expected overlay to open on focus.');
  }

  const input = overlay.querySelector('input');

  if (!(input instanceof HTMLInputElement)) {
    throw new Error('Expected an input inside the popover.');
  }

  await act(async () => {
    input.focus();
  });
  await flushFloatingWork();

  expect(document.activeElement).toBe(input);
  expect(await waitForOverlay()).not.toBeNull();
});

test('popover closes on the first trigger click after focus moves into interactive content', async () => {
  const host = document.createElement('div');
  const root = createRoot(host);

  document.body.append(host);

  await act(async () => {
    root.render(
      createElement(
        Popover,
        {
          content: createElement('input', {
            'aria-label': 'interactive popover input',
            placeholder: 'Type here',
          }),
          trigger: ['click', 'focus'],
        },
        createElement('button', { type: 'button' }, '交互式浮层'),
      ),
    );
  });

  unmounts.push(async () => {
    await act(async () => {
      root.unmount();
    });
    host.remove();
  });

  const trigger = host.querySelector('button');

  if (!trigger) {
    throw new Error('Expected a trigger button to exist.');
  }

  await act(async () => {
    dispatchPointerEvent(trigger, 'pointerdown');
    dispatchMouseEvent(trigger, 'click');
  });
  await flushFloatingWork();

  const overlay = await waitForOverlay();

  if (!overlay) {
    throw new Error('Expected the overlay to open on click.');
  }

  const input = overlay.querySelector('input');

  if (!(input instanceof HTMLInputElement)) {
    throw new Error('Expected an input inside the interactive popover.');
  }

  await act(async () => {
    input.focus();
  });
  await flushFloatingWork();

  expect(document.activeElement).toBe(input);

  await act(async () => {
    dispatchPointerEvent(trigger, 'pointerdown');
    trigger.focus();
    dispatchMouseEvent(trigger, 'mousedown');
    dispatchMouseEvent(trigger, 'click');
  });
  await waitForOverlayToClose();
  await flushFloatingWork();

  expect(getOverlay()).toBeNull();
});

test('popover keeps multiple instances independent by default', async () => {
  const host = document.createElement('div');
  const root = createRoot(host);

  document.body.append(host);

  await act(async () => {
    root.render(
      createElement(
        'div',
        null,
        createElement(
          Popover,
          {
            content: createElement('span', null, '一号'),
          },
          createElement('button', { type: 'button' }, '一号按钮'),
        ),
        createElement(
          Popover,
          {
            content: createElement('span', null, '二号'),
          },
          createElement('button', { type: 'button' }, '二号按钮'),
        ),
      ),
    );
  });

  unmounts.push(async () => {
    await act(async () => {
      root.unmount();
    });
    host.remove();
  });

  const triggers = host.querySelectorAll('button');

  await act(async () => {
    dispatchMouseEvent(triggers[0]!, 'click');
    dispatchMouseEvent(triggers[1]!, 'click');
  });
  const overlays = await waitForOverlayCount(2);

  expect(overlays).toHaveLength(2);
});

test('popover overlay has correct ARIA attributes after Ark UI migration', async () => {
  const { host, root, trigger } = await renderPopover();
  unmounts.push(async () => {
    await act(async () => {
      root.unmount();
    });
    host.remove();
  });

  // Before opening: data-popover-reference is present on trigger wrapper
  const referenceEl = host.querySelector('[data-popover-reference="true"]');
  expect(referenceEl).not.toBeNull();

  await act(async () => {
    dispatchMouseEvent(trigger, 'click');
  });
  await flushFloatingWork();

  const overlay = await waitForOverlay();
  expect(overlay).not.toBeNull();

  // data-popover-overlay must be present for consumer queries
  expect(overlay!.getAttribute('data-popover-overlay')).toBe('true');

  // role="dialog" is output by Ark UI on the content element
  expect(overlay!.getAttribute('role')).toBe('dialog');

  // aria-controls on the trigger should point to the overlay id
  const triggerEl = host.querySelector(
    '[data-popover-reference="true"] button, [data-popover-reference="true"]',
  ) as HTMLElement | null;
  const overlayId = overlay!.id;
  expect(overlayId).toBeTruthy();
  if (triggerEl) {
    const ariaControls =
      triggerEl.getAttribute('aria-controls') ??
      triggerEl.closest('[aria-controls]')?.getAttribute('aria-controls');
    expect(ariaControls).toBe(overlayId);
  }
});

test('popover accepts a RefObject as popupPortalContainer and renders overlay inside it', async () => {
  const host = document.createElement('div');
  const portalEl = document.createElement('div');
  const portalRef = { current: portalEl };
  const root = createRoot(host);

  document.body.append(host, portalEl);

  await act(async () => {
    root.render(
      createElement(
        Popover,
        {
          content: createElement('span', null, 'ref portal content'),
          popupPortalContainer: portalRef,
          visible: true,
        },
        createElement('button', { type: 'button' }, '触发器'),
      ),
    );
  });
  await flushFloatingWork();

  unmounts.push(async () => {
    await act(async () => {
      root.unmount();
    });
    host.remove();
    portalEl.remove();
  });

  const overlay = await waitForOverlay();
  expect(overlay).not.toBeNull();
  expect(portalEl.contains(overlay)).toBe(true);
});

test('popover merges function ref from reference child', async () => {
  const host = document.createElement('div');
  const root = createRoot(host);
  document.body.append(host);

  const callbackRef = vi.fn();

  await act(async () => {
    root.render(
      createElement(
        Popover,
        { content: createElement('span', null, '内容') },
        createElement('button', { type: 'button', ref: callbackRef }, '触发器'),
      ),
    );
  });

  unmounts.push(async () => {
    await act(async () => {
      root.unmount();
    });
    host.remove();
  });

  expect(callbackRef).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
});

test('popover merges object ref from reference child', async () => {
  const host = document.createElement('div');
  const root = createRoot(host);
  document.body.append(host);

  const objectRef = { current: null as HTMLButtonElement | null };

  await act(async () => {
    root.render(
      createElement(
        Popover,
        { content: createElement('span', null, '内容') },
        createElement('button', { type: 'button', ref: objectRef }, '触发器'),
      ),
    );
  });

  unmounts.push(async () => {
    await act(async () => {
      root.unmount();
    });
    host.remove();
  });

  expect(objectRef.current).toBeInstanceOf(HTMLButtonElement);
});
