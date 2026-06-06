import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'KINX — Men\'s Streetwear',
  description: 'Bold streetwear for men. Clothes, hats and accessories built for the streets.',
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
        <div style={{ background: '#0f0e0c', height: '34px', overflow: 'hidden' }} className="flex items-center">
          <div className="marquee flex whitespace-nowrap">
            {Array(6).fill(null).map((_, i) => (
              <span key={i} className="eyebrow text-white/50 px-14">
                FREE SHIPPING ON ORDERS OVER €80
                &nbsp;&nbsp;·&nbsp;&nbsp;
                NEW DROPS EVERY WEEK
                &nbsp;&nbsp;·&nbsp;&nbsp;
                KINX — CYPRUS STREETWEAR
              </span>
            ))}
          </div>
        </div>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
