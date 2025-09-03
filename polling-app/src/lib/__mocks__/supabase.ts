export const supabase = {
  from: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  single: vi.fn(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  rpc: vi.fn(),
};

export default supabase;
