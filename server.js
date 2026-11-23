/**
 * Beauty & Me shop — standalone backend (Node 20 + Express).
 *
 * Serves public/ static files + JSON API under /api.
 * Storage: JSON files in data/ by default; Postgres when DATABASE_URL is set
 * (see lib/store.js). POS prices are the source of truth — order totals are
 * always computed server-side, never trusted from the client.
 *
 * Business rules (Pyae's decisions):
 *  - Stock QUANTITY is never shown to customers — only in_stock boolean.
 *    Quantities appear only in Manage responses.
 *  - POS controls stock: placing an order does NOT change product stock.
 *  - Delivery fee is NEVER added to the order total — customer pays the
 *    courier on delivery (or picks up in store).
 *  - Bank transfer orders REQUIRE a payment screenshot before placing.
 *  - Manage is gated to Pyae's personal phone 095117366.
 *  - WooCommerce access is READ-ONLY. Never write to WooCommerce.
 *  - Product photos live in this shop's own database (images table), served
 *    via GET /api/images/:id — migrated from WooCommerce so customer photos
 *    no longer depend on the old WordPress site being up.
 */
'use strict';

const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const store = require('./lib/store');

const app = express();
const PORT = process.env.PORT || 3000;
const MANAGER_PHONE = '095117366';
const SHOP_PHONE = '09765117366';
const OFFICIAL_BRANDS = ['COSRX', 'ANUA', 'KUNDAL', 'P.CALM', 'BEBREEZE'];

app.use(express.json({ limit: '3mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ---------- helpers ----------

function normalizePhone(raw) {
  if (raw == null) return '';
  let p = String(raw).replace(/[\s-]/g, '');
  if (p.startsWith('+959')) p = '0' + p.slice(3);
  else if (p.startsWith('959')) p = '0' + p.slice(2);
  return p;
}

function isValidMyanmarPhone(phone) {
  return /^09\d{7,9}$/.test(phone);
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, hash] = stored.split(':');
  const test = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(test, 'hex'));
}

function newToken() {
  return crypto.randomBytes(32).toString('hex');
}

async function publicUser(user) {
  return { id: user.id, name: user.name, phone: user.phone, is_manager: await isManagerPhone(user.phone), is_sale_staff: await isSaleStaffPhone(user.phone), is_owner: user.phone === MANAGER_PHONE };
}

// Product type, derived from the product name. The POS category field is
// inconsistent (sometimes a brand name, sometimes a type, sometimes both
// spellings of the same type), so the name is the primary signal and the
// category is only a fallback. Validated against the full 402-product
// catalog 2026-11-19: every product lands in a sensible type; only 5 fall
// to 'other' (edible supplements with no beauty type).
const PRODUCT_TYPE_ORDER = ['cleanser', 'toner', 'serum', 'ampoule', 'moisturizer', 'sunscreen', 'mask', 'lip', 'eye', 'hair', 'body', 'makeup', 'treatment', 'sets', 'accessory', 'other'];
const PRODUCT_TYPE_LABELS = { cleanser: 'Cleanser', toner: 'Toner', serum: 'Serum & Essence', ampoule: 'Ampoule', moisturizer: 'Moisturizer', sunscreen: 'Sunscreen', mask: 'Mask & Pack', lip: 'Lip Care', eye: 'Eye Care', hair: 'Hair Care', body: 'Body Care', makeup: 'Makeup', treatment: 'Treatment', sets: 'Sets & Gifts', accessory: 'Accessory', other: 'Other' };
const PRODUCT_CATEGORY_TYPE = {
  'serum & essence': 'serum', serum: 'serum', toner: 'toner', mist: 'toner',
  moisturizer: 'moisturizer', cream: 'moisturizer', lotion: 'moisturizer',
  'lip care': 'lip', 'body care': 'body', 'body wash': 'body',
  'mask & pack': 'mask', mask: 'mask', cleansing: 'cleanser', 'facial foam': 'cleanser',
  sunscreen: 'sunscreen', suncream: 'sunscreen', shampoo: 'hair', 'hair serum': 'hair',
  'hair care': 'hair', treatment: 'hair', 'eye care': 'eye',
  'foundation & primer': 'makeup', foundation: 'makeup', 'make up': 'makeup',
  'foundation& primer': 'makeup', accessory: 'accessory', 'sets & gifts': 'sets',
  // Keys for the 16 clean type labels (Add Product category dropdown).
  cleanser: 'cleanser', ampoule: 'ampoule', makeup: 'makeup',
};
function deriveProductType(p) {
  const n = String(p.name || '').toLowerCase();
  const has = (...ws) => ws.some((w) => n.includes(w));
  if (has('skin tint')) return 'makeup';
  if (has('lip', 'tint')) return 'lip';
  if (has('eye')) return 'eye';
  if (has('shampoo', 'hair', 'scalp', 'treatment')) return 'hair';
  if (has('sunscreen', 'suncream', 'sun cream', 'spf')) return 'sunscreen';
  if (has('cleanser', 'cleansing', 'facial foam', 'face wash', 'foam')) return 'cleanser';
  if (has('mask', 'clay pack', 'clay')) return 'mask';
  if (has('ampoule')) return 'ampoule';
  if (has('toner', 'tonic', 'mist', 'pad', 'softener')) return 'toner';
  if (has('serum', 'essence', 'shot', 'booster')) return 'serum';
  if (has('moisturizer', 'cream', 'lotion', 'emulsion', 'gel', 'milk')) return 'moisturizer';
  if (has('foundation', 'primer', 'pact', 'cushion', 'blush', 'makeup', 'make up', 'eyeliner', 'eyebrow', 'mascara', 'eyeshadow', 'shadow', 'highlight', 'hightlight', 'cheek', 'liner', 'pencil', 'palette', 'powder', 'setting spray', 'concealer')) return 'makeup';
  if (has('patch', 'spot')) return 'treatment';
  if (has('perfume', 'deodorant', 'roll on', 'scent spray', 'scrub')) return 'body';
  if (has('body')) return 'body';
  if (has('cotton', 'towel', 'brush', 'bag', 'paper', 'sticker', 'accessory', 'massager')) return 'accessory';
  if (has('kit', 'gift') || /\bset\b/.test(n)) return 'sets';
  if (has('jelly', 'gummy', 'fiber')) return 'other';
  return PRODUCT_CATEGORY_TYPE[String(p.category || '').toLowerCase()] || 'other';
}

// Strip stock quantities from a product for customer-facing responses.
function publicProduct(p) {
  const out = {
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    category: p.category,
    product_type: deriveProductType(p),
    price: p.price,
    sale_price: p.sale_price ?? null,
    in_stock: p.in_stock,
    has_image: Boolean(p.image_url),
    image_url: p.image_url || null,
    is_new: Boolean(p.is_new),
    best_seller: Boolean(p.best_seller),
    sale_featured: Boolean(p.sale_featured),
    options: null,
  };
  if (p.note) out.note = p.note;
  if (Array.isArray(p.options)) {
    out.options = p.options.map((o) => ({
      label: o.label,
      price: o.price,
      in_stock: o.in_stock,
      sku: o.sku || null,
    }));
  }
  return out;
}

function maskSecret(value) {
  if (!value) return null;
  const s = String(value);
  return '••••' + s.slice(-4);
}

async function getWooConfig() {
  const saved = (await store.getSetting('woocommerce')) || {};
  return {
    site_url: saved.site_url || process.env.WC_SITE_URL || '',
    consumer_key: saved.consumer_key || process.env.WC_CONSUMER_KEY || '',
    consumer_secret: saved.consumer_secret || process.env.WC_CONSUMER_SECRET || '',
  };
}

async function wcFetch(wc, endpoint, timeoutMs) {
  const url = `${wc.site_url.replace(/\/$/, '')}/wp-json/wc/v3/${endpoint.replace(/^\//, '')}`;
  const auth = Buffer.from(`${wc.consumer_key}:${wc.consumer_secret}`).toString('base64');
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: ctrl.signal,
    });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

function normName(s) {
  return String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

// URL-safe id from a product name: 'ANUA Toner 200 ml' -> 'anua-toner-200-ml'.
function slugify(name) {
  return normName(name).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 120) || 'product';
}

// ---------- auth middleware ----------

async function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'unauthorized' });
  const users = await store.listUsers();
  const user = users.find((u) => u.token === token);
  if (!user) return res.status(401).json({ error: 'unauthorized' });
  if (user.token_expires_at && new Date(user.token_expires_at) < new Date()) {
    return res.status(401).json({ error: 'token_expired' });
  }
  req.user = user;
  return next();
}

// Extra managers (beyond the owner) live in settings key 'managers' — a list
// of phone numbers. Only the owner (MANAGER_PHONE) can add or remove them.
async function isManagerPhone(phone) {
  const p = normalizePhone(phone);
  if (p === MANAGER_PHONE) return true;
  const extra = (await store.getSetting('managers')) || [];
  return Array.isArray(extra) && extra.includes(p);
}

const ORDER_STATUSES = ['pending', 'confirmed', 'delivering', 'delivered', 'cancelled'];

function managerMiddleware(req, res, next) {
  return isManagerPhone(req.user && req.user.phone).then((ok) => {
    if (!ok) return res.status(403).json({ error: 'forbidden' });
    return next();
  }).catch(next);
}

// Sale staff (below manager): order work only — view orders, edit items /
// coupon, change status. They see nothing else in Manage. Like managers,
// they live in a settings list ('sale_staff') and only the owner adds/removes.
async function isSaleStaffPhone(phone) {
  const p = normalizePhone(phone);
  if (p === MANAGER_PHONE) return false;
  const extra = (await store.getSetting('sale_staff')) || [];
  return Array.isArray(extra) && extra.includes(p);
}

async function isOrderStaffPhone(phone) {
  return (await isManagerPhone(phone)) || (await isSaleStaffPhone(phone));
}

function orderStaffMiddleware(req, res, next) {
  return isOrderStaffPhone(req.user && req.user.phone).then((ok) => {
    if (!ok) return res.status(403).json({ error: 'forbidden' });
    return next();
  }).catch(next);
}

function ownerMiddleware(req, res, next) {
  if (!req.user || req.user.phone !== MANAGER_PHONE) {
    return res.status(403).json({ error: 'forbidden' });
  }
  return next();
}

// Activity log (owner only) — who changed what, when. Logging never
// breaks the action itself: any failure is swallowed and logged to console.
async function logActivity(req, action, targetType, targetId, details) {
  try {
    await store.saveActivity({
      id: `AL-${Date.now().toString(36)}-${Math.floor(1000 + Math.random() * 9000)}`,
      created_at: new Date().toISOString(),
      user_phone: req.user ? req.user.phone : null,
      user_name: req.user ? req.user.name : null,
      action,
      target_type: targetType || null,
      target_id: targetId || null,
      details: details || null,
    });
  } catch (e) { console.error('[activity] log failed', e && e.message); }
}

// Optional auth: attach req.user when a valid Bearer token is present.
async function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    const users = await store.listUsers();
    const user = users.find((u) => u.token === token);
    if (user && (!user.token_expires_at || new Date(user.token_expires_at) >= new Date())) {
      req.user = user;
    }
  }
  return next();
}

// ---------- public API ----------

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.get('/api/products', async (req, res, next) => {
  try {
    const { q = '', brand = '', section = '', type = '' } = req.query;
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
    let items = await store.listProducts();

    if (brand) items = items.filter((p) => normName(p.brand) === normName(brand));
    if (type) items = items.filter((p) => deriveProductType(p) === type);
    if (section === 'best') items = items.filter((p) => p.best_seller);
    else if (section === 'new') items = items.filter((p) => p.is_new);
    else if (section === 'sale') {
      items = items.filter((p) => p.sale_price != null && p.sale_price < p.price);
      // Featured sale items first, the rest keep their order.
      items.sort((a, b) => (b.sale_featured ? 1 : 0) - (a.sale_featured ? 1 : 0));
    }

    const keywords = String(q).toLowerCase().split(/\s+/).filter(Boolean);
    if (keywords.length) {
      items = items.filter((p) => {
        const hay = `${p.name} ${p.brand} ${p.category} ${deriveProductType(p)} ${(PRODUCT_TYPE_LABELS[deriveProductType(p)] || '')} ${(p.options || []).map((o) => o.label).join(' ')}`.toLowerCase();
        return keywords.every((k) => hay.includes(k));
      });
    }

    const total = items.length;
    const page = items.slice(offset, offset + limit).map(publicProduct);
    return res.json({ items: page, total });
  } catch (err) { return next(err); }
});

