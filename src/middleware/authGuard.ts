/**
 * Navigation auth guard hook.
 *
 * Checks session validity, redirects to sign-in when expired,
 * and attempts automatic token refresh when possible.
 *
 * Usage:
 *   function ProtectedScreen() {
 *     const { isReady } = useAuthGuard();
 *     if (!isReady) return <LoadingSpinner />;
 *     return <ActualContent />;
 *   }
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { supabase } from '../services/supabase';

// ── Types ───────────────────────────────────────────────────────────

interface AuthGuardState {
  /** `true` once the session has been validated (or user redirected). */
  readonly isReady: boolean;
  /** `true` if the user has a valid, non-expired session. */
  readonly isAuthenticated: boolean;
}

// ── Constants ───────────────────────────────────────────────────────

/**
 * Route segments that do NOT require authentication.
 * Everything else is considered protected.
 */
const PUBLIC_SEGMENTS: ReadonlySet<string> = new Set([
  '(tabs)',
  'sign-in',
  'sign-up',
  'forgot-password',
]);

/** Refresh the session 5 minutes before it expires. */
const REFRESH_BUFFER_MS = 5 * 60 * 1000;

// ── Hook ────────────────────────────────────────────────────────────

export function useAuthGuard(): AuthGuardState {
  const router = useRouter();
  const segments = useSegments();
  const [state, setState] = useState<AuthGuardState>({
    isReady: false,
    isAuthenticated: false,
  });
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current !== null) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  /**
   * Schedule an automatic token refresh before the session expires.
   */
  const scheduleRefresh = useCallback(
    (expiresAt: number) => {
      clearRefreshTimer();

      const now = Math.floor(Date.now() / 1000);
      const refreshInMs = Math.max(
        0,
        (expiresAt - now) * 1000 - REFRESH_BUFFER_MS,
      );

      refreshTimerRef.current = setTimeout(async () => {
        try {
          const { data, error } = await supabase.auth.refreshSession();
          if (error || !data.session) {
            setState({ isReady: true, isAuthenticated: false });
            return;
          }
          if (data.session.expires_at) {
            scheduleRefresh(data.session.expires_at);
          }
        } catch {
          setState({ isReady: true, isAuthenticated: false });
        }
      }, refreshInMs);
    },
    [clearRefreshTimer],
  );

  useEffect(() => {
    let mounted = true;

    async function checkSession(): Promise<void> {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error || !session) {
          setState({ isReady: true, isAuthenticated: false });
          return;
        }

        // Check if the session is expired
        const now = Math.floor(Date.now() / 1000);
        if (session.expires_at && session.expires_at < now) {
          // Try to refresh
          const { data: refreshData, error: refreshError } =
            await supabase.auth.refreshSession();

          if (!mounted) return;

          if (refreshError || !refreshData.session) {
            setState({ isReady: true, isAuthenticated: false });
            return;
          }

          if (refreshData.session.expires_at) {
            scheduleRefresh(refreshData.session.expires_at);
          }

          setState({ isReady: true, isAuthenticated: true });
          return;
        }

        // Schedule proactive refresh
        if (session.expires_at) {
          scheduleRefresh(session.expires_at);
        }

        setState({ isReady: true, isAuthenticated: true });
      } catch {
        if (mounted) {
          setState({ isReady: true, isAuthenticated: false });
        }
      }
    }

    checkSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      const isAuthenticated = session !== null;
      setState({ isReady: true, isAuthenticated });

      if (session?.expires_at) {
        scheduleRefresh(session.expires_at);
      } else {
        clearRefreshTimer();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearRefreshTimer();
    };
  }, [scheduleRefresh, clearRefreshTimer]);

  // ── Route protection ────────────────────────────────────────────

  useEffect(() => {
    if (!state.isReady) return;

    const firstSegment = segments[0] ?? '';
    const isPublicRoute = PUBLIC_SEGMENTS.has(firstSegment);

    if (!state.isAuthenticated && !isPublicRoute) {
      // Redirect unauthenticated users away from protected routes
      router.replace('/sign-in' as never);
    }
  }, [state.isReady, state.isAuthenticated, segments, router]);

  return state;
}
