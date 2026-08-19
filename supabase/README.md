# Supabase — AKARI Electro & Home

## Proyecto ya creado ✅
- Project ID: `khlsqzwtauctaqtqmuxd`
- URL: `https://khlsqzwtauctaqtqmuxd.supabase.co`
- Región: São Paulo (`sa-east-1`)
- Ya se aplicó `schema.sql` (tablas `products`, `site_settings`, `orders` + RLS) y se cargaron los 12 productos demo.
- La URL y la clave `anon` ya están pegadas en `index.html`.

Podés ver el proyecto en https://supabase.com/dashboard/project/khlsqzwtauctaqtqmuxd

## Falta un solo paso manual: crear el usuario admin
1. Entrá al dashboard de arriba → **Authentication → Users → Add user**.
2. Cargá el email y contraseña con los que vas a entrar al panel `·`
   del footer (Auth por email/password).
3. Opcional: configurá login con Google siguiendo `GOOGLE-AUTH.md`.

## Pasos generales (referencia)
1. Ejecutar `schema.sql` en **SQL Editor** — ✅ ya hecho.
2. Crear usuario admin en **Authentication → Users** — pendiente (ver arriba).
3. Copiar `Project URL` y `anon public key` (Settings → API) a `index.html` — ✅ ya hecho.
4. Cargar productos desde el panel Admin (`·` en el footer) → pestaña
   **Productos**, o importar `plantilla-productos.csv` desde **Carga masiva**.

## Tablas
- `products`: catálogo (lectura pública solo `active = true`)
- `site_settings`: fila única `id = 1` con marca, diseño y pagos
- `orders`: pedidos del checkout (inserción pública, lectura solo admin)

## Sin Supabase configurado
Si `SUPABASE_URL` / `SUPABASE_ANON_KEY` quedan vacíos, el sitio funciona
en **modo demo local**: productos de ejemplo y cambios del admin se
guardan en `localStorage` del navegador (no se comparten entre
dispositivos). Ideal para probar el sitio antes de conectar el backend.
