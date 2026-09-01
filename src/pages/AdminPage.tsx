/**
 * /admin — the operator dashboard.
 *
 * Answers the four questions the business actually asks: how many people signed
 * up, who bought what and on which package, where those people came from, and
 * what is owed/expiring next.
 *
 * Access is gated twice: the page needs a Supabase session, and every API call
 * is re-checked server-side against the admin allowlist. Nothing here trusts
 * the client.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, Users, CreditCard, UserPlus, RefreshCw, LogOut,
  Loader2, ShieldAlert, AlertTriangle, TrendingUp, Database, Zap, Mail, ArrowRight,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { signOut } from '../lib/auth';
import { supabase } from '../lib/supabase';
import {
  adminApi, AdminError, money, compactNumber, relativeTime,
  type Overview, type Person, type PaymentRow, type LeadRow,
} from '../lib/adminApi';
import { ChartCard, StatTile, ColumnChart, BarList, Funnel, MiniTable } from '../components/admin/AdminCharts';
import { CustomersTable, OrdersTable, LeadsTable, Chip } from '../components/admin/AdminTables';

type Tab = 'overview' | 'customers' | 'orders' | 'leads';
type Range = '7d' | '30d' | '90d' | 'all';

const TABS: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id: 'overview',  label: 'Overview',  Icon: LayoutDashboard },
  { id: 'customers', label: 'Customers', Icon: Users },
  { id: 'orders',    label: 'Orders',    Icon: CreditCard },
  { id: 'leads',     label: 'Leads',     Icon: UserPlus },
];

const RANGES: { id: Range; label: string }[] = [
  { id: '7d', label: '7 days' },
  { id: '30d', label: '30 days' },
  { id: '90d', label: '90 days' },
  { id: 'all', label: 'All time' },
];

function readTab(): Tab {
  const hash = window.location.hash.replace('#', '') as Tab;
  return TABS.some((t) => t.id === hash) ? hash : 'overview';
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [gate, setGate] = useState<'checking' | 'allowed' | 'denied'>('checking');
  const [gateError, setGateError] = useState<string | null>(null);
  const [role, setRole] = useState<string>('admin');

  const [tab, setTab] = useState<Tab>(readTab);
  const [range, setRange] = useState<Range>('30d');

  const [overview, setOverview] = useState<Overview | null>(null);
  const [people, setPeople] = useState<Person[] | null>(null);
  const [payments, setPayments] = useState<PaymentRow[] | null>(null);
  const [leads, setLeads] = useState<LeadRow[] | null>(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep the tab in the URL so a view can be linked and the back button works.
  useEffect(() => {
    const onHash = () => setTab(readTab());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const selectTab = (next: Tab) => {
    window.location.hash = next;
    setTab(next);
  };

  // ── Access check ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return;
    if (!user) { setGate('denied'); setGateError(null); return; }
    let cancelled = false;
    adminApi.whoami()
      .then((me) => { if (!cancelled) { setRole(me.role); setGate('allowed'); } })
      .catch((err: unknown) => {
        if (cancelled) return;
        setGate('denied');
        setGateError(err instanceof AdminError ? err.message : 'Could not verify this account.');
      });
    return () => { cancelled = true; };
  }, [user, authLoading]);

  // ── Data loading ────────────────────────────────────────────────────────────
  const load = useCallback(async (which: Tab, forRange: Range) => {
    setBusy(true);
    setError(null);
    try {
      if (which === 'overview') setOverview(await adminApi.overview(forRange));
      if (which === 'customers') setPeople((await adminApi.customers()).people);
      if (which === 'orders') setPayments((await adminApi.payments()).payments);
      if (which === 'leads') setLeads((await adminApi.leads()).leads);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load that view.');
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    if (gate !== 'allowed') return;
    void load(tab, range);
  }, [gate, tab, range, load]);

  const refresh = () => void load(tab, range);

  // ── Gates ───────────────────────────────────────────────────────────────────
  if (authLoading || (user && gate === 'checking')) return <FullPage><Loader2 size={22} className="animate-spin text-volt" /><p className="mt-3 font-mono text-xs uppercase tracking-widest text-zinc-500">Checking access</p></FullPage>;
  if (!user) return <SignInGate />;
  if (gate === 'denied') return <DeniedGate email={user.email ?? ''} reason={gateError} />;

  const hasData = (tab === 'overview' && overview) || (tab === 'customers' && people) || (tab === 'orders' && payments) || (tab === 'leads' && leads);

  return (
    <div className="min-h-screen bg-void text-zinc-100">
      <Header email={user.email ?? ''} role={role} tab={tab} onTab={selectTab} />

      <main className="mx-auto max-w-[1400px] px-4 pb-20 pt-6 sm:px-6">
        {/* Filters scope everything below them; they sit in one row above the content. */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {tab === 'overview' && (
              <div className="flex rounded-xl border border-edge p-0.5">
                {RANGES.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRange(r.id)}
                    className={`rounded-lg px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition ${
                      range === r.id ? 'bg-volt text-void' : 'text-zinc-500 hover:text-zinc-200'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {overview && tab === 'overview' && (
              <span className="hidden font-mono text-[10px] uppercase tracking-widest text-zinc-600 sm:inline">
                Updated {relativeTime(overview.generatedAt)}
              </span>
            )}
            <button
              type="button"
              onClick={refresh}
              disabled={busy}
              className="flex items-center gap-1.5 rounded-lg border border-edge px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-zinc-500 transition hover:border-volt/40 hover:text-volt disabled:opacity-50"
            >
              <RefreshCw size={12} className={busy ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-400/30 bg-red-400/5 p-4">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-400" />
            <div>
              <p className="text-sm font-medium text-red-200">{error}</p>
              <button type="button" onClick={refresh} className="mt-1 text-xs text-red-300 underline underline-offset-2">Try again</button>
            </div>
          </div>
        )}

        {/* Refetch keeps the frame: the previous render stays put at reduced opacity. */}
        <div className={busy && hasData ? 'pointer-events-none opacity-50 transition-opacity' : 'transition-opacity'}>
          {!hasData && busy && <SkeletonGrid />}
          {tab === 'overview' && overview && <OverviewTab data={overview} range={range} />}
          {tab === 'customers' && people && <CustomersTable people={people} onChanged={refresh} />}
          {tab === 'orders' && payments && <OrdersTable payments={payments} onChanged={refresh} />}
          {tab === 'leads' && leads && <LeadsTable leads={leads} />}
        </div>
      </main>
    </div>
  );
}

// ─── Overview ─────────────────────────────────────────────────────────────────

function OverviewTab({ data, range }: { data: Overview; range: Range }) {
  const { kpis, series, health } = data;
  const rangeLabel = RANGES.find((r) => r.id === range)?.label.toLowerCase() ?? '';

  const signupTrend = series.map((s) => s.signups);
  const revenueTrend = series.map((s) => s.revenueCents);
  const leadTrend = series.map((s) => s.leads);

  return (
    <div className="space-y-6">
      <SetupNotice health={health} />

      {/* Hero figure — the one number the dashboard leads with. */}
      <section className="rounded-2xl border border-volt/25 bg-gradient-to-br from-panel to-[#0a0a10] p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-volt">Total revenue · all time</p>
            <p className="mt-2 text-5xl font-semibold tracking-tight text-zinc-50 sm:text-6xl">{money(kpis.revenueCents.allTime ?? 0)}</p>
            <p className="mt-2 text-sm text-zinc-400">
              {money(kpis.revenueCents.value)} in the last {rangeLabel} ·{' '}
              <span className="text-zinc-300">{kpis.payingCustomers.allTime} paying {kpis.payingCustomers.allTime === 1 ? 'customer' : 'customers'}</span>
            </p>
          </div>
          <div className="flex gap-6">
            <HeroStat label="Signups" value={compactNumber(kpis.signups.allTime ?? 0)} />
            <HeroStat label="Leads" value={compactNumber(kpis.leads.allTime ?? 0)} />
            <HeroStat label="Active members" value={compactNumber(kpis.activeMembers.value)} />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile accent label={`Revenue · ${rangeLabel}`} value={money(kpis.revenueCents.value)} deltaPct={kpis.revenueCents.deltaPct} trend={revenueTrend} />
        <StatTile label={`New signups · ${rangeLabel}`} value={compactNumber(kpis.signups.value)} deltaPct={kpis.signups.deltaPct} trend={signupTrend} />
        <StatTile label={`New leads · ${rangeLabel}`} value={compactNumber(kpis.leads.value)} deltaPct={kpis.leads.deltaPct} trend={leadTrend} />
        <StatTile label={`Buyers · ${rangeLabel}`} value={compactNumber(kpis.payingCustomers.value)} deltaPct={kpis.payingCustomers.deltaPct} sublabel={`${kpis.payingCustomers.allTime} all time`} />
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Monthly recurring revenue" value={money(kpis.mrrCents.value)} sublabel="Active memberships × price" />
        <StatTile label="Active members" value={compactNumber(kpis.activeMembers.value)} sublabel={`${kpis.lapsedMembers.value} lapsed or cancelled`} />
        <StatTile label="Signup → paid conversion" value={`${kpis.conversionPct.value}%`} sublabel="Of all accounts created" />
        <StatTile label="Average order value" value={money(kpis.aovCents.value)} sublabel={kpis.pendingPayments.value > 0 ? `${kpis.pendingPayments.value} checkout(s) pending` : 'All checkouts settled'} />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          title="New signups per day"
          subtitle={`Accounts created · last ${Math.min(series.length, 90)} days`}
          tableView={<MiniTable head={['Date', 'Signups']} rows={series.filter((s) => s.signups).map((s) => [s.date, s.signups])} />}
        >
          <ColumnChart data={series.map((s) => ({ date: s.date, value: s.signups }))} formatValue={(n) => String(Math.round(n))} emptyMessage="No signups in this range." />
        </ChartCard>

        <ChartCard
          title="Revenue per day"
          subtitle="Completed payments only"
          tableView={<MiniTable head={['Date', 'Revenue', 'Orders']} rows={series.filter((s) => s.revenueCents).map((s) => [s.date, money(s.revenueCents), s.orders])} />}
        >
          <ColumnChart data={series.map((s) => ({ date: s.date, value: s.revenueCents }))} formatValue={(n) => money(n, true)} emptyMessage="No payments recorded in this range." />
        </ChartCard>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Acquisition funnel" subtitle="All time, stage by stage">
          <Funnel stages={data.funnel} />
        </ChartCard>

        <ChartCard
          title="Revenue by package"
          subtitle={`Who bought what · last ${rangeLabel}`}
          tableView={<MiniTable head={['Package', 'Revenue', 'Orders', 'Customers']} rows={data.byPackage.map((p) => [p.label, money(p.revenueCents), p.orders, p.customers])} />}
        >
          <BarList
            rows={data.byPackage.map((p) => ({ label: p.label, value: p.revenueCents, meta: `· ${p.orders} order${p.orders === 1 ? '' : 's'}` }))}
            formatValue={(n) => money(n)}
            emptyMessage="No package revenue in this range."
          />
        </ChartCard>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          title="Where leads come from"
          subtitle={`Form submissions · last ${rangeLabel}`}
          tableView={<MiniTable head={['Source', 'Leads']} rows={data.bySource.map((s) => [s.source, s.count])} />}
        >
          <BarList rows={data.bySource.slice(0, 8).map((s) => ({ label: s.source, value: s.count }))} formatValue={(n) => String(n)} emptyMessage="No leads captured in this range yet." />
        </ChartCard>

        <ChartCard title="Recent activity" subtitle="Newest first, across every source">
          <ActivityFeed items={data.activity} />
        </ChartCard>
      </section>
    </div>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-zinc-100">{value}</p>
    </div>
  );
}

function ActivityFeed({ items }: { items: Overview['activity'] }) {
  if (!items.length) {
    return <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-edge text-xs text-zinc-500">Nothing has happened yet.</div>;
  }
  const meta = {
    signup:  { label: 'signed up', Icon: UserPlus, tone: 'volt' as const },
    payment: { label: 'paid for', Icon: CreditCard, tone: 'lilac' as const },
    lead:    { label: 'submitted a form', Icon: TrendingUp, tone: 'neutral' as const },
    booking: { label: 'booked a session', Icon: Zap, tone: 'neutral' as const },
  };
  return (
    <ul className="max-h-[320px] space-y-1 overflow-y-auto pr-1">
      {items.map((a, i) => {
        const m = meta[a.type];
        return (
          <li key={`${a.type}-${a.email}-${i}`} className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-white/[0.02]">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-edge bg-white/[0.03] text-zinc-400">
              <m.Icon size={13} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-zinc-300">
                <span className="font-medium text-zinc-100">{a.name || a.email}</span> {m.label}{' '}
                <span className="text-zinc-500">{a.detail}</span>
              </p>
              <p className="truncate text-[10px] text-zinc-600">{a.email}</p>
            </div>
            <div className="shrink-0 text-right">
              {a.amountCents ? <p className="text-xs font-semibold text-zinc-100">{money(a.amountCents)}</p> : null}
              <p className="font-mono text-[10px] text-zinc-600">{relativeTime(a.at)}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** Surfaces the two things that silently make this dashboard under-report. */
function SetupNotice({ health }: { health: Overview['health'] }) {
  const issues: { title: string; detail: string }[] = [];
  if (!health.supabase) {
    issues.push({ title: 'Supabase is not configured on the server', detail: 'Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY — without them nothing can be read.' });
  }
  if (!health.migration0003) {
    issues.push({
      title: 'Migration 0003 has not been applied',
      detail: 'Run supabase/migrations/0003_admin_analytics.sql in the Supabase SQL editor. Until then, workshop and session leads fall back to a generic goal and package attribution is inferred rather than stored.',
    });
  }
  if (health.paymentsRecorded === 0) {
    issues.push({
      title: 'No payments on record',
      detail: 'Checkouts are now written to the payments table automatically. Sales made before today can be added from Orders → Record payment.',
    });
  }
  if (!issues.length) return null;

  return (
    <section className="rounded-2xl border border-lilac/25 bg-lilac/[0.04] p-5">
      <div className="mb-3 flex items-center gap-2">
        <Database size={14} className="text-lilac" />
        <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-lilac">Setup — {issues.length} thing{issues.length === 1 ? '' : 's'} to finish</h3>
      </div>
      <ul className="space-y-2.5">
        {issues.map((i) => (
          <li key={i.title}>
            <p className="text-sm font-medium text-zinc-100">{i.title}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-zinc-400">{i.detail}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ─── Chrome ───────────────────────────────────────────────────────────────────

function Header({ email, role, tab, onTab }: { email: string; role: string; tab: Tab; onTab: (t: Tab) => void }) {
  return (
    <header className="sticky top-0 z-50 border-b border-edge bg-void/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3.5 sm:px-6">
        <a href="/" className="flex items-center gap-2.5">
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-volt">⚡ AI Founder Hub</span>
          <Chip tone="neutral">Admin</Chip>
        </a>

        <nav className="order-3 flex w-full gap-1 overflow-x-auto sm:order-none sm:w-auto">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onTab(id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
                tab === id ? 'bg-white/[0.06] text-volt' : 'text-zinc-500 hover:text-zinc-200'
              }`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="max-w-[180px] truncate text-xs text-zinc-300">{email}</p>
            <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600">{role}</p>
          </div>
          <button
            type="button"
            onClick={() => { void signOut().then(() => window.location.reload()); }}
            className="rounded-lg border border-edge p-2 text-zinc-500 transition hover:border-red-400/40 hover:text-red-300"
            aria-label="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}

function FullPage({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen flex-col items-center justify-center bg-void px-4 text-center">{children}</div>;
}

// The only email allowed to access /admin
const ADMIN_EMAIL = 'zangbang360@gmail.com';

function SignInGate() {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Read auth error from URL hash (e.g. otp_expired after clicking a stale link)
  const hashError = (() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    return params.get('error_description')?.replace(/\+/g, ' ') ?? null;
  })();

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithOtp({
      email: ADMIN_EMAIL,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/admin`,
      },
    });
    setBusy(false);
    if (err) {
      setError(err.message);
    } else {
      setSent(true);
      // Clear the hash so a stale error from a previous attempt doesn't confuse
      window.history.replaceState(null, '', '/admin');
    }
  }

  return (
    <FullPage>
      <div className="w-full max-w-sm rounded-2xl border border-edge bg-panel p-7 text-left">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-volt">⚡ AI Founder Hub</p>
        <h1 className="mt-2 text-xl font-semibold text-zinc-50">Admin sign in</h1>
        <p className="mt-1 text-xs text-zinc-500">Restricted to authorised accounts only.</p>

        {/* Stale link error from URL hash */}
        {hashError && !sent && (
          <div className="mt-4 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-300">
            ⚠️ {hashError}. Please request a fresh link below.
          </div>
        )}

        {sent ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-emerald-500/25 bg-emerald-950/30 p-4 text-center">
              <Mail size={22} className="mx-auto mb-2 text-emerald-400" />
              <p className="text-sm font-semibold text-emerald-200">Check your email</p>
              <p className="mt-1 text-xs text-zinc-400">
                A sign-in link has been sent to{' '}
                <span className="font-mono text-zinc-200">{ADMIN_EMAIL}</span>.
                <br />Click the link in the email to access the admin panel.
              </p>
              <p className="mt-2 text-[10px] text-zinc-600">The link expires in 60 minutes. Use the most recent email.</p>
            </div>
            <button
              type="button"
              onClick={() => { setSent(false); setError(null); }}
              className="w-full text-center text-xs text-zinc-600 hover:text-zinc-400 transition"
            >
              ← Send another link
            </button>
          </div>
        ) : (
          <form onSubmit={sendLink} className="mt-6 space-y-3">
            <div className="rounded-xl border border-edge bg-void px-3 py-2.5 flex items-center gap-2">
              <Mail size={14} className="shrink-0 text-zinc-500" />
              <span className="text-sm text-zinc-300 font-mono">{ADMIN_EMAIL}</span>
            </div>
            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-volt px-4 py-3 text-sm font-bold text-void transition hover:bg-volt/90 disabled:opacity-40"
            >
              {busy
                ? <Loader2 size={15} className="animate-spin" />
                : <><ArrowRight size={14} /> Send sign-in link</>
              }
            </button>
          </form>
        )}

        {error && <p className="mt-3 rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-xs text-red-300">{error}</p>}
      </div>
    </FullPage>
  );
}

function DeniedGate({ email, reason }: { email: string; reason: string | null }) {
  return (
    <FullPage>
      <div className="w-full max-w-md rounded-2xl border border-red-400/25 bg-panel p-7">
        <ShieldAlert size={26} className="mx-auto text-red-400" />
        <h1 className="mt-4 text-lg font-semibold text-zinc-50">Not an admin account</h1>
        <p className="mt-2 text-sm text-zinc-400">
          {reason ?? 'This account is not on the admin allowlist.'}
        </p>
        <p className="mt-3 break-all font-mono text-xs text-zinc-600">{email}</p>
        <p className="mt-4 text-xs leading-relaxed text-zinc-500">
          Add this address to the <code className="text-zinc-400">ADMIN_EMAILS</code> environment variable, or insert it into the
          <code className="text-zinc-400"> admin_users</code> table, then sign in again.
        </p>
        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={() => { void signOut().then(() => window.location.reload()); }}
            className="flex-1 rounded-xl border border-edge px-4 py-2.5 text-sm text-zinc-300 transition hover:border-volt/40 hover:text-volt"
          >
            Switch account
          </button>
          <a href="/" className="flex-1 rounded-xl border border-edge px-4 py-2.5 text-center text-sm text-zinc-300 transition hover:border-volt/40 hover:text-volt">
            Back to site
          </a>
        </div>
      </div>
    </FullPage>
  );
}

function SkeletonGrid() {
  return (
    <div className="space-y-6">
      <div className="h-40 animate-pulse rounded-2xl border border-edge bg-panel/60" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 animate-pulse rounded-2xl border border-edge bg-panel/60" />)}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-64 animate-pulse rounded-2xl border border-edge bg-panel/60" />)}
      </div>
    </div>
  );
}

export default AdminPage;