app.get('/api/products/:id', async (req, res, next) => {
  try {
    const p = await store.getProduct(req.params.id);
    if (!p) return res.status(404).json({ error: 'product_not_found' });
    return res.json(publicProduct(p));
  } catch (err) { return next(err); }
});

app.get('/api/types', async (_req, res, next) => {
  try {
    const counts = {};
    for (const p of await store.listProducts()) {
      const t = deriveProductType(p);
      counts[t] = (counts[t] || 0) + 1;
    }
    const out = PRODUCT_TYPE_ORDER
      .filter((t) => counts[t])
      .map((t) => ({ type: t, label: PRODUCT_TYPE_LABELS[t], count: counts[t] }));
    return res.json(out);
  } catch (err) { return next(err); }
});

// Categories for the Add Product form: the same 16 clean type labels the
// shop shows as type chips, always all 16 (even a 0-count type can be
// picked for a first product). Staff pick from the list; a free-text
// "new category" option covers anything outside it, so no typos create
// duplicate categories. Existing products keep their POS category values.
app.get('/api/categories', async (_req, res, next) => {
  try {
    const counts = {};
    for (const p of await store.listProducts()) {
      const t = deriveProductType(p);
      counts[t] = (counts[t] || 0) + 1;
    }
    const out = PRODUCT_TYPE_ORDER
      .map((t) => ({ type: t, label: PRODUCT_TYPE_LABELS[t], count: counts[t] || 0 }));
    return res.json(out);
  } catch (err) { return next(err); }
});

app.get('/api/brands', async (_req, res, next) => {
  try {
    const counts = {};
    for (const p of await store.listProducts()) {
      const b = p.brand || 'Other';
      counts[b] = (counts[b] || 0) + 1;
    }
    const out = [];
    for (const name of OFFICIAL_BRANDS) {
      if (counts[name]) { out.push({ name, count: counts[name] }); delete counts[name]; }
    }
    const rest = Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    return res.json([...out, ...rest]);
  } catch (err) { return next(err); }
});

app.post('/api/auth/register', async (req, res, next) => {
  try {
    const { name, phone, password } = req.body || {};
    const cleanPhone = normalizePhone(phone);
    if (!name || !String(name).trim()) return res.status(400).json({ error: 'name_required' });
    if (!isValidMyanmarPhone(cleanPhone)) return res.status(400).json({ error: 'invalid_phone' });
    if (!password || String(password).length < 4) return res.status(400).json({ error: 'password_too_short' });
    const existing = await store.getUserByPhone(cleanPhone);
    if (existing) return res.status(400).json({ error: 'phone_registered' });

    const token = newToken();
    const user = {
      id: crypto.randomBytes(8).toString('hex'),
      name: String(name).trim(),
      phone: cleanPhone,
      password_hash: hashPassword(String(password)),
      is_manager: cleanPhone === MANAGER_PHONE,
      token,
      token_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
    };
    await store.saveUser(user);
    return res.json({ token, user: await publicUser(user) });
  } catch (err) { return next(err); }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { phone, password } = req.body || {};
    const cleanPhone = normalizePhone(phone);
    const user = await store.getUserByPhone(cleanPhone);
    if (!user || !verifyPassword(String(password || ''), user.password_hash)) {
      return res.status(401).json({ error: 'invalid_credentials' });
    }
    user.token = newToken();
    user.token_expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    await store.saveUser(user);
    return res.json({ token: user.token, user: await publicUser(user) });
  } catch (err) { return next(err); }
});

app.get('/api/me', authMiddleware, async (req, res) => res.json({ user: await publicUser(req.user) }));

app.post('/api/auth/change-password', authMiddleware, async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body || {};
    if (!new_password || String(new_password).length < 4) return res.status(400).json({ error: 'password_too_short' });
    if (!verifyPassword(String(current_password || ''), req.user.password_hash)) {
      return res.status(401).json({ error: 'invalid_credentials' });
    }
    req.user.password_hash = hashPassword(String(new_password));
    await store.saveUser(req.user);
    return res.json({ ok: true });
  } catch (err) { return next(err); }
});

// ---------- Coupon scoping ----------
// A coupon may be limited to certain brands, certain products, and/or
// certain customers (by phone). An empty/missing scope list = applies to all.
function couponItemEligible(coupon, product) {
  if (!coupon || !product) return false;
  if (Array.isArray(coupon.brands) && coupon.brands.length && !coupon.brands.includes(product.brand)) return false;
  if (Array.isArray(coupon.products) && coupon.products.length && !coupon.products.includes(product.id)) return false;
  return true;
}
function couponCustomerEligible(coupon, phone) {
  if (!coupon) return false;
  if (Array.isArray(coupon.customers) && coupon.customers.length) {
    return coupon.customers.includes(normalizePhone(phone || ''));
  }
  return true;
}
// Discount is computed on the ELIGIBLE items only, never on the whole order.
// items: [{unit_price, qty, product}]
function couponDiscountFor(coupon, items) {
  const base = (items || []).filter((it) => couponItemEligible(coupon, it.product))
    .reduce((a, it) => a + it.unit_price * it.qty, 0);
  if (base <= 0) return { discount: 0, base: 0 };
  let d = 0;
  if (coupon.type === 'percent') d = Math.round((base * Number(coupon.value)) / 100);
  else d = Math.min(Number(coupon.value) || 0, base);
  return { discount: d, base };
}
// Attach resolved product names to coupons (for display only).
async function withCouponProductNames(list) {
  for (const c of list || []) {
    c.product_names = [];
    if (Array.isArray(c.products) && c.products.length) {
      for (const pid of c.products) {
        const pr = await store.getProduct(pid);
        if (pr) c.product_names.push(pr.name);
      }
    }
  }
  return list;
}

// Public coupon list — only active coupons, only what a customer needs
// to pick one (code + value). Private/expired coupons never appear here.
// Customer phone lists are NEVER sent to customers — only a flag.
app.get('/api/coupons', async (_req, res, next) => {
  try {
    const all = await store.listCoupons();
    const active = all.filter((c) => c && c.active !== false).map((c) => ({
      code: c.code, type: c.type || 'percent', value: c.value,
      brands: Array.isArray(c.brands) ? c.brands : [],
      products: Array.isArray(c.products) ? c.products : [],
      customers_only: Array.isArray(c.customers) && c.customers.length > 0,
    }));
    await withCouponProductNames(active);
    return res.json(active);
  } catch (err) { return next(err); }
});

app.post('/api/coupons/validate', async (req, res, next) => {
  try {
    const { code, items, phone } = req.body || {};
    const coupon = await store.getCoupon(code);
    if (!coupon || coupon.active === false) return res.json({ valid: false, reason: 'not_found' });
    if (!couponCustomerEligible(coupon, phone)) return res.json({ valid: false, reason: 'not_for_customer' });
    const scoped = (Array.isArray(coupon.brands) && coupon.brands.length > 0)
      || (Array.isArray(coupon.products) && coupon.products.length > 0);
    // Resolve the cart against server-side products/prices. Never trust
    // client prices — the same math runs again when the order is placed.
    const resolved = [];
    if (Array.isArray(items)) {
      for (const it of items) {
        const product = await store.getProduct(it.product_id);
        if (!product) continue;
        const unitPrice = product.sale_price != null && product.sale_price < product.price
          ? product.sale_price : product.price;
        resolved.push({ unit_price: unitPrice, qty: Math.max(1, Number(it.qty) || 1), product });
      }
    }
    if (scoped) {
      if (!resolved.length) return res.json({ valid: false, reason: 'no_eligible_items' });
      const { discount, base } = couponDiscountFor(coupon, resolved);
      if (base <= 0) return res.json({ valid: false, reason: 'no_eligible_items' });
      return res.json({ valid: true, code: coupon.code, type: coupon.type || 'percent', value: coupon.value, discount, eligible_total: base, brands: coupon.brands || [], products: coupon.products || [] });
    }
    const { discount, base } = couponDiscountFor(coupon, resolved);
    return res.json({ valid: true, code: coupon.code, type: coupon.type || 'percent', value: coupon.value, discount, eligible_total: base, brands: [], products: [] });
  } catch (err) { return next(err); }
});

app.get('/api/payments', async (_req, res, next) => {
  try {
    const accounts = await store.listPayments();
    return res.json(accounts.map((a) => ({
      method: a.method,
      account_name: a.account_name,
      account_number: a.account_number,
      note: a.note || '',
    })));
  } catch (err) { return next(err); }
});

const DELIVERY_FEES = { yangon_inner: 4000, yangon_outer: 4500, outside: null, pickup: 0 };

function deliveryNote(method, fee) {
  if (method === 'outside') return 'ပို့ခ — ဆိုင်က ဖုန်းဆက်ပြီး အတည်ပြုပေးပါမယ်';
  if (method === 'pickup') return 'ဆိုင်မှာ လာယူ — ၃ ရက်အတွင်း Cash on Collection';
  return `ပို့ခ ${fee} Ks — ပစ္စည်းရောက်မှ ပေးပါ`;
}

// Website stock (online allocation) — POS holds the physical truth; the
// website number is how many units Pyae wants to sell ONLINE. null = not
// managed on the website (today's behaviour: the stored in_stock boolean
// rules, as seeded from POS). Customers never see the number, only
// in_stock / sold out.
function syncInStock(p) {
  if (Array.isArray(p.options) && p.options.length) {
    for (const o of p.options) if (o.stock != null) o.in_stock = Number(o.stock) > 0;
    p.in_stock = p.options.some((o) => o.in_stock);
  } else if (p.stock != null) {
    p.in_stock = Number(p.stock) > 0;
  }
}
// Returns a product id when a managed stock cannot cover the quantities, else null.
function stockSufficient(byId, items) {
  for (const it of items) {
    const product = byId.get(it.product_id);
    if (!product) continue;
    const qty = it.qty || 0;
    if (qty <= 0) continue;
    if (Array.isArray(product.options) && product.options.length) {
      const opt = product.options.find((o) => normName(o.label) === normName(it.option_label || ''));
      if (opt && opt.stock != null && Number(opt.stock) < qty) return product.id;
    } else if (product.stock != null && Number(product.stock) < qty) {
      return product.id;
    }
  }
  return null;
}
// dir -1 takes stock for an order, +1 returns it on cancel. Only managed
// stocks (a number) move; null stays untouched. Never goes below 0.
// Returns how many lines were managed.
function applyStockChange(byId, items, dir) {
  let touched = 0;
  for (const it of items) {
    const product = byId.get(it.product_id);
    if (!product) continue;
    const qty = it.qty || 0;
    let changed = false;
    if (Array.isArray(product.options) && product.options.length) {
      const opt = product.options.find((o) => normName(o.label) === normName(it.option_label || ''));
      if (opt && opt.stock != null) { opt.stock = Math.max(0, Number(opt.stock) + dir * qty); changed = true; }
    } else if (product.stock != null) {
      product.stock = Math.max(0, Number(product.stock) + dir * qty); changed = true;
    }
    if (changed) { syncInStock(product); touched++; }
  }
  return touched;
}

