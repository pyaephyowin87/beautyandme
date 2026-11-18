'use strict';
/* ============================================================
   Beauty & Me — standalone shop frontend (vanilla JS, no deps)
   API contract: same origin, /api prefix (see task spec).
   Customer views NEVER show stock quantities — only the
   in_stock boolean ("Stock ရှိပါတယ်" / "ကုန်ပြီ").
   Stock quantities appear ONLY in the Manage catalog.
   ============================================================ */

/* ---------------- i18n ---------------- */
const I18N = {
  my: {
    nav_home: 'Home', nav_shop: 'ဆိုင်', nav_orders: 'အော်ဒါများ', nav_manage: 'Manage',
    search_ph: 'ရှာဖွေမည်…', search_btn: 'ရှာမယ်',
    cart: 'ခြင်းတောင်း', login: 'အကောင့် ဝင်မယ်', logout: 'ထွက်မယ်', account: 'အကောင့်',
    hero_tag: 'အလှအပ ပစ္စည်းများ — စိတ်ချယုံကြည်ရသော K-Beauty ဆိုင်',
    best: 'အရောင်းရဆုံး', sale: 'လျှော့ဈေး', new: 'ပစ္စည်းအသစ်', all: 'ပစ္စည်းအားလုံး',
    view_all: 'အားလုံးကြည့်မယ်', more: 'နောက်ထပ် ပြမယ်',
    in_stock: 'Stock ရှိပါတယ်', out_stock: 'ကုန်ပြီ',
    no_image: 'ပုံ မရှိသေးပါ',
    add_cart: 'Cart ထဲ ထည့်မယ်', added: 'ခြင်းတောင်းထဲ ထည့်ပြီးပါပြီ',
    loading: 'တင်နေပါတယ်…', empty: 'ပစ္စည်းမရှိသေးပါ', error_load: 'တင်မရပါ။ ပြန်ကြိုးစားကြည့်ပါ။',
    subtotal: 'Subtotal', discount: 'လျှော့ဈေး', total: 'Total',
    checkout: 'ငွေချေမယ်', cart_empty: 'ခြင်းတောင်းထဲ ပစ္စည်း မရှိသေးပါ',
    coupon_applied: 'Coupon သုံးပြီးပါပြီ', coupon_invalid: 'Coupon မမှန်ပါ',
    checkout_title: 'ငွေချေမည်',
    name: 'နာမည်', phone: 'ဖုန်း', address: 'လိပ်စာ',
    customer_info: 'ဝယ်သူ အချက်အလက်', delivery: 'ပို့ဆောင်မှု', payment: 'ငွေပေးချေမှု',
    delivery_inner: 'ရန်ကုန် (အတွင်း)', delivery_outer: 'ရန်ကုန် (အပြင်)',
    delivery_outside: 'ရန်ကုန် အပြင်', delivery_pickup: 'ဆိုင်မှာ လာယူမယ်',
    fee_inner: 'ပို့ခ 4,000 Ks — ပစ္စည်းရောက်မှ ပေးပါ',
    fee_outer: 'ပို့ခ 4,500 Ks — ပစ္စည်းရောက်မှ ပေးပါ',
    fee_outside: 'ပို့ခ — ဆိုင်က ဖုန်းဆက်ပြီး အတည်ပြုပေးပါမယ်',
    fee_pickup: 'ဆိုင်မှာ လာယူ — ၃ ရက်အတွင်း Cash on Collection',
    cod: 'Cash on Delivery (COD)', transfer: 'Bank / Pay လွှဲမယ်',
    choose_account: 'ငွေလွှဲမည့် အကောင့် ရွေးပါ', copy: 'Copy', copied: 'ကူးပြီးပါပြီ',
    screenshot: 'ငွေလွှဲပြေစာ Screenshot တင်ပါ',
    screenshot_hint: 'ငွေလွှဲပြီးရင် Screenshot တင်မှ အော်ဒါ တင်လို့ရပါမယ်။ Screenshot မတင်ဘဲ အော်ဒါ တင်လို့မရပါ။',
    place_order: 'အော်ဒါ တင်မယ်',
    order_success: 'အော်ဒါ တင်ပြီးပါပြီ!', order_id: 'အော်ဒါ နံပါတ်',
    transfer_note: 'လွှဲငွေသည် ပစ္စည်းဖိုး Total သာ ဖြစ်ပါတယ်။ ပို့ခကို ပစ္စည်းရောက်မှ ပေးပါ။',
    screenshot_required_err: 'Screenshot တင်ဖို့ လိုပါတယ်။ ငွေလွှဲ Screenshot တင်ပြီးမှ အော်ဒါ တင်ပါ။',
    order_failed: 'အော်ဒါ တင်မရပါ။ ပြန်ကြိုးစားကြည့်ပါ။',
    orders_title: 'ကျွန်ုပ်၏ အော်ဒါများ', login_needed: 'အော်ဒါများ ကြည့်ဖို့ အကောင့် ဝင်ပါ။',
    no_orders: 'အော်ဒါမရှိသေးပါ', order_detail: 'အော်ဒါ အသေးစိတ်',
    register: 'Register', password: 'Password', auth_fail: 'ဖုန်း (သို့) Password မမှန်ပါ',
    coming_soon: 'App မကြာခင် လာပါမယ်',
    close: 'ပိတ်မယ်', remove: 'ဖယ်မယ်', save: 'သိမ်းမယ်', add: 'ထည့်မယ်', del: 'ဖျက်မယ်',
    saved: 'သိမ်းပြီးပါပြီ', deleted: 'ဖျက်ပြီးပါပြီ', confirm_delete: 'ဖျက်မှာ သေချာလား?',
    test: 'Test connection', preview: 'Preview', import: 'Import', confirm_import: 'Import လုပ်မှာ သေချာလား?',
    qty: 'အရေအတွက်', stock_qty: 'Stock အရေအတွက်', price: 'ဈေး', sale_price: 'လျှော့ဈေး',
    is_new: 'အသစ်', best_seller: 'အရောင်းရဆုံး', brand: 'Brand',
    manage_no_access: 'Manage ကို Manager အကောင့်နဲ့သာ သုံးနိုင်ပါတယ်။',
    wc_warn: 'key ကို chat မှာ ဘယ်တော့မှ မပို့ပါနဲ့',
    wc_configured: 'WooCommerce ချိတ်ပြီးပါပြီ', wc_not_configured: 'WooCommerce မချိတ်ရသေးပါ',
    wc_test_ok: 'ချိတ်ဆက်မှု အောင်မြင်ပါတယ်', wc_test_fail: 'ချိတ်ဆက်မှု မအောင်မြင်ပါ',
    new_key: 'အသစ် key (ပြောင်းချင်မှ ဖြည့်ပါ)', new_secret: 'အသစ် secret (ပြောင်းချင်မှ ဖြည့်ပါ)',
    site_url: 'Site URL', consumer_key: 'Consumer Key', consumer_secret: 'Consumer Secret',
    matched: 'ကိုက်ညီသော ပစ္စည်း', pos_only: 'POS မှာသာ ရှိသော ပစ္စည်း', wc_only: 'WooCommerce မှာသာ ရှိသော ပစ္စည်း',
    products: 'ပစ္စည်းများ', orders: 'အော်ဒါများ', sales: 'ရောင်းအား', customers: 'ဝယ်သူများ',
    fill_all: 'အချက်အလက် အကုန် ဖြည့်ပါ', invalid_phone: 'ဖုန်း နံပါတ် မမှန်ပါ',
    coupon_code: 'Coupon code', coupon_type: 'အမျိုးအစား', coupon_value: 'တန်ဖိုး',
    percent: 'ရာခိုင်နှုန်း (%)', fixed: 'သတ်မှတ် ငွေ (Ks)',
    no_coupons: 'Coupon မရှိသေးပါ', account_name: 'အကောင့်နာမည်', account_number: 'အကောင့်နံပါတ်',
    note: 'မှတ်ချက်', play_store: 'Play Store လင့်', app_store: 'App Store လင့်',
    delivery_fee: 'ပို့ခ', pay_on_delivery: 'ပစ္စည်းရောက်မှ ပေးပါ',
    status: 'အခြေအနေ', date: 'ရက်စွဲ', items: 'ပစ္စည်းများ',
    shop_phone: 'ဖုန်း', shop_hours: 'ဖွင့်ချိန် — နေ့စဉ် မနက် ၉ နာရီ မှ ညနေ ၆ နာရီ',
    continue_shopping: 'ဆက်ပြီး ဈေးဝယ်မယ်', back_home: 'Home ပြန်မယ်',
    select_option: 'Option ရွေးပါ', search_products: 'ပစ္စည်း ရှာမယ်…',
    results: 'ခု တွေ့ပါတယ်', code: 'ကုဒ်',
  },
  en: {
    nav_home: 'Home', nav_shop: 'Shop', nav_orders: 'Orders', nav_manage: 'Manage',
    search_ph: 'Search…', search_btn: 'Search',
    cart: 'Cart', login: 'Log in', logout: 'Log out', account: 'Account',
    hero_tag: 'Trusted K-Beauty shop — beauty products you can rely on',
    best: 'Best Sellers', sale: 'Sale', new: 'New Arrivals', all: 'All Products',
    view_all: 'View all', more: 'Show more',
    in_stock: 'In Stock', out_stock: 'Sold Out',
    no_image: 'No photo yet',
    add_cart: 'Add to Cart', added: 'Added to cart',
    loading: 'Loading…', empty: 'No products yet', error_load: 'Could not load. Please try again.',
    subtotal: 'Subtotal', discount: 'Discount', total: 'Total',
    checkout: 'Checkout', cart_empty: 'Your cart is empty',
    coupon_applied: 'Coupon applied', coupon_invalid: 'Invalid coupon',
    checkout_title: 'Checkout',
    name: 'Name', phone: 'Phone', address: 'Address',
    customer_info: 'Customer details', delivery: 'Delivery', payment: 'Payment',
    delivery_inner: 'Yangon (Inner)', delivery_outer: 'Yangon (Outer)',
    delivery_outside: 'Outside Yangon', delivery_pickup: 'Store pickup',
    fee_inner: 'Delivery 4,000 Ks — pay on delivery',
    fee_outer: 'Delivery 4,500 Ks — pay on delivery',
    fee_outside: 'Delivery fee — the shop will call to confirm',
    fee_pickup: 'Pick up at the shop — Cash on Collection within 3 days',
    cod: 'Cash on Delivery (COD)', transfer: 'Bank / Pay transfer',
    choose_account: 'Choose a transfer account', copy: 'Copy', copied: 'Copied',
    screenshot: 'Upload transfer receipt screenshot',
    screenshot_hint: 'Please upload your transfer screenshot before placing the order. You cannot place a transfer order without it.',
    place_order: 'Place Order',
    order_success: 'Order placed!', order_id: 'Order ID',
    transfer_note: 'Your transfer covers the products Total only. Please pay the delivery fee to the courier on delivery.',
    screenshot_required_err: 'A screenshot is required. Please upload your transfer screenshot, then place the order.',
    order_failed: 'Could not place the order. Please try again.',
    orders_title: 'My Orders', login_needed: 'Please log in to see your orders.',
    no_orders: 'No orders yet', order_detail: 'Order Details',
    register: 'Register', password: 'Password', auth_fail: 'Phone or password is incorrect',
    coming_soon: 'App coming soon',
    close: 'Close', remove: 'Remove', save: 'Save', add: 'Add', del: 'Delete',
    saved: 'Saved', deleted: 'Deleted', confirm_delete: 'Are you sure you want to delete this?',
    test: 'Test connection', preview: 'Preview', import: 'Import', confirm_import: 'Are you sure you want to run the import?',
    qty: 'Quantity', stock_qty: 'Stock qty', price: 'Price', sale_price: 'Sale price',
    is_new: 'New', best_seller: 'Best seller', brand: 'Brand',
    manage_no_access: 'Manage is only available to the manager account.',
    wc_warn: 'Never send your key in chat',
    wc_configured: 'WooCommerce connected', wc_not_configured: 'WooCommerce not connected yet',
    wc_test_ok: 'Connection successful', wc_test_fail: 'Connection failed',
    new_key: 'New key (only if changing)', new_secret: 'New secret (only if changing)',
    site_url: 'Site URL', consumer_key: 'Consumer Key', consumer_secret: 'Consumer Secret',
    matched: 'Matched products', pos_only: 'POS-only products', wc_only: 'WooCommerce-only products',
    products: 'Products', orders: 'Orders', sales: 'Sales', customers: 'Customers',
    fill_all: 'Please fill in all fields', invalid_phone: 'Invalid phone number',
    coupon_code: 'Coupon code', coupon_type: 'Type', coupon_value: 'Value',
    percent: 'Percent (%)', fixed: 'Fixed amount (Ks)',
    no_coupons: 'No coupons yet', account_name: 'Account name', account_number: 'Account number',
    note: 'Note', play_store: 'Play Store link', app_store: 'App Store link',
    delivery_fee: 'Delivery fee', pay_on_delivery: 'Pay on delivery',
    status: 'Status', date: 'Date', items: 'Items',
    shop_phone: 'Phone', shop_hours: 'Open daily 9 AM – 6 PM',
    continue_shopping: 'Continue shopping', back_home: 'Back to Home',
    select_option: 'Choose an option', search_products: 'Search products…',
    results: 'found', code: 'Code',
  },
};
let lang = localStorage.getItem('bm_lang') || 'my';
const t = (k) => (I18N[lang] && I18N[lang][k]) || I18N.en[k] || k;

