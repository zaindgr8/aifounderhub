// Minimal RFC 5545 .ics generator for booking calendar invites.

function fmt(dt: Date): string {
  // UTC basic format: 20260717T160000Z
  return dt.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function escape(text: string): string {
  return text.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
}

export interface IcsInput {
  uid: string;
  start: Date;
  end: Date;
  summary: string;
  description?: string;
  organizerEmail: string;
  attendeeEmail: string;
  location?: string;
}

export function buildIcs(i: IcsInput): string {
  const now = new Date();
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AI Founder Hub//Booking//EN",
    "METHOD:REQUEST",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${i.uid}`,
    `DTSTAMP:${fmt(now)}`,
    `DTSTART:${fmt(i.start)}`,
    `DTEND:${fmt(i.end)}`,
    `SUMMARY:${escape(i.summary)}`,
    i.description ? `DESCRIPTION:${escape(i.description)}` : "",
    i.location ? `LOCATION:${escape(i.location)}` : "",
    `ORGANIZER;CN=AI Founder Hub:mailto:${i.organizerEmail}`,
    `ATTENDEE;CN=${i.attendeeEmail};RSVP=TRUE:mailto:${i.attendeeEmail}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean).join("\r\n");
}

// base64 encode for email attachment
export function icsToBase64(ics: string): string {
  return btoa(unescape(encodeURIComponent(ics)));
}
