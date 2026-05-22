'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useCartStore } from '@/store/cart'
import { ShoppingBag, CheckCircle, CreditCard, Lock } from 'lucide-react'
import Button from '@/components/ui/Button'
import Image from 'next/image'

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartStore()
  const [ordered, setOrdered] = useState(false)
  const total = totalPrice()

  if (items.length === 0 && !ordered) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <ShoppingBag className="w-16 h-16 text-[var(--ag-text-muted)] mx-auto" />
          <h1 className="text-xl font-bold text-[var(--ag-text-primary)]">Your cart is empty</h1>
          <Link href="/products">
            <Button variant="primary">Browse Products</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (ordered) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 max-w-sm"
        >
          <div className="w-20 h-20 rounded-full bg-[var(--ag-success)]/10 border border-[var(--ag-success)]/30 flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-[var(--ag-success)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--ag-text-primary)]">Order Placed!</h1>
            <p className="text-[var(--ag-text-muted)] mt-2">Thank you for defying gravity with us. Your order is being prepared.</p>
          </div>
          <Link href="/products">
            <Button variant="primary">Continue Shopping</Button>
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-[var(--ag-text-primary)] mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Items */}
        <div className="lg:col-span-3 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--ag-text-muted)]">Order Summary</h2>
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 p-4 rounded-xl bg-[var(--ag-surface)] border border-[var(--ag-border)]">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-[var(--ag-surface-2)] shrink-0">
                {item.image_url ? (
                  <Image src={item.image_url} alt={item.name} width={64} height={64} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[var(--ag-base)]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[var(--ag-text-primary)] truncate">{item.name}</p>
                <p className="text-sm text-[var(--ag-text-muted)]">Qty: {item.quantity}</p>
              </div>
              <p className="font-bold text-[var(--ag-text-primary)] shrink-0">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>

        {/* Payment */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-[var(--ag-border)] bg-[var(--ag-surface)] p-6 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--ag-text-muted)]">Payment</h2>

            <div className="p-4 rounded-xl bg-[var(--ag-accent-muted)] border border-[var(--ag-accent)]/30 flex items-center gap-2 text-sm text-[var(--ag-accent-hover)]">
              <CreditCard className="w-4 h-4 shrink-0" />
              Stripe integration coming soon - demo mode
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--ag-text-secondary)]">Subtotal</span>
                <span className="text-[var(--ag-text-primary)]">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--ag-text-secondary)]">Shipping</span>
                <span className="text-[var(--ag-success)]">Free</span>
              </div>
              <div className="border-t border-[var(--ag-border)] pt-2 flex justify-between font-bold text-base">
                <span className="text-[var(--ag-text-primary)]">Total</span>
                <span className="text-[var(--ag-text-primary)]">${total.toFixed(2)}</span>
              </div>
            </div>

            <Button
              variant="primary"
              className="w-full gap-2"
              onClick={() => { clearCart(); setOrdered(true) }}
            >
              <Lock className="w-4 h-4" />
              Place Order (Demo)
            </Button>

            <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--ag-text-muted)]">
              <Lock className="w-3 h-3" />
              Secured by Stripe (coming soon)
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
