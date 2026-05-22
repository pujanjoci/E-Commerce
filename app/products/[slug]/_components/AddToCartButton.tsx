'use client';

import { useState } from 'react';
import { Check, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { useCartStore } from '@/store/cart';
import { getProductImage } from '@/lib/product-images';
import type { Database } from '@/lib/supabase/types';

type Product = Database['public']['Tables']['products']['Row'];

export default function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const [isAdding, setIsAdding] = useState(false);
  const image = getProductImage(product);

  const handleAddToCart = () => {
    setIsAdding(true);
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: image,
      slug: product.slug,
    });
    toast.success(`${product.name} added to cart`);
    setTimeout(() => setIsAdding(false), 800);
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding}
      className={`flex w-full items-center justify-center gap-3 rounded-lg px-8 py-4 text-base font-semibold transition-all duration-300 ${
        isAdding
          ? 'scale-[0.98] bg-[var(--ag-accent)] text-white shadow-inner'
          : 'bg-[var(--ag-text-primary)] text-[var(--ag-base)] shadow-lg hover:-translate-y-0.5 hover:bg-[var(--ag-accent)] hover:text-white hover:shadow-[var(--ag-accent-glow)]'
      } disabled:opacity-90`}
    >
      {isAdding ? <Check className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
      {isAdding ? 'Added to Cart' : 'Add to Cart'}
    </button>
  );
}
