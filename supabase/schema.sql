-- Clothing Store Schema
-- Run this in your Supabase SQL Editor

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  price numeric(10,2) not null,
  category text,
  gender text check (gender in ('men', 'women', 'unisex', 'kids')),
  status text default 'active',
  created_at timestamptz default now()
);

create table if not exists product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  size text,
  color text,
  stock int default 0,
  sku text unique
);

create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  image_url text not null,
  sort_order int default 0
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  total_amount numeric(10,2),
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  variant_id uuid references product_variants(id),
  quantity int not null,
  unit_price numeric(10,2) not null
);

-- Enable RLS
alter table products enable row level security;
alter table product_variants enable row level security;
alter table product_images enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Public read access
create policy "Public can view products" on products for select using (true);
create policy "Public can view variants" on product_variants for select using (true);
create policy "Public can view images" on product_images for select using (true);

-- Admin full access (for now, open — lock down with auth later)
create policy "Admin insert products" on products for insert with check (true);
create policy "Admin update products" on products for update using (true);
create policy "Admin insert variants" on product_variants for insert with check (true);
create policy "Admin insert images" on product_images for insert with check (true);

-- Users see their own orders
create policy "Users see own orders" on orders for select using (auth.uid() = user_id);
create policy "Users insert own orders" on orders for insert with check (auth.uid() = user_id);
create policy "Users see own order items" on order_items for select
  using (exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid()));
