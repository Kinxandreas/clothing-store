import Link from 'next/link';
import Image from 'next/image';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

interface Collection {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  sort_order: number;
}

async function getCollections(): Promise<Collection[]> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
  const { data } = await supabase.from('collections').select('*').order('sort_order');
  return data ?? [];
}

export const revalidate = 0;

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-16 pb-10">
        <span className="eyebrow text-stone-400 block mb-3">Browse</span>
        <h1 className="display" style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)' }}>Collections</h1>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-10 pb-24">
        {collections.length === 0 ? (
          <div className="py-32 text-center">
            <p className="eyebrow text-stone-300 text-sm">No collections yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {collections.map((c) => (
              <Link key={c.id} href={`/collections/${c.slug}`} className="group block">
                <div className="overflow-hidden bg-stone-100">
                  {c.image_url ? (
                    <Image
                      src={c.image_url}
                      alt={c.name}
                      width={500}
                      height={500}
                      className="object-cover w-full aspect-square group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full aspect-square flex items-center justify-center bg-stone-100">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-stone-300">
                        <rect x="3" y="3" width="18" height="18" rx="1"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </div>
                  )}
                </div>
                <p className="eyebrow text-ink mt-4 tracking-widest uppercase" style={{ fontSize: '0.8rem', letterSpacing: '0.14em' }}>
                  {c.name}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
