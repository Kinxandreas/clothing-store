import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login?redirect=/orders');

  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(*, products(title, product_images(image_url)))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const statusStyle: Record<string, string> = {
    pending:    'bg-amber-50 text-amber-700',
    processing: 'bg-blue-50 text-blue-700',
    shipped:    'bg-purple-50 text-purple-700',
    delivered:  'bg-green-50 text-green-700',
    cancelled:  'bg-red-50 text-red-600',
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-16">
      <div className="border-b border-stone-200 pb-8 mb-10">
        <span className="eyebrow text-stone-400 block mb-2">Account</span>
        <h1 className="display" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>Your Orders</h1>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="py-28 text-center border border-dashed border-stone-200">
          <p className="display text-stone-200 text-[5rem] leading-none mb-6 select-none">0</p>
          <h2 className="display text-2xl mb-3">No orders yet</h2>
          <p className="eyebrow text-stone-400 mb-8">Your order history will appear here</p>
          <Link
            href="/shop"
            className="eyebrow bg-ink text-paper px-10 py-4 hover:bg-stone-800 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {(orders as any[]).map((order) => (
            <div key={order.id} className="border border-stone-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 md:px-8 py-5 border-b border-stone-100">
                <div>
                  <p className="text-xs text-stone-400 font-mono mb-1">#{order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-sm text-stone-500">
                    {new Date(order.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`eyebrow px-3 py-1 capitalize text-xs ${
                    statusStyle[order.status] ?? 'bg-stone-100 text-stone-600'
                  }`}>
                    {order.status}
                  </span>
                  <span className="display text-xl tabular-nums">
                    €{Number(order.total).toFixed(2)}
                  </span>
                </div>
              </div>

              {order.order_items && order.order_items.length > 0 && (
                <div className="px-6 md:px-8 py-5 space-y-4">
                  {(order.order_items as any[]).map((item) => {
                    const imageUrl = item.products?.product_images?.[0]?.image_url;
                    return (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="w-12 h-16 bg-stone-100 flex-shrink-0 relative overflow-hidden">
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={item.products?.title ?? 'Product'}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : null}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-ink">
                            {item.products?.title ?? 'Product'}
                          </p>
                          {item.size && (
                            <p className="eyebrow text-stone-400 text-xs mt-0.5">{item.size}</p>
                          )}
                        </div>
                        <div className="text-right text-sm">
                          <p className="text-stone-400">× {item.quantity}</p>
                          {item.price != null && (
                            <p className="tabular-nums font-medium">€{Number(item.price).toFixed(2)}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {order.shipping_address && (
                <div className="px-6 md:px-8 py-4 border-t border-stone-100">
                  <p className="text-xs text-stone-400">
                    <span className="eyebrow mr-2">Shipped to</span>{order.shipping_address}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-12 pt-8 border-t border-stone-200">
        <Link href="/shop" className="eyebrow text-stone-400 hover:text-ink transition-colors link-underline">
          ← Continue Shopping
        </Link>
      </div>
    </div>
  );
}
