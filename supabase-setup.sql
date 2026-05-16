-- ============================================================
-- Noorism — Supabase Setup  (run in SQL Editor)
-- ============================================================

-- 1. Orders table
create table if not exists public.orders (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null,
  phone       text not null,
  address     text,
  notes       text,
  items       jsonb not null default '[]',
  total       integer not null default 0,
  status      text not null default 'pending'
             check (status in ('pending','confirmed','shipped','delivered','cancelled'))
);

alter table public.orders enable row level security;

create policy "Anyone can insert orders"
  on public.orders for insert with check (true);

create policy "Admin can read orders"
  on public.orders for select using (auth.role() = 'authenticated');

create policy "Admin can update orders"
  on public.orders for update using (auth.role() = 'authenticated');

-- 2. Products table
create table if not exists public.products (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  name          text not null,
  price         integer not null default 0,
  description   text not null default '',
  image_url     text not null default '',
  customizable  boolean not null default false,
  active        boolean not null default true,
  sort_order    integer not null default 0
);

alter table public.products enable row level security;

-- Anyone can read active products (shop page)
create policy "Anyone can read active products"
  on public.products for select using (active = true);

-- Admin can do everything
create policy "Admin can manage products"
  on public.products for all using (auth.role() = 'authenticated');

-- 3. Storage bucket for product images
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Allow admin to upload images
create policy "Admin can upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' AND auth.role() = 'authenticated');

create policy "Admin can update product images"
  on storage.objects for update
  using (bucket_id = 'product-images' AND auth.role() = 'authenticated');

create policy "Admin can delete product images"
  on storage.objects for delete
  using (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Anyone can view product images (public bucket)
create policy "Public can read product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- ============================================================
-- After running this, go to:
--   Authentication → Users → Invite user
-- and create an admin account (e.g. admin@noorism.com)
-- ============================================================

-- ============================================================
-- 4. Reviews table (product detail page)
-- ============================================================
create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  product_id  text not null,
  name        text not null,
  rating      integer not null check (rating between 1 and 5),
  comment     text not null
);

alter table public.reviews enable row level security;

create policy "Anyone can read reviews"
  on public.reviews for select using (true);

create policy "Anyone can insert reviews"
  on public.reviews for insert with check (true);

-- ============================================================
-- 5. Events table (admin insights)
-- ============================================================
create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  type        text not null,
  metadata    jsonb not null default '{}'
);

alter table public.events enable row level security;

create policy "Anyone can insert events"
  on public.events for insert with check (true);

create policy "Admin can read events"
  on public.events for select using (auth.role() = 'authenticated');

create index if not exists events_created_at_idx on public.events (created_at desc);
create index if not exists events_type_idx on public.events (type);
