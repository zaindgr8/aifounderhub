// Edge Function: /email-analytics
// Email performance for the /crm Analytics tab, pulled from Brevo so the API key
// never reaches the browser.
//
// GET ?days=7|30|90  → totals, daily trend, per-funnel-level stats (Brevo tags),
//                      per-campaign stats, most engaged recipients (matched to
//                      masterclass_leads), recent activity and Brevo campaigns.
//
// Secrets: BREVO_API_KEY, or the 'brevo_api_key' Vault secret (read through the
// service-role-only get_brevo_api_key() RPC). SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY
// are auto-injected and also used to put names on recipient emails.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { json, preflight } from '../_shared/cors.ts';

const BREVO = 'https://api.brevo.com/v3';
let BREVO_KEY = Deno.env.get('BREVO_API_KEY') ?? '';

// Falls back to Vault when the function secret isn't set; cached per instance.
async function loadBrevoKey(): Promise<string> {
  if (BREVO_KEY) return BREVO_KEY;
  const sbUrl = Deno.env.get('SUPABASE_URL');
  const sbKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!sbUrl || !sbKey) return '';
  const db = createClient(sbUrl, sbKey, { auth: { persistSession: false } });
  const { data } = await db.rpc('get_brevo_api_key');
  BREVO_KEY = typeof data === 'string' ? data.trim() : '';
  return BREVO_KEY;
}

// Brevo tags the transactional sends with the lead category, so each funnel level
// can be reported on its own.
const CATEGORY_TAGS = ['afh_signup', 'free_class_registration', 'dubai_event_circle', 'gumroad_course'];

// Events counted per campaign / recipient. `requests` is the send itself.
const EVENT_TYPES = ['requests', 'delivered', 'opened', 'clicks', 'unsubscribed', 'hardBounces', 'softBounces', 'blocked', 'spam'] as const;
type EventType = typeof EVENT_TYPES[number];

const PAGE = 2500;      // Brevo max per call is 5000; smaller pages keep each request quick
const MAX_EVENTS = 20000; // per event type, per request
const MIN_CAMPAIGN_SENDS = 5;

interface BrevoEvent {
  email: string;
  date: string;
  messageId: string;
  event: string;
  subject?: string;
  tag?: string;
  link?: string;
}

