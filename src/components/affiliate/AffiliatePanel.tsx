/**
 * The Affiliate section of the member dashboard.
 *
 * The programme is hidden until a member applies and an admin approves, so this
 * panel has four faces: the pitch + application form, "under review", a
 * declined/suspended notice, and the live dashboard with links and earnings.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Share2, Copy, Check, Loader2, Clock, ShieldCheck, ShieldOff,
  TrendingUp, Users, MousePointerClick, Wallet, ExternalLink, Info, Send,
} from 'lucide-react';
import { affiliateApi, money, type AffiliateStatus, type AffiliateLink } from '../../lib/affiliateApi';

export function AffiliatePanel({ email, fullName }: { email: string; fullName?: string | null }) {
  const [data, setData] = useState<AffiliateStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await affiliateApi.status());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your affiliate status.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  if (loading) {
    return (
      <div className="flex min-h-[280px] items-center justify-center rounded-3xl border border-white/10 bg-[#0c0c16]/80">
        <Loader2 size={20} className="animate-spin text-volt" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-3xl border border-red-400/25 bg-red-400/5 p-6 text-center">
        <p className="text-sm text-red-200">{error ?? 'Something went wrong.'}</p>
        <button type="button" onClick={() => void load()} className="mt-3 text-xs text-red-300 underline underline-offset-2">
          Try again
        </button>
      </div>
    );
  }

  if (data.status === 'approved') return <ApprovedDashboard data={data} onChanged={load} />;
  if (data.status === 'pending') return <PendingNotice data={data} />;
  if (data.status === 'rejected' || data.status === 'suspended') return <BlockedNotice data={data} />;
  return <ApplyForm data={data} email={email} fullName={fullName} onApplied={setData} />;
}

// ─── 1. Not yet applied ───────────────────────────────────────────────────────

function ApplyForm({
  data, email, fullName, onApplied,
}: { data: AffiliateStatus; email: string; fullName?: string | null; onApplied: (d: AffiliateStatus) => void }) {
  const [name, setName] = useState(fullName ?? '');
  const [payoutMethod, setPayoutMethod] = useState('bank');
  const [payoutDetails, setPayoutDetails] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      onApplied(await affiliateApi.apply({ fullName: name.trim() || undefined, payoutMethod, payoutDetails: payoutDetails.trim(), note: note.trim() }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit your application.');
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-3xl border border-volt/25 bg-gradient-to-br from-[#12121c] to-[#0a0a10] p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-volt/10 blur-[80px]" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-volt/30 bg-volt/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-volt">
            <Share2 size={11} /> Affiliate Program
          </span>
          <h2 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-3xl">
            Earn {data.defaultPct}% on everyone you bring in
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
            Share your link. When someone signs up through it and buys any paid programme, you earn{' '}
            <span className="font-semibold text-volt">{data.defaultPct}% of that sale</span> — including every month
            they stay subscribed to the RoadMap. Attribution lasts {data.cookieDays} days from their first click and
            never expires once they have an account.
          </p>

          <ul className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { Icon: MousePointerClick, title: 'Share your link', body: 'One link per course, plus a universal one.' },
              { Icon: Users, title: 'They sign up & buy', body: 'Tracked automatically to your account.' },
              { Icon: Wallet, title: 'You get paid', body: `${data.defaultPct}% of every purchase they make.` },
            ].map(({ Icon, title, body }) => (
              <li key={title} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <Icon size={16} className="text-volt" />
                <p className="mt-2 text-sm font-semibold text-zinc-100">{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-zinc-500">{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <form onSubmit={submit} className="rounded-3xl border border-white/10 bg-[#0c0c16]/80 p-6 sm:p-7">
        <h3 className="text-base font-bold text-white">Apply to join</h3>
        <p className="mt-1 text-xs text-zinc-500">
          Applications are reviewed by the team. You will see your links here as soon as you are approved.
        </p>

        <div className="mt-5 space-y-4">
          <Field label="Your full name">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="As it should appear on payouts" className={inputClass} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Preferred payout method">
              <select value={payoutMethod} onChange={(e) => setPayoutMethod(e.target.value)} className={inputClass}>
                <option value="bank">Bank transfer</option>
                <option value="paypal">PayPal</option>
                <option value="wise">Wise</option>
                <option value="crypto">Crypto (USDT)</option>
                <option value="other">Other</option>
              </select>
            </Field>
            <Field label="Payout details">
              <input value={payoutDetails} onChange={(e) => setPayoutDetails(e.target.value)} placeholder="IBAN, PayPal email, wallet…" className={inputClass} />
            </Field>
          </div>

          <Field label="How will you promote us?">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Your audience, channels, or community — a couple of lines is plenty."
              className={`${inputClass} resize-none`}
            />
          </Field>
        </div>

        {error && <p className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 px-3 py-2 text-xs text-red-300">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-volt px-5 py-3.5 text-sm font-black uppercase tracking-wide text-void transition hover:bg-volt/90 disabled:opacity-40"
        >
          {busy ? <Loader2 size={16} className="animate-spin" /> : <><Send size={15} /> Submit application</>}
        </button>
        <p className="mt-3 text-center text-[11px] text-zinc-600">Applying as {email}</p>
      </form>
    </div>
  );
}

const inputClass =
  'w-full rounded-xl border border-white/10 bg-[#07070c] px-3.5 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-volt/40 focus:outline-none';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">{label}</label>
      {children}
    </div>
  );
}

// ─── 2 & 3. Waiting / blocked ─────────────────────────────────────────────────

function PendingNotice({ data }: { data: AffiliateStatus }) {
  return (
    <div className="rounded-3xl border border-amber-400/25 bg-amber-400/[0.04] p-8 text-center">
      <Clock size={26} className="mx-auto text-amber-300" />
      <h3 className="mt-4 text-lg font-bold text-white">Your application is under review</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-400">
        The team is looking at it now. Once approved, your links and earnings appear right here — your code is
        reserved but does not track anything until then.
      </p>
      {data.appliedAt && (
        <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
          Applied {new Date(data.appliedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      )}
    </div>
  );
}

function BlockedNotice({ data }: { data: AffiliateStatus }) {
  const suspended = data.status === 'suspended';
  return (
    <div className="rounded-3xl border border-white/10 bg-[#0c0c16]/80 p-8 text-center">
      <ShieldOff size={26} className="mx-auto text-zinc-500" />
      <h3 className="mt-4 text-lg font-bold text-white">
        {suspended ? 'Your affiliate account is paused' : 'Application not approved'}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-400">
        {suspended
          ? 'Your links are inactive for now. Reach out to the team if you think this is a mistake.'
          : 'Thanks for applying. The team did not approve this application.'}
      </p>
      {data.adminNote && (
        <p className="mx-auto mt-4 max-w-md rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-xs text-zinc-400">
          {data.adminNote}
        </p>
      )}
    </div>
  );
}

// ─── 4. Approved ──────────────────────────────────────────────────────────────

function ApprovedDashboard({ data, onChanged }: { data: AffiliateStatus; onChanged: () => void }) {
  const stats = data.stats;
  const conversion = stats && stats.clicks > 0 ? ((stats.sales / stats.clicks) * 100).toFixed(1) : null;

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-volt/25 bg-gradient-to-br from-[#12121c] to-[#0a0a10] p-6 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-volt/30 bg-volt/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-volt">
              <ShieldCheck size={11} /> Approved affiliate
            </span>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Total earned</p>
            <p className="mt-1 text-4xl font-black tracking-tight text-white sm:text-5xl">{money(stats?.earnedCents ?? 0)}</p>
            <p className="mt-2 text-sm text-zinc-400">
              Across {stats?.sales ?? 0} {stats?.sales === 1 ? 'sale' : 'sales'} from {stats?.referrals ?? 0}{' '}
              {stats?.referrals === 1 ? 'signup' : 'signups'} you referred
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4 text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Your rate</p>
            <p className="mt-1 text-3xl font-black text-volt">{data.commissionPct}%</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-zinc-600">Code {data.code}</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#0c0c16]/80 p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Money label="Ready to claim" value={money(stats?.claimableCents ?? 0)} tone="volt" note="Cleared by the team — in the next payout run." />
          <Money label="Under review" value={money(stats?.underReviewCents ?? 0)} note="Recent sales the team has not checked yet." />
          <Money label="Already paid" value={money(stats?.paidCents ?? 0)} note="Transferred to your payout details." />
        </div>
        <p className="mt-5 flex items-start gap-2 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-xs leading-relaxed text-zinc-400">
          <Wallet size={14} className="mt-0.5 shrink-0 text-zinc-500" />
          <span>
            Payouts are sent <strong className="text-zinc-200">manually by the team</strong> to the payout details below,
            once your referrals have been reviewed. Nothing is transferred automatically from this dashboard — these are
            the numbers you can claim.
          </span>
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={MousePointerClick} label="Link clicks" value={String(stats?.clicks ?? 0)} />
        <Stat icon={Users} label="Signed up" value={String(stats?.referrals ?? 0)} />
        <Stat icon={TrendingUp} label="Purchases" value={String(stats?.sales ?? 0)} sub={conversion ? `${conversion}% of clicks` : undefined} />
        <Stat icon={Wallet} label="Sales volume" value={money(stats?.salesVolumeCents ?? 0)} />
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#0c0c16]/80 p-6">
        <h3 className="text-base font-bold text-white">Your links</h3>
        <p className="mt-1 text-xs leading-relaxed text-zinc-500">
          Every link carries the same code, so you earn on whatever they end up buying — the course link just drops
          them on that page first.
        </p>
        <ul className="mt-5 space-y-2.5">
          {(data.links ?? []).map((link) => <LinkRow key={link.code} link={link} />)}
        </ul>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#0c0c16]/80 p-6">
        <h3 className="text-base font-bold text-white">Earnings</h3>
        {!stats?.commissions.length ? (
          <p className="mt-5 rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-zinc-500">
            No commissions yet. They appear here the moment someone buys through your link.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {['Date', 'Referred', 'Product', 'Sale', 'Rate', 'You earn', 'Status'].map((h) => (
                    <th key={h} className="whitespace-nowrap px-3 py-2.5 font-mono text-[10px] uppercase tracking-widest text-zinc-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stats.commissions.map((c) => (
                  <tr key={c.id}>
                    <td className="whitespace-nowrap px-3 py-3 text-xs text-zinc-400">
                      {new Date(c.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </td>
                    <td className="px-3 py-3 text-xs text-zinc-400">{c.email}</td>
                    <td className="px-3 py-3 text-xs text-zinc-300">{c.productLabel}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-xs text-zinc-400" style={{ fontVariantNumeric: 'tabular-nums' }}>{money(c.saleAmountCents)}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-xs text-zinc-500">{c.commissionPct}%</td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm font-bold text-volt" style={{ fontVariantNumeric: 'tabular-nums' }}>{money(c.commissionCents)}</td>
                    <td className="px-3 py-3"><CommissionStatus status={c.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <PayoutEditor data={data} onSaved={onChanged} />
    </div>
  );
}

function Money({ label, value, note, tone }: { label: string; value: string; note: string; tone?: 'volt' }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">{label}</p>
      <p className={`mt-1.5 text-2xl font-black tracking-tight ${tone === 'volt' ? 'text-volt' : 'text-zinc-100'}`} style={{ fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </p>
      <p className="mt-1 text-[11px] leading-relaxed text-zinc-600">{note}</p>
    </div>
  );
}

function Stat({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0c0c16]/80 p-4">
      <Icon size={14} className="text-zinc-500" />
      <p className="mt-2 text-xl font-bold text-white" style={{ fontVariantNumeric: 'tabular-nums' }}>{value}</p>
      <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">{label}</p>
      {sub && <p className="mt-1 text-[11px] text-zinc-600">{sub}</p>}
    </div>
  );
}

function LinkRow({ link }: { link: AffiliateLink }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link.url);
    } catch {
      // clipboard blocked — select the text as a fallback so it can be copied by hand
      const input = document.createElement('input');
      input.value = link.url;
      document.body.appendChild(input);
      input.select();
      document.execCommand?.('copy');
      input.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <li className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-3.5">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <p className="text-sm font-semibold text-zinc-100">{link.label}</p>
          <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">{link.blurb}</span>
        </div>
        <p className="mt-1 truncate font-mono text-[11px] text-volt/80" title={link.url}>{link.url}</p>
      </div>
      <div className="flex shrink-0 gap-2">
        <a
          href={link.url}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-white/10 p-2.5 text-zinc-500 transition hover:border-volt/40 hover:text-volt"
          aria-label={`Open ${link.label} link`}
        >
          <ExternalLink size={14} />
        </a>
        <button
          type="button"
          onClick={copy}
          className={`flex items-center gap-1.5 rounded-lg border px-3.5 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest transition ${
            copied ? 'border-volt bg-volt text-void' : 'border-volt/40 text-volt hover:bg-volt/10'
          }`}
        >
          {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
        </button>
      </div>
    </li>
  );
}

function CommissionStatus({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    pending:  { label: 'Under review',   className: 'border-white/15 text-zinc-400' },
    approved: { label: 'Ready to claim', className: 'border-lilac/30 bg-lilac/10 text-lilac' },
    paid:     { label: 'Paid',           className: 'border-volt/30 bg-volt/10 text-volt' },
    void:     { label: 'Not eligible',   className: 'border-red-400/30 bg-red-400/10 text-red-300' },
  };
  const s = map[status] ?? map.pending;
  return <span className={`whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-medium ${s.className}`}>{s.label}</span>;
}

function PayoutEditor({ data, onSaved }: { data: AffiliateStatus; onSaved: () => void }) {
  const [method, setMethod] = useState(data.payoutMethod ?? 'bank');
  const [details, setDetails] = useState(data.payoutDetails ?? '');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await affiliateApi.savePayout({ payoutMethod: method, payoutDetails: details.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
      onSaved();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="rounded-3xl border border-white/10 bg-[#0c0c16]/80 p-6">
      <h3 className="text-base font-bold text-white">Payout details</h3>
      <p className="mt-1 flex items-start gap-1.5 text-xs leading-relaxed text-zinc-500">
        <Info size={13} className="mt-0.5 shrink-0" />
        The team reviews your referrals, then transfers your cleared earnings to these details by hand.
        Keep them current so nothing is held up.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Method">
          <select value={method} onChange={(e) => setMethod(e.target.value)} className={inputClass}>
            <option value="bank">Bank transfer</option>
            <option value="paypal">PayPal</option>
            <option value="wise">Wise</option>
            <option value="crypto">Crypto (USDT)</option>
            <option value="other">Other</option>
          </select>
        </Field>
        <Field label="Details">
          <input value={details} onChange={(e) => setDetails(e.target.value)} placeholder="IBAN, PayPal email, wallet…" className={inputClass} />
        </Field>
      </div>
      <button
        type="submit"
        disabled={busy}
        className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-volt/40 px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-volt transition hover:bg-volt/10 disabled:opacity-40"
      >
        {busy ? <Loader2 size={14} className="animate-spin" /> : saved ? <><Check size={14} /> Saved</> : 'Save payout details'}
      </button>
    </form>
  );
}
