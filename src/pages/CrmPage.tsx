/**
 * /crm — AI Founder Hub Lead Intelligence Dashboard
 *
 * A full-featured CRM page for managing masterclass leads:
 * - Real-time stats: total, hot/warm/cold intent, automation status
 * - Lead table with search, filter, sort, pagination
 * - Inline lead editing: status, intent, score, notes
 * - Bulk actions: mark interested, trigger n8n email automation
 * - Intent scoring visualisation per lead
 *
 * Data source: masterclass_leads table on Supabase (csdxhpdjkaddrblyxlhg project)
 * Flow: Leads from Zoho → Managed here → Personalised emails via n8n
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Users, Flame, Zap, Mail, Search, Filter, RefreshCw,
  ChevronDown, ChevronUp, TrendingUp, Globe, Clock,
  CheckCircle, XCircle, AlertCircle, Inbox, Send,
  MoreVertical, Edit3, Star, Activity, BarChart3,
  ArrowUpRight, Target, Loader2, ChevronLeft, ChevronRight,
  Tag, MessageSquare, Phone, MapPin, Calendar, Sparkles,
  Play, Pause, Check, X, Eye, EyeOff, Download, Lock, LogOut, ShieldCheck, UserPlus, Copy,
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// ─── CRM access credentials ───────────────────────────────────────────────────
const CRM_USER = (import.meta.env.VITE_CRM_USER as string) || 'zangbang360@gmail.com';
const CRM_PASS = (import.meta.env.VITE_CRM_PASS as string) || 'Ajalpc@yo1';
const CRM_SESSION_KEY = 'crm_auth_session_v2';

// ─── Supabase client for CRM project ──────────────────────────────────────────
const crmSupabase = createClient(
  (import.meta.env.VITE_CRM_SUPABASE_URL as string) || 'https://csdxhpdjkaddrblyxlhg.supabase.co',
  (import.meta.env.VITE_CRM_SUPABASE_ANON_KEY as string) || 'sb_publishable_np0dKvFsKGf2kyLPSHKgvg_WqRglY5a'
);

// ─── Types ─────────────────────────────────────────────────────────────────────
type LeadStatus = 'new' | 'contacted' | 'interested' | 'meeting_booked' | 'closed' | 'not_interested' | 'enrolled' | 'lost' | string;
type LeadIntent = 'hot' | 'warm' | 'cold' | null;
type LeadCategory = 'afh_signup' | 'free_class_registration' | 'gumroad_course';
type AutomationStatus = 'pending' | 'queued' | 'in_progress' | 'completed' | 'failed' | 'opted_out';

interface MasterclassLead {
  id: string | number;
  created_at: string;
  updated_at?: string;
  full_name: string | null;
  email_address: string | null;
  phone_number: string | null;
  country: string | null;
  // Personalisation fields (from registration)
  enrolled_for: string | null;
  what_best_describes_them: string | null;
  why_they_signed_up: string | null;
  // Email campaign & n8n automation fields
  next_campaign?: string | null;
  email_status?: string | null;
  last_campaign_sent_at?: string | null;
  email_subject?: string | null;
  campaign_name?: string | null;
  n8n_workflow_id?: string | null;
  n8n_execution_id?: string | null;
  last_email_error?: string | null;
  unsubscribed?: boolean;
  // CRM lifecycle fields
  status?: LeadStatus;
  intent?: LeadIntent;
  lead_score?: number;
  source?: string | null;
  tags?: string[];
  notes?: string | null;
  assigned_to?: string | null;
  goal?: string | null;
  profession?: string | null;
  company?: string | null;
  interested?: boolean;
  email_automation_status?: AutomationStatus;
  last_emailed_at?: string | null;
  email_sequence_step?: number;
  zoho_lead_id?: string | null;
  follow_up_at?: string | null;
  last_contacted_at?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  lead_category?: LeadCategory | null;
}

interface CrmStats {
  total: number;
  interested: number;
  avgScore: number;
  campaignsReady: number;
  emailsSent: number;
  byStatus: Record<string, number>;
  byIntent: Record<string, number>;
  byAutomation: Record<string, number>;
  byPersona: Record<string, number>;
  byEnrolled: Record<string, number>;
  byEmailStatus: Record<string, number>;
  byCategory: Record<string, number>;
  topCountries: { country: string; count: number }[];
}

function extractSubjectAndBody(raw: string | null | undefined): { subject: string; body: string } {
  if (!raw) return { subject: '', body: '' };
  const subjectMatch = raw.match(/^Subject:\s*([^\n\r]+)/i);
  const subject = subjectMatch ? subjectMatch[1].trim() : '';
  const body = raw.replace(/^Subject:\s*[^\n\r]+[\r\n]*/i, '').trim();
  return { subject, body: body || raw };
}

// ─── Constants ─────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  new:            { label: 'New',            color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', icon: Inbox },
  contacted:      { label: 'Contacted',      color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',  icon: Mail },
  interested:     { label: 'Interested',     color: '#34d399', bg: 'rgba(52,211,153,0.15)',  icon: Star },
  meeting_booked: { label: 'Meeting Booked', color: '#38bdf8', bg: 'rgba(56,189,248,0.15)',  icon: Calendar },
  closed:         { label: 'Closed',         color: '#ccf244', bg: 'rgba(204,242,68,0.15)',  icon: CheckCircle },
  enrolled:       { label: 'Enrolled',       color: '#10b981', bg: 'rgba(16,185,129,0.15)',  icon: CheckCircle },
  not_interested: { label: 'Not Interested', color: '#f87171', bg: 'rgba(248,113,113,0.12)', icon: XCircle },
  lost:           { label: 'Lost',           color: '#6b7280', bg: 'rgba(107,114,128,0.12)', icon: X },
};

// Preset Interest Tags requested by user
const PRESET_TAGS = [
  { id: 'Free Master',     label: 'Free Master',     color: '#ccf244', bg: 'rgba(204,242,68,0.15)', border: 'rgba(204,242,68,0.3)', icon: Sparkles },
  { id: 'Business',        label: 'Business',        color: '#60a5fa', bg: 'rgba(96,165,250,0.15)', border: 'rgba(96,165,250,0.3)', icon: Target },
  { id: 'AAA Accelerator', label: 'AAA Accelerator', color: '#a78bfa', bg: 'rgba(167,139,250,0.15)', border: 'rgba(167,139,250,0.3)', icon: Zap },
  { id: 'Affiliate',       label: 'Affiliate',       color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', icon: TrendingUp },
  { id: '1:1 Session',     label: '1:1 Session',     color: '#34d399', bg: 'rgba(52,211,153,0.15)', border: 'rgba(52,211,153,0.3)', icon: Users },
] as const;

function tagCfg(tag: string) {
  const found = PRESET_TAGS.find(t => t.id.toLowerCase() === tag.toLowerCase() || t.label.toLowerCase() === tag.toLowerCase());
  if (found) return found;
  return { id: tag, label: tag, color: '#9ca3af', bg: 'rgba(156,163,175,0.12)', border: 'rgba(156,163,175,0.25)', icon: Tag };
}

const INTENT_CONFIG: Record<string, { label: string; color: string; bg: string; emoji: string }> = {
  hot:  { label: 'Hot',  color: '#f97316', bg: 'rgba(249,115,22,0.15)',  emoji: '🔥' },
  warm: { label: 'Warm', color: '#eab308', bg: 'rgba(234,179,8,0.15)',   emoji: '⚡' },
  cold: { label: 'Cold', color: '#60a5fa', bg: 'rgba(96,165,250,0.15)',  emoji: '❄️' },
};

const AUTOMATION_CONFIG: Record<AutomationStatus, { label: string; color: string }> = {
  pending:     { label: 'Pending',     color: '#6b7280' },
  queued:      { label: 'Queued',      color: '#a78bfa' },
  in_progress: { label: 'In Progress', color: '#60a5fa' },
  completed:   { label: 'Completed',   color: '#34d399' },
  failed:      { label: 'Failed',      color: '#f87171' },
  opted_out:   { label: 'Opted Out',   color: '#9ca3af' },
};

// Funnel Hierarchy: Level 1 (Top Level / Most mature) > Level 2 (Mid) > Level 3 (Low)
export const LEAD_LEVELS: Record<LeadCategory, number> = {
  afh_signup: 1,               // Level 1 - Top Level (Most mature)
  free_class_registration: 2,  // Level 2 - Mid Level
  gumroad_course: 3,           // Level 3 - Low Level
};

export function isLevelUpgrade(newCat: LeadCategory, currentCat: LeadCategory | null | undefined): boolean {
  if (!currentCat) return true;
  const currentLvl = LEAD_LEVELS[currentCat] ?? 99;
  const newLvl = LEAD_LEVELS[newCat] ?? 99;
  return newLvl < currentLvl; // lower number = higher rank (1 is top)
}

// Lead category config — Funnel Levels for campaigns & pipeline
const LEAD_CATEGORY_CONFIG: Record<LeadCategory, {
  level: number;
  levelBadge: string;
  label: string;
  value: LeadCategory;
  color: string;
  bg: string;
  border: string;
  emoji: string;
  tag: string;
}> = {
  afh_signup: {
    level: 1,
    levelBadge: 'Level 1 · Top',
    label: 'AFH SignUp',
    value: 'afh_signup',
    color: '#34d399',
    bg: 'rgba(52,211,153,0.12)',
    border: 'rgba(52,211,153,0.3)',
    emoji: '⚡',
    tag: 'Top Level · Most Mature',
  },
  free_class_registration: {
    level: 2,
    levelBadge: 'Level 2 · Mid',
    label: 'Free Class',
    value: 'free_class_registration',
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.12)',
    border: 'rgba(167,139,250,0.3)',
    emoji: '🎓',
    tag: 'Mid Level',
  },
  gumroad_course: {
    level: 3,
    levelBadge: 'Level 3 · Low',
    label: 'GumRoad Course',
    value: 'gumroad_course',
    color: '#f472b6',
    bg: 'rgba(244,114,182,0.12)',
    border: 'rgba(244,114,182,0.3)',
    emoji: '📦',
    tag: 'Low Level',
  },
};

function categoryCfg(cat: string | null | undefined) {
  if (!cat) return LEAD_CATEGORY_CONFIG.free_class_registration;
  return (LEAD_CATEGORY_CONFIG as any)[cat] || LEAD_CATEGORY_CONFIG.free_class_registration;
}

function leadCategoryCfg(cat: string | null | undefined) {
  const cfg = categoryCfg(cat);
  return {
    ...cfg,
    dotColor: cfg.color,
    short: cfg.label,
  };
}

// Persona colours for what_best_describes_them
const PERSONA_COLORS: Record<string, { color: string; bg: string; emoji: string }> = {
  'Agency owner / freelancer':           { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', emoji: '🏢' },
  'Just getting started, no clients yet': { color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',  emoji: '🚀' },
  'Corporate/exploring a side hustle':   { color: '#eab308', bg: 'rgba(234,179,8,0.12)',   emoji: '💼' },
  'Have a business, want to add AI services': { color: '#34d399', bg: 'rgba(52,211,153,0.12)', emoji: '⚡' },
};

function personaCfg(persona: string | null) {
  if (!persona) return { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', emoji: '👤' };
  return PERSONA_COLORS[persona] || { color: '#9ca3af', bg: 'rgba(156,163,175,0.1)', emoji: '👤' };
}

// ─── Design tokens ─────────────────────────────────────────────────────────────
// One neutral scale + a single accent. Semantic colours (status, tags, persona)
// appear only as small dots so the page stays calm.
const C = {
  bg:      '#09090b',
  surface: '#0e0e11',
  raised:  '#141417',
  border:  '#1d1d21',
  strong:  '#2a2a30',
  text:    '#ededef',
  sub:     '#a1a1aa',
  muted:   '#71717a',
  faint:   '#4a4a52',
  accent:  '#ccf244',
  danger:  '#f87171',
  success: '#4ade80',
};

const FONT = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

const labelStyle: React.CSSProperties = {
  fontSize: 12, color: C.muted, fontWeight: 500, display: 'block', marginBottom: 6,
};

const fieldStyle: React.CSSProperties = {
  width: '100%', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 8,
  padding: '8px 10px', color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box',
  fontFamily: 'inherit',
};

const btnGhost: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 8,
  color: C.sub, cursor: 'pointer', padding: '7px 12px', fontSize: 13, fontWeight: 500,
  fontFamily: 'inherit', whiteSpace: 'nowrap',
};

const btnPrimary: React.CSSProperties = {
  ...btnGhost, background: C.accent, border: `1px solid ${C.accent}`, color: '#09090b', fontWeight: 600,
};

const btnText: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 4, background: 'none', border: 'none',
  color: C.muted, cursor: 'pointer', padding: 0, fontSize: 12, fontFamily: 'inherit',
};

const iconBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: 28, height: 28, borderRadius: 7, background: 'transparent', border: 'none',
  color: C.muted, cursor: 'pointer',
};

const selectStyle: React.CSSProperties = {
  background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 8,
  padding: '7px 10px', color: C.sub, fontSize: 12, outline: 'none', fontFamily: 'inherit', cursor: 'pointer',
};

// Hover / focus states can't be expressed inline, so they live here.
const CRM_CSS = `
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
  @keyframes slideIn { from { transform: translateY(-6px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  select option { background: ${C.surface}; color: ${C.text}; }
  input[type='date']::-webkit-calendar-picker-indicator { filter: invert(0.5); }
  .crm-hover { transition: background 0.12s, color 0.12s, border-color 0.12s; }
  .crm-hover:hover { background: ${C.raised} !important; color: ${C.text} !important; }
  .crm-link { transition: color 0.12s; }
  .crm-link:hover { color: ${C.text} !important; }
  .crm-field { transition: border-color 0.12s; }
  .crm-field:hover { border-color: ${C.strong} !important; }
  .crm-field:focus { border-color: ${C.muted} !important; }
  .crm-field::placeholder { color: ${C.faint}; }
  .crm-row { transition: background 0.12s; }
  .crm-row:hover { background: rgba(255,255,255,0.015); }
  .crm-row .crm-reveal { opacity: 0.55; transition: opacity 0.12s; }
  .crm-row:hover .crm-reveal { opacity: 1; }
`;

