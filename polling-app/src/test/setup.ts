import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock next/cache used in server actions
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Ignore CSS imports (in case any component imports CSS inadvertently)
vi.mock('*.css', () => ({}));

// Mock window.matchMedia for responsive design testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
