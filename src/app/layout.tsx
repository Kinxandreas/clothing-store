import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'KSTORE — Premium Clothing',
  description: 'Curated clothing for every mood, every moment.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {/* Announcement bar */}
        <div className="bg-charcoal text-white overflow-hidden" style={{ height: '36px' }}>
          <div className="flex items-center h-full">
            <div className="marquee-track flex whitespace-nowrap gap-0">
              {Array(8).fill(null).map((_, i) => (
                <span key={i} className="label text-white/70 px-12">
                  FREE SHIPPING ON ORDERS OVER €80 &nbsp;·&nbsp; NEW COLLECTION AVAILABLE NOW &nbsp;·&nbsp; KSTORE CYPRUS
                </span>
              ))}
            </div>
          </div>
        </div>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
