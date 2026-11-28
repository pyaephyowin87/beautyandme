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
// Fix-batch-56: port 587 STARTTLS (was 465). The 465 connection from
// Render hangs for minutes at a time ("Connection timeout", tried 3x,
// live 2026-11-28) while the same account works seconds later — 587 is
// Gmail's other port and may route differently. secure=false on 587
// means STARTTLS (encrypted after EHLO); true only on 465.
const SMTP_PORT = parseInt(process.env.MAIL_SMTP_PORT || '587', 10);
const SMTP_SECURE = process.env.MAIL_SMTP_SECURE
  ? process.env.MAIL_SMTP_SECURE !== 'false'
  : SMTP_PORT === 465;

// Fix-batch-57: Gmail API (OAuth 2.0) over HTTPS — the reliable path.
// SMTP from Render to Gmail is sustained-blocked since 2026-11-28 16:08
// (5 attempts on both ports all "Connection timeout"), while HTTPS works
// fine. These three values come from Pyae's own Google account (OAuth
// consent, refresh token via the OAuth Playground) and live in Render
// env — never in chat. When they are present the API is tried first and
// SMTP stays as a fallback; when absent, SMTP-only behaviour is unchanged.
const GMAIL_OAUTH_CLIENT_ID = process.env.GMAIL_OAUTH_CLIENT_ID || '';
const GMAIL_OAUTH_CLIENT_SECRET = process.env.GMAIL_OAUTH_CLIENT_SECRET || '';
const GMAIL_OAUTH_REFRESH_TOKEN = process.env.GMAIL_OAUTH_REFRESH_TOKEN || '';
// URL overrides exist only for tests (a local fake Gmail API server).
const GMAIL_API_BASE = (process.env.GMAIL_API_BASE || 'https://gmail.googleapis.com').replace(/\/+$/, '');
const GMAIL_OAUTH_TOKEN_URL = process.env.GMAIL_OAUTH_TOKEN_URL || 'https://oauth2.googleapis.com/token';

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

function apiConfigured() {
  return Boolean(GMAIL_OAUTH_CLIENT_ID && GMAIL_OAUTH_CLIENT_SECRET && GMAIL_OAUTH_REFRESH_TOKEN);
}
function smtpConfigured() {
  return Boolean(GMAIL_APP_PASSWORD && MAIL_FROM_EMAIL);
}
// Which transport will be tried first: 'gmail-api', 'smtp', or 'none'.
function mailMode() {
  if (apiConfigured()) return 'gmail-api';
  if (smtpConfigured()) return 'smtp';
  return 'none';
}
function isMailConfigured() {
  return apiConfigured() || smtpConfigured();
}

function mailerStatus() {
  if (isMailConfigured()) return 'configured';
  if ((GMAIL_APP_PASSWORD || GMAIL_OAUTH_REFRESH_TOKEN) && !MAIL_FROM_EMAIL) return 'missing_from';
  return 'not_configured';
}

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: { user: MAIL_FROM_EMAIL, pass: GMAIL_APP_PASSWORD },
      // Fix-batch-55: the SMTP connection from Render is intermittent —
      // sometimes instant, sometimes hanging the full 2-min default
      // timeout ("Connection timeout", seen live 2026-11-28). Fail fast
      // instead of hanging, and keep a small pool of warm connections so
      // a later send can reuse one.
      pool: true,
      maxConnections: 2,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
    });
  }
  return transporter;
}

