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
  Play, Pause, Check, X, Eye, Download,
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// ─── CRM access credentials ───────────────────────────────────────────────────
const CRM_USER = (import.meta.env.VITE_CRM_USER as string) || 'aifounderhub';
const CRM_PASS = (import.meta.env.VITE_CRM_PASS as string) || 'Wegrowtogether@yo1';
const CRM_SESSION_KEY = 'crm_auth_token';

// ─── Supabase client for CRM project ──────────────────────────────────────────
const crmSupabase = createClient(
  (import.meta.env.VITE_CRM_SUPABASE_URL as string) || 'https://csdxhpdjkaddrblyxlhg.supabase.co',
  (import.meta.env.VITE_CRM_SUPABASE_ANON_KEY as string) || 'sb_publishable_np0dKvFsKGf2kyLPSHKgvg_WqRglY5a'
);

// ─── Types ─────────────────────────────────────────────────────────────────────
type LeadStatus = 'new' | 'contacted' | 'interested' | 'meeting_booked' | 'closed' | 'not_interested' | 'enrolled' | 'lost' | string;
type LeadIntent = 'hot' | 'warm' | 'cold' | null;
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

// ─── Helpers ───────────────────────────────────────────────────────────────────
function relTime(ts: string | null) {
  if (!ts) return '—';
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
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
  const color = pct >= 70 ? '#ccf244' : pct >= 40 ? '#eab308' : '#f97316';
  return (
    <div className="flex items-center gap-2">
      <div style={{ width: 64, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.5s ease' }} />
      </div>
      <span style={{ fontSize: 11, color: color, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{pct}</span>
    </div>
  );
}

// ─── Stat tile ─────────────────────────────────────────────────────────────────
function StatTile({
  label, value, sub, icon: Icon, color, accent = false
}: { label: string; value: string | number; sub?: string; icon: React.ElementType; color: string; accent?: boolean }) {
  return (
    <div style={{
      background: accent ? `linear-gradient(135deg, ${color}18, ${color}08)` : '#0d0d14',
      border: `1px solid ${accent ? color + '40' : '#1e1e2a'}`,
      borderRadius: 16,
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: '#71717a', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</span>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={15} style={{ color }} />
        </div>
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, color: accent ? color : '#f4f4f5', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#71717a' }}>{sub}</div>}
    </div>
  );
}

// ─── Intent mini-donut bar ──────────────────────────────────────────────────────
function IntentBar({ byIntent }: { byIntent: Record<string, number> }) {
  const total = Object.values(byIntent).reduce((a, b) => a + b, 0) || 1;
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {(['hot', 'warm', 'cold'] as const).map(intent => {
        const pct = Math.round(((byIntent[intent] || 0) / total) * 100);
        const cfg = INTENT_CONFIG[intent];
        return (
          <div key={intent} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: `${Math.max(pct, 4)}px`, height: 6, background: cfg.color, borderRadius: 3 }} />
            <span style={{ fontSize: 11, color: '#9ca3af' }}>{cfg.emoji} {pct}%</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Lead row modal ─────────────────────────────────────────────────────────────
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
    };
    await onSave(updates);
    setSaving(false);
  };

  const bg = avatarColor(lead.email_address);
  const pcfg = personaCfg(lead.what_best_describes_them);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }} onClick={onClose}>
      <div style={{
        width: '100%', maxWidth: 680,
        background: '#0d0d14',
        border: '1px solid #1e1e2a',
        borderRadius: 20,
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: 32,
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 24 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>{avatar(lead.full_name, lead.email_address)}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#f4f4f5' }}>{lead.full_name || 'Unknown'}</div>
            <div style={{ fontSize: 13, color: '#71717a', marginTop: 2 }}>{lead.email_address || '—'}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              {lead.phone_number && (
                <span style={{ fontSize: 11, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Phone size={11} /> {lead.phone_number}
                </span>
              )}
              {lead.country && (
                <span style={{ fontSize: 11, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={11} /> {lead.country}
                </span>
              )}
              <span style={{ fontSize: 11, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Calendar size={11} /> Registered {fmtDate(lead.created_at)} ({relTime(lead.created_at)})
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#71717a' }}>
            <X size={20} />
          </button>
        </div>

        {/* Personalization Profile */}
        <div style={{
          marginBottom: 20, padding: 14, background: '#08080d', border: '1px solid #1e1e2a', borderRadius: 12,
        }}>
          <div style={{ fontSize: 11, color: '#71717a', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8, fontWeight: 600 }}>
            Personalization Profile (From Registration)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12 }}>
            <div>
              <span style={{ color: '#6b7280', display: 'block', fontSize: 11 }}>Persona:</span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 2,
                fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6,
                background: pcfg.bg, color: pcfg.color,
              }}>
                {pcfg.emoji} {lead.what_best_describes_them || 'Not specified'}
              </span>
            </div>
            <div>
              <span style={{ color: '#6b7280', display: 'block', fontSize: 11 }}>Why Signed Up:</span>
              <span style={{ color: '#e4e4e7', fontWeight: 500, fontStyle: 'italic', marginTop: 2, display: 'block' }}>
                {lead.why_they_signed_up ? `"${lead.why_they_signed_up}"` : '—'}
              </span>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <span style={{ color: '#6b7280', display: 'block', fontSize: 11 }}>Enrolled For:</span>
              <span style={{ color: '#ccf244', fontWeight: 500, fontSize: 11, marginTop: 2, display: 'block' }}>
                {lead.enrolled_for || '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Personalized Campaign Draft Ready Notification */}
        {lead.next_campaign && (
          <div style={{
            marginBottom: 20, padding: '12px 16px', background: 'rgba(204,242,68,0.06)', border: '1px solid rgba(204,242,68,0.25)', borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#ccf244', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={14} /> Personalized Email Campaign Draft Ready
              </div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                Full email copy generated for this lead. Status: <strong style={{ color: '#e4e4e7' }}>{lead.email_status || 'new'}</strong>
              </div>
            </div>
            {onOpenCampaign && (
              <button
                type="button"
                onClick={() => { onClose(); onOpenCampaign(); }}
                style={{
                  padding: '7px 14px', borderRadius: 8, background: '#ccf244', border: 'none',
                  color: '#07070b', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
                }}
              >
                <Eye size={12} /> Preview & Send
              </button>
            )}
          </div>
        )}

        {/* ── What They Are Interested In (Manual Tagging) ── */}
        <div style={{
          marginBottom: 24, padding: 16, background: '#08080d', border: '1px solid #1e1e2a', borderRadius: 14,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <label style={{ fontSize: 11, color: '#ccf244', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Tag size={12} /> What They Are Interested In (Client Tags)
            </label>
            <span style={{ fontSize: 11, color: '#71717a' }}>Click to toggle</span>
          </div>

          {/* Preset Buttons */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            {PRESET_TAGS.map(pt => {
              const active = tagsList.some(t => t.toLowerCase() === pt.id.toLowerCase());
              const Icon = pt.icon;
              return (
                <button
                  key={pt.id}
                  type="button"
                  onClick={() => toggleTag(pt.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: active ? pt.bg : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${active ? pt.color : '#1e1e2a'}`,
                    color: active ? pt.color : '#9ca3af',
                    borderRadius: 9, padding: '6px 12px', fontSize: 12, fontWeight: active ? 700 : 500,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  <Icon size={12} style={{ color: active ? pt.color : '#6b7280' }} />
                  {pt.label}
                  {active && <Check size={11} style={{ marginLeft: 2 }} />}
                </button>
              );
            })}
          </div>

          {/* Custom tag add + current tags */}
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={customTag}
              onChange={e => setCustomTag(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomTag(); } }}
              placeholder="Add custom tag (e.g. VIP, Dubai, Urgent)..."
              style={{
                flex: 1, background: '#0a0a12', border: '1px solid #1e1e2a', borderRadius: 9,
                padding: '7px 12px', color: '#f4f4f5', fontSize: 12, outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={addCustomTag}
              style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid #1e1e2a', borderRadius: 9,
                padding: '7px 14px', color: '#e4e4e7', fontSize: 12, cursor: 'pointer', fontWeight: 600,
              }}
            >
              + Add
            </button>
          </div>

          {/* Active Tags display */}
          {tagsList.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
              {tagsList.map(tag => {
                const cfg = tagCfg(tag);
                return (
                  <span key={tag} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color,
                    borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 600,
                  }}>
                    {tag}
                    <button
                      type="button"
                      onClick={() => toggleTag(tag)}
                      style={{ background: 'none', border: 'none', color: cfg.color, cursor: 'pointer', padding: 0, marginLeft: 2 }}
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Form grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          {/* Status */}
          <div>
            <label style={{ fontSize: 11, color: '#71717a', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Lead Status</label>
            <select
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value as LeadStatus }))}
              style={{ width: '100%', background: '#0a0a12', border: '1px solid #1e1e2a', borderRadius: 10, padding: '8px 12px', color: '#f4f4f5', fontSize: 13 }}
            >
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>

          {/* Email Status */}
          <div>
            <label style={{ fontSize: 11, color: '#71717a', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Email Status (n8n)</label>
            <select
              value={form.email_status}
              onChange={e => setForm(f => ({ ...f, email_status: e.target.value }))}
              style={{ width: '100%', background: '#0a0a12', border: '1px solid #1e1e2a', borderRadius: 10, padding: '8px 12px', color: '#f4f4f5', fontSize: 13 }}
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
            <label style={{ fontSize: 11, color: '#71717a', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Intent</label>
            <select
              value={form.intent || ''}
              onChange={e => setForm(f => ({ ...f, intent: e.target.value }))}
              style={{ width: '100%', background: '#0a0a12', border: '1px solid #1e1e2a', borderRadius: 10, padding: '8px 12px', color: '#f4f4f5', fontSize: 13 }}
            >
              <option value="">— Unset —</option>
              {Object.entries(INTENT_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.emoji} {v.label}</option>
              ))}
            </select>
          </div>

          {/* Lead Score */}
          <div>
            <label style={{ fontSize: 11, color: '#71717a', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Lead Score (0–100)</label>
            <input
              type="number" min={0} max={100}
              value={form.lead_score}
              onChange={e => setForm(f => ({ ...f, lead_score: Math.max(0, Math.min(100, Number(e.target.value))) }))}
              style={{ width: '100%', background: '#0a0a12', border: '1px solid #1e1e2a', borderRadius: 10, padding: '8px 12px', color: '#f4f4f5', fontSize: 13 }}
            />
          </div>

          {/* Assigned To */}
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: 11, color: '#71717a', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
              <Users size={12} /> Assigned To (Follow-up Owner)
            </label>
            <input
              type="text"
              value={form.assigned_to}
              onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))}
              placeholder="Assign team member name (e.g. Zain, Sarah, Alex)..."
              style={{ width: '100%', background: '#0a0a12', border: '1px solid #1e1e2a', borderRadius: 10, padding: '8px 12px', color: '#f4f4f5', fontSize: 13, boxSizing: 'border-box' }}
            />
          </div>

          {/* Follow Up */}
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: 11, color: '#71717a', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Follow Up Date</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  onClick={() => setFollowUpDays(1)}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #1e1e2a', borderRadius: 6, padding: '2px 8px', fontSize: 10, color: '#9ca3af', cursor: 'pointer' }}
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => setFollowUpDays(3)}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #1e1e2a', borderRadius: 6, padding: '2px 8px', fontSize: 10, color: '#9ca3af', cursor: 'pointer' }}
                >
                  +3 Days
                </button>
                <button
                  type="button"
                  onClick={() => setFollowUpDays(7)}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #1e1e2a', borderRadius: 6, padding: '2px 8px', fontSize: 10, color: '#9ca3af', cursor: 'pointer' }}
                >
                  +1 Week
                </button>
              </div>
            </div>
            <input
              type="date"
              value={form.follow_up_at}
              onChange={e => setForm(f => ({ ...f, follow_up_at: e.target.value }))}
              style={{ width: '100%', background: '#0a0a12', border: '1px solid #1e1e2a', borderRadius: 10, padding: '8px 12px', color: '#f4f4f5', fontSize: 13 }}
            />
          </div>
        </div>

        {/* Notes */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <label style={{ fontSize: 11, color: '#71717a', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600 }}>Notes & Follow-up Log</label>
            <button
              type="button"
              onClick={insertTimestamp}
              style={{ background: 'none', border: 'none', color: '#ccf244', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <Clock size={11} /> + Timestamp
            </button>
          </div>
          <textarea
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            rows={4}
            placeholder="Internal notes, call details, meeting summaries, what client said..."
            style={{ width: '100%', background: '#0a0a12', border: '1px solid #1e1e2a', borderRadius: 10, padding: '10px 12px', color: '#f4f4f5', fontSize: 13, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
          />
        </div>

        {/* Interested toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button
            onClick={() => setForm(f => ({ ...f, interested: !f.interested }))}
            style={{
              width: 40, height: 22, borderRadius: 11,
              background: form.interested ? '#ccf244' : '#1e1e2a',
              border: 'none', cursor: 'pointer', position: 'relative',
              transition: 'background 0.2s',
            }}
          >
            <div style={{
              width: 16, height: 16, borderRadius: 8, background: '#fff',
              position: 'absolute', top: 3, left: form.interested ? 21 : 3,
              transition: 'left 0.2s',
            }} />
          </button>
          <span style={{ fontSize: 13, color: '#e4e4e7' }}>Mark as Interested (Starred)</span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '12px 20px', borderRadius: 10,
            background: 'none', border: '1px solid #1e1e2a', color: '#9ca3af',
            cursor: 'pointer', fontSize: 13, fontWeight: 500,
          }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{
            flex: 2, padding: '12px 20px', borderRadius: 10,
            background: '#ccf244', border: 'none', color: '#07070b',
            cursor: saving ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700,
            opacity: saving ? 0.7 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={14} />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
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
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1200,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }} onClick={onClose}>
      <div style={{
        width: '100%', maxWidth: 540,
        background: '#0d0d14',
        border: '1px solid #1e1e2a',
        borderRadius: 20,
        boxShadow: '0 30px 60px rgba(0,0,0,0.8)',
        padding: 28,
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#eab308',
            }}>
              <MessageSquare size={16} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#f4f4f5' }}>Lead Notes & Follow-up</div>
              <div style={{ fontSize: 12, color: '#71717a' }}>
                {lead.full_name || 'Lead'} · {lead.email_address || '—'}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#71717a' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
            Internal CRM Log
          </span>
          <button
            type="button"
            onClick={insertTimestamp}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: 'rgba(255,255,255,0.05)', border: '1px solid #1e1e2a',
              borderRadius: 6, padding: '3px 8px', color: '#e4e4e7', fontSize: 11, cursor: 'pointer',
            }}
          >
            <Clock size={11} /> + Timestamp
          </button>
        </div>

        <textarea
          value={noteText}
          onChange={e => setNoteText(e.target.value)}
          rows={6}
          placeholder="e.g. Call booked for Thursday at 3 PM. Interested in AAA Accelerator agency package. Follow up on WhatsApp..."
          style={{
            width: '100%', background: '#08080d', border: '1px solid #1e1e2a', borderRadius: 12,
            padding: 14, color: '#f4f4f5', fontSize: 13, lineHeight: 1.6,
            resize: 'vertical', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit',
          }}
          autoFocus
        />

        <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '9px 18px', borderRadius: 10, background: 'none', border: '1px solid #1e1e2a',
            color: '#9ca3af', fontSize: 13, cursor: 'pointer',
          }}>Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '9px 20px', borderRadius: 10, background: '#ccf244', border: 'none',
              color: '#07070b', fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {saving ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={13} />}
            Save Note
          </button>
        </div>
      </div>
    </div>
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

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1100,
      background: 'rgba(0,0,0,0.88)',
      backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }} onClick={onClose}>
      <div style={{
        width: '100%', maxWidth: 780,
        maxHeight: '92vh',
        background: '#0d0d14',
        border: '1px solid #1e1e2a',
        borderRadius: 20,
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 30px 60px rgba(0,0,0,0.8), 0 0 40px rgba(204,242,68,0.05)',
        overflow: 'hidden',
      }} onClick={e => e.stopPropagation()}>
        {/* Top Header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid #1e1e2a',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(255,255,255,0.01)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              background: 'rgba(204,242,68,0.15)', border: '1px solid rgba(204,242,68,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccf244',
            }}>
              <Mail size={18} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#f4f4f5', display: 'flex', alignItems: 'center', gap: 8 }}>
                Personalized Email Campaign
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 6,
                  background: lead.email_status === 'sent' ? 'rgba(52,211,153,0.15)' : 'rgba(204,242,68,0.15)',
                  color: lead.email_status === 'sent' ? '#34d399' : '#ccf244',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  {lead.email_status === 'sent' ? 'Sent' : 'Draft Ready'}
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#71717a' }}>
                To: <span style={{ color: '#e4e4e7', fontWeight: 500 }}>{lead.full_name || 'Lead'}</span> &lt;{lead.email_address}&gt;
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setActiveTab('preview')}
              style={{
                padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: activeTab === 'preview' ? 'rgba(204,242,68,0.15)' : 'transparent',
                border: `1px solid ${activeTab === 'preview' ? '#ccf244' : '#1e1e2a'}`,
                color: activeTab === 'preview' ? '#ccf244' : '#9ca3af',
              }}
            >
              <Eye size={12} style={{ display: 'inline', marginRight: 5 }} /> Rendered Preview
            </button>
            <button
              onClick={() => setActiveTab('edit')}
              style={{
                padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: activeTab === 'edit' ? 'rgba(204,242,68,0.15)' : 'transparent',
                border: `1px solid ${activeTab === 'edit' ? '#ccf244' : '#1e1e2a'}`,
                color: activeTab === 'edit' ? '#ccf244' : '#9ca3af',
              }}
            >
              <Edit3 size={12} style={{ display: 'inline', marginRight: 5 }} /> Edit Copy
            </button>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#71717a', padding: 6 }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Lead Context Bar */}
        <div style={{
          padding: '12px 24px', background: '#08080d', borderBottom: '1px solid #1e1e2a',
          display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', fontSize: 12,
        }}>
          <span style={{ color: '#71717a', fontWeight: 600 }}>Personalization:</span>
          {lead.what_best_describes_them && (
            <span style={{
              background: pcfg.bg, color: pcfg.color, padding: '3px 8px', borderRadius: 6,
              fontSize: 11, fontWeight: 600,
            }}>
              {pcfg.emoji} {lead.what_best_describes_them}
            </span>
          )}
          {lead.why_they_signed_up && (
            <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>
              Why: "{lead.why_they_signed_up}"
            </span>
          )}
          {lead.created_at && (
            <span style={{ color: '#6b7280', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={11} /> Added {fmtDate(lead.created_at)} ({relTime(lead.created_at)})
            </span>
          )}
        </div>

        {/* Content Body (Scrollable) */}
        <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
          {/* Subject Line */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, color: '#71717a', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 6, fontWeight: 600 }}>
              Email Subject Line
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={subject}
                onChange={e => setSubject(e.target.value)}
                style={{
                  flex: 1, background: '#08080d', border: '1px solid #1e1e2a', borderRadius: 10,
                  padding: '10px 14px', color: '#f4f4f5', fontSize: 13, fontWeight: 600,
                }}
              />
              <button
                onClick={() => { navigator.clipboard.writeText(subject); showToast('Copied Subject!', 'success'); }}
                title="Copy Subject"
                style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid #1e1e2a', borderRadius: 10,
                  padding: '0 12px', color: '#9ca3af', cursor: 'pointer', fontSize: 12,
                }}
              >
                Copy
              </button>
            </div>
          </div>

          {/* Tab Views */}
          {activeTab === 'preview' ? (
            <div>
              <label style={{ fontSize: 11, color: '#71717a', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 8, fontWeight: 600 }}>
                Recipient Inbox Preview
              </label>
              <div style={{
                background: '#ffffff', color: '#1f2937', borderRadius: 12, padding: 28,
                fontSize: 14, lineHeight: 1.6, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
              }}>
                <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: 14, marginBottom: 18 }}>
                  <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>From: AI Founder Hub &lt;team@aifounderhub.com&gt;</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6 }}>To: {lead.full_name || 'Lead'} &lt;{lead.email_address}&gt;</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{subject}</div>
                </div>
                <div
                  dangerouslySetInnerHTML={{ __html: body }}
                  style={{ wordBreak: 'break-word' }}
                />
              </div>
            </div>
          ) : (
            <div>
              <label style={{ fontSize: 11, color: '#71717a', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 8, fontWeight: 600 }}>
                HTML / Markdown Email Content
              </label>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                rows={14}
                style={{
                  width: '100%', background: '#08080d', border: '1px solid #1e1e2a', borderRadius: 12,
                  padding: '14px', color: '#f4f4f5', fontSize: 13, lineHeight: 1.6,
                  fontFamily: 'JetBrains Mono, monospace', resize: 'vertical', boxSizing: 'border-box',
                }}
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '16px 24px', borderTop: '1px solid #1e1e2a', background: '#08080d',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={copyEmail}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,0.05)', border: '1px solid #1e1e2a', borderRadius: 10,
                color: '#e4e4e7', cursor: 'pointer', padding: '8px 14px', fontSize: 12, fontWeight: 500,
              }}
            >
              {copied ? <Check size={13} style={{ color: '#34d399' }} /> : <Mail size={13} />}
              {copied ? 'Copied Email' : 'Copy Full Copy'}
            </button>
            <button
              onClick={copyJsonPayload}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 10,
                color: '#a78bfa', cursor: 'pointer', padding: '8px 14px', fontSize: 12, fontWeight: 500,
              }}
            >
              <Sparkles size={13} /> Copy n8n Payload
            </button>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {activeTab === 'edit' && (
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'none', border: '1px solid #1e1e2a', borderRadius: 10,
                  color: '#9ca3af', cursor: saving ? 'not-allowed' : 'pointer', padding: '8px 16px', fontSize: 12, fontWeight: 500,
                }}
              >
                {saving ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={13} />}
                Save Changes
              </button>
            )}
            <button
              onClick={handleMarkAsSent}
              disabled={markingSent || lead.email_status === 'sent'}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: lead.email_status === 'sent' ? 'rgba(52,211,153,0.2)' : '#ccf244',
                border: 'none', borderRadius: 10,
                color: lead.email_status === 'sent' ? '#34d399' : '#07070b',
                cursor: markingSent || lead.email_status === 'sent' ? 'not-allowed' : 'pointer',
                padding: '9px 18px', fontSize: 13, fontWeight: 700,
              }}
            >
              {markingSent ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={13} />}
              {lead.email_status === 'sent' ? 'Already Sent' : 'Mark as Sent'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Login Gate ────────────────────────────────────────────────────────────────
function CrmLoginGate({ onAuth }: { onAuth: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      if (username.trim() === CRM_USER && password === CRM_PASS) {
        localStorage.setItem(CRM_SESSION_KEY, btoa(`${CRM_USER}:${Date.now()}`));
        onAuth();
      } else {
        setError('Invalid username or password.');
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#07070b',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, sans-serif', padding: 24,
    }}>
      {/* Background glow */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(204,242,68,0.08), transparent)',
      }} />

      <div style={{
        width: '100%', maxWidth: 420,
        background: '#0d0d14',
        border: '1px solid #1e1e2a',
        borderRadius: 24,
        padding: 40,
        boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
        position: 'relative',
      }}>
        {/* Logo + title */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #ccf244, #9dc41c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Target size={26} color="#07070b" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#f4f4f5', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            CRM Access
          </h1>
          <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>AI Founder Hub · Lead Intelligence</p>
        </div>

        <form onSubmit={handleLogin}>
          {/* Username */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <Users size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#4b5563' }} />
              <input
                id="crm-username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter username"
                autoComplete="username"
                required
                style={{
                  width: '100%', paddingLeft: 40, paddingRight: 14, paddingTop: 12, paddingBottom: 12,
                  background: '#0a0a12', border: `1px solid ${error ? '#ef4444' : '#1e1e2a'}`,
                  borderRadius: 12, color: '#f4f4f5', fontSize: 14, outline: 'none',
                  boxSizing: 'border-box', transition: 'border-color 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = '#ccf244'; }}
                onBlur={e => { e.target.style.borderColor = error ? '#ef4444' : '#1e1e2a'; }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#4b5563' }} />
              <input
                id="crm-password"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                required
                style={{
                  width: '100%', paddingLeft: 40, paddingRight: 44, paddingTop: 12, paddingBottom: 12,
                  background: '#0a0a12', border: `1px solid ${error ? '#ef4444' : '#1e1e2a'}`,
                  borderRadius: 12, color: '#f4f4f5', fontSize: 14, outline: 'none',
                  boxSizing: 'border-box', transition: 'border-color 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = '#ccf244'; }}
                onBlur={e => { e.target.style.borderColor = error ? '#ef4444' : '#1e1e2a'; }}
              />
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 4,
                }}
              >
                <Eye size={14} />
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 10, padding: '10px 14px', marginBottom: 16,
            }}>
              <AlertCircle size={14} style={{ color: '#f87171', flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: '#f87171' }}>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            id="crm-login-btn"
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '13px 20px', borderRadius: 12,
              background: loading ? '#6b7280' : 'linear-gradient(135deg, #ccf244, #b0d832)',
              border: 'none', color: '#07070b', fontWeight: 700, fontSize: 14,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.2s', boxShadow: loading ? 'none' : '0 4px 20px rgba(204,242,68,0.3)',
            }}
          >
            {loading
              ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Verifying…</>
              : <><Target size={15} /> Access CRM Dashboard</>
            }
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 11, color: '#374151' }}>
          Protected · AI Founder Hub Internal
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ─── Main CRM Page ──────────────────────────────────────────────────────────────
function CrmDashboard() {
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
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

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
  }, [search, statusFilter, tagFilter, intentFilter, personaFilter, emailFilter, sortBy, sortAsc, page]);

  // ── Fetch stats ───────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const { data, error: err, count } = await crmSupabase
        .from('masterclass_leads')
        .select('country, what_best_describes_them, enrolled_for, status, intent, email_automation_status, lead_score, interested, email_status, next_campaign', { count: 'exact' });

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
  }, [search, statusFilter, tagFilter, intentFilter, personaFilter, emailFilter, sortBy, sortAsc]);

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
  const showToast = (msg: string, type: 'success' | 'error') => {
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
  return (
    <div style={{ minHeight: '100vh', background: '#07070b', color: '#f4f4f5', fontFamily: 'Inter, sans-serif' }}>
      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 9999,
          background: toast.type === 'success' ? '#052e16' : '#2d0000',
          border: `1px solid ${toast.type === 'success' ? '#16a34a' : '#dc2626'}`,
          color: toast.type === 'success' ? '#4ade80' : '#f87171',
          borderRadius: 12, padding: '12px 20px', fontSize: 13, fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: 8,
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          animation: 'slideIn 0.3s ease',
        }}>
          {toast.type === 'success' ? <Check size={14} /> : <X size={14} />}
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

      {/* ── Page content ──────────────────────────────────────────────────── */}
      <div
        onClick={() => { if (activeTagMenuLeadId) setActiveTagMenuLeadId(null); }}
        style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }}
      >

        {/* ─── Header ──────────────────────────────────────────────────────── */}
        <div style={{ marginBottom: 32, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: 'linear-gradient(135deg, #ccf244, #9dc41c)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Target size={20} color="#07070b" />
              </div>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f4f4f5', margin: 0, letterSpacing: '-0.02em' }}>Lead Intelligence</h1>
                <div style={{ fontSize: 12, color: '#71717a', marginTop: 2 }}>Zoho → Dashboard → n8n Email Automation</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: 3, background: '#34d399', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: 12, color: '#4ade80' }}>Live · {total} total leads</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <button onClick={() => { fetchLeads(); fetchStats(); }} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'none', border: '1px solid #1e1e2a', borderRadius: 10,
              color: '#9ca3af', cursor: 'pointer', padding: '8px 14px', fontSize: 13,
            }}>
              <RefreshCw size={14} /> Refresh
            </button>
            <button onClick={exportCsv} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'none', border: '1px solid #1e1e2a', borderRadius: 10,
              color: '#9ca3af', cursor: 'pointer', padding: '8px 14px', fontSize: 13,
            }}>
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>

        {/* ─── Stats Grid ───────────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 16, marginBottom: 28 }}>
          <StatTile label="Total Leads" value={statsLoading ? '…' : stats?.total ?? 0} icon={Users} color="#a78bfa" accent />
          <StatTile
            label="Campaigns Ready"
            value={statsLoading ? '…' : stats?.campaignsReady ?? 0}
            sub={stats ? `${stats.campaignsReady} personalized drafts` : undefined}
            icon={Sparkles} color="#ccf244" accent
          />
          <StatTile
            label="Interested"
            value={statsLoading ? '…' : (stats?.byStatus?.['interested'] || stats?.interested || 0)}
            icon={Star} color="#34d399"
          />
          <StatTile
            label="Meeting Booked"
            value={statsLoading ? '…' : stats?.byStatus?.['meeting_booked'] ?? 0}
            icon={Calendar} color="#38bdf8"
          />
          <StatTile
            label="Closed"
            value={statsLoading ? '…' : stats?.byStatus?.['closed'] ?? 0}
            icon={CheckCircle} color="#ccf244"
          />
          <StatTile
            label="Emails Sent"
            value={statsLoading ? '…' : stats?.emailsSent ?? 0}
            icon={Send} color="#eab308"
          />
        </div>

        {/* ─── Pipeline row ─────────────────────────────────────────────────── */}
        {stats && !statsLoading && (
          <div style={{
            background: '#0d0d14', border: '1px solid #1e1e2a', borderRadius: 16,
            padding: '16px 24px', marginBottom: 24,
            display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center',
          }}>
            <span style={{ fontSize: 12, color: '#71717a', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Pipeline</span>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
              const count = stats.byStatus[key] || 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              const Icon = cfg.icon;
              return (
                <button
                  key={key}
                  onClick={() => { setStatusFilter(statusFilter === key ? 'all' : key); setPage(1); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: statusFilter === key ? cfg.bg : 'none',
                    border: `1px solid ${statusFilter === key ? cfg.color + '60' : 'transparent'}`,
                    borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <Icon size={13} style={{ color: cfg.color }} />
                  <span style={{ fontSize: 12, color: cfg.color, fontWeight: 600 }}>{cfg.label}</span>
                  <span style={{ fontSize: 12, color: '#71717a' }}>{count}</span>
                  <span style={{ fontSize: 11, color: '#4b5563' }}>({pct}%)</span>
                </button>
              );
            })}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: '#71717a' }}>Intent:</span>
              <IntentBar byIntent={stats.byIntent} />
            </div>
          </div>
        )}

        {/* ─── Controls ─────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, country, notes, tags..."
              style={{
                width: '100%', paddingLeft: 36, paddingRight: 12, paddingTop: 9, paddingBottom: 9,
                background: '#0d0d14', border: '1px solid #1e1e2a', borderRadius: 10,
                color: '#e4e4e7', fontSize: 13, outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Interest Tag filter */}
          <select
            value={tagFilter}
            onChange={e => { setTagFilter(e.target.value); setPage(1); }}
            style={{ background: '#0d0d14', border: '1px solid #1e1e2a', borderRadius: 10, padding: '9px 12px', color: '#e4e4e7', fontSize: 13, minWidth: 175 }}
          >
            <option value="all">🏷️ All Interest Tags</option>
            {PRESET_TAGS.map(pt => (
              <option key={pt.id} value={pt.label}>{pt.label}</option>
            ))}
          </select>

          {/* Persona filter — based on real column */}
          <select
            value={personaFilter}
            onChange={e => { setPersonaFilter(e.target.value); setPage(1); }}
            style={{ background: '#0d0d14', border: '1px solid #1e1e2a', borderRadius: 10, padding: '9px 12px', color: '#e4e4e7', fontSize: 13, minWidth: 185 }}
          >
            <option value="all">All Personas</option>
            {Object.entries(PERSONA_COLORS).map(([persona, cfg]) => (
              <option key={persona} value={persona}>{cfg.emoji} {persona}</option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            style={{ background: '#0d0d14', border: '1px solid #1e1e2a', borderRadius: 10, padding: '9px 12px', color: '#e4e4e7', fontSize: 13 }}
          >
            <option value="all">All Status</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>

          {/* Email / Campaign filter */}
          <select
            value={emailFilter}
            onChange={e => { setEmailFilter(e.target.value as any); setPage(1); }}
            style={{ background: '#0d0d14', border: '1px solid #1e1e2a', borderRadius: 10, padding: '9px 12px', color: '#e4e4e7', fontSize: 13, minWidth: 160 }}
          >
            <option value="all">All Email Status</option>
            <option value="ready">✉️ Draft Ready ({stats?.campaignsReady || 0})</option>
            <option value="needs_draft">Needs Draft</option>
            <option value="sent">Sent ({stats?.emailsSent || 0})</option>
            <option value="new">New (Pending)</option>
          </select>

          {/* Bulk actions */}
          {selected.size > 0 && (
            <div style={{
              display: 'flex', gap: 8, alignItems: 'center',
              background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)',
              borderRadius: 10, padding: '6px 12px',
            }}>
              <span style={{ fontSize: 12, color: '#a78bfa', fontWeight: 600 }}>{selected.size} selected</span>
              <button
                onClick={triggerAutomation}
                disabled={bulkLoading}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.3)',
                  borderRadius: 7, padding: '5px 10px', color: '#eab308',
                  cursor: 'pointer', fontSize: 12, fontWeight: 600,
                }}
              >
                <Send size={11} /> Queue Emails
              </button>
              <button
                onClick={() => bulkUpdate({ status: 'interested', interested: true }, 'Marked as Interested')}
                disabled={bulkLoading}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)',
                  borderRadius: 7, padding: '5px 10px', color: '#34d399',
                  cursor: 'pointer', fontSize: 12, fontWeight: 600,
                }}
              >
                <Star size={11} /> Interested
              </button>
              <button
                onClick={() => setSelected(new Set())}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#71717a' }}
              >
                <X size={13} />
              </button>
            </div>
          )}
        </div>

        {/* ─── Table ────────────────────────────────────────────────────────── */}
        <div style={{
          background: '#0d0d14', border: '1px solid #1e1e2a', borderRadius: 16,
          overflow: 'hidden', marginBottom: 24,
        }}>
          {loading ? (
            <div style={{ padding: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, color: '#71717a' }}>
              <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Loading leads…
            </div>
          ) : error ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#f87171' }}>
              <AlertCircle size={32} style={{ marginBottom: 12, opacity: 0.7 }} />
              <div style={{ marginBottom: 8 }}>{error}</div>
              {error.includes('does not exist') && (
                <div style={{ fontSize: 12, color: '#9ca3af', maxWidth: 400, margin: '0 auto' }}>
                  The CRM table needs additional columns. Run the migration in{' '}
                  <code style={{ color: '#a78bfa' }}>supabase/migrations/0006_masterclass_leads_crm.sql</code>{' '}
                  using the Supabase SQL Editor with your service role key.
                </div>
              )}
            </div>
          ) : leads.length === 0 ? (
            <div style={{ padding: 64, textAlign: 'center', color: '#6b7280' }}>
              <Inbox size={40} style={{ marginBottom: 16, opacity: 0.5 }} />
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: '#9ca3af' }}>No leads found</div>
              <div style={{ fontSize: 13, color: '#71717a' }}>
                {search || statusFilter !== 'all' || tagFilter !== 'all' || intentFilter !== 'all' || personaFilter !== 'all' || emailFilter !== 'all'
                  ? 'Try adjusting your filters or search query.'
                  : 'No leads are currently available in the database.'}
              </div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1000 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1e1e2a' }}>
                    <th style={{ padding: '12px 16px', width: 40 }}>
                      <input
                        type="checkbox"
                        checked={selected.size === leads.length && leads.length > 0}
                        onChange={toggleSelectAll}
                        style={{ cursor: 'pointer', accentColor: '#ccf244' }}
                      />
                    </th>
                    {[
                      { key: 'full_name',                 label: 'Lead' },
                      { key: 'assigned_to',               label: 'Assigned To' },
                      { key: 'tags',                      label: 'Interest Tags' },
                      { key: 'status',                    label: 'Status' },
                      { key: 'notes',                     label: 'Notes & Follow-up' },
                      { key: 'what_best_describes_them',  label: 'Persona' },
                      { key: 'enrolled_for',              label: 'Enrolled For' },
                      { key: 'why_they_signed_up',        label: 'Why Signed Up' },
                      { key: 'next_campaign',             label: 'Personalized Campaign' },
                      { key: 'created_at',                label: 'Added' },
                      { key: 'country',                   label: 'Location' },
                    ].map(col => (
                      <th
                        key={col.key}
                        onClick={() => toggleSort(col.key)}
                        style={{
                          padding: '12px 16px', textAlign: 'left',
                          fontSize: 11, color: '#6b7280', fontWeight: 600,
                          letterSpacing: '0.05em', textTransform: 'uppercase',
                          cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',
                        }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          {col.label}
                          {sortBy === col.key
                            ? (sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />)
                            : <ChevronDown size={12} style={{ opacity: 0.3 }} />}
                        </span>
                      </th>
                    ))}
                    <th style={{ padding: '12px 16px', width: 90 }} />
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
                        style={{
                          borderBottom: idx < leads.length - 1 ? '1px solid #111118' : 'none',
                          background: isSelected ? 'rgba(204,242,68,0.04)' : 'transparent',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'; }}
                        onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                      >
                        {/* Checkbox */}
                        <td style={{ padding: '12px 16px' }}>
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
                            style={{ cursor: 'pointer', accentColor: '#ccf244' }}
                          />
                        </td>

                        {/* Lead name + email */}
                        <td style={{ padding: '12px 16px', minWidth: 180 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 34, height: 34, borderRadius: 10, background: bg, flexShrink: 0,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 13, fontWeight: 700, color: '#fff',
                            }}>{avatar(lead.full_name, lead.email_address)}</div>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: '#e4e4e7', display: 'flex', alignItems: 'center', gap: 6 }}>
                                {lead.full_name || 'Unknown'}
                                {lead.interested && <span style={{ fontSize: 10, color: '#34d399' }} title="Starred / Interested">★</span>}
                              </div>
                              <div style={{ fontSize: 11, color: '#6b7280' }}>{lead.email_address || '—'}</div>
                              {lead.phone_number && (
                                <div style={{ fontSize: 10, color: '#4b5563', marginTop: 1 }}>{lead.phone_number}</div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Assigned To */}
                        <td style={{ padding: '12px 16px', minWidth: 150 }}>
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
                                placeholder="Name..."
                                style={{
                                  width: 100, background: '#0a0a12', border: '1px solid #ccf244',
                                  borderRadius: 7, padding: '3px 8px', color: '#f4f4f5', fontSize: 12, outline: 'none',
                                }}
                              />
                              <button
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleQuickAssign(lead.id, assignInputVal);
                                  setEditingAssignLeadId(null);
                                }}
                                style={{
                                  background: '#ccf244', border: 'none', borderRadius: 6,
                                  color: '#07070b', padding: '3px 6px', cursor: 'pointer', display: 'flex', alignItems: 'center',
                                }}
                              >
                                <Check size={11} />
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
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.25)',
                                borderRadius: 8, padding: '4px 10px', color: '#93c5fd', fontSize: 12,
                                fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                              }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#60a5fa'; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(96,165,250,0.25)'; }}
                            >
                              <span style={{
                                width: 18, height: 18, borderRadius: 9, background: '#3b82f6',
                                color: '#fff', fontSize: 10, fontWeight: 700,
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
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                background: 'none', border: '1px dashed #27273a', borderRadius: 7,
                                padding: '3px 8px', color: '#71717a', fontSize: 11, cursor: 'pointer',
                              }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#60a5fa'; (e.currentTarget as HTMLElement).style.color = '#93c5fd'; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#27273a'; (e.currentTarget as HTMLElement).style.color = '#71717a'; }}
                            >
                              <Users size={11} /> + Assign
                            </button>
                          )}
                        </td>

                        {/* Interest Tags (Manual Tagging) */}
                        <td style={{ padding: '12px 16px', minWidth: 200, position: 'relative' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                            {(lead.tags || []).map(tag => {
                              const cfg = tagCfg(tag);
                              return (
                                <span
                                  key={tag}
                                  style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 3,
                                    fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 6,
                                    background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color,
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {tag}
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleToggleTag(lead, tag); }}
                                    title="Remove tag"
                                    style={{ background: 'none', border: 'none', color: cfg.color, cursor: 'pointer', padding: 0, fontSize: 11, lineHeight: 1, opacity: 0.7 }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.7'; }}
                                  >
                                    ×
                                  </button>
                                </span>
                              );
                            })}

                            {/* Quick Add Tag Popover Trigger */}
                            <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => setActiveTagMenuLeadId(isTagMenuOpen ? null : lead.id)}
                                style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 3,
                                  background: 'rgba(255,255,255,0.04)', border: '1px solid #1e1e2a',
                                  borderRadius: 6, padding: '2px 7px', fontSize: 10, color: '#9ca3af',
                                  cursor: 'pointer', fontWeight: 600,
                                }}
                                title="Tag client interest"
                              >
                                <Tag size={10} /> + Tag
                              </button>

                              {/* Popover */}
                              {isTagMenuOpen && (
                                <div style={{
                                  position: 'absolute', top: '100%', left: 0, zIndex: 100, marginTop: 4,
                                  background: '#0d0d14', border: '1px solid #27273a', borderRadius: 10,
                                  boxShadow: '0 10px 30px rgba(0,0,0,0.8)', padding: 6, minWidth: 170,
                                }}>
                                  <div style={{ fontSize: 10, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '4px 8px', fontWeight: 700 }}>
                                    Client Interest Tags
                                  </div>
                                  {PRESET_TAGS.map(pt => {
                                    const hasTag = (lead.tags || []).some(t => t.toLowerCase() === pt.id.toLowerCase());
                                    return (
                                      <button
                                        key={pt.id}
                                        type="button"
                                        onClick={() => handleToggleTag(lead, pt.label)}
                                        style={{
                                          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                          background: hasTag ? pt.bg : 'none', border: 'none',
                                          borderRadius: 6, padding: '6px 8px', fontSize: 11, color: hasTag ? pt.color : '#d4d4d8',
                                          cursor: 'pointer', textAlign: 'left', fontWeight: hasTag ? 600 : 400,
                                        }}
                                      >
                                        <span>{pt.label}</span>
                                        {hasTag && <Check size={11} style={{ color: pt.color }} />}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Status (Interactive Quick Dropdown) */}
                        <td style={{ padding: '12px 16px' }}>
                          <select
                            value={lead.status || 'new'}
                            onChange={e => handleQuickStatusChange(lead.id, e.target.value as LeadStatus)}
                            style={{
                              background: statusCfg.bg,
                              color: statusCfg.color,
                              border: `1px solid ${statusCfg.color}40`,
                              borderRadius: 8,
                              padding: '5px 8px',
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: 'pointer',
                              outline: 'none',
                            }}
                          >
                            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                              <option key={k} value={k} style={{ background: '#0d0d14', color: v.color }}>
                                {v.label}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Notes & Follow-up */}
                        <td style={{ padding: '12px 16px', maxWidth: 210 }}>
                          {lead.notes ? (
                            <div
                              onClick={() => setNotesModalLead(lead)}
                              style={{
                                cursor: 'pointer',
                                padding: '6px 10px',
                                borderRadius: 8,
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid #1e1e2a',
                                transition: 'border-color 0.15s',
                              }}
                              title="Click to view or edit notes"
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#ccf244'; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1e1e2a'; }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                                <MessageSquare size={11} style={{ color: '#eab308' }} />
                                <span style={{ fontSize: 10, color: '#eab308', fontWeight: 600, textTransform: 'uppercase' }}>CRM Note</span>
                                {lead.follow_up_at && (
                                  <span style={{ fontSize: 10, color: '#9ca3af', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 3 }}>
                                    <Calendar size={10} /> {lead.follow_up_at}
                                  </span>
                                )}
                              </div>
                              <div style={{
                                fontSize: 11, color: '#d4d4d8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                              }}>
                                {lead.notes}
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setNotesModalLead(lead)}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                background: 'none', border: '1px dashed #27273a', borderRadius: 7,
                                padding: '4px 9px', color: '#71717a', fontSize: 11, cursor: 'pointer',
                              }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#ccf244'; (e.currentTarget as HTMLElement).style.color = '#ccf244'; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#27273a'; (e.currentTarget as HTMLElement).style.color = '#71717a'; }}
                            >
                              <MessageSquare size={11} /> + Add Note
                            </button>
                          )}
                        </td>

                        {/* Persona */}
                        <td style={{ padding: '12px 16px' }}>
                          {lead.what_best_describes_them ? (() => {
                            const pcfg = personaCfg(lead.what_best_describes_them);
                            return (
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 8,
                                background: pcfg.bg, color: pcfg.color, whiteSpace: 'nowrap',
                              }}>
                                {pcfg.emoji} {lead.what_best_describes_them}
                              </span>
                            );
                          })() : <span style={{ fontSize: 12, color: '#4b5563' }}>—</span>}
                        </td>

                        {/* Enrolled For */}
                        <td style={{ padding: '12px 16px', maxWidth: 180 }}>
                          <span style={{
                            fontSize: 11, color: '#ccf244', fontWeight: 500,
                            display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }} title={lead.enrolled_for || ''}>
                            {lead.enrolled_for
                              ? lead.enrolled_for.replace('🎓 ', '').replace(' — Build & Sell For $500–$2,500/Mo', '')
                              : '—'}
                          </span>
                        </td>

                        {/* Why They Signed Up */}
                        <td style={{ padding: '12px 16px', maxWidth: 170 }}>
                          <span style={{
                            fontSize: 12, color: '#9ca3af', fontStyle: 'italic',
                            display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }} title={lead.why_they_signed_up || ''}>
                            {lead.why_they_signed_up
                              ? `"${lead.why_they_signed_up.charAt(0).toUpperCase()}${lead.why_they_signed_up.slice(1)}"`
                              : '—'}
                          </span>
                        </td>

                        {/* Personalized Campaign (next_campaign + email_status) */}
                        <td style={{ padding: '12px 16px', minWidth: 200, maxWidth: 240 }}>
                          {lead.next_campaign ? (() => {
                            const { subject } = extractSubjectAndBody(lead.next_campaign);
                            const isSent = lead.email_status === 'sent';
                            return (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 4,
                                    fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 6,
                                    background: isSent ? 'rgba(52,211,153,0.15)' : 'rgba(204,242,68,0.15)',
                                    color: isSent ? '#34d399' : '#ccf244',
                                    textTransform: 'uppercase', letterSpacing: '0.04em',
                                  }}>
                                    {isSent ? <CheckCircle size={10} /> : <Sparkles size={10} />}
                                    {isSent ? 'Sent' : 'Draft Ready'}
                                  </span>
                                  <button
                                    onClick={() => setCampaignModalLead(lead)}
                                    style={{
                                      background: 'rgba(255,255,255,0.06)', border: '1px solid #1e1e2a',
                                      borderRadius: 6, padding: '2px 8px', fontSize: 11, color: '#e4e4e7',
                                      cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
                                      fontWeight: 500,
                                    }}
                                  >
                                    <Eye size={10} /> Preview
                                  </button>
                                </div>
                                <span style={{
                                  fontSize: 11, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                  maxWidth: 220, display: 'block',
                                }} title={subject}>
                                  {subject || 'Personalized copy prepared'}
                                </span>
                              </div>
                            );
                          })() : (
                            <span style={{ fontSize: 11, color: '#4b5563', fontStyle: 'italic' }}>
                              No Draft
                            </span>
                          )}
                        </td>

                        {/* Added / Created At */}
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                          <div style={{ fontSize: 12, color: '#e4e4e7', fontWeight: 500 }}>
                            {fmtDate(lead.created_at)}
                          </div>
                          <div style={{ fontSize: 10, color: '#6b7280' }}>
                            {relTime(lead.created_at)}
                          </div>
                        </td>

                        {/* Location */}
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: 12, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <MapPin size={11} style={{ opacity: 0.6 }} />
                            {lead.country ? lead.country.replace(/\s*\(\+\d+\)/, '') : '—'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            {lead.next_campaign && (
                              <button
                                onClick={() => setCampaignModalLead(lead)}
                                title="Preview Personalized Email"
                                style={{
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  width: 30, height: 30, borderRadius: 8,
                                  background: 'rgba(204,242,68,0.1)', border: '1px solid rgba(204,242,68,0.25)',
                                  cursor: 'pointer', color: '#ccf244',
                                  transition: 'all 0.15s',
                                }}
                              >
                                <Mail size={13} />
                              </button>
                            )}
                            <button
                              onClick={() => setNotesModalLead(lead)}
                              title="Quick Notes"
                              style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: 30, height: 30, borderRadius: 8,
                                background: lead.notes ? 'rgba(234,179,8,0.1)' : 'rgba(255,255,255,0.05)',
                                border: `1px solid ${lead.notes ? 'rgba(234,179,8,0.3)' : '#1e1e2a'}`,
                                cursor: 'pointer', color: lead.notes ? '#eab308' : '#9ca3af',
                                transition: 'all 0.15s',
                              }}
                            >
                              <MessageSquare size={13} />
                            </button>
                            <button
                              onClick={() => setEditingLead(lead)}
                              title="Edit Lead"
                              style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: 30, height: 30, borderRadius: 8,
                                background: 'rgba(255,255,255,0.05)', border: '1px solid #1e1e2a',
                                cursor: 'pointer', color: '#9ca3af',
                                transition: 'all 0.15s',
                              }}
                            >
                              <Edit3 size={13} />
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
            <span style={{ fontSize: 13, color: '#6b7280' }}>
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} leads
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: 'none', border: '1px solid #1e1e2a', borderRadius: 9,
                  color: page === 1 ? '#374151' : '#9ca3af', cursor: page === 1 ? 'not-allowed' : 'pointer',
                  padding: '7px 14px', fontSize: 13,
                }}
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <div style={{ display: 'flex', gap: 4 }}>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      style={{
                        width: 34, height: 34, borderRadius: 9,
                        background: page === p ? '#ccf244' : 'none',
                        border: `1px solid ${page === p ? '#ccf244' : '#1e1e2a'}`,
                        color: page === p ? '#07070b' : '#9ca3af',
                        cursor: 'pointer', fontSize: 13, fontWeight: page === p ? 700 : 400,
                      }}
                    >{p}</button>
                  );
                })}
              </div>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: 'none', border: '1px solid #1e1e2a', borderRadius: 9,
                  color: page === totalPages ? '#374151' : '#9ca3af', cursor: page === totalPages ? 'not-allowed' : 'pointer',
                  padding: '7px 14px', fontSize: 13,
                }}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ─── Bottom stats: Top Countries + Automation Funnel ─────────────── */}
        {stats && !statsLoading && stats.total > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 24 }}>
            {/* Top Countries */}
            <div style={{ background: '#0d0d14', border: '1px solid #1e1e2a', borderRadius: 16, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <Globe size={15} style={{ color: '#60a5fa' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#e4e4e7' }}>Top Countries</span>
              </div>
              {stats.topCountries.map(({ country, count }) => {
                const pct = Math.round((count / stats.total) * 100);
                return (
                  <div key={country} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <span style={{ fontSize: 13, color: '#9ca3af', width: 120, flexShrink: 0 }}>{country}</span>
                    <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: '#60a5fa', borderRadius: 4, transition: 'width 0.8s ease' }} />
                    </div>
                    <span style={{ fontSize: 12, color: '#6b7280', width: 30, textAlign: 'right' }}>{count}</span>
                  </div>
                );
              })}
            </div>

            {/* Email Automation Funnel */}
            <div style={{ background: '#0d0d14', border: '1px solid #1e1e2a', borderRadius: 16, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <Activity size={15} style={{ color: '#ccf244' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#e4e4e7' }}>Email Automation Status</span>
              </div>
              {Object.entries(AUTOMATION_CONFIG).map(([key, cfg]) => {
                const count = stats.byAutomation[key] || 0;
                if (count === 0) return null;
                const pct = Math.round((count / stats.total) * 100);
                return (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <span style={{ fontSize: 12, color: cfg.color, width: 90, flexShrink: 0, fontWeight: 500 }}>{cfg.label}</span>
                    <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: cfg.color, borderRadius: 4, transition: 'width 0.8s ease' }} />
                    </div>
                    <span style={{ fontSize: 12, color: '#6b7280', width: 30, textAlign: 'right' }}>{count}</span>
                  </div>
                );
              })}

              <div style={{ marginTop: 20, padding: 14, background: 'rgba(204,242,68,0.06)', border: '1px solid rgba(204,242,68,0.15)', borderRadius: 10 }}>
                <div style={{ fontSize: 11, color: '#71717a', marginBottom: 6 }}>Next Step: n8n Integration</div>
                <div style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.5 }}>
                  Select leads → "Queue Emails" → n8n picks up queued leads and sends personalised sequences.
                </div>
                <div style={{ marginTop: 8, display: 'flex', gap: 6, alignItems: 'center' }}>
                  <div style={{ width: 6, height: 6, borderRadius: 3, background: '#eab308' }} />
                  <span style={{ fontSize: 11, color: '#eab308' }}>{(stats.byAutomation['queued'] || 0) + (stats.byAutomation['in_progress'] || 0)} leads awaiting automation</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        select option { background: #0a0a12; }
        input[type='date']::-webkit-calendar-picker-indicator { filter: invert(0.5); }
      `}</style>
    </div>
  );
}

// ─── Exported wrapper with auth gate ───────────────────────────────────────────
export function CrmPage() {
  const [authed, setAuthed] = useState<boolean>(() => {
    try {
      const token = localStorage.getItem(CRM_SESSION_KEY);
      return !!token;
    } catch {
      return false;
    }
  });

  if (!authed) {
    return <CrmLoginGate onAuth={() => setAuthed(true)} />;
  }

  return <CrmDashboard />;
}
