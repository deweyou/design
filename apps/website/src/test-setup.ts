import { expect } from 'vite-plus/test';
import * as jestDomMatchers from '@testing-library/jest-dom/matchers';

expect.extend(jestDomMatchers);

class TestIntersectionObserver {
  disconnect = () => undefined;
  observe = () => undefined;
  takeRecords = () => [];
  unobserve = () => undefined;
}

globalThis.IntersectionObserver ??= TestIntersectionObserver as never;

export { expect };
