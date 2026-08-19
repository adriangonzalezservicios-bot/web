# Instrucción corta para un agente

Construí o actualizá AKARI Electro & Home: tienda discovery tipo TikTok
en un `index.html` vanilla, GitHub + Cloudflare Pages, Supabase
(productos, settings, orders, Auth email/Google), admin completo
accesible solo por un punto `·` en el footer (CRUD productos, carga
masiva CSV, diseño, pagos/Mercado Pago Worker, pedidos, tienda), home
SEO con hero + beneficios + categorías + feed + destacados + texto
indexable, feed swipe ← like → skip con motor de gustos v2, carrito y
checkout (MP / a convenir / tienda; entrega tienda / envío / a
convenir), Lucide, diseño claro `#6b8f35`, sin dark mode ni emojis, UI
en español AR.

## Reglas de producto (no romper)
- Diseño blanco/claro, marca verde editable — sin dark mode.
- Sin emojis en la UI — solo íconos Lucide.
- Swipe: izquierda = like, derecha = skip.
- Admin solo accesible por el punto `·` del footer, nunca en el menú.
- El Access Token de Mercado Pago nunca va en el front, solo en el
  Worker.
- Todo el copy en español de Argentina.
- Mobile-first.
- Sin depender de Jumpseller ni de Liquid.
