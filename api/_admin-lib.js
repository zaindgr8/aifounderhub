import 'dotenv/config';

/**
 * Shared helpers for the /admin backend.
 *
 * Files in api/ that start with "_" are not turned into routes by Vercel, so
 * this module stays private to the serverless functions that import it.
 *
 * Everything here talks to Supabase with the SERVICE-ROLE key, which bypasses
 * RLS. That key must never reach the browser — the only way in is through
 * api/admin.js, which authenticates the caller first.
 */

const getSupabaseUrl = () => process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const getServiceKey  = () => process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const getAnonKey     = () => process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => Boolean(getSupabaseUrl() && getServiceKey());
export const supabaseConfigured = true; // backward compat

// ─── Product catalogue ────────────────────────────────────────────────────────
// The single source of truth for "which package". Keep in sync with the amounts
// passed to initiateZiinaPayment() on the frontend.

export const PACKAGES = {
  'aaa-accelerator': { code: 'aaa-accelerator', label: 'AAA Accelerator — Founding Cohort', purpose: 'membership', priceCents: 150000, recurring: false },
  'claude-master':   { code: 'claude-master',   label: 'Master Claude in 7 Days',        purpose: 'course',     priceCents: 4500,  recurring: false },
  'all-access':      { code: 'all-access',      label: 'All Access (RoadMap + Claude)',  purpose: 'membership', priceCents: 19900, recurring: false },
  'session-1on1':    { code: 'session-1on1',    label: '1:1 Private Session',            purpose: 'booking',    priceCents: 59900, recurring: false },
  'other':           { code: 'other',           label: 'Other / Manual',                 purpose: 'membership', priceCents: 0,     recurring: false },
};

/** Best-effort product identification for a payments row, pre- or post-migration 0003. */
export function resolveProduct(row) {
  if (row?.product_code && PACKAGES[row.product_code]) return PACKAGES[row.product_code];
  if (row?.product_code) return { code: row.product_code, label: row.product_label || row.product_code, purpose: row.purpose, priceCents: 0, recurring: false };
  if (row?.purpose === 'booking') return PACKAGES['session-1on1'];
  if (row?.purpose === 'membership') return PACKAGES['aaa-accelerator'];
  return PACKAGES['other'];
}

/** Amount in USD cents, tolerating rows written before migration 0003. */
export function amountCents(row) {
  if (typeof row?.amount_cents === 'number') return row.amount_cents;
  if (typeof row?.amount_fils === 'number') return row.amount_fils;
  return 0;
}

// ─── Supabase REST ────────────────────────────────────────────────────────────

