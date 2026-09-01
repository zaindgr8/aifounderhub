/**
 * /admin → Affiliates.
 *
 * Two views behind one tab: the applicants (approve, reject, suspend, and set
 * each person's commission rate) and the commission ledger (mark batches paid).
 */

import React, { useState, useMemo } from 'react';
import {
  Search, Download, Check, X, Loader2, ShieldCheck, ShieldOff, Clock,
  Percent, Wallet, Users, MousePointerClick,
} from 'lucide-react';
import {
  adminApi, money, shortDate, downloadCsv,
  type AffiliateRow, type CommissionRow,
} from '../../lib/adminApi';
import { Chip } from './AdminTables';

type View = 'applicants' | 'ledger';

export function AffiliatesTable({
  affiliates, commissions, defaultPct, onChanged,
}: {
  affiliates: AffiliateRow[];
  commissions: CommissionRow[];
  defaultPct: number;
  onChanged: () => void;
}) {
  const [view, setView] = useState<View>('applicants');
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(key: string, fn: () => Promise<unknown>) {
    setBusy(key);
    setError(null);
    try {
      await fn();
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That did not work.');
    } finally {
      setBusy(null);
    }
  }

  const pending = affiliates.filter((a) => a.status === 'pending').length;
  // Payouts leave this system by hand, so the ledger is a review queue:
  // review what was earned, approve it, transfer it, then mark it paid.
  const toReview = commissions.filter((c) => c.status === 'pending').reduce((sum, c) => sum + c.commissionCents, 0);
  const readyToPay = commissions.filter((c) => c.status === 'approved').reduce((sum, c) => sum + c.commissionCents, 0);

  return (
    <div className="space-y-4">
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Summary icon={Users} label="Affiliates" value={String(affiliates.filter((a) => a.status === 'approved').length)} sub={pending ? `${pending} awaiting review` : 'None awaiting review'} />
        <Summary icon={MousePointerClick} label="Referred signups" value={String(affiliates.reduce((s, a) => s + a.referrals, 0))} />
        <Summary icon={Wallet} label="Ready to pay out" value={money(readyToPay)} sub={`${money(toReview)} still to review`} accent />
        <DefaultRateCard defaultPct={defaultPct} busy={busy === 'default'} onSave={(pct) => run('default', () => adminApi.setDefaultRate(pct))} />
      </section>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-xl border border-edge p-0.5">
          {(['applicants', 'ledger'] as View[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`rounded-lg px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition ${
                view === v ? 'bg-volt text-void' : 'text-zinc-500 hover:text-zinc-200'
              }`}
            >
              {v === 'applicants' ? `Affiliates (${affiliates.length})` : `Commissions (${commissions.length})`}
            </button>
          ))}
        </div>
        <div className="relative min-w-[200px] flex-1">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={view === 'applicants' ? 'Search by email, name or code…' : 'Search by affiliate, buyer or product…'}
            className="w-full rounded-xl border border-edge bg-panel/80 py-2 pl-9 pr-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-volt/40 focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() =>
            view === 'applicants'
              ? downloadCsv(`aifh-affiliates-${new Date().toISOString().slice(0, 10)}.csv`, affiliates.map((a) => ({
                  email: a.email, name: a.fullName ?? '', code: a.code, status: a.status, rate_pct: a.commissionPct,
                  clicks: a.clicks, referrals: a.referrals, sales: a.sales,
                  sales_volume_usd: (a.salesVolumeCents / 100).toFixed(2),
                  earned_usd: (a.earnedCents / 100).toFixed(2), unpaid_usd: (a.unpaidCents / 100).toFixed(2),
                  payout_method: a.payoutMethod ?? '', payout_details: a.payoutDetails ?? '', applied: a.appliedAt,
                })))
              : downloadCsv(`aifh-commissions-${new Date().toISOString().slice(0, 10)}.csv`, commissions.map((c) => ({
                  date: c.date, affiliate: c.affiliateEmail, code: c.affiliateCode, buyer: c.buyerEmail,
                  product: c.productLabel, sale_usd: (c.saleAmountCents / 100).toFixed(2), rate_pct: c.commissionPct,
                  commission_usd: (c.commissionCents / 100).toFixed(2), status: c.status, paid_at: c.paidAt ?? '',
                })))
          }
          className="flex items-center gap-1.5 rounded-lg border border-edge px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-zinc-500 transition hover:border-volt/40 hover:text-volt"
        >
          <Download size={12} /> CSV
        </button>
      </div>

      {error && <p className="rounded-xl border border-red-400/30 bg-red-400/10 px-3 py-2 text-xs text-red-300">{error}</p>}

      {view === 'applicants'
        ? <ApplicantsView rows={affiliates} search={search} busy={busy} run={run} />
        : <LedgerView rows={commissions} search={search} busy={busy} run={run} />}
    </div>
  );
}

