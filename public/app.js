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
    nav_cart: 'ခြင်းတောင်း', nav_wishlist: 'အကြိုက်ဆုံး',
    nav_checkout: 'ငွေချေ',
    checkout_empty: 'ခြင်းတောင်းထဲ ပစ္စည်း မရှိသေးပါ — အရင် ပစ္စည်း ရွေးပါ',
    account_title: 'ကျွန်ုပ်၏ အကောင့်', my_orders: 'ကျွန်ုပ်၏ အော်ဒါများ',
    change_password: 'Password ပြောင်းမယ်', current_password: 'လက်ရှိ Password',
    new_password: 'Password အသစ်', confirm_password: 'Password အသစ် (ထပ်ရိုက်ပါ)',
    password_changed: 'Password ပြောင်းပြီးပါပြီ', password_mismatch: 'Password အသစ်တွေ မတူပါ',
    wrong_password: 'လက်ရှိ Password မမှန်ပါ',
    forgot_password: 'Password မေ့သွားလား?',
    forgot_help: 'ဆိုင်ကို Messenger (သို့) ဖုန်း 09765117366 နဲ့ ဆက်သွယ်ပါ — ဝန်ထမ်းက Password အသစ် ပြန်ပေးပါမယ်။',
    view_coupons: 'Coupon များ ကြည့်မယ်', coupons_title: 'Coupon များ',
    use_coupon: 'သုံးမယ်', no_coupons_active: 'Coupon မရှိသေးပါ',
    percent_off: '% လျှော့', amount_off: 'Ks လျှော့',
    password_too_short: 'Password အနည်းဆုံး ၄ လုံး ရှိရပါမယ်',
    wishlist_title: 'အကြိုက်ဆုံး ပစ္စည်းများ', wishlist_empty: 'အကြိုက်ဆုံး ပစ္စည်းထဲ ပစ္စည်း မရှိသေးပါ',
    wish_add: 'အကြိုက်ဆုံး ထဲ ထည့်မယ်', wish_remove: 'အကြိုက်ဆုံး ကနေ ဖယ်မယ်',
    wish_added: 'အကြိုက်ဆုံး ထဲ ထည့်ပြီးပါပြီ', wish_removed: 'အကြိုက်ဆုံး ကနေ ဖယ်ပြီးပါပြီ',
    clear_filters: 'ဖယ်မယ်',
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
    delivery_inner: 'ရန်ကုန်', delivery_outer: 'မန္တလေး',
    delivery_outside: 'ရန်ကုန် အပြင် နှင့် မန္တလေး', delivery_pickup: 'ဆိုင်မှာ လာယူမယ်',
    fee_inner: 'ပို့ခ 4000 - 4500 Ks — ပစ္စည်းရောက်မှ ပေးပါ',
    fee_outer: 'ပို့ခ 4000 - 4500 Ks — ပစ္စည်းရောက်မှ ပေးပါ',
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
    insufficient_stock: 'ပစ္စည်း stock မလုံလောက်ပါ။ အရေအတွက် လျှော့ပြီး ပြန်ကြိုးစားပါ။',
    orders_title: 'ကျွန်ုပ်၏ အော်ဒါများ', login_needed: 'အော်ဒါများ ကြည့်ဖို့ အကောင့် ဝင်ပါ။',
    no_orders: 'အော်ဒါမရှိသေးပါ', order_detail: 'အော်ဒါ အသေးစိတ်',
    register: 'Register', password: 'Password', auth_fail: 'ဖုန်း (သို့) Password မမှန်ပါ',
    coming_soon: 'App မကြာခင် လာပါမယ်',
    close: 'ပိတ်မယ်', remove: 'ဖယ်မယ်', save: 'သိမ်းမယ်', add: 'ထည့်မယ်', del: 'ဖျက်မယ်',
    saved: 'သိမ်းပြီးပါပြီ', deleted: 'ဖျက်ပြီးပါပြီ', confirm_delete: 'ဖျက်မှာ သေချာလား?',
    test: 'Test connection', preview: 'Preview', import: 'Import', confirm_import: 'Import လုပ်မှာ သေချာလား?',
    qty: 'အရေအတွက်', stock_qty: 'Stock အရေအတွက်', price: 'ဈေး', sale_price: 'လျှော့ဈေး',
    is_new: 'အသစ်', sale_featured: 'Sale ★', best_seller: 'အရောင်းရဆုံး', brand: 'Brand',
    manage_no_access: 'Manage ကို Manager အကောင့်နဲ့သာ သုံးနိုင်ပါတယ်။',
    wc_warn: 'key ကို chat မှာ ဘယ်တော့မှ မပို့ပါနဲ့',
    wc_configured: 'WooCommerce ချိတ်ပြီးပါပြီ', wc_not_configured: 'WooCommerce မချိတ်ရသေးပါ',
    wc_test_ok: 'ချိတ်ဆက်မှု အောင်မြင်ပါတယ်', wc_test_fail: 'ချိတ်ဆက်မှု မအောင်မြင်ပါ',
    woo_preview_first: 'အရင် Preview နှိပ်ပါ', woo_browser_blocked: 'ဘရောင်ဇာက WooCommerce ကို ဆက်သွယ်လို့ မရပါ',
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
    status_pending: 'စောင့်ဆိုင်းနေတယ်', status_confirmed: 'အတည်ပြုပြီး', status_delivering: 'ပို့နေတယ်', status_delivered: 'ပို့ပြီးပြီ', status_cancelled: 'ပယ်ဖျက်ပြီး',
    search_orders: 'အော်ဒါ နံပါတ် / နာမည် / ဖုန်း ရှာမယ်…', search_users: 'နာမည် / ဖုန်း ရှာမယ်…',
    all_statuses: 'Status အားလုံး', change_status: 'Status ပြောင်းမယ်', status_changed: 'Status ပြောင်းပြီးပါပြီ',
    screenshot: 'ငွေလွှဲ Screenshot', no_screenshot: 'Screenshot မရှိပါ',
    new_password: 'Password အသစ်', set_password: 'Password ချိန်းမယ်', password_changed: 'Password အသစ် ချိန်းပြီးပါပြီ — customer ကို အသစ်ကို ပြောပေးပါ',
    manager: 'Manager', owner: 'Owner', make_manager: 'Manager ပေးမယ်', remove_manager: 'Manager ဖြုတ်မယ်',
    managers_title: 'Manager များ', add_manager_ph: 'ဖုန်းနံပါတ် ထည့်ပါ (အရင် register လုပ်ထားရမယ်)',
    user_not_found: 'ဒီဖုန်းနဲ့ အကောင့် မရှိသေးပါ — အရင် register လုပ်ခိုင်းပါ',
    owner_only: 'Owner (095117366) ပဲ လုပ်နိုင်ပါတယ်', no_users: 'User မရှိသေးပါ',
    pw_reset_hint: 'ချိန်းပြီးရင် customer ကို Messenger / ဖုန်း နဲ့ password အသစ်ကို ပြောပေးပါ — customer က အသစ်နဲ့ ပြန်ဝင်ရမယ်',
    activity: 'လုပ်ဆောင်ချက် မှတ်တမ်း', search_activity: 'ရှာမယ် (လူ / order / ပစ္စည်း)…', all_actions: 'လုပ်ဆောင်ချက် အားလုံး', no_activity: 'မှတ်တမ်း မရှိသေးပါ',
    action_order_status: 'Order status ပြောင်းတယ်', action_password_reset: 'Password ချိန်းပေးတယ်', action_manager_add: 'Manager ထည့်တယ်', action_manager_remove: 'Manager ဖြုတ်တယ်', action_product_update: 'ပစ္စည်း ပြင်တယ်', action_product_photo_add: 'ပစ္စည်း ပုံ ထည့်တယ်', action_product_photo_remove: 'ပစ္စည်း ပုံ ဖျက်တယ်', action_coupon_create: 'Coupon လုပ်တယ်', action_coupon_delete: 'Coupon ဖျက်တယ်', action_payments_update: 'Payment အကောင့် ပြင်တယ်', action_app_links_update: 'App link ပြင်တယ်', action_woocommerce_settings: 'WooCommerce setting ပြင်တယ်', action_woocommerce_import: 'WooCommerce ပုံ တင်တယ်', action_order_edit: 'Order ပစ္စည်း ပြင်တယ်',
    edit_items: 'ပစ္စည်း ပြင်မယ်', save_changes: 'သိမ်းမယ်', cancel: 'မလုပ်တော့ဘူး', no_items: 'ပစ္စည်း မရှိသေးပါ', order_locked: 'ပို့ပြီးသား / ပယ်ဖျက်ထားတဲ့ order ကို ပြင်လို့မရပါ', total_changed: 'Total ပြောင်းသွားတယ်', total_diff_hint: 'customer လွှဲထားတဲ့ ငွေ ကွာရင် Messenger နဲ့ ပြောပေးပါ',
    coupon: 'Coupon', apply: 'သုံးမယ်', remove_coupon: 'Coupon ဖြုတ်မယ်', coupon_invalid: 'Coupon မမှန်ပါ', action_order_coupon: 'Order coupon ပြင်တယ်',
    manager_hint: 'ဝန်ထမ်းက ဆိုင်မှာ အရင် register လုပ်ထားရမယ် (နာမည် + ဖုန်း) — ပြီးမှ ဒီမှာ ဖုန်းနံပါတ် ရိုက်ပြီး Add လုပ်ပါ',
    add_photo: 'ပုံထည့်မယ်', change_photo: 'ပုံပြောင်းမယ်', remove_photo: 'ပုံဖျက်မယ်',
    coupon_scope: 'Coupon သက်ရောက်မယ့် အရာ (မရွေးရင် ပစ္စည်းအားလုံးအတွက်)',
    scope_brands: 'Brand များ', scope_products: 'ပစ္စည်းများ', scope_customers: 'Customer များ (ဖုန်း)',
    scope_customers_hint: 'ဖုန်းနံပါတ် ရိုက်ပြီး Add လုပ်ပါ — မထည့်ရင် customer အားလုံးအတွက်',
    coupon_for_brands: 'ဒီ brand တွေအတွက်သာ', coupon_for_products: 'ဒီ ပစ္စည်းတွေအတွက်သာ',
    coupon_for_customers: 'သတ်မှတ်ထားတဲ့ customer တွေအတွက်သာ', coupon_for_all: 'ပစ္စည်းအားလုံးအတွက်',
    coupon_not_for_customer: 'ဒီ coupon က သတ်မှတ်ထားတဲ့ customer တွေအတွက်ပဲ သုံးလို့ရပါတယ်',
    coupon_no_eligible_items: 'ဒီ coupon က သတ်မှတ်ထားတဲ့ ပစ္စည်း / brand တွေအတွက်ပဲ သုံးလို့ရပါတယ် — cart ထဲမှာ အဲဒါတွေ မရှိသေးပါ',
    search_products_ph: 'ပစ္စည်း ရှာပါ…', no_products_found: 'ပစ္စည်း မတွေ့ပါ',
    shop_phone: 'ဖုန်း', shop_hours: 'ဖွင့်ချိန် — နေ့စဉ် မနက် ၉ နာရီ မှ ညနေ ၆ နာရီ',
    continue_shopping: 'ဆက်ပြီး ဈေးဝယ်မယ်', back_home: 'Home ပြန်မယ်',
    select_option: 'Option ရွေးပါ', search_products: 'ပစ္စည်း ရှာမယ်…',
    results: 'ခု တွေ့ပါတယ်', code: 'ကုဒ်',
  },
  en: {
    nav_home: 'Home', nav_shop: 'Shop', nav_orders: 'Orders', nav_manage: 'Manage',
    nav_cart: 'Cart', nav_wishlist: 'Wishlist',
    nav_checkout: 'Checkout',
    checkout_empty: 'Your cart is empty — please add products first',
    account_title: 'My Account', my_orders: 'My Orders',
    change_password: 'Change password', current_password: 'Current password',
    new_password: 'New password', confirm_password: 'Confirm new password',
    password_changed: 'Password changed', password_mismatch: 'New passwords do not match',
    wrong_password: 'Current password is incorrect',
    forgot_password: 'Forgot your password?',
    forgot_help: 'Contact the shop via Messenger or phone 09765117366 — staff will help you set a new password.',
    view_coupons: 'View coupons', coupons_title: 'Coupons',
    use_coupon: 'Use', no_coupons_active: 'No coupons available',
    percent_off: '% off', amount_off: 'Ks off',
    password_too_short: 'Password must be at least 4 characters',
    wishlist_title: 'My Wishlist', wishlist_empty: 'Your wishlist is empty',
    wish_add: 'Add to Wishlist', wish_remove: 'Remove from Wishlist',
    wish_added: 'Added to wishlist', wish_removed: 'Removed from wishlist',
    clear_filters: 'Clear',
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
    delivery_inner: 'Yangon', delivery_outer: 'Mandalay',
    delivery_outside: 'Outside Yangon & Mandalay', delivery_pickup: 'Store pickup',
    fee_inner: 'Delivery 4000 - 4500 Ks - Pay On Delivery',
    fee_outer: 'Delivery 4000 - 4500 Ks - Pay On Delivery',
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
    insufficient_stock: 'Not enough stock for one of the items. Please reduce the quantity and try again.',
    orders_title: 'My Orders', login_needed: 'Please log in to see your orders.',
    no_orders: 'No orders yet', order_detail: 'Order Details',
    register: 'Register', password: 'Password', auth_fail: 'Phone or password is incorrect',
    coming_soon: 'App coming soon',
    close: 'Close', remove: 'Remove', save: 'Save', add: 'Add', del: 'Delete',
    saved: 'Saved', deleted: 'Deleted', confirm_delete: 'Are you sure you want to delete this?',
    test: 'Test connection', preview: 'Preview', import: 'Import', confirm_import: 'Are you sure you want to run the import?',
    qty: 'Quantity', stock_qty: 'Stock qty', price: 'Price', sale_price: 'Sale price',
    is_new: 'New', sale_featured: 'Sale ★', best_seller: 'Best seller', brand: 'Brand',
    manage_no_access: 'Manage is only available to the manager account.',
    wc_warn: 'Never send your key in chat',
    wc_configured: 'WooCommerce connected', wc_not_configured: 'WooCommerce not connected yet',
    wc_test_ok: 'Connection successful', wc_test_fail: 'Connection failed',
    woo_preview_first: 'Run Preview first', woo_browser_blocked: 'Browser could not reach WooCommerce',
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
    status_pending: 'Pending', status_confirmed: 'Confirmed', status_delivering: 'Delivering', status_delivered: 'Delivered', status_cancelled: 'Cancelled',
    search_orders: 'Search order no. / name / phone…', search_users: 'Search name / phone…',
    all_statuses: 'All statuses', change_status: 'Change status', status_changed: 'Status updated',
    screenshot: 'Payment screenshot', no_screenshot: 'No screenshot',
    new_password: 'New password', set_password: 'Set password', password_changed: 'Password changed — tell the customer the new one',
    manager: 'Manager', owner: 'Owner', make_manager: 'Make manager', remove_manager: 'Remove manager',
    managers_title: 'Managers', add_manager_ph: 'Enter phone number (must be registered first)',
    user_not_found: 'No account with this phone — ask them to register first',
    owner_only: 'Only the owner (095117366) can do this', no_users: 'No users yet',
    pw_reset_hint: 'After changing, tell the customer the new password by Messenger / phone — they will sign in again with it',
    activity: 'Activity log', search_activity: 'Search (person / order / product)…', all_actions: 'All actions', no_activity: 'No activity yet',
    action_order_status: 'Changed order status', action_password_reset: 'Reset a password', action_manager_add: 'Added a manager', action_manager_remove: 'Removed a manager', action_product_update: 'Edited a product', action_product_photo_add: 'Added a product photo', action_product_photo_remove: 'Removed a product photo', action_coupon_create: 'Created a coupon', action_coupon_delete: 'Deleted a coupon', action_payments_update: 'Edited payment accounts', action_app_links_update: 'Edited app links', action_woocommerce_settings: 'Edited WooCommerce settings', action_woocommerce_import: 'Imported WooCommerce photos', action_order_edit: 'Edited order items',
    edit_items: 'Edit items', save_changes: 'Save changes', cancel: 'Cancel', no_items: 'No items yet', order_locked: 'A delivered or cancelled order cannot be edited', total_changed: 'Total changed', total_diff_hint: 'If the customer already transferred, tell them the difference by Messenger',
    coupon: 'Coupon', apply: 'Apply', remove_coupon: 'Remove coupon', coupon_invalid: 'Invalid coupon', action_order_coupon: 'Edited order coupon',
    manager_hint: 'Staff must register in the shop first (name + phone) — then type their phone here and tap Add',
    add_photo: 'Add photo', change_photo: 'Change photo', remove_photo: 'Remove photo',
    coupon_scope: 'What this coupon applies to (leave empty = all products)',
    scope_brands: 'Brands', scope_products: 'Products', scope_customers: 'Customers (phone)',
    scope_customers_hint: 'Type a phone number and tap Add — leave empty for all customers',
    coupon_for_brands: 'For these brands only', coupon_for_products: 'For these products only',
    coupon_for_customers: 'For selected customers only', coupon_for_all: 'For all products',
    coupon_not_for_customer: 'This coupon is only for selected customers',
    coupon_no_eligible_items: 'This coupon only applies to selected products / brands — none are in your cart yet',
    search_products_ph: 'Search products…', no_products_found: 'No products found',
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
  wishlist: JSON.parse(localStorage.getItem('bm_wishlist') || '[]'),
  sectionFilter: '',
  coupon: JSON.parse(localStorage.getItem('bm_coupon') || 'null'),
  brands: [],
  brandFilter: '',
  types: [],
  typeFilter: '',
  searchQuery: '',
  shopInfo: null,
  payments: null,
  homeOffset: 0,
  detail: null,          // current product in detail modal
  detailOption: null,    // selected option label
  detailQty: 1,
  cardOpt: {},           // card option pick: product id -> selected option label
  co: { delivery: 'yangon_inner', payment: 'cod', account: null, screenshot: null },
  coForm: { name: '', phone: '', address: '' },
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
function fmtDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('en-GB', { timeZone: 'Asia/Yangon', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  } catch (e) { return String(iso); }
}
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
// Same as api(), but retries a few times when the hosting proxy briefly
// answers with an HTML error page instead of JSON (free-tier wake-ups /
// restarts). A failed attempt is retried; a real JSON error is not.
async function apiRetry(path, opts, tries) {
  let lastErr = null;
  for (let attempt = 1; attempt <= (tries || 3); attempt++) {
    try {
      return await api(path, opts);
    } catch (e) {
      lastErr = e;
      const transient = !e.status || e.message.indexOf('Unexpected token') === 0 || e.message.indexOf('<!DOCTYPE') !== -1;
      if (!transient || attempt >= (tries || 3)) throw e;
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  throw lastErr;
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
  // A scoped coupon discounts only its matching items, never the whole cart.
  const c = state.coupon;
  const base = state.cart.reduce((a, i) => {
    const brandOk = !c.brands || !c.brands.length || c.brands.includes(i.brand);
    const prodOk = !c.products || !c.products.length || c.products.includes(i.product_id);
    return (brandOk && prodOk) ? a + i.price * i.qty : a;
  }, 0);
  if (base <= 0) return 0;
  if (c.type === 'percent') return Math.round(base * Number(c.value) / 100);
  return Math.min(Number(c.value) || 0, base);
}
function couponScopeText(c) {
  const parts = [];
  if (c.brands && c.brands.length) parts.push(t('coupon_for_brands') + ': ' + c.brands.join(', '));
  if (c.products && c.products.length) parts.push(t('coupon_for_products') + ': ' + ((c.product_names && c.product_names.length ? c.product_names : c.products).join(', ')));
  if ((c.customers && c.customers.length) || c.customers_only) parts.push(t('coupon_for_customers') + (c.customers && c.customers.length ? ' (' + c.customers.length + ')' : ''));
  return parts.length ? parts.join(' • ') : t('coupon_for_all');
}
function cartTotal() { return Math.max(0, cartSubtotal() - couponDiscount()); }
function updateCartBadge() {
  const n = cartCount();
  const badge = $('#navCartCount');
  if (!badge) return;
  badge.hidden = n === 0;
  badge.textContent = n;
}

/* ---------------- i18n apply ---------------- */
function applyI18n() {
  document.documentElement.lang = lang === 'my' ? 'my' : 'en';
  $$('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  $('#searchInput').placeholder = t('search_ph');
  $('#searchBtn').textContent = t('search_btn');
  $('#heroTagline').textContent = t('hero_tag');
  $('#bestTitle').textContent = t('best');
  $('#saleTitle').textContent = t('sale');
  $('#allTitle').textContent = t('all');
  $('#ordersTitle').textContent = t('orders_title');
  $('#accountTitle').textContent = t('account_title');
  $('#couponTitle').textContent = t('coupons_title');
  $('#wishlistTitle').textContent = t('wishlist_title');
  $('#checkoutTitle').textContent = t('checkout_title');
  $('#manageTitle').textContent = t('nav_manage');
  $('#cartTitle').textContent = t('cart');
  $('#lblSubtotal').textContent = t('subtotal');
  $('#lblDiscount').textContent = t('discount');
  $('#lblTotal').textContent = t('total');
  $('#checkoutBtn').textContent = t('checkout');
  $('#homeMoreBtn').textContent = t('more');
  $('#homeClearBtn').textContent = '✕ ' + t('clear_filters');
  $('#footerPhoneLabel').textContent = t('shop_phone');
  $('#footerHours').textContent = t('shop_hours');
  $('#langToggle').textContent = lang === 'my' ? 'EN' : 'မြန်မာ';
  $$('[data-viewall]').forEach((b) => { b.textContent = t('view_all'); });
  refreshAuthUI();
  renderCart();
}

/* ---------------- views / nav ---------------- */
function showView(name) {
  ['home', 'orders', 'checkout', 'manage', 'wishlist', 'account'].forEach((v) => {
    const el = $('#view-' + v);
    if (el) el.hidden = v !== name;
  });
  $$('.nav-item').forEach((b) => b.classList.toggle('active', b.dataset.view === name));
  if (name === 'orders') loadOrders();
  if (name === 'manage') loadManage(state.manageTab);
  if (name === 'wishlist') loadWishlist();
  if (name === 'account') renderAccount();
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

/* ---------------- product types ---------------- */
async function loadTypes() {
  try {
    state.types = await api('/types');
  } catch (e) { state.types = []; }
  renderTypeChips($('#typeChips'));
}
function typeLabel(t) {
  const e = (state.types || []).find((x) => x.type === t);
  return e ? e.label : t;
}
function renderTypeChips(container) {
  if (!container) return;
  const all = [{ type: '', label: t('all'), count: null }];
  const list = all.concat(state.types || []);
  container.innerHTML = list.map((x) => {
    const active = state.typeFilter === x.type;
    return '<button type="button" class="chip' + (active ? ' active' : '') + '" data-type="' + esc(x.type) + '">' +
      esc(x.label) + (x.count != null ? ' (' + x.count + ')' : '') + '</button>';
  }).join('');
  $$('.chip', container).forEach((btn) => {
    btn.addEventListener('click', () => {
      state.typeFilter = btn.dataset.type;
      state.homeOffset = 0;
      renderTypeChips($('#typeChips'));
      loadHomeGrid(true);
    });
  });
}

/* ---------------- brands ---------------- */
async function loadBrands() {
  try {
    state.brands = await api('/brands');
  } catch (e) { state.brands = []; }
  renderChips($('#brandChips'));
}
function renderChips(container) {
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
      state.homeOffset = 0;
      renderChips($('#brandChips'));
      loadHomeGrid(true);
    });
  });
}

/* ---------------- product cards ---------------- */
function cardHTML(p) {
  // Variation products: show every size/shade as a tappable chip on the card
  // so customers see the other options (and their prices) without opening the
  // detail page. The first option is selected by default (highlighted).
  const hasOpts = Array.isArray(p.options) && p.options.length > 0;
  // Default to the first option that is actually in stock (a sold-out first
  // option must not be the pre-selected one).
  const selOpt = hasOpts ? (p.options.find((o) => o.label === state.cardOpt[p.id] && o.in_stock) || p.options.find((o) => o.in_stock) || p.options[0]) : null;
  const price = displayPrice(p);
  // Sale prices do not apply to option lines at checkout (options always pay
  // their option price), so option products never show a sale badge/strike.
  const hasSale = !hasOpts && p.sale_price != null && p.sale_price !== '' && Number(p.sale_price) < Number(p.price);
  const salePct = hasSale ? Math.round((1 - Number(p.sale_price) / Number(p.price)) * 100) : 0;
  const img = p.image_url
    ? '<img src="' + esc(p.image_url) + '" alt="' + esc(p.name) + '" loading="lazy">'
    : '<span class="img-placeholder">' + esc(t('no_image')) + '</span>';
  const priceHTML = hasOpts
    ? fmt(optionPrice(selOpt))
    : (hasSale
      ? '<span class="was">' + fmt(p.price) + '</span>' + fmt(p.sale_price)
      : fmt(price));
  const wished = isWished(p.id);
  return '<article class="card' + (p.in_stock ? '' : ' soldout') + '">' +
    '<div class="card-img-wrap"><button type="button" class="card-img" data-open="' + esc(String(p.id)) + '" aria-label="' + esc(p.name) + '">' + img + '</button>' +
    (hasSale ? '<span class="sale-badge">−' + salePct + '%</span>' : '') +
    '<button type="button" class="wish-btn' + (wished ? ' active' : '') + '" data-wish="' + esc(String(p.id)) + '" aria-label="' + esc(t(wished ? 'wish_remove' : 'wish_add')) + '">' + (wished ? '♥' : '♡') + '</button></div>' +
    '<div class="card-body">' +
    '<span class="card-brand">' + esc(p.brand || '') + '</span>' +
    '<button type="button" class="card-name" data-open="' + esc(String(p.id)) + '" style="background:none;border:none;padding:0;text-align:left;font:inherit;color:inherit">' + esc(p.name) + '</button>' +
    '<span class="card-price" data-cardprice="' + esc(String(p.id)) + '">' + priceHTML + '</span>' +
    (hasOpts ? '<div class="card-opts">' + p.options.map((o) => '<button type="button" class="chip' + (o.label === selOpt.label ? ' active' : '') + '" data-opt="' + esc(String(p.id)) + '" data-label="' + esc(o.label) + '" data-price="' + o.price + '"' + (o.in_stock ? '' : ' disabled') + '>' + esc(o.label) + '</button>').join('') + '</div>' : '') +
    '<span class="badge ' + (p.in_stock ? 'in' : 'out') + '">' + esc(p.in_stock ? t('in_stock') : t('out_stock')) + '</span>' +
    '<button type="button" class="btn btn-primary card-add" data-add="' + esc(String(p.id)) + '"' + (p.in_stock ? '' : ' disabled') + '>' + esc(t('add_cart')) + '</button>' +
    '</div></article>';
}
// Card option pick: remember the choice, show its price on the card, and
// highlight the tapped chip — without re-rendering the grid (keeps scroll).
function applyCardOption(card, pid, label, price) {
  state.cardOpt[pid] = label;
  if (card) {
    const pe = card.querySelector('[data-cardprice]');
    if (pe) pe.textContent = fmt(price);
    $$('.chip', card).forEach((c) => c.classList.toggle('active', c.dataset.label === label));
  }
}
function bindCards(container) {
  $$('[data-open]', container).forEach((b) => b.addEventListener('click', () => openProduct(b.dataset.open)));
  $$('[data-add]', container).forEach((b) => b.addEventListener('click', () => quickAdd(b.dataset.add, state.cardOpt[b.dataset.add])));
  $$('[data-opt]', container).forEach((b) => b.addEventListener('click', (ev) => {
    ev.stopPropagation();
    applyCardOption(b.closest('.card'), b.dataset.opt, b.dataset.label, Number(b.dataset.price));
  }));
  $$('[data-wish]', container).forEach((b) => b.addEventListener('click', (ev) => {
    ev.stopPropagation();
    toggleWishlist(b.dataset.wish, b);
  }));
}
/* ---------------- wishlist (saved on this device, like the cart) ---------------- */
function isWished(id) { return (state.wishlist || []).some((w) => String(w.id) === String(id)); }
function saveWishlist() { localStorage.setItem('bm_wishlist', JSON.stringify(state.wishlist || [])); }
function updateWishlistBadge() {
  const n = (state.wishlist || []).length;
  const badge = $('#navWishCount');
  if (!badge) return;
  badge.hidden = n === 0;
  badge.textContent = n;
}
async function toggleWishlist(id, btn) {
  const idx = (state.wishlist || []).findIndex((w) => String(w.id) === String(id));
  if (idx >= 0) {
    state.wishlist.splice(idx, 1);
    saveWishlist(); updateWishlistBadge();
    if (btn) { btn.classList.remove('active'); btn.textContent = '♡'; btn.setAttribute('aria-label', t('wish_add')); }
    toast(t('wish_removed'));
  } else {
    try {
      const p = await api('/products/' + encodeURIComponent(id));
      state.wishlist.push({ id: p.id, name: p.name, brand: p.brand, price: unitPrice(p), image_url: p.image_url || null, in_stock: p.in_stock });
      saveWishlist(); updateWishlistBadge();
      if (btn) { btn.classList.add('active'); btn.textContent = '♥'; btn.setAttribute('aria-label', t('wish_remove')); }
      toast(t('wish_added'));
    } catch (e) { toast(t('error_load')); }
  }
  if (!$('#view-wishlist').hidden) loadWishlist();
  if (state.detail && String(state.detail.id) === String(id)) renderDetailWish();
}
async function loadWishlist() {
  const grid = $('#gridWish');
  if (!grid) return;
  const items = state.wishlist || [];
  updateWishlistBadge();
  if (!items.length) {
    grid.innerHTML = '<div class="empty">' + esc(t('wishlist_empty')) + '</div>';
    return;
  }
  grid.innerHTML = '<div class="loading">' + esc(t('loading')) + '</div>';
  const fresh = [];
  for (const w of items) {
    try {
      const p = await api('/products/' + encodeURIComponent(w.id));
      fresh.push(p);
    } catch (e) { /* product gone — drop it */ }
  }
  state.wishlist = fresh.map((p) => ({ id: p.id, name: p.name, brand: p.brand, price: unitPrice(p), image_url: p.image_url || null, in_stock: p.in_stock }));
  saveWishlist(); updateWishlistBadge();
  if (!fresh.length) { grid.innerHTML = '<div class="empty">' + esc(t('wishlist_empty')) + '</div>'; return; }
  grid.innerHTML = fresh.map(cardHTML).join('');
  bindCards(grid);
}
async function quickAdd(id, optLabel) {
  try {
    const p = await api('/products/' + encodeURIComponent(id));
    if (p.options && p.options.length) {
      if (optLabel) {
        const opt = p.options.find((o) => o.label === optLabel);
        // A sold-out pick (stale card state) falls through to the detail page.
        if (opt && opt.in_stock) { addToCart(p, optLabel, 1); return; }
      }
      openProduct(id); return;
    }
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
  if (state.typeFilter) params.set('type', state.typeFilter);
  if (state.sectionFilter) params.set('section', state.sectionFilter);
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
    updateHomeMeta(data.total != null ? data.total : items.length);
  } catch (e) {
    if (reset) grid.innerHTML = '<div class="error-box">' + esc(t('error_load')) + '</div>';
  }
}
function homeFiltered() {
  return Boolean(state.brandFilter || state.typeFilter || state.sectionFilter || state.searchQuery);
}
function updateHomeMeta(total) {
  // When any filter is active, hide the curated section rows so the grid
  // is the only list; show a meta line with a clear button instead.
  const filtered = homeFiltered();
  const secs = $('#homeSections');
  if (secs) secs.hidden = filtered;
  const meta = $('#homeMeta');
  const clearBtn = $('#homeClearBtn');
  if (!meta) return;
  if (!filtered) { meta.textContent = ''; if (clearBtn) clearBtn.hidden = true; return; }
  const parts = [total + ' ' + t('results')];
  if (state.brandFilter) parts.push(state.brandFilter);
  if (state.typeFilter) parts.push(typeLabel(state.typeFilter));
  if (state.sectionFilter) parts.push(t(state.sectionFilter === 'best' ? 'best' : 'sale'));
  if (state.searchQuery) parts.push('“' + state.searchQuery + '”');
  meta.textContent = parts.join(' — ');
  if (clearBtn) clearBtn.hidden = false;
}
function clearHomeFilters() {
  state.brandFilter = ''; state.typeFilter = ''; state.sectionFilter = ''; state.searchQuery = '';
  $('#searchInput').value = '';
  renderChips($('#brandChips'));
  renderTypeChips($('#typeChips'));
  loadHomeGrid(true);
}
async function loadHome() {
  loadSection('best', '#rowBest', null);
  loadSection('sale', '#rowSale', '#saleSectionHead');
  loadHomeGrid(true);
}

/* ---------------- product detail ---------------- */
let layerZ = 100;
const openLayers = []; // [{ov, modal}] — topmost layer is last
function openOverlay(ov, modal) {
  if (ov === '#cartOverlay') {
    // Cart drawer stays BELOW the bottom nav (z 40) so the nav stays
    // visible and tappable while the cart is open.
    $(ov).style.zIndex = 35;
    $(modal).style.zIndex = 36;
  } else {
    layerZ += 2;
    $(ov).style.zIndex = layerZ;
    $(modal).style.zIndex = layerZ + 1;
  }
  $(ov).hidden = false; $(modal).hidden = false;
  openLayers.push({ ov, modal });
}
function closeOverlay(ov, modal) {
  $(ov).hidden = true; $(modal).hidden = true;
  $(ov).style.zIndex = ''; $(modal).style.zIndex = '';
  const i = openLayers.findIndex((l) => l.ov === ov);
  if (i >= 0) openLayers.splice(i, 1);
}
function closeTopLayer() {
  const top = openLayers[openLayers.length - 1];
  if (top) closeOverlay(top.ov, top.modal);
}

async function openProduct(id) {
  openOverlay('#detailOverlay', '#detailModal');
  $('#detailBody').innerHTML = '<div class="loading">' + esc(t('loading')) + '</div>';
  $('#detailStickyBar').innerHTML = '';
  try {
    const p = await api('/products/' + encodeURIComponent(id));
    state.detail = p;
    state.detailQty = 1;
    state.detailOption = (p.options && p.options.length) ? (p.options.find((o) => o.in_stock) || p.options[0]).label : null;
    renderDetail();
  } catch (e) {
    $('#detailBody').innerHTML = '<div class="error-box">' + esc(t('error_load')) + '</div>';
  }
}
function selectedOptionObj() {
  const p = state.detail;
  if (!p || !p.options || !p.options.length) return null;
  return p.options.find((o) => o.label === state.detailOption && o.in_stock) || p.options.find((o) => o.in_stock) || p.options[0];
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
        '<button type="button" class="opt-btn' + (state.detailOption === o.label ? ' active' : '') + '" data-opt="' + esc(o.label) + '"' + (o.in_stock ? '' : ' disabled') + '>' +
        esc(o.label) + ' — ' + fmt(o.price) + '</button>').join('') +
      '</div></div>';
  }
  $('#detailBody').innerHTML =
    '<div class="card-img">' + img + '</div>' +
    '<div class="detail-brand">' + esc(p.brand || '') + '</div>' +
    '<h2>' + esc(p.name) + '</h2>' +
    '<div style="margin:8px 0;display:flex;gap:8px;flex-wrap:wrap;align-items:center"><span class="badge ' + (p.in_stock ? 'in' : 'out') + '">' + esc(p.in_stock ? t('in_stock') : t('out_stock')) + '</span>' +
    (p.sale_price != null && p.sale_price !== '' && Number(p.sale_price) < Number(p.price) ? '<span class="badge" style="background:#FDE7F0;color:var(--pink)">−' + Math.round((1 - Number(p.sale_price) / Number(p.price)) * 100) + '% ' + esc(t('sale')) + '</span>' : '') + '</div>' +
    '<div style="margin:4px 0 10px"><button type="button" class="btn btn-outline" id="detailWishBtn"></button></div>' +
    (p.note ? '<div class="detail-note">' + esc(p.note) + '</div>' : '') +
    optsHTML;
  renderDetailWish();
  $('#detailWishBtn').addEventListener('click', () => toggleWishlist(p.id, null));
  $$('[data-opt]', $('#detailBody')).forEach((b) => {
    b.addEventListener('click', () => { state.detailOption = b.dataset.opt; renderDetail(); });
  });
  renderStickyBar();
}
function renderDetailWish() {
  const btn = $('#detailWishBtn');
  const p = state.detail;
  if (!btn || !p) return;
  const wished = isWished(p.id);
  btn.textContent = (wished ? '♥ ' : '♡ ') + t(wished ? 'wish_remove' : 'wish_add');
}
function renderStickyBar() {
  const p = state.detail;
  const bar = $('#detailStickyBar');
  if (!p) { bar.innerHTML = ''; return; }
  const opt = selectedOptionObj();
  const price = opt ? optionPrice(opt) : unitPrice(p);
  const available = opt ? opt.in_stock : p.in_stock;
  // No options + a sale price: show the original price struck through.
  const origPrice = (!p.options || !p.options.length) && p.sale_price != null && p.sale_price !== '' && Number(p.sale_price) < Number(p.price)
    ? Number(p.price) : null;
  bar.innerHTML =
    '<div class="sb-price"><div class="amt">' + (origPrice ? '<span class="was">' + fmt(origPrice) + '</span>' : '') + fmt(price) + '</div>' +
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
  const fail = (key) => {
    state.coupon = null; saveCoupon(); renderCart();
    msg.textContent = t(key || 'coupon_invalid');
    msg.style.color = '#B3261E';
  };
  try {
    const phone = (state.user && state.user.phone) || (state.coForm && state.coForm.phone) || '';
    const res = await api('/coupons/validate', { method: 'POST', body: JSON.stringify({ code: code, items: state.cart.map((i) => ({ product_id: i.product_id, qty: i.qty })), phone: phone }) });
    if (res.valid) {
      state.coupon = { code: res.code || code, type: res.type, value: res.value, brands: res.brands || [], products: res.products || [] };
      saveCoupon();
      renderCart();
    } else if (res.reason === 'not_for_customer') fail('coupon_not_for_customer');
    else if (res.reason === 'no_eligible_items') fail('coupon_no_eligible_items');
    else fail('coupon_invalid');
  } catch (e) {
    fail('coupon_invalid');
  }
}

