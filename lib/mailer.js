/**
 * Outgoing email for the shop — password reset links (fix-batch-26).
 *
 * Provider: SendGrid (free tier, 100 emails/day). Needs two Render env vars:
 *   SENDGRID_API_KEY — SendGrid API key (never in chat, never in the repo)
 *   MAIL_FROM_EMAIL  — verified sender, e.g. Pyae's Gmail after SendGrid
 *                      Single Sender Verification (no DNS changes needed)
 *   MAIL_FROM_NAME   — optional, defaults to 'Beauty & Me'
 *
 * When the key is missing the mailer does NOT throw — it logs the reset link
 * so the flow still works in local testing, and the API tells the frontend
 * mail is not configured so the customer is shown the call/Messenger
 * fallback instead of a silent dead end.
 */
'use strict';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const MAIL_FROM_EMAIL = process.env.MAIL_FROM_EMAIL || '';
const MAIL_FROM_NAME = process.env.MAIL_FROM_NAME || 'Beauty & Me';

function isMailConfigured() {
  return Boolean(SENDGRID_API_KEY && MAIL_FROM_EMAIL);
}

function mailerStatus() {
  if (SENDGRID_API_KEY && MAIL_FROM_EMAIL) return 'configured';
  if (SENDGRID_API_KEY && !MAIL_FROM_EMAIL) return 'missing_from';
  return 'not_configured';
}

/**
 * Send a password-reset email. Returns { sent: true } on success,
 * { sent: false, reason } when mail is not configured or SendGrid rejects.
 * The reset URL is always logged (without the recipient's password, of
 * course — the URL is the only secret here and it expires in 1 hour).
 */
async function sendResetEmail({ to, name, resetUrl }) {
  if (!isMailConfigured()) {
    console.log(`[mailer] MAIL NOT CONFIGURED (${mailerStatus()}) — reset link for ${to}: ${resetUrl}`);
    return { sent: false, reason: mailerStatus() };
  }
  const subject = 'Beauty & Me — Password ပြန်ယူမယ် / Reset your password';
  const text =
    `မင်္ဂလာပါ ${name || ''},\n\n` +
    `Beauty & Me အကောင့် Password ပြန်ယူဖို့ အောက်က link ကို နှိပ်ပါ — link က ၁ နာရီပဲ ခံပါတယ်။\n\n` +
    `${resetUrl}\n\n` +
    `ဒီ mail ကို သင် မတောင်းခဲ့ဘူးဆိုရင် လျစ်လျူရှုလိုက်ပါ — Password က ပြောင်းသွားမှာ မဟုတ်ပါဘူး။\n\n` +
    `Beauty & Me\n` +
    `---\n` +
    `Hello${name ? ' ' + name : ''},\n\n` +
    `Tap the link below to reset your Beauty & Me account password — the link expires in 1 hour.\n\n` +
    `${resetUrl}\n\n` +
    `If you did not ask for this, just ignore this email — your password will not change.`;
  const html =
    `<p>မင်္ဂလာပါ ${escapeHtml(name || '')},</p>` +
    `<p>Beauty &amp; Me အကောင့် Password ပြန်ယူဖို့ အောက်က ခလုတ်ကို နှိပ်ပါ — link က ၁ နာရီပဲ ခံပါတယ်။</p>` +
    `<p><a href="${escapeHtml(resetUrl)}" style="display:inline-block;padding:12px 24px;background:#D7427E;color:#fff;border-radius:999px;text-decoration:none;font-weight:bold">Password အသစ် ချိန်းမယ်</a></p>` +
    `<p style="color:#666;font-size:13px">Link အလုပ်မလုပ်ရင် ဒါကို copy ကူးပြီး browser မှာ ဖွင့်ပါ:<br>${escapeHtml(resetUrl)}</p>` +
    `<p style="color:#666;font-size:13px">ဒီ mail ကို သင် မတောင်းခဲ့ဘူးဆိုရင် လျစ်လျူရှုလိုက်ပါ — Password က ပြောင်းသွားမှာ မဟုတ်ပါဘူး။</p>` +
    `<p style="color:#666;font-size:13px">Hello${name ? ' ' + escapeHtml(name) : ''} — tap the button above to reset your Beauty &amp; Me password. The link expires in 1 hour. If you did not ask for this, just ignore this email.</p>`;
  try {
    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: MAIL_FROM_EMAIL, name: MAIL_FROM_NAME },
        subject,
        content: [
          { type: 'text/plain', value: text },
          { type: 'text/html', value: html },
        ],
      }),
    });
    if (res.status === 202) return { sent: true };
    const body = await res.text().catch(() => '');
    console.log(`[mailer] SendGrid rejected the reset email for ${to}: HTTP ${res.status} ${body.slice(0, 300)}`);
    return { sent: false, reason: 'sendgrid_' + res.status };
  } catch (err) {
    console.log(`[mailer] SendGrid request failed for ${to}: ${err.message}`);
    return { sent: false, reason: 'send_failed' };
  }
}

function escapeHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

module.exports = { isMailConfigured, mailerStatus, sendResetEmail };
