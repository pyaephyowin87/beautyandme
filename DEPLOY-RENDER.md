# Render ပေါ် ဆိုင်တင်နည်း (အဆင့်ဆင့်)

> ဆိုင်ကို Render အလကား hosting ပေါ် တင်တဲ့ လမ်းညွှန်။ ကွန်ပျူတာ (သို့) ဖုန်းနဲ့ လုပ်လို့ရတယ်။ အချိန် ၁၅–၃၀ မိနစ်လောက် ကြာမယ်။

## အဆင့် ၀ — ပြင်ဆင်ထားရမယ့် အရာ

- `shop-standalone` ဖိုလ်ဒါ တစ်ခုလုံး (ဖိုင်တွေ အကုန် ပါရမယ်)
- **သတိ:** `node_modules` ဖိုလ်ဒါကို **မတင်နဲ့** — အရမ်းကြီးတယ်, Render က သူ့ဘာသာ `npm install` လုပ်တယ်။

## အဆင့် ၁ — GitHub အကောင့် ဖွင့် + ဖိုင်တင်

Render က GitHub repo ကနေ ဆိုင်ကို ဆွဲတင်တာ — ဒါကြောင့် အရင် GitHub ပေါ် တင်ရမယ်။

1. [github.com](https://github.com) ဖွင့် → အကောင့် ဖွင့် (အလကား) → Sign in ဝင်
2. အပေါ်ညာက **+** → **New repository** နှိပ်
3. Repository name: `beauty-and-me-shop` လို့ ရိုက် → **Public** ရွေး → **Create repository** နှိပ်
4. ပေါ်လာတဲ့ စာမျက်နှာမှာ **"uploading an existing file"** ဆိုတဲ့ စာသား နှိပ်
5. ကွန်ပျူတာထဲက `shop-standalone` ဖိုလ်ဒါ **ထဲက ဖိုင်တွေ အကုန်** (render.yaml, package.json, server.js, lib, public, data, scripts — `node_modules` မပါ) ကို drag လုပ်ပြီး တင်
6. အောက်က **Commit changes** နှိပ် → ဖိုင်တွေ တက်လာပြီ

## အဆင့် ၂ — Render အကောင့် ဖွင့်

1. [render.com](https://render.com) ဖွင့် → **Get Started** → **GitHub နဲ့ Sign up** နှိပ် (GitHub အကောင့်နဲ့ ချိတ်တာ အလွယ်ဆုံးပဲ)
2. GitHub က "Authorize Render" မေးရင် **Authorize** နှိပ်

## အဆင့် ၃ — Blueprint နဲ့ Deploy လုပ်

1. Render dashboard မှာ **New +** → **Blueprint** နှိပ်
2. GitHub repo စာရင်းထဲက **`beauty-and-me-shop`** ကို ရွေး → **Connect** နှိပ်
3. Blueprint file: `render.yaml` လို့ အလိုလို တွေ့လိမ့်မယ် → **Apply** နှိပ်
4. Render က အခု ဆိုင်တစ်ခု (`beauty-and-me-shop` web service) + database တစ်ခု (`beauty-and-me-db` Postgres) ဆောက်ပေးမယ် — **၂–၅ မိနစ်** စောင့်
5. Status **Live** ဖြစ်သွားရင် ပြီးပြီ ✅

> Blueprint က `DATABASE_URL` ကို သူ့ဘာသာ ချိတ်ပေးတယ် — ဘာမှ ထပ်ဖြည့်စရာ မလိုဘူး။

## အဆင့် ၄ — ဆိုင်လိပ်စာ ဖွင့် + စမ်း

1. Web service စာမျက်နှာမှာ URL တွေ့မယ် — ဥပမာ `https://beauty-and-me-shop.onrender.com` → နှိပ်ဖွင့်
2. စစ်ရမှာ:
   - ပစ္စည်း စာရင်း ပေါ်လား (၄၀၂ ခု)
   - Search ရိုက်ကြည့် (ဥပမာ `serum`) → Serum Tonic 67,000 Ks ပေါ်လား
   - ပစ္စည်း နှိပ် → Detail ပေါ်လား, "Stock ရှိပါတယ်" / "ကုန်ပြီ" ပဲ ပြလား (အရေအတွက် **မပြရဘူး**)
   - KUNDAL Shampoo နှိပ် → White Musk / Baby Powder / Cherry Blossom option တွေ ပေါ်လား
   - Cart ထဲ ထည့် → COD နဲ့ test order တစ်ခု တင် → Total မှာ ပို့ခ **မပါရဘူး**, ပို့ခ သီးသန့် လိုင်းပဲ ပြရမယ်
3. ပထမဆုံး ဖွင့်တာ ကြာရင် စိတ်မပူနဲ့ — အလကား plan က ၁၅ မိနစ် မသုံးရင် အိပ်သွားတယ်, ပြန်နိုးဖို့ ၁ မိနစ်လောက် ကြာတယ်။

## အဆင့် ၅ — Manage အကောင့် ဖွင့် (မင်းဖို့)

1. ဆိုင်မှာ **Login / အကောင့်ဖွင့်** နှိပ် → Register လုပ်
2. **ဖုန်း 095117366** နဲ့ register လုပ် (ဒီဖုန်းနဲ့ပဲ Manage သုံးလို့ရတယ်)
3. Login ဝင်ပြီးရင် **Manage** tab ပေါ်လာမယ်

## အဆင့် ၆ — WooCommerce ချိတ် (ပစ္စည်းပုံ + ဈေး ဆွဲဖို့)

1. Manage → **WooCommerce** tab ဖွင့်
2. Site URL: `https://beautyandmemyanmar.com` ရိုက်
3. Consumer Key / Consumer Secret: **မင်း ကိုယ်တိုင် ရိုက်** (chat မှာ ဘယ်တော့မှ မပို့နဲ့ — key က password လိုပဲ)
4. **Test connection** နှိပ် → "ချိတ်လို့ ရပြီ" ပေါ်ရင် OK
5. **Preview** နှိပ် → ဘယ် ပစ္စည်း ကိုက်တယ်, ဘယ် ပစ္စည်း ပုံမရှိဘူး ဆိုတာ အရင် ကြည့်
6. သေချာမှ **Import** နှိပ် → ပစ္စည်းပုံတွေ ရောက်လာမယ်

> WooCommerce ကို ဖတ်တာပဲ လုပ်တယ် — ဘယ်တော့မှ ပြင်မရေးဘူး။

## အဆင့် ၇ — Domain ချိတ်ဖို့ (နောက်မှ)

Domain ဝယ်ပြီးရင်: Render dashboard → web service → **Settings** → **Custom Domain** → domain ရိုက် → ပေးတဲ့ DNS setting ကို domain ဝယ်တဲ့နေရာမှာ ထည့်။

## ⚠️ အလကား Plan ရဲ့ ကန့်သတ်ချက်များ

1. **ဆိုင်က အိပ်သွားတယ်:** ၁၅ မိနစ် လူမသုံးရင် ဆိုင် အိပ်သွားမယ် — လာဖွင့်တဲ့သူ ပထမတစ်ယောက် ၁ မိနစ်လောက် စောင့်ရမယ်။ အမြဲဖွင့်ချင်ရင် Starter $7/လ ပြောင်းပါ။
2. **အလကား Database က သက်တမ်းရှိတယ်:** Render dashboard မှာ expiry ရက် စစ်ပါ — သက်တမ်းမကုန်ခင် backup ထုတ်ပါ (သို့) paid $6/လ ပြောင်းပါ။ Database ပျက်ရင် order / အကောင့် data တွေ ပျောက်မယ်။
3. **JSON ဖိုင်ထဲက data က မမြဲဘူး:** Render ပေါ်မှာ order / အကောင့် / screenshot တွေ Postgres ထဲမှာ သိမ်းတယ် (Blueprint က ချိတ်ပေးထားတယ်) — ဒါကြောင့် database ရှိမှ data မြဲမယ်။
4. **ပစ္စည်းပုံ မရှိသေးဘူး:** အဆင့် ၆ WooCommerce Import လုပ်မှ ပုံတွေ ရောက်မယ်။ အဲ့မတိုင်ခင် "ပုံ မရှိသေးပါ" ပဲ ပြမယ်။

## ပြဿနာတက်ရင်

- **Deploy fail ဖြစ်ရင်:** Render dashboard → web service → **Logs** ဖွင့်ကြည့် → error စာသား screenshot ရိုက်ပြီး Muse ကို ပို့ပါ။
- **ဆိုင်ဖွင့်မရရင်:** URL မှန်လား, Status Live ဖြစ်လား အရင် စစ်ပါ။
- **Manage မပေါ်ရင်:** 095117366 ဖုန်းနဲ့ register/login လုပ်ထားလား စစ်ပါ။
