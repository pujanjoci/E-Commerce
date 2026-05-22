'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import ProductCard from '@/components/store/ProductCard';
import { FALLBACK_PRODUCTS } from '@/lib/fallback-products';
import type { Product } from '@/lib/supabase/types';

interface FeaturedProductsProps {
  products: Product[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  const display = products.length > 0 ? products : FALLBACK_PRODUCTS;

  return (
    <section className="section-padding bg-[var(--ag-base)]">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--ag-accent)]">Latest edit</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--ag-text-primary)] md:text-4xl">
              Pieces with staying power
            </h2>
          </div>
          <Link href="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--ag-text-primary)] transition-colors hover:text-[var(--ag-accent)]">
            View all products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <motion.div
          className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.07 } },
          }}
        >
          {display.map((product) => (
            <motion.div
              key={product.id}
              variants={{
                hidden: { opacity: 0, y: 22 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
              }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
