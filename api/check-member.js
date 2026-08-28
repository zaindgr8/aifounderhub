/**
 * POST /api/check-member
 *
 * Checks if an email has active paid membership.
 * Used by the frontend auth hook — keeps the service-role key on the backend.
 *
 * Body: { email: string }
 * Response: { hasAccess: boolean, status?: string, expiresAt?: string }
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function checkMember(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.body ?? {};
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ hasAccess: false, error: 'Missing email' });
  }

  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('[check-member] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    return res.status(500).json({ hasAccess: false, error: 'Server misconfiguration' });
  }

  try {
    // Query the members table directly via Supabase REST API using service-role key
    const url = `${SUPABASE_URL}/rest/v1/members?email=ilike.${encodeURIComponent(email.toLowerCase())}&select=email,status,expires_at&limit=1`;

    const supaRes = await fetch(url, {
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        Accept: 'application/json',
      },
    });

    if (!supaRes.ok) {
      const err = await supaRes.text();
      console.error('[check-member] Supabase query failed:', err);
      return res.status(502).json({ hasAccess: false, error: 'Database query failed' });
    }

    const rows = await supaRes.json();
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(200).json({ hasAccess: false });
    }

    const member = rows[0];
    const now = new Date();
    const expiresAt = member.expires_at ? new Date(member.expires_at) : null;
    const isActive = member.status === 'active' && (!expiresAt || expiresAt > now);

    return res.status(200).json({
      hasAccess: isActive,
      status: member.status,
      expiresAt: member.expires_at,
    });
  } catch (err) {
    console.error('[check-member] Unexpected error:', err);
    return res.status(500).json({ hasAccess: false, error: 'Internal server error' });
  }
}
