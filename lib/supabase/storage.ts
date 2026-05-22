import { createAdminClient } from './server'

const BUCKET = 'product-images'

export async function uploadProductImage(file: File): Promise<string> {
  const supabase = await createAdminClient()
  const ext = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) throw new Error(`Upload failed: ${error.message}`)

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName)
  return data.publicUrl
}

export async function deleteProductImage(url: string): Promise<void> {
  const supabase = await createAdminClient()
  // Extract file path from public URL
  const urlParts = url.split(`/${BUCKET}/`)
  if (urlParts.length < 2) return

  const filePath = urlParts[1]
  const { error } = await supabase.storage.from(BUCKET).remove([filePath])
  if (error) console.error('Delete image error:', error.message)
}
