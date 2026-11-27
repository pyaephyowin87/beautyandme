/**
 * Staff push notifications via Firebase Cloud Messaging (fix-batch-29).
 *
 * Server-side sender for new-order alerts to staff phones. Uses the
 * firebase-admin SDK with a service-account key from the Render env var:
 *   FIREBASE_SERVICE_ACCOUNT — the whole service-account JSON (from
 *   Firebase console > Project settings > Service accounts > Generate
 *   new private key), pasted as ONE env var value. NEVER in chat,
 *   never in the repo — it is a full credential.
 *
 * The Firebase project is 'BM APP' (bm-app-13352), already holding the
 * Android + iOS apps for com.mstoreapp.ionic1647153158255.
 *
 * Safety: the SDK is required LAZILY and only when a send is attempted,
 * so a missing package, a missing env var, or a bad key can NEVER throw
 * at boot or crash the shop — every failure path returns
 * { sent: false, reason } instead. The order flow wraps the send too,
 * so a push failure can never fail an order.
 */
'use strict';

let admin = null; // firebase-admin module, required lazily
let app = null; // initialized Firebase app
let initError = null; // set once when config is missing/invalid

function isPushConfigured() {
  return Boolean(process.env.FIREBASE_SERVICE_ACCOUNT);
}

function pushStatus() {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) return 'not_configured';
  if (initError) return initError;
  return app ? 'configured' : 'unknown';
}

// Parse the service-account JSON and initialise the Admin SDK once.
// Returns the app, or null (with initError set) when unusable.
function getApp() {
  if (app) return app;
  if (initError) return null;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT || '';
  if (!raw) {
    initError = 'not_configured';
    return null;
  }
  let creds;
  try {
    creds = JSON.parse(raw);
  } catch (e) {
    initError = 'invalid_config';
    console.log('[push] FIREBASE_SERVICE_ACCOUNT is not valid JSON — push disabled');
    return null;
  }
  if (!creds || typeof creds !== 'object' || !creds.project_id || !creds.private_key || !creds.client_email) {
    initError = 'invalid_config';
    console.log('[push] FIREBASE_SERVICE_ACCOUNT is missing project_id / private_key / client_email — push disabled');
    return null;
  }
  try {
    admin = require('firebase-admin');
    app = admin.initializeApp({ credential: admin.credential.cert(creds) });
  } catch (err) {
    initError = 'init_failed';
    console.log(`[push] Firebase Admin init failed: ${err.message} — push disabled`);
    return null;
  }
  return app;
}

// FCM error codes that mean the token is dead and should be pruned:
// the app was uninstalled, or the token was never valid.
const DEAD_TOKEN_CODES = new Set([
  'messaging/invalid-registration-token',
  'messaging/registration-token-not-registered',
]);

// App icon badge (fix-batch-32, Viber-style red number): the launcher
// badge is set from the FCM message itself — iOS via aps.badge, Android
// via android.notification.notificationCount. A badge is only attached
// when the caller supplies one (badge == null means "no badge field"),
// so sends without a badge are byte-for-byte what earlier batches sent.
// Badge 0 is a real value (clear the badge), never treated as "absent".
function badgeOverrides(badge) {
  if (badge == null || !Number.isFinite(Number(badge))) return {};
  const n = Math.max(0, Math.floor(Number(badge)));
  return {
    apns: { payload: { aps: { badge: n } } },
    android: { notification: { notificationCount: n } },
  };
}

function invalidTokensFrom(res, list) {
  const invalidTokens = [];
  (res.responses || []).forEach((r, i) => {
    if (!r.success && r.error && DEAD_TOKEN_CODES.has(r.error.code)) invalidTokens.push(list[i]);
  });
  return invalidTokens;
}

function sendFailure(err) {
  // FCM errors carry a code (e.g. app/invalid-credential) and a short
  // message — no credential or token values. Return both so the Manage
  // test-push diagnostic can say plainly WHY the send failed.
  const detail = String((err && err.message) || 'unknown error').slice(0, 200);
  console.log(`[push] FCM send failed: ${detail}`);
  return { sent: false, reason: 'send_failed', detail };
}

/**
 * Send one notification to many staff device tokens.
 * Options: { title, body, data, badge } — badge is the app icon badge
 * count for EVERY token in this send (callers group tokens per recipient
 * when counts differ). Returns { sent: true, successCount, failureCount,
 * invalidTokens } on a completed FCM call, or { sent: false, reason }
 * when nothing could be sent (not configured / no tokens / FCM rejected
 * the call). invalidTokens lists tokens FCM reports as dead — the caller
 * prunes them.
 */
async function sendToStaff(tokens, { title, body, data, badge } = {}) {
  const list = (Array.isArray(tokens) ? tokens : []).filter((t) => typeof t === 'string' && t.length > 0);
  if (list.length === 0) return { sent: false, reason: 'no_tokens' };
  const a = getApp();
  if (!a) return { sent: false, reason: initError || 'not_configured' };
  try {
    const res = await admin.messaging().sendEachForMulticast({
      tokens: list,
      notification: { title: title || 'Beauty & Me', body: body || '' },
      data: data || {},
      ...badgeOverrides(badge),
    });
    const invalidTokens = invalidTokensFrom(res, list);
    if (res.failureCount > 0) {
      console.log(`[push] FCM multicast: ${res.successCount} sent, ${res.failureCount} failed`);
    }
    return { sent: true, successCount: res.successCount, failureCount: res.failureCount, invalidTokens };
  } catch (err) {
    return sendFailure(err);
  }
}

/**
 * Silent badge-only update (fix-batch-32): sets the app icon badge to
 * `badge` without showing anything — used to CLEAR the badge (badge 0)
 * after the user has read all their notifications inside the app.
 * Data-only message: no `notification` field, so Android posts nothing
 * and the fb31 foreground listener shows no banner (it only shows one
 * when a title or body exists). iOS gets a background push
 * (apns-push-type: background + content-available) so the badge updates
 * even with the app closed. Same { sent, reason } shape as sendToStaff;
 * never throws.
 */
async function sendBadgeUpdate(tokens, badge) {
  const list = (Array.isArray(tokens) ? tokens : []).filter((t) => typeof t === 'string' && t.length > 0);
  if (list.length === 0) return { sent: false, reason: 'no_tokens' };
  const a = getApp();
  if (!a) return { sent: false, reason: initError || 'not_configured' };
  const n = Math.max(0, Math.floor(Number(badge) || 0));
  try {
    const res = await admin.messaging().sendEachForMulticast({
      tokens: list,
      data: { type: 'badge_clear' },
      apns: { headers: { 'apns-push-type': 'background' }, payload: { aps: { 'content-available': 1, badge: n } } },
      android: { notification: { notificationCount: n } },
    });
    const invalidTokens = invalidTokensFrom(res, list);
    if (res.failureCount > 0) {
      console.log(`[push] FCM badge update: ${res.successCount} sent, ${res.failureCount} failed`);
    }
    return { sent: true, successCount: res.successCount, failureCount: res.failureCount, invalidTokens };
  } catch (err) {
    return sendFailure(err);
  }
}

module.exports = { isPushConfigured, pushStatus, sendToStaff, sendBadgeUpdate };