function Dot({ color, size = 6 }: { color: string; size?: number }) {
  return <span style={{ width: size, height: size, borderRadius: '50%', background: color, flexShrink: 0, display: 'inline-block' }} />;
}

function Chip({ color, children, active = false }: { color?: string; children: React.ReactNode; active?: boolean }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
      fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 6,
      background: active ? C.raised : 'transparent', border: `1px solid ${C.border}`, color: C.sub,
    }}>
      {color && <Dot color={color} />}
      {children}
    </span>
  );
}

function ModalShell({
  onClose, maxWidth, zIndex = 1000, flush = false, children,
}: { onClose: () => void; maxWidth: number; zIndex?: number; flush?: boolean; children: React.ReactNode }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      fontFamily: FONT,
    }} onClick={onClose}>
      <div style={{
        width: '100%', maxWidth, maxHeight: '90vh',
        background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14,
        overflowY: flush ? 'hidden' : 'auto', padding: flush ? 0 : 28,
        display: flush ? 'flex' : 'block', flexDirection: 'column',
      }} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function relTime(ts: string | null | undefined) {
  if (!ts) return '—';
  const time = new Date(ts).getTime();
  if (isNaN(time)) return '—';
  const diff = Date.now() - time;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function fmtDate(ts: string | null) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtDateTime(ts: string | null | undefined) {
  if (!ts) return '—';
  try {
    const d = new Date(ts);
    return (
      d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' · ' +
      d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    );
  } catch {
    return String(ts);
  }
}

function avatar(name: string | null, email: string | null) {
  const src = name || email || '?';
  return src.trim()[0].toUpperCase();
}

function avatarColor(str: string | null) {
  const colors = ['#7c3aed', '#2563eb', '#0891b2', '#0d9488', '#16a34a', '#ca8a04', '#dc2626', '#db2777'];
  let hash = 0;
  for (const c of (str || '?')) hash = (hash * 31 + c.charCodeAt(0)) % colors.length;
  return colors[Math.abs(hash) % colors.length];
}

// ─── Score bar ─────────────────────────────────────────────────────────────────
function ScoreBar({ score }: { score: number }) {
  const pct = Math.max(0, Math.min(100, score));
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 56, height: 3, background: C.border, borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: C.sub, transition: 'width 0.5s ease' }} />
      </div>
      <span style={{ fontSize: 11, color: C.muted, fontVariantNumeric: 'tabular-nums' }}>{pct}</span>
    </div>
  );
}

// ─── Stat tile ─────────────────────────────────────────────────────────────────
function StatTile({
  label, value, sub, icon: Icon, color, accent = false, onClick
}: { label: string; value: string | number; sub?: string; icon: React.ElementType; color: string; accent?: boolean; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={onClick ? 'crm-hover' : undefined}
      style={{
        background: C.bg,
        padding: '16px 18px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background 0.15s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon size={13} style={{ color: accent ? color : C.faint }} />
          <span style={{ fontSize: 12, color: C.muted }}>{label}</span>
        </div>
        {onClick && (
          <span style={{ fontSize: 10, color: color, display: 'inline-flex', alignItems: 'center', gap: 2, fontWeight: 500 }}>
            History ↗
          </span>
        )}
      </div>
      <div style={{ fontSize: 24, fontWeight: 600, color: C.text, lineHeight: 1, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: C.faint, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

// ─── Intent mini bar ────────────────────────────────────────────────────────────
function IntentBar({ byIntent }: { byIntent: Record<string, number> }) {
  const total = Object.values(byIntent).reduce((a, b) => a + b, 0) || 1;
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      {(['hot', 'warm', 'cold'] as const).map(intent => {
        const pct = Math.round(((byIntent[intent] || 0) / total) * 100);
        const cfg = INTENT_CONFIG[intent];
        return (
          <span key={intent} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: C.muted }}>
            <Dot color={cfg.color} /> {cfg.label} <span style={{ color: C.faint }}>{pct}%</span>
          </span>
        );
      })}
    </div>
  );
}

// ─── Lead row modal ─────────────────────────────────────────────────────────────
function LeadModal({
  lead, onClose, onSave, onOpenCampaign
}: {
  lead: MasterclassLead;
  onClose: () => void;
  onSave: (updates: Partial<MasterclassLead>) => Promise<void> | void;
  onOpenCampaign?: () => void;
}) {
  const [form, setForm] = useState({
    status: lead.status || 'new',
    intent: (lead.intent as string) || '',
    lead_score: lead.lead_score ?? 0,
    email_status: lead.email_status || 'new',
    notes: lead.notes || '',
    assigned_to: lead.assigned_to || '',
    interested: lead.interested ?? false,
    goal: lead.goal || '',
    profession: lead.profession || '',
    company: lead.company || '',
    follow_up_at: lead.follow_up_at ? lead.follow_up_at.split('T')[0] : '',
    lead_category: lead.lead_category || 'free_class_registration',
  });
  const [tagsList, setTagsList] = useState<string[]>(lead.tags || []);
  const [customTag, setCustomTag] = useState('');
  const [saving, setSaving] = useState(false);

  const toggleTag = (tagId: string) => {
    setTagsList(prev => {
      const exists = prev.some(t => t.toLowerCase() === tagId.toLowerCase());
      if (exists) return prev.filter(t => t.toLowerCase() !== tagId.toLowerCase());
      return [...prev, tagId];
    });
  };

  const addCustomTag = () => {
    const trimmed = customTag.trim();
    if (!trimmed) return;
    if (!tagsList.some(t => t.toLowerCase() === trimmed.toLowerCase())) {
      setTagsList(prev => [...prev, trimmed]);
    }
    setCustomTag('');
  };

  const setFollowUpDays = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setForm(f => ({ ...f, follow_up_at: d.toISOString().split('T')[0] }));
  };

  const insertTimestamp = () => {
    const stamp = `[${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}]: `;
    setForm(f => ({ ...f, notes: f.notes ? `${f.notes}\n${stamp}` : stamp }));
  };

  const handleSave = async () => {
    setSaving(true);
    const updates: Partial<MasterclassLead> = {
      status: form.status as LeadStatus,
      intent: form.intent === '' ? null : form.intent as LeadIntent,
      lead_score: Number(form.lead_score),
      email_status: form.email_status,
      notes: form.notes || null,
      assigned_to: form.assigned_to ? form.assigned_to.trim() : null,
      tags: tagsList,
      interested: form.interested,
      goal: form.goal || null,
      profession: form.profession || null,
      company: form.company || null,
      follow_up_at: form.follow_up_at ? new Date(form.follow_up_at).toISOString() : null,
      lead_category: form.lead_category as LeadCategory,
    };
    await onSave(updates);
    setSaving(false);
  };

  const bg = avatarColor(lead.email_address);
  const pcfg = personaCfg(lead.what_best_describes_them);

  return (
    <ModalShell onClose={onClose} maxWidth={640}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, fontWeight: 600, color: '#fff', flexShrink: 0,
        }}>{avatar(lead.full_name, lead.email_address)}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: C.text }}>{lead.full_name || 'Unknown'}</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 2, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <span>{lead.email_address || '—'}</span>
            {lead.phone_number && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Phone size={11} /> {lead.phone_number}</span>}
            {lead.country && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><MapPin size={11} /> {lead.country}</span>}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Calendar size={11} /> Registered {fmtDate(lead.created_at)} ({relTime(lead.created_at)})</span>
          </div>
        </div>
        <button onClick={onClose} className="crm-hover" style={iconBtn}><X size={16} /></button>
      </div>

      {/* Personalization Profile */}
      <div style={{ marginBottom: 24 }}>
        <span style={labelStyle}>Personalization profile · from registration</span>
        <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', rowGap: 8, fontSize: 13 }}>
          <span style={{ color: C.faint }}>Persona</span>
          <span style={{ color: C.sub, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Dot color={pcfg.color} /> {lead.what_best_describes_them || 'Not specified'}
          </span>
          <span style={{ color: C.faint }}>Why signed up</span>
          <span style={{ color: C.sub }}>{lead.why_they_signed_up ? `"${lead.why_they_signed_up}"` : '—'}</span>
          <span style={{ color: C.faint }}>Enrolled for</span>
          <span style={{ color: C.sub }}>{lead.enrolled_for || '—'}</span>
        </div>
      </div>

      {/* Personalized Campaign Draft Ready Notification */}
      {lead.next_campaign && (
        <div style={{
          marginBottom: 24, padding: '12px 14px', border: `1px solid ${C.border}`, borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: C.text, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Dot color={C.accent} /> Personalized email draft ready
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
              Email status: <span style={{ color: C.sub }}>{lead.email_status || 'new'}</span>
            </div>
          </div>
          {onOpenCampaign && (
            <button
              type="button"
              onClick={() => { onClose(); onOpenCampaign(); }}
              className="crm-hover"
              style={{ ...btnGhost, fontSize: 12 }}
            >
              <Eye size={12} /> Preview & Send
            </button>
          )}
        </div>
      )}

      {/* What They Are Interested In (Manual Tagging) */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <span style={labelStyle}>Interested in</span>
          <span style={{ fontSize: 11, color: C.faint }}>Click to toggle</span>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          {PRESET_TAGS.map(pt => {
            const active = tagsList.some(t => t.toLowerCase() === pt.id.toLowerCase());
            return (
              <button
                key={pt.id}
                type="button"
                onClick={() => toggleTag(pt.id)}
                className="crm-hover"
                style={{
                  ...btnGhost, fontSize: 12, padding: '5px 10px',
                  background: active ? C.raised : 'transparent',
                  borderColor: active ? C.strong : C.border,
                  color: active ? C.text : C.muted,
                }}
              >
                <Dot color={active ? pt.color : C.faint} />
                {pt.label}
                {active && <Check size={11} />}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          <input
            value={customTag}
            onChange={e => setCustomTag(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomTag(); } }}
            placeholder="Add custom tag (e.g. VIP, Dubai, Urgent)…"
            className="crm-field"
            style={{ ...fieldStyle, fontSize: 12, padding: '6px 10px' }}
          />
          <button type="button" onClick={addCustomTag} className="crm-hover" style={{ ...btnGhost, fontSize: 12, padding: '6px 12px' }}>
            Add
          </button>
        </div>

        {tagsList.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
            {tagsList.map(tag => (
              <Chip key={tag} color={tagCfg(tag).color}>
                {tag}
                <button
                  type="button"
                  onClick={() => toggleTag(tag)}
                  style={{ background: 'none', border: 'none', color: C.faint, cursor: 'pointer', padding: 0, lineHeight: 1 }}
                >
                  ×
                </button>
              </Chip>
            ))}
          </div>
        )}
      </div>

      {/* Form grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* Lead Category / Funnel Level */}
        <div style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
            <span style={labelStyle}>Funnel level</span>
            <span style={{ fontSize: 11, color: C.faint, textAlign: 'right' }}>Level 1 is top priority · moving levels removes from previous level</span>
          </div>
          <div style={{ display: 'flex', border: `1px solid ${C.border}`, borderRadius: 8, padding: 3, gap: 3 }}>
            {Object.entries(LEAD_CATEGORY_CONFIG).map(([k, cfg]) => {
              const isActive = form.lead_category === k;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, lead_category: k as LeadCategory }))}
                  style={{
                    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                    padding: '7px 10px', borderRadius: 6, cursor: 'pointer', border: 'none',
                    background: isActive ? C.raised : 'transparent',
                    color: isActive ? C.text : C.muted, fontSize: 12, fontWeight: 500, fontFamily: 'inherit',
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Dot color={isActive ? cfg.color : C.faint} /> {cfg.label}
                  </span>
                  <span style={{ fontSize: 10, color: C.faint }}>
                    Level {cfg.level} {cfg.level === 1 ? '· Top' : cfg.level === 2 ? '· Mid' : '· Low'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Status */}
        <div>
          <label style={labelStyle}>Lead status</label>
          <select
            value={form.status}
            onChange={e => setForm(f => ({ ...f, status: e.target.value as LeadStatus }))}
            className="crm-field"
            style={fieldStyle}
          >
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>

        {/* Email Status */}
        <div>
          <label style={labelStyle}>Email status (n8n)</label>
          <select
            value={form.email_status}
            onChange={e => setForm(f => ({ ...f, email_status: e.target.value }))}
            className="crm-field"
            style={fieldStyle}
          >
            <option value="new">New (Pending)</option>
            <option value="ready">Ready to Send</option>
            <option value="sent">Sent</option>
            <option value="opened">Opened</option>
            <option value="bounced">Bounced</option>
          </select>
        </div>

        {/* Intent */}
        <div>
          <label style={labelStyle}>Intent</label>
          <select
            value={form.intent || ''}
            onChange={e => setForm(f => ({ ...f, intent: e.target.value }))}
            className="crm-field"
            style={fieldStyle}
          >
            <option value="">— Unset —</option>
            {Object.entries(INTENT_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.emoji} {v.label}</option>
            ))}
          </select>
        </div>

        {/* Lead Score */}
        <div>
          <label style={labelStyle}>Lead score (0–100)</label>
          <input
            type="number" min={0} max={100}
            value={form.lead_score}
            onChange={e => setForm(f => ({ ...f, lead_score: Math.max(0, Math.min(100, Number(e.target.value))) }))}
            className="crm-field"
            style={fieldStyle}
          />
        </div>

        {/* Assigned To */}
        <div style={{ gridColumn: 'span 2' }}>
          <label style={labelStyle}>Assigned to</label>
          <input
            type="text"
            value={form.assigned_to}
            onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))}
            placeholder="Team member name (e.g. Zain, Sarah, Alex)…"
            className="crm-field"
            style={fieldStyle}
          />
        </div>

        {/* Follow Up */}
        <div style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <label style={labelStyle}>Follow-up date</label>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" onClick={() => setFollowUpDays(1)} className="crm-link" style={btnText}>Tomorrow</button>
              <button type="button" onClick={() => setFollowUpDays(3)} className="crm-link" style={btnText}>+3 days</button>
              <button type="button" onClick={() => setFollowUpDays(7)} className="crm-link" style={btnText}>+1 week</button>
            </div>
          </div>
          <input
            type="date"
            value={form.follow_up_at}
            onChange={e => setForm(f => ({ ...f, follow_up_at: e.target.value }))}
            className="crm-field"
            style={fieldStyle}
          />
        </div>
      </div>

      {/* Notes */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <label style={labelStyle}>Notes & follow-up log</label>
          <button type="button" onClick={insertTimestamp} className="crm-link" style={btnText}>
            <Clock size={11} /> Timestamp
          </button>
        </div>
        <textarea
          value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          rows={4}
          placeholder="Internal notes, call details, meeting summaries, what the client said…"
          className="crm-field"
          style={{ ...fieldStyle, resize: 'vertical', lineHeight: 1.5 }}
        />
      </div>

      {/* Interested toggle */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, cursor: 'pointer' }}>
        <button
          type="button"
          onClick={() => setForm(f => ({ ...f, interested: !f.interested }))}
          style={{
            width: 32, height: 18, borderRadius: 9,
            background: form.interested ? C.accent : C.strong,
            border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0,
            transition: 'background 0.2s',
          }}
        >
          <span style={{
            width: 14, height: 14, borderRadius: 7, background: form.interested ? '#09090b' : C.sub,
            position: 'absolute', top: 2, left: form.interested ? 16 : 2,
            transition: 'left 0.2s',
          }} />
        </button>
        <span style={{ fontSize: 13, color: C.sub }}>Mark as interested (starred)</span>
      </label>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', borderTop: `1px solid ${C.border}`, paddingTop: 20 }}>
        <button onClick={onClose} className="crm-hover" style={btnGhost}>Cancel</button>
        <button onClick={handleSave} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.6 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}>
          {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={14} />}
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </ModalShell>
  );
}

