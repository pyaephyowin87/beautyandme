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
 */
'use strict';

const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
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

function publicUser(user) {
  return { id: user.id, name: user.name, phone: user.phone, is_manager: user.phone === MANAGER_PHONE };
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

function managerMiddleware(req, res, next) {
  if (!req.user || req.user.phone !== MANAGER_PHONE) {
    return res.status(403).json({ error: 'forbidden' });
  }
  return next();
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
    else if (section === 'sale') items = items.filter((p) => p.sale_price != null && p.sale_price < p.price);

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
    return res.json({ token, user: publicUser(user) });
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
    return res.json({ token: user.token, user: publicUser(user) });
  } catch (err) { return next(err); }
});

app.get('/api/me', authMiddleware, (req, res) => res.json({ user: publicUser(req.user) }));

app.post('/api/coupons/validate', async (req, res, next) => {
  try {
    const { code } = req.body || {};
    const coupon = await store.getCoupon(code);
    if (!coupon || coupon.active === false) return res.json({ valid: false });
    return res.json({ valid: true, code: coupon.code, type: coupon.type || 'percent', value: coupon.value });
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
      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        option_label: optionLabel,
        qty,
        unit_price: unitPrice,
        line_total: lineTotal,
      });
    }

    // Coupon: percent off subtotal.
    let discount = 0;
    let coupon = null;
    if (coupon_code) {
      coupon = await store.getCoupon(coupon_code);
      if (!coupon || coupon.active === false) return res.status(400).json({ error: 'invalid_coupon' });
      if (coupon.type === 'percent') discount = Math.round((subtotal * Number(coupon.value)) / 100);
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

    // Payment screenshot (transfer only): save file, never echo the data back.
    let screenshotPath = null;
    if (payment.screenshot_data) {
      const m = String(payment.screenshot_data).match(/^data:(image\/[a-z]+);base64,(.+)$/);
      if (!m) return res.status(400).json({ error: 'invalid_screenshot' });
      const buf = Buffer.from(m[2], 'base64');
      if (buf.length > 2 * 1024 * 1024) return res.status(400).json({ error: 'screenshot_too_large' });
      fs.mkdirSync(store.uploadsDir, { recursive: true });
      const filePath = path.join(store.uploadsDir, `${orderId}.jpg`);
      fs.writeFileSync(filePath, buf);
      screenshotPath = `data/uploads/${orderId}.jpg`;
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
    };
    // NOTE: POS controls stock — placing an order does NOT change product
    // stock here. Stock is managed in POS and re-seeded/synced separately.
    await store.saveOrder(order);

    const { screenshot_path: _sp, ...rest } = order;
    void _sp;
    return res.status(201).json({ order: rest });
  } catch (err) { return next(err); }
});

app.get('/api/orders', authMiddleware, async (req, res, next) => {
  try {
    const all = await store.listOrders();
    const mine = req.user.phone === MANAGER_PHONE
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
    const isManager = req.user.phone === MANAGER_PHONE;
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
    const total = items.length;
    return res.json({ items: items.slice(offset, offset + limit), total });
  } catch (err) { return next(err); }
});

app.patch('/api/manage/products/:id', authMiddleware, managerMiddleware, async (req, res, next) => {
  try {
    const p = await store.getProduct(req.params.id);
    if (!p) return res.status(404).json({ error: 'product_not_found' });
    const { sale_price, is_new, best_seller } = req.body || {};
    if (sale_price !== undefined) {
      if (sale_price !== null && (typeof sale_price !== 'number' || sale_price < 0)) {
        return res.status(400).json({ error: 'invalid_sale_price' });
      }
      p.sale_price = sale_price;
    }
    if (is_new !== undefined) p.is_new = Boolean(is_new);
    if (best_seller !== undefined) p.best_seller = Boolean(best_seller);
    await store.saveProduct(p);
    return res.json(p);
  } catch (err) { return next(err); }
});

app.get('/api/manage/coupons', authMiddleware, managerMiddleware, async (_req, res, next) => {
  try { return res.json(await store.listCoupons()); } catch (err) { return next(err); }
});

app.post('/api/manage/coupons', authMiddleware, managerMiddleware, async (req, res, next) => {
  try {
    const { code, type = 'percent', value, note = '', active = true } = req.body || {};
    if (!code || typeof value !== 'number') return res.status(400).json({ error: 'code_and_value_required' });
    const coupon = { code: String(code).toUpperCase(), type, value, note, active: Boolean(active) };
    await store.saveCoupon(coupon);
    return res.status(201).json(coupon);
  } catch (err) { return next(err); }
});

