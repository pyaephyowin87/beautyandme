/**
 * Seed script — builds data/products.json, data/coupons.json, data/payments.json
 * from data/pos-source.json (POS export, 2026-11-18).
 *
 * POS price is the truth. Run: node scripts/seed.js
 *
 * Steps:
 *  1. Merge exact duplicate names (normalised) — keep the in-stock entry.
 *  2. Group variation items into ONE product with options:
 *     a. key1 = normalised name with variant tokens removed (sizes, colour
 *        numbers, parentheticals); group by (brand, key1) when size >= 2.
 *     b. Remaining singles: common normalised prefix >= 5 words AND a common
 *        suffix size token, differing middle 1-3 words.
 *  3. Seed flags (documented heuristic — editable later in Manage):
 *     best_seller = BEBREEZE Seoul Serum Tonic + BEBREEZE Seoul 3 D Ampoule
 *       + the 10 highest-stock items among COSRX / ANUA / KUNDAL / P.CALM.
 *     is_new = all BEBREEZE + P.CALM items.
 *     BeBreeze note = skin-type line (never claim SPF/PA).
 */
'use strict';

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const SRC = path.join(DATA_DIR, 'pos-source.json');

const SIZE_RE = /\b\d+(?:\.\d+)?\s?(?:ml|g|kg|mg|l|pcs|pads)\b/gi;
const COLOUR_RE = /\bno\.?\s?\d+\b/gi;
const HASH_RE = /#\s?\d+\b/g;
const PAREN_RE = /\([^)]*\)/g;

function normalize(name) {
  return String(name).toLowerCase().replace(/\s+/g, ' ').trim();
}

// Remove variant tokens from a name (original casing preserved where possible).
// Returns { key, removed } where removed is the list of variant token strings.
function stripVariants(name) {
  const removed = [];
  let s = String(name);
  s = s.replace(PAREN_RE, (m) => { removed.push(m.slice(1, -1).trim()); return ' '; });
  s = s.replace(COLOUR_RE, (m) => { removed.push(m.trim()); return ' '; });
  s = s.replace(HASH_RE, (m) => { removed.push(m.trim()); return ' '; });
  s = s.replace(SIZE_RE, (m) => { removed.push(m.trim()); return ' '; });
  s = s.replace(/\s+/g, ' ').trim();
  return { key: normalize(s), removed: removed.filter(Boolean) };
}

function titleCase(s) {
  return s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));
}

function slugify(name) {
  return normalize(name)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120) || 'product';
}

// Trailing size token of a normalised name, e.g. "500 ml" / "120 g" / "30 ml".
function suffixSizeToken(normName) {
  const m = normName.match(/(\d+(?:\.\d+)?\s?(?:ml|g|kg|mg|l|pcs|pads))$/);
  return m ? m[1] : null;
}

function inferBrand(item) {
  if (item.brand && String(item.brand).toLowerCase() !== 'null') return item.brand;
  const n = normalize(item.name);
  if (n.startsWith('beauty of joseon')) return 'BEAUTY OF JOSEON';
  if (n.startsWith('iunik')) return 'IUNIK';
  return 'Other';
}

