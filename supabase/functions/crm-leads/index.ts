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

    return json({ error: 'Unknown action' }, 400);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return json({ error: msg }, 500);
  }
});