/* ---------------- coupons (customer picker) ---------------- */
async function openCouponList() {
  openOverlay('#couponOverlay', '#couponModal');
  const body = $('#couponBody');
  body.innerHTML = '<div class="loading">' + esc(t('loading')) + '</div>';
  try {
    const list = await api('/coupons');
    if (!list.length) { body.innerHTML = '<div class="empty">' + esc(t('no_coupons_active')) + '</div>'; return; }
    body.innerHTML = list.map((c) => {
      const val = c.type === 'fixed'
        ? fmt(c.value).replace(' Ks', '') + ' ' + t('amount_off')
        : c.value + t('percent_off');
      const scope = couponScopeText(c);
      return '<div class="pay-account"><div class="pa-info"><div class="pa-method">' + esc(c.code) + '</div>' +
        '<div class="pa-name">' + esc(val) + '</div><div class="pa-name" style="font-size:12px;color:var(--muted)">' + esc(scope) + '</div></div>' +
        '<button type="button" class="copy-btn" data-use="' + esc(c.code) + '">' + esc(t('use_coupon')) + '</button></div>';
    }).join('');
    $$('[data-use]', body).forEach((b) => b.addEventListener('click', () => {
      $('#couponInput').value = b.dataset.use;
      closeOverlay('#couponOverlay', '#couponModal');
      applyCoupon();
    }));
  } catch (e) {
    body.innerHTML = '<div class="error-box">' + esc(t('error_load')) + '</div>';
  }
}

