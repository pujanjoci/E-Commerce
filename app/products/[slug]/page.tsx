import { notFound } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import AddToCartButton from './_components/AddToCartButton';
import { ShieldCheck, Truck, RotateCcw, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { getProductImages } from '@/lib/product-images';

export const revalidate = 60; 

export default async function ProductDetailPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const resolvedParams = await params;
  
  const supabase = await createClient();
  const { data: product } = await supabase
    .from('products')
    .select('*, categories(*)')
    .eq('slug', resolvedParams.slug)
    .single();

  if (!product || !product.is_active) {
    notFound();
  }

  const productImages = getProductImages(product);

  return (
    <div className="min-h-screen bg-[var(--ag-base)]">
      <nav className="mx-auto max-w-7xl px-4 pb-4 pt-8 sm:px-6 lg:px-8">
        <ol className="flex items-center gap-2 text-sm font-medium text-[var(--ag-text-muted)]">
          <li><Link href="/" className="hover:text-[var(--ag-accent)] transition-colors">Home</Link></li>
          <li className="before:content-['/'] before:mr-2"><Link href="/products" className="hover:text-[var(--ag-accent)] transition-colors">Products</Link></li>
          <li className="before:content-['/'] before:mr-2 text-[var(--ag-text-primary)] truncate">{product.name}</li>
        </ol>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 xl:gap-x-16">
          <div className="lg:col-span-7 space-y-6">
            {productImages.map((image: string, index: number) => (
              <div key={image} className="group relative aspect-[4/5] overflow-hidden rounded-lg border border-[var(--ag-border)] bg-[var(--ag-surface-2)]">
                <Image
                  src={image}
                  alt={`${product.name} - image ${index + 1}`}
                  fill
                  preload={index === 0}
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
              </div>
            ))}
          </div>

          <div className="lg:col-span-5 mt-12 lg:mt-0">
            <div className="lg:sticky lg:top-24 space-y-10">
              <div className="space-y-4">
                {product.categories && (
                  <Link 
                    href={`/products?category=${product.categories.slug}`}
                    className="inline-block rounded-lg border border-[var(--ag-accent)]/25 bg-[var(--ag-accent-muted)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ag-accent-hover)]"
                  >
                    {product.categories.name}
                  </Link>
                )}
                <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-[var(--ag-text-primary)]">{product.name}</h1>
                <div className="flex items-baseline gap-4">
                  <p className="text-3xl font-semibold text-[var(--ag-text-primary)]">${Number(product.price).toFixed(2)}</p>
                  {product.stock > 0 ? (
                    <span className="rounded-md bg-[var(--ag-success)]/10 px-2 py-1 text-sm font-semibold text-[var(--ag-success)]">In Stock</span>
                  ) : (
                    <span className="rounded-md bg-[var(--ag-danger)]/10 px-2 py-1 text-sm font-semibold text-[var(--ag-danger)]">Out of Stock</span>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--ag-text-muted)]">Description</h3>
                <p className="text-lg leading-relaxed text-[var(--ag-text-secondary)]">
                  {product.description || "Indulge in the pinnacle of design and functionality. This limited-edition piece represents our commitment to exceptional craftsmanship and minimalist aesthetics."}
                </p>
              </div>

              <div className="pt-4">
                <AddToCartButton product={product} />
              </div>

              <div className="grid grid-cols-1 gap-3 pt-8 md:grid-cols-2">
                <div className="flex items-start gap-3 rounded-lg border border-[var(--ag-border)] bg-[var(--ag-surface)] p-4">
                  <Truck className="w-5 h-5 text-[var(--ag-accent)] shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-[var(--ag-text-primary)]">Priority Shipping</p>
                    <p className="text-xs text-[var(--ag-text-muted)]">Free on premium orders</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-[var(--ag-border)] bg-[var(--ag-surface)] p-4">
                  <ShieldCheck className="w-5 h-5 text-[var(--ag-accent)] shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-[var(--ag-text-primary)]">Lifetime Warranty</p>
                    <p className="text-xs text-[var(--ag-text-muted)]">Built for daily use</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-[var(--ag-border)] bg-[var(--ag-surface)] p-4">
                  <RotateCcw className="w-5 h-5 text-[var(--ag-accent)] shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-[var(--ag-text-primary)]">60-Day Returns</p>
                    <p className="text-xs text-[var(--ag-text-muted)]">Simple exchanges</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-[var(--ag-border)] bg-[var(--ag-surface)] p-4">
                  <CreditCard className="w-5 h-5 text-[var(--ag-accent)] shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-[var(--ag-text-primary)]">Secure Checkout</p>
                    <p className="text-xs text-[var(--ag-text-muted)]">Protected payment flow</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="section-padding" />
    </div>
  );
}