// Fix-batch-55/56: send with retries for CONNECTION problems only (hangs,
// resets, refusals — the flaky-Render kind). Auth/recipient errors fail
// at once: retrying a wrong password never helps.
// Fix-batch-56: 5 attempts spread over ~2 min (delays 5s/15s/30s/60s).
// The bad window outlasted fb55's 3 quick attempts (live 2026-11-28:
// "tried 3x" all timed out, a tap a minute later worked). Delays are
// env-overridable for tests (MAIL_RETRY_DELAYS_MS, comma list).
// Nodemailer timeout errors say "Connection timeout", "Greeting never
// received" or "Socket timeout" (code ETIMEDOUT) — match those too, or
// the retry never fires for the exact failure seen live.
function isRetryableMailError(err) {
  const code = String((err && err.code) || '');
  if (/^(ETIMEDOUT|ECONNRESET|ECONNREFUSED|ENOTFOUND|EPIPE|ESOCKET)$/.test(code)) return true;
  const msg = String((err && err.message) || err || '');
  return /timeout|timed out|greeting never received|socket timeout|ECONNRESET|ECONNREFUSED|ETIMEDOUT|ENOTFOUND|EPIPE|socket hang up|Connection/i.test(msg);
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function retryDelays() {
  const fromEnv = (process.env.MAIL_RETRY_DELAYS_MS || '').split(',').map((s) => parseInt(s, 10)).filter((n) => n > 0);
  return fromEnv.length ? fromEnv : [5000, 15000, 30000, 60000];
}
async function sendMailWithRetry(mailOptions) {
  const delays = retryDelays();
  const maxAttempts = delays.length + 1;
  let lastErr = null;
  let made = 0;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    made = attempt;
    try {
      const info = await getTransporter().sendMail(mailOptions);
      return { info, attempts: attempt };
    } catch (err) {
      lastErr = err;
      if (!isRetryableMailError(err) || attempt === maxAttempts) break;
      console.log(`[mailer] send attempt ${attempt} failed (${err.message}) — retrying…`);
      await sleep(delays[attempt - 1]);
    }
  }
  const err = new Error(String((lastErr && lastErr.message) || lastErr || 'send failed'));
  err.attempts = made;
  throw err;
}

// ---------- Gmail API (fix-batch-57) ----------
// Sends through https://gmail.googleapis.com instead of SMTP, so a
// blocked SMTP route cannot stop the mail. No new dependency — plain
// fetch (Node 18+). The access token is cached in memory until shortly
// before it expires; a 401 clears it and retries once with a fresh one.
let apiToken = null; // { token, expiresAt }
async function getApiAccessToken(forceRefresh) {
  if (!forceRefresh && apiToken && apiToken.expiresAt > Date.now()) return apiToken.token;
  const res = await fetch(GMAIL_OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GMAIL_OAUTH_CLIENT_ID,
      client_secret: GMAIL_OAUTH_CLIENT_SECRET,
      refresh_token: GMAIL_OAUTH_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
    signal: AbortSignal.timeout(15000),
  });
  const body = await res.text();
  if (!res.ok) {
    if (/invalid_grant/.test(body)) throw new Error('Gmail API login expired (invalid_grant) — reconnect in Google');
    throw new Error(`Gmail API login failed (${res.status})`);
  }
  const data = JSON.parse(body);
  apiToken = { token: data.access_token, expiresAt: Date.now() + Math.max(0, (data.expires_in || 3600) - 60) * 1000 };
  return apiToken.token;
}
function base64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function buildRawMessage({ from, to, subject, text, html }) {
  const boundary = 'bm-' + Math.random().toString(36).slice(2);
  const encSubject = '=?UTF-8?B?' + Buffer.from(subject || '', 'utf8').toString('base64') + '?=';
  let msg = `From: ${from}\r\nTo: ${to}\r\nSubject: ${encSubject}\r\nMIME-Version: 1.0\r\n`;
  if (html) {
    msg += `Content-Type: multipart/alternative; boundary="${boundary}"\r\n\r\n` +
      `--${boundary}\r\nContent-Type: text/plain; charset="UTF-8"\r\nContent-Transfer-Encoding: base64\r\n\r\n` +
      Buffer.from(text || '', 'utf8').toString('base64') + `\r\n` +
      `--${boundary}\r\nContent-Type: text/html; charset="UTF-8"\r\nContent-Transfer-Encoding: base64\r\n\r\n` +
      Buffer.from(html, 'utf8').toString('base64') + `\r\n--${boundary}--\r\n`;
  } else {
    msg += `Content-Type: text/plain; charset="UTF-8"\r\nContent-Transfer-Encoding: base64\r\n\r\n` +
      Buffer.from(text || '', 'utf8').toString('base64') + `\r\n`;
  }
  return base64url(msg);
}
async function sendViaGmailApi(mailOptions) {
  // Up to 3 attempts: a stale pooled socket can fail the first fetch
  // with "fetch failed" (undici reuses a dead keep-alive connection —
  // seen in tests when the server restarts), and a 401 costs one
  // attempt for the token refresh. Both are retried inside this loop.
  let lastErr = null;
  let refreshed = false;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const token = await getApiAccessToken(false);
      const res = await fetch(`${GMAIL_API_BASE}/gmail/v1/users/me/messages/send`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw: buildRawMessage(mailOptions) }),
        signal: AbortSignal.timeout(15000),
      });
      if (res.status === 401 && !refreshed) {
        await res.text().catch(() => {});
        apiToken = null;
        refreshed = true;
        continue;
      }
      const body = await res.text();
      if (!res.ok) throw new Error(`Gmail API ${res.status}: ${body.slice(0, 120)}`);
      const data = JSON.parse(body);
      return { messageId: data.id || null, attempts: attempt };
    } catch (err) {
      lastErr = err;
      if (attempt === 3) break;
      const retryable = /fetch failed|timeout|socket hang up|ECONNRESET|5\d\d|401/.test(String(err.message || err));
      if (!retryable) break;
      console.log(`[mailer] Gmail API attempt ${attempt} failed (${err.message}) — retrying…`);
      await sleep(3000);
    }
  }
  throw lastErr || new Error('Gmail API send failed');
}

