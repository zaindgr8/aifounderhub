import 'dotenv/config';

/**
 * POST /api/affiliate — everything the member-facing affiliate dashboard needs.
 *
 * Body: { action, ...params }
 *
 *   track   — public. Records a link visit. Unknown/unapproved codes are ignored.
 *   bind    — signed in. Attaches the caller to the affiliate whose link they
 *             arrived through. First touch wins and cannot be overwritten.
 *   status  — signed in. The caller's own affiliate record, links and earnings.
 *   apply   — signed in. Submits an application (status: pending).
 *   payout  — signed in. Updates their payout details.
 *
 * Only `track` is public, because it happens before anyone signs in. Everything
 * else is scoped to the caller's own email — there is no way to read another
 * affiliate's numbers through this endpoint.
 */

import { requireUser, isSupabaseConfigured } from './_admin-lib.js';
import {
  AFFILIATE_PRODUCTS, applyForAffiliate, getAffiliateByEmail,
  affiliateStats, trackClick, bindReferral, cookieDays, defaultCommissionPct,
} from './_affiliate-lib.js';

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.APP_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store');
}

/**
 * The origin affiliate links are built on.
 *
 * APP_URL is 'http://localhost:3000' in local .env, and a link handed to an
 * affiliate that points at localhost is worthless — so a localhost value is
 * only trusted when the request itself came from localhost. Otherwise we take
 * the host the request actually arrived on, which is correct on Vercel without
 * depending on an env var being set right.
 */
function siteOrigin(req) {
  const forwardedHost = req?.headers?.['x-forwarded-host'] || req?.headers?.host || '';
  const forwardedProto = req?.headers?.['x-forwarded-proto'] || (forwardedHost.startsWith('localhost') ? 'http' : 'https');
  const requestOrigin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : '';

  const configured = (process.env.APP_URL || process.env.SITE_URL || '').replace(/\/$/, '');
  const configuredIsLocal = /localhost|127\.0\.0\.1/.test(configured);
  const requestIsLocal = /localhost|127\.0\.0\.1/.test(requestOrigin);

  if (configured && (!configuredIsLocal || requestIsLocal)) return configured;
  if (requestOrigin) return requestOrigin.replace(/\/$/, '');
  return 'https://aifounderhub.com';
}

/** The share links for an approved affiliate — one code, several landing pages. */
function buildLinks(code, req) {
  const origin = siteOrigin(req);
  return AFFILIATE_PRODUCTS.map((p) => {
    const [path, hash] = p.path.split('#');
    const query = `${path.includes('?') ? '&' : '?'}ref=${encodeURIComponent(code)}`;
    return {
      code: p.code,
      label: p.label,
      blurb: p.blurb,
      url: `${origin}${path}${query}${hash ? `#${hash}` : ''}`,
    };
  });
}

/** The caller's own affiliate view. Never exposes another person's data. */
async function buildStatus(email, req) {
  const affiliate = await getAffiliateByEmail(email);
  const [days, defaultPct] = await Promise.all([cookieDays(), defaultCommissionPct()]);

  if (!affiliate) {
    return { enrolled: false, status: 'none', defaultPct, cookieDays: days, products: AFFILIATE_PRODUCTS };
  }

  const base = {
    enrolled: true,
    status: affiliate.status,
    code: affiliate.code,
    commissionPct: Number(affiliate.commission_pct),
    appliedAt: affiliate.applied_at,
    reviewedAt: affiliate.reviewed_at,
    adminNote: affiliate.admin_note,
    payoutMethod: affiliate.payout_method,
    payoutDetails: affiliate.payout_details,
    defaultPct,
    cookieDays: days,
    products: AFFILIATE_PRODUCTS,
  };

  // Links and earnings only exist once approved — a pending applicant has
  // nothing to share yet, and their code is inert until then.
  if (affiliate.status !== 'approved') return base;

  return { ...base, links: buildLinks(affiliate.code, req), stats: await affiliateStats(affiliate.id) };
}

export async function affiliate(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!isSupabaseConfigured()) return res.status(500).json({ error: 'Server is not configured' });

  const { action, ...params } = req.body ?? {};

  try {
    // ── Public: click tracking happens before anyone has signed in ────────────
    if (action === 'track') {
      const result = await trackClick({
        code: params.code,
        landingPath: params.landingPath,
        referrer: params.referrer,
        visitorHash: params.visitorHash,
      });
      return res.status(200).json(result);
    }

    // ── Everything below is scoped to the signed-in caller ────────────────────
    const session = await requireUser(req);
    if (!session.ok) return res.status(session.status).json({ error: session.error });

    switch (action) {
      case 'status':
        return res.status(200).json(await buildStatus(session.email, req));

      case 'bind': {
        const result = await bindReferral({
          code: params.code,
          email: session.email,
          userId: session.userId,
          landingPath: params.landingPath,
        });
        return res.status(200).json(result);
      }

      case 'apply': {
        const result = await applyForAffiliate({
          email: session.email,
          userId: session.userId,
          fullName: params.fullName || session.user?.user_metadata?.full_name || null,
          payoutMethod: params.payoutMethod,
          payoutDetails: params.payoutDetails,
          note: params.note,
        });
        if (result.error) return res.status(400).json({ error: result.error });
        return res.status(200).json(await buildStatus(session.email, req));
      }

      case 'payout': {
        const existing = await getAffiliateByEmail(session.email);
        if (!existing) return res.status(400).json({ error: 'You have not applied to the affiliate program yet' });
        const { sbPatch } = await import('./_admin-lib.js');
        const result = await sbPatch('affiliates', `id=eq.${existing.id}`, {
          payout_method: params.payoutMethod ?? null,
          payout_details: params.payoutDetails ?? null,
        });
        if (!result.ok) return res.status(400).json({ error: 'Could not save your payout details' });
        return res.status(200).json(await buildStatus(session.email, req));
      }

      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }
  } catch (err) {
    console.error('[affiliate] action failed:', action, err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}

export default affiliate;
