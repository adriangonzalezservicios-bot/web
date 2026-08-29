# Publicación automática en Facebook e Instagram

Cuando cargás un producto nuevo desde el admin, este Worker lo publica
solo en tu página de Facebook y en tu cuenta de Instagram profesional
(con foto, precio, categoría y link a la tienda).

## Requisitos previos
- Una **página de Facebook** (no un perfil personal).
- Una **cuenta de Instagram profesional o de creador**, vinculada a esa página.
  (Instagram → Configuración → Cuenta → Cambiar a cuenta profesional, si
  todavía no lo es. Después: Configuración de la página de Facebook →
  Instagram → Conectar cuenta.)

## Paso 1 — Crear la App en Meta for Developers
1. Andá a https://developers.facebook.com/apps → **Crear app**.
2. Tipo de app: **"Otro"** → **"Empresa"**.
3. Ponele un nombre (ej: "AKARI Publicador").

## Paso 2 — Agregar los productos necesarios
Dentro de la app, en el menú lateral, agregá:
- **Facebook Login for Business** (o alcanza con la config manual del token, ver Paso 3)
- **Instagram Graph API**

## Paso 3 — Conseguir el Access Token
La forma más simple sin pasar por revisión de Meta (ya que la vas a usar
solo para tu propia página, no para terceros):

1. Andá a https://developers.facebook.com/tools/explorer/ (Graph API Explorer).
2. Arriba a la derecha, elegí tu app ("AKARI Publicador") en el desplegable.
3. Botón **"Generate Access Token"** (o "Get Token" → "Get User Access Token").
4. En los permisos, tildá: `pages_show_list`, `pages_manage_posts`,
   `pages_read_engagement`, `instagram_basic`, `instagram_content_publish`,
   `business_management`.
5. Generá el token. Este token de usuario dura poco (1-2 horas) — lo usamos
   solo para el siguiente paso, no es el que vamos a usar en producción.

## Paso 4 — Conseguir el Page Access Token (de larga duración)
1. Con el token del paso anterior, en el mismo Graph API Explorer, hacé un
   GET a: `me/accounts`
2. Vas a ver tu página listada, con su `id` (**ese es tu FB_PAGE_ID**) y su
   propio `access_token` — **ese es el token que necesitás**. Es un token
   de página derivado de tu token de usuario de larga duración: en la
   práctica dura alrededor de **60 días**, después hay que renovarlo (ver
   el final de esta guía).
3. Para conseguir el **IG_BUSINESS_ID**: GET a
   `{FB_PAGE_ID}?fields=instagram_business_account`
   El número que devuelve ahí es tu `IG_BUSINESS_ID`.

## Paso 5 — Agregarte como administrador/tester de la app
Para poder publicar sin pasar por la revisión completa de Meta (que es un
trámite largo), la página y la cuenta de Instagram tienen que pertenecer
a alguien que sea **admin, desarrollador o tester** de la app:
App → Roles → agregá tu usuario de Facebook con rol de Administrador.

## Paso 6 — Deploy del Worker
```bash
npm i -g wrangler
wrangler login
cd meta-social
wrangler secret put META_ACCESS_TOKEN   # el Page Access Token del paso 4
wrangler secret put FB_PAGE_ID          # el id de tu página
wrangler secret put IG_BUSINESS_ID      # el id de tu cuenta de Instagram
wrangler deploy
```

Al final te da una URL como
`https://akari-social-publish-worker.tu-usuario.workers.dev` — pegala en
**Admin → Tienda → Redes sociales → "Worker de publicación automática"**
y activá el interruptor "Publicar productos nuevos automáticamente".

## Importante sobre el vencimiento del token
El Page Access Token dura aproximadamente **60 días**. Cuando venza, la
publicación automática va a empezar a fallar con un error de "token
inválido o vencido" — no es un bug, es esperable. Para renovarlo:
repetí el Paso 3-4 (Graph API Explorer → generar token → `me/accounts`)
y volvé a cargarlo:
```bash
wrangler secret put META_ACCESS_TOKEN
```
(no hace falta `wrangler deploy` de nuevo, los secrets se actualizan al instante).
Si en el futuro esto se vuelve molesto, existe un mecanismo más avanzado
("System User Token" desde Business Manager) que no vence — pero requiere
más pasos de configuración; te puedo guiar si llegás a ese punto.

## Nota sobre por qué esto no necesita "revisión de la app"
Meta exige revisión (App Review) cuando tu app va a publicar en páginas
de **otras personas**. Como acá la página y la cuenta de Instagram son
tuyas, y vos sos administrador de la app, podés usar estos permisos en
modo desarrollo sin límite de tiempo — es exactamente el mismo mecanismo
que usan la mayoría de las herramientas de auto-publicación para
negocios chicos.
