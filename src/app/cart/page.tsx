'use client';
import { useCartStore } from '@/store/cart';
import Link from 'next/link';
import Image from 'next/image';

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
        <p className="display text-stone-200 text-[5rem] leading-none mb-6 select-none">0</p>
        <h1 className="display text-3xl mb-3">Your bag is empty</h1>
        <p className="eyebrow text-stone-400 mb-10">Add items to get started</p>
        <Link href="/shop"
          className="eyebrow bg-ink text-paper px-10 py-4 hover:bg-stone-800 transition-colors">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-stone-200 px-6 md:px-10 py-10">
        <div className="max-w-[1400px] mx-auto flex items-end justify-between">
          <div>
            <h1 className="display" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>Your Bag</h1>
            <p className="eyebrow text-stone-400 mt-1">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-10">
        <div className="grid md:grid-cols-[1fr_360px] gap-12">

          {/* Items */}
          <div className="space-y-0 border-t border-stone-200">
            {items.map(item => (
              <div key={item.variantId} className="flex gap-5 py-6 border-b border-stone-200">
                {/* Product image placeholder */}
                <div className="w-20 h-28 bg-stone-100 flex-shrink-0 relative overflow-hidden">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.title} fill className="object-cover" sizes="80px" />
                  ) : (
                    <div className="w-full h-full bg-stone-100" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col gap-1">
                  <p className="text-sm font-medium text-ink">{item.title}</p>
                  {(item.size || item.color) && (
                    <p className="eyebrow text-stone-400">
                      {[item.size, item.color].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  <p className="text-sm text-stone-500 tabular-nums mt-auto">€{item.price.toFixed(2)}</p>
                </div>

                {/* Qty + Remove */}
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="eyebrow text-stone-300 hover:text-red-400 transition-colors">
                    Remove
                  </button>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      className="w-8 h-8 border border-stone-300 hover:border-ink flex items-center justify-center text-sm transition-colors">
                      −
                    </button>
                    <span className="text-sm tabular-nums w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      className="w-8 h-8 border border-stone-300 hover:border-ink flex items-center justify-center text-sm transition-colors">
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="self-start border border-stone-200 p-8">
            <h2 className="eyebrow text-ink mb-6">Order Summary</h2>
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between text-stone-500">
                <span>Subtotal</span>
                <span className="tabular-nums">€{totalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Shipping</span>
                <span>{totalPrice() >= 80 ? <span className="text-green-600">Free</span> : '€5.00'}</span>
              </div>
              <div className="border-t border-stone-200 pt-3 flex justify-between font-medium text-ink">
                <span>Total</span>
                <span className="tabular-nums">
                  €{(totalPrice() >= 80 ? totalPrice() : totalPrice() + 5).toFixed(2)}
                </span>
              </div>
            </div>
            <Link href="/checkout"
              className="eyebrow block w-full text-center bg-ink text-paper py-4 hover:bg-stone-800 transition-colors mb-4">
              Checkout
            </Link>
            <Link href="/shop" className="eyebrow text-stone-400 hover:text-ink transition-colors block text-center">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