app.post('/api/orders', optionalAuth, async (req, res, next) => {
  try {
    const body = req.body || {};
    const { items, customer, delivery, payment, coupon_code } = body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items_required' });
    }
    if (!customer || !customer.name || !customer.phone) {
      return res.status(400).json({ error: 'customer_required' });
    }
    const custPhone = normalizePhone(customer.phone);
    if (!isValidMyanmarPhone(custPhone)) return res.status(400).json({ error: 'invalid_phone' });
    let deliveryMethod = delivery && delivery.method;
    // Frontend sends 'outside_yangon'; accept it as 'outside'.
    if (deliveryMethod === 'outside_yangon') deliveryMethod = 'outside';
    if (!Object.prototype.hasOwnProperty.call(DELIVERY_FEES, deliveryMethod)) {
      return res.status(400).json({ error: 'invalid_delivery_method' });
    }
    if (deliveryMethod !== 'pickup' && (!customer.address || !String(customer.address).trim())) {
      return res.status(400).json({ error: 'address_required' });
    }
    const paymentMethod = payment && payment.method;
    if (paymentMethod !== 'cod' && paymentMethod !== 'transfer') {
      return res.status(400).json({ error: 'invalid_payment_method' });
    }
    if (paymentMethod === 'transfer' && !payment.screenshot_data) {
      return res.status(400).json({ error: 'screenshot_required' });
    }

    // Resolve items against server-side POS prices. Never trust client prices.
    const products = await store.listProducts();
    const byId = new Map(products.map((p) => [p.id, p]));
    const orderItems = [];
    const loadedProducts = [];
    let subtotal = 0;
    for (const it of items) {
      const product = byId.get(it.product_id);
      if (!product) return res.status(400).json({ error: 'product_not_found', product_id: it.product_id });
      const qty = Math.max(1, Math.min(99, parseInt(it.qty, 10) || 1));
      let unitPrice;
      let optionLabel = null;
      if (Array.isArray(product.options) && product.options.length) {
        if (!it.option_label) return res.status(400).json({ error: 'option_required', product_id: it.product_id });
        const opt = product.options.find((o) => normName(o.label) === normName(it.option_label));
        if (!opt) return res.status(400).json({ error: 'option_not_found', product_id: it.product_id });
        if (!opt.in_stock) return res.status(400).json({ error: 'out_of_stock', product_id: it.product_id });
        unitPrice = opt.price;
        optionLabel = opt.label;
      } else {
        if (!product.in_stock) return res.status(400).json({ error: 'out_of_stock', product_id: it.product_id });
        unitPrice = product.sale_price != null && product.sale_price < product.price
          ? product.sale_price : product.price;
      }
      const lineTotal = unitPrice * qty;
      subtotal += lineTotal;
      loadedProducts.push(product);
      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        option_label: optionLabel,
        qty,
        unit_price: unitPrice,
        line_total: lineTotal,
      });
    }

    // Website stock: refuse the order when a managed stock cannot cover it.
    const short = stockSufficient(byId, orderItems);
    if (short) return res.status(400).json({ error: 'insufficient_stock', product_id: short });

    // Coupon: discount is computed on the ELIGIBLE items only (a scoped
    // coupon never discounts the whole order). Customer scope is checked
    // again here — the checkout validate step is not trusted on its own.
    let discount = 0;
    let coupon = null;
    if (coupon_code) {
      coupon = await store.getCoupon(coupon_code);
      if (!coupon || coupon.active === false) return res.status(400).json({ error: 'invalid_coupon' });
      if (!couponCustomerEligible(coupon, custPhone)) return res.status(400).json({ error: 'invalid_coupon' });
      const calcItems = orderItems.map((oi, i) => ({ unit_price: oi.unit_price, qty: oi.qty, product: loadedProducts[i] }));
      discount = couponDiscountFor(coupon, calcItems).discount;
      discount = Math.min(discount, subtotal);
    }

    const deliveryFee = DELIVERY_FEES[deliveryMethod];
    // Delivery fee is NEVER added to the total — customer pays the courier
    // on delivery (or picks up in store).
    const total = subtotal - discount;

    // Order id: BM-YYYYMMDD-XXXX.
    const now = new Date();
    const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    let orderId;
    for (;;) {
      orderId = `BM-${ymd}-${String(Math.floor(1000 + Math.random() * 9000))}`;
      if (!(await store.getOrder(orderId))) break;
    }

    // Payment screenshot (transfer only): stored in the database, never
    // echoed back. Disk storage used to lose every screenshot on redeploy
    // (Render's free disk is wiped), while the order still claimed one.
    let screenshotPath = null;
    if (payment.screenshot_data) {
      const m = String(payment.screenshot_data).match(/^data:(image\/[a-z]+);base64,(.+)$/);
      if (!m) return res.status(400).json({ error: 'invalid_screenshot' });
      const buf = Buffer.from(m[2], 'base64');
      if (buf.length > 2 * 1024 * 1024) return res.status(400).json({ error: 'screenshot_too_large' });
      await store.saveScreenshot(orderId, payment.screenshot_data);
      screenshotPath = 'db';
    }

    const order = {
      id: orderId,
      items: orderItems,
      subtotal,
      discount,
      total,
      delivery_fee: deliveryFee,
      delivery_note: deliveryNote(deliveryMethod, deliveryFee),
      status: 'pending',
      created_at: now.toISOString(),
      customer: { name: String(customer.name).trim(), phone: custPhone, address: String(customer.address || '').trim() },
      delivery: { method: deliveryMethod, fee: deliveryFee, note: deliveryNote(deliveryMethod, deliveryFee) },
      payment: { method: paymentMethod, account: payment.account || null },
      coupon_code: coupon ? coupon.code : null,
      screenshot_path: screenshotPath,
      user_id: req.user ? req.user.id : null,
      user_phone: req.user ? req.user.phone : null,
      stock_adjusted: false,
      stock_returned: false,
    };
    // Website stock: a customer order takes units out of the ONLINE allocation
    // (only for products with a managed website stock; null = unmanaged).
    // POS still holds the physical truth — this number is what the website
    // may still sell. Cancelled orders return their units (see status PATCH).
    const stockTouched = applyStockChange(byId, orderItems, -1);
    order.stock_adjusted = stockTouched > 0;
    for (const p of [...new Set(loadedProducts)]) await store.saveProduct(p);
    await store.saveOrder(order);
    // First entry in this voucher's history: who placed it, for how much.
    await logActivity({ user: { phone: custPhone, name: String(customer.name).trim() } }, 'order_create', 'order', orderId, `order placed — ${order.total} Ks (${orderItems.length} item${orderItems.length > 1 ? 's' : ''})`);

    const { screenshot_path: _sp, ...rest } = order;
    void _sp;
    return res.status(201).json({ order: rest });
  } catch (err) { return next(err); }
});

app.get('/api/orders', authMiddleware, async (req, res, next) => {
  try {
    const all = await store.listOrders();
    const isMgr = await isManagerPhone(req.user.phone);
    const mine = isMgr
      ? all
      : all.filter((o) => o.user_id === req.user.id || (o.customer && o.customer.phone === req.user.phone));
    mine.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return res.json({ orders: mine.map(stripOrderPrivate) });
  } catch (err) { return next(err); }
});

function stripOrderPrivate(o) {
  const { screenshot_path: _sp, ...rest } = o;
  void _sp;
  return rest;
}

app.get('/api/orders/:id', authMiddleware, async (req, res, next) => {
  try {
    const order = await store.getOrder(req.params.id);
    if (!order) return res.status(404).json({ error: 'order_not_found' });
    const isManager = await isManagerPhone(req.user.phone);
    const isOwner = order.user_id === req.user.id
      || (order.customer && order.customer.phone === req.user.phone);
    if (!isManager && !isOwner) return res.status(403).json({ error: 'forbidden' });
    return res.json({ order: stripOrderPrivate(order) });
  } catch (err) { return next(err); }
});

app.get('/api/shop-info', async (_req, res, next) => {
  try {
    const appLinks = (await store.getSetting('app_links')) || {};
    return res.json({
      phone: SHOP_PHONE,
      hours: '9 AM–6 PM daily',
      messenger_url: 'https://m.me/beautyandme117',
      app_links: {
        play_store_url: appLinks.play_store_url || '',
        app_store_url: appLinks.app_store_url || '',
      },
    });
  } catch (err) { return next(err); }
});

// ---------- Manage (manager only) ----------

app.get('/api/manage/stats', authMiddleware, managerMiddleware, async (_req, res, next) => {
  try {
    const [products, orders, users] = await Promise.all([
      store.listProducts(), store.listOrders(), store.listUsers(),
    ]);
    const revenue = orders.reduce((s, o) => s + (Number(o.total) || 0), 0);
    return res.json({ products: products.length, orders: orders.length, users: users.length, revenue });
  } catch (err) { return next(err); }
});

// ---------- Manage: Orders (all orders, newest first) ----------

function adminOrderShape(o) {
  const { screenshot_path, ...rest } = o;
  return { ...rest, has_screenshot: Boolean(screenshot_path) };
}

app.get('/api/manage/orders', authMiddleware, orderStaffMiddleware, async (req, res, next) => {
  try {
    const { q = '', status = '' } = req.query;
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
    let orders = await store.listOrders();
    orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    if (status && ORDER_STATUSES.includes(status)) orders = orders.filter((o) => o.status === status);
    if (q) {
      const needle = String(q).toLowerCase();
      orders = orders.filter((o) =>
        String(o.id || '').toLowerCase().includes(needle) ||
        String((o.customer && o.customer.name) || '').toLowerCase().includes(needle) ||
        String((o.customer && o.customer.phone) || '').includes(needle));
    }
    const total = orders.length;
    return res.json({ orders: orders.slice(offset, offset + limit).map(adminOrderShape), total });
  } catch (err) { return next(err); }
});

app.get('/api/manage/orders/:id', authMiddleware, orderStaffMiddleware, async (req, res, next) => {
  try {
    const order = await store.getOrder(req.params.id);
    if (!order) return res.status(404).json({ error: 'order_not_found' });
    return res.json({ order: adminOrderShape(order) });
  } catch (err) { return next(err); }
});

app.patch('/api/manage/orders/:id', authMiddleware, orderStaffMiddleware, async (req, res, next) => {
  try {
    const order = await store.getOrder(req.params.id);
    if (!order) return res.status(404).json({ error: 'order_not_found' });
    const { status } = req.body || {};
    if (!ORDER_STATUSES.includes(status)) return res.status(400).json({ error: 'invalid_status' });
    const oldStatus = order.status;
    // Website stock: cancelling returns the order's units to the online
    // allocation — but only when the goods have not gone out yet (never for a
    // delivered order), and only for orders that actually took stock.
    // Un-cancelling takes the units again, and refuses when too few are left.
    const PRE_DELIVERY = ['pending', 'confirmed', 'delivering'];
    if (order.stock_adjusted && !order.stock_returned && status === 'cancelled' && PRE_DELIVERY.includes(oldStatus)) {
      const products = await store.listProducts();
      const byId = new Map(products.map((p) => [p.id, p]));
      applyStockChange(byId, order.items || [], +1);
      for (const p of new Set((order.items || []).map((oi) => byId.get(oi.product_id)).filter(Boolean))) await store.saveProduct(p);
      order.stock_returned = true;
    } else if (order.stock_adjusted && order.stock_returned && oldStatus === 'cancelled' && status !== 'cancelled') {
      const products = await store.listProducts();
      const byId = new Map(products.map((p) => [p.id, p]));
      const short = stockSufficient(byId, order.items || []);
      if (short) return res.status(400).json({ error: 'insufficient_stock', product_id: short });
      applyStockChange(byId, order.items || [], -1);
      for (const p of new Set((order.items || []).map((oi) => byId.get(oi.product_id)).filter(Boolean))) await store.saveProduct(p);
      order.stock_returned = false;
    }
    order.status = status;
    order.updated_at = new Date().toISOString();
    await store.saveOrder(order);
    await logActivity(req, 'order_status', 'order', order.id, `status: ${oldStatus} → ${status}`);
    return res.json({ order: adminOrderShape(order) });
  } catch (err) { return next(err); }
});

