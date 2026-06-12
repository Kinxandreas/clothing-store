import Link from 'next/link';
import Image from 'next/image';

const collections = [
  { slug: 'collection-1', label: 'Collection 1', image: '/hero.jpg' },
  { slug: 'collection-2', label: 'Collection 2', image: '/hero1.jpg' },
  { slug: 'collection-3', label: 'Collection 3', image: '/hero2.jpg' },
  { slug: 'collection-4', label: 'Collection 4', image: '/hero.jpg' },
  { slug: 'collection-5', label: 'Collection 5', image: '/hero1.jpg' },
];

export default function CollectionsPage() {
  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-16 pb-10">
        <span className="eyebrow text-stone-400 block mb-3">Browse</span>
        <h1 className="display" style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)' }}>Collections</h1>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-10 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map((c) => (
            <Link
              key={c.slug}
              href={`/collections/${c.slug}`}
              className="group block"
            >
              <div className="overflow-hidden">
                <Image
                  src={c.image}
                  alt={c.label}
                  width={500}
                  height={500}
                  className="object-cover w-full aspect-square group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <p
                className="eyebrow text-ink mt-4 tracking-widest uppercase"
                style={{ fontSize: '0.8rem', letterSpacing: '0.14em' }}
              >
                {c.label}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