/* ---------------- state ---------------- */
const state = {
  token: localStorage.getItem('bm_token') || null,
  user: null,
  cart: JSON.parse(localStorage.getItem('bm_cart') || '[]'),
  coupon: JSON.parse(localStorage.getItem('bm_coupon') || 'null'),
  brands: [],
  brandFilter: '',
  searchQuery: '',
  shopInfo: null,
  payments: null,
  homeOffset: 0,
  shopOffset: 0,
  detail: null,          // current product in detail modal
  detailOption: null,    // selected option label
  detailQty: 1,
  co: { delivery: 'yangon_inner', payment: 'cod', account: null, screenshot: null },
  manageTab: 'dashboard',
  manageLoaded: {},
};
const PAGE = 24;

/* ---------------- helpers ---------------- */
const $ = (s, el) => (el || document).querySelector(s);
const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (n) => Number(n || 0).toLocaleString('en-US') + ' Ks';
const money = (n) => fmt(n);
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { el.hidden = true; }, 2600);
}
function saveCart() { localStorage.setItem('bm_cart', JSON.stringify(state.cart)); }
function saveCoupon() {
  if (state.coupon) localStorage.setItem('bm_coupon', JSON.stringify(state.coupon));
  else localStorage.removeItem('bm_coupon');
}
async function api(path, opts) {
  const o = Object.assign({ headers: {} }, opts || {});
  o.headers['Content-Type'] = 'application/json';
  if (state.token) o.headers['Authorization'] = 'Bearer ' + state.token;
  const res = await fetch('/api' + path, o);
  let data = null;
  try { data = await res.json(); } catch (e) { data = null; }
  if (!res.ok) {
    const err = new Error((data && data.error) || ('HTTP ' + res.status));
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}
function unitPrice(p) {
  if (p.sale_price != null && p.sale_price !== '') return Number(p.sale_price);
  return Number(p.price);
}
function optionPrice(opt) { return Number(opt.price); }
function displayPrice(p) {
  if (p.options && p.options.length) return Math.min.apply(null, p.options.map(optionPrice));
  return unitPrice(p);
}
function cartCount() { return state.cart.reduce((a, i) => a + i.qty, 0); }
function cartSubtotal() { return state.cart.reduce((a, i) => a + i.price * i.qty, 0); }
function couponDiscount() {
  if (!state.coupon) return 0;
  const sub = cartSubtotal();
  if (state.coupon.type === 'percent') return Math.round(sub * Number(state.coupon.value) / 100);
  return Math.min(Number(state.coupon.value) || 0, sub);
}
function cartTotal() { return Math.max(0, cartSubtotal() - couponDiscount()); }
function updateCartBadge() {
  const n = cartCount();
  const badge = $('#cartCount');
  badge.hidden = n === 0;
  badge.textContent = n;
}

/* ---------------- i18n apply ---------------- */
function applyI18n() {
  document.documentElement.lang = lang === 'my' ? 'my' : 'en';
  $$('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  $('#searchInput').placeholder = t('search_ph');
  $('#searchBtn').textContent = t('search_btn');
  $('#cartBtnLabel').textContent = t('cart');
  $('#heroTagline').textContent = t('hero_tag');
  $('#bestTitle').textContent = t('best');
  $('#saleTitle').textContent = t('sale');
  $('#newTitle').textContent = t('new');
  $('#allTitle').textContent = t('all');
  $('#shopTitle').textContent = t('nav_shop');
  $('#ordersTitle').textContent = t('orders_title');
  $('#checkoutTitle').textContent = t('checkout_title');
  $('#manageTitle').textContent = t('nav_manage');
  $('#cartTitle').textContent = t('cart');
  $('#lblSubtotal').textContent = t('subtotal');
  $('#lblDiscount').textContent = t('discount');
  $('#lblTotal').textContent = t('total');
  $('#checkoutBtn').textContent = t('checkout');
  $('#homeMoreBtn').textContent = t('more');
  $('#shopMoreBtn').textContent = t('more');
  $('#footerPhoneLabel').textContent = t('shop_phone');
  $('#footerHours').textContent = t('shop_hours');
  $('#langToggle').textContent = lang === 'my' ? 'EN' : 'မြန်မာ';
  $$('[data-viewall]').forEach((b) => { b.textContent = t('view_all'); });
  refreshAuthUI();
  renderCart();
}

/* ---------------- views / nav ---------------- */
function showView(name) {
  ['home', 'shop', 'orders', 'checkout', 'manage'].forEach((v) => {
    $('#view-' + v).hidden = v !== name;
  });
  $$('.nav-item').forEach((b) => b.classList.toggle('active', b.dataset.view === name));
  if (name === 'orders') loadOrders();
  if (name === 'manage') loadManage(state.manageTab);
  window.scrollTo({ top: 0 });
}

/* ---------------- shop info / footer ---------------- */
async function loadShopInfo() {
  try {
    state.shopInfo = await api('/shop-info');
  } catch (e) { state.shopInfo = null; }
  const info = state.shopInfo;
  if (info && info.messenger_url) $('#messengerLink').href = info.messenger_url;
  else $('#messengerLink').href = 'https://m.me/beautyandme117';
}
function appLinkUrl(kind) {
  if (!state.shopInfo || !state.shopInfo.app_links) return '';
  return state.shopInfo.app_links[kind] || '';
}
function onAppButton(kind) {
  const url = appLinkUrl(kind);
  if (url) window.open(url, '_blank', 'noopener');
  else toast(t('coming_soon'));
}

/* ---------------- brands ---------------- */
async function loadBrands() {
  try {
    state.brands = await api('/brands');
  } catch (e) { state.brands = []; }
  renderChips($('#brandChips'), true);
  renderChips($('#shopBrandChips'), false);
}
function renderChips(container, isHome) {
  if (!container) return;
  const all = [{ name: '', count: null }];
  const list = all.concat(state.brands || []);
  container.innerHTML = list.map((b) => {
    const label = b.name === '' ? t('all') : b.name;
    const active = state.brandFilter === b.name;
    return '<button type="button" class="chip' + (active ? ' active' : '') + '" data-brand="' + esc(b.name) + '">' +
      esc(label) + (b.count != null ? ' (' + b.count + ')' : '') + '</button>';
  }).join('');
  $$('.chip', container).forEach((btn) => {
    btn.addEventListener('click', () => {
      state.brandFilter = btn.dataset.brand;
      state.shopOffset = 0;
      state.homeOffset = 0;
      renderChips($('#brandChips'), true);
      renderChips($('#shopBrandChips'), false);
      if (isHome) { loadHomeGrid(true); }
      showView('shop');
      loadShopGrid(true);
    });
  });
}

/* ---------------- product cards ---------------- */
function cardHTML(p) {
  const price = displayPrice(p);
  const hasSale = p.sale_price != null && p.sale_price !== '' && Number(p.sale_price) < Number(p.price);
  const img = p.image_url
    ? '<img src="' + esc(p.image_url) + '" alt="' + esc(p.name) + '" loading="lazy">'
    : '<span class="img-placeholder">' + esc(t('no_image')) + '</span>';
  const priceHTML = hasSale
    ? '<span class="was">' + fmt(p.price) + '</span>' + fmt(p.sale_price)
    : fmt(price);
  return '<article class="card' + (p.in_stock ? '' : ' soldout') + '">' +
    '<button type="button" class="card-img" data-open="' + esc(String(p.id)) + '" aria-label="' + esc(p.name) + '">' + img + '</button>' +
    '<div class="card-body">' +
    '<span class="card-brand">' + esc(p.brand || '') + '</span>' +
    '<button type="button" class="card-name" data-open="' + esc(String(p.id)) + '" style="background:none;border:none;padding:0;text-align:left;font:inherit;color:inherit">' + esc(p.name) + '</button>' +
    '<span class="card-price">' + priceHTML + '</span>' +
    '<span class="badge ' + (p.in_stock ? 'in' : 'out') + '">' + esc(p.in_stock ? t('in_stock') : t('out_stock')) + '</span>' +
    '<button type="button" class="btn btn-primary card-add" data-add="' + esc(String(p.id)) + '"' + (p.in_stock ? '' : ' disabled') + '>' + esc(t('add_cart')) + '</button>' +
    '</div></article>';
}
function bindCards(container) {
  $$('[data-open]', container).forEach((b) => b.addEventListener('click', () => openProduct(b.dataset.open)));
  $$('[data-add]', container).forEach((b) => b.addEventListener('click', () => quickAdd(b.dataset.add)));
}
async function quickAdd(id) {
  try {
    const p = await api('/products/' + encodeURIComponent(id));
    if (p.options && p.options.length) { openProduct(id); return; }
    if (!p.in_stock) return;
    addToCart(p, null, 1);
  } catch (e) { toast(t('error_load')); }
}
function addToCart(p, optionLabel, qty) {
  const price = optionLabel
    ? optionPrice(p.options.find((o) => o.label === optionLabel) || p.options[0])
    : unitPrice(p);
  const key = String(p.id) + '|' + (optionLabel || '');
  const ex = state.cart.find((i) => i.key === key);
  if (ex) ex.qty += qty;
  else state.cart.push({
    key: key, product_id: p.id, option_label: optionLabel || null,
    name: p.name, brand: p.brand, price: price, image_url: p.image_url || null, qty: qty,
  });
  saveCart();
  updateCartBadge();
  renderCart();
  toast(t('added'));
}

/* ---------------- home ---------------- */
async function loadSection(section, elId, headId) {
  const el = $(elId);
  el.innerHTML = '<div class="loading">' + esc(t('loading')) + '</div>';
  try {
    const data = await api('/products?section=' + section + '&limit=12');
    const items = data.items || [];
    if (headId) $(headId).hidden = items.length === 0;
    if (!items.length) { el.innerHTML = ''; return; }
    el.innerHTML = items.map(cardHTML).join('');
    bindCards(el);
  } catch (e) {
    el.innerHTML = '<div class="error-box">' + esc(t('error_load')) + '</div>';
  }
}
async function loadHomeGrid(reset) {
  if (reset) { state.homeOffset = 0; $('#gridHome').innerHTML = ''; }
  const grid = $('#gridHome');
  if (reset) grid.innerHTML = '<div class="skel"></div><div class="skel"></div><div class="skel"></div><div class="skel"></div>';
  const params = new URLSearchParams({ limit: String(PAGE), offset: String(state.homeOffset) });
  if (state.brandFilter) params.set('brand', state.brandFilter);
  if (state.searchQuery) params.set('q', state.searchQuery);
  try {
    const data = await api('/products?' + params.toString());
    if (reset) grid.innerHTML = '';
    const items = data.items || [];
    if (!items.length && state.homeOffset === 0) {
      grid.innerHTML = '<div class="empty">' + esc(t('empty')) + '</div>';
    } else {
      grid.insertAdjacentHTML('beforeend', items.map(cardHTML).join(''));
      bindCards(grid);
    }
    state.homeOffset += items.length;
    $('#homeMoreBtn').style.display = (data.total != null && state.homeOffset < data.total) ? '' : 'none';
    $('#homeMoreWrap').style.display = $('#homeMoreBtn').style.display === 'none' ? 'none' : '';
  } catch (e) {
    if (reset) grid.innerHTML = '<div class="error-box">' + esc(t('error_load')) + '</div>';
  }
}
async function loadHome() {
  loadSection('best', '#rowBest', null);
  loadSection('sale', '#rowSale', '#saleSectionHead');
  loadSection('new', '#rowNew', null);
  loadHomeGrid(true);
}

/* ---------------- shop view ---------------- */
async function loadShopGrid(reset) {
  if (reset) { state.shopOffset = 0; $('#gridShop').innerHTML = ''; }
  const grid = $('#gridShop');
  if (reset) grid.innerHTML = '<div class="skel"></div><div class="skel"></div><div class="skel"></div><div class="skel"></div>';
  const params = new URLSearchParams({ limit: String(PAGE), offset: String(state.shopOffset) });
  if (state.brandFilter) params.set('brand', state.brandFilter);
  if (state.searchQuery) params.set('q', state.searchQuery);
  try {
    const data = await api('/products?' + params.toString());
    if (reset) grid.innerHTML = '';
    const items = data.items || [];
    if (!items.length && state.shopOffset === 0) {
      grid.innerHTML = '<div class="empty">' + esc(t('empty')) + '</div>';
    } else {
      grid.insertAdjacentHTML('beforeend', items.map(cardHTML).join(''));
      bindCards(grid);
    }
    state.shopOffset += items.length;
    $('#shopMoreBtn').style.display = (data.total != null && state.shopOffset < data.total) ? '' : 'none';
    const total = data.total != null ? data.total : items.length;
    $('#shopMeta').textContent = total + ' ' + t('results') +
      (state.brandFilter ? ' — ' + state.brandFilter : '') +
      (state.searchQuery ? ' — “' + state.searchQuery + '”' : '');
  } catch (e) {
    if (reset) grid.innerHTML = '<div class="error-box">' + esc(t('error_load')) + '</div>';
  }
}

/* ---------------- product detail ---------------- */
function openOverlay(ov, modal) { $(ov).hidden = false; $(modal).hidden = false; }
function closeOverlay(ov, modal) { $(ov).hidden = true; $(modal).hidden = true; }

async function openProduct(id) {
  openOverlay('#detailOverlay', '#detailModal');
  $('#detailBody').innerHTML = '<div class="loading">' + esc(t('loading')) + '</div>';
  $('#detailStickyBar').innerHTML = '';
  try {
    const p = await api('/products/' + encodeURIComponent(id));
    state.detail = p;
    state.detailQty = 1;
    state.detailOption = (p.options && p.options.length) ? p.options[0].label : null;
    renderDetail();
  } catch (e) {
    $('#detailBody').innerHTML = '<div class="error-box">' + esc(t('error_load')) + '</div>';
  }
}
function selectedOptionObj() {
  const p = state.detail;
  if (!p || !p.options || !p.options.length) return null;
  return p.options.find((o) => o.label === state.detailOption) || p.options[0];
}
function renderDetail() {
  const p = state.detail;
  if (!p) return;
  const img = p.image_url
    ? '<img src="' + esc(p.image_url) + '" alt="' + esc(p.name) + '">'
    : '<span class="img-placeholder">' + esc(t('no_image')) + '</span>';
  let optsHTML = '';
  if (p.options && p.options.length) {
    optsHTML = '<div class="field"><label>' + esc(t('select_option')) + '</label><div class="opt-row">' +
      p.options.map((o) =>
        '<button type="button" class="opt-btn' + (state.detailOption === o.label ? ' active' : '') + '" data-opt="' + esc(o.label) + '">' +
        esc(o.label) + ' — ' + fmt(o.price) + '</button>').join('') +
      '</div></div>';
  }
  $('#detailBody').innerHTML =
    '<div class="card-img">' + img + '</div>' +
    '<div class="detail-brand">' + esc(p.brand || '') + '</div>' +
    '<h2>' + esc(p.name) + '</h2>' +
    '<div style="margin:8px 0"><span class="badge ' + (p.in_stock ? 'in' : 'out') + '">' + esc(p.in_stock ? t('in_stock') : t('out_stock')) + '</span></div>' +
    (p.note ? '<div class="detail-note">' + esc(p.note) + '</div>' : '') +
    optsHTML;
  $$('[data-opt]', $('#detailBody')).forEach((b) => {
    b.addEventListener('click', () => { state.detailOption = b.dataset.opt; renderDetail(); });
  });
  renderStickyBar();
}
function renderStickyBar() {
  const p = state.detail;
  const bar = $('#detailStickyBar');
  if (!p) { bar.innerHTML = ''; return; }
  const opt = selectedOptionObj();
  const price = opt ? optionPrice(opt) : unitPrice(p);
  const available = opt ? opt.in_stock : p.in_stock;
  bar.innerHTML =
    '<div class="sb-price"><div class="amt">' + fmt(price) + '</div>' +
    '<div class="st"><span class="badge ' + (available ? 'in' : 'out') + '">' + esc(available ? t('in_stock') : t('out_stock')) + '</span></div></div>' +
    '<div class="qty-stepper"><button type="button" id="qtyMinus" aria-label="−">−</button><span id="qtyVal">' + state.detailQty + '</span><button type="button" id="qtyPlus" aria-label="+">+</button></div>' +
    '<button type="button" class="btn btn-primary" id="detailAdd"' + (available ? '' : ' disabled') + '>' + esc(t('add_cart')) + '</button>';
  $('#qtyMinus').addEventListener('click', () => {
    if (state.detailQty > 1) { state.detailQty -= 1; renderStickyBar(); }
  });
  $('#qtyPlus').addEventListener('click', () => { state.detailQty += 1; renderStickyBar(); });
  $('#detailAdd').addEventListener('click', () => {
    addToCart(p, state.detailOption, state.detailQty);
    closeOverlay('#detailOverlay', '#detailModal');
  });
}

/* ---------------- cart drawer ---------------- */
function openCart() { renderCart(); openOverlay('#cartOverlay', '#cartDrawer'); }
function closeCart() { closeOverlay('#cartOverlay', '#cartDrawer'); }

function renderCart() {
  const wrap = $('#cartItems');
  if (!state.cart.length) {
    wrap.innerHTML = '<div class="empty">' + esc(t('cart_empty')) + '</div>';
  } else {
    wrap.innerHTML = state.cart.map((i) => {
      const thumb = i.image_url
        ? '<img src="' + esc(i.image_url) + '" alt="">'
        : esc(t('no_image'));
      return '<div class="cart-line">' +
        '<div class="thumb">' + thumb + '</div>' +
        '<div class="info">' +
        '<div class="name">' + esc(i.name) + '</div>' +
        (i.option_label ? '<div class="opt">' + esc(i.option_label) + '</div>' : '') +
        '<div class="row">' +
        '<div class="qty-stepper"><button type="button" data-dec="' + esc(i.key) + '">−</button><span>' + i.qty + '</span><button type="button" data-inc="' + esc(i.key) + '">+</button></div>' +
        '<span class="price">' + fmt(i.price * i.qty) + '</span>' +
        '</div>' +
        '<div style="margin-top:6px"><button type="button" class="link-btn" data-rm="' + esc(i.key) + '">' + esc(t('remove')) + '</button></div>' +
        '</div></div>';
    }).join('');
    $$('[data-inc]', wrap).forEach((b) => b.addEventListener('click', () => changeQty(b.dataset.inc, 1)));
    $$('[data-dec]', wrap).forEach((b) => b.addEventListener('click', () => changeQty(b.dataset.dec, -1)));
    $$('[data-rm]', wrap).forEach((b) => b.addEventListener('click', () => {
      state.cart = state.cart.filter((i) => i.key !== b.dataset.rm);
      saveCart(); updateCartBadge(); renderCart();
    }));
  }
  $('#cartSubtotal').textContent = fmt(cartSubtotal());
  const disc = couponDiscount();
  $('#cartDiscountRow').hidden = disc <= 0;
  $('#cartDiscount').textContent = '−' + fmt(disc);
  $('#cartTotal').textContent = fmt(cartTotal());
  $('#checkoutBtn').disabled = state.cart.length === 0;
  const cm = $('#couponMsg');
  if (state.coupon) {
    cm.textContent = '✓ ' + state.coupon.code + ' — ' + t('coupon_applied');
    cm.style.color = 'var(--green)';
  } else { cm.textContent = ''; }
}
function changeQty(key, d) {
  const item = state.cart.find((i) => i.key === key);
  if (!item) return;
  item.qty += d;
  if (item.qty <= 0) state.cart = state.cart.filter((i) => i.key !== key);
  saveCart(); updateCartBadge(); renderCart();
}
async function applyCoupon() {
  const code = $('#couponInput').value.trim().toUpperCase();
  const msg = $('#couponMsg');
  if (!code) return;
  try {
    const res = await api('/coupons/validate', { method: 'POST', body: JSON.stringify({ code: code }) });
    if (res.valid) {
      state.coupon = { code: res.code || code, type: res.type, value: res.value };
      saveCoupon();
      renderCart();
    } else {
      state.coupon = null; saveCoupon(); renderCart();
      msg.textContent = t('coupon_invalid');
      msg.style.color = '#B3261E';
    }
  } catch (e) {
    state.coupon = null; saveCoupon(); renderCart();
    msg.textContent = t('coupon_invalid');
    msg.style.color = '#B3261E';
  }
}

/* ---------------- checkout ---------------- */
const DELIVERY = {
  yangon_inner: { fee: 4000, noteKey: 'fee_inner' },
  yangon_outer: { fee: 4500, noteKey: 'fee_outer' },
  outside_yangon: { fee: null, noteKey: 'fee_outside' },
  pickup: { fee: 0, noteKey: 'fee_pickup' },
};
function lastCustomer() {
  try { return JSON.parse(localStorage.getItem('bm_last_order') || 'null'); } catch (e) { return null; }
}
async function openCheckout() {
  closeCart();
  state.co = { delivery: 'yangon_inner', payment: 'cod', account: null, screenshot: null };
  const last = lastCustomer();
  const name = (state.user && state.user.name) || (last && last.name) || '';
  const phone = (state.user && state.user.phone) || (last && last.phone) || '';
  const address = (last && last.address) || '';
  showView('checkout');
  const body = $('#checkoutBody');
  body.innerHTML = '<div class="loading">' + esc(t('loading')) + '</div>';
  if (!state.payments) {
    try { state.payments = await api('/payments'); } catch (e) { state.payments = []; }
  }
  body.innerHTML =
    '<div class="checkout-card"><h3>' + esc(t('customer_info')) + '</h3>' +
    '<div class="field"><label>' + esc(t('name')) + '</label><input id="coName" type="text" value="' + esc(name) + '"></div>' +
    '<div class="field"><label>' + esc(t('phone')) + '</label><input id="coPhone" type="tel" value="' + esc(phone) + '" placeholder="09xxxxxxxxx"></div>' +
    '<div class="field"><label>' + esc(t('address')) + '</label><textarea id="coAddress" rows="2">' + esc(address) + '</textarea></div>' +
    '</div>' +

    '<div class="checkout-card"><h3>' + esc(t('delivery')) + '</h3>' +
    Object.keys(DELIVERY).map((k) =>
      '<label class="radio-line"><input type="radio" name="delivery" value="' + k + '"' + (k === 'yangon_inner' ? ' checked' : '') + '>' +
      '<span><span class="rl-title">' + esc(t('delivery_' + (k === 'yangon_inner' ? 'inner' : k === 'yangon_outer' ? 'outer' : k === 'outside_yangon' ? 'outside' : 'pickup'))) + '</span><br>' +
      '<span class="rl-note">' + esc(t(DELIVERY[k].noteKey)) + '</span></span></label>').join('') +
    '</div>' +

    '<div class="checkout-card"><h3>' + esc(t('payment')) + '</h3>' +
    '<label class="radio-line"><input type="radio" name="payment" value="cod" checked><span><span class="rl-title">' + esc(t('cod')) + '</span></span></label>' +
    '<label class="radio-line"><input type="radio" name="payment" value="transfer"><span><span class="rl-title">' + esc(t('transfer')) + '</span></span></label>' +
    '<div id="transferBox" hidden>' +
    '<div class="field" style="margin-top:12px"><label>' + esc(t('choose_account')) + '</label><div id="payAccounts"></div></div>' +
    '<div id="shotBox" hidden>' +
    '<div class="field"><label>' + esc(t('screenshot')) + '</label><input id="shotInput" type="file" accept="image/*"></div>' +
    '<div id="shotPreview" class="shot-preview"></div>' +
    '</div></div></div>' +

    '<div class="checkout-card"><h3>' + esc(t('total')) + '</h3>' +
    '<div class="order-summary-line"><span>' + esc(t('subtotal')) + '</span><span>' + fmt(cartSubtotal()) + '</span></div>' +
    (couponDiscount() > 0 ? '<div class="order-summary-line"><span>' + esc(t('discount')) + ' (' + esc(state.coupon.code) + ')</span><span>−' + fmt(couponDiscount()) + '</span></div>' : '') +
    '<div class="order-summary-line grand"><span>' + esc(t('total')) + '</span><span>' + fmt(cartTotal()) + '</span></div>' +
    '<div class="delivery-line" id="coDeliveryLine">' + esc(t('fee_inner')) + '</div>' +
    '</div>' +

    '<div id="coError" class="error-text" hidden></div>' +
    '<div id="coHint" class="hint" hidden></div>' +
    '<button id="placeOrderBtn" class="btn btn-primary btn-block" type="button">' + esc(t('place_order')) + '</button>';
  renderPayAccounts();
  wireCheckout();
  updatePlaceButton();
}
function renderPayAccounts() {
  const box = $('#payAccounts');
  if (!box) return;
  const list = state.payments || [];
  if (!list.length) { box.innerHTML = '<div class="empty">' + esc(t('error_load')) + '</div>'; return; }
  box.innerHTML = list.map((a, idx) =>
    '<div class="pay-account" data-acc="' + idx + '">' +
    '<div class="pa-info"><div class="pa-method">' + esc(a.method) + '</div>' +
    '<div class="pa-num">' + esc(a.account_number) + '</div>' +
    '<div class="pa-name">' + esc(a.account_name) + (a.note ? ' — ' + esc(a.note) : '') + '</div></div>' +
    '<button type="button" class="copy-btn" data-copy="' + esc(a.account_number) + '">' + esc(t('copy')) + '</button>' +
    '</div>').join('');
  $$('.pay-account', box).forEach((el) => {
    el.addEventListener('click', (ev) => {
      if (ev.target.closest('[data-copy]')) return;
      state.co.account = list[Number(el.dataset.acc)];
      $$('.pay-account', box).forEach((x) => x.classList.remove('sel'));
      el.classList.add('sel');
      $('#shotBox').hidden = false;
      updatePlaceButton();
    });
  });
  $$('[data-copy]', box).forEach((b) => {
    b.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const val = b.dataset.copy;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(val).then(() => toast(t('copied'))).catch(() => toast(val));
      } else toast(val);
    });
  });
}
function wireCheckout() {
  $$('input[name="delivery"]').forEach((r) => {
    r.addEventListener('change', () => {
      state.co.delivery = r.value;
      $('#coDeliveryLine').textContent = t(DELIVERY[r.value].noteKey);
    });
  });
  $$('input[name="payment"]').forEach((r) => {
    r.addEventListener('change', () => {
      state.co.payment = r.value;
      $('#transferBox').hidden = r.value !== 'transfer';
      if (r.value !== 'transfer') { state.co.account = null; state.co.screenshot = null; }
      updatePlaceButton();
    });
  });
  $('#shotInput').addEventListener('change', (ev) => {
    const file = ev.target.files && ev.target.files[0];
    if (!file) return;
    if (!file.type || file.type.indexOf('image/') !== 0) { toast(t('screenshot')); return; }
    const reader = new FileReader();
    reader.onload = () => {
      state.co.screenshot = reader.result;
      $('#shotPreview').innerHTML = '<img src="' + esc(reader.result) + '" alt="screenshot">';
      updatePlaceButton();
    };
    reader.readAsDataURL(file);
  });
  $('#placeOrderBtn').addEventListener('click', placeOrder);
}
function updatePlaceButton() {
  const btn = $('#placeOrderBtn');
  const hint = $('#coHint');
  if (!btn) return;
  if (state.co.payment === 'transfer' && !state.co.screenshot) {
    btn.disabled = true;
    hint.hidden = false;
    hint.className = 'hint warn';
    hint.textContent = t('screenshot_hint');
  } else {
    btn.disabled = false;
    hint.hidden = true;
  }
}
async function placeOrder() {
  const err = $('#coError');
  err.hidden = true;
  const name = $('#coName').value.trim();
  const phone = $('#coPhone').value.trim();
  const address = $('#coAddress').value.trim();
  if (!name || !phone || !address) { err.textContent = t('fill_all'); err.hidden = false; return; }
  if (!/^0\d{7,11}$/.test(phone.replace(/[\s-]/g, ''))) { err.textContent = t('invalid_phone'); err.hidden = false; return; }
  if (state.co.payment === 'transfer' && !state.co.screenshot) {
    err.textContent = t('screenshot_required_err'); err.hidden = false; return;
  }
  const btn = $('#placeOrderBtn');
  btn.disabled = true;
  const payload = {
    items: state.cart.map((i) => ({ product_id: i.product_id, option_label: i.option_label || undefined, qty: i.qty })),
    customer: { name: name, phone: phone, address: address },
    delivery: { method: state.co.delivery },
    payment: { method: state.co.payment },
  };
  if (state.co.payment === 'transfer') {
    payload.payment.account = state.co.account ? (state.co.account.method + ' ' + state.co.account.account_number) : undefined;
    payload.payment.screenshot_data = state.co.screenshot;
  }
  if (state.coupon) payload.coupon_code = state.coupon.code;
  try {
    const res = await api('/orders', { method: 'POST', body: JSON.stringify(payload) });
    const order = res.order || res;
    localStorage.setItem('bm_last_order', JSON.stringify({ name: name, phone: phone, address: address }));
    state.cart = []; state.coupon = null;
    saveCart(); saveCoupon(); updateCartBadge(); renderCart();
    const feeLine = order.delivery_note
      ? order.delivery_note
      : (order.delivery_fee != null && order.delivery_fee > 0
        ? t('delivery_fee') + ' ' + fmt(order.delivery_fee) + ' — ' + t('pay_on_delivery')
        : t(DELIVERY[state.co.delivery].noteKey));
    $('#checkoutBody').innerHTML =
      '<div class="checkout-card success-box">' +
      '<div class="big">✓</div>' +
      '<h3>' + esc(t('order_success')) + '</h3>' +
      '<p>' + esc(t('order_id')) + ': <strong>' + esc(order.id) + '</strong></p>' +
      '<p>' + esc(t('total')) + ': <strong>' + fmt(order.total != null ? order.total : cartTotal()) + '</strong></p>' +
      '<p class="delivery-line">' + esc(feeLine) + '</p>' +
      (state.co.payment === 'transfer' ? '<p>' + esc(t('transfer_note')) + '</p>' : '') +
      '<div style="margin-top:16px"><button class="btn btn-primary btn-block" type="button" id="backHomeBtn">' + esc(t('continue_shopping')) + '</button></div>' +
      '</div>';
    $('#backHomeBtn').addEventListener('click', () => { showView('home'); loadHomeGrid(true); });
  } catch (e) {
    btn.disabled = false;
    if (e.status === 400 && e.data && e.data.error === 'screenshot_required') {
      err.textContent = t('screenshot_required_err');
    } else if (e.data && e.data.error) {
      err.textContent = e.data.error;
    } else {
      err.textContent = t('order_failed');
    }
    err.hidden = false;
    updatePlaceButton();
  }
}

