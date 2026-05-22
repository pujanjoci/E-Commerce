'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type React from 'react';
import { Armchair, LampCeiling, LayoutGrid, PackageOpen, Shapes } from 'lucide-react';
import type { Category } from '@/lib/supabase/types';

const ICONS: Record<string, React.ReactNode> = {
  furniture: <Armchair className="h-4 w-4" />,
  lighting: <LampCeiling className="h-4 w-4" />,
  accessories: <PackageOpen className="h-4 w-4" />,
  decor: <Shapes className="h-4 w-4" />,
};

interface CategoryStripProps {
  categories: Category[];
}

export default function CategoryStrip({ categories }: CategoryStripProps) {
  const fallback: Category[] = [
    { id: '1', name: 'Furniture', slug: 'furniture', image_url: null, created_at: '' },
    { id: '2', name: 'Lighting', slug: 'lighting', image_url: null, created_at: '' },
    { id: '3', name: 'Accessories', slug: 'accessories', image_url: null, created_at: '' },
    { id: '4', name: 'Decor', slug: 'decor', image_url: null, created_at: '' },
  ];

  const display = categories.length > 0 ? categories : fallback;

  return (
    <section className="border-b border-[var(--ag-border)] bg-[var(--ag-surface)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <p className="text-sm font-semibold text-[var(--ag-text-primary)]">Shop by room tone</p>
          <p className="mt-1 text-sm text-[var(--ag-text-muted)]">A quick path into the collection.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Link
              href="/products"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--ag-border)] bg-[var(--ag-base)] px-3.5 text-sm font-medium text-[var(--ag-text-secondary)] transition-colors hover:border-[var(--ag-accent)] hover:text-[var(--ag-accent)]"
            >
              <LayoutGrid className="h-4 w-4" />
              All
            </Link>
          </motion.div>
          {display.map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04, duration: 0.35 }}
            >
              <Link
                href={`/products?category=${cat.slug}`}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--ag-border)] bg-[var(--ag-base)] px-3.5 text-sm font-medium text-[var(--ag-text-secondary)] transition-colors hover:border-[var(--ag-accent)] hover:text-[var(--ag-accent)]"
              >
                <span className="text-[var(--ag-accent)]">
                  {ICONS[cat.slug] ?? <LayoutGrid className="h-4 w-4" />}
                </span>
                {cat.name}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
