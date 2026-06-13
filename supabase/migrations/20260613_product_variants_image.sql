-- Add image_url to product_variants so each option can have its own photo
alter table product_variants add column if not exists image_url text default null;
