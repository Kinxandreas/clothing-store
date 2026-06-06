import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-stone-200">
      {/* Newsletter */}
      <div className="bg-stone-100 px-6 md:px-10 py-14">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <span className="eyebrow text-stone-500 block mb-2">Stay Updated</span>
            <p className="display" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)' }}>Join the community</p>
          </div>
          <form className="flex gap-0 max-w-md w-full" onSubmit={e => e.preventDefault()}>
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 border border-stone-300 border-r-0 px-5 py-3 text-sm bg-white focus:outline-none focus:border-ink placeholder:text-stone-300"
            />
            <button type="submit"
              className="eyebrow bg-ink text-paper px-7 py-3 hover:bg-stone-800 transition-colors flex-shrink-0">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Main grid */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-14 grid grid-cols-2 md:grid-cols-5 gap-10">
        {/* Brand */}
        <div className="col-span-2">
          <Link href="/" className="display tracking-[0.2em] text-2xl block mb-5">KSTORE</Link>
          <p className="text-[13px] text-stone-400 leading-relaxed max-w-[220px] font-light">
            Premium clothing curated for every mood and moment. Based in Cyprus.
          </p>
          <div className="flex items-center gap-4 mt-6">
            {/* Instagram icon */}
            <a href="#" aria-label="Instagram" className="text-stone-400 hover:text-ink transition-colors">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            {/* Facebook icon */}
            <a href="#" aria-label="Facebook" className="text-stone-400 hover:text-ink transition-colors">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Shop */}
        <div>
          <span className="eyebrow text-stone-400 block mb-5">Shop</span>
          <ul className="space-y-3">
            {[['New Arrivals', '/shop'], ['Men', '/shop?gender=men'], ['Women', '/shop?gender=women'], ['Kids', '/shop?gender=kids']].map(([l, h]) => (
              <li key={l}><Link href={h} className="text-[13px] text-stone-500 hover:text-ink transition-colors font-light link-underline">{l}</Link></li>
            ))}
          </ul>
        </div>

        {/* Help */}
        <div>
          <span className="eyebrow text-stone-400 block mb-5">Help</span>
          <ul className="space-y-3">
            {['Shipping', 'Returns', 'Size Guide', 'FAQ'].map(l => (
              <li key={l}><Link href="/" className="text-[13px] text-stone-500 hover:text-ink transition-colors font-light link-underline">{l}</Link></li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <span className="eyebrow text-stone-400 block mb-5">Contact</span>
          <ul className="space-y-3 text-[13px] text-stone-500 font-light">
            <li>Nicosia, Cyprus</li>
            <li><a href="mailto:info@kstore.cy" className="hover:text-ink transition-colors">info@kstore.cy</a></li>
            <li>Mon–Sat 9am–7pm</li>
          </ul>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-stone-200 px-6 md:px-10 py-5">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="eyebrow text-stone-400">© {new Date().getFullYear()} KSTORE. All rights reserved.</p>
          <div className="flex gap-8">
            {['Privacy Policy', 'Terms of Use', 'Cookie Policy'].map(l => (
              <Link key={l} href="/" className="eyebrow text-stone-400 hover:text-ink transition-colors">{l}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
