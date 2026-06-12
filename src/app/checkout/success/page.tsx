import Link from 'next/link';

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div className="w-full max-w-md text-center">
        <div className="w-14 h-14 border border-stone-300 flex items-center justify-center mx-auto mb-8">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h1 className="display mb-3" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>Thank you.</h1>
        <p className="eyebrow text-stone-400 mb-10">Your order has been placed. We&apos;ll be in touch soon.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/orders"
            className="eyebrow bg-ink text-paper px-8 py-4 hover:bg-stone-800 transition-colors"
          >
            View Orders
          </Link>
          <Link
            href="/shop"
            className="eyebrow border border-stone-300 text-ink px-8 py-4 hover:border-ink transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
