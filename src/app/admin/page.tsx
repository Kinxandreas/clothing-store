'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';

type Tab = 'products' | 'add-product' | 'categories' | 'add-category' | 'collections' | 'add-collection';

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  cost_price: number | null;
  category: string | null;
  collection_id: string | null;
  status: string;
  image_url?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  show_in: string[];
}

interface Collection {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  sort_order: number;
  parent_id: string | null;
}

interface Variant {
  id?: string;
  label: string;
  value: string;
  sort_order: number;
}

const EMPTY_PRODUCT = { title: '', slug: '', description: '', price: '', cost_price: '', category: '', collection_id: '', status: 'active', image_url: '' };
const EMPTY_CATEGORY = { name: '', slug: '', sort_order: '0', show_in: ['shop', 'collections'] as string[] };
const EMPTY_COLLECTION = { name: '', slug: '', image_url: '', sort_order: '0', parent_id: '' };

const SHOW_IN_OPTIONS = [
  { value: 'shop', label: 'All Products page' },
  { value: 'collections', label: 'Collections pages' },
];

// Common variant label presets
const LABEL_PRESETS = ['Color', 'Size', 'Type', 'Material', 'Style'];

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function Pill({ label, color }: { label: string; color: 'green' | 'stone' | 'amber' | 'blue' }) {
  const cls = {
    green: 'bg-green-50 text-green-700 border-green-200',
    stone: 'bg-stone-100 text-stone-500 border-stone-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
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

function UploadBox({ value, onChange, label = 'Photo' }: { value: string; onChange: (url: string) => void; label?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');

  const upload = async (file: File) => {
    setUploading(true); setError('');
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
      <label className="block text-xs font-semibold uppercase tracking-widest text-stone-500">{label}</label>
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
          <Image src={value} alt="Preview" fill className="object-contain p-2" sizes="400px" unoptimized />
        ) : (
          <>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-stone-300">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
            </svg>
            <p className="text-xs text-stone-400">Click to choose photo or drag & drop</p>
            <p className="text-[11px] text-stone-300">JPG, PNG, WebP — max 5 MB</p>
          </>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => inputRef.current?.click()}
          className="text-xs font-medium text-stone-600 border border-stone-300 px-3 py-1.5 hover:bg-stone-50 transition-colors">
          {value ? 'Change photo' : 'Choose photo'}
        </button>
        {value && <button type="button" onClick={() => onChange('')} className="text-xs text-stone-400 hover:text-red-500 transition-colors">Remove</button>}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ── Variants editor component ──
function VariantsEditor({ variants, onChange }: { variants: Variant[]; onChange: (v: Variant[]) => void }) {
  const [newLabel, setNewLabel] = useState('Color');
  const [newValue, setNewValue] = useState('');
  const [customLabel, setCustomLabel] = useState(false);

  const add = () => {
    const v = newValue.trim();
    if (!v) return;
    onChange([...variants, { label: newLabel, value: v, sort_order: variants.length }]);
    setNewValue('');
  };

  const remove = (i: number) => onChange(variants.filter((_, idx) => idx !== i));

  // Group variants by label for display
  const groups = variants.reduce<Record<string, Variant[]>>((acc, v) => {
    if (!acc[v.label]) acc[v.label] = [];
    acc[v.label].push(v);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* Existing variants grouped by label */}
      {Object.entries(groups).map(([label, items]) => (
        <div key={label} className="border border-stone-200 bg-white">
          <div className="px-4 py-2 bg-stone-50 border-b border-stone-200">
            <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">{label}</span>
          </div>
          <div className="flex flex-wrap gap-2 p-3">
            {items.map((v) => {
              const idx = variants.indexOf(v);
              return (
                <div key={idx} className="flex items-center gap-1.5 border border-stone-200 bg-stone-50 px-3 py-1.5">
                  <span className="text-sm text-stone-700">{v.value}</span>
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    className="text-stone-300 hover:text-red-500 transition-colors ml-1"
                    aria-label={`Remove ${v.value}`}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {variants.length === 0 && (
        <p className="text-xs text-stone-400 italic">No variants yet — add one below.</p>
      )}

      {/* Add new variant row */}
      <div className="border border-dashed border-stone-200 p-4 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">Add variant</p>
        <div className="flex gap-2">
          {/* Label selector */}
          {!customLabel ? (
            <div className="flex gap-1 flex-wrap">
              {LABEL_PRESETS.map(l => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setNewLabel(l)}
                  className={`text-xs px-3 py-1.5 border transition-colors ${
                    newLabel === l
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'
                  }`}
                >{l}</button>
              ))}
              <button
                type="button"
                onClick={() => { setCustomLabel(true); setNewLabel(''); }}
                className="text-xs px-3 py-1.5 border border-dashed border-stone-300 text-stone-400 hover:text-stone-600 transition-colors"
              >Custom…</button>
            </div>
          ) : (
            <div className="flex gap-2 items-center">
              <input
                autoFocus
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                placeholder="Label (e.g. Fit)"
                className="border border-stone-300 px-3 py-1.5 text-sm focus:outline-none focus:border-stone-500 w-36"
              />
              <button type="button" onClick={() => { setCustomLabel(false); setNewLabel('Color'); }} className="text-xs text-stone-400 hover:text-stone-600">← Presets</button>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <input
            value={newValue}
            onChange={e => setNewValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
            placeholder={`e.g. ${newLabel === 'Color' ? 'Red, Blue, White' : newLabel === 'Size' ? 'S, M, L, XL' : 'value'}`}
            className="flex-1 border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-stone-500 transition-colors"
          />
          <button
            type="button"
            onClick={add}
            disabled={!newValue.trim() || !newLabel.trim()}
            className="px-4 py-2 bg-stone-900 text-white text-xs font-medium hover:bg-stone-700 transition-colors disabled:opacity-40"
          >Add</button>
        </div>
        <p className="text-[11px] text-stone-400">Press Enter or click Add. Each value is one option (e.g. type &quot;Red&quot; then Add, then &quot;Blue&quot; then Add).</p>
      </div>
    </div>
  );
}

const inputCls = "w-full border border-stone-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-stone-500 transition-colors placeholder:text-stone-300";

// Recursive tree builder for collections list
function buildTree(all: Collection[]): (Collection & { children: Collection[] })[] {
  const map = new Map<string, Collection & { children: Collection[] }>();
  all.forEach(c => map.set(c.id, { ...c, children: [] }));
  const roots: (Collection & { children: Collection[] })[] = [];
  map.forEach(node => {
    if (node.parent_id && map.has(node.parent_id)) {
      map.get(node.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

function CollectionTreeRow({
  node, depth, onEdit, onDelete, deleting
}: {
  node: Collection & { children: (Collection & { children: Collection[] })[] };
  depth: number;
  onEdit: (c: Collection) => void;
  onDelete: (id: string) => void;
  deleting: string | null;
}) {
  return (
    <>
      <div
        className="flex items-center gap-4 px-5 py-4 hover:bg-stone-50 transition-colors"
        style={{ paddingLeft: `${20 + depth * 28}px` }}
      >
        {depth > 0 && (
          <span className="text-stone-300 select-none" style={{ marginLeft: '-16px', marginRight: '4px' }}>↳</span>
        )}
        <div className="w-10 h-10 flex-shrink-0 bg-stone-100 border border-stone-100 overflow-hidden">
          {node.image_url ? (
            <Image src={node.image_url} alt={node.name} width={40} height={40} className="w-full h-full object-cover" unoptimized />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-stone-300">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-stone-900">{node.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-stone-400 font-mono">{node.slug}</span>
            {node.children.length > 0 && (
              <Pill label={`${node.children.length} sub`} color="blue" />
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button onClick={() => onEdit(node)} className="text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors px-2 py-1">Edit</button>
          <button onClick={() => onDelete(node.id)} disabled={deleting === node.id} className="text-xs text-stone-300 hover:text-red-500 transition-colors px-2 py-1 disabled:opacity-40">
            {deleting === node.id ? '...' : 'Delete'}
          </button>
        </div>
      </div>
      {node.children.map(child => (
        <CollectionTreeRow key={child.id} node={child as Collection & { children: (Collection & { children: Collection[] })[] }} depth={depth + 1} onEdit={onEdit} onDelete={onDelete} deleting={deleting} />
      ))}
    </>
  );
}

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingCollections, setLoadingCollections] = useState(true);
  const [productForm, setProductForm] = useState({ ...EMPTY_PRODUCT });
  const [categoryForm, setCategoryForm] = useState({ ...EMPTY_CATEGORY });
  const [collectionForm, setCollectionForm] = useState({ ...EMPTY_COLLECTION });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
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

  const fetchCollections = useCallback(async () => {
    setLoadingCollections(true);
    const res = await fetch('/api/admin/collections');
    if (res.ok) setCollections(await res.json());
    setLoadingCollections(false);
  }, []);

  useEffect(() => { fetchProducts(); fetchCategories(); fetchCollections(); }, [fetchProducts, fetchCategories, fetchCollections]);

  const flash = (text: string, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3000);
  };

  // ── PRODUCT handlers ──
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const payload = {
      ...productForm,
      gender: 'men',
      price: parseFloat(productForm.price) || 0,
      cost_price: productForm.cost_price ? parseFloat(productForm.cost_price) : null,
      slug: productForm.slug || slugify(productForm.title),
      collection_id: productForm.collection_id || null,
    };
    const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';
    const method = editingProduct ? 'PATCH' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) { setSaving(false); flash('Error: ' + (data.error || 'Something went wrong'), false); return; }

    // Save variants via PUT (full replace)
    const productId = editingProduct ? editingProduct.id : data.id;
    if (productId) {
      await fetch(`/api/admin/products/${productId}/variants`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variants }),
      });
    }

    setSaving(false);
    flash(editingProduct ? '✓ Product updated' : '✓ Product added');
    setProductForm({ ...EMPTY_PRODUCT }); setEditingProduct(null); setVariants([]); fetchProducts();
    setTimeout(() => setTab('products'), 600);
  };

  const startEditProduct = async (p: Product) => {
    setEditingProduct(p);
    setProductForm({
      title: p.title, slug: p.slug, description: p.description || '',
      price: String(p.price), cost_price: p.cost_price != null ? String(p.cost_price) : '',
      category: p.category || '', collection_id: p.collection_id || '',
      status: p.status, image_url: p.image_url || '',
    });
    // Load existing variants
    const vRes = await fetch(`/api/admin/products/${p.id}/variants`);
    if (vRes.ok) setVariants(await vRes.json());
    else setVariants([]);
    setMsg(null); setTab('add-product'); window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Delete this product permanently?')) return;
    setDeleting(id);
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    setDeleting(null); setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleToggleStatus = async (p: Product) => {
    const newStatus = p.status === 'active' ? 'archived' : 'active';
    await fetch(`/api/admin/products/${p.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
    setProducts(prev => prev.map(x => x.id === p.id ? { ...x, status: newStatus } : x));
  };

  // ── CATEGORY handlers ──
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const payload = {
      ...categoryForm,
      gender: 'men',
      sort_order: parseInt(categoryForm.sort_order) || 0,
      slug: categoryForm.slug || slugify(categoryForm.name),
      show_in: categoryForm.show_in,
    };
    const url = editingCategory ? `/api/admin/categories/${editingCategory.id}` : '/api/admin/categories';
    const method = editingCategory ? 'PATCH' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { flash('Error: ' + (data.error || 'Something went wrong'), false); return; }
    flash(editingCategory ? '✓ Category updated' : '✓ Category added');
    setCategoryForm({ ...EMPTY_CATEGORY }); setEditingCategory(null); fetchCategories();
    setTimeout(() => setTab('categories'), 600);
  };

  const startEditCategory = (c: Category) => {
    setEditingCategory(c);
    setCategoryForm({
      name: c.name, slug: c.slug, sort_order: String(c.sort_order),
      show_in: Array.isArray(c.show_in) ? c.show_in : ['shop', 'collections'],
    });
    setMsg(null); setTab('add-category'); window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    setDeleting(id);
    await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
    setDeleting(null); setCategories(prev => prev.filter(c => c.id !== id));
  };

  const toggleShowIn = (value: string) => {
    setCategoryForm(prev => ({
      ...prev,
      show_in: prev.show_in.includes(value)
        ? prev.show_in.filter(v => v !== value)
        : [...prev.show_in, value],
    }));
  };

  // ── COLLECTION handlers ──
  const handleCollectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const payload = {
      name: collectionForm.name,
      slug: collectionForm.slug || slugify(collectionForm.name),
      image_url: collectionForm.image_url || null,
      sort_order: parseInt(collectionForm.sort_order) || 0,
      parent_id: collectionForm.parent_id || null,
    };
    const url = editingCollection ? `/api/admin/collections/${editingCollection.id}` : '/api/admin/collections';
    const method = editingCollection ? 'PATCH' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { flash('Error: ' + (data.error || 'Something went wrong'), false); return; }
    flash(editingCollection ? '✓ Collection updated' : '✓ Collection added');
    setCollectionForm({ ...EMPTY_COLLECTION }); setEditingCollection(null); fetchCollections();
    setTimeout(() => setTab('collections'), 600);
  };

  const startEditCollection = (c: Collection) => {
    setEditingCollection(c);
    setCollectionForm({
      name: c.name, slug: c.slug, image_url: c.image_url || '',
      sort_order: String(c.sort_order), parent_id: c.parent_id || '',
    });
    setMsg(null); setTab('add-collection'); window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteCollection = async (id: string) => {
    if (!confirm('Delete this collection? Subcollections will become top-level.')) return;
    setDeleting(id);
    await fetch(`/api/admin/collections/${id}`, { method: 'DELETE' });
    setDeleting(null); setCollections(prev => prev.filter(c => c.id !== id));
  };

  const filteredProducts = products.filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()) || (p.category || '').toLowerCase().includes(search.toLowerCase())
  );

  function buildParentOptions(all: Collection[], excludeId?: string): { id: string; label: string }[] {
    function walk(nodes: (Collection & { children: Collection[] })[], depth: number): { id: string; label: string }[] {
      return nodes.flatMap(n => [
        { id: n.id, label: '\u00a0'.repeat(depth * 3) + (depth > 0 ? '↳ ' : '') + n.name },
        ...walk(n.children as (Collection & { children: Collection[] })[], depth + 1),
      ]);
    }
    const tree = buildTree(all.filter(c => c.id !== excludeId));
    return walk(tree, 0);
  }

  const collectionTree = buildTree(collections);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Top bar */}
      <div className="bg-white border-b border-stone-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-xs font-semibold uppercase tracking-widest text-stone-400">Admin</span>
            <nav className="flex gap-0">
              {(['products', 'categories', 'collections'] as const).map(key => (
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

      {msg && (
        <div className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 px-5 py-3 text-sm font-medium shadow-lg border transition-all ${
          msg.ok ? 'bg-white text-green-700 border-green-200' : 'bg-white text-red-600 border-red-200'
        }`}>{msg.text}</div>
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
              <button onClick={() => { setEditingProduct(null); setProductForm({ ...EMPTY_PRODUCT }); setVariants([]); setTab('add-product'); }}
                className="flex items-center gap-2 bg-stone-900 text-white text-xs font-semibold uppercase tracking-wider px-5 py-3 hover:bg-stone-700 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Product
              </button>
            </div>
            <div className="relative mb-6">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
                className="w-full border border-stone-200 bg-white pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-stone-400 transition-colors" />
            </div>
            {loadingProducts ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-stone-100 animate-pulse" />)}</div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-24 text-center border-2 border-dashed border-stone-200">
                <p className="text-sm text-stone-400 mb-4">{search ? 'No products match your search' : 'No products yet'}</p>
                {!search && <button onClick={() => setTab('add-product')} className="text-xs font-semibold uppercase tracking-wider text-stone-900 underline underline-offset-4">Add your first product</button>}
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
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-stone-300"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-900 truncate">{p.title}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-sm font-semibold text-stone-700">€{Number(p.price).toFixed(2)}</span>
                        {p.cost_price != null && <Pill label={`Cost €${Number(p.cost_price).toFixed(2)}`} color="amber" />}
                        {p.category && <Pill label={p.category} color="stone" />}
                        {p.collection_id && (() => {
                          const col = collections.find(c => c.id === p.collection_id);
                          return col ? <Pill label={col.name} color="green" /> : null;
                        })()}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <button onClick={() => handleToggleStatus(p)}
                        className={`text-[11px] font-semibold uppercase tracking-wider px-3 py-1.5 border transition-colors ${
                          p.status === 'active' ? 'border-green-200 text-green-700 bg-green-50 hover:bg-green-100' : 'border-stone-200 text-stone-400 bg-stone-50 hover:bg-stone-100'
                        }`}>{p.status === 'active' ? 'Live' : 'Hidden'}</button>
                      <button onClick={() => startEditProduct(p)} className="text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors px-2 py-1">Edit</button>
                      <button onClick={() => handleDeleteProduct(p.id)} disabled={deleting === p.id} className="text-xs text-stone-300 hover:text-red-500 transition-colors px-2 py-1 disabled:opacity-40">{deleting === p.id ? '...' : 'Delete'}</button>
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
              <button onClick={() => { setTab('products'); setEditingProduct(null); setProductForm({ ...EMPTY_PRODUCT }); setVariants([]); setMsg(null); }}
                className="text-xs text-stone-400 hover:text-stone-700 transition-colors flex items-center gap-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                Back to products
              </button>
            </div>
            <form onSubmit={handleProductSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <Field label="Product Name">
                    <input type="text" required value={productForm.title}
                      onChange={e => setProductForm({ ...productForm, title: e.target.value, slug: slugify(e.target.value) })}
                      placeholder="e.g. Classic Oxford Shirt" className={inputCls} />
                  </Field>
                  <Field label="URL Slug" hint="— auto-generated">
                    <input type="text" required value={productForm.slug}
                      onChange={e => setProductForm({ ...productForm, slug: e.target.value })}
                      placeholder="classic-oxford-shirt" className={`${inputCls} font-mono text-xs`} />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Selling Price (€)">
                      <input type="text" inputMode="decimal" required value={productForm.price}
                        onChange={e => { const v = e.target.value; if (/^(\d*\.?\d*)$/.test(v)) setProductForm({ ...productForm, price: v }); }}
                        placeholder="0.00" className={inputCls} />
                    </Field>
                    <Field label="Our Cost (€)" hint="— private">
                      <input type="text" inputMode="decimal" value={productForm.cost_price}
                        onChange={e => { const v = e.target.value; if (/^(\d*\.?\d*)$/.test(v)) setProductForm({ ...productForm, cost_price: v }); }}
                        placeholder="0.00" className={`${inputCls} border-amber-200 bg-amber-50 focus:border-amber-400`} />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Category">
                      <select value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })} className={inputCls}>
                        <option value="">— None —</option>
                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                    </Field>
                    <Field label="Visibility">
                      <select value={productForm.status} onChange={e => setProductForm({ ...productForm, status: e.target.value })} className={inputCls}>
                        <option value="active">Live (visible)</option>
                        <option value="archived">Hidden</option>
                      </select>
                    </Field>
                  </div>
                  <Field label="Collection" hint="— optional">
                    <select value={productForm.collection_id} onChange={e => setProductForm({ ...productForm, collection_id: e.target.value })} className={inputCls}>
                      <option value="">— None —</option>
                      {buildParentOptions(collections).map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Description" hint="— optional">
                    <textarea value={productForm.description} rows={5}
                      onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                      placeholder="Describe the product..." className={`${inputCls} resize-none`} />
                  </Field>
                </div>
                <div className="space-y-6">
                  <UploadBox value={productForm.image_url} onChange={url => setProductForm({ ...productForm, image_url: url })} />
                  {productForm.image_url && (
                    <div className="text-xs text-stone-400 break-all font-mono border border-stone-100 bg-stone-50 px-3 py-2">{productForm.image_url}</div>
                  )}
                  {productForm.price && productForm.cost_price && (() => {
                    const sell = parseFloat(productForm.price);
                    const cost = parseFloat(productForm.cost_price);
                    const margin = sell - cost;
                    const pct = ((margin / sell) * 100).toFixed(1);
                    return (
                      <div className="border border-stone-200 bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">Margin</p>
                        <div className="flex items-baseline gap-2">
                          <span className={`text-2xl font-bold ${margin >= 0 ? 'text-green-600' : 'text-red-500'}`}>€{margin.toFixed(2)}</span>
                          <span className="text-sm text-stone-400">{pct}% margin</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* ── VARIANTS SECTION ── */}
              <div className="border-t border-stone-200 pt-8">
                <div className="mb-4">
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-stone-700">Variants</h2>
                  <p className="text-xs text-stone-400 mt-1">Add options like Color, Size, or Type that customers can choose on the product page.</p>
                </div>
                <VariantsEditor variants={variants} onChange={setVariants} />
              </div>

              <div className="flex items-center gap-4 pt-2 border-t border-stone-200">
                <button type="submit" disabled={saving}
                  className="bg-stone-900 text-white text-xs font-semibold uppercase tracking-wider px-8 py-3 hover:bg-stone-700 transition-colors disabled:opacity-50">
                  {saving ? 'Saving…' : editingProduct ? 'Save Changes' : 'Add Product'}
                </button>
                {editingProduct && (
                  <button type="button" onClick={() => { setTab('products'); setEditingProduct(null); setProductForm({ ...EMPTY_PRODUCT }); setVariants([]); setMsg(null); }}
                    className="text-xs text-stone-400 hover:text-stone-700 transition-colors">Cancel</button>
                )}
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
                <p className="text-sm text-stone-400 mt-0.5">{categories.length} total — used as filter tags on shop &amp; collection pages</p>
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
                {categories.map(c => {
                  const showIn = Array.isArray(c.show_in) ? c.show_in : [];
                  return (
                    <div key={c.id} className="flex items-center gap-4 px-5 py-4 hover:bg-stone-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-900">{c.name}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs text-stone-400 font-mono">{c.slug}</span>
                          <span className="text-stone-200">·</span>
                          {showIn.length === 0 ? (
                            <span className="text-[11px] text-stone-300 uppercase tracking-wide">Hidden everywhere</span>
                          ) : (
                            showIn.map(ctx => (
                              <span key={ctx} className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase border bg-stone-50 text-stone-500 border-stone-200">
                                {ctx === 'shop' ? 'All Products' : 'Collections'}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <button onClick={() => startEditCategory(c)} className="text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors px-2 py-1">Edit</button>
                        <button onClick={() => handleDeleteCategory(c.id)} disabled={deleting === c.id} className="text-xs text-stone-300 hover:text-red-500 transition-colors px-2 py-1 disabled:opacity-40">
                          {deleting === c.id ? '...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  );
                })}
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
                  placeholder="e.g. T-Shirts" className={inputCls} />
              </Field>
              <Field label="URL Slug" hint="— auto-generated">
                <input type="text" required value={categoryForm.slug}
                  onChange={e => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                  placeholder="t-shirts" className={`${inputCls} font-mono text-xs`} />
              </Field>
              <Field label="Sort Order">
                <input type="number" value={categoryForm.sort_order}
                  onChange={e => setCategoryForm({ ...categoryForm, sort_order: e.target.value })}
                  className={inputCls} />
              </Field>
              <Field label="Show In">
                <div className="flex gap-3 flex-wrap">
                  {SHOW_IN_OPTIONS.map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={categoryForm.show_in.includes(opt.value)} onChange={() => toggleShowIn(opt.value)}
                        className="w-4 h-4 border-stone-300" />
                      <span className="text-sm text-stone-600">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </Field>
              <div className="flex items-center gap-4 pt-2 border-t border-stone-200">
                <button type="submit" disabled={saving}
                  className="bg-stone-900 text-white text-xs font-semibold uppercase tracking-wider px-8 py-3 hover:bg-stone-700 transition-colors disabled:opacity-50">
                  {saving ? 'Saving…' : editingCategory ? 'Save Changes' : 'Add Category'}
                </button>
                {editingCategory && (
                  <button type="button" onClick={() => { setTab('categories'); setEditingCategory(null); setCategoryForm({ ...EMPTY_CATEGORY }); setMsg(null); }}
                    className="text-xs text-stone-400 hover:text-stone-700 transition-colors">Cancel</button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* ── COLLECTIONS LIST ── */}
        {tab === 'collections' && (
          <div>
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-xl font-semibold text-stone-900">Collections</h1>
                <p className="text-sm text-stone-400 mt-0.5">{collections.length} total</p>
              </div>
              <button onClick={() => { setEditingCollection(null); setCollectionForm({ ...EMPTY_COLLECTION }); setTab('add-collection'); }}
                className="flex items-center gap-2 bg-stone-900 text-white text-xs font-semibold uppercase tracking-wider px-5 py-3 hover:bg-stone-700 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Collection
              </button>
            </div>
            {loadingCollections ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-stone-100 animate-pulse" />)}</div>
            ) : collections.length === 0 ? (
              <div className="py-24 text-center border-2 border-dashed border-stone-200">
                <p className="text-sm text-stone-400 mb-4">No collections yet</p>
                <button onClick={() => setTab('add-collection')} className="text-xs font-semibold uppercase tracking-wider text-stone-900 underline underline-offset-4">Add your first collection</button>
              </div>
            ) : (
              <div className="bg-white border border-stone-200 divide-y divide-stone-100">
                {collectionTree.map(node => (
                  <CollectionTreeRow key={node.id} node={node} depth={0} onEdit={startEditCollection} onDelete={handleDeleteCollection} deleting={deleting} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ADD / EDIT COLLECTION ── */}
        {tab === 'add-collection' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-xl font-semibold text-stone-900">{editingCollection ? 'Edit Collection' : 'New Collection'}</h1>
                {editingCollection && <p className="text-sm text-stone-400 mt-0.5">Editing: {editingCollection.name}</p>}
              </div>
              <button onClick={() => { setTab('collections'); setEditingCollection(null); setCollectionForm({ ...EMPTY_COLLECTION }); setMsg(null); }}
                className="text-xs text-stone-400 hover:text-stone-700 transition-colors flex items-center gap-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                Back to collections
              </button>
            </div>
            <form onSubmit={handleCollectionSubmit} className="max-w-lg space-y-6">
              <Field label="Collection Name">
                <input type="text" required value={collectionForm.name}
                  onChange={e => setCollectionForm({ ...collectionForm, name: e.target.value, slug: slugify(e.target.value) })}
                  placeholder="e.g. Summer 2025" className={inputCls} />
              </Field>
              <Field label="URL Slug" hint="— auto-generated">
                <input type="text" required value={collectionForm.slug}
                  onChange={e => setCollectionForm({ ...collectionForm, slug: e.target.value })}
                  placeholder="summer-2025" className={`${inputCls} font-mono text-xs`} />
              </Field>
              <Field label="Parent Collection" hint="— optional">
                <select value={collectionForm.parent_id} onChange={e => setCollectionForm({ ...collectionForm, parent_id: e.target.value })} className={inputCls}>
                  <option value="">— Top level —</option>
                  {buildParentOptions(collections, editingCollection?.id).map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Sort Order">
                <input type="number" value={collectionForm.sort_order}
                  onChange={e => setCollectionForm({ ...collectionForm, sort_order: e.target.value })}
                  className={inputCls} />
              </Field>
              <UploadBox value={collectionForm.image_url} onChange={url => setCollectionForm({ ...collectionForm, image_url: url })} label="Cover Image" />
              <div className="flex items-center gap-4 pt-2 border-t border-stone-200">
                <button type="submit" disabled={saving}
                  className="bg-stone-900 text-white text-xs font-semibold uppercase tracking-wider px-8 py-3 hover:bg-stone-700 transition-colors disabled:opacity-50">
                  {saving ? 'Saving…' : editingCollection ? 'Save Changes' : 'Add Collection'}
                </button>
                {editingCollection && (
                  <button type="button" onClick={() => { setTab('collections'); setEditingCollection(null); setCollectionForm({ ...EMPTY_COLLECTION }); setMsg(null); }}
                    className="text-xs text-stone-400 hover:text-stone-700 transition-colors">Cancel</button>
                )}
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
