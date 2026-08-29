-- ============================================================
-- AKARI Electro & Home — Supabase schema.sql
-- Ejecutar completo en: Supabase → SQL Editor → New query → Run
-- ============================================================

-- Extensiones útiles
create extension if not exists "pgcrypto";

-- ---------- Tabla: products ----------
create table if not exists public.products (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  brand text default '',
  category text not null default 'Tecnología',
  price numeric not null default 0,
  original_price numeric default 0,
  match_score int default 80,
  image_url text default '',
  sort_order int default 1,
  active boolean default true,
  track_stock boolean default false,
  stock integer default 0,
  created_at timestamptz default now()
);

-- ---------- Tabla: site_settings (fila única id=1) ----------
create table if not exists public.site_settings (
  id int primary key default 1,
  brand_name text default 'AKARI',
  brand_tagline text default 'electro & home',
  color_brand text default '#6b8f35',
  color_bg text default '#f6f7f9',
  color_text text default '#0f1218',
  logo_url text default '',
  hero_title text default 'Descubrí productos que sí te van a gustar',
  hero_text text default 'Deslizá tecnología, hogar y accesorios como en tu red favorita.',
  pay_mp boolean default true,
  pay_agree boolean default true,
  pay_store boolean default true,
  mp_mode text default 'test',
  mp_public_key text default '',
  mp_worker_url text default '',
  whatsapp text default '',
  email text default '',
  currency text default 'ARS',
  live_active boolean default true,
  live_title text default 'Facebook Live: nuevos ingresos de la semana',
  live_when text default 'Viernes 19:00 hs',
  live_url text default '',
  instagram_url text default '',
  facebook_url text default '',
  tiktok_url text default '',
  banner_url text default '',
  social_publish_worker_url text default '',
  social_publish_enabled boolean default false
);

insert into public.site_settings (id) values (1)
on conflict (id) do nothing;

-- ---------- Tabla: orders ----------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  ref text not null,
  items jsonb not null,
  total numeric not null default 0,
  customer jsonb not null,
  delivery text default 'retiro',
  address text default '',
  payment text default 'mp',
  status text default 'pendiente',
  created_at timestamptz default now()
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
alter table public.products enable row level security;
alter table public.site_settings enable row level security;
alter table public.orders enable row level security;

-- products: público lee solo activos
drop policy if exists "public read active products" on public.products;
create policy "public read active products" on public.products
  for select using (active = true);

-- products: usuarios autenticados (admin) full CRUD
drop policy if exists "auth manage products" on public.products;
create policy "auth manage products" on public.products
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- site_settings: público lee
drop policy if exists "public read settings" on public.site_settings;
create policy "public read settings" on public.site_settings
  for select using (true);

-- site_settings: autenticados actualizan
drop policy if exists "auth update settings" on public.site_settings;
create policy "auth update settings" on public.site_settings
  for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- orders: anon puede insertar (checkout público)
drop policy if exists "anon insert orders" on public.orders;
create policy "anon insert orders" on public.orders
  for insert with check (true);

-- orders: autenticados leen y actualizan (panel admin)
drop policy if exists "auth read orders" on public.orders;
create policy "auth read orders" on public.orders
  for select using (auth.role() = 'authenticated');

drop policy if exists "auth update orders" on public.orders;
create policy "auth update orders" on public.orders
  for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ============================================================
-- Datos de ejemplo (opcional, comentar si no se desea)
-- ============================================================
insert into public.products (id, title, brand, category, price, original_price, match_score, image_url, sort_order, active) values
('p1','Auriculares Bluetooth AKARI Pulse','AKARI','Tecnología',24999,32999,96,'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600',1,true),
('p2','Parlante portátil resistente al agua','SoundGo','Tecnología',18999,0,91,'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600',2,true),
('p3','Smartwatch AKARI Fit 2','AKARI','Tecnología',39999,47999,98,'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600',3,true)
on conflict (id) do nothing;

-- ============================================================
-- Después de correr este script:
-- 1) Crear un usuario admin en Authentication → Users (email + password)
--    o habilitar el proveedor Google en Authentication → Providers.
-- 2) Copiar Project URL y anon public key (Settings → API) al index.html.
-- ============================================================
