export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  category: string | null;
  gender: 'men' | 'women' | 'unisex' | 'kids' | null;
  status: string;
  created_at: string;
  product_images?: ProductImage[];
  product_variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string | null;
  color: string | null;
  stock: number;
  sku: string | null;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  created_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  variant_id: string;
  quantity: number;
  unit_price: number;
}

export interface CartItem {
  variantId: string;
  productId: string;
  title: string;
  price: number;
  size: string | null;
  color: string | null;
  imageUrl: string | null;
  quantity: number;
}
