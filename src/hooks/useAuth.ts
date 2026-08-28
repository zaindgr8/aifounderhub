/**
 * useAuth hook
 *
 * Provides the current Supabase user, loading state, and whether
 * the user has active paid access to the /progress page.
 */

import { useState, useEffect, useRef } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { checkMemberAccess } from '../lib/auth';

export interface AuthState {
  user: User | null;
  loading: boolean;
  hasAccess: boolean;
  accessLoading: boolean;
  refreshAccess: () => void;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessLoading, setAccessLoading] = useState(false);
  const accessCheckRef = useRef<string | null>(null);

  const checkAccess = async (u: User | null) => {
    if (!u?.email) {
      setHasAccess(false);
      return;
    }
    // Avoid duplicate checks for the same user
    if (accessCheckRef.current === u.email) return;
    accessCheckRef.current = u.email;
    setAccessLoading(true);
    try {
      const result = await checkMemberAccess(u.email);
      setHasAccess(result);
    } catch {
      setHasAccess(false);
    } finally {
      setAccessLoading(false);
    }
  };

  useEffect(() => {
    // Get current session on mount
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null;
      setUser(u);
      setLoading(false);
      checkAccess(u);
    });

    // Listen for auth state changes (login, logout, token refresh)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      setLoading(false);
      accessCheckRef.current = null; // allow re-check on user change
      checkAccess(u);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const refreshAccess = () => {
    accessCheckRef.current = null;
    checkAccess(user);
  };

  return { user, loading, hasAccess, accessLoading, refreshAccess };
}
