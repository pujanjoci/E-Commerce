import { Suspense } from 'react';
import HeroBento from '@/app/_components/HeroBento';
import FeaturedCategories from '@/app/_components/CategoryStrip';
import FeaturedProducts from '@/app/_components/FeaturedProducts';
import Newsletter from '@/app/_components/Newsletter';
import Skeleton from '@/components/ui/Skeleton';
import { createClient } from '@/lib/supabase/server';

async function HomeContent() {
  const supabase = await createClient();
  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from('categories').select('*').order('name'),
    supabase
      .from('products')
      .select('*, categories(*)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(4),
  ]);

  return (
    <>
      <FeaturedCategories categories={categories ?? []} />
      <FeaturedProducts products={products ?? []} />
    </>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--ag-base)]">
      <HeroBento />

      <Suspense
        fallback={
          <div className="section-padding">
            <div className="mx-auto max-w-7xl">
              <Skeleton className="h-[520px] w-full rounded-lg" />
            </div>
          </div>
        }
      >
        <HomeContent />
      </Suspense>

      <Newsletter />
    </div>
  );
}
