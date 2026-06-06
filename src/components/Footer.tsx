import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-charcoal text-white">
      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <span className="font-display text-3xl font-light tracking-[0.18em] block mb-4">KSTORE</span>
          <p className="text-white/40 text-sm font-light leading-relaxed max-w-xs">
            Curated clothing for every mood, every moment. Based in Cyprus.
          </p>
        </div>

        {/* Shop */}
        <div>
          <span className="label text-white/40 block mb-5">Shop</span>
          <ul className="space-y-3">
            {[['New Arrivals', '/shop'], ['Men', '/shop?gender=men'], ['Women', '/shop?gender=women'], ['Kids', '/shop?gender=kids']].map(([l, h]) => (
              <li key={l}><Link href={h} className="text-sm text-white/60 hover:text-white transition-colors font-light">{l}</Link></li>
            ))}
          </ul>
        </div>

        {/* Info */}
        <div>
          <span className="label text-white/40 block mb-5">Info</span>
          <ul className="space-y-3">
            {[['About Us', '/'], ['Shipping', '/'], ['Returns', '/'], ['Contact', '/']].map(([l, h]) => (
              <li key={l}><Link href={h} className="text-sm text-white/60 hover:text-white transition-colors font-light">{l}</Link></li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <span className="label text-white/40 block mb-5">Contact</span>
          <ul className="space-y-3 text-sm text-white/60 font-light">
            <li>Cyprus</li>
            <li>info@kstore.cy</li>
            <li>Mon – Sat: 9am – 7pm</li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="label text-white/30">© {new Date().getFullYear()} KSTORE. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/" className="label text-white/30 hover:text-white/60 transition-colors">Privacy Policy</Link>
            <Link href="/" className="label text-white/30 hover:text-white/60 transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