// Admin edits an order's items (add / remove / change qty). Only while the
// order is still open (not delivered / cancelled). Lines already in the
// order keep their snapshot unit price — only the quantity changes; NEW
// lines are priced at the current catalog price (sale price if set, option
// price for option products). Website stock moves with the quantity delta
// (added units come out of the online allocation, removed units go back,
// floored at 0) — admin edits never reject on stock, because the admin is
// selling from real shop stock. Orders placed before stock control existed
// (no stock_adjusted flag) leave stock untouched. Delivery fee is unchanged.
// Total is recomputed; the coupon (if any) is re-applied to the new items.
app.patch('/api/manage/orders/:id/items', authMiddleware, orderStaffMiddleware, async (req, res, next) => {
  try {
    const order = await store.getOrder(req.params.id);
    if (!order) return res.status(404).json({ error: 'order_not_found' });
    if (order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({ error: 'order_locked' });
    }
    const rawItems = (req.body || {}).items;
    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return res.status(400).json({ error: 'items_required' });
    }
    // Merge duplicate lines (same product + option), cap qty at 99.
    const merged = new Map();
    for (const it of rawItems) {
      if (!it || !it.product_id) return res.status(400).json({ error: 'product_not_found', product_id: it && it.product_id });
      const qty = Math.max(1, Math.min(99, parseInt(it.qty, 10) || 1));
      const key = `${it.product_id}||${it.option_label || ''}`;
      if (merged.has(key)) {
        const cur = merged.get(key);
        cur.qty = Math.min(99, cur.qty + qty);
      } else {
        merged.set(key, { product_id: it.product_id, option_label: it.option_label || null, qty });
      }
    }
    const products = await store.listProducts();
    const byId = new Map(products.map((p) => [p.id, p]));
    const oldItems = order.items || [];
    const oldByKey = new Map(oldItems.map((oi) => [`${oi.product_id}||${oi.option_label || ''}`, oi]));
    const newItems = [];
    const loadedProducts = [];
    let subtotal = 0;
    for (const it of merged.values()) {
      const product = byId.get(it.product_id);
      if (!product) return res.status(400).json({ error: 'product_not_found', product_id: it.product_id });
      let unitPrice;
      let optionLabel = null;
      if (Array.isArray(product.options) && product.options.length) {
        if (!it.option_label) return res.status(400).json({ error: 'option_required', product_id: it.product_id });
        const opt = product.options.find((o) => normName(o.label) === normName(it.option_label));
        if (!opt) return res.status(400).json({ error: 'option_not_found', product_id: it.product_id });
        unitPrice = opt.price;
        optionLabel = opt.label;
      } else {
        unitPrice = product.sale_price != null && product.sale_price < product.price
          ? product.sale_price : product.price;
      }
      // Keep the price the customer was already charged for lines that were
      // in the order; only new lines take the current price.
      const oldLine = oldByKey.get(`${it.product_id}||${optionLabel || ''}`);
      if (oldLine && oldLine.unit_price != null) unitPrice = oldLine.unit_price;
      const lineTotal = unitPrice * it.qty;
      subtotal += lineTotal;
      loadedProducts.push(product);
      newItems.push({
        product_id: product.id,
        product_name: product.name,
        option_label: optionLabel,
        qty: it.qty,
        unit_price: unitPrice,
        line_total: lineTotal,
      });
    }
    // Re-apply the order's coupon (if any) to the new items.
    let discount = 0;
    if (order.coupon_code) {
      const coupon = await store.getCoupon(order.coupon_code);
      const custPhone = order.customer && order.customer.phone ? normalizePhone(order.customer.phone) : '';
      if (coupon && coupon.active !== false && couponCustomerEligible(coupon, custPhone)) {
        const calcItems = newItems.map((oi, i) => ({ unit_price: oi.unit_price, qty: oi.qty, product: loadedProducts[i] }));
        discount = couponDiscountFor(coupon, calcItems).discount;
      }
    }
    const oldTotal = order.total;
    // Website stock: move it by the quantity delta per line.
    if (order.stock_adjusted && !order.stock_returned) {
      const deltas = [];
      for (const it of merged.values()) {
        const oldLine = oldByKey.get(`${it.product_id}||${it.option_label || ''}`);
        const delta = it.qty - (oldLine ? oldLine.qty : 0);
        if (delta !== 0) deltas.push({ product_id: it.product_id, option_label: it.option_label || null, qty: delta });
      }
      for (const [key, oldLine] of oldByKey) {
        if (!merged.has(key)) deltas.push({ product_id: oldLine.product_id, option_label: oldLine.option_label || null, qty: -oldLine.qty });
      }
      if (deltas.length) {
        applyStockChange(byId, deltas, -1);
        for (const p of new Set(deltas.map((d) => byId.get(d.product_id)).filter(Boolean))) await store.saveProduct(p);
      }
    }
    order.items = newItems;
    order.subtotal = subtotal;
    order.discount = discount;
    order.total = subtotal - discount;
    order.updated_at = new Date().toISOString();
    await store.saveOrder(order);
    // Change summary for the activity log.
    const summary = [];
    const newByKey = new Map(newItems.map((oi) => [`${oi.product_id}||${oi.option_label || ''}`, oi]));
    for (const oi of newItems) {
      const old = oldByKey.get(`${oi.product_id}||${oi.option_label || ''}`);
      if (!old) summary.push(`+ ${oi.product_name}${oi.option_label ? ' (' + oi.option_label + ')' : ''} × ${oi.qty}`);
      else if (old.qty !== oi.qty) summary.push(`${oi.product_name}: qty ${old.qty} → ${oi.qty}`);
    }
    for (const oi of oldItems) {
      if (!newByKey.has(`${oi.product_id}||${oi.option_label || ''}`)) summary.push(`− ${oi.product_name}${oi.option_label ? ' (' + oi.option_label + ')' : ''}`);
    }
    await logActivity(req, 'order_edit', 'order', order.id, `total: ${oldTotal} → ${order.total} Ks${summary.length ? ' — ' + summary.join('; ') : ''}`);
    return res.json({ order: adminOrderShape(order), old_total: oldTotal, new_total: order.total });
  } catch (err) { return next(err); }
});

// Admin applies or removes a coupon on an order (e.g. the customer forgot
// to apply one at checkout). Same lock as item editing: not delivered /
// cancelled. The coupon is validated like at checkout — must exist, be
// active, and the customer must be eligible; a scoped coupon with no
// eligible items in this order is refused. Discount is recomputed on the
// order's current items; delivery fee is unchanged.
app.patch('/api/manage/orders/:id/coupon', authMiddleware, orderStaffMiddleware, async (req, res, next) => {
  try {
    const order = await store.getOrder(req.params.id);
    if (!order) return res.status(404).json({ error: 'order_not_found' });
    if (order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({ error: 'order_locked' });
    }
    const code = (req.body || {}).coupon_code ? String((req.body || {}).coupon_code).toUpperCase().trim() : '';
    const oldTotal = order.total;
    if (!code) {
      if (!order.coupon_code) return res.json({ order: adminOrderShape(order), old_total: oldTotal, new_total: oldTotal });
      order.coupon_code = null;
      order.discount = 0;
      order.total = order.subtotal;
      order.updated_at = new Date().toISOString();
      await store.saveOrder(order);
      await logActivity(req, 'order_coupon', 'order', order.id, `coupon removed — total: ${oldTotal} → ${order.total} Ks`);
      return res.json({ order: adminOrderShape(order), old_total: oldTotal, new_total: order.total });
    }
    const coupon = await store.getCoupon(code);
    if (!coupon || coupon.active === false) return res.status(400).json({ error: 'invalid_coupon' });
    const custPhone = order.customer && order.customer.phone ? normalizePhone(order.customer.phone) : '';
    if (!couponCustomerEligible(coupon, custPhone)) return res.status(400).json({ error: 'invalid_coupon' });
    const products = await store.listProducts();
    const byId = new Map(products.map((p) => [p.id, p]));
    const calcItems = (order.items || []).map((oi) => ({ unit_price: oi.unit_price, qty: oi.qty, product: byId.get(oi.product_id) }));
    const discount = couponDiscountFor(coupon, calcItems).discount;
    if (discount <= 0) return res.status(400).json({ error: 'no_eligible_items' });
    order.coupon_code = coupon.code;
    order.discount = discount;
    order.total = order.subtotal - discount;
    order.updated_at = new Date().toISOString();
    await store.saveOrder(order);
    await logActivity(req, 'order_coupon', 'order', order.id, `coupon ${coupon.code} applied — discount ${discount} Ks, total: ${oldTotal} → ${order.total} Ks`);
    return res.json({ order: adminOrderShape(order), old_total: oldTotal, new_total: order.total });
  } catch (err) { return next(err); }
});

// Activity log — owner only. Newest first; ?q searches who/what, ?action filters by kind.
app.get('/api/manage/activity', authMiddleware, ownerMiddleware, async (req, res, next) => {
  try {
    const { q = '', action = '' } = req.query;
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
    return res.json(await store.listActivity(limit, offset, { q, action }));
  } catch (err) { return next(err); }
});

// Payment screenshot — manager only. Served from the database first
// (screenshots are stored there since 2026-11-19); falls back to the old
// disk file for orders placed before that change. Never listed in any
// customer response.
app.get('/api/manage/orders/:id/screenshot', authMiddleware, orderStaffMiddleware, async (req, res, next) => {
  try {
    const order = await store.getOrder(req.params.id);
    if (!order || !order.screenshot_path) return res.status(404).json({ error: 'screenshot_not_found' });
    const shot = await store.getScreenshot(order.id);
    if (shot) {
      const m = String(shot).match(/^data:(image\/[a-z]+);base64,(.+)$/);
      if (m) {
        res.setHeader('Content-Type', m[1]);
        return res.send(Buffer.from(m[2], 'base64'));
      }
    }
    const file = path.join(store.uploadsDir, `${order.id}.jpg`);
    if (fs.existsSync(file)) {
      res.setHeader('Content-Type', 'image/jpeg');
      return res.sendFile(file);
    }
    return res.status(404).json({ error: 'screenshot_not_found' });
  } catch (err) { return next(err); }
});

// Product photo served from the shop's own database (migrated from
// WooCommerce, or uploaded by staff). Public, cacheable forever — the URL
// only ever changes when a new photo is uploaded for that product.
app.get('/api/images/:id', async (req, res, next) => {
  try {
    const img = await store.getImage(req.params.id);
    if (!img) return res.status(404).json({ error: 'image_not_found' });
    res.setHeader('Content-Type', img.mime);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.send(img.buffer);
  } catch (err) { return next(err); }
});

// ---------- Manage: Users ----------

app.get('/api/manage/users', authMiddleware, managerMiddleware, async (req, res, next) => {
  try {
    const { q = '' } = req.query;
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
    const extraManagers = (await store.getSetting('managers')) || [];
    const extraStaff = (await store.getSetting('sale_staff')) || [];
    const [users, orders] = await Promise.all([store.listUsers(), store.listOrders()]);
    const orderCount = {};
    for (const o of orders) {
      const key = (o.customer && o.customer.phone) || o.user_phone || '';
      if (key) orderCount[key] = (orderCount[key] || 0) + 1;
    }
    let list = users.map((u) => ({
      id: u.id,
      name: u.name,
      phone: u.phone,
      is_owner: u.phone === MANAGER_PHONE,
      is_manager: u.phone === MANAGER_PHONE || (Array.isArray(extraManagers) && extraManagers.includes(u.phone)),
      is_sale_staff: Array.isArray(extraStaff) && extraStaff.includes(u.phone),
      orders_count: orderCount[u.phone] || 0,
      created_at: u.created_at || null,
    }));
    list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    if (q) {
      const needle = String(q).toLowerCase();
      list = list.filter((u) =>
        String(u.name || '').toLowerCase().includes(needle) ||
        String(u.phone || '').includes(needle));
    }
    const total = list.length;
    return res.json({ users: list.slice(offset, offset + limit), total });
  } catch (err) { return next(err); }
});

// Admin resets a customer's password (e.g. they forgot it) and tells them the
// new one by Messenger/phone — the shop has no SMS/email. The customer's
// login is cleared, so they sign in again with the new password. A manager
// can never reset another manager's (or the owner's) password — only the
// owner can do that.
app.patch('/api/manage/users/:phone/password', authMiddleware, managerMiddleware, async (req, res, next) => {
  try {
    const phone = normalizePhone(req.params.phone);
    const user = await store.getUserByPhone(phone);
    if (!user) return res.status(404).json({ error: 'user_not_found' });
    const targetIsManager = await isManagerPhone(phone);
    if (targetIsManager && req.user.phone !== MANAGER_PHONE) {
      return res.status(403).json({ error: 'forbidden' });
    }
    const { password } = req.body || {};
    if (!password || String(password).length < 4) return res.status(400).json({ error: 'password_too_short' });
    user.password_hash = hashPassword(String(password));
    user.token = null;
    user.token_expires_at = null;
    await store.saveUser(user);
    // Never log the password itself — only that it was reset, and for whom.
    await logActivity(req, 'password_reset', 'user', phone, `password reset for ${user.name || phone}`);
    return res.json({ ok: true });
  } catch (err) { return next(err); }
});

