'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { MouseEvent } from 'react';
import { motion } from 'framer-motion';
import { Eye, ShoppingBag, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useCartStore } from '@/store/cart';
import { getProductImage } from '@/lib/product-images';
import type { Product } from '@/lib/supabase/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const image = getProductImage(product);
  const category = product.categories?.name || 'Atelier piece';

  const handleAddToCart = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: image,
      slug: product.slug,
    });
    toast.success(`${product.name} added to cart`);
  };

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="group"
    >
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-[var(--ag-border)] bg-[var(--ag-surface-2)] shadow-sm">
          {product.stock < 5 && product.stock > 0 && (
            <div className="absolute left-3 top-3 z-20 rounded-md bg-[#8b2f2b] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white shadow-sm">
              Low Stock
            </div>
          )}

          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />

          <div className="absolute inset-x-3 bottom-3 flex translate-y-3 gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <button
              onClick={handleAddToCart}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-white text-sm font-semibold text-neutral-950 shadow-lg transition-colors hover:bg-[var(--ag-accent)] hover:text-white"
            >
              <ShoppingBag className="h-4 w-4" />
              Add
            </button>
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-white/88 text-neutral-950 shadow-lg backdrop-blur">
              <Eye className="h-4 w-4" />
            </span>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-[var(--ag-text-primary)] transition-colors group-hover:text-[var(--ag-accent)]">
                {product.name}
              </h3>
              <p className="mt-0.5 text-xs font-medium uppercase tracking-[0.16em] text-[var(--ag-text-muted)]">
                {category}
              </p>
            </div>
            <p className="shrink-0 text-base font-semibold text-[var(--ag-text-primary)]">
              ${Number(product.price).toFixed(2)}
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-[var(--ag-warning)]">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} className="h-3.5 w-3.5 fill-current" />
            ))}
            <span className="ml-1 text-xs text-[var(--ag-text-muted)]">4.9</span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