app.delete('/api/manage/coupons/:code', authMiddleware, managerMiddleware, async (req, res, next) => {
  try {
    await store.deleteCoupon(req.params.code);
    return res.json({ ok: true });
  } catch (err) { return next(err); }
});

app.get('/api/manage/payments', authMiddleware, managerMiddleware, async (_req, res, next) => {
  try { return res.json(await store.listPayments()); } catch (err) { return next(err); }
});

app.put('/api/manage/payments', authMiddleware, managerMiddleware, async (req, res, next) => {
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
    return res.json(await store.listPayments());
  } catch (err) { return next(err); }
});

app.get('/api/manage/app-links', authMiddleware, managerMiddleware, async (_req, res, next) => {
  try {
    const links = (await store.getSetting('app_links')) || {};
    return res.json({ play_store_url: links.play_store_url || '', app_store_url: links.app_store_url || '' });
  } catch (err) { return next(err); }
});

app.put('/api/manage/app-links', authMiddleware, managerMiddleware, async (req, res, next) => {
  try {
    const { play_store_url = '', app_store_url = '' } = req.body || {};
    const links = { play_store_url: String(play_store_url), app_store_url: String(app_store_url) };
    await store.setSetting('app_links', links);
    return res.json(links);
  } catch (err) { return next(err); }
});

app.get('/api/manage/settings/woocommerce', authMiddleware, managerMiddleware, async (_req, res, next) => {
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

app.put('/api/manage/settings/woocommerce', authMiddleware, managerMiddleware, async (req, res, next) => {
  try {
    const { site_url, consumer_key, consumer_secret } = req.body || {};
    const current = (await store.getSetting('woocommerce')) || {};
    const updated = {
      site_url: site_url !== undefined ? String(site_url).trim() : (current.site_url || ''),
      consumer_key: consumer_key !== undefined ? String(consumer_key).trim() : (current.consumer_key || ''),
      consumer_secret: consumer_secret !== undefined ? String(consumer_secret).trim() : (current.consumer_secret || ''),
    };
    await store.setSetting('woocommerce', updated);
    return res.json({
      configured: Boolean(updated.site_url && updated.consumer_key && updated.consumer_secret),
      site_url: updated.site_url,
      consumer_key_masked: maskSecret(updated.consumer_key),
      consumer_secret_masked: maskSecret(updated.consumer_secret),
    });
  } catch (err) { return next(err); }
});

app.post('/api/manage/woocommerce/test', authMiddleware, managerMiddleware, async (_req, res, next) => {
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

app.post('/api/manage/woocommerce/preview', authMiddleware, managerMiddleware, async (_req, res) => {
  const job = createWooJob('preview');
  runWcPreview((page, totalPages) => { job.progress = { page, total_pages: totalPages }; })
    .then((result) => { job.status = 'done'; job.result = result; })
    .catch((err) => { job.status = 'error'; job.error = err.message || 'server_error'; });
  return res.json({ job_id: job.id, status: 'running' });
});

app.get('/api/manage/woocommerce/jobs/:id', authMiddleware, managerMiddleware, (req, res) => {
  const job = wooJobs.get(req.params.id);
  if (!job) return res.status(404).json({ error: 'job_not_found' });
  return res.json(job);
});

app.post('/api/manage/woocommerce/import', authMiddleware, managerMiddleware, async (_req, res) => {
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
app.get('/api/manage/woocommerce/credentials', authMiddleware, managerMiddleware, async (_req, res, next) => {
  try {
    const wc = await getWooConfig();
    if (!wc.site_url || !wc.consumer_key || !wc.consumer_secret) {
      return res.status(400).json({ error: 'woocommerce_not_configured' });
    }
    return res.json({ site_url: wc.site_url, consumer_key: wc.consumer_key, consumer_secret: wc.consumer_secret });
  } catch (err) { return next(err); }
});

app.post('/api/manage/woocommerce/preview-data', authMiddleware, managerMiddleware, async (req, res, next) => {
  try {
    const wcProducts = req.body && Array.isArray(req.body.wc_products) ? req.body.wc_products : null;
    if (!wcProducts) return res.status(400).json({ error: 'wc_products_required' });
    return res.json(await matchWcProducts(wcProducts));
  } catch (err) { return next(err); }
});

app.post('/api/manage/woocommerce/import-data', authMiddleware, managerMiddleware, async (req, res, next) => {
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
    return res.json({ updated, already_had_image: alreadyHadImage, pos_only_kept: posOnlyKept });
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
