import '@testing-library/jest-dom';

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin = '';
  readonly thresholds: ReadonlyArray<number> = [];

  disconnect() {
    // no-op for tests
  }

  observe() {
    // no-op for tests
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  unobserve() {
    // no-op for tests
  }
}

Object.defineProperty(globalThis, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver
});