// ---------- Manage: Managers (owner only) ----------

app.get('/api/manage/managers', authMiddleware, managerMiddleware, async (_req, res, next) => {
  try {
    const extra = (await store.getSetting('managers')) || [];
    const users = await store.listUsers();
    const byPhone = new Map(users.map((u) => [u.phone, u]));
    return res.json({
      owner: MANAGER_PHONE,
      managers: (Array.isArray(extra) ? extra : []).map((phone) => ({
        phone,
        name: (byPhone.get(phone) || {}).name || '',
      })),
    });
  } catch (err) { return next(err); }
});

app.post('/api/manage/managers', authMiddleware, ownerMiddleware, async (req, res, next) => {
  try {
    const phone = normalizePhone((req.body || {}).phone);
    if (!isValidMyanmarPhone(phone)) return res.status(400).json({ error: 'invalid_phone' });
    if (phone === MANAGER_PHONE) return res.status(400).json({ error: 'already_owner' });
    const user = await store.getUserByPhone(phone);
    if (!user) return res.status(404).json({ error: 'user_not_found' });
    const extra = (await store.getSetting('managers')) || [];
    if (Array.isArray(extra) && !extra.includes(phone)) {
      extra.push(phone);
      await store.setSetting('managers', extra);
    }
    // Promoting to manager replaces the lower sale-staff role.
    const staff = (await store.getSetting('sale_staff')) || [];
    if (Array.isArray(staff) && staff.includes(phone)) {
      await store.setSetting('sale_staff', staff.filter((p) => p !== phone));
    }
    await logActivity(req, 'manager_add', 'user', phone, `manager added: ${user.name || phone}`);
    return res.status(201).json({ ok: true, phone });
  } catch (err) { return next(err); }
});

app.delete('/api/manage/managers/:phone', authMiddleware, ownerMiddleware, async (req, res, next) => {
  try {
    const phone = normalizePhone(req.params.phone);
    const extra = (await store.getSetting('managers')) || [];
    await store.setSetting('managers', (Array.isArray(extra) ? extra : []).filter((p) => p !== phone));
    await logActivity(req, 'manager_remove', 'user', phone, `manager removed: ${phone}`);
    return res.json({ ok: true });
  } catch (err) { return next(err); }
});

// Sale staff (order work only) — same shape as managers, owner only.
// A manager already has full order access, so they cannot also be staff.
app.get('/api/manage/sale-staff', authMiddleware, managerMiddleware, async (_req, res, next) => {
  try {
    const extra = (await store.getSetting('sale_staff')) || [];
    const users = await store.listUsers();
    const byPhone = new Map(users.map((u) => [u.phone, u]));
    return res.json({
      staff: (Array.isArray(extra) ? extra : []).map((phone) => ({
        phone,
        name: (byPhone.get(phone) || {}).name || '',
      })),
    });
  } catch (err) { return next(err); }
});

app.post('/api/manage/sale-staff', authMiddleware, ownerMiddleware, async (req, res, next) => {
  try {
    const phone = normalizePhone((req.body || {}).phone);
    if (!isValidMyanmarPhone(phone)) return res.status(400).json({ error: 'invalid_phone' });
    if (phone === MANAGER_PHONE) return res.status(400).json({ error: 'already_owner' });
    if (await isManagerPhone(phone)) return res.status(400).json({ error: 'already_manager' });
    const user = await store.getUserByPhone(phone);
    if (!user) return res.status(404).json({ error: 'user_not_found' });
    const extra = (await store.getSetting('sale_staff')) || [];
    if (Array.isArray(extra) && !extra.includes(phone)) {
      extra.push(phone);
      await store.setSetting('sale_staff', extra);
    }
    await logActivity(req, 'staff_add', 'user', phone, `sale staff added: ${user.name || phone}`);
    return res.status(201).json({ ok: true, phone });
  } catch (err) { return next(err); }
});

app.delete('/api/manage/sale-staff/:phone', authMiddleware, ownerMiddleware, async (req, res, next) => {
  try {
    const phone = normalizePhone(req.params.phone);
    const extra = (await store.getSetting('sale_staff')) || [];
    await store.setSetting('sale_staff', (Array.isArray(extra) ? extra : []).filter((p) => p !== phone));
    await logActivity(req, 'staff_remove', 'user', phone, `sale staff removed: ${phone}`);
    return res.json({ ok: true });
  } catch (err) { return next(err); }
});

app.get('/api/manage/products', authMiddleware, managerMiddleware, async (req, res, next) => {
  try {
    const { q = '' } = req.query;
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
    let items = await store.listProducts();
    const keywords = String(q).toLowerCase().split(/\s+/).filter(Boolean);
    if (keywords.length) {
      items = items.filter((p) => {
        const hay = `${p.name} ${p.brand} ${p.category} ${deriveProductType(p)} ${(PRODUCT_TYPE_LABELS[deriveProductType(p)] || '')} ${(p.options || []).map((o) => o.label).join(' ')}`.toLowerCase();
        return keywords.every((k) => hay.includes(k));
      });
    }
    // Counts are computed on the search result, BEFORE the status filter,
    // so the chips show how many match the current search.
    const counts = {
      all: items.length,
      in_stock: items.filter((p) => p.in_stock).length,
      out_of_stock: items.filter((p) => !p.in_stock).length,
      sale: items.filter((p) => p.sale_price != null && p.sale_price < p.price).length,
    };
    if (req.query.stock === 'in') items = items.filter((p) => p.in_stock);
    else if (req.query.stock === 'out') items = items.filter((p) => !p.in_stock);
    if (req.query.sale === '1') items = items.filter((p) => p.sale_price != null && p.sale_price < p.price);
    const total = items.length;
    return res.json({ items: items.slice(offset, offset + limit), total, counts });
  } catch (err) { return next(err); }
});

// Add a NEW product from Manage (manager only). The catalog normally comes
// from the POS seed + WooCommerce import; this is for new arrivals that are
// in neither yet. A product added here is website-only — no wc_id, no POS
// row; the next WooCommerce import can only fill its photo (it never
// overwrites an existing image). Same name twice would confuse search +
// coupons, so a duplicate name is refused.
app.post('/api/manage/products', authMiddleware, managerMiddleware, async (req, res, next) => {
  try {
    const b = req.body || {};
    const name = String(b.name || '').trim();
    if (!name) return res.status(400).json({ error: 'name_required' });
    const brand = String(b.brand || '').trim();
    if (!brand) return res.status(400).json({ error: 'brand_required' });
    const hasOptions = Array.isArray(b.options) && b.options.length > 0;
    const price = Number(b.price);
    if (!hasOptions && (!Number.isFinite(price) || price <= 0)) return res.status(400).json({ error: 'invalid_price' });
    // Sale price does not apply to option lines at checkout, so it is
    // ignored when options are given.
    const salePrice = hasOptions || b.sale_price == null || b.sale_price === ''
      ? null : Number(b.sale_price);
    if (salePrice != null && (!Number.isFinite(salePrice) || salePrice < 0)) return res.status(400).json({ error: 'invalid_sale_price' });
    const stock = b.stock == null || b.stock === '' ? null : Number(b.stock);
    if (stock != null && (!Number.isInteger(stock) || stock < 0)) return res.status(400).json({ error: 'invalid_stock' });
    let options = null;
    if (hasOptions) {
      options = [];
      const seen = new Set();
      for (const o of b.options) {
        const label = String((o && o.label) || '').trim();
        if (!label) return res.status(400).json({ error: 'option_required' });
        const key = normName(label);
        if (seen.has(key)) return res.status(400).json({ error: 'duplicate_option' });
        seen.add(key);
        const oprice = Number(o.price);
        if (!Number.isFinite(oprice) || oprice <= 0) return res.status(400).json({ error: 'invalid_price' });
        const ostock = o.stock == null || o.stock === '' ? null : Number(o.stock);
        if (ostock != null && (!Number.isInteger(ostock) || ostock < 0)) return res.status(400).json({ error: 'invalid_stock' });
        options.push({ label, price: oprice, stock: ostock, in_stock: ostock != null ? ostock > 0 : true, sku: String(o.sku || '').trim() || null });
      }
    }
    // Photo (optional): a data URL, same limits as the photo-upload endpoint.
    // Stored as bytes in the images table (see that endpoint), not inline.
    let imageBuf = null;
    let imageMime = null;
    if (b.image_data) {
      const m = String(b.image_data).match(/^data:image\/(jpeg|png|webp);base64,(.+)$/);
      if (!m) return res.status(400).json({ error: 'invalid_image' });
      imageBuf = Buffer.from(m[2], 'base64');
      if (imageBuf.length > 1500 * 1024) return res.status(400).json({ error: 'image_too_large' });
      imageMime = 'image/' + m[1];
    }
    const existing = await store.listProducts();
    if (existing.some((p) => normName(p.name) === normName(name))) {
      return res.status(400).json({ error: 'duplicate_product' });
    }
    let slug = slugify(name);
    let id = slug;
    let n = 2;
    while (existing.some((p) => p.id === id)) { id = `${slug}-${n}`; n++; }
    const product = {
      id,
      slug,
      name,
      brand,
      category: String(b.category || '').trim(),
      price: hasOptions ? Math.min(...options.map((o) => o.price)) : price,
      sale_price: salePrice,
      stock,
      in_stock: stock != null ? stock > 0 : true,
      image_url: imageBuf ? '/api/images/' + id : null,
      wc_id: null,
      is_new: false,
      best_seller: false,
      sale_featured: false,
      options,
      sku: String(b.sku || '').trim() || null,
      note: String(b.note || '').trim(),
    };
    if (options) product.in_stock = options.some((o) => o.in_stock);
    await store.saveProduct(product);
    if (imageBuf) await store.saveImage(product.id, imageBuf, imageMime);
    await logActivity(req, 'product_create', 'product', product.id, `${product.name} — ${product.price} Ks`);
    return res.status(201).json(product);
  } catch (err) { return next(err); }
});

