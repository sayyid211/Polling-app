import { vi } from 'vitest';

// Mock next/cache used in server actions
vi.mock('next/cache', () => ({
	revalidatePath: vi.fn(),
}));

// Ignore CSS imports (in case any component imports CSS inadvertently)
vi.mock('*.css', () => ({}));
