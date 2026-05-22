'use client';

import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useEffect } from 'react';
import { motion, useAnimationControls } from 'framer-motion';

export default function CartButton() {
  const items = useCartStore((state) => state.items);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const controls = useAnimationControls();

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    if (totalItems === 0) return;
    controls.start({
      scale: [1, 1.16, 1],
      rotate: [0, -7, 0],
      transition: { duration: 0.42, ease: 'easeOut' },
    });
  }, [controls, totalItems]);

  return (
    <motion.button
      animate={controls}
      onClick={() => toggleCart()}
      className="relative grid h-9 w-9 place-items-center rounded-lg text-[var(--ag-text-secondary)] transition-colors hover:bg-[var(--ag-surface-2)] hover:text-[var(--ag-text-primary)]"
      aria-label="Open cart"
    >
      <ShoppingCart className="w-5 h-5" />
      {totalItems > 0 && (
        <motion.span
          key={totalItems}
          initial={{ scale: 0.6, y: 2 }}
          animate={{ scale: 1, y: 0 }}
          className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[var(--ag-base)] bg-[var(--ag-accent)] px-1 text-[10px] font-bold text-white shadow-sm"
        >
          {totalItems}
        </motion.span>
      )}
    </motion.button>
  );
}
