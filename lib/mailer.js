/**
 * Outgoing email for the shop — password reset links (fix-batch-26,
 * provider switched to Gmail SMTP 2026-11-27: Twilio/SendGrid signup
 * phone verification refuses Myanmar, Taiwan AND Thailand numbers,
 * so SendGrid is unusable for Pyae; Resend needs DNS records his
 * brother has no time to add).
 *
 * Provider: Gmail SMTP via nodemailer (free, 500 emails/day for a
 * regular Gmail account). Needs two Render env vars:
 *   GMAIL_APP_PASSWORD — 16-char App Password for the shop Gmail
 *                        (Google Account > Security > 2-Step Verification
 *                        > App passwords; NEVER in chat, never in repo.
 *                        Spaces in the shown code are stripped here.)
 *   MAIL_FROM_EMAIL    — the shop Gmail itself, beautyandme117@gmail.com
 *                        (SMTP login + From address must match)
 *   MAIL_FROM_NAME     — optional, defaults to 'Beauty & Me'
 *
 * NOTE: changing the Gmail account password revokes App Passwords —
 * generate a fresh one and update the Render env var if that happens.
 *
 * When the password is missing the mailer does NOT throw — it logs the
 * reset link so the flow still works in local testing, and the API tells
 * the frontend mail is not configured so the customer is shown the
 * call/Messenger fallback instead of a silent dead end.
 */
'use strict';

const nodemailer = require('nodemailer');

const MAIL_FROM_EMAIL = process.env.MAIL_FROM_EMAIL || '';
const MAIL_FROM_NAME = process.env.MAIL_FROM_NAME || 'Beauty & Me';
// App Passwords display as "abcd efgh ijkl mnop" — Gmail accepts the
// code with or without spaces; strip them so either paste works.
const GMAIL_APP_PASSWORD = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');
// Host/port overrides exist only so the send path can be tested against
// a test SMTP server (e.g. Ethereal); production always uses Gmail.
const SMTP_HOST = process.env.MAIL_SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.MAIL_SMTP_PORT || '465', 10);
const SMTP_SECURE = process.env.MAIL_SMTP_SECURE
  ? process.env.MAIL_SMTP_SECURE !== 'false'
  : SMTP_PORT === 465;

let transporter = null;

// Fix-batch-54: remember the last send attempt (reset mail or test mail)
// so Manage can SHOW what Gmail actually said instead of guessing.
// In-memory only — a redeploy clears it, which is fine for a diagnostic.
let lastSend = null; // {at, kind, to, sent, reason, messageId}
function recordSend(entry) {
  lastSend = Object.assign({ at: new Date().toISOString() }, entry);
}
function lastSendResult() { return lastSend; }
function mailFromEmail() { return MAIL_FROM_EMAIL; }

function isMailConfigured() {
  return Boolean(GMAIL_APP_PASSWORD && MAIL_FROM_EMAIL);
}

function mailerStatus() {
  if (GMAIL_APP_PASSWORD && MAIL_FROM_EMAIL) return 'configured';
  if (GMAIL_APP_PASSWORD && !MAIL_FROM_EMAIL) return 'missing_from';
  return 'not_configured';
}

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: { user: MAIL_FROM_EMAIL, pass: GMAIL_APP_PASSWORD },
    });
  }
  return transporter;
}

/**
 * Send a password-reset email. Returns { sent: true } on success,
 * { sent: false, reason } when mail is not configured or Gmail rejects.
 * The reset URL is always logged (without the recipient's password, of
 * course — the URL is the only secret here and it expires in 1 hour).
 */
async function sendResetEmail({ to, name, resetUrl }) {
  if (!isMailConfigured()) {
    console.log(`[mailer] MAIL NOT CONFIGURED (${mailerStatus()}) — reset link for ${to}: ${resetUrl}`);
    recordSend({ kind: 'reset', to, sent: false, reason: mailerStatus() });
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
    const info = await getTransporter().sendMail({
      from: `"${MAIL_FROM_NAME}" <${MAIL_FROM_EMAIL}>`,
      to,
      subject,
      text,
      html,
    });
    console.log(`[mailer] reset email sent to ${to} (${info.messageId || 'no-id'})`);
    recordSend({ kind: 'reset', to, sent: true, messageId: info.messageId || null });
    return { sent: true };
  } catch (err) {
    console.log(`[mailer] Gmail SMTP failed for ${to}: ${err.message}`);
    recordSend({ kind: 'reset', to, sent: false, reason: 'send_failed', detail: String(err.message || err) });
    return { sent: false, reason: 'send_failed' };
  }
}

/**
 * Fix-batch-54: send a test mail to the shop Gmail itself (the From
 * address), so Manage can prove whether Gmail SMTP works right now.
 * Returns the same shape as sendResetEmail; the attempt is recorded
 * as the last send, with kind 'test'.
 */
async function sendTestEmail() {
  const to = MAIL_FROM_EMAIL;
  if (!isMailConfigured()) {
    recordSend({ kind: 'test', to, sent: false, reason: mailerStatus() });
    return { sent: false, reason: mailerStatus() };
  }
  try {
    const info = await getTransporter().sendMail({
      from: `"${MAIL_FROM_NAME}" <${MAIL_FROM_EMAIL}>`,
      to,
      subject: 'Beauty & Me — Email test / စမ်းသပ်ပို့ခြင်း',
      text: 'Beauty & Me shop email test — Gmail SMTP is working.\n\nBeauty & Me ဆိုင် email စမ်းသပ်ခြင်း — Gmail SMTP အလုပ်လုပ်နေပါတယ်။',
    });
    console.log(`[mailer] test email sent to ${to} (${info.messageId || 'no-id'})`);
    recordSend({ kind: 'test', to, sent: true, messageId: info.messageId || null });
    return { sent: true };
  } catch (err) {
    console.log(`[mailer] test email failed for ${to}: ${err.message}`);
    recordSend({ kind: 'test', to, sent: false, reason: 'send_failed', detail: String(err.message || err) });
    return { sent: false, reason: 'send_failed' };
  }
}

function escapeHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

module.exports = { isMailConfigured, mailerStatus, sendResetEmail, sendTestEmail, lastSendResult, mailFromEmail };