// ─── Quick Notes Modal ─────────────────────────────────────────────────────────
function NotesModal({
  lead,
  onClose,
  onSave,
  showToast,
}: {
  lead: MasterclassLead;
  onClose: () => void;
  onSave: (notes: string) => Promise<void>;
  showToast: (msg: string, type: 'success' | 'error') => void;
}) {
  const [noteText, setNoteText] = useState(lead.notes || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(noteText.trim());
      showToast('Note updated successfully', 'success');
      onClose();
    } catch {
      showToast('Failed to save note', 'error');
    } finally {
      setSaving(false);
    }
  };

  const insertTimestamp = () => {
    const stamp = `[${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}]: `;
    setNoteText(prev => prev ? `${prev}\n${stamp}` : stamp);
  };

  return (
    <ModalShell onClose={onClose} maxWidth={520} zIndex={1200}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.text, display: 'flex', alignItems: 'center', gap: 8 }}>
            <MessageSquare size={14} style={{ color: C.muted }} /> Notes & follow-up
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
            {lead.full_name || 'Lead'} · {lead.email_address || '—'}
          </div>
        </div>
        <button onClick={onClose} className="crm-hover" style={iconBtn}><X size={16} /></button>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span style={labelStyle}>Internal CRM log</span>
        <button type="button" onClick={insertTimestamp} className="crm-link" style={btnText}>
          <Clock size={11} /> Timestamp
        </button>
      </div>

      <textarea
        value={noteText}
        onChange={e => setNoteText(e.target.value)}
        rows={7}
        placeholder="e.g. Call booked for Thursday at 3 PM. Interested in AAA Accelerator agency package. Follow up on WhatsApp…"
        className="crm-field"
        style={{ ...fieldStyle, padding: 12, lineHeight: 1.6, resize: 'vertical' }}
        autoFocus
      />

      <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
        <button onClick={onClose} className="crm-hover" style={btnGhost}>Cancel</button>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ ...btnPrimary, opacity: saving ? 0.6 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}
        >
          {saving ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={13} />}
          Save note
        </button>
      </div>
    </ModalShell>
  );
}

