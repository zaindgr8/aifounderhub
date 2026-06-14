// POST /capture-lead
// Captures a website signup into the CRM (upsert by email) and sends the
// welcome + next-workshop email. This is the top of the funnel.
import { preflight, json } from "../_shared/cors.ts";
import { adminClient } from "../_shared/db.ts";
import { sendEmail } from "../_shared/resend.ts";
import { welcomeEmail } from "../_shared/emails.ts";

const GOALS = ["founder", "freelancer", "scaleup", "agency", "explore"];

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json();
    const firstName = (body.firstName ?? "").toString().trim();
    const email = (body.email ?? "").toString().trim().toLowerCase();
    const goal = GOALS.includes(body.goal) ? body.goal : "explore";

    if (!firstName) return json({ error: "first name required" }, 400);
    if (!/^\S+@\S+\.\S+$/.test(email)) return json({ error: "valid email required" }, 400);

    const db = adminClient();
    const { data: lead, error } = await db
      .from("leads")
      .upsert(
        {
          first_name: firstName,
          email,
          phone: body.phone ?? null,
          country_code: body.countryCode ?? null,
          dial_code: body.dialCode ?? null,
          goal,
          source: body.source ?? "website",
        },
        { onConflict: "email" },
      )
      .select()
      .single();

    if (error) {
      // unique index is on lower(email); handle gracefully
      console.error("lead upsert error", error);
      return json({ error: "could not save lead" }, 500);
    }

    const siteUrl = Deno.env.get("SITE_URL") ?? "https://aifounderhub.com";
    const mail = welcomeEmail(firstName, `${siteUrl}/#workshops`);
    await sendEmail({ to: email, subject: mail.subject, html: mail.html });

    return json({ ok: true, leadId: lead?.id });
  } catch (e) {
    console.error(e);
    return json({ error: "unexpected error" }, 500);
  }
});
