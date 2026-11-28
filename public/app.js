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
    forgot_step1_title: 'Password ပြန်ယူမယ်',
    forgot_step1_hint: 'အကောင့် ဖွင့်ထားတဲ့ ဖုန်း နဲ့ နာမည် ရိုက်ပါ',
    forgot_continue: 'ဆက်သွားမယ်',
    forgot_no_match: 'ဖုန်း နဲ့ နာမည် မကိုက်ညီပါ — ဆိုင်ကို ဆက်သွယ်ပြီး Password ပြန်ချိန်းပေးပါမယ်။',
    forgot_call_shop: 'ဆိုင်ကို ဖုန်းဆက်မယ်',
    forgot_send_link: 'Reset link ပို့မယ်',
    forgot_send_to: 'ဒီ email ကို link ပို့ပေးပါမယ်:',
    forgot_enter_email: 'Reset link ပို့ဖို့ email ရိုက်ပါ',
    forgot_sent: 'Reset link ပို့ပေးပါပြီ — inbox (နဲ့ spam) စစ်ပါ။ Link က ၁ နာရီပဲ ခံပါတယ်။',
    forgot_mail_off: 'Email ပို့တဲ့ စနစ် မချိတ်ရသေးပါ — Messenger (သို့) ဖုန်းနဲ့ ဆိုင်ကို ဆက်သွယ်ပါ။',
    forgot_back: 'Login ပြန်သွားမယ်',
    email_optional: 'Email (မဖြစ်မနေ မဟုတ်ပါ)',
    email_saved: 'Email မှတ်ပေးပြီးပါပြီ',
    invalid_email: 'Email မမှန်ပါ',
    email_registered: 'ဒီ email ကို အကောင့် တစ်ခု သုံးထားပြီးပါပြီ',
    phone_registered: 'ဒီ ဖုန်းနံပါတ်နဲ့ အကောင့် ဖွင့်ပြီးသားပါ',
    too_many_attempts: 'အကြိမ်ရေ များနေပါတယ် — ခဏနေ ပြန်စမ်းပါ',
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
    hero_banner: 'Hero banner ပုံ', hero_banner_hint: 'Home အပေါ်ဆုံး box မှာ ပြမယ့် ပုံ — promotion ပုံ တင်လို့ရတယ်။ ပုံ မရှိရင် စာပဲ ပြမယ်။', hero_upload: 'ပုံ တင်မယ်', hero_change: 'ပုံ ပြောင်းမယ်', hero_remove: 'ပုံ ဖြုတ်မယ်', hero_no_image: 'ပုံ မရှိသေးပါ', hero_saved: 'သိမ်းပြီးပါပြီ',
    best: 'အရောင်းရဆုံး', sale: 'လျှော့ဈေး', new: 'ပစ္စည်းအသစ်', all: 'ပစ္စည်းအားလုံး',
    view_all: 'အားလုံးကြည့်မယ်', more: 'နောက်ထပ် ပြမယ်',
    in_stock: 'Stock ရှိပါတယ်', out_stock: 'ကုန်ပြီ',
    no_image: 'ပုံ မရှိသေးပါ',
    add_cart: 'Cart ထဲ ထည့်မယ်', added: 'ခြင်းတောင်းထဲ ထည့်ပြီးပါပြီ',
    loading: 'တင်နေပါတယ်…', empty: 'ပစ္စည်းမရှိသေးပါ', error_load: 'တင်မရပါ။ ပြန်ကြိုးစားကြည့်ပါ။', server_waking: 'ဆာဗာ နိုးနေပါတယ် — ခဏစောင့်ပါ…',
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
    woo_disconnect: 'WooCommerce ဖြုတ်မယ်', confirm_disconnect: 'WooCommerce ချိတ်ဆက်မှုကို ဖြုတ်မှာ သေချာလား? ပြီးရင် Preview/Import လုပ်လို့ မရတော့ဘူး။', disconnected: 'WooCommerce ဖြုတ်ပြီးပါပြီ',
    qty: 'အရေအတွက်', stock_qty: 'Stock အရေအတွက်', price: 'ဈေး', sale_price: 'လျှော့ဈေး',
    filter_all: 'အကုန်', filter_in_stock: 'Stock ရှိ', filter_out_stock: 'ကုန်ပြီ', filter_sale: 'လျှော့ဈေး',
    add_product: 'ပစ္စည်း အသစ် ထည့်မယ်', product_name: 'ပစ္စည်း နာမည်', new_brand: 'Brand အသစ်…', new_category: 'Category အသစ်…', category: 'Category', edit_product: 'ပစ္စည်း ပြင်မယ်', description: 'ဖော်ပြချက်',
    excel_export: 'Excel ထုတ်မယ်', excel_import: 'Excel သွင်းမယ်', excel_preview: 'Preview — ပြောင်းမယ့် အချက်တွေ', excel_apply: 'အပ်မယ်', excel_cancel: 'မလုပ်တော့ဘူး', excel_imported: 'Excel သွင်းပြီးပါပြီ', excel_no_changes: 'ပြောင်းစရာ မရှိပါ', excel_to_change: 'ပြောင်းမယ်', excel_skipped: 'ကျော်သွားတယ်', excel_reason_no_id: 'ID မရှိပါ', excel_reason_unknown_id: 'ID မသိပါ', excel_reason_invalid_price: 'ဈေး မမှန်ပါ', excel_reason_invalid_sale_price: 'လျှော့ဈေး မမှန်ပါ', excel_reason_invalid_stock: 'Stock မမှန်ပါ', excel_reason_option_price: 'Option ဈေး — app ထဲမှာ ပြင်ပါ', excel_reason_option_stock: 'Option stock — app ထဲမှာ ပြင်ပါ',
    add_option: 'Option ထည့်မယ်', option_label: 'Size / Shade', product_added: 'ပစ္စည်း အသစ် ထည့်ပြီးပြီ',
    duplicate_product: 'ဒီ နာမည်နဲ့ ပစ္စည်း ရှိပြီးသားပါ', action_product_create: 'ပစ္စည်း အသစ် ထည့်တယ်',
    sale_staff: 'Sale Staff', make_staff: 'Sale Staff လုပ်မယ်', remove_staff: 'Sale Staff ဖြုတ်မယ်', staff_title: 'Sale Staff',
    staff_hint: 'Sale Staff က order ပဲ ကြည့်ရ/ပြင်ရ တယ် — Catalog, Coupon, Users တွေ မမြင်ရပါ',
    action_staff_add: 'Sale Staff ထည့်တယ်', action_staff_remove: 'Sale Staff ဖြုတ်တယ်', action_order_create: 'Order တင်တယ်',
    view_history: 'History ကြည့်မယ်',
    is_new: 'အသစ်', sale_featured: 'Sale ★', best_seller: 'အရောင်းရဆုံး', brand: 'Brand',
    manage_no_access: 'Manage ကို Manager အကောင့်နဲ့သာ သုံးနိုင်ပါတယ်။',
    wc_warn: 'key ကို chat မှာ ဘယ်တော့မှ မပို့ပါနဲ့',
    wc_configured: 'WooCommerce ချိတ်ပြီးပါပြီ', wc_not_configured: 'WooCommerce မချိတ်ရသေးပါ',
    wc_test_ok: 'ချိတ်ဆက်မှု အောင်မြင်ပါတယ်', wc_test_fail: 'ချိတ်ဆက်မှု မအောင်မြင်ပါ',
    woo_preview_first: 'အရင် Preview နှိပ်ပါ', woo_browser_blocked: 'ဘရောင်ဇာက WooCommerce ကို ဆက်သွယ်လို့ မရပါ',
    new_key: 'အသစ် key (ပြောင်းချင်မှ ဖြည့်ပါ)', new_secret: 'အသစ် secret (ပြောင်းချင်မှ ဖြည့်ပါ)',
    site_url: 'Site URL', consumer_key: 'Consumer Key', consumer_secret: 'Consumer Secret',
    matched: 'ကိုက်ညီသော ပစ္စည်း', pos_only: 'POS မှာသာ ရှိသော ပစ္စည်း', wc_only: 'WooCommerce မှာသာ ရှိသော ပစ္စည်း',
    mig_title: 'ပုံတွေ ဆိုင်ထဲ ရွှေ့မယ်',
    mig_intro: 'အခု ပုံတွေက အဟောင်း website မှာ ရှိနေတယ် — အဟောင်း site ကျသွားရင် ပုံတွေ မပေါ်ဘူး။ ဒီမှာ ရွှေ့လိုက်ရင် ပုံတွေ ဆိုင်ကိုယ်ပိုင် ဖြစ်သွားမယ်။',
    mig_status: 'WP ပုံ', mig_moved: 'ရွှေ့ပြီး', mig_noimg: 'ပုံမရှိ',
    mig_check: 'စစ်မယ်', mig_check_ok: 'ရတယ် — browser ကနေ ပုံဆွဲလို့ရတယ်။ အောက်က "ရွှေ့မယ်" နှိပ်ပါ။',
    mig_check_fail: 'browser ကနေ တိုက်ရိုက်ဆွဲမရဘူး — အောက်က ZIP နည်းနဲ့ ရွှေ့ပါ။',
    mig_move: 'ရွှေ့မယ်', mig_stop: 'ရပ်မယ်', mig_moving: 'ရွှေ့နေတယ်…',
    mig_done: 'ပြီးပါပြီ', mig_failed: 'မရတဲ့ ပုံများ',
    mig_zip_title: 'ZIP နဲ့ ရွှေ့မယ်',
    mig_zip_hint: 'WP admin ကနေ wp-content/uploads folder ကို ZIP နဲ့ ဒေါင်းပြီး ဒီမှာ တင်ပါ။',
    mig_zip_btn: 'ZIP တင်ပြီး ရွှေ့မယ်',
    mig_zip_done: 'ZIP ကနေ ရွှေ့ပြီးပါပြီ',
    mig_remove_title: 'WP ပုံတွေ အကုန် ဖြုတ်မယ်',
    mig_remove_hint: 'အဟောင်း website က ပုံတွေ (link တွေ) ကို ပစ္စည်းတွေကနေ အကုန် ဖြုတ်မယ်။ ပုံမရှိတဲ့ ပစ္စည်းတွေက "ပုံ မရှိသေးပါ" လို့ ပြမယ် — ဝန်ထမ်းတွေ ဘယ်ဟာ ပြန်ထည့်ရမလဲ သိရမယ်။ shop ထဲမှာ သိမ်းပြီးသား ပုံတွေကို မထိဘူး။',
    mig_remove_btn: 'WP ပုံတွေ အကုန် ဖြုတ်မယ်',
    confirm_remove_external: 'WP ပုံတွေ အကုန် ဖြုတ်မှာ သေချာလား? ပုံဖြုတ်လိုက်တဲ့ ပစ္စည်းတွေက "ပုံ မရှိသေးပါ" လို့ ပြမယ် — ဝန်ထမ်းတွေ ပြန်ထည့်မှ ပုံပြန်ပေါ်မယ်။',
    mig_removed: 'ဖြုတ်ပြီးပါပြီ',
    action_image_migrate: 'ပုံတွေ ဆိုင်ထဲ ရွှေ့တယ်',
    products: 'ပစ္စည်းများ', orders: 'အော်ဒါများ', sales: 'ရောင်းအား', customers: 'ဝယ်သူများ',
    rename_title: 'Brand / Category ပြင်မယ်', rename_new_name: 'နာမည် အသစ်', rename_btn: 'ပြင်မယ်', rename_done: 'ပြင်ပြီးပါပြီ',
    period_today: 'ဒီနေ့', period_week: 'ဒီအပတ်', period_month: 'ဒီလ', period_all: 'အားလုံး',
    avg_order: 'တစ်အော်ဒါ ပျမ်းမျှ', pending_orders: 'စောင့်နေတဲ့ အော်ဒါ',
    fill_all: 'အချက်အလက် အကုန် ဖြည့်ပါ', invalid_phone: 'ဖုန်း နံပါတ် မမှန်ပါ',
    coupon_code: 'Coupon code', coupon_type: 'အမျိုးအစား', coupon_value: 'တန်ဖိုး',
    percent: 'ရာခိုင်နှုန်း (%)', fixed: 'သတ်မှတ် ငွေ (Ks)',
    no_coupons: 'Coupon မရှိသေးပါ', account_name: 'အကောင့်နာမည်', account_number: 'အကောင့်နံပါတ်',
    note: 'မှတ်ချက်', play_store: 'Play Store လင့်', app_store: 'App Store လင့်',
    delivery_fee: 'ပို့ခ', pay_on_delivery: 'ပစ္စည်းရောက်မှ ပေးပါ',
    status: 'အခြေအနေ', date: 'ရက်စွဲ', items: 'ပစ္စည်းများ',
    status_pending: 'စောင့်ဆိုင်းနေတယ်', status_confirmed: 'အတည်ပြုပြီး', status_delivering: 'ပို့နေတယ်', status_delivered: 'ပို့ပြီးပြီ', status_cancelled: 'ပယ်ဖျက်ပြီး',
    search_orders: 'အော်ဒါ နံပါတ် / POS voucher / နာမည် / ဖုန်း ရှာမယ်…', search_users: 'နာမည် / ဖုန်း ရှာမယ်…',
    pos_voucher: 'POS voucher နံပါတ်', pos_voucher_hint: 'POS က ဖြတ်ထားတဲ့ voucher နံပါတ်', pos_voucher_missing: 'POS မဖြတ်ရသေးပါ', action_order_pos_voucher: 'POS voucher နံပါတ် ထည့်တယ်',
    all_statuses: 'Status အားလုံး', change_status: 'Status ပြောင်းမယ်', status_changed: 'Status ပြောင်းပြီးပါပြီ',
    screenshot: 'ငွေလွှဲ Screenshot', no_screenshot: 'Screenshot မရှိပါ',
    new_password: 'Password အသစ်', set_password: 'Password ချိန်းမယ်', password_changed: 'Password အသစ် ချိန်းပြီးပါပြီ — customer ကို အသစ်ကို ပြောပေးပါ',
    manager: 'Manager', owner: 'Owner', make_manager: 'Manager ပေးမယ်', remove_manager: 'Manager ဖြုတ်မယ်',
    managers_title: 'Manager များ', add_manager_ph: 'ဖုန်းနံပါတ် ထည့်ပါ (အရင် register လုပ်ထားရမယ်)',
    user_not_found: 'ဒီဖုန်းနဲ့ အကောင့် မရှိသေးပါ — အရင် register လုပ်ခိုင်းပါ',
    owner_only: 'Owner (095117366) ပဲ လုပ်နိုင်ပါတယ်', no_users: 'User မရှိသေးပါ',
    pw_reset_hint: 'ချိန်းပြီးရင် customer ကို Messenger / ဖုန်း နဲ့ password အသစ်ကို ပြောပေးပါ — customer က အသစ်နဲ့ ပြန်ဝင်ရမယ်',
    activity: 'လုပ်ဆောင်ချက် မှတ်တမ်း', search_activity: 'ရှာမယ် (voucher နံပါတ် / လူ / ပစ္စည်း)…', all_actions: 'လုပ်ဆောင်ချက် အားလုံး', no_activity: 'မှတ်တမ်း မရှိသေးပါ',
    action_order_status: 'Order status ပြောင်းတယ်', action_password_reset: 'Password ချိန်းပေးတယ်', action_manager_add: 'Manager ထည့်တယ်', action_manager_remove: 'Manager ဖြုတ်တယ်', action_product_update: 'ပစ္စည်း ပြင်တယ်', action_product_photo_add: 'ပစ္စည်း ပုံ ထည့်တယ်', action_product_photo_remove: 'ပစ္စည်း ပုံ ဖျက်တယ်', action_coupon_create: 'Coupon လုပ်တယ်', action_coupon_delete: 'Coupon ဖျက်တယ်', action_payments_update: 'Payment အကောင့် ပြင်တယ်', action_app_links_update: 'App link ပြင်တယ်', action_woocommerce_settings: 'WooCommerce setting ပြင်တယ်', action_woocommerce_import: 'WooCommerce ပုံ တင်တယ်', action_order_edit: 'Order ပစ္စည်း ပြင်တယ်', action_hero_banner_update: 'Hero banner ပုံ ပြောင်းတယ်',
    edit_items: 'ပစ္စည်း ပြင်မယ်', save_changes: 'သိမ်းမယ်', cancel: 'မလုပ်တော့ဘူး', no_items: 'ပစ္စည်း မရှိသေးပါ', order_locked: 'ပို့ပြီးသား / ပယ်ဖျက်ထားတဲ့ order ကို ပြင်လို့မရပါ', total_changed: 'Total ပြောင်းသွားတယ်', total_diff_hint: 'customer လွှဲထားတဲ့ ငွေ ကွာရင် Messenger နဲ့ ပြောပေးပါ',
    coupon: 'Coupon', apply: 'သုံးမယ်', remove_coupon: 'Coupon ဖြုတ်မယ်', coupon_invalid: 'Coupon မမှန်ပါ', action_order_coupon: 'Order coupon ပြင်တယ်',
    manager_hint: 'ဝန်ထမ်းက ဆိုင်မှာ အရင် register လုပ်ထားရမယ် (နာမည် + ဖုန်း) — ပြီးမှ ဒီမှာ ဖုန်းနံပါတ် ရိုက်ပြီး Add လုပ်ပါ',
    add_photo: 'ပုံထည့်မယ်', change_photo: 'ပုံပြောင်းမယ်', remove_photo: 'ပုံဖျက်မယ်',
    coupon_scope: 'Coupon သက်ရောက်မယ့် အရာ (မရွေးရင် ပစ္စည်းအားလုံးအတွက်)',
    scope_brands: 'Brand များ', scope_products: 'ပစ္စည်းများ', scope_customers: 'Customer များ (ဖုန်း)',
    scope_customers_hint: 'ဖုန်းနံပါတ် ရိုက်ပြီး Add လုပ်ပါ — မထည့်ရင် customer အားလုံးအတွက်',
    coupon_for_brands: 'ဒီ brand တွေအတွက်သာ', coupon_for_products: 'ဒီ ပစ္စည်းတွေအတွက်သာ',
    coupon_for_customers: 'သတ်မှတ်ထားတဲ့ customer တွေအတွက်သာ', coupon_for_all: 'ပစ္စည်းအားလုံးအတွက်',
    coupon_not_for_customer: 'ဒီ coupon က သတ်မှတ်ထားတဲ့ customer တွေအတွက်ပဲ သုံးလို့ရပါတယ်', coupon_not_yet_valid: 'ဒီ coupon က မစသေးပါ', coupon_expired: 'ဒီ coupon သက်တမ်းကုန်သွားပါပြီ',
    coupon_validity: 'သက်တမ်း', coupon_valid_from: 'စတင်မယ့် ရက်', coupon_valid_until: 'ပြီးဆုံးမယ့် ရက်', coupon_validity_hint: 'မဖြည့်ရင် ကန့်သတ်ချက် မရှိဘူး — ရက်က ရန်ကုန် အချိန်နဲ့', coupon_upcoming: 'မစသေးပါ', coupon_expired_tag: 'သက်တမ်းကုန်ပြီ', coupon_active_tag: 'အလုပ်လုပ်နေတယ်', coupon_inactive_tag: 'ပိတ်ထားတယ်', coupon_no_limit: 'ကန့်သတ်ချက် မရှိ', coupon_until: 'ထိ အကျိုးဝင်တယ်',
    coupon_usage_limit: 'လူ limit (ယောက်)', coupon_usage_limit_hint: 'မဖြည့်ရင် ကန့်သတ်ချက် မရှိ', coupon_new_customer_only: 'Customer အသစ်တွေအတွက်ပဲ', coupon_limit_reached: 'ဒီ coupon limit ပြည့်သွားပါပြီ', coupon_not_new_customer: 'ဒီ coupon က customer အသစ်တွေအတွက်ပဲ သုံးလို့ရပါတယ်', coupon_phone_required: 'ဖုန်း နံပါတ် ထည့်ပြီးမှ ဒီ coupon သုံးလို့ရပါတယ်', coupon_limit_prefix: 'လူ', coupon_limit_suffix: 'ယောက်ပဲ သုံးလို့ရတယ်', coupon_new_only_tag: 'Customer အသစ်တွေအတွက်ပဲ', coupon_used_label: 'သုံးထားတာ', coupon_vouchers: 'စောင်', coupon_discount_given: 'လျှော့ပေးပြီးသား', coupon_edit: 'ပြင်မယ်', action_coupon_update: 'Coupon ပြင်တယ်',
    coupon_product_qty: 'Qty limit', coupon_product_qty_hint: 'ပစ္စည်း တစ်ခု ချင်းစီ ဘေးက box မှာ အရေအတွက် ထည့်လို့ရတယ် — မဖြည့်ရင် ကန့်သတ်ချက် မရှိ', coupon_qty_cap_suffix: 'ခုထိပဲ', coupon_qty_sold: 'ခု ရောင်းပြီးသား',
    coupon_stackable: 'Sale ပစ္စည်းနဲ့ ထပ်သုံးလို့ရတယ်', coupon_stackable_hint: 'ပိတ်ထားရင် sale ဈေး ရှိနေတဲ့ ပစ္စည်းတွေကို coupon လျှော့မပေးဘူး', coupon_not_stackable: 'Sale ပစ္စည်းတွေ မပါဘူး',
    vip: 'VIP', vip_member: 'VIP Member', vip_card: 'VIP Card', vip_valid_until: 'သက်တမ်း', vip_expired: 'သက်တမ်း ကုန်သွားပါပြီ', vip_expiring_soon: 'သက်တမ်း ကုန်တော့မယ် — 200,000 ဖိုး ဝယ်ရင် သက်တမ်း တိုးမယ်', vip_discount: 'VIP လျှော့ဈေး', vip_birthday: 'မွေးနေ့', vip_birthday_month: 'မွေးနေ့လ အပို လျှော့ဈေး', vip_grant: 'VIP ပေးမယ်', vip_revoke: 'VIP ဖြုတ်မယ်', vip_extend: 'သက်တမ်း +၁ နှစ် တိုးမယ်', vip_settings: 'VIP Settings', vip_lifetime: 'စုစုပေါင်း ဝယ်ထားတာ', vip_grant_threshold: 'VIP ဖြစ်ဖို့ amount', vip_renewal_threshold: 'သက်တမ်း တိုးဖို့ amount', vip_validity_months: 'သက်တမ်း (လ)', vip_birthday_extra: 'မွေးနေ့ အပို %', vip_enabled: 'VIP အစီအစဉ် ဖွင့်ထားတယ်', vip_days_left: 'ရက် ကျန်တယ်', vip_granted: 'VIP ပေးလိုက်ပါပြီ', vip_extended: 'သက်တမ်း တိုးလိုက်ပါပြီ', vip_not_vip: 'VIP မဟုတ်ပါ', vip_tier_hint: 'Tier 1 က အမြဲ 0 Ks ကစတယ် — amount ကြီးလာတိုင်း % များလာရမယ်', action_vip_grant: 'VIP ပေးတယ်', action_vip_revoke: 'VIP ဖြုတ်တယ်', action_vip_extend: 'VIP သက်တမ်း တိုးတယ်', action_vip_settings_update: 'VIP settings ပြင်တယ်',
    sku: 'SKU / Barcode', scan: 'Scan', scan_title: 'Barcode စကင်ဖတ်မယ်', scan_hint: 'Barcode ကို ကင်မရာ ဘောင်ထဲ ထည့်ပြပါ', scan_failed: 'ဖတ်မရပါ — လက်နဲ့ ရိုက်ထည့်ပါ', duplicate_sku: 'ဒီ barcode ရှိပြီးသား ဖြစ်နေပါတယ်',
    coupon_no_eligible_items: 'ဒီ coupon က သတ်မှတ်ထားတဲ့ ပစ္စည်း / brand တွေအတွက်ပဲ သုံးလို့ရပါတယ် — cart ထဲမှာ အဲဒါတွေ မရှိသေးပါ',
    search_products_ph: 'ပစ္စည်း ရှာပါ…', no_products_found: 'ပစ္စည်း မတွေ့ပါ',
    shop_phone: 'ဖုန်း', shop_hours: 'ဖွင့်ချိန် — နေ့စဉ် မနက် ၉ နာရီ မှ ညနေ ၆ နာရီ',
    continue_shopping: 'ဆက်ပြီး ဈေးဝယ်မယ်', back_home: 'Home ပြန်မယ်',
    select_option: 'Option ရွေးပါ', search_products: 'ပစ္စည်း ရှာမယ်…',
    results: 'ခု တွေ့ပါတယ်', code: 'ကုဒ်',
    notif_title: 'အသိပေးချက်များ', notif_empty: 'အသိပေးချက် မရှိသေးပါ', notif_mark_all: 'အကုန် ဖတ်ပြီးပြီ လို့ မှတ်မယ်',
    devices_title: 'Device များ', devices_none: 'Device မရှိသေးပါ — staff တွေ app ကနေ အရင် login ဝင်ဖို့ လိုပါတယ်',
    devices_test: 'Test push ပို့မယ်', devices_testing: 'ပို့နေပါတယ်…',
    devices_test_ok: 'Test push ပို့ပြီးပါပြီ', devices_test_fail: 'Test push ပို့မရပါ',
    devices_status: 'Push အခြေအနေ',
    devices_status_ok: 'Push ချိတ်ပြီးပါပြီ', devices_status_unknown: 'မစစ်ရသေးပါ — Test push နှိပ်ပြီး စစ်ပါ',
    devices_reason_not_configured: 'Push မချိတ်ရသေးပါ — service-account key မရှိပါ (Render env FIREBASE_SERVICE_ACCOUNT)',
    devices_reason_invalid_config: 'Push key မမှန်ပါ — Render env ထဲက service-account JSON စစ်ပါ',
    devices_reason_no_tokens: 'Staff device မရှိသေးပါ',
    devices_reason_send_failed: 'Push ပို့မရပါ',
    devices_staff: 'Staff', devices_last_seen: 'နောက်ဆုံး တွေ့တာ',
    push_banner_close: 'ပိတ်မယ်',
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
    forgot_step1_title: 'Reset your password',
    forgot_step1_hint: 'Enter the phone and name on your account',
    forgot_continue: 'Continue',
    forgot_no_match: 'Phone and name do not match — contact the shop to reset your password.',
    forgot_call_shop: 'Call the shop',
    forgot_send_link: 'Send reset link',
    forgot_send_to: 'We will send the link to this email:',
    forgot_enter_email: 'Enter an email to receive the reset link',
    forgot_sent: 'Reset link sent — check your inbox (and spam). The link expires in 1 hour.',
    forgot_mail_off: 'Email sending is not set up yet — contact the shop via Messenger or phone.',
    forgot_back: 'Back to login',
    email_optional: 'Email (optional)',
    email_saved: 'Email saved',
    invalid_email: 'Invalid email',
    email_registered: 'This email is already used by another account',
    phone_registered: 'An account with this phone number already exists',
    too_many_attempts: 'Too many attempts — try again later',
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
    hero_banner: 'Hero banner image', hero_banner_hint: 'Image shown in the top box on Home — use it for promotions. Without an image, the text shows instead.', hero_upload: 'Upload image', hero_change: 'Change image', hero_remove: 'Remove image', hero_no_image: 'No image yet', hero_saved: 'Saved',
    best: 'Best Sellers', sale: 'Sale', new: 'New Arrivals', all: 'All Products',
    view_all: 'View all', more: 'Show more',
    in_stock: 'In Stock', out_stock: 'Sold Out',
    no_image: 'No photo yet',
    add_cart: 'Add to Cart', added: 'Added to cart',
    loading: 'Loading…', empty: 'No products yet', error_load: 'Could not load. Please try again.', server_waking: 'Waking up the server — please wait…',
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
    woo_disconnect: 'Disconnect WooCommerce', confirm_disconnect: 'Disconnect WooCommerce? Preview/Import will no longer work after this.', disconnected: 'WooCommerce disconnected',
    qty: 'Quantity', stock_qty: 'Stock qty', price: 'Price', sale_price: 'Sale price',
    filter_all: 'All', filter_in_stock: 'In Stock', filter_out_stock: 'Sold Out', filter_sale: 'On Sale',
    add_product: 'Add Product', product_name: 'Product name', new_brand: 'New brand…', new_category: 'New category…', category: 'Category', edit_product: 'Edit product', description: 'Description',
    excel_export: 'Export Excel', excel_import: 'Import Excel', excel_preview: 'Preview — changes to apply', excel_apply: 'Apply', excel_cancel: 'Cancel', excel_imported: 'Excel import done', excel_no_changes: 'Nothing to change', excel_to_change: 'To change', excel_skipped: 'Skipped', excel_reason_no_id: 'No ID', excel_reason_unknown_id: 'Unknown ID', excel_reason_invalid_price: 'Invalid price', excel_reason_invalid_sale_price: 'Invalid sale price', excel_reason_invalid_stock: 'Invalid stock', excel_reason_option_price: 'Option price — change in the app', excel_reason_option_stock: 'Option stock — change in the app',
    add_option: 'Add option', option_label: 'Size / Shade', product_added: 'Product added',
    duplicate_product: 'A product with this name already exists', action_product_create: 'Added a product',
    sale_staff: 'Sale Staff', make_staff: 'Make sale staff', remove_staff: 'Remove sale staff', staff_title: 'Sale Staff',
    staff_hint: 'Sale staff can only view and edit orders — no Catalog, Coupons or Users',
    action_staff_add: 'Added sale staff', action_staff_remove: 'Removed sale staff', action_order_create: 'Placed an order',
    view_history: 'View history',
    is_new: 'New', sale_featured: 'Sale ★', best_seller: 'Best seller', brand: 'Brand',
    manage_no_access: 'Manage is only available to the manager account.',
    wc_warn: 'Never send your key in chat',
    wc_configured: 'WooCommerce connected', wc_not_configured: 'WooCommerce not connected yet',
    wc_test_ok: 'Connection successful', wc_test_fail: 'Connection failed',
    woo_preview_first: 'Run Preview first', woo_browser_blocked: 'Browser could not reach WooCommerce',
    new_key: 'New key (only if changing)', new_secret: 'New secret (only if changing)',
    site_url: 'Site URL', consumer_key: 'Consumer Key', consumer_secret: 'Consumer Secret',
    matched: 'Matched products', pos_only: 'POS-only products', wc_only: 'WooCommerce-only products',
    mig_title: 'Move photos into the shop',
    mig_intro: 'Photos still live on the old website — if the old site goes down, the photos break. Move them here and they belong to the shop.',
    mig_status: 'WP photos', mig_moved: 'Moved', mig_noimg: 'No photo',
    mig_check: 'Check', mig_check_ok: 'Works — this browser can fetch the photos. Tap "Move" below.',
    mig_check_fail: 'This browser cannot fetch them directly — use the ZIP method below.',
    mig_move: 'Move', mig_stop: 'Stop', mig_moving: 'Moving…',
    mig_done: 'Done', mig_failed: 'Photos that failed',
    mig_zip_title: 'Move with a ZIP',
    mig_zip_hint: 'Download the wp-content/uploads folder as a ZIP from WP admin and upload it here.',
    mig_zip_btn: 'Upload ZIP and move',
    mig_zip_done: 'Moved from ZIP',
    mig_remove_title: 'Remove all WP photos',
    mig_remove_hint: 'Remove the old-website photo links from all products. Products without a photo will show "No photo yet" — so staff can see which ones still need a photo. Photos already stored in the shop are left untouched.',
    mig_remove_btn: 'Remove all WP photos',
    confirm_remove_external: 'Remove all WP photos? Those products will show "No photo yet" until staff re-add their photos.',
    mig_removed: 'Removed',
    action_image_migrate: 'Moved photos into the shop',
    products: 'Products', orders: 'Orders', sales: 'Sales', customers: 'Customers',
    rename_title: 'Rename brand / category', rename_new_name: 'New name', rename_btn: 'Rename', rename_done: 'Renamed',
    period_today: 'Today', period_week: 'This week', period_month: 'This month', period_all: 'All',
    avg_order: 'Avg per order', pending_orders: 'Pending orders',
    fill_all: 'Please fill in all fields', invalid_phone: 'Invalid phone number',
    coupon_code: 'Coupon code', coupon_type: 'Type', coupon_value: 'Value',
    percent: 'Percent (%)', fixed: 'Fixed amount (Ks)',
    no_coupons: 'No coupons yet', account_name: 'Account name', account_number: 'Account number',
    note: 'Note', play_store: 'Play Store link', app_store: 'App Store link',
    delivery_fee: 'Delivery fee', pay_on_delivery: 'Pay on delivery',
    status: 'Status', date: 'Date', items: 'Items',
    status_pending: 'Pending', status_confirmed: 'Confirmed', status_delivering: 'Delivering', status_delivered: 'Delivered', status_cancelled: 'Cancelled',
    search_orders: 'Search order no. / POS voucher / name / phone…', search_users: 'Search name / phone…',
    pos_voucher: 'POS voucher no.', pos_voucher_hint: 'Voucher no. from the POS', pos_voucher_missing: 'POS not yet', action_order_pos_voucher: 'Set the POS voucher no.',
    all_statuses: 'All statuses', change_status: 'Change status', status_changed: 'Status updated',
    screenshot: 'Payment screenshot', no_screenshot: 'No screenshot',
    new_password: 'New password', set_password: 'Set password', password_changed: 'Password changed — tell the customer the new one',
    manager: 'Manager', owner: 'Owner', make_manager: 'Make manager', remove_manager: 'Remove manager',
    managers_title: 'Managers', add_manager_ph: 'Enter phone number (must be registered first)',
    user_not_found: 'No account with this phone — ask them to register first',
    owner_only: 'Only the owner (095117366) can do this', no_users: 'No users yet',
    pw_reset_hint: 'After changing, tell the customer the new password by Messenger / phone — they will sign in again with it',
    activity: 'Activity log', search_activity: 'Search (voucher no. / person / product)…', all_actions: 'All actions', no_activity: 'No activity yet',
    action_order_status: 'Changed order status', action_password_reset: 'Reset a password', action_manager_add: 'Added a manager', action_manager_remove: 'Removed a manager', action_product_update: 'Edited a product', action_product_photo_add: 'Added a product photo', action_product_photo_remove: 'Removed a product photo', action_coupon_create: 'Created a coupon', action_coupon_delete: 'Deleted a coupon', action_payments_update: 'Edited payment accounts', action_app_links_update: 'Edited app links', action_woocommerce_settings: 'Edited WooCommerce settings', action_woocommerce_import: 'Imported WooCommerce photos', action_order_edit: 'Edited order items', action_hero_banner_update: 'Changed the hero banner',
    edit_items: 'Edit items', save_changes: 'Save changes', cancel: 'Cancel', no_items: 'No items yet', order_locked: 'A delivered or cancelled order cannot be edited', total_changed: 'Total changed', total_diff_hint: 'If the customer already transferred, tell them the difference by Messenger',
    coupon: 'Coupon', apply: 'Apply', remove_coupon: 'Remove coupon', coupon_invalid: 'Invalid coupon', action_order_coupon: 'Edited order coupon',
    manager_hint: 'Staff must register in the shop first (name + phone) — then type their phone here and tap Add',
    add_photo: 'Add photo', change_photo: 'Change photo', remove_photo: 'Remove photo',
    coupon_scope: 'What this coupon applies to (leave empty = all products)',
    scope_brands: 'Brands', scope_products: 'Products', scope_customers: 'Customers (phone)',
    scope_customers_hint: 'Type a phone number and tap Add — leave empty for all customers',
    coupon_for_brands: 'For these brands only', coupon_for_products: 'For these products only',
    coupon_for_customers: 'For selected customers only', coupon_for_all: 'For all products',
    coupon_not_for_customer: 'This coupon is only for selected customers', coupon_not_yet_valid: 'This coupon is not valid yet', coupon_expired: 'This coupon has expired',
    coupon_validity: 'Validity period', coupon_valid_from: 'Valid from', coupon_valid_until: 'Valid until', coupon_validity_hint: 'Leave blank for no limit — dates are Yangon time', coupon_upcoming: 'Upcoming', coupon_expired_tag: 'Expired', coupon_active_tag: 'Active', coupon_inactive_tag: 'Disabled', coupon_no_limit: 'No limit', coupon_until: 'valid until',
    coupon_usage_limit: 'People limit', coupon_usage_limit_hint: 'Leave blank for no limit', coupon_new_customer_only: 'New customers only', coupon_limit_reached: 'This coupon has reached its usage limit', coupon_not_new_customer: 'This coupon is only for new customers', coupon_phone_required: 'Enter your phone number to use this coupon', coupon_limit_prefix: 'First', coupon_limit_suffix: 'people only', coupon_new_only_tag: 'New customers only', coupon_used_label: 'Used', coupon_vouchers: 'vouchers', coupon_discount_given: 'Discount given', coupon_edit: 'Edit', action_coupon_update: 'Updated a coupon',
    coupon_product_qty: 'Qty limit', coupon_product_qty_hint: 'Set a qty per product in the box beside it — leave blank for no limit', coupon_qty_cap_suffix: 'units max', coupon_qty_sold: 'sold',
    coupon_stackable: 'Stacks with sale items', coupon_stackable_hint: 'When off, items already on sale get no coupon discount', coupon_not_stackable: 'Sale items excluded',
    vip: 'VIP', vip_member: 'VIP Member', vip_card: 'VIP Card', vip_valid_until: 'Valid until', vip_expired: 'Membership expired', vip_expiring_soon: 'Expiring soon — spend 200,000 Ks to renew', vip_discount: 'VIP discount', vip_birthday: 'Birthday', vip_birthday_month: 'Birthday month extra', vip_grant: 'Make VIP', vip_revoke: 'Remove VIP', vip_extend: 'Extend 1 year', vip_settings: 'VIP Settings', vip_lifetime: 'Lifetime total', vip_grant_threshold: 'VIP grant amount', vip_renewal_threshold: 'Renewal amount', vip_validity_months: 'Validity (months)', vip_birthday_extra: 'Birthday extra %', vip_enabled: 'VIP program enabled', vip_days_left: 'days left', vip_granted: 'VIP granted', vip_extended: 'Validity extended', vip_not_vip: 'Not VIP', vip_tier_hint: 'Tier 1 always starts at 0 Ks — % should grow with the amount', action_vip_grant: 'Granted VIP', action_vip_revoke: 'Revoked VIP', action_vip_extend: 'Extended VIP', action_vip_settings_update: 'Updated VIP settings',
    sku: 'SKU / Barcode', scan: 'Scan', scan_title: 'Scan barcode', scan_hint: 'Point the camera at the barcode', scan_failed: "Couldn't read it — type it in", duplicate_sku: 'This barcode is already used',
    coupon_no_eligible_items: 'This coupon only applies to selected products / brands — none are in your cart yet',
    search_products_ph: 'Search products…', no_products_found: 'No products found',
    shop_phone: 'Phone', shop_hours: 'Open daily 9 AM – 6 PM',
    continue_shopping: 'Continue shopping', back_home: 'Back to Home',
    select_option: 'Choose an option', search_products: 'Search products…',
    results: 'found', code: 'Code',
    notif_title: 'Notifications', notif_empty: 'No notifications yet', notif_mark_all: 'Mark all read',
    devices_title: 'Devices', devices_none: 'No devices yet — staff need to log in from the app first',
    devices_test: 'Send test push', devices_testing: 'Sending…',
    devices_test_ok: 'Test push sent', devices_test_fail: 'Test push failed',
    devices_status: 'Push status',
    devices_status_ok: 'Push is set up', devices_status_unknown: 'Not checked yet — send a test push',
    devices_reason_not_configured: 'Push is not set up — the service-account key is missing (Render env FIREBASE_SERVICE_ACCOUNT)',
    devices_reason_invalid_config: 'Push key is invalid — check the service-account JSON in Render env',
    devices_reason_no_tokens: 'No staff devices registered',
    devices_reason_send_failed: 'Push send failed',
    devices_staff: 'Staff', devices_last_seen: 'Last seen',
    push_banner_close: 'Dismiss',
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
  vipPreview: null,
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
// fix-batch-28: Render free tier sleeps after 15 min idle. The first request
// after sleep either gets a 502/503 from the proxy or hangs while the
// instance boots, so the old single-fetch api() failed with "Could not load"
// and Pyae had to tap twice. api() now retries transient failures itself:
// up to 4 attempts, 25s per attempt, backoff 3s/6s/10s. It retries network
// errors and 502/503/504 only — never 4xx (400/401/429 are real answers).
// POSTs are retried only when the failure proves the app never ran the
// handler (proxy 502/503/504, or a connection that failed fast); a POST that
// hung until the per-attempt timeout is NOT retried, so an order can never
// be placed twice by a retry. While retrying, a toast tells the user the
// server is waking up instead of showing an error.
const API_RETRY = { attempts: 4, timeoutMs: 25000, delays: [3000, 6000, 10000] };
async function api(path, opts) {
  const o = Object.assign({ headers: {} }, opts || {});
  o.headers['Content-Type'] = 'application/json';
  if (state.token) o.headers['Authorization'] = 'Bearer ' + state.token;
  const method = (o.method || 'GET').toUpperCase();
  const timeoutMs = o.timeoutMs || API_RETRY.timeoutMs;
  const delays = o.retryDelays || API_RETRY.delays;
  const maxAttempts = o.retryAttempts || API_RETRY.attempts;
  const fo = Object.assign({}, o);
  delete fo.timeoutMs; delete fo.retryDelays; delete fo.retryAttempts;
  let lastErr = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const started = Date.now();
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch('/api' + path, Object.assign({}, fo, { signal: ctrl.signal }));
      clearTimeout(timer);
      let data = null;
      try { data = await res.json(); } catch (e) { data = null; }
      if (!res.ok) {
        const err = new Error((data && data.error) || ('HTTP ' + res.status));
        err.status = res.status;
        err.data = data;
        if ((res.status === 502 || res.status === 503 || res.status === 504) && attempt < maxAttempts) {
          toast(t('server_waking'));
          await new Promise((r) => setTimeout(r, delays[attempt - 1] || 10000));
          continue;
        }
        throw err;
      }
      return data;
    } catch (e) {
      clearTimeout(timer);
      if (e.status) throw e; // real HTTP error (4xx, or 5xx after last attempt)
      // Network error / abort: retry unless this was a POST that may already
      // have reached the server, or attempts are exhausted. A timeout abort
      // means we waited the whole attempt with no response — the request may
      // have run — so POSTs never retry after an abort, however short the
      // timeout was. A fast connection failure (refused/reset before any
      // data could be sent) is safe to retry even for POSTs.
      const elapsed = Date.now() - started;
      const timedOut = e.name === 'AbortError';
      const fastFail = !timedOut && elapsed < 3000;
      const safeToRetry = method === 'GET' || fastFail;
      lastErr = e;
      if (!safeToRetry || attempt >= maxAttempts) throw e;
      toast(t('server_waking'));
      await new Promise((r) => setTimeout(r, delays[attempt - 1] || 10000));
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
// Client mirror of the server validity check (fix-batch-47/48/49): a coupon
// is usable only while active AND inside [valid_from, valid_until] AND under
// its usage limit (usage_count comes from the manage list) AND with at least
// one scoped product still having discounted units left.
function couponIsUsableClient(c) {
  if (!c || c.active === false) return false;
  const now = Date.now();
  if (c.valid_from && new Date(c.valid_from).getTime() > now) return false;
  if (c.valid_until && new Date(c.valid_until).getTime() < now) return false;
  if (c.usage_limit != null && (c.usage_count || 0) >= c.usage_limit) return false;
  if (c.product_qtys && Object.keys(c.product_qtys).length && Array.isArray(c.products) && c.products.length) {
    const anyLeft = c.products.some((id) => c.product_qtys[id] == null || couponProductRemainingClient(c, id) > 0);
    if (!anyLeft) return false;
  }
  return true;
}
// Client mirror of the server qty-cap check (fix-batch-49): remaining
// discounted units for one product (null = no cap). product_usage comes
// from the manage list.
function couponProductRemainingClient(c, productId) {
  if (!c || !c.product_qtys || c.product_qtys[productId] == null) return null;
  const used = (c.product_usage && c.product_usage[productId]) || 0;
  return Math.max(0, c.product_qtys[productId] - used);
}
// "• Name: 1/2 ခု ရောင်းပြီးသား" per capped product (Manage list).
function couponProductQtyText(c) {
  if (!c || !c.product_qtys || !Object.keys(c.product_qtys).length) return '';
  const out = [];
  (c.products || []).forEach((id, i) => {
    if (c.product_qtys[id] == null) return;
    const name = (c.product_names && c.product_names[i]) || id;
    const used = (c.product_usage && c.product_usage[id]) || 0;
    out.push('• ' + name + ': ' + used + '/' + c.product_qtys[id] + ' ' + t('coupon_qty_sold'));
  });
  return out.join('  ');
}
// ISO instant -> datetime-local value in Yangon time (for the edit form).
function isoToYangonInput(iso) {
  if (!iso) return '';
  const d = new Date(new Date(iso).getTime() + 6.5 * 60 * 60 * 1000);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 16);
}
// Manage list usage line: "သုံးထားတာ 3/10 စောင် • လျှော့ပေးပြီးသား 45,000 Ks".
function couponUsageText(c) {
  const used = c.usage_count || 0;
  const lim = c.usage_limit != null ? '/' + c.usage_limit : '';
  return t('coupon_used_label') + ' ' + used + lim + ' ' + t('coupon_vouchers') + ' • ' + t('coupon_discount_given') + ' ' + fmt(c.total_discount || 0);
}
// Map a server coupon error to its message key (admin apply path).
function couponErrorKey(e) {
  const m = e && e.message;
  if (m === 'no_eligible_items') return 'coupon_no_eligible_items';
  if (m === 'order_locked') return 'order_locked';
  if (m === 'coupon_limit_reached') return 'coupon_limit_reached';
  if (m === 'coupon_not_new_customer') return 'coupon_not_new_customer';
  if (m === 'coupon_expired') return 'coupon_expired';
  if (m === 'coupon_not_yet_valid') return 'coupon_not_yet_valid';
  return 'coupon_invalid';
}
function couponValidityText(c) {
  if (!c.valid_from && !c.valid_until) return t('coupon_no_limit');
  const f = c.valid_from ? fmtDate(c.valid_from) : '—';
  const u = c.valid_until ? fmtDate(c.valid_until) : '—';
  return f + ' → ' + u;
}
function couponValidityTag(c) {
  if (c.active === false) return t('coupon_inactive_tag');
  if (c.valid_from && new Date(c.valid_from).getTime() > Date.now()) return t('coupon_upcoming');
  if (c.valid_until && new Date(c.valid_until).getTime() < Date.now()) return t('coupon_expired_tag');
  return t('coupon_active_tag');
}
// datetime-local gives Yangon wall time with no zone — treat it as Yangon
// time (+06:30) and convert to an ISO instant for the server.
function yangonInputToISO(v) {
  if (!v) return null;
  const d = new Date(String(v).trim() + ':00+06:30');
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
function cartTotal() { return Math.max(0, cartSubtotal() - couponDiscount() - vipDiscount()); }
// VIP discount (fix-batch-52): server-computed preview; a coupon always
// wins over VIP, so the VIP line is 0 while a coupon is applied.
function vipDiscount() {
  if (state.coupon) return 0;
  return (state.vipPreview && state.vipPreview.discount) || 0;
}
let vipPreviewTimer = null;
let vipPreviewSeq = 0;
function refreshVipPreview() {
  clearTimeout(vipPreviewTimer);
  vipPreviewTimer = setTimeout(doRefreshVipPreview, 350);
}
async function doRefreshVipPreview() {
  const seq = ++vipPreviewSeq;
  if (!state.user || state.coupon || !state.cart.length) { state.vipPreview = null; paintVipRow(); return; }
  try {
    const res = await api('/vip/preview', { method: 'POST', body: JSON.stringify({ items: state.cart.map((i) => ({ product_id: i.product_id, qty: i.qty, option_label: i.option_label || undefined })) }) });
    if (seq !== vipPreviewSeq) return;
    state.vipPreview = (res && res.valid) ? { discount: res.discount, pct: res.pct } : null;
  } catch (e) { if (seq === vipPreviewSeq) state.vipPreview = null; }
  paintVipRow();
}
function paintVipRow() {
  const row = $('#cartVipRow');
  if (!row) return;
  const d = vipDiscount();
  row.hidden = d <= 0;
  $('#cartVipDiscount').textContent = '−' + fmt(d);
  const lbl = $('#lblVipDiscount');
  if (lbl) lbl.textContent = t('vip_discount') + (state.vipPreview && state.vipPreview.pct ? ' ' + state.vipPreview.pct + '%' : '');
  const total = $('#cartTotal');
  if (total) total.textContent = fmt(cartTotal());
}
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
  const msgUrl = (info && info.messenger_url) || 'https://m.me/beautyandme117';
  $('#messengerLink').href = msgUrl;
  const fab = $('#msgFabLink');
  if (fab) fab.href = msgUrl;
}
function appLinkUrl(kind) {
  if (!state.shopInfo || !state.shopInfo.app_links) return '';
  return state.shopInfo.app_links[kind] || '';
}

