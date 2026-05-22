import type { Product } from '@/lib/supabase/types'

const PRODUCT_FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=1200',
]

const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  accessories: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1200',
  decor: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=1200',
  furniture: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=1200',
  lighting: 'https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9?auto=format&fit=crop&q=80&w=1200',
}

function imageIndexFromText(text: string) {
  const hash = Array.from(text).reduce((total, char) => total + char.charCodeAt(0), 0)
  return hash % PRODUCT_FALLBACK_IMAGES.length
}

export function getProductImage(product: Pick<Product, 'images' | 'name' | 'slug'> & Partial<Pick<Product, 'categories'>>) {
  const firstImage = product.images?.find(Boolean)

  if (firstImage) {
    return firstImage
  }

  const categorySlug = product.categories?.slug

  if (categorySlug && CATEGORY_FALLBACK_IMAGES[categorySlug]) {
    return CATEGORY_FALLBACK_IMAGES[categorySlug]
  }

  return PRODUCT_FALLBACK_IMAGES[imageIndexFromText(product.slug || product.name)]
}

export function getProductImages(product: Product) {
  return product.images?.length ? product.images : [getProductImage(product)]
}
