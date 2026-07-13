import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

Object.defineProperty(URL, "createObjectURL", { configurable: true, value: vi.fn(() => "blob:longtts-test") });
Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: vi.fn() });
Object.defineProperty(HTMLMediaElement.prototype, "play", { configurable: true, value: vi.fn(() => Promise.resolve()) });
Object.defineProperty(HTMLMediaElement.prototype, "load", { configurable: true, value: vi.fn() });
Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
  configurable: true,
  value: vi.fn(() => ({
    clearRect: vi.fn(), fillRect: vi.fn(), beginPath: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(), stroke: vi.fn(),
    set fillStyle(_value: string) {}, set lineWidth(_value: number) {}, set lineCap(_value: string) {}, set strokeStyle(_value: string) {}
  }))
});

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.restoreAllMocks();
});
