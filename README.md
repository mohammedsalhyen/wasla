# Wasla (وصلة) — Frontend

React + TypeScript + Vite + Tailwind v4 + Redux Toolkit + react-i18next (ar افتراضي / en) + Motion + GSAP + Lenis + SignalR.

```bash
npm install
npm run dev        # proxy: /api و /hubs (ws) و /openapi  ->  https://waslaapi.runasp.net
npm run gen:api    # يولّد src/api/schema.d.ts من الـ OpenAPI
npm run build      # dist/ -> انسخه إلى wwwroot في الـ backend (مع fallback إلى index.html)
```

## البنية
- `src/features/<feature>/<feature>Slice.ts`: thunks + slice لكل ميزة (auth, site, catalog, cart, orders, designs, account, admin)
- `src/store/resource.ts`: `addRes` يربط أي thunk بحالة `{data,status,error}`
- `src/locales/{ar,en}/translation.json`: النصوص (الأدمن وبعض النصوص بالعربية فقط، و`fallbackLng` = ar)
- `src/pages`, `src/landing`, `src/admin`, `src/components`, `src/constant`

## المسارات
عام: `/ /shop /shop/:id /cart /login /register /gift/:token` — بعد الدخول: `/checkout /orders /designs /favorites /notifications /support /profile` — أدمن: `/admin/*`

انظر `ASSUMPTIONS.md` للحقول التي لم يوثّقها الـ API.md.
