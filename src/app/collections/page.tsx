import Link from 'next/link';

const collections = [
  {
    slug: 'collection-1',
    label: 'Collection 1',
    description: 'Explore the first drop from KINX.',
  },
  {
    slug: 'collection-2',
    label: 'Collection 2',
    description: 'Bold pieces from our second release.',
  },
  {
    slug: 'collection-3',
    label: 'Collection 3',
    description: 'Street-ready fits for every occasion.',
  },
  {
    slug: 'collection-4',
    label: 'Collection 4',
    description: 'Limited edition — built for the streets.',
  },
  {
    slug: 'collection-5',
    label: 'Collection 5',
    description: 'The latest drop. Fresh out the box.',
  },
];

export default function CollectionsPage() {
  return (
    <div className="min-h-screen bg-paper">
      {/* Header */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-24 pb-12">
        <span className="eyebrow text-stone-400 block mb-3">Browse</span>
        <h1 className="display" style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)' }}>Collections</h1>
      </div>

      {/* Grid */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((c, i) => (
            <Link
              key={c.slug}
              href={`/collections/${c.slug}`}
              className="group relative bg-stone-900 overflow-hidden block"
              style={{ aspectRatio: '4/3' }}
            >
              {/* Placeholder background — replace with real collection images */}
              <div className="absolute inset-0 bg-gradient-to-br from-stone-700 to-stone-900 group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8">
                <span className="eyebrow text-white/50 block mb-2 text-xs">Drop {String(i + 1).padStart(2, '0')}</span>
                <h2 className="display text-white text-3xl group-hover:text-accent transition-colors duration-300">
                  {c.label}
                </h2>
                <p className="eyebrow text-white/60 mt-2 text-xs">{c.description}</p>
              </div>
              <div className="absolute top-6 right-6 w-8 h-8 rounded-full border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="1.5">
                  <path d="M2 10L10 2M10 2H4M10 2v6" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
