import { create } from 'zustand';
import { AuthState, User } from '@/types';

interface AuthStore extends AuthState {
  login: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: (user: User) => set({ user, isAuthenticated: true, isLoading: false }),
  logout: () => set({ user: null, isAuthenticated: false, isLoading: false }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));

// Authentication utilities
export const authUtils = {
  // Check if user is authenticated
  isAuthenticated: () => {
    return useAuthStore.getState().isAuthenticated;
  },

  // Get current user
  getCurrentUser: () => {
    return useAuthStore.getState().user;
  },

  // Mock login function (replace with actual auth implementation)
  login: async (email: string, password: string): Promise<User> => {
    // TODO: Implement actual authentication logic
    const mockUser: User = {
      id: '1',
      email,
      name: 'John Doe',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    useAuthStore.getState().login(mockUser);
    return mockUser;
  },

  // Mock logout function
  logout: () => {
    useAuthStore.getState().logout();
  },
};
