'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import type { CartItem } from '@/lib/supabase/types'

type OrderRow = { id: string }
type MutationError = { message: string } | null
type OrdersTable = {
  insert: (value: { user_id: string; total_amount: number; status: string }) => {
    select: () => { single: () => Promise<{ data: OrderRow | null; error: MutationError }> }
  }
}
type OrderItemsTable = {
  insert: (value: Array<{ order_id: string; product_id: string; quantity: number; price_at_purchase: number }>) => Promise<{ error: MutationError }>
}

export async function createOrder(userId: string, items: CartItem[]) {
  const supabase = await createAdminClient()

  const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const ordersTable = supabase.from('orders') as unknown as OrdersTable
  const { data: order, error: orderError } = await ordersTable
    .insert({ user_id: userId, total_amount: totalAmount, status: 'pending' })
    .select()
    .single()

  if (orderError || !order) throw new Error(orderError?.message ?? 'Failed to create order')

  const orderItems = items.map((item) => ({
    order_id: order.id,
    product_id: item.id,
    quantity: item.quantity,
    price_at_purchase: item.price,
  }))

  const orderItemsTable = supabase.from('order_items') as unknown as OrderItemsTable
  const { error: itemsError } = await orderItemsTable.insert(orderItems)
  if (itemsError) throw new Error(itemsError.message)

  revalidatePath('/admin/orders')
  return order
}