// Open the Beauty & Me Page chat in the Messenger APP when it is installed.
// A plain m.me link opens messenger.com inside an in-app browser (Muse,
// Facebook, ...) instead of the app, because those webviews do not hand
// universal links to the app. The fb-messenger:// deep link IS handed to
// the app by the OS even from a webview.
// History: the first version set window.location.href to the deep link and
// fell back with window.location.href = m.me — on iOS the fallback fired
// while Safari was still visible and the SHOP TAB itself navigated to
// messenger.com. Fix-batch-45 tried a hidden iframe + blank tab, but iOS
// Safari never fires a custom scheme from a display:none iframe, and
// window.close() does nothing on iOS, so the user was left staring at a
// stuck about:blank tab. Fix-batch-45b went back to window.location.href
// = deepLink (proven to open the app) with a 2000ms new-tab fallback plus
// a "Could not open" banner when the popup blocker stopped it — the app
// opened directly, but the banner still appeared as a FALSE POSITIVE when
// the app switch took longer than 2s, and Pyae found it messy (2026-11-28
// 11:06). Fix-batch-45c (current): the banner is REMOVED — the fallback
// only ever opens a new tab, and the wait is 3500ms so a slow app switch
// (cold start) does not trigger it. If the popup blocker stops the
// fallback, nothing visible happens at all — the shop tab is never
// navigated away from, in any branch.
function openMessenger(ev) {
  if (ev) ev.preventDefault();
  const webUrl = (state.shopInfo && state.shopInfo.messenger_url) || 'https://m.me/beautyandme117';
  const deepLink = 'fb-messenger://user-thread/492402784161579';
  const capBrowser = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Browser;
  // Inside the Capacitor app the web fallback opens in the system browser
  // via the Browser plugin, so the app itself never navigates away.
  if (capBrowser && capBrowser.open) {
    window.location.href = deepLink;
    setTimeout(() => { if (!document.hidden) capBrowser.open({ url: webUrl }); }, 3500);
    return;
  }
  window.location.href = deepLink;
  setTimeout(() => {
    if (document.hidden) return; // app opened — nothing more to do
    try { window.open(webUrl, '_blank', 'noopener'); } catch (e) {}
  }, 3500);
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
// If a product photo fails to load (dead WooCommerce link, or the tablet
// cannot reach the old site right now), show the "no image" placeholder
// instead of the browser's broken-image icon. Called from inline onerror.
function imgFallback(el) {
  el.style.display = 'none';
  const wrap = el.parentElement;
  if (wrap && !wrap.querySelector('.img-placeholder')) {
    const s = document.createElement('span');
    s.className = 'img-placeholder';
    s.textContent = t('no_image');
    wrap.appendChild(s);
  }
}
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
    ? '<img src="' + esc(p.image_url) + '" alt="' + esc(p.name) + '" loading="lazy" onerror="imgFallback(this)">'
    : '<span class="img-placeholder">' + esc(t('no_image')) + '</span>';
  const priceHTML = hasOpts
    ? '<span class="price-now">' + fmt(optionPrice(selOpt)) + '</span>'
    : (hasSale
      ? '<span class="was">' + fmt(p.price) + '</span><span class="price-now">' + fmt(p.sale_price) + '</span>'
      : '<span class="price-now">' + fmt(price) + '</span>');
  const wished = isWished(p.id);
  return '<article class="card' + (p.in_stock ? '' : ' soldout') + '">' +
    '<div class="card-img-wrap"><button type="button" class="card-img" data-open="' + esc(String(p.id)) + '" aria-label="' + esc(p.name) + '">' + img + '</button>' +
    (hasSale ? '<span class="sale-badge">−' + salePct + '%</span>' : '') +
    '<button type="button" class="wish-btn' + (wished ? ' active' : '') + '" data-wish="' + esc(String(p.id)) + '" aria-label="' + esc(t(wished ? 'wish_remove' : 'wish_add')) + '">' + (wished ? '♥' : '♡') + '</button></div>' +
    '<div class="card-body">' +
    '<span class="card-brand">' + esc(p.brand || '') + '</span>' +
    '<button type="button" class="card-name" data-open="' + esc(String(p.id)) + '" style="background:none;border:none;padding:0;text-align:left;font:inherit;color:inherit"><span>' + esc(p.name) + '</span></button>' +
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
    if (pe) pe.innerHTML = '<span class="price-now">' + fmt(price) + '</span>';
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
    hideSplash();
  } catch (e) {
    if (reset) grid.innerHTML = '<div class="error-box">' + esc(t('error_load')) + '</div>';
    hideSplash();
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
  loadHero();
  loadSection('best', '#rowBest', null);
  loadSection('sale', '#rowSale', '#saleSectionHead');
  loadHomeGrid(true);
}