// Unified send: Gmail API first when configured, SMTP as fallback.
// Returns { via, messageId, attempts }. Throws only when every
// configured transport failed; the error message names what was tried.
async function sendMail(mailOptions) {
  const errors = [];
  let attempts = 0;
  if (apiConfigured()) {
    try {
      const r = await sendViaGmailApi(mailOptions);
      return { via: 'gmail-api', messageId: r.messageId, attempts: r.attempts };
    } catch (err) {
      errors.push(`Gmail API: ${err.message}`);
      attempts += 1;
      console.log(`[mailer] Gmail API failed: ${err.message} — falling back to SMTP…`);
    }
  }
  if (smtpConfigured()) {
    try {
      const r = await sendMailWithRetry(mailOptions);
      return { via: 'smtp', messageId: r.info.messageId || null, attempts: attempts + r.attempts };
    } catch (err) {
      errors.push(`SMTP: ${err.message}`);
      const e = new Error(errors.join(' | ').slice(0, 300));
      e.attempts = attempts + (err.attempts || 1);
      throw e;
    }
  }
  const e = new Error(errors.join(' | ').slice(0, 300) || 'send failed');
  e.attempts = attempts || 1;
  throw e;
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
    const { via, messageId, attempts } = await sendMail({
      from: `"${MAIL_FROM_NAME}" <${MAIL_FROM_EMAIL}>`,
      to,
      subject,
      text,
      html,
    });
    console.log(`[mailer] reset email sent to ${to} via ${via} (${messageId || 'no-id'})`);
    recordSend({ kind: 'reset', to, sent: true, via, messageId: messageId || null, attempts });
    return { sent: true };
  } catch (err) {
    const detail = String(err.message || err) + ((err.attempts || 1) > 1 ? ` (tried ${err.attempts}×)` : '');
    console.log(`[mailer] mail failed for ${to}: ${detail}`);
    recordSend({ kind: 'reset', to, sent: false, reason: 'send_failed', detail, attempts: err.attempts || 1 });
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
    const { via, messageId, attempts } = await sendMail({
      from: `"${MAIL_FROM_NAME}" <${MAIL_FROM_EMAIL}>`,
      to,
      subject: 'Beauty & Me — Email test / စမ်းသပ်ပို့ခြင်း',
      text: 'Beauty & Me shop email test — mail sending is working.\n\nBeauty & Me ဆိုင် email စမ်းသပ်ခြင်း — mail ပို့တာ အလုပ်လုပ်နေပါတယ်။',
    });
    console.log(`[mailer] test email sent to ${to} via ${via} (${messageId || 'no-id'})`);
    recordSend({ kind: 'test', to, sent: true, via, messageId: messageId || null, attempts });
    return { sent: true };
  } catch (err) {
    const detail = String(err.message || err) + ((err.attempts || 1) > 1 ? ` (tried ${err.attempts}×)` : '');
    console.log(`[mailer] test email failed for ${to}: ${detail}`);
    recordSend({ kind: 'test', to, sent: false, reason: 'send_failed', detail, attempts: err.attempts || 1 });
    return { sent: false, reason: 'send_failed' };
  }
}

function escapeHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

module.exports = { isMailConfigured, mailerStatus, mailMode, sendResetEmail, sendTestEmail, lastSendResult, mailFromEmail };
