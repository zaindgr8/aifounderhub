// GET /availability?mentor=ahmed&days=14
// Returns open 1:1 slots for a mentor over the next N days, derived from their
// weekly availability_rules minus confirmed bookings and one-off blocks.
import { preflight, json } from "../_shared/cors.ts";
import { adminClient } from "../_shared/db.ts";

interface Slot { start: string; end: string }

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("mentor") ?? "";
    const days = Math.min(parseInt(url.searchParams.get("days") ?? "14", 10) || 14, 30);

    const db = adminClient();
    const { data: mentor } = await db
      .from("mentors")
      .select("id, slug, name, role, price_fils, currency, session_minutes, timezone, active")
      .eq("slug", slug)
      .eq("active", true)
      .single();
    if (!mentor) return json({ error: "mentor not found" }, 404);

    const { data: rules } = await db
      .from("availability_rules")
      .select("weekday, start_min, end_min")
      .eq("mentor_id", mentor.id);

    const now = new Date();
    const horizon = new Date(now.getTime() + days * 86_400_000);

    const { data: booked } = await db
      .from("bookings")
      .select("starts_at")
      .eq("mentor_id", mentor.id)
      .neq("status", "cancelled")
      .gte("starts_at", now.toISOString());
    const bookedSet = new Set((booked ?? []).map((b) => new Date(b.starts_at).toISOString()));

    const { data: blocks } = await db
      .from("availability_blocks")
      .select("starts_at, ends_at")
      .eq("mentor_id", mentor.id)
      .gte("ends_at", now.toISOString());

    const isBlocked = (start: Date, end: Date) =>
      (blocks ?? []).some((b) =>
        start < new Date(b.ends_at) && end > new Date(b.starts_at)
      );

    // NOTE: slots are computed in UTC from minute-of-day rules. For production
    // accuracy across DST you'd convert via the mentor timezone; UAE has no DST
    // so a fixed +4 offset is correct here.
    const TZ_OFFSET_MIN = 4 * 60; // Asia/Dubai = UTC+4
    const dur = mentor.session_minutes;
    const slots: Slot[] = [];

    for (let d = 0; d < days; d++) {
      const day = new Date(now.getTime() + d * 86_400_000);
      const weekday = day.getUTCDay();
      const rulesForDay = (rules ?? []).filter((r) => r.weekday === weekday);
      for (const r of rulesForDay) {
        for (let m = r.start_min; m + dur <= r.end_min; m += dur) {
          // local minute -> UTC
          const utcMin = m - TZ_OFFSET_MIN;
          const start = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), 0, 0, 0));
          start.setUTCMinutes(utcMin);
          const end = new Date(start.getTime() + dur * 60_000);
          if (start <= now || start > horizon) continue;
          if (bookedSet.has(start.toISOString())) continue;
          if (isBlocked(start, end)) continue;
          slots.push({ start: start.toISOString(), end: end.toISOString() });
        }
      }
    }

    slots.sort((a, b) => a.start.localeCompare(b.start));
    return json({
      mentor: {
        slug: mentor.slug, name: mentor.name, role: mentor.role,
        priceFils: mentor.price_fils, currency: mentor.currency,
        sessionMinutes: mentor.session_minutes,
      },
      slots: slots.slice(0, 60),
    });
  } catch (e) {
    console.error(e);
    return json({ error: "unexpected error" }, 500);
  }
});
