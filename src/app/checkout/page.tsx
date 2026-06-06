'use client';
import { useState } from 'react';
import { useCartStore } from '@/store/cart';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartStore();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', address: '', city: '', zip: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    clearCart();
    router.push('/checkout/success');
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="font-display text-4xl font-bold mb-10">Checkout</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        {[['Full Name', 'name', 'text'], ['Email', 'email', 'email'], ['Address', 'address', 'text'], ['City', 'city', 'text'], ['ZIP Code', 'zip', 'text']].map(([label, field, type]) => (
          <div key={field}>
            <label className="block text-sm font-medium mb-2">{label}</label>
            <input
              type={type}
              required
              value={form[field as keyof typeof form]}
              onChange={e => setForm({ ...form, [field]: e.target.value })}
              className="w-full border border-brand-300 rounded-xl px-4 py-3 focus:outline-none focus:border-accent"
            />
          </div>
        ))}
        <div className="bg-brand-100 rounded-2xl p-5 mt-6">
          <div className="flex justify-between font-semibold text-lg">
            <span>Order Total</span>
            <span>€{totalPrice().toFixed(2)}</span>
          </div>
          <p className="text-sm text-brand-300 mt-1">{items.length} item(s)</p>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-accent text-white py-4 rounded-full font-medium hover:bg-accent-hover transition-colors disabled:opacity-60">
          {loading ? 'Placing Order...' : 'Place Order'}
        </button>
      </form>
    </div>
  );
}
