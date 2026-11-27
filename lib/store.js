/**
 * Storage layer — one async interface for all routes.
 *
 * Backend 1 (default): JSON files in data/ (products, orders, users, coupons,
 * settings, payments, screenshots).
 * Backend 2: Postgres when process.env.DATABASE_URL is set. Tables are created
 * if missing; on first start, if the tables are empty, the JSON seed files
 * (data/products.json, data/coupons.json, data/payments.json) are imported.
 *
 * Payment screenshots live in the database (screenshots table / JSON file),
 * NOT on disk — Render's free disk is wiped on every deploy, which used to
 * delete every screenshot while the order still claimed to have one.
 *
 * Product photos live in the database too (images table / JSON file) since
 * fix-batch-20 — migrated from WooCommerce so customer photos no longer
 * depend on the old WordPress site being up, and served via /api/images/:id
 * so the catalog JSON stays small (a short URL per product, not a data URL).
 *
 * No stock quantities ever leave this module for customer routes — the route
 * layer strips them. Manage routes use the full records.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

const JSON_FILES = {
  products: 'products.json',
  orders: 'orders.json',
  users: 'users.json',
  coupons: 'coupons.json',
  settings: 'settings.json',
  payments: 'payments.json',
  screenshots: 'screenshots.json',
  images: 'images.json',
  activity: 'activity.json',
  password_resets: 'password_resets.json',
  device_tokens: 'device_tokens.json',
};

const usePg = Boolean(process.env.DATABASE_URL);
let pool = null;
let pgReady = null;

if (usePg) {
  const { Pool } = require('pg');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
}

function readJson(name, fallback) {
  const file = path.join(DATA_DIR, JSON_FILES[name]);
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') return fallback;
    throw err;
  }
}

function writeJson(name, data) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = path.join(DATA_DIR, `.${JSON_FILES[name]}.tmp`);
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, path.join(DATA_DIR, JSON_FILES[name]));
}

// ---------- Postgres ----------

const CREATE_TABLES = `
CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, data JSONB NOT NULL);
CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, data JSONB NOT NULL);
CREATE TABLE IF NOT EXISTS users (phone TEXT PRIMARY KEY, data JSONB NOT NULL);
CREATE TABLE IF NOT EXISTS coupons (code TEXT PRIMARY KEY, data JSONB NOT NULL);
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value JSONB NOT NULL);
CREATE TABLE IF NOT EXISTS payments (id TEXT PRIMARY KEY, data JSONB NOT NULL);
CREATE TABLE IF NOT EXISTS screenshots (order_id TEXT PRIMARY KEY, image_data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS images (id TEXT PRIMARY KEY, mime TEXT NOT NULL, data BYTEA NOT NULL);
CREATE TABLE IF NOT EXISTS activity (id TEXT PRIMARY KEY, data JSONB NOT NULL);
CREATE TABLE IF NOT EXISTS password_resets (token_hash TEXT PRIMARY KEY, data JSONB NOT NULL);
CREATE TABLE IF NOT EXISTS device_tokens (token TEXT PRIMARY KEY, data JSONB NOT NULL);
`;

async function pgInit() {
  await pool.query(CREATE_TABLES);
  // Seed from JSON files on first start if the tables are empty.
  const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM products');
  if (rows[0].n === 0) {
    const seedProducts = readJson('products', []);
    const seedCoupons = readJson('coupons', []);
    const seedPayments = readJson('payments', []);
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const p of seedProducts) {
        await client.query('INSERT INTO products (id, data) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING', [p.id, p]);
      }
      for (const c of seedCoupons) {
        await client.query('INSERT INTO coupons (code, data) VALUES ($1, $2) ON CONFLICT (code) DO NOTHING', [c.code, c]);
      }
      for (const pay of seedPayments) {
        await client.query('INSERT INTO payments (id, data) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING', [pay.id, pay]);
      }
      await client.query('COMMIT');
      console.log(`[store] Postgres seeded from JSON: ${seedProducts.length} products, ${seedCoupons.length} coupons, ${seedPayments.length} payments`);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

function ensurePg() {
  if (!usePg) return Promise.resolve();
  if (!pgReady) pgReady = pgInit().catch((err) => { pgReady = null; throw err; });
  return pgReady;
}

async function pgAll(table) {
  await ensurePg();
  const { rows } = await pool.query(`SELECT data FROM ${table} ORDER BY data->>'name' ASC`);
  return rows.map((r) => r.data);
}

async function pgGet(table, keyCol, key) {
  await ensurePg();
  const { rows } = await pool.query(`SELECT data FROM ${table} WHERE ${keyCol} = $1`, [key]);
  return rows[0] ? rows[0].data : null;
}

async function pgUpsert(table, keyCol, key, data) {
  await ensurePg();
  await pool.query(
    `INSERT INTO ${table} (${keyCol}, data) VALUES ($1, $2) ON CONFLICT (${keyCol}) DO UPDATE SET data = EXCLUDED.data`,
    [key, data],
  );
  return data;
}

async function pgDelete(table, keyCol, key) {
  await ensurePg();
  await pool.query(`DELETE FROM ${table} WHERE ${keyCol} = $1`, [key]);
}

// ---------- Public interface ----------

const store = {
  get uploadsDir() { return UPLOADS_DIR; },
  get backend() { return usePg ? 'postgres' : 'json'; },

  async init() {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    if (usePg) await ensurePg();
  },

  // --- Products ---
  async listProducts() {
    return usePg ? pgAll('products') : readJson('products', []);
  },
  async getProduct(id) {
    if (usePg) return pgGet('products', 'id', id);
    return readJson('products', []).find((p) => p.id === id) || null;
  },
  async saveProduct(product) {
    if (usePg) return pgUpsert('products', 'id', product.id, product);
    const all = readJson('products', []);
    const i = all.findIndex((p) => p.id === product.id);
    if (i >= 0) all[i] = product; else all.push(product);
    writeJson('products', all);
    return product;
  },

  // --- Orders ---
  async listOrders() {
    return usePg ? pgAll('orders') : readJson('orders', []);
  },
  async getOrder(id) {
    if (usePg) return pgGet('orders', 'id', id);
    return readJson('orders', []).find((o) => o.id === id) || null;
  },
  async saveOrder(order) {
    if (usePg) return pgUpsert('orders', 'id', order.id, order);
    const all = readJson('orders', []);
    const i = all.findIndex((o) => o.id === order.id);
    if (i >= 0) all[i] = order; else all.push(order);
    writeJson('orders', all);
    return order;
  },

  // --- Users (keyed by phone) ---
  async getUserByPhone(phone) {
    if (usePg) return pgGet('users', 'phone', phone);
    return readJson('users', []).find((u) => u.phone === phone) || null;
  },
  async listUsers() {
    return usePg ? pgAll('users') : readJson('users', []);
  },
  async saveUser(user) {
    if (usePg) return pgUpsert('users', 'phone', user.phone, user);
    const all = readJson('users', []);
    const i = all.findIndex((u) => u.phone === user.phone);
    if (i >= 0) all[i] = user; else all.push(user);
    writeJson('users', all);
    return user;
  },

  // --- Coupons ---
  async listCoupons() {
    return usePg ? pgAll('coupons') : readJson('coupons', []);
  },
  async getCoupon(code) {
    if (!code) return null;
    const c = String(code).toUpperCase();
    if (usePg) return pgGet('coupons', 'code', c);
    return readJson('coupons', []).find((x) => String(x.code).toUpperCase() === c) || null;
  },
  async saveCoupon(coupon) {
    const code = String(coupon.code).toUpperCase();
    coupon.code = code;
    if (usePg) return pgUpsert('coupons', 'code', code, coupon);
    const all = readJson('coupons', []);
    const i = all.findIndex((x) => String(x.code).toUpperCase() === code);
    if (i >= 0) all[i] = coupon; else all.push(coupon);
    writeJson('coupons', all);
    return coupon;
  },
  async deleteCoupon(code) {
    const c = String(code).toUpperCase();
    if (usePg) return pgDelete('coupons', 'code', c);
    writeJson('coupons', readJson('coupons', []).filter((x) => String(x.code).toUpperCase() !== c));
  },

  // --- Settings (key/value) ---
  async getSetting(key) {
    if (usePg) {
      await ensurePg();
      const { rows } = await pool.query('SELECT value FROM settings WHERE key = $1', [key]);
      return rows[0] ? rows[0].value : null;
    }
    const all = readJson('settings', {});
    return Object.prototype.hasOwnProperty.call(all, key) ? all[key] : null;
  },
  async setSetting(key, value) {
    if (usePg) {
      await ensurePg();
      // NOTE: always send a JSON string — node-postgres turns a raw JS array
      // into a Postgres array literal ({"a","b"}), which a JSONB column
      // rejects. JSON.stringify keeps arrays valid JSON for the column.
      await pool.query(
        'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
        [key, JSON.stringify(value)],
      );
      return value;
    }
    const all = readJson('settings', {});
    all[key] = value;
    writeJson('settings', all);
    return value;
  },

  // --- Payment screenshots (stored in the DB so they survive redeploys;
  // Render's free disk is wiped on every deploy, which used to delete them) ---
  async saveScreenshot(orderId, dataUrl) {
    if (usePg) {
      await ensurePg();
      await pool.query(
        'INSERT INTO screenshots (order_id, image_data) VALUES ($1, $2) ON CONFLICT (order_id) DO UPDATE SET image_data = EXCLUDED.image_data',
        [orderId, dataUrl],
      );
      return dataUrl;
    }
    const all = readJson('screenshots', {});
    all[orderId] = dataUrl;
    writeJson('screenshots', all);
    return dataUrl;
  },
  async getScreenshot(orderId) {
    if (usePg) {
      await ensurePg();
      const { rows } = await pool.query('SELECT image_data FROM screenshots WHERE order_id = $1', [orderId]);
      return rows[0] ? rows[0].image_data : null;
    }
    const all = readJson('screenshots', {});
    return all[orderId] || null;
  },

  // --- Product images (stored in the DB so they survive redeploys and so
  // the shop no longer depends on the old WordPress site for photos) ---
  async saveImage(productId, buffer, mime) {
    if (usePg) {
      await ensurePg();
      await pool.query(
        'INSERT INTO images (id, mime, data) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET mime = EXCLUDED.mime, data = EXCLUDED.data',
        [productId, mime, buffer],
      );
      return true;
    }
    const all = readJson('images', {});
    all[productId] = { mime, dataUrl: `data:${mime};base64,${buffer.toString('base64')}` };
    writeJson('images', all);
    return true;
  },
  async getImage(productId) {
    if (usePg) {
      await ensurePg();
      const { rows } = await pool.query('SELECT mime, data FROM images WHERE id = $1', [productId]);
      if (!rows[0]) return null;
      return { mime: rows[0].mime, buffer: rows[0].data };
    }
    const all = readJson('images', {});
    const rec = all[productId];
    if (!rec) return null;
    const m = String(rec.dataUrl || '').match(/^data:(image\/[a-z+]+);base64,(.+)$/);
    if (!m) return null;
    return { mime: m[1], buffer: Buffer.from(m[2], 'base64') };
  },
  async deleteImage(productId) {
    if (usePg) {
      await ensurePg();
      await pool.query('DELETE FROM images WHERE id = $1', [productId]);
      return true;
    }
    const all = readJson('images', {});
    delete all[productId];
    writeJson('images', all);
    return true;
  },

  // --- Activity log (owner only) ---
  async saveActivity(entry) {
    if (usePg) return pgUpsert('activity', 'id', entry.id, entry);
    const all = readJson('activity', []);
    all.push(entry);
    writeJson('activity', all);
    return entry;
  },
  async listActivity(limit, offset, filter) {
    const { q = '', action = '' } = filter || {};
    const needle = String(q).toLowerCase().trim();
    let all;
    if (usePg) {
      await ensurePg();
      const { rows } = await pool.query('SELECT data FROM activity');
      all = rows.map((r) => r.data);
    } else {
      all = readJson('activity', []);
    }
    const list = all.filter((e) => {
      if (action && e.action !== action) return false;
      if (!needle) return true;
      const hay = [e.user_name, e.user_phone, e.target_id, e.target_type, e.details].filter(Boolean).join(' ').toLowerCase();
      return needle.split(/\s+/).every((k) => hay.includes(k));
    });
    list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const total = list.length;
    return { activity: list.slice(offset, offset + limit), total };
  },

  // --- Password reset tokens (keyed by sha256 of the raw token; the raw
  // token itself is only ever sent to the customer by email, never stored) ---
  async saveResetToken(rec) {
    if (usePg) return pgUpsert('password_resets', 'token_hash', rec.token_hash, rec);
    const all = readJson('password_resets', []);
    const i = all.findIndex((r) => r.token_hash === rec.token_hash);
    if (i >= 0) all[i] = rec; else all.push(rec);
    writeJson('password_resets', all);
    return rec;
  },
  async getResetToken(tokenHash) {
    if (usePg) return pgGet('password_resets', 'token_hash', tokenHash);
    return readJson('password_resets', []).find((r) => r.token_hash === tokenHash) || null;
  },
  async deleteResetToken(tokenHash) {
    if (usePg) return pgDelete('password_resets', 'token_hash', tokenHash);
    writeJson('password_resets', readJson('password_resets', []).filter((r) => r.token_hash !== tokenHash));
  },

  // --- Device push tokens (fix-batch-29, staff order alerts) ---
  // One record per FCM token, keyed by the token itself. Upsert refreshes
  // user_phone / platform / last_seen when the same device re-registers.
  async saveDeviceToken(rec) {
    if (usePg) return pgUpsert('device_tokens', 'token', rec.token, rec);
    const all = readJson('device_tokens', []);
    const i = all.findIndex((r) => r.token === rec.token);
    if (i >= 0) all[i] = rec; else all.push(rec);
    writeJson('device_tokens', all);
    return rec;
  },
  async listDeviceTokens() {
    if (usePg) {
      await ensurePg();
      const { rows } = await pool.query('SELECT data FROM device_tokens');
      return rows.map((r) => r.data);
    }
    return readJson('device_tokens', []);
  },
  async deleteDeviceTokens(tokens) {
    const list = Array.isArray(tokens) ? tokens : [];
    if (list.length === 0) return 0;
    if (usePg) {
      await ensurePg();
      const { rowCount } = await pool.query('DELETE FROM device_tokens WHERE token = ANY($1)', [list]);
      return rowCount;
    }
    const before = readJson('device_tokens', []);
    const kept = before.filter((r) => !list.includes(r.token));
    writeJson('device_tokens', kept);
    return before.length - kept.length;
  },

  // --- Payments (list of accounts, single row id 'accounts') ---
  async listPayments() {
    if (usePg) {
      const row = await pgGet('payments', 'id', 'accounts');
      if (row) return row.accounts || [];
      // Legacy: seeded per-account rows — collect them.
      const all = await pgAll('payments');
      const accts = all.filter((a) => a && a.account_number).sort((a, b) => String(a.id).localeCompare(String(b.id)));
      return accts;
    }
    const data = readJson('payments', []);
    return Array.isArray(data) ? data : (data.accounts || []);
  },
  async savePayments(accounts) {
    if (usePg) return pgUpsert('payments', 'id', 'accounts', { id: 'accounts', accounts });
    writeJson('payments', accounts);
    return accounts;
  },
};

module.exports = store;
