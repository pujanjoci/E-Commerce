'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus, ArrowRight, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { CartItem } from '@/lib/supabase/types';

/* ─── Constants ─────────────────────────────────────────────── */
const TAX_RATE = 0.08;
const FREE_SHIPPING_THRESHOLD = 75;
const FLAT_SHIPPING = 5.99;

/* ─── Helpers ───────────────────────────────────────────────── */
function fmt(n: number): string {
  return n.toFixed(2);
}

function generateOrderNumber(items: CartItem[]): string {
  // Deterministic hash from item IDs + quantities so it only
  // changes when the cart contents actually change.
  let hash = 0;
  for (const item of items) {
    const key = `${item.id}:${item.quantity}`;
    for (let i = 0; i < key.length; i++) {
      hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0;
    }
  }
  return `#${(Math.abs(hash) % 9000 + 1000).toString()}`;
}

function formatDate(): string {
  const d = new Date();
  return d.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  }) + '  ' + d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/* ─── Torn-edge SVG ─────────────────────────────────────────── */
function TornEdge() {
  // Generates a zigzag as a polygon filled with the page background color,
  // placed flush at the card bottom — making the card look torn.
  const teeth = 20;
  const w = 400;
  const h = 12;
  const step = w / teeth;

  let points = `0,0 `;
  for (let i = 0; i <= teeth; i++) {
    const x = i * step;
    const y = i % 2 === 0 ? h : 0;
    points += `${x},${y} `;
  }
  points += `${w},0`;

  return (
    <svg
      className="receipt-torn-edge"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polygon points={points} fill="var(--background)" />
    </svg>
  );
}

/* ─── Dashed / Solid dividers ───────────────────────────────── */
function DashedDivider() {
  return (
    <div
      className="receipt-divider-dashed"
      role="separator"
      aria-hidden="true"
    />
  );
}

function SolidDivider() {
  return (
    <div
      className="receipt-divider-solid"
      role="separator"
      aria-hidden="true"
    />
  );
}

/* ─── Main component ────────────────────────────────────────── */
export interface ReceiptCartProps {
  items: CartItem[];
  onQtyChange: (id: string, delta: number) => void;
  onCheckout?: () => void;
  onClose?: () => void;
}

export default function ReceiptCart({
  items,
  onQtyChange,
  onCheckout,
  onClose,
}: ReceiptCartProps) {
  /* -- Memoised date + order # that regenerate only on content change -- */
  const contentFingerprint = items
    .map((i) => `${i.id}:${i.quantity}`)
    .join('|');

  const orderMeta = useMemo(
    () => ({
      date: formatDate(),
      order: generateOrderNumber(items),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [contentFingerprint],
  );

  /* -- Stamp-pulse on total change -- */
  const [pulse, setPulse] = useState(false);
  const prevTotalRef = useRef<number | null>(null);

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping =
    items.length === 0
      ? 0
      : subtotal >= FREE_SHIPPING_THRESHOLD
        ? 0
        : FLAT_SHIPPING;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + shipping + tax;

  useEffect(() => {
    if (prevTotalRef.current !== null && prevTotalRef.current !== total) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 220);
      return () => clearTimeout(t);
    }
    prevTotalRef.current = total;
  }, [total]);

  /* -- Handlers -- */
  const handleDecrease = useCallback(
    (id: string) => onQtyChange(id, -1),
    [onQtyChange],
  );
  const handleIncrease = useCallback(
    (id: string) => onQtyChange(id, 1),
    [onQtyChange],
  );

  const isEmpty = items.length === 0;
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="receipt-card" role="region" aria-label="Shopping cart receipt">
      {/* ── Header ───────────────────────────────── */}
      <div className="receipt-header">
        <div className="receipt-header-top">
          <span className="receipt-label">YOUR CART</span>
          <span className="receipt-label">
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </span>
        </div>
        <p className="receipt-meta">
          {orderMeta.date}{'  '}{orderMeta.order}
        </p>
      </div>

      <DashedDivider />

      {/* ── Line items / empty state ─────────────── */}
      <div className="receipt-body">
        {isEmpty ? (
          <p className="receipt-empty">Nothing here yet</p>
        ) : (
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="receipt-line-item"
              >
                {/* icon tile */}
                <div className="receipt-icon-tile">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt=""
                      fill
                      sizes="36px"
                      className="object-cover"
                    />
                  ) : (
                    <ShoppingBag className="h-4 w-4 text-[var(--ag-text-muted)]" />
                  )}
                </div>

                {/* name + variant + stepper + price */}
                <div className="receipt-item-detail">
                  <div className="receipt-item-name-row">
                    <div className="receipt-item-name-block">
                      <span className="receipt-item-name">{item.name}</span>
                      {item.slug && (
                        <span className="receipt-item-variant">{item.slug}</span>
                      )}
                    </div>
                    <span className="receipt-item-price">
                      ${fmt(item.price * item.quantity)}
                    </span>
                  </div>

                  <div className="receipt-item-controls">
                    <div className="receipt-qty-stepper">
                      <button
                        type="button"
                        onClick={() => handleDecrease(item.id)}
                        className="receipt-qty-btn"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="receipt-qty-value">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleIncrease(item.id)}
                        className="receipt-qty-btn"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    {item.quantity > 1 && (
                      <span className="receipt-unit-hint">
                        @ ${fmt(item.price)} ea
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <DashedDivider />

      {/* ── Totals block ─────────────────────────── */}
      <div className="receipt-totals">
        <div className="receipt-total-row receipt-total-secondary">
          <span>SUBTOTAL</span>
          <span>${fmt(subtotal)}</span>
        </div>
        <div className="receipt-total-row receipt-total-secondary">
          <span>SHIPPING</span>
          <span>
            {shipping === 0 ? 'FREE' : `$${fmt(shipping)}`}
          </span>
        </div>
        <div className="receipt-total-row receipt-total-secondary">
          <span>TAX (8%)</span>
          <span>${fmt(tax)}</span>
        </div>
      </div>

      <SolidDivider />

      {/* ── Grand total ──────────────────────────── */}
      <div className="receipt-grand-total-row">
        <span className="receipt-grand-total-label">TOTAL</span>
        <span
          className={`receipt-grand-total-value ${pulse ? 'receipt-stamp-pulse' : ''}`}
        >
          ${fmt(total)}
        </span>
      </div>

      {/* ── Checkout button ──────────────────────── */}
      {onCheckout ? (
        <button
          type="button"
          onClick={() => {
            onCheckout();
            onClose?.();
          }}
          disabled={isEmpty}
          className="receipt-checkout-btn"
          aria-disabled={isEmpty}
        >
          <span>Checkout</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      ) : (
        <Link
          href="/checkout"
          className={`receipt-checkout-btn ${isEmpty ? 'receipt-checkout-btn-disabled' : ''}`}
          aria-disabled={isEmpty}
          tabIndex={isEmpty ? -1 : undefined}
          onClick={(e) => {
            if (isEmpty) {
              e.preventDefault();
            } else {
              onClose?.();
            }
          }}
        >
          <span>Checkout</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}

      {/* ── Continue Shopping button ─────────────── */}
      <button
        type="button"
        onClick={onClose}
        className="receipt-continue-btn"
      >
        Continue Shopping
      </button>

      {/* ── Torn paper edge ──────────────────────── */}
      <TornEdge />
    </div>
  );
}