/* ---------------- auth ---------------- */
let authMode = 'login';
function openAuth() {
  authMode = 'login';
  setAuthTab('login');
  $('#authError').hidden = true;
  openOverlay('#authOverlay', '#authModal');
}
function closeAuth() { closeOverlay('#authOverlay', '#authModal'); }
function setAuthTab(mode) {
  authMode = mode;
  $$('#authTabs .tab').forEach((b) => b.classList.toggle('active', b.dataset.atab === mode));
  $('#authNameRow').hidden = mode !== 'register';
  $('#authTitle').textContent = mode === 'register' ? t('register') : t('login');
  $('#authSubmit').textContent = mode === 'register' ? t('register') : t('login');
}
async function submitAuth() {
  const err = $('#authError');
  err.hidden = true;
  const phone = $('#authPhone').value.trim();
  const password = $('#authPass').value;
  const name = $('#authName').value.trim();
  if (!phone || !password || (authMode === 'register' && !name)) {
    err.textContent = t('fill_all'); err.hidden = false; return;
  }
  const btn = $('#authSubmit');
  btn.disabled = true;
  try {
    const path = authMode === 'register' ? '/auth/register' : '/auth/login';
    const body = authMode === 'register'
      ? { name: name, phone: phone, password: password }
      : { phone: phone, password: password };
    const res = await api(path, { method: 'POST', body: JSON.stringify(body) });
    if (res.token) {
      state.token = res.token;
      localStorage.setItem('bm_token', res.token);
    }
    state.user = res.user || null;
    if (!state.user && state.token) {
      try { const me = await api('/me'); state.user = me.user || me; } catch (e) { /* keep null */ }
    }
    closeAuth();
    refreshAuthUI();
    toast(t('login') + ' ✓');
  } catch (e) {
    err.textContent = t('auth_fail');
    err.hidden = false;
  } finally { btn.disabled = false; }
}
function logout() {
  state.token = null;
  state.user = null;
  localStorage.removeItem('bm_token');
  state.manageLoaded = {};
  refreshAuthUI();
  showView('home');
}
function refreshAuthUI() {
  const btn = $('#authBtn');
  if (state.user) {
    btn.textContent = state.user.name + ' • ' + t('logout');
  } else {
    btn.textContent = t('login');
  }
  const isMgr = !!(state.user && state.user.is_manager);
  $('#navManage').hidden = !isMgr;
  if (!isMgr && !$('#view-manage').hidden) showView('home');
}
async function restoreSession() {
  if (!state.token) return;
  try {
    const me = await api('/me');
    state.user = me.user || me;
  } catch (e) {
    state.token = null;
    state.user = null;
    localStorage.removeItem('bm_token');
  }
  refreshAuthUI();
}

