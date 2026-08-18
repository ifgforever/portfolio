// First-party handler for the contact form on every page — replaces the
// GoDaddy-era Formspree endpoint (mdaqjjqo) so submissions land in an inbox
// we control. Runs as a Cloudflare Pages Function on this same project, so
// the form posts same-origin to /api/contact and needs no CORS.
//
// Configuration (Cloudflare dashboard > Workers & Pages > portfolio >
// Settings > Variables and secrets):
//   RESEND_API_KEY  secret, required. Same Resend account the tv-ops project
//                   sends from; create a fresh key in the Resend dashboard.
//   CONTACT_TO      optional override for the delivery inbox (comma-separate
//                   for multiple recipients).
//   CONTACT_FROM    optional override for the From address. Must be on a
//                   domain verified in Resend — the default uses
//                   mail.tvserviceschicago.com, which already is. Verify
//                   risendust.com in Resend to switch to a branded sender.

const DEFAULT_TO = 'info@risendust.com';
const DEFAULT_FROM = 'Risen Dust <risendust@mail.tvserviceschicago.com>';

// Mirrors the guidance shown next to the form when sending fails, so a
// visitor is never stranded without a way to reach us.
const FALLBACK_ERROR =
  'Something went wrong sending your note. Email info@risendust.com and I’ll take it from there.';

const clean = (value, max) =>
  (typeof value === 'string' ? value.trim() : '').slice(0, max);

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') {
    return json({ ok: false, error: 'Method not allowed.' }, 405);
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, error: 'Could not read the form submission.' }, 400);
  }

  // Honeypot: humans never see this field, so a filled value is a bot.
  // Report success so the bot has nothing to learn from.
  if (clean(form.get('_gotcha'), 100)) return json({ ok: true });

  const name = clean(form.get('name'), 120);
  const business = clean(form.get('business'), 160);
  const email = clean(form.get('email'), 200);
  const phone = clean(form.get('phone'), 40);
  const service = clean(form.get('service'), 80);
  const message = clean(form.get('message'), 5000);
  const source = clean(form.get('source'), 120);

  if (!name || !email || !message) {
    return json({ ok: false, error: 'Please fill in your name, email, and message.' }, 422);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok: false, error: 'That email address doesn’t look right.' }, 422);
  }
  if (message.length < 20) {
    return json({ ok: false, error: 'Tell me a little more — a couple of sentences is plenty.' }, 422);
  }

  if (!env.RESEND_API_KEY) {
    console.error('contact: RESEND_API_KEY is not set on the portfolio Pages project');
    return json({ ok: false, error: FALLBACK_ERROR }, 503);
  }

  const lines = [`Name: ${name}`];
  if (business) lines.push(`Business: ${business}`);
  lines.push(`Email: ${email}`);
  if (phone) lines.push(`Phone: ${phone}`);
  if (service) lines.push(`Looking for: ${service}`);
  if (source) lines.push(`Sent from: ${source}`);
  lines.push('', message);

  const to = clean(env.CONTACT_TO, 200) || DEFAULT_TO;

  let res;
  try {
    res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: clean(env.CONTACT_FROM, 200) || DEFAULT_FROM,
        to: to.split(',').map((address) => address.trim()).filter(Boolean),
        reply_to: email,
        subject: `New project inquiry from ${name}`,
        text: lines.join('\n'),
      }),
    });
  } catch (err) {
    console.error(`contact: Resend request failed: ${err.message}`);
    return json({ ok: false, error: FALLBACK_ERROR }, 502);
  }

  if (!res.ok) {
    console.error(`contact: Resend rejected the send: ${res.status} ${await res.text()}`);
    return json({ ok: false, error: FALLBACK_ERROR }, 502);
  }

  return json({ ok: true });
}