function serviceHeaders(extra = {}) {
  const key = getServiceKey();
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

/** GET rows from a table. Returns [] on any failure so one missing table never 500s the panel. */
export async function sbSelect(table, query = '') {
  if (!isSupabaseConfigured()) return [];
  try {
    const res = await fetch(`${getSupabaseUrl()}/rest/v1/${table}?${query}`, { headers: serviceHeaders() });
    if (!res.ok) {
      console.warn(`[admin] select ${table} failed:`, res.status, await res.text());
      return [];
    }
    const rows = await res.json();
    return Array.isArray(rows) ? rows : [];
  } catch (err) {
    console.warn(`[admin] select ${table} error:`, err?.message);
    return [];
  }
}

export async function sbInsert(table, body, { returning = 'representation' } = {}) {
  const res = await fetch(`${getSupabaseUrl()}/rest/v1/${table}`, {
    method: 'POST',
    headers: serviceHeaders({ Prefer: `return=${returning}` }),
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* non-JSON error body */ }
  return { ok: res.ok, status: res.status, data: json, raw: text };
}

export async function sbPatch(table, query, body) {
  const res = await fetch(`${getSupabaseUrl()}/rest/v1/${table}?${query}`, {
    method: 'PATCH',
    headers: serviceHeaders({ Prefer: 'return=representation' }),
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* non-JSON error body */ }
  return { ok: res.ok, status: res.status, data: json, raw: text };
}

/**
 * Insert with graceful degradation: tries the full payload first, and if the
 * database rejects it because migration 0003 has not been applied yet, retries
 * with only the columns that exist in the base schema.
 *
 * This keeps checkout and lead capture working on an un-migrated database.
 */
export async function sbInsertTolerant(table, full, base) {
  const first = await sbInsert(table, full);
  if (first.ok) return first;
  const schemaIssue = first.status === 400 || first.status === 404 || /column|schema cache|invalid input value/i.test(first.raw || '');
  if (!schemaIssue) return first;
  console.warn(`[admin] ${table} insert fell back to base columns (run migration 0003):`, first.raw?.slice(0, 200));
  return sbInsert(table, base);
}

// ─── Supabase Auth admin ──────────────────────────────────────────────────────

/** Every signed-up user. Paginated; capped so a runaway account can't hang the request. */
export async function listAuthUsers({ maxPages = 20, perPage = 200 } = {}) {
  if (!isSupabaseConfigured()) return [];
  const users = [];
  for (let page = 1; page <= maxPages; page++) {
    const res = await fetch(`${getSupabaseUrl()}/auth/v1/admin/users?page=${page}&per_page=${perPage}`, {
      headers: serviceHeaders(),
    });
    if (!res.ok) {
      console.warn('[admin] listAuthUsers failed:', res.status, await res.text());
      break;
    }
    const body = await res.json().catch(() => ({}));
    const batch = Array.isArray(body?.users) ? body.users : [];
    users.push(...batch);
    if (batch.length < perPage) break;
  }
  return users;
}

// ─── Admin authentication ─────────────────────────────────────────────────────

function envAdminEmails() {
  return (process.env.ADMIN_EMAILS || process.env.OWNER_EMAIL || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

let adminTableCache = { emails: null, at: 0 };

async function dbAdminEmails() {
  // 60s cache — /admin makes several calls per page view and this rarely changes.
  if (adminTableCache.emails && Date.now() - adminTableCache.at < 60_000) return adminTableCache.emails;
  const rows = await sbSelect('admin_users', 'select=email,role');
  const map = new Map(rows.map((r) => [String(r.email).toLowerCase(), r.role || 'admin']));
  adminTableCache = { emails: map, at: Date.now() };
  return map;
}

/**
 * Verifies the caller's Supabase access token and returns who they are.
 * Any signed-in user passes — this is the gate for user-facing endpoints such
 * as the affiliate dashboard. Use requireAdmin() where admin rights are needed.
 *
 * Returns { ok: true, email, userId, user } or { ok: false, status, error }.
 */
export async function requireUser(req) {
  if (!isSupabaseConfigured()) {
    return { ok: false, status: 500, error: 'Server is missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY' };
  }

  const header = req.headers?.authorization || req.headers?.Authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) return { ok: false, status: 401, error: 'Not signed in' };

  // Validate the JWT against Supabase itself rather than decoding it locally —
  // this also catches revoked sessions and deleted users.
  let user;
  try {
    const res = await fetch(`${getSupabaseUrl()}/auth/v1/user`, {
      headers: { apikey: getAnonKey() || getServiceKey(), Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return { ok: false, status: 401, error: 'Session expired — sign in again' };
    user = await res.json();
  } catch {
    return { ok: false, status: 502, error: 'Could not verify session' };
  }

  const email = String(user?.email || '').toLowerCase();
  if (!email) return { ok: false, status: 401, error: 'Session has no email' };

  return { ok: true, email, userId: user.id, user };
}

/**
 * Verifies the caller's Supabase access token and checks it against the admin
 * allowlist (the admin_users table, plus the ADMIN_EMAILS env var).
 *
 * Returns { ok: true, email, role } or { ok: false, status, error }.
 */
export async function requireAdmin(req) {
  const session = await requireUser(req);
  if (!session.ok) return session;
  const { email, userId } = session;

  const envList = envAdminEmails();
  const dbList = await dbAdminEmails();

  if (dbList.has(email)) return { ok: true, email, role: dbList.get(email), userId };
  if (envList.includes(email)) return { ok: true, email, role: 'admin', userId };

  console.warn('[admin] denied access to', email);
  return { ok: false, status: 403, error: 'This account is not an admin' };
}

/** Append to the audit trail. Never throws — auditing must not break the action. */
export async function audit(actorEmail, action, subject, detail = {}) {
  try {
    await sbInsert('admin_audit_log', { actor_email: actorEmail, action, subject, detail }, { returning: 'minimal' });
  } catch (err) {
    console.warn('[admin] audit failed:', err?.message);
  }
}

/**
 * Escapes ILIKE wildcards. Underscores are common in email addresses, and an
 * unescaped `_` would match any character — i.e. a different customer's row.
 */
export function likeSafe(value) {
  return String(value).replace(/([%_\\])/g, '\\$1');
}

export function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.APP_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store');
}