/* ---------------- orders ---------------- */
async function loadOrders() {
  const list = $('#ordersList');
  if (!state.user) {
    list.innerHTML = '<div class="empty">' + esc(t('login_needed')) + '</div>' +
      '<div class="center"><button class="btn btn-primary" type="button" id="ordersLoginBtn">' + esc(t('login')) + '</button></div>';
    $('#ordersLoginBtn').addEventListener('click', openAuth);
    return;
  }
  list.innerHTML = '<div class="loading">' + esc(t('loading')) + '</div>';
  try {
    const data = await api('/orders');
    const orders = data.orders || data.items || (Array.isArray(data) ? data : []);
    if (!orders.length) { list.innerHTML = '<div class="empty">' + esc(t('no_orders')) + '</div>'; return; }
    list.innerHTML = orders.map((o) =>
      '<button type="button" class="order-card" data-order="' + esc(String(o.id)) + '">' +
      '<span class="oc-top"><span>' + esc(o.id) + '</span><span class="status-pill">' + esc(o.status || '') + '</span></span>' +
      '<div class="oc-meta">' + esc(o.created_at || '') + ' • ' + esc(t('total')) + ': ' + fmt(o.total) + '</div>' +
      (o.delivery_note ? '<div class="oc-meta">' + esc(o.delivery_note) + '</div>' : '') +
      '</button>').join('');
    $$('[data-order]', list).forEach((b) => b.addEventListener('click', () => openOrderDetail(b.dataset.order)));
  } catch (e) {
    list.innerHTML = '<div class="error-box">' + esc(t('error_load')) + '</div>';
  }
}
async function openOrderDetail(id) {
  openOverlay('#orderOverlay', '#orderModal');
  $('#orderBody').innerHTML = '<div class="loading">' + esc(t('loading')) + '</div>';
  try {
    const data = await api('/orders/' + encodeURIComponent(id));
    const o = data.order || data;
    const items = o.items || [];
    $('#orderBody').innerHTML =
      '<div class="line"><span>' + esc(t('order_id')) + '</span><strong>' + esc(o.id) + '</strong></div>' +
      '<div class="line"><span>' + esc(t('status')) + '</span><span class="status-pill">' + esc(o.status || '') + '</span></div>' +
      '<div class="line"><span>' + esc(t('date')) + '</span><span>' + esc(o.created_at || '') + '</span></div>' +
      '<hr>' +
      items.map((it) =>
        '<div class="line"><span>' + esc(it.name || it.product_id) + (it.option_label ? ' (' + esc(it.option_label) + ')' : '') + ' × ' + (it.qty || 1) + '</span><span>' + fmt((it.price || 0) * (it.qty || 1)) + '</span></div>').join('') +
      '<hr>' +
      '<div class="line"><span>' + esc(t('subtotal')) + '</span><span>' + fmt(o.subtotal) + '</span></div>' +
      (o.discount ? '<div class="line"><span>' + esc(t('discount')) + '</span><span>−' + fmt(o.discount) + '</span></div>' : '') +
      '<div class="line"><strong>' + esc(t('total')) + '</strong><strong>' + fmt(o.total) + '</strong></div>' +
      '<div class="delivery-line">' + esc(o.delivery_note || (o.delivery_fee != null && o.delivery_fee > 0 ? t('delivery_fee') + ' ' + fmt(o.delivery_fee) + ' — ' + t('pay_on_delivery') : '')) + '</div>';
  } catch (e) {
    $('#orderBody').innerHTML = '<div class="error-box">' + esc(t('error_load')) + '</div>';
  }
}

