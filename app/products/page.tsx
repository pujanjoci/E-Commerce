import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import ProductCard from '@/components/store/ProductCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { FALLBACK_PRODUCTS } from '@/lib/fallback-products';
import ProductFilters from './_components/ProductFilters';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 lg:gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="space-y-4">
          <Skeleton className="aspect-[4/5] w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      ))}
    </div>
  );
}

async function ProductList({ searchParams }: { searchParams: SearchParams }) {
  const awaitedParams = await searchParams;
  const category = typeof awaitedParams.category === 'string' ? awaitedParams.category : null;
  const sort = typeof awaitedParams.sort === 'string' ? awaitedParams.sort : 'newest';
  const supabase = await createClient();

  let query = category
    ? supabase
        .from('products')
        .select('*, categories!inner(*)')
        .eq('is_active', true)
        .eq('categories.slug', category)
    : supabase.from('products').select('*, categories(*)').eq('is_active', true);

  switch (sort) {
    case 'price-asc':
      query = query.order('price', { ascending: true });
      break;
    case 'price-desc':
      query = query.order('price', { ascending: false });
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }

  const { data: products, error } = await query;

  const fallbackProducts = FALLBACK_PRODUCTS
    .filter((product) => !category || product.categories?.slug === category)
    .sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price;
      if (sort === 'price-desc') return b.price - a.price;
      return 0;
    });
  const displayProducts = (error || !products || products.length === 0) ? fallbackProducts : products;

  if (!displayProducts || displayProducts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--ag-border)] bg-[var(--ag-surface)] py-20 text-center">
        <p className="font-medium text-[var(--ag-text-primary)]">No products found</p>
        <p className="mt-2 text-sm text-[var(--ag-text-muted)]">Try a different category or sorting option.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 lg:gap-6">
      {displayProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createClient();
  const { data: categories } = await supabase.from('categories').select('*').order('name');

  return (
    <div className="bg-[var(--ag-base)]">
      <section className="border-b border-[var(--ag-border)] bg-[var(--ag-surface)]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--ag-accent)]">Collection</p>
          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-[var(--ag-text-primary)] md:text-5xl">
                Shop all pieces
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--ag-text-secondary)]">
                Furniture, lighting, and objects selected for texture, proportion, and daily usefulness.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[240px_1fr] lg:px-8">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-lg border border-[var(--ag-border)] bg-[var(--ag-surface)] p-4">
            <Suspense fallback={<Skeleton className="h-56 w-full rounded-lg" />}>
              <ProductFilters categories={categories ?? []} />
            </Suspense>
          </div>
        </aside>

        <main>
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductList searchParams={searchParams} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
