import Link from 'next/link';

export default function SuccessPage() {
  return (
    <div className="max-w-lg mx-auto px-6 py-32 text-center">
      <div className="text-5xl mb-6">🎉</div>
      <h1 className="font-display text-4xl font-bold mb-4">Order Placed!</h1>
      <p className="text-brand-300 mb-10">Thank you for your order. We'll be in touch soon.</p>
      <Link href="/shop" className="bg-accent text-white px-8 py-3 rounded-full hover:bg-accent-hover transition-colors">
        Continue Shopping
      </Link>
    </div>
  );
}
