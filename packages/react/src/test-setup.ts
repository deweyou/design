import { expect } from 'vite-plus/test';
import * as jestDomMatchers from '@testing-library/jest-dom/matchers';

expect.extend(jestDomMatchers);

// jsdom does not implement scrollTo as a real function — polyfill to prevent
// unhandled errors from Ark UI's internal scrollContentToTop action.
if (typeof HTMLElement !== 'undefined') {
  HTMLElement.prototype.scrollTo = function () {};
}

// jsdom does not implement IntersectionObserver or ResizeObserver — stub them
// to prevent unhandled errors from Ark UI's carousel and scroll-area state machines.
if (typeof globalThis.IntersectionObserver === 'undefined') {
  class IntersectionObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.IntersectionObserver =
    IntersectionObserverStub as unknown as typeof IntersectionObserver;
}

if (typeof globalThis.ResizeObserver === 'undefined') {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
}
