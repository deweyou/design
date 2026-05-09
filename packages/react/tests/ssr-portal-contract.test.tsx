import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vite-plus/test';

import { Dialog, NavOverlay, Toaster } from '../src';

describe('SSR portal contract', () => {
  it('renders Dialog content without document.body access', () => {
    expect(() =>
      renderToStaticMarkup(
        <Dialog.Root open>
          <Dialog.Content>
            <Dialog.Title>SSR dialog</Dialog.Title>
          </Dialog.Content>
        </Dialog.Root>,
      ),
    ).not.toThrow();
  });

  it('renders NavOverlay content without document.body access', () => {
    expect(() =>
      renderToStaticMarkup(
        <NavOverlay.Root open>
          <NavOverlay.Content>SSR navigation</NavOverlay.Content>
        </NavOverlay.Root>,
      ),
    ).not.toThrow();
  });

  it('renders Toaster without document.body access', () => {
    expect(() => renderToStaticMarkup(createElement(Toaster))).not.toThrow();
  });
});