// ─── Email Campaign Preview & Action Modal ──────────────────────────────────────
function EmailCampaignModal({
  lead,
  onClose,
  onUpdateLead,
  showToast,
}: {
  lead: MasterclassLead;
  onClose: () => void;
  onUpdateLead: (id: string | number, updates: Partial<MasterclassLead>) => Promise<void>;
  showToast: (msg: string, type: 'success' | 'error') => void;
}) {
  const parsed = extractSubjectAndBody(lead.next_campaign);
  const [subject, setSubject] = useState(parsed.subject || lead.email_subject || 'Masterclass Invitation');
  const [body, setBody] = useState(parsed.body);
  const [activeTab, setActiveTab] = useState<'preview' | 'edit'>('preview');
  const [saving, setSaving] = useState(false);
  const [markingSent, setMarkingSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const combined = `Subject: ${subject}\n\n${body}`;
      await onUpdateLead(lead.id, {
        next_campaign: combined,
        email_subject: subject,
      });
      showToast('Campaign draft saved!', 'success');
    } catch {
      showToast('Failed to save campaign', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkAsSent = async () => {
    setMarkingSent(true);
    try {
      await onUpdateLead(lead.id, {
        email_status: 'sent',
        last_campaign_sent_at: new Date().toISOString(),
        email_automation_status: 'completed',
        status: lead.status === 'new' ? 'contacted' : lead.status,
      });
      showToast(`Marked as Sent for ${lead.full_name || 'lead'}!`, 'success');
      onClose();
    } catch {
      showToast('Failed to update email status', 'error');
    } finally {
      setMarkingSent(false);
    }
  };

  const copyEmail = () => {
    const full = `Subject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(full);
    setCopied(true);
    showToast('Copied full email copy to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const copyJsonPayload = () => {
    const payload = {
      lead_id: lead.id,
      recipient_name: lead.full_name,
      recipient_email: lead.email_address,
      subject,
      html_content: body,
      persona: lead.what_best_describes_them,
      why_signed_up: lead.why_they_signed_up,
      enrolled_for: lead.enrolled_for,
      country: lead.country,
    };
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    showToast('Copied n8n webhook payload JSON!', 'success');
  };

  const pcfg = personaCfg(lead.what_best_describes_them);
  const isSent = lead.email_status === 'sent';

  const tabStyle = (active: boolean): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer',
    border: 'none', fontFamily: 'inherit',
    background: active ? C.raised : 'transparent',
    color: active ? C.text : C.muted,
  });

  return (
    <ModalShell onClose={onClose} maxWidth={760} zIndex={1100} flush>
      {/* Header */}
      <div style={{
        padding: '18px 24px', borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.text, display: 'flex', alignItems: 'center', gap: 10 }}>
            Personalized email
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 500, color: C.muted }}>
              <Dot color={isSent ? C.success : C.accent} /> {isSent ? 'Sent' : 'Draft ready'}
            </span>
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
            To <span style={{ color: C.sub }}>{lead.full_name || 'Lead'}</span> &lt;{lead.email_address}&gt;
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', gap: 2, border: `1px solid ${C.border}`, borderRadius: 8, padding: 2 }}>
            <button onClick={() => setActiveTab('preview')} style={tabStyle(activeTab === 'preview')}>
              <Eye size={12} /> Preview
            </button>
            <button onClick={() => setActiveTab('edit')} style={tabStyle(activeTab === 'edit')}>
              <Edit3 size={12} /> Edit copy
            </button>
          </div>
          <button onClick={onClose} className="crm-hover" style={iconBtn}><X size={16} /></button>
        </div>
      </div>

      {/* Lead context */}
      <div style={{
        padding: '10px 24px', borderBottom: `1px solid ${C.border}`,
        display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', fontSize: 12, color: C.muted,
      }}>
        {lead.what_best_describes_them && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: C.sub }}>
            <Dot color={pcfg.color} /> {lead.what_best_describes_them}
          </span>
        )}
        {lead.why_they_signed_up && (
          <span>Why: "{lead.why_they_signed_up}"</span>
        )}
        {lead.created_at && (
          <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4, color: C.faint }}>
            <Clock size={11} /> Added {fmtDate(lead.created_at)} ({relTime(lead.created_at)})
          </span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Subject line</label>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="crm-field"
              style={{ ...fieldStyle, fontWeight: 500 }}
            />
            <button
              onClick={() => { navigator.clipboard.writeText(subject); showToast('Copied Subject!', 'success'); }}
              title="Copy Subject"
              className="crm-hover"
              style={{ ...btnGhost, fontSize: 12 }}
            >
              Copy
            </button>
          </div>
        </div>

        {activeTab === 'preview' ? (
          <div>
            <label style={labelStyle}>Inbox preview</label>
            <div style={{
              background: '#ffffff', color: '#1f2937', borderRadius: 10, padding: 28,
              fontSize: 14, lineHeight: 1.6, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}>
              <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: 14, marginBottom: 18 }}>
                <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>From: AI Founder Hub &lt;team@aifounderhub.com&gt;</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6 }}>To: {lead.full_name || 'Lead'} &lt;{lead.email_address}&gt;</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{subject}</div>
              </div>
              <div
                dangerouslySetInnerHTML={{ __html: body }}
                style={{ wordBreak: 'break-word' }}
              />
            </div>
          </div>
        ) : (
          <div>
            <label style={labelStyle}>HTML / Markdown content</label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={14}
              className="crm-field"
              style={{ ...fieldStyle, padding: 14, lineHeight: 1.6, fontFamily: 'JetBrains Mono, monospace', fontSize: 12, resize: 'vertical' }}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '14px 24px', borderTop: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <button onClick={copyEmail} className="crm-link" style={btnText}>
            {copied ? <Check size={12} style={{ color: C.success }} /> : <Mail size={12} />}
            {copied ? 'Copied email' : 'Copy full email'}
          </button>
          <button onClick={copyJsonPayload} className="crm-link" style={btnText}>
            <Sparkles size={12} /> Copy n8n payload
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {activeTab === 'edit' && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="crm-hover"
              style={{ ...btnGhost, cursor: saving ? 'not-allowed' : 'pointer' }}
            >
              {saving ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={13} />}
              Save changes
            </button>
          )}
          <button
            onClick={handleMarkAsSent}
            disabled={markingSent || isSent}
            style={isSent
              ? { ...btnGhost, color: C.success, cursor: 'not-allowed' }
              : { ...btnPrimary, cursor: markingSent ? 'not-allowed' : 'pointer' }}
          >
            {markingSent ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={13} />}
            {isSent ? 'Already sent' : 'Mark as sent'}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

// ─── Add / Upsert Lead Modal with Funnel Upgrade & Duplicate Check ────────────
function AddLeadModal({
  onClose,
  onSuccess,
  showToast,
}: {
  onClose: () => void;
  onSuccess: () => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [category, setCategory] = useState<LeadCategory>('afh_signup');
  const [status, setStatus] = useState<LeadStatus>('new');
  const [notes, setNotes] = useState('');
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [existingLead, setExistingLead] = useState<MasterclassLead | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Check duplicate via email on blur
  const checkDuplicateEmail = async (val: string) => {
    const clean = val.trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      setExistingLead(null);
      return;
    }
    setCheckingEmail(true);
    try {
      const { data } = await crmSupabase
        .from('masterclass_leads')
        .select('*')
        .ilike('email_address', clean)
        .limit(1);

      if (data && data.length > 0) {
        setExistingLead(data[0] as MasterclassLead);
      } else {
        setExistingLead(null);
      }
    } catch {
      // ignore
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      showToast('Please provide a valid email address', 'error');
      return;
    }

    setSubmitting(true);
    try {
      // Step 1: Duplicate check via email
      const { data: existingRows, error: searchErr } = await crmSupabase
        .from('masterclass_leads')
        .select('*')
        .ilike('email_address', cleanEmail)
        .limit(1);

      if (searchErr) throw searchErr;

      const found = existingRows && existingRows.length > 0 ? (existingRows[0] as MasterclassLead) : null;

      if (found) {
        // Lead already exists! Do NOT add duplicate record.
        const currentCat = (found.lead_category as LeadCategory) || 'free_class_registration';
        const currentLevel = LEAD_LEVELS[currentCat] ?? 2;
        const newLevel = LEAD_LEVELS[category] ?? 2;
        const isUpgrade = newLevel < currentLevel;

        const updatePayload: Record<string, any> = {
          updated_at: new Date().toISOString(),
        };

        if (fullName.trim()) updatePayload.full_name = fullName.trim();
        if (phone.trim()) updatePayload.phone_number = phone.trim();
        if (country.trim()) updatePayload.country = country.trim();
        if (notes.trim()) {
          updatePayload.notes = found.notes ? `${found.notes} | ${notes.trim()}` : notes.trim();
        }

        if (isUpgrade) {
          // Upgrade level! Automatically removes from old level because lead_category is updated.
          updatePayload.lead_category = category;
          const { error: updErr } = await crmSupabase
            .from('masterclass_leads')
            .update(updatePayload)
            .eq('id', found.id);

          if (updErr) throw updErr;

          showToast(
            `Lead already exists! Upgraded from Level ${currentLevel} (${LEAD_CATEGORY_CONFIG[currentCat]?.label}) to Level ${newLevel} (${LEAD_CATEGORY_CONFIG[category].label}). Removed from Level ${currentLevel}.`,
            'success'
          );
        } else {
          // Already at equal or higher level — preserve higher level and update info without duplicating
          const { error: updErr } = await crmSupabase
            .from('masterclass_leads')
            .update(updatePayload)
            .eq('id', found.id);

          if (updErr) throw updErr;

          showToast(
            `Lead already exists at Level ${currentLevel} (${LEAD_CATEGORY_CONFIG[currentCat]?.label}). Updated record without duplicate.`,
            'info'
          );
        }
      } else {
        // No duplicate found: insert new single lead record
        const insertPayload: Record<string, any> = {
          full_name: fullName.trim() || null,
          email_address: cleanEmail,
          phone_number: phone.trim() || null,
          country: country.trim() || null,
          lead_category: category,
          status,
          notes: notes.trim() || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { error: insErr } = await crmSupabase
          .from('masterclass_leads')
          .insert(insertPayload);

        if (insErr) throw insErr;

        showToast(`New Level ${LEAD_LEVELS[category]} lead added successfully!`, 'success');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err?.message || 'Failed to save lead', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const existingCat = existingLead ? ((existingLead.lead_category as LeadCategory) || 'free_class_registration') : null;
  const existingLevel = existingCat ? (LEAD_LEVELS[existingCat] ?? 2) : null;
  const targetLevel = LEAD_LEVELS[category] ?? 2;
  const isUpgrading = existingLevel !== null && targetLevel < existingLevel;

  return (
    <ModalShell onClose={onClose} maxWidth={520} zIndex={1200}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0, color: C.text, display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserPlus size={14} style={{ color: C.muted }} /> Add / upgrade lead
          </h2>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Checks for duplicate email · upgrades level without duplicate rows</div>
        </div>
        <button onClick={onClose} className="crm-hover" style={iconBtn}><X size={16} /></button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Email input with duplicate check indicator */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>
            Email address <span style={{ color: C.danger }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="email"
              required
              value={email}
              onChange={e => { setEmail(e.target.value); }}
              onBlur={e => checkDuplicateEmail(e.target.value)}
              placeholder="founder@example.com"
              className="crm-field"
              style={{ ...fieldStyle, paddingRight: 32, borderColor: existingLead ? C.strong : C.border }}
            />
            {checkingEmail && (
              <Loader2 size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: C.muted, animation: 'spin 1s linear infinite' }} />
            )}
          </div>

          {/* Live Duplicate notification */}
          {existingLead && (
            <div style={{
              marginTop: 8, padding: '10px 12px', borderRadius: 8,
              background: C.raised, fontSize: 12, color: C.sub, lineHeight: 1.5,
            }}>
              <div style={{ fontWeight: 500, color: C.text, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Dot color={isUpgrading ? C.success : '#eab308'} />
                {isUpgrading ? 'Lead upgrade detected' : 'Lead already exists'}
              </div>
              <div>
                Found existing record: <span style={{ color: C.text }}>{existingLead.full_name || 'No Name'}</span> currently at{' '}
                <span style={{ textDecoration: isUpgrading ? 'line-through' : 'none' }}>
                  Level {existingLevel} ({LEAD_CATEGORY_CONFIG[existingCat!].label})
                </span>
                {isUpgrading && (
                  <span> → will be upgraded to <span style={{ color: C.text }}>Level {targetLevel} ({LEAD_CATEGORY_CONFIG[category].label})</span> and removed from Level {existingLevel}.</span>
                )}
                {' '}No duplicate record will be created.
              </div>
            </div>
          )}
        </div>

        {/* Full Name & Phone */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Full name</label>
            <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Jane Doe" className="crm-field" style={fieldStyle} />
          </div>
          <div>
            <label style={labelStyle}>Phone / WhatsApp</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+971 50 123 4567" className="crm-field" style={fieldStyle} />
          </div>
        </div>

        {/* Funnel Level / Category selection */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Target funnel level</label>
          <div style={{ display: 'flex', border: `1px solid ${C.border}`, borderRadius: 8, padding: 3, gap: 3 }}>
            {Object.entries(LEAD_CATEGORY_CONFIG).map(([k, cfg]) => {
              const isSelected = category === k;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setCategory(k as LeadCategory)}
                  style={{
                    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                    padding: '7px 8px', borderRadius: 6, cursor: 'pointer', border: 'none',
                    background: isSelected ? C.raised : 'transparent',
                    color: isSelected ? C.text : C.muted, fontSize: 12, fontWeight: 500, fontFamily: 'inherit',
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Dot color={isSelected ? cfg.color : C.faint} /> {cfg.label}
                  </span>
                  <span style={{ fontSize: 10, color: C.faint }}>
                    Level {cfg.level} {cfg.level === 1 ? '· Top' : cfg.level === 2 ? '· Mid' : '· Low'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Country & Status */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Location / country</label>
            <input value={country} onChange={e => setCountry(e.target.value)} placeholder="United Arab Emirates" className="crm-field" style={fieldStyle} />
          </div>
          <div>
            <label style={labelStyle}>Initial status</label>
            <select value={status} onChange={e => setStatus(e.target.value as LeadStatus)} className="crm-field" style={fieldStyle}>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Notes */}
        <div style={{ marginBottom: 22 }}>
          <label style={labelStyle}>Notes</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            placeholder="Source, interest, campaign notes…"
            className="crm-field"
            style={{ ...fieldStyle, resize: 'none' }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button type="button" onClick={onClose} className="crm-hover" style={btnGhost}>Cancel</button>
          <button
            type="submit"
            disabled={submitting}
            style={{ ...btnPrimary, opacity: submitting ? 0.6 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}
          >
            {submitting ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={13} />}
            {existingLead ? (isUpgrading ? 'Upgrade existing lead' : 'Update existing lead') : 'Save lead'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

// ─── Sent Email Record Interface ──────────────────────────────────────────────
interface SentEmailRecord {
  id: string | number;
  full_name: string | null;
  email_address: string | null;
  lead_category: LeadCategory | null;
  email_status: string | null;
  last_campaign_sent_at: string | null;
  last_emailed_at: string | null;
  campaign_name: string | null;
  email_subject: string | null;
  next_campaign: string | null;
  created_at: string;
}

// ─── Sent Email Preview Modal ─────────────────────────────────────────────────
function SentEmailPreviewModal({
  record,
  onClose,
}: {
  record: SentEmailRecord;
  onClose: () => void;
}) {
  const parsed = extractSubjectAndBody(record.next_campaign);
  const subject = record.email_subject || parsed.subject || 'Masterclass Invitation';
  const body = parsed.body || '<p>No message body recorded.</p>';
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);

  const sentTimestamp = record.last_campaign_sent_at || record.last_emailed_at || record.created_at;
  const catCfg = leadCategoryCfg(record.lead_category);

  return (
    <ModalShell onClose={onClose} maxWidth={720} zIndex={1300} flush>
      {/* Header */}
      <div style={{
        padding: '16px 22px', borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: C.raised,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#eab308',
          }}>
            <Send size={15} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text, display: 'flex', alignItems: 'center', gap: 8 }}>
              Delivered Email Preview
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11,
                fontWeight: 500, color: C.success, background: 'rgba(34,197,94,0.1)',
                padding: '2px 7px', borderRadius: 4,
              }}>
                <Check size={11} /> Sent
              </span>
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
              To <span style={{ color: C.text }}>{record.full_name || 'Lead'}</span> &lt;{record.email_address}&gt;
            </div>
          </div>
        </div>
        <button onClick={onClose} className="crm-hover" style={iconBtn}><X size={16} /></button>
      </div>

      {/* Meta info bar */}
      <div style={{
        padding: '10px 22px', borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', fontSize: 12, color: C.muted, background: C.raised,
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: C.text }}>
          <Clock size={12} color={C.muted} /> {fmtDateTime(sentTimestamp)} ({relTime(sentTimestamp)})
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: C.sub }}>
          <Dot color={catCfg.dotColor} /> {catCfg.label}
        </span>
        <span style={{ color: C.faint }}>
          Campaign: <span style={{ color: C.sub }}>{record.campaign_name || 'Masterclass Welcome'}</span>
        </span>
      </div>

      {/* Body content */}
      <div style={{ padding: 22, overflowY: 'auto', maxHeight: 'calc(85vh - 160px)' }}>
        {/* Subject line box */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <label style={labelStyle}>Subject line</label>
            <button
              onClick={() => {
                navigator.clipboard.writeText(subject);
                setCopiedSubject(true);
                setTimeout(() => setCopiedSubject(false), 2000);
              }}
              className="crm-hover"
              style={{ ...btnGhost, padding: '2px 8px', fontSize: 11 }}
            >
              <Copy size={11} /> {copiedSubject ? 'Copied!' : 'Copy Subject'}
            </button>
          </div>
          <div style={{
            background: C.panel, border: `1px solid ${C.border}`, borderRadius: 8,
            padding: '10px 14px', fontSize: 13, color: C.text, fontWeight: 500,
          }}>
            {subject}
          </div>
        </div>

        {/* Rendered HTML content */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <label style={labelStyle}>Rendered Email Body</label>
            <button
              onClick={() => {
                navigator.clipboard.writeText(body);
                setCopiedBody(true);
                setTimeout(() => setCopiedBody(false), 2000);
              }}
              className="crm-hover"
              style={{ ...btnGhost, padding: '2px 8px', fontSize: 11 }}
            >
              <Copy size={11} /> {copiedBody ? 'Copied HTML!' : 'Copy Body'}
            </button>
          </div>
          <div style={{
            background: '#ffffff', color: '#1f2937', borderRadius: 10, padding: 24,
            fontSize: 14, lineHeight: 1.6, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}>
            <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: 12, marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>From: AI Founder Hub &lt;hello@aifounderhub.com&gt;</div>
              <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>To: {record.full_name || 'Lead'} &lt;{record.email_address}&gt;</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{subject}</div>
            </div>
            <div dangerouslySetInnerHTML={{ __html: body }} style={{ wordBreak: 'break-word' }} />
          </div>
        </div>
      </div>

      <div style={{
        padding: '12px 22px', borderTop: `1px solid ${C.border}`,
        display: 'flex', justifyContent: 'flex-end', background: C.raised,
      }}>
        <button onClick={onClose} style={{ ...btnGhost, fontSize: 12 }}>Close</button>
      </div>
    </ModalShell>
  );
}

// ─── Email History & Date Delivery Log Modal ──────────────────────────────────
function EmailHistoryModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<SentEmailRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | LeadCategory>('all');
  const [search, setSearch] = useState('');
  const [previewRecord, setPreviewRecord] = useState<SentEmailRecord | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await crmSupabase
        .from('masterclass_leads')
        .select('id, full_name, email_address, lead_category, email_status, last_campaign_sent_at, last_emailed_at, campaign_name, email_subject, next_campaign, created_at')
        .eq('email_status', 'sent')
        .order('last_campaign_sent_at', { ascending: false, nullsFirst: false });

      if (err) throw err;
      setRecords((data || []) as SentEmailRecord[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Aggregate by date (YYYY-MM-DD)
  const dateCounts: Record<string, number> = {};
  for (const r of records) {
    const rawDate = r.last_campaign_sent_at || r.last_emailed_at || r.created_at;
    const dateKey = rawDate ? rawDate.slice(0, 10) : 'unknown';
    dateCounts[dateKey] = (dateCounts[dateKey] || 0) + 1;
  }
  const sortedDates = Object.keys(dateCounts).sort((a, b) => b.localeCompare(a));

  // Filter records
  const filtered = records.filter(r => {
    const rawDate = r.last_campaign_sent_at || r.last_emailed_at || r.created_at;
    const dateKey = rawDate ? rawDate.slice(0, 10) : 'unknown';
    if (selectedDate !== 'all' && dateKey !== selectedDate) return false;
    if (categoryFilter !== 'all' && (r.lead_category || 'free_class_registration') !== categoryFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = (r.full_name || '').toLowerCase().includes(q);
      const matchEmail = (r.email_address || '').toLowerCase().includes(q);
      const matchSubj = (r.email_subject || '').toLowerCase().includes(q);
      const matchCamp = (r.campaign_name || '').toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchSubj && !matchCamp) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedRecords = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Stats for the active view
  const uniqueRecipients = new Set(filtered.map(r => (r.email_address || '').toLowerCase())).size;

  const exportHistoryCsv = () => {
    const rows = filtered.map(r => {
      const parsed = extractSubjectAndBody(r.next_campaign);
      const subject = r.email_subject || parsed.subject || 'Masterclass Invitation';
      return {
        LeadID: r.id,
        DateSent: (r.last_campaign_sent_at || r.last_emailed_at || r.created_at || '').slice(0, 10),
        Timestamp: r.last_campaign_sent_at || r.last_emailed_at || r.created_at || '',
        RecipientName: r.full_name || '',
        RecipientEmail: r.email_address || '',
        Category: r.lead_category || 'free_class_registration',
        CampaignName: r.campaign_name || 'Masterclass Welcome',
        Subject: subject,
      };
    });
    if (!rows.length) return;
    const header = Object.keys(rows[0]).join(',');
    const csv = [header, ...rows.map(row => Object.values(row).map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `sent-email-history-${selectedDate === 'all' ? 'all-dates' : selectedDate}.csv`;
    a.click();
  };

  const formatKeyLabel = (dKey: string) => {
    if (!dKey || dKey === 'all') return 'All Dates';
    if (dKey === 'unknown') return 'Unknown Date';
    try {
      const parts = dKey.split('-');
      if (parts.length === 3) {
        const y = Number(parts[0]);
        const m = Number(parts[1]);
        const d = Number(parts[2]);
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
          const dt = new Date(y, m - 1, d);
          if (!isNaN(dt.getTime())) {
            return dt.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });
          }
        }
      }
      return dKey;
    } catch {
      return dKey;
    }
  };

  return (
    <>
      <ModalShell onClose={onClose} maxWidth={1040} zIndex={1200} flush>
        {/* Header */}
        <div style={{
          padding: '18px 24px', borderBottom: `1px solid ${C.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8, background: 'rgba(234, 179, 8, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#eab308',
            }}>
              <Send size={18} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: C.text, display: 'flex', alignItems: 'center', gap: 10 }}>
                Email Delivery History
                <span style={{ fontSize: 12, fontWeight: 500, color: C.muted, background: C.raised, padding: '2px 8px', borderRadius: 4 }}>
                  {records.length} Total Sent
                </span>
              </div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                Track on which date how many and which emails were sent to leads
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={fetchHistory}
              disabled={loading}
              className="crm-hover"
              style={{ ...btnGhost, fontSize: 12 }}
            >
              <RefreshCw size={12} style={loading ? { animation: 'spin 1s linear infinite' } : undefined} />
              Refresh
            </button>
            <button
              onClick={exportHistoryCsv}
              disabled={!filtered.length}
              className="crm-hover"
              style={{ ...btnGhost, fontSize: 12 }}
            >
              <Download size={12} /> Export CSV
            </button>
            <button onClick={onClose} className="crm-hover" style={iconBtn}><X size={16} /></button>
          </div>
        </div>

        {/* ─── Date Breakdown Bar (on which date how many) ───────────────────── */}
        <div style={{
          padding: '16px 24px', borderBottom: `1px solid ${C.border}`,
          background: C.panel, display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.text, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={13} color={C.muted} />
              Dates breakdown ({sortedDates.length} {sortedDates.length === 1 ? 'date' : 'dates'})
            </div>
            <div style={{ fontSize: 12, color: C.muted }}>
              Click any date to see exactly which emails were sent that day
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={() => { setSelectedDate('all'); setPage(1); }}
              className="crm-link"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                border: selectedDate === 'all' ? `1px solid ${C.accent}` : `1px solid ${C.border}`,
                background: selectedDate === 'all' ? C.raised : 'transparent',
                color: selectedDate === 'all' ? C.text : C.muted,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              <span>All Dates</span>
              <span style={{
                background: selectedDate === 'all' ? C.accent : C.raised,
                color: selectedDate === 'all' ? '#000' : C.muted,
                fontSize: 11, fontWeight: 600, padding: '1px 6px', borderRadius: 10,
              }}>
                {records.length}
              </span>
            </button>

            {sortedDates.map(dateKey => {
              const count = dateCounts[dateKey];
              const isSelected = selectedDate === dateKey;
              return (
                <button
                  key={dateKey}
                  onClick={() => { setSelectedDate(dateKey); setPage(1); }}
                  className="crm-link"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                    border: isSelected ? `1px solid ${C.accent}` : `1px solid ${C.border}`,
                    background: isSelected ? C.raised : 'transparent',
                    color: isSelected ? C.text : C.muted,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  <Clock size={12} color={isSelected ? C.accent : C.faint} />
                  <span>{formatKeyLabel(dateKey)}</span>
                  <span style={{
                    background: isSelected ? '#eab308' : C.raised,
                    color: isSelected ? '#000' : C.text,
                    fontSize: 11, fontWeight: 600, padding: '1px 6px', borderRadius: 10,
                  }}>
                    {count} {count === 1 ? 'email' : 'emails'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Metrics Bar inside Modal */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8,
            paddingTop: 4,
          }}>
            <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px' }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Showing emails</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: C.text }}>{filtered.length}</div>
            </div>
            <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px' }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Unique recipients</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: C.text }}>{uniqueRecipients}</div>
            </div>
            <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px' }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Selected date</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {formatKeyLabel(selectedDate)}
              </div>
            </div>
            <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px' }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Delivery status</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.success, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Check size={13} /> 100% Sent
              </div>
            </div>
          </div>
        </div>

        {/* ─── Search & Category Filters Strip ──────────────────────────────── */}
        <div style={{
          padding: '12px 24px', borderBottom: `1px solid ${C.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
          background: C.bg,
        }}>
          <div style={{ position: 'relative', width: 280 }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: C.faint }} />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search recipient, email, or subject..."
              className="crm-field"
              style={{ ...fieldStyle, paddingLeft: 30, fontSize: 12 }}
            />
          </div>

          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: C.faint, marginRight: 4 }}>Funnel:</span>
            <button
              onClick={() => { setCategoryFilter('all'); setPage(1); }}
              className="crm-link"
              style={{
                background: categoryFilter === 'all' ? C.raised : 'transparent',
                border: 'none', borderRadius: 6, padding: '4px 8px', fontSize: 11,
                color: categoryFilter === 'all' ? C.text : C.muted, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              All
            </button>
            {Object.entries(LEAD_CATEGORY_CONFIG).map(([k, cfg]) => {
              const active = categoryFilter === k;
              return (
                <button
                  key={k}
                  onClick={() => { setCategoryFilter(active ? 'all' : k as LeadCategory); setPage(1); }}
                  className="crm-link"
                  style={{
                    background: active ? C.raised : 'transparent',
                    border: 'none', borderRadius: 6, padding: '4px 8px', fontSize: 11,
                    color: active ? C.text : C.muted, cursor: 'pointer', fontFamily: 'inherit',
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                  }}
                >
                  <Dot color={cfg.dotColor} /> {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Table of Sent Emails ─────────────────────────────────────────── */}
        <div style={{ overflowX: 'auto', maxHeight: 'calc(70vh - 200px)', minHeight: 280 }}>
          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: C.muted }}>
              <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
              <div>Loading email sending history…</div>
            </div>
          ) : error ? (
            <div style={{ padding: 40, textAlign: 'center', color: C.danger }}>
              Failed to load email history: {error}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center', color: C.muted }}>
              <Mail size={32} style={{ color: C.faint, margin: '0 auto 12px' }} />
              <div style={{ fontSize: 14, fontWeight: 500, color: C.text, marginBottom: 4 }}>No sent emails found</div>
              <div style={{ fontSize: 12 }}>Try adjusting your date or search filters.</div>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.raised }}>
                  <th style={{ padding: '10px 16px', textAlign: 'left', color: C.muted, fontWeight: 500 }}>Recipient</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: C.muted, fontWeight: 500 }}>Date & Time Sent</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: C.muted, fontWeight: 500 }}>Funnel Level</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: C.muted, fontWeight: 500 }}>Subject & Campaign</th>
                  <th style={{ padding: '10px 16px', textAlign: 'right', color: C.muted, fontWeight: 500 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagedRecords.map((r, idx) => {
                  const catCfg = leadCategoryCfg(r.lead_category);
                  const parsed = extractSubjectAndBody(r.next_campaign);
                  const subject = r.email_subject || parsed.subject || 'Masterclass Invitation';
                  const sentTs = r.last_campaign_sent_at || r.last_emailed_at || r.created_at;

                  return (
                    <tr
                      key={r.id || idx}
                      onClick={() => setPreviewRecord(r)}
                      className="crm-hover"
                      style={{
                        borderBottom: `1px solid ${C.border}`,
                        cursor: 'pointer',
                        transition: 'background 0.12s ease',
                      }}
                    >
                      {/* Recipient */}
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 26, height: 26, borderRadius: '50%',
                            background: avatarColor(r.email_address),
                            color: '#fff', fontSize: 11, fontWeight: 600,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}>
                            {avatar(r.full_name, r.email_address)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500, color: C.text }}>
                              {r.full_name || <span style={{ color: C.faint }}>—</span>}
                            </div>
                            <div style={{ fontSize: 11, color: C.muted }}>
                              {r.email_address}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Date & Time Sent */}
                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                        <div style={{ color: C.text, fontWeight: 500 }}>
                          {fmtDateTime(sentTs)}
                        </div>
                        <div style={{ fontSize: 11, color: C.faint }}>
                          {relTime(sentTs)}
                        </div>
                      </td>

                      {/* Funnel Level */}
                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          fontSize: 11, fontWeight: 500, color: C.sub,
                          background: C.raised, padding: '3px 8px', borderRadius: 6,
                          border: `1px solid ${C.border}`,
                        }}>
                          <Dot color={catCfg.dotColor} /> {catCfg.short}
                        </span>
                      </td>

                      {/* Subject & Campaign */}
                      <td style={{ padding: '12px 14px', maxWidth: 360 }}>
                        <div style={{
                          color: C.text, fontWeight: 500,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {subject}
                        </div>
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                          {r.campaign_name || 'Masterclass Welcome'}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setPreviewRecord(r);
                          }}
                          className="crm-hover"
                          style={{
                            ...btnGhost,
                            fontSize: 11,
                            padding: '4px 9px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                          }}
                        >
                          <Eye size={12} /> View email
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ─── Footer Pagination ─────────────────────────────────────────────── */}
        <div style={{
          padding: '14px 24px', borderTop: `1px solid ${C.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: C.raised, flexWrap: 'wrap', gap: 12, fontSize: 12, color: C.muted,
        }}>
          <div>
            Showing <span style={{ color: C.text, fontWeight: 500 }}>
              {filtered.length ? (currentPage - 1) * pageSize + 1 : 0}
            </span> to <span style={{ color: C.text, fontWeight: 500 }}>
              {Math.min(currentPage * pageSize, filtered.length)}
            </span> of <span style={{ color: C.text, fontWeight: 500 }}>{filtered.length}</span> sent emails
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="crm-hover"
              style={{
                ...btnGhost, fontSize: 12, padding: '4px 10px',
                opacity: currentPage <= 1 ? 0.4 : 1,
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
              }}
            >
              <ChevronLeft size={13} /> Prev
            </button>
            <span style={{ color: C.text, fontWeight: 500, fontSize: 12 }}>
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="crm-hover"
              style={{
                ...btnGhost, fontSize: 12, padding: '4px 10px',
                opacity: currentPage >= totalPages ? 0.4 : 1,
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              Next <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </ModalShell>

      {/* Render detailed preview modal if selected */}
      {previewRecord && (
        <SentEmailPreviewModal
          record={previewRecord}
          onClose={() => setPreviewRecord(null)}
        />
      )}
    </>
  );
}

// ─── Login Gate ────────────────────────────────────────────────────────────────
function CrmLoginGate({ onAuth }: { onAuth: (email: string) => void }) {
  const [email, setEmail] = useState('zangbang360@gmail.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const cleanEmail = email.trim().toLowerCase();

    // 1. Direct check against the authorized user credentials
    const matchesUser = cleanEmail === 'zangbang360@gmail.com' && password === 'Ajalpc@yo1';
    const matchesEnv = cleanEmail === CRM_USER.toLowerCase() && password === CRM_PASS;
    const matchesLegacy = cleanEmail === 'aifounderhub' && password === 'Wegrowtogether@yo1';

    if (matchesUser || matchesEnv || matchesLegacy) {
      const sessionData = {
        email: cleanEmail === 'aifounderhub' ? 'aifounderhub' : 'zangbang360@gmail.com',
        token: btoa(`${cleanEmail}:${Date.now()}`),
        timestamp: Date.now(),
      };
      localStorage.setItem(CRM_SESSION_KEY, JSON.stringify(sessionData));
      onAuth(sessionData.email);
      setLoading(false);
      return;
    }

    // 2. Fallback check with Supabase Auth
    try {
      const { data, error: supaErr } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
      if (!supaErr && data.user) {
        const sessionEmail = data.user.email ?? cleanEmail;
        const sessionData = {
          email: sessionEmail,
          token: btoa(`${sessionEmail}:${Date.now()}`),
          timestamp: Date.now(),
        };
        localStorage.setItem(CRM_SESSION_KEY, JSON.stringify(sessionData));
        onAuth(sessionEmail);
        setLoading(false);
        return;
      }
    } catch {
      // Continue to error
    }

    setError('Invalid Gmail or password. Please verify your credentials.');
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', background: C.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: FONT, padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        {/* Logo + title */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <Target size={16} color={C.accent} />
            <span style={{ fontSize: 12, fontWeight: 600, color: C.sub, letterSpacing: '0.02em' }}>AI Founder Hub</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: C.text, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            Lead Intelligence CRM
          </h1>
          <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
            Sign in to access leads & email automation
          </p>
        </div>

        <form onSubmit={handleLogin}>
          {/* Gmail / Email */}
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="crm-email" style={labelStyle}>Gmail / email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.faint }} />
              <input
                id="crm-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="zangbang360@gmail.com"
                autoComplete="email"
                required
                autoFocus
                className="crm-field"
                style={{ ...fieldStyle, padding: '10px 12px 10px 36px', fontSize: 14, borderColor: error ? C.danger : C.border }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 20 }}>
            <label htmlFor="crm-password" style={labelStyle}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.faint }} />
              <input
                id="crm-password"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                required
                className="crm-field"
                style={{ ...fieldStyle, padding: '10px 40px 10px 36px', fontSize: 14, borderColor: error ? C.danger : C.border }}
              />
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                tabIndex={-1}
                style={{ ...iconBtn, position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)' }}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Error notice */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 16, fontSize: 13, color: C.danger, lineHeight: 1.4 }}>
              <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            id="crm-login-btn"
            type="submit"
            disabled={loading}
            style={{
              ...btnPrimary, width: '100%', padding: '10px 16px', fontSize: 14,
              opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading
              ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Authenticating…</>
              : <><ShieldCheck size={15} /> Sign in</>
            }
          </button>
        </form>

        <div style={{ marginTop: 24, fontSize: 12, color: C.faint, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Lock size={11} /> Restricted to authorized administrators
        </div>
      </div>

      <style>{CRM_CSS}</style>
    </div>
  );
}

// ─── Main CRM Page ──────────────────────────────────────────────────────────────
function CrmDashboard({ userEmail, onSignOut }: { userEmail?: string; onSignOut?: () => void }) {
  const [leads, setLeads] = useState<MasterclassLead[]>([]);
  const [stats, setStats] = useState<CrmStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [intentFilter, setIntentFilter] = useState('all');
  const [personaFilter, setPersonaFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [emailFilter, setEmailFilter] = useState<'all' | 'ready' | 'needs_draft' | 'sent' | 'new'>('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortAsc, setSortAsc] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 25;

  // Selection & modals
  const [selected, setSelected] = useState<Set<string | number>>(new Set());
  const [editingLead, setEditingLead] = useState<MasterclassLead | null>(null);
  const [notesModalLead, setNotesModalLead] = useState<MasterclassLead | null>(null);
  const [activeTagMenuLeadId, setActiveTagMenuLeadId] = useState<string | number | null>(null);
  const [editingAssignLeadId, setEditingAssignLeadId] = useState<string | number | null>(null);
  const [assignInputVal, setAssignInputVal] = useState('');
  const [campaignModalLead, setCampaignModalLead] = useState<MasterclassLead | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [emailHistoryOpen, setEmailHistoryOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);

  const searchDebounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // ── Fetch leads ───────────────────────────────────────────────────────────
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let q = crmSupabase
        .from('masterclass_leads')
        .select('*', { count: 'exact' });

      // Filter on persona (real column)
      if (personaFilter !== 'all') {
        q = q.eq('what_best_describes_them', personaFilter);
      }
      // Status filter
      if (statusFilter !== 'all') {
        q = q.eq('status', statusFilter);
      }
      // Interest Tag filter
      if (tagFilter !== 'all') {
        q = q.contains('tags', [tagFilter]);
      }
      // Lead Category filter
      if (categoryFilter !== 'all') {
        q = q.eq('lead_category', categoryFilter);
      }
      // Email / Campaign filter
      if (emailFilter === 'ready') {
        q = q.not('next_campaign', 'is', null);
      } else if (emailFilter === 'needs_draft') {
        q = q.is('next_campaign', null);
      } else if (emailFilter === 'sent') {
        q = q.eq('email_status', 'sent');
      } else if (emailFilter === 'new') {
        q = q.eq('email_status', 'new');
      }

      if (search.trim()) {
        q = q.or(
          `full_name.ilike.%${search}%,email_address.ilike.%${search}%,` +
          `country.ilike.%${search}%,why_they_signed_up.ilike.%${search}%,` +
          `assigned_to.ilike.%${search}%,notes.ilike.%${search}%,next_campaign.ilike.%${search}%`
        );
      }

      q = q
        .order(sortBy, { ascending: sortAsc })
        .range((page - 1) * limit, page * limit - 1);

      const { data, error: err, count } = await q;
      if (err) throw new Error(err.message);
      setLeads((data || []) as MasterclassLead[]);
      setTotal(count || 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, tagFilter, intentFilter, personaFilter, categoryFilter, emailFilter, sortBy, sortAsc, page]);

  // ── Fetch stats ───────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const { data, error: err, count } = await crmSupabase
        .from('masterclass_leads')
        .select('country, what_best_describes_them, enrolled_for, status, intent, email_automation_status, lead_score, interested, email_status, next_campaign, lead_category', { count: 'exact' });

      if (err) {
        // Fallback
        const { data: baseData, count: baseCount } = await crmSupabase
          .from('masterclass_leads')
          .select('country, what_best_describes_them, enrolled_for', { count: 'exact' });

        const items = baseData || [];
        const byCountry: Record<string, number> = {};
        const byPersona: Record<string, number> = {};
        const byEnrolled: Record<string, number> = {};

        for (const l of items) {
          if (l.country) byCountry[l.country] = (byCountry[l.country] || 0) + 1;
          if (l.what_best_describes_them) byPersona[l.what_best_describes_them] = (byPersona[l.what_best_describes_them] || 0) + 1;
          if (l.enrolled_for) byEnrolled[l.enrolled_for] = (byEnrolled[l.enrolled_for] || 0) + 1;
        }

        setStats({
          total: baseCount || 0,
          interested: 0,
          avgScore: 0,
          campaignsReady: 0,
          emailsSent: 0,
          byStatus: {},
          byIntent: {},
          byAutomation: {},
          byPersona,
          byEnrolled,
          byEmailStatus: {},
          byCategory: {},
          topCountries: Object.entries(byCountry).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([country, cnt]) => ({ country, count: cnt })),
        });
        return;
      }

      const items = data || [];
      const byStatus: Record<string, number> = {};
      const byIntent: Record<string, number> = {};
      const byCountry: Record<string, number> = {};
      const byAutomation: Record<string, number> = {};
      const byPersona: Record<string, number> = {};
      const byEnrolled: Record<string, number> = {};
      const byEmailStatus: Record<string, number> = {};
      const byCategory: Record<string, number> = {};
      let totalScore = 0;
      let interested = 0;
      let campaignsReady = 0;
      let emailsSent = 0;

      for (const l of items) {
        if (l.status) byStatus[l.status] = (byStatus[l.status] || 0) + 1;
        if (l.intent) byIntent[l.intent] = (byIntent[l.intent] || 0) + 1;
        if (l.country) byCountry[l.country] = (byCountry[l.country] || 0) + 1;
        if (l.email_automation_status) byAutomation[l.email_automation_status] = (byAutomation[l.email_automation_status] || 0) + 1;
        if (l.what_best_describes_them) byPersona[l.what_best_describes_them] = (byPersona[l.what_best_describes_them] || 0) + 1;
        if (l.enrolled_for) byEnrolled[l.enrolled_for] = (byEnrolled[l.enrolled_for] || 0) + 1;
        if (l.email_status) byEmailStatus[l.email_status] = (byEmailStatus[l.email_status] || 0) + 1;
        const cat = l.lead_category || 'free_class_registration';
        byCategory[cat] = (byCategory[cat] || 0) + 1;
        if (l.next_campaign) campaignsReady++;
        if (l.email_status === 'sent') emailsSent++;
        totalScore += l.lead_score || 0;
        if (l.interested) interested++;
      }

      const topCountries = Object.entries(byCountry)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([country, cnt]) => ({ country, count: cnt }));

      setStats({
        total: count || 0,
        interested,
        avgScore: items.length ? Math.round(totalScore / items.length) : 0,
        campaignsReady,
        emailsSent,
        byStatus,
        byIntent,
        byAutomation,
        byPersona,
        byEnrolled,
        byEmailStatus,
        byCategory,
        topCountries,
      });
    } catch (e) {
      console.error('Stats error:', e);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      setPage(1);
      fetchLeads();
    }, 300);
    return () => clearTimeout(searchDebounce.current);
  }, [search, statusFilter, tagFilter, intentFilter, personaFilter, categoryFilter, emailFilter, sortBy, sortAsc]);

  useEffect(() => {
    fetchLeads();
  }, [page]);

  // ── Update a lead ─────────────────────────────────────────────────────────
  const updateLead = useCallback(async (id: string | number, updates: Partial<MasterclassLead>) => {
    try {
      const { error: err } = await crmSupabase
        .from('masterclass_leads')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (err) throw err;

      setLeads(prev => prev.map(l => String(l.id) === String(id) ? { ...l, ...updates } : l));
      setEditingLead(null);
      showToast('Lead updated successfully', 'success');
      fetchStats();
    } catch (e: any) {
      if (e?.message?.includes('lead_crm_status')) {
        showToast('Run migration 0006 in Supabase SQL editor to allow new status', 'error');
      } else {
        showToast(e instanceof Error ? e.message : 'Update failed', 'error');
      }
    }
  }, [fetchStats]);

  // ── Quick Status Dropdown Change ──────────────────────────────────────────
  const handleQuickStatusChange = useCallback(async (leadId: string | number, newStatus: LeadStatus) => {
    try {
      const updates: Partial<MasterclassLead> = {
        status: newStatus,
        updated_at: new Date().toISOString(),
        ...(newStatus === 'interested' ? { interested: true } : {}),
      };
      const { error: err } = await crmSupabase
        .from('masterclass_leads')
        .update(updates)
        .eq('id', leadId);

      if (err) throw err;
      setLeads(prev => prev.map(l => String(l.id) === String(leadId) ? { ...l, ...updates } : l));
      showToast(`Status updated to ${STATUS_CONFIG[newStatus]?.label || newStatus}`, 'success');
      fetchStats();
    } catch (e: any) {
      if (e?.message?.includes('lead_crm_status')) {
        showToast('Run migration 0006 in Supabase SQL editor to enable this status', 'error');
      } else {
        showToast(e instanceof Error ? e.message : 'Status update failed', 'error');
      }
    }
  }, [fetchStats]);

  // ── Quick Tag Toggle on Lead ───────────────────────────────────────────────
  const handleToggleTag = useCallback(async (lead: MasterclassLead, tagToToggle: string) => {
    const currentTags = lead.tags || [];
    const exists = currentTags.some(t => t.toLowerCase() === tagToToggle.toLowerCase());
    const newTags = exists
      ? currentTags.filter(t => t.toLowerCase() !== tagToToggle.toLowerCase())
      : [...currentTags, tagToToggle];

    try {
      const { error: err } = await crmSupabase
        .from('masterclass_leads')
        .update({ tags: newTags, updated_at: new Date().toISOString() })
        .eq('id', lead.id);

      if (err) throw err;
      setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, tags: newTags } : l));
      showToast(`${exists ? 'Removed' : 'Added'} tag "${tagToToggle}"`, 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Tag update failed', 'error');
    }
  }, []);

  // ── Quick Save Note ───────────────────────────────────────────────────────
  const handleSaveNote = useCallback(async (leadId: string | number, newNotes: string) => {
    const updates = { notes: newNotes, updated_at: new Date().toISOString() };
    const { error: err } = await crmSupabase
      .from('masterclass_leads')
      .update(updates)
      .eq('id', leadId);

    if (err) throw err;
    setLeads(prev => prev.map(l => String(l.id) === String(leadId) ? { ...l, notes: newNotes } : l));
  }, []);

  // ── Quick Assign Team Member ──────────────────────────────────────────────
  const handleQuickAssign = useCallback(async (leadId: string | number, name: string) => {
    const assignedName = name.trim() || null;
    try {
      const updates = { assigned_to: assignedName, updated_at: new Date().toISOString() };
      const { error: err } = await crmSupabase
        .from('masterclass_leads')
        .update(updates)
        .eq('id', leadId);

      if (err) throw err;
      setLeads(prev => prev.map(l => String(l.id) === String(leadId) ? { ...l, assigned_to: assignedName } : l));
      showToast(assignedName ? `Assigned to ${assignedName}` : 'Lead unassigned', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to update assignment', 'error');
    }
  }, []);

  // ── Bulk actions ──────────────────────────────────────────────────────────
  const bulkUpdate = useCallback(async (updates: Partial<MasterclassLead>, label: string) => {
    if (!selected.size) return;
    setBulkLoading(true);
    try {
      const ids = Array.from(selected);
      const { error: err } = await crmSupabase
        .from('masterclass_leads')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .in('id', ids);
      if (err) throw err;

      setLeads(prev => prev.map(l => selected.has(l.id) ? { ...l, ...updates } : l));
      setSelected(new Set());
      showToast(`${label} — ${ids.length} leads updated`, 'success');
      fetchStats();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Bulk action failed', 'error');
    } finally {
      setBulkLoading(false);
    }
  }, [selected, fetchStats]);

  const triggerAutomation = useCallback(async () => {
    if (!selected.size) return;
    await bulkUpdate({ email_automation_status: 'queued' }, 'Email automation queued');
  }, [selected, bulkUpdate]);

  // ── Toast ─────────────────────────────────────────────────────────────────
  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Sort toggle ───────────────────────────────────────────────────────────
  const toggleSort = (col: string) => {
    if (sortBy === col) setSortAsc(a => !a);
    else { setSortBy(col); setSortAsc(false); }
    setPage(1);
  };

  // ── Select all on current page ────────────────────────────────────────────
  const toggleSelectAll = () => {
    if (selected.size === leads.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(leads.map(l => l.id)));
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  // ── Export CSV ────────────────────────────────────────────────────────────
  const exportCsv = () => {
    const rows = leads.map(l => ({
      ID: l.id,
      Name: l.full_name || '',
      Email: l.email_address || '',
      AssignedTo: l.assigned_to || '',
      Phone: l.phone_number || '',
      Country: l.country || '',
      Persona: l.what_best_describes_them || '',
      WhySignedUp: l.why_they_signed_up || '',
      EnrolledFor: l.enrolled_for || '',
      EmailStatus: l.email_status || 'new',
      HasCampaignDraft: l.next_campaign ? 'Yes' : 'No',
      Status: l.status || 'new',
      Intent: l.intent || '',
      Score: l.lead_score ?? 0,
      Interested: l.interested ? 'Yes' : 'No',
      AddedDate: fmtDate(l.created_at),
    }));
    const header = Object.keys(rows[0] || {}).join(',');
    const csv = [header, ...rows.map(r => Object.values(r).map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };



  // ─────────────────────────────────────────────────────────────────────────────
  const segBtn = (active: boolean): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', gap: 6,
    background: active ? C.raised : 'transparent', border: 'none',
    borderRadius: 6, padding: '4px 9px', cursor: 'pointer', fontFamily: 'inherit',
    fontSize: 12, color: active ? C.text : C.muted, fontWeight: 500, whiteSpace: 'nowrap',
  });

  const thStyle: React.CSSProperties = {
    padding: '10px 14px', textAlign: 'left', fontSize: 12, color: C.muted, fontWeight: 500,
    cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', background: C.bg,
  };

  const td: React.CSSProperties = { padding: '10px 14px', verticalAlign: 'middle' };

  const panelStyle: React.CSSProperties = { border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: FONT }}>
      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999, maxWidth: 420,
          background: C.raised, border: `1px solid ${C.strong}`, color: C.text,
          borderRadius: 10, padding: '10px 14px', fontSize: 13,
          display: 'flex', alignItems: 'center', gap: 10,
          animation: 'slideIn 0.2s ease',
        }}>
          <Dot color={toast.type === 'success' ? C.success : toast.type === 'error' ? C.danger : C.sub} size={7} />
          {toast.msg}
        </div>
      )}

      {/* ── Lead Edit Modal ────────────────────────────────────────────────── */}
      {editingLead && (
        <LeadModal
          lead={editingLead}
          onClose={() => setEditingLead(null)}
          onSave={(updates) => updateLead(editingLead.id, updates)}
          onOpenCampaign={() => setCampaignModalLead(editingLead)}
        />
      )}

      {/* ── Email Campaign Preview Modal ──────────────────────────────────── */}
      {campaignModalLead && (
        <EmailCampaignModal
          lead={campaignModalLead}
          onClose={() => setCampaignModalLead(null)}
          onUpdateLead={updateLead}
          showToast={showToast}
        />
      )}

      {/* ── Quick Notes Modal ──────────────────────────────────────────────── */}
      {notesModalLead && (
        <NotesModal
          lead={notesModalLead}
          onClose={() => setNotesModalLead(null)}
          onSave={notes => handleSaveNote(notesModalLead.id, notes)}
          showToast={showToast}
        />
      )}

      {/* ── Add / Upsert Lead Modal ────────────────────────────────────────── */}
      {addLeadOpen && (
        <AddLeadModal
          onClose={() => setAddLeadOpen(false)}
          onSuccess={() => { fetchLeads(); fetchStats(); }}
          showToast={showToast}
        />
      )}

      {/* ── Email History Modal ────────────────────────────────────────────── */}
      {emailHistoryOpen && (
        <EmailHistoryModal
          onClose={() => setEmailHistoryOpen(false)}
        />
      )}

      {/* ── Page content ──────────────────────────────────────────────────── */}
      <div
        onClick={() => { if (activeTagMenuLeadId) setActiveTagMenuLeadId(null); }}
        style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px 48px' }}
      >

        {/* ─── Header ───────────────────────────────────────────────────────── */}
        <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Target size={14} color={C.accent} />
              <span style={{ fontSize: 12, color: C.muted }}>AI Founder Hub</span>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: C.text, margin: 0, letterSpacing: '-0.02em' }}>Lead Intelligence</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, fontSize: 12, color: C.muted }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ animation: 'pulse 2s infinite', display: 'inline-flex' }}><Dot color={C.success} /></span>
                Live · {total} leads
              </span>
              <span style={{ color: C.faint }}>·</span>
              <span style={{ color: C.faint }}>Zoho → Dashboard → Automation</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {userEmail && (
              <span style={{ fontSize: 12, color: C.muted, marginRight: 4 }}>{userEmail}</span>
            )}
            <button onClick={() => { fetchLeads(); fetchStats(); }} className="crm-hover" style={{ ...btnGhost, fontSize: 12 }}>
              <RefreshCw size={12} /> Refresh
            </button>
            <button onClick={exportCsv} className="crm-hover" style={{ ...btnGhost, fontSize: 12 }}>
              <Download size={12} /> Export CSV
            </button>
            <button
              onClick={() => setEmailHistoryOpen(true)}
              className="crm-hover"
              style={{ ...btnGhost, fontSize: 12 }}
              title="View sent email history by date"
            >
              <Clock size={12} /> Email history
            </button>
            <button onClick={() => setAddLeadOpen(true)} style={{ ...btnPrimary, fontSize: 12 }}>
              <UserPlus size={13} /> Add lead
            </button>
            {onSignOut && (
              <button onClick={onSignOut} title="Sign out of CRM" className="crm-hover" style={iconBtn}>
                <LogOut size={14} />
              </button>
            )}
          </div>
        </div>

        {/* ─── Metrics strip ────────────────────────────────────────────────── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 1,
          background: C.border, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden',
          marginBottom: 20,
        }}>
          <StatTile label="Total leads" value={statsLoading ? '…' : stats?.total ?? 0} icon={Users} color="#a78bfa" />
          <StatTile
            label="Campaigns ready"
            value={statsLoading ? '…' : stats?.campaignsReady ?? 0}
            sub={stats ? `${stats.campaignsReady} drafts` : undefined}
            icon={Sparkles} color={C.accent} accent
          />
          <StatTile
            label="Interested"
            value={statsLoading ? '…' : (stats?.byStatus?.['interested'] || stats?.interested || 0)}
            icon={Star} color="#34d399"
          />
          <StatTile
            label="Meeting booked"
            value={statsLoading ? '…' : stats?.byStatus?.['meeting_booked'] ?? 0}
            icon={Calendar} color="#38bdf8"
          />
          <StatTile
            label="Closed"
            value={statsLoading ? '…' : stats?.byStatus?.['closed'] ?? 0}
            icon={CheckCircle} color={C.accent}
          />
          <StatTile
            label="Emails sent"
            value={statsLoading ? '…' : stats?.emailsSent ?? 0}
            sub={stats?.emailsSent ? 'View history ↗' : undefined}
            icon={Send} color="#eab308"
            onClick={() => setEmailHistoryOpen(true)}
          />
        </div>

        {/* ─── Funnel levels & pipeline filters ─────────────────────────────── */}
        {stats && !statsLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
            {/* Funnel levels (L1 AFH Signup → L2 Free Class → L3 Gumroad) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: C.faint, width: 64 }}>Funnel</span>
              <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <button onClick={() => { setCategoryFilter('all'); setPage(1); }} className="crm-link" style={segBtn(categoryFilter === 'all')}>
                  All <span style={{ color: C.faint }}>{stats.total}</span>
                </button>
                {Object.entries(LEAD_CATEGORY_CONFIG).map(([key, cfg]) => {
                  const count = stats.byCategory[key] || 0;
                  const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                  const isActive = categoryFilter === key;
                  return (
                    <button
                      key={key}
                      onClick={() => { setCategoryFilter(isActive ? 'all' : key); setPage(1); }}
                      className="crm-link"
                      style={segBtn(isActive)}
                      title={`${cfg.levelBadge} · ${pct}%`}
                    >
                      <Dot color={cfg.color} />
                      <span style={{ color: C.faint }}>L{cfg.level}</span>
                      {cfg.label}
                      <span style={{ color: C.faint }}>{count} · {pct}%</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pipeline status & intent */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: C.faint, width: 64 }}>Pipeline</span>
                <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                  <button onClick={() => { setStatusFilter('all'); setPage(1); }} className="crm-link" style={segBtn(statusFilter === 'all')}>
                    All <span style={{ color: C.faint }}>{total}</span>
                  </button>
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                    const count = stats.byStatus[key] || 0;
                    const isActive = statusFilter === key;
                    return (
                      <button
                        key={key}
                        onClick={() => { setStatusFilter(isActive ? 'all' : key); setPage(1); }}
                        className="crm-link"
                        style={segBtn(isActive)}
                      >
                        <Dot color={cfg.color} />
                        {cfg.label}
                        <span style={{ color: C.faint }}>{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, color: C.faint }}>Intent</span>
                <IntentBar byIntent={stats.byIntent} />
              </div>
            </div>
          </div>
        )}

        {/* ─── Controls ─────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 260px' }}>
            <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: C.faint }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name, email, country, notes, tags…"
              className="crm-field"
              style={{ ...fieldStyle, paddingLeft: 32 }}
            />
          </div>

          {/* Interest Tag filter */}
          <select value={tagFilter} onChange={e => { setTagFilter(e.target.value); setPage(1); }} className="crm-field" style={selectStyle}>
            <option value="all">All tags</option>
            {PRESET_TAGS.map(pt => (
              <option key={pt.id} value={pt.label}>{pt.label}</option>
            ))}
          </select>

          {/* Persona filter */}
          <select value={personaFilter} onChange={e => { setPersonaFilter(e.target.value); setPage(1); }} className="crm-field" style={selectStyle}>
            <option value="all">All personas</option>
            {Object.entries(PERSONA_COLORS).map(([persona, cfg]) => (
              <option key={persona} value={persona}>{cfg.emoji} {persona}</option>
            ))}
          </select>

          {/* Lead Category filter */}
          <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }} className="crm-field" style={selectStyle}>
            <option value="all">All categories</option>
            {Object.entries(LEAD_CATEGORY_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.emoji} {v.label}</option>
            ))}
          </select>

          {/* Status filter */}
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="crm-field" style={selectStyle}>
            <option value="all">All statuses</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>

          {/* Email / Campaign filter */}
          <select value={emailFilter} onChange={e => { setEmailFilter(e.target.value as any); setPage(1); }} className="crm-field" style={selectStyle}>
            <option value="all">All email status</option>
            <option value="ready">Draft Ready ({stats?.campaignsReady || 0})</option>
            <option value="needs_draft">Needs Draft</option>
            <option value="sent">Sent ({stats?.emailsSent || 0})</option>
            <option value="new">New (Pending)</option>
          </select>

          {/* Bulk actions */}
          {selected.size > 0 && (
            <div style={{
              display: 'flex', gap: 14, alignItems: 'center',
              background: C.raised, borderRadius: 8, padding: '7px 12px',
            }}>
              <span style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>{selected.size} selected</span>
              <button onClick={triggerAutomation} disabled={bulkLoading} className="crm-link" style={btnText}>
                <Send size={11} /> Queue
              </button>
              <button
                onClick={() => bulkUpdate({ status: 'interested', interested: true }, 'Marked as Interested')}
                disabled={bulkLoading}
                className="crm-link"
                style={btnText}
              >
                <Star size={11} /> Interested
              </button>
              <button onClick={() => setSelected(new Set())} className="crm-link" style={btnText} title="Clear selection">
                <X size={12} />
              </button>
            </div>
          )}
        </div>

        {/* ─── Table ────────────────────────────────────────────────────────── */}
        <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
          {loading ? (
            <div style={{ padding: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: C.muted, fontSize: 13 }}>
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Loading leads…
            </div>
          ) : error ? (
            <div style={{ padding: 56, textAlign: 'center', fontSize: 13 }}>
              <AlertCircle size={20} style={{ marginBottom: 10, color: C.danger }} />
              <div style={{ marginBottom: 8, color: C.danger }}>{error}</div>
              {error.includes('does not exist') && (
                <div style={{ fontSize: 12, color: C.muted, maxWidth: 420, margin: '0 auto', lineHeight: 1.5 }}>
                  The CRM table needs additional columns. Run the migration in{' '}
                  <code style={{ color: C.sub }}>supabase/migrations/0006_masterclass_leads_crm.sql</code>{' '}
                  using the Supabase SQL Editor with your service role key.
                </div>
              )}
            </div>
          ) : leads.length === 0 ? (
            <div style={{ padding: 64, textAlign: 'center' }}>
              <Inbox size={24} style={{ marginBottom: 12, color: C.faint }} />
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4, color: C.sub }}>No leads found</div>
              <div style={{ fontSize: 13, color: C.muted }}>
                {search || statusFilter !== 'all' || tagFilter !== 'all' || intentFilter !== 'all' || personaFilter !== 'all' || categoryFilter !== 'all' || emailFilter !== 'all'
                  ? 'Try adjusting your filters or search query.'
                  : 'No leads are currently available in the database.'}
              </div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1000 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    <th style={{ ...thStyle, width: 40, cursor: 'default' }}>
                      <input
                        type="checkbox"
                        checked={selected.size === leads.length && leads.length > 0}
                        onChange={toggleSelectAll}
                        style={{ cursor: 'pointer', accentColor: C.accent }}
                      />
                    </th>
                    {[
                      { key: 'full_name',                 label: 'Lead' },
                      { key: 'lead_category',             label: 'Category' },
                      { key: 'assigned_to',               label: 'Assigned to' },
                      { key: 'tags',                      label: 'Interest tags' },
                      { key: 'status',                    label: 'Status' },
                      { key: 'notes',                     label: 'Notes & follow-up' },
                      { key: 'what_best_describes_them',  label: 'Persona' },
                      { key: 'enrolled_for',              label: 'Enrolled for' },
                      { key: 'why_they_signed_up',        label: 'Why signed up' },
                      { key: 'next_campaign',             label: 'Campaign' },
                      { key: 'created_at',                label: 'Added' },
                      { key: 'country',                   label: 'Location' },
                    ].map(col => (
                      <th key={col.key} onClick={() => toggleSort(col.key)} className="crm-link" style={thStyle}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          {col.label}
                          {sortBy === col.key
                            ? (sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />)
                            : <ChevronDown size={12} style={{ opacity: 0.25 }} />}
                        </span>
                      </th>
                    ))}
                    <th style={{ ...thStyle, width: 96, cursor: 'default' }} />
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead, idx) => {
                    const isSelected = selected.has(lead.id);
                    const statusCfg = STATUS_CONFIG[lead.status] || STATUS_CONFIG.new;
                    const bg = avatarColor(lead.email_address);
                    const isTagMenuOpen = activeTagMenuLeadId === lead.id;

                    return (
                      <tr
                        key={lead.id}
                        className="crm-row"
                        style={{
                          borderBottom: idx < leads.length - 1 ? `1px solid ${C.border}` : 'none',
                          background: isSelected ? C.raised : undefined,
                        }}
                      >
                        {/* Checkbox */}
                        <td style={td}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              setSelected(prev => {
                                const next = new Set(prev);
                                next.has(lead.id) ? next.delete(lead.id) : next.add(lead.id);
                                return next;
                              });
                            }}
                            style={{ cursor: 'pointer', accentColor: C.accent }}
                          />
                        </td>

                        {/* Lead name + email */}
                        <td style={{ ...td, minWidth: 200 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 28, height: 28, borderRadius: '50%', background: bg, flexShrink: 0,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 11, fontWeight: 600, color: '#fff',
                            }}>{avatar(lead.full_name, lead.email_address)}</div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 500, color: C.text, display: 'flex', alignItems: 'center', gap: 6 }}>
                                {lead.full_name || 'Unknown'}
                                {lead.interested && <Star size={10} style={{ color: C.accent, fill: C.accent }} aria-label="Starred / Interested" />}
                              </div>
                              <div style={{ fontSize: 12, color: C.muted }}>{lead.email_address || '—'}</div>
                              {lead.phone_number && (
                                <div style={{ fontSize: 11, color: C.faint }}>{lead.phone_number}</div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Lead Category / Funnel Level */}
                        <td style={{ ...td, minWidth: 140 }}>
                          {(() => {
                            const cat = categoryCfg(lead.lead_category);
                            return (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.sub, whiteSpace: 'nowrap' }}>
                                <Dot color={cat.color} />
                                {cat.label}
                                <span style={{ color: C.faint }}>L{cat.level}</span>
                              </span>
                            );
                          })()}
                        </td>

                        {/* Assigned To */}
                        <td style={{ ...td, minWidth: 140 }}>
                          {editingAssignLeadId === lead.id ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={e => e.stopPropagation()}>
                              <input
                                autoFocus
                                value={assignInputVal}
                                onChange={e => setAssignInputVal(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') {
                                    handleQuickAssign(lead.id, assignInputVal);
                                    setEditingAssignLeadId(null);
                                  } else if (e.key === 'Escape') {
                                    setEditingAssignLeadId(null);
                                  }
                                }}
                                onBlur={() => {
                                  if (assignInputVal.trim() !== (lead.assigned_to || '')) {
                                    handleQuickAssign(lead.id, assignInputVal);
                                  }
                                  setEditingAssignLeadId(null);
                                }}
                                placeholder="Name…"
                                className="crm-field"
                                style={{ ...fieldStyle, width: 100, padding: '4px 8px', fontSize: 12, borderColor: C.muted }}
                              />
                              <button
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleQuickAssign(lead.id, assignInputVal);
                                  setEditingAssignLeadId(null);
                                }}
                                className="crm-hover"
                                style={{ ...iconBtn, width: 24, height: 24 }}
                              >
                                <Check size={12} />
                              </button>
                            </div>
                          ) : lead.assigned_to ? (
                            <button
                              type="button"
                              onClick={() => {
                                setAssignInputVal(lead.assigned_to || '');
                                setEditingAssignLeadId(lead.id);
                              }}
                              title="Click to change assignee"
                              className="crm-link"
                              style={{ ...btnText, gap: 6, color: C.sub }}
                            >
                              <span style={{
                                width: 18, height: 18, borderRadius: 9, background: C.strong,
                                color: C.text, fontSize: 10, fontWeight: 600,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                {lead.assigned_to.charAt(0).toUpperCase()}
                              </span>
                              <span>{lead.assigned_to}</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setAssignInputVal('');
                                setEditingAssignLeadId(lead.id);
                              }}
                              className="crm-link crm-reveal"
                              style={{ ...btnText, color: C.faint }}
                            >
                              <Users size={11} /> Assign
                            </button>
                          )}
                        </td>

                        {/* Interest Tags (Manual Tagging) */}
                        <td style={{ ...td, minWidth: 200, position: 'relative' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                            {(lead.tags || []).map(tag => (
                              <Chip key={tag} color={tagCfg(tag).color}>
                                {tag}
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleToggleTag(lead, tag); }}
                                  title="Remove tag"
                                  className="crm-link"
                                  style={{ background: 'none', border: 'none', color: C.faint, cursor: 'pointer', padding: 0, fontSize: 12, lineHeight: 1 }}
                                >
                                  ×
                                </button>
                              </Chip>
                            ))}

                            {/* Quick Add Tag Popover Trigger */}
                            <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => setActiveTagMenuLeadId(isTagMenuOpen ? null : lead.id)}
                                className="crm-link crm-reveal"
                                style={{ ...btnText, fontSize: 11, color: C.faint, padding: '3px 4px' }}
                                title="Tag client interest"
                              >
                                <Tag size={10} /> Tag
                              </button>

                              {/* Popover */}
                              {isTagMenuOpen && (
                                <div style={{
                                  position: 'absolute', top: '100%', left: 0, zIndex: 100, marginTop: 4,
                                  background: C.surface, border: `1px solid ${C.strong}`, borderRadius: 10,
                                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)', padding: 4, minWidth: 180,
                                }}>
                                  <div style={{ fontSize: 11, color: C.faint, padding: '6px 8px 4px' }}>
                                    Client interest tags
                                  </div>
                                  {PRESET_TAGS.map(pt => {
                                    const hasTag = (lead.tags || []).some(t => t.toLowerCase() === pt.id.toLowerCase());
                                    return (
                                      <button
                                        key={pt.id}
                                        type="button"
                                        onClick={() => handleToggleTag(lead, pt.label)}
                                        className="crm-hover"
                                        style={{
                                          width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                                          background: 'transparent', border: 'none', fontFamily: 'inherit',
                                          borderRadius: 6, padding: '6px 8px', fontSize: 12, color: hasTag ? C.text : C.sub,
                                          cursor: 'pointer', textAlign: 'left',
                                        }}
                                      >
                                        <Dot color={pt.color} />
                                        <span style={{ flex: 1 }}>{pt.label}</span>
                                        {hasTag && <Check size={12} style={{ color: C.text }} />}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Status (Interactive Quick Dropdown) */}
                        <td style={td}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <Dot color={statusCfg.color} />
                            <select
                              value={lead.status || 'new'}
                              onChange={e => handleQuickStatusChange(lead.id, e.target.value as LeadStatus)}
                              className="crm-link"
                              style={{
                                background: 'transparent', color: C.sub, border: 'none',
                                padding: '2px 0', fontSize: 12, fontWeight: 500,
                                cursor: 'pointer', outline: 'none', fontFamily: 'inherit',
                              }}
                            >
                              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                                <option key={k} value={k}>{v.label}</option>
                              ))}
                            </select>
                          </div>
                        </td>

                        {/* Notes & Follow-up */}
                        <td style={{ ...td, maxWidth: 220 }}>
                          {lead.notes ? (
                            <div
                              onClick={() => setNotesModalLead(lead)}
                              className="crm-link"
                              style={{ cursor: 'pointer', color: C.sub, minWidth: 0 }}
                              title="Click to view or edit notes"
                            >
                              <div style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {lead.notes}
                              </div>
                              {lead.follow_up_at && (
                                <div style={{ fontSize: 11, color: C.faint, display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                  <Calendar size={10} /> Follow up {fmtDate(lead.follow_up_at)}
                                </div>
                              )}
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setNotesModalLead(lead)}
                              className="crm-link crm-reveal"
                              style={{ ...btnText, color: C.faint }}
                            >
                              <MessageSquare size={11} /> Add note
                            </button>
                          )}
                        </td>

                        {/* Persona */}
                        <td style={td}>
                          {lead.what_best_describes_them ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.sub, whiteSpace: 'nowrap' }}>
                              <Dot color={personaCfg(lead.what_best_describes_them).color} />
                              {lead.what_best_describes_them}
                            </span>
                          ) : <span style={{ fontSize: 12, color: C.faint }}>—</span>}
                        </td>

                        {/* Enrolled For */}
                        <td style={{ ...td, maxWidth: 180 }}>
                          <span style={{
                            fontSize: 12, color: C.sub,
                            display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }} title={lead.enrolled_for || ''}>
                            {lead.enrolled_for
                              ? lead.enrolled_for.replace('🎓 ', '').replace(' — Build & Sell For $500–$2,500/Mo', '')
                              : '—'}
                          </span>
                        </td>

                        {/* Why They Signed Up */}
                        <td style={{ ...td, maxWidth: 180 }}>
                          <span style={{
                            fontSize: 12, color: C.muted,
                            display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }} title={lead.why_they_signed_up || ''}>
                            {lead.why_they_signed_up
                              ? `"${lead.why_they_signed_up.charAt(0).toUpperCase()}${lead.why_they_signed_up.slice(1)}"`
                              : '—'}
                          </span>
                        </td>

                        {/* Personalized Campaign (next_campaign + email_status) */}
                        <td style={{ ...td, minWidth: 190, maxWidth: 240 }}>
                          {lead.next_campaign ? (() => {
                            const { subject } = extractSubjectAndBody(lead.next_campaign);
                            const isSent = lead.email_status === 'sent';
                            return (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: C.sub }}>
                                    <Dot color={isSent ? C.success : C.accent} />
                                    {isSent ? 'Sent' : 'Draft ready'}
                                  </span>
                                  <button onClick={() => setCampaignModalLead(lead)} className="crm-link" style={{ ...btnText, fontSize: 11 }}>
                                    <Eye size={11} /> Preview
                                  </button>
                                </div>
                                <span style={{
                                  fontSize: 11, color: C.faint, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                  maxWidth: 220, display: 'block',
                                }} title={subject}>
                                  {subject || 'Personalized copy prepared'}
                                </span>
                              </div>
                            );
                          })() : (
                            <span style={{ fontSize: 12, color: C.faint }}>No draft</span>
                          )}
                        </td>

                        {/* Added / Created At */}
                        <td style={{ ...td, whiteSpace: 'nowrap' }}>
                          <div style={{ fontSize: 12, color: C.sub }}>{fmtDate(lead.created_at)}</div>
                          <div style={{ fontSize: 11, color: C.faint }}>{relTime(lead.created_at)}</div>
                        </td>

                        {/* Location */}
                        <td style={td}>
                          <span style={{ fontSize: 12, color: C.sub, display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                            <MapPin size={11} style={{ color: C.faint }} />
                            {lead.country ? lead.country.replace(/\s*\(\+\d+\)/, '') : '—'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={td}>
                          <div className="crm-reveal" style={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'flex-end' }}>
                            {lead.next_campaign && (
                              <button onClick={() => setCampaignModalLead(lead)} title="Preview Personalized Email" className="crm-hover" style={iconBtn}>
                                <Mail size={14} />
                              </button>
                            )}
                            <button
                              onClick={() => setNotesModalLead(lead)}
                              title="Quick Notes"
                              className="crm-hover"
                              style={{ ...iconBtn, color: lead.notes ? C.sub : C.muted }}
                            >
                              <MessageSquare size={14} />
                            </button>
                            <button onClick={() => setEditingLead(lead)} title="Edit Lead" className="crm-hover" style={iconBtn}>
                              <Edit3 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ─── Pagination ───────────────────────────────────────────────────── */}
        {!loading && total > limit && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ fontSize: 12, color: C.muted }}>
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} leads
            </span>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="crm-hover"
                style={{ ...btnGhost, border: 'none', fontSize: 12, padding: '6px 10px', opacity: page === 1 ? 0.35 : 1, cursor: page === 1 ? 'not-allowed' : 'pointer' }}
              >
                <ChevronLeft size={14} /> Prev
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className="crm-hover"
                    style={{
                      width: 30, height: 30, borderRadius: 7, border: 'none', fontFamily: 'inherit',
                      background: page === p ? C.raised : 'transparent',
                      color: page === p ? C.text : C.muted,
                      cursor: 'pointer', fontSize: 12, fontWeight: page === p ? 600 : 400,
                    }}
                  >{p}</button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="crm-hover"
                style={{ ...btnGhost, border: 'none', fontSize: 12, padding: '6px 10px', opacity: page === totalPages ? 0.35 : 1, cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ─── Bottom stats: Top Countries + Automation Funnel ─────────────── */}
        {stats && !statsLoading && stats.total > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, marginTop: 32 }}>
            {/* Top Countries */}
            <div style={panelStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <Globe size={13} style={{ color: C.faint }} />
                <span style={{ fontSize: 13, fontWeight: 500, color: C.text }}>Top countries</span>
              </div>
              {stats.topCountries.map(({ country, count }) => {
                const pct = Math.round((count / stats.total) * 100);
                return (
                  <div key={country} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <span style={{ fontSize: 12, color: C.sub, width: 130, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{country}</span>
                    <div style={{ flex: 1, height: 3, background: C.border, borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: C.sub, transition: 'width 0.8s ease' }} />
                    </div>
                    <span style={{ fontSize: 12, color: C.muted, width: 30, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{count}</span>
                  </div>
                );
              })}
            </div>

            {/* Email Automation Funnel */}
            <div style={panelStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <Activity size={13} style={{ color: C.faint }} />
                <span style={{ fontSize: 13, fontWeight: 500, color: C.text }}>Email automation status</span>
              </div>
              {Object.entries(AUTOMATION_CONFIG).map(([key, cfg]) => {
                const count = stats.byAutomation[key] || 0;
                if (count === 0) return null;
                const pct = Math.round((count / stats.total) * 100);
                return (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <span style={{ fontSize: 12, color: C.sub, width: 100, flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <Dot color={cfg.color} /> {cfg.label}
                    </span>
                    <div style={{ flex: 1, height: 3, background: C.border, borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: C.sub, transition: 'width 0.8s ease' }} />
                    </div>
                    <span style={{ fontSize: 12, color: C.muted, width: 30, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{count}</span>
                  </div>
                );
              })}

              <div style={{ marginTop: 18, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Next step: n8n integration</div>
                <div style={{ fontSize: 12, color: C.faint, lineHeight: 1.5 }}>
                  Select leads → "Queue" → n8n picks up queued leads and sends personalised sequences.
                </div>
                <div style={{ marginTop: 8, display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, color: C.sub }}>
                  <Dot color="#eab308" />
                  {(stats.byAutomation['queued'] || 0) + (stats.byAutomation['in_progress'] || 0)} leads awaiting automation
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{CRM_CSS}</style>
    </div>
  );
}

// ─── Exported wrapper with auth gate ───────────────────────────────────────────
export function CrmPage() {
  const [userEmail, setUserEmail] = useState<string>(() => {
    try {
      // Clear legacy simple-token key so newly required auth credentials take effect
      localStorage.removeItem('crm_auth_token');
      const saved = localStorage.getItem(CRM_SESSION_KEY);
      if (!saved) return '';
      const data = JSON.parse(saved);
      if (data && data.email && data.token) {
        return data.email;
      }
      return '';
    } catch {
      return '';
    }
  });

  const handleAuth = (email: string) => {
    setUserEmail(email);
  };

  const handleSignOut = () => {
    localStorage.removeItem(CRM_SESSION_KEY);
    localStorage.removeItem('crm_auth_token');
    setUserEmail('');
  };

  if (!userEmail) {
    return <CrmLoginGate onAuth={handleAuth} />;
  }

  return <CrmDashboard userEmail={userEmail} onSignOut={handleSignOut} />;
}
