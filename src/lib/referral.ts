/**
 * Referral capture.
 *
 * A visitor arrives at any page with ?ref=CODE. We remember the code in this
 * browser, tell the server about the click, and strip the parameter from the
 * URL so the page they share onward is clean.
 *
 * The code is only *used* later, when they sign in — at that point the app
 * calls `bind`, which permanently attaches them to that affiliate. Binding is
 * first-touch: if they were already referred by someone else, the server keeps
 * the original.
 */

const REF_KEY = 'afh_ref';
const VISITOR_KEY = 'afh_vid';
const BOUND_KEY = 'afh_ref_bound';

/** How long a stored referral stays valid. Mirrors affiliate_cookie_days. */
const WINDOW_DAYS = 90;

interface StoredReferral {
  code: string;
  at: number;
  path: string;
}

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // private mode / storage disabled — referral tracking degrades, nothing breaks
  }
}

function normalizeCode(code: string): string {
  return code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 24);
}

/** A stable per-browser id so one person refreshing does not inflate click counts. */
function visitorHash(): string {
  let id = null;
  try {
    id = localStorage.getItem(VISITOR_KEY);
  } catch {
    return 'anon';
  }
  if (!id) {
    id = (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`).replace(/-/g, '').slice(0, 24);
    try {
      localStorage.setItem(VISITOR_KEY, id);
    } catch {
      /* ignore */
    }
  }
  return id;
}

export function getStoredReferral(): string | null {
  const stored = readJson<StoredReferral>(REF_KEY);
  if (!stored?.code) return null;
  const ageDays = (Date.now() - stored.at) / 86_400_000;
  return ageDays <= WINDOW_DAYS ? stored.code : null;
}

/**
 * Runs once on app boot. Safe to call on every route.
 */
export function captureReferral(): void {
  if (typeof window === 'undefined') return;

  let params: URLSearchParams;
  try {
    params = new URLSearchParams(window.location.search);
  } catch {
    return;
  }

  const raw = params.get('ref');
  if (!raw) return;

  const code = normalizeCode(raw);
  if (!code) return;

  const landingPath = window.location.pathname + window.location.hash;
  const existing = readJson<StoredReferral>(REF_KEY);

  // First touch wins on the client too — a second affiliate's link does not
  // overwrite the code that brought this person here originally.
  if (!existing?.code || (Date.now() - existing.at) / 86_400_000 > WINDOW_DAYS) {
    write(REF_KEY, { code, at: Date.now(), path: landingPath } satisfies StoredReferral);
    try {
      localStorage.removeItem(BOUND_KEY);
    } catch {
      /* ignore */
    }
  }

  // Fire and forget — a tracking failure must never delay the page.
  void fetch('/api/affiliate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'track',
      code,
      landingPath,
      referrer: document.referrer || null,
      visitorHash: visitorHash(),
    }),
    keepalive: true,
  }).catch(() => {
    /* ignore */
  });

  // Clean the URL so the visitor does not reshare someone else's code.
  try {
    params.delete('ref');
    const query = params.toString();
    window.history.replaceState(
      {},
      '',
      window.location.pathname + (query ? `?${query}` : '') + window.location.hash,
    );
  } catch {
    /* ignore */
  }
}

/**
 * Attaches the signed-in user to the affiliate who referred them.
 * Called once per session after auth resolves; the server is the real guard.
 */
let bindInFlight: Promise<void> | null = null;

export async function bindReferral(email: string, accessToken: string): Promise<void> {
  const code = getStoredReferral();
  if (!code) return;

  const alreadyBound = readJson<string>(BOUND_KEY);
  if (alreadyBound === email.toLowerCase()) return;

  // useAuth runs in several components at once; only one bind should go out.
  if (bindInFlight) return bindInFlight;
  bindInFlight = doBind(code, email, accessToken).finally(() => { bindInFlight = null; });
  return bindInFlight;
}

async function doBind(code: string, email: string, accessToken: string): Promise<void> {

  try {
    const stored = readJson<StoredReferral>(REF_KEY);
    const res = await fetch('/api/affiliate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ action: 'bind', code, landingPath: stored?.path ?? '/' }),
    });
    if (res.ok) write(BOUND_KEY, email.toLowerCase());
  } catch {
    // try again next session
  }
}
