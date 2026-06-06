'use client';
import { useState } from 'react';
import { useCartStore } from '@/store/cart';
import { Product } from '@/types/database';

export default function AddToCartButton({ product, sizes, colors }: { product: Product; sizes: string[]; colors: string[] }) {
  const [selectedSize, setSelectedSize] = useState(sizes[0] || null);
  const [selectedColor, setSelectedColor] = useState(colors[0] || null);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore(state => state.addItem);

  const variant = product.product_variants?.find(
    v => v.size === selectedSize && v.color === selectedColor
  ) ?? product.product_variants?.[0];

  const handleAdd = () => {
    if (!variant) return;
    addItem({
      variantId: variant.id,
      productId: product.id,
      title: product.title,
      price: product.price,
      size: selectedSize,
      color: selectedColor,
      imageUrl: product.product_images?.[0]?.image_url ?? null,
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="space-y-4">
      {sizes.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">Size</p>
          <div className="flex gap-2 flex-wrap">
            {sizes.map(size => (
              <button key={size} onClick={() => setSelectedSize(size)}
                className={`px-4 py-2 rounded-full border text-sm transition-colors ${
                  selectedSize === size ? 'bg-brand-800 text-white border-brand-800' : 'border-brand-300 hover:border-brand-800'
                }`}>{size}</button>
            ))}
          </div>
        </div>
      )}
      {colors.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">Color</p>
          <div className="flex gap-2 flex-wrap">
            {colors.map(color => (
              <button key={color} onClick={() => setSelectedColor(color)}
                className={`px-4 py-2 rounded-full border text-sm transition-colors ${
                  selectedColor === color ? 'bg-brand-800 text-white border-brand-800' : 'border-brand-300 hover:border-brand-800'
                }`}>{color}</button>
            ))}
          </div>
        </div>
      )}
      <button onClick={handleAdd}
        className={`w-full py-4 rounded-full font-medium transition-all ${
          added ? 'bg-green-600 text-white' : 'bg-accent text-white hover:bg-accent-hover'
        }`}>
        {added ? '✓ Added to Cart' : 'Add to Cart'}
      </button>
    </div>
  );
}
