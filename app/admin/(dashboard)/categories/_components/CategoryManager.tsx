'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import type { Category } from '@/lib/supabase/types'

interface CategoryManagerProps {
  categories: Category[]
}

type CategoryMutationResult = Promise<{ data?: Category | null; error: { message: string } | null }>
type CategoriesTable = {
  insert: (value: { name: string; slug: string }) => { select: () => { single: () => CategoryMutationResult } }
  update: (value: { name: string; slug: string }) => { eq: (column: 'id', value: string) => Promise<{ error: { message: string } | null }> }
  delete: () => { eq: (column: 'id', value: string) => Promise<{ error: { message: string } | null }> }
}

export default function CategoryManager({ categories: initial }: CategoryManagerProps) {
  const router = useRouter()
  const supabase = createClient()
  const categoriesTable = supabase.from('categories') as unknown as CategoriesTable
  const [categories, setCategories] = useState(initial)
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const handleAdd = async () => {
    if (!newName.trim()) return
    setAdding(true)
    const slug = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const { data, error } = await categoriesTable
      .insert({ name: newName.trim(), slug })
      .select()
      .single()
    if (!error && data) {
      setCategories((prev) => [...prev, data])
      setNewName('')
      router.refresh()
    }
    setAdding(false)
  }

  const handleDelete = async (id: string) => {
    const { error } = await categoriesTable.delete().eq('id', id)
    if (!error) {
      setCategories((prev) => prev.filter((c) => c.id !== id))
      router.refresh()
    }
  }

  const handleEdit = async (id: string) => {
    if (!editName.trim()) return
    const slug = editName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const { error } = await categoriesTable.update({ name: editName.trim(), slug }).eq('id', id)
    if (!error) {
      setCategories((prev) => prev.map((c) => c.id === id ? { ...c, name: editName.trim(), slug } : c))
      setEditingId(null)
      router.refresh()
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      {/* Add new */}
      <div className="flex gap-2">
        <Input
          placeholder="Category name (e.g. Levitation)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          className="flex-1"
        />
        <Button variant="primary" loading={adding} onClick={handleAdd} className="shrink-0">
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>

      {/* List */}
      <div className="rounded-2xl border border-[var(--ag-border)] bg-[var(--ag-surface)] divide-y divide-[var(--ag-border)] overflow-hidden">
        {categories.length === 0 && (
          <div className="py-10 text-center text-[var(--ag-text-muted)]">No categories yet.</div>
        )}
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center justify-between px-4 py-3 hover:bg-[var(--ag-surface-2)] transition-colors">
            {editingId === cat.id ? (
              <div className="flex items-center gap-2 flex-1 mr-2">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleEdit(cat.id); if (e.key === 'Escape') setEditingId(null) }}
                  autoFocus
                  className="flex-1 h-8 text-sm"
                />
                <button onClick={() => handleEdit(cat.id)} className="p-1.5 rounded-lg text-[var(--ag-success)] hover:bg-[var(--ag-success)]/10"><Check className="w-4 h-4" /></button>
                <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg text-[var(--ag-text-muted)] hover:bg-[var(--ag-surface-2)]"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <div className="flex-1">
                <span className="text-sm font-medium text-[var(--ag-text-primary)]">{cat.name}</span>
                <span className="ml-2 text-xs text-[var(--ag-text-muted)]">/{cat.slug}</span>
              </div>
            )}
            {editingId !== cat.id && (
              <div className="flex items-center gap-1">
                <button onClick={() => { setEditingId(cat.id); setEditName(cat.name) }} className="p-1.5 rounded-lg text-[var(--ag-text-muted)] hover:text-[var(--ag-text-primary)] hover:bg-[var(--ag-surface-2)]"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(cat.id)} className="p-1.5 rounded-lg text-[var(--ag-text-muted)] hover:text-[var(--ag-danger)] hover:bg-[var(--ag-danger)]/10"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