async function brevo<T>(path: string): Promise<T> {
  const res = await fetch(`${BREVO}${path}`, {
    headers: { 'api-key': BREVO_KEY, accept: 'application/json' },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Brevo ${path.split('?')[0]}: ${(data as { message?: string }).message ?? res.status}`);
  return data as T;
}

async function fetchEvents(type: EventType, days: number): Promise<BrevoEvent[]> {
  const out: BrevoEvent[] = [];
  for (let offset = 0; offset < MAX_EVENTS; offset += PAGE) {
    const { events = [] } = await brevo<{ events?: BrevoEvent[] }>(
      `/smtp/statistics/events?event=${type}&days=${days}&limit=${PAGE}&offset=${offset}&sort=desc`,
    );
    out.push(...events);
    if (events.length < PAGE) break;
  }
  return out;
}

// "afh-custom,gumroad_course,afh-custom:ai-employees-masterclass" → "ai-employees-masterclass".
// Subjects are personalised per recipient, so the campaign tag is the stable grouping key.
function campaignKey(e: BrevoEvent): string {
  const tags = (e.tag ?? '').split(',').map(t => t.trim()).filter(Boolean);
  const named = tags.find(t => t.includes(':'));
  if (named) return named.split(':').slice(1).join(':');
  const generic = tags.find(t => !CATEGORY_TAGS.includes(t) && t !== 'afh-custom');
  return generic ?? (e.subject ? e.subject.replace(/^\[TEST[^\]]*\]\s*/, '') : 'untagged');
}

// The daily report endpoint caps a request at 30 days, so longer ranges are fetched in windows.
async function fetchDaily(days: number) {
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const windows: Promise<{ reports?: Record<string, number | string>[] }>[] = [];
  for (let end = 0; end < days; end += 30) {
    const endDate = new Date(Date.now() - end * 86400000);
    const startDate = new Date(Date.now() - (Math.min(end + 30, days) - 1) * 86400000);
    windows.push(brevo(`/smtp/statistics/reports?startDate=${iso(startDate)}&endDate=${iso(endDate)}`));
  }
  const rows = (await Promise.all(windows)).flatMap(w => w.reports ?? []);
  const byDate = new Map(rows.map(r => [String(r.date), r]));
  return [...byDate.values()].sort((a, b) => String(a.date).localeCompare(String(b.date)));
}

function isTest(e: BrevoEvent) {
  return (e.subject ?? '').startsWith('[TEST');
}

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;

  if (!(await loadBrevoKey())) {
    return json({ error: 'Brevo API key not found: set the BREVO_API_KEY function secret or the brevo_api_key Vault secret' }, 500);
  }

  const url = new URL(req.url);
  const days = [7, 30, 90].includes(Number(url.searchParams.get('days'))) ? Number(url.searchParams.get('days')) : 30;

  try {
    const [totals, daily, categoryReports, campaignsRes, account, eventLists] = await Promise.all([
      brevo<Record<string, number | string>>(`/smtp/statistics/aggregatedReport?days=${days}`),
      fetchDaily(days),
      Promise.all(CATEGORY_TAGS.map(tag =>
        brevo<Record<string, number | string>>(`/smtp/statistics/aggregatedReport?days=${days}&tag=${tag}`)
          .then(r => [tag, r] as const),
      )),
      brevo<{ campaigns?: any[] }>(`/emailCampaigns?status=sent&limit=20&sort=desc&statistics=globalStats&excludeHtmlContent=true`),
      brevo<{ plan?: { type: string; credits: number; creditsType: string }[] }>(`/account`),
      Promise.all(EVENT_TYPES.map(t => fetchEvents(t, days).then(ev => [t, ev] as const))),
    ]);

    const events = Object.fromEntries(eventLists) as Record<EventType, BrevoEvent[]>;

    // ── Per campaign (unique recipients per event) ──────────────────────────
    type Bucket = Record<EventType, Set<string>> & { subject: string; category: string; lastSent: string };
    const campaigns = new Map<string, Bucket>();
    for (const type of EVENT_TYPES) {
      for (const e of events[type]) {
        if (isTest(e)) continue;
        const key = campaignKey(e);
        let b = campaigns.get(key);
        if (!b) {
          b = Object.fromEntries(EVENT_TYPES.map(t => [t, new Set<string>()])) as unknown as Bucket;
          b.subject = e.subject ?? '';
          b.category = (e.tag ?? '').split(',').map(t => t.trim()).find(t => CATEGORY_TAGS.includes(t)) ?? '';
          b.lastSent = '';
          campaigns.set(key, b);
        }
        b[type].add(e.email.toLowerCase());
        if (type === 'requests' && e.date > b.lastSent) b.lastSent = e.date;
      }
    }
    const allCampaigns = [...campaigns.entries()]
      .map(([key, b]) => ({
        key,
        subject: b.subject,
        category: b.category,
        lastSent: b.lastSent || null,
        sent: b.requests.size,
        delivered: b.delivered.size,
        opened: b.opened.size,
        clicked: b.clicks.size,
        unsubscribed: b.unsubscribed.size,
        bounced: new Set([...b.hardBounces, ...b.softBounces]).size,
        blocked: b.blocked.size,
        notOpened: [...b.delivered].filter(e => !b.opened.has(e)).length,
      }))
      .sort((a, b) => (b.lastSent ?? '').localeCompare(a.lastSent ?? ''));
    // One-off sends (team notifications, single replies) would drown the real campaigns.
    const byCampaign = allCampaigns.filter(c => c.sent >= MIN_CAMPAIGN_SENDS).slice(0, 60);

    // ── Per recipient ───────────────────────────────────────────────────────
    const people = new Map<string, { email: string; received: number; opens: number; clicks: number; lastActivity: string; unsubscribed: boolean; bounced: boolean }>();
    const person = (email: string) => {
      const k = email.toLowerCase();
      let p = people.get(k);
      if (!p) { p = { email: k, received: 0, opens: 0, clicks: 0, lastActivity: '', unsubscribed: false, bounced: false }; people.set(k, p); }
      return p;
    };
    for (const e of events.delivered) if (!isTest(e)) person(e.email).received++;
    for (const e of events.opened) if (!isTest(e)) { const p = person(e.email); p.opens++; if (e.date > p.lastActivity) p.lastActivity = e.date; }
    for (const e of events.clicks) if (!isTest(e)) { const p = person(e.email); p.clicks++; if (e.date > p.lastActivity) p.lastActivity = e.date; }
    for (const e of events.unsubscribed) person(e.email).unsubscribed = true;
    for (const e of events.hardBounces) person(e.email).bounced = true;

    const all = [...people.values()];
    const engaged = all
      .filter(p => p.opens > 0 || p.clicks > 0)
      .sort((a, b) => (b.clicks * 3 + b.opens) - (a.clicks * 3 + a.opens) || b.lastActivity.localeCompare(a.lastActivity))
      .slice(0, 25);
    const neverOpened = all.filter(p => p.received >= 2 && p.opens === 0 && p.clicks === 0 && !p.bounced && !p.unsubscribed);

    // Put lead names on the emails we show.
    const showEmails = [...new Set([...engaged.map(p => p.email), ...neverOpened.slice(0, 25).map(p => p.email)])];
    const leadInfo = new Map<string, { name: string | null; category: string | null }>();
    const sbUrl = Deno.env.get('SUPABASE_URL');
    const sbKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (sbUrl && sbKey && showEmails.length) {
      const db = createClient(sbUrl, sbKey, { auth: { persistSession: false } });
      const { data } = await db
        .from('masterclass_leads')
        .select('email_address, full_name, lead_category')
        .in('email_address', showEmails);
      for (const l of data ?? []) {
        leadInfo.set(String(l.email_address).toLowerCase(), { name: l.full_name, category: l.lead_category });
      }
    }
    const withLead = <T extends { email: string }>(p: T) => ({ ...p, ...(leadInfo.get(p.email) ?? { name: null, category: null }) });

    // ── Recent activity feed ────────────────────────────────────────────────
    const recent = [...events.opened, ...events.clicks, ...events.unsubscribed, ...events.hardBounces, ...events.spam]
      .filter(e => !isTest(e))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 40)
      .map(e => ({ email: e.email, date: e.date, event: e.event, subject: e.subject ?? '', link: e.link ?? null }));

    // ── Brevo marketing campaigns ───────────────────────────────────────────
    const brevoCampaigns = (campaignsRes.campaigns ?? []).map(c => {
      const s = c.statistics?.globalStats ?? {};
      return {
        id: c.id,
        name: c.name,
        subject: c.subject,
        sentDate: c.sentDate ?? c.scheduledAt ?? null,
        sent: s.sent ?? 0,
        delivered: s.delivered ?? 0,
        uniqueViews: s.uniqueViews ?? 0,
        uniqueClicks: s.uniqueClicks ?? 0,
        unsubscriptions: s.unsubscriptions ?? 0,
        hardBounces: s.hardBounces ?? 0,
        softBounces: s.softBounces ?? 0,
        complaints: s.complaints ?? 0,
        appleMppOpens: s.appleMppOpens ?? 0,
        shareLink: c.shareLink ?? null,
      };
    });

    return json({
      days,
      range: totals.range,
      generatedAt: new Date().toISOString(),
      totals,
      daily,
      byCategory: Object.fromEntries(categoryReports),
      byCampaign,
      oneOffSends: allCampaigns.filter(c => c.sent < MIN_CAMPAIGN_SENDS).reduce((n, c) => n + c.sent, 0),
      engaged: engaged.map(withLead),
      neverOpened: { count: neverOpened.length, sample: neverOpened.slice(0, 25).map(withLead) },
      audience: {
        reached: all.filter(p => p.received > 0).length,
        openedAny: all.filter(p => p.opens > 0).length,
        clickedAny: all.filter(p => p.clicks > 0).length,
      },
      recent,
      brevoCampaigns,
      plan: account.plan ?? [],
    });
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : String(err) }, 502);
  }
});