app.patch('/api/manage/products/:id', authMiddleware, managerMiddleware, async (req, res, next) => {
  try {
    const p = await store.getProduct(req.params.id);
    if (!p) return res.status(404).json({ error: 'product_not_found' });
    const { sale_price, is_new, best_seller, sale_featured, price, option_prices, stock, option_stock, name, brand, category, note } = req.body || {};
    const before = {
      price: p.price, sale_price: p.sale_price,
      stock: p.stock ?? null,
      best_seller: Boolean(p.best_seller), sale_featured: Boolean(p.sale_featured),
      name: p.name, brand: p.brand, category: p.category || '', note: p.note || '',
      options: Array.isArray(p.options) ? p.options.map((o) => ({ label: o.label, price: o.price, stock: o.stock ?? null })) : [],
    };
    // Name / brand / category / description. The id (slug) never changes on
    // rename: orders, wishlists and carts reference the id, and the slug is
    // invisible in the shop (single-page app, no product URLs).
    if (name !== undefined) {
      const cleanName = String(name).trim();
      if (!cleanName) return res.status(400).json({ error: 'name_required' });
      const clash = (await store.listProducts()).find((x) => String(x.id) !== String(p.id) && normName(x.name) === normName(cleanName));
      if (clash) return res.status(400).json({ error: 'duplicate_product' });
      p.name = cleanName;
    }
    if (brand !== undefined) {
      const cleanBrand = String(brand).trim();
      if (!cleanBrand) return res.status(400).json({ error: 'brand_required' });
      p.brand = cleanBrand;
    }
    if (category !== undefined) p.category = String(category);
    if (note !== undefined) p.note = String(note);
    if (sale_price !== undefined) {
      if (sale_price !== null && (typeof sale_price !== 'number' || sale_price < 0)) {
        return res.status(400).json({ error: 'invalid_sale_price' });
      }
      p.sale_price = sale_price;
    }
    // Selling price. For products with options the customer pays the
    // OPTION price, so the base price is not editable there — option prices
    // are edited per option below, and the base price mirrors the cheapest.
    if (price !== undefined && !Array.isArray(p.options)) {
      if (typeof price !== 'number' || price <= 0) {
        return res.status(400).json({ error: 'invalid_price' });
      }
      p.price = price;
    }
    if (option_prices !== undefined && Array.isArray(p.options) && p.options.length) {
      const entries = Object.entries(option_prices);
      for (const [label, val] of entries) {
        if (typeof val !== 'number' || val <= 0) return res.status(400).json({ error: 'invalid_price' });
      }
      for (const [label, val] of entries) {
        const opt = p.options.find((o) => normName(o.label) === normName(label));
        if (opt) opt.price = val;
      }
      // Base price mirrors the cheapest option (what the shop grid shows).
      p.price = Math.min(...p.options.map((o) => o.price));
    }
    // Website stock (online allocation). Empty (null) = not managed on the
    // website — the stored in_stock boolean rules, as today. 0 = sold out.
    // Option products keep their stock per option; the plain stock field
    // does not apply to them.
    if (stock !== undefined && !Array.isArray(p.options)) {
      if (stock !== null && (!Number.isInteger(stock) || stock < 0)) {
        return res.status(400).json({ error: 'invalid_stock' });
      }
      p.stock = stock;
    }
    if (option_stock !== undefined && Array.isArray(p.options) && p.options.length) {
      const entries = Object.entries(option_stock);
      for (const [label, val] of entries) {
        if (val !== null && (!Number.isInteger(val) || val < 0)) return res.status(400).json({ error: 'invalid_stock' });
      }
      for (const [label, val] of entries) {
        const opt = p.options.find((o) => normName(o.label) === normName(label));
        if (opt) opt.stock = val;
      }
    }
    if (is_new !== undefined) p.is_new = Boolean(is_new);
    if (best_seller !== undefined) p.best_seller = Boolean(best_seller);
    if (sale_featured !== undefined) p.sale_featured = Boolean(sale_featured);
    syncInStock(p);
    await store.saveProduct(p);
    const changes = [];
    if (before.name !== p.name) changes.push(`name: ${before.name} → ${p.name}`);
    if (before.brand !== p.brand) changes.push(`brand: ${before.brand} → ${p.brand}`);
    if (before.category !== (p.category || '')) changes.push(`category: ${before.category || '—'} → ${p.category || '—'}`);
    if (before.note !== (p.note || '')) changes.push(`note: ${(before.note || '—').slice(0, 60)} → ${(p.note || '—').slice(0, 60)}`);
    if (before.price !== p.price) changes.push(`price: ${before.price} → ${p.price} Ks`);
    if (before.sale_price !== p.sale_price) changes.push(`sale price: ${before.sale_price == null ? '—' : before.sale_price} → ${p.sale_price == null ? '—' : p.sale_price} Ks`);
    if ((before.stock ?? null) !== (p.stock ?? null)) changes.push(`stock: ${before.stock == null ? '—' : before.stock} → ${p.stock == null ? '—' : p.stock}`);
    if (before.best_seller !== Boolean(p.best_seller)) changes.push(`best seller: ${before.best_seller ? 'on' : 'off'} → ${p.best_seller ? 'on' : 'off'}`);
    if (before.sale_featured !== Boolean(p.sale_featured)) changes.push(`sale featured: ${before.sale_featured ? 'on' : 'off'} → ${p.sale_featured ? 'on' : 'off'}`);
    if (Array.isArray(p.options)) {
      for (const o of p.options) {
        const b = before.options.find((x) => normName(x.label) === normName(o.label));
        if (b && b.price !== o.price) changes.push(`${o.label}: ${b.price} → ${o.price} Ks`);
        if (b && (b.stock ?? null) !== (o.stock ?? null)) changes.push(`${o.label} stock: ${b.stock == null ? '—' : b.stock} → ${o.stock == null ? '—' : o.stock}`);
      }
    }
    if (changes.length) await logActivity(req, 'product_update', 'product', p.id, `${p.name} — ${changes.join('; ')}`);
    return res.json(p);
  } catch (err) { return next(err); }
});

const XLSX = require('xlsx');

// Catalog Excel export / import (fix-batch-25). Export: one row per
// product — ID (match key, never edit), Name, Brand, Price, Sale Price,
// Stock Qty — plus a Read me sheet. Import matches rows by ID; a blank
// cell means "no change". Price/stock apply only to products without
// options (same rule as the per-product editor); sale price applies to
// all. Preview (?dry_run=1) shows what would change before anything is
// applied; apply (?dry_run=0) re-reads the file against current data.
const CATALOG_XLSX_COLUMNS = ['ID', 'Name', 'Brand', 'Price', 'Sale Price', 'Stock Qty'];

