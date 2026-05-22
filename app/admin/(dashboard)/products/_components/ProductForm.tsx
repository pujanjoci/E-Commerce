'use client'

import { useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { X, ArrowRight, ArrowLeft, Check, Plus, Link2 } from 'lucide-react'
import { createProduct, updateProduct } from '@/app/actions/admin'
import type { Category, Product } from '@/lib/supabase/types'

interface ProductFormProps {
  categories: Category[]
  product?: Product
}

type PendingImage = {
  id: string
  file: File
  preview: string
}

function isAllowedRemoteImage(value: string) {
  try {
    const url = new URL(value)
    const isSupabasePublicImage = url.hostname.endsWith('.supabase.co') && url.pathname.startsWith('/storage/v1/object/public/')

    return url.protocol === 'https:' && (url.hostname === 'images.unsplash.com' || isSupabasePublicImage)
  } catch {
    return false
  }
}

export default function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Multiple images logic
  const [imageUrls, setImageUrls] = useState<string[]>(product?.images ?? [])
  const [imageFiles, setImageFiles] = useState<PendingImage[]>([])
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [imageUrlError, setImageUrlError] = useState('')
  const imagePreviews = useMemo(
    () => [
      ...imageUrls.map((url) => ({ id: url, src: url, source: 'url' as const })),
      ...imageFiles.map((image) => ({ id: image.id, src: image.preview, source: 'file' as const })),
    ],
    [imageFiles, imageUrls]
  )

  const [form, setForm] = useState({
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    description: product?.description ?? '',
    price: product?.price?.toString() ?? '',
    stock: product?.stock?.toString() ?? '0',
    category_id: product?.category_id ?? '',
    is_active: product?.is_active ?? true,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      ...(name === 'name' && !product
        ? { slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }
        : {}),
    }))
  }

  const handleFileChange = (files: FileList | null) => {
    if (!files) return
    const newFiles = Array.from(files).map((file, index) => {
      const reader = new FileReader()
      const id = `${file.name}-${file.lastModified}-${index}-${Math.random().toString(36).slice(2)}`
      const pending: PendingImage = { id, file, preview: '' }

      reader.onload = (e) => {
        setImageFiles((prev) => prev.map((image) => (
          image.id === id ? { ...image, preview: e.target?.result as string } : image
        )))
      }
      reader.readAsDataURL(file)
      return pending
    })

    setImageFiles((prev) => [...prev, ...newFiles])
  }

  const removeImage = (index: number) => {
    if (index < imageUrls.length) {
      setImageUrls((prev) => prev.filter((_, i) => i !== index))
      return
    }

    const fileIndex = index - imageUrls.length
    setImageFiles((prev) => prev.filter((_, i) => i !== fileIndex))
  }

  const addRemoteImage = () => {
    const url = imageUrlInput.trim()
    setImageUrlError('')

    if (!isAllowedRemoteImage(url)) {
      setImageUrlError('Use an https image from images.unsplash.com or your Supabase public storage.')
      return
    }

    setImageUrls((prev) => (prev.includes(url) ? prev : [...prev, url]))
    setImageUrlInput('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step < 3) {
      setStep(step + 1)
      return
    }

    setError('')
    setLoading(true)

    try {
      const formData = new FormData()
      Object.entries(form).forEach(([k, v]) => formData.append(k, String(v)))
      imageUrls.forEach((url) => formData.append('image_urls', url))
      
      // Handle multiple images
      imageFiles.forEach(({ file }) => formData.append(product ? 'new_images' : 'images', file))

      if (product) {
        await updateProduct(product.id, formData)
      } else {
        await createProduct(formData)
      }
      router.push('/admin/products')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl">
      {/* Progress Bar */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex flex-col items-center gap-2">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 ring-4 ring-offset-2 ${
                  step >= s ? 'bg-accent text-white ring-accent/20' : 'bg-muted text-muted-foreground ring-transparent'
                }`}
              >
                {step > s ? <Check className="w-5 h-5" /> : s}
              </div>
              <span className={`text-xs font-bold uppercase tracking-widest ${step >= s ? 'text-accent' : 'text-muted-foreground'}`}>
                {s === 1 ? 'Details' : s === 2 ? 'Classification' : 'Media'}
              </span>
            </div>
          ))}
        </div>
        <div className="relative h-1 w-full bg-muted rounded-full">
          <div 
            className="absolute top-0 left-0 h-full bg-accent transition-all duration-500 rounded-full"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-card p-8 rounded-2xl border border-border shadow-sm">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-xl font-bold">Product Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Product Name</label>
                <input 
                  name="name" 
                  value={form.name} 
                  onChange={handleChange} 
                  required 
                  className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                  placeholder="e.g. Minimalist Ceramic Vase" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Price ($)</label>
                <input 
                  name="price" 
                  type="number" 
                  step="0.01" 
                  value={form.price} 
                  onChange={handleChange} 
                  required 
                  className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                  placeholder="0.00" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Stock</label>
                <input 
                  name="stock" 
                  type="number" 
                  value={form.stock} 
                  onChange={handleChange} 
                  required 
                  className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                  placeholder="0" 
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-xl font-bold">Classification</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Category</label>
                <select
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-accent transition-all appearance-none"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-accent transition-all resize-none"
                  placeholder="Tell the story of this product..."
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                  className="w-5 h-5 accent-accent rounded"
                />
                <label htmlFor="is_active" className="text-sm font-bold text-foreground cursor-pointer">
                  Visible in Storefront
                </label>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-xl font-bold">Product Media</h2>

            <div className="rounded-xl border border-border bg-muted/50 p-4">
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Internet image URL</label>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <input
                  value={imageUrlInput}
                  onChange={(event) => setImageUrlInput(event.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="min-w-0 flex-1 rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <button
                  type="button"
                  onClick={addRemoteImage}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-sm font-bold text-background transition-colors hover:bg-accent hover:text-white"
                >
                  <Link2 className="h-4 w-4" />
                  Add URL
                </button>
              </div>
              {imageUrlError && <p className="mt-2 text-xs font-medium text-rose-500">{imageUrlError}</p>}
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {imagePreviews.map((preview, i) => (
                <div key={preview.id} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                  {preview.src ? (
                    <Image src={preview.src} alt="Preview" fill sizes="180px" className="object-cover" />
                  ) : (
                    <div className="skeleton h-full w-full" />
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-accent hover:bg-accent/5 flex flex-col items-center justify-center gap-2 text-muted-foreground transition-all"
              >
                <Plus className="w-6 h-6" />
                <span className="text-xs font-bold uppercase tracking-widest">Add Image</span>
              </button>
            </div>

            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files)}
            />
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-border">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 px-6 py-3 font-bold text-foreground hover:text-accent transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 font-bold text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 bg-foreground text-background hover:bg-accent hover:text-white rounded-xl font-bold transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-background border-t-transparent animate-spin rounded-full" />
            ) : step === 3 ? (
              product ? 'Update Product' : 'Complete Publication'
            ) : (
              <>Next <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
