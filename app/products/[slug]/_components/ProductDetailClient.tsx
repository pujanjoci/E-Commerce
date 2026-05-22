'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ShoppingBag, Star, Shield, Zap, Package } from 'lucide-react'
import Link from 'next/link'
import { useCartStore } from '@/store/cart'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import ProductCard from '@/components/store/ProductCard'
import { getProductImage } from '@/lib/product-images'
import type { Product } from '@/lib/supabase/types'

interface ProductDetailClientProps {
  product: Product
  relatedProducts: Product[]
}

export default function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const addItem = useCartStore((s) => s.addItem)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const image = getProductImage(product)

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({ id: product.id, name: product.name, price: product.price, image_url: image, slug: product.slug })
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-[var(--ag-text-muted)]">
        <Link href="/" className="hover:text-[var(--ag-text-primary)] transition-colors">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-[var(--ag-text-primary)] transition-colors">Products</Link>
        <span>/</span>
        <span className="text-[var(--ag-text-secondary)]">{product.name}</span>
      </nav>

      {/* Main product section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-[var(--ag-surface)] border border-[var(--ag-border)]">
            <Image
              src={image}
              alt={product.name}
              fill
              preload
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-6"
        >
          {/* Category + rating */}
          <div className="flex items-center gap-3">
            {product.categories && (
              <Badge variant="accent">{product.categories.name}</Badge>
            )}
            <div className="flex items-center gap-1 text-[var(--ag-warning)]">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
              <span className="text-xs text-[var(--ag-text-muted)] ml-1">(128 reviews)</span>
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-[var(--ag-text-primary)] leading-tight">
              {product.name}
            </h1>
            <p className="text-3xl font-bold text-[var(--ag-accent)] mt-3">
              ${product.price.toFixed(2)}
            </p>
          </div>

          <p className="text-[var(--ag-text-secondary)] leading-relaxed whitespace-pre-line">
            {product.description}
          </p>

          {/* Stock status */}
          <div>
            {product.stock > 0 ? (
              <Badge variant="success">
                <span className="w-1.5 h-1.5 rounded-full bg-current mr-1" />
                {product.stock > 10 ? 'In Stock' : `Only ${product.stock} left`}
              </Badge>
            ) : (
              <Badge variant="danger">Out of Stock</Badge>
            )}
          </div>

          {/* Quantity + Add to cart */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-[var(--ag-text-secondary)]">Quantity</span>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--ag-border)] bg-[var(--ag-surface)]">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-6 h-6 flex items-center justify-center text-[var(--ag-text-secondary)] hover:text-[var(--ag-text-primary)] transition-colors"
                  aria-label="Decrease quantity"
                >–</button>
                <span className="w-6 text-center text-sm font-medium text-[var(--ag-text-primary)]">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                  className="w-6 h-6 flex items-center justify-center text-[var(--ag-text-secondary)] hover:text-[var(--ag-text-primary)] transition-colors"
                  aria-label="Increase quantity"
                >+</button>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full gap-2"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              {added ? (
                <>✓ Added to Cart</>
              ) : (
                <><ShoppingBag className="w-5 h-5" /> Add to Cart — ${(product.price * quantity).toFixed(2)}</>
              )}
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { icon: Shield, label: '2 Year Warranty' },
              { icon: Zap, label: 'Fast Shipping' },
              { icon: Package, label: 'Free Returns' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-[var(--ag-surface-2)] border border-[var(--ag-border)] text-center">
                <Icon className="w-4 h-4 text-[var(--ag-accent)]" />
                <span className="text-[10px] text-[var(--ag-text-muted)]">{label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-[var(--ag-text-primary)] mb-6">You might also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  )
}
