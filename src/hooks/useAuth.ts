/**
 * useAuth hook
 *
 * Provides the current Supabase user, loading state, and whether
 * the user has active paid access to the /progress page.
 */

import { useState, useEffect, useRef } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { checkMemberDetails, type MemberAccessDetails } from '../lib/auth';
import { bindReferral } from '../lib/referral';

export interface AuthState {
  user: User | null;
  loading: boolean;
  hasAccess: boolean;
  hasRoadmapAccess: boolean;
  hasClaudeAccess: boolean;
  products: string[];
  accessLoading: boolean;
  refreshAccess: () => void;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [hasRoadmapAccess, setHasRoadmapAccess] = useState(false);
  const [hasClaudeAccess, setHasClaudeAccess] = useState(false);
  const [products, setProducts] = useState<string[]>([]);
  const [accessLoading, setAccessLoading] = useState(false);
  const accessCheckRef = useRef<string | null>(null);

  /**
   * Attaches this person to the affiliate whose link brought them here.
   * Runs once per browser per account; the server enforces first-touch.
   */
  const linkReferral = async (u: User | null) => {
    if (!u?.email) return;
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (token) await bindReferral(u.email, token);
    } catch {
      // never block sign-in on affiliate tracking
    }
  };

  const checkAccess = async (u: User | null) => {
    if (!u?.email) {
      setHasAccess(false);
      setHasRoadmapAccess(false);
      setHasClaudeAccess(false);
      setProducts([]);
      return;
    }
    // Avoid duplicate checks for the same user
    if (accessCheckRef.current === u.email) return;
    accessCheckRef.current = u.email;
    setAccessLoading(true);
    try {
      const result = await checkMemberDetails(u.email);
      setHasAccess(result.hasAccess);
      setHasRoadmapAccess(result.hasRoadmapAccess);
      setHasClaudeAccess(result.hasClaudeAccess);
      setProducts(result.products || []);
    } catch {
      setHasAccess(false);
      setHasRoadmapAccess(false);
      setHasClaudeAccess(false);
      setProducts([]);
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
      void linkReferral(u);
    });

    // Listen for auth state changes (login, logout, token refresh)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      setLoading(false);
      accessCheckRef.current = null; // allow re-check on user change
      checkAccess(u);
      void linkReferral(u);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const refreshAccess = () => {
    accessCheckRef.current = null;
    checkAccess(user);
  };

  return { user, loading, hasAccess, hasRoadmapAccess, hasClaudeAccess, products, accessLoading, refreshAccess };
}
