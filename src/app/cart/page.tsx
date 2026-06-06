'use client';
import { useCartStore } from '@/store/cart';
import Link from 'next/link';

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-32 text-center">
        <h1 className="font-display text-4xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-brand-300 mb-8">Add some items to get started.</p>
        <Link href="/shop" className="bg-accent text-white px-8 py-3 rounded-full hover:bg-accent-hover transition-colors">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="font-display text-4xl font-bold mb-10">Your Cart</h1>
      <div className="space-y-4 mb-10">
        {items.map(item => (
          <div key={item.variantId} className="flex items-center gap-6 bg-white rounded-2xl p-5 shadow-sm">
            <div className="w-20 h-20 bg-brand-100 rounded-xl flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">{item.title}</p>
              <p className="text-sm text-brand-300">{item.size} · {item.color}</p>
              <p className="text-accent font-medium mt-1">€{item.price.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => updateQuantity(item.variantId, item.quantity - 1)} className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-brand-100">-</button>
              <span className="w-6 text-center">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.variantId, item.quantity + 1)} className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-brand-100">+</button>
            </div>
            <button onClick={() => removeItem(item.variantId)} className="text-brand-300 hover:text-red-500 transition-colors text-sm">Remove</button>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <span className="text-lg font-medium">Total</span>
          <span className="text-2xl font-bold">€{totalPrice().toFixed(2)}</span>
        </div>
        <Link href="/checkout" className="block w-full text-center bg-accent text-white py-4 rounded-full font-medium hover:bg-accent-hover transition-colors">
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}
