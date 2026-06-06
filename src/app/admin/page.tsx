'use client';
import { useState } from 'react';

export default function AdminPage() {
  const [form, setForm] = useState({ title: '', slug: '', description: '', price: '', category: '', gender: 'unisex', imageUrl: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Use the secure API route instead of calling Supabase directly from client
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

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="font-display text-4xl font-bold mb-2">Admin Panel</h1>
      <p className="text-brand-500 mb-10 text-sm">Add new products to the store</p>
      <form onSubmit={handleSubmit} className="space-y-5">
        {[['Title', 'title', 'text'], ['Slug (URL)', 'slug', 'text'], ['Price (€)', 'price', 'number'], ['Category', 'category', 'text'], ['Image URL', 'imageUrl', 'url']].map(([label, field, type]) => (
          <div key={field}>
            <label className="block text-sm font-medium mb-2">{label}</label>
            <input type={type} value={form[field as keyof typeof form]} onChange={e => setForm({ ...form, [field]: e.target.value })} required={field !== 'imageUrl'}
              className="w-full border border-brand-300 rounded-xl px-4 py-3 focus:outline-none focus:border-accent" />
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            rows={3} className="w-full border border-brand-300 rounded-xl px-4 py-3 focus:outline-none focus:border-accent" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Gender</label>
          <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}
            className="w-full border border-brand-300 rounded-xl px-4 py-3 focus:outline-none focus:border-accent">
            {['men', 'women', 'unisex', 'kids'].map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        {message && <p className={`text-sm font-medium px-4 py-2 rounded-lg ${message.startsWith('Error') ? 'text-red-600 bg-red-50' : 'text-green-700 bg-green-50'}`}>{message}</p>}
        <button type="submit" disabled={loading} className="w-full bg-accent text-white py-4 rounded-full font-medium hover:bg-accent-hover transition-colors disabled:opacity-60">
          {loading ? 'Adding...' : 'Add Product'}
        </button>
      </form>
    </div>
  );
}