/* ---------------- checkout ---------------- */
const DELIVERY = {
  yangon_inner: { fee: 4000, noteKey: 'fee_inner' },
  yangon_outer: { fee: 4500, noteKey: 'fee_outer' },
  outside_yangon: { fee: null, noteKey: 'fee_outside' },
  pickup: { fee: 0, noteKey: 'fee_pickup' },
};
function deliveryLabel(method) {
  // Stored orders use 'outside' (server normalises 'outside_yangon');
  // the checkout form uses 'outside_yangon' — accept both.
  if (method === 'yangon_inner') return t('delivery_inner');
  if (method === 'yangon_outer') return t('delivery_outer');
  if (method === 'outside_yangon' || method === 'outside') return t('delivery_outside');
  return t('delivery_pickup');
}
function lastCustomer() {
  try { return JSON.parse(localStorage.getItem('bm_last_order') || 'null'); } catch (e) { return null; }
}
async function openCheckout() {
  closeCart();
  showView('checkout');
  const body = $('#checkoutBody');
  // Empty cart: nothing to check out — show a hint instead of the form.
  if (!state.cart.length) {
    body.innerHTML = '<div class="checkout-card"><div class="empty">' + esc(t('checkout_empty')) + '</div>' +
      '<div class="center"><button class="btn btn-primary" type="button" id="coEmptyShopBtn">' + esc(t('continue_shopping')) + '</button></div></div>';
    $('#coEmptyShopBtn').addEventListener('click', () => showView('home'));
    return;
  }
  body.innerHTML = '<div class="loading">' + esc(t('loading')) + '</div>';
  if (!state.payments) {
    try { state.payments = await api('/payments'); } catch (e) { state.payments = []; }
  }
  // Restore what the customer already filled — the form survives leaving
  // the checkout page and coming back (Home, Cart, anywhere).
  const last = lastCustomer();
  const name = state.coForm.name || (state.user && state.user.name) || (last && last.name) || '';
  const phone = state.coForm.phone || (state.user && state.user.phone) || (last && last.phone) || '';
  const address = state.coForm.address || (last && last.address) || '';
  body.innerHTML =
    '<div class="checkout-card"><h3>' + esc(t('customer_info')) + '</h3>' +
    '<div class="field"><label>' + esc(t('name')) + '</label><input id="coName" type="text" value="' + esc(name) + '"></div>' +
    '<div class="field"><label>' + esc(t('phone')) + '</label><input id="coPhone" type="tel" value="' + esc(phone) + '" placeholder="09xxxxxxxxx"></div>' +
    '<div class="field"><label>' + esc(t('address')) + '</label><textarea id="coAddress" rows="2">' + esc(address) + '</textarea></div>' +
    '</div>' +

    '<div class="checkout-card"><h3>' + esc(t('delivery')) + '</h3>' +
    Object.keys(DELIVERY).map((k) =>
      '<label class="radio-line"><input type="radio" name="delivery" value="' + k + '"' + (k === state.co.delivery ? ' checked' : '') + '>' +
      '<span><span class="rl-title">' + esc(t('delivery_' + (k === 'yangon_inner' ? 'inner' : k === 'yangon_outer' ? 'outer' : k === 'outside_yangon' ? 'outside' : 'pickup'))) + '</span><br>' +
      '<span class="rl-note">' + esc(t(DELIVERY[k].noteKey)) + '</span></span></label>').join('') +
    '</div>' +

    '<div class="checkout-card"><h3>' + esc(t('payment')) + '</h3>' +
    '<label class="radio-line"><input type="radio" name="payment" value="cod"' + (state.co.payment === 'cod' ? ' checked' : '') + '><span><span class="rl-title">' + esc(t('cod')) + '</span></span></label>' +
    '<label class="radio-line"><input type="radio" name="payment" value="transfer"' + (state.co.payment === 'transfer' ? ' checked' : '') + '><span><span class="rl-title">' + esc(t('transfer')) + '</span></span></label>' +
    '<div id="transferBox"' + (state.co.payment === 'transfer' ? '' : ' hidden') + '>' +
    '<div class="field" style="margin-top:12px"><label>' + esc(t('choose_account')) + '</label><div id="payAccounts"></div></div>' +
    '<div id="shotBox"' + (state.co.account || state.co.screenshot ? '' : ' hidden') + '>' +
    '<div class="field"><label>' + esc(t('screenshot')) + '</label><input id="shotInput" type="file" accept="image/*"></div>' +
    '<div id="shotPreview" class="shot-preview"></div>' +
    '</div></div></div>' +

    '<div class="checkout-card"><h3>' + esc(t('total')) + '</h3>' +
    '<div class="order-summary-line"><span>' + esc(t('subtotal')) + '</span><span>' + fmt(cartSubtotal()) + '</span></div>' +
    (couponDiscount() > 0 ? '<div class="order-summary-line"><span>' + esc(t('discount')) + ' (' + esc(state.coupon.code) + ')</span><span>−' + fmt(couponDiscount()) + '</span></div>' : '') +
    '<div class="order-summary-line grand"><span>' + esc(t('total')) + '</span><span>' + fmt(cartTotal()) + '</span></div>' +
    '<div class="delivery-line" id="coDeliveryLine">' + esc(t(DELIVERY[state.co.delivery].noteKey)) + '</div>' +
    '</div>' +

    '<div id="coError" class="error-text" hidden></div>' +
    '<div id="coHint" class="hint" hidden></div>' +
    '<button id="placeOrderBtn" class="btn btn-primary btn-block" type="button">' + esc(t('place_order')) + '</button>';
  renderPayAccounts();
  if (state.co.screenshot) $('#shotPreview').innerHTML = '<img src="' + esc(state.co.screenshot) + '" alt="screenshot">';
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
  // Restore the previously chosen account (survives leaving checkout).
  if (state.co && state.co.account) {
    const idx = list.findIndex((a) => a.method === state.co.account.method && String(a.account_number) === String(state.co.account.account_number));
    if (idx >= 0) $$('.pay-account', box)[idx].classList.add('sel');
  }
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
  // Keep what the customer types — the form is rebuilt from state.coForm
  // whenever they return to checkout, so nothing they typed is lost.
  const saveForm = () => {
    state.coForm = {
      name: ($('#coName') ? $('#coName').value : '') || '',
      phone: ($('#coPhone') ? $('#coPhone').value : '') || '',
      address: ($('#coAddress') ? $('#coAddress').value : '') || '',
    };
  };
  ['coName', 'coPhone', 'coAddress'].forEach((id) => {
    const el = $('#' + id);
    if (el) el.addEventListener('input', saveForm);
  });
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
    const payMethod = state.co.payment;
    const delMethod = state.co.delivery;
    state.cart = []; state.coupon = null;
    // Fresh checkout next time — the saved form is cleared only after a
    // successful order, never when the customer just navigates away.
    state.co = { delivery: 'yangon_inner', payment: 'cod', account: null, screenshot: null };
    state.coForm = { name: '', phone: '', address: '' };
    saveCart(); saveCoupon(); updateCartBadge(); renderCart();
    const feeLine = order.delivery_note
      ? order.delivery_note
      : (order.delivery_fee != null && order.delivery_fee > 0
        ? t('delivery_fee') + ' ' + fmt(order.delivery_fee) + ' — ' + t('pay_on_delivery')
        : t(DELIVERY[delMethod].noteKey));
    $('#checkoutBody').innerHTML =
      '<div class="checkout-card success-box">' +
      '<div class="big">✓</div>' +
      '<h3>' + esc(t('order_success')) + '</h3>' +
      '<p>' + esc(t('order_id')) + ': <strong>' + esc(order.id) + '</strong></p>' +
      '<p>' + esc(t('total')) + ': <strong>' + fmt(order.total != null ? order.total : cartTotal()) + '</strong></p>' +
      '<p class="delivery-line">' + esc(feeLine) + '</p>' +
      (payMethod === 'transfer' ? '<p>' + esc(t('transfer_note')) + '</p>' : '') +
      '<div style="margin-top:16px"><button class="btn btn-primary btn-block" type="button" id="backHomeBtn">' + esc(t('continue_shopping')) + '</button></div>' +
      '</div>';
    $('#backHomeBtn').addEventListener('click', () => { showView('home'); loadHomeGrid(true); });
  } catch (e) {
    btn.disabled = false;
    if (e.status === 400 && e.data && e.data.error === 'screenshot_required') {
      err.textContent = t('screenshot_required_err');
    } else if (e.data && (e.data.error === 'insufficient_stock' || e.data.error === 'out_of_stock')) {
      err.textContent = t('insufficient_stock');
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
    btn.textContent = state.user.name;
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

/* ---------------- account ---------------- */
function renderAccount() {
  const body = $('#accountBody');
  if (!state.user) {
    body.innerHTML = '<div class="empty">' + esc(t('login_needed')) + '</div>' +
      '<div class="center"><button class="btn btn-primary" type="button" id="accountLoginBtn">' + esc(t('login')) + '</button></div>';
    $('#accountLoginBtn').addEventListener('click', openAuth);
    return;
  }
  const u = state.user;
  body.innerHTML =
    '<div class="checkout-card">' +
    '<div class="kv-row"><span>' + esc(t('name')) + '</span><strong>' + esc(u.name || '') + '</strong></div>' +
    '<div class="kv-row"><span>' + esc(t('phone')) + '</span><strong>' + esc(u.phone || '') + '</strong></div>' +
    '<div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap">' +
    '<button class="btn btn-outline" type="button" id="accountOrdersBtn">' + esc(t('my_orders')) + '</button>' +
    '<button class="btn btn-outline" type="button" id="accountLogoutBtn">' + esc(t('logout')) + '</button>' +
    '</div></div>' +
    '<div class="checkout-card"><h3>' + esc(t('change_password')) + '</h3>' +
    '<div class="field"><label>' + esc(t('current_password')) + '</label><input id="pwCurrent" type="password"></div>' +
    '<div class="field"><label>' + esc(t('new_password')) + '</label><input id="pwNew" type="password"></div>' +
    '<div class="field"><label>' + esc(t('confirm_password')) + '</label><input id="pwConfirm" type="password"></div>' +
    '<div id="pwMsg" class="error-text" hidden></div>' +
    '<button class="btn btn-primary" type="button" id="pwChangeBtn">' + esc(t('change_password')) + '</button>' +
    '</div>' +
    '<div class="checkout-card"><h3>' + esc(t('forgot_password')) + '</h3>' +
    '<p class="hint">' + esc(t('forgot_help')) + '</p>' +
    '<div style="margin-top:10px"><a class="btn btn-outline" href="https://m.me/beautyandme117" target="_blank" rel="noopener">Messenger</a></div>' +
    '</div>';
  $('#accountOrdersBtn').addEventListener('click', () => showView('orders'));
  $('#accountLogoutBtn').addEventListener('click', () => { if (window.confirm(t('logout') + '?')) logout(); });
  $('#pwChangeBtn').addEventListener('click', changePassword);
}
async function changePassword() {
  const msg = $('#pwMsg');
  msg.hidden = true;
  const cur = $('#pwCurrent').value;
  const nw = $('#pwNew').value;
  const cf = $('#pwConfirm').value;
  if (!cur || !nw || !cf) { msg.textContent = t('fill_all'); msg.hidden = false; return; }
  if (nw !== cf) { msg.textContent = t('password_mismatch'); msg.hidden = false; return; }
  if (nw.length < 4) { msg.textContent = t('password_too_short'); msg.hidden = false; return; }
  const btn = $('#pwChangeBtn');
  btn.disabled = true;
  try {
    await api('/auth/change-password', { method: 'POST', body: JSON.stringify({ current_password: cur, new_password: nw }) });
    $('#pwCurrent').value = ''; $('#pwNew').value = ''; $('#pwConfirm').value = '';
    msg.hidden = false; msg.style.color = 'var(--green)'; msg.textContent = t('password_changed');
    toast(t('password_changed'));
  } catch (e) {
    msg.style.color = '';
    msg.textContent = (e.status === 401) ? t('wrong_password') : t('error_load');
    msg.hidden = false;
  } finally { btn.disabled = false; }
}

/* ---------------- orders ---------------- */
const ORDER_STATUSES = ['pending', 'confirmed', 'delivering', 'delivered', 'cancelled'];
function statusLabel(status) {
  return t('status_' + (ORDER_STATUSES.includes(status) ? status : 'pending'));
}
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
      '<span class="oc-top"><span>' + esc(o.id) + '</span><span class="status-pill">' + esc(statusLabel(o.status)) + '</span></span>' +
      '<div class="oc-meta">' + esc(fmtDate(o.created_at)) + ' • ' + esc(t('total')) + ': ' + fmt(o.total) + '</div>' +
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
    const c = o.customer || {};
    $('#orderBody').innerHTML =
      '<div class="line"><span>' + esc(t('order_id')) + '</span><strong>' + esc(o.id) + '</strong></div>' +
      '<div class="line"><span>' + esc(t('status')) + '</span><span class="status-pill">' + esc(statusLabel(o.status)) + '</span></div>' +
      '<div class="line"><span>' + esc(t('date')) + '</span><span>' + esc(fmtDate(o.created_at)) + '</span></div>' +
      ((c.name || c.phone || c.address) ?
        '<hr>' +
        (c.name ? '<div class="line"><span>' + esc(t('name')) + '</span><strong>' + esc(c.name) + '</strong></div>' : '') +
        (c.phone ? '<div class="line"><span>' + esc(t('phone')) + '</span><span>' + esc(c.phone) + '</span></div>' : '') +
        (c.address ? '<div class="line"><span>' + esc(t('address')) + '</span><span>' + esc(c.address) + '</span></div>' : '') : '') +
      (o.delivery && o.delivery.method ? '<div class="line"><span>' + esc(t('delivery')) + '</span><strong>' + esc(deliveryLabel(o.delivery.method)) + '</strong></div>' : '') +
      '<hr>' +
      items.map((it) => {
        const lineTotal = it.line_total != null ? it.line_total : (it.unit_price != null ? it.unit_price : (it.price || 0)) * (it.qty || 1);
        return '<div class="line"><span>' + esc(it.product_name || it.name || it.product_id) + (it.option_label ? ' (' + esc(it.option_label) + ')' : '') + ' × ' + (it.qty || 1) + '</span><span>' + fmt(lineTotal) + '</span></div>';
      }).join('') +
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
// Payments, App link and WooCommerce are OWNER-ONLY — managers must not
// see them (a wrong payment account or API key there breaks the whole shop).
const OWNER_TABS = ['payments', 'applink', 'woocommerce', 'activity'];
function loadManage(tab) {
  const isOwner = state.user && (state.user.is_owner || state.user.phone === '095117366');
  $$('#manageTabs .tab').forEach((b) => {
    b.style.display = (!isOwner && OWNER_TABS.indexOf(b.dataset.mtab) !== -1) ? 'none' : '';
  });
  if (!isOwner && OWNER_TABS.indexOf(tab) !== -1) tab = 'dashboard';
  state.manageTab = tab;
  $$('#manageTabs .tab').forEach((b) => b.classList.toggle('active', b.dataset.mtab === tab));
  const body = $('#manageBody');
  if (!state.user || !state.user.is_manager) {
    body.innerHTML = '<div class="error-box">' + esc(t('manage_no_access')) + '</div>';
    return;
  }
  if (tab === 'dashboard') renderManageDashboard(body);
  else if (tab === 'orders') renderManageOrders(body);
  else if (tab === 'users') renderManageUsers(body);
  else if (tab === 'catalog') renderManageCatalog(body);
  else if (tab === 'coupons') renderManageCoupons(body);
  else if (tab === 'payments') renderManagePayments(body);
  else if (tab === 'applink') renderManageAppLinks(body);
  else if (tab === 'woocommerce') renderManageWoo(body);
  else if (tab === 'activity') renderManageActivity(body);
}
/* ---------------- manage: orders ---------------- */
let mgOrders = { q: '', status: '', offset: 0, items: [] };
async function renderManageOrders(body) {
  body.innerHTML =
    '<div class="mg-card"><div class="row-flex">' +
    '<input id="mgOrderSearch" type="search" placeholder="' + esc(t('search_orders')) + '" style="flex:1;padding:10px 12px;border:1.5px solid var(--line);border-radius:10px;min-width:160px">' +
    '<select id="mgOrderStatus" style="padding:10px 12px;border:1.5px solid var(--line);border-radius:10px">' +
    '<option value="">' + esc(t('all_statuses')) + '</option>' +
    ORDER_STATUSES.map((s) => '<option value="' + s + '">' + esc(statusLabel(s)) + '</option>').join('') +
    '</select>' +
    '<button class="btn btn-primary" type="button" id="mgOrderSearchBtn">' + esc(t('search_btn')) + '</button>' +
    '</div><div id="mgOrderWrap" style="margin-top:12px"></div>' +
    '<div class="center" style="margin-top:12px"><button class="btn btn-outline" type="button" id="mgOrderMoreBtn">' + esc(t('more')) + '</button></div></div>';
  mgOrders = { q: '', status: '', offset: 0, items: [] };
  const doSearch = () => {
    mgOrders.q = $('#mgOrderSearch').value.trim();
    mgOrders.status = $('#mgOrderStatus').value;
    mgOrders.offset = 0; mgOrders.items = [];
    loadMgOrders(true);
  };
  $('#mgOrderSearchBtn').addEventListener('click', doSearch);
  $('#mgOrderSearch').addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(); });
  $('#mgOrderStatus').addEventListener('change', doSearch);
  $('#mgOrderMoreBtn').addEventListener('click', () => loadMgOrders(false));
  loadMgOrders(true);
}
async function loadMgOrders(reset) {
  const wrap = $('#mgOrderWrap');
  if (!wrap) return;
  if (reset) { mgOrders.offset = 0; mgOrders.items = []; wrap.innerHTML = '<div class="loading">' + esc(t('loading')) + '</div>'; }
  const params = new URLSearchParams({ limit: String(PAGE), offset: String(mgOrders.offset) });
  if (mgOrders.q) params.set('q', mgOrders.q);
  if (mgOrders.status) params.set('status', mgOrders.status);
  try {
    const data = await api('/manage/orders?' + params.toString());
    const items = data.orders || [];
    if (reset) mgOrders.items = items; else mgOrders.items = mgOrders.items.concat(items);
    mgOrders.offset += items.length;
    const moreBtn = $('#mgOrderMoreBtn');
    if (moreBtn) moreBtn.style.display = (data.total != null && mgOrders.offset < data.total) ? '' : 'none';
    if (!mgOrders.items.length) { wrap.innerHTML = '<div class="empty">' + esc(t('no_orders')) + '</div>'; return; }
    wrap.innerHTML = mgOrders.items.map((o) =>
      '<button type="button" class="order-card" data-mgorder="' + esc(String(o.id)) + '">' +
      '<span class="oc-top"><span>' + esc(o.id) + '</span><span class="status-pill">' + esc(statusLabel(o.status)) + '</span></span>' +
      '<div class="oc-meta">' + esc(fmtDate(o.created_at)) + ' • ' + esc((o.customer && o.customer.name) || '') + ' • ' + esc((o.customer && o.customer.phone) || '') + '</div>' +
      '<div class="oc-meta">' + esc(t('total')) + ': ' + fmt(o.total) + (o.payment && o.payment.method ? ' • ' + esc(t(o.payment.method)) : '') + (o.has_screenshot ? ' • ' + esc(t('screenshot')) : '') + '</div>' +
      '</button>').join('');
    $$('[data-mgorder]', wrap).forEach((b) => b.addEventListener('click', () => openAdminOrder(b.dataset.mgorder)));
  } catch (e) {
    wrap.innerHTML = '<div class="error-box">' + esc(t('error_load')) + '</div>';
  }
}
async function openAdminOrder(id) {
  openOverlay('#orderOverlay', '#orderModal');
  $('#orderBody').innerHTML = '<div class="loading">' + esc(t('loading')) + '</div>';
  try {
    const data = await api('/manage/orders/' + encodeURIComponent(id));
    const o = data.order || data;
    const items = o.items || [];
    const c = o.customer || {};
    const pay = o.payment || {};
    $('#orderBody').innerHTML =
      '<div class="line"><span>' + esc(t('order_id')) + '</span><strong>' + esc(o.id) + '</strong></div>' +
      '<div class="line"><span>' + esc(t('status')) + '</span><span class="status-pill" id="adminOrderPill">' + esc(statusLabel(o.status)) + '</span></div>' +
      '<div class="line"><span>' + esc(t('date')) + '</span><span>' + esc(fmtDate(o.created_at)) + '</span></div>' +
      ((c.name || c.phone || c.address) ?
        '<hr>' +
        (c.name ? '<div class="line"><span>' + esc(t('name')) + '</span><strong>' + esc(c.name) + '</strong></div>' : '') +
        (c.phone ? '<div class="line"><span>' + esc(t('phone')) + '</span><span>' + esc(c.phone) + '</span></div>' : '') +
        (c.address ? '<div class="line"><span>' + esc(t('address')) + '</span><span>' + esc(c.address) + '</span></div>' : '') : '') +
      (o.delivery && o.delivery.method ? '<div class="line"><span>' + esc(t('delivery')) + '</span><strong>' + esc(deliveryLabel(o.delivery.method)) + '</strong></div>' : '') +
      (pay.method ? '<div class="line"><span>' + esc(t('payment')) + '</span><span>' + esc(t(pay.method)) + (pay.account ? ' — ' + esc(pay.account) : '') + '</span></div>' : '') +
      '<hr>' +
      items.map((it) => {
        const lineTotal = it.line_total != null ? it.line_total : (it.unit_price != null ? it.unit_price : (it.price || 0)) * (it.qty || 1);
        return '<div class="line"><span>' + esc(it.product_name || it.name || it.product_id) + (it.option_label ? ' (' + esc(it.option_label) + ')' : '') + ' × ' + (it.qty || 1) + '</span><span>' + fmt(lineTotal) + '</span></div>';
      }).join('') +
      (o.status !== 'delivered' && o.status !== 'cancelled' ? '<div style="margin-top:10px"><button type="button" class="btn btn-outline btn-block" id="adminEditItemsBtn">✏️ ' + esc(t('edit_items')) + '</button></div>' : '') +
      (o.status !== 'delivered' && o.status !== 'cancelled' ? '<hr><div style="font-weight:700;margin-bottom:8px">' + esc(t('coupon')) + '</div>' +
      '<div class="row-flex"><select id="adminCouponSel" style="flex:1;padding:10px 12px;border:1.5px solid var(--line);border-radius:10px;min-width:140px"><option value="">—</option></select>' +
      '<button type="button" class="btn btn-primary" id="adminCouponApply">' + esc(t('apply')) + '</button>' +
      (o.coupon_code ? '<button type="button" class="btn btn-outline" id="adminCouponRemove">' + esc(t('remove_coupon')) + '</button>' : '') + '</div>' +
      '<div id="adminCouponNote" style="margin-top:6px;font-size:13px;color:var(--muted)"></div>' : '') +
      '<hr>' +
      '<div class="line"><span>' + esc(t('subtotal')) + '</span><span>' + fmt(o.subtotal) + '</span></div>' +
      (o.discount ? '<div class="line"><span>' + esc(t('discount')) + '</span><span>−' + fmt(o.discount) + '</span></div>' : '') +
      '<div class="line"><strong>' + esc(t('total')) + '</strong><strong>' + fmt(o.total) + '</strong></div>' +
      '<div class="delivery-line">' + esc(o.delivery_note || (o.delivery_fee != null && o.delivery_fee > 0 ? t('delivery_fee') + ' ' + fmt(o.delivery_fee) + ' — ' + t('pay_on_delivery') : '')) + '</div>' +
      (o.has_screenshot
        ? '<hr><div style="font-weight:700;margin-bottom:8px">' + esc(t('screenshot')) + '</div><img id="adminShotImg" alt="" style="width:100%;border-radius:10px;border:1px solid var(--line)" hidden>'
        : '<hr><div class="empty">' + esc(t('no_screenshot')) + '</div>') +
      '<hr><div style="font-weight:700;margin-bottom:8px">' + esc(t('change_status')) + '</div>' +
      '<div class="row-flex" style="flex-wrap:wrap">' + ORDER_STATUSES.map((s) =>
        '<button type="button" class="btn ' + (o.status === s ? 'btn-primary' : 'btn-outline') + '" data-mgstatus="' + s + '">' + esc(statusLabel(s)) + '</button>').join('') + '</div>';
    if (o.has_screenshot) loadAdminScreenshot(o.id);
    const editBtn = $('#adminEditItemsBtn');
    if (editBtn) editBtn.addEventListener('click', () => renderAdminOrderEdit(o));
    // Coupon apply / remove (admin only, same lock as item editing).
    const couponSel = $('#adminCouponSel');
    if (couponSel) {
      const fillCoupons = async () => {
        try {
          const data = await api('/manage/coupons');
          const list = data.coupons || data.items || (Array.isArray(data) ? data : []);
          const active = list.filter((c) => c.active !== false);
          couponSel.innerHTML = '<option value="">—</option>' + active.map((c) =>
            '<option value="' + esc(c.code) + '"' + (o.coupon_code === c.code ? ' selected' : '') + '>' + esc(c.code) + ' — ' + esc(c.type) + ' ' + esc(String(c.value)) + (c.type === 'percent' ? '%' : ' Ks') + '</option>').join('');
        } catch (e) { /* select stays empty */ }
      };
      fillCoupons();
      const showCouponResult = async (res) => {
        const diff = res.new_total - res.old_total;
        loadMgOrders(true);
        await openAdminOrder(o.id);
        const nb = $('#orderBody');
        if (nb && diff !== 0) {
          const diffText = (diff > 0 ? '+' : '') + fmt(diff) + ' Ks';
          const warn = (o.payment && o.payment.method === 'transfer') ? ' — ' + esc(t('total_diff_hint')) : '';
          nb.insertAdjacentHTML('afterbegin', '<div class="mg-card" style="background:#FDE7F0;margin-bottom:10px"><strong>' + esc(t('total_changed')) + ':</strong> ' + fmt(res.old_total) + ' → ' + fmt(res.new_total) + ' Ks (' + diffText + ')' + warn + '</div>');
        }
        toast(t('saved'));
      };
      const couponNote = () => $('#adminCouponNote');
      $('#adminCouponApply').addEventListener('click', async () => {
        const code = couponSel.value;
        if (!code) { if (couponNote()) couponNote().textContent = t('coupon_invalid'); return; }
        try {
          const res = await api('/manage/orders/' + encodeURIComponent(o.id) + '/coupon', { method: 'PATCH', body: JSON.stringify({ coupon_code: code }) });
          await showCouponResult(res);
        } catch (e) {
          if (couponNote()) couponNote().textContent = t(e && e.message === 'no_eligible_items' ? 'coupon_no_eligible_items' : e && e.message === 'order_locked' ? 'order_locked' : 'coupon_invalid');
        }
      });
      const remBtn = $('#adminCouponRemove');
      if (remBtn) remBtn.addEventListener('click', async () => {
        try {
          const res = await api('/manage/orders/' + encodeURIComponent(o.id) + '/coupon', { method: 'PATCH', body: JSON.stringify({ coupon_code: null }) });
          await showCouponResult(res);
        } catch (e) { if (couponNote()) couponNote().textContent = t(e && e.message === 'order_locked' ? 'order_locked' : 'error_load'); }
      });
    }
    $$('[data-mgstatus]').forEach((btn) => btn.addEventListener('click', async () => {
      try {
        const res = await api('/manage/orders/' + encodeURIComponent(o.id), { method: 'PATCH', body: JSON.stringify({ status: btn.dataset.mgstatus }) });
        const pill = $('#adminOrderPill');
        if (pill) pill.textContent = statusLabel(res.order.status);
        $$('[data-mgstatus]').forEach((b) => {
          b.classList.toggle('btn-primary', b.dataset.mgstatus === res.order.status);
          b.classList.toggle('btn-outline', b.dataset.mgstatus !== res.order.status);
        });
        toast(t('status_changed'));
        loadMgOrders(true);
      } catch (e) { toast(t('error_load')); }
    }));
  } catch (e) {
    $('#orderBody').innerHTML = '<div class="error-box">' + esc(t('error_load')) + '</div>';
  }
}
/* Admin edits an order's items: qty −/+, remove, add by search.
   Prices shown are the order's snapshot prices; a newly added line is
   priced at the current catalog price. Total is recomputed server-side. */