function Summary({ icon: Icon, label, value, sub, accent }: { icon: React.ElementType; label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border bg-panel/80 p-4 ${accent ? 'border-volt/30' : 'border-edge'}`}>
      <Icon size={14} className="text-zinc-500" />
      <p className="mt-2 text-xl font-semibold text-zinc-50" style={{ fontVariantNumeric: 'tabular-nums' }}>{value}</p>
      <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">{label}</p>
      {sub && <p className="mt-1 text-[11px] text-zinc-600">{sub}</p>}
    </div>
  );
}

/** Programme default for future applicants — existing affiliates keep their own rate. */
function DefaultRateCard({ defaultPct, busy, onSave }: { defaultPct: number; busy: boolean; onSave: (pct: number) => void }) {
  const [value, setValue] = useState(String(defaultPct));
  const dirty = Number(value) !== defaultPct && value !== '';

  return (
    <div className="rounded-2xl border border-edge bg-panel/80 p-4">
      <Percent size={14} className="text-zinc-500" />
      <div className="mt-2 flex items-center gap-2">
        <input
          type="number" min={0} max={100} step={0.5} value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-20 rounded-lg border border-edge bg-void px-2 py-1 text-xl font-semibold text-zinc-50 focus:border-volt/40 focus:outline-none"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        />
        {dirty && (
          <button
            type="button"
            onClick={() => onSave(Number(value))}
            disabled={busy}
            className="rounded-lg border border-volt/40 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-widest text-volt transition hover:bg-volt/10 disabled:opacity-40"
          >
            {busy ? <Loader2 size={11} className="animate-spin" /> : 'Save'}
          </button>
        )}
      </div>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">Default rate %</p>
      <p className="mt-1 text-[11px] text-zinc-600">New applicants only</p>
    </div>
  );
}

// ─── Applicants ───────────────────────────────────────────────────────────────

function ApplicantsView({
  rows, search, busy, run,
}: { rows: AffiliateRow[]; search: string; busy: string | null; run: (k: string, fn: () => Promise<unknown>) => Promise<void> }) {
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((a) => a.email.includes(q) || (a.fullName ?? '').toLowerCase().includes(q) || a.code.toLowerCase().includes(q));
  }, [rows, search]);

  if (!filtered.length) {
    return (
      <div className="rounded-2xl border border-dashed border-edge px-4 py-16 text-center text-sm text-zinc-500">
        {rows.length === 0 ? 'Nobody has applied to the affiliate program yet.' : 'No affiliates match that search.'}
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {filtered.map((a) => <ApplicantCard key={a.id} affiliate={a} busy={busy} run={run} />)}
    </div>
  );
}

function ApplicantCard({
  affiliate: a, busy, run,
}: { affiliate: AffiliateRow; busy: string | null; run: (k: string, fn: () => Promise<unknown>) => Promise<void> }) {
  const [rate, setRate] = useState(String(a.commissionPct));
  const rateDirty = Number(rate) !== a.commissionPct && rate !== '';

  const statusChip = {
    pending:   <Chip tone="neutral"><Clock size={10} />Pending review</Chip>,
    approved:  <Chip tone="volt"><ShieldCheck size={10} />Approved</Chip>,
    rejected:  <Chip tone="danger"><X size={10} />Rejected</Chip>,
    suspended: <Chip tone="muted"><ShieldOff size={10} />Suspended</Chip>,
  }[a.status];

  return (
    <article className="rounded-2xl border border-edge bg-panel/80 p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-zinc-100">{a.fullName || a.email}</p>
            {statusChip}
            <Chip tone="lilac">{a.code}</Chip>
          </div>
          <p className="mt-1 text-xs text-zinc-500">{a.email} · applied {shortDate(a.appliedAt)}</p>
          {a.applicantNote && <p className="mt-2 max-w-xl rounded-lg border border-edge bg-white/[0.02] px-3 py-2 text-xs leading-relaxed text-zinc-400">{a.applicantNote}</p>}
          {(a.payoutMethod || a.payoutDetails) && (
            <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
              Payout: {a.payoutMethod ?? '—'} · {a.payoutDetails || 'no details yet'}
            </p>
          )}
        </div>

        <div className="grid shrink-0 grid-cols-4 gap-4 text-right">
          <Metric label="Clicks" value={String(a.clicks)} />
          <Metric label="Signups" value={String(a.referrals)} />
          <Metric label="Sales" value={String(a.sales)} />
          <Metric label="Earned" value={money(a.earnedCents)} accent />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-edge pt-4">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Rate</span>
          <input
            type="number" min={0} max={100} step={0.5} value={rate}
            onChange={(e) => setRate(e.target.value)}
            className="w-16 rounded-lg border border-edge bg-void px-2 py-1.5 text-sm text-zinc-100 focus:border-volt/40 focus:outline-none"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          />
          <span className="text-xs text-zinc-500">%</span>
          {rateDirty && (
            <button
              type="button"
              onClick={() => run(`rate-${a.id}`, () => adminApi.setAffiliateRate(a.id, Number(rate)))}
              disabled={busy === `rate-${a.id}`}
              className="ml-1 rounded-lg border border-volt/40 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-widest text-volt transition hover:bg-volt/10 disabled:opacity-40"
            >
              {busy === `rate-${a.id}` ? <Loader2 size={11} className="animate-spin" /> : 'Save rate'}
            </button>
          )}
        </div>

        <div className="ml-auto flex flex-wrap gap-2">
          {a.status !== 'approved' && (
            <Action tone="volt" busy={busy === `approve-${a.id}`} onClick={() => run(`approve-${a.id}`, () => adminApi.reviewAffiliate(a.id, 'approved'))}>
              <Check size={13} /> Approve
            </Action>
          )}
          {a.status === 'approved' && (
            <Action tone="muted" busy={busy === `suspend-${a.id}`} onClick={() => run(`suspend-${a.id}`, () => adminApi.reviewAffiliate(a.id, 'suspended'))}>
              <ShieldOff size={13} /> Suspend
            </Action>
          )}
          {a.status !== 'rejected' && (
            <Action tone="danger" busy={busy === `reject-${a.id}`} onClick={() => run(`reject-${a.id}`, () => adminApi.reviewAffiliate(a.id, 'rejected'))}>
              <X size={13} /> Reject
            </Action>
          )}
        </div>
      </div>
    </article>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className={`text-sm font-semibold ${accent ? 'text-volt' : 'text-zinc-100'}`} style={{ fontVariantNumeric: 'tabular-nums' }}>{value}</p>
      <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600">{label}</p>
    </div>
  );
}

function Action({ children, onClick, busy, tone }: { children: React.ReactNode; onClick: () => void; busy?: boolean; tone: 'volt' | 'danger' | 'muted' }) {
  const tones = {
    volt: 'border-volt/40 text-volt hover:bg-volt/10',
    danger: 'border-red-400/30 text-red-300 hover:bg-red-400/10',
    muted: 'border-edge text-zinc-400 hover:bg-white/[0.03]',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition disabled:opacity-40 ${tones[tone]}`}
    >
      {busy ? <Loader2 size={13} className="animate-spin" /> : children}
    </button>
  );
}

