/**
 * Typed client for the /api/admin endpoint.
 *
 * Every call carries the current Supabase access token; the server verifies it
 * and checks the admin allowlist. Nothing privileged is ever held on the client.
 */

import { supabase } from './supabase';

// ─── Payload types ────────────────────────────────────────────────────────────

export interface Kpi {
  value: number;
  allTime: number | null;
  deltaPct: number | null;
}

export interface SeriesPoint {
  date: string;
  signups: number;
  revenueCents: number;
  leads: number;
  orders: number;
}

export interface PackageStat {
  code: string;
  label: string;
  orders: number;
  revenueCents: number;
  customers: number;
}

export interface ActivityItem {
  type: 'signup' | 'payment' | 'lead' | 'booking';
  at: string;
  email: string;
  name: string | null;
  detail: string;
  amountCents?: number;
}

export interface Overview {
  range: string;
  generatedAt: string;
  kpis: Record<string, Kpi>;
  series: SeriesPoint[];
  byPackage: PackageStat[];
  bySource: { source: string; count: number }[];
  byGoal: { goal: string; count: number }[];
  funnel: { stage: string; value: number }[];
  activity: ActivityItem[];
  health: {
    supabase: boolean;
    paymentsRecorded: number;
    leadsRecorded: number;
    migration0003: boolean;
  };
}

export interface Order {
  id: string;
  date: string;
  completedAt: string | null;
  productCode: string;
  productLabel: string;
  amountCents: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  isTest: boolean;
  intentId: string | null;
  provider: string;
}

export interface Person {
  email: string;
  name: string | null;
  avatar: string | null;
  provider: string | null;
  signedUpAt: string | null;
  lastSignInAt: string | null;
  isUser: boolean;
  paid: boolean;
  totalSpentCents: number;
  packages: string[];
  orders: Order[];
  tasksCompleted: number;
  /** One row per product owned — a person can hold Claude and the RoadMap at once. */
  memberships: {
    productCode: string;
    productLabel: string;
    status: string;
    active: boolean;
    startedAt: string | null;
    expiresAt: string | null;
  }[];
  hasActiveAccess: boolean;
  lead: {
    id: string;
    createdAt: string;
    source: string;
    goal: string | null;
    phone: string | null;
    countryCode: string | null;
    workshopTitle: string | null;
    ticketNumber: string | null;
    submissions: number;
  } | null;
}

export interface PaymentRow {
  id: string;
  createdAt: string;
  completedAt: string | null;
  customerName: string | null;
  customerEmail: string;
  productCode: string;
  productLabel: string;
  amountCents: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  isTest: boolean;
  intentId: string | null;
  provider: string;
  error: string | null;
}

export interface LeadRow {
  id: string;
  createdAt: string;
  name: string | null;
  email: string;
  phone: string | null;
  countryCode: string | null;
  goal: string | null;
  source: string;
  workshopTitle: string | null;
  ticketNumber: string | null;
  submissions: number;
  lastSeenAt: string;
}

export const GRANTABLE_PRODUCTS = [
  { code: 'aaa-accelerator', label: 'AAA Accelerator (Founding Cohort)', recurring: false },
  { code: 'claude-master', label: 'Master Claude in 7 Days', recurring: false },
  { code: 'all-access', label: 'All Access', recurring: false },
  { code: 'session-1on1', label: '1:1 Private Session', recurring: false },
];

export interface AffiliateRow {
  id: string;
  email: string;
  fullName: string | null;
  code: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  commissionPct: number;
  payoutMethod: string | null;
  payoutDetails: string | null;
  applicantNote: string | null;
  adminNote: string | null;
  appliedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  clicks: number;
  referrals: number;
  sales: number;
  salesVolumeCents: number;
  earnedCents: number;
  unpaidCents: number;
}

export interface CommissionRow {
  id: string;
  date: string;
  affiliateEmail: string;
  affiliateCode: string;
  buyerEmail: string;
  productLabel: string;
  saleAmountCents: number;
  commissionPct: number;
  commissionCents: number;
  status: 'pending' | 'approved' | 'paid' | 'void';
  paidAt: string | null;
}

export class AdminError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// ─── Transport ────────────────────────────────────────────────────────────────

async function adminCall<T>(action: string, params: Record<string, unknown> = {}): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new AdminError('Not signed in', 401);

  const res = await fetch('/api/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ action, ...params }),
  });

  const body = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new AdminError(body.error || `Request failed (${res.status})`, res.status);
  return body as T;
}

export const adminApi = {
  whoami:    () => adminCall<{ email: string; role: string }>('whoami'),
  overview:  (range: string) => adminCall<Overview>('overview', { range }),
  customers: () => adminCall<{ people: Person[]; count: number }>('customers'),
  payments:  () => adminCall<{ payments: PaymentRow[]; count: number }>('payments'),
  leads:     () => adminCall<{ leads: LeadRow[]; count: number }>('leads'),

  grantAccess: (email: string, days: number, productCode: string, fullName?: string) =>
    adminCall<{ ok: boolean; expiresAt: string }>('member.grant', { email, days, productCode, fullName }),
  /** Omit productCode to revoke every entitlement the person holds. */
  revokeAccess: (email: string, productCode?: string) =>
    adminCall<{ ok: boolean }>('member.revoke', { email, productCode }),
  recordPayment: (input: { email: string; name?: string; productCode: string; amountCents: number; date?: string; grantAccess: boolean }) =>
    adminCall<{ ok: boolean; amountCents: number }>('payment.manual', input),

  affiliates:  () => adminCall<{ affiliates: AffiliateRow[]; defaultPct: number }>('affiliates'),
  commissions: () => adminCall<{ commissions: CommissionRow[] }>('commissions'),
  reviewAffiliate: (id: string, status: AffiliateRow['status'], adminNote?: string) =>
    adminCall<{ ok: boolean }>('affiliate.review', { id, status, adminNote }),
  setAffiliateRate: (id: string, commissionPct: number) =>
    adminCall<{ ok: boolean }>('affiliate.rate', { id, commissionPct }),
  setDefaultRate: (commissionPct: number) =>
    adminCall<{ ok: boolean }>('affiliate.defaultRate', { commissionPct }),
  setCommissionStatus: (ids: string[], status: CommissionRow['status']) =>
    adminCall<{ ok: boolean; updated: number }>('commission.status', { ids, status }),
};

// ─── Formatting ───────────────────────────────────────────────────────────────

export function money(cents: number, compact = false): string {
  const dollars = cents / 100;
  if (compact && Math.abs(dollars) >= 1000) {
    return `$${(dollars / 1000).toFixed(dollars >= 10000 ? 0 : 1)}K`;
  }
  return `$${dollars.toLocaleString('en-US', { minimumFractionDigits: dollars % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 })}`;
}

export function compactNumber(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 10_000) return `${Math.round(n / 1000)}K`;
  if (Math.abs(n) >= 1_000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString('en-US');
}

export function relativeTime(iso: string | null): string {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function shortDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
}

/** Builds a CSV file and hands it to the browser as a download. */
export function downloadCsv(filename: string, rows: Record<string, unknown>[]): void {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => escape(r[h])).join(','))].join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
