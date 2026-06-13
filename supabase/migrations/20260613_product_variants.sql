-- Product variants table
-- Stores things like: label='Color', value='Red' or label='Size', value='M'
create table if not exists product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  label text not null,          -- e.g. 'Color', 'Size', 'Type'
  value text not null,          -- e.g. 'Red', 'M', 'Slim Fit'
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists product_variants_product_id_idx on product_variants(product_id);

-- Allow public read (shop front needs to display variants)
alter table product_variants enable row level security;

create policy "Public read" on product_variants
  for select using (true);

create policy "Service role full access" on product_variants
  for all using (auth.role() = 'service_role');
