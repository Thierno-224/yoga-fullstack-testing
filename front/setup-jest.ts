
import 'jest-preset-angular/setup-jest';

const createStorageMock = (): Storage => {
  let storage: Record<string, string> = {};

  return {
    get length() {
      return Object.keys(storage).length;
    },
    key: (index: number) => Object.keys(storage)[index] ?? null,
    getItem: (key: string) => storage[key] ?? null,
    setItem: (key: string, value: string) => {
      storage[key] = String(value);
    },
    removeItem: (key: string) => {
      delete storage[key];
    },
    clear: () => {
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

Object.defineProperty(document.body.style, 'transform', {
  configurable: true,
  value: () => ({
    enumerable: true,
    configurable: true
  })
});
