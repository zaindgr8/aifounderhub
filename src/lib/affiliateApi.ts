/**
 * Typed client for /api/affiliate — the member-facing affiliate dashboard.
 *
 * Every call except `track` (handled in referral.ts) carries the caller's
 * Supabase token, and the server scopes the response to their own record.
 */

import { supabase } from './supabase';

export interface AffiliateLink {
  code: string;
  label: string;
  blurb: string;
  url: string;
}

export interface AffiliateCommission {
  id: string;
  date: string;
  email: string;
  productLabel: string;
  saleAmountCents: number;
  commissionPct: number;
  commissionCents: number;
  status: 'pending' | 'approved' | 'paid' | 'void';
  paidAt: string | null;
}

export interface AffiliateStats {
  clicks: number;
  referrals: number;
  buyers: number;
  sales: number;
  earnedCents: number;
  /** Earned but not yet checked by the team. */
  underReviewCents: number;
  /** Cleared by the team and awaiting a manual transfer. */
  claimableCents: number;
  /** Already sent, outside this system, and marked off here. */
  paidCents: number;
  salesVolumeCents: number;
  recentReferrals: { email: string; joinedAt: string; converted: boolean }[];
  commissions: AffiliateCommission[];
}

export interface AffiliateStatus {
  enrolled: boolean;
  status: 'none' | 'pending' | 'approved' | 'rejected' | 'suspended';
  code?: string;
  commissionPct?: number;
  appliedAt?: string;
  reviewedAt?: string | null;
  adminNote?: string | null;
  payoutMethod?: string | null;
  payoutDetails?: string | null;
  defaultPct: number;
  cookieDays: number;
  products: { code: string; label: string; path: string; blurb: string }[];
  links?: AffiliateLink[];
  stats?: AffiliateStats;
}

async function call<T>(action: string, params: Record<string, unknown> = {}): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Please sign in again');

  const res = await fetch('/api/affiliate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ action, ...params }),
  });
  const body = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
  return body as T;
}

export const affiliateApi = {
  status: () => call<AffiliateStatus>('status'),
  apply: (input: { fullName?: string; payoutMethod?: string; payoutDetails?: string; note?: string }) =>
    call<AffiliateStatus>('apply', input),
  savePayout: (input: { payoutMethod?: string; payoutDetails?: string }) =>
    call<AffiliateStatus>('payout', input),
};

export function money(cents: number): string {
  const dollars = (cents ?? 0) / 100;
  return `$${dollars.toLocaleString('en-US', {
    minimumFractionDigits: dollars % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}
