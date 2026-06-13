'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface Profile {
  full_name?: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  postal_code?: string;
  country?: string;
}

const EMPTY: Profile = {
  full_name: '', phone: '',
  address_line1: '', address_line2: '',
  city: '', postal_code: '', country: 'Cyprus',
};

export default function AccountPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [form, setForm] = useState<Profile>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/login?redirect=/account'); return; }
      setEmail(data.user.email ?? '');
    });
    fetch('/api/account/profile')
      .then(r => r.json())
      .then(({ profile }) => {
        if (profile) setForm({ ...EMPTY, ...profile });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  const set = (field: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const res = await fetch('/api/account/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Save failed');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:border-ink transition-colors bg-paper';
  const labelClass = 'eyebrow text-stone-400 block mb-2 text-xs';

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-16">
        <div className="max-w-xl">
          <div className="h-8 w-48 bg-stone-100 animate-pulse mb-10" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-stone-100 animate-pulse mb-4" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-16">
      {/* Header */}
      <div className="border-b border-stone-200 pb-8 mb-10">
        <span className="eyebrow text-stone-400 block mb-2">Account</span>
        <h1 className="display" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>My Account</h1>
      </div>

      <div className="grid md:grid-cols-[1fr_320px] gap-12 items-start max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Contact */}
          <section>
            <h2 className="eyebrow text-ink mb-5 pb-3 border-b border-stone-200">Contact Info</h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className={`${inputClass} opacity-50 cursor-not-allowed`}
                />
                <p className="text-xs text-stone-400 mt-1.5">Email cannot be changed here.</p>
              </div>
              <div>
                <label className={labelClass}>Full Name</label>
                <input
                  type="text"
                  value={form.full_name ?? ''}
                  onChange={set('full_name')}
                  placeholder="Panayiotis Gregoriou"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input
                  type="tel"
                  value={form.phone ?? ''}
                  onChange={set('phone')}
                  placeholder="+357 99 000000"
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          {/* Shipping Address */}
          <section>
            <h2 className="eyebrow text-ink mb-5 pb-3 border-b border-stone-200">Default Shipping Address</h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Address Line 1</label>
                <input
                  type="text"
                  value={form.address_line1 ?? ''}
                  onChange={set('address_line1')}
                  placeholder="123 Ledra Street"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Address Line 2 <span className="normal-case font-normal">(Apt, floor, etc.)</span></label>
                <input
                  type="text"
                  value={form.address_line2 ?? ''}
                  onChange={set('address_line2')}
                  placeholder="Apt 4B"
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>City</label>
                  <input
                    type="text"
                    value={form.city ?? ''}
                    onChange={set('city')}
                    placeholder="Nicosia"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Postal Code</label>
                  <input
                    type="text"
                    value={form.postal_code ?? ''}
                    onChange={set('postal_code')}
                    placeholder="1011"
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Country</label>
                <select
                  value={form.country ?? 'Cyprus'}
                  onChange={set('country')}
                  className={inputClass}
                >
                  <option>Cyprus</option>
                  <option>Greece</option>
                  <option>United Kingdom</option>
                  <option>Germany</option>
                  <option>France</option>
                  <option>Italy</option>
                  <option>Spain</option>
                  <option>Netherlands</option>
                  <option>United States</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          </section>

          {/* Feedback */}
          {error && (
            <p className="text-red-600 text-sm border border-red-200 px-4 py-3">{error}</p>
          )}
          {saved && (
            <p className="text-green-700 text-sm border border-green-200 bg-green-50 px-4 py-3 flex items-center gap-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Changes saved successfully.
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="eyebrow bg-ink text-paper px-10 py-4 hover:bg-stone-800 transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>

        {/* Sidebar info */}
        <aside className="border border-stone-200 p-6 space-y-4 self-start">
          <h3 className="eyebrow text-ink text-xs mb-1">Why we ask</h3>
          <p className="text-sm text-stone-500 leading-relaxed">
            Your shipping address is used to pre-fill checkout so you don&apos;t have to type it every time.
            We never share your details with third parties.
          </p>
          <div className="border-t border-stone-100 pt-4 space-y-2">
            <Link href="/orders" className="eyebrow text-stone-500 hover:text-ink transition-colors text-xs flex items-center gap-2">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
              </svg>
              View my orders
            </Link>
          </div>
        </aside>
      </div>

      <div className="mt-12 pt-8 border-t border-stone-200">
        <Link href="/shop" className="eyebrow text-stone-400 hover:text-ink transition-colors">
          ← Continue Shopping
        </Link>
      </div>
    </div>
  );
}
