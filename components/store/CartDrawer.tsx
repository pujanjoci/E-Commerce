'use client';

import { useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import ReceiptCart from './ReceiptCart';

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity } = useCartStore();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startAutoCloseTimer = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      closeCart();
    }, 4000); // Auto close after 4 seconds of inactivity
  }, [closeCart]);

  const clearAutoCloseTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      startAutoCloseTimer();
    } else {
      clearAutoCloseTimer();
    }
    return () => clearAutoCloseTimer();
  }, [isOpen, startAutoCloseTimer, clearAutoCloseTimer]);

  function handleQtyChange(id: string, delta: number) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    updateQuantity(id, item.quantity + delta);
  }

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
            className="fixed right-0 top-0 z-50 flex h-full w-full flex-col sm:w-[420px]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 260 }}
            aria-label="Shopping cart"
            onMouseEnter={clearAutoCloseTimer}
            onMouseLeave={startAutoCloseTimer}
          >
            {/* Close button floated above the receipt */}
            <div className="flex justify-end p-3">
              <button
                onClick={closeCart}
                className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--ag-surface)]/80 text-[var(--ag-text-muted)] transition-colors hover:bg-[var(--ag-surface-2)] hover:text-[var(--ag-text-primary)]"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* The receipt card, centered in the drawer */}
            <div className="flex-1 overflow-y-auto px-4 pb-16">
              <ReceiptCart
                items={items}
                onQtyChange={handleQtyChange}
                onClose={closeCart}
              />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
