'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { uploadProductImage } from '@/lib/supabase/storage'

type AdminInsertResult = Promise<{ error: { message: string } | null }>
type AdminUsersTable = {
  insert: (value: { user_id: string; is_super_admin: boolean }) => AdminInsertResult
}
type ProductPayload = {
  name: string
  slug: string
  description: string | null
  price: number
  stock: number
  category_id: string | null
  images: string[]
  is_active: boolean
}
type ProductMutationResult = Promise<{ error: { message: string } | null }>
type ProductsTable = {
  insert: (value: ProductPayload) => ProductMutationResult
  update: (value: ProductPayload) => { eq: (column: 'id', value: string) => ProductMutationResult }
  delete: () => { eq: (column: 'id', value: string) => ProductMutationResult }
}

function getStringList(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .map((value) => String(value).trim())
    .filter(Boolean)
}

/**
 * PROMOTING USERS TO ADMIN
 */
export async function promoteToAdmin(userId: string) {
  const supabase = await createClient()

  // 1. Verify caller is an admin
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) throw new Error('Unauthorized')

  const { data: isAdmin } = await supabase.rpc('is_admin')
  if (!isAdmin) throw new Error('Unauthorized: Admin only')

  // 2. Insert into admin_users
  const adminUsers = supabase.from('admin_users') as unknown as AdminUsersTable
  const { error } = await adminUsers.insert({
    user_id: userId,
    is_super_admin: false,
  })

  if (error) throw new Error(error.message)

  revalidatePath('/admin/users')
}

/**
 * PRODUCT MANAGEMENT
 */
export async function createProduct(formData: FormData) {
  const supabase = await createClient()

  // Verify admin
  const { data: isAdmin } = await supabase.rpc('is_admin')
  if (!isAdmin) throw new Error('Unauthorized')

  // Handle internet image URLs and optional uploads.
  const imageFiles = formData.getAll('images') as File[]
  const imageUrls = getStringList(formData, 'image_urls')

  for (const file of imageFiles) {
    if (file.size > 0) {
      const url = await uploadProductImage(file)
      if (url) imageUrls.push(url)
    }
  }

  const productsTable = supabase.from('products') as unknown as ProductsTable
  const { error } = await productsTable.insert({
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    description: (formData.get('description') as string) || null,
    price: parseFloat(formData.get('price') as string),
    stock: parseInt(formData.get('stock') as string, 10),
    category_id: formData.get('category_id') as string || null,
    images: imageUrls,
    is_active: formData.get('is_active') === 'true',
  })

  if (error) throw new Error(error.message)

  revalidatePath('/admin/products')
  revalidatePath('/')
  revalidatePath('/products')
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = await createClient()

  // Verify admin
  const { data: isAdmin } = await supabase.rpc('is_admin')
  if (!isAdmin) throw new Error('Unauthorized')

  // Handle new images
  const newImageFiles = formData.getAll('new_images') as File[]
  const imageUrls = [
    ...getStringList(formData, 'existing_images'),
    ...getStringList(formData, 'image_urls'),
  ]

  for (const file of newImageFiles) {
    if (file.size > 0) {
      const url = await uploadProductImage(file)
      if (url) imageUrls.push(url)
    }
  }

  const productsTable = supabase.from('products') as unknown as ProductsTable
  const { error } = await productsTable.update({
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    description: (formData.get('description') as string) || null,
    price: parseFloat(formData.get('price') as string),
    stock: parseInt(formData.get('stock') as string, 10),
    category_id: formData.get('category_id') as string || null,
    images: imageUrls,
    is_active: formData.get('is_active') === 'true',
  }).eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath(`/products/${formData.get('slug')}`)
  revalidatePath('/admin/products')
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()

  // Verify admin
  const { data: isAdmin } = await supabase.rpc('is_admin')
  if (!isAdmin) throw new Error('Unauthorized')

  const productsTable = supabase.from('products') as unknown as ProductsTable
  const { error } = await productsTable.delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/products')
}