function renderAdminOrderEdit(o) {
  const editItems = (o.items || []).map((it) => ({ ...it }));
  const body = $('#orderBody');
  const paint = () => {
    const subtotal = editItems.reduce((a, it) => a + (it.unit_price || 0) * (it.qty || 1), 0);
    body.innerHTML =
      '<div class="line"><span>' + esc(t('order_id')) + '</span><strong>' + esc(o.id) + '</strong></div>' +
      '<div style="font-weight:700;margin:10px 0 8px">' + esc(t('edit_items')) + '</div>' +
      '<div id="adminEditRows">' + editItems.map((it, i) =>
        '<div class="order-card" style="margin-bottom:8px"><div class="kv-row"><span>' + esc(it.product_name || it.name || it.product_id) + (it.option_label ? ' (' + esc(it.option_label) + ')' : '') + '</span><span>' + fmt((it.unit_price || 0) * (it.qty || 1)) + '</span></div>' +
        '<div class="row-flex" style="margin-top:8px"><button type="button" class="btn btn-outline mini" data-eqty="-1" data-ei="' + i + '">−</button>' +
        '<span style="min-width:28px;text-align:center;font-weight:700">' + (it.qty || 1) + '</span>' +
        '<button type="button" class="btn btn-outline mini" data-eqty="1" data-ei="' + i + '">+</button>' +
        '<span style="color:var(--muted);font-size:12px">' + fmt(it.unit_price || 0) + ' Ks</span>' +
        '<button type="button" class="btn btn-danger mini" data-erem="' + i + '" style="margin-left:auto">✕</button></div></div>').join('') + '</div>' +
      (editItems.length ? '' : '<div class="empty">' + esc(t('no_items')) + '</div>') +
      '<div class="row-flex" style="margin-top:10px"><input id="adminAddSearch" type="search" placeholder="' + esc(t('search_products_ph')) + '" style="flex:1;padding:10px 12px;border:1.5px solid var(--line);border-radius:10px;min-width:140px">' +
      '<button class="btn btn-outline" type="button" id="adminAddSearchBtn">' + esc(t('search_btn')) + '</button></div>' +
      '<div id="adminAddResults" style="margin-top:6px"></div>' +
      '<div class="line" style="margin-top:12px"><strong>' + esc(t('subtotal')) + '</strong><strong>' + fmt(subtotal) + '</strong></div>' +
      '<div class="row-flex" style="margin-top:12px"><button type="button" class="btn btn-primary" id="adminEditSave" style="flex:1">' + esc(t('save_changes')) + '</button>' +
      '<button type="button" class="btn btn-outline" id="adminEditCancel">' + esc(t('cancel')) + '</button></div>' +
      '<div id="adminEditNote" style="margin-top:8px;font-size:13px;color:var(--muted)"></div>';
    $$('[data-eqty]', body).forEach((b) => b.addEventListener('click', () => {
      const it = editItems[Number(b.dataset.ei)];
      if (!it) return;
      it.qty = Math.max(1, Math.min(99, (it.qty || 1) + Number(b.dataset.eqty)));
      paint();
    }));
    $$('[data-erem]', body).forEach((b) => b.addEventListener('click', () => {
      editItems.splice(Number(b.dataset.erem), 1);
      paint();
    }));
    const doAddSearch = async () => {
      const q = $('#adminAddSearch').value.trim();
      const res = $('#adminAddResults');
      if (!q) { res.innerHTML = ''; return; }
      res.innerHTML = '<div class="loading">' + esc(t('loading')) + '</div>';
      try {
        const data = await api('/manage/products?q=' + encodeURIComponent(q) + '&limit=10');
        const items = data.items || [];
        if (!items.length) { res.innerHTML = '<div class="empty">' + esc(t('no_products_found')) + '</div>'; return; }
        res.innerHTML = items.map((p) => '<button type="button" class="order-card" data-addprod="' + esc(String(p.id)) + '" style="text-align:left"><span>' + esc(p.name) + '</span><div class="oc-meta">' + esc(p.brand || '') + ' • ' + fmt(p.price) + '</div>' +
          (Array.isArray(p.options) && p.options.length ? '<div style="margin-top:6px">' + p.options.map((op) => '<span class="chip" data-addopt="' + esc(String(p.id)) + '" data-optlabel="' + esc(op.label) + '" style="cursor:pointer">' + esc(op.label) + ' — ' + fmt(op.price) + '</span>').join(' ') + '</div>' : '') + '</button>').join('');
        $$('[data-addprod]', res).forEach((b) => b.addEventListener('click', () => {
          const prod = items.find((x) => String(x.id) === b.dataset.addprod);
          if (!prod || (Array.isArray(prod.options) && prod.options.length)) return; // option products use their option chips
          const unit = (prod.sale_price != null && prod.sale_price < prod.price) ? prod.sale_price : prod.price;
          editItems.push({ product_id: prod.id, product_name: prod.name, option_label: null, qty: 1, unit_price: unit, line_total: unit });
          paint();
        }));
        $$('[data-addopt]', res).forEach((ch) => ch.addEventListener('click', (ev) => {
          ev.stopPropagation();
          const prod = items.find((x) => String(x.id) === ch.dataset.addopt);
          const opt = prod && (prod.options || []).find((x) => x.label === ch.dataset.optlabel);
          if (!prod || !opt) return;
          editItems.push({ product_id: prod.id, product_name: prod.name, option_label: opt.label, qty: 1, unit_price: opt.price, line_total: opt.price });
          paint();
        }));
      } catch (e) { res.innerHTML = '<div class="error-box">' + esc(t('error_load')) + '</div>'; }
    };
    $('#adminAddSearchBtn').addEventListener('click', doAddSearch);
    $('#adminAddSearch').addEventListener('keydown', (e) => { if (e.key === 'Enter') doAddSearch(); });
    $('#adminEditCancel').addEventListener('click', () => openAdminOrder(o.id));
    $('#adminEditSave').addEventListener('click', async () => {
      if (!editItems.length) { toast(t('no_items')); return; }
      const note = $('#adminEditNote');
      try {
        const res = await api('/manage/orders/' + encodeURIComponent(o.id) + '/items', { method: 'PATCH', body: JSON.stringify({ items: editItems.map((it) => ({ product_id: it.product_id, qty: it.qty, option_label: it.option_label || undefined })) }) });
        const diff = res.new_total - res.old_total;
        loadMgOrders(true);
        await openAdminOrder(o.id);
        const nb = $('#orderBody');
        if (nb && diff !== 0) {
          const diffText = (diff > 0 ? '+' : '') + fmt(diff) + ' Ks';
          const warn = (o.payment && o.payment.method === 'transfer') ? ' — ' + esc(t('total_diff_hint')) : '';
          nb.insertAdjacentHTML('afterbegin', '<div class="mg-card" style="background:#FDE7F0;margin-bottom:10px"><strong>' + esc(t('total_changed')) + ':</strong> ' + fmt(res.old_total) + ' → ' + fmt(res.new_total) + ' Ks (' + diffText + ')' + warn + '</div>');
        }
        toast(t('saved'));
      } catch (e) {
        if (note) note.textContent = t(e && e.message === 'order_locked' ? 'order_locked' : 'error_load');
        else toast(t('error_load'));
      }
    });
  };
  paint();
}
async function loadAdminScreenshot(orderId) {
  try {
    const res = await fetch('/api/manage/orders/' + encodeURIComponent(orderId) + '/screenshot', { headers: { 'Authorization': 'Bearer ' + state.token } });
    const img = $('#adminShotImg');
    if (!res.ok) {
      // The order recorded a screenshot but the file is gone (orders placed
      // before screenshots moved to the database lost theirs on redeploy).
      if (img) img.outerHTML = '<div class="empty">' + esc(t('no_screenshot')) + '</div>';
      return;
    }
    const blob = await res.blob();
    if (img) { img.src = URL.createObjectURL(blob); img.hidden = false; }
  } catch (e) { /* no screenshot to show */ }
}

