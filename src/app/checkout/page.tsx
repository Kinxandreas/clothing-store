'use client';
import { useState } from 'react';
import { useCartStore } from '@/store/cart';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartStore();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', address: '', city: '', zip: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login?redirect=/checkout');
      return;
    }

    const shipping_address = `${form.name}, ${form.address}, ${form.city} ${form.zip}`;
    const orderItems = items.map(i => ({
      product_id: i.productId,
      quantity: i.quantity,
      size: i.size,
    }));

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: orderItems,
        total: totalPrice(),
        shipping_address,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Something went wrong. Please try again.');
      return;
    }

    clearCart();
    router.push('/checkout/success');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
        <p className="display text-stone-200 text-[5rem] leading-none mb-6 select-none">0</p>
        <h1 className="display text-3xl mb-3">Your bag is empty</h1>
        <p className="eyebrow text-stone-400 mb-10">Add items before checking out</p>
        <a href="/shop" className="eyebrow bg-ink text-paper px-10 py-4 hover:bg-stone-800 transition-colors">
          Continue Shopping
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="border-b border-stone-200 pb-8 mb-10">
        <span className="eyebrow text-stone-400 block mb-2">Step 2 of 2</span>
        <h1 className="display" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>Checkout</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {([
          ['Full Name', 'name', 'text'],
          ['Email', 'email', 'email'],
          ['Address', 'address', 'text'],
          ['City', 'city', 'text'],
          ['ZIP Code', 'zip', 'text'],
        ] as [string, string, string][]).map(([label, field, type]) => (
          <div key={field}>
            <label className="block text-xs font-medium uppercase tracking-widest text-stone-500 mb-2">{label}</label>
            <input
              type={type}
              required
              value={form[field as keyof typeof form]}
              onChange={e => setForm({ ...form, [field]: e.target.value })}
              className="w-full border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-ink transition-colors"
            />
          </div>
        ))}

        <div className="border border-stone-200 p-6 mt-6">
          <p className="eyebrow text-stone-400 mb-4">Order Summary</p>
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.variantId} className="flex justify-between text-sm">
                <span className="text-stone-600">
                  {item.title}{item.size ? ` (${item.size})` : ''} × {item.quantity}
                </span>
                <span className="tabular-nums font-medium">€{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-stone-200 mt-4 pt-4 flex justify-between">
            <span className="eyebrow text-stone-500">Total</span>
            <span className="display text-xl tabular-nums">€{totalPrice().toFixed(2)}</span>
          </div>
        </div>

        {error && (
          <p className="text-red-600 bg-red-50 text-sm px-4 py-3 border border-red-200">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full eyebrow bg-ink text-paper py-4 hover:bg-stone-800 transition-colors disabled:opacity-50 mt-2"
        >
          {loading ? 'Placing Order...' : 'Place Order'}
        </button>

        <p className="text-xs text-stone-400 text-center">
          You must be signed in to complete your order.
        </p>
      </form>
    </div>
  );
}
