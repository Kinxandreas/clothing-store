# Supabase Setup Guide

Run these SQL commands in your Supabase SQL Editor:
https://supabase.com/dashboard/project/ieftajzdhknurzjrucyn/sql/new

---

## 1. Create Tables

```sql
-- Profiles (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  avatar_url text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz default now()
);

-- Products
create table public.products (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique not null,
  description text,
  price numeric(10,2) not null check (price > 0),
  category text not null,
  gender text not null default 'unisex' check (gender in ('men','women','unisex','kids')),
  status text not null default 'active' check (status in ('active','draft','archived')),
  created_at timestamptz default now()
);

-- Product Images
create table public.product_images (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references public.products(id) on delete cascade,
  image_url text not null,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Orders
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  total numeric(10,2) not null,
  status text not null default 'pending' check (status in ('pending','paid','shipped','delivered','cancelled')),
  shipping_address jsonb,
  created_at timestamptz default now()
);

-- Order Items
create table public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  quantity int not null check (quantity > 0),
  size text,
  price numeric(10,2) not null,
  created_at timestamptz default now()
);
```

---

## 2. Enable Row Level Security (RLS)

```sql
-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Profiles: users can only see/edit their own profile
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Products: anyone can read active products
create policy "Public can view active products" on public.products for select using (status = 'active');
-- Only admins can insert/update/delete products
create policy "Admins can manage products" on public.products for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Product images: public read
create policy "Public can view product images" on public.product_images for select using (true);
create policy "Admins can manage product images" on public.product_images for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Orders: users can only see their own orders
create policy "Users can view own orders" on public.orders for select using (auth.uid() = user_id);
create policy "Users can create orders" on public.orders for insert with check (auth.uid() = user_id);

-- Order items: users can see items from their own orders
create policy "Users can view own order items" on public.order_items for select
  using (exists (select 1 from public.orders where id = order_id and user_id = auth.uid()));
create policy "Users can create order items" on public.order_items for insert
  with check (exists (select 1 from public.orders where id = order_id and user_id = auth.uid()));
```

---

## 3. Auto-create profile on signup

```sql
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

---

## 4. Make yourself admin

After signing up on the site, run this (replace with your email):

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'YOUR_EMAIL_HERE');
```

---

## 5. Auth Redirect URLs (in Supabase Dashboard)

Go to: Authentication > URL Configuration

Site URL:
  https://your-vercel-url.vercel.app

Redirect URLs (add all of these):
  https://your-vercel-url.vercel.app/**
  http://localhost:3000/**
