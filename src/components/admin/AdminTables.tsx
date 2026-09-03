/**
 * Table views for /admin — customers, orders and leads — plus the person
 * drawer and the "record a payment" dialog.
 *
 * The whole dataset is loaded once per tab and filtered in the browser: at this
 * scale (hundreds of rows) that is instant and keeps search/sort snappy without
 * a query API.
 */

import React, { useState, useMemo } from 'react';
import {
  Search, Download, X, CheckCircle2, Clock, XCircle, RotateCcw,
  Plus, ShieldCheck, ShieldOff, Mail, Phone, Ticket, ExternalLink, Loader2,
  UserCheck, Award, BookOpen, Map, Sparkles,
} from 'lucide-react';
import {
  adminApi, money, relativeTime, shortDate, downloadCsv, GRANTABLE_PRODUCTS,
  type Person, type PaymentRow, type LeadRow,
} from '../../lib/adminApi';

// ─── Shared bits ──────────────────────────────────────────────────────────────

export function Chip({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'volt' | 'lilac' | 'danger' | 'muted' }) {
  const tones = {
    neutral: 'border-edge bg-white/[0.03] text-zinc-300',
    volt: 'border-volt/30 bg-volt/10 text-volt',
    lilac: 'border-lilac/30 bg-lilac/10 text-lilac',
    danger: 'border-red-400/30 bg-red-400/10 text-red-300',
    muted: 'border-edge bg-transparent text-zinc-500',
  };
  return <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-medium ${tones[tone]}`}>{children}</span>;
}

function Toolbar({ search, onSearch, placeholder, children }: { search: string; onSearch: (v: string) => void; placeholder: string; children?: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <div className="relative min-w-[200px] flex-1">
        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-edge bg-panel/80 py-2 pl-9 pr-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-volt/40 focus:outline-none"
        />
      </div>
      {children}
    </div>
  );
}

function FilterChips<T extends string>({ options, active, onChange }: { options: { id: T; label: string; count?: number }[]; active: T; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={`rounded-lg border px-3 py-2 font-mono text-[10px] uppercase tracking-widest transition ${
            active === o.id ? 'border-volt/50 bg-volt/10 text-volt' : 'border-edge text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {o.label}
          {typeof o.count === 'number' && <span className="ml-1.5 opacity-60">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}

function ExportButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-lg border border-edge px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-zinc-500 transition hover:border-volt/40 hover:text-volt"
    >
      <Download size={12} /> CSV
    </button>
  );
}

