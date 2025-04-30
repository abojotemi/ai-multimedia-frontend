import '@testing-library/jest-dom';

// Mock for URL.createObjectURL
if (typeof window !== 'undefined') {
  window.URL.createObjectURL = vi.fn(() => 'mocked-url');
  window.URL.revokeObjectURL = vi.fn();
}

// Add custom matchers or global test setup here