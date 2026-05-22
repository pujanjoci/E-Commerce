import { createClient } from '@/lib/supabase/server'
import ProductForm from '../_components/ProductForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'New Product — Admin' }

export default async function NewProductPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase.from('categories').select('*').order('name')
  return (
    <div className="space-y-6 pt-14 lg:pt-0">
      <div>
        <h1 className="text-2xl font-bold text-[var(--ag-text-primary)]">New Product</h1>
        <p className="text-sm text-[var(--ag-text-muted)] mt-1">Add a new item to your collection</p>
      </div>
      <ProductForm categories={categories ?? []} />
    </div>
  )
}
