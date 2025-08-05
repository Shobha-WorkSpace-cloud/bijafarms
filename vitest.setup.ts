import { beforeAll, afterAll, vi } from "vitest";
import { createServer } from "./server/index";

// Global test setup
beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = "test";

  // Mock console methods to reduce noise during tests
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "info").mockImplementation(() => {});

  // Keep error and warn for debugging
  const originalError = console.error;
  const originalWarn = console.warn;

  vi.spyOn(console, "error").mockImplementation((...args) => {
    // Only show errors if they're test-related
    if (args[0]?.includes?.("Error") && !args[0]?.includes?.("reading")) {
      originalError(...args);
    }
  });

  vi.spyOn(console, "warn").mockImplementation((...args) => {
    // Only show important warnings
    if (args[0]?.includes?.("deprecated") === false) {
      originalWarn(...args);
    }
  });
});

afterAll(() => {
  // Restore console methods
  vi.restoreAllMocks();
});

// Mock DOM methods for client-side tests
if (typeof window !== "undefined") {
  Object.defineProperty(window, "location", {
    value: {
      href: "http://localhost:3000",
      origin: "http://localhost:3000",
    },
    writable: true,
  });
}

// Mock URL methods
if (typeof global !== "undefined") {
  global.URL = global.URL || {};
  global.URL.createObjectURL = vi.fn(() => "mocked-url");
  global.URL.revokeObjectURL = vi.fn();

  // Mock Blob for file download tests
  global.Blob = vi.fn().mockImplementation((content, options) => ({
    content,
    options,
    size: content?.[0]?.length || 0,
    type: options?.type || "",
  }));
}