// Home hero banner (fix-batch-44): one promo image in the top box, set from
// Manage → Banner. Without an image the text hero shows. Tapping the image
// scrolls to the Sale section (or Best Sellers when there is no sale).
let heroWired = false;
async function loadHero() {
  const box = $('#heroBox');
  const img = $('#heroImg');
  const text = $('#heroText');
  if (!box || !img || !text) return;
  if (!heroWired) {
    heroWired = true;
    box.addEventListener('click', () => {
      if (img.hidden) return;
      const target = !$('#saleSectionHead').hidden ? $('#saleSectionHead') : $('#homeSections');
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  }
  try {
    const data = await api('/hero');
    if (data && data.image_url) {
      img.src = data.image_url;
      img.hidden = false;
      text.hidden = true;
      box.classList.add('has-img');
    } else {
      img.hidden = true;
      text.hidden = false;
      box.classList.remove('has-img');
    }
  } catch (e) {
    img.hidden = true;
    text.hidden = false;
    box.classList.remove('has-img');
  }
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
    ? '<img src="' + esc(p.image_url) + '" alt="' + esc(p.name) + '" onerror="imgFallback(this)">'
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
        ? '<img src="' + esc(i.image_url) + '" alt="" onerror="this.style.display=\'none\'">'
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
  paintVipRow();
  refreshVipPreview();
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
    else if (res.reason === 'not_yet_valid') fail('coupon_not_yet_valid');
    else if (res.reason === 'expired') fail('coupon_expired');
    else if (res.reason === 'limit_reached') fail('coupon_limit_reached');
    else if (res.reason === 'not_new_customer') fail('coupon_not_new_customer');
    else if (res.reason === 'phone_required') fail('coupon_phone_required');
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
    const phone = (state.user && state.user.phone) || '';
    const list = await api('/coupons' + (phone ? '?phone=' + encodeURIComponent(phone) : ''));
    if (!list.length) { body.innerHTML = '<div class="empty">' + esc(t('no_coupons_active')) + '</div>'; return; }
    body.innerHTML = list.map((c) => {
      const val = c.type === 'fixed'
        ? fmt(c.value).replace(' Ks', '') + ' ' + t('amount_off')
        : c.value + t('percent_off');
      const scope = couponScopeText(c);
      const untilLine = c.valid_until ? '<div class="pa-name" style="font-size:12px;color:var(--muted)">' + esc(fmtDate(c.valid_until)) + ' ' + esc(t('coupon_until')) + '</div>' : '';
      const limitLine = c.usage_limit != null ? '<div class="pa-name" style="font-size:12px;color:var(--muted)">' + esc(t('coupon_limit_prefix')) + ' ' + esc(String(c.usage_limit)) + ' ' + esc(t('coupon_limit_suffix')) + '</div>' : '';
      const newLine = c.new_customer_only ? '<div class="pa-name" style="font-size:12px;color:var(--muted)">' + esc(t('coupon_new_only_tag')) + '</div>' : '';
      const stackLine = c.stackable === false ? '<div class="pa-name" style="font-size:12px;color:var(--muted)">' + esc(t('coupon_not_stackable')) + '</div>' : '';
      const qtyLines = (c.product_qtys && c.products) ? c.products.filter((id) => c.product_qtys[id] != null).map((id) => {
        const name = (c.product_names && c.product_names[c.products.indexOf(id)]) || id;
        return '<div class="pa-name" style="font-size:12px;color:var(--muted)">• ' + esc(name) + ': ' + esc(String(c.product_qtys[id])) + ' ' + esc(t('coupon_qty_cap_suffix')) + '</div>';
      }).join('') : '';
      return '<div class="pay-account"><div class="pa-info"><div class="pa-method">' + esc(c.code) + '</div>' +
        '<div class="pa-name">' + esc(val) + '</div><div class="pa-name" style="font-size:12px;color:var(--muted)">' + esc(scope) + '</div>' + untilLine + limitLine + newLine + stackLine + qtyLines + '</div>' +
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
    (vipDiscount() > 0 ? '<div class="order-summary-line"><span>' + esc(t('vip_discount')) + (state.vipPreview && state.vipPreview.pct ? ' ' + state.vipPreview.pct + '%' : '') + '</span><span>−' + fmt(vipDiscount()) + '</span></div>' : '') +
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
  hideForgotPanel();
  setAuthTab('login');
  $('#authError').hidden = true;
  openOverlay('#authOverlay', '#authModal');
}
function closeAuth() { closeOverlay('#authOverlay', '#authModal'); }
function setAuthTab(mode) {
  authMode = mode;
  $$('#authTabs .tab').forEach((b) => b.classList.toggle('active', b.dataset.atab === mode));
  $('#authNameRow').hidden = mode !== 'register';
  $('#authEmailRow').hidden = mode !== 'register';
  $('#authForgotRow').hidden = mode !== 'login';
  $('#authTitle').textContent = mode === 'register' ? t('register') : t('login');
  $('#authSubmit').textContent = mode === 'register' ? t('register') : t('login');
}
async function submitAuth() {
  const err = $('#authError');
  err.hidden = true;
  const phone = $('#authPhone').value.trim();
  const password = $('#authPass').value;
  const name = $('#authName').value.trim();
  const email = ($('#authEmail').value || '').trim();
  if (!phone || !password || (authMode === 'register' && !name)) {
    err.textContent = t('fill_all'); err.hidden = false; return;
  }
  if (authMode === 'register' && email && email.indexOf('@') === -1) {
    err.textContent = t('invalid_email'); err.hidden = false; return;
  }
  const btn = $('#authSubmit');
  btn.disabled = true;
  try {
    const path = authMode === 'register' ? '/auth/register' : '/auth/login';
    const body = authMode === 'register'
      ? { name: name, phone: phone, password: password, email: email || null }
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
    registerPushToken();
    loadNotifications();
    startNotifPolling();
    toast(t('login') + ' ✓');
  } catch (e) {
    const code = e.data && e.data.error;
    if (authMode === 'register' && code === 'email_registered') err.textContent = t('email_registered');
    else if (authMode === 'register' && code === 'invalid_email') err.textContent = t('invalid_email');
    else if (authMode === 'register' && code === 'phone_registered') err.textContent = t('phone_registered');
    else if (authMode === 'register' && code === 'invalid_phone') err.textContent = t('invalid_phone');
    else err.textContent = t('auth_fail');
    err.hidden = false;
  } finally { btn.disabled = false; }
}

/* ---------------- forgot password (fix-batch-26) ----------------
   Flow (Pyae's design): step 1 verifies the registered phone + name.
   Step 2 sends the reset link — ONLY to the email already on the account
   (shown masked), or to a typed-in email when the account has none (which
   is then saved to the account). A mismatch never reaches step 2; the
   customer gets the call-the-shop / Messenger fallback instead. */
let forgotState = null; // {phone, name, has_email, masked_email}
function showForgotPanel() {
  $$('#authModal .field').forEach((el) => { el.hidden = true; });
  $('#authTabs').hidden = true;
  $('#authSubmit').hidden = true;
  $('#authForgotRow').hidden = true;
  $('#authError').hidden = true;
  $('#forgotPanel').hidden = false;
  renderForgotStep1();
}
function hideForgotPanel() {
  const panel = $('#forgotPanel');
  if (panel) { panel.hidden = true; panel.innerHTML = ''; }
  const tabs = $('#authTabs');
  if (tabs) tabs.hidden = false;
  $$('#authModal .field').forEach((el) => { el.hidden = false; });
  const submit = $('#authSubmit');
  if (submit) submit.hidden = false;
  forgotState = null;
  setAuthTab(authMode);
}
function renderForgotStep1() {
  const p = $('#forgotPanel');
  p.innerHTML =
    '<h3 style="margin:4px 0 6px">' + esc(t('forgot_step1_title')) + '</h3>' +
    '<p class="hint">' + esc(t('forgot_step1_hint')) + '</p>' +
    '<div class="field"><label>' + esc(t('phone')) + '</label><input id="fgPhone" type="tel" autocomplete="tel" placeholder="09xxxxxxxxx"></div>' +
    '<div class="field"><label>' + esc(t('name')) + '</label><input id="fgName" type="text" autocomplete="name"></div>' +
    '<div id="fgErr" class="error-text" hidden></div>' +
    '<button class="btn btn-primary btn-block" type="button" id="fgNextBtn">' + esc(t('forgot_continue')) + '</button>' +
    '<div class="center" style="margin-top:12px"><button class="btn btn-ghost" type="button" id="fgBackBtn">' + esc(t('forgot_back')) + '</button></div>';
  $('#fgBackBtn').addEventListener('click', hideForgotPanel);
  $('#fgNextBtn').addEventListener('click', submitForgotVerify);
}
async function submitForgotVerify() {
  const err = $('#fgErr');
  err.hidden = true;
  const phone = $('#fgPhone').value.trim();
  const name = $('#fgName').value.trim();
  if (!phone || !name) { err.textContent = t('fill_all'); err.hidden = false; return; }
  const btn = $('#fgNextBtn');
  btn.disabled = true;
  try {
    const res = await api('/auth/forgot-verify', { method: 'POST', body: JSON.stringify({ phone, name }) });
    if (!res.ok) { renderForgotNoMatch(); return; }
    forgotState = { phone, name, has_email: res.has_email, masked_email: res.masked_email };
    renderForgotStep2();
  } catch (e) {
    err.textContent = (e.status === 429) ? t('too_many_attempts') : t('error_load');
    err.hidden = false;
  } finally { btn.disabled = false; }
}
function forgotFallbackHtml() {
  return '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:12px">' +
    '<a class="btn btn-primary" href="tel:09765117366">' + esc(t('forgot_call_shop')) + '</a>' +
    '<a class="btn btn-outline" href="https://m.me/beautyandme117" target="_blank" rel="noopener">Messenger</a>' +
    '</div>';
}
function renderForgotNoMatch() {
  const p = $('#forgotPanel');
  p.innerHTML =
    '<p class="hint">' + esc(t('forgot_no_match')) + '</p>' +
    forgotFallbackHtml() +
    '<div class="center" style="margin-top:12px"><button class="btn btn-ghost" type="button" id="fgBackBtn2">' + esc(t('forgot_back')) + '</button></div>';
  $('#fgBackBtn2').addEventListener('click', hideForgotPanel);
}
function renderForgotStep2() {
  const p = $('#forgotPanel');
  const st = forgotState;
  let body = '';
  if (st.has_email) {
    body = '<p class="hint">' + esc(t('forgot_send_to')) + '</p>' +
      '<p style="font-weight:bold;text-align:center">' + esc(st.masked_email) + '</p>';
  } else {
    body = '<p class="hint">' + esc(t('forgot_enter_email')) + '</p>' +
      '<div class="field"><label>Email</label><input id="fgEmail" type="email" autocomplete="email" placeholder="example@gmail.com"></div>';
  }
  p.innerHTML =
    '<h3 style="margin:4px 0 6px">' + esc(t('forgot_step1_title')) + '</h3>' + body +
    '<div id="fgErr2" class="error-text" hidden></div>' +
    '<button class="btn btn-primary btn-block" type="button" id="fgSendBtn">' + esc(t('forgot_send_link')) + '</button>' +
    '<div class="center" style="margin-top:12px"><button class="btn btn-ghost" type="button" id="fgBackBtn3">' + esc(t('forgot_back')) + '</button></div>';
  $('#fgBackBtn3').addEventListener('click', hideForgotPanel);
  $('#fgSendBtn').addEventListener('click', submitForgotSend);
}
async function submitForgotSend() {
  const err = $('#fgErr2');
  err.hidden = true;
  const st = forgotState;
  let email = null;
  if (!st.has_email) {
    email = ($('#fgEmail').value || '').trim();
    if (!email || email.indexOf('@') === -1) { err.textContent = t('invalid_email'); err.hidden = false; return; }
  }
  const btn = $('#fgSendBtn');
  btn.disabled = true;
  try {
    const res = await api('/auth/forgot-send', { method: 'POST', body: JSON.stringify({ phone: st.phone, name: st.name, email }) });
    if (!res.mail_configured) { renderForgotMailOff(); return; }
    renderForgotSent(res.masked_email);
  } catch (e) {
    const code = e.data && e.data.error;
    if (e.status === 429) err.textContent = t('too_many_attempts');
    else if (code === 'email_registered') err.textContent = t('email_registered');
    else if (code === 'invalid_email') err.textContent = t('invalid_email');
    else err.textContent = t('error_load');
    err.hidden = false;
  } finally { btn.disabled = false; }
}
function renderForgotSent(masked) {
  const p = $('#forgotPanel');
  p.innerHTML =
    '<p class="hint">' + esc(t('forgot_sent')) + '</p>' +
    (masked ? '<p style="font-weight:bold;text-align:center">' + esc(masked) + '</p>' : '') +
    '<div class="center" style="margin-top:12px"><button class="btn btn-ghost" type="button" id="fgBackBtn4">' + esc(t('forgot_back')) + '</button></div>';
  $('#fgBackBtn4').addEventListener('click', hideForgotPanel);
}
function renderForgotMailOff() {
  const p = $('#forgotPanel');
  p.innerHTML =
    '<p class="hint">' + esc(t('forgot_mail_off')) + '</p>' +
    forgotFallbackHtml() +
    '<div class="center" style="margin-top:12px"><button class="btn btn-ghost" type="button" id="fgBackBtn5">' + esc(t('forgot_back')) + '</button></div>';
  $('#fgBackBtn5').addEventListener('click', hideForgotPanel);
}
function logout() {
  state.token = null;
  state.user = null;
  localStorage.removeItem('bm_token');
  state.manageLoaded = {};
  stopNotifPolling();
  notifUnread = 0;
  updateNotifBadge();
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
  const isMgr = !!(state.user && (state.user.is_manager || state.user.is_sale_staff));
  $('#navManage').hidden = !isMgr;
  if (!isMgr && !$('#view-manage').hidden) showView('home');
  updateNotifBadge();
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
    '<div id="vipCardWrap"></div>' +
    '<div class="checkout-card">' +
    '<div class="kv-row"><span>' + esc(t('name')) + '</span><strong>' + esc(u.name || '') + '</strong></div>' +
    '<div class="kv-row"><span>' + esc(t('phone')) + '</span><strong>' + esc(u.phone || '') + '</strong></div>' +
    '<div class="kv-row"><span>Email</span><strong>' + esc(u.email || '—') + '</strong></div>' +
    '<div class="field" style="margin-top:12px"><label>Email (' + esc(t('email_optional')) + ')</label><input id="acctEmail" type="email" value="' + esc(u.email || '') + '" placeholder="example@gmail.com"></div>' +
    '<div id="acctEmailMsg" class="error-text" hidden></div>' +
    '<button class="btn btn-outline" type="button" id="acctEmailBtn">' + esc(t('save')) + '</button>' +
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
  $('#acctEmailBtn').addEventListener('click', saveAccountEmail);
  $('#pwChangeBtn').addEventListener('click', changePassword);
  loadVipCard();
}
// VIP card on My Account (fix-batch-52): pink-purple card with the member
// name, validity end + days left, an expiring-soon warning (30 days), and
// the birthday-month extra. Shown only for members (or expired members).
async function loadVipCard() {
  const wrap = $('#vipCardWrap');
  if (!wrap || !state.user) return;
  let v = null;
  try { v = await api('/vip'); } catch (e) { wrap.innerHTML = ''; return; }
  if (!v || (!v.is_vip && !v.vip_until)) { wrap.innerHTML = ''; return; }
  const until = v.vip_until ? v.vip_until.slice(0, 10) : '—';
  const daysLeft = v.vip_until ? Math.ceil((new Date(v.vip_until).getTime() - Date.now()) / 86400000) : null;
  const expired = !v.is_vip;
  const soon = v.is_vip && daysLeft != null && daysLeft <= 30;
  wrap.innerHTML = '<div class="vip-card">' +
    '<div style="font-size:15px;font-weight:700">💎 ' + esc(t('vip_member')) + '</div>' +
    '<div style="font-size:13px;margin-top:4px">' + esc(state.user.name || '') + '</div>' +
    '<div style="font-size:12px;margin-top:8px;opacity:.92">' + esc(t('vip_valid_until')) + ': ' + esc(until) +
    (v.is_vip && daysLeft != null ? ' · ' + daysLeft + ' ' + esc(t('vip_days_left')) : '') + '</div>' +
    (expired ? '<div style="font-size:12px;margin-top:6px;font-weight:700">' + esc(t('vip_expired')) + '</div>' : '') +
    (soon ? '<div style="font-size:12px;margin-top:6px;font-weight:700">' + esc(t('vip_expiring_soon')) + '</div>' : '') +
    (v.birthday_month && v.is_vip ? '<div style="font-size:12px;margin-top:6px">🎂 ' + esc(t('vip_birthday_month')) + ' +' + (v.birthday_extra_pct || 0) + '%</div>' : '') +
    '</div>';
}
async function saveAccountEmail() {
  const msg = $('#acctEmailMsg');
  msg.hidden = true;
  const email = ($('#acctEmail').value || '').trim();
  const btn = $('#acctEmailBtn');
  btn.disabled = true;
  try {
    const res = await api('/me/email', { method: 'POST', body: JSON.stringify({ email }) });
    state.user = res.user || state.user;
    msg.hidden = false; msg.style.color = 'var(--green)'; msg.textContent = t('email_saved');
    toast(t('email_saved'));
  } catch (e) {
    const code = e.data && e.data.error;
    msg.style.color = '';
    msg.textContent = code === 'email_registered' ? t('email_registered') : code === 'invalid_email' ? t('invalid_email') : t('error_load');
    msg.hidden = false;
  } finally { btn.disabled = false; }
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
  const isManager = !!(state.user && state.user.is_manager);
  const isStaff = !!(state.user && state.user.is_sale_staff);
  $$('#manageTabs .tab').forEach((b) => {
    const mtab = b.dataset.mtab;
    let show = true;
    if (!isOwner && OWNER_TABS.indexOf(mtab) !== -1) show = false;
    // Sale staff see ONLY the Orders tab — nothing else in Manage.
    if (isStaff && !isManager && mtab !== 'orders') show = false;
    b.style.display = show ? '' : 'none';
  });
  if (!isOwner && OWNER_TABS.indexOf(tab) !== -1) tab = 'dashboard';
  if (isStaff && !isManager && tab !== 'orders') tab = 'orders';
  state.manageTab = tab;
  $$('#manageTabs .tab').forEach((b) => b.classList.toggle('active', b.dataset.mtab === tab));
  const body = $('#manageBody');
  if (!state.user || (!state.user.is_manager && !state.user.is_sale_staff)) {
    body.innerHTML = '<div class="error-box">' + esc(t('manage_no_access')) + '</div>';
    return;
  }
  if (tab === 'dashboard') renderManageDashboard(body);
  else if (tab === 'orders') renderManageOrders(body);
  else if (tab === 'users') renderManageUsers(body);
  else if (tab === 'catalog') renderManageCatalog(body);
  else if (tab === 'coupons') renderManageCoupons(body);
  else if (tab === 'vip') renderManageVip(body);
  else if (tab === 'banner') renderManageBanner(body);
  else if (tab === 'payments') renderManagePayments(body);
  else if (tab === 'applink') renderManageAppLinks(body);
  else if (tab === 'woocommerce') renderManageWoo(body);
  else if (tab === 'activity') renderManageActivity(body);
  else if (tab === 'devices') renderManageDevices(body);
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
      '<div class="oc-meta">' + esc(t('total')) + ': ' + fmt(o.total) + (o.payment && o.payment.method ? ' • ' + esc(t(o.payment.method)) : '') + (o.has_screenshot ? ' • ' + esc(t('screenshot')) : '') + ' • ' + (o.pos_voucher ? 'POS ' + esc(o.pos_voucher) : esc(t('pos_voucher_missing'))) + '</div>' +
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
    const isOwner = state.user && (state.user.is_owner || state.user.phone === '095117366');
    $('#orderBody').innerHTML =
      '<div class="line"><span>' + esc(t('order_id')) + '</span><strong>' + esc(o.id) + '</strong></div>' +
      '<div class="line"><span>' + esc(t('status')) + '</span><span class="status-pill" id="adminOrderPill">' + esc(statusLabel(o.status)) + '</span></div>' +
      (isOwner ? '<div style="margin-top:10px"><button type="button" class="btn btn-outline btn-block" id="adminHistoryBtn">' + esc(t('view_history')) + '</button></div>' : '') +
      '<div class="line"><span>' + esc(t('date')) + '</span><span>' + esc(fmtDate(o.created_at)) + '</span></div>' +
      ((c.name || c.phone || c.address) ?
        '<hr>' +
        (c.name ? '<div class="line"><span>' + esc(t('name')) + '</span><strong>' + esc(c.name) + '</strong></div>' : '') +
        (c.phone ? '<div class="line"><span>' + esc(t('phone')) + '</span><span>' + esc(c.phone) + '</span></div>' : '') +
        (c.address ? '<div class="line"><span>' + esc(t('address')) + '</span><span>' + esc(c.address) + '</span></div>' : '') : '') +
      (o.delivery && o.delivery.method ? '<div class="line"><span>' + esc(t('delivery')) + '</span><strong>' + esc(deliveryLabel(o.delivery.method)) + '</strong></div>' : '') +
      (pay.method ? '<div class="line"><span>' + esc(t('payment')) + '</span><span>' + esc(t(pay.method)) + (pay.account ? ' — ' + esc(pay.account) : '') + '</span></div>' : '') +
      '<hr><div style="font-weight:700;margin-bottom:8px">' + esc(t('pos_voucher')) + '</div>' +
      '<div class="row-flex"><input id="adminPosVoucher" type="text" placeholder="' + esc(t('pos_voucher_hint')) + '" value="' + esc(o.pos_voucher || '') + '" style="flex:1;padding:10px 12px;border:1.5px solid var(--line);border-radius:10px;min-width:140px">' +
      '<button type="button" class="btn btn-primary" id="adminPosSave">' + esc(t('save')) + '</button></div>' +
      '<div id="adminPosNote" style="margin-top:6px;font-size:13px;color:var(--muted)"></div>' +
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
    // POS voucher number (fix-batch-46): staff type the UltimatePOS
    // voucher no. here; it is staff-only and activity-logged.
    const posInput = $('#adminPosVoucher');
    const posSaveBtn = $('#adminPosSave');
    if (posSaveBtn) posSaveBtn.addEventListener('click', async () => {
      const note = $('#adminPosNote');
      try {
        const res = await api('/manage/orders/' + encodeURIComponent(o.id) + '/pos-voucher', { method: 'PATCH', body: JSON.stringify({ pos_voucher: posInput ? posInput.value : '' }) });
        o.pos_voucher = res.order ? res.order.pos_voucher : (posInput ? posInput.value.trim() : '');
        if (note) note.textContent = t('saved');
        toast(t('saved'));
        loadMgOrders(true);
      } catch (e) { if (note) note.textContent = t('error_load'); }
    });
    const historyBtn = $('#adminHistoryBtn');
    if (historyBtn) historyBtn.addEventListener('click', () => {
      // Jump to the Activity log with this voucher no. already searched —
      // the log search matches the voucher no. against every entry.
      closeOverlay('#orderOverlay', '#orderModal');
      state.activityPrefill = o.id;
      loadManage('activity');
    });
    const editBtn = $('#adminEditItemsBtn');
    if (editBtn) editBtn.addEventListener('click', () => renderAdminOrderEdit(o));
    // Coupon apply / remove (admin only, same lock as item editing).
    const couponSel = $('#adminCouponSel');
    if (couponSel) {
      const fillCoupons = async () => {
        try {
          const data = await api('/manage/coupons');
          const list = data.coupons || data.items || (Array.isArray(data) ? data : []);
          const active = list.filter((c) => couponIsUsableClient(c));
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
          if (couponNote()) couponNote().textContent = t(couponErrorKey(e));
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
    (isOwner ? '<div class="mg-card"><h3>' + esc(t('staff_title')) + '</h3><div id="mgStaffWrap"><div class="loading">' + esc(t('loading')) + '</div></div>' +
      '<div class="row-flex" style="margin-top:12px"><input id="mgAddStaffPhone" type="tel" placeholder="' + esc(t('add_manager_ph')) + '" style="flex:1;padding:10px 12px;border:1.5px solid var(--line);border-radius:10px;min-width:160px">' +
      '<button class="btn btn-primary" type="button" id="mgAddStaffBtn">' + esc(t('add')) + '</button></div>' +
      '<div style="margin-top:6px;font-size:12px;color:var(--muted)">' + esc(t('staff_hint')) + '</div></div>' : '') +
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
    loadMgStaff();
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
    $('#mgAddStaffBtn').addEventListener('click', async () => {
      const phone = $('#mgAddStaffPhone').value.trim();
      if (!phone) return;
      try {
        await api('/manage/sale-staff', { method: 'POST', body: JSON.stringify({ phone }) });
        $('#mgAddStaffPhone').value = '';
        toast(t('saved'));
        loadMgStaff();
        loadMgUsers(true);
      } catch (e) {
        toast(e.status === 404 ? t('user_not_found') : t('error_load'));
      }
    });
  }
  loadMgUsers(true);
}
async function loadMgStaff() {
  const wrap = $('#mgStaffWrap');
  if (!wrap) return;
  try {
    const data = await api('/manage/sale-staff');
    const list = data.staff || [];
    wrap.innerHTML =
      (list.length ? list.map((m) =>
        '<div class="kv-row"><span><strong>' + esc(m.name || m.phone) + '</strong> — ' + esc(m.phone) + '</span><button type="button" class="btn btn-outline" data-mgdelstaff="' + esc(m.phone) + '">' + esc(t('remove_staff')) + '</button></div>').join('')
        : '<div class="empty">' + esc(t('no_users')) + '</div>');
    $$('[data-mgdelstaff]', wrap).forEach((b) => b.addEventListener('click', async () => {
      try {
        await api('/manage/sale-staff/' + encodeURIComponent(b.dataset.mgdelstaff), { method: 'DELETE' });
        toast(t('deleted'));
        loadMgStaff();
        loadMgUsers(true);
      } catch (e) { toast(t('error_load')); }
    }));
  } catch (e) {
    wrap.innerHTML = '<div class="error-box">' + esc(t('error_load')) + '</div>';
  }
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
      (u.is_sale_staff && !u.is_owner && !u.is_manager ? '<span class="badge" style="background:#FDE7F0;color:var(--pink)">' + esc(t('sale_staff')) + '</span>' : '') +
      '</div>' +
      '<div style="font-size:12px;color:var(--muted);margin-top:4px">' + esc(t('vip_lifetime')) + ': ' + fmt(u.lifetime_total || 0) +
      (u.is_vip ? ' · 💎 ' + esc(t('vip_member')) + (u.vip_until ? ' — ' + esc(t('vip_valid_until')) + ' ' + esc(u.vip_until.slice(0, 10)) : '') : '') + '</div>' +
      '<div class="row-flex" style="margin-top:8px;flex-wrap:wrap">' +
      '<button type="button" class="btn btn-outline" data-vipgrant="' + esc(u.phone) + '" data-isvip="' + (u.is_vip ? '1' : '0') + '">' + esc(u.is_vip ? t('vip_revoke') : t('vip_grant')) + '</button>' +
      (u.is_vip ? '<button type="button" class="btn btn-outline" data-vipextend="' + esc(u.phone) + '">' + esc(t('vip_extend')) + '</button>' : '') +
      '<input type="date" value="' + esc(u.vip_birthday || '') + '" data-vipbday="' + esc(u.phone) + '" title="' + esc(t('vip_birthday')) + '" style="padding:8px 10px;border:1.5px solid var(--line);border-radius:8px">' +
      '<button type="button" class="btn btn-outline" data-vipbdaysave="' + esc(u.phone) + '">' + esc(t('save')) + '</button>' +
      '</div>' +
      '<div class="row-flex" style="margin-top:10px;flex-wrap:wrap">' +
      '<button type="button" class="btn btn-outline" data-mgpw="' + esc(u.phone) + '">' + esc(t('set_password')) + '</button>' +
      (isOwner && !u.is_owner ? '<button type="button" class="btn btn-outline" data-mgmgr="' + esc(u.phone) + '" data-ismgr="' + (u.is_manager ? '1' : '0') + '">' + esc(u.is_manager ? t('remove_manager') : t('make_manager')) + '</button>' : '') +
      (isOwner && !u.is_owner && !u.is_manager ? '<button type="button" class="btn btn-outline" data-mgstaff="' + esc(u.phone) + '" data-isstaff="' + (u.is_sale_staff ? '1' : '0') + '">' + esc(u.is_sale_staff ? t('remove_staff') : t('make_staff')) + '</button>' : '') +
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
    // VIP controls (fix-batch-52): grant/revoke + birthday (admin-only) +
    // manual 1-year extension. The user list reloads so the badge, expiry
    // and lifetime total stay in sync.
    $$('[data-vipgrant]', wrap).forEach((b) => b.addEventListener('click', async () => {
      const makeVip = b.dataset.isvip !== '1';
      if (makeVip && !window.confirm(t('vip_grant') + ' — ' + b.dataset.vipgrant + '?')) return;
      try {
        await api('/manage/users/' + encodeURIComponent(b.dataset.vipgrant) + '/vip', { method: 'PATCH', body: JSON.stringify({ is_vip: makeVip }) });
        toast(t(makeVip ? 'vip_granted' : 'saved'));
        loadMgUsers(true);
      } catch (e) { toast(t('error_load')); }
    }));
    $$('[data-vipextend]', wrap).forEach((b) => b.addEventListener('click', async () => {
      if (!window.confirm(t('vip_extend') + ' — ' + b.dataset.vipextend + '?')) return;
      try {
        await api('/manage/users/' + encodeURIComponent(b.dataset.vipextend) + '/vip-extend', { method: 'POST', body: JSON.stringify({}) });
        toast(t('vip_extended'));
        loadMgUsers(true);
      } catch (e) { toast(t('error_load')); }
    }));
    $$('[data-vipbdaysave]', wrap).forEach((b) => b.addEventListener('click', async () => {
      const inp = wrap.querySelector('[data-vipbday="' + b.dataset.vipbdaysave + '"]');
      const val = inp ? inp.value.trim() : '';
      try {
        await api('/manage/users/' + encodeURIComponent(b.dataset.vipbdaysave) + '/vip', { method: 'PATCH', body: JSON.stringify({ vip_birthday: val || null }) });
        toast(t('saved'));
        loadMgUsers(true);
      } catch (e) { toast(t('error_load')); }
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
    $$('[data-mgstaff]', wrap).forEach((b) => b.addEventListener('click', async () => {
      try {
        if (b.dataset.isstaff === '1') await api('/manage/sale-staff/' + encodeURIComponent(b.dataset.mgstaff), { method: 'DELETE' });
        else await api('/manage/sale-staff', { method: 'POST', body: JSON.stringify({ phone: b.dataset.mgstaff }) });
        toast(t('saved'));
        loadMgStaff();
        loadMgUsers(true);
      } catch (e) { toast(e.status === 404 ? t('user_not_found') : t('error_load')); }
    }));
  } catch (e) {
    wrap.innerHTML = '<div class="error-box">' + esc(t('error_load')) + '</div>';
  }
}

/* ---------------- manage: activity log (owner only) ---------------- */
const ACTIVITY_ACTIONS = ['order_create', 'order_status', 'order_edit', 'order_coupon', 'password_reset', 'manager_add', 'manager_remove', 'staff_add', 'staff_remove', 'product_create', 'product_update', 'product_photo_add', 'product_photo_remove', 'coupon_create', 'coupon_delete', 'payments_update', 'app_links_update', 'woocommerce_settings', 'woocommerce_import', 'image_migrate'];
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
  // Jumped here from an order's History button: search that voucher no.
  if (state.activityPrefill) {
    mgActivity.q = state.activityPrefill;
    $('#mgActSearch').value = state.activityPrefill;
    state.activityPrefill = null;
  }
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

let mgDashPeriod = 'today';
async function renderManageDashboard(body) {
  body.innerHTML =
    '<div class="chips" id="mgDashChips">' +
    ['today', 'week', 'month', 'all'].map((p) =>
      '<button type="button" class="chip' + (mgDashPeriod === p ? ' active' : '') + '" data-dashperiod="' + p + '">' + esc(t('period_' + p)) + '</button>').join('') +
    '</div><div id="mgDashStats" style="margin-top:12px"><div class="loading">' + esc(t('loading')) + '</div></div>';
  const load = async () => {
    const box = $('#mgDashStats');
    try {
      const s = await api('/manage/stats?period=' + mgDashPeriod);
      const card = (num, lbl) => '<div class="stat"><div class="num">' + num + '</div><div class="lbl">' + esc(lbl) + '</div></div>';
      box.innerHTML =
        '<div class="stat-grid">' +
        card(esc(String(s.orders || 0)), t('orders')) +
        card(fmt(s.revenue || 0), t('sales')) +
        card(fmt(s.avg_order || 0), t('avg_order')) +
        card(esc(String(s.pending || 0)), t('pending_orders')) +
        '</div><div class="stat-grid" style="margin-top:12px">' +
        card(esc(String(s.products || 0)), t('products')) +
        card(esc(String(s.users || 0)), t('customers')) +
        '</div>';
    } catch (e) {
      box.innerHTML = '<div class="error-box">' + esc(t('error_load')) + '</div>';
    }
  };
  $$('#mgDashChips .chip').forEach((chip) => chip.addEventListener('click', () => {
    mgDashPeriod = chip.getAttribute('data-dashperiod');
    $$('#mgDashChips .chip').forEach((c) => c.classList.toggle('active', c === chip));
    load();
  }));
  await load();
}
let mgCatalog = { q: '', offset: 0, items: [] };
// --- Brand / category rename (fix-batch-41) ---
// Renames a brand (or stored category) on EVERY product that carries it.
// The panel lists each value with its product count; the server applies the
// rename, updates coupon brand scoping, and logs one activity entry.
async function renameCatalogValue(kind, from, to) {
  return api('/manage/' + (kind === 'brand' ? 'brands' : 'categories') + '/rename', { method: 'POST', body: JSON.stringify({ from, to }) });
}
let mgRenameBrands = [], mgRenameCats = [];
async function renderRenamePanel() {
  const box = $('#mgRenamePanel');
  if (!box) return;
  box.innerHTML = '<div class="loading">' + esc(t('loading')) + '</div>';
  try {
    const [brands, cats] = await Promise.all([api('/brands'), api('/manage/category-values')]);
    mgRenameBrands = brands || [];
    mgRenameCats = cats || [];
    const opts = (list) => list.map((v) => '<option value="' + esc(v.name) + '">' + esc(v.name) + ' (' + v.count + ')</option>').join('');
    const row = (kind, list, labelKey) =>
      '<div style="font-weight:700;margin-bottom:6px">' + esc(t(labelKey)) + '</div>' +
      '<div class="row-flex">' +
      '<select id="mgRename' + (kind === 'brand' ? 'Brand' : 'Cat') + 'From" style="flex:1;padding:10px 12px;border:1.5px solid var(--line);border-radius:10px;min-width:120px">' + opts(list) + '</select>' +
      '<input id="mgRename' + (kind === 'brand' ? 'Brand' : 'Cat') + 'To" type="text" placeholder="' + esc(t('rename_new_name')) + '" style="flex:1;padding:10px 12px;border:1.5px solid var(--line);border-radius:10px;min-width:120px">' +
      '<button class="btn btn-primary" type="button" id="mgRename' + (kind === 'brand' ? 'Brand' : 'Cat') + 'Btn">' + esc(t('rename_btn')) + '</button>' +
      '</div>';
    box.innerHTML =
      '<div style="border:1.5px solid var(--line);border-radius:12px;padding:12px">' +
      '<div style="font-weight:800;font-size:15px;margin-bottom:10px">' + esc(t('rename_title')) + '</div>' +
      row('brand', mgRenameBrands, 'brand') +
      '<div style="height:10px"></div>' +
      row('category', mgRenameCats, 'category') +
      '<div id="mgRenameResult" style="margin-top:10px"></div></div>';
    const wire = (kind) => {
      const cap = kind === 'brand' ? 'Brand' : 'Cat';
      $('#mgRename' + cap + 'Btn').addEventListener('click', async () => {
        const from = $('#mgRename' + cap + 'From').value;
        const to = $('#mgRename' + cap + 'To').value.trim();
        const list = kind === 'brand' ? mgRenameBrands : mgRenameCats;
        const entry = list.find((v) => v.name === from);
        const result = $('#mgRenameResult');
        if (!to) { result.innerHTML = '<div class="error-box">' + esc(t('fill_all')) + '</div>'; return; }
        if (!entry || !confirm(from + ' → ' + to + ' (' + entry.count + ' ' + t('products') + ')')) return;
        result.innerHTML = '<div class="loading">' + esc(t('loading')) + '</div>';
        try {
          const res = await renameCatalogValue(kind, from, to);
          result.innerHTML = '<div style="color:green;font-weight:700">' + esc(t('rename_done')) + ' — ' + res.changed + ' ' + esc(t('products')) + '</div>';
          $('#mgRename' + cap + 'To').value = '';
          await renderRenamePanel();
          state.brands = []; state.categories = [];
          loadBrands(); loadMgCatalog(true);
        } catch (e) {
          // Show the REAL error (HTTP status + server message, or the
          // timeout message) instead of the generic line — a rename that
          // fails live needs its cause visible, not hidden.
          const detail = (e && e.status) ? ('HTTP ' + e.status + ' — ' + (e.message || t('error_load'))) : (e && e.message ? e.message : t('error_load'));
          result.innerHTML = '<div class="error-box">' + esc(detail) + '</div>';
        }
      });
    };
    wire('brand');
    wire('category');
  } catch (e) {
    box.innerHTML = '<div class="error-box">' + esc(t('error_load')) + '</div>';
  }
}
async function renderManageCatalog(body) {
  body.innerHTML =
    '<div class="mg-card"><div class="row-flex">' +
    '<input id="mgSearch" type="search" placeholder="' + esc(t('search_products')) + '" style="flex:1;padding:10px 12px;border:1.5px solid var(--line);border-radius:10px;min-width:160px">' +
    '<button class="btn btn-primary" type="button" id="mgSearchBtn">' + esc(t('search_btn')) + '</button>' +
    (window.Html5Qrcode ? '<button class="btn btn-outline" type="button" id="mgScanBtn">📷 ' + esc(t('scan')) + '</button>' : '') +
    '</div><button class="btn btn-primary btn-block" type="button" id="mgAddBtn" style="margin-top:10px">+ ' + esc(t('add_product')) + '</button>' +
    '<div class="row-flex" style="margin-top:10px">' +
    '<button class="btn btn-outline" type="button" id="mgExportBtn" style="flex:1">' + esc(t('excel_export')) + '</button>' +
    '<button class="btn btn-outline" type="button" id="mgImportBtn" style="flex:1">' + esc(t('excel_import')) + '</button>' +
    '</div><input id="mgImportFile" type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" hidden>' +
    '<div id="mgExcelPanel" style="margin-top:10px"></div>' +
    '<div id="mgRenamePanel" style="margin-top:12px"></div>' +
    '<div class="chips" style="margin-top:10px" id="mgFilterChips">' +
    '<button type="button" class="chip active" data-mgfilter="all">' + esc(t('filter_all')) + ' <span data-mgcount="all"></span></button>' +
    '<button type="button" class="chip" data-mgfilter="in">' + esc(t('filter_in_stock')) + ' <span data-mgcount="in_stock"></span></button>' +
    '<button type="button" class="chip" data-mgfilter="out">' + esc(t('filter_out_stock')) + ' <span data-mgcount="out_of_stock"></span></button>' +
    '<button type="button" class="chip" data-mgfilter="sale">' + esc(t('filter_sale')) + ' <span data-mgcount="sale"></span></button>' +
    '</div><div id="mgTableWrap" class="table-wrap" style="margin-top:12px"></div>' +
    '<div class="center" style="margin-top:12px"><button class="btn btn-outline" type="button" id="mgMoreBtn">' + esc(t('more')) + '</button></div>' +
    '<input id="mgPhotoInput" type="file" accept="image/*" hidden></div>';
  mgCatalog = { q: '', filter: 'all', offset: 0, items: [] };
  const doSearch = () => {
    mgCatalog.q = $('#mgSearch').value.trim();
    mgCatalog.offset = 0; mgCatalog.items = [];
    loadMgCatalog(true);
  };
  $('#mgSearchBtn').addEventListener('click', doSearch);
  $('#mgSearch').addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(); });
  const mgScanBtn = $('#mgScanBtn');
  if (mgScanBtn) mgScanBtn.addEventListener('click', () => openBarcodeScanner((code) => { $('#mgSearch').value = code; doSearch(); }));
  $('#mgAddBtn').addEventListener('click', openAddProduct);
  // --- Catalog Excel export / import ---
  let mgImportFile = null;
  function excelFieldLabel(field) {
    return field === 'price' ? t('price') : field === 'sale_price' ? t('sale_price') : t('stock_qty');
  }
  function renderExcelPreview(d) {
    const panel = $('#mgExcelPanel');
    const fieldLine = (c) => esc(c.name) + ' — ' + esc(excelFieldLabel(c.field)) + ': ' + (c.from == null ? '—' : esc(String(c.from))) + ' → ' + esc(String(c.to));
    let html = '<div class="mg-card" style="margin-top:0"><h3>' + esc(t('excel_preview')) + '</h3>' +
      '<div class="meta-line">' + esc(t('excel_to_change')) + ': ' + d.products_changed + ' · ' + esc(t('price')) + ': ' + d.counts.price + ' · ' + esc(t('sale_price')) + ': ' + d.counts.sale_price + ' · ' + esc(t('stock_qty')) + ': ' + d.counts.stock + ' · ' + esc(t('excel_skipped')) + ': ' + d.skipped_total + '</div>';
    if (d.changes.length) html += '<div style="font-size:13px;margin-top:8px">' + d.changes.slice(0, 10).map(fieldLine).join('<br>') + (d.changes.length > 10 ? '<br>…' : '') + '</div>';
    else html += '<div class="meta-line" style="margin-top:8px">' + esc(t('excel_no_changes')) + '</div>';
    if (d.skipped.length) html += '<div style="font-size:13px;margin-top:8px;color:var(--muted)">' + d.skipped.slice(0, 10).map((s) => esc(t('excel_reason_' + s.reason) || s.reason) + (s.name ? ' — ' + esc(s.name) : '') + (s.id ? ' (' + esc(String(s.id)) + ')' : '')).join('<br>') + (d.skipped.length > 10 ? '<br>…' : '') + '</div>';
    html += '<div class="row-flex" style="margin-top:10px"><button class="btn btn-primary" type="button" id="mgExcelApply" ' + (d.products_changed ? '' : 'disabled') + '>' + esc(t('excel_apply')) + '</button>' +
      '<button class="btn btn-outline" type="button" id="mgExcelCancel">' + esc(t('excel_cancel')) + '</button></div></div>';
    panel.innerHTML = html;
    $('#mgExcelCancel').addEventListener('click', () => { panel.innerHTML = ''; mgImportFile = null; });
    const applyBtn = $('#mgExcelApply');
    if (applyBtn) applyBtn.addEventListener('click', async () => {
      if (!mgImportFile) return;
      applyBtn.disabled = true;
      try {
        const res = await fetch('/api/manage/products/import?dry_run=0', { method: 'POST', headers: { Authorization: 'Bearer ' + state.token, 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }, body: mgImportFile });
        const r = await res.json();
        if (!res.ok) throw new Error((r && r.error) || ('HTTP ' + res.status));
        panel.innerHTML = '<div class="meta-line">' + esc(t('excel_imported')) + ' — ' + r.products_changed + '</div>';
        mgImportFile = null;
        loadMgCatalog(true); loadBrands(); loadTypes(); loadHomeGrid(true);
      } catch (e) { panel.innerHTML = '<div class="error-box">' + esc(t('error_load')) + (e && e.message ? ' (' + esc(e.message) + ')' : '') + '</div>'; }
    });
  }
  $('#mgExportBtn').addEventListener('click', async () => {
    try {
      const res = await fetch('/api/manage/products/export', { headers: { Authorization: 'Bearer ' + state.token } });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      const cd = res.headers.get('content-disposition') || '';
      const m = cd.match(/filename="([^"]+)"/);
      a.download = m ? m[1] : 'beauty-me-catalog.xlsx';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    } catch (e) { toast(t('error_load')); }
  });
  $('#mgImportBtn').addEventListener('click', () => { $('#mgImportFile').click(); });
  $('#mgImportFile').addEventListener('change', async () => {
    const f = $('#mgImportFile').files[0];
    $('#mgImportFile').value = '';
    if (!f) return;
    mgImportFile = f;
    const panel = $('#mgExcelPanel');
    panel.innerHTML = '<div class="meta-line">' + esc(t('loading')) + '</div>';
    try {
      const res = await fetch('/api/manage/products/import?dry_run=1', { method: 'POST', headers: { Authorization: 'Bearer ' + state.token, 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }, body: f });
      const d = await res.json();
      if (!res.ok) throw new Error((d && d.error) || ('HTTP ' + res.status));
      renderExcelPreview(d);
    } catch (e) { panel.innerHTML = '<div class="error-box">' + esc(t('error_load')) + (e && e.message ? ' (' + esc(e.message) + ')' : '') + '</div>'; }
  });
  // Status filter: one list, one tap — and it combines with the search above
  // (e.g. ANUA + ကုန်ပြီ finds the ANUA items to restock). The reset reloads
  // from offset 0, so the list can never vanish the way it did in v15.
  $$('[data-mgfilter]').forEach((b) => b.addEventListener('click', () => {
    mgCatalog.filter = b.dataset.mgfilter;
    $$('[data-mgfilter]').forEach((x) => x.classList.toggle('active', x === b));
    loadMgCatalog(true);
  }));
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
  renderRenamePanel();
}
// Downscale a picked photo to max `max`px JPEG before upload — keeps the
// upload small and the stored image a sensible size for product cards.
// The hero banner uses a bigger max (1200) so it stays sharp full-width.
function downscaleImage(file, max) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const limit = max || 800;
        const scale = Math.min(1, limit / Math.max(img.naturalWidth, img.naturalHeight));
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
// Add a NEW product from Manage: name + brand + price (+ optional sale
// price, stock, photo, and size/shade options). With options, the price
// comes from the options and the sale-price field hides (sale prices do not
// apply to option lines at checkout). After saving, the filter resets to
// All so the new product is visible right away.
// Barcode scanner (fix-batch-51): the phone camera reads a barcode into a
// field. html5-qrcode is bundled locally (public/html5-qrcode.min.js) — no
// CDN needed. A barcode's check digit means a misread fails instead of
// filling a wrong number. If the library or the camera is unavailable, the
// scan buttons stay hidden and typing still works.
let scanQr = null;
function openBarcodeScanner(onDecoded) {
  if (!window.Html5Qrcode) { toast(t('scan_failed')); return; }
  let modal = $('#scanModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'scanModal';
    modal.className = 'scan-modal';
    modal.innerHTML = '<div class="scan-box"><h3>' + esc(t('scan_title')) + '</h3>' +
      '<div id="scanReader"></div>' +
      '<div class="meta-line" style="margin-top:8px">' + esc(t('scan_hint')) + '</div>' +
      '<button class="btn btn-outline btn-block" type="button" id="scanClose" style="margin-top:10px">' + esc(t('cancel')) + '</button></div>';
    document.body.appendChild(modal);
    modal.querySelector('#scanClose').addEventListener('click', closeBarcodeScanner);
  }
  modal.style.display = 'flex';
  const qr = new Html5Qrcode('scanReader');
  scanQr = qr;
  qr.start({ facingMode: 'environment' }, { fps: 10, qrbox: { width: 250, height: 140 }, formatsToSupport: [Html5QrcodeSupportedFormats.EAN_13, Html5QrcodeSupportedFormats.EAN_8, Html5QrcodeSupportedFormats.UPC_A, Html5QrcodeSupportedFormats.UPC_E, Html5QrcodeSupportedFormats.CODE_128, Html5QrcodeSupportedFormats.CODE_39] }, (text) => {
    const code = String(text || '').trim();
    if (!code) return;
    closeBarcodeScanner();
    onDecoded(code);
  }, () => {}).catch(() => { closeBarcodeScanner(); toast(t('scan_failed')); });
}
async function closeBarcodeScanner() {
  const modal = $('#scanModal');
  if (modal) modal.style.display = 'none';
  if (scanQr) { try { await scanQr.stop(); } catch (e) {} try { scanQr.clear(); } catch (e) {} scanQr = null; }
}
async function openAddProduct() {
  if (!state.brands || !state.brands.length) {
    try { state.brands = await api('/brands'); } catch (e) { state.brands = []; }
  }
  if (!state.categories || !state.categories.length) {
    try { state.categories = await api('/categories'); } catch (e) { state.categories = []; }
  }
  const brandOpts = (state.brands || []).map((b) => '<option value="' + esc(b.name) + '">' + esc(b.name) + '</option>').join('');
  const catOpts = (state.categories || []).map((c) => '<option value="' + esc(c.label) + '">' + esc(c.label) + '</option>').join('');
  $('#addProductTitle').textContent = t('add_product');
  $('#addProductBody').innerHTML =
    '<div class="field"><label>' + esc(t('product_name')) + ' *</label><input id="apName" type="text" placeholder="e.g. ANUA Heartleaf Toner 200 ml"></div>' +
    '<div class="field"><label>' + esc(t('brand')) + ' *</label><select id="apBrand">' + brandOpts + '<option value="__new">' + esc(t('new_brand')) + '</option></select></div>' +
    '<div class="field" id="apNewBrandField" hidden><label>' + esc(t('new_brand')) + '</label><input id="apNewBrand" type="text" placeholder="e.g. MEDICUBE"></div>' +
    '<div class="field"><label>' + esc(t('category')) + '</label><select id="apCategory">' + catOpts + '<option value="__new">' + esc(t('new_category')) + '</option></select></div>' +
    '<div class="field" id="apNewCatField" hidden><label>' + esc(t('new_category')) + '</label><input id="apNewCategory" type="text" placeholder="e.g. Toner"></div>' +
    '<div class="field"><label>' + esc(t('description')) + '</label><input id="apNote" type="text" placeholder="e.g. Skin type — all skin types"></div>' +
    '<div class="field"><label>' + esc(t('price')) + ' (Ks) *</label><input id="apPrice" type="number" min="1" step="500" placeholder="67000"></div>' +
    '<div class="field" id="apSaleField"><label>' + esc(t('sale_price')) + ' (Ks)</label><input id="apSale" type="number" min="0" step="500" placeholder=""></div>' +
    '<div class="field"><label>' + esc(t('stock_qty')) + '</label><input id="apStock" type="number" min="0" step="1" placeholder="—"></div>' +
    '<div class="field"><label>' + esc(t('sku')) + '</label><div style="display:flex;gap:6px"><input id="apSku" type="text" placeholder="e.g. 8809213803383" style="flex:1;min-width:0">' + (window.Html5Qrcode ? '<button type="button" class="btn btn-outline" id="apScanBtn">📷 ' + esc(t('scan')) + '</button>' : '') + '</div></div>' +
    '<div class="field"><label>' + esc(t('add_photo')) + '</label><input id="apPhoto" type="file" accept="image/*"><div id="apPhotoPreview" style="margin-top:8px"></div></div>' +
    '<div class="field"><label>' + esc(t('select_option')) + '</label><div id="apOptions"></div><button type="button" class="btn btn-outline" id="apAddOpt" style="margin-top:6px">+ ' + esc(t('add_option')) + '</button></div>' +
    '<div class="error-box" id="apError" hidden></div>' +
    '<button class="btn btn-primary btn-block" type="button" id="apSubmit">' + esc(t('add_product')) + '</button>';
  $('#apBrand').addEventListener('change', () => { $('#apNewBrandField').hidden = $('#apBrand').value !== '__new'; });
  const syncApCatField = () => { $('#apNewCatField').hidden = $('#apCategory').value !== '__new'; };
  $('#apCategory').addEventListener('change', syncApCatField);
  syncApCatField();
  const syncApSaleField = () => { $('#apSaleField').hidden = $('#apOptions').children.length > 0; };
  const addOptRow = () => {
    const row = document.createElement('div');
    row.className = 'ap-opt-row';
    row.style.cssText = 'display:flex;gap:6px;align-items:center;margin-top:6px';
    row.innerHTML =
      '<input type="text" data-aplabel placeholder="' + esc(t('option_label')) + '" style="flex:1;min-width:0;padding:8px 10px;border:1.5px solid var(--line);border-radius:8px">' +
      '<input type="number" min="1" step="500" data-apprice placeholder="Ks" style="width:92px;padding:8px 10px;border:1.5px solid var(--line);border-radius:8px">' +
      '<input type="number" min="0" step="1" data-apstock placeholder="—" style="width:64px;padding:8px 10px;border:1.5px solid var(--line);border-radius:8px">' +
      '<input type="text" data-apsku placeholder="SKU" style="width:110px;padding:8px 10px;border:1.5px solid var(--line);border-radius:8px">' +
      '<button type="button" data-aprm style="border:0;background:none;color:var(--muted);font-size:16px;padding:0 4px">✕</button>';
    row.querySelector('[data-aprm]').addEventListener('click', () => { row.remove(); syncApSaleField(); });
    $('#apOptions').appendChild(row);
    syncApSaleField();
  };
  $('#apAddOpt').addEventListener('click', addOptRow);
  let apPhotoData = null;
  $('#apPhoto').addEventListener('change', async () => {
    const f = $('#apPhoto').files && $('#apPhoto').files[0];
    if (!f) { apPhotoData = null; $('#apPhotoPreview').innerHTML = ''; return; }
    try {
      apPhotoData = await downscaleImage(f);
      $('#apPhotoPreview').innerHTML = '<img src="' + esc(apPhotoData) + '" style="width:80px;height:80px;object-fit:cover;border-radius:8px">';
    } catch (e) { apPhotoData = null; $('#apPhotoPreview').innerHTML = ''; }
  });
  $('#apSubmit').addEventListener('click', async () => {
    const err = $('#apError'); err.hidden = true;
    const name = $('#apName').value.trim();
    const brandSel = $('#apBrand').value;
    const brand = brandSel === '__new' ? $('#apNewBrand').value.trim() : brandSel;
    const catSel = $('#apCategory').value;
    const category = catSel === '__new' ? $('#apNewCategory').value.trim() : catSel;
    const price = Number($('#apPrice').value);
    const saleRaw = $('#apSale').value.trim();
    const stockRaw = $('#apStock').value.trim();
    const options = $$('#apOptions .ap-opt-row').map((row) => ({
      label: row.querySelector('[data-aplabel]').value.trim(),
      price: Number(row.querySelector('[data-apprice]').value),
      stock: row.querySelector('[data-apstock]').value.trim() === '' ? null : Number(row.querySelector('[data-apstock]').value),
      sku: row.querySelector('[data-apsku]').value.trim() || null,
    }));
    const stockVal = stockRaw === '' ? null : Number(stockRaw);
    if (!name || !brand || (!options.length && (!price || price <= 0)) ||
      options.some((o) => !o.label || !o.price || o.price <= 0 || (o.stock !== null && (!Number.isInteger(o.stock) || o.stock < 0))) ||
      (stockVal !== null && (!Number.isInteger(stockVal) || stockVal < 0))) {
      err.textContent = t('fill_all'); err.hidden = false; return;
    }
    const payload = {
      name, brand, category,
      note: $('#apNote').value.trim(),
      price: options.length ? undefined : price,
      sale_price: (options.length || saleRaw === '') ? null : Number(saleRaw),
      stock: stockVal,
      sku: $('#apSku').value.trim() || null,
      options: options.length ? options : undefined,
    };
    if (apPhotoData) payload.image_data = apPhotoData;
    const btn = $('#apSubmit'); btn.disabled = true;
    try {
      await api('/manage/products', { method: 'POST', body: JSON.stringify(payload) });
      closeOverlay('#addProductOverlay', '#addProductModal');
      toast(t('product_added'));
      mgCatalog.filter = 'all';
      $$('[data-mgfilter]').forEach((x) => x.classList.toggle('active', x.dataset.mgfilter === 'all'));
      loadMgCatalog(true);
    } catch (e) {
      btn.disabled = false;
      err.textContent = (e.data && e.data.error === 'duplicate_product') ? t('duplicate_product') : (e.data && e.data.error === 'duplicate_sku') ? t('duplicate_sku') : t('error_load');
      err.hidden = false;
    }
  });
  const apScanBtn = $('#apScanBtn');
  if (apScanBtn) apScanBtn.addEventListener('click', () => openBarcodeScanner((code) => { $('#apSku').value = code; }));
  openOverlay('#addProductOverlay', '#addProductModal');
}
// Edit an existing product: name, brand, category and description.
// The product id (slug) never changes on rename — orders, wishlists and
// carts reference it, and the slug is invisible in the shop. Price, stock
// and photo stay editable inline in the catalog table as before.
// Reuses the Add Product modal shell (#addProductOverlay/#addProductModal).
async function openEditProduct(id) {
  const p = (mgCatalog.items || []).find((x) => String(x.id) === String(id));
  if (!p) { toast(t('error_load')); return; }
  if (!state.brands || !state.brands.length) {
    try { state.brands = await api('/brands'); } catch (e) { state.brands = []; }
  }
  if (!state.categories || !state.categories.length) {
    try { state.categories = await api('/categories'); } catch (e) { state.categories = []; }
  }
  const brandOpts = (state.brands || []).map((b) => '<option value="' + esc(b.name) + '"' + (b.name === p.brand ? ' selected' : '') + '>' + esc(b.name) + '</option>').join('');
  const labels = (state.categories || []).map((c) => c.label);
  // The stored category may be an old POS value (e.g. ANUA, SERUM) that is
  // not one of the 16 clean labels — keep it as the selected option so the
  // form shows what the product has today instead of silently changing it.
  const curCat = p.category || '';
  const catOpts = (curCat && !labels.includes(curCat)
    ? '<option value="' + esc(curCat) + '" selected>' + esc(curCat) + '</option>' : '') +
    labels.map((l) => '<option value="' + esc(l) + '"' + (l === curCat ? ' selected' : '') + '>' + esc(l) + '</option>').join('');
  $('#addProductTitle').textContent = t('edit_product');
  $('#addProductBody').innerHTML =
    '<div class="field"><label>' + esc(t('product_name')) + ' *</label><input id="epName" type="text" value="' + esc(p.name) + '"></div>' +
    '<div class="field"><label>' + esc(t('brand')) + ' *</label><select id="epBrand">' + brandOpts + '<option value="__new">' + esc(t('new_brand')) + '</option></select></div>' +
    '<div class="field" id="epNewBrandField" hidden><label>' + esc(t('new_brand')) + '</label><input id="epNewBrand" type="text" placeholder="e.g. MEDICUBE"></div>' +
    '<div class="field"><label>' + esc(t('category')) + '</label><select id="epCategory">' + catOpts + '<option value="__new">' + esc(t('new_category')) + '</option></select></div>' +
    '<div class="field" id="epNewCatField" hidden><label>' + esc(t('new_category')) + '</label><input id="epNewCategory" type="text" placeholder="e.g. Toner"></div>' +
    '<div class="field"><label>' + esc(t('description')) + '</label><input id="epNote" type="text" value="' + esc(p.note || '') + '" placeholder="e.g. Skin type — all skin types"></div>' +
    '<div class="error-box" id="epError" hidden></div>' +
    '<button class="btn btn-primary btn-block" type="button" id="epSubmit">' + esc(t('save_changes')) + '</button>';
  $('#epBrand').addEventListener('change', () => { $('#epNewBrandField').hidden = $('#epBrand').value !== '__new'; });
  $('#epCategory').addEventListener('change', () => { $('#epNewCatField').hidden = $('#epCategory').value !== '__new'; });
  $('#epSubmit').addEventListener('click', async () => {
    const err = $('#epError'); err.hidden = true;
    const name = $('#epName').value.trim();
    const brandSel = $('#epBrand').value;
    const brand = brandSel === '__new' ? $('#epNewBrand').value.trim() : brandSel;
    const catSel = $('#epCategory').value;
    const category = catSel === '__new' ? $('#epNewCategory').value.trim() : catSel;
    const note = $('#epNote').value.trim();
    if (!name || !brand) { err.textContent = t('fill_all'); err.hidden = false; return; }
    const btn = $('#epSubmit'); btn.disabled = true;
    try {
      const updated = await api('/manage/products/' + encodeURIComponent(p.id), { method: 'PATCH', body: JSON.stringify({ name, brand, category, note }) });
      Object.assign(p, updated);
      paintMgCatalog();
      closeOverlay('#addProductOverlay', '#addProductModal');
      toast(t('saved'));
    } catch (e) {
      btn.disabled = false;
      err.textContent = (e.data && e.data.error === 'duplicate_product') ? t('duplicate_product') : t('error_load');
      err.hidden = false;
    }
  });
  openOverlay('#addProductOverlay', '#addProductModal');
}
async function loadMgCatalog(reset) {
  const wrap = $('#mgTableWrap');
  if (reset) { mgCatalog.offset = 0; mgCatalog.items = []; wrap.innerHTML = '<div class="loading">' + esc(t('loading')) + '</div>'; }
  const params = new URLSearchParams({ limit: String(PAGE), offset: String(mgCatalog.offset) });
  if (mgCatalog.q) params.set('q', mgCatalog.q);
  if (mgCatalog.filter === 'in' || mgCatalog.filter === 'out') params.set('stock', mgCatalog.filter);
  if (mgCatalog.filter === 'sale') params.set('sale', '1');
  try {
    const data = await api('/manage/products?' + params.toString());
    const items = data.items || [];
    if (data.counts) {
      for (const [k, v] of Object.entries(data.counts)) {
        const el = document.querySelector('[data-mgcount="' + k + '"]');
        if (el) el.textContent = '(' + v + ')';
      }
    }
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
      ' <button type="button" data-edit="' + esc(String(p.id)) + '" style="border:0;background:none;color:var(--accent);font-size:12px;padding:0 2px;cursor:pointer">✏️ ' + esc(t('edit_product')) + '</button>' +
      (p.image_url ? ' <button type="button" data-rmphoto="' + esc(String(p.id)) + '" title="' + esc(t('remove_photo')) + '" style="border:0;background:none;color:var(--muted);font-size:13px;padding:0 2px">✕</button>' : '') +
      (Array.isArray(p.options) && p.options.length ? '' :
        '<div style="display:flex;gap:6px;align-items:center;margin-top:4px">' +
        '<input type="text" value="' + esc(p.sku || '') + '" placeholder="SKU / Barcode" data-sku="' + esc(String(p.id)) + '" style="flex:1;min-width:0;padding:6px 8px;border:1.5px solid var(--line);border-radius:8px;font-size:12px">' +
        (window.Html5Qrcode ? '<button type="button" data-scansku="' + esc(String(p.id)) + '" title="' + esc(t('scan_title')) + '" style="border:1.5px solid var(--line);background:#fff;border-radius:8px;padding:6px 8px;font-size:14px;flex:none">📷</button>' : '') +
        '</div>') +
      (Array.isArray(p.options) && p.options.length ? '<div style="margin-top:6px">' + p.options.map((o) =>
        '<div style="display:flex;gap:6px;align-items:center;margin-top:4px"><span style="font-size:12px;color:var(--muted);flex:1;min-width:0">' + esc(o.label) + '</span>' +
        '<input type="number" min="1" step="500" value="' + o.price + '" data-optprice="' + esc(String(p.id)) + '" data-label="' + esc(o.label) + '" style="width:92px;padding:6px 8px;border:1.5px solid var(--line);border-radius:8px">' +
        '<input type="number" min="0" step="1" value="' + (o.stock != null ? o.stock : '') + '" placeholder="—" title="' + esc(t('stock_qty')) + ' — 0 = ' + esc(t('out_stock')) + '" data-optstock="' + esc(String(p.id)) + '" data-label="' + esc(o.label) + '" style="width:64px;padding:6px 8px;border:1.5px solid var(--line);border-radius:8px">' +
        '<input type="text" value="' + esc(o.sku || '') + '" placeholder="SKU" data-optsku="' + esc(String(p.id)) + '" data-label="' + esc(o.label) + '" style="width:110px;padding:6px 8px;border:1.5px solid var(--line);border-radius:8px;font-size:12px"></div>').join('') + '</div>' : '') +
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
  // SKU / barcode (fix-batch-51): editable inline, like price and stock.
  // A duplicate barcode is refused by the server (duplicate_sku).
  $$('[data-sku]', wrap).forEach((inp) => {
    inp.addEventListener('change', async () => {
      const val = inp.value.trim();
      try {
        await api('/manage/products/' + encodeURIComponent(inp.dataset.sku), { method: 'PATCH', body: JSON.stringify({ sku: val || null }) });
        const item = mgCatalog.items.find((x) => String(x.id) === inp.dataset.sku);
        if (item) item.sku = val || null;
        toast(t('saved'));
      } catch (e) { toast((e.data && e.data.error === 'duplicate_sku') ? t('duplicate_sku') : t('error_load')); paintMgCatalog(); }
    });
  });
  $$('[data-optsku]', wrap).forEach((inp) => {
    inp.addEventListener('change', async () => {
      const val = inp.value.trim();
      try {
        const updated = await api('/manage/products/' + encodeURIComponent(inp.dataset.optsku), { method: 'PATCH', body: JSON.stringify({ option_skus: { [inp.dataset.label]: val || null } }) });
        const item = mgCatalog.items.find((x) => String(x.id) === inp.dataset.optsku);
        if (item && updated) { Object.assign(item, updated); paintMgCatalog(); }
        toast(t('saved'));
      } catch (e) { toast((e.data && e.data.error === 'duplicate_sku') ? t('duplicate_sku') : t('error_load')); paintMgCatalog(); }
    });
  });
  $$('[data-scansku]', wrap).forEach((b) => {
    b.addEventListener('click', () => openBarcodeScanner((code) => {
      const inp = wrap.querySelector('[data-sku="' + b.dataset.scansku + '"]');
      if (!inp) return;
      inp.value = code;
      inp.dispatchEvent(new Event('change'));
    }));
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
  // Edit name / brand / category / description for a product.
  $$('[data-edit]', wrap).forEach((b) => b.addEventListener('click', () => openEditProduct(b.dataset.edit)));
}
async function renderManageCoupons(body) {
  body.innerHTML = '<div class="mg-card"><h3>Coupons</h3>' +
    '<div class="row-flex">' +
    '<input id="cpCode" type="text" placeholder="' + esc(t('coupon_code')) + '" style="text-transform:uppercase;padding:10px 12px;border:1.5px solid var(--line);border-radius:10px;flex:1;min-width:170px">' +
    '<select id="cpType" style="padding:10px;border:1.5px solid var(--line);border-radius:10px;width:150px;flex-shrink:0"><option value="percent">' + esc(t('percent')) + '</option><option value="fixed">' + esc(t('fixed')) + '</option></select>' +
    '<input id="cpValue" type="number" min="0" placeholder="' + esc(t('coupon_value')) + '" style="padding:10px 12px;border:1.5px solid var(--line);border-radius:10px;width:110px">' +
    '</div>' +
    '<div style="margin-top:14px;font-weight:700">' + esc(t('coupon_validity')) + '</div>' +
    '<div class="cp-date-row" style="margin-top:6px">' +
    '<label style="flex:1;min-width:280px;max-width:320px"><span style="font-size:13px;color:var(--muted)">' + esc(t('coupon_valid_from')) + '</span>' +
    '<input id="cpValidFrom" type="datetime-local" style="width:100%;padding:8px 10px;border:1.5px solid var(--line);border-radius:10px;margin-top:4px;font-size:13px;background:#fff;text-align:left"></label>' +
    '<label style="flex:1;min-width:280px;max-width:320px"><span style="font-size:13px;color:var(--muted)">' + esc(t('coupon_valid_until')) + '</span>' +
    '<input id="cpValidUntil" type="datetime-local" style="width:100%;padding:8px 10px;border:1.5px solid var(--line);border-radius:10px;margin-top:4px;font-size:13px;background:#fff;text-align:left"></label></div>' +
    '<div style="margin-top:4px;font-size:12px;color:var(--muted)">' + esc(t('coupon_validity_hint')) + '</div>' +
    '<div style="margin-top:14px;font-weight:700">' + esc(t('coupon_usage_limit')) + '</div>' +
    '<div class="row-flex" style="margin-top:6px"><input id="cpUsageLimit" type="number" min="1" placeholder="' + esc(t('coupon_usage_limit')) + '" style="padding:10px 12px;border:1.5px solid var(--line);border-radius:10px;width:140px">' +
    '<label style="display:flex;align-items:center;gap:8px;font-size:14px"><input id="cpNewOnly" type="checkbox" style="width:18px;height:18px"> ' + esc(t('coupon_new_customer_only')) + '</label></div>' +
    '<div style="margin-top:4px;font-size:12px;color:var(--muted)">' + esc(t('coupon_usage_limit_hint')) + '</div>' +
    '<div style="margin-top:10px"><label style="display:flex;gap:8px;align-items:flex-start;font-size:14px"><input id="cpStackable" type="checkbox" style="width:18px;height:18px;margin-top:2px"> <span>' + esc(t('coupon_stackable')) + '<br><span style="font-size:12px;color:var(--muted)">' + esc(t('coupon_stackable_hint')) + '</span></span></label></div>' +
    '<div style="margin-top:14px;font-weight:700">' + esc(t('coupon_scope')) + '</div>' +
    '<div style="margin-top:8px;font-size:13px;color:var(--muted)">' + esc(t('scope_brands')) + '</div>' +
    '<div id="cpBrandChips" class="chips" style="margin-top:4px"></div>' +
    '<div style="margin-top:10px;font-size:13px;color:var(--muted)">' + esc(t('scope_products')) + '</div>' +
    '<div class="row-flex" style="margin-top:4px"><input id="cpProdSearch" type="search" placeholder="' + esc(t('search_products_ph')) + '" style="flex:1;padding:10px 12px;border:1.5px solid var(--line);border-radius:10px;min-width:140px">' +
    '<button class="btn btn-outline" type="button" id="cpProdSearchBtn">' + esc(t('search_btn')) + '</button></div>' +
    '<div id="cpProdResults" style="margin-top:6px"></div>' +
    '<div id="cpProdPicked" style="margin-top:6px"></div>' +
    '<div style="margin-top:4px;font-size:12px;color:var(--muted)">' + esc(t('coupon_product_qty_hint')) + '</div>' +
    '<div style="margin-top:10px;font-size:13px;color:var(--muted)">' + esc(t('scope_customers')) + '</div>' +
    '<div class="row-flex" style="margin-top:4px"><input id="cpCustPhone" type="tel" placeholder="09…" style="flex:1;padding:10px 12px;border:1.5px solid var(--line);border-radius:10px;min-width:140px">' +
    '<button class="btn btn-outline" type="button" id="cpCustAddBtn">' + esc(t('add')) + '</button></div>' +
    '<div style="margin-top:4px;font-size:12px;color:var(--muted)">' + esc(t('scope_customers_hint')) + '</div>' +
    '<div id="cpCustPicked" class="chips" style="margin-top:6px"></div>' +
    '<div style="margin-top:16px"><button class="btn btn-primary" type="button" id="cpAddBtn" style="width:100%;padding:12px">' + esc(t('add')) + '</button>' +
    '<button class="btn ghost" type="button" id="cpCancelEdit" hidden style="width:100%;padding:10px;margin-top:8px">' + esc(t('cancel')) + '</button></div>' +
    '<div id="cpList" style="margin-top:14px"></div></div>';
  const selBrands = new Set();
  const selProducts = new Map();
  const selProductQtys = new Map();
  const selCustomers = new Set();
  let editingCode = null;
  let couponsCache = [];
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
    // Picked products are a vertical list (fix-batch-49): full name + qty
    // box beside each one, so long names stay readable and the cap is set
    // right where the product is. Brand chips and customer phones stay as
    // pills — they are short.
    $('#cpProdPicked').innerHTML = Array.from(selProducts.entries()).map(([id, p]) =>
      '<div class="cp-picked-row"><div class="cp-picked-info"><div class="cp-picked-name">' + esc(p.name) + '</div>' +
      ((p.brand || p.price) ? '<div class="cp-picked-meta">' + esc(p.brand || '') + ((p.brand && p.price) ? ' • ' : '') + (p.price ? fmt(p.price) : '') + '</div>' : '') + '</div>' +
      '<input type="number" min="1" class="cp-picked-qty" data-qtyprod="' + esc(String(id)) + '" placeholder="' + esc(t('coupon_product_qty')) + '" value="' + esc(selProductQtys.has(id) ? String(selProductQtys.get(id)) : '') + '">' +
      '<button type="button" class="cp-picked-x" data-unpick="' + esc(String(id)) + '">✕</button></div>').join('');
    $$('[data-unpick]', $('#cpProdPicked')).forEach((b) => b.addEventListener('click', () => { selProducts.delete(b.dataset.unpick); selProductQtys.delete(b.dataset.unpick); paintPicked(); }));
    $$('[data-qtyprod]', $('#cpProdPicked')).forEach((inp) => inp.addEventListener('input', () => {
      const v = inp.value.trim();
      if (v === '') selProductQtys.delete(inp.dataset.qtyprod);
      else selProductQtys.set(inp.dataset.qtyprod, Number(v));
    }));
    $('#cpCustPicked').innerHTML = Array.from(selCustomers).map((ph) =>
      '<span class="chip active">' + esc(ph) + ' <button type="button" data-uncust="' + esc(ph) + '" style="border:0;background:none;color:inherit;font-size:14px;padding:0 2px">✕</button></span>').join('');
    $$('[data-uncust]', $('#cpCustPicked')).forEach((b) => b.addEventListener('click', () => { selCustomers.delete(b.dataset.uncust); paintPicked(); }));
  };
  // Live autocomplete (fix-batch-49): typing searches automatically (300ms
  // debounce, min 2 chars); picking clears the box and the results. The
  // Search button and Enter still work the same way.
  let cpSearchSeq = 0;
  let cpSearchTimer = null;
  const searchProducts = async () => {
    const q = $('#cpProdSearch').value.trim();
    const res = $('#cpProdResults');
    if (!q || q.length < 2) { res.innerHTML = ''; return; }
    const seq = ++cpSearchSeq;
    res.innerHTML = '<div class="loading">' + esc(t('loading')) + '</div>';
    try {
      const data = await api('/manage/products?q=' + encodeURIComponent(q) + '&limit=10');
      if (seq !== cpSearchSeq) return;
      const items = data.items || [];
      if (!items.length) { res.innerHTML = '<div class="empty">' + esc(t('no_products_found')) + '</div>'; return; }
      res.innerHTML = items.map((p) => '<button type="button" class="order-card" data-pickprod="' + esc(String(p.id)) + '" data-pickname="' + esc(p.name) + '" data-pickbrand="' + esc(p.brand || '') + '" data-pickprice="' + esc(String(p.price)) + '" style="text-align:left"><span>' + esc(p.name) + '</span><div class="oc-meta">' + esc(p.brand || '') + ' • ' + fmt(p.price) + '</div></button>').join('');
      $$('[data-pickprod]', res).forEach((b) => b.addEventListener('click', () => {
        if (!selProducts.has(b.dataset.pickprod)) selProducts.set(b.dataset.pickprod, { name: b.dataset.pickname, brand: b.dataset.pickbrand || '', price: Number(b.dataset.pickprice) || 0 });
        paintPicked();
        $('#cpProdSearch').value = '';
        res.innerHTML = '';
      }));
    } catch (e) { if (seq === cpSearchSeq) res.innerHTML = '<div class="error-box">' + esc(t('error_load')) + '</div>'; }
  };
  $('#cpProdSearch').addEventListener('input', () => {
    clearTimeout(cpSearchTimer);
    cpSearchTimer = setTimeout(searchProducts, 300);
  });
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
      couponsCache = list;
      if (!list.length) { listEl.innerHTML = '<div class="empty">' + esc(t('no_coupons')) + '</div>'; return; }
      listEl.innerHTML = list.map((c) =>
        '<div class="pay-account"><div class="pa-info"><div class="pa-method">' + esc(c.code) + '</div>' +
        '<div class="pa-name">' + esc(c.type) + ' — ' + esc(String(c.value)) + (c.type === 'percent' ? '%' : ' Ks') + '</div>' +
        '<div class="pa-name" style="font-size:12px;color:var(--muted)">' + esc(couponScopeText(c)) + '</div>' +
        '<div class="pa-name" style="font-size:12px;color:var(--muted)">' + esc(couponValidityText(c)) + ' • ' + esc(couponValidityTag(c)) + (c.stackable === false ? ' • ' + esc(t('coupon_not_stackable')) : '') + '</div>' +
        '<div class="pa-name" style="font-size:12px;color:var(--muted)">' + esc(couponUsageText(c)) + '</div>' +
        (couponProductQtyText(c) ? '<div class="pa-name" style="font-size:12px;color:var(--muted)">' + esc(couponProductQtyText(c)) + '</div>' : '') + '</div>' +
        '<div style="display:flex;flex-direction:column;gap:6px">' +
        '<button type="button" class="btn btn-outline mini" data-editcp="' + esc(c.code) + '">' + esc(t('coupon_edit')) + '</button>' +
        '<button type="button" class="btn btn-danger mini" data-delcp="' + esc(c.code) + '">' + esc(t('del')) + '</button></div></div>').join('');
      $$('[data-delcp]', listEl).forEach((b) => b.addEventListener('click', async () => {
        if (!window.confirm(t('confirm_delete'))) return;
        try {
          await api('/manage/coupons/' + encodeURIComponent(b.dataset.delcp), { method: 'DELETE' });
          toast(t('deleted')); load();
        } catch (e) { toast(t('error_load')); }
      }));
      $$('[data-editcp]', listEl).forEach((b) => b.addEventListener('click', () => startEdit(b.dataset.editcp)));
    } catch (e) { listEl.innerHTML = '<div class="error-box">' + esc(t('error_load')) + '</div>'; }
  };
  const resetForm = () => {
    editingCode = null;
    $('#cpCode').value = ''; $('#cpCode').disabled = false;
    $('#cpType').value = 'percent'; $('#cpValue').value = '';
    $('#cpValidFrom').value = ''; $('#cpValidUntil').value = '';
    $('#cpUsageLimit').value = ''; $('#cpNewOnly').checked = false; $('#cpStackable').checked = false;
    selBrands.clear(); selProducts.clear(); selProductQtys.clear(); selCustomers.clear();
    $$('[data-cpbrand]', brandWrap).forEach((ch) => ch.classList.remove('active'));
    paintPicked();
    $('#cpAddBtn').textContent = t('add');
    $('#cpCancelEdit').hidden = true;
  };
  // Edit mode (fix-batch-48): pre-fill the form with the coupon's values.
  // The code is the coupon's identity, so it stays locked while editing.
  const startEdit = (code) => {
    const c = couponsCache.find((x) => x.code === code);
    if (!c) return;
    editingCode = c.code;
    $('#cpCode').value = c.code; $('#cpCode').disabled = true;
    $('#cpType').value = c.type || 'percent'; $('#cpValue').value = String(c.value);
    $('#cpValidFrom').value = isoToYangonInput(c.valid_from);
    $('#cpValidUntil').value = isoToYangonInput(c.valid_until);
    $('#cpUsageLimit').value = c.usage_limit != null ? String(c.usage_limit) : '';
    $('#cpNewOnly').checked = !!c.new_customer_only;
    $('#cpStackable').checked = c.stackable !== false;
    selBrands.clear(); (c.brands || []).forEach((b) => selBrands.add(b));
    selProducts.clear();
    (c.products || []).forEach((id, i) => selProducts.set(id, { name: (c.product_names && c.product_names[i]) || id, brand: '', price: 0 }));
    selProductQtys.clear();
    if (c.product_qtys) Object.entries(c.product_qtys).forEach(([id, q]) => selProductQtys.set(id, q));
    selCustomers.clear(); (c.customers || []).forEach((p) => selCustomers.add(p));
    $$('[data-cpbrand]', brandWrap).forEach((ch) => ch.classList.toggle('active', selBrands.has(ch.dataset.cpbrand)));
    paintPicked();
    $('#cpAddBtn').textContent = t('save');
    $('#cpCancelEdit').hidden = false;
    $('#cpCode').scrollIntoView({ block: 'center' });
  };
  $('#cpAddBtn').addEventListener('click', async () => {
    const code = $('#cpCode').value.trim().toUpperCase();
    const type = $('#cpType').value;
    const value = Number($('#cpValue').value);
    if (!code || !value) { toast(t('fill_all')); return; }
    const productQtys = {};
    selProductQtys.forEach((v, k) => { if (Number.isInteger(v) && v >= 1) productQtys[k] = v; });
    const body = { code: code, type: type, value: value, valid_from: yangonInputToISO($('#cpValidFrom').value), valid_until: yangonInputToISO($('#cpValidUntil').value), usage_limit: $('#cpUsageLimit').value ? Number($('#cpUsageLimit').value) : null, new_customer_only: $('#cpNewOnly').checked, stackable: $('#cpStackable').checked, product_qtys: Object.keys(productQtys).length ? productQtys : null, brands: Array.from(selBrands), products: Array.from(selProducts.keys()), customers: Array.from(selCustomers) };
    try {
      if (editingCode) await api('/manage/coupons/' + encodeURIComponent(editingCode), { method: 'PUT', body: JSON.stringify(body) });
      else await api('/manage/coupons', { method: 'POST', body: JSON.stringify(body) });
      toast(t('saved'));
      resetForm();
      load();
    } catch (e) { toast(t('error_load')); }
  });
  $('#cpCancelEdit').addEventListener('click', resetForm);
  paintPicked();
  load();
}
/* ---------------- manage: hero banner (fix-batch-44) ---------------- */
/* ---------------- manage: VIP settings ---------------- */
// VIP program rules (fix-batch-52): the tiers and thresholds change often,
// so the admin edits them here. Saved to settings; future orders use the
// new values, placed orders keep theirs.
async function renderManageVip(body) {
  body.innerHTML = '<div class="mg-card"><h3>' + esc(t('vip_settings')) + '</h3><div id="vipSettingsWrap"><div class="loading">' + esc(t('loading')) + '</div></div></div>';
  const wrap = $('#vipSettingsWrap');
  let s;
  try { s = await api('/manage/vip-settings'); } catch (e) { wrap.innerHTML = '<div class="error-box">' + esc(t('error_load')) + '</div>'; return; }
  const tiers = (s.tiers || []).slice(0, 5);
  while (tiers.length < 3) tiers.push({ min: 0, pct: 0 });
  wrap.innerHTML =
    '<div class="field"><label><input type="checkbox" id="vipEnabled"' + (s.enabled !== false ? ' checked' : '') + '> ' + esc(t('vip_enabled')) + '</label></div>' +
    '<div class="field"><label>' + esc(t('vip_grant_threshold')) + ' (Ks)</label><input id="vipGrant" type="number" min="0" step="1000" value="' + (s.grant_threshold || 0) + '"></div>' +
    '<div class="field"><label>' + esc(t('vip_renewal_threshold')) + ' (Ks)</label><input id="vipRenewal" type="number" min="0" step="1000" value="' + (s.renewal_threshold || 0) + '"></div>' +
    '<div class="field"><label>' + esc(t('vip_validity_months')) + '</label><input id="vipValidity" type="number" min="1" max="60" step="1" value="' + (s.validity_months || 12) + '"></div>' +
    '<div class="field"><label>' + esc(t('vip_birthday_extra')) + '</label><input id="vipBdayExtra" type="number" min="0" max="100" step="1" value="' + (s.birthday_extra_pct || 0) + '"></div>' +
    '<div style="font-size:13px;font-weight:700;margin:12px 0 6px">' + esc(t('vip')) + ' %</div>' +
    tiers.map((tier, i) =>
      '<div class="row-flex" style="margin-top:6px;align-items:center"><span style="min-width:52px;font-size:13px">Tier ' + (i + 1) + '</span>' +
      '<input type="number" min="0" step="1000" data-vipmin="' + i + '" value="' + tier.min + '" placeholder="Ks" style="flex:1;padding:8px 10px;border:1.5px solid var(--line);border-radius:8px;min-width:0">' +
      '<input type="number" min="0" max="100" step="1" data-vippct="' + i + '" value="' + tier.pct + '" placeholder="%" style="width:84px;padding:8px 10px;border:1.5px solid var(--line);border-radius:8px">%</div>').join('') +
    '<div class="hint" style="margin-top:8px">' + esc(t('vip_tier_hint')) + '</div>' +
    '<div class="error-box" id="vipSettingsError" hidden></div>' +
    '<button class="btn btn-primary btn-block" type="button" id="vipSettingsSave" style="margin-top:12px">' + esc(t('save')) + '</button>';
  $('#vipSettingsSave').addEventListener('click', async () => {
    const err = $('#vipSettingsError'); err.hidden = true;
    const newTiers = $$('[data-vipmin]').map((inp, i) => ({
      min: Number(inp.value),
      pct: Number(document.querySelector('[data-vippct="' + i + '"]').value),
    }));
    const btn = $('#vipSettingsSave'); btn.disabled = true;
    try {
      await api('/manage/vip-settings', { method: 'PUT', body: JSON.stringify({
        enabled: $('#vipEnabled').checked,
        grant_threshold: Number($('#vipGrant').value),
        renewal_threshold: Number($('#vipRenewal').value),
        validity_months: Number($('#vipValidity').value),
        birthday_extra_pct: Number($('#vipBdayExtra').value),
        tiers: newTiers,
      }) });
      toast(t('saved'));
      loadManage('vip');
    } catch (e) {
      btn.disabled = false;
      err.textContent = t('error_load');
      err.hidden = false;
    }
  });
}
async function renderManageBanner(body) {
  body.innerHTML =
    '<div class="mg-card">' +
    '<h3 style="margin:0 0 6px">' + esc(t('hero_banner')) + '</h3>' +
    '<div class="hint" style="margin-bottom:10px">' + esc(t('hero_banner_hint')) + '</div>' +
    '<div id="mgHeroPreview" style="margin-bottom:10px"></div>' +
    '<div class="row-flex">' +
    '<label class="btn" style="cursor:pointer">' + esc(t('hero_upload')) +
    '<input id="mgHeroInput" type="file" accept="image/*" hidden></label>' +
    '<button id="mgHeroRemove" class="btn ghost" type="button">' + esc(t('hero_remove')) + '</button>' +
    '</div>' +
    '<div id="mgHeroMsg" class="hint" style="margin-top:8px"></div>' +
    '</div>';
  const preview = $('#mgHeroPreview');
  const msg = $('#mgHeroMsg');
  async function refresh() {
    try {
      const data = await api('/hero');
      preview.innerHTML = (data && data.image_url)
        ? '<img src="' + esc(data.image_url) + '" alt="banner" style="display:block;width:100%;height:auto;border-radius:12px">'
        : '<div class="empty">' + esc(t('hero_no_image')) + '</div>';
    } catch (e) {
      preview.innerHTML = '<div class="error-box">' + esc(t('error_load')) + '</div>';
    }
  }
  await refresh();
  $('#mgHeroInput').addEventListener('change', async (ev) => {
    const file = ev.target.files && ev.target.files[0];
    if (!file) return;
    if (!file.type || file.type.indexOf('image/') !== 0) { msg.textContent = t('error_load'); return; }
    msg.textContent = t('loading');
    try {
      const dataUrl = await downscaleImage(file, 1200);
      await api('/manage/hero', { method: 'PUT', body: JSON.stringify({ image_url: dataUrl }) });
      msg.textContent = t('hero_saved');
      await refresh();
      loadHero();
    } catch (e) {
      msg.textContent = t('error_load') + (e && e.message ? ' (' + e.message + ')' : '');
    }
    ev.target.value = '';
  });
  $('#mgHeroRemove').addEventListener('click', async () => {
    if (!window.confirm(t('hero_remove') + '?')) return;
    msg.textContent = t('loading');
    try {
      await api('/manage/hero', { method: 'PUT', body: JSON.stringify({ image_url: null }) });
      msg.textContent = t('hero_saved');
      await refresh();
      loadHero();
    } catch (e) {
      msg.textContent = t('error_load') + (e && e.message ? ' (' + e.message + ')' : '');
    }
  });
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
    '<button class="btn btn-outline" type="button" id="wooDisconnect">' + esc(t('woo_disconnect')) + '</button>' +
    '</div><div id="wooMsg" class="meta-line" style="margin-top:10px"></div>' +
    '<div id="wooResult"></div></div>' +
    // Move WooCommerce photos into this shop (fix-batch-20): the photos
    // still point at the old WordPress site, so they break whenever that
    // site is slow or down. Browser route fetches each photo from here
    // (Myanmar is allowed in); ZIP route is the fallback if WordPress
    // does not allow cross-origin reads.
    '<div class="mg-card"><h3>' + esc(t('mig_title')) + '</h3>' +
    '<div class="meta-line">' + esc(t('mig_intro')) + '</div>' +
    '<div id="migStatus" class="meta-line">' + esc(t('loading')) + '</div>' +
    '<div class="row-flex">' +
    '<button class="btn btn-outline" type="button" id="migCheck">' + esc(t('mig_check')) + '</button>' +
    '<button class="btn btn-primary" type="button" id="migMove" disabled>' + esc(t('mig_move')) + '</button>' +
    '<button class="btn btn-outline" type="button" id="migStop" hidden>' + esc(t('mig_stop')) + '</button>' +
    '</div><div id="migMsg" class="meta-line" style="margin-top:10px"></div>' +
    '<div id="migProgress" class="meta-line"></div>' +
    '<div id="migFails" style="margin-top:8px"></div>' +
    '<h4 style="margin-top:14px">' + esc(t('mig_zip_title')) + '</h4>' +
    '<div class="meta-line">' + esc(t('mig_zip_hint')) + '</div>' +
    '<div class="field"><input id="migZip" type="file" accept=".zip,application/zip"></div>' +
    '<button class="btn btn-outline" type="button" id="migZipBtn">' + esc(t('mig_zip_btn')) + '</button>' +
    '<div id="migZipMsg" class="meta-line" style="margin-top:10px"></div>' +
    '<h4 style="margin-top:14px">' + esc(t('mig_remove_title')) + '</h4>' +
    '<div class="meta-line">' + esc(t('mig_remove_hint')) + '</div>' +
    '<button class="btn btn-outline" type="button" id="migRemoveExternal">' + esc(t('mig_remove_btn')) + '</button>' +
    '<div id="migRemoveMsg" class="meta-line" style="margin-top:10px"></div></div>';
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
  // Disconnect: clear the saved site URL + key + secret. The server
  // accepts explicit empty strings here; products, orders and photos
  // in the shop's own database are not touched.
  $('#wooDisconnect').addEventListener('click', async () => {
    if (!window.confirm(t('confirm_disconnect'))) return;
    try {
      await api('/manage/settings/woocommerce', { method: 'PUT', body: JSON.stringify({ site_url: '', consumer_key: '', consumer_secret: '' }) });
      $('#wooStatus').textContent = t('wc_not_configured');
      $('#wooSite').value = '';
      $('#wooKeySaved').textContent = '—';
      $('#wooSecretSaved').textContent = '—';
      $('#wooKey').value = ''; $('#wooSecret').value = '';
      $('#wooMsg').textContent = t('disconnected');
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

  // --- Move photos into the shop ---
  let migList = null;
  let migStop = false;
  async function loadMigStatus() {
    try {
      migList = await api('/manage/migrate-images/list');
      $('#migStatus').textContent = t('mig_status') + ': ' + migList.external + ' · ' + t('mig_moved') + ': ' + migList.migrated + ' · ' + t('mig_noimg') + ': ' + migList.no_image;
    } catch (e) { $('#migStatus').textContent = t('error_load'); }
  }
  await loadMigStatus();
  $('#migCheck').addEventListener('click', async () => {
    $('#migMsg').textContent = t('loading');
    try {
      if (!migList || !migList.items.length) { $('#migMsg').textContent = t('mig_done'); return; }
      const probe = migList.items[0].image_url;
      const res = await fetch(probe, { mode: 'cors' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const ct = res.headers.get('content-type') || '';
      if (ct.indexOf('image/') !== 0) throw new Error('not an image');
      $('#migMsg').textContent = t('mig_check_ok');
      $('#migMove').disabled = false;
    } catch (e) { $('#migMsg').textContent = t('mig_check_fail'); }
  });
  $('#migMove').addEventListener('click', async () => {
    if (!migList || !migList.items.length) return;
    migStop = false;
    $('#migMove').disabled = true; $('#migStop').hidden = false;
    $('#migFails').innerHTML = '';
    let done = 0;
    let failed = 0;
    const failedNames = [];
    for (const item of migList.items) {
      if (migStop) break;
      $('#migProgress').textContent = t('mig_moving') + ' ' + (done + failed + 1) + ' / ' + migList.items.length;
      try {
        const res = await fetch(item.image_url, { mode: 'cors' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const blob = await res.blob();
        const dataUrl = await downscaleImage(blob);
        await api('/manage/products/' + item.id + '/image', { method: 'POST', body: JSON.stringify({ image_data: dataUrl, migrate: true }) });
        done++;
      } catch (e) { failed++; failedNames.push(item.name); }
      await new Promise((r) => setTimeout(r, 120));
    }
    try { await api('/manage/migrate-images/summary', { method: 'POST', body: JSON.stringify({ migrated: done, failed: failed, failed_names: failedNames }) }); } catch (e) {}
    $('#migProgress').textContent = '';
    $('#migMsg').textContent = t('mig_done') + ' — ' + t('mig_moved') + ': ' + done + (failed ? ' · ' + t('mig_failed') + ': ' + failed : '');
    if (failedNames.length) $('#migFails').innerHTML = '<div class="error-box">' + failedNames.map((n) => esc(n)).join('<br>') + '</div>';
    $('#migStop').hidden = true;
    await loadMigStatus();
    loadBrands(); loadTypes(); loadHomeGrid(true);
  });
  $('#migStop').addEventListener('click', () => { migStop = true; });
  $('#migZipBtn').addEventListener('click', async () => {
    const f = $('#migZip').files[0];
    if (!f) { $('#migZipMsg').textContent = t('fill_all'); return; }
    $('#migZipMsg').textContent = t('loading');
    try {
      const res = await fetch('/api/manage/migrate-images/zip', { method: 'POST', headers: { 'Authorization': 'Bearer ' + state.token, 'Content-Type': 'application/zip' }, body: f });
      const r = await res.json();
      if (!res.ok) throw new Error((r && r.error) || ('HTTP ' + res.status));
      $('#migZipMsg').textContent = t('mig_zip_done') + ' — ' + t('mig_moved') + ': ' + r.migrated + ' / ' + r.total_external;
      if (r.missing && r.missing.length) $('#migZipMsg').innerHTML += '<br>' + esc(t('mig_failed')) + ': ' + r.missing.slice(0, 20).map((n) => esc(n)).join(', ') + (r.missing.length > 20 ? '…' : '');
      if (r.too_large && r.too_large.length) $('#migZipMsg').innerHTML += '<br>Too large: ' + r.too_large.slice(0, 20).map((n) => esc(n)).join(', ');
      if (r.ambiguous && r.ambiguous.length) $('#migZipMsg').innerHTML += '<br>Ambiguous: ' + r.ambiguous.slice(0, 20).map((n) => esc(n)).join(', ');
      await loadMigStatus();
      loadBrands(); loadTypes(); loadHomeGrid(true);
    } catch (e) { $('#migZipMsg').textContent = t('error_load') + (e && e.message ? ' (' + e.message + ')' : ''); }
  });
  // Remove all external (WP-hosted) photos so staff can see which
  // products still need a photo. Shop-stored photos are untouched.
  $('#migRemoveExternal').addEventListener('click', async () => {
    if (!window.confirm(t('confirm_remove_external'))) return;
    $('#migRemoveMsg').textContent = t('loading');
    try {
      const r = await api('/manage/migrate-images/remove-external', { method: 'POST' });
      $('#migRemoveMsg').textContent = t('mig_removed') + ' — ' + r.removed;
      await loadMigStatus();
      loadBrands(); loadTypes(); loadHomeGrid(true);
    } catch (e) { $('#migRemoveMsg').textContent = t('error_load') + (e && e.message ? ' (' + e.message + ')' : ''); }
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
  $('#notifBell').addEventListener('click', openNotifications);
  $('#notifClose').addEventListener('click', () => closeOverlay('#notifOverlay', '#notifModal'));
  // Foreground push banner (fix-batch-31): tap → that order (or the
  // inbox); × dismisses. The banner itself is only ever shown from a
  // push, so these handlers are harmless on the plain website.
  $('#pushBannerBody').addEventListener('click', () => {
    const orderId = pushBannerOrderId;
    hidePushBanner();
    try { goToNotificationOrder(orderId); } catch (e) { /* navigation must never break the shop */ }
  });
  $('#pushBannerClose').addEventListener('click', () => hidePushBanner());
  $('#notifOverlay').addEventListener('click', (ev) => { if (ev.target === $('#notifOverlay')) closeOverlay('#notifOverlay', '#notifModal'); });
  // Coming back to the tab/app refreshes the bell — a notification that
  // arrived while the page was hidden shows up without waiting for the
  // 30s poll.
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && state.token && state.user) loadNotifications();
  });
  $('#authClose').addEventListener('click', closeAuth);
  $('#authOverlay').addEventListener('click', (ev) => { if (ev.target === $('#authOverlay')) closeAuth(); });
  $$('#authTabs .tab').forEach((b) => b.addEventListener('click', () => setAuthTab(b.dataset.atab)));
  $('#authSubmit').addEventListener('click', submitAuth);
  $('#authForgotLink').addEventListener('click', showForgotPanel);
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
  $('#addProductClose').addEventListener('click', () => closeOverlay('#addProductOverlay', '#addProductModal'));
  $('#addProductOverlay').addEventListener('click', (ev) => { if (ev.target === $('#addProductOverlay')) closeOverlay('#addProductOverlay', '#addProductModal'); });
  $('#checkoutBtn').addEventListener('click', () => { if (state.cart.length) openCheckout(); });
  $('#playStoreBtn').addEventListener('click', () => onAppButton('play_store_url'));
  $('#appStoreBtn').addEventListener('click', () => onAppButton('app_store_url'));
  // Messenger links (floating button + footer): try the Messenger app first,
  // fall back to the web link if the app is not installed.
  ['#msgFabLink', '#messengerLink'].forEach((sel) => { const el = $(sel); if (el) el.addEventListener('click', openMessenger); });
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

/* ---------------- push notifications (fix-batch-29, staff order alerts) ----------------
   Runs ONLY inside the Capacitor app: the shop website in a normal browser
   has no window.Capacitor, so this is a no-op there. When the native app
   is present, ask for push permission, register with FCM and send the
   device token to the shop server (only while logged in). Every failure
   is swallowed silently — push must never break the shop.
   Token delivery uses the normal api() (with its auto-retry), and the
   server upserts by token, so re-registering is harmless. */
let pushRegistered = false;
async function registerPushToken() {
  try {
    if (pushRegistered || !state.token) return;
    const cap = typeof window !== 'undefined' ? window.Capacitor : null;
    const PN = cap && cap.Plugins && cap.Plugins.PushNotifications;
    if (!PN) return;
    const platform = (cap.getPlatform && cap.getPlatform()) || 'android';
    if (platform !== 'android' && platform !== 'ios') return;
    pushRegistered = true; // one registration attempt per page load
    const perm = await PN.requestPermissions();
    if (!perm || perm.receive !== 'granted') return;
    // Foreground + tap handlers (fix-batch-31): added once per page load,
    // next to the token registration, so a push that arrives while the
    // app is open (or is tapped from the system tray) is never lost.
    if (!pushListenersAdded) {
      pushListenersAdded = true;
      try { PN.addListener('pushNotificationReceived', onForegroundPush); } catch (e) { /* silent */ }
      try { PN.addListener('pushNotificationActionPerformed', onPushActionPerformed); } catch (e) { /* silent */ }
    }
    PN.addListener('registration', async (reg) => {
      try {
        if (reg && reg.value) {
          await api('/devices/register', { method: 'POST', body: JSON.stringify({ token: reg.value, platform }) });
        }
      } catch (e) { /* token delivery must never break the shop */ }
    });
    PN.addListener('registrationError', () => {});
    await PN.register();
  } catch (e) { /* push unavailable — shop works exactly as before */ }
}

/* ---------------- foreground push banner (fix-batch-31) ----------------
   Android shows NO system notification while the app is open — the
   Capacitor plugin hands the message to the app via
   pushNotificationReceived instead, and without a listener nothing
   visible happens (that's why Test push said 1 ✓ / 0 ✗ but nothing
   appeared on the tablet). The banner below is the visible half:
   title + body, tap → that order (or the inbox), × / 6s auto-dismiss.
   pushNotificationActionPerformed covers the system-notification tap
   (background / killed app). Every handler is wrapped so push handling
   can never break the shop. */
let pushBannerTimer = null;
let pushBannerOrderId = null;
let pushListenersAdded = false;

function showPushBanner(title, body, orderId) {
  try {
    const bar = $('#pushBanner');
    const titleEl = $('#pushBannerTitle');
    const textEl = $('#pushBannerText');
    if (!bar || !titleEl || !textEl) return;
    titleEl.textContent = title || t('notif_title');
    textEl.textContent = body || '';
    const closeBtn = $('#pushBannerClose');
    if (closeBtn) closeBtn.setAttribute('aria-label', t('push_banner_close'));
    pushBannerOrderId = orderId || null;
    bar.hidden = false;
    if (pushBannerTimer) clearTimeout(pushBannerTimer);
    pushBannerTimer = setTimeout(hidePushBanner, 6000);
  } catch (e) { /* banner must never break the shop */ }
}

function hidePushBanner() {
  try {
    if (pushBannerTimer) { clearTimeout(pushBannerTimer); pushBannerTimer = null; }
    const bar = $('#pushBanner');
    if (bar) bar.hidden = true;
    pushBannerOrderId = null;
  } catch (e) { /* silent */ }
}

function onForegroundPush(notification) {
  try {
    if (!notification) return;
    const title = notification.title || '';
    const body = notification.body || '';
    const orderId = notification.data && notification.data.order_id ? String(notification.data.order_id) : null;
    if (title || body) showPushBanner(title, body, orderId);
    loadNotifications();
  } catch (e) { /* push handling must never break the shop */ }
}

function onPushActionPerformed(action) {
  try {
    const n = action && action.notification;
    const orderId = n && n.data && n.data.order_id ? String(n.data.order_id) : null;
    goToNotificationOrder(orderId);
  } catch (e) { /* silent */ }
}

/* ---------------- notification inbox (fix-batch-30) ----------------
   The reliable half of order alerts: the server stores one inbox row per
   recipient phone on every order and status change, and the app polls
   for them. Unlike the FCM push (permission / token / key can each
   silently break it), a row the server wrote is always there when the
   app opens. Bell badge = unread count; tapping a row marks it read
   and jumps to that order (staff → Manage order, customer → My Orders). */
let notifUnread = 0;
let notifPollTimer = null;
let notifPollBusy = false;

function updateNotifBadge() {
  const bell = $('#notifBell');
  const badge = $('#notifBadge');
  if (!bell || !badge) return;
  bell.hidden = !state.user;
  if (notifUnread > 0) {
    badge.hidden = false;
    badge.textContent = notifUnread > 99 ? '99+' : String(notifUnread);
  } else {
    badge.hidden = true;
  }
}

async function loadNotifications() {
  if (!state.token || !state.user) return;
  try {
    const data = await api('/notifications');
    notifUnread = data.unread || 0;
    updateNotifBadge();
  } catch (e) { /* polling must never break the shop */ }
}

function startNotifPolling() {
  stopNotifPolling();
  if (!state.token || !state.user) return;
  notifPollTimer = setInterval(() => {
    if (notifPollBusy) return;
    notifPollBusy = true;
    loadNotifications().finally(() => { notifPollBusy = false; });
  }, 30000);
}

function stopNotifPolling() {
  if (notifPollTimer) { clearInterval(notifPollTimer); notifPollTimer = null; }
}

function openNotifications() {
  openOverlay('#notifOverlay', '#notifModal');
  renderNotifications();
}

async function renderNotifications() {
  const body = $('#notifBody');
  if (!body) return;
  body.innerHTML = '<div class="loading">' + esc(t('loading')) + '</div>';
  try {
    const data = await api('/notifications');
    const items = data.notifications || [];
    notifUnread = data.unread || 0;
    updateNotifBadge();
    if (!items.length) {
      body.innerHTML = '<div class="empty">' + esc(t('notif_empty')) + '</div>';
      return;
    }
    body.innerHTML =
      (notifUnread > 0
        ? '<div class="center" style="margin-bottom:10px"><button class="link-btn" type="button" id="notifReadAllBtn">' + esc(t('notif_mark_all')) + '</button></div>'
        : '') +
      items.map((n) =>
        '<button type="button" class="notif-row' + (n.is_read ? '' : ' unread') + '" data-notif="' + esc(String(n.id)) + '" data-order="' + esc(String(n.order_id || '')) + '">' +
        '<div class="nt-title">' + esc(n.title) + '</div>' +
        '<div class="nt-body">' + esc(n.body) + '</div>' +
        '<div class="nt-time">' + esc(fmtDate(n.created_at)) + '</div>' +
        '</button>').join('');
    const readAll = $('#notifReadAllBtn');
    if (readAll) readAll.addEventListener('click', async () => {
      try { await api('/notifications/read-all', { method: 'POST' }); } catch (e) { /* silent */ }
      renderNotifications();
    });
    $$('[data-notif]', body).forEach((b) => b.addEventListener('click', () => openNotificationOrder(b)));
  } catch (e) {
    body.innerHTML = '<div class="error-box">' + esc(t('error_load')) + '</div>';
  }
}

/* Shared tap-to-order navigation for inbox rows, the foreground push
   banner and system-notification taps: staff → Manage order detail,
   customer → My Orders detail, no order → the inbox. */
function goToNotificationOrder(orderId) {
  if (!orderId) { openNotifications(); return; }
  if (!state.user) { openNotifications(); return; }
  const isStaff = !!(state.user.is_manager || state.user.is_sale_staff);
  if (isStaff) {
    showView('manage');
    loadManage('orders');
    openAdminOrder(orderId);
  } else {
    showView('orders');
    openOrderDetail(orderId);
  }
}

async function openNotificationOrder(btn) {
  const id = btn.dataset.notif;
  const orderId = btn.dataset.order;
  try { await api('/notifications/' + encodeURIComponent(id) + '/read', { method: 'POST' }); } catch (e) { /* silent */ }
  notifUnread = Math.max(0, notifUnread - 1);
  updateNotifBadge();
  if (!orderId) { renderNotifications(); return; }
  closeOverlay('#notifOverlay', '#notifModal');
  goToNotificationOrder(orderId);
}

/* ---------------- manage: devices (fix-batch-30) ----------------
   Registered push devices + the test-push diagnostic. Tokens are
   masked by the server — the full token never reaches this screen. */
async function renderManageDevices(body) {
  body.innerHTML = '<div class="mg-card"><h3>' + esc(t('devices_title')) + '</h3><div id="mgDevicesWrap"><div class="loading">' + esc(t('loading')) + '</div></div></div>';
  try {
    const data = await api('/manage/devices');
    const devices = data.devices || [];
    const wrap = $('#mgDevicesWrap');
    const statusKey = data.push_status === 'configured' ? 'devices_status_ok'
      : data.push_status === 'not_configured' ? 'devices_reason_not_configured'
      : (data.push_status === 'invalid_config' || data.push_status === 'init_failed') ? 'devices_reason_invalid_config'
      : 'devices_status_unknown';
    wrap.innerHTML =
      '<div class="line"><span>' + esc(t('devices_status')) + '</span><strong>' + esc(t(statusKey)) + '</strong></div>' +
      '<div style="margin:12px 0"><button class="btn btn-primary" type="button" id="mgTestPushBtn">' + esc(t('devices_test')) + '</button></div>' +
      '<div id="mgTestPushResult" class="meta-line"></div>' +
      (devices.length
        ? '<div class="table-wrap"><table class="mg-table"><thead><tr><th>' + esc(t('phone')) + '</th><th>Platform</th><th>' + esc(t('devices_last_seen')) + '</th><th>Token</th><th></th></tr></thead><tbody>' +
          devices.map((d) =>
            '<tr><td data-label="' + esc(t('phone')) + '">' + esc(d.user_phone || '') + '</td>' +
            '<td data-label="Platform">' + esc(d.platform || '') + '</td>' +
            '<td data-label="' + esc(t('devices_last_seen')) + '">' + esc(fmtDate(d.last_seen)) + '</td>' +
            '<td data-label="Token"><span class="masked">' + esc(d.token_masked || '') + '</span></td>' +
            '<td data-label="">' + (d.is_staff ? '<span class="status-pill">' + esc(t('devices_staff')) + '</span>' : '') + '</td></tr>').join('') +
          '</tbody></table></div>'
        : '<div class="empty">' + esc(t('devices_none')) + '</div>');
    $('#mgTestPushBtn').addEventListener('click', async () => {
      const btn = $('#mgTestPushBtn');
      const out = $('#mgTestPushResult');
      btn.disabled = true;
      btn.textContent = t('devices_testing');
      try {
        const res = await api('/manage/devices/test-push', { method: 'POST' });
        if (res.sent) {
          out.textContent = t('devices_test_ok') + ' — ' + (res.success || 0) + ' ✓ / ' + (res.failure || 0) + ' ✗';
          toast(t('devices_test_ok'));
        } else {
          const rk = res.reason === 'no_tokens' ? 'devices_reason_no_tokens'
            : res.reason === 'not_configured' ? 'devices_reason_not_configured'
            : (res.reason === 'invalid_config' || res.reason === 'init_failed') ? 'devices_reason_invalid_config'
            : 'devices_reason_send_failed';
          out.textContent = t('devices_test_fail') + ' — ' + t(rk) + (res.detail ? ' (' + res.detail + ')' : '');
        }
      } catch (e) {
        out.textContent = t('devices_test_fail') + ' — ' + t('error_load');
      }
      btn.disabled = false;
      btn.textContent = t('devices_test');
    });
  } catch (e) {
    const wrap = $('#mgDevicesWrap');
    if (wrap) wrap.innerHTML = '<div class="error-box">' + esc(t('error_load')) + '</div>';
  }
}

// Native splash (Capacitor app only): hide once the shop has rendered, so the
// splash stays up while Render wakes instead of a long white screen. No-op in
// a normal browser (window.Capacitor is undefined there). Safety timeout hides
// it after 20s no matter what, so it can never stick forever.
let splashHidden = false;
function hideSplash() {
  if (splashHidden) return;
  splashHidden = true;
  try {
    const ss = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.SplashScreen;
    if (ss && ss.hide) { const p = ss.hide(); if (p && p.catch) p.catch(function(){}); }
  } catch (e) {}
}
setTimeout(hideSplash, 20000);
async function init() {
  wire();
  applyI18n();
  updateCartBadge();
  updateWishlistBadge();
  renderCart();
  await restoreSession();
  registerPushToken();
  loadNotifications();
  startNotifPolling();
  await loadShopInfo();
  await loadBrands();
  await loadTypes();
  loadHome();
}
document.addEventListener('DOMContentLoaded', init);
