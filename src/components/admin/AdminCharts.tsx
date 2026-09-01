/**
 * Chart primitives for /admin.
 *
 * Palette notes — every chart here is SINGLE-SERIES, so it uses one hue (volt)
 * rather than a categorical set: the reader is comparing magnitudes, not telling
 * series apart. The one ordered scale (the funnel) uses a lime ordinal ramp that
 * was validated for monotone lightness, visible step gaps, and >= 2:1 contrast
 * against the #0d0d14 panel surface.
 *
 * Every chart ships a hover/focus tooltip and a table view, so no value is ever
 * only reachable by hovering.
 */

import React, { useState, useId } from 'react';
import { Table2, BarChart3, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

// ─── Tokens ───────────────────────────────────────────────────────────────────

const ACCENT = '#ccf244';
const ORDINAL = ['#ccf244', '#a9cc2e', '#86a41f', '#648015'];
const DEEMPHASIS = '#3f3f46';
const GRID = '#1e1e2a';
const SURFACE = '#0d0d14';
const GOOD = '#ccf244';
const BAD = '#f87171';

/** Rounds a maximum up to the next 1/2/5 x 10^n so axis ticks land on clean numbers. */
function niceMax(value: number): number {
  if (value <= 0) return 1;
  const exp = Math.floor(Math.log10(value));
  const base = 10 ** exp;
  const frac = value / base;
  const step = frac <= 1 ? 1 : frac <= 2 ? 2 : frac <= 5 ? 5 : 10;
  return step * base;
}

/** Bar path with rounded data-end and a square baseline, per the mark spec. */
function barPath(x: number, y: number, w: number, h: number, r = 4): string {
  const radius = Math.max(0, Math.min(r, w / 2, h));
  const bottom = y + h;
  return `M${x},${bottom} L${x},${y + radius} Q${x},${y} ${x + radius},${y} L${x + w - radius},${y} Q${x + w},${y} ${x + w},${y + radius} L${x + w},${bottom} Z`;
}

// ─── Chart shell ──────────────────────────────────────────────────────────────

interface ChartCardProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  tableView?: React.ReactNode;
  children: React.ReactNode;
}

export function ChartCard({ title, subtitle, right, tableView, children }: ChartCardProps) {
  const [showTable, setShowTable] = useState(false);
  return (
    <section className="rounded-2xl border border-edge bg-panel/80 p-5">
      <header className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-zinc-500">{subtitle}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {right}
          {tableView && (
            <button
              type="button"
              onClick={() => setShowTable((v) => !v)}
              className="flex items-center gap-1.5 rounded-lg border border-edge px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-widest text-zinc-500 transition hover:border-volt/40 hover:text-volt"
              aria-pressed={showTable}
            >
              {showTable ? <BarChart3 size={12} /> : <Table2 size={12} />}
              {showTable ? 'Chart' : 'Table'}
            </button>
          )}
        </div>
      </header>
      {showTable && tableView ? tableView : children}
    </section>
  );
}

// ─── Stat tile ────────────────────────────────────────────────────────────────

interface StatTileProps {
  label: string;
  value: string;
  sublabel?: string;
  deltaPct?: number | null;
  deltaLabel?: string;
  /** Set false where a rise is bad (churn, failed payments). */
  upIsGood?: boolean;
  trend?: number[];
  accent?: boolean;
}

export function StatTile({ label, value, sublabel, deltaPct, deltaLabel, upIsGood = true, trend, accent }: StatTileProps) {
  const hasDelta = typeof deltaPct === 'number' && Number.isFinite(deltaPct);
  const up = hasDelta && deltaPct! > 0;
  const flat = hasDelta && deltaPct === 0;
  const good = up === upIsGood;
  const DeltaIcon = flat ? Minus : up ? ArrowUpRight : ArrowDownRight;

  return (
    <div className={`rounded-2xl border bg-panel/80 p-4 transition ${accent ? 'border-volt/30' : 'border-edge'}`}>
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-50">{value}</p>

      <div className="mt-2 flex items-end justify-between gap-3">
        <div className="min-w-0">
          {hasDelta ? (
            <span
              className="inline-flex items-center gap-1 text-[11px] font-medium"
              style={{ color: flat ? '#a1a1aa' : good ? GOOD : BAD }}
            >
              <DeltaIcon size={12} aria-hidden />
              {flat ? 'no change' : `${Math.abs(deltaPct!)}%`}
              <span className="text-zinc-500">{deltaLabel ?? 'vs prev'}</span>
            </span>
          ) : (
            sublabel && <span className="truncate text-[11px] text-zinc-500">{sublabel}</span>
          )}
          {hasDelta && sublabel && <p className="mt-0.5 truncate text-[11px] text-zinc-500">{sublabel}</p>}
        </div>
        {trend && trend.length > 1 && <Sparkline values={trend} />}
      </div>
    </div>
  );
}

