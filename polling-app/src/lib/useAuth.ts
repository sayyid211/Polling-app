'use client';

import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { User } from '@/types';
import { useAuthStore } from './auth';

export function useAuth() {
  const { user, isAuthenticated, login, logout, setLoading } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        setLoading(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          return;
        }

        if (session?.user) {
          // Get user profile from profiles table
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            console.error('Error getting profile:', profileError);
            return;
          }

          const userData: User = {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            avatar: profile.avatar_url || undefined,
            createdAt: new Date(profile.created_at),
            updatedAt: new Date(profile.updated_at),
          };

          login(userData);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profileError) {
              console.error('Error getting profile:', profileError);
              return;
            }

            const userData: User = {
              id: profile.id,
              email: profile.email,
              name: profile.name,
              avatar: profile.avatar_url || undefined,
              createdAt: new Date(profile.created_at),
              updatedAt: new Date(profile.updated_at),
            };

            login(userData);
          } catch (error) {
            console.error('Error in auth state change:', error);
          }
        } else if (event === 'SIGNED_OUT') {
          logout();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [login, logout, setLoading]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      logout();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading: useAuthStore.getState().isLoading,
    isInitialized,
    signIn,
    signUp,
    signOut,
  };
}