function main() {
  const src = JSON.parse(fs.readFileSync(SRC, 'utf8'));
  const raw = src.products || [];
  console.log(`POS source: ${raw.length} rows (declared count ${src.count})`);

  // ---- Step 1: merge exact duplicates (normalised name) ----
  const byName = new Map();
  for (const item of raw) {
    const key = normalize(item.name);
    if (!byName.has(key)) byName.set(key, []);
    byName.get(key).push(item);
  }
  let mergedGroups = 0;
  let mergedRemoved = 0;
  const deduped = [];
  for (const [key, group] of byName) {
    if (group.length === 1) { deduped.push(group[0]); continue; }
    mergedGroups++;
    mergedRemoved += group.length - 1;
    // Keep the in-stock entry (highest stock); ties -> first.
    const sorted = [...group].sort((a, b) => (b.stock || 0) - (a.stock || 0));
    const kept = sorted[0];
    console.log(`  merged x${group.length}: "${kept.name}" kept stock=${kept.stock} (dropped stocks ${sorted.slice(1).map((g) => g.stock).join(', ')})`);
    deduped.push(kept);
  }
  console.log(`Step 1 dedupe: ${mergedGroups} duplicate groups merged, ${mergedRemoved} rows removed -> ${deduped.length} items`);

  const items = deduped.map((it) => ({
    ...it,
    brand: inferBrand(it),
    stock: Number(it.stock) || 0,
    price_mmk: Number(it.price_mmk) || 0,
  }));

  // ---- Step 2a: group by (brand, key1) ----
  const groupsA = new Map();
  for (const item of items) {
    const { key } = stripVariants(item.name);
    const gk = `${normalize(item.brand)}|||${key}`;
    if (!groupsA.has(gk)) groupsA.set(gk, []);
    groupsA.get(gk).push(item);
  }

  const products = [];
  const used = new Set();
  let groupsACount = 0;
  let optionsFromA = 0;

  function makeGroupedProduct(members, labelFn, nameFn) {
    const options = members.map((m) => {
      const label = labelFn(m);
      return {
        label,
        price: m.price_mmk,
        stock: m.stock,
        in_stock: m.stock > 0,
        sku: m.sku || null,
      };
    });
    // Deterministic order: price asc, then label.
    options.sort((a, b) => a.price - b.price || String(a.label).localeCompare(String(b.label)));
    const totalStock = options.reduce((s, o) => s + o.stock, 0);
    return {
      name: nameFn(members),
      brand: members[0].brand,
      category: members[0].category || '',
      price: Math.min(...options.map((o) => o.price)),
      sale_price: null,
      in_stock: options.some((o) => o.in_stock),
      image_url: null,
      wc_id: null,
      is_new: false,
      best_seller: false,
      options,
      sku: null,
      _stock: totalStock,
    };
  }

  for (const [, members] of groupsA) {
    if (members.length < 2) continue;
    members.forEach((m) => used.add(m));
    groupsACount++;
    optionsFromA += members.length;
    products.push(makeGroupedProduct(
      members,
      (m) => {
        const { removed } = stripVariants(m.name);
        // Label = the differing variant part (size, colour no., parenthetical).
        // Keep size units lowercase ("50 ml", not "50 Ml"); title-case the rest.
        const label = removed.map((r) => {
          const sm = r.match(/^(\d+(?:\.\d+)?)\s*(ml|g|kg|mg|l|pcs|pads)$/i);
          return sm ? `${sm[1]} ${sm[2].toLowerCase()}` : titleCase(r);
        }).join(' ');
        return label || m.name;
      },
      (ms) => {
        // Base name = first member's name with variant tokens stripped.
        const { key } = stripVariants(ms[0].name);
        void key;
        const base = ms[0].name
          .replace(PAREN_RE, ' ').replace(COLOUR_RE, ' ').replace(HASH_RE, ' ').replace(SIZE_RE, ' ')
          .replace(/\s+/g, ' ').trim();
        return base;
      },
    ));
  }
  console.log(`Step 2a grouping: ${groupsACount} variation groups -> ${optionsFromA} options`);

  // ---- Step 2b: prefix + suffix-size grouping for remaining singles ----
  const singles = items.filter((m) => !used.has(m));
  // Bucket by (first 5 words of normalised name, suffix size token).
  const buckets = new Map();
  for (const item of singles) {
    const norm = normalize(item.name);
    const suffix = suffixSizeToken(norm);
    if (!suffix) continue;
    const words = norm.split(' ');
    if (words.length < 7) continue; // need >=5 prefix + >=1 middle + suffix words
    const bucketKey = `${words.slice(0, 5).join(' ')}|||${suffix}`;
    if (!buckets.has(bucketKey)) buckets.set(bucketKey, []);
    buckets.get(bucketKey).push(item);
  }

  let groupsBCount = 0;
  let optionsFromB = 0;
  const usedB = new Set();
  for (const [, members] of buckets) {
    if (members.length < 2) continue;
    // Longest common word-prefix across the group (normalised names).
    const wordLists = members.map((m) => normalize(m.name).split(' '));
    let prefixLen = wordLists[0].length;
    for (const wl of wordLists.slice(1)) {
      let i = 0;
      while (i < Math.min(prefixLen, wl.length) && wordLists[0][i] === wl[i]) i++;
      prefixLen = i;
    }
    if (prefixLen < 5) continue;
    // Differing middle = words between common prefix and suffix size token.
    const middles = members.map((m) => {
      const wl = normalize(m.name).split(' ');
      const suffix = suffixSizeToken(normalize(m.name));
      const suffixWords = suffix.split(' ').length;
      return wl.slice(prefixLen, wl.length - suffixWords);
    });
    if (middles.some((mid) => mid.length < 1 || mid.length > 3)) continue;
    // All middles must differ (otherwise they are the same product).
    if (new Set(middles.map((mid) => mid.join(' '))).size !== members.length) continue;
    members.forEach((m) => usedB.add(m));
    groupsBCount++;
    optionsFromB += members.length;
    const prefixWords = wordLists[0].slice(0, prefixLen);
    products.push(makeGroupedProduct(
      members,
      (m) => {
        const wl = normalize(m.name).split(' ');
        const suffix = suffixSizeToken(normalize(m.name));
        const suffixWords = suffix.split(' ').length;
        return titleCase(wl.slice(prefixLen, wl.length - suffixWords).join(' '));
      },
      (ms) => {
        // Base name = common prefix in the first member's original casing.
        const origWords = ms[0].name.split(/\s+/);
        return origWords.slice(0, prefixLen).join(' ');
      },
    ));
    void prefixWords;
  }
  console.log(`Step 2b grouping: ${groupsBCount} variation groups -> ${optionsFromB} options`);

  // Remaining singles become single products.
  let singleCount = 0;
  for (const item of singles) {
    if (usedB.has(item)) continue;
    singleCount++;
    products.push({
      name: item.name,
      brand: item.brand,
      category: item.category || '',
      price: item.price_mmk,
      sale_price: null,
      in_stock: item.stock > 0,
      image_url: null,
      wc_id: null,
      is_new: false,
      best_seller: false,
      options: null,
      sku: item.sku || null,
      _stock: item.stock,
    });
  }
  console.log(`Singles: ${singleCount}`);

  // ---- IDs / slugs (unique, deterministic) ----
  const seenSlugs = new Set();
  for (const p of products) {
    let slug = slugify(p.name);
    let candidate = slug;
    let n = 2;
    while (seenSlugs.has(candidate)) candidate = `${slug}-${n++}`;
    seenSlugs.add(candidate);
    p.slug = candidate;
    p.id = candidate;
  }
  // Deterministic order: brand, then name.
  products.sort((a, b) => String(a.brand).localeCompare(String(b.brand)) || String(a.name).localeCompare(String(b.name)));

  // ---- Step 3: flags ----
  const normName = (p) => normalize(p.name);
  for (const p of products) {
    const b = normalize(p.brand);
    if (b === 'bebreeze' || b === 'p.calm') p.is_new = true;
    if (b === 'bebreeze') {
      const n = normName(p);
      if (n.includes('strawberry')) p.note = 'Skin type — အမျိုးအစားအားလုံး။';
      else if (n.includes('chestnut')) p.note = 'Skin type — အဆီပြန်/ပေါင်းစပ်/ဝက်ခြံ အသားအရေ။';
      else p.note = 'Skin type — အမျိုးအစားအားလုံး။';
    }
  }
  // Best sellers: the two named BeBreeze heroes + top-10 stock in the big four.
  const hero = (substr) => products.find((p) => normName(p).includes(substr));
  const serumTonic = hero('bebreeze seoul serum tonic');
  const ampoule = hero('bebreeze seoul 3 d ampoule');
  if (serumTonic) serumTonic.best_seller = true;
  if (ampoule) ampoule.best_seller = true;
  const bigFour = ['cosrx', 'anua', 'kundal', 'p.calm'];
  const topStock = products
    .filter((p) => bigFour.includes(normalize(p.brand)))
    .sort((a, b) => b._stock - a._stock || String(a.name).localeCompare(String(b.name)))
    .slice(0, 10);
  topStock.forEach((p) => { p.best_seller = true; });
  console.log('Best sellers (top-10 stock, big four):', topStock.map((p) => `${p.name} (${p._stock})`).join(' | '));

  // Drop internal helper before writing.
  for (const p of products) delete p._stock;

  fs.writeFileSync(path.join(DATA_DIR, 'products.json'), JSON.stringify(products, null, 2));
  console.log(`Wrote products.json: ${products.length} products (${products.filter((p) => p.options).length} with options, ${products.reduce((s, p) => s + (p.options ? p.options.length : 0), 0)} total options)`);

  // ---- Coupons seed ----
  const coupons = [
    { code: 'TEST10', type: 'percent', value: 10, note: 'test only', active: true },
  ];
  fs.writeFileSync(path.join(DATA_DIR, 'coupons.json'), JSON.stringify(coupons, null, 2));
  console.log('Wrote coupons.json: TEST10 = 10% off (test only)');

  // ---- Payments seed: 9 primary accounts, holder Htet Htet Aung ----
  // CB Bank number is 0107100900055875 — never use any other CB number.
  // Backup Pyae Phyo Win wallets deliberately NOT included.
  const payments = [
    { id: 'kbz-bank', method: 'KBZ Bank', account_name: 'Htet Htet Aung', account_number: '10151107501704401', note: 'Special' },
    { id: 'yoma-bank', method: 'Yoma Bank', account_name: 'Htet Htet Aung', account_number: '007145460001804', note: 'Special' },
    { id: 'aya-bank', method: 'AYA Bank', account_name: 'Htet Htet Aung', account_number: '20006571537', note: '' },
    { id: 'cb-bank', method: 'CB Bank', account_name: 'Htet Htet Aung', account_number: '0107100900055875', note: 'Special' },
    { id: 'uab-bank', method: 'UAB Bank', account_name: 'Htet Htet Aung', account_number: '0511060100006837', note: 'Special Call Account' },
    { id: 'kbzpay', method: 'KBZPay', account_name: 'Htet Htet Aung', account_number: '09254255067', note: '' },
    { id: 'cb-pay', method: 'CB Pay', account_name: 'Htet Htet Aung', account_number: '09254255067', note: '' },
    { id: 'aya-pay', method: 'AYA Pay', account_name: 'Htet Htet Aung', account_number: '09254255067', note: '' },
    { id: 'uab-pay', method: 'UAB Pay', account_name: 'Htet Htet Aung', account_number: '09254255067', note: '' },
  ];
  fs.writeFileSync(path.join(DATA_DIR, 'payments.json'), JSON.stringify(payments, null, 2));
  console.log('Wrote payments.json: 9 accounts (Htet Htet Aung)');

  console.log('Seed complete.');
}

main();
