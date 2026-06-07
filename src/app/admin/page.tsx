'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';

type Tab = 'products' | 'add-product' | 'categories' | 'add-category';

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  cost_price: number | null;
  category: string | null;
  status: string;
  image_url?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
}

const EMPTY_PRODUCT = { title: '', slug: '', description: '', price: '', cost_price: '', category: '', status: 'active', image_url: '' };
const EMPTY_CATEGORY = { name: '', slug: '', sort_order: '0' };

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function Pill({ label, color }: { label: string; color: 'green' | 'stone' | 'amber' }) {
  const cls = {
    green: 'bg-green-50 text-green-700 border-green-200',
    stone: 'bg-stone-100 text-stone-500 border-stone-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
  }[color];
  return <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase border ${cls}`}>{label}</span>;
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-widest text-stone-500 mb-2">
        {label}{hint && <span className="ml-2 normal-case font-normal text-stone-400">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

function UploadBox({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');

  const upload = async (file: File) => {
    setUploading(true);
    setError('');
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) { setError(data.error || 'Upload failed'); return; }
    onChange(data.url);
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Only image files allowed'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Max file size is 5 MB'); return; }
    upload(file);
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold uppercase tracking-widest text-stone-500">Product Photo</label>

      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
        onClick={() => inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-2 border-2 border-dashed cursor-pointer transition-colors ${
          dragOver ? 'border-stone-400 bg-stone-100' : 'border-stone-200 hover:border-stone-400 hover:bg-stone-50'
        } ${value ? 'h-48' : 'h-36'}`}
      >
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <span className="text-xs text-stone-500 animate-pulse">Uploading...</span>
          </div>
        )}

        {value ? (
          <Image
            src={value}
            alt="Product preview"
            fill
            className="object-contain p-2"
            sizes="400px"
            unoptimized
          />
        ) : (
          <>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-stone-300">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <p className="text-xs text-stone-400">Click to choose photo or drag & drop</p>
            <p className="text-[11px] text-stone-300">JPG, PNG, WebP — max 5 MB</p>
          </>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-xs font-medium text-stone-600 border border-stone-300 px-3 py-1.5 hover:bg-stone-50 transition-colors"
        >
          {value ? 'Change photo' : 'Choose from library'}
        </button>
        {value && (
          <button type="button" onClick={() => onChange('')} className="text-xs text-stone-400 hover:text-red-500 transition-colors">
            Remove
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

const inputCls = "w-full border border-stone-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-stone-500 transition-colors placeholder:text-stone-300";

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [productForm, setProductForm] = useState({ ...EMPTY_PRODUCT });
  const [categoryForm, setCategoryForm] = useState({ ...EMPTY_CATEGORY });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [search, setSearch] = useState('');

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

  const flash = (text: string, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3000);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...productForm,
      gender: 'men',
      price: parseFloat(productForm.price) || 0,
      cost_price: productForm.cost_price ? parseFloat(productForm.cost_price) : null,
      slug: productForm.slug || slugify(productForm.title),
    };
    const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';
    const method = editingProduct ? 'PATCH' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { flash('Error: ' + (data.error || 'Something went wrong'), false); return; }
    flash(editingProduct ? '✓ Product updated' : '✓ Product added');
    setProductForm({ ...EMPTY_PRODUCT });
    setEditingProduct(null);
    fetchProducts();
    setTimeout(() => setTab('products'), 600);
  };

  const startEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProductForm({
      title: p.title, slug: p.slug, description: p.description || '',
      price: String(p.price),
      cost_price: p.cost_price != null ? String(p.cost_price) : '',
      category: p.category || '', status: p.status,
      image_url: p.image_url || '',
    });
    setMsg(null);
    setTab('add-product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Delete this product permanently?')) return;
    setDeleting(id);
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    setDeleting(null);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleToggleStatus = async (p: Product) => {
    const newStatus = p.status === 'active' ? 'archived' : 'active';
    await fetch(`/api/admin/products/${p.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    setProducts(prev => prev.map(x => x.id === p.id ? { ...x, status: newStatus } : x));
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...categoryForm,
      gender: 'men',
      sort_order: parseInt(categoryForm.sort_order) || 0,
      slug: categoryForm.slug || slugify(categoryForm.name),
    };
    const url = editingCategory ? `/api/admin/categories/${editingCategory.id}` : '/api/admin/categories';
    const method = editingCategory ? 'PATCH' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { flash('Error: ' + (data.error || 'Something went wrong'), false); return; }
    flash(editingCategory ? '✓ Category updated' : '✓ Category added');
    setCategoryForm({ ...EMPTY_CATEGORY });
    setEditingCategory(null);
    fetchCategories();
    setTimeout(() => setTab('categories'), 600);
  };

  const startEditCategory = (c: Category) => {
    setEditingCategory(c);
    setCategoryForm({ name: c.name, slug: c.slug, sort_order: String(c.sort_order) });
    setMsg(null);
    setTab('add-category');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    setDeleting(id);
    await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
    setDeleting(null);
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const filteredProducts = products.filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()) || (p.category || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Top bar */}
      <div className="bg-white border-b border-stone-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-xs font-semibold uppercase tracking-widest text-stone-400">Admin</span>
            <nav className="flex gap-0">
              {(['products', 'categories'] as const).map(key => (
                <button key={key} onClick={() => { setTab(key); setMsg(null); }}
                  className={`text-xs font-medium uppercase tracking-wider px-4 py-4 border-b-2 transition-colors ${
                    tab === key || tab === `add-${key}` as Tab
                      ? 'border-stone-800 text-stone-800'
                      : 'border-transparent text-stone-400 hover:text-stone-600'
                  }`}>
                  {key}
                </button>
              ))}
            </nav>
          </div>
          <a href="/" className="text-xs text-stone-400 hover:text-stone-600 transition-colors">← Back to site</a>
        </div>
      </div>

      {/* Flash message */}
      {msg && (
        <div className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 px-5 py-3 text-sm font-medium shadow-lg border transition-all ${
          msg.ok ? 'bg-white text-green-700 border-green-200' : 'bg-white text-red-600 border-red-200'
        }`}>
          {msg.text}
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* ── PRODUCTS LIST ── */}
        {tab === 'products' && (
          <div>
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-xl font-semibold text-stone-900">Products</h1>
                <p className="text-sm text-stone-400 mt-0.5">{products.length} total</p>
              </div>
              <button onClick={() => { setEditingProduct(null); setProductForm({ ...EMPTY_PRODUCT }); setTab('add-product'); }}
                className="flex items-center gap-2 bg-stone-900 text-white text-xs font-semibold uppercase tracking-wider px-5 py-3 hover:bg-stone-700 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Product
              </button>
            </div>

            <div className="relative mb-6">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full border border-stone-200 bg-white pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-stone-400 transition-colors" />
            </div>

            {loadingProducts ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-20 bg-stone-100 animate-pulse" />)}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-24 text-center border-2 border-dashed border-stone-200">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-stone-200 mb-4">
                  <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
                <p className="text-sm text-stone-400 mb-4">{search ? 'No products match your search' : 'No products yet'}</p>
                {!search && (
                  <button onClick={() => setTab('add-product')} className="text-xs font-semibold uppercase tracking-wider text-stone-900 underline underline-offset-4">Add your first product</button>
                )}
              </div>
            ) : (
              <div className="bg-white border border-stone-200 divide-y divide-stone-100">
                {filteredProducts.map(p => (
                  <div key={p.id} className="flex items-center gap-4 px-5 py-4 hover:bg-stone-50 transition-colors">
                    <div className="w-14 h-14 flex-shrink-0 bg-stone-100 border border-stone-100 overflow-hidden">
                      {p.image_url ? (
                        <Image src={p.image_url} alt={p.title} width={56} height={56} className="w-full h-full object-cover" unoptimized />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-stone-300">
                            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-900 truncate">{p.title}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-sm font-semibold text-stone-700">€{Number(p.price).toFixed(2)}</span>
                        {p.cost_price != null && (
                          <Pill label={`Cost €${Number(p.cost_price).toFixed(2)}`} color="amber" />
                        )}
                        {p.category && <Pill label={p.category} color="stone" />}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <button onClick={() => handleToggleStatus(p)}
                        className={`text-[11px] font-semibold uppercase tracking-wider px-3 py-1.5 border transition-colors ${
                          p.status === 'active'
                            ? 'border-green-200 text-green-700 bg-green-50 hover:bg-green-100'
                            : 'border-stone-200 text-stone-400 bg-stone-50 hover:bg-stone-100'
                        }`}>
                        {p.status === 'active' ? 'Live' : 'Hidden'}
                      </button>
                      <button onClick={() => startEditProduct(p)}
                        className="text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors px-2 py-1">
                        Edit
                      </button>
                      <button onClick={() => handleDeleteProduct(p.id)} disabled={deleting === p.id}
                        className="text-xs text-stone-300 hover:text-red-500 transition-colors px-2 py-1 disabled:opacity-40">
                        {deleting === p.id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ADD / EDIT PRODUCT ── */}
        {tab === 'add-product' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-xl font-semibold text-stone-900">{editingProduct ? 'Edit Product' : 'New Product'}</h1>
                {editingProduct && <p className="text-sm text-stone-400 mt-0.5">Editing: {editingProduct.title}</p>}
              </div>
              <button onClick={() => { setTab('products'); setEditingProduct(null); setProductForm({ ...EMPTY_PRODUCT }); setMsg(null); }}
                className="text-xs text-stone-400 hover:text-stone-700 transition-colors flex items-center gap-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                Back to products
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <Field label="Product Name">
                  <input type="text" required value={productForm.title}
                    onChange={e => setProductForm({ ...productForm, title: e.target.value, slug: slugify(e.target.value) })}
                    placeholder="e.g. Classic Oxford Shirt"
                    className={inputCls} />
                </Field>

                <Field label="URL Slug" hint="— auto-generated">
                  <input type="text" required value={productForm.slug}
                    onChange={e => setProductForm({ ...productForm, slug: e.target.value })}
                    placeholder="classic-oxford-shirt"
                    className={`${inputCls} font-mono text-xs`} />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Selling Price (€)">
                    <input
                      type="text"
                      inputMode="decimal"
                      required
                      value={productForm.price}
                      onChange={e => {
                        const v = e.target.value;
                        if (/^(\d*\.?\d*)$/.test(v)) setProductForm({ ...productForm, price: v });
                      }}
                      placeholder="0.00"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Our Cost (€)" hint="— private">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={productForm.cost_price}
                      onChange={e => {
                        const v = e.target.value;
                        if (/^(\d*\.?\d*)$/.test(v)) setProductForm({ ...productForm, cost_price: v });
                      }}
                      placeholder="0.00"
                      className={`${inputCls} border-amber-200 bg-amber-50 focus:border-amber-400`}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Category">
                    <input type="text" list="cats" value={productForm.category}
                      onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                      placeholder="e.g. Shirts"
                      className={inputCls} />
                    <datalist id="cats">{categories.map(c => <option key={c.id} value={c.name} />)}</datalist>
                  </Field>
                  <Field label="Visibility">
                    <select value={productForm.status} onChange={e => setProductForm({ ...productForm, status: e.target.value })} className={inputCls}>
                      <option value="active">Live (visible)</option>
                      <option value="archived">Hidden</option>
                    </select>
                  </Field>
                </div>

                <Field label="Description" hint="— optional">
                  <textarea value={productForm.description} rows={5}
                    onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="Describe the product..."
                    className={`${inputCls} resize-none`} />
                </Field>
              </div>

              <div className="space-y-6">
                <UploadBox
                  value={productForm.image_url}
                  onChange={url => setProductForm({ ...productForm, image_url: url })}
                />

                {productForm.image_url && (
                  <div className="text-xs text-stone-400 break-all font-mono border border-stone-100 bg-stone-50 px-3 py-2">
                    {productForm.image_url}
                  </div>
                )}

                {productForm.price && productForm.cost_price && (
                  <div className="border border-stone-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">Margin</p>
                    {(() => {
                      const sell = parseFloat(productForm.price);
                      const cost = parseFloat(productForm.cost_price);
                      const margin = sell - cost;
                      const pct = ((margin / sell) * 100).toFixed(1);
                      return (
                        <div className="flex items-baseline gap-2">
                          <span className={`text-2xl font-bold ${margin >= 0 ? 'text-green-600' : 'text-red-500'}`}>€{margin.toFixed(2)}</span>
                          <span className="text-sm text-stone-400">{pct}% margin</span>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              <div className="md:col-span-2 flex items-center gap-4 pt-2 border-t border-stone-200">
                <button type="submit" disabled={saving}
                  className="bg-stone-900 text-white text-sm font-semibold px-8 py-3.5 hover:bg-stone-700 transition-colors disabled:opacity-50">
                  {saving ? 'Saving...' : editingProduct ? 'Save Changes' : 'Add Product'}
                </button>
                <button type="button" onClick={() => { setTab('products'); setEditingProduct(null); setProductForm({ ...EMPTY_PRODUCT }); setMsg(null); }}
                  className="text-sm text-stone-400 hover:text-stone-700 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── CATEGORIES LIST ── */}
        {tab === 'categories' && (
          <div>
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-xl font-semibold text-stone-900">Categories</h1>
                <p className="text-sm text-stone-400 mt-0.5">{categories.length} total</p>
              </div>
              <button onClick={() => { setEditingCategory(null); setCategoryForm({ ...EMPTY_CATEGORY }); setTab('add-category'); }}
                className="flex items-center gap-2 bg-stone-900 text-white text-xs font-semibold uppercase tracking-wider px-5 py-3 hover:bg-stone-700 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Category
              </button>
            </div>

            {loadingCategories ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-stone-100 animate-pulse" />)}</div>
            ) : categories.length === 0 ? (
              <div className="py-24 text-center border-2 border-dashed border-stone-200">
                <p className="text-sm text-stone-400 mb-4">No categories yet</p>
                <button onClick={() => setTab('add-category')} className="text-xs font-semibold uppercase tracking-wider text-stone-900 underline underline-offset-4">Add your first category</button>
              </div>
            ) : (
              <div className="bg-white border border-stone-200 divide-y divide-stone-100">
                {categories.map(c => (
                  <div key={c.id} className="flex items-center gap-4 px-5 py-4 hover:bg-stone-50 transition-colors">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-stone-900">{c.name}</p>
                      <p className="text-xs font-mono text-stone-400 mt-0.5">{c.slug}</p>
                    </div>
                    <span className="text-xs text-stone-300">Order: {c.sort_order}</span>
                    <button onClick={() => startEditCategory(c)} className="text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors px-2 py-1">Edit</button>
                    <button onClick={() => handleDeleteCategory(c.id)} disabled={deleting === c.id}
                      className="text-xs text-stone-300 hover:text-red-500 transition-colors px-2 py-1 disabled:opacity-40">
                      {deleting === c.id ? '...' : 'Delete'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ADD / EDIT CATEGORY ── */}
        {tab === 'add-category' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-xl font-semibold text-stone-900">{editingCategory ? 'Edit Category' : 'New Category'}</h1>
                {editingCategory && <p className="text-sm text-stone-400 mt-0.5">Editing: {editingCategory.name}</p>}
              </div>
              <button onClick={() => { setTab('categories'); setEditingCategory(null); setCategoryForm({ ...EMPTY_CATEGORY }); setMsg(null); }}
                className="text-xs text-stone-400 hover:text-stone-700 transition-colors flex items-center gap-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                Back to categories
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} className="max-w-lg space-y-6">
              <Field label="Category Name">
                <input type="text" required value={categoryForm.name}
                  onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value, slug: slugify(e.target.value) })}
                  placeholder="e.g. Shirts"
                  className={inputCls} />
              </Field>

              <Field label="URL Slug" hint="— auto-generated">
                <input type="text" required value={categoryForm.slug}
                  onChange={e => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                  placeholder="shirts"
                  className={`${inputCls} font-mono text-xs`} />
              </Field>

              <Field label="Sort Order" hint="— lower = shown first">
                <input type="number" min="0" value={categoryForm.sort_order}
                  onChange={e => setCategoryForm({ ...categoryForm, sort_order: e.target.value })}
                  className={inputCls} />
              </Field>

              <div className="flex items-center gap-4 pt-2 border-t border-stone-200">
                <button type="submit" disabled={saving}
                  className="bg-stone-900 text-white text-sm font-semibold px-8 py-3.5 hover:bg-stone-700 transition-colors disabled:opacity-50">
                  {saving ? 'Saving...' : editingCategory ? 'Save Changes' : 'Add Category'}
                </button>
                <button type="button" onClick={() => { setTab('categories'); setEditingCategory(null); setCategoryForm({ ...EMPTY_CATEGORY }); setMsg(null); }}
                  className="text-sm text-stone-400 hover:text-stone-700 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
