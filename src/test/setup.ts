import '@testing-library/jest-dom';

// Mock localStorage if missing or needed
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock BroadcastChannel
class MockBroadcastChannel {
  name: string;
  onmessage: ((event: any) => void) | null = null;
  constructor(name: string) {
    this.name = name;
  }
  postMessage(_data: any) {}
  close() {}
}

Object.defineProperty(window, 'BroadcastChannel', {
  value: MockBroadcastChannel,
});
