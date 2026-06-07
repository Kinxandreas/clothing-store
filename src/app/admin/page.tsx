'use client';
import { useState, useEffect, useCallback } from 'react';

type Tab = 'products' | 'add-product' | 'categories' | 'add-category';

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  cost_price: number | null;
  category: string | null;
  gender: string;
  status: string;
  image_url?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  gender: string;
  sort_order: number;
}

const EMPTY_PRODUCT = { title: '', slug: '', description: '', price: '', cost_price: '', category: '', gender: 'unisex', status: 'active', image_url: '' };
const EMPTY_CATEGORY = { name: '', slug: '', gender: 'all', sort_order: '0' };

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [productForm, setProductForm] = useState({ ...EMPTY_PRODUCT });
  const [categoryForm, setCategoryForm] = useState({ ...EMPTY_CATEGORY });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    const res = await fetch('/api/admin/products');
    if (res.ok) setProducts(await res.json());
    setLoadingProducts(false);
  }, []);

  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    const res = await fetch('/api/admin/categories');
    if (res.ok) setCategories(await res.json());
    setLoadingCategories(false);
  }, []);

  useEffect(() => { fetchProducts(); fetchCategories(); }, [fetchProducts, fetchCategories]);

  // ── Product handlers ──────────────────────────────────────────────
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setMsg('');
    const payload = {
      ...productForm,
      price: parseFloat(productForm.price) || 0,
      cost_price: productForm.cost_price ? parseFloat(productForm.cost_price) : null,
      slug: productForm.slug || slugify(productForm.title),
    };
    const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';
    const method = editingProduct ? 'PATCH' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setMsg('Error: ' + (data.error || 'Something went wrong')); return; }
    setMsg(editingProduct ? 'Product updated!' : 'Product added!');
    setProductForm({ ...EMPTY_PRODUCT });
    setEditingProduct(null);
    fetchProducts();
    setTimeout(() => setTab('products'), 800);
  };

  const startEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProductForm({
      title: p.title,
      slug: p.slug,
      description: p.description || '',
      price: String(p.price),
      cost_price: p.cost_price != null ? String(p.cost_price) : '',
      category: p.category || '',
      gender: p.gender,
      status: p.status,
      image_url: p.image_url || '',
    });
    setMsg('');
    setTab('add-product');
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    setDeleting(id);
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    setDeleting(null);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleToggleStatus = async (p: Product) => {
    const newStatus = p.status === 'active' ? 'archived' : 'active';
    await fetch(`/api/admin/products/${p.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
    setProducts(prev => prev.map(x => x.id === p.id ? { ...x, status: newStatus } : x));
  };

  // ── Category handlers ─────────────────────────────────────────────
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setMsg('');
    const payload = { ...categoryForm, sort_order: parseInt(categoryForm.sort_order) || 0, slug: categoryForm.slug || slugify(categoryForm.name) };
    const url = editingCategory ? `/api/admin/categories/${editingCategory.id}` : '/api/admin/categories';
    const method = editingCategory ? 'PATCH' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setMsg('Error: ' + (data.error || 'Something went wrong')); return; }
    setMsg(editingCategory ? 'Category updated!' : 'Category added!');
    setCategoryForm({ ...EMPTY_CATEGORY });
    setEditingCategory(null);
    fetchCategories();
    setTimeout(() => setTab('categories'), 800);
  };

  const startEditCategory = (c: Category) => {
    setEditingCategory(c);
    setCategoryForm({ name: c.name, slug: c.slug, gender: c.gender, sort_order: String(c.sort_order) });
    setMsg('');
    setTab('add-category');
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    setDeleting(id);
    await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
    setDeleting(null);
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // ── UI ────────────────────────────────────────────────────────────
  const tabs: { key: Tab; label: string }[] = [
    { key: 'products', label: 'All Products' },
    { key: 'add-product', label: editingProduct ? 'Edit Product' : 'Add Product' },
    { key: 'categories', label: 'All Categories' },
    { key: 'add-category', label: editingCategory ? 'Edit Category' : 'Add Category' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="border-b border-stone-200 pb-8 mb-10">
        <span className="eyebrow text-stone-400 block mb-2">Internal</span>
        <h1 className="display" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>Admin Panel</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-stone-200 mb-10 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setMsg(''); }}
            className={`eyebrow px-5 py-3 border-b-2 transition-colors whitespace-nowrap ${
              tab === t.key ? 'border-ink text-ink' : 'border-transparent text-stone-400 hover:text-stone-600'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── ALL PRODUCTS ── */}
      {tab === 'products' && (
        <div>
          {loadingProducts ? (
            <p className="eyebrow text-stone-400 animate-pulse">Loading...</p>
          ) : products.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-stone-200">
              <p className="eyebrow text-stone-400 mb-4">No products yet</p>
              <button onClick={() => setTab('add-product')} className="eyebrow text-accent link-underline">Add your first product →</button>
            </div>
          ) : (
            <div className="border-t border-stone-200">
              {products.map(p => (
                <div key={p.id} className="flex items-center justify-between gap-4 py-4 border-b border-stone-200">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{p.title}</p>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="eyebrow text-stone-500 text-xs">Sell: €{Number(p.price).toFixed(2)}</span>
                      {p.cost_price != null && (
                        <span className="eyebrow text-xs bg-amber-50 text-amber-700 px-2 py-0.5 border border-amber-200">Cost: €{Number(p.cost_price).toFixed(2)}</span>
                      )}
                      {p.category && <span className="eyebrow text-stone-400 text-xs">{p.category}</span>}
                      <span className="eyebrow text-stone-400 text-xs capitalize">{p.gender}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button onClick={() => handleToggleStatus(p)}
                      className={`eyebrow text-xs px-3 py-1 border transition-colors ${
                        p.status === 'active' ? 'border-green-200 text-green-700 bg-green-50 hover:bg-green-100' : 'border-stone-200 text-stone-400 bg-stone-50 hover:bg-stone-100'
                      }`}>
                      {p.status === 'active' ? 'Active' : 'Archived'}
                    </button>
                    <button onClick={() => startEditProduct(p)} className="eyebrow text-xs text-stone-400 hover:text-ink transition-colors">Edit</button>
                    <button onClick={() => handleDeleteProduct(p.id)} disabled={deleting === p.id}
                      className="eyebrow text-xs text-stone-300 hover:text-red-500 transition-colors disabled:opacity-50">
                      {deleting === p.id ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button onClick={fetchProducts} className="eyebrow text-stone-400 hover:text-ink transition-colors text-xs mt-8 link-underline">Refresh</button>
        </div>
      )}

      {/* ── ADD / EDIT PRODUCT ── */}
      {tab === 'add-product' && (
        <form onSubmit={handleProductSubmit} className="space-y-5 max-w-2xl">
          {editingProduct && (
            <div className="bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
              Editing: <strong>{editingProduct.title}</strong>
              <button type="button" onClick={() => { setEditingProduct(null); setProductForm({ ...EMPTY_PRODUCT }); setMsg(''); }}
                className="ml-4 text-xs underline">Cancel edit</button>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-widest text-stone-500 mb-2">Title</label>
            <input type="text" required value={productForm.title}
              onChange={e => setProductForm({ ...productForm, title: e.target.value, slug: slugify(e.target.value) })}
              className="w-full border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-ink transition-colors" />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-widest text-stone-500 mb-2">Slug (URL)</label>
            <input type="text" required value={productForm.slug}
              onChange={e => setProductForm({ ...productForm, slug: e.target.value })}
              className="w-full border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-ink transition-colors font-mono" />
          </div>

          {/* Prices row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-widest text-stone-500 mb-2">Selling Price (€)</label>
              <input type="number" step="0.01" min="0" required value={productForm.price}
                onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                className="w-full border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-ink transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-widest text-stone-500 mb-2">
                <span className="text-amber-600">Cost Price (€)</span>
                <span className="ml-2 normal-case font-normal text-stone-400">— admin only</span>
              </label>
              <input type="number" step="0.01" min="0" value={productForm.cost_price}
                onChange={e => setProductForm({ ...productForm, cost_price: e.target.value })}
                className="w-full border border-amber-200 bg-amber-50 px-4 py-3 text-sm focus:outline-none focus:border-amber-400 transition-colors" />
            </div>
          </div>

          {/* Category & Gender row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-widest text-stone-500 mb-2">Category</label>
              <input type="text" list="categories-list" value={productForm.category}
                onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                className="w-full border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-ink transition-colors" />
              <datalist id="categories-list">
                {categories.map(c => <option key={c.id} value={c.name} />)}
              </datalist>
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-widest text-stone-500 mb-2">Gender</label>
              <select value={productForm.gender} onChange={e => setProductForm({ ...productForm, gender: e.target.value })}
                className="w-full border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-ink transition-colors">
                {['men', 'women', 'unisex', 'kids'].map(g => <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>)}
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-widest text-stone-500 mb-2">Status</label>
            <select value={productForm.status} onChange={e => setProductForm({ ...productForm, status: e.target.value })}
              className="w-full border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-ink transition-colors">
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-widest text-stone-500 mb-2">Image URL</label>
            <input type="url" value={productForm.image_url}
              onChange={e => setProductForm({ ...productForm, image_url: e.target.value })}
              className="w-full border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-ink transition-colors" />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-widest text-stone-500 mb-2">Description</label>
            <textarea value={productForm.description} rows={4}
              onChange={e => setProductForm({ ...productForm, description: e.target.value })}
              className="w-full border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-ink transition-colors" />
          </div>

          {msg && (
            <p className={`text-sm px-4 py-3 border ${msg.startsWith('Error') ? 'text-red-600 bg-red-50 border-red-200' : 'text-green-700 bg-green-50 border-green-200'}`}>{msg}</p>
          )}

          <button type="submit" disabled={saving}
            className="eyebrow bg-ink text-paper px-10 py-4 hover:bg-stone-800 transition-colors disabled:opacity-50">
            {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
          </button>
        </form>
      )}

      {/* ── ALL CATEGORIES ── */}
      {tab === 'categories' && (
        <div>
          {loadingCategories ? (
            <p className="eyebrow text-stone-400 animate-pulse">Loading...</p>
          ) : categories.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-stone-200">
              <p className="eyebrow text-stone-400 mb-4">No categories yet</p>
              <button onClick={() => setTab('add-category')} className="eyebrow text-accent link-underline">Add your first category →</button>
            </div>
          ) : (
            <div className="border-t border-stone-200">
              {categories.map(c => (
                <div key={c.id} className="flex items-center justify-between gap-4 py-4 border-b border-stone-200">
                  <div>
                    <p className="text-sm font-medium text-ink">{c.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="eyebrow text-stone-400 text-xs font-mono">{c.slug}</span>
                      <span className="eyebrow text-stone-400 text-xs capitalize">{c.gender}</span>
                      <span className="eyebrow text-stone-400 text-xs">Order: {c.sort_order}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => startEditCategory(c)} className="eyebrow text-xs text-stone-400 hover:text-ink transition-colors">Edit</button>
                    <button onClick={() => handleDeleteCategory(c.id)} disabled={deleting === c.id}
                      className="eyebrow text-xs text-stone-300 hover:text-red-500 transition-colors disabled:opacity-50">
                      {deleting === c.id ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button onClick={fetchCategories} className="eyebrow text-stone-400 hover:text-ink transition-colors text-xs mt-8 link-underline">Refresh</button>
        </div>
      )}

      {/* ── ADD / EDIT CATEGORY ── */}
      {tab === 'add-category' && (
        <form onSubmit={handleCategorySubmit} className="space-y-5 max-w-lg">
          {editingCategory && (
            <div className="bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
              Editing: <strong>{editingCategory.name}</strong>
              <button type="button" onClick={() => { setEditingCategory(null); setCategoryForm({ ...EMPTY_CATEGORY }); setMsg(''); }}
                className="ml-4 text-xs underline">Cancel edit</button>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium uppercase tracking-widest text-stone-500 mb-2">Name</label>
            <input type="text" required value={categoryForm.name}
              onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value, slug: slugify(e.target.value) })}
              className="w-full border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-ink transition-colors" />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-widest text-stone-500 mb-2">Slug</label>
            <input type="text" required value={categoryForm.slug}
              onChange={e => setCategoryForm({ ...categoryForm, slug: e.target.value })}
              className="w-full border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-ink transition-colors font-mono" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-widest text-stone-500 mb-2">Gender</label>
              <select value={categoryForm.gender} onChange={e => setCategoryForm({ ...categoryForm, gender: e.target.value })}
                className="w-full border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-ink transition-colors">
                {['all', 'men', 'women', 'unisex', 'kids'].map(g => <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-widest text-stone-500 mb-2">Sort Order</label>
              <input type="number" min="0" value={categoryForm.sort_order}
                onChange={e => setCategoryForm({ ...categoryForm, sort_order: e.target.value })}
                className="w-full border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-ink transition-colors" />
            </div>
          </div>

          {msg && (
            <p className={`text-sm px-4 py-3 border ${msg.startsWith('Error') ? 'text-red-600 bg-red-50 border-red-200' : 'text-green-700 bg-green-50 border-green-200'}`}>{msg}</p>
          )}

          <button type="submit" disabled={saving}
            className="eyebrow bg-ink text-paper px-10 py-4 hover:bg-stone-800 transition-colors disabled:opacity-50">
            {saving ? 'Saving...' : editingCategory ? 'Update Category' : 'Add Category'}
          </button>
        </form>
      )}
    </div>
  );
}
