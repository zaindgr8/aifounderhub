// Edge Function: /crm-leads
// Handles all CRM operations for masterclass_leads using the service role key
// Supports: list, update, stats, seed-demo

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

// Use the new CRM Supabase project with service role
const CRM_URL = Deno.env.get('CRM_SUPABASE_URL') || 'https://csdxhpdjkaddrblyxlhg.supabase.co';
const CRM_SERVICE_KEY = Deno.env.get('CRM_SUPABASE_SERVICE_KEY') || '';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get('action') || 'list';

  // Create admin client (bypasses RLS)
  const db = createClient(CRM_URL, CRM_SERVICE_KEY, {
    auth: { persistSession: false },
  });

  try {
    // ── LIST leads ─────────────────────────────────────────────────────────
    if (action === 'list') {
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 200);
      const status = url.searchParams.get('status');
      const intent = url.searchParams.get('intent');
      const search = url.searchParams.get('search');
      const sort = url.searchParams.get('sort') || 'created_at';
      const order = url.searchParams.get('order') === 'asc' ? true : false;

      let q = db.from('masterclass_leads').select('*', { count: 'exact' });

      if (status && status !== 'all') q = q.eq('status', status);
      if (intent && intent !== 'all') q = q.eq('intent', intent);
      if (search) {
        q = q.or(`full_name.ilike.%${search}%,email_address.ilike.%${search}%,country.ilike.%${search}%`);
      }

      q = q.order(sort, { ascending: order }).range((page - 1) * limit, page * limit - 1);

      const { data, error, count } = await q;
      if (error) return json({ error: error.message }, 400);
      return json({ leads: data, count, page, limit });
    }

    // ── STATS ───────────────────────────────────────────────────────────────
    if (action === 'stats') {
      const { data, error, count: total } = await db
        .from('masterclass_leads')
        .select('status, intent, email_automation_status, country, lead_score, interested', { count: 'exact' });

      if (error) return json({ error: error.message }, 400);

      const leads = data || [];
      const byStatus: Record<string, number> = {};
      const byIntent: Record<string, number> = {};
      const byCountry: Record<string, number> = {};
      const byAutomation: Record<string, number> = {};
      let totalScore = 0;
      let interested = 0;

      for (const l of leads) {
        byStatus[l.status || 'new'] = (byStatus[l.status || 'new'] || 0) + 1;
        if (l.intent) byIntent[l.intent] = (byIntent[l.intent] || 0) + 1;
        if (l.country) byCountry[l.country] = (byCountry[l.country] || 0) + 1;
        byAutomation[l.email_automation_status || 'pending'] = (byAutomation[l.email_automation_status || 'pending'] || 0) + 1;
        totalScore += l.lead_score || 0;
        if (l.interested) interested++;
      }

      const topCountries = Object.entries(byCountry)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([country, count]) => ({ country, count }));

      return json({
        total,
        interested,
        avgScore: leads.length ? Math.round(totalScore / leads.length) : 0,
        byStatus,
        byIntent,
        byAutomation,
        topCountries,
      });
    }

    // ── UPDATE a lead ───────────────────────────────────────────────────────
    if (action === 'update' && req.method === 'PATCH') {
      const body = await req.json();
      const { id, ...updates } = body;
      if (!id) return json({ error: 'id required' }, 400);

      updates.updated_at = new Date().toISOString();

      const { data, error } = await db
        .from('masterclass_leads')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) return json({ error: error.message }, 400);
      return json({ lead: data });
    }

    // ── BULK UPDATE ─────────────────────────────────────────────────────────
    if (action === 'bulk-update' && req.method === 'POST') {
      const body = await req.json();
      const { ids, updates } = body;
      if (!ids?.length || !updates) return json({ error: 'ids and updates required' }, 400);

      updates.updated_at = new Date().toISOString();

      const { error } = await db
        .from('masterclass_leads')
        .update(updates)
        .in('id', ids);

      if (error) return json({ error: error.message }, 400);
      return json({ updated: ids.length });
    }

    // ── TRIGGER N8N ─────────────────────────────────────────────────────────
    if (action === 'trigger-automation' && req.method === 'POST') {
      const body = await req.json();
      const { ids, workflow } = body;

      // Mark these leads as queued for automation
      const { error } = await db
        .from('masterclass_leads')
        .update({
          email_automation_status: 'queued',
          updated_at: new Date().toISOString(),
        })
        .in('id', ids);

      if (error) return json({ error: error.message }, 400);

      // Here you would call n8n webhook with the leads data
      // const n8nWebhook = Deno.env.get('N8N_WEBHOOK_URL');
      // if (n8nWebhook) { await fetch(n8nWebhook, { method: 'POST', body: JSON.stringify({ ids, workflow }) }); }

      return json({ queued: ids.length, message: 'Leads queued for email automation' });
    }

    // ── UPSERT / ADD LEAD (with email deduplication & funnel level upgrade) ──
    if ((action === 'upsert-lead' || action === 'add-lead') && req.method === 'POST') {
      const body = await req.json();
      const email = String(body.email || body.email_address || '').trim().toLowerCase();
      if (!email) return json({ error: 'email is required' }, 400);

      const targetCategory = (body.lead_category || body.leadCategory || 'afh_signup') as string;
      const LEAD_LEVEL_RANKS: Record<string, number> = {
        afh_signup: 1,              // Level 1: Top Level / Most mature
        free_class_registration: 2, // Level 2: Mid Level
        gumroad_course: 3,          // Level 3: Low Level
      };

      // Check existing lead by email
      const { data: existingRows, error: searchErr } = await db
        .from('masterclass_leads')
        .select('*')
        .ilike('email_address', email)
        .limit(1);

      if (searchErr) return json({ error: searchErr.message }, 400);

      const existing = existingRows && existingRows.length > 0 ? existingRows[0] : null;

      if (existing) {
        // Lead already exists — do NOT insert duplicate!
        const currentCat = existing.lead_category || 'free_class_registration';
        const currentRank = LEAD_LEVEL_RANKS[currentCat] ?? 2;
        const targetRank = LEAD_LEVEL_RANKS[targetCategory] ?? 2;
        const isUpgrade = targetRank < currentRank; // 1 is top rank

        const updates: Record<string, any> = {
          updated_at: new Date().toISOString(),
        };

        if (body.full_name || body.fullName) updates.full_name = body.full_name || body.fullName;
        if (body.phone_number || body.phone) updates.phone_number = body.phone_number || body.phone;
        if (body.country) updates.country = body.country;
        if (body.notes) {
          updates.notes = existing.notes ? `${existing.notes} | ${body.notes}` : body.notes;
        }

        if (isUpgrade) {
          // Upgrade level and remove from previous level
          updates.lead_category = targetCategory;
        }

        const { data: updated, error: updErr } = await db
          .from('masterclass_leads')
          .update(updates)
          .eq('id', existing.id)
          .select()
          .single();

        if (updErr) return json({ error: updErr.message }, 400);

        return json({
          lead: updated,
          wasDuplicate: true,
          upgraded: isUpgrade,
          fromLevel: currentRank,
          toLevel: isUpgrade ? targetRank : currentRank,
          message: isUpgrade
            ? `Upgraded from Level ${currentRank} to Level ${targetRank} (${targetCategory}). Removed from Level ${currentRank}.`
            : `Lead already exists at Level ${currentRank}. Updated existing record without duplicate.`,
        });
      }

      // New lead — insert single record
      const newLead = {
        full_name: body.full_name || body.fullName || null,
        email_address: email,
        phone_number: body.phone_number || body.phone || null,
        country: body.country || null,
        lead_category: targetCategory,
        status: body.status || 'new',
        notes: body.notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: inserted, error: insErr } = await db
        .from('masterclass_leads')
        .insert(newLead)
        .select()
        .single();

      if (insErr) return json({ error: insErr.message }, 400);

      return json({
        lead: inserted,
        wasDuplicate: false,
        upgraded: false,
        level: LEAD_LEVEL_RANKS[targetCategory] ?? 2,
        message: `New Level ${LEAD_LEVEL_RANKS[targetCategory] ?? 2} lead created.`,
      });
    }

    return json({ error: 'Unknown action' }, 400);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return json({ error: msg }, 500);
  }
});
