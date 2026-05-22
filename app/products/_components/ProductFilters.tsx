'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import type { Category } from '@/lib/supabase/types'

interface ProductFiltersProps {
  categories: Category[]
}

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
]

const MOCK_CATS: Category[] = [
  { id: '1', name: 'Furniture', slug: 'furniture', image_url: null, created_at: '' },
  { id: '2', name: 'Lighting', slug: 'lighting', image_url: null, created_at: '' },
  { id: '3', name: 'Accessories', slug: 'accessories', image_url: null, created_at: '' },
  { id: '4', name: 'Decor', slug: 'decor', image_url: null, created_at: '' },
]

export default function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get('category') ?? ''
  const currentSort = searchParams.get('sort') ?? 'newest'

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) params.set(key, value)
      else params.delete(key)
      router.push(`/products?${params.toString()}`)
    },
    [router, searchParams]
  )

  const display = categories.length > 0 ? categories : MOCK_CATS

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--ag-text-muted)] mb-3">
          Category
        </h3>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => updateParams('category', '')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                !currentCategory
                  ? 'bg-[var(--ag-accent-muted)] text-[var(--ag-accent-hover)] font-semibold'
                  : 'text-[var(--ag-text-secondary)] hover:text-[var(--ag-text-primary)] hover:bg-[var(--ag-surface-2)]'
              }`}
            >
              All Products
            </button>
          </li>
          {display.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => updateParams('category', cat.slug)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                  currentCategory === cat.slug
                    ? 'bg-[var(--ag-accent-muted)] text-[var(--ag-accent-hover)] font-semibold'
                    : 'text-[var(--ag-text-secondary)] hover:text-[var(--ag-text-primary)] hover:bg-[var(--ag-surface-2)]'
                }`}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--ag-text-muted)] mb-3">
          Sort By
        </h3>
        <ul className="space-y-1">
          {SORT_OPTIONS.map((opt) => (
            <li key={opt.value}>
              <button
                onClick={() => updateParams('sort', opt.value)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                  currentSort === opt.value
                    ? 'bg-[var(--ag-accent-muted)] text-[var(--ag-accent-hover)] font-semibold'
                    : 'text-[var(--ag-text-secondary)] hover:text-[var(--ag-text-primary)] hover:bg-[var(--ag-surface-2)]'
                }`}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