/* ---------------- manage ---------------- */
function loadManage(tab) {
  state.manageTab = tab;
  $$('#manageTabs .tab').forEach((b) => b.classList.toggle('active', b.dataset.mtab === tab));
  const body = $('#manageBody');
  if (!state.user || !state.user.is_manager) {
    body.innerHTML = '<div class="error-box">' + esc(t('manage_no_access')) + '</div>';
    return;
  }
  if (tab === 'dashboard') renderManageDashboard(body);
  else if (tab === 'catalog') renderManageCatalog(body);
  else if (tab === 'coupons') renderManageCoupons(body);
  else if (tab === 'payments') renderManagePayments(body);
  else if (tab === 'applink') renderManageAppLinks(body);
  else if (tab === 'woocommerce') renderManageWoo(body);
}
async function renderManageDashboard(body) {
  body.innerHTML = '<div class="loading">' + esc(t('loading')) + '</div>';
  try {
    const s = await api('/manage/stats');
    const entries = Object.entries(s || {});
    if (!entries.length) { body.innerHTML = '<div class="empty">' + esc(t('empty')) + '</div>'; return; }
    const labelFor = (k) => {
      const map = { orders_count: t('orders'), total_sales: t('sales'), products_count: t('products'), customers_count: t('customers') };
      return map[k] || k.replace(/_/g, ' ');
    };
    const valFor = (k, v) => (String(k).indexOf('sales') !== -1 || String(k).indexOf('revenue') !== -1 || String(k).indexOf('total') !== -1) && typeof v === 'number' ? fmt(v) : esc(String(v));
    body.innerHTML = '<div class="stat-grid">' + entries.map(([k, v]) =>
      '<div class="stat"><div class="num">' + valFor(k, v) + '</div><div class="lbl">' + esc(labelFor(k)) + '</div></div>').join('') + '</div>';
  } catch (e) {
    body.innerHTML = '<div class="error-box">' + esc(t('error_load')) + '</div>';
  }
}
let mgCatalog = { q: '', offset: 0, items: [] };
async function renderManageCatalog(body) {
  body.innerHTML =
    '<div class="mg-card"><div class="row-flex">' +
    '<input id="mgSearch" type="search" placeholder="' + esc(t('search_products')) + '" style="flex:1;padding:10px 12px;border:1.5px solid var(--line);border-radius:10px;min-width:160px">' +
    '<button class="btn btn-primary" type="button" id="mgSearchBtn">' + esc(t('search_btn')) + '</button>' +
    '</div><div id="mgTableWrap" class="table-wrap" style="margin-top:12px"></div>' +
    '<div class="center" style="margin-top:12px"><button class="btn btn-outline" type="button" id="mgMoreBtn">' + esc(t('more')) + '</button></div></div>';
  mgCatalog = { q: '', offset: 0, items: [] };
  const doSearch = () => {
    mgCatalog.q = $('#mgSearch').value.trim();
    mgCatalog.offset = 0; mgCatalog.items = [];
    loadMgCatalog(true);
  };
  $('#mgSearchBtn').addEventListener('click', doSearch);
  $('#mgSearch').addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(); });
  $('#mgMoreBtn').addEventListener('click', () => loadMgCatalog(false));
  loadMgCatalog(true);
}
async function loadMgCatalog(reset) {
  const wrap = $('#mgTableWrap');
  if (reset) wrap.innerHTML = '<div class="loading">' + esc(t('loading')) + '</div>';
  const params = new URLSearchParams({ limit: String(PAGE), offset: String(mgCatalog.offset) });
  if (mgCatalog.q) params.set('q', mgCatalog.q);
  try {
    const data = await api('/manage/products?' + params.toString());
    const items = data.items || [];
    if (reset) mgCatalog.items = items; else mgCatalog.items = mgCatalog.items.concat(items);
    mgCatalog.offset += items.length;
    $('#mgMoreBtn').style.display = (data.total != null && mgCatalog.offset < data.total) ? '' : 'none';
    if (!mgCatalog.items.length) { wrap.innerHTML = '<div class="empty">' + esc(t('empty')) + '</div>'; return; }
    wrap.innerHTML = '<table class="mg-table"><thead><tr><th>' + esc(t('products')) + '</th><th>' + esc(t('price')) + '</th><th>' + esc(t('sale_price')) + '</th><th>' + esc(t('stock_qty')) + '</th><th>' + esc(t('is_new')) + '</th><th>' + esc(t('best_seller')) + '</th></tr></thead><tbody>' +
      mgCatalog.items.map((p) =>
        '<tr><td><strong>' + esc(p.name) + '</strong><br><span style="color:var(--muted);font-size:12px">' + esc(p.brand || '') + '</span></td>' +
        '<td>' + fmt(p.price) + '</td>' +
        '<td><input type="number" min="0" step="500" value="' + (p.sale_price != null ? p.sale_price : '') + '" placeholder="' + fmt(p.price) + '" data-sale="' + esc(String(p.id)) + '"></td>' +
        '<td><strong>' + esc(String(p.stock != null ? p.stock : (p.quantity != null ? p.quantity : '—'))) + '</strong></td>' +
        '<td><button type="button" class="toggle' + (p.is_new ? ' on' : '') + '" data-tgl="is_new" data-id="' + esc(String(p.id)) + '" aria-label="' + esc(t('is_new')) + '"></button></td>' +
        '<td><button type="button" class="toggle' + (p.best_seller ? ' on' : '') + '" data-tgl="best_seller" data-id="' + esc(String(p.id)) + '" aria-label="' + esc(t('best_seller')) + '"></button></td>' +
        '</tr>').join('') + '</tbody></table>';
    $$('[data-sale]', wrap).forEach((inp) => {
      inp.addEventListener('change', async () => {
        const val = inp.value === '' ? null : Number(inp.value);
        try {
          await api('/manage/products/' + encodeURIComponent(inp.dataset.sale), { method: 'PATCH', body: JSON.stringify({ sale_price: val }) });
          toast(t('saved'));
        } catch (e) { toast(t('error_load')); }
      });
    });
    $$('[data-tgl]', wrap).forEach((btn) => {
      btn.addEventListener('click', async () => {
        const field = btn.dataset.tgl;
        const on = !btn.classList.contains('on');
        try {
          await api('/manage/products/' + encodeURIComponent(btn.dataset.id), { method: 'PATCH', body: JSON.stringify({ [field]: on }) });
          btn.classList.toggle('on', on);
        } catch (e) { toast(t('error_load')); }
      });
    });
  } catch (e) {
    if (reset) wrap.innerHTML = '<div class="error-box">' + esc(t('error_load')) + '</div>';
  }
}
async function renderManageCoupons(body) {
  body.innerHTML = '<div class="mg-card"><h3>Coupons</h3>' +
    '<div class="row-flex">' +
    '<input id="cpCode" type="text" placeholder="' + esc(t('coupon_code')) + '" style="text-transform:uppercase;padding:10px 12px;border:1.5px solid var(--line);border-radius:10px;width:140px">' +
    '<select id="cpType" style="padding:10px;border:1.5px solid var(--line);border-radius:10px"><option value="percent">' + esc(t('percent')) + '</option><option value="fixed">' + esc(t('fixed')) + '</option></select>' +
    '<input id="cpValue" type="number" min="0" placeholder="' + esc(t('coupon_value')) + '" style="padding:10px 12px;border:1.5px solid var(--line);border-radius:10px;width:110px">' +
    '<button class="btn btn-primary" type="button" id="cpAddBtn">' + esc(t('add')) + '</button>' +
    '</div><div id="cpList" style="margin-top:14px"></div></div>';
  const load = async () => {
    const listEl = $('#cpList');
    listEl.innerHTML = '<div class="loading">' + esc(t('loading')) + '</div>';
    try {
      const data = await api('/manage/coupons');
      const list = data.coupons || data.items || (Array.isArray(data) ? data : []);
      if (!list.length) { listEl.innerHTML = '<div class="empty">' + esc(t('no_coupons')) + '</div>'; return; }
      listEl.innerHTML = list.map((c) =>
        '<div class="pay-account"><div class="pa-info"><div class="pa-method">' + esc(c.code) + '</div>' +
        '<div class="pa-name">' + esc(c.type) + ' — ' + esc(String(c.value)) + (c.type === 'percent' ? '%' : ' Ks') + '</div></div>' +
        '<button type="button" class="btn btn-danger mini" data-delcp="' + esc(c.code) + '">' + esc(t('del')) + '</button></div>').join('');
      $$('[data-delcp]', listEl).forEach((b) => b.addEventListener('click', async () => {
        if (!window.confirm(t('confirm_delete'))) return;
        try {
          await api('/manage/coupons/' + encodeURIComponent(b.dataset.delcp), { method: 'DELETE' });
          toast(t('deleted')); load();
        } catch (e) { toast(t('error_load')); }
      }));
    } catch (e) { listEl.innerHTML = '<div class="error-box">' + esc(t('error_load')) + '</div>'; }
  };
  $('#cpAddBtn').addEventListener('click', async () => {
    const code = $('#cpCode').value.trim().toUpperCase();
    const type = $('#cpType').value;
    const value = Number($('#cpValue').value);
    if (!code || !value) { toast(t('fill_all')); return; }
    try {
      await api('/manage/coupons', { method: 'POST', body: JSON.stringify({ code: code, type: type, value: value }) });
      toast(t('saved')); $('#cpCode').value = ''; $('#cpValue').value = '';
      load();
    } catch (e) { toast(t('error_load')); }
  });
  load();
}
async function renderManagePayments(body) {
  body.innerHTML = '<div class="mg-card"><h3>' + esc(t('payment')) + '</h3><div id="mgPayList"></div>' +
    '<button class="btn btn-primary btn-block" type="button" id="mgPaySave" style="margin-top:12px">' + esc(t('save')) + '</button></div>';
  const listEl = $('#mgPayList');
  listEl.innerHTML = '<div class="loading">' + esc(t('loading')) + '</div>';
  try {
    const data = await api('/manage/payments');
    const list = data.payments || data.items || (Array.isArray(data) ? data : []);
    listEl.innerHTML = list.map((a, i) =>
      '<div class="mg-card" style="margin-bottom:10px"><strong>' + esc(a.method) + '</strong>' +
      '<div class="field" style="margin-top:8px"><label>' + esc(t('account_name')) + '</label><input type="text" data-pf="account_name" data-pi="' + i + '" value="' + esc(a.account_name || '') + '"></div>' +
      '<div class="field"><label>' + esc(t('account_number')) + '</label><input type="text" data-pf="account_number" data-pi="' + i + '" value="' + esc(a.account_number || '') + '"></div>' +
      '<div class="field"><label>' + esc(t('note')) + '</label><input type="text" data-pf="note" data-pi="' + i + '" value="' + esc(a.note || '') + '"></div></div>').join('');
    $('#mgPaySave').addEventListener('click', async () => {
      const updated = list.map((a, i) => {
        const row = Object.assign({}, a);
        $$('[data-pi="' + i + '"]').forEach((inp) => { row[inp.dataset.pf] = inp.value; });
        return row;
      });
      try {
        await api('/manage/payments', { method: 'PUT', body: JSON.stringify(updated) });
        toast(t('saved'));
      } catch (e) { toast(t('error_load')); }
    });
  } catch (e) { listEl.innerHTML = '<div class="error-box">' + esc(t('error_load')) + '</div>'; }
}
async function renderManageAppLinks(body) {
  body.innerHTML = '<div class="mg-card"><h3>App link</h3>' +
    '<div class="field"><label>' + esc(t('play_store')) + '</label><input id="alPlay" type="url" placeholder="https://play.google.com/store/apps/details?id=…"></div>' +
    '<div class="field"><label>' + esc(t('app_store')) + '</label><input id="alApp" type="url" placeholder="https://apps.apple.com/…"></div>' +
    '<button class="btn btn-primary btn-block" type="button" id="alSave">' + esc(t('save')) + '</button></div>';
  try {
    const data = await api('/manage/app-links');
    $('#alPlay').value = data.play_store_url || '';
    $('#alApp').value = data.app_store_url || '';
  } catch (e) { /* leave blank */ }
  $('#alSave').addEventListener('click', async () => {
    try {
      await api('/manage/app-links', { method: 'PUT', body: JSON.stringify({ play_store_url: $('#alPlay').value.trim(), app_store_url: $('#alApp').value.trim() }) });
      toast(t('saved'));
      loadShopInfo();
    } catch (e) { toast(t('error_load')); }
  });
}
async function renderManageWoo(body) {
  body.innerHTML = '<div class="mg-card"><h3>WooCommerce</h3><div id="wooStatus" class="meta-line">' + esc(t('loading')) + '</div>' +
    '<div class="warn-box">⚠ ' + esc(t('wc_warn')) + '</div>' +
    '<div class="field"><label>' + esc(t('site_url')) + '</label><input id="wooSite" type="url" placeholder="https://…"></div>' +
    '<div class="field"><label>' + esc(t('consumer_key')) + '</label>' +
    '<div class="key-field"><input id="wooKey" type="password" placeholder="' + esc(t('new_key')) + '"><button type="button" class="eye-btn" data-eye="wooKey">👁</button></div>' +
    '<div class="meta-line">Saved: <span id="wooKeySaved" class="masked">—</span></div></div>' +
    '<div class="field"><label>' + esc(t('consumer_secret')) + '</label>' +
    '<div class="key-field"><input id="wooSecret" type="password" placeholder="' + esc(t('new_secret')) + '"><button type="button" class="eye-btn" data-eye="wooSecret">👁</button></div>' +
    '<div class="meta-line">Saved: <span id="wooSecretSaved" class="masked">—</span></div></div>' +
    '<div class="row-flex">' +
    '<button class="btn btn-primary" type="button" id="wooSave">' + esc(t('save')) + '</button>' +
    '<button class="btn btn-outline" type="button" id="wooTest">' + esc(t('test')) + '</button>' +
    '<button class="btn btn-outline" type="button" id="wooPreview">' + esc(t('preview')) + '</button>' +
    '<button class="btn btn-outline" type="button" id="wooImport">' + esc(t('import')) + '</button>' +
    '</div><div id="wooMsg" class="meta-line" style="margin-top:10px"></div>' +
    '<div id="wooResult"></div></div>';
  $$('[data-eye]').forEach((b) => b.addEventListener('click', () => {
    const inp = $('#' + b.dataset.eye);
    inp.type = inp.type === 'password' ? 'text' : 'password';
  }));
  try {
    const s = await api('/manage/settings/woocommerce');
    $('#wooStatus').textContent = s.configured ? t('wc_configured') : t('wc_not_configured');
    $('#wooSite').value = s.site_url || '';
    $('#wooKeySaved').textContent = s.consumer_key_masked || '—';
    $('#wooSecretSaved').textContent = s.consumer_secret_masked || '—';
  } catch (e) { $('#wooStatus').textContent = t('error_load'); }
  $('#wooSave').addEventListener('click', async () => {
    const payload = { site_url: $('#wooSite').value.trim() };
    if ($('#wooKey').value) payload.consumer_key = $('#wooKey').value;
    if ($('#wooSecret').value) payload.consumer_secret = $('#wooSecret').value;
    try {
      const s = await api('/manage/settings/woocommerce', { method: 'PUT', body: JSON.stringify(payload) });
      $('#wooKeySaved').textContent = s.consumer_key_masked || $('#wooKeySaved').textContent;
      $('#wooSecretSaved').textContent = s.consumer_secret_masked || $('#wooSecretSaved').textContent;
      $('#wooKey').value = ''; $('#wooSecret').value = '';
      $('#wooMsg').textContent = t('saved');
    } catch (e) { $('#wooMsg').textContent = t('error_load'); }
  });
  $('#wooTest').addEventListener('click', async () => {
    $('#wooMsg').textContent = t('loading');
    try {
      const r = await api('/manage/woocommerce/test', { method: 'POST', body: JSON.stringify({}) });
      $('#wooMsg').textContent = (r.ok ? t('wc_test_ok') : t('wc_test_fail')) + (r.message ? ' — ' + r.message : '');
    } catch (e) { $('#wooMsg').textContent = t('wc_test_fail'); }
  });
  $('#wooPreview').addEventListener('click', async () => {
    $('#wooMsg').textContent = t('loading');
    try {
      const r = await api('/manage/woocommerce/preview', { method: 'POST', body: JSON.stringify({}) });
      $('#wooMsg').textContent = '';
      $('#wooResult').innerHTML = '<table class="mg-table"><tbody>' +
        '<tr><td>' + esc(t('matched')) + '</td><td><strong>' + esc(String(r.matched != null ? r.matched : (r.totals && r.totals.matched) || '—')) + '</strong></td></tr>' +
        '<tr><td>' + esc(t('pos_only')) + '</td><td><strong>' + esc(String(r.pos_only != null ? r.pos_only : (r.totals && r.totals.pos_only) || '—')) + '</strong></td></tr>' +
        '<tr><td>' + esc(t('wc_only')) + '</td><td><strong>' + esc(String(r.wc_only_count != null ? r.wc_only_count : (r.totals && r.totals.wc_only_count) || '—')) + '</strong></td></tr>' +
        '</tbody></table>';
    } catch (e) { $('#wooMsg').textContent = t('error_load'); }
  });
  $('#wooImport').addEventListener('click', async () => {
    if (!window.confirm(t('confirm_import'))) return;
    $('#wooMsg').textContent = t('loading');
    try {
      const r = await api('/manage/woocommerce/import', { method: 'POST', body: JSON.stringify({}) });
      $('#wooMsg').textContent = t('saved');
      $('#wooResult').innerHTML = '<pre style="white-space:pre-wrap;font-size:13px">' + esc(JSON.stringify(r, null, 2)) + '</pre>';
      loadBrands(); loadHomeGrid(true);
    } catch (e) { $('#wooMsg').textContent = t('error_load'); }
  });
}

