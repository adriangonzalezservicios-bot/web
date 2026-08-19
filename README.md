# AKARI Electro & Home

Tienda online de **discovery** (estilo TikTok Shop) para tecnología,
hogar y accesorios. El usuario desliza productos, indica qué le gusta
y el sistema aprende sus preferencias para reordenar el feed.

- **Front:** `index.html` estático (HTML + CSS + JS vanilla, sin build)
- **Hosting:** GitHub + Cloudflare Pages (+ dominio propio)
- **Backend:** Supabase (productos, ajustes del sitio, pedidos, Auth)
- **Pagos:** Mercado Pago vía Cloudflare Worker
- **Íconos:** Lucide (CDN) — sin emojis
- **Idioma:** español Argentina / LATAM

## Estado del proyecto

✅ **Backend Supabase real, ya creado y conectado** (`akari-electro-home`,
región São Paulo). `index.html` ya tiene la URL y la clave `anon`
pegadas — no es modo demo, ya guarda todo en la nube.

Pendiente para que quede 100% operativo:
1. **Crear tu usuario admin** en Supabase → Authentication → Users
   (ver `supabase/README.md`).
2. **Subir a GitHub** y conectar con **Cloudflare Pages** (tenés cuenta
   en ambos — pasos abajo).
3. **Deploy del Worker de Mercado Pago** con tu Access Token real
   (`mercadopago/README.md`).
4. **Apuntar tu dominio propio** en Cloudflare Pages → Custom domains.

## Probar en local, ahora mismo
Abrí `index.html` en el navegador: ya lee y escribe contra tu Supabase
real. Para entrar al admin (punto `·` del footer) necesitás el usuario
que crees en el paso 1 de arriba.

## Publicar de verdad
1. **GitHub:** subí esta carpeta a un repo.
2. **Cloudflare Pages:** *Connect to Git* → build command vacío →
   output directory `/`.
3. **Supabase:** seguí `supabase/README.md` (correr `schema.sql`,
   crear usuario admin, copiar URL + anon key a `index.html`).
4. **Mercado Pago:** seguí `mercadopago/README.md` (deploy del Worker
   con `MP_ACCESS_TOKEN` como secret, pegar la URL del Worker en
   Admin → Pagos).
5. **Dominio propio:** configuralo en Cloudflare Pages → Custom
   domains, y actualizá las URLs de `index.html`, `robots.txt` y
   `sitemap.xml`.

## Estructura
```
/
├── index.html                 → toda la tienda + admin
├── logo-mascot.png            → (agregar tu logo acá)
├── robots.txt
├── sitemap.xml
├── docs/
│   ├── PROMPT-DETALLADO.md
│   ├── ALGORITMO-GUSTOS.md
│   └── SEO-HOME.md
├── supabase/
│   ├── schema.sql
│   ├── plantilla-productos.csv
│   ├── GOOGLE-AUTH.md
│   └── README.md
└── mercadopago/
    ├── worker-create-preference.js
    ├── wrangler.toml
    └── README.md
```

## Reglas de producto
- Diseño blanco/claro, marca verde `#6b8f35` editable — sin dark mode.
- Sin emojis en la UI, solo íconos Lucide.
- Swipe: izquierda = Me gusta, derecha = Saltar.
- Admin accesible **solo** por el punto `·` del footer (no está en el
  menú).
- El Access Token de Mercado Pago vive solo en el Worker, nunca en el
  front.
- Mobile-first.

## Roadmap (no implementado aún)
- URLs por producto (`/producto/slug`) para SEO de catálogo.
- Subida de imágenes a Supabase Storage (hoy son URL).
- Webhooks de Mercado Pago para marcar pedidos como pagados
  automáticamente.
- Roles de admin (restringir a ciertos emails).
- Preferencias de usuario logueado guardadas en servidor (hoy viven en
  `localStorage` del navegador).