app.get('/api/manage/products/export', authMiddleware, managerMiddleware, async (_req, res, next) => {
  try {
    const products = await store.listProducts();
    // Option products keep price/stock per option, so those cells stay
    // blank here (edit them in the app) — a round-trip of an untouched
    // export must import as zero changes and zero skips.
    const rows = products.map((p) => {
      const hasOptions = Array.isArray(p.options) && p.options.length;
      return [
        p.id,
        p.name,
        p.brand,
        hasOptions ? '' : p.price,
        p.sale_price == null ? '' : p.sale_price,
        hasOptions ? '' : (p.stock == null ? '' : p.stock),
      ];
    });
    const ws = XLSX.utils.aoa_to_sheet([CATALOG_XLSX_COLUMNS, ...rows]);
    ws['!cols'] = [{ wch: 42 }, { wch: 48 }, { wch: 18 }, { wch: 12 }, { wch: 12 }, { wch: 12 }];
    const readme = XLSX.utils.aoa_to_sheet([
      ['Beauty & Me — Catalog Excel (Read me)'],
      [''],
      ['ID ကို ဘယ်တော့မှ မပြင်ပါနဲ့ — ဒါက ပစ္စည်း တိုက်ဆိုင်တဲ့ key ပါ။'],
      ['အလွတ်ထားတဲ့ cell က "မပြောင်းဘူး" လို့ ဆိုလိုပါတယ်။'],
      ['Price: ကိန်းဂဏန်း (0 ထက် ကြီးရမယ်) — option ရှိတဲ့ ပစ္စည်းတွေမှာ မပြောင်းပါ။'],
      ['Sale Price: ကိန်းဂဏန်း (0 နဲ့ အထက်) — option ရှိတဲ့ ပစ္စည်းတွေမှာလည်း ပြောင်းပါတယ်။'],
      ['Stock Qty: ကိန်းဂဏန်း အပြည့်အဝ (0 = ကုန်ပြီ) — option ရှိတဲ့ ပစ္စည်းတွေမှာ မပြောင်းပါ။'],
      ['Name / Brand ကို ဒီမှာ ပြင်လို့ မရပါ — app ထဲက Edit product မှာ ပြင်ပါ။'],
      ['ပုံတွေကို Excel နဲ့ မရပါ — app ထဲက ပုံထည့်မယ် မှာ တင်ပါ။'],
      ['Import လုပ်ခင် preview ပြပြီး confirm မှ အပ်ပါတယ်။'],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');
    XLSX.utils.book_append_sheet(wb, readme, 'Read me');
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const stamp = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="beauty-me-catalog-${stamp}.xlsx"`);
    return res.send(buf);
  } catch (err) { return next(err); }
});

function parseCatalogXlsx(buf) {
  const wb = XLSX.read(buf, { type: 'buffer' });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  if (!sheet) return { error: 'empty_file' };
  const aoa = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  if (!aoa.length) return { error: 'empty_file' };
  const header = aoa[0].map((h) => String(h || '').trim().toLowerCase());
  const col = {};
  const wanted = { id: ['id'], name: ['name'], brand: ['brand'], price: ['price'], sale_price: ['sale price', 'sale_price'], stock: ['stock qty', 'stock_qty', 'stock'] };
  for (const [name, keys] of Object.entries(wanted)) {
    const i = header.findIndex((h) => keys.includes(h));
    if (i >= 0) col[name] = i;
  }
  if (col.id === undefined) return { error: 'missing_id_column' };
  return { col, rows: aoa.slice(1) };
}

// Blank = no change (undefined). A real number = the new value.
// Anything else = invalid (null).
function catalogCellNumber(v) {
  if (v === '' || v === null || v === undefined) return undefined;
  if (typeof v === 'number') return v;
  const n = Number(String(v).trim());
  return Number.isFinite(n) ? n : null;
}

app.post('/api/manage/products/import', authMiddleware, managerMiddleware, express.raw({ limit: '10mb', type: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/octet-stream'] }), async (req, res, next) => {
  try {
    if (!Buffer.isBuffer(req.body) || !req.body.length) return res.status(400).json({ error: 'file_required' });
    let parsed;
    try { parsed = parseCatalogXlsx(req.body); } catch (e) { return res.status(400).json({ error: 'invalid_file' }); }
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    const { col, rows } = parsed;
    const dryRun = req.query.dry_run === '1';
    const products = await store.listProducts();
    const byId = new Map(products.map((p) => [String(p.id), p]));
    const changes = [];
    const skipped = [];
    const changedIds = new Set();
    const counts = { price: 0, sale_price: 0, stock: 0 };
    let rowNo = 1;
    let rowsSeen = 0;
    for (const row of rows) {
      rowNo++;
      if (!row || row.every((c) => c === '' || c === null || c === undefined)) continue;
      rowsSeen++;
      const id = String(row[col.id] || '').trim();
      if (!id) { skipped.push({ row: rowNo, reason: 'no_id' }); continue; }
      const p = byId.get(id);
      if (!p) { skipped.push({ row: rowNo, id, reason: 'unknown_id' }); continue; }
      const hasOptions = Array.isArray(p.options) && p.options.length > 0;
      // Validate everything first: one bad cell skips the whole row.
      const priceV = col.price !== undefined ? catalogCellNumber(row[col.price]) : undefined;
      const saleV = col.sale_price !== undefined ? catalogCellNumber(row[col.sale_price]) : undefined;
      const stockV = col.stock !== undefined ? catalogCellNumber(row[col.stock]) : undefined;
      if (priceV === null) { skipped.push({ row: rowNo, id, name: p.name, reason: 'invalid_price' }); continue; }
      if (saleV === null) { skipped.push({ row: rowNo, id, name: p.name, reason: 'invalid_sale_price' }); continue; }
      if (stockV === null) { skipped.push({ row: rowNo, id, name: p.name, reason: 'invalid_stock' }); continue; }
      if (priceV !== undefined && priceV <= 0) { skipped.push({ row: rowNo, id, name: p.name, reason: 'invalid_price' }); continue; }
      if (saleV !== undefined && saleV < 0) { skipped.push({ row: rowNo, id, name: p.name, reason: 'invalid_sale_price' }); continue; }
      if (stockV !== undefined && (!Number.isInteger(stockV) || stockV < 0)) { skipped.push({ row: rowNo, id, name: p.name, reason: 'invalid_stock' }); continue; }
      const patch = {};
      if (priceV !== undefined) {
        if (hasOptions) {
          if (priceV !== p.price) skipped.push({ row: rowNo, id, name: p.name, reason: 'option_price' });
        } else if (priceV !== p.price) patch.price = priceV;
      }
      if (saleV !== undefined && saleV !== (p.sale_price == null ? undefined : p.sale_price)) patch.sale_price = saleV;
      if (stockV !== undefined) {
        if (hasOptions) {
          if (stockV !== (p.stock == null ? undefined : p.stock)) skipped.push({ row: rowNo, id, name: p.name, reason: 'option_stock' });
        } else if (stockV !== (p.stock == null ? undefined : p.stock)) patch.stock = stockV;
      }
      if (!Object.keys(patch).length) continue;
      for (const [field, to] of Object.entries(patch)) {
        const from = field === 'price' ? p.price : field === 'sale_price' ? (p.sale_price == null ? null : p.sale_price) : (p.stock == null ? null : p.stock);
        changes.push({ id, name: p.name, field, from, to });
        counts[field]++;
      }
      changedIds.add(id);
      if (!dryRun) {
        Object.assign(p, patch);
        syncInStock(p);
        await store.saveProduct(p);
      }
    }
    const result = { dry_run: dryRun, total_rows: rowsSeen, products_changed: changedIds.size, counts, changes: changes.slice(0, 100), skipped: skipped.slice(0, 100), skipped_total: skipped.length };
    if (!dryRun && changedIds.size) {
      await logActivity(req, 'product_update', 'excel-import', 'catalog', `Excel import: updated ${changedIds.size} products (price: ${counts.price}, sale: ${counts.sale_price}, stock: ${counts.stock})`);
    }
    return res.json(result);
  } catch (err) { return next(err); }
});

// Product photo upload (manager only). Body {image_data} is a data URL —
// the frontend downscales to max 800px JPEG first, so uploads stay small.
// Stored as bytes in the images table (not a data URL on the product), so
// the catalog JSON stays small and the photo loads from this shop. WC
// import never overwrites it (import only fills products that have no
// image yet). Body {migrate: true} skips the per-photo activity entry —
// migration runs upload hundreds of photos and logs one summary instead.
app.post('/api/manage/products/:id/image', authMiddleware, managerMiddleware, async (req, res, next) => {
  try {
    const p = await store.getProduct(req.params.id);
    if (!p) return res.status(404).json({ error: 'product_not_found' });
    const { image_data, migrate } = req.body || {};
    if (typeof image_data !== 'string') return res.status(400).json({ error: 'image_required' });
    const m = image_data.match(/^data:image\/(jpeg|png|webp);base64,(.+)$/);
    if (!m) return res.status(400).json({ error: 'invalid_image' });
    const buf = Buffer.from(m[2], 'base64');
    if (buf.length > 1500 * 1024) return res.status(400).json({ error: 'image_too_large' });
    await store.saveImage(p.id, buf, 'image/' + m[1]);
    p.image_url = '/api/images/' + p.id;
    await store.saveProduct(p);
    if (!migrate) await logActivity(req, 'product_photo_add', 'product', p.id, p.name);
    return res.json({ ok: true, image_url: p.image_url });
  } catch (err) { return next(err); }
});

app.delete('/api/manage/products/:id/image', authMiddleware, managerMiddleware, async (req, res, next) => {
  try {
    const p = await store.getProduct(req.params.id);
    if (!p) return res.status(404).json({ error: 'product_not_found' });
    await store.deleteImage(p.id);
    p.image_url = null;
    await store.saveProduct(p);
    await logActivity(req, 'product_photo_remove', 'product', p.id, p.name);
    return res.json({ ok: true });
  } catch (err) { return next(err); }
});

app.get('/api/manage/coupons', authMiddleware, managerMiddleware, async (_req, res, next) => {
  try {
    const list = await store.listCoupons();
    await withCouponProductNames(list);
    return res.json(list);
  } catch (err) { return next(err); }
});

app.post('/api/manage/coupons', authMiddleware, managerMiddleware, async (req, res, next) => {
  try {
    const { code, type = 'percent', value, note = '', active = true, brands, products, customers } = req.body || {};
    if (!code || typeof value !== 'number') return res.status(400).json({ error: 'code_and_value_required' });
    const cleanArr = (v) => (Array.isArray(v) ? v.map((x) => String(x).trim()).filter(Boolean) : []);
    const coupon = {
      code: String(code).toUpperCase(), type, value, note, active: Boolean(active),
      brands: cleanArr(brands),
      products: cleanArr(products),
      // Customer scope is stored as normalised phones; invalid ones are dropped.
      customers: cleanArr(customers).map((p) => normalizePhone(p)).filter((p) => isValidMyanmarPhone(p)),
    };
    await store.saveCoupon(coupon);
    const scopeBits = [];
    if (coupon.brands.length) scopeBits.push('brands: ' + coupon.brands.join(', '));
    if (coupon.products.length) scopeBits.push(coupon.products.length + ' products');
    if (coupon.customers.length) scopeBits.push(coupon.customers.length + ' customers');
    await logActivity(req, 'coupon_create', 'coupon', coupon.code, `${coupon.type} ${coupon.value}${coupon.type === 'percent' ? '%' : ' Ks'}${scopeBits.length ? ' — ' + scopeBits.join('; ') : ''}`);
    return res.status(201).json(coupon);
  } catch (err) { return next(err); }
});

app.delete('/api/manage/coupons/:code', authMiddleware, managerMiddleware, async (req, res, next) => {
  try {
    await store.deleteCoupon(req.params.code);
    await logActivity(req, 'coupon_delete', 'coupon', String(req.params.code).toUpperCase(), String(req.params.code).toUpperCase());
    return res.json({ ok: true });
  } catch (err) { return next(err); }
});

app.get('/api/manage/payments', authMiddleware, ownerMiddleware, async (_req, res, next) => {
  try { return res.json(await store.listPayments()); } catch (err) { return next(err); }
});

app.put('/api/manage/payments', authMiddleware, ownerMiddleware, async (req, res, next) => {
  try {
    const accounts = req.body;
    if (!Array.isArray(accounts)) return res.status(400).json({ error: 'array_required' });
    for (const a of accounts) {
      if (!a.method || !a.account_number) return res.status(400).json({ error: 'method_and_account_required' });
    }
    await store.savePayments(accounts.map((a, i) => ({
      id: a.id || `account-${i + 1}`,
      method: a.method,
      account_name: a.account_name || '',
      account_number: a.account_number,
      note: a.note || '',
    })));
    await logActivity(req, 'payments_update', 'settings', 'payments', `${accounts.length} payment accounts`);
    return res.json(await store.listPayments());
  } catch (err) { return next(err); }
});

app.get('/api/manage/app-links', authMiddleware, ownerMiddleware, async (_req, res, next) => {
  try {
    const links = (await store.getSetting('app_links')) || {};
    return res.json({ play_store_url: links.play_store_url || '', app_store_url: links.app_store_url || '' });
  } catch (err) { return next(err); }
});

app.put('/api/manage/app-links', authMiddleware, ownerMiddleware, async (req, res, next) => {
  try {
    const { play_store_url = '', app_store_url = '' } = req.body || {};
    const links = { play_store_url: String(play_store_url), app_store_url: String(app_store_url) };
    await store.setSetting('app_links', links);
    await logActivity(req, 'app_links_update', 'settings', 'app_links', 'store links updated');
    return res.json(links);
  } catch (err) { return next(err); }
});

app.get('/api/manage/settings/woocommerce', authMiddleware, ownerMiddleware, async (_req, res, next) => {
  try {
    const wc = await getWooConfig();
    return res.json({
      configured: Boolean(wc.site_url && wc.consumer_key && wc.consumer_secret),
      site_url: wc.site_url || '',
      consumer_key_masked: maskSecret(wc.consumer_key),
      consumer_secret_masked: maskSecret(wc.consumer_secret),
    });
  } catch (err) { return next(err); }
});

app.put('/api/manage/settings/woocommerce', authMiddleware, ownerMiddleware, async (req, res, next) => {
  try {
    const { site_url, consumer_key, consumer_secret } = req.body || {};
    const current = (await store.getSetting('woocommerce')) || {};
    const updated = {
      site_url: site_url !== undefined ? String(site_url).trim() : (current.site_url || ''),
      consumer_key: consumer_key !== undefined ? String(consumer_key).trim() : (current.consumer_key || ''),
      consumer_secret: consumer_secret !== undefined ? String(consumer_secret).trim() : (current.consumer_secret || ''),
    };
    await store.setSetting('woocommerce', updated);
    // Never log the key values — only that the settings changed.
    await logActivity(req, 'woocommerce_settings', 'settings', 'woocommerce', 'WooCommerce settings updated');
    return res.json({
      configured: Boolean(updated.site_url && updated.consumer_key && updated.consumer_secret),
      site_url: updated.site_url,
      consumer_key_masked: maskSecret(updated.consumer_key),
      consumer_secret_masked: maskSecret(updated.consumer_secret),
    });
  } catch (err) { return next(err); }
});

app.post('/api/manage/woocommerce/test', authMiddleware, ownerMiddleware, async (_req, res, next) => {
  try {
    const wc = await getWooConfig();
    if (!wc.site_url || !wc.consumer_key || !wc.consumer_secret) {
      return res.json({ ok: false, message: 'WooCommerce is not configured yet — add site URL, consumer key and secret in Manage.' });
    }
    let response;
    try {
      response = await wcFetch(wc, 'products?per_page=1', 10000);
    } catch (err) {
      return res.json({ ok: false, message: `Could not reach ${wc.site_url}: ${err.name === 'AbortError' ? 'request timed out (10s)' : err.message}` });
    }
    if (!response.ok) {
      return res.json({ ok: false, message: `WooCommerce replied HTTP ${response.status} — check the site URL and API key.` });
    }
    return res.json({ ok: true, message: 'Connected to WooCommerce — the API key works.' });
  } catch (err) { return next(err); }
});

// One WC products page, with retries: the WP host / Cloudflare sometimes
// drops or slow-responds to a single request even when the API key works.
async function fetchWcPage(wc, page, perPage) {
  let lastErr = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await wcFetch(wc, `products?per_page=${perPage}&page=${page}&_fields=id,name,sku,price,images`, 60000);
      if (!res.ok) throw new Error(`WooCommerce replied HTTP ${res.status} on page ${page}`);
      return res;
    } catch (err) {
      lastErr = err;
      if (attempt < 3) await new Promise((r) => setTimeout(r, 2000));
    }
  }
  throw lastErr;
}

async function fetchAllWcProducts(wc, onProgress) {
  const perPage = 50;
  const first = await fetchWcPage(wc, 1, perPage);
  const totalPages = parseInt(first.headers.get('x-wp-totalpages') || '1', 10) || 1;
  const all = await first.json();
  if (onProgress) onProgress(1, totalPages);
  for (let page = 2; page <= totalPages; page++) {
    await new Promise((r) => setTimeout(r, 500));
    const res = await fetchWcPage(wc, page, perPage);
    all.push(...await res.json());
    if (onProgress) onProgress(page, totalPages);
  }
  return all;
}

function buildWcMatchIndex(products) {
  const bySku = new Map();
  const byName = new Map();
  for (const p of products) {
    byName.set(normName(p.name), p);
    if (p.sku) bySku.set(String(p.sku), p);
    if (Array.isArray(p.options)) {
      for (const o of p.options) if (o.sku) bySku.set(String(o.sku), p);
    }
  }
  return { bySku, byName };
}

// Match a WooCommerce product list against the POS catalog. Pure function
// of the list — used both by the server-side job and by the browser-side
// flow (preview-data), which sends the list it fetched itself.
async function matchWcProducts(wcProducts) {
  const posProducts = await store.listProducts();
  const { bySku, byName } = buildWcMatchIndex(posProducts);

  const matched = [];
  const matchedPosIds = new Set();
  let wcOnly = 0;
  for (const w of wcProducts) {
    const pos = (w.sku && bySku.get(String(w.sku)))
      || byName.get(normName(w.name))
      || null;
    if (!pos) { wcOnly++; continue; }
    matchedPosIds.add(pos.id);
    const wcPrice = Number(w.price) || 0;
    const wcImage = Array.isArray(w.images) && w.images[0] ? w.images[0].src : null;
    matched.push({
      product_id: pos.id,
      pos_name: pos.name,
      wc_name: w.name,
      wc_image: wcImage,
      wc_id: w.id,
      price_diff: wcPrice - pos.price,
    });
  }
  const posOnly = posProducts
    .filter((p) => !matchedPosIds.has(p.id))
    .map((p) => ({ product_id: p.id, name: p.name }));
  return {
    matched,
    pos_only: posOnly,
    wc_only_count: wcOnly,
    totals: {
      wc_total: wcProducts.length,
      pos_total: posProducts.length,
      matched_count: matched.length,
      pos_only_count: posOnly.length,
    },
  };
}

async function runWcPreview(onProgress) {
  const wc = await getWooConfig();
  if (!wc.site_url || !wc.consumer_key || !wc.consumer_secret) {
    const err = new Error('WooCommerce is not configured yet.');
    err.status = 400;
    throw err;
  }
  const wcProducts = await fetchAllWcProducts(wc, onProgress);
  return matchWcProducts(wcProducts);
}

// WooCommerce Preview/Import run as background jobs: fetching every WC
// product can take minutes on a slow host, far longer than a single HTTP
// request is allowed to stay open (the proxy answers with an HTML error
// page when it gives up). The browser starts a job and polls for it.
const wooJobs = new Map();
let wooJobSeq = 0;
function createWooJob(kind) {
  const id = `woo-${Date.now().toString(36)}-${++wooJobSeq}`;
  const job = { id, kind, status: 'running', progress: null, result: null, error: null, started_at: new Date().toISOString() };
  wooJobs.set(id, job);
  return job;
}

app.post('/api/manage/woocommerce/preview', authMiddleware, ownerMiddleware, async (_req, res) => {
  const job = createWooJob('preview');
  runWcPreview((page, totalPages) => { job.progress = { page, total_pages: totalPages }; })
    .then((result) => { job.status = 'done'; job.result = result; })
    .catch((err) => { job.status = 'error'; job.error = err.message || 'server_error'; });
  return res.json({ job_id: job.id, status: 'running' });
});

app.get('/api/manage/woocommerce/jobs/:id', authMiddleware, ownerMiddleware, (req, res) => {
  const job = wooJobs.get(req.params.id);
  if (!job) return res.status(404).json({ error: 'job_not_found' });
  return res.json(job);
});

app.post('/api/manage/woocommerce/import', authMiddleware, ownerMiddleware, async (_req, res) => {
  const job = createWooJob('import');
  (async () => {
    const preview = await runWcPreview((page, totalPages) => { job.progress = { page, total_pages: totalPages, phase: 'fetch' }; });
    let updated = 0;
    let alreadyHadImage = 0;
    for (const m of preview.matched) {
      const p = await store.getProduct(m.product_id);
      if (!p) continue;
      if (p.image_url) { alreadyHadImage++; continue; }
      if (m.wc_image) p.image_url = m.wc_image;
      p.wc_id = m.wc_id;
      await store.saveProduct(p);
      updated++;
    }
    return {
      updated,
      already_had_image: alreadyHadImage,
      pos_only_kept: preview.totals.pos_only_count,
    };
  })()
    .then((result) => { job.status = 'done'; job.result = result; })
    .catch((err) => { job.status = 'error'; job.error = err.message || 'server_error'; });
  return res.json({ job_id: job.id, status: 'running' });
});

// ---------- browser-side WooCommerce (primary path) ----------
// The Render server sits in a country the WP host geo-blocks ("Your
// country is blocked" → 302 to /block.html), so server-side WC fetches
// fail even though the key works. The manager's browser in Myanmar is
// allowed in, so the browser fetches WooCommerce directly and sends the
// product list here for matching / applying. The key is handed only to
// the manager session, over HTTPS, and lives in browser memory only —
// never stored in the browser. (The server-side jobs above stay as a
// fallback for a future host that is not geo-blocked.)
app.get('/api/manage/woocommerce/credentials', authMiddleware, ownerMiddleware, async (_req, res, next) => {
  try {
    const wc = await getWooConfig();
    if (!wc.site_url || !wc.consumer_key || !wc.consumer_secret) {
      return res.status(400).json({ error: 'woocommerce_not_configured' });
    }
    return res.json({ site_url: wc.site_url, consumer_key: wc.consumer_key, consumer_secret: wc.consumer_secret });
  } catch (err) { return next(err); }
});

app.post('/api/manage/woocommerce/preview-data', authMiddleware, ownerMiddleware, async (req, res, next) => {
  try {
    const wcProducts = req.body && Array.isArray(req.body.wc_products) ? req.body.wc_products : null;
    if (!wcProducts) return res.status(400).json({ error: 'wc_products_required' });
    return res.json(await matchWcProducts(wcProducts));
  } catch (err) { return next(err); }
});

app.post('/api/manage/woocommerce/import-data', authMiddleware, ownerMiddleware, async (req, res, next) => {
  try {
    const matched = req.body && Array.isArray(req.body.matched) ? req.body.matched : null;
    if (!matched) return res.status(400).json({ error: 'matched_required' });
    let updated = 0;
    let alreadyHadImage = 0;
    const matchedIds = new Set();
    for (const m of matched) {
      if (!m || !m.product_id) continue;
      matchedIds.add(m.product_id);
      const p = await store.getProduct(m.product_id);
      if (!p) continue;
      if (p.image_url) { alreadyHadImage++; continue; }
      if (!m.wc_image) continue;
      p.image_url = m.wc_image;
      if (m.wc_id) p.wc_id = m.wc_id;
      await store.saveProduct(p);
      updated++;
    }
    const posProducts = await store.listProducts();
    const posOnlyKept = posProducts.filter((p) => !matchedIds.has(p.id)).length;
    await logActivity(req, 'woocommerce_import', 'woocommerce', 'import', `images updated: ${updated}, already had image: ${alreadyHadImage}, POS-only kept: ${posOnlyKept}`);
    return res.json({ updated, already_had_image: alreadyHadImage, pos_only_kept: posOnlyKept });
  } catch (err) { return next(err); }
});

// ---------- Manage: move WooCommerce photos into this shop ----------
// The shop's product photos still point at the old WordPress site. If that
// site goes slow or down, customer photos break. These endpoints move the
// photos into this shop's own database (images table), one product at a
// time from Pyae's browser (the shop server is geo-blocked from WordPress,
// Pyae's browser in Myanmar is not) or in one ZIP upload.
//
// After migration a product's image_url is '/api/images/<id>' — WooCommerce
// import never overwrites it (import only fills products with no image).

const ZIP_IMAGE_EXTS = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif' };
const MAX_MIGRATED_IMAGE_BYTES = 1500 * 1024;

// https://www.beautyandmemyanmar.com/wp-content/uploads/2023/11/hh.jpg -> 2023/11/hh.jpg
function wpUploadsRelPath(imageUrl) {
  const m = String(imageUrl || '').match(/\/wp-content\/uploads\/(.+)$/);
  return m ? m[1] : null;
}

// ZIP entries may carry any leading folders (wp-content/uploads/…,
// uploads/…, a domain folder, …) — keep only what follows 'uploads/'.
function zipEntryRelPath(name) {
  let n = String(name || '').replace(/\\/g, '/').replace(/^\.\//, '');
  const i = n.indexOf('uploads/');
  if (i >= 0) n = n.slice(i + 'uploads/'.length);
  return n;
}

app.get('/api/manage/migrate-images/list', authMiddleware, ownerMiddleware, async (_req, res, next) => {
  try {
    const products = await store.listProducts();
    const external = products.filter((p) => p.image_url && /^https?:\/\//.test(p.image_url));
    const migrated = products.filter((p) => p.image_url && String(p.image_url).startsWith('/api/images/')).length;
    const noImage = products.filter((p) => !p.image_url).length;
    return res.json({
      total: products.length,
      external: external.length,
      migrated,
      no_image: noImage,
      items: external.map((p) => ({ id: p.id, name: p.name, image_url: p.image_url })),
    });
  } catch (err) { return next(err); }
});

// One summary log entry per browser migration run (the per-photo upload
// endpoint skips logging when called with {migrate: true}).
app.post('/api/manage/migrate-images/summary', authMiddleware, ownerMiddleware, async (req, res, next) => {
  try {
    const b = req.body || {};
    const migrated = Number(b.migrated) || 0;
    const failed = Number(b.failed) || 0;
    const names = Array.isArray(b.failed_names) ? b.failed_names.slice(0, 10) : [];
    await logActivity(req, 'image_migrate', 'images', 'browser', `migrated: ${migrated}, failed: ${failed}` + (names.length ? ` — ${names.join('; ')}` : ''));
    return res.json({ ok: true });
  } catch (err) { return next(err); }
});

// ZIP upload: the whole wp-content/uploads folder as one ZIP. The raw body
// is used (no multipart parser dependency); adm-zip extracts in memory.
app.post('/api/manage/migrate-images/zip', authMiddleware, ownerMiddleware, express.raw({ limit: '100mb', type: 'application/zip' }), async (req, res, next) => {
  try {
    if (!Buffer.isBuffer(req.body) || !req.body.length) return res.status(400).json({ error: 'zip_required' });
    let zip;
    try { zip = new AdmZip(req.body); } catch (e) { return res.status(400).json({ error: 'invalid_zip' }); }
    const entries = zip.getEntries().filter((e) => !e.isDirectory);
    if (entries.length > 5000) return res.status(400).json({ error: 'zip_too_large' });
    const byPath = new Map();
    const byBase = new Map();
    for (const e of entries) {
      const rel = zipEntryRelPath(e.entryName);
      if (!rel || rel.includes('..')) continue;
      if (!byPath.has(rel)) byPath.set(rel, e);
      const base = rel.split('/').pop();
      if (!byBase.has(base)) byBase.set(base, []);
      byBase.get(base).push(e);
    }
    const products = await store.listProducts();
    const external = products.filter((p) => p.image_url && /^https?:\/\//.test(p.image_url));
    let migrated = 0;
    const missing = [];
    const tooLarge = [];
    const ambiguous = [];
    for (const p of external) {
      const rel = wpUploadsRelPath(p.image_url);
      let entry = rel ? byPath.get(rel) : null;
      if (!entry) {
        // Fall back to the file name alone (some exports flatten folders).
        const base = String(p.image_url).split('/').pop();
        const cands = byBase.get(base) || [];
        if (cands.length === 1) entry = cands[0];
        else if (cands.length > 1) { ambiguous.push(p.name); continue; }
      }
      if (!entry) { missing.push(p.name); continue; }
      const ext = path.extname(entry.entryName).toLowerCase();
      const mime = ZIP_IMAGE_EXTS[ext];
      if (!mime) { missing.push(p.name); continue; }
      const buf = entry.getData();
      if (buf.length > MAX_MIGRATED_IMAGE_BYTES) { tooLarge.push(p.name); continue; }
      await store.saveImage(p.id, buf, mime);
      p.image_url = '/api/images/' + p.id;
      await store.saveProduct(p);
      migrated++;
    }
    await logActivity(req, 'image_migrate', 'images', 'zip', `migrated: ${migrated}, missing: ${missing.length}, too large: ${tooLarge.length}, ambiguous: ${ambiguous.length}`);
    return res.json({ migrated, missing, too_large: tooLarge, ambiguous, total_external: external.length });
  } catch (err) { return next(err); }
});

// Remove every external (WordPress-hosted) product photo, so staff can
// see which products still need a photo re-added in the shop. Only
// http(s) URLs are cleared; photos already stored in the shop
// (/api/images/…) are left untouched, as are products with no photo.
app.post('/api/manage/migrate-images/remove-external', authMiddleware, ownerMiddleware, async (req, res, next) => {
  try {
    const products = await store.listProducts();
    const external = products.filter((p) => p.image_url && /^https?:\/\//.test(p.image_url));
    for (const p of external) {
      p.image_url = null;
      await store.saveProduct(p);
    }
    await logActivity(req, 'image_migrate', 'images', 'remove-external', `removed external photos: ${external.length}`);
    return res.json({ removed: external.length });
  } catch (err) { return next(err); }
});

// ---------- static / SPA fallback ----------

app.get('/', (_req, res) => {
  const index = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(index)) return res.sendFile(index);
  return res.status(503).json({ error: 'frontend_not_built_yet', api: '/api/health' });
});

// ---------- errors & startup ----------

app.use((err, _req, res, _next) => {
  console.error(err);
  return res.status(500).json({ error: err.message || 'server_error' });
});

store.init()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Beauty & Me shop backend listening on port ${PORT} (store: ${store.backend})`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialise storage:', err);
    process.exit(1);
  });