/* ---------------- wiring / init ---------------- */
function wire() {
  $('#logoHome').addEventListener('click', () => { showView('home'); });
  $('#langToggle').addEventListener('click', () => {
    lang = lang === 'my' ? 'en' : 'my';
    localStorage.setItem('bm_lang', lang);
    applyI18n();
    renderChips($('#brandChips'), true);
    renderChips($('#shopBrandChips'), false);
    loadHomeGrid(true);
    if (!$('#view-shop').hidden) loadShopGrid(true);
  });
  $('#cartBtn').addEventListener('click', openCart);
  $('#cartClose').addEventListener('click', closeCart);
  $('#cartOverlay').addEventListener('click', closeCart);
  $('#authBtn').addEventListener('click', () => {
    if (state.user) { if (window.confirm(t('logout') + '?')) logout(); }
    else openAuth();
  });
  $('#authClose').addEventListener('click', closeAuth);
  $('#authOverlay').addEventListener('click', closeAuth);
  $$('#authTabs .tab').forEach((b) => b.addEventListener('click', () => setAuthTab(b.dataset.atab)));
  $('#authSubmit').addEventListener('click', submitAuth);
  $('#authPass').addEventListener('keydown', (e) => { if (e.key === 'Enter') submitAuth(); });
  $('#detailClose').addEventListener('click', () => closeOverlay('#detailOverlay', '#detailModal'));
  $('#detailOverlay').addEventListener('click', () => closeOverlay('#detailOverlay', '#detailModal'));
  $('#orderClose').addEventListener('click', () => closeOverlay('#orderOverlay', '#orderModal'));
  $('#orderOverlay').addEventListener('click', () => closeOverlay('#orderOverlay', '#orderModal'));
  $('#couponApplyBtn').addEventListener('click', applyCoupon);
  $('#couponInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') applyCoupon(); });
  $('#checkoutBtn').addEventListener('click', () => { if (state.cart.length) openCheckout(); });
  $('#playStoreBtn').addEventListener('click', () => onAppButton('play_store_url'));
  $('#appStoreBtn').addEventListener('click', () => onAppButton('app_store_url'));
  $$('.nav-item').forEach((b) => b.addEventListener('click', () => showView(b.dataset.view)));
  $$('#manageTabs .tab').forEach((b) => b.addEventListener('click', () => loadManage(b.dataset.mtab)));
  $$('[data-viewall]').forEach((b) => b.addEventListener('click', () => {
    state.brandFilter = '';
    state.searchQuery = '';
    $('#searchInput').value = '';
    showView('shop');
    loadShopGrid(true);
  }));
  $('#homeMoreBtn').addEventListener('click', () => loadHomeGrid(false));
  $('#shopMoreBtn').addEventListener('click', () => loadShopGrid(false));
  let searchTimer = null;
  const doSearch = () => {
    const q = $('#searchInput').value.trim();
    state.searchQuery = q.length >= 2 ? q : '';
    state.shopOffset = 0;
    showView('shop');
    loadShopGrid(true);
  };
  $('#searchBtn').addEventListener('click', doSearch);
  $('#searchInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(); });
  $('#searchInput').addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      if ($('#searchInput').value.trim().length >= 2) doSearch();
    }, 500);
  });
}

async function init() {
  wire();
  applyI18n();
  updateCartBadge();
  renderCart();
  await restoreSession();
  await loadShopInfo();
  await loadBrands();
  loadHome();
}
document.addEventListener('DOMContentLoaded', init);
