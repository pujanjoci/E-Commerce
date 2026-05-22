'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { uploadProductImage } from '@/lib/supabase/storage'

type ProductPayload = {
  name: string
  slug: string
  description: string | null
  price: number
  stock: number
  category_id: string | null
  images?: string[]
  is_active: boolean
}
type ProductMutationResult = Promise<{ error: { message: string } | null }>
type ProductsTable = {
  insert: (value: ProductPayload) => ProductMutationResult
  update: (value: Record<string, unknown>) => { eq: (column: 'id', value: string) => ProductMutationResult }
  delete: () => { eq: (column: 'id', value: string) => ProductMutationResult }
}

export async function createProduct(formData: FormData) {
  const supabase = await createAdminClient()

  let imageUrl: string | null = null
  const imageFile = formData.get('image') as File | null
  if (imageFile && imageFile.size > 0) {
    imageUrl = await uploadProductImage(imageFile)
  }

  const productsTable = supabase.from('products') as unknown as ProductsTable
  const { error } = await productsTable.insert({
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    description: (formData.get('description') as string) || null,
    price: parseFloat(formData.get('price') as string),
    stock: parseInt(formData.get('stock') as string, 10),
    category_id: (formData.get('category_id') as string) || null,
    is_active: formData.get('is_active') === 'true',
    images: imageUrl ? [imageUrl] : [],
  })

  if (error) throw new Error(error.message)

  revalidatePath('/admin/products')
  revalidatePath('/')
  revalidatePath('/products')
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = await createAdminClient()

  let imageUrl: string | undefined = undefined
  const imageFile = formData.get('image') as File | null
  if (imageFile && imageFile.size > 0) {
    imageUrl = await uploadProductImage(imageFile)
  }

  const update: Record<string, unknown> = {
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    description: (formData.get('description') as string) || null,
    price: parseFloat(formData.get('price') as string),
    stock: parseInt(formData.get('stock') as string, 10),
    category_id: (formData.get('category_id') as string) || null,
    is_active: formData.get('is_active') === 'true',
  }

  if (imageUrl) update.images = [imageUrl]

  const productsTable = supabase.from('products') as unknown as ProductsTable
  const { error } = await productsTable.update(update).eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/products')
  revalidatePath('/')
  revalidatePath('/products')
}

export async function deleteProduct(id: string) {
  const supabase = await createAdminClient()
  const productsTable = supabase.from('products') as unknown as ProductsTable
  const { error } = await productsTable.delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/products')
  revalidatePath('/')
  revalidatePath('/products')
}
