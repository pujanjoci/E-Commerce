import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProductForm from '../../_components/ProductForm'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = { title: 'Edit Product — Admin' }

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).single(),
    supabase.from('categories').select('*').order('name'),
  ])

  if (!product) notFound()

  return (
    <div className="space-y-6 pt-14 lg:pt-0">
      <div>
        <h1 className="text-2xl font-bold text-[var(--ag-text-primary)]">Edit Product</h1>
        <p className="text-sm text-[var(--ag-text-muted)] mt-1">{product.name}</p>
      </div>
      <ProductForm categories={categories ?? []} product={product} />
    </div>
  )
}