/* ---------------- manage: users ---------------- */
let mgUsers = { q: '', offset: 0, items: [] };
async function renderManageUsers(body) {
  const isOwner = state.user && state.user.phone === '095117366';
  body.innerHTML =
    (isOwner ? '<div class="mg-card"><h3>' + esc(t('managers_title')) + '</h3><div id="mgManagersWrap"><div class="loading">' + esc(t('loading')) + '</div></div>' +
      '<div class="row-flex" style="margin-top:12px"><input id="mgAddManagerPhone" type="tel" placeholder="' + esc(t('add_manager_ph')) + '" style="flex:1;padding:10px 12px;border:1.5px solid var(--line);border-radius:10px;min-width:160px">' +
      '<button class="btn btn-primary" type="button" id="mgAddManagerBtn">' + esc(t('add')) + '</button></div>' +
      '<div style="margin-top:6px;font-size:12px;color:var(--muted)">' + esc(t('manager_hint')) + '</div></div>' : '') +
    '<div class="mg-card"><div class="row-flex">' +
    '<input id="mgUserSearch" type="search" placeholder="' + esc(t('search_users')) + '" style="flex:1;padding:10px 12px;border:1.5px solid var(--line);border-radius:10px;min-width:160px">' +
    '<button class="btn btn-primary" type="button" id="mgUserSearchBtn">' + esc(t('search_btn')) + '</button>' +
    '</div><div id="mgUserWrap" style="margin-top:12px"></div>' +
    '<div class="center" style="margin-top:12px"><button class="btn btn-outline" type="button" id="mgUserMoreBtn">' + esc(t('more')) + '</button></div></div>';
  mgUsers = { q: '', offset: 0, items: [] };
  const doSearch = () => {
    mgUsers.q = $('#mgUserSearch').value.trim();
    mgUsers.offset = 0; mgUsers.items = [];
    loadMgUsers(true);
  };
  $('#mgUserSearchBtn').addEventListener('click', doSearch);
  $('#mgUserSearch').addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(); });
  $('#mgUserMoreBtn').addEventListener('click', () => loadMgUsers(false));
  if (isOwner) {
    loadMgManagers();
    $('#mgAddManagerBtn').addEventListener('click', async () => {
      const phone = $('#mgAddManagerPhone').value.trim();
      if (!phone) return;
      try {
        await api('/manage/managers', { method: 'POST', body: JSON.stringify({ phone }) });
        $('#mgAddManagerPhone').value = '';
        toast(t('saved'));
        loadMgManagers();
        loadMgUsers(true);
      } catch (e) {
        toast(e.status === 404 ? t('user_not_found') : t('error_load'));
      }
    });
  }
  loadMgUsers(true);
}
async function loadMgManagers() {
  const wrap = $('#mgManagersWrap');
  if (!wrap) return;
  try {
    const data = await api('/manage/managers');
    const list = data.managers || [];
    wrap.innerHTML = '<div class="kv-row"><span>' + esc(t('owner')) + '</span><strong>095117366</strong></div>' +
      (list.length ? list.map((m) =>
        '<div class="kv-row"><span><strong>' + esc(m.name || m.phone) + '</strong> — ' + esc(m.phone) + '</span><button type="button" class="btn btn-outline" data-mgdel="' + esc(m.phone) + '">' + esc(t('remove_manager')) + '</button></div>').join('')
        : '<div class="empty">' + esc(t('no_users')) + '</div>');
    $$('[data-mgdel]', wrap).forEach((b) => b.addEventListener('click', async () => {
      try {
        await api('/manage/managers/' + encodeURIComponent(b.dataset.mgdel), { method: 'DELETE' });
        toast(t('deleted'));
        loadMgManagers();
        loadMgUsers(true);
      } catch (e) { toast(t('error_load')); }
    }));
  } catch (e) {
    wrap.innerHTML = '<div class="error-box">' + esc(t('error_load')) + '</div>';
  }
}
async function loadMgUsers(reset) {
  const wrap = $('#mgUserWrap');
  if (!wrap) return;
  if (reset) { mgUsers.offset = 0; mgUsers.items = []; wrap.innerHTML = '<div class="loading">' + esc(t('loading')) + '</div>'; }
  const params = new URLSearchParams({ limit: String(PAGE), offset: String(mgUsers.offset) });
  if (mgUsers.q) params.set('q', mgUsers.q);
  const isOwner = state.user && state.user.phone === '095117366';
  try {
    const data = await api('/manage/users?' + params.toString());
    const items = data.users || [];
    if (reset) mgUsers.items = items; else mgUsers.items = mgUsers.items.concat(items);
    mgUsers.offset += items.length;
    const moreBtn = $('#mgUserMoreBtn');
    if (moreBtn) moreBtn.style.display = (data.total != null && mgUsers.offset < data.total) ? '' : 'none';
    if (!mgUsers.items.length) { wrap.innerHTML = '<div class="empty">' + esc(t('no_users')) + '</div>'; return; }
    wrap.innerHTML = mgUsers.items.map((u) =>
      '<div class="mg-card" style="margin-bottom:10px"><div class="kv-row"><span><strong>' + esc(u.name || '') + '</strong> — ' + esc(u.phone) + '</span><span>' + esc(t('orders')) + ': ' + (u.orders_count || 0) + '</span></div>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px">' +
      (u.is_owner ? '<span class="badge" style="background:#FDE7F0;color:var(--pink)">' + esc(t('owner')) + '</span>' : '') +
      (u.is_manager && !u.is_owner ? '<span class="badge" style="background:#FDE7F0;color:var(--pink)">' + esc(t('manager')) + '</span>' : '') +
      '</div>' +
      '<div class="row-flex" style="margin-top:10px;flex-wrap:wrap">' +
      '<button type="button" class="btn btn-outline" data-mgpw="' + esc(u.phone) + '">' + esc(t('set_password')) + '</button>' +
      (isOwner && !u.is_owner ? '<button type="button" class="btn btn-outline" data-mgmgr="' + esc(u.phone) + '" data-ismgr="' + (u.is_manager ? '1' : '0') + '">' + esc(u.is_manager ? t('remove_manager') : t('make_manager')) + '</button>' : '') +
      '</div>' +
      '<div data-pwform="' + esc(u.phone) + '" hidden style="margin-top:10px"><div class="row-flex">' +
      '<input type="text" placeholder="' + esc(t('new_password')) + '" style="flex:1;padding:10px 12px;border:1.5px solid var(--line);border-radius:10px;min-width:140px">' +
      '<button type="button" class="btn btn-primary" data-pwsave="' + esc(u.phone) + '">' + esc(t('save')) + '</button>' +
      '</div><div style="margin-top:6px;color:var(--muted);font-size:13px">' + esc(t('pw_reset_hint')) + '</div></div>' +
      '</div>').join('');
    $$('[data-mgpw]', wrap).forEach((b) => b.addEventListener('click', () => {
      const form = wrap.querySelector('[data-pwform="' + b.dataset.mgpw + '"]');
      if (form) form.hidden = !form.hidden;
    }));
    $$('[data-pwsave]', wrap).forEach((b) => b.addEventListener('click', async () => {
      const form = wrap.querySelector('[data-pwform="' + b.dataset.pwsave + '"]');
      const inp = form ? form.querySelector('input') : null;
      const val = inp ? inp.value.trim() : '';
      if (val.length < 4) { toast(t('password_too_short')); return; }
      try {
        await api('/manage/users/' + encodeURIComponent(b.dataset.pwsave) + '/password', { method: 'PATCH', body: JSON.stringify({ password: val }) });
        toast(t('password_changed'));
        if (form) form.hidden = true;
        if (inp) inp.value = '';
      } catch (e) { toast(e.status === 403 ? t('owner_only') : t('error_load')); }
    }));
    $$('[data-mgmgr]', wrap).forEach((b) => b.addEventListener('click', async () => {
      try {
        if (b.dataset.ismgr === '1') await api('/manage/managers/' + encodeURIComponent(b.dataset.mgmgr), { method: 'DELETE' });
        else await api('/manage/managers', { method: 'POST', body: JSON.stringify({ phone: b.dataset.mgmgr }) });
        toast(t('saved'));
        loadMgManagers();
        loadMgUsers(true);
      } catch (e) { toast(e.status === 404 ? t('user_not_found') : t('error_load')); }
    }));
  } catch (e) {
    wrap.innerHTML = '<div class="error-box">' + esc(t('error_load')) + '</div>';
  }
}

