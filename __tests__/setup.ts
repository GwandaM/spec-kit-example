// Jest setup file for Next.js and React Testing Library
import "@testing-library/jest-dom";
import { webcrypto } from "node:crypto";
import { TextDecoder as NodeTextDecoder, TextEncoder as NodeTextEncoder } from "node:util";

jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: "/",
      query: {},
      asPath: "/",
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return "/";
  },
}));

jest.mock("next/cache", () => ({
  __esModule: true,
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}));

let uuidCounter = 0;

jest.mock("uuid", () => ({
  __esModule: true,
  v4: () => {
    uuidCounter += 1;
    const hex = uuidCounter.toString(16).padStart(12, "0");
    return `00000000-0000-0000-0000-${hex}`;
  },
}));

const storageState = new Map<string, string>();

const localStorageMock: Storage = {
  get length() {
    return storageState.size;
  },
  clear: jest.fn(() => {
    storageState.clear();
  }),
  getItem: jest.fn((key: string) => (storageState.has(key) ? storageState.get(key)! : null)),
  key: jest.fn((index: number) => Array.from(storageState.keys())[index] ?? null),
  removeItem: jest.fn((key: string) => {
    storageState.delete(key);
  }),
  setItem: jest.fn((key: string, value: string) => {
    storageState.set(key, value);
  }),
};

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  configurable: true,
});

Object.defineProperty(globalThis, "__LOCAL_STORAGE_STATE__", {
  value: storageState,
  configurable: true,
});

Object.defineProperty(globalThis, "__LOCAL_STORAGE_RESET__", {
  value: () => {
    storageState.clear();
    localStorageMock.clear();
    jest.clearAllMocks();
  },
  configurable: true,
});

if (typeof globalThis.Request === "undefined") {
  class RequestPolyfill {
    url: string;
    method: string;
    constructor(input?: RequestInfo | URL, init?: RequestInit) {
      if (typeof input === "string") {
        this.url = input;
      } else if (input instanceof URL) {
        this.url = input.toString();
      } else {
        this.url = (input as { url?: string })?.url ?? "";
      }
      this.method = init?.method ?? "GET";
    }
  }

  Object.defineProperty(globalThis, "Request", {
    value: RequestPolyfill,
    configurable: true,
  });
}

// Provide Web Crypto API from Node for hash tests
const cryptoInstance = webcrypto as unknown as Crypto;

Object.defineProperty(globalThis, "crypto", {
  value: cryptoInstance,
  configurable: true,
});

if (typeof globalThis.TextEncoder === "undefined") {
  Object.defineProperty(globalThis, "TextEncoder", {
    value: NodeTextEncoder,
    configurable: true,
  });
}

if (typeof globalThis.TextDecoder === "undefined") {
  Object.defineProperty(globalThis, "TextDecoder", {
    value: NodeTextDecoder,
    configurable: true,
  });
}

declare global {
  var __LOCAL_STORAGE_STATE__: Map<string, string>;

  var __LOCAL_STORAGE_RESET__: () => void;
}
