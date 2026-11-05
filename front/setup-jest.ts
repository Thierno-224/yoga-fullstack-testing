import 'jest-preset-angular/setup-jest';
import { jest } from '@jest/globals';

const createStorageMock = (): Storage => {
  let storage: Record<string, string> = {};

  return {
    get length(): number {
      return Object.keys(storage).length;
    },

    key: (index: number): string | null =>
      Object.keys(storage)[index] ?? null,

    getItem: (key: string): string | null =>
      storage[key] ?? null,

    setItem: (key: string, value: string): void => {
      storage[key] = String(value);
    },

    removeItem: (key: string): void => {
      delete storage[key];
    },

    clear: (): void => {
      storage = {};
    }
  };
};

Object.defineProperty(window, 'localStorage', {
  configurable: true,
  value: createStorageMock()
});

Object.defineProperty(window, 'sessionStorage', {
  configurable: true,
  value: createStorageMock()
});


Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(() => false)
  })

});
