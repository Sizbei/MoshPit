import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  readonly user: User | null;
  readonly session: Session | null;
  readonly isLoading: boolean;
}

interface AuthActions {
  readonly signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  readonly signUp: (
    email: string,
    password: string,
    username: string
  ) => Promise<{ error: string | null }>;
  readonly signOut: () => Promise<{ error: string | null }>;
  readonly resetPassword: (email: string) => Promise<{ error: string | null }>;
}

type UseAuthReturn = AuthState & AuthActions;

function sanitizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

function sanitizeUsername(raw: string): string {
  return raw.trim().replace(/[^a-zA-Z0-9_-]/g, '');
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
  });

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        user: session?.user ?? null,
        session,
        isLoading: false,
      });
    });

    // Fetch the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({
        user: session?.user ?? null,
        session,
        isLoading: false,
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(
    async (email: string, password: string): Promise<{ error: string | null }> => {
      try {
        const cleanEmail = sanitizeEmail(email);
        if (!cleanEmail) {
          return { error: 'Email is required' };
        }
        if (!password) {
          return { error: 'Password is required' };
        }

        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          return { error: error.message };
        }
        return { error: null };
      } catch (err: unknown) {
        return { error: getErrorMessage(err) };
      }
    },
    []
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      username: string
    ): Promise<{ error: string | null }> => {
      try {
        const cleanEmail = sanitizeEmail(email);
        const cleanUsername = sanitizeUsername(username);

        if (!cleanEmail) {
          return { error: 'Email is required' };
        }
        if (!password) {
          return { error: 'Password is required' };
        }
        if (!cleanUsername || cleanUsername.length < 3) {
          return { error: 'Username must be at least 3 characters' };
        }

        const { error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { username: cleanUsername },
          },
        });

        if (error) {
          return { error: error.message };
        }
        return { error: null };
      } catch (err: unknown) {
        return { error: getErrorMessage(err) };
      }
    },
    []
  );

  const handleSignOut = useCallback(async (): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { error: error.message };
      }
      return { error: null };
    } catch (err: unknown) {
      return { error: getErrorMessage(err) };
    }
  }, []);

  const resetPassword = useCallback(
    async (email: string): Promise<{ error: string | null }> => {
      try {
        const cleanEmail = sanitizeEmail(email);
        if (!cleanEmail) {
          return { error: 'Email is required' };
        }

        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail);
        if (error) {
          return { error: error.message };
        }
        return { error: null };
      } catch (err: unknown) {
        return { error: getErrorMessage(err) };
      }
    },
    []
  );

  return {
    user: state.user,
    session: state.session,
    isLoading: state.isLoading,
    signIn,
    signUp,
    signOut: handleSignOut,
    resetPassword,
  };
}
