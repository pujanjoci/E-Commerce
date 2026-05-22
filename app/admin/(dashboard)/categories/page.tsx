import { createClient } from '@/lib/supabase/server'
import CategoryManager from './_components/CategoryManager'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Categories — Admin' }

export default async function AdminCategoriesPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  return (
    <div className="space-y-6 pt-14 lg:pt-0">
      <div>
        <h1 className="text-2xl font-bold text-[var(--ag-text-primary)]">Categories</h1>
        <p className="text-sm text-[var(--ag-text-muted)] mt-1">Organise your product collection</p>
      </div>
      <CategoryManager categories={categories ?? []} />
    </div>
  )
}
