/**
 * Auth helper functions for AI Founder Hub.
 * Wraps Supabase auth methods with consistent error handling.
 */

import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

// ─── Sign In / Sign Up ────────────────────────────────────────────────────────

export async function signInWithGoogle(): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/progress`,
    },
  });
  return { error: error?.message ?? null };
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<{ user: User | null; error: string | null }> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { user: data.user ?? null, error: error?.message ?? null };
}

export async function signUpWithEmail(
  email: string,
  password: string,
): Promise<{ user: User | null; error: string | null }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/progress`,
    },
  });
  return { user: data.user ?? null, error: error?.message ?? null };
}

export async function sendMagicLink(email: string): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${window.location.origin}/progress` },
  });
  return { error: error?.message ?? null };
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

// ─── Current Session ──────────────────────────────────────────────────────────

export async function getCurrentUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

// ─── Member Access Check ──────────────────────────────────────────────────────

export interface MemberAccessDetails {
  hasAccess: boolean;
  hasRoadmapAccess: boolean;
  hasClaudeAccess: boolean;
  products?: string[];
  status?: string;
  expiresAt?: string | null;
}

/**
 * Checks if the currently authenticated user's email has an active paid
 * membership in the `members` table. Uses a server-side API endpoint so the
 * service-role key stays on the backend.
 */
export async function checkMemberAccess(email: string): Promise<boolean> {
  const details = await checkMemberDetails(email);
  return details.hasAccess;
}

export async function checkMemberDetails(email: string): Promise<MemberAccessDetails> {
  try {
    const res = await fetch('/api/check-member', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) return { hasAccess: false, hasRoadmapAccess: false, hasClaudeAccess: false };
    const data = await res.json() as MemberAccessDetails;
    return {
      hasAccess: Boolean(data.hasAccess),
      hasRoadmapAccess: Boolean(data.hasRoadmapAccess || data.hasAccess),
      hasClaudeAccess: Boolean(data.hasClaudeAccess || data.hasAccess),
      products: data.products ?? [],
      status: data.status,
      expiresAt: data.expiresAt,
    };
  } catch {
    return { hasAccess: false, hasRoadmapAccess: false, hasClaudeAccess: false };
  }
}
