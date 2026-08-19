# SEO — Home

El `index.html` incluye:
- `<title>` y `<meta name="description">` orientados a la propuesta
  (discovery de tecnología, hogar y accesorios).
- `rel="canonical"` (actualizar con el dominio real al publicar).
- Open Graph y Twitter Cards para previews en redes/WhatsApp.
- JSON-LD tipo `Store` con nombre, descripción, imagen y medios de pago.
- Un bloque de texto real e indexable al final de la home (`.seo-text`)
  con encabezados `<h2>`/`<h3>` y enlaces internos al catálogo, al Live
  y a contacto.
- `robots.txt` + `sitemap.xml` en la raíz.

## Limitación actual
El sitio es una **SPA de una sola URL** (`index.html`), por lo que los
productos individuales no tienen su propia URL indexable todavía. La
home concentra el SEO de marca y categoría.

## Roadmap para mejorar SEO de catálogo
- Rutas `/producto/slug` (requiere Cloudflare Pages Functions o un
  prerender por producto) para que cada producto tenga su propia
  meta description, OG image y entrada en el sitemap.
- Generar `sitemap.xml` dinámico desde Supabase cuando existan esas
  rutas.

## Al publicar
1. Reemplazar `https://www.akarielectrohome.com` por el dominio real
   en: `index.html` (canonical, og:url, og:image, JSON-LD),
   `robots.txt` y `sitemap.xml`.
