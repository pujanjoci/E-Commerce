'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import Image from 'next/image';
import Link from 'next/link';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice } = useCartStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/35 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />

          <motion.aside
            className="fixed right-0 top-0 z-50 flex h-full w-full flex-col border-l border-[var(--ag-border)] bg-[var(--ag-surface)] shadow-[var(--ag-shadow-lg)] sm:w-[420px]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 260 }}
            aria-label="Shopping cart"
          >
            <div className="flex items-center justify-between border-b border-[var(--ag-border)] p-5">
              <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--ag-text-primary)]">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--ag-accent-muted)] text-[var(--ag-accent)]">
                  <ShoppingBag className="h-4 w-4" />
                </span>
                Your Cart
              </h2>
              <button
                onClick={closeCart}
                className="grid h-9 w-9 place-items-center rounded-lg text-[var(--ag-text-muted)] transition-colors hover:bg-[var(--ag-surface-2)] hover:text-[var(--ag-text-primary)]"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="animate-bob grid h-16 w-16 place-items-center rounded-lg border border-[var(--ag-border)] bg-[var(--ag-surface-2)] text-[var(--ag-text-muted)]">
                    <ShoppingBag className="h-8 w-8" />
                  </div>
                  <p className="mt-5 font-semibold text-[var(--ag-text-primary)]">Your cart is empty</p>
                  <p className="mt-2 max-w-xs text-sm text-[var(--ag-text-secondary)]">
                    Add a piece you love and it will appear here.
                  </p>
                  <Link
                    href="/products"
                    onClick={closeCart}
                    className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--ag-text-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--ag-base)] transition-transform hover:-translate-y-0.5"
                  >
                    Browse products <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <motion.ul className="space-y-4" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}>
                  {items.map((item) => (
                    <motion.li
                      key={item.id}
                      layout
                      variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                      className="grid grid-cols-[80px_1fr] gap-4 rounded-lg border border-[var(--ag-border)] bg-[var(--ag-base)] p-3"
                    >
                      <Link href={`/products/${item.slug}`} onClick={closeCart} className="relative h-20 w-20 overflow-hidden rounded-md bg-[var(--ag-surface-2)]">
                        {item.image_url ? (
                          <Image src={item.image_url} alt={item.name} fill sizes="80px" className="object-cover" />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-[var(--ag-text-muted)]">
                            <ShoppingBag className="h-5 w-5" />
                          </div>
                        )}
                      </Link>

                      <div className="min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <Link href={`/products/${item.slug}`} onClick={closeCart} className="line-clamp-2 text-sm font-semibold leading-5 text-[var(--ag-text-primary)] hover:text-[var(--ag-accent)]">
                            {item.name}
                          </Link>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-[var(--ag-text-muted)] transition-colors hover:bg-[var(--ag-danger)]/10 hover:text-[var(--ag-danger)]"
                            aria-label={`Remove ${item.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center rounded-md border border-[var(--ag-border)] bg-[var(--ag-surface)]">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="grid h-8 w-8 place-items-center text-[var(--ag-text-secondary)] hover:text-[var(--ag-text-primary)]"
                              aria-label={`Decrease ${item.name} quantity`}
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-8 text-center text-sm font-semibold text-[var(--ag-text-primary)]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="grid h-8 w-8 place-items-center text-[var(--ag-text-secondary)] hover:text-[var(--ag-text-primary)]"
                              aria-label={`Increase ${item.name} quantity`}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <p className="text-sm font-semibold text-[var(--ag-text-primary)]">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </motion.ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-[var(--ag-border)] bg-[var(--ag-base)] p-5">
                <div className="mb-5 flex items-center justify-between">
                  <span className="text-sm font-medium text-[var(--ag-text-secondary)]">Subtotal</span>
                  <span className="text-xl font-semibold text-[var(--ag-text-primary)]">${totalPrice().toFixed(2)}</span>
                </div>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--ag-text-primary)] px-4 py-3.5 text-sm font-semibold text-[var(--ag-base)] transition-transform hover:-translate-y-0.5"
                >
                  Checkout <ArrowRight className="h-4 w-4" />
                </Link>
                <p className="mt-3 text-center text-xs text-[var(--ag-text-muted)]">
                  Shipping and taxes calculated at checkout.
                </p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