/** 12-point trend in the de-emphasis hue; the current point carries the accent. */
export function Sparkline({ values, width = 68, height = 22 }: { values: number[]; width?: number; height?: number }) {
  const pts = values.slice(-12);
  const max = Math.max(...pts, 1);
  const step = pts.length > 1 ? width / (pts.length - 1) : width;
  const y = (v: number) => height - 2 - (v / max) * (height - 4);
  const d = pts.map((v, i) => `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const lastX = (pts.length - 1) * step;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="shrink-0 overflow-visible" aria-hidden>
      <path d={d} fill="none" stroke={DEEMPHASIS} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={y(pts[pts.length - 1])} r={3} fill={ACCENT} stroke={SURFACE} strokeWidth={2} />
    </svg>
  );
}

// ─── Column chart (daily series) ──────────────────────────────────────────────

interface ColumnChartProps {
  data: { date: string; value: number }[];
  formatValue: (n: number) => string;
  emptyMessage?: string;
}

export function ColumnChart({ data, formatValue, emptyMessage = 'No activity in this range yet.' }: ColumnChartProps) {
  const [hover, setHover] = useState<number | null>(null);
  const clipId = useId();

  const W = 640;
  const H = 176;
  const PAD = { top: 24, right: 10, bottom: 26, left: 46 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const baseline = PAD.top + plotH;

  const values = data.map((d) => d.value);
  const rawMax = Math.max(...values, 0);
  const max = niceMax(rawMax);
  const maxIndex = values.indexOf(rawMax);
  const band = plotW / Math.max(data.length, 1);
  const barW = Math.max(3, Math.min(24, band - 2)); // the 2px surface gap between neighbours
  const scale = (v: number) => (v / max) * plotH;

  if (!rawMax) {
    return (
      <div className="flex h-[176px] items-center justify-center rounded-xl border border-dashed border-edge text-xs text-zinc-500">
        {emptyMessage}
      </div>
    );
  }

  // A mid tick on a max of 1 or 2 rounds to the same label as the top tick.
  const ticks = max >= 3 ? [0, max / 2, max] : [0, max];
  const active = hover !== null ? data[hover] : null;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Daily totals">
        <defs>
          <clipPath id={clipId}>
            <rect x={PAD.left} y={PAD.top - 4} width={plotW} height={plotH + 4} />
          </clipPath>
        </defs>

        {ticks.map((t) => {
          const y = baseline - scale(t);
          return (
            <g key={t}>
              <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke={GRID} strokeWidth={1} />
              <text x={PAD.left - 8} y={y + 3.5} textAnchor="end" className="fill-zinc-600" style={{ fontSize: 10, fontVariantNumeric: 'tabular-nums' }}>
                {formatValue(t)}
              </text>
            </g>
          );
        })}

        <g clipPath={`url(#${clipId})`}>
          {data.map((d, i) => {
            const x = PAD.left + i * band + (band - barW) / 2;
            const h = scale(d.value);
            const isHovered = hover === i;
            if (d.value === 0) {
              // A zero day still gets a stub, so "nothing happened" reads
              // differently from "no data here".
              return <rect key={d.date} x={x} y={baseline - 2} width={barW} height={2} fill={DEEMPHASIS} rx={1} />;
            }
            return (
              <path
                key={d.date}
                d={barPath(x, baseline - h, barW, h)}
                fill={ACCENT}
                opacity={hover === null || isHovered ? 1 : 0.45}
                style={{ transition: 'opacity 120ms' }}
              />
            );
          })}
        </g>

        {/* Direct label on the extreme only — a number on every column goes unread. */}
        {maxIndex >= 0 && (
          <text
            x={PAD.left + maxIndex * band + band / 2}
            y={baseline - scale(rawMax) - 8}
            textAnchor="middle"
            className="fill-zinc-300"
            style={{ fontSize: 10, fontWeight: 600 }}
          >
            {formatValue(rawMax)}
          </text>
        )}

        <line x1={PAD.left} y1={baseline} x2={W - PAD.right} y2={baseline} stroke={GRID} strokeWidth={1} />

        {/* First and last day labels — 30 dates would collide. */}
        <text x={PAD.left} y={H - 8} className="fill-zinc-600" style={{ fontSize: 10 }}>{shortDay(data[0]?.date)}</text>
        <text x={W - PAD.right} y={H - 8} textAnchor="end" className="fill-zinc-600" style={{ fontSize: 10 }}>{shortDay(data[data.length - 1]?.date)}</text>

        {/* Hit targets span the whole band and full plot height, not just the painted bar. */}
        {data.map((d, i) => (
          <rect
            key={`hit-${d.date}`}
            x={PAD.left + i * band}
            y={PAD.top - 4}
            width={band}
            height={plotH + 8}
            fill="transparent"
            tabIndex={0}
            role="button"
            aria-label={`${d.date}: ${formatValue(d.value)}`}
            onMouseEnter={() => setHover(i)}
            onFocus={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            onBlur={() => setHover(null)}
            style={{ outline: 'none', cursor: 'default' }}
          />
        ))}
      </svg>

      {active && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 rounded-lg border border-edge bg-[#12121c] px-2.5 py-1.5 shadow-xl"
          style={{ left: `${Math.min(92, Math.max(8, ((PAD.left + hover! * band + band / 2) / W) * 100))}%`, top: 0 }}
        >
          <p className="text-xs font-semibold text-zinc-50" style={{ fontVariantNumeric: 'tabular-nums' }}>{formatValue(active.value)}</p>
          <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">{active.date}</p>
        </div>
      )}
    </div>
  );
}

function shortDay(iso?: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

// ─── Horizontal bar list ──────────────────────────────────────────────────────

interface BarListProps {
  rows: { label: string; value: number; meta?: string }[];
  formatValue: (n: number) => string;
  emptyMessage?: string;
}

export function BarList({ rows, formatValue, emptyMessage = 'Nothing recorded yet.' }: BarListProps) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  if (!rows.length) {
    return (
      <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-edge text-xs text-zinc-500">
        {emptyMessage}
      </div>
    );
  }
  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li key={row.label} className="group">
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <span className="truncate text-xs text-zinc-300" title={row.label}>{row.label}</span>
            <span className="shrink-0 text-xs font-semibold text-zinc-100" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatValue(row.value)}
              {row.meta && <span className="ml-1.5 font-normal text-zinc-500">{row.meta}</span>}
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/[0.04]">
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{ width: `${Math.max((row.value / max) * 100, 2)}%`, background: ACCENT }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

// ─── Funnel ───────────────────────────────────────────────────────────────────

export function Funnel({ stages }: { stages: { stage: string; value: number }[] }) {
  const top = Math.max(stages[0]?.value ?? 0, 1);
  return (
    <ol className="space-y-2.5">
      {stages.map((s, i) => {
        const prev = i > 0 ? stages[i - 1].value : null;
        const stepPct = prev && prev > 0 ? Math.round((s.value / prev) * 100) : null;
        const width = Math.max((s.value / top) * 100, s.value > 0 ? 6 : 2);
        return (
          <li key={s.stage}>
            <div className="mb-1 flex items-baseline justify-between gap-3">
              <span className="text-xs text-zinc-300">{s.stage}</span>
              <span className="text-xs text-zinc-500">
                {stepPct !== null && <span className="mr-2">{stepPct}% of previous</span>}
                <span className="font-semibold text-zinc-100" style={{ fontVariantNumeric: 'tabular-nums' }}>{s.value.toLocaleString()}</span>
              </span>
            </div>
            <div
              className="h-7 rounded-md transition-[width] duration-500"
              style={{ width: `${width}%`, background: ORDINAL[Math.min(i, ORDINAL.length - 1)] }}
              title={`${s.stage}: ${s.value}`}
            />
          </li>
        );
      })}
    </ol>
  );
}

// ─── Simple data table used as the "table view" of a chart ────────────────────

export function MiniTable({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <div className="max-h-[220px] overflow-auto rounded-xl border border-edge">
      <table className="w-full text-left text-xs">
        <thead className="sticky top-0 bg-[#12121c]">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-zinc-500">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-edge">
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((cell, j) => (
                <td key={j} className="px-3 py-2 text-zinc-300" style={{ fontVariantNumeric: 'tabular-nums' }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
