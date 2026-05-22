import { createClient } from '@/lib/supabase/server'
import Badge from '@/components/ui/Badge'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Orders - Admin' }

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'accent' | 'danger' | 'default'> = {
  delivered: 'success',
  shipped: 'accent',
  processing: 'warning',
  pending: 'default',
  cancelled: 'danger',
}

export default async function AdminOrdersPage() {
  const supabase = await createClient()
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6 pt-14 lg:pt-0">
      <div>
        <h1 className="text-2xl font-bold text-[var(--ag-text-primary)]">Orders</h1>
        <p className="text-sm text-[var(--ag-text-muted)] mt-1">{orders?.length ?? 0} total orders</p>
      </div>

      <div className="rounded-2xl border border-[var(--ag-border)] bg-[var(--ag-surface)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--ag-border)] bg-[var(--ag-surface-2)]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--ag-text-muted)] uppercase tracking-wider">Order ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--ag-text-muted)] uppercase tracking-wider hidden md:table-cell">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--ag-text-muted)] uppercase tracking-wider">Total</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--ag-text-muted)] uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--ag-text-muted)] uppercase tracking-wider hidden sm:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--ag-border)]">
              {(orders ?? []).map((order) => (
                <tr key={order.id} className="hover:bg-[var(--ag-surface-2)] transition-colors duration-150">
                  <td className="px-4 py-3 font-mono text-xs text-[var(--ag-text-muted)]">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-[var(--ag-text-secondary)]">
                    Anonymous
                  </td>
                  <td className="px-4 py-3 font-semibold text-[var(--ag-text-primary)]">
                    ${order.total_amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[order.status] ?? 'default'}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-[var(--ag-text-muted)]">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {(orders ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-[var(--ag-text-muted)]">
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
