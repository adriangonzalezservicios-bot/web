# Mercado Pago — Worker de Cloudflare

Este Worker recibe el carrito desde `index.html`, crea una preferencia de
pago en Mercado Pago y devuelve `init_point` (la URL de pago) al front,
que redirige al usuario ahí. El **Access Token** de Mercado Pago vive
solo en el Worker (como *secret*), nunca en el HTML público.

## Deploy rápido
```bash
npm i -g wrangler
wrangler login
cd mercadopago
wrangler secret put MP_ACCESS_TOKEN   # pegar el Access Token (Test o Producción)
wrangler deploy
```

Al terminar, wrangler imprime una URL como
`https://akari-mercadopago-worker.tu-usuario.workers.dev`. Pegala en:
**Admin → Pagos → URL del Worker**.

## Dónde conseguir el Access Token
Mercado Pago → **Tu negocio → Configuración → Credenciales** (hay
credenciales de Test y de Producción por separado; usá el modo que
corresponda en Admin → Pagos → Modo).

## CORS
Por defecto el Worker acepta pedidos desde cualquier origen
(`ALLOWED_ORIGIN = "*"`). Antes de pasar a producción, editá esa
constante en `worker-create-preference.js` con tu dominio real.