function TableShell({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-edge">
      <table className="w-full min-w-[880px] text-left text-sm">
        <thead className="bg-[#12121c]">
          <tr>
            {head.map((h) => (
              <th key={h} className="whitespace-nowrap px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-widest text-zinc-500">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-edge">{children}</tbody>
      </table>
    </div>
  );
}

function EmptyRow({ span, children }: { span: number; children: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={span} className="px-4 py-12 text-center text-sm text-zinc-500">{children}</td>
    </tr>
  );
}

function StatusPill({ status }: { status: PaymentRow['status'] }) {
  const map = {
    completed: { tone: 'volt' as const, Icon: CheckCircle2, label: 'Paid' },
    pending:   { tone: 'muted' as const, Icon: Clock, label: 'Pending' },
    failed:    { tone: 'danger' as const, Icon: XCircle, label: 'Failed' },
    refunded:  { tone: 'lilac' as const, Icon: RotateCcw, label: 'Refunded' },
  };
  const { tone, Icon, label } = map[status] ?? map.pending;
  return <Chip tone={tone}><Icon size={10} />{label}</Chip>;
}

function PersonCell({ person }: { person: { name: string | null; email: string; avatar?: string | null } }) {
  const initial = (person.name || person.email).charAt(0).toUpperCase();
  return (
    <div className="flex items-center gap-3">
      {person.avatar ? (
        <img src={person.avatar} alt="" className="h-8 w-8 shrink-0 rounded-full border border-edge object-cover" loading="lazy" />
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-edge bg-white/[0.03] text-xs font-semibold text-zinc-400">{initial}</div>
      )}
      <div className="min-w-0">
        <p className="truncate font-medium text-zinc-100">{person.name || '—'}</p>
        <p className="truncate text-xs text-zinc-500">{person.email}</p>
      </div>
    </div>
  );
}

// ─── Customers ────────────────────────────────────────────────────────────────

type Segment = 'all' | 'paying' | 'members' | 'free' | 'leads';

export function CustomersTable({ people, onChanged }: { people: Person[]; onChanged: () => void }) {
  const [search, setSearch] = useState('');
  const [segment, setSegment] = useState<Segment>('all');
  const [selected, setSelected] = useState<Person | null>(null);
  const [approving, setApproving] = useState(false);

  const counts = useMemo(() => ({
    all: people.length,
    paying: people.filter((p) => p.paid).length,
    members: people.filter((p) => p.hasActiveAccess).length,
    free: people.filter((p) => p.isUser && !p.paid).length,
    leads: people.filter((p) => !p.isUser).length,
  }), [people]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return people.filter((p) => {
      if (segment === 'paying' && !p.paid) return false;
      if (segment === 'members' && !p.hasActiveAccess) return false;
      if (segment === 'free' && (!p.isUser || p.paid)) return false;
      if (segment === 'leads' && p.isUser) return false;
      if (!q) return true;
      return p.email.includes(q) || (p.name || '').toLowerCase().includes(q) || p.packages.join(' ').toLowerCase().includes(q);
    });
  }, [people, search, segment]);

  return (
    <>
      <Toolbar search={search} onSearch={setSearch} placeholder="Search by name, email or package…">
        <FilterChips<Segment>
          active={segment}
          onChange={setSegment}
          options={[
            { id: 'all', label: 'Everyone', count: counts.all },
            { id: 'paying', label: 'Paying', count: counts.paying },
            { id: 'members', label: 'Active', count: counts.members },
            { id: 'free', label: 'Free', count: counts.free },
            { id: 'leads', label: 'Leads only', count: counts.leads },
          ]}
        />
        <button
          type="button"
          onClick={() => setApproving(true)}
          className="flex items-center gap-1.5 rounded-lg border border-volt/40 bg-volt/10 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-volt transition hover:bg-volt/20 cursor-pointer"
        >
          <UserCheck size={12} /> Approve account
        </button>
        <ExportButton
          onClick={() => downloadCsv(`aifh-customers-${new Date().toISOString().slice(0, 10)}.csv`, rows.map((p) => ({
            name: p.name ?? '', email: p.email, signed_up: p.signedUpAt ?? '', provider: p.provider ?? '',
            packages: p.packages.join(' | '), total_spent_usd: (p.totalSpentCents / 100).toFixed(2),
            orders: p.orders.length,
            access: p.memberships.filter((m) => m.active).map((m) => m.productCode).join(' | ') || 'none',
            expires: p.memberships.map((m) => `${m.productCode}:${m.expiresAt ?? 'lifetime'}`).join(' | '),
            lead_source: p.lead?.source ?? '', phone: p.lead?.phone ?? '',
            tasks_completed: p.tasksCompleted,
          })))}
        />
      </Toolbar>

      <TableShell head={['Person', 'Signed up', 'Source', 'Packages', 'Spent', 'Access', 'Progress', '']}>
        {rows.length === 0 ? (
          <EmptyRow span={8}>{people.length === 0 ? 'No people yet — signups and leads will appear here.' : 'No one matches that filter.'}</EmptyRow>
        ) : rows.map((p) => (
          <tr key={p.email} className="cursor-pointer transition hover:bg-white/[0.02]" onClick={() => setSelected(p)}>
            <td className="px-4 py-3"><PersonCell person={p} /></td>
            <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-400">
              {p.isUser ? relativeTime(p.signedUpAt) : <span className="text-zinc-600">not signed up</span>}
            </td>
            <td className="px-4 py-3 text-xs text-zinc-400">{p.lead?.source ?? <span className="text-zinc-600">—</span>}</td>
            <td className="px-4 py-3">
              {p.packages.length ? (
                <div className="flex flex-wrap gap-1">{p.packages.map((pk) => <Chip key={pk} tone="lilac">{pk}</Chip>)}</div>
              ) : <span className="text-xs text-zinc-600">—</span>}
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-zinc-100" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {p.totalSpentCents > 0 ? money(p.totalSpentCents) : <span className="font-normal text-zinc-600">—</span>}
            </td>
            <td className="px-4 py-3">
              {p.memberships.length === 0 ? (
                <span className="text-xs text-zinc-600">—</span>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {p.memberships.map((m) => (
                    <Chip key={m.productCode} tone={m.active ? 'volt' : 'muted'}>
                      {m.active && <ShieldCheck size={10} />}
                      {m.productLabel}
                    </Chip>
                  ))}
                </div>
              )}
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-400" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {p.tasksCompleted > 0 ? `${p.tasksCompleted} tasks` : <span className="text-zinc-600">—</span>}
            </td>
            <td className="px-4 py-3 text-right text-zinc-600"><ExternalLink size={14} /></td>
          </tr>
        ))}
      </TableShell>

      {selected && <PersonDrawer person={selected} onClose={() => setSelected(null)} onChanged={onChanged} />}
      {approving && <ApproveAccountModal onClose={() => setApproving(false)} onApproved={() => { setApproving(false); onChanged(); }} />}
    </>
  );
}

// ─── Person drawer ────────────────────────────────────────────────────────────

function PersonDrawer({ person, onClose, onChanged }: { person: Person; onClose: () => void; onChanged: () => void }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function run(label: string, fn: () => Promise<unknown>) {
    setBusy(label);
    setMessage(null);
    try {
      await fn();
      setMessage(`${label} done.`);
      onChanged();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'That did not work.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex justify-end" role="dialog" aria-modal="true">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <aside className="relative flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-edge bg-[#0b0b12] p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <PersonCell person={person} />
          <button type="button" onClick={onClose} className="rounded-lg border border-edge p-1.5 text-zinc-500 transition hover:text-zinc-200">
            <X size={16} />
          </button>
        </div>

        <dl className="mb-6 grid grid-cols-2 gap-3">
          <Field label="Signed up" value={person.isUser ? shortDate(person.signedUpAt) : 'Never'} />
          <Field label="Last seen" value={relativeTime(person.lastSignInAt)} />
          <Field label="Sign-in method" value={person.provider ?? '—'} />
          <Field label="Tasks completed" value={String(person.tasksCompleted)} />
          <Field label="Total spent" value={money(person.totalSpentCents)} />
          <Field
            label="Access"
            value={
              person.memberships.filter((m) => m.active).length
                ? `${person.memberships.filter((m) => m.active).length} active product(s)`
                : person.memberships.length ? 'Lapsed' : 'None'
            }
          />
        </dl>

        {person.lead && (
          <section className="mb-6 rounded-xl border border-edge bg-panel/60 p-4">
            <h4 className="mb-3 font-mono text-[10px] uppercase tracking-widest text-zinc-500">Lead record</h4>
            <div className="space-y-2 text-xs text-zinc-300">
              <p className="flex items-center gap-2"><Mail size={12} className="text-zinc-600" />{person.email}</p>
              {person.lead.phone && <p className="flex items-center gap-2"><Phone size={12} className="text-zinc-600" />{person.lead.phone}</p>}
              {person.lead.ticketNumber && <p className="flex items-center gap-2"><Ticket size={12} className="text-zinc-600" />{person.lead.ticketNumber}</p>}
              <p className="text-zinc-500">Source: <span className="text-zinc-300">{person.lead.source}</span></p>
              {person.lead.goal && <p className="text-zinc-500">Goal: <span className="text-zinc-300">{person.lead.goal}</span></p>}
              {person.lead.workshopTitle && <p className="text-zinc-500">Workshop: <span className="text-zinc-300">{person.lead.workshopTitle}</span></p>}
              <p className="text-zinc-500">Submissions: <span className="text-zinc-300">{person.lead.submissions}</span></p>
            </div>
          </section>
        )}

        <section className="mb-6">
          <h4 className="mb-3 font-mono text-[10px] uppercase tracking-widest text-zinc-500">Orders ({person.orders.length})</h4>
          {person.orders.length === 0 ? (
            <p className="rounded-xl border border-dashed border-edge px-4 py-6 text-center text-xs text-zinc-600">No orders on record.</p>
          ) : (
            <ul className="space-y-2">
              {person.orders.map((o) => (
                <li key={o.id} className="rounded-xl border border-edge bg-panel/60 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-100">{o.productLabel}</p>
                      <p className="mt-0.5 text-[11px] text-zinc-500">{shortDate(o.date)} · {o.provider}{o.isTest && ' · test'}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-zinc-100" style={{ fontVariantNumeric: 'tabular-nums' }}>{money(o.amountCents)}</p>
                      <div className="mt-1"><StatusPill status={o.status} /></div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-auto space-y-2 border-t border-edge pt-5">
          <h4 className="mb-2 font-mono text-[10px] uppercase tracking-widest text-volt">Approve Access (Free / Without Payment)</h4>
          <div className="grid grid-cols-2 gap-2">
            <ActionButton busy={busy === 'AAA Accelerator'} onClick={() => run('AAA Accelerator', () => adminApi.grantAccess(person.email, 365, 'aaa-accelerator', person.name ?? undefined))}>
              <Map size={13} /> Approve 50K RoadMap
            </ActionButton>
            <ActionButton busy={busy === 'Master Claude'} onClick={() => run('Master Claude', () => adminApi.grantAccess(person.email, 3650, 'claude-master', person.name ?? undefined))}>
              <BookOpen size={13} /> Approve Master Claude
            </ActionButton>
          </div>
          <ActionButton busy={busy === 'All Access'} onClick={() => run('All Access', () => adminApi.grantAccess(person.email, 3650, 'all-access', person.name ?? undefined))}>
            <Sparkles size={13} /> Approve All Access (RoadMap + Claude)
          </ActionButton>
          <ActionButton danger busy={busy === 'Revoke access'} onClick={() => run('Revoke access', () => adminApi.revokeAccess(person.email))}>
            <ShieldOff size={13} /> Revoke all access
          </ActionButton>
          {message && <p className="pt-1 text-xs text-zinc-400">{message}</p>}
        </section>
      </aside>
    </div>
  );
}

/** Entitlements are per product, so granting has to say which one. */
function GrantControls({
  person, busy, run,
}: { person: Person; busy: string | null; run: (label: string, fn: () => Promise<unknown>) => Promise<void> }) {
  const [productCode, setProductCode] = useState('aaa-accelerator');
  const [days, setDays] = useState(31);
  const product = GRANTABLE_PRODUCTS.find((p) => p.code === productCode);
  const label = `Grant ${product?.label ?? productCode}`;

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <select
          value={productCode}
          onChange={(e) => setProductCode(e.target.value)}
          className="rounded-xl border border-edge bg-panel px-3 py-2.5 text-xs text-zinc-200 focus:border-volt/40 focus:outline-none"
        >
          {GRANTABLE_PRODUCTS.map((p) => <option key={p.code} value={p.code}>{p.label}</option>)}
        </select>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          disabled={!product?.recurring}
          className="rounded-xl border border-edge bg-panel px-3 py-2.5 text-xs text-zinc-200 focus:border-volt/40 focus:outline-none disabled:opacity-40"
        >
          <option value={31}>31 days</option>
          <option value={90}>90 days</option>
          <option value={365}>1 year</option>
        </select>
      </div>
      {!product?.recurring && (
        <p className="text-[11px] text-zinc-600">One-time products are granted for life — no expiry.</p>
      )}
      <ActionButton
        busy={busy === label}
        onClick={() => run(label, () => adminApi.grantAccess(person.email, days, productCode, person.name ?? undefined))}
      >
        <ShieldCheck size={13} /> {label}
      </ActionButton>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-edge bg-panel/60 p-3">
      <dt className="font-mono text-[9px] uppercase tracking-widest text-zinc-600">{label}</dt>
      <dd className="mt-1 truncate text-xs font-medium text-zinc-200" title={value}>{value}</dd>
    </div>
  );
}

function ActionButton({ children, onClick, busy, danger }: { children: React.ReactNode; onClick: () => void; busy?: boolean; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={`flex w-full items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-semibold transition disabled:opacity-50 ${
        danger ? 'border-red-400/30 text-red-300 hover:bg-red-400/10' : 'border-volt/30 text-volt hover:bg-volt/10'
      }`}
    >
      {busy ? <Loader2 size={13} className="animate-spin" /> : children}
    </button>
  );
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export function OrdersTable({ payments, onChanged }: { payments: PaymentRow[]; onChanged: () => void }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | PaymentRow['status']>('all');
  const [recording, setRecording] = useState(false);

  const counts = useMemo(() => ({
    all: payments.length,
    completed: payments.filter((p) => p.status === 'completed').length,
    pending: payments.filter((p) => p.status === 'pending').length,
    failed: payments.filter((p) => p.status === 'failed').length,
  }), [payments]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return payments.filter((p) => {
      if (status !== 'all' && p.status !== status) return false;
      if (!q) return true;
      return p.customerEmail.includes(q) || (p.customerName || '').toLowerCase().includes(q) || p.productLabel.toLowerCase().includes(q) || (p.intentId || '').toLowerCase().includes(q);
    });
  }, [payments, search, status]);

  return (
    <>
      <Toolbar search={search} onSearch={setSearch} placeholder="Search by customer, package or payment ID…">
        <FilterChips<'all' | PaymentRow['status']>
          active={status}
          onChange={setStatus}
          options={[
            { id: 'all', label: 'All', count: counts.all },
            { id: 'completed', label: 'Paid', count: counts.completed },
            { id: 'pending', label: 'Pending', count: counts.pending },
            { id: 'failed', label: 'Failed', count: counts.failed },
          ]}
        />
        <button
          type="button"
          onClick={() => setRecording(true)}
          className="flex items-center gap-1.5 rounded-lg border border-volt/40 bg-volt/10 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-volt transition hover:bg-volt/20"
        >
          <Plus size={12} /> Record payment
        </button>
        <ExportButton
          onClick={() => downloadCsv(`aifh-orders-${new Date().toISOString().slice(0, 10)}.csv`, rows.map((p) => ({
            date: p.createdAt, paid_at: p.completedAt ?? '', customer: p.customerName ?? '', email: p.customerEmail,
            package: p.productLabel, amount_usd: (p.amountCents / 100).toFixed(2), status: p.status,
            mode: p.isTest ? 'test' : 'live', provider: p.provider, payment_id: p.intentId ?? '',
          })))}
        />
      </Toolbar>

      <TableShell head={['Date', 'Customer', 'Package', 'Amount', 'Status', 'Mode', 'Payment ID']}>
        {rows.length === 0 ? (
          <EmptyRow span={7}>
            {payments.length === 0
              ? 'No orders recorded yet. Checkouts are now saved automatically — use "Record payment" to log sales made before this.'
              : 'No orders match that filter.'}
          </EmptyRow>
        ) : rows.map((p) => (
          <tr key={p.id} className="transition hover:bg-white/[0.02]">
            <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-400">{shortDate(p.completedAt ?? p.createdAt)}</td>
            <td className="px-4 py-3"><PersonCell person={{ name: p.customerName, email: p.customerEmail }} /></td>
            <td className="px-4 py-3"><Chip tone="lilac">{p.productLabel}</Chip></td>
            <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-zinc-100" style={{ fontVariantNumeric: 'tabular-nums' }}>{money(p.amountCents)}</td>
            <td className="px-4 py-3"><StatusPill status={p.status} /></td>
            <td className="px-4 py-3">{p.isTest ? <Chip tone="muted">Test</Chip> : <Chip tone="neutral">Live</Chip>}</td>
            <td className="px-4 py-3 font-mono text-[10px] text-zinc-600">{p.intentId ?? '—'}</td>
          </tr>
        ))}
      </TableShell>

      {recording && <RecordPaymentModal onClose={() => setRecording(false)} onSaved={() => { setRecording(false); onChanged(); }} />}
    </>
  );
}

/** Logs a sale that did not go through Ziina checkout — bank transfer, invoice, or a pre-launch sale. */
function RecordPaymentModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [productCode, setProductCode] = useState('aaa-accelerator');
  const [amount, setAmount] = useState('159');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [grant, setGrant] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await adminApi.recordPayment({
        email: email.trim(), name: name.trim() || undefined, productCode,
        amountCents: Math.round(parseFloat(amount || '0') * 100), date, grantAccess: grant,
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save that payment.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <form onSubmit={submit} className="relative w-full max-w-md rounded-2xl border border-edge bg-[#0b0b12] p-6">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold text-zinc-100">Record a payment</h3>
            <p className="mt-1 text-xs text-zinc-500">For sales taken outside Ziina checkout — bank transfer, invoice, or before payments were tracked.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg border border-edge p-1.5 text-zinc-500 hover:text-zinc-200"><X size={16} /></button>
        </div>

        <div className="space-y-3">
          <Input label="Customer email" type="email" value={email} onChange={setEmail} required placeholder="name@example.com" />
          <Input label="Customer name" value={name} onChange={setName} placeholder="Optional" />
          <div>
            <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-500">Package</label>
            <select
              value={productCode}
              onChange={(e) => {
                setProductCode(e.target.value);
                setAmount(
                  e.target.value === 'session-1on1' ? '599' :
                  e.target.value === 'claude-master' ? '45' :
                  e.target.value === 'all-access' ? '199' :
                  e.target.value === 'aaa-accelerator' ? '1500' : '0'
                );
              }}
              className="w-full rounded-xl border border-edge bg-panel px-3 py-2.5 text-sm text-zinc-200 focus:border-volt/40 focus:outline-none"
            >
              <option value="aaa-accelerator">AAA Accelerator (Founding Cohort) — $1,500</option>
              <option value="claude-master">Master Claude in 7 Days — $45</option>
              <option value="all-access">All Access Package — $199</option>
              <option value="session-1on1">1:1 Private Session — $599</option>
              <option value="other">Other / custom</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Amount (USD)" type="number" value={amount} onChange={setAmount} required />
            <Input label="Date paid" type="date" value={date} onChange={setDate} required />
          </div>
          <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-edge bg-panel/60 px-3 py-2.5">
            <input type="checkbox" checked={grant} onChange={(e) => setGrant(e.target.checked)} className="h-4 w-4 accent-[#ccf244]" />
            <span className="text-xs text-zinc-300">Also grant 31 days of dashboard access</span>
          </label>
        </div>

        {error && <p className="mt-3 rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-xs text-red-300">{error}</p>}

        <button
          type="submit"
          disabled={busy || !email.trim() || !(parseFloat(amount) > 0)}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-volt px-4 py-3 text-sm font-bold text-void transition hover:bg-volt/90 disabled:opacity-40"
        >
          {busy ? <Loader2 size={15} className="animate-spin" /> : 'Save payment'}
        </button>
      </form>
    </div>
  );
}

function Input({ label, value, onChange, type = 'text', required, placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-500">{label}</label>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-edge bg-panel px-3 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-volt/40 focus:outline-none"
      />
    </div>
  );
}

/** Modal to approve/grant free access to any user for 50K RoadMap, Master Claude, or All Access without payment */
function ApproveAccountModal({ onClose, onApproved }: { onClose: () => void; onApproved: () => void }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [productCode, setProductCode] = useState('aaa-accelerator');
  const [durationDays, setDurationDays] = useState('365');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await adminApi.grantAccess(email.trim(), Number(durationDays), productCode, name.trim() || undefined);
      onApproved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not grant access to account.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-pointer" onClick={onClose} />
      <form onSubmit={submit} className="relative w-full max-w-md rounded-2xl border border-volt/35 bg-[#0b0b12] p-6 shadow-[0_0_60px_rgba(204,242,68,0.18)]">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-volt">
              <Sparkles size={12} />
              <span>Admin Access Approval</span>
            </div>
            <h3 className="text-base font-semibold text-zinc-100 mt-1">Approve Account Access</h3>
            <p className="mt-1 text-xs text-zinc-400">Grant access to 50K RoadMap or Claude Course directly without payment.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg border border-edge p-1.5 text-zinc-500 hover:text-zinc-200 cursor-pointer"><X size={16} /></button>
        </div>

        <div className="space-y-3.5">
          <Input label="User Email" type="email" value={email} onChange={setEmail} required placeholder="user@example.com" />
          <Input label="User Name" value={name} onChange={setName} placeholder="Optional (e.g. Alex Smith)" />
          <div>
            <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-500">Course / Access to Approve</label>
            <select
              value={productCode}
              onChange={(e) => setProductCode(e.target.value)}
              className="w-full rounded-xl border border-edge bg-panel px-3 py-2.5 text-sm text-zinc-200 focus:border-volt/40 focus:outline-none"
            >
              <option value="aaa-accelerator">🗺️ 50K RoadMap (AAA Accelerator)</option>
              <option value="claude-master">⚡ Master Claude in 7 Days</option>
              <option value="all-access">👑 All Access (50K RoadMap + Master Claude)</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-500">Access Duration</label>
            <select
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
              className="w-full rounded-xl border border-edge bg-panel px-3 py-2.5 text-sm text-zinc-200 focus:border-volt/40 focus:outline-none"
            >
              <option value="31">1 Month (31 days)</option>
              <option value="365">1 Year (365 days)</option>
              <option value="3650">Lifetime Access (10 Years)</option>
            </select>
          </div>
        </div>

        {error && <p className="mt-3 rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-xs text-red-300">{error}</p>}

        <button
          type="submit"
          disabled={busy || !email.trim()}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-volt px-4 py-3 text-sm font-bold text-void transition hover:bg-[#d4fa4c] disabled:opacity-40 cursor-pointer shadow-[0_0_20px_rgba(204,242,68,0.25)]"
        >
          {busy ? <Loader2 size={15} className="animate-spin" /> : <><UserCheck size={16} /> Approve &amp; Grant Access</>}
        </button>
      </form>
    </div>
  );
}

// ─── Leads ────────────────────────────────────────────────────────────────────

export function LeadsTable({ leads }: { leads: LeadRow[] }) {
  const [search, setSearch] = useState('');
  const [source, setSource] = useState('all');

  const sources = useMemo(() => ['all', ...Array.from(new Set(leads.map((l) => l.source))).sort()], [leads]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((l) => {
      if (source !== 'all' && l.source !== source) return false;
      if (!q) return true;
      return l.email.includes(q) || (l.name || '').toLowerCase().includes(q) || (l.phone || '').includes(q) || (l.workshopTitle || '').toLowerCase().includes(q);
    });
  }, [leads, search, source]);

  return (
    <>
      <Toolbar search={search} onSearch={setSearch} placeholder="Search by name, email, phone or workshop…">
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="rounded-lg border border-edge bg-panel px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-zinc-400 focus:border-volt/40 focus:outline-none"
        >
          {sources.map((s) => <option key={s} value={s}>{s === 'all' ? 'All sources' : s}</option>)}
        </select>
        <ExportButton
          onClick={() => downloadCsv(`aifh-leads-${new Date().toISOString().slice(0, 10)}.csv`, rows.map((l) => ({
            date: l.createdAt, name: l.name ?? '', email: l.email, phone: l.phone ?? '', country: l.countryCode ?? '',
            goal: l.goal ?? '', source: l.source, workshop: l.workshopTitle ?? '', ticket: l.ticketNumber ?? '', submissions: l.submissions,
          })))}
        />
      </Toolbar>

      <TableShell head={['Date', 'Lead', 'Phone', 'Goal', 'Source', 'Workshop', 'Ticket']}>
        {rows.length === 0 ? (
          <EmptyRow span={7}>
            {leads.length === 0
              ? 'No leads stored yet. Every form submission is now written here — run migration 0003 if this stays empty.'
              : 'No leads match that filter.'}
          </EmptyRow>
        ) : rows.map((l) => (
          <tr key={l.id} className="transition hover:bg-white/[0.02]">
            <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-400">{shortDate(l.createdAt)}</td>
            <td className="px-4 py-3"><PersonCell person={{ name: l.name, email: l.email }} /></td>
            <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-400">{l.phone ?? '—'}</td>
            <td className="px-4 py-3">{l.goal ? <Chip tone="neutral">{l.goal}</Chip> : <span className="text-xs text-zinc-600">—</span>}</td>
            <td className="px-4 py-3 text-xs text-zinc-400">{l.source}</td>
            <td className="max-w-[220px] px-4 py-3 text-xs text-zinc-500"><span className="line-clamp-1">{l.workshopTitle ?? '—'}</span></td>
            <td className="px-4 py-3 font-mono text-[10px] text-zinc-600">{l.ticketNumber ?? '—'}</td>
          </tr>
        ))}
      </TableShell>
    </>
  );
}
