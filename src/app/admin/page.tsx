'use client';
import { useState, useEffect, useCallback } from 'react';

interface Product {
  id: string;
  title: string;
  price: number;
  gender: string;
  category: string | null;
  status: string;
  created_at: string;
}

export default function AdminPage() {
  const [tab, setTab] = useState<'add' | 'products'>('add');
  const [form, setForm] = useState({ title: '', slug: '', description: '', price: '', category: '', gender: 'unisex', imageUrl: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    const res = await fetch('/api/products');
    if (res.ok) {
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    }
    setLoadingProducts(false);
  }, []);

  useEffect(() => {
    if (tab === 'products') fetchProducts();
  }, [tab, fetchProducts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setMessage('Error: ' + (data.error || 'Something went wrong'));
    } else {
      setMessage('Product added successfully!');
      setForm({ title: '', slug: '', description: '', price: '', category: '', gender: 'unisex', imageUrl: '' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    setDeleting(id);
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    setDeleting(null);
    if (res.ok) {
      setProducts(prev => prev.filter(p => p.id !== id));
    } else {
      alert('Failed to delete product.');
    }
  };

  const handleToggleStatus = async (product: Product) => {
    const newStatus = product.status === 'active' ? 'archived' : 'active';
    const res = await fetch(`/api/products/${product.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: newStatus } : p));
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="border-b border-stone-200 pb-8 mb-10">
        <span className="eyebrow text-stone-400 block mb-2">Internal</span>
        <h1 className="display" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>Admin Panel</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-stone-200 mb-10">
        {(['add', 'products'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`eyebrow px-6 py-3 border-b-2 transition-colors ${
              tab === t
                ? 'border-ink text-ink'
                : 'border-transparent text-stone-400 hover:text-stone-600'
            }`}
          >
            {t === 'add' ? 'Add Product' : 'All Products'}
          </button>
        ))}
      </div>

      {/* ADD PRODUCT */}
      {tab === 'add' && (
        <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
          {([
            ['Title', 'title', 'text'],
            ['Slug (URL)', 'slug', 'text'],
            ['Price (€)', 'price', 'number'],
            ['Category', 'category', 'text'],
            ['Image URL', 'imageUrl', 'url'],
          ] as [string, string, string][]).map(([label, field, type]) => (
            <div key={field}>
              <label className="block text-xs font-medium uppercase tracking-widest text-stone-500 mb-2">{label}</label>
              <input
                type={type}
                value={form[field as keyof typeof form]}
                onChange={e => setForm({ ...form, [field]: e.target.value })}
                required={field !== 'imageUrl'}
                className="w-full border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-ink transition-colors"
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium uppercase tracking-widest text-stone-500 mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-ink transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-widest text-stone-500 mb-2">Gender</label>
            <select
              value={form.gender}
              onChange={e => setForm({ ...form, gender: e.target.value })}
              className="w-full border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-ink transition-colors"
            >
              {['men', 'women', 'unisex', 'kids'].map(g => (
                <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>
              ))}
            </select>
          </div>
          {message && (
            <p className={`text-sm px-4 py-3 border ${
              message.startsWith('Error')
                ? 'text-red-600 bg-red-50 border-red-200'
                : 'text-green-700 bg-green-50 border-green-200'
            }`}>
              {message}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="eyebrow bg-ink text-paper px-10 py-4 hover:bg-stone-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Product'}
          </button>
        </form>
      )}

      {/* ALL PRODUCTS */}
      {tab === 'products' && (
        <div>
          {loadingProducts ? (
            <div className="py-20 text-center">
              <p className="eyebrow text-stone-400 animate-pulse">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-stone-200">
              <p className="eyebrow text-stone-400 mb-4">No products yet</p>
              <button onClick={() => setTab('add')} className="eyebrow text-accent link-underline">
                Add your first product →
              </button>
            </div>
          ) : (
            <div className="space-y-0 border-t border-stone-200">
              {products.map(product => (
                <div
                  key={product.id}
                  className="flex items-center justify-between gap-4 py-4 border-b border-stone-200"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{product.title}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="eyebrow text-stone-400 text-xs">€{Number(product.price).toFixed(2)}</span>
                      {product.category && <span className="eyebrow text-stone-400 text-xs">{product.category}</span>}
                      <span className="eyebrow text-stone-400 text-xs capitalize">{product.gender}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button
                      onClick={() => handleToggleStatus(product)}
                      className={`eyebrow text-xs px-3 py-1 border transition-colors ${
                        product.status === 'active'
                          ? 'border-green-200 text-green-700 bg-green-50 hover:bg-green-100'
                          : 'border-stone-200 text-stone-400 bg-stone-50 hover:bg-stone-100'
                      }`}
                    >
                      {product.status === 'active' ? 'Active' : 'Archived'}
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      disabled={deleting === product.id}
                      className="eyebrow text-xs text-stone-300 hover:text-red-500 transition-colors disabled:opacity-50"
                    >
                      {deleting === product.id ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-8">
            <button
              onClick={fetchProducts}
              className="eyebrow text-stone-400 hover:text-ink transition-colors link-underline text-xs"
            >
              Refresh list
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