/* ---------------- manage: activity log (owner only) ---------------- */
const ACTIVITY_ACTIONS = ['order_status', 'order_edit', 'order_coupon', 'password_reset', 'manager_add', 'manager_remove', 'product_update', 'product_photo_add', 'product_photo_remove', 'coupon_create', 'coupon_delete', 'payments_update', 'app_links_update', 'woocommerce_settings', 'woocommerce_import'];
function activityLabel(a) { return t('action_' + a); }
let mgActivity = { q: '', action: '', offset: 0, items: [] };
async function renderManageActivity(body) {
  body.innerHTML =
    '<div class="mg-card"><div class="row-flex">' +
    '<input id="mgActSearch" type="search" placeholder="' + esc(t('search_activity')) + '" style="flex:1;padding:10px 12px;border:1.5px solid var(--line);border-radius:10px;min-width:160px">' +
    '<select id="mgActFilter" style="padding:10px 12px;border:1.5px solid var(--line);border-radius:10px">' +
    '<option value="">' + esc(t('all_actions')) + '</option>' +
    ACTIVITY_ACTIONS.map((a) => '<option value="' + a + '">' + esc(activityLabel(a)) + '</option>').join('') +
    '</select>' +
    '<button class="btn btn-primary" type="button" id="mgActSearchBtn">' + esc(t('search_btn')) + '</button>' +
    '</div><div id="mgActWrap" style="margin-top:12px"></div>' +
    '<div class="center" style="margin-top:12px"><button class="btn btn-outline" type="button" id="mgActMoreBtn">' + esc(t('more')) + '</button></div></div>';
  mgActivity = { q: '', action: '', offset: 0, items: [] };
  const doSearch = () => {
    mgActivity.q = $('#mgActSearch').value.trim();
    mgActivity.action = $('#mgActFilter').value;
    mgActivity.offset = 0; mgActivity.items = [];
    loadMgActivity(true);
  };
  $('#mgActSearchBtn').addEventListener('click', doSearch);
  $('#mgActSearch').addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(); });
  $('#mgActFilter').addEventListener('change', doSearch);
  $('#mgActMoreBtn').addEventListener('click', () => loadMgActivity(false));
  loadMgActivity(true);
}
async function loadMgActivity(reset) {
  const wrap = $('#mgActWrap');
  if (!wrap) return;
  if (reset) { mgActivity.offset = 0; mgActivity.items = []; wrap.innerHTML = '<div class="loading">' + esc(t('loading')) + '</div>'; }
  const params = new URLSearchParams({ limit: String(PAGE), offset: String(mgActivity.offset) });
  if (mgActivity.q) params.set('q', mgActivity.q);
  if (mgActivity.action) params.set('action', mgActivity.action);
  try {
    const data = await api('/manage/activity?' + params.toString());
    const items = data.activity || [];
    if (reset) mgActivity.items = items; else mgActivity.items = mgActivity.items.concat(items);
    mgActivity.offset += items.length;
    const moreBtn = $('#mgActMoreBtn');
    if (moreBtn) moreBtn.style.display = (data.total != null && mgActivity.offset < data.total) ? '' : 'none';
    if (!mgActivity.items.length) { wrap.innerHTML = '<div class="empty">' + esc(t('no_activity')) + '</div>'; return; }
    wrap.innerHTML = mgActivity.items.map((e) =>
      '<div class="mg-card" style="margin-bottom:10px">' +
      '<div class="kv-row"><span><strong>' + esc(e.user_name || '') + '</strong> — ' + esc(e.user_phone || '') + '</span><span style="color:var(--muted);font-size:12px">' + esc(fmtDate(e.created_at)) + '</span></div>' +
      '<div style="margin-top:4px"><span class="badge" style="background:#FDE7F0;color:var(--pink)">' + esc(activityLabel(e.action)) + '</span>' +
      (e.target_id ? ' <strong>' + esc(e.target_id) + '</strong>' : '') + '</div>' +
      (e.details ? '<div style="margin-top:4px;color:var(--muted);font-size:13px">' + esc(e.details) + '</div>' : '') +
      '</div>').join('');
  } catch (e) {
    wrap.innerHTML = '<div class="error-box">' + esc(t('error_load')) + '</div>';
  }
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
    '<div class="center" style="margin-top:12px"><button class="btn btn-outline" type="button" id="mgMoreBtn">' + esc(t('more')) + '</button></div>' +
    '<input id="mgPhotoInput" type="file" accept="image/*" hidden></div>';
  mgCatalog = { q: '', offset: 0, items: [] };
  const doSearch = () => {
    mgCatalog.q = $('#mgSearch').value.trim();
    mgCatalog.offset = 0; mgCatalog.items = [];
    loadMgCatalog(true);
  };
  $('#mgSearchBtn').addEventListener('click', doSearch);
  $('#mgSearch').addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(); });
  $('#mgMoreBtn').addEventListener('click', () => loadMgCatalog(false));
  $('#mgPhotoInput').addEventListener('change', async () => {
    const input = $('#mgPhotoInput');
    const file = input.files && input.files[0];
    const pid = input.dataset.pid;
    input.value = '';
    if (!file || !pid) return;
    try {
      const dataUrl = await downscaleImage(file);
      const res = await api('/manage/products/' + encodeURIComponent(pid) + '/image', { method: 'POST', body: JSON.stringify({ image_data: dataUrl }) });
      const item = mgCatalog.items.find((x) => String(x.id) === pid);
      if (item) item.image_url = res.image_url || dataUrl;
      paintMgCatalog();
      toast(t('saved'));
    } catch (e) { toast(t('error_load')); }
  });
  loadMgCatalog(true);
}
// Downscale a picked photo to max 800px JPEG before upload — keeps the
// upload small and the stored image a sensible size for product cards.
function downscaleImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 800;
        const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
        const w = Math.max(1, Math.round(img.naturalWidth * scale));
        const h = Math.max(1, Math.round(img.naturalHeight * scale));
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(c.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = () => reject(new Error('bad_image'));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error('bad_image'));
    reader.readAsDataURL(file);
  });
}
async function loadMgCatalog(reset) {
  const wrap = $('#mgTableWrap');
  if (reset) { mgCatalog.offset = 0; mgCatalog.items = []; wrap.innerHTML = '<div class="loading">' + esc(t('loading')) + '</div>'; }
  const params = new URLSearchParams({ limit: String(PAGE), offset: String(mgCatalog.offset) });
  if (mgCatalog.q) params.set('q', mgCatalog.q);
  try {
    const data = await api('/manage/products?' + params.toString());
    const items = data.items || [];
    if (reset) mgCatalog.items = items; else mgCatalog.items = mgCatalog.items.concat(items);
    mgCatalog.offset += items.length;
    $('#mgMoreBtn').style.display = (data.total != null && mgCatalog.offset < data.total) ? '' : 'none';
    paintMgCatalog();
  } catch (e) {
    if (reset) wrap.innerHTML = '<div class="error-box">' + esc(t('error_load')) + '</div>';
  }
}
function paintMgCatalog() {
  const wrap = $('#mgTableWrap');
  if (!wrap) return;
  if (!mgCatalog.items.length) { wrap.innerHTML = '<div class="empty">' + esc(t('empty')) + '</div>'; return; }
  wrap.innerHTML = '<table class="mg-table"><thead><tr><th>' + esc(t('products')) + '</th><th>' + esc(t('price')) + '</th><th>' + esc(t('sale_price')) + '</th><th>' + esc(t('stock_qty')) + '</th><th>' + esc(t('sale_featured')) + '</th><th>' + esc(t('best_seller')) + '</th></tr></thead><tbody>' +
    mgCatalog.items.map((p) =>
      '<tr><td><div style="display:flex;gap:8px;align-items:flex-start">' +
      '<div data-photo="' + esc(String(p.id)) + '" title="' + esc(p.image_url ? t('change_photo') : t('add_photo')) + '" style="flex:none;cursor:pointer">' +
      (p.image_url
        ? '<img src="' + esc(p.image_url) + '" alt="" style="width:44px;height:44px;object-fit:cover;border-radius:8px;border:1px solid var(--line);display:block">'
        : '<span style="width:44px;height:44px;display:flex;align-items:center;justify-content:center;border:1.5px dashed var(--line);border-radius:8px;color:var(--muted);font-size:22px;line-height:1">+</span>') +
      '</div><div style="min-width:0"><strong>' + esc(p.name) + '</strong><br><span style="color:var(--muted);font-size:12px">' + esc(p.brand || '') + '</span>' +
      (p.image_url ? ' <button type="button" data-rmphoto="' + esc(String(p.id)) + '" title="' + esc(t('remove_photo')) + '" style="border:0;background:none;color:var(--muted);font-size:13px;padding:0 2px">✕</button>' : '') +
      (Array.isArray(p.options) && p.options.length ? '<div style="margin-top:6px">' + p.options.map((o) =>
        '<div style="display:flex;gap:6px;align-items:center;margin-top:4px"><span style="font-size:12px;color:var(--muted);flex:1;min-width:0">' + esc(o.label) + '</span>' +
        '<input type="number" min="1" step="500" value="' + o.price + '" data-optprice="' + esc(String(p.id)) + '" data-label="' + esc(o.label) + '" style="width:92px;padding:6px 8px;border:1.5px solid var(--line);border-radius:8px">' +
        '<input type="number" min="0" step="1" value="' + (o.stock != null ? o.stock : '') + '" placeholder="—" title="' + esc(t('stock_qty')) + ' — 0 = ' + esc(t('out_stock')) + '" data-optstock="' + esc(String(p.id)) + '" data-label="' + esc(o.label) + '" style="width:64px;padding:6px 8px;border:1.5px solid var(--line);border-radius:8px"></div>').join('') + '</div>' : '') +
      '</div></div></td>' +
      '<td data-label="' + esc(t('price')) + '">' + (Array.isArray(p.options) && p.options.length
        ? fmt(p.price)
        : '<input type="number" min="1" step="500" value="' + p.price + '" data-price="' + esc(String(p.id)) + '" style="width:92px;padding:6px 8px;border:1.5px solid var(--line);border-radius:8px">') + '</td>' +
      '<td data-label="' + esc(t('sale_price')) + '"><input type="number" min="0" step="500" value="' + (p.sale_price != null ? p.sale_price : '') + '" placeholder="' + fmt(p.price) + '" data-sale="' + esc(String(p.id)) + '"></td>' +
      '<td data-label="' + esc(t('stock_qty')) + '">' + (Array.isArray(p.options) && p.options.length
        // Option products keep stock per option (inputs under the name); the
        // cell just shows the total of the managed option stocks.
        ? '<strong>' + esc(String(p.options.every((o) => o.stock == null) ? '—' : p.options.reduce((a, o) => a + (o.stock || 0), 0))) + '</strong>'
        // Empty = not managed on the website (today's behaviour); 0 = sold out.
        : '<input type="number" min="0" step="1" value="' + (p.stock != null ? p.stock : '') + '" placeholder="—" data-stock="' + esc(String(p.id)) + '" style="width:76px;padding:6px 8px;border:1.5px solid var(--line);border-radius:8px">') + '</td>' +
      '<td data-label="' + esc(t('sale_featured')) + '"><button type="button" class="toggle' + (p.sale_featured ? ' on' : '') + '" data-tgl="sale_featured" data-id="' + esc(String(p.id)) + '" aria-label="' + esc(t('sale_featured')) + '"></button></td>' +
      '<td data-label="' + esc(t('best_seller')) + '"><button type="button" class="toggle' + (p.best_seller ? ' on' : '') + '" data-tgl="best_seller" data-id="' + esc(String(p.id)) + '" aria-label="' + esc(t('best_seller')) + '"></button></td>' +
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
  // Selling price: editable for single-price products. For products with
  // options the customer pays the OPTION price, so each option has its own
  // price input under the product name instead.
  $$('[data-price]', wrap).forEach((inp) => {
    inp.addEventListener('change', async () => {
      const val = Number(inp.value);
      if (!val || val <= 0) { toast(t('error_load')); paintMgCatalog(); return; }
      try {
        await api('/manage/products/' + encodeURIComponent(inp.dataset.price), { method: 'PATCH', body: JSON.stringify({ price: val }) });
        const item = mgCatalog.items.find((x) => String(x.id) === inp.dataset.price);
        if (item) item.price = val;
        paintMgCatalog();
        toast(t('saved'));
      } catch (e) { toast(t('error_load')); paintMgCatalog(); }
    });
  });
  $$('[data-optprice]', wrap).forEach((inp) => {
    inp.addEventListener('change', async () => {
      const val = Number(inp.value);
      if (!val || val <= 0) { toast(t('error_load')); paintMgCatalog(); return; }
      try {
        const updated = await api('/manage/products/' + encodeURIComponent(inp.dataset.optprice), { method: 'PATCH', body: JSON.stringify({ option_prices: { [inp.dataset.label]: val } }) });
        const item = mgCatalog.items.find((x) => String(x.id) === inp.dataset.optprice);
        if (item && updated) { Object.assign(item, updated); paintMgCatalog(); }
        toast(t('saved'));
      } catch (e) { toast(t('error_load')); paintMgCatalog(); }
    });
  });
  // Website stock: empty = not managed on the website, 0 = sold out.
  // A customer order takes units out of this number; cancelling returns them.
  $$('[data-stock]', wrap).forEach((inp) => {
    inp.addEventListener('change', async () => {
      const raw = inp.value.trim();
      const val = raw === '' ? null : Number(raw);
      if (val !== null && (!Number.isInteger(val) || val < 0)) { toast(t('error_load')); paintMgCatalog(); return; }
      try {
        const updated = await api('/manage/products/' + encodeURIComponent(inp.dataset.stock), { method: 'PATCH', body: JSON.stringify({ stock: val }) });
        const item = mgCatalog.items.find((x) => String(x.id) === inp.dataset.stock);
        if (item && updated) { Object.assign(item, updated); paintMgCatalog(); }
        toast(t('saved'));
      } catch (e) { toast(t('error_load')); paintMgCatalog(); }
    });
  });
  $$('[data-optstock]', wrap).forEach((inp) => {
    inp.addEventListener('change', async () => {
      const raw = inp.value.trim();
      const val = raw === '' ? null : Number(raw);
      if (val !== null && (!Number.isInteger(val) || val < 0)) { toast(t('error_load')); paintMgCatalog(); return; }
      try {
        const updated = await api('/manage/products/' + encodeURIComponent(inp.dataset.optstock), { method: 'PATCH', body: JSON.stringify({ option_stock: { [inp.dataset.label]: val } }) });
        const item = mgCatalog.items.find((x) => String(x.id) === inp.dataset.optstock);
        if (item && updated) { Object.assign(item, updated); paintMgCatalog(); }
        toast(t('saved'));
      } catch (e) { toast(t('error_load')); paintMgCatalog(); }
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
  // Photo upload: tap a thumbnail (or the + box) to pick a photo for that product.
  $$('[data-photo]', wrap).forEach((th) => th.addEventListener('click', () => {
    const input = $('#mgPhotoInput');
    if (!input) return;
    input.dataset.pid = th.dataset.photo;
    input.click();
  }));
  $$('[data-rmphoto]', wrap).forEach((b) => b.addEventListener('click', async () => {
    if (!window.confirm(t('remove_photo') + '?')) return;
    try {
      await api('/manage/products/' + encodeURIComponent(b.dataset.rmphoto) + '/image', { method: 'DELETE' });
      const item = mgCatalog.items.find((x) => String(x.id) === b.dataset.rmphoto);
      if (item) item.image_url = null;
      paintMgCatalog();
      toast(t('deleted'));
    } catch (e) { toast(t('error_load')); }
  }));
}
async function renderManageCoupons(body) {
  body.innerHTML = '<div class="mg-card"><h3>Coupons</h3>' +
    '<div class="row-flex">' +
    '<input id="cpCode" type="text" placeholder="' + esc(t('coupon_code')) + '" style="text-transform:uppercase;padding:10px 12px;border:1.5px solid var(--line);border-radius:10px;width:140px">' +
    '<select id="cpType" style="padding:10px;border:1.5px solid var(--line);border-radius:10px"><option value="percent">' + esc(t('percent')) + '</option><option value="fixed">' + esc(t('fixed')) + '</option></select>' +
    '<input id="cpValue" type="number" min="0" placeholder="' + esc(t('coupon_value')) + '" style="padding:10px 12px;border:1.5px solid var(--line);border-radius:10px;width:110px">' +
    '<button class="btn btn-primary" type="button" id="cpAddBtn">' + esc(t('add')) + '</button>' +
    '</div>' +
    '<div style="margin-top:14px;font-weight:700">' + esc(t('coupon_scope')) + '</div>' +
    '<div style="margin-top:8px;font-size:13px;color:var(--muted)">' + esc(t('scope_brands')) + '</div>' +
    '<div id="cpBrandChips" class="chips" style="margin-top:4px"></div>' +
    '<div style="margin-top:10px;font-size:13px;color:var(--muted)">' + esc(t('scope_products')) + '</div>' +
    '<div class="row-flex" style="margin-top:4px"><input id="cpProdSearch" type="search" placeholder="' + esc(t('search_products_ph')) + '" style="flex:1;padding:10px 12px;border:1.5px solid var(--line);border-radius:10px;min-width:140px">' +
    '<button class="btn btn-outline" type="button" id="cpProdSearchBtn">' + esc(t('search_btn')) + '</button></div>' +
    '<div id="cpProdResults" style="margin-top:6px"></div>' +
    '<div id="cpProdPicked" class="chips" style="margin-top:6px"></div>' +
    '<div style="margin-top:10px;font-size:13px;color:var(--muted)">' + esc(t('scope_customers')) + '</div>' +
    '<div class="row-flex" style="margin-top:4px"><input id="cpCustPhone" type="tel" placeholder="09…" style="flex:1;padding:10px 12px;border:1.5px solid var(--line);border-radius:10px;min-width:140px">' +
    '<button class="btn btn-outline" type="button" id="cpCustAddBtn">' + esc(t('add')) + '</button></div>' +
    '<div style="margin-top:4px;font-size:12px;color:var(--muted)">' + esc(t('scope_customers_hint')) + '</div>' +
    '<div id="cpCustPicked" class="chips" style="margin-top:6px"></div>' +
    '<div id="cpList" style="margin-top:14px"></div></div>';
  const selBrands = new Set();
  const selProducts = new Map();
  const selCustomers = new Set();
  // Brand chips (tap to toggle).
  try { if (!state.brands || !state.brands.length) await loadBrands(); } catch (e) { /* brands stay empty */ }
  const brandWrap = $('#cpBrandChips');
  const brands = (state.brands || []);
  brandWrap.innerHTML = brands.length ? brands.map((b) =>
    '<button type="button" class="chip" data-cpbrand="' + esc(b.name) + '">' + esc(b.name) + '</button>').join('')
    : '<span style="color:var(--muted);font-size:13px">—</span>';
  $$('[data-cpbrand]', brandWrap).forEach((chip) => chip.addEventListener('click', () => {
    const b = chip.dataset.cpbrand;
    if (selBrands.has(b)) { selBrands.delete(b); chip.classList.remove('active'); }
    else { selBrands.add(b); chip.classList.add('active'); }
  }));
  const paintPicked = () => {
    $('#cpProdPicked').innerHTML = Array.from(selProducts.entries()).map(([id, name]) =>
      '<span class="chip active">' + esc(name) + ' <button type="button" data-unpick="' + esc(id) + '" style="border:0;background:none;color:inherit;font-size:14px;padding:0 2px">✕</button></span>').join('');
    $$('[data-unpick]', $('#cpProdPicked')).forEach((b) => b.addEventListener('click', () => { selProducts.delete(b.dataset.unpick); paintPicked(); }));
    $('#cpCustPicked').innerHTML = Array.from(selCustomers).map((ph) =>
      '<span class="chip active">' + esc(ph) + ' <button type="button" data-uncust="' + esc(ph) + '" style="border:0;background:none;color:inherit;font-size:14px;padding:0 2px">✕</button></span>').join('');
    $$('[data-uncust]', $('#cpCustPicked')).forEach((b) => b.addEventListener('click', () => { selCustomers.delete(b.dataset.uncust); paintPicked(); }));
  };
  const searchProducts = async () => {
    const q = $('#cpProdSearch').value.trim();
    const res = $('#cpProdResults');
    if (!q) { res.innerHTML = ''; return; }
    res.innerHTML = '<div class="loading">' + esc(t('loading')) + '</div>';
    try {
      const data = await api('/manage/products?q=' + encodeURIComponent(q) + '&limit=10');
      const items = data.items || [];
      if (!items.length) { res.innerHTML = '<div class="empty">' + esc(t('no_products_found')) + '</div>'; return; }
      res.innerHTML = items.map((p) => '<button type="button" class="order-card" data-pickprod="' + esc(String(p.id)) + '" data-pickname="' + esc(p.name) + '" style="text-align:left"><span>' + esc(p.name) + '</span><div class="oc-meta">' + esc(p.brand || '') + ' • ' + fmt(p.price) + '</div></button>').join('');
      $$('[data-pickprod]', res).forEach((b) => b.addEventListener('click', () => {
        if (!selProducts.has(b.dataset.pickprod)) selProducts.set(b.dataset.pickprod, b.dataset.pickname);
        paintPicked();
      }));
    } catch (e) { res.innerHTML = '<div class="error-box">' + esc(t('error_load')) + '</div>'; }
  };
  $('#cpProdSearchBtn').addEventListener('click', searchProducts);
  $('#cpProdSearch').addEventListener('keydown', (e) => { if (e.key === 'Enter') searchProducts(); });
  $('#cpCustAddBtn').addEventListener('click', () => {
    const ph = $('#cpCustPhone').value.trim().replace(/[\s-]/g, '');
    if (!ph) return;
    selCustomers.add(ph);
    $('#cpCustPhone').value = '';
    paintPicked();
  });
  const load = async () => {
    const listEl = $('#cpList');
    listEl.innerHTML = '<div class="loading">' + esc(t('loading')) + '</div>';
    try {
      const data = await api('/manage/coupons');
      const list = data.coupons || data.items || (Array.isArray(data) ? data : []);
      if (!list.length) { listEl.innerHTML = '<div class="empty">' + esc(t('no_coupons')) + '</div>'; return; }
      listEl.innerHTML = list.map((c) =>
        '<div class="pay-account"><div class="pa-info"><div class="pa-method">' + esc(c.code) + '</div>' +
        '<div class="pa-name">' + esc(c.type) + ' — ' + esc(String(c.value)) + (c.type === 'percent' ? '%' : ' Ks') + '</div>' +
        '<div class="pa-name" style="font-size:12px;color:var(--muted)">' + esc(couponScopeText(c)) + '</div></div>' +
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
      await api('/manage/coupons', { method: 'POST', body: JSON.stringify({ code: code, type: type, value: value, brands: Array.from(selBrands), products: Array.from(selProducts.keys()), customers: Array.from(selCustomers) }) });
      toast(t('saved')); $('#cpCode').value = ''; $('#cpValue').value = '';
      selBrands.clear(); selProducts.clear(); selCustomers.clear();
      $$('[data-cpbrand]', brandWrap).forEach((ch) => ch.classList.remove('active'));
      paintPicked();
      load();
    } catch (e) { toast(t('error_load')); }
  });
  paintPicked();
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
  // WooCommerce is fetched from THIS browser, not from the shop server:
  // the server sits in a country the website host geo-blocks ("Your
  // country is blocked"), while this browser in Myanmar is allowed in.
  async function fetchWcFromBrowser(creds, onProgress) {
    const base = String(creds.site_url || '').replace(/\/$/, '');
    const auth = btoa(creds.consumer_key + ':' + creds.consumer_secret);
    const perPage = 50;
    const all = [];
    let page = 1;
    let totalPages = null;
    do {
      const url = base + '/wp-json/wc/v3/products?per_page=' + perPage + '&page=' + page + '&_fields=id,name,sku,price,images';
      let res;
      try {
        res = await fetch(url, { headers: { Authorization: 'Basic ' + auth, Accept: 'application/json' } });
      } catch (e) {
        throw new Error(t('woo_browser_blocked') + ' (' + (e.message || 'network error') + ')');
      }
      if (!res.ok) throw new Error('WooCommerce replied HTTP ' + res.status + ' on page ' + page);
      const total = res.headers.get('x-wp-totalpages');
      if (total) totalPages = parseInt(total, 10) || totalPages;
      let items;
      try { items = await res.json(); }
      catch (e) { throw new Error(t('woo_browser_blocked') + ' — WooCommerce returned a web page instead of product data'); }
      if (!Array.isArray(items)) throw new Error(t('woo_browser_blocked') + ' — WooCommerce returned a web page instead of product data');
      all.push(...items);
      if (onProgress) onProgress(page, totalPages || '?');
      if (items.length < perPage) break;
      page++;
    } while (totalPages === null || page <= totalPages);
    return all;
  }
  let lastWooPreview = null;
  $('#wooTest').addEventListener('click', async () => {
    $('#wooMsg').textContent = t('loading');
    try {
      const creds = await api('/manage/woocommerce/credentials');
      const base = String(creds.site_url || '').replace(/\/$/, '');
      const auth = btoa(creds.consumer_key + ':' + creds.consumer_secret);
      const res = await fetch(base + '/wp-json/wc/v3/products?per_page=1', { headers: { Authorization: 'Basic ' + auth, Accept: 'application/json' } });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      await res.json();
      $('#wooMsg').textContent = t('wc_test_ok');
    } catch (e) { $('#wooMsg').textContent = t('wc_test_fail') + (e && e.message ? ' — ' + e.message : ''); }
  });
  $('#wooPreview').addEventListener('click', async () => {
    $('#wooMsg').textContent = t('loading');
    try {
      const creds = await api('/manage/woocommerce/credentials');
      const wcProducts = await fetchWcFromBrowser(creds, (page, total) => {
        $('#wooMsg').textContent = t('loading') + ' (' + page + '/' + total + ')';
      });
      const r = await api('/manage/woocommerce/preview-data', { method: 'POST', body: JSON.stringify({ wc_products: wcProducts }) });
      lastWooPreview = r;
      $('#wooMsg').textContent = '';
      const matchedN = (r.totals && r.totals.matched_count) || (Array.isArray(r.matched) ? r.matched.length : r.matched) || '—';
      const posOnlyN = (r.totals && r.totals.pos_only_count) || (Array.isArray(r.pos_only) ? r.pos_only.length : r.pos_only) || '—';
      $('#wooResult').innerHTML = '<table class="mg-table"><tbody>' +
        '<tr><td>' + esc(t('matched')) + '</td><td><strong>' + esc(String(matchedN)) + '</strong></td></tr>' +
        '<tr><td>' + esc(t('pos_only')) + '</td><td><strong>' + esc(String(posOnlyN)) + '</strong></td></tr>' +
        '<tr><td>' + esc(t('wc_only')) + '</td><td><strong>' + esc(String(r.wc_only_count != null ? r.wc_only_count : (r.totals && r.totals.wc_only_count) || '—')) + '</strong></td></tr>' +
        '</tbody></table>';
    } catch (e) { $('#wooMsg').textContent = t('error_load') + (e && e.message ? ' (' + e.message + ')' : ''); }
  });
  $('#wooImport').addEventListener('click', async () => {
    if (!lastWooPreview || !Array.isArray(lastWooPreview.matched)) { $('#wooMsg').textContent = t('woo_preview_first'); return; }
    if (!window.confirm(t('confirm_import'))) return;
    $('#wooMsg').textContent = t('loading');
    try {
      const r = await api('/manage/woocommerce/import-data', { method: 'POST', body: JSON.stringify({ matched: lastWooPreview.matched }) });
      $('#wooMsg').textContent = t('saved');
      $('#wooResult').innerHTML = '<pre style="white-space:pre-wrap;font-size:13px">' + esc(JSON.stringify(r, null, 2)) + '</pre>';
      loadBrands(); loadTypes(); loadHomeGrid(true);
    } catch (e) { $('#wooMsg').textContent = t('error_load') + (e && e.message ? ' (' + e.message + ')' : ''); }
  });
}

/* ---------------- wiring / init ---------------- */
function wire() {
  $('#logoHome').addEventListener('click', () => { showView('home'); });
  $('#langToggle').addEventListener('click', () => {
    lang = lang === 'my' ? 'en' : 'my';
    localStorage.setItem('bm_lang', lang);
    applyI18n();
    renderChips($('#brandChips'));
    renderTypeChips($('#typeChips'));
    loadHomeGrid(true);
    if (!$('#view-wishlist').hidden) loadWishlist();
  });
  $('#cartClose').addEventListener('click', closeCart);
  $('#cartOverlay').addEventListener('click', (ev) => { if (ev.target === $('#cartOverlay')) closeCart(); });
  $('#authBtn').addEventListener('click', () => {
    if (state.user) showView('account');
    else openAuth();
  });
  $('#authClose').addEventListener('click', closeAuth);
  $('#authOverlay').addEventListener('click', (ev) => { if (ev.target === $('#authOverlay')) closeAuth(); });
  $$('#authTabs .tab').forEach((b) => b.addEventListener('click', () => setAuthTab(b.dataset.atab)));
  $('#authSubmit').addEventListener('click', submitAuth);
  $('#authPass').addEventListener('keydown', (e) => { if (e.key === 'Enter') submitAuth(); });
  $('#detailClose').addEventListener('click', () => closeOverlay('#detailOverlay', '#detailModal'));
  $('#detailOverlay').addEventListener('click', (ev) => { if (ev.target === $('#detailOverlay')) closeOverlay('#detailOverlay', '#detailModal'); });
  $('#orderClose').addEventListener('click', () => closeOverlay('#orderOverlay', '#orderModal'));
  $('#orderOverlay').addEventListener('click', (ev) => { if (ev.target === $('#orderOverlay')) closeOverlay('#orderOverlay', '#orderModal'); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeTopLayer(); });
  $('#couponApplyBtn').addEventListener('click', applyCoupon);
  $('#couponInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') applyCoupon(); });
  $('#couponListBtn').addEventListener('click', openCouponList);
  $('#couponClose').addEventListener('click', () => closeOverlay('#couponOverlay', '#couponModal'));
  $('#couponOverlay').addEventListener('click', (ev) => { if (ev.target === $('#couponOverlay')) closeOverlay('#couponOverlay', '#couponModal'); });
  $('#checkoutBtn').addEventListener('click', () => { if (state.cart.length) openCheckout(); });
  $('#playStoreBtn').addEventListener('click', () => onAppButton('play_store_url'));
  $('#appStoreBtn').addEventListener('click', () => onAppButton('app_store_url'));
  $$('.nav-item').forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.view === 'cart') { openCart(); return; }
    closeCart();
    if (b.dataset.view === 'checkout') { openCheckout(); return; }
    showView(b.dataset.view);
  }));
  $$('#manageTabs .tab').forEach((b) => b.addEventListener('click', () => loadManage(b.dataset.mtab)));
  $$('[data-viewall]').forEach((b) => b.addEventListener('click', () => {
    state.brandFilter = '';
    state.typeFilter = '';
    state.sectionFilter = b.dataset.viewall;
    state.searchQuery = '';
    $('#searchInput').value = '';
    renderChips($('#brandChips'));
    renderTypeChips($('#typeChips'));
    showView('home');
    loadHomeGrid(true);
    const g = $('#gridHome');
    if (g) g.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));
  $('#homeMoreBtn').addEventListener('click', () => loadHomeGrid(false));
  $('#homeClearBtn').addEventListener('click', clearHomeFilters);
  let searchTimer = null;
  const doSearch = () => {
    const q = $('#searchInput').value.trim();
    state.searchQuery = q.length >= 2 ? q : '';
    state.sectionFilter = '';
    showView('home');
    loadHomeGrid(true);
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
  updateWishlistBadge();
  renderCart();
  await restoreSession();
  await loadShopInfo();
  await loadBrands();
  await loadTypes();
  loadHome();
}
document.addEventListener('DOMContentLoaded', init);
