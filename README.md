# KSTORE — Clothing Store

A full-stack clothing store built with **Next.js 15**, **Supabase**, and **Tailwind CSS**.

## Stack
- **Frontend**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **State**: Zustand (cart)

## Pages
- `/` — Home with hero and featured products
- `/shop` — All products with gender filters
- `/products/[slug]` — Product detail with size/color picker
- `/cart` — Shopping cart
- `/checkout` — Checkout form
- `/admin` — Add products

## Getting Started

### 1. Clone and install
```bash
git clone https://github.com/Kinxandreas/clothing-store.git
cd clothing-store
npm install
```

### 2. Set up environment variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=https://ieftajzdhknurzjrucyn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```
Get your anon key from: Supabase Dashboard → Project Settings → API

### 3. Run the database schema
Go to Supabase Dashboard → SQL Editor and run the contents of `supabase/schema.sql`

### 4. Run locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

## Deploy
Connect this repo to [Vercel](https://vercel.com) and add your environment variables.