// ─── Commission ledger ────────────────────────────────────────────────────────

function LedgerView({
  rows, search, busy, run,
}: { rows: CommissionRow[]; search: string; busy: string | null; run: (k: string, fn: () => Promise<unknown>) => Promise<void> }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((c) => c.affiliateEmail.toLowerCase().includes(q) || c.buyerEmail.toLowerCase().includes(q) || c.productLabel.toLowerCase().includes(q) || c.affiliateCode.toLowerCase().includes(q));
  }, [rows, search]);

  const toggle = (id: string) => setSelected((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const selectedTotal = filtered.filter((c) => selected.has(c.id)).reduce((s, c) => s + c.commissionCents, 0);

  if (!filtered.length) {
    return (
      <div className="rounded-2xl border border-dashed border-edge px-4 py-16 text-center text-sm text-zinc-500">
        {rows.length === 0 ? 'No commissions yet. They appear the moment a referred customer completes a payment.' : 'No commissions match that search.'}
      </div>
    );
  }

  return (
    <>
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-volt/30 bg-volt/[0.06] px-4 py-3">
          <p className="text-sm text-zinc-200">
            <span className="font-semibold">{selected.size}</span> selected · <span className="font-semibold text-volt">{money(selectedTotal)}</span>
          </p>
          <div className="ml-auto flex flex-wrap gap-2">
            <Action tone="muted" busy={busy === 'approve'} onClick={() => run('approve', async () => { await adminApi.setCommissionStatus([...selected], 'approved'); setSelected(new Set()); })}>
              <Check size={13} /> Approve for payout
            </Action>
            <Action tone="volt" busy={busy === 'pay'} onClick={() => run('pay', async () => { await adminApi.setCommissionStatus([...selected], 'paid'); setSelected(new Set()); })}>
              <Wallet size={13} /> Mark as paid
            </Action>
            <Action tone="danger" busy={busy === 'void'} onClick={() => run('void', async () => { await adminApi.setCommissionStatus([...selected], 'void'); setSelected(new Set()); })}>
              <X size={13} /> Reject
            </Action>
          </div>
        </div>
      )}

      <p className="rounded-xl border border-edge bg-panel/60 px-4 py-2.5 text-xs leading-relaxed text-zinc-500">
        Money is transferred outside this system. Review a commission, <span className="text-zinc-300">approve</span> it
        so the affiliate sees it as claimable, send the transfer yourself, then{' '}
        <span className="text-zinc-300">mark it paid</span>.
      </p>

      <div className="overflow-x-auto rounded-2xl border border-edge">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-[#12121c]">
            <tr>
              <th className="w-10 px-4 py-3" />
              {['Date', 'Affiliate', 'Buyer', 'Product', 'Sale', 'Rate', 'Commission', 'Status'].map((h) => (
                <th key={h} className="whitespace-nowrap px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-widest text-zinc-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-edge">
            {filtered.map((c) => (
              <tr key={c.id} className="transition hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(c.id)}
                    onChange={() => toggle(c.id)}
                    className="h-4 w-4 accent-[#ccf244]"
                    aria-label={`Select commission for ${c.affiliateEmail}`}
                  />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-400">{shortDate(c.date)}</td>
                <td className="px-4 py-3">
                  <p className="text-xs text-zinc-200">{c.affiliateEmail}</p>
                  <p className="font-mono text-[10px] text-zinc-600">{c.affiliateCode}</p>
                </td>
                <td className="px-4 py-3 text-xs text-zinc-400">{c.buyerEmail}</td>
                <td className="px-4 py-3"><Chip tone="lilac">{c.productLabel}</Chip></td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-400" style={{ fontVariantNumeric: 'tabular-nums' }}>{money(c.saleAmountCents)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-500">{c.commissionPct}%</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-volt" style={{ fontVariantNumeric: 'tabular-nums' }}>{money(c.commissionCents)}</td>
                <td className="px-4 py-3">
                  {c.status === 'paid' ? <Chip tone="volt"><Check size={10} />Paid</Chip>
                    : c.status === 'void' ? <Chip tone="danger">Rejected</Chip>
                    : c.status === 'approved' ? <Chip tone="lilac">Ready to pay</Chip>
                    : <Chip tone="muted">To review</Chip>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
