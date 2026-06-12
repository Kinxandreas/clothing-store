import Link from 'next/link';

const collections = [
  { slug: 'collection-1', label: 'Collection 1', description: 'The first drop from KINX.' },
  { slug: 'collection-2', label: 'Collection 2', description: 'Bold pieces from our second release.' },
  { slug: 'collection-3', label: 'Collection 3', description: 'Street-ready fits for every occasion.' },
  { slug: 'collection-4', label: 'Collection 4', description: 'Limited edition — built for the streets.' },
  { slug: 'collection-5', label: 'Collection 5', description: 'The latest drop. Fresh out the box.' },
];

export default function CollectionsPage() {
  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-16 pb-6">
        <span className="eyebrow text-stone-400 block mb-3">Browse</span>
        <h1 className="display" style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)' }}>Collections</h1>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-10 pb-24">
        <div className="border-t border-stone-200">
          {collections.map((c, i) => (
            <Link
              key={c.slug}
              href={`/collections/${c.slug}`}
              className="group flex items-center justify-between py-7 border-b border-stone-200 hover:bg-stone-50 transition-colors px-2 -mx-2"
            >
              <div className="flex items-center gap-8">
                <span className="eyebrow text-stone-300 text-xs w-6">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h2 className="display text-ink group-hover:text-accent transition-colors duration-200" style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)' }}>
                    {c.label}
                  </h2>
                  <p className="eyebrow text-stone-400 text-xs mt-1">{c.description}</p>
                </div>
              </div>
              <svg
                width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3"
                className="text-stone-300 group-hover:text-ink group-hover:translate-x-1 transition-all duration-200 flex-shrink-0"
              >
                <path d="M3 9h12M10 4l5 5-5 5" />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
